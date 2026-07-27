import { cleanName, createId, normalizedKey } from "./ids";
import {
  DEFAULT_SETTINGS,
  SCHEMA_VERSION,
  type ActorProfile,
  type ActorStageState,
  type BatchMutation,
  type CharacterProfileV1,
  type ChatTimelineV1,
  type DetectionActorDecision,
  type DetectionDecisionV1,
  type ExpressionState,
  type LumiStageSettingsV1,
  type ManualOverride,
  type OutfitFolder,
  type StageAsset,
  type StageSnapshotV1,
} from "./types";

function finite(value: unknown, fallback: number, min: number, max: number): number {
  const number = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, number));
}

function strings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean))];
}

export function defaultSettings(now = Date.now()): LumiStageSettingsV1 {
  return structuredClone({ ...DEFAULT_SETTINGS, updatedAt: now });
}

export function normalizeSettings(raw: unknown, now = Date.now()): LumiStageSettingsV1 {
  const source = raw && typeof raw === "object" ? raw as Partial<LumiStageSettingsV1> : {};
  const detection = source.detection ?? DEFAULT_SETTINGS.detection;
  const appearance = source.appearance ?? DEFAULT_SETTINGS.appearance;
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: Math.max(0, Math.trunc(source.revision ?? 0)),
    detection: {
      enabled: detection.enabled !== false,
      connectionId: typeof detection.connectionId === "string" && detection.connectionId ? detection.connectionId : null,
      model: typeof detection.model === "string" && detection.model ? detection.model : null,
      contextMessages: Math.round(finite(detection.contextMessages, 5, 1, 20)),
      temperature: finite(detection.temperature, 0.1, 0, 1),
      stateConfidence: finite(detection.stateConfidence, 0.6, 0, 1),
      outfitConfidence: finite(detection.outfitConfidence, 0.85, 0, 1),
    },
    appearance: {
      transition: ["crossfade", "lift", "cut"].includes(appearance.transition) ? appearance.transition : "crossfade",
      transitionMs: Math.round(finite(appearance.transitionMs, 280, 0, 2000)),
      opacity: finite(appearance.opacity, 1, 0.1, 1),
      focusedScale: finite(appearance.focusedScale, 1.035, 0.8, 1.3),
      idleOpacity: finite(appearance.idleOpacity, 0.46, 0.05, 1),
      showCaptions: appearance.showCaptions !== false,
      showChrome: appearance.showChrome !== false,
      ensembleOverlap: finite(appearance.ensembleOverlap, 0.34, 0, 0.8),
      width: Math.round(finite(appearance.width, 320, 180, 1200)),
      height: Math.round(finite(appearance.height, 420, 220, 1000)),
      x: finite(appearance.x, -1, -1, 100000),
      y: finite(appearance.y, -1, -1, 100000),
      fullscreen: appearance.fullscreen === true,
      visible: appearance.visible !== false,
    },
    preloadAdjacent: Math.round(finite(source.preloadAdjacent, 3, 0, 12)),
    updatedAt: typeof source.updatedAt === "number" ? source.updatedAt : now,
  };
}

export function createExpression(name = "Neutral", now = Date.now()): ExpressionState {
  return {
    id: createId("expression"),
    name: cleanName(name, "Neutral"),
    aliases: [],
    cues: [],
    tags: [],
    enabled: true,
    priority: 0,
    order: 0,
    assets: [],
  };
}

export function createOutfit(name = "Default", now = Date.now()): OutfitFolder {
  const expression = createExpression("Neutral", now);
  return {
    id: createId("outfit"),
    name: cleanName(name),
    aliases: [],
    tags: [],
    enabled: true,
    priority: 0,
    order: 0,
    allowAutoSwitch: true,
    defaultExpressionId: expression.id,
    expressions: [expression],
  };
}

export function createActor(name: string, now = Date.now()): ActorProfile {
  const outfit = createOutfit("Default", now);
  return {
    id: createId("actor"),
    name: cleanName(name, "Actor"),
    aliases: [],
    enabled: true,
    order: 0,
    defaultOutfitId: outfit.id,
    outfits: [outfit],
  };
}

