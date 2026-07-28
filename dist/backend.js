// src/ids.ts
function createId(prefix) {
  const uuid = globalThis.crypto?.randomUUID?.();
  if (uuid) return `${prefix}_${uuid}`;
  const bytes = new Uint8Array(16);
  globalThis.crypto?.getRandomValues?.(bytes);
  const fallback = Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
  return `${prefix}_${fallback || `${Date.now()}_${Math.random().toString(36).slice(2)}`}`;
}
async function sha256(data) {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : data;
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}
function cleanName(value, fallback = "Default") {
  const cleaned = value.normalize("NFKC").replace(/\.[a-z0-9]{2,5}$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned || fallback;
}
function normalizedKey(value) {
  return cleanName(value, "").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

// src/types.ts
var SCHEMA_VERSION = 2;
var LUMI_STAGE_ID = "lumi_stage";
var DEFAULT_SETTINGS = {
  schemaVersion: SCHEMA_VERSION,
  revision: 0,
  detection: {
    enabled: true,
    connectionId: null,
    model: null,
    contextMessages: 5,
    temperature: 0.1,
    confidence: 0.6
  },
  appearance: {
    transition: "crossfade",
    transitionMs: 280,
    opacity: 1,
    focusedScale: 1.035,
    idleOpacity: 0.46,
    showCaptions: true,
    showChrome: true,
    ensembleOverlap: 0.34,
    width: 320,
    height: 420,
    x: -1,
    y: -1,
    fullscreen: false,
    visible: true
  },
  preloadAdjacent: 3,
  updatedAt: 0
};

// src/model.ts
function record(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function list(value) {
  return Array.isArray(value) ? value : [];
}
function finite(value, fallback, min, max2) {
  const number = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max2, Math.max(min, number));
}
function integer(value, fallback, min = 0, max2 = 1e5) {
  return Math.round(finite(value, fallback, min, max2));
}
function optionalId(value) {
  return typeof value === "string" && value.trim() ? value : null;
}
function safeFileName(value, fallback) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.normalize("NFKC").replace(/[\\/:\0]/g, "-").replace(/\s+/g, " ").trim();
  return cleaned || fallback;
}
function defaultSettings(now = Date.now()) {
  return structuredClone({ ...DEFAULT_SETTINGS, updatedAt: now });
}
function normalizeSettings(raw, now = Date.now()) {
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
      confidence: finite(detection.confidence ?? detection.stateConfidence, 0.6, 0, 1)
    },
    appearance: {
      transition: ["crossfade", "lift", "cut"].includes(String(appearance.transition)) ? appearance.transition : "crossfade",
      transitionMs: integer(appearance.transitionMs, 280, 0, 2e3),
      opacity: finite(appearance.opacity, 1, 0.1, 1),
      focusedScale: finite(appearance.focusedScale, 1.035, 0.8, 1.3),
      idleOpacity: finite(appearance.idleOpacity, 0.46, 0.05, 1),
      showCaptions: appearance.showCaptions !== false,
      showChrome: appearance.showChrome !== false,
      ensembleOverlap: finite(appearance.ensembleOverlap, 0.34, 0, 0.8),
      width: integer(appearance.width, 320, 180, 1200),
      height: integer(appearance.height, 420, 220, 1e3),
      x: finite(appearance.x, -1, -1, 1e5),
      y: finite(appearance.y, -1, -1, 1e5),
      fullscreen: appearance.fullscreen === true,
      visible: appearance.visible !== false
    },
    preloadAdjacent: integer(source.preloadAdjacent, 3, 0, 12),
    updatedAt: typeof source.updatedAt === "number" ? source.updatedAt : now
  };
}
function createExpression(name = "Neutral") {
  return {
    id: createId("expression"),
    name: cleanName(name, "Neutral"),
    order: 0,
    variants: []
  };
}
function createOutfit(name = "Default") {
  const expression = createExpression("Neutral");
  return {
    id: createId("outfit"),
    name: cleanName(name),
    order: 0,
    defaultExpressionId: expression.id,
    expressions: [expression]
  };
}
function createProfile(characterId, characterName2 = "Character", now = Date.now()) {
  const outfit = createOutfit("Default");
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: 0,
    characterId,
    characterName: cleanName(characterName2, "Character"),
    defaultOutfitId: outfit.id,
    outfits: [outfit],
    createdAt: now,
    updatedAt: now
  };
}
function normalizeVariant(value, index, now) {
  const raw = record(value);
  const imageId = optionalId(raw.imageId);
  const contentHash = optionalId(raw.contentHash);
  if (!imageId || !contentHash) return null;
  const mimeType = typeof raw.mimeType === "string" && /^(?:image|video)\//.test(raw.mimeType) ? raw.mimeType : "image/png";
  return {
    id: optionalId(raw.id) ?? createId("variant"),
    imageId,
    contentHash,
    fileName: safeFileName(raw.fileName, `variant-${index + 1}.png`),
    mimeType,
    mediaKind: mimeType.startsWith("video/") ? "video" : "image",
    order: integer(raw.order, index),
    createdAt: typeof raw.createdAt === "number" ? raw.createdAt : now
  };
}
function normalizeExpression(value, index, now) {
  const raw = record(value);
  const sourceVariants = list(raw.variants).length ? list(raw.variants) : list(raw.assets);
  const variants = sourceVariants.map((item, variantIndex) => normalizeVariant(item, variantIndex, now)).filter((item) => !!item).sort((a, b) => a.order - b.order).map((item, order) => ({ ...item, order }));
  return {
    id: optionalId(raw.id) ?? createId("expression"),
    name: cleanName(typeof raw.name === "string" ? raw.name : `Expression ${index + 1}`, `Expression ${index + 1}`),
    order: integer(raw.order, index),
    variants
  };
}
function normalizeOutfit(value, index, now, forcedName) {
  const raw = record(value);
  const expressions = list(raw.expressions).map((entry, expressionIndex) => normalizeExpression(entry, expressionIndex, now));
  if (!expressions.length) expressions.push(createExpression("Neutral"));
  const requestedDefault = optionalId(raw.defaultExpressionId);
  return {
    id: optionalId(raw.id) ?? createId("outfit"),
    name: cleanName(forcedName ?? (typeof raw.name === "string" ? raw.name : `Outfit ${index + 1}`)),
    order: integer(raw.order, index),
    defaultExpressionId: expressions.some((item) => item.id === requestedDefault) ? requestedDefault : expressions[0]?.id ?? null,
    expressions
  };
}
function legacyProfileParts(source) {
  const modernOutfits = list(source.outfits);
  if (modernOutfits.length) {
    return { outfits: modernOutfits, defaultOutfitId: optionalId(source.defaultOutfitId) };
  }
  const legacyCharacters = list(source.actors).map(record);
  if (!legacyCharacters.length) return { outfits: [], defaultOutfitId: null };
  const selectedId = optionalId(source.defaultActorId);
  const selected = legacyCharacters.find((item) => optionalId(item.id) === selectedId) ?? legacyCharacters[0];
  const nameCounts = /* @__PURE__ */ new Map();
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
      return nameCounts.get(normalizedKey(outfitName)) > 1 ? { ...outfit, name: `${ownerName} / ${outfitName}` } : outfit;
    });
  });
  return {
    outfits,
    defaultOutfitId: optionalId(selected.defaultOutfitId)
  };
}
function normalizeProfile(raw, characterId, characterName2 = "Character", now = Date.now()) {
  if (!raw || typeof raw !== "object") return createProfile(characterId, characterName2, now);
  const source = record(raw);
  const parts = legacyProfileParts(source);
  const outfits = parts.outfits.map((item, index) => normalizeOutfit(item, index, now)).sort((a, b) => a.order - b.order).map((item, order) => ({ ...item, order }));
  if (!outfits.length) outfits.push(createOutfit("Default"));
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: integer(source.revision, 0),
    characterId,
    characterName: cleanName(
      typeof source.characterName === "string" ? source.characterName : characterName2,
      "Character"
    ),
    defaultOutfitId: outfits.some((item) => item.id === parts.defaultOutfitId) ? parts.defaultOutfitId : outfits[0]?.id ?? null,
    outfits,
    createdAt: typeof source.createdAt === "number" ? source.createdAt : now,
    updatedAt: typeof source.updatedAt === "number" ? source.updatedAt : now
  };
}
function emptySnapshot(chatId, now = Date.now()) {
  return {
    schemaVersion: SCHEMA_VERSION,
    chatId,
    revision: 0,
    characters: {},
    focusedCharacterIds: [],
    updatedAt: now
  };
}
function createTimeline(chatId, now = Date.now()) {
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: 0,
    chatId,
    decisions: [],
    manualOverrides: {},
    layoutOverride: null,
    snapshot: emptySnapshot(chatId, now),
    updatedAt: now
  };
}
function buildCatalog(profiles) {
  return profiles.map((profile) => ({ characterId: profile.characterId, profile }));
}
function allVariants(profile) {
  return profile.outfits.flatMap(
    (outfit) => outfit.expressions.flatMap((expression) => expression.variants)
  );
}
function findCharacter(catalog, characterId) {
  return catalog.find((entry) => entry.characterId === characterId) ?? null;
}
function orderedOutfit(profile, id) {
  return profile.outfits.find((item) => item.id === id) ?? profile.outfits.find((item) => item.id === profile.defaultOutfitId) ?? [...profile.outfits].sort((a, b) => a.order - b.order)[0] ?? null;
}
function orderedExpression(outfit, id) {
  return outfit.expressions.find((item) => item.id === id) ?? outfit.expressions.find((item) => item.id === outfit.defaultExpressionId) ?? [...outfit.expressions].sort((a, b) => a.order - b.order)[0] ?? null;
}
function orderedVariant(expression, id) {
  return expression.variants.find((item) => item.id === id) ?? [...expression.variants].sort((a, b) => a.order - b.order || a.createdAt - b.createdAt)[0] ?? null;
}
function validPrevious(profile, previous) {
  if (!previous) return null;
  const outfit = profile.outfits.find((item) => item.id === previous.outfitId);
  const expression = outfit?.expressions.find((item) => item.id === previous.expressionId);
  if (!outfit || !expression) return null;
  return {
    outfit,
    expression,
    variant: orderedVariant(expression, previous.variantId)
  };
}
function resolveCharacterState(entry, previous, decision, override, settings, focused) {
  const profile = entry.profile;
  const prior = validPrevious(profile, previous);
  const confident = !!decision && decision.confidence >= settings.detection.confidence;
  const fullLock = override?.lock === "state";
  const outfitLock = override?.lock === "outfit";
  let decisionApplied = false;
  let outfit = orderedOutfit(profile, override?.outfitId ?? prior?.outfit.id ?? profile.defaultOutfitId);
  const priorInOutfit = prior?.outfit.id === outfit?.id ? prior : null;
  let expression = outfit ? orderedExpression(outfit, fullLock ? override?.expressionId : priorInOutfit?.expression.id) : null;
  let variant = expression ? orderedVariant(
    expression,
    fullLock ? override?.variantId : priorInOutfit?.expression.id === expression.id ? priorInOutfit.variant?.id : null
  ) : null;
  if (confident && !fullLock) {
    const detectedOutfit = profile.outfits.find((item) => item.id === decision.outfitId);
    const permittedOutfit = outfitLock ? profile.outfits.find((item) => item.id === override.outfitId) : detectedOutfit;
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
    label: `${profile.characterName} \xB7 ${outfit.name} \xB7 ${expression.name}`,
    focused,
    confidence: decisionApplied ? decision.confidence : previous?.confidence ?? 1
  };
}
function applyDecision(snapshot, catalog, decision, overrides, settings, now = Date.now()) {
  const catalogIds = new Set(catalog.map((entry) => entry.characterId));
  const priorCharacters = Object.fromEntries(
    Object.entries(snapshot.characters).filter(([characterId]) => catalogIds.has(characterId))
  );
  const priorFocus = snapshot.focusedCharacterIds.filter((characterId) => catalogIds.has(characterId));
  const detectorDecision = decision.characters.length > 0;
  if (detectorDecision && decision.characters.some((item) => item.confidence < settings.detection.confidence)) {
    if (Object.keys(priorCharacters).length === Object.keys(snapshot.characters).length && priorFocus.length === snapshot.focusedCharacterIds.length) return snapshot;
    return {
      ...snapshot,
      characters: priorCharacters,
      focusedCharacterIds: priorFocus
    };
  }
  const characters = { ...priorCharacters };
  const focused = new Set(
    (detectorDecision ? decision.focusedCharacterIds : priorFocus).filter((id) => catalogIds.has(id))
  );
  const selectedIds = /* @__PURE__ */ new Set([
    ...Object.keys(priorCharacters),
    ...decision.characters.map((item) => item.characterId),
    ...Object.keys(overrides)
  ]);
  for (const entry of catalog.filter((candidate) => selectedIds.has(candidate.characterId))) {
    const item = decision.characters.find((candidate) => candidate.characterId === entry.characterId) ?? null;
    const state = resolveCharacterState(
      entry,
      characters[entry.characterId] ?? null,
      item,
      overrides[entry.characterId] ?? null,
      settings,
      focused.has(entry.characterId)
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
    updatedAt: now
  };
}
function isValidManualOverride(catalog, override) {
  const profile = findCharacter(catalog, override.characterId)?.profile;
  const outfit = profile?.outfits.find((item) => item.id === override.outfitId);
  if (!profile || !outfit) return false;
  if (override.lock === "outfit") {
    if (override.expressionId == null && override.variantId == null) return true;
    const expression2 = outfit.expressions.find((item) => item.id === override.expressionId);
    return !!expression2 && (override.variantId == null || expression2.variants.some((variant) => variant.id === override.variantId));
  }
  const expression = outfit.expressions.find((item) => item.id === override.expressionId);
  return !!expression && (override.variantId == null || expression.variants.some((variant) => variant.id === override.variantId));
}
function applyManualOverride(timeline, catalog, override, settings, now = Date.now()) {
  const existing = timeline.manualOverrides[override.characterId];
  const retainExistingOutfitLock = existing?.scope === "locked" && existing.lock === "outfit" && existing.outfitId === override.outfitId && override.scope === "once" && override.lock === "state";
  const persistentOverride = retainExistingOutfitLock ? existing : override;
  const storedOverride = persistentOverride.lock === "outfit" ? {
    characterId: persistentOverride.characterId,
    outfitId: persistentOverride.outfitId,
    scope: persistentOverride.scope,
    lock: persistentOverride.lock,
    createdAt: persistentOverride.createdAt
  } : persistentOverride;
  const manualOverrides = {
    ...timeline.manualOverrides,
    [override.characterId]: storedOverride
  };
  const focusIds = timeline.snapshot.focusedCharacterIds.length ? timeline.snapshot.focusedCharacterIds : [override.characterId];
  const profile = findCharacter(catalog, override.characterId)?.profile;
  const selectedOutfit = profile?.outfits.find((item) => item.id === override.outfitId);
  const selectedExpression = selectedOutfit?.expressions.find(
    (item) => item.id === override.expressionId
  );
  const selectedVariant = selectedExpression ? orderedVariant(selectedExpression, override.variantId) : null;
  const selectedState = selectedOutfit && selectedExpression && selectedVariant ? [{
    characterId: override.characterId,
    outfitId: selectedOutfit.id,
    expressionId: selectedExpression.id,
    variantId: selectedVariant.id,
    confidence: 1
  }] : [];
  const decision = {
    schemaVersion: SCHEMA_VERSION,
    focusedCharacterIds: focusIds,
    characters: selectedState
  };
  return {
    ...timeline,
    revision: timeline.revision + 1,
    manualOverrides,
    snapshot: applyDecision(timeline.snapshot, catalog, decision, manualOverrides, settings, now),
    updatedAt: now
  };
}
function clearManualOverride(timeline, characterId, now = Date.now()) {
  const { [characterId]: _removed, ...manualOverrides } = timeline.manualOverrides;
  return { ...timeline, revision: timeline.revision + 1, manualOverrides, updatedAt: now };
}
function consumeOnceOverrides(overrides) {
  return Object.fromEntries(
    Object.entries(overrides).filter(([, override]) => override.scope !== "once")
  );
}
function inspectProfile(profile) {
  const issues = [];
  const ids = /* @__PURE__ */ new Set();
  const recordId = (id, label) => {
    if (!id.trim()) issues.push({ severity: "error", code: "blank-id", message: `${label} has a blank ID.` });
    else if (ids.has(id)) issues.push({ severity: "error", code: "duplicate-id", message: `${label} repeats ID ${id}.` });
    else ids.add(id);
  };
  recordId(profile.characterId, profile.characterName || "Character");
  if (!profile.outfits.length) {
    issues.push({ severity: "error", code: "no-outfits", message: `${profile.characterName} has no outfits.` });
  }
  const outfitNames = profile.outfits.map((outfit) => normalizedKey(outfit.name));
  if (outfitNames.some((name) => !name)) {
    issues.push({ severity: "error", code: "blank-outfit", message: "Every outfit needs a name." });
  }
  if (new Set(outfitNames).size !== outfitNames.length) {
    issues.push({ severity: "error", code: "duplicate-outfit", message: "Outfit names must be unique." });
  }
  if (profile.defaultOutfitId && !profile.outfits.some((outfit) => outfit.id === profile.defaultOutfitId)) {
    issues.push({ severity: "error", code: "invalid-default-outfit", message: "The default outfit no longer exists." });
  }
  for (const outfit of profile.outfits) {
    recordId(outfit.id, `Outfit ${outfit.name || "(unnamed)"}`);
    if (!outfit.expressions.length) {
      issues.push({ severity: "warning", code: "empty-outfit", message: `${outfit.name} has no expressions.` });
    }
    const names = outfit.expressions.map((item) => normalizedKey(item.name));
    if (names.some((name) => !name)) {
      issues.push({ severity: "error", code: "blank-expression", message: `${outfit.name} contains an expression without a name.` });
    }
    if (new Set(names).size !== names.length) {
      issues.push({ severity: "error", code: "duplicate-expression", message: `${outfit.name} contains duplicate expression names.` });
    }
    if (outfit.defaultExpressionId && !outfit.expressions.some((expression) => expression.id === outfit.defaultExpressionId)) {
      issues.push({ severity: "error", code: "invalid-default-expression", message: `${outfit.name} has an invalid default expression.` });
    }
    for (const expression of outfit.expressions) {
      recordId(expression.id, `Expression ${outfit.name} / ${expression.name || "(unnamed)"}`);
      if (!expression.variants.length) {
        issues.push({ severity: "info", code: "empty-expression", message: `${outfit.name} / ${expression.name} has no sprite variants.` });
      }
      for (const variant of expression.variants) {
        recordId(variant.id, `Variant ${variant.fileName || "(unnamed)"}`);
        if (!variant.imageId || !variant.contentHash) {
          issues.push({ severity: "error", code: "invalid-media-reference", message: `${variant.fileName || variant.id} has an invalid media reference.` });
        }
      }
    }
  }
  return issues;
}

// node_modules/fflate/esm/index.mjs
import { createRequire } from "module";
var require2 = createRequire("/");
var _a;
var Worker;
var isMarkedAsUntransferable;
var workerAdd = ";var __w=require('worker_threads');__w.parentPort.on('message',function(m){onmessage({data:m})}),postMessage=function(m,t){__w.parentPort.postMessage(m,t)},close=process.exit;self=global";
try {
  _a = require2("worker_threads"), Worker = _a.Worker, isMarkedAsUntransferable = _a.isMarkedAsUntransferable;
} catch (e) {
}
var wk = Worker ? function(c, _, msg, transfer, cb) {
  var done = false;
  var w = new Worker(c + workerAdd, { eval: true }).on("error", function(e) {
    return cb(e, null);
  }).on("message", function(m) {
    return cb(null, m);
  }).on("exit", function(c2) {
    if (c2 && !done)
      cb(new Error("exited with code " + c2), null);
  });
  if (isMarkedAsUntransferable)
    transfer = transfer.filter(function(t) {
      return !isMarkedAsUntransferable(t);
    });
  w.postMessage(msg, transfer);
  w.terminate = function() {
    done = true;
    return Worker.prototype.terminate.call(w);
  };
  return w;
} : function(_, __, ___, ____, cb) {
  setImmediate(function() {
    return cb(new Error("async operations unsupported - update to Node 12+ (or Node 10-11 with the --experimental-worker CLI flag)"), null);
  });
  var NOP = function() {
  };
  return {
    terminate: NOP,
    postMessage: NOP
  };
};
var u8 = Uint8Array;
var u16 = Uint16Array;
var i32 = Int32Array;
var fleb = new u8([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]);
var fdeb = new u8([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]);
var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
var freb = function(eb, start) {
  var b = new u16(31);
  for (var i = 0; i < 31; ++i) {
    b[i] = start += 1 << eb[i - 1];
  }
  var r = new i32(b[30]);
  for (var i = 1; i < 30; ++i) {
    for (var j = b[i]; j < b[i + 1]; ++j) {
      r[j] = j - b[i] << 5 | i;
    }
  }
  return { b, r };
};
var _a = freb(fleb, 2);
var fl = _a.b;
var revfl = _a.r;
fl[28] = 258, revfl[258] = 28;
var _b = freb(fdeb, 0);
var fd = _b.b;
var revfd = _b.r;
var rev = new u16(32768);
for (i = 0; i < 32768; ++i) {
  x = (i & 43690) >> 1 | (i & 21845) << 1;
  x = (x & 52428) >> 2 | (x & 13107) << 2;
  x = (x & 61680) >> 4 | (x & 3855) << 4;
  rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
}
var x;
var i;
var hMap = (function(cd, mb, r) {
  var s = cd.length;
  var i = 0;
  var l = new u16(mb);
  for (; i < s; ++i) {
    if (cd[i])
      ++l[cd[i] - 1];
  }
  var le = new u16(mb);
  for (i = 1; i < mb; ++i) {
    le[i] = le[i - 1] + l[i - 1] << 1;
  }
  var co;
  if (r) {
    co = new u16(1 << mb);
    var rvb = 15 - mb;
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        var sv = i << 4 | cd[i];
        var r_1 = mb - cd[i];
        var v = le[cd[i] - 1]++ << r_1;
        for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
          co[rev[v] >> rvb] = sv;
        }
      }
    }
  } else {
    co = new u16(s);
    for (i = 0; i < s; ++i) {
      if (cd[i]) {
        co[i] = rev[le[cd[i] - 1]++] >> 15 - cd[i];
      }
    }
  }
  return co;
});
var flt = new u8(288);
for (i = 0; i < 144; ++i)
  flt[i] = 8;
