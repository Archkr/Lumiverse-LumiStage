import { cleanName, createId, normalizedKey } from "./ids";
import {
  DEFAULT_SETTINGS,
  SCHEMA_VERSION,
  type BatchMutationV2,
  type CharacterProfileV2,
  type CharacterStageStateV2,
  type ChatTimelineV2,
  type DetectionCharacterDecisionV2,
  type DetectionDecisionV2,
  type ExpressionSlotV2,
  type LumiStageSettingsV2,
  type ManualOverrideV2,
  type OutfitFolderV2,
  type StageSnapshotV2,
  type StageVariantV2,
} from "./types";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function finite(value: unknown, fallback: number, min: number, max: number): number {
  const number = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, number));
}

function integer(value: unknown, fallback: number, min = 0, max = 100_000): number {
  return Math.round(finite(value, fallback, min, max));
}

function optionalId(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function safeFileName(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const cleaned = value
    .normalize("NFKC")
    .replace(/[\\/:\0]/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || fallback;
}

export function defaultSettings(now = Date.now()): LumiStageSettingsV2 {
  return structuredClone({ ...DEFAULT_SETTINGS, updatedAt: now });
}

export function normalizeSettings(raw: unknown, now = Date.now()): LumiStageSettingsV2 {
  const source = record(raw);
  const detection = record(source.detection);
  const appearance = record(source.appearance);
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: integer(source.revision, 0),
    detection: {
      enabled: detection.enabled !== false,
      connectionId: optionalId(detection.connectionId),
      model: optionalId(detection.model),
      contextMessages: integer(detection.contextMessages, 5, 1, 20),
      temperature: finite(detection.temperature, 0.1, 0, 1),
      confidence: finite(detection.confidence ?? detection.stateConfidence, 0.6, 0, 1),
    },
    appearance: {
      transition: ["crossfade", "lift", "cut"].includes(String(appearance.transition))
        ? appearance.transition as LumiStageSettingsV2["appearance"]["transition"]
        : "crossfade",
      transitionMs: integer(appearance.transitionMs, 280, 0, 2000),
      opacity: finite(appearance.opacity, 1, 0.1, 1),
      focusedScale: finite(appearance.focusedScale, 1.035, 0.8, 1.3),
      idleOpacity: finite(appearance.idleOpacity, 0.46, 0.05, 1),
      showCaptions: appearance.showCaptions !== false,
      showChrome: appearance.showChrome !== false,
      ensembleOverlap: finite(appearance.ensembleOverlap, 0.34, 0, 0.8),
      width: integer(appearance.width, 320, 180, 1200),
      height: integer(appearance.height, 420, 220, 1000),
      x: finite(appearance.x, -1, -1, 100_000),
      y: finite(appearance.y, -1, -1, 100_000),
      fullscreen: appearance.fullscreen === true,
      visible: appearance.visible !== false,
    },
    preloadAdjacent: integer(source.preloadAdjacent, 3, 0, 12),
    updatedAt: typeof source.updatedAt === "number" ? source.updatedAt : now,
  };
}

export function createExpression(name = "Neutral"): ExpressionSlotV2 {
  return {
    id: createId("expression"),
    name: cleanName(name, "Neutral"),
    order: 0,
    variants: [],
  };
}

export function createOutfit(name = "Default"): OutfitFolderV2 {
  const expression = createExpression("Neutral");
  return {
    id: createId("outfit"),
    name: cleanName(name),
    order: 0,
    defaultExpressionId: expression.id,
    expressions: [expression],
  };
}

export function createProfile(characterId: string, characterName = "Character", now = Date.now()): CharacterProfileV2 {
  const outfit = createOutfit("Default");
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: 0,
    characterId,
    characterName: cleanName(characterName, "Character"),
    defaultOutfitId: outfit.id,
    outfits: [outfit],
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeVariant(value: unknown, index: number, now: number): StageVariantV2 | null {
  const raw = record(value);
  const imageId = optionalId(raw.imageId);
  const contentHash = optionalId(raw.contentHash);
  if (!imageId || !contentHash) return null;
  const mimeType = typeof raw.mimeType === "string" && /^(?:image|video)\//.test(raw.mimeType)
    ? raw.mimeType
    : "image/png";
  return {
    id: optionalId(raw.id) ?? createId("variant"),
    imageId,
    contentHash,
    fileName: safeFileName(raw.fileName, `variant-${index + 1}.png`),
    mimeType,
    mediaKind: mimeType.startsWith("video/") ? "video" : "image",
    order: integer(raw.order, index),
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : now,
  };
}

function normalizeExpression(value: unknown, index: number, now: number): ExpressionSlotV2 {
  const raw = record(value);
  const sourceVariants = list(raw.variants).length ? list(raw.variants) : list(raw.assets);
  const variants = sourceVariants
    .map((item, variantIndex) => normalizeVariant(item, variantIndex, now))
    .filter((item): item is StageVariantV2 => !!item)
    .sort((a, b) => a.order - b.order)
    .map((item, order) => ({ ...item, order }));
  return {
    id: optionalId(raw.id) ?? createId("expression"),
    name: cleanName(typeof raw.name === "string" ? raw.name : `Expression ${index + 1}`, `Expression ${index + 1}`),
    order: integer(raw.order, index),
    variants,
  };
}

function mergeVariants(target: ExpressionSlotV2, source: ExpressionSlotV2): void {
  const ids = new Set(target.variants.map((item) => item.id));
  const hashes = new Set(target.variants.map((item) => item.contentHash));
  for (const variant of source.variants) {
    if (ids.has(variant.id) || hashes.has(variant.contentHash)) continue;
    target.variants.push({ ...variant, order: target.variants.length });
    ids.add(variant.id);
    hashes.add(variant.contentHash);
  }
}

function normalizeOutfit(value: unknown, index: number, now: number, forcedName?: string): OutfitFolderV2 {
  const raw = record(value);
  const expressions: ExpressionSlotV2[] = [];
  for (const [expressionIndex, entry] of list(raw.expressions).entries()) {
    const expression = normalizeExpression(entry, expressionIndex, now);
    const existing = expressions.find((item) => normalizedKey(item.name) === normalizedKey(expression.name));
    if (existing) mergeVariants(existing, expression);
    else expressions.push({ ...expression, order: expressions.length });
  }
  if (!expressions.length) expressions.push(createExpression("Neutral"));
  const requestedDefault = optionalId(raw.defaultExpressionId);
  return {
    id: optionalId(raw.id) ?? createId("outfit"),
    name: cleanName(forcedName ?? (typeof raw.name === "string" ? raw.name : `Outfit ${index + 1}`)),
    order: integer(raw.order, index),
    defaultExpressionId: expressions.some((item) => item.id === requestedDefault)
      ? requestedDefault
      : expressions[0]?.id ?? null,
    expressions,
  };
}

interface LegacyProfileParts {
  outfits: unknown[];
  defaultOutfitId: string | null;
}

function legacyProfileParts(source: Record<string, unknown>): LegacyProfileParts {
  const modernOutfits = list(source.outfits);
  if (modernOutfits.length) {
    return { outfits: modernOutfits, defaultOutfitId: optionalId(source.defaultOutfitId) };
  }

  const legacyCharacters = list(source.actors).map(record);
  if (!legacyCharacters.length) return { outfits: [], defaultOutfitId: null };
  const selectedId = optionalId(source.defaultActorId);
  const selected = legacyCharacters.find((item) => optionalId(item.id) === selectedId) ?? legacyCharacters[0];
  const nameCounts = new Map<string, number>();
  for (const owner of legacyCharacters) {
    for (const outfit of list(owner.outfits).map(record)) {
      const key = normalizedKey(typeof outfit.name === "string" ? outfit.name : "Default");
      nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
    }
  }
  const outfits = legacyCharacters.flatMap((owner) => {
    const ownerName = cleanName(typeof owner.name === "string" ? owner.name : "Character", "Character");
    return list(owner.outfits).map((entry) => {
      const outfit = record(entry);
      const outfitName = cleanName(typeof outfit.name === "string" ? outfit.name : "Default");
      return nameCounts.get(normalizedKey(outfitName))! > 1
        ? { ...outfit, name: `${ownerName} / ${outfitName}` }
        : outfit;
    });
  });
  return {
    outfits,
    defaultOutfitId: optionalId(selected.defaultOutfitId),
  };
}

export function normalizeProfile(
  raw: unknown,
  characterId: string,
  characterName = "Character",
  now = Date.now(),
): CharacterProfileV2 {
  if (!raw || typeof raw !== "object") return createProfile(characterId, characterName, now);
  const source = record(raw);
  const parts = legacyProfileParts(source);
  const outfits = parts.outfits
    .map((item, index) => normalizeOutfit(item, index, now))
    .sort((a, b) => a.order - b.order)
    .map((item, order) => ({ ...item, order }));
  if (!outfits.length) outfits.push(createOutfit("Default"));
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: integer(source.revision, 0),
    characterId,
    characterName: cleanName(
      typeof source.characterName === "string" ? source.characterName : characterName,
      "Character",
    ),
    defaultOutfitId: outfits.some((item) => item.id === parts.defaultOutfitId)
      ? parts.defaultOutfitId
      : outfits[0]?.id ?? null,
    outfits,
    createdAt: typeof source.createdAt === "number" ? source.createdAt : now,
    updatedAt: typeof source.updatedAt === "number" ? source.updatedAt : now,
  };
}

export function emptySnapshot(chatId: string, now = Date.now()): StageSnapshotV2 {
  return {
    schemaVersion: SCHEMA_VERSION,
    chatId,
    revision: 0,
    characters: {},
    focusedCharacterIds: [],
    updatedAt: now,
  };
}

export function createTimeline(chatId: string, now = Date.now()): ChatTimelineV2 {
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
  profile: CharacterProfileV2;
}

export function buildCatalog(profiles: CharacterProfileV2[]): CatalogEntry[] {
  return profiles.map((profile) => ({ characterId: profile.characterId, profile }));
}

export function findVariant(profile: CharacterProfileV2, variantId: string): StageVariantV2 | null {
  for (const outfit of profile.outfits) {
    for (const expression of outfit.expressions) {
      const variant = expression.variants.find((item) => item.id === variantId);
      if (variant) return variant;
    }
  }
  return null;
}

export function allVariants(profile: CharacterProfileV2): StageVariantV2[] {
  return profile.outfits.flatMap((outfit) =>
    outfit.expressions.flatMap((expression) => expression.variants),
  );
}

export function allExpressions(profile: CharacterProfileV2): ExpressionSlotV2[] {
  return profile.outfits.flatMap((outfit) => outfit.expressions);
}

export function findCharacter(catalog: CatalogEntry[], characterId: string): CatalogEntry | null {
  return catalog.find((entry) => entry.characterId === characterId) ?? null;
}

function orderedOutfit(profile: CharacterProfileV2, id: string | null | undefined): OutfitFolderV2 | null {
  return profile.outfits.find((item) => item.id === id)
    ?? profile.outfits.find((item) => item.id === profile.defaultOutfitId)
    ?? [...profile.outfits].sort((a, b) => a.order - b.order)[0]
    ?? null;
}

function orderedExpression(outfit: OutfitFolderV2, id: string | null | undefined): ExpressionSlotV2 | null {
  return outfit.expressions.find((item) => item.id === id)
    ?? outfit.expressions.find((item) => item.id === outfit.defaultExpressionId)
    ?? [...outfit.expressions].sort((a, b) => a.order - b.order)[0]
    ?? null;
}

function orderedVariant(expression: ExpressionSlotV2, id: string | null | undefined): StageVariantV2 | null {
  return expression.variants.find((item) => item.id === id)
    ?? [...expression.variants].sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)[0]
    ?? null;
}