export function createProfile(characterId: string, characterName = "Character", now = Date.now()): CharacterProfileV1 {
  const actor = createActor(characterName, now);
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: 0,
    characterId,
    characterName: cleanName(characterName, "Character"),
    defaultActorId: actor.id,
    actors: [actor],
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeAsset(value: Partial<StageAsset>, index: number): StageAsset | null {
  if (!value.imageId || !value.contentHash) return null;
  const mimeType = typeof value.mimeType === "string" ? value.mimeType : "image/png";
  return {
    id: typeof value.id === "string" && value.id ? value.id : createId("asset"),
    imageId: value.imageId,
    contentHash: value.contentHash,
    fileName: cleanName(value.fileName ?? `asset-${index}`),
    mimeType,
    mediaKind: mimeType.startsWith("video/") ? "video" : "image",
    enabled: value.enabled !== false,
    priority: finite(value.priority, 0, -1000, 1000),
    createdAt: typeof value.createdAt === "number" ? value.createdAt : Date.now(),
  };
}

function normalizeExpression(raw: Partial<ExpressionState>, index: number): ExpressionState {
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : createId("expression"),
    name: cleanName(raw.name ?? `Expression ${index + 1}`, `Expression ${index + 1}`),
    aliases: strings(raw.aliases),
    cues: strings(raw.cues),
    tags: strings(raw.tags),
    enabled: raw.enabled !== false,
    priority: finite(raw.priority, 0, -1000, 1000),
    order: finite(raw.order, index, 0, 100000),
    assets: (raw.assets ?? []).map(normalizeAsset).filter((asset): asset is StageAsset => !!asset),
  };
}

interface LegacyPoseShape {
  id?: string;
  defaultExpressionId?: string | null;
  expressions?: Array<Partial<ExpressionState>>;
}

type OutfitInput = Partial<OutfitFolder> & {
  poses?: LegacyPoseShape[];
  defaultPoseId?: string | null;
};

function mergeExpression(target: ExpressionState, source: ExpressionState): void {
  target.aliases = [...new Set([...target.aliases, ...source.aliases])];
  target.cues = [...new Set([...target.cues, ...source.cues])];
  target.tags = [...new Set([...target.tags, ...source.tags])];
  const assetIds = new Set(target.assets.map((asset) => asset.id));
  const hashes = new Set(target.assets.map((asset) => asset.contentHash));
  target.assets.push(...source.assets.filter((asset) => !assetIds.has(asset.id) && !hashes.has(asset.contentHash)));
  target.enabled ||= source.enabled;
  target.priority = Math.max(target.priority, source.priority);
}

function normalizeOutfit(raw: OutfitInput, index: number): OutfitFolder {
  const legacyPoses = Array.isArray(raw.poses) ? raw.poses : [];
  const sourceExpressions = [
    ...(Array.isArray(raw.expressions) ? raw.expressions : []),
    ...legacyPoses.flatMap((pose) => Array.isArray(pose.expressions) ? pose.expressions : []),
  ];
  const expressions: ExpressionState[] = [];
  sourceExpressions.map(normalizeExpression).forEach((expression) => {
    const match = expressions.find((item) => normalizedKey(item.name) === normalizedKey(expression.name));
    if (match) mergeExpression(match, expression);
    else expressions.push({ ...expression, order: expressions.length });
  });
  if (expressions.length === 0) expressions.push(createExpression("Neutral"));
  const legacyDefault = legacyPoses.find((pose) => pose.id === raw.defaultPoseId)?.defaultExpressionId ?? null;
  const requestedDefault = raw.defaultExpressionId ?? legacyDefault;
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : createId("outfit"),
    name: cleanName(raw.name ?? `Outfit ${index + 1}`),
    aliases: strings(raw.aliases),
    tags: strings(raw.tags),
    enabled: raw.enabled !== false,
    priority: finite(raw.priority, 0, -1000, 1000),
    order: finite(raw.order, index, 0, 100000),
    allowAutoSwitch: raw.allowAutoSwitch !== false,
    defaultExpressionId: expressions.some((item) => item.id === requestedDefault) ? requestedDefault ?? null : expressions[0]?.id ?? null,
    expressions,
  };
}

function normalizeActor(raw: Partial<ActorProfile>, index: number): ActorProfile {
  const outfits = (raw.outfits ?? []).map(normalizeOutfit);
  if (outfits.length === 0) outfits.push(createOutfit("Default"));
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : createId("actor"),
    name: cleanName(raw.name ?? `Actor ${index + 1}`, `Actor ${index + 1}`),
    aliases: strings(raw.aliases),
    enabled: raw.enabled !== false,
    order: finite(raw.order, index, 0, 100000),
    defaultOutfitId: outfits.some((item) => item.id === raw.defaultOutfitId) ? raw.defaultOutfitId ?? null : outfits[0]?.id ?? null,
    outfits,
  };
}

