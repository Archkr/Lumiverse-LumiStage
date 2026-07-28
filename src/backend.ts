import type { SpindleAPI } from "lumiverse-spindle-types";
import { sha256 } from "./ids";
import {
  allVariants,
  applyManualOverride,
  buildCatalog,
  clearManualOverride,
  consumeOnceOverrides,
  createTimeline,
  inspectProfile,
  isValidManualOverride,
  normalizeSettings,
  type CatalogEntry,
} from "./model";
import {
  assertUnambiguousCandidates,
  directCandidate,
  extractLumiStageArchive,
  hydrateArchiveProfile,
  importTarget,
  mergeImportedAssets,
  removeVariants,
  unreferencedImageIds,
  type ImportCandidate,
} from "./importer";
import { buildDetectorRequest, parseDetectorResponse, validateDecision, type DetectorResponse } from "./detector";
import { LumiStageRepository, RevisionConflict } from "./storage";
import { confirmExtensionOwnedImageIds } from "./ownership";
import {
  findCachedDecision,
  replayTimeline,
  resolveChatCharacterIds,
  upsertDecision,
  type TimelineMessageKey,
} from "./timeline";
import {
  SCHEMA_VERSION,
  type ArchiveVariantEntryV2,
  type BackendToFrontend,
  type CharacterProfileV2,
  type ChatTimelineV2,
  type DetectionSettingsV2,
  type FrontendState,
  type FrontendToBackend,
  type LlmConnectionView,
  type LumiStageArchiveV2,
  type PermissionState,
  type VariantView,
} from "./types";

declare const spindle: SpindleAPI;

const repository = new LumiStageRepository(spindle.userStorage);
const activeContexts = new Map<string, { chatId: string | null; characterId: string | null }>();
const chatUsers = new Map<string, string>();
const generationUsers = new Map<string, { userId: string; chatId: string }>();
const activeGenerations = new Map<string, Set<string>>();
const scheduled = new Map<string, ReturnType<typeof setTimeout>>();
const analysisQueues = new Map<string, Promise<void>>();
const queueDepth = new Map<string, number>();
const lastDetection = new Map<string, FrontendState["lastDetection"]>();
const mediaViewCache = new Map<string, Record<string, VariantView>>();
const diagnosticCounters = new Map<string, {
  revisionConflicts: number;
  cleanupFailures: string[];
}>();

const onEvent = spindle.on as unknown as (
  event: string,
  handler: (payload: unknown, userId?: string) => void,
) => () => void;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function readString(value: unknown, keys: string[]): string | null {
  const raw = asRecord(value);
  for (const key of keys) if (typeof raw[key] === "string" && raw[key]) return raw[key] as string;
  return null;
}

function extractChatId(value: unknown): string | null {
  return readString(value, ["chatId", "chat_id", "id"]);
}

function resolveUserId(chatId: string | null, eventUserId?: string): string | null {
  return eventUserId ?? (chatId ? chatUsers.get(chatId) ?? null : null);
}

function send(message: BackendToFrontend, userId: string): void {
  (spindle.sendToFrontend as unknown as (payload: unknown, targetUserId?: string) => void)(message, userId);
}

function settleBackground(operation: Promise<unknown>): void {
  void operation.catch(() => undefined);
}

function countersFor(userId: string) {
  const current = diagnosticCounters.get(userId) ?? { revisionConflicts: 0, cleanupFailures: [] };
  diagnosticCounters.set(userId, current);
  return current;
}

function trackCleanup(userId: string, label: string, operation: Promise<unknown>): void {
  void operation.catch((error) => {
    const counters = countersFor(userId);
    const message = `${label}: ${error instanceof Error ? error.message : "cleanup failed"}`;
    counters.cleanupFailures = [...counters.cleanupFailures.slice(-19), message];
    send({ type: "notice", tone: "warning", message: `${label} completed, but unused media cleanup needs attention.` }, userId);
  });
}

function hasPermission(permission: string): boolean {
  try {
    return spindle.permissions.has(permission as never);
  } catch {
    return false;
  }
}

function permissions(): PermissionState {
  return {
    generation: hasPermission("generation"),
    chats: hasPermission("chats"),
    chatMutation: hasPermission("chat_mutation"),
    characters: hasPermission("characters"),
    images: hasPermission("images"),
    uiPanels: hasPermission("ui_panels"),
  };
}

async function connectionViews(userId: string): Promise<LlmConnectionView[]> {
  if (!hasPermission("generation")) return [];
  const connections = await spindle.connections.list(userId).catch(() => []);
  return connections.map((connection) => ({
    id: connection.id,
    name: connection.name,
    provider: connection.provider,
    model: connection.model,
    isDefault: connection.is_default,
    hasApiKey: connection.has_api_key,
  }));
}

function queueKey(userId: string, chatId: string): string {
  return `${userId}:${chatId}`;
}

function markGenerationStarted(generationId: string, userId: string, chatId: string): void {
  generationUsers.set(generationId, { userId, chatId });
  const key = queueKey(userId, chatId);
  const generations = activeGenerations.get(key) ?? new Set<string>();
  generations.add(generationId);
  activeGenerations.set(key, generations);
  const timer = scheduled.get(key);
  if (timer) clearTimeout(timer);
  scheduled.delete(key);
}

function markGenerationFinished(generationId: string | null): { userId: string; chatId: string } | null {
  if (!generationId) return null;
  const remembered = generationUsers.get(generationId) ?? null;
  generationUsers.delete(generationId);
  if (!remembered) return null;
  const key = queueKey(remembered.userId, remembered.chatId);
  const generations = activeGenerations.get(key);
  generations?.delete(generationId);
  if (!generations?.size) activeGenerations.delete(key);
  return remembered;
}

