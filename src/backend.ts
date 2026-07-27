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
  type CatalogEntry,
} from "./model";
import {
  assertUnambiguousCandidates,
  directCandidate,
  extractArchive,
  hydrateArchiveProfile,
  mergeImportedAssets,
  readLumiStageManifest,
  removeVariants,
  settleHostUploads,
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
const scheduled = new Map<string, ReturnType<typeof setTimeout>>();
const analysisQueues = new Map<string, Promise<void>>();
const queueDepth = new Map<string, number>();
const lastDetection = new Map<string, FrontendState["lastDetection"]>();
let lastFrontendUserId: string | null = null;

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
  return eventUserId ?? (chatId ? chatUsers.get(chatId) : null) ?? lastFrontendUserId;
}

function send(message: BackendToFrontend, userId: string): void {
  (spindle.sendToFrontend as unknown as (payload: unknown, targetUserId?: string) => void)(message, userId);
}

function settleBackground(operation: Promise<unknown>): void {
  void operation.catch(() => undefined);
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

  return Object.fromEntries(variants.map((variant) => {
    const url = urls.get(variant.imageId) ?? null;
    const separator = url?.includes("?") ? "&" : "?";
    return [variant.id, { ...variant, url, thumbUrl: url ? `${url}${separator}size=sm` : null }];
  }));
}

async function buildState(userId: string, chatId?: string | null, characterId?: string | null): Promise<FrontendState> {
  const context = activeContexts.get(userId);
  const activeChatId = chatId === undefined ? context?.chatId ?? null : chatId;
  const activeCharacterId = characterId === undefined ? context?.characterId ?? null : characterId;
  const settings = await repository.getSettings(userId);
  let profile: CharacterProfileV2 | null = null;
  let timeline: ChatTimelineV2 | null = null;
  let profiles: CharacterProfileV2[] = [];
  let activeCharacterName: string | null = null;

  if (activeChatId) {
    const set = await profilesForChat(userId, activeChatId);
    profiles = set.profiles;
    timeline = await repository.getTimeline(userId, activeChatId);
    const resolvedId = activeCharacterId ?? set.primaryCharacterId;
    profile = profiles.find((item) => item.characterId === resolvedId) ?? null;
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
    lastDetection: lastDetection.get(userId) ?? { status: "idle", message: "No detection has run yet.", at: null },
  };
}

async function sendState(userId: string, chatId?: string | null, characterId?: string | null): Promise<void> {
  send({ type: "state", state: await buildState(userId, chatId, characterId) }, userId);
}

async function normalizedMessages(chatId: string): Promise<Array<{ id: string; role: string; content: string; swipeId: number }>> {
  if (!hasPermission("chat_mutation")) return [];
  const messages = await spindle.chat.getMessages(chatId);
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: typeof message.content === "string" ? message.content : "",
    swipeId: Number.isFinite(message.swipe_id) ? message.swipe_id : 0,
  }));
}

async function rebuildTimeline(
  timeline: ChatTimelineV2,
  catalog: CatalogEntry[],
  settings: Awaited<ReturnType<LumiStageRepository["getSettings"]>>,
  messages: Array<{ id: string; role: string; content: string; swipeId: number }>,
): Promise<ChatTimelineV2> {
  const keys: TimelineMessageKey[] = await Promise.all(messages.map(async (message) => ({
    id: message.id,
    role: message.role,
    swipeId: message.swipeId,
    contentHash: await sha256(message.content),
  })));
  return replayTimeline(timeline, catalog, settings, keys);
}