var i;
for (i = 144; i < 256; ++i)
  flt[i] = 9;
var i;
for (i = 256; i < 280; ++i)
  flt[i] = 7;
var i;
for (i = 280; i < 288; ++i)
  flt[i] = 8;
var i;
var fdt = new u8(32);
for (i = 0; i < 32; ++i)
  fdt[i] = 5;
var i;
var flrm = /* @__PURE__ */ hMap(flt, 9, 1);
var fdrm = /* @__PURE__ */ hMap(fdt, 5, 1);
var max = function(a) {
  var m = a[0];
  for (var i = 1; i < a.length; ++i) {
    if (a[i] > m)
      m = a[i];
  }
  return m;
};
var bits = function(d, p, m) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8) >> (p & 7) & m;
};
var bits16 = function(d, p) {
  var o = p / 8 | 0;
  return (d[o] | d[o + 1] << 8 | d[o + 2] << 16) >> (p & 7);
};
var shft = function(p) {
  return (p + 7) / 8 | 0;
};
var slc = function(v, s, e) {
  if (s == null || s < 0)
    s = 0;
  if (e == null || e > v.length)
    e = v.length;
  return new u8(v.subarray(s, e));
};
var ec = [
  "unexpected EOF",
  "invalid block type",
  "invalid length/literal",
  "invalid distance",
  "stream finished",
  "no stream handler",
  ,
  // determined by compression function
  "no callback",
  "invalid UTF-8 data",
  "extra field too long",
  "date not in range 1980-2099",
  "filename too long",
  "stream finishing",
  "invalid zip data"
  // determined by unknown compression method
];
var err = function(ind, msg, nt) {
  var e = new Error(msg || ec[ind]);
  e.code = ind;
  if (Error.captureStackTrace)
    Error.captureStackTrace(e, err);
  if (!nt)
    throw e;
  return e;
};
var inflt = function(dat, st, buf, dict) {
  var sl = dat.length, dl = dict ? dict.length : 0;
  if (!sl || st.f && !st.l)
    return buf || new u8(0);
  var noBuf = !buf;
  var resize = noBuf || st.i != 2;
  var noSt = st.i;
  if (noBuf)
    buf = new u8(sl * 3);
  var cbuf = function(l2) {
    var bl = buf.length;
    if (l2 > bl) {
      var nbuf = new u8(Math.max(bl * 2, l2));
      nbuf.set(buf);
      buf = nbuf;
    }
  };
  var final = st.f || 0, pos = st.p || 0, bt = st.b || 0, lm = st.l, dm = st.d, lbt = st.m, dbt = st.n;
  var tbts = sl * 8;
  do {
    if (!lm) {
      final = bits(dat, pos, 1);
      var type = bits(dat, pos + 1, 3);
      pos += 3;
      if (!type) {
        var s = shft(pos) + 4, l = dat[s - 4] | dat[s - 3] << 8, t = s + l;
        if (t > sl) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + l);
        buf.set(dat.subarray(s, t), bt);
        st.b = bt += l, st.p = pos = t * 8, st.f = final;
        continue;
      } else if (type == 1)
        lm = flrm, dm = fdrm, lbt = 9, dbt = 5;
      else if (type == 2) {
        var hLit = bits(dat, pos, 31) + 257, hcLen = bits(dat, pos + 10, 15) + 4;
        var tl = hLit + bits(dat, pos + 5, 31) + 1;
        pos += 14;
        var ldt = new u8(tl);
        var clt = new u8(19);
        for (var i = 0; i < hcLen; ++i) {
          clt[clim[i]] = bits(dat, pos + i * 3, 7);
        }
        pos += hcLen * 3;
        var clb = max(clt), clbmsk = (1 << clb) - 1;
        var clm = hMap(clt, clb, 1);
        for (var i = 0; i < tl; ) {
          var r = clm[bits(dat, pos, clbmsk)];
          pos += r & 15;
          var s = r >> 4;
          if (s < 16) {
            ldt[i++] = s;
          } else {
            var c = 0, n = 0;
            if (s == 16)
              n = 3 + bits(dat, pos, 3), pos += 2, c = ldt[i - 1];
            else if (s == 17)
              n = 3 + bits(dat, pos, 7), pos += 3;
            else if (s == 18)
              n = 11 + bits(dat, pos, 127), pos += 7;
            while (n--)
              ldt[i++] = c;
          }
        }
        var lt = ldt.subarray(0, hLit), dt = ldt.subarray(hLit);
        lbt = max(lt);
        dbt = max(dt);
        lm = hMap(lt, lbt, 1);
        dm = hMap(dt, dbt, 1);
      } else
        err(1);
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
    }
    if (resize)
      cbuf(bt + 131072);
    var lms = (1 << lbt) - 1, dms = (1 << dbt) - 1;
    var lpos = pos;
    for (; ; lpos = pos) {
      var c = lm[bits16(dat, pos) & lms], sym = c >> 4;
      pos += c & 15;
      if (pos > tbts) {
        if (noSt)
          err(0);
        break;
      }
      if (!c)
        err(2);
      if (sym < 256)
        buf[bt++] = sym;
      else if (sym == 256) {
        lpos = pos, lm = null;
        break;
      } else {
        var add = sym - 254;
        if (sym > 264) {
          var i = sym - 257, b = fleb[i];
          add = bits(dat, pos, (1 << b) - 1) + fl[i];
          pos += b;
        }
        var d = dm[bits16(dat, pos) & dms], dsym = d >> 4;
        if (!d)
          err(3);
        pos += d & 15;
        var dt = fd[dsym];
        if (dsym > 3) {
          var b = fdeb[dsym];
          dt += bits16(dat, pos) & (1 << b) - 1, pos += b;
        }
        if (pos > tbts) {
          if (noSt)
            err(0);
          break;
        }
        if (resize)
          cbuf(bt + 131072);
        var end = bt + add;
        if (bt < dt) {
          var shift = dl - dt, dend = Math.min(dt, end);
          if (shift + bt < 0)
            err(3);
          for (; bt < dend; ++bt)
            buf[bt] = dict[shift + bt];
        }
        for (; bt < end; ++bt)
          buf[bt] = buf[bt - dt];
      }
    }
    st.l = lm, st.p = lpos, st.b = bt, st.f = final;
    if (lm)
      final = 1, st.m = lbt, st.d = dm, st.n = dbt;
  } while (!final);
  return bt != buf.length && noBuf ? slc(buf, 0, bt) : buf.subarray(0, bt);
};
var et = /* @__PURE__ */ new u8(0);
var mrg = function(a, b) {
  var o = {};
  for (var k in a)
    o[k] = a[k];
  for (var k in b)
    o[k] = b[k];
  return o;
};
var wcln = function(fn, fnStr, td2) {
  var dt = fn();
  var st = fn.toString();
  var ks = st.slice(st.indexOf("[") + 1, st.lastIndexOf("]")).replace(/\s+/g, "").split(",");
  for (var i = 0; i < dt.length; ++i) {
    var v = dt[i], k = ks[i];
    if (typeof v == "function") {
      fnStr += ";" + k + "=";
      var st_1 = v.toString();
      if (v.prototype) {
        if (st_1.indexOf("[native code]") != -1) {
          var spInd = st_1.indexOf(" ", 8) + 1;
          fnStr += st_1.slice(spInd, st_1.indexOf("(", spInd));
        } else {
          fnStr += st_1;
          for (var t in v.prototype)
            fnStr += ";" + k + ".prototype." + t + "=" + v.prototype[t].toString();
        }
      } else
        fnStr += st_1;
    } else
      td2[k] = v;
  }
  return fnStr;
};
var ch = [];
var cbfs = function(v) {
  var tl = [];
  for (var k in v) {
    if (v[k].buffer) {
      tl.push((v[k] = new v[k].constructor(v[k])).buffer);
    }
  }
  return tl;
};
var wrkr = function(fns, init, id, cb) {
  if (!ch[id]) {
    var fnStr = "", td_1 = {}, m = fns.length - 1;
    for (var i = 0; i < m; ++i)
      fnStr = wcln(fns[i], fnStr, td_1);
    ch[id] = { c: wcln(fns[m], fnStr, td_1), e: td_1 };
  }
  var td2 = mrg({}, ch[id].e);
  return wk(ch[id].c + ";onmessage=function(e){for(var k in e.data)self[k]=e.data[k];onmessage=" + init.toString() + "}", id, td2, cbfs(td2), cb);
};
var bInflt = function() {
  return [u8, u16, i32, fleb, fdeb, clim, fl, fd, flrm, fdrm, rev, ec, hMap, max, bits, bits16, shft, slc, err, inflt, inflateSync, pbf, gopt];
};
var pbf = function(msg) {
  return postMessage(msg, [msg.buffer]);
};
var gopt = function(o) {
  return o && {
    out: o.size && new u8(o.size),
    dictionary: o.dictionary
  };
};
var cbify = function(dat, opts, fns, init, id, cb) {
  var w = wrkr(fns, init, id, function(err2, dat2) {
    w.terminate();
    cb(err2, dat2);
  });
  w.postMessage([dat, opts], opts.consume ? [dat.buffer] : []);
  return function() {
    w.terminate();
  };
};
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
function inflate(data, opts, cb) {
  if (!cb)
    cb = opts, opts = {};
  if (typeof cb != "function")
    err(7);
  return cbify(data, opts, [
    bInflt
  ], function(ev) {
    return pbf(inflateSync(ev.data[0], gopt(ev.data[1])));
  }, 1, cb);
}
function inflateSync(data, opts) {
  return inflt(data, { i: 2 }, opts && opts.out, opts && opts.dictionary);
}
var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
var tds = 0;
try {
  td.decode(et, { stream: true });
  tds = 1;
} catch (e) {
}
var dutf8 = function(d) {
  for (var r = "", i = 0; ; ) {
    var c = d[i++];
    var eb = (c > 127) + (c > 223) + (c > 239);
    if (i + eb > d.length)
      return { s: r, r: slc(d, i - 1) };
    if (!eb)
      r += String.fromCharCode(c);
    else if (eb == 3) {
      c = ((c & 15) << 18 | (d[i++] & 63) << 12 | (d[i++] & 63) << 6 | d[i++] & 63) - 65536, r += String.fromCharCode(55296 | c >> 10, 56320 | c & 1023);
    } else if (eb & 1)
      r += String.fromCharCode((c & 31) << 6 | d[i++] & 63);
    else
      r += String.fromCharCode((c & 15) << 12 | (d[i++] & 63) << 6 | d[i++] & 63);
  }
};
function strFromU8(dat, latin1) {
  if (latin1) {
    var r = "";
    for (var i = 0; i < dat.length; i += 16384)
      r += String.fromCharCode.apply(null, dat.subarray(i, i + 16384));
    return r;
  } else if (td) {
    return td.decode(dat);
  } else {
    var _a2 = dutf8(dat), s = _a2.s, r = _a2.r;
    if (r.length)
      err(8);
    return s;
  }
}
var slzh = function(d, b) {
  return b + 30 + b2(d, b + 26) + b2(d, b + 28);
};
var zh = function(d, b, z) {
  var fnl = b2(d, b + 28), efl = b2(d, b + 30), fn = strFromU8(d.subarray(b + 46, b + 46 + fnl), !(b2(d, b + 8) & 2048)), es = b + 46 + fnl;
  var _a2 = z64hs(d, es, efl, z, b4(d, b + 20), b4(d, b + 24), b4(d, b + 42)), sc = _a2[0], su = _a2[1], off = _a2[2];
  return [b2(d, b + 10), sc, su, fn, es + efl + b2(d, b + 32), off];
};
var z64hs = function(d, b, l, z, sc, su, off) {
  var nsc = sc == 4294967295, nsu = su == 4294967295, noff = off == 4294967295, e = b + l;
  var nf = nsc + nsu + noff;
  if (z && nf) {
    for (; b + 4 < e; b += 4 + b2(d, b + 2)) {
      if (b2(d, b) == 1) {
        return [
          nsc ? b8(d, b + 4 + 8 * nsu) : sc,
          nsu ? b8(d, b + 4) : su,
          noff ? b8(d, b + 4 + 8 * (nsu + nsc)) : off,
          1
        ];
      }
    }
    if (z < 2)
      err(13);
  }
  return [sc, su, off, 0];
};
var mt = typeof queueMicrotask == "function" ? queueMicrotask : typeof setTimeout == "function" ? setTimeout : function(fn) {
  fn();
};
function unzip(data, opts, cb) {
  if (!cb)
    cb = opts, opts = {};
  if (typeof cb != "function")
    err(7);
  var term = [];
  var tAll = function() {
    for (var i2 = 0; i2 < term.length; ++i2)
      term[i2]();
  };
  var files = {};
  var cbd = function(a, b) {
    mt(function() {
      cb(a, b);
    });
  };
  mt(function() {
    cbd = cb;
  });
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558) {
      cbd(err(13, 0, 1), null);
      return tAll;
    }
  }
  ;
  var lft = b2(data, e + 8);
  if (lft) {
    var c = lft;
    var o = b4(data, e + 16);
    var z = b4(data, e - 20) == 117853008;
    if (z) {
      var ze = b4(data, e - 12);
      z = b4(data, ze) == 101075792;
      if (z) {
        c = lft = b4(data, ze + 32);
        o = b4(data, ze + 48);
      }
    }
    var fltr = opts && opts.filter;
    var _loop_3 = function(i2) {
      var _a2 = zh(data, o, z), c_1 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
      o = no;
      var cbl = function(e2, d) {
        if (e2) {
          tAll();
          cbd(e2, null);
        } else {
          if (d)
            files[fn] = d;
          if (!--lft)
            cbd(null, files);
        }
      };
      if (!fltr || fltr({
        name: fn,
        size: sc,
        originalSize: su,
        compression: c_1
      })) {
        if (!c_1)
          cbl(null, slc(data, b, b + sc));
        else if (c_1 == 8) {
          var infl = data.subarray(b, b + sc);
          if (su < 524288 || sc > 0.8 * su) {
            try {
              cbl(null, inflateSync(infl, { out: new u8(su) }));
            } catch (e2) {
              cbl(e2, null);
            }
          } else
            term.push(inflate(infl, { size: su }, cbl));
        } else
          cbl(err(14, "unknown compression type " + c_1, 1), null);
      } else
        cbl(null, null);
    };
    for (var i = 0; i < c; ++i) {
      _loop_3(i);
    }
  } else
    cbd(null, {});
  return tAll;
}