function generationInProgress(userId: string, chatId: string): boolean {
  return Boolean(activeGenerations.get(queueKey(userId, chatId))?.size);
}

function enqueueAnalysis(userId: string, chatId: string, operation: () => Promise<void>): Promise<void> {
  const key = queueKey(userId, chatId);
  const previous = analysisQueues.get(key) ?? Promise.resolve();
  queueDepth.set(key, (queueDepth.get(key) ?? 0) + 1);
  const next = previous.catch(() => undefined).then(operation).finally(() => {
    queueDepth.set(key, Math.max(0, (queueDepth.get(key) ?? 1) - 1));
    if (analysisQueues.get(key) === next) analysisQueues.delete(key);
  });
  analysisQueues.set(key, next);
  return next;
}

async function characterName(userId: string, characterId: string): Promise<string> {
  if (!hasPermission("characters")) return "Character";
  const character = await spindle.characters.get(characterId, userId).catch(() => null);
  return character?.name || "Character";
}

interface ProfileSet {
  chat: Record<string, unknown>;
  profiles: CharacterProfileV2[];
  catalog: CatalogEntry[];
  primaryCharacterId: string | null;
}

async function profilesForChat(userId: string, chatId: string): Promise<ProfileSet> {
  if (!hasPermission("chats")) return { chat: {}, profiles: [], catalog: [], primaryCharacterId: null };
  const chatDto = await spindle.chats.get(chatId, userId);
  if (!chatDto) return { chat: {}, profiles: [], catalog: [], primaryCharacterId: null };
  const { characterIds: ids, primaryCharacterId } = resolveChatCharacterIds(chatDto as unknown as Record<string, unknown>);
  const profiles: CharacterProfileV2[] = [];
  for (const characterId of ids) profiles.push(await repository.getProfile(userId, characterId, await characterName(userId, characterId)));
  return {
    chat: chatDto as unknown as Record<string, unknown>,
    profiles,
    catalog: buildCatalog(profiles),
    primaryCharacterId,
  };
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, mapper: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index]);
    }
  }));
  return results;
}

async function variantViewsForProfiles(userId: string, profiles: CharacterProfileV2[]): Promise<Record<string, VariantView>> {
  const cacheKeys = profiles.map((profile) => `${userId}:${profile.characterId}:${profile.revision}`);
  const cached = cacheKeys.map((key) => mediaViewCache.get(key));
  if (cached.every(Boolean)) return Object.assign({}, ...cached);
  const variants = profiles.flatMap(allVariants);
  if (variants.length === 0) return {};
  if (!hasPermission("images")) return Object.fromEntries(variants.map((variant) => [variant.id, { ...variant, url: null, thumbUrl: null }]));

  const urls = new Map<string, string>();
  for (const profile of profiles) {
    let offset = 0;
    let total = 0;
    do {
      const page = await spindle.images.list({
        onlyOwned: true,
        characterId: profile.characterId,
        specificity: "full",
        limit: 200,
        offset,
        userId,
      } as never).catch(() => ({ data: [], total: 0 }));
      total = page.total;
      for (const item of page.data) urls.set(item.id, item.url);
      offset += page.data.length || 200;
    } while (offset < total);
  }

  const missing = [...new Set(variants.map((variant) => variant.imageId).filter((id) => !urls.has(id)))];
  const fetched = await mapWithConcurrency(missing, 12, async (imageId) =>
    spindle.images.get(imageId, { onlyOwned: true, specificity: "full", userId } as never).catch(() => null),
  );
  for (const item of fetched) if (item) urls.set(item.id, item.url);

  const views = Object.fromEntries(variants.map((variant) => {
    const url = urls.get(variant.imageId) ?? null;
    const separator = url?.includes("?") ? "&" : "?";
    return [variant.id, { ...variant, url, thumbUrl: url ? `${url}${separator}size=sm` : null }];
  }));
  for (const [index, profile] of profiles.entries()) {
    const variantIds = new Set(allVariants(profile).map((variant) => variant.id));
    mediaViewCache.set(cacheKeys[index], Object.fromEntries(
      Object.entries(views).filter(([variantId]) => variantIds.has(variantId)),
    ));
  }
  while (mediaViewCache.size > 200) {
    const oldestKey = mediaViewCache.keys().next().value;
    if (typeof oldestKey !== "string") break;
    mediaViewCache.delete(oldestKey);
  }
  return views;
}

async function buildState(userId: string, chatId?: string | null, characterId?: string | null): Promise<FrontendState> {
  const context = activeContexts.get(userId);
  const activeChatId = chatId === undefined ? context?.chatId ?? null : chatId;
  let activeCharacterId = characterId === undefined ? context?.characterId ?? null : characterId;
  const settings = await repository.getSettings(userId);
  let profile: CharacterProfileV2 | null = null;
  let timeline: ChatTimelineV2 | null = null;
  let profiles: CharacterProfileV2[] = [];
  let activeCharacterName: string | null = null;

  if (activeChatId) {
    const set = await profilesForChat(userId, activeChatId);
    profiles = set.profiles;
    timeline = await repository.getTimeline(userId, activeChatId);
    const activeProfileIds = new Set(profiles.map((item) => item.characterId));
    const characters = Object.fromEntries(
      Object.entries(timeline.snapshot.characters)
        .filter(([characterId]) => activeProfileIds.has(characterId)),
    );
    const focusedCharacterIds = timeline.snapshot.focusedCharacterIds
      .filter((characterId) => activeProfileIds.has(characterId));
    if (
      Object.keys(characters).length !== Object.keys(timeline.snapshot.characters).length
      || focusedCharacterIds.length !== timeline.snapshot.focusedCharacterIds.length
    ) {
      timeline = {
        ...timeline,
        snapshot: {
          ...timeline.snapshot,
          characters,
          focusedCharacterIds,
        },
      };
    }
    const resolvedId = activeCharacterId ?? set.primaryCharacterId;
    profile = profiles.find((item) => item.characterId === resolvedId)
      ?? profiles.find((item) => item.characterId === set.primaryCharacterId)
      ?? profiles[0]
      ?? null;
    activeCharacterId = profile?.characterId ?? null;
    activeCharacterName = profile?.characterName ?? null;
  } else if (activeCharacterId) {
    activeCharacterName = await characterName(userId, activeCharacterId);
    profile = await repository.getProfile(userId, activeCharacterId, activeCharacterName);
    profiles = [profile];
  }

  return {
    settings,
    profile,
    stageProfiles: profiles,
    timeline,
    snapshot: timeline?.snapshot ?? null,
    variantViews: await variantViewsForProfiles(userId, profiles),
    connections: await connectionViews(userId),
    permissions: permissions(),
    activeChatId,
    activeCharacterId,
    activeCharacterName,
    queueDepth: activeChatId ? queueDepth.get(queueKey(userId, activeChatId)) ?? 0 : 0,
    lastDetection: activeChatId
      ? lastDetection.get(queueKey(userId, activeChatId)) ?? { status: "idle", message: "No detection has run yet.", at: null }
      : { status: "idle", message: "No detection has run yet.", at: null },
  };
}