export function normalizeProfile(raw: unknown, characterId: string, characterName = "Character", now = Date.now()): CharacterProfileV1 {
  if (!raw || typeof raw !== "object") return createProfile(characterId, characterName, now);
  const source = raw as Partial<CharacterProfileV1>;
  const actors = (source.actors ?? []).map(normalizeActor);
  if (actors.length === 0) actors.push(createActor(characterName, now));
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: Math.max(0, Math.trunc(source.revision ?? 0)),
    characterId,
    characterName: cleanName(source.characterName ?? characterName, "Character"),
    defaultActorId: actors.some((item) => item.id === source.defaultActorId) ? source.defaultActorId ?? null : actors[0]?.id ?? null,
    actors,
    createdAt: typeof source.createdAt === "number" ? source.createdAt : now,
    updatedAt: typeof source.updatedAt === "number" ? source.updatedAt : now,
  };
}

export function emptySnapshot(chatId: string, now = Date.now()): StageSnapshotV1 {
  return { schemaVersion: SCHEMA_VERSION, chatId, revision: 0, actors: {}, focusedActorIds: [], updatedAt: now };
}

export function createTimeline(chatId: string, now = Date.now()): ChatTimelineV1 {
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: 0,
    chatId,
    decisions: [],
    manualOverrides: {},
    layoutOverride: null,
    snapshot: emptySnapshot(chatId, now),
    updatedAt: now,
  };
}

export interface CatalogEntry {
  characterId: string;
  actor: ActorProfile;
  profile: CharacterProfileV1;
}

export function buildCatalog(profiles: CharacterProfileV1[]): CatalogEntry[] {
  return profiles.flatMap((profile) =>
    profile.actors.filter((actor) => actor.enabled).map((actor) => ({ characterId: profile.characterId, actor, profile })),
  );
}

export function findAsset(profile: CharacterProfileV1, assetId: string): StageAsset | null {
  for (const actor of profile.actors) for (const outfit of actor.outfits) {
    for (const expression of outfit.expressions) {
      const asset = expression.assets.find((item) => item.id === assetId);
      if (asset) return asset;
    }
  }
  return null;
}

export function allAssets(profile: CharacterProfileV1): StageAsset[] {
  return profile.actors.flatMap((actor) =>
    actor.outfits.flatMap((outfit) => outfit.expressions.flatMap((expression) => expression.assets)),
  );
}

export function allExpressions(profile: CharacterProfileV1): ExpressionState[] {
  return profile.actors.flatMap((actor) =>
    actor.outfits.flatMap((outfit) => outfit.expressions),
  );
}

export function findActor(catalog: CatalogEntry[], actorId: string): CatalogEntry | null {
  return catalog.find((entry) => entry.actor.id === actorId) ?? null;
}

function enabledOutfit(actor: ActorProfile, id: string | null | undefined): OutfitFolder | null {
  const requested = actor.outfits.find((item) => item.id === id && item.enabled);
  if (requested) return requested;
  return actor.outfits.find((item) => item.id === actor.defaultOutfitId && item.enabled)
    ?? actor.outfits.filter((item) => item.enabled).sort((a, b) => b.priority - a.priority || a.order - b.order)[0]
    ?? null;
}

function enabledExpression(outfit: OutfitFolder, id: string | null | undefined): ExpressionState | null {
  const requested = outfit.expressions.find((item) => item.id === id && item.enabled);
  if (requested) return requested;
  return outfit.expressions.find((item) => item.id === outfit.defaultExpressionId && item.enabled)
    ?? outfit.expressions.filter((item) => item.enabled).sort((a, b) => b.priority - a.priority || a.order - b.order)[0]
    ?? null;
}

function enabledAsset(expression: ExpressionState): StageAsset | null {
  return expression.assets.filter((item) => item.enabled).sort((a, b) => b.priority - a.priority || b.createdAt - a.createdAt)[0] ?? null;
}