// src/importer.ts
var MAX_ARCHIVE_BYTES = 250 * 1024 * 1024;
var MAX_EXPANDED_BYTES = 1024 * 1024 * 1024;
var MAX_ENTRY_COUNT = 5e3;
var MAX_IMAGE_BYTES = 25 * 1024 * 1024;
var MAX_VIDEO_BYTES = 100 * 1024 * 1024;
var MIME_TYPES = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  webm: "video/webm",
  mp4: "video/mp4"
};
function assertArchiveBudget(entryCount, expandedBytes) {
  if (entryCount > MAX_ENTRY_COUNT) {
    throw new Error(`Archive contains more than ${MAX_ENTRY_COUNT} supported files.`);
  }
  if (expandedBytes > MAX_EXPANDED_BYTES) {
    throw new Error(`Archive expands beyond ${MAX_EXPANDED_BYTES} bytes.`);
  }
}
function normalizedArchivePath(value) {
  const path = value.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!path || path.endsWith("/")) return null;
  const parts = path.split("/");
  if (parts.some((part) => !part || part === "." || part === ".." || part.includes("\0"))) {
    return null;
  }
  if (parts[0] === "__MACOSX" || parts.some((part) => part.startsWith("."))) return null;
  return parts.join("/");
}
function mimeForName(name) {
  const extension = name.split(".").pop()?.toLocaleLowerCase() ?? "";
  return MIME_TYPES[extension] ?? null;
}
function importTarget(candidate, layout) {
  const folders = candidate.segments.map((segment) => cleanName(segment));
  const leafExpression = cleanName(candidate.fileName, "Neutral");
  if (layout === "outfit-expression-variant") {
    return {
      outfitName: folders[0] ?? "Default",
      expressionName: folders[1] ?? leafExpression
    };
  }
  if (layout === "outfit-expression") {
    return {
      outfitName: folders[0] ?? "Default",
      expressionName: leafExpression
    };
  }
  if (folders.length >= 2) {
    return { outfitName: folders[0], expressionName: folders[1] };
  }
  return {
    outfitName: folders[0] ?? "Default",
    expressionName: leafExpression
  };
}
function assertUnambiguousCandidates(candidates, layout) {
  const paths = /* @__PURE__ */ new Map();
  const destinations = /* @__PURE__ */ new Map();
  const conflicts = [];
  for (const candidate of candidates) {
    if (candidate.segments.length > 2) {
      conflicts.push(`${candidate.path} is deeper than Outfit/Expression/Variant.ext`);
      continue;
    }
    const pathKey = candidate.path.normalize("NFKC").toLocaleLowerCase();
    const priorPath = paths.get(pathKey);
    if (priorPath) conflicts.push(`${priorPath} conflicts with ${candidate.path}`);
    else paths.set(pathKey, candidate.path);
    const target = importTarget(candidate, layout);
    const destinationKey = [
      target.outfitName,
      target.expressionName,
      candidate.fileName
    ].map(normalizedKey).join("/");
    const priorDestination = destinations.get(destinationKey);
    if (priorDestination && priorDestination !== candidate.path) {
      conflicts.push(`${priorDestination} and ${candidate.path} resolve to the same destination`);
    } else {
      destinations.set(destinationKey, candidate.path);
    }
  }
  if (conflicts.length) {
    throw new Error(
      `Ambiguous import collisions: ${[...new Set(conflicts)].slice(0, 8).join("; ")}`
    );
  }
}
function parseManifestBytes(manifestBytes) {
  try {
    const parsed = JSON.parse(new TextDecoder().decode(manifestBytes));
    if (parsed.kind !== "lumistage-archive" || parsed.schemaVersion !== 1 && parsed.schemaVersion !== 2 || !parsed.profile) {
      throw new Error("Unsupported LumiStage archive manifest.");
    }
    return parsed;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Invalid LumiStage manifest.");
  }
}
async function extractLumiStageArchive(bytes) {
  if (bytes.byteLength > MAX_ARCHIVE_BYTES) {
    throw new Error(`Archive exceeds ${MAX_ARCHIVE_BYTES} bytes.`);
  }
  let expandedBytes = 0;
  let acceptedCount = 0;
  const rejected = /* @__PURE__ */ new Map();
  const unzipped = await new Promise((resolve, reject) => {
    unzip(bytes, {
      filter(info) {
        const path = normalizedArchivePath(info.name);
        if (!path) return false;
        if (path === "manifest.json") {
          if (info.originalSize > 5 * 1024 * 1024) {
            throw new Error("LumiStage manifest exceeds 5 MB.");
          }
          return true;
        }
        const mimeType = mimeForName(path);
        if (!mimeType) return false;
        acceptedCount += 1;
        expandedBytes += info.originalSize;
        const limit = mimeType.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
        if (info.originalSize > limit) {
          rejected.set(path, `File exceeds ${limit} bytes.`);
          return false;
        }
        assertArchiveBudget(acceptedCount, expandedBytes);
        return true;
      }
    }, (error, result) => error ? reject(error) : resolve(result));
  });
  const manifestEntry = Object.entries(unzipped).find(
    ([path]) => normalizedArchivePath(path) === "manifest.json"
  );
  if (!manifestEntry) throw new Error("The archive does not contain a LumiStage manifest.");
  const manifest = parseManifestBytes(manifestEntry[1]);
  const candidates = [];
  for (const [rawPath, data] of Object.entries(unzipped)) {
    const path = normalizedArchivePath(rawPath);
    if (!path || path === "manifest.json" || data.byteLength === 0) continue;
    const mimeType = mimeForName(path);
    if (!mimeType) continue;
    const parts = path.split("/");
    const fileName = parts.pop() ?? path;
    candidates.push({ path, fileName, bytes: data, mimeType, segments: parts });
  }
  return {
    manifest,
    candidates,
    errors: [...rejected].map(([path, reason]) => `${path}: ${reason}`)
  };
}
function directCandidate(fileName, bytes, mimeTypeHint) {
  const path = normalizedArchivePath(fileName);
  if (!path) throw new Error("The selected file has an unsafe path.");
  const mimeType = mimeForName(path) ?? (mimeTypeHint && /^(?:image|video)\//.test(mimeTypeHint) ? mimeTypeHint : null);
  if (!mimeType) throw new Error(`${fileName} is not a supported image or video.`);
  const limit = mimeType.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (bytes.byteLength > limit) throw new Error(`${fileName} exceeds ${limit} bytes.`);
  const segments = path.split("/");
  const leaf = segments.pop() ?? fileName;
  return { path, fileName: leaf, bytes, mimeType, segments };
}
function findOrCreateOutfit(profile, name) {
  const key = normalizedKey(name);
  let outfit = profile.outfits.find((item) => normalizedKey(item.name) === key);
  if (!outfit) {
    outfit = createOutfit(name);
    outfit.expressions = [];
    outfit.defaultExpressionId = null;
    outfit.order = profile.outfits.length;
    profile.outfits.push(outfit);
    profile.defaultOutfitId ??= outfit.id;
  }
  return outfit;
}
function findOrCreateExpression(outfit, name) {
  const key = normalizedKey(name);
  let expression = outfit.expressions.find((item) => normalizedKey(item.name) === key);
  if (!expression) {
    expression = createExpression(name);
    expression.order = outfit.expressions.length;
    outfit.expressions.push(expression);
    outfit.defaultExpressionId ??= expression.id;
  }
  return expression;
}
function mergeImportedAssets(source, imported, characterName2, now = Date.now()) {
  const profile = normalizeProfile(
    structuredClone(source),
    source.characterId,
    characterName2,
    now
  );
  let importedCount = 0;
  let skipped = 0;
  for (const item of imported) {
    const outfit = item.targetOutfitId ? profile.outfits.find((entry) => entry.id === item.targetOutfitId) : findOrCreateOutfit(profile, item.target.outfitName);
    if (!outfit) throw new Error(`Import target outfit ${item.targetOutfitId} no longer exists.`);
    const expression = item.targetExpressionId ? outfit.expressions.find((entry) => entry.id === item.targetExpressionId) : findOrCreateExpression(outfit, item.target.expressionName);
    if (!expression) throw new Error(`Import target expression ${item.targetExpressionId} no longer exists.`);
    if (expression.variants.some((variant2) => variant2.contentHash === item.contentHash)) {
      skipped += 1;
      continue;
    }
    const variant = {
      id: createId("variant"),
      imageId: item.imageId,
      contentHash: item.contentHash,
      fileName: item.fileName,
      mimeType: item.mimeType,
      mediaKind: item.mimeType.startsWith("video/") ? "video" : "image",
      order: expression.variants.length,
      createdAt: now
    };
    expression.variants.push(variant);
    importedCount += 1;
  }
  profile.revision += 1;
  profile.updatedAt = now;
  return { profile, imported: importedCount, skipped };
}
function archiveEntries(archive) {
  const raw = archive;
  const entries = Array.isArray(raw.variants) ? raw.variants : Array.isArray(raw.assets) ? raw.assets : [];
  return entries.flatMap((value) => {
    const entry = value && typeof value === "object" ? value : {};
    const media = entry.variant && typeof entry.variant === "object" ? entry.variant : entry.asset && typeof entry.asset === "object" ? entry.asset : {};
    return typeof entry.path === "string" && typeof media.id === "string" ? [{ path: entry.path, variantId: media.id }] : [];
  });
}
function hydrateArchiveProfile(archive, characterId, characterName2, uploadedByPath, now = Date.now()) {
  const profile = normalizeProfile(
    {
      ...structuredClone(archive.profile),
      characterId,
      characterName: characterName2,
      revision: 0,
      updatedAt: now
    },
    characterId,
    characterName2,
    now
  );
  const entries = archiveEntries(archive);
  const pathsByVariantId = /* @__PURE__ */ new Map();
  const referencedPaths = /* @__PURE__ */ new Set();
  for (const entry of entries) {
    const path = normalizedArchivePath(entry.path);
    if (!path || path === "manifest.json") throw new Error(`Archive manifest contains an unsafe path: ${entry.path}`);
    if (pathsByVariantId.has(entry.variantId)) throw new Error(`Archive manifest repeats variant ID ${entry.variantId}.`);
    pathsByVariantId.set(entry.variantId, path);
    referencedPaths.add(path);
  }
  const profileVariants = allVariants(profile);
  if (pathsByVariantId.size !== profileVariants.length) {
    throw new Error("Archive manifest does not contain exactly one media reference for every profile variant.");
  }
  for (const path of referencedPaths) {
    if (!uploadedByPath.has(path)) throw new Error(`Archive is missing referenced media ${path}.`);
  }
  for (const path of uploadedByPath.keys()) {
    if (!referencedPaths.has(path)) throw new Error(`Archive contains unreferenced media ${path}.`);
  }
  for (const outfit of profile.outfits) {
    for (const expression of outfit.expressions) {
      expression.variants = expression.variants.flatMap((variant) => {
        const path = pathsByVariantId.get(variant.id);
        const upload = path ? uploadedByPath.get(path) : null;
        if (!upload) return [];
        return [{
          ...variant,
          imageId: upload.imageId,
          contentHash: upload.contentHash,
          fileName: upload.fileName,
          mimeType: upload.mimeType,
          mediaKind: upload.mimeType.startsWith("video/") ? "video" : "image",
          createdAt: now
        }];
      });
    }
  }
  profile.revision = 1;
  return profile;
}
function removeVariants(profile, variantIds, now = Date.now()) {
  const next = structuredClone(profile);
  for (const outfit of next.outfits) {
    for (const expression of outfit.expressions) {
      expression.variants = expression.variants.filter((variant) => !variantIds.has(variant.id)).map((variant, order) => ({ ...variant, order }));
    }
  }
  next.revision += 1;
  next.updatedAt = now;
  return next;
}
function variantReferenceCount(profiles, imageId) {
  return profiles.reduce(
    (sum, profile) => sum + allVariants(profile).filter((variant) => variant.imageId === imageId).length,
    0
  );
}
function unreferencedImageIds(profiles, candidateImageIds) {
  return [...new Set(candidateImageIds)].filter(
    (imageId) => variantReferenceCount(profiles, imageId) === 0
  );
}

// src/detector.ts
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function requiredString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
function confidence(value) {
  const number = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return Math.min(1, Math.max(0, number));
}
function legacyCharacterDecision(value) {
  const raw = asRecord(value);
  const characterId = requiredString(raw.characterId);
  const outfitId = requiredString(raw.outfitId);
  const expressionId = requiredString(raw.expressionId);
  const variantId = requiredString(raw.variantId);
  if (!characterId || !outfitId || !expressionId || !variantId) return null;
  return {
    characterId,
    outfitId,
    expressionId,
    variantId,
    confidence: confidence(raw.confidence)
  };
}
function normalizedKey2(value) {
  return value.normalize("NFKC").trim().toLocaleLowerCase();
}
function selector(value, keys) {
  const raw = asRecord(value);
  for (const key of keys) {
    const selected = requiredString(raw[key]);
    if (selected) return selected;
  }
  return null;
}
function resolveCharacterId(value, catalog) {
  const exact = catalog.find((entry) => entry.characterId === value);
  if (exact) return exact.characterId;
  const key = normalizedKey2(value);
  const named = catalog.filter((entry) => normalizedKey2(entry.profile.characterName) === key);
  return named.length === 1 ? named[0].characterId : null;
}
function resolveCharacterDecision(value, catalog, random) {
  const raw = asRecord(value);
  const characterSelector = selector(raw, ["characterId", "character", "characterName"]);
  const outfitSelector = selector(raw, ["outfitName", "outfit", "outfitId"]);
  const expressionSelector = selector(raw, ["expressionName", "expression", "expressionId"]);
  if (!characterSelector || !outfitSelector || !expressionSelector) return null;
  const characterId = resolveCharacterId(characterSelector, catalog);
  const entry = catalog.find((candidate) => candidate.characterId === characterId);
  if (!entry) return null;
  const outfitKey = normalizedKey2(outfitSelector);
  const outfits = entry.profile.outfits.filter(
    (outfit2) => outfit2.id === outfitSelector || normalizedKey2(outfit2.name) === outfitKey
  );
  if (outfits.length !== 1) return null;
  const [outfit] = outfits;
  const expressionKey = normalizedKey2(expressionSelector);
  const expressions = outfit.expressions.filter(
    (expression2) => expression2.id === expressionSelector || normalizedKey2(expression2.name) === expressionKey
  );
  if (expressions.length !== 1 || expressions[0].variants.length === 0) return null;
  const [expression] = expressions;
  const roll = random();
  const normalizedRoll = Number.isFinite(roll) ? Math.max(0, Math.min(0.9999999999999999, roll)) : 0;
  const variant = expression.variants[Math.floor(normalizedRoll * expression.variants.length)];
  return {
    characterId: entry.characterId,
    outfitId: outfit.id,
    expressionId: expression.id,
    variantId: variant.id,
    confidence: confidence(raw.confidence)
  };
}
function normalizeDecision(value, catalog = [], random = Math.random) {
  const raw = asRecord(value);
  if (!Array.isArray(raw.characters) || !Array.isArray(raw.focusedCharacterIds)) return null;
  const parsedCharacters = raw.characters.map(
    (item) => catalog.length ? resolveCharacterDecision(item, catalog, random) : legacyCharacterDecision(item)
  );
  if (parsedCharacters.some((item) => !item)) return null;
  const characters = parsedCharacters;
  const focusValues = raw.focusedCharacterIds.map(
    (item) => typeof item === "string" && item ? catalog.length ? resolveCharacterId(item, catalog) : item : null
  );
  if (focusValues.some((item) => !item) || !characters.length) return null;
  const focusedCharacterIds = [...new Set(focusValues)];
  return { schemaVersion: SCHEMA_VERSION, focusedCharacterIds, characters };
}
function parseJsonText(value) {
  const text = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}
function parseDetectorResponse(response, catalog = [], random = Math.random) {
  const tool = response.tool_calls?.find((item) => item.name === "set_stage_state");
  if (tool) return normalizeDecision(tool.args, catalog, random);
  if (typeof response.content === "string") {
    return normalizeDecision(parseJsonText(response.content), catalog, random);
  }
  return null;
}
function characterSummary(entry) {
  return {
    characterId: entry.characterId,
    name: entry.profile.characterName,
    outfits: entry.profile.outfits.flatMap((outfit) => {
      const expressions = outfit.expressions.filter((expression) => expression.variants.length > 0).map((expression) => ({ expressionName: expression.name }));
      return expressions.length ? [{ outfitName: outfit.name, expressions }] : [];
    })
  };
}
function constrainCatalogToManualOverrides(catalog, overrides) {
  return catalog.map((entry) => {
    const override = overrides[entry.characterId];
    if (!override?.outfitId) return entry;
    const outfit = entry.profile.outfits.find((candidate) => candidate.id === override.outfitId);
    if (!outfit) return entry;
    if (override.lock === "outfit") {
      return {
        ...entry,
        profile: {
          ...entry.profile,
          defaultOutfitId: outfit.id,
          outfits: [outfit]
        }
      };
    }
    const expression = outfit.expressions.find(
      (candidate) => candidate.id === override.expressionId
    );
    const variant = expression?.variants.find(
      (candidate) => candidate.id === override.variantId
    );
    if (!expression || !variant) return entry;
    return {
      ...entry,
      profile: {
        ...entry.profile,
        defaultOutfitId: outfit.id,
        outfits: [{
          ...outfit,
          defaultExpressionId: expression.id,
          expressions: [{
            ...expression,
            variants: [variant]
          }]
        }]
      }
    };
  });
}
function stateSummary(catalog, states, overrides) {
  return Object.entries(states).flatMap(([characterId, state]) => {
    const profile = catalog.find((entry) => entry.characterId === characterId)?.profile;
    const outfit = profile?.outfits.find((item) => item.id === state.outfitId);
    const expression = outfit?.expressions.find((item) => item.id === state.expressionId);
    if (!profile || !outfit || !expression) return [];
    const current = {
      characterId,
      outfitName: outfit.name
    };
    return overrides[characterId]?.lock === "outfit" ? [current] : [{ ...current, expressionName: expression.name }];
  });
}
function overrideSummary(catalog, overrides) {
  return Object.values(overrides).flatMap((override) => {
    const profile = catalog.find((entry) => entry.characterId === override.characterId)?.profile;
    const outfit = profile?.outfits.find((item) => item.id === override.outfitId);
    const expression = outfit?.expressions.find((item) => item.id === override.expressionId);
    if (!profile || !outfit) return [];
    const lockedOutfit = {
      characterId: override.characterId,
      scope: override.scope,
      lock: override.lock,
      outfitName: outfit.name
    };
    return override.lock === "outfit" ? [lockedOutfit] : [{
      ...lockedOutfit,
      expressionName: expression?.name ?? null
    }];
  });
}
function buildDetectorRequest(catalog, recentMessages, currentStates, settings, overrides = {}, enforceBudget = true) {
  const detectorCatalog = constrainCatalogToManualOverrides(catalog, overrides);
  const system = [
    "You direct the visible character sprite stage after a completed roleplay reply.",
    "Catalog expressionName values are general visible sprite states, not an emotion-only taxonomy.",
    "A state may describe facial emotion, full-body pose or posture, an activity or prop use, interaction or relative positioning with another character, physical condition, transformation, or narrative sequence/context.",
    'Examples include states such as "drinking coffee", "after the fight", or "straddling another character"; interpret every label from the perspective of the character who owns that catalog.',
    "Select the most specific expressionName directly supported by the completed scene, preferring a matching pose, action, interaction, condition, or contextual state over a generic mood such as happy or sad.",
    "For compound, relational, and sequence states, require every material part of the label to be supported: the action or pose, the other participant when named or implied, and ordering such as before/after. Do not select one merely because its emotional tone fits.",
    "For each updated character, return one exact outfitName and expressionName copied from the catalog.",
    "Variants and filenames are intentionally hidden from you. LumiStage randomly selects an eligible variant after you choose the expression.",
    "Outfits are selectable visual states. You may switch away from the current outfit whenever the completed scene supports another outfit.",
    "Current states are context, not locks. Only entries under Manual locks constrain outfit or sprite selection.",
    "An outfit lock fixes only outfitName. Within that outfit, choose any listed expressionName that matches the completed scene.",
    "For an outfit-locked character, the prior expression is intentionally omitted. Re-evaluate expressionName from the completed scene instead of preserving the prior expression.",
    "A state lock fixes the exact outfitName and expressionName until it is cleared; LumiStage separately preserves its exact locked variant.",
    "Classify all relevant group-chat characters in this one call and identify the visual focus.",
    "Use the exact characterId from the catalog for each character and focusedCharacterIds entry.",
    "Confidence is 0..1 for the complete visible-state match.",
    `Catalog: ${JSON.stringify(detectorCatalog.map(characterSummary))}`,
    `Current states: ${JSON.stringify(stateSummary(detectorCatalog, currentStates, overrides))}`,
    `Manual locks: ${JSON.stringify(overrideSummary(detectorCatalog, overrides))}`
  ].join("\n");
  const messages = [
    { role: "system", content: system },
    ...recentMessages.slice(-settings.detection.contextMessages),
    {
      role: "user",
      content: "Resolve the sprite stage for the latest assistant reply using the most specific scene-supported visible state for each character. Call set_stage_state exactly once."
    }
  ];
  const tools = [{
    name: "set_stage_state",
    description: "Select each visible character's outfit and catalog expression, including poses, actions, interactions, conditions, and contextual states as well as emotions.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["focusedCharacterIds", "characters"],
      properties: {
        focusedCharacterIds: { type: "array", items: { type: "string" } },
        characters: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: [
              "characterId",
              "outfitName",
              "expressionName",
              "confidence"
            ],
            properties: {
              characterId: { type: "string" },
              outfitName: { type: "string" },
              expressionName: {
                type: "string",
                description: "Exact catalog state label. It may represent an emotion, pose, action, interaction, condition, transformation, or sequence/context."
              },
              confidence: { type: "number", minimum: 0, maximum: 1 }
            }
          }
        }
      }
    }
  }];
  const estimatedInputTokens = Math.ceil((messages.reduce((sum, message) => sum + message.role.length + message.content.length, 0) + JSON.stringify(tools).length) / 4);
  if (enforceBudget && estimatedInputTokens > 24e3) {
    throw new Error(
      `The detector catalog and context are too large (${estimatedInputTokens} estimated input tokens; limit 24000).`
    );
  }
  return {
    estimatedInputTokens,
    messages,
    connection_id: settings.detection.connectionId ?? void 0,
    model: settings.detection.model ?? void 0,
    parameters: {
      temperature: settings.detection.temperature
    },
    reasoning: { source: "off" },
    tools
  };
}
function validateDecision(decision, catalog) {
  const entries = new Map(catalog.map((entry) => [entry.characterId, entry.profile]));
  const characters = [];
  const seenCharacterIds = /* @__PURE__ */ new Set();
  let invalid = false;
  for (const item of decision.characters) {
    if (seenCharacterIds.has(item.characterId)) {
      invalid = true;
      break;
    }
    seenCharacterIds.add(item.characterId);
    const profile = entries.get(item.characterId);
    const outfit = profile?.outfits.find((candidate) => candidate.id === item.outfitId);
    const expression = outfit?.expressions.find(
      (candidate) => candidate.id === item.expressionId
    );
    const variant = expression?.variants.find((candidate) => candidate.id === item.variantId);
    if (!profile || !outfit || !expression || !variant) {
      invalid = true;
      break;
    }
    characters.push(item);
  }
  const focusedCharacterIds = decision.focusedCharacterIds.filter((id) => entries.has(id));
  if (focusedCharacterIds.length !== decision.focusedCharacterIds.length) invalid = true;
  return {
    schemaVersion: SCHEMA_VERSION,
    focusedCharacterIds: invalid ? [] : focusedCharacterIds,
    characters: invalid ? [] : characters
  };
}