async function sendState(userId: string, chatId?: string | null, characterId?: string | null): Promise<void> {
  send({ type: "state", state: await buildState(userId, chatId, characterId) }, userId);
}

interface NormalizedChatMessage {
  id: string;
  role: string;
  content: string;
  swipeId: number;
  __isChatHistory: true;
}

async function normalizedMessages(chatId: string): Promise<NormalizedChatMessage[]> {
  if (!hasPermission("chat_mutation")) return [];
  const messages = await spindle.chat.getMessages(chatId);
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: typeof message.content === "string" ? message.content : "",
    swipeId: Number.isFinite(message.swipe_id) ? message.swipe_id : 0,
    __isChatHistory: true,
  }));
}

async function rebuildTimeline(
  timeline: ChatTimelineV2,
  catalog: CatalogEntry[],
  settings: Awaited<ReturnType<LumiStageRepository["getSettings"]>>,
  messages: NormalizedChatMessage[],
): Promise<ChatTimelineV2> {
  const keys: TimelineMessageKey[] = await Promise.all(messages.map(async (message) => ({
    id: message.id,
    role: message.role,
    swipeId: message.swipeId,
    contentHash: await sha256(message.content),
  })));
  return replayTimeline(timeline, catalog, settings, keys);
}

async function analyzeLatest(
  userId: string,
  chatId: string,
  force = false,
  detectionOverride?: DetectionSettingsV2,
): Promise<void> {
  if (!hasPermission("generation") || !hasPermission("chat_mutation") || !hasPermission("chats")) {
    lastDetection.set(queueKey(userId, chatId), { status: "error", message: "Generation, Chats, and Chat History permissions are required for automation.", at: Date.now() });
    await sendState(userId).catch(() => undefined);
    return;
  }
  const persistedSettings = await repository.getSettings(userId);
  const settings = detectionOverride
    ? normalizeSettings({ ...persistedSettings, detection: detectionOverride })
    : persistedSettings;
  if (!settings.detection.enabled && !force) return;
  const set = await profilesForChat(userId, chatId);
  if (set.catalog.length === 0 || !set.profiles.some((profile) => allVariants(profile).length > 0)) {
    lastDetection.set(queueKey(userId, chatId), { status: "error", message: "No LumiStage media is configured for this chat.", at: Date.now() });
    await sendState(userId).catch(() => undefined);
    return;
  }
  const messages = await normalizedMessages(chatId);
  const latest = [...messages].reverse().find((message) => message.role === "assistant" && !!message.content);
  if (!latest) return;
  let timeline = await repository.getTimeline(userId, chatId);
  const expectedTimelineRevision = timeline.revision;
  const contentHash = await sha256(latest.content);
  const recentMessages = messages
    .filter((message) => message.__isChatHistory === true)
    .slice(-settings.detection.contextMessages)
    .map(({ role, content }) => ({ role, content }));
  const currentStates = Object.fromEntries(Object.entries(timeline.snapshot.characters).map(([characterId, state]) => [
    characterId,
    { outfitId: state.outfitId, expressionId: state.expressionId, variantId: state.variantId },
  ]));
  const requestFingerprint = await sha256(JSON.stringify({
    catalog: set.profiles,
    detection: settings.detection,
    overrides: timeline.manualOverrides,
    recentMessages,
    latest: { id: latest.id, swipeId: latest.swipeId, contentHash },
  }));
  let record = force ? null : findCachedDecision(timeline.decisions, {
    id: latest.id,
    swipeId: latest.swipeId,
    contentHash,
  }, requestFingerprint);

  lastDetection.set(queueKey(userId, chatId), { status: "running", message: record ? "Restoring cached stage decision…" : "Analyzing the latest reply…", at: Date.now() });
  await sendState(userId).catch(() => undefined);

  let detectorInputTokens: number | null = null;
  if (!record) {
    const builtRequest = buildDetectorRequest(
      set.catalog,
      recentMessages,
      currentStates,
      settings,
      timeline.manualOverrides,
    );
    const {
      estimatedInputTokens,
      ...request
    } = builtRequest;
    detectorInputTokens = typeof estimatedInputTokens === "number"
      ? estimatedInputTokens
      : null;
    const generationInput = { ...request, userId };
    Object.assign(generationInput, { signal: AbortSignal.timeout(60_000) });
    const response = await (spindle.generate.quiet as unknown as (
      input: Record<string, unknown>,
    ) => Promise<DetectorResponse>)(generationInput);
    detectorInputTokens = response.usage?.prompt_tokens
      ?? response.usage?.input_tokens
      ?? detectorInputTokens;
    const parsed = parseDetectorResponse(response, set.catalog);
    if (!parsed) throw new Error("The detector did not return a valid stage decision.");
    const decision = validateDecision(parsed, set.catalog);
    if (decision.characters.length === 0 && decision.focusedCharacterIds.length === 0) {
      throw new Error("The detector returned no valid characters.");
    }
    record = {
      messageId: latest.id,
      swipeId: latest.swipeId,
      contentHash,
      requestFingerprint,
      decision,
      provider: response.provider ?? null,
      model: response.model ?? settings.detection.model,
      createdAt: Date.now(),
    };
    timeline.decisions = upsertDecision(timeline.decisions, record);
  }

  timeline.manualOverrides = consumeOnceOverrides(timeline.manualOverrides);
  timeline = await rebuildTimeline(timeline, set.catalog, settings, messages);
  timeline = await repository.saveTimeline(userId, timeline, expectedTimelineRevision);
  lastDetection.set(queueKey(userId, chatId), {
    status: "success",
    message: `Stage settled for ${record.decision.focusedCharacterIds.length || record.decision.characters.length} character(s).${
      detectorInputTokens ? ` Detector input: ${detectorInputTokens.toLocaleString()} tokens.` : ""
    }`,
    at: Date.now(),
  });
  await sendState(userId).catch(() => undefined);
}