function validPrevious(profile: CharacterProfileV2, previous: CharacterStageStateV2 | null): {
  outfit: OutfitFolderV2;
  expression: ExpressionSlotV2;
  variant: StageVariantV2 | null;
} | null {
  if (!previous) return null;
  const outfit = profile.outfits.find((item) => item.id === previous.outfitId);
  const expression = outfit?.expressions.find((item) => item.id === previous.expressionId);
  if (!outfit || !expression) return null;
  return {
    outfit,
    expression,
    variant: orderedVariant(expression, previous.variantId),
  };
}

export function resolveCharacterState(
  entry: CatalogEntry,
  previous: CharacterStageStateV2 | null,
  decision: DetectionCharacterDecisionV2 | null,
  override: ManualOverrideV2 | null,
  settings: LumiStageSettingsV2,
  focused: boolean,
): CharacterStageStateV2 | null {
  const profile = entry.profile;
  const prior = validPrevious(profile, previous);
  const confident = !!decision && decision.confidence >= settings.detection.confidence;
  const fullLock = override?.lock === "state";
  const outfitLock = override?.lock === "outfit";
  let decisionApplied = false;

  let outfit = orderedOutfit(profile, override?.outfitId ?? prior?.outfit.id ?? profile.defaultOutfitId);
  let expression = outfit
    ? orderedExpression(outfit, override?.expressionId ?? prior?.expression.id)
    : null;
  let variant = expression
    ? orderedVariant(expression, override?.variantId ?? prior?.variant?.id)
    : null;

  if (confident && !fullLock) {
    const detectedOutfit = profile.outfits.find((item) => item.id === decision.outfitId);
    const permittedOutfit = outfitLock
      ? profile.outfits.find((item) => item.id === override.outfitId)
      : detectedOutfit;
    const detectedExpression = permittedOutfit?.expressions.find((item) => item.id === decision.expressionId);
    const detectedVariant = detectedExpression?.variants.find((item) => item.id === decision.variantId);
    if (permittedOutfit && detectedExpression && detectedVariant) {
      outfit = permittedOutfit;
      expression = detectedExpression;
      variant = detectedVariant;
      decisionApplied = true;
    }
  }

  if (fullLock && override) {
    outfit = orderedOutfit(profile, override.outfitId);
    expression = outfit ? orderedExpression(outfit, override.expressionId) : null;
    variant = expression ? orderedVariant(expression, override.variantId) : null;
  }

  if (!outfit || !expression) return null;
  variant ??= orderedVariant(expression, null);
  return {
    characterId: profile.characterId,
    outfitId: outfit.id,
    expressionId: expression.id,
    variantId: variant?.id ?? null,
    imageId: variant?.imageId ?? null,
    label: `${profile.characterName} · ${outfit.name} · ${expression.name}`,
    focused,
    confidence: decisionApplied ? decision!.confidence : previous?.confidence ?? 1,
  };
}