// src/storage.ts
var settingsPath = () => "settings.v2.json";
var profilePath = (characterId) => `profiles/${characterId}.v2.json`;
var timelinePath = (chatId) => `chats/${chatId}.v2.json`;
var oldSettingsPath = () => "settings.v1.json";
var oldProfilePath = (characterId) => `profiles/${characterId}.v1.json`;
var oldTimelinePath = (chatId) => `chats/${chatId}.v1.json`;
function asRecord2(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function migrateTimeline(raw, chatId, now = Date.now()) {
  const source = asRecord2(raw);
  if (source.schemaVersion === SCHEMA_VERSION && source.chatId === chatId) {
    const timeline = source;
    return {
      ...timeline,
      schemaVersion: SCHEMA_VERSION,
      chatId,
      decisions: Array.isArray(timeline.decisions) ? timeline.decisions : [],
      manualOverrides: timeline.manualOverrides ?? {},
      layoutOverride: timeline.layoutOverride ?? null,
      snapshot: timeline.snapshot?.schemaVersion === SCHEMA_VERSION ? timeline.snapshot : emptySnapshot(chatId, now)
    };
  }
  const legacySnapshot = asRecord2(source.snapshot);
  const legacyStates = asRecord2(legacySnapshot.actors);
  const characters = {};
  const legacyToCharacter = /* @__PURE__ */ new Map();
  for (const [legacyId, value] of Object.entries(legacyStates)) {
    const state = asRecord2(value);
    const characterId = typeof state.characterId === "string" ? state.characterId : null;
    if (!characterId) continue;
    legacyToCharacter.set(legacyId, characterId);
    characters[characterId] = {
      characterId,
      outfitId: typeof state.outfitId === "string" ? state.outfitId : null,
      expressionId: typeof state.expressionId === "string" ? state.expressionId : null,
      variantId: typeof state.assetId === "string" ? state.assetId : null,
      imageId: typeof state.imageId === "string" ? state.imageId : null,
      label: typeof state.label === "string" ? state.label : "LumiStage",
      focused: state.focused === true,
      confidence: typeof state.confidence === "number" ? state.confidence : 1
    };
  }
  const manualOverrides = {};
  for (const [legacyId, value] of Object.entries(asRecord2(source.manualOverrides))) {
    const item = asRecord2(value);
    const characterId = typeof item.characterId === "string" ? item.characterId : legacyToCharacter.get(legacyId);
    if (!characterId || typeof item.outfitId !== "string") continue;
    manualOverrides[characterId] = {
      characterId,
      outfitId: item.outfitId,
      expressionId: typeof item.expressionId === "string" ? item.expressionId : null,
      variantId: typeof item.assetId === "string" ? item.assetId : null,
      scope: item.scope === "once" ? "once" : "locked",
      lock: typeof item.expressionId === "string" ? "state" : "outfit",
      createdAt: typeof item.createdAt === "number" ? item.createdAt : now
    };
  }
  const focusedCharacterIds = Array.isArray(legacySnapshot.focusedActorIds) ? legacySnapshot.focusedActorIds.map((id) => typeof id === "string" ? legacyToCharacter.get(id) : null).filter((id) => !!id) : [];
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: typeof source.revision === "number" ? Math.max(0, Math.trunc(source.revision)) : 0,
    chatId,
    decisions: [],
    manualOverrides,
    layoutOverride: source.layoutOverride && typeof source.layoutOverride === "object" ? source.layoutOverride : null,
    snapshot: {
      schemaVersion: SCHEMA_VERSION,
      chatId,
      revision: typeof legacySnapshot.revision === "number" ? legacySnapshot.revision : 0,
      characters,
      focusedCharacterIds,
      updatedAt: typeof legacySnapshot.updatedAt === "number" ? legacySnapshot.updatedAt : now
    },
    updatedAt: typeof source.updatedAt === "number" ? source.updatedAt : now
  };
}
var LumiStageRepository = class {
  constructor(storage) {
    this.storage = storage;
  }
  storage;
  settingsCache = /* @__PURE__ */ new Map();
  profileCache = /* @__PURE__ */ new Map();
  timelineCache = /* @__PURE__ */ new Map();
  writes = /* @__PURE__ */ new Map();
  key(userId, path) {
    return `${userId}:${path}`;
  }
  enqueue(key, operation) {
    const previous = this.writes.get(key) ?? Promise.resolve();
    const next = previous.catch(() => void 0).then(operation);
    this.writes.set(key, next);
    const cleanup = () => {
      if (this.writes.get(key) === next) this.writes.delete(key);
    };
    void next.then(cleanup, cleanup);
    return next;
  }
  async readCurrentOrOld(currentPath, oldPath, userId) {
    const current = await this.storage.getJson(currentPath, { fallback: null, userId });
    if (current) return { raw: current, migrated: false };
    const old = await this.storage.getJson(oldPath, { fallback: null, userId });
    return { raw: old, migrated: !!old };
  }
  async getSettings(userId) {
    const path = settingsPath();
    const key = this.key(userId, path);
    const cached = this.settingsCache.get(key);
    if (cached) return structuredClone(cached);
    const { raw, migrated } = await this.readCurrentOrOld(
      path,
      oldSettingsPath(),
      userId
    );
    const settings = raw ? normalizeSettings(raw) : defaultSettings();
    if (migrated) await this.storage.setJson(path, settings, { indent: 2, userId });
    this.settingsCache.set(key, settings);
    return structuredClone(settings);
  }
  async saveSettings(userId, value, expectedRevision) {
    const path = settingsPath();
    const key = this.key(userId, path);
    return this.enqueue(key, async () => {
      const current = await this.getSettings(userId);
      if (current.revision !== expectedRevision) throw new RevisionConflict(current.revision);
      const settings = normalizeSettings({
        ...value,
        revision: current.revision + 1,
        updatedAt: Date.now()
      });
      await this.storage.setJson(path, settings, { indent: 2, userId });
      this.settingsCache.set(key, settings);
      return structuredClone(settings);
    });
  }
  async getProfile(userId, characterId, characterName2 = "Character") {
    const path = profilePath(characterId);
    const key = this.key(userId, path);
    const cached = this.profileCache.get(key);
    if (cached) {
      if (characterName2.trim() && characterName2 !== "Character" && cached.characterName !== characterName2.trim()) {
        cached.characterName = characterName2.trim();
        this.profileCache.set(key, cached);
      }
      return structuredClone(cached);
    }
    const { raw, migrated } = await this.readCurrentOrOld(
      path,
      oldProfilePath(characterId),
      userId
    );
    const profile = raw ? normalizeProfile(raw, characterId, characterName2) : createProfile(characterId, characterName2);
    if (characterName2.trim() && characterName2 !== "Character") {
      profile.characterName = characterName2.trim();
    }
    if (migrated) await this.storage.setJson(path, profile, { indent: 2, userId });
    this.profileCache.set(key, profile);
    return structuredClone(profile);
  }
  async saveProfile(userId, value, expectedRevision, characterName2 = value.characterName) {
    const path = profilePath(value.characterId);
    const key = this.key(userId, path);
    return this.enqueue(key, async () => {
      const current = await this.getProfile(userId, value.characterId, characterName2);
      if (current.revision !== expectedRevision) throw new RevisionConflict(current.revision);
      const profile = normalizeProfile(
        { ...value, revision: current.revision + 1, updatedAt: Date.now() },
        value.characterId,
        characterName2
      );
      await this.storage.setJson(path, profile, { indent: 2, userId });
      this.profileCache.set(key, profile);
      return structuredClone(profile);
    });
  }
  async getTimeline(userId, chatId) {
    const path = timelinePath(chatId);
    const key = this.key(userId, path);
    const cached = this.timelineCache.get(key);
    if (cached) return structuredClone(cached);
    const { raw, migrated } = await this.readCurrentOrOld(
      path,
      oldTimelinePath(chatId),
      userId
    );
    const timeline = raw ? migrateTimeline(raw, chatId) : createTimeline(chatId);
    if (migrated) await this.storage.setJson(path, timeline, { indent: 2, userId });
    this.timelineCache.set(key, timeline);
    return structuredClone(timeline);
  }
  async saveTimeline(userId, value, expectedRevision) {
    const path = timelinePath(value.chatId);
    const key = this.key(userId, path);
    return this.enqueue(key, async () => {
      const current = await this.getTimeline(userId, value.chatId);
      if (current.revision !== expectedRevision) throw new RevisionConflict(current.revision);
      const timeline = {
        ...structuredClone(value),
        schemaVersion: SCHEMA_VERSION,
        revision: current.revision + 1,
        updatedAt: Date.now()
      };
      await this.storage.setJson(path, timeline, { indent: 2, userId });
      this.timelineCache.set(key, timeline);
      return structuredClone(timeline);
    });
  }
  async deleteTimeline(userId, chatId) {
    const path = timelinePath(chatId);
    const key = this.key(userId, path);
    await this.enqueue(key, async () => {
      await this.storage.delete(path, userId);
      this.timelineCache.delete(key);
    });
  }
  async listProfiles(userId) {
    const files = await this.storage.list("profiles/", userId);
    const characterIds = /* @__PURE__ */ new Set();
    for (const path of files) {
      const match = /^profiles\/([^/]+)\.v[12]\.json$/.exec(path);
      if (match) characterIds.add(match[1]);
    }
    const profiles = [];
    for (const characterId of characterIds) {
      profiles.push(await this.getProfile(userId, characterId));
    }
    return profiles;
  }
  clearUser(userId) {
    for (const cache of [this.settingsCache, this.profileCache, this.timelineCache]) {
      for (const key of cache.keys()) {
        if (key.startsWith(`${userId}:`)) cache.delete(key);
      }
    }
  }
};
var RevisionConflict = class extends Error {
  constructor(currentRevision) {
    super(`Revision conflict; current revision is ${currentRevision}.`);
    this.currentRevision = currentRevision;
    this.name = "RevisionConflict";
  }
  currentRevision;
};