function scheduleAnalysis(userId: string, chatId: string, delay = 120, force = false): void {
  const key = queueKey(userId, chatId);
  if (!force && generationInProgress(userId, chatId)) return;
  const old = scheduled.get(key);
  if (old) clearTimeout(old);
  scheduled.set(key, setTimeout(() => {
    scheduled.delete(key);
    void enqueueAnalysis(userId, chatId, () => analyzeLatest(userId, chatId, force).catch(async (error) => {
       lastDetection.set(queueKey(userId, chatId), {
        status: "error",
        message: error instanceof Error ? error.message : "Stage detection failed.",
        at: Date.now(),
      });
      await sendState(userId).catch(() => undefined);
    }));
  }, delay));
}

async function importAssets(userId: string, message: Extract<FrontendToBackend, { type: "import-assets" }>): Promise<void> {
  if (!hasPermission("images")) throw new Error("Images permission is required to import media.");
  if (message.baseProfile.characterId !== message.characterId) {
    throw new Error("The import draft belongs to a different character.");
  }
  if (message.baseProfile.revision !== message.expectedRevision) {
    throw new Error("The import draft revision does not match the expected profile revision.");
  }
  const current = await repository.getProfile(
    userId,
    message.characterId,
    await characterName(userId, message.characterId),
  );
  if (current.revision !== message.expectedRevision) throw new RevisionConflict(current.revision);
  const candidates: ImportCandidate[] = [];
  const newlyUploadedImageIds: string[] = [];
  let committed = false;

  try {
    for (const [index, staged] of message.uploads.entries()) {
      send({ type: "import-progress", requestId: message.requestId, completed: index, total: message.uploads.length, message: "Reading staged uploads…" }, userId);
      const upload = await spindle.uploads.get(staged.id, userId);
      if (!upload) {
        throw new Error(`Upload ${staged.id} expired before it could be read.`);
      }
      try {
        if (/\.zip$/i.test(staged.relativePath) || /\.zip$/i.test(upload.fileName)) {
          throw new Error("Archives cannot be imported as media. Use Restore archive instead.");
        }
        candidates.push(directCandidate(staged.relativePath || upload.fileName, upload.data));
      } finally {
        await spindle.uploads.delete(staged.id, userId);
      }
    }

    if (!candidates.length) throw new Error("No supported media files were supplied.");
    assertUnambiguousCandidates(candidates, message.layout);
    const existingByHash = new Map(
      [...allVariants(current), ...allVariants(message.baseProfile)]
        .map((variant) => [variant.contentHash, variant]),
    );
    const candidateHashes = await Promise.all(candidates.map((candidate) => sha256(candidate.bytes)));
    const preparedByHash = new Map<string, { candidate: ImportCandidate; hash: string }>();
    for (let index = 0; index < candidates.length; index += 1) {
      const hash = candidateHashes[index];
      if (!existingByHash.has(hash) && !preparedByHash.has(hash)) {
        preparedByHash.set(hash, { candidate: candidates[index], hash });
      }
    }
    const prepared = [...preparedByHash.values()];
    const uploadItems = prepared.map(({ candidate }) => ({
      data: candidate.bytes,
      filename: candidate.fileName,
      mime_type: candidate.mimeType,
      owner_character_id: message.characterId,
      strip_audio: candidate.mimeType.startsWith("video/"),
    }));
    const results = uploadItems.length
      ? await (spindle.images.uploadMany as unknown as (
        items: unknown[],
        options?: { userId?: string; concurrency?: number },
      ) => Promise<Array<{ id?: string; error?: string }>>)(uploadItems, { userId, concurrency: 8 })
      : [];

    const storedByHash = new Map<string, {
      imageId: string;
      contentHash: string;
      fileName: string;
      mimeType: string;
    }>();
    for (const [hash, variant] of existingByHash) {
      storedByHash.set(hash, {
        imageId: variant.imageId,
        contentHash: hash,
        fileName: variant.fileName,
        mimeType: variant.mimeType,
      });
    }
    for (let index = 0; index < prepared.length; index += 1) {
      const result = results[index];
      if (!result?.id) {
        throw new Error(`${prepared[index].candidate.path}: ${result?.error ?? "Upload failed."}`);
      }
      newlyUploadedImageIds.push(result.id);
      storedByHash.set(prepared[index].hash, {
        imageId: result.id,
        contentHash: prepared[index].hash,
        fileName: prepared[index].candidate.fileName,
        mimeType: prepared[index].candidate.mimeType,
      });
      send({
        type: "import-progress",
        requestId: message.requestId,
        completed: index + 1,
        total: prepared.length,
        message: `Stored ${index + 1} of ${prepared.length} media files…`,
      }, userId);
    }

    const selectedOutfit = message.baseProfile.outfits.find((item) => item.id === message.targetOutfitId);
    const selectedExpression = selectedOutfit?.expressions.find((item) => item.id === message.targetExpressionId);
    if (message.targetOutfitId && !selectedOutfit) throw new Error("The selected outfit no longer exists in the Studio draft.");
    if (message.targetExpressionId && !selectedExpression) throw new Error("The selected expression no longer exists in the Studio draft.");
    const imported = candidates.map((candidate, index) => {
      const stored = storedByHash.get(candidateHashes[index]);
      if (!stored) throw new Error(`${candidate.path}: media storage did not return a reusable image.`);
      return {
        target: importTarget(candidate, message.layout),
        targetOutfitId: selectedOutfit?.id,
        targetExpressionId: selectedExpression?.id,
        ...stored,
        fileName: candidate.fileName,
        mimeType: candidate.mimeType,
      };
    });
    const merged = mergeImportedAssets(
      message.baseProfile,
      imported,
      message.baseProfile.characterName,
    );
    const saved = await repository.saveProfile(
      userId,
      merged.profile,
      message.expectedRevision,
      message.baseProfile.characterName,
    );
    committed = true;
    send({
      type: "operation-complete",
      requestId: message.requestId,
      revision: saved.revision,
      result: { profile: saved, imported: merged.imported, skipped: merged.skipped, errors: [] },
    }, userId);
    const views = await variantViewsForProfiles(userId, [saved]).catch(() => ({}));
    send({
      type: "import-complete",
      requestId: message.requestId,
      profile: saved,
      variantViews: views,
      imported: merged.imported,
      skipped: merged.skipped,
      errors: [],
    }, userId);
  } catch (error) {
    if (!committed && newlyUploadedImageIds.length) {
      await spindle.images.deleteMany(newlyUploadedImageIds, { userId }).catch((cleanupError) => {
        const counters = countersFor(userId);
        counters.cleanupFailures = [
          ...counters.cleanupFailures.slice(-19),
          `Failed import rollback: ${cleanupError instanceof Error ? cleanupError.message : "cleanup failed"}`,
        ];
      });
    }
    throw new Error(error instanceof Error ? error.message : "Import failed.");
  }
}