export function applyDecision(
  snapshot: StageSnapshotV2,
  catalog: CatalogEntry[],
  decision: DetectionDecisionV2,
  overrides: Record<string, ManualOverrideV2>,
  settings: LumiStageSettingsV2,
  now = Date.now(),
): StageSnapshotV2 {
  const characters: Record<string, CharacterStageStateV2> = { ...snapshot.characters };
  const focused = new Set(
    decision.focusedCharacterIds.filter((id) => !!findCharacter(catalog, id)),
  );
  for (const entry of catalog) {
    const item = decision.characters.find((candidate) => candidate.characterId === entry.characterId) ?? null;
    const state = resolveCharacterState(
      entry,
      characters[entry.characterId] ?? null,
      item,
      overrides[entry.characterId] ?? null,
      settings,
      focused.has(entry.characterId),
    );
    if (state) characters[entry.characterId] = state;
  }
  for (const characterId of Object.keys(characters)) {
    characters[characterId] = { ...characters[characterId], focused: focused.has(characterId) };
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    chatId: snapshot.chatId,
    revision: snapshot.revision + 1,
    characters,
    focusedCharacterIds: [...focused],
    updatedAt: now,
  };
}

export function applyManualOverride(
  timeline: ChatTimelineV2,
  catalog: CatalogEntry[],
  override: ManualOverrideV2,
  settings: LumiStageSettingsV2,
  now = Date.now(),
): ChatTimelineV2 {
  const manualOverrides = { ...timeline.manualOverrides, [override.characterId]: override };
  const focusIds = timeline.snapshot.focusedCharacterIds.length
    ? timeline.snapshot.focusedCharacterIds
    : [override.characterId];
  const decision: DetectionDecisionV2 = {
    schemaVersion: SCHEMA_VERSION,
    focusedCharacterIds: focusIds,
    characters: [],
  };
  return {
    ...timeline,
    revision: timeline.revision + 1,
    manualOverrides,
    snapshot: applyDecision(timeline.snapshot, catalog, decision, manualOverrides, settings, now),
    updatedAt: now,
  };
}