// src/ownership.ts
async function confirmExtensionOwnedImageIds(imageIds, lookup) {
  const unique = [...new Set(imageIds)];
  const records = await Promise.all(unique.map(async (imageId) => {
    try {
      return await lookup(imageId);
    } catch {
      return null;
    }
  }));
  return records.filter((record2) => !!record2 && record2.owner_extension_identifier === LUMI_STAGE_ID).map((record2) => record2.id);
}

// src/timeline.ts
function findCachedDecision(records, message, requestFingerprint) {
  if (!requestFingerprint) return null;
  return records.find(
    (record2) => record2.messageId === message.id && record2.swipeId === message.swipeId && record2.contentHash === message.contentHash && record2.requestFingerprint === requestFingerprint
  ) ?? null;
}
function upsertDecision(records, incoming, limit = 2e3) {
  return [
    ...records.filter((record2) => !(record2.messageId === incoming.messageId && record2.swipeId === incoming.swipeId && record2.contentHash === incoming.contentHash)),
    incoming
  ].slice(-limit);
}
function reconcileDecisionRecords(records, messages) {
  const active = new Map(messages.map((message) => [message.id, message]));
  return records.filter((record2) => {
    const message = active.get(record2.messageId);
    if (!message) return false;
    if (record2.swipeId !== message.swipeId) return true;
    return record2.contentHash === message.contentHash;
  });
}
function replayTimeline(timeline, catalog, settings, messages, now = Date.now()) {
  const decisions = reconcileDecisionRecords(timeline.decisions, messages);
  const retainedSnapshot = applyDecision(
    timeline.snapshot,
    catalog,
    {
      schemaVersion: 2,
      focusedCharacterIds: [],
      characters: []
    },
    timeline.manualOverrides,
    settings,
    now
  );
  const latestAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  const latestDecision = latestAssistant ? decisions.find(
    (record2) => record2.messageId === latestAssistant.id && record2.swipeId === latestAssistant.swipeId && record2.contentHash === latestAssistant.contentHash
  ) : null;
  const latestDecisionRejected = latestDecision?.decision.characters.some(
    (character) => character.confidence < settings.detection.confidence
  ) ?? false;
  let snapshot = emptySnapshot(timeline.chatId, now);
  for (const message of messages) {
    if (message.role !== "assistant") continue;
    const cached = decisions.find(
      (record2) => record2.messageId === message.id && record2.swipeId === message.swipeId && record2.contentHash === message.contentHash
    );
    if (!cached) continue;
    snapshot = applyDecision(
      snapshot,
      catalog,
      cached.decision,
      timeline.manualOverrides,
      settings,
      cached.createdAt
    );
  }
  if (!latestAssistant || !latestDecision || latestDecisionRejected || Object.keys(snapshot.characters).length === 0) {
    snapshot = retainedSnapshot;
  }
  return {
    ...timeline,
    decisions,
    snapshot,
    revision: timeline.revision + 1,
    updatedAt: now
  };
}
function resolveChatCharacterIds(chat) {
  const metadata = chat.metadata && typeof chat.metadata === "object" && !Array.isArray(chat.metadata) ? chat.metadata : {};
  const directCharacterId = typeof chat.character_id === "string" ? chat.character_id : typeof chat.characterId === "string" ? chat.characterId : null;
  const groupIds = metadata.group === true && Array.isArray(metadata.character_ids) ? metadata.character_ids.filter(
    (id) => typeof id === "string" && id.length > 0
  ) : directCharacterId ? [directCharacterId] : [];
  const muted = new Set(
    Array.isArray(metadata.muted_character_ids) ? metadata.muted_character_ids.filter((id) => typeof id === "string") : []
  );
  const characterIds = [...new Set(groupIds)].filter((id) => !muted.has(id));
  return {
    characterIds,
    primaryCharacterId: characterIds.includes(directCharacterId ?? "") ? directCharacterId : characterIds[0] ?? null
  };
}