async function restoreArchive(
  userId: string,
  message: Extract<FrontendToBackend, { type: "restore-archive" }>,
): Promise<void> {
  if (!hasPermission("images")) throw new Error("Images permission is required to restore an archive.");
  if (!message.confirmed) throw new Error("Archive restore requires explicit confirmation.");
  if (!/\.lumistage\.zip$/i.test(message.upload.relativePath)) {
    throw new Error("Restore accepts exactly one .lumistage.zip archive.");
  }
  const current = await repository.getProfile(
    userId,
    message.characterId,
    await characterName(userId, message.characterId),
  );
  if (current.revision !== message.expectedRevision) throw new RevisionConflict(current.revision);
  const newlyUploadedImageIds: string[] = [];
  let committed = false;
  try {
    const upload = await spindle.uploads.get(message.upload.id, userId);
    if (!upload) throw new Error("The staged archive expired before it could be read.");
    let extracted: Awaited<ReturnType<typeof extractLumiStageArchive>>;
    try {
      extracted = await extractLumiStageArchive(upload.data);
      if (extracted.errors.length) throw new Error(extracted.errors.join("; "));
    } finally {
      await spindle.uploads.delete(message.upload.id, userId);
    }
    const { manifest, candidates } = extracted;
    const candidateHashes = await Promise.all(candidates.map((candidate) => sha256(candidate.bytes)));
    const existingByHash = new Map(allVariants(current).map((variant) => [variant.contentHash, variant]));
    const preparedByHash = new Map<string, { candidate: ImportCandidate; hash: string }>();
    for (let index = 0; index < candidates.length; index += 1) {
      const hash = candidateHashes[index];
      if (!existingByHash.has(hash) && !preparedByHash.has(hash)) {
        preparedByHash.set(hash, { candidate: candidates[index], hash });
      }
    }
    const prepared = [...preparedByHash.values()];
    const results = prepared.length ? await (spindle.images.uploadMany as unknown as (
      items: unknown[],
      options?: { userId?: string; concurrency?: number },
    ) => Promise<Array<{ id?: string; error?: string }>>)(prepared.map(({ candidate }) => ({
      data: candidate.bytes,
      filename: candidate.fileName,
      mime_type: candidate.mimeType,
      owner_character_id: message.characterId,
      strip_audio: candidate.mimeType.startsWith("video/"),
    })), { userId, concurrency: 8 }) : [];
    const storedByHash = new Map<string, {
      imageId: string;
      contentHash: string;
      fileName: string;
      mimeType: string;
    }>();
    for (const [hash, variant] of existingByHash) {
      storedByHash.set(hash, {
        imageId: variant.imageId,
        contentHash: hash,
        fileName: variant.fileName,
        mimeType: variant.mimeType,
      });
    }
    for (let index = 0; index < prepared.length; index += 1) {
      const result = results[index];
      if (!result?.id) throw new Error(`${prepared[index].candidate.path}: ${result?.error ?? "Upload failed."}`);
      newlyUploadedImageIds.push(result.id);
      storedByHash.set(prepared[index].hash, {
        imageId: result.id,
        contentHash: prepared[index].hash,
        fileName: prepared[index].candidate.fileName,
        mimeType: prepared[index].candidate.mimeType,
      });
    }
    const uploadedByPath = new Map<string, {
      imageId: string;
      contentHash: string;
      fileName: string;
      mimeType: string;
    }>();
    for (let index = 0; index < candidates.length; index += 1) {
      const stored = storedByHash.get(candidateHashes[index]);
      if (!stored) throw new Error(`${candidates[index].path}: media storage did not return a reusable image.`);
      uploadedByPath.set(candidates[index].path, {
        ...stored,
        fileName: candidates[index].fileName,
        mimeType: candidates[index].mimeType,
      });
    }
    const restored = hydrateArchiveProfile(
      manifest,
      message.characterId,
      current.characterName,
      uploadedByPath,
    );
    const saved = await repository.saveProfile(userId, restored, message.expectedRevision, current.characterName);
    committed = true;
    send({
      type: "operation-complete",
      requestId: message.requestId,
      revision: saved.revision,
      result: { profile: saved },
    }, userId);
    const views = await variantViewsForProfiles(userId, [saved]).catch(() => ({}));
    send({ type: "profile", profile: saved, variantViews: views }, userId);
    const retainedImageIds = new Set(allVariants(saved).map((variant) => variant.imageId));
    const removedImageIds = allVariants(current)
      .filter((variant) => !retainedImageIds.has(variant.imageId))
      .map((variant) => variant.imageId);
    if (removedImageIds.length) {
      trackCleanup(userId, "Archive restore", deleteOwnedImagesIfUnreferenced(userId, removedImageIds));
    }
  } catch (error) {
    if (!committed && newlyUploadedImageIds.length) {
      await spindle.images.deleteMany(newlyUploadedImageIds, { userId }).catch((cleanupError) => {
        const counters = countersFor(userId);
        counters.cleanupFailures = [
          ...counters.cleanupFailures.slice(-19),
          `Failed restore rollback: ${cleanupError instanceof Error ? cleanupError.message : "cleanup failed"}`,
        ];
      });
    }
    throw error;
  }
}