export function clearManualOverride(timeline: ChatTimelineV2, characterId: string, now = Date.now()): ChatTimelineV2 {
  const { [characterId]: _removed, ...manualOverrides } = timeline.manualOverrides;
  return { ...timeline, revision: timeline.revision + 1, manualOverrides, updatedAt: now };
}

export function consumeOnceOverrides(
  overrides: Record<string, ManualOverrideV2>,
): Record<string, ManualOverrideV2> {
  return Object.fromEntries(
    Object.entries(overrides).filter(([, override]) => override.scope !== "once"),
  );
}

function uniqueCopyName(outfit: OutfitFolderV2, base: string): string {
  const used = new Set(outfit.expressions.map((item) => normalizedKey(item.name)));
  if (!used.has(normalizedKey(`${base} copy`))) return `${base} copy`;
  let suffix = 2;
  while (used.has(normalizedKey(`${base} copy ${suffix}`))) suffix += 1;
  return `${base} copy ${suffix}`;
}

function cloneExpression(expression: ExpressionSlotV2, order: number): ExpressionSlotV2 {
  return {
    ...structuredClone(expression),
    id: createId("expression"),
    order,
    variants: expression.variants.map((variant, index) => ({
      ...variant,
      id: createId("variant"),
      order: index,
    })),
  };
}