async function analyzeLatest(userId: string, chatId: string, force = false): Promise<void> {
  if (!hasPermission("generation") || !hasPermission("chat_mutation") || !hasPermission("chats")) {
    lastDetection.set(userId, { status: "error", message: "Generation, Chats, and Chat History permissions are required for automation.", at: Date.now() });
    await sendState(userId);
    return;
  }
  const settings = await repository.getSettings(userId);
  if (!settings.detection.enabled && !force) return;
  const set = await profilesForChat(userId, chatId);
  if (set.catalog.length === 0 || !set.profiles.some((profile) => allVariants(profile).length > 0)) {
    lastDetection.set(userId, { status: "error", message: "No LumiStage media is configured for this chat.", at: Date.now() });
    await sendState(userId);
    return;
  }
  const messages = await normalizedMessages(chatId);
  const latest = [...messages].reverse().find((message) => message.role === "assistant" && !!message.content);
  if (!latest) return;
  let timeline = await repository.getTimeline(userId, chatId);
  const expectedTimelineRevision = timeline.revision;
  const contentHash = await sha256(latest.content);
  let record = findCachedDecision(timeline.decisions, {
    id: latest.id,
    swipeId: latest.swipeId,
    contentHash,
  });

  lastDetection.set(userId, { status: "running", message: record ? "Restoring cached stage decision…" : "Analyzing the latest reply…", at: Date.now() });
  await sendState(userId);

  if (!record) {
    const currentStates = Object.fromEntries(Object.entries(timeline.snapshot.characters).map(([characterId, state]) => [
      characterId,
      { outfitId: state.outfitId, expressionId: state.expressionId, variantId: state.variantId },
    ]));
    const request = buildDetectorRequest(
      set.catalog,
      messages.slice(-settings.detection.contextMessages).map(({ role, content }) => ({ role, content })),
      currentStates,
      settings,
    );
    const response = await (spindle.generate.quiet as unknown as (input: Record<string, unknown>) => Promise<DetectorResponse>)({ ...request, userId });
    const parsed = parseDetectorResponse(response);
    if (!parsed) throw new Error("The detector did not return a valid stage decision.");
    const decision = validateDecision(parsed, set.catalog);
    if (decision.characters.length === 0 && decision.focusedCharacterIds.length === 0) {
      throw new Error("The detector returned no valid characters.");
    }
    record = {
      messageId: latest.id,
      swipeId: latest.swipeId,
      contentHash,
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
  lastDetection.set(userId, {
    status: "success",
    message: `Stage settled for ${record.decision.focusedCharacterIds.length || record.decision.characters.length} character(s).`,
    at: Date.now(),
  });
  await sendState(userId);
}

function scheduleAnalysis(userId: string, chatId: string, delay = 120, force = false): void {
  const key = queueKey(userId, chatId);
  const old = scheduled.get(key);
  if (old) clearTimeout(old);
  scheduled.set(key, setTimeout(() => {
    scheduled.delete(key);
    void enqueueAnalysis(userId, chatId, () => analyzeLatest(userId, chatId, force).catch(async (error) => {
      lastDetection.set(userId, {
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
  const profile = await repository.getProfile(userId, message.characterId, await characterName(userId, message.characterId));
  const candidates: ImportCandidate[] = [];
  const errors: string[] = [];
  let archiveManifest: ReturnType<typeof readLumiStageManifest> = null;

  try {
    for (const [index, uploadId] of message.uploadIds.entries()) {
      send({ type: "import-progress", requestId: message.requestId, completed: index, total: message.uploadIds.length, message: "Reading staged uploads…" }, userId);
      const upload = await spindle.uploads.get(uploadId, userId);
      if (!upload) {
        errors.push(`Upload ${uploadId} expired before it could be read.`);
        continue;
      }
      try {
        if (/\.zip$/i.test(upload.fileName)) {
          const manifest = readLumiStageManifest(upload.data);
          if (manifest) archiveManifest = manifest;
          const extracted = extractArchive(upload.data);
          candidates.push(...extracted.candidates);
          errors.push(...extracted.errors);
        } else {
          candidates.push(directCandidate(upload.fileName, upload.data));
        }
      } finally {
        await spindle.uploads.delete(uploadId, userId);
      }
    }

    assertUnambiguousCandidates(candidates, message.layout);
    const existingByHash = new Map(allVariants(profile).map((variant) => [variant.contentHash, variant]));
    const prepared: Array<{ candidate: ImportCandidate; hash: string }> = [];
    const reusedByPath = new Map<string, { imageId: string; contentHash: string; fileName: string; mimeType: string }>();
    let skipped = 0;
    for (const candidate of candidates) {
      const hash = await sha256(candidate.bytes);
      const existing = existingByHash.get(hash);
      if (existing) {
        reusedByPath.set(candidate.path, {
          imageId: existing.imageId,
          contentHash: existing.contentHash,
          fileName: candidate.fileName,
          mimeType: candidate.mimeType,
        });
        skipped += 1;
        continue;
      }
      if (prepared.some((item) => item.hash === hash)) {
        skipped += 1;
        continue;
      }
      prepared.push({ candidate, hash });
    }
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

    const settled = settleHostUploads(prepared, results, message.layout);
    for (const [path, reused] of reusedByPath) settled.uploadedByPath.set(path, reused);
    errors.push(...settled.errors);
    for (let index = 0; index < prepared.length; index += 1) {
      const result = results[index];
      if (!result?.id) continue;
      send({
        type: "import-progress",
        requestId: message.requestId,
        completed: index + 1,
        total: prepared.length,
        message: `Stored ${index + 1} of ${prepared.length} media files…`,
      }, userId);
    }

    const selectedOutfit = profile.outfits.find((item) => item.id === message.targetOutfitId);
    const selectedExpression = selectedOutfit?.expressions.find((item) => item.id === message.targetExpressionId);
    const imported = settled.imported.map((item) => ({
      ...item,
      target: {
        outfitName: selectedOutfit?.name ?? item.target.outfitName,
        expressionName: selectedExpression?.name ?? item.target.expressionName,
      },
    }));
    const next = archiveManifest
      ? hydrateArchiveProfile(archiveManifest, message.characterId, profile.characterName, settled.uploadedByPath)
      : mergeImportedAssets(profile, imported, profile.characterName).profile;
    if (archiveManifest) next.revision = profile.revision + 1;
    const saved = await repository.replaceProfile(userId, next);
    const views = await variantViewsForProfiles(userId, [saved]);
    send({
      type: "import-complete",
      requestId: message.requestId,
      profile: saved,
      variantViews: views,
      imported: imported.length,
      skipped,
      errors,
    }, userId);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Import failed.");
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
    if (image?.url) urls[entry.path] = image.url;
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
    send({ type: "saved", requestId: message.requestId, revision: saved.revision }, userId);
    await sendState(userId);
    return;
  }
  if (message.type === "save-profile") {
    const before = await repository.getProfile(
      userId,
      message.profile.characterId,
      message.profile.characterName,
    );
    const saved = await repository.saveProfile(userId, message.profile, message.expectedRevision);
    const retainedIds = new Set(allVariants(saved).map((variant) => variant.id));
    const removedImageIds = allVariants(before)
      .filter((variant) => !retainedIds.has(variant.id))
      .map((variant) => variant.imageId);
    if (removedImageIds.length && hasPermission("images")) {
      await deleteOwnedImagesIfUnreferenced(userId, removedImageIds);
    }
    send({ type: "saved", requestId: message.requestId, revision: saved.revision }, userId);
    send({ type: "profile", profile: saved, variantViews: await variantViewsForProfiles(userId, [saved]) }, userId);
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
    send({ type: "saved", requestId: message.requestId, revision: saved.revision }, userId);
    await sendState(userId);
    return;
  }
  if (message.type === "apply-manual") {
    const settings = await repository.getSettings(userId);
    const set = await profilesForChat(userId, message.chatId);
    const current = await repository.getTimeline(userId, message.chatId);
    const timeline = applyManualOverride(current, set.catalog, message.override, settings);
    await repository.saveTimeline(userId, timeline, current.revision);
    await sendState(userId);
    return;
  }
  if (message.type === "clear-manual") {
    const set = await profilesForChat(userId, message.chatId);
    const settings = await repository.getSettings(userId);
    const messages = await normalizedMessages(message.chatId);
    const current = await repository.getTimeline(userId, message.chatId);
    let timeline = clearManualOverride(current, message.characterId);
    timeline = await rebuildTimeline(timeline, set.catalog, settings, messages);
    await repository.saveTimeline(userId, timeline, current.revision);
    await sendState(userId);
    return;
  }
  if (message.type === "analyze-now") {
    scheduleAnalysis(userId, message.chatId, 0, true);
    return;
  }
  if (message.type === "import-assets") {
    await importAssets(userId, message);
    return;
  }
  if (message.type === "delete-variants") {
    if (!hasPermission("images")) throw new Error("Images permission is required to delete media.");
    const profile = await repository.getProfile(userId, message.characterId, await characterName(userId, message.characterId));
    const selected = new Set(message.variantIds);
    const variants = allVariants(profile).filter((variant) => selected.has(variant.id));
    const next = await repository.replaceProfile(userId, removeVariants(profile, selected));
    await deleteOwnedImagesIfUnreferenced(userId, variants.map((variant) => variant.imageId));
    send({ type: "profile", profile: next, variantViews: await variantViewsForProfiles(userId, [next]) }, userId);
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
    send({
      type: "diagnostics",
      requestId: message.requestId,
      report: {
        generatedAt: new Date().toISOString(),
        version: "1.0.0",
        permissions: permissions(),
        active: {
          hasChat: !!context?.chatId,
          hasCharacter: !!context?.characterId,
          queueDepth: context?.chatId ? queueDepth.get(queueKey(userId, context.chatId)) ?? 0 : 0,
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
        catalog: profile ? {
          characters: 1,
          outfits: profile.outfits.length,
          variants: allVariants(profile).length,
          issues: inspectProfile(profile),
        } : null,
        detector: lastDetection.get(userId) ?? null,
      },
    }, userId);
  }
}

spindle.onFrontendMessage(async (payload, userId) => {
  lastFrontendUserId = userId;
  const message = payload as FrontendToBackend;
  try {
    await handleMessage(message, userId);
  } catch (error) {
    if (error instanceof RevisionConflict) {
      send({
        type: "error",
        requestId: "requestId" in message ? message.requestId : undefined,
        code: "REVISION_CONFLICT",
        message: error.message,
        currentRevision: error.currentRevision,
      }, userId);
      await sendState(userId);
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
  generationUsers.set(generationId, { userId, chatId });
});

onEvent("GENERATION_ENDED", (payload, eventUserId) => {
  const generationId = readString(payload, ["generationId", "generation_id"]);
  const remembered = generationId ? generationUsers.get(generationId) : null;
  const chatId = extractChatId(payload) ?? remembered?.chatId ?? null;
  const userId = resolveUserId(chatId, eventUserId ?? remembered?.userId);
  if (generationId) generationUsers.delete(generationId);
  if (!chatId || !userId || readString(payload, ["error"]) || !readString(payload, ["messageId", "message_id"])) return;
  scheduleAnalysis(userId, chatId);
});

onEvent("GENERATION_STOPPED", (payload) => {
  const generationId = readString(payload, ["generationId", "generation_id"]);
  if (generationId) generationUsers.delete(generationId);
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
  activeContexts.set(userId, { chatId, characterId: previous?.characterId ?? null });
  if (chatId) chatUsers.set(chatId, userId);
  settleBackground(sendState(userId, chatId, previous?.characterId ?? null));
});

onEvent("CHAT_DELETED", (payload, eventUserId) => {
  const chatId = extractChatId(payload);
  const userId = resolveUserId(chatId, eventUserId);
  if (!chatId || !userId) return;
  settleBackground(repository.deleteTimeline(userId, chatId));
});

spindle.permissions.onChanged(() => {
  if (lastFrontendUserId) settleBackground(sendState(lastFrontendUserId));
});