function archiveForProfile(profile: CharacterProfileV2): LumiStageArchiveV2 {
  const variants: ArchiveVariantEntryV2[] = [];
  for (const outfit of profile.outfits) {
    for (const expression of outfit.expressions) for (const variant of expression.variants) {
      const extension = variant.fileName.includes(".") ? variant.fileName.split(".").pop() : variant.mimeType.split("/").pop();
      variants.push({
        path: `assets/${variant.contentHash}.${extension || "bin"}`,
        characterId: profile.characterId,
        outfitId: outfit.id,
        expressionId: expression.id,
        variant,
      });
    }
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    kind: "lumistage-archive",
    exportedAt: Date.now(),
    profile,
    variants,
  };
}

async function exportProfile(userId: string, characterId: string): Promise<{ archive: LumiStageArchiveV2; urls: Record<string, string> }> {
  if (!hasPermission("images")) throw new Error("Images permission is required to export media.");
  const profile = await repository.getProfile(userId, characterId, await characterName(userId, characterId));
  const archive = archiveForProfile(profile);
  const urls: Record<string, string> = {};
  await mapWithConcurrency(archive.variants, 8, async (entry) => {
    const image = await spindle.images.get(entry.variant.imageId, { onlyOwned: true, specificity: "full", userId } as never);
    if (!image?.url) throw new Error(`Export media is unavailable: ${entry.path}.`);
    urls[entry.path] = image.url;
  });
  return { archive, urls };
}

async function deleteOwnedImagesIfUnreferenced(
  userId: string,
  candidateImageIds: Iterable<string>,
): Promise<void> {
  const profiles = await repository.listProfiles(userId);
  const unreferenced = unreferencedImageIds(profiles, candidateImageIds);
  const deletable = await confirmExtensionOwnedImageIds(
    unreferenced,
    (imageId) => spindle.images.get(
      imageId,
      { onlyOwned: true, specificity: "metadata", userId } as never,
    ),
  );
  if (deletable.length) await spindle.images.deleteMany(deletable, { userId });
}