function mergeExpressionInto(outfit: OutfitFolderV2, expression: ExpressionSlotV2): void {
  const match = outfit.expressions.find(
    (item) => normalizedKey(item.name) === normalizedKey(expression.name),
  );
  if (match) mergeVariants(match, expression);
  else outfit.expressions.push({ ...expression, order: outfit.expressions.length });
  outfit.defaultExpressionId ??= match?.id ?? expression.id;
}

function repairDefaults(profile: CharacterProfileV2): void {
  profile.outfits.forEach((outfit, outfitOrder) => {
    outfit.order = outfitOrder;
    outfit.expressions.forEach((expression, expressionOrder) => {
      expression.order = expressionOrder;
      expression.variants.forEach((variant, variantOrder) => {
        variant.order = variantOrder;
      });
    });
    if (!outfit.expressions.some((item) => item.id === outfit.defaultExpressionId)) {
      outfit.defaultExpressionId = outfit.expressions[0]?.id ?? null;
    }
  });
  if (!profile.outfits.some((item) => item.id === profile.defaultOutfitId)) {
    profile.defaultOutfitId = profile.outfits[0]?.id ?? null;
  }
}

export function applyBatchMutation(
  profile: CharacterProfileV2,
  mutation: BatchMutationV2,
  now = Date.now(),
): CharacterProfileV2 {
  const next = structuredClone(profile);
  const ids = new Set(mutation.expressionIds);
  if (mutation.type === "delete") {
    for (const outfit of next.outfits) {
      outfit.expressions = outfit.expressions.filter((item) => !ids.has(item.id));
    }
  } else {
    const destination = next.outfits.find((item) => item.id === mutation.outfitId);
    if (!destination) return profile;
    const selected = next.outfits.flatMap((outfit) =>
      outfit.expressions.filter((expression) => ids.has(expression.id)).map((expression) => ({
        sourceOutfitId: outfit.id,
        expression,
      })),
    );
    if (mutation.type === "move") {
      for (const outfit of next.outfits) {
        if (outfit.id === destination.id) continue;
        outfit.expressions = outfit.expressions.filter((item) => !ids.has(item.id));
      }
      for (const item of selected) {
        if (item.sourceOutfitId === destination.id) continue;
        mergeExpressionInto(destination, item.expression);
      }
    } else {
      for (const item of selected) {
        const clone = cloneExpression(item.expression, destination.expressions.length);
        if (item.sourceOutfitId === destination.id) {
          clone.name = uniqueCopyName(destination, item.expression.name);
          destination.expressions.push(clone);
        } else {
          mergeExpressionInto(destination, clone);
        }
      }
    }
  }
  repairDefaults(next);
  next.revision += 1;
  next.updatedAt = now;
  return next;
}

export interface CatalogIssue {
  severity: "info" | "warning" | "error";
  code: string;
  message: string;
}

export function inspectProfile(profile: CharacterProfileV2): CatalogIssue[] {
  const issues: CatalogIssue[] = [];
  if (!profile.outfits.length) {
    issues.push({ severity: "error", code: "no-outfits", message: `${profile.characterName} has no outfits.` });
  }
  for (const outfit of profile.outfits) {
    if (!outfit.expressions.length) {
      issues.push({ severity: "warning", code: "empty-outfit", message: `${outfit.name} has no expressions.` });
    }
    const names = outfit.expressions.map((item) => normalizedKey(item.name));
    if (new Set(names).size !== names.length) {
      issues.push({ severity: "warning", code: "duplicate-expression", message: `${outfit.name} contains duplicate expression names.` });
    }
    for (const expression of outfit.expressions) {
      if (!expression.variants.length) {
        issues.push({ severity: "info", code: "empty-expression", message: `${outfit.name} / ${expression.name} has no sprite variants.` });
      }
    }
  }
  return issues;
}