export function resolveActorState(
  entry: CatalogEntry,
  previous: ActorStageState | null,
  decision: DetectionActorDecision | null,
  override: ManualOverride | null,
  settings: LumiStageSettingsV1,
  focused: boolean,
): ActorStageState | null {
  const actor = entry.actor;
  const currentOutfitId = override?.outfitId ?? previous?.outfitId ?? actor.defaultOutfitId;
  const mayChangeOutfit = !!decision
    && decision.confidence >= settings.detection.outfitConfidence
    && actor.outfits.some((item) => item.id === decision.outfitId && item.enabled && item.allowAutoSwitch);
  const outfitId = override?.outfitId ?? (mayChangeOutfit ? decision?.outfitId : currentOutfitId);
  const outfit = enabledOutfit(actor, outfitId);
  if (!outfit) return null;

  const stateConfident = !!decision && decision.confidence >= settings.detection.stateConfidence;
  const detectedExpressionId = stateConfident && outfit.expressions.some((item) => item.id === decision?.expressionId)
    ? decision?.expressionId
    : previous?.expressionId;
  const expressionId = override?.expressionId ?? detectedExpressionId;
  const expression = enabledExpression(outfit, expressionId);
  if (!expression) return null;
  const asset = enabledAsset(expression);

  return {
    actorId: actor.id,
    characterId: entry.characterId,
    outfitId: outfit.id,
    expressionId: expression.id,
    assetId: asset?.id ?? null,
    imageId: asset?.imageId ?? null,
    label: `${actor.name} · ${outfit.name} · ${expression.name}`,
    focused,
    confidence: decision?.confidence ?? previous?.confidence ?? 1,
  };
}

export function applyDecision(
  snapshot: StageSnapshotV1,
  catalog: CatalogEntry[],
  decision: DetectionDecisionV1,
  overrides: Record<string, ManualOverride>,
  settings: LumiStageSettingsV1,
  now = Date.now(),
): StageSnapshotV1 {
  const actors: Record<string, ActorStageState> = { ...snapshot.actors };
  const focused = new Set(decision.focusedActorIds.filter((id) => findActor(catalog, id)));
  for (const entry of catalog) {
    const item = decision.actors.find((candidate) => candidate.actorId === entry.actor.id) ?? null;
    const state = resolveActorState(
      entry,
      actors[entry.actor.id] ?? null,
      item,
      overrides[entry.actor.id] ?? null,
      settings,
      focused.has(entry.actor.id),
    );
    if (state) actors[entry.actor.id] = state;
  }
  for (const actorId of Object.keys(actors)) actors[actorId] = { ...actors[actorId], focused: focused.has(actorId) };
  return {
    schemaVersion: SCHEMA_VERSION,
    chatId: snapshot.chatId,
    revision: snapshot.revision + 1,
    actors,
    focusedActorIds: [...focused],
    updatedAt: now,
  };
}

export function applyManualOverride(
  timeline: ChatTimelineV1,
  catalog: CatalogEntry[],
  override: ManualOverride,
  settings: LumiStageSettingsV1,
  now = Date.now(),
): ChatTimelineV1 {
  const nextOverrides = { ...timeline.manualOverrides, [override.actorId]: override };
  const focusIds = timeline.snapshot.focusedActorIds.length ? timeline.snapshot.focusedActorIds : [override.actorId];
  const decision: DetectionDecisionV1 = {
    schemaVersion: SCHEMA_VERSION,
    focusedActorIds: focusIds,
    actors: [],
  };
  return {
    ...timeline,
    revision: timeline.revision + 1,
    manualOverrides: nextOverrides,
    snapshot: applyDecision(timeline.snapshot, catalog, decision, nextOverrides, settings, now),
    updatedAt: now,
  };
}

export function clearManualOverride(timeline: ChatTimelineV1, actorId: string, now = Date.now()): ChatTimelineV1 {
  const { [actorId]: _removed, ...manualOverrides } = timeline.manualOverrides;
  return { ...timeline, revision: timeline.revision + 1, manualOverrides, updatedAt: now };
}

export function consumeOnceOverrides(overrides: Record<string, ManualOverride>): Record<string, ManualOverride> {
  return Object.fromEntries(Object.entries(overrides).filter(([, override]) => override.scope !== "once"));
}

function mutateExpressions(
  profile: CharacterProfileV1,
  ids: Set<string>,
  mutate: (expression: ExpressionState) => ExpressionState,
): CharacterProfileV1 {
  return {
    ...profile,
    actors: profile.actors.map((actor) => ({
      ...actor,
      outfits: actor.outfits.map((outfit) => ({
        ...outfit,
        expressions: outfit.expressions.map((expression) => ids.has(expression.id) ? mutate(expression) : expression),
      })),
    })),
  };
}