async function handleMessage(message: FrontendToBackend, userId: string): Promise<void> {
  if (message.type === "ready" || message.type === "refresh") {
    const prior = activeContexts.get(userId);
    if (prior?.chatId && prior.chatId !== message.chatId && chatUsers.get(prior.chatId) === userId) {
      chatUsers.delete(prior.chatId);
    }
    activeContexts.set(userId, { chatId: message.chatId, characterId: message.characterId });
    if (message.chatId) chatUsers.set(message.chatId, userId);
    await sendState(userId, message.chatId, message.characterId);
    return;
  }
  if (message.type === "character-editor") {
    if (!message.characterId) return;
    const profile = await repository.getProfile(userId, message.characterId, await characterName(userId, message.characterId));
    send({ type: "profile", profile, variantViews: await variantViewsForProfiles(userId, [profile]) }, userId);
    return;
  }
  if (message.type === "open-connections") {
    await spindle.ui.openDrawerTab("connections", { userId });
    return;
  }
  if (message.type === "save-settings") {
    const saved = await repository.saveSettings(userId, message.settings, message.expectedRevision);
    send({
      type: "operation-complete",
      requestId: message.requestId,
      revision: saved.revision,
      result: { settings: saved },
    }, userId);
    await sendState(userId).catch(() => undefined);
    return;
  }
  if (message.type === "save-profile") {
    const before = await repository.getProfile(
      userId,
      message.profile.characterId,
      message.profile.characterName,
    );
    const saved = await repository.saveProfile(userId, message.profile, message.expectedRevision);
    const retainedImageIds = new Set(allVariants(saved).map((variant) => variant.imageId));
    const removedImageIds = allVariants(before)
      .filter((variant) => !retainedImageIds.has(variant.imageId))
      .map((variant) => variant.imageId);
    send({ type: "operation-complete", requestId: message.requestId, revision: saved.revision }, userId);
    send({
      type: "profile",
      profile: saved,
      variantViews: await variantViewsForProfiles(userId, [saved]).catch(() => ({})),
    }, userId);
    if (removedImageIds.length && hasPermission("images")) {
      trackCleanup(userId, "Profile save", deleteOwnedImagesIfUnreferenced(userId, removedImageIds));
    }
    return;
  }
  if (message.type === "save-chat-layout") {
    const timeline = await repository.getTimeline(userId, message.chatId);
    if (timeline.revision !== message.expectedRevision) throw new RevisionConflict(timeline.revision);
    const next: ChatTimelineV2 = {
      ...timeline,
      revision: timeline.revision + 1,
      layoutOverride: message.layoutOverride ? structuredClone(message.layoutOverride) : null,
      updatedAt: Date.now(),
    };
    const saved = await repository.saveTimeline(userId, next, message.expectedRevision);
    send({ type: "operation-complete", requestId: message.requestId, revision: saved.revision }, userId);
    await sendState(userId).catch(() => undefined);
    return;
  }
  if (message.type === "apply-manual") {
    const settings = await repository.getSettings(userId);
    const set = await profilesForChat(userId, message.chatId);
    const current = await repository.getTimeline(userId, message.chatId);
    if (!isValidManualOverride(set.catalog, message.override)) {
      throw new Error("The manual override does not match the active character catalog.");
    }
    const timeline = applyManualOverride(current, set.catalog, message.override, settings);
    const saved = await repository.saveTimeline(userId, timeline, current.revision);
    send({ type: "operation-complete", requestId: message.requestId, revision: saved.revision }, userId);
    await sendState(userId).catch(() => undefined);
    return;
  }
  if (message.type === "clear-manual") {
    const set = await profilesForChat(userId, message.chatId);
    const settings = await repository.getSettings(userId);
    const messages = await normalizedMessages(message.chatId);
    const current = await repository.getTimeline(userId, message.chatId);
    let timeline = clearManualOverride(current, message.characterId);
    timeline = await rebuildTimeline(timeline, set.catalog, settings, messages);
    const saved = await repository.saveTimeline(userId, timeline, current.revision);
    send({ type: "operation-complete", requestId: message.requestId, revision: saved.revision }, userId);
    await sendState(userId).catch(() => undefined);
    return;
  }
  if (message.type === "analyze-now") {
    await enqueueAnalysis(
      userId,
      message.chatId,
      () => analyzeLatest(userId, message.chatId, true, message.detection),
    );
    send({ type: "operation-complete", requestId: message.requestId }, userId);
    return;
  }
  if (message.type === "import-assets") {
    await importAssets(userId, message);
    return;
  }
  if (message.type === "restore-archive") {
    await restoreArchive(userId, message);
    return;
  }
  if (message.type === "discard-uploads") {
    await Promise.all(message.uploadIds.map((uploadId) =>
      spindle.uploads.delete(uploadId, userId).catch(() => undefined),
    ));
    send({ type: "operation-complete", requestId: message.requestId }, userId);
    return;
  }
  if (message.type === "delete-variants") {
    if (!hasPermission("images")) throw new Error("Images permission is required to delete media.");
    const profile = await repository.getProfile(userId, message.characterId, await characterName(userId, message.characterId));
    const selected = new Set(message.variantIds);
    const variants = allVariants(profile).filter((variant) => selected.has(variant.id));
    const next = await repository.saveProfile(
      userId,
      removeVariants(profile, selected),
      message.expectedRevision,
      profile.characterName,
    );
    send({ type: "operation-complete", requestId: message.requestId, revision: next.revision }, userId);
    send({
      type: "profile",
      profile: next,
      variantViews: await variantViewsForProfiles(userId, [next]).catch(() => ({})),
    }, userId);
    trackCleanup(userId, "Variant deletion", deleteOwnedImagesIfUnreferenced(
      userId,
      variants.map((variant) => variant.imageId),
    ));
    return;
  }
  if (message.type === "request-export") {
    const exported = await exportProfile(userId, message.characterId);
    send({ type: "export-ready", requestId: message.requestId, ...exported }, userId);
    return;
  }
  if (message.type === "request-diagnostics") {
    const context = activeContexts.get(userId);
    const diagnosticProfiles = context?.chatId
      ? (await profilesForChat(userId, context.chatId)).profiles
      : context?.characterId
        ? [await repository.getProfile(userId, context.characterId, await characterName(userId, context.characterId))]
        : [];
    const profile = diagnosticProfiles.find((item) => item.characterId === context?.characterId) ?? diagnosticProfiles[0] ?? null;
    const views = await variantViewsForProfiles(userId, diagnosticProfiles);
    const media = diagnosticProfiles.flatMap(allVariants);
    const settings = await repository.getSettings(userId);
    const counters = countersFor(userId);
    const estimatedRequest = buildDetectorRequest(
      buildCatalog(diagnosticProfiles),
      [],
      {},
      settings,
      {},
      false,
    );
    const estimatedCatalogTokens = typeof estimatedRequest.estimatedInputTokens === "number"
      ? estimatedRequest.estimatedInputTokens
      : 0;
    const report = {
      generatedAt: new Date().toISOString(),
      version: "1.0.0",
      permissions: permissions(),
      active: {
        hasChat: !!context?.chatId,
        hasCharacter: !!context?.characterId,
        queueDepth: context?.chatId ? queueDepth.get(queueKey(userId, context.chatId)) ?? 0 : 0,
      },
      persistence: {
        revisionConflicts: counters.revisionConflicts,
        cleanupFailures: [...counters.cleanupFailures],
      },
      connection: {
        generationPermission: hasPermission("generation"),
        selection: settings.detection.connectionId ? "configured" : "active-host-connection",
        modelOverride: settings.detection.model ? "configured" : "none",
      },
      media: {
        total: media.length,
        missing: hasPermission("images") ? media.filter((variant) => !views[variant.id]?.url).length : null,
        ownershipVerified: hasPermission("images"),
      },
      catalog: {
        characters: diagnosticProfiles.length,
        outfits: diagnosticProfiles.reduce((sum, item) => sum + item.outfits.length, 0),
        variants: media.length,
        estimatedDetectorInputTokens: estimatedCatalogTokens,
        oversized: estimatedCatalogTokens > 24_000,
        issues: diagnosticProfiles.flatMap((item) => inspectProfile(item)),
      },
      detector: context?.chatId ? lastDetection.get(queueKey(userId, context.chatId)) ?? null : null,
    };
    send({
      type: "diagnostics",
      requestId: message.requestId,
      report,
    }, userId);
    send({ type: "operation-complete", requestId: message.requestId, result: report }, userId);
  }
}