// src/backend.ts
var repository = new LumiStageRepository(spindle.userStorage);
var activeContexts = /* @__PURE__ */ new Map();
var chatUsers = /* @__PURE__ */ new Map();
var generationUsers = /* @__PURE__ */ new Map();
var activeGenerations = /* @__PURE__ */ new Map();
var scheduled = /* @__PURE__ */ new Map();
var analysisQueues = /* @__PURE__ */ new Map();
var queueDepth = /* @__PURE__ */ new Map();
var lastDetection = /* @__PURE__ */ new Map();
var detectorFlights = /* @__PURE__ */ new Map();
var recentDetectorRuns = /* @__PURE__ */ new Map();
var mediaViewCache = /* @__PURE__ */ new Map();
var diagnosticCounters = /* @__PURE__ */ new Map();
var onEvent = spindle.on;
function asRecord3(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function readString(value, keys) {
  const raw = asRecord3(value);
  for (const key of keys) if (typeof raw[key] === "string" && raw[key]) return raw[key];
  return null;
}
function extractChatId(value) {
  return readString(value, ["chatId", "chat_id", "id"]);
}
function resolveUserId(chatId, eventUserId) {
  return eventUserId ?? (chatId ? chatUsers.get(chatId) ?? null : null);
}
function send(message, userId) {
  spindle.sendToFrontend(message, userId);
}
function settleBackground(operation) {
  void operation.catch(() => void 0);
}
function countersFor(userId) {
  const current = diagnosticCounters.get(userId) ?? { revisionConflicts: 0, cleanupFailures: [] };
  diagnosticCounters.set(userId, current);
  return current;
}
function trackCleanup(userId, label, operation) {
  void operation.catch((error) => {
    const counters = countersFor(userId);
    const message = `${label}: ${error instanceof Error ? error.message : "cleanup failed"}`;
    counters.cleanupFailures = [...counters.cleanupFailures.slice(-19), message];
    send({ type: "notice", tone: "warning", message: `${label} completed, but unused media cleanup needs attention.` }, userId);
  });
}
function hasPermission(permission) {
  try {
    return spindle.permissions.has(permission);
  } catch {
    return false;
  }
}
function permissions() {
  return {
    generation: hasPermission("generation"),
    chats: hasPermission("chats"),
    chatMutation: hasPermission("chat_mutation"),
    characters: hasPermission("characters"),
    images: hasPermission("images"),
    uiPanels: hasPermission("ui_panels")
  };
}
async function connectionViews(userId) {
  if (!hasPermission("generation")) return [];
  const connections = await spindle.connections.list(userId).catch(() => []);
  return connections.map((connection) => ({
    id: connection.id,
    name: connection.name,
    provider: connection.provider,
    model: connection.model,
    isDefault: connection.is_default,
    hasApiKey: connection.has_api_key
  }));
}
async function generateDetector(userId, request, settings, signal) {
  const selectedModel = settings.model?.trim() || null;
  if (!selectedModel) {
    return spindle.generate.quiet({ ...request, userId, signal });
  }
  let connectionId = settings.connectionId;
  if (!connectionId) {
    const connections = await spindle.connections.list(userId).catch(() => []);
    connectionId = connections.find((connection) => connection.is_default)?.id ?? null;
  }
  if (!connectionId) {
    throw new Error("Select a LumiStage detection connection before overriding its model.");
  }
  return spindle.generate.raw({
    ...request,
    connection_id: connectionId,
    provider: "",
    model: selectedModel,
    userId,
    signal
  });
}
function queueKey(userId, chatId) {
  return `${userId}:${chatId}`;
}
function markGenerationStarted(generationId, userId, chatId) {
  generationUsers.set(generationId, { userId, chatId });
  const key = queueKey(userId, chatId);
  const generations = activeGenerations.get(key) ?? /* @__PURE__ */ new Set();
  generations.add(generationId);
  activeGenerations.set(key, generations);
  const timer = scheduled.get(key);
  if (timer) clearTimeout(timer);
  scheduled.delete(key);
}
function markGenerationFinished(generationId) {
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
function generationInProgress(userId, chatId) {
  return Boolean(activeGenerations.get(queueKey(userId, chatId))?.size);
}
function enqueueAnalysis(userId, chatId, operation) {
  const key = queueKey(userId, chatId);
  const previous = analysisQueues.get(key) ?? Promise.resolve();
  queueDepth.set(key, (queueDepth.get(key) ?? 0) + 1);
  const next = previous.catch(() => void 0).then(operation).finally(() => {
    queueDepth.set(key, Math.max(0, (queueDepth.get(key) ?? 1) - 1));
    if (analysisQueues.get(key) === next) analysisQueues.delete(key);
  });
  analysisQueues.set(key, next);
  return next;
}
async function characterName(userId, characterId) {
  if (!hasPermission("characters")) return "Character";
  const character = await spindle.characters.get(characterId, userId).catch(() => null);
  return character?.name || "Character";
}
async function profilesForChat(userId, chatId) {
  if (!hasPermission("chats")) return { chat: {}, profiles: [], catalog: [], primaryCharacterId: null };
  const chatDto = await spindle.chats.get(chatId, userId);
  if (!chatDto) return { chat: {}, profiles: [], catalog: [], primaryCharacterId: null };
  const { characterIds: ids, primaryCharacterId } = resolveChatCharacterIds(chatDto);
  const profiles = [];
  for (const characterId of ids) profiles.push(await repository.getProfile(userId, characterId, await characterName(userId, characterId)));
  return {
    chat: chatDto,
    profiles,
    catalog: buildCatalog(profiles),
    primaryCharacterId
  };
}
async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await mapper(items[index]);
    }
  }));
  return results;
}
async function variantViewsForProfiles(userId, profiles) {
  const cacheKeys = profiles.map((profile) => `${userId}:${profile.characterId}:${profile.revision}`);
  const cached = cacheKeys.map((key) => mediaViewCache.get(key));
  if (cached.every(Boolean)) return Object.assign({}, ...cached);
  const variants = profiles.flatMap(allVariants);
  if (variants.length === 0) return {};
  if (!hasPermission("images")) return Object.fromEntries(variants.map((variant) => [variant.id, { ...variant, url: null, thumbUrl: null }]));
  const urls = /* @__PURE__ */ new Map();
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
        userId
      }).catch(() => ({ data: [], total: 0 }));
      total = page.total;
      for (const item of page.data) urls.set(item.id, item.url);
      offset += page.data.length || 200;
    } while (offset < total);
  }
  const missing = [...new Set(variants.map((variant) => variant.imageId).filter((id) => !urls.has(id)))];
  const fetched = await mapWithConcurrency(
    missing,
    12,
    async (imageId) => spindle.images.get(imageId, { onlyOwned: true, specificity: "full", userId }).catch(() => null)
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
      Object.entries(views).filter(([variantId]) => variantIds.has(variantId))
    ));
  }
  while (mediaViewCache.size > 200) {
    const oldestKey = mediaViewCache.keys().next().value;
    if (typeof oldestKey !== "string") break;
    mediaViewCache.delete(oldestKey);
  }
  return views;
}
async function buildState(userId, chatId, characterId) {
  const context = activeContexts.get(userId);
  const activeChatId = chatId === void 0 ? context?.chatId ?? null : chatId;
  let activeCharacterId = characterId === void 0 ? context?.characterId ?? null : characterId;
  const settings = await repository.getSettings(userId);
  let profile = null;
  let timeline = null;
  let profiles = [];
  let activeCharacterName = null;
  if (activeChatId) {
    const set = await profilesForChat(userId, activeChatId);
    profiles = set.profiles;
    timeline = await repository.getTimeline(userId, activeChatId);
    const activeProfileIds = new Set(profiles.map((item) => item.characterId));
    const characters = Object.fromEntries(
      Object.entries(timeline.snapshot.characters).filter(([characterId2]) => activeProfileIds.has(characterId2))
    );
    const focusedCharacterIds = timeline.snapshot.focusedCharacterIds.filter((characterId2) => activeProfileIds.has(characterId2));
    if (Object.keys(characters).length !== Object.keys(timeline.snapshot.characters).length || focusedCharacterIds.length !== timeline.snapshot.focusedCharacterIds.length) {
      timeline = {
        ...timeline,
        snapshot: {
          ...timeline.snapshot,
          characters,
          focusedCharacterIds
        }
      };
    }
    const resolvedId = activeCharacterId ?? set.primaryCharacterId;
    profile = profiles.find((item) => item.characterId === resolvedId) ?? profiles.find((item) => item.characterId === set.primaryCharacterId) ?? profiles[0] ?? null;
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
    lastDetection: activeChatId ? lastDetection.get(queueKey(userId, activeChatId)) ?? { status: "idle", message: "No detection has run yet.", at: null } : { status: "idle", message: "No detection has run yet.", at: null }
  };
}
async function sendState(userId, chatId, characterId) {
  send({ type: "state", state: await buildState(userId, chatId, characterId) }, userId);
}
async function normalizedMessages(chatId) {
  if (!hasPermission("chat_mutation")) return [];
  const messages = await spindle.chat.getMessages(chatId);
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: typeof message.content === "string" ? message.content : "",
    swipeId: Number.isFinite(message.swipe_id) ? message.swipe_id : 0,
    __isChatHistory: true
  }));
}
async function messagesForAnalysis(chatId, expectedMessageId) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const messages = await normalizedMessages(chatId);
    if (!expectedMessageId) return messages;
    const latestAssistant = [...messages].reverse().find((message) => message.role === "assistant" && !!message.content);
    if (latestAssistant?.id === expectedMessageId) return messages;
    if (attempt < 7) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  return null;
}
async function rebuildTimeline(timeline, catalog, settings, messages) {
  const keys = await Promise.all(messages.map(async (message) => ({
    id: message.id,
    role: message.role,
    swipeId: message.swipeId,
    contentHash: await sha256(message.content)
  })));
  return replayTimeline(timeline, catalog, settings, keys);
}
async function analyzeLatest(userId, chatId, force = false, detectionOverride, expectedMessageId) {
  if (!hasPermission("generation") || !hasPermission("chat_mutation") || !hasPermission("chats")) {
    lastDetection.set(queueKey(userId, chatId), { status: "error", message: "Generation, Chats, and Chat History permissions are required for automation.", at: Date.now() });
    await sendState(userId).catch(() => void 0);
    return;
  }
  const persistedSettings = await repository.getSettings(userId);
  const settings = detectionOverride ? normalizeSettings({ ...persistedSettings, detection: detectionOverride }) : persistedSettings;
  if (!settings.detection.enabled && !force) return;
  const set = await profilesForChat(userId, chatId);
  if (set.catalog.length === 0 || !set.profiles.some((profile) => allVariants(profile).length > 0)) {
    lastDetection.set(queueKey(userId, chatId), { status: "error", message: "No LumiStage media is configured for this chat.", at: Date.now() });
    await sendState(userId).catch(() => void 0);
    return;
  }
  const messages = await messagesForAnalysis(chatId, expectedMessageId);
  if (!messages) return;
  const latest = [...messages].reverse().find((message) => message.role === "assistant" && !!message.content);
  if (!latest) return;
  let timeline = await repository.getTimeline(userId, chatId);
  const expectedTimelineRevision = timeline.revision;
  const contentHash = await sha256(latest.content);
  const recentMessages = messages.filter((message) => message.__isChatHistory === true).slice(-settings.detection.contextMessages).map(({ role, content }) => ({ role, content }));
  const currentStates = Object.fromEntries(Object.entries(timeline.snapshot.characters).map(([characterId, state]) => [
    characterId,
    { outfitId: state.outfitId, expressionId: state.expressionId, variantId: state.variantId }
  ]));
  const detectorCatalog = constrainCatalogToManualOverrides(set.catalog, timeline.manualOverrides);
  const requestFingerprint = await sha256(JSON.stringify({
    catalog: detectorCatalog.map((entry) => entry.profile),
    detection: settings.detection,
    overrides: timeline.manualOverrides,
    recentMessages,
    latest: { id: latest.id, swipeId: latest.swipeId, contentHash }
  }));
  let record2 = force ? null : findCachedDecision(timeline.decisions, {
    id: latest.id,
    swipeId: latest.swipeId,
    contentHash
  }, requestFingerprint);
  const detectorMessageKey = `${queueKey(userId, chatId)}:${latest.id}:${latest.swipeId}:${contentHash}`;
  let detectorInputTokens = null;
  if (!record2) {
    const recent = recentDetectorRuns.get(detectorMessageKey);
    const recentWindow = force ? 5e3 : 3e4;
    if (recent && Date.now() - recent.completedAt <= recentWindow && (!force || recent.requestFingerprint === requestFingerprint)) {
      record2 = recent.record;
      detectorInputTokens = recent.detectorInputTokens;
    }
  }
  lastDetection.set(queueKey(userId, chatId), { status: "running", message: record2 ? "Restoring cached stage decision\u2026" : "Analyzing the latest reply\u2026", at: Date.now() });
  await sendState(userId).catch(() => void 0);
  if (!record2) {
    const builtRequest = buildDetectorRequest(
      detectorCatalog,
      recentMessages,
      currentStates,
      settings,
      timeline.manualOverrides
    );
    const {
      estimatedInputTokens,
      ...request
    } = builtRequest;
    detectorInputTokens = typeof estimatedInputTokens === "number" ? estimatedInputTokens : null;
    const flightKey = `${detectorMessageKey}:${requestFingerprint}`;
    let flight = detectorFlights.get(flightKey);
    if (!flight) {
      const started = (async () => {
        const response = await generateDetector(
          userId,
          request,
          settings.detection,
          AbortSignal.timeout(6e4)
        );
        const usedInputTokens = response.usage?.prompt_tokens ?? response.usage?.input_tokens ?? detectorInputTokens;
        const parsed = parseDetectorResponse(response, detectorCatalog);
        if (!parsed) throw new Error("The detector did not return a valid stage decision.");
        const decision = validateDecision(parsed, detectorCatalog);
        if (decision.characters.length === 0 && decision.focusedCharacterIds.length === 0) {
          throw new Error("The detector returned no valid characters.");
        }
        return {
          record: {
            messageId: latest.id,
            swipeId: latest.swipeId,
            contentHash,
            requestFingerprint,
            decision,
            provider: response.provider ?? null,
            model: response.model ?? settings.detection.model,
            createdAt: Date.now()
          },
          detectorInputTokens: usedInputTokens,
          requestFingerprint,
          completedAt: Date.now()
        };
      })();
      const tracked = started.finally(() => {
        if (detectorFlights.get(flightKey) === tracked) detectorFlights.delete(flightKey);
      });
      detectorFlights.set(flightKey, tracked);
      flight = tracked;
    }
    const outcome = await flight;
    record2 = outcome.record;
    detectorInputTokens = outcome.detectorInputTokens;
    recentDetectorRuns.set(detectorMessageKey, outcome);
    const cutoff = Date.now() - 6e4;
    for (const [key, recent] of recentDetectorRuns) {
      if (recent.completedAt < cutoff) recentDetectorRuns.delete(key);
    }
  }
  timeline.decisions = upsertDecision(timeline.decisions, record2);
  timeline.manualOverrides = consumeOnceOverrides(timeline.manualOverrides);
  timeline = await rebuildTimeline(timeline, set.catalog, settings, messages);
  timeline = await repository.saveTimeline(userId, timeline, expectedTimelineRevision);
  lastDetection.set(queueKey(userId, chatId), {
    status: "success",
    message: `Stage settled for ${record2.decision.focusedCharacterIds.length || record2.decision.characters.length} character(s).${detectorInputTokens ? ` Detector input: ${detectorInputTokens.toLocaleString()} tokens.` : ""}`,
    at: Date.now()
  });
  await sendState(userId).catch(() => void 0);
}
function scheduleAnalysis(userId, chatId, delay = 120, force = false, expectedMessageId) {
  const key = queueKey(userId, chatId);
  if (!force && generationInProgress(userId, chatId)) return;
  const old = scheduled.get(key);
  if (old) clearTimeout(old);
  scheduled.set(key, setTimeout(() => {
    scheduled.delete(key);
    void enqueueAnalysis(userId, chatId, () => analyzeLatest(
      userId,
      chatId,
      force,
      void 0,
      expectedMessageId
    ).catch(async (error) => {
      lastDetection.set(queueKey(userId, chatId), {
        status: "error",
        message: error instanceof Error ? error.message : "Stage detection failed.",
        at: Date.now()
      });
      await sendState(userId).catch(() => void 0);
    }));
  }, delay));
}
async function importAssets(userId, message) {
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
    await characterName(userId, message.characterId)
  );
  if (current.revision !== message.expectedRevision) throw new RevisionConflict(current.revision);
  const candidates = [];
  const newlyUploadedImageIds = [];
  let committed = false;
  try {
    for (const [index, staged] of message.uploads.entries()) {
      send({ type: "import-progress", requestId: message.requestId, completed: index, total: message.uploads.length, message: "Reading staged uploads\u2026" }, userId);
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
      [...allVariants(current), ...allVariants(message.baseProfile)].map((variant) => [variant.contentHash, variant])
    );
    const candidateHashes = await Promise.all(candidates.map((candidate) => sha256(candidate.bytes)));
    const preparedByHash = /* @__PURE__ */ new Map();
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
      strip_audio: candidate.mimeType.startsWith("video/")
    }));
    const results = uploadItems.length ? await spindle.images.uploadMany(uploadItems, { userId, concurrency: 8 }) : [];
    const storedByHash = /* @__PURE__ */ new Map();
    for (const [hash, variant] of existingByHash) {
      storedByHash.set(hash, {
        imageId: variant.imageId,
        contentHash: hash,
        fileName: variant.fileName,
        mimeType: variant.mimeType
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
        mimeType: prepared[index].candidate.mimeType
      });
      send({
        type: "import-progress",
        requestId: message.requestId,
        completed: index + 1,
        total: prepared.length,
        message: `Stored ${index + 1} of ${prepared.length} media files\u2026`
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
        mimeType: candidate.mimeType
      };
    });
    const merged = mergeImportedAssets(
      message.baseProfile,
      imported,
      message.baseProfile.characterName
    );
    const saved = await repository.saveProfile(
      userId,
      merged.profile,
      message.expectedRevision,
      message.baseProfile.characterName
    );
    committed = true;
    send({
      type: "operation-complete",
      requestId: message.requestId,
      revision: saved.revision,
      result: { profile: saved, imported: merged.imported, skipped: merged.skipped, errors: [] }
    }, userId);
    const views = await variantViewsForProfiles(userId, [saved]).catch(() => ({}));
    send({
      type: "import-complete",
      requestId: message.requestId,
      profile: saved,
      variantViews: views,
      imported: merged.imported,
      skipped: merged.skipped,
      errors: []
    }, userId);
  } catch (error) {
    if (!committed && newlyUploadedImageIds.length) {
      await spindle.images.deleteMany(newlyUploadedImageIds, { userId }).catch((cleanupError) => {
        const counters = countersFor(userId);
        counters.cleanupFailures = [
          ...counters.cleanupFailures.slice(-19),
          `Failed import rollback: ${cleanupError instanceof Error ? cleanupError.message : "cleanup failed"}`
        ];
      });
    }
    throw new Error(error instanceof Error ? error.message : "Import failed.");
  }
}
async function restoreArchive(userId, message) {
  if (!hasPermission("images")) throw new Error("Images permission is required to restore an archive.");
  if (!message.confirmed) throw new Error("Archive restore requires explicit confirmation.");
  if (!/\.lumistage\.zip$/i.test(message.upload.relativePath)) {
    throw new Error("Restore accepts exactly one .lumistage.zip archive.");
  }
  const current = await repository.getProfile(
    userId,
    message.characterId,
    await characterName(userId, message.characterId)
  );
  if (current.revision !== message.expectedRevision) throw new RevisionConflict(current.revision);
  const newlyUploadedImageIds = [];
  let committed = false;
  try {
    const upload = await spindle.uploads.get(message.upload.id, userId);
    if (!upload) throw new Error("The staged archive expired before it could be read.");
    let extracted;
    try {
      extracted = await extractLumiStageArchive(upload.data);
      if (extracted.errors.length) throw new Error(extracted.errors.join("; "));
    } finally {
      await spindle.uploads.delete(message.upload.id, userId);
    }
    const { manifest, candidates } = extracted;
    const candidateHashes = await Promise.all(candidates.map((candidate) => sha256(candidate.bytes)));
    const existingByHash = new Map(allVariants(current).map((variant) => [variant.contentHash, variant]));
    const preparedByHash = /* @__PURE__ */ new Map();
    for (let index = 0; index < candidates.length; index += 1) {
      const hash = candidateHashes[index];
      if (!existingByHash.has(hash) && !preparedByHash.has(hash)) {
        preparedByHash.set(hash, { candidate: candidates[index], hash });
      }
    }
    const prepared = [...preparedByHash.values()];
    const results = prepared.length ? await spindle.images.uploadMany(prepared.map(({ candidate }) => ({
      data: candidate.bytes,
      filename: candidate.fileName,
      mime_type: candidate.mimeType,
      owner_character_id: message.characterId,
      strip_audio: candidate.mimeType.startsWith("video/")
    })), { userId, concurrency: 8 }) : [];
    const storedByHash = /* @__PURE__ */ new Map();
    for (const [hash, variant] of existingByHash) {
      storedByHash.set(hash, {
        imageId: variant.imageId,
        contentHash: hash,
        fileName: variant.fileName,
        mimeType: variant.mimeType
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
        mimeType: prepared[index].candidate.mimeType
      });
    }
    const uploadedByPath = /* @__PURE__ */ new Map();
    for (let index = 0; index < candidates.length; index += 1) {
      const stored = storedByHash.get(candidateHashes[index]);
      if (!stored) throw new Error(`${candidates[index].path}: media storage did not return a reusable image.`);
      uploadedByPath.set(candidates[index].path, {
        ...stored,
        fileName: candidates[index].fileName,
        mimeType: candidates[index].mimeType
      });
    }
    const restored = hydrateArchiveProfile(
      manifest,
      message.characterId,
      current.characterName,
      uploadedByPath
    );
    const saved = await repository.saveProfile(userId, restored, message.expectedRevision, current.characterName);
    committed = true;
    send({
      type: "operation-complete",
      requestId: message.requestId,
      revision: saved.revision,
      result: { profile: saved }
    }, userId);
    const views = await variantViewsForProfiles(userId, [saved]).catch(() => ({}));
    send({ type: "profile", profile: saved, variantViews: views }, userId);
    const retainedImageIds = new Set(allVariants(saved).map((variant) => variant.imageId));
    const removedImageIds = allVariants(current).filter((variant) => !retainedImageIds.has(variant.imageId)).map((variant) => variant.imageId);
    if (removedImageIds.length) {
      trackCleanup(userId, "Archive restore", deleteOwnedImagesIfUnreferenced(userId, removedImageIds));
    }
  } catch (error) {
    if (!committed && newlyUploadedImageIds.length) {
      await spindle.images.deleteMany(newlyUploadedImageIds, { userId }).catch((cleanupError) => {
        const counters = countersFor(userId);
        counters.cleanupFailures = [
          ...counters.cleanupFailures.slice(-19),
          `Failed restore rollback: ${cleanupError instanceof Error ? cleanupError.message : "cleanup failed"}`
        ];
      });
    }
    throw error;
  }
}
function archiveForProfile(profile) {
  const variants = [];
  for (const outfit of profile.outfits) {
    for (const expression of outfit.expressions) for (const variant of expression.variants) {
      const extension = variant.fileName.includes(".") ? variant.fileName.split(".").pop() : variant.mimeType.split("/").pop();
      variants.push({
        path: `assets/${variant.contentHash}.${extension || "bin"}`,
        characterId: profile.characterId,
        outfitId: outfit.id,
        expressionId: expression.id,
        variant
      });
    }
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    kind: "lumistage-archive",
    exportedAt: Date.now(),
    profile,
    variants
  };
}
async function exportProfile(userId, characterId) {
  if (!hasPermission("images")) throw new Error("Images permission is required to export media.");
  const profile = await repository.getProfile(userId, characterId, await characterName(userId, characterId));
  const archive = archiveForProfile(profile);
  const urls = {};
  await mapWithConcurrency(archive.variants, 8, async (entry) => {
    const image = await spindle.images.get(entry.variant.imageId, { onlyOwned: true, specificity: "full", userId });
    if (!image?.url) throw new Error(`Export media is unavailable: ${entry.path}.`);
    urls[entry.path] = image.url;
  });
  return { archive, urls };
}
async function deleteOwnedImagesIfUnreferenced(userId, candidateImageIds) {
  const profiles = await repository.listProfiles(userId);
  const unreferenced = unreferencedImageIds(profiles, candidateImageIds);
  const deletable = await confirmExtensionOwnedImageIds(
    unreferenced,
    (imageId) => spindle.images.get(
      imageId,
      { onlyOwned: true, specificity: "metadata", userId }
    )
  );
  if (deletable.length) await spindle.images.deleteMany(deletable, { userId });
}
async function handleMessage(message, userId) {
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
      result: { settings: saved }
    }, userId);
    await sendState(userId).catch(() => void 0);
    return;
  }
  if (message.type === "save-profile") {
    const before = await repository.getProfile(
      userId,
      message.profile.characterId,
      message.profile.characterName
    );
    const saved = await repository.saveProfile(userId, message.profile, message.expectedRevision);
    const retainedImageIds = new Set(allVariants(saved).map((variant) => variant.imageId));
    const removedImageIds = allVariants(before).filter((variant) => !retainedImageIds.has(variant.imageId)).map((variant) => variant.imageId);
    send({ type: "operation-complete", requestId: message.requestId, revision: saved.revision }, userId);
    send({
      type: "profile",
      profile: saved,
      variantViews: await variantViewsForProfiles(userId, [saved]).catch(() => ({}))
    }, userId);
    if (removedImageIds.length && hasPermission("images")) {
      trackCleanup(userId, "Profile save", deleteOwnedImagesIfUnreferenced(userId, removedImageIds));
    }
    return;
  }
  if (message.type === "save-chat-layout") {
    const timeline = await repository.getTimeline(userId, message.chatId);
    if (timeline.revision !== message.expectedRevision) throw new RevisionConflict(timeline.revision);
    const next = {
      ...timeline,
      revision: timeline.revision + 1,
      layoutOverride: message.layoutOverride ? structuredClone(message.layoutOverride) : null,
      updatedAt: Date.now()
    };
    const saved = await repository.saveTimeline(userId, next, message.expectedRevision);
    send({ type: "operation-complete", requestId: message.requestId, revision: saved.revision }, userId);
    await sendState(userId).catch(() => void 0);
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
    await sendState(userId).catch(() => void 0);
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
    await sendState(userId).catch(() => void 0);
    return;
  }
  if (message.type === "analyze-now") {
    await enqueueAnalysis(
      userId,
      message.chatId,
      () => analyzeLatest(userId, message.chatId, true, message.detection)
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
    await Promise.all(message.uploadIds.map(
      (uploadId) => spindle.uploads.delete(uploadId, userId).catch(() => void 0)
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
      profile.characterName
    );
    send({ type: "operation-complete", requestId: message.requestId, revision: next.revision }, userId);
    send({
      type: "profile",
      profile: next,
      variantViews: await variantViewsForProfiles(userId, [next]).catch(() => ({}))
    }, userId);
    trackCleanup(userId, "Variant deletion", deleteOwnedImagesIfUnreferenced(
      userId,
      variants.map((variant) => variant.imageId)
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
    const diagnosticProfiles = context?.chatId ? (await profilesForChat(userId, context.chatId)).profiles : context?.characterId ? [await repository.getProfile(userId, context.characterId, await characterName(userId, context.characterId))] : [];
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
      false
    );
    const estimatedCatalogTokens = typeof estimatedRequest.estimatedInputTokens === "number" ? estimatedRequest.estimatedInputTokens : 0;
    const report = {
      generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0.0",
      permissions: permissions(),
      active: {
        hasChat: !!context?.chatId,
        hasCharacter: !!context?.characterId,
        queueDepth: context?.chatId ? queueDepth.get(queueKey(userId, context.chatId)) ?? 0 : 0
      },
      persistence: {
        revisionConflicts: counters.revisionConflicts,
        cleanupFailures: [...counters.cleanupFailures]
      },
      connection: {
        generationPermission: hasPermission("generation"),
        selection: settings.detection.connectionId ? "configured" : "active-host-connection",
        modelOverride: settings.detection.model ? "configured" : "none"
      },
      media: {
        total: media.length,
        missing: hasPermission("images") ? media.filter((variant) => !views[variant.id]?.url).length : null,
        ownershipVerified: hasPermission("images")
      },
      catalog: {
        characters: diagnosticProfiles.length,
        outfits: diagnosticProfiles.reduce((sum, item) => sum + item.outfits.length, 0),
        variants: media.length,
        estimatedDetectorInputTokens: estimatedCatalogTokens,
        oversized: estimatedCatalogTokens > 24e3,
        issues: diagnosticProfiles.flatMap((item) => inspectProfile(item))
      },
      detector: context?.chatId ? lastDetection.get(queueKey(userId, context.chatId)) ?? null : null
    };
    send({
      type: "diagnostics",
      requestId: message.requestId,
      report
    }, userId);
    send({ type: "operation-complete", requestId: message.requestId, result: report }, userId);
  }
}
spindle.onFrontendMessage(async (payload, userId) => {
  const message = payload;
  try {
    await handleMessage(message, userId);
  } catch (error) {
    if (error instanceof RevisionConflict) {
      countersFor(userId).revisionConflicts += 1;
      send({
        type: "error",
        requestId: "requestId" in message ? message.requestId : void 0,
        code: "REVISION_CONFLICT",
        message: error.message,
        currentRevision: error.currentRevision
      }, userId);
      await sendState(userId).catch(() => void 0);
      return;
    }
    send({
      type: "error",
      requestId: "requestId" in message ? message.requestId : void 0,
      code: "OPERATION_FAILED",
      message: error instanceof Error ? error.message : "LumiStage operation failed."
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
  const messageId = readString(payload, ["messageId", "message_id"]);
  const remembered = generationId ? generationUsers.get(generationId) : null;
  const chatId = extractChatId(payload) ?? remembered?.chatId ?? null;
  const userId = resolveUserId(chatId, eventUserId ?? remembered?.userId);
  markGenerationFinished(generationId);
  if (!chatId || !userId || readString(payload, ["error"]) || !messageId) return;
  if (generationInProgress(userId, chatId)) return;
  scheduleAnalysis(userId, chatId, 120, false, messageId);
});
onEvent("GENERATION_STOPPED", (payload) => {
  const generationId = readString(payload, ["generationId", "generation_id"]);
  markGenerationFinished(generationId);
});
for (const event of ["MESSAGE_EDITED", "MESSAGE_SWIPED", "SWIPE_EDITED"]) {
  onEvent(event, (payload, eventUserId) => {
    const raw = asRecord3(payload);
    const changedMessage = asRecord3(raw.message);
    const chatId = extractChatId(payload) ?? extractChatId(raw.message);
    const userId = resolveUserId(chatId, eventUserId);
    const role = readString(changedMessage, ["role"]) ?? readString(payload, ["role"]);
    const messageId = role === "assistant" ? readString(changedMessage, ["id", "messageId", "message_id"]) ?? readString(payload, ["messageId", "message_id"]) ?? void 0 : void 0;
    if (chatId && userId) scheduleAnalysis(userId, chatId, 280, false, messageId);
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
    timeline.decisions = timeline.decisions.filter((record2) => record2.messageId !== messageId);
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
  for (const detectorKey of recentDetectorRuns.keys()) {
    if (detectorKey.startsWith(`${key}:`)) recentDetectorRuns.delete(detectorKey);
  }
  for (const detectorKey of detectorFlights.keys()) {
    if (detectorKey.startsWith(`${key}:`)) detectorFlights.delete(detectorKey);
  }
  queueDepth.delete(key);
  lastDetection.delete(key);
  settleBackground(repository.deleteTimeline(userId, chatId));
});
spindle.permissions.onChanged(() => {
  for (const userId of activeContexts.keys()) settleBackground(sendState(userId));
});