export function applyBatchMutation(profile: CharacterProfileV1, mutation: BatchMutation, now = Date.now()): CharacterProfileV1 {
  let next = structuredClone(profile);
  if (mutation.type === "set-enabled" || mutation.type === "set-priority" || mutation.type === "delete") {
    const ids = new Set(mutation.assetIds);
    for (const actor of next.actors) for (const outfit of actor.outfits) {
      for (const expression of outfit.expressions) {
        if (mutation.type === "delete") expression.assets = expression.assets.filter((asset) => !ids.has(asset.id));
        else expression.assets = expression.assets.map((asset) => {
          if (!ids.has(asset.id)) return asset;
          return mutation.type === "set-enabled"
            ? { ...asset, enabled: mutation.enabled }
            : { ...asset, priority: mutation.priority };
        });
      }
    }
  } else if (mutation.type === "add-tags" || mutation.type === "add-aliases") {
    const ids = new Set(mutation.expressionIds);
    next = mutateExpressions(next, ids, (expression) => mutation.type === "add-tags"
      ? {
        ...expression,
        tags: [...new Set([...expression.tags, ...mutation.tags.map((tag) => tag.trim()).filter(Boolean)])],
      }
      : {
        ...expression,
        aliases: [...new Set([...expression.aliases, ...mutation.aliases.map((alias) => alias.trim()).filter(Boolean)])],
      });
  } else if (mutation.type === "rename") {
    const ids = new Set(mutation.expressionIds);
    if (!mutation.find) return profile;
    next = mutateExpressions(next, ids, (expression) => ({
      ...expression,
      name: cleanName(expression.name.split(mutation.find).join(mutation.replace), expression.name),
    }));
  } else if (mutation.type === "move") {
    const assetIds = new Set(mutation.assetIds);
    const moving: Array<{ expression: ExpressionState; assets: StageAsset[] }> = [];
    for (const expression of allExpressions(next)) {
      const assets = expression.assets.filter((asset) => assetIds.has(asset.id));
      if (assets.length) moving.push({ expression, assets });
    }
    for (const expression of allExpressions(next)) {
      expression.assets = expression.assets.filter((asset) => !assetIds.has(asset.id));
    }
    for (const actor of next.actors) {
      const outfit = actor.outfits.find((item) => item.id === mutation.outfitId);
      if (outfit) {
        for (const item of moving) {
          const match = outfit.expressions.find((expression) => normalizedKey(expression.name) === normalizedKey(item.expression.name));
          if (match) match.assets.push(...item.assets);
          else outfit.expressions.push({
            ...structuredClone(item.expression),
            id: createId("expression"),
            assets: item.assets,
            order: outfit.expressions.length,
          });
        }
      }
    }
  } else if (mutation.type === "duplicate") {
    const ids = new Set(mutation.assetIds);
    for (const expression of allExpressions(next)) {
      const copies = expression.assets.filter((asset) => ids.has(asset.id)).map((asset) => ({
        ...asset,
        id: createId("asset"),
        fileName: asset.fileName.replace(/(\.[^.]+)?$/, " copy$1"),
        createdAt: now,
      }));
      expression.assets.push(...copies);
    }
  }
  next.revision += 1;
  next.updatedAt = now;
  return next;
}

export interface IntegrityIssue {
  severity: "info" | "warning" | "error";
  code: string;
  message: string;
}

export function inspectProfile(profile: CharacterProfileV1): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  const hashes = new Map<string, number>();
  for (const actor of profile.actors) {
    if (!actor.outfits.some((item) => item.enabled)) issues.push({ severity: "error", code: "actor-no-outfit", message: `${actor.name} has no enabled outfit.` });
    const aliases = actor.aliases.map(normalizedKey);
    if (new Set(aliases).size !== aliases.length) issues.push({ severity: "warning", code: "duplicate-alias", message: `${actor.name} contains duplicate aliases.` });
    for (const outfit of actor.outfits) for (const expression of outfit.expressions) {
      if (expression.assets.length === 0) issues.push({ severity: "info", code: "empty-expression", message: `${actor.name} / ${outfit.name} / ${expression.name} has no media.` });
      for (const asset of expression.assets) hashes.set(asset.contentHash, (hashes.get(asset.contentHash) ?? 0) + 1);
    }
  }
  for (const [hash, count] of hashes) if (count > 1) {
    issues.push({ severity: "warning", code: "duplicate-content", message: `${count} media references share hash ${hash.slice(0, 10)}…` });
  }
  return issues;
}