spindle.onFrontendMessage(async (payload, userId) => {
  const message = payload as FrontendToBackend;
  try {
    await handleMessage(message, userId);
  } catch (error) {
    if (error instanceof RevisionConflict) {
      countersFor(userId).revisionConflicts += 1;
      send({
        type: "error",
        requestId: "requestId" in message ? message.requestId : undefined,
        code: "REVISION_CONFLICT",
        message: error.message,
        currentRevision: error.currentRevision,
      }, userId);
      await sendState(userId).catch(() => undefined);
      return;
    }
    send({
      type: "error",
      requestId: "requestId" in message ? message.requestId : undefined,
      code: "OPERATION_FAILED",
      message: error instanceof Error ? error.message : "LumiStage operation failed.",
    }, userId);
  }
});

onEvent("GENERATION_STARTED", (payload, eventUserId) => {
  const chatId = extractChatId(payload);
  const generationId = readString(payload, ["generationId", "generation_id"]);
  const userId = resolveUserId(chatId, eventUserId);
  if (!chatId || !generationId || !userId) return;
  chatUsers.set(chatId, userId);
  markGenerationStarted(generationId, userId, chatId);
});

onEvent("GENERATION_ENDED", (payload, eventUserId) => {
  const generationId = readString(payload, ["generationId", "generation_id"]);
  const remembered = generationId ? generationUsers.get(generationId) : null;
  const chatId = extractChatId(payload) ?? remembered?.chatId ?? null;
  const userId = resolveUserId(chatId, eventUserId ?? remembered?.userId);
  markGenerationFinished(generationId);
  if (!chatId || !userId || readString(payload, ["error"]) || !readString(payload, ["messageId", "message_id"])) return;
  if (generationInProgress(userId, chatId)) return;
  scheduleAnalysis(userId, chatId);
});

onEvent("GENERATION_STOPPED", (payload) => {
  const generationId = readString(payload, ["generationId", "generation_id"]);
  markGenerationFinished(generationId);
});

for (const event of ["MESSAGE_EDITED", "MESSAGE_SWIPED", "SWIPE_EDITED"] as const) {
  onEvent(event, (payload, eventUserId) => {
    const raw = asRecord(payload);
    const chatId = extractChatId(payload) ?? extractChatId(raw.message);
    const userId = resolveUserId(chatId, eventUserId);
    if (chatId && userId) scheduleAnalysis(userId, chatId, 280);
  });
}

onEvent("MESSAGE_DELETED", (payload, eventUserId) => {
  const chatId = extractChatId(payload);
  const messageId = readString(payload, ["messageId", "message_id"]);
  const userId = resolveUserId(chatId, eventUserId);
  if (!chatId || !messageId || !userId) return;
  settleBackground(enqueueAnalysis(userId, chatId, async () => {
    const settings = await repository.getSettings(userId);
    const set = await profilesForChat(userId, chatId);
    const messages = await normalizedMessages(chatId);
    let timeline = await repository.getTimeline(userId, chatId);
    const expectedRevision = timeline.revision;
    timeline.decisions = timeline.decisions.filter((record) => record.messageId !== messageId);
    timeline = await rebuildTimeline(timeline, set.catalog, settings, messages);
    await repository.saveTimeline(userId, timeline, expectedRevision);
    await sendState(userId);
  }));
});

onEvent("CHAT_SWITCHED", (payload, eventUserId) => {
  const chatId = readString(payload, ["chatId", "chat_id"]);
  const userId = resolveUserId(chatId, eventUserId);
  if (!userId) return;
  const previous = activeContexts.get(userId);
  if (previous?.chatId && previous.chatId !== chatId && chatUsers.get(previous.chatId) === userId) {
    chatUsers.delete(previous.chatId);
  }
  activeContexts.set(userId, { chatId, characterId: previous?.characterId ?? null });
  if (chatId) chatUsers.set(chatId, userId);
  settleBackground(sendState(userId, chatId, previous?.characterId ?? null));
});

onEvent("CHAT_DELETED", (payload, eventUserId) => {
  const chatId = extractChatId(payload);
  const userId = resolveUserId(chatId, eventUserId);
  if (!chatId || !userId) return;
  chatUsers.delete(chatId);
  const key = queueKey(userId, chatId);
  const timer = scheduled.get(key);
  if (timer) clearTimeout(timer);
  scheduled.delete(key);
  activeGenerations.delete(key);
  for (const [generationId, context] of generationUsers) {
    if (context.userId === userId && context.chatId === chatId) generationUsers.delete(generationId);
  }
  queueDepth.delete(key);
  lastDetection.delete(key);
  settleBackground(repository.deleteTimeline(userId, chatId));
});

spindle.permissions.onChanged(() => {
  for (const userId of activeContexts.keys()) settleBackground(sendState(userId));
});
