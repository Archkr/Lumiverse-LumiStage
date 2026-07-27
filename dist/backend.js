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
  return cleanName(value, "").toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

// src/types.ts
var SCHEMA_VERSION = 1;
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
    stateConfidence: 0.6,
    outfitConfidence: 0.85
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
function finite(value, fallback, min, max2) {
  const number = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max2, Math.max(min, number));
}
function strings(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean))];
}
function defaultSettings(now = Date.now()) {
  return structuredClone({ ...DEFAULT_SETTINGS, updatedAt: now });
}
function normalizeSettings(raw, now = Date.now()) {
  const source = raw && typeof raw === "object" ? raw : {};
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
      outfitConfidence: finite(detection.outfitConfidence, 0.85, 0, 1)
    },
    appearance: {
      transition: ["crossfade", "lift", "cut"].includes(appearance.transition) ? appearance.transition : "crossfade",
      transitionMs: Math.round(finite(appearance.transitionMs, 280, 0, 2e3)),
      opacity: finite(appearance.opacity, 1, 0.1, 1),
      focusedScale: finite(appearance.focusedScale, 1.035, 0.8, 1.3),
      idleOpacity: finite(appearance.idleOpacity, 0.46, 0.05, 1),
      showCaptions: appearance.showCaptions !== false,
      showChrome: appearance.showChrome !== false,
      ensembleOverlap: finite(appearance.ensembleOverlap, 0.34, 0, 0.8),
      width: Math.round(finite(appearance.width, 320, 180, 1200)),
      height: Math.round(finite(appearance.height, 420, 220, 1e3)),
      x: finite(appearance.x, -1, -1, 1e5),
      y: finite(appearance.y, -1, -1, 1e5),
      fullscreen: appearance.fullscreen === true,
      visible: appearance.visible !== false
    },
    preloadAdjacent: Math.round(finite(source.preloadAdjacent, 3, 0, 12)),
    updatedAt: typeof source.updatedAt === "number" ? source.updatedAt : now
  };
}
function createExpression(name = "Neutral", now = Date.now()) {
  return {
    id: createId("expression"),
    name: cleanName(name, "Neutral"),
    aliases: [],
    cues: [],
    tags: [],
    enabled: true,
    priority: 0,
    order: 0,
    assets: []
  };
}
function createOutfit(name = "Default", now = Date.now()) {
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
    expressions: [expression]
  };
}
function createActor(name, now = Date.now()) {
  const outfit = createOutfit("Default", now);
  return {
    id: createId("actor"),
    name: cleanName(name, "Actor"),
    aliases: [],
    enabled: true,
    order: 0,
    defaultOutfitId: outfit.id,
    outfits: [outfit]
  };
}
function createProfile(characterId, characterName2 = "Character", now = Date.now()) {
  const actor = createActor(characterName2, now);
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: 0,
    characterId,
    characterName: cleanName(characterName2, "Character"),
    defaultActorId: actor.id,
    actors: [actor],
    createdAt: now,
    updatedAt: now
  };
}
function normalizeAsset(value, index) {
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
    priority: finite(value.priority, 0, -1e3, 1e3),
    createdAt: typeof value.createdAt === "number" ? value.createdAt : Date.now()
  };
}
function normalizeExpression(raw, index) {
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : createId("expression"),
    name: cleanName(raw.name ?? `Expression ${index + 1}`, `Expression ${index + 1}`),
    aliases: strings(raw.aliases),
    cues: strings(raw.cues),
    tags: strings(raw.tags),
    enabled: raw.enabled !== false,
    priority: finite(raw.priority, 0, -1e3, 1e3),
    order: finite(raw.order, index, 0, 1e5),
    assets: (raw.assets ?? []).map(normalizeAsset).filter((asset) => !!asset)
  };
}
function mergeExpression(target, source) {
  target.aliases = [.../* @__PURE__ */ new Set([...target.aliases, ...source.aliases])];
  target.cues = [.../* @__PURE__ */ new Set([...target.cues, ...source.cues])];
  target.tags = [.../* @__PURE__ */ new Set([...target.tags, ...source.tags])];
  const assetIds = new Set(target.assets.map((asset) => asset.id));
  const hashes = new Set(target.assets.map((asset) => asset.contentHash));
  target.assets.push(...source.assets.filter((asset) => !assetIds.has(asset.id) && !hashes.has(asset.contentHash)));
  target.enabled ||= source.enabled;
  target.priority = Math.max(target.priority, source.priority);
}
function normalizeOutfit(raw, index) {
  const legacyPoses = Array.isArray(raw.poses) ? raw.poses : [];
  const sourceExpressions = [
    ...Array.isArray(raw.expressions) ? raw.expressions : [],
    ...legacyPoses.flatMap((pose) => Array.isArray(pose.expressions) ? pose.expressions : [])
  ];
  const expressions = [];
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
    priority: finite(raw.priority, 0, -1e3, 1e3),
    order: finite(raw.order, index, 0, 1e5),
    allowAutoSwitch: raw.allowAutoSwitch !== false,
    defaultExpressionId: expressions.some((item) => item.id === requestedDefault) ? requestedDefault ?? null : expressions[0]?.id ?? null,
    expressions
  };
}
function normalizeActor(raw, index) {
  const outfits = (raw.outfits ?? []).map(normalizeOutfit);
  if (outfits.length === 0) outfits.push(createOutfit("Default"));
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : createId("actor"),
    name: cleanName(raw.name ?? `Actor ${index + 1}`, `Actor ${index + 1}`),
    aliases: strings(raw.aliases),
    enabled: raw.enabled !== false,
    order: finite(raw.order, index, 0, 1e5),
    defaultOutfitId: outfits.some((item) => item.id === raw.defaultOutfitId) ? raw.defaultOutfitId ?? null : outfits[0]?.id ?? null,
    outfits
  };
}
function normalizeProfile(raw, characterId, characterName2 = "Character", now = Date.now()) {
  if (!raw || typeof raw !== "object") return createProfile(characterId, characterName2, now);
  const source = raw;
  const actors = (source.actors ?? []).map(normalizeActor);
  if (actors.length === 0) actors.push(createActor(characterName2, now));
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: Math.max(0, Math.trunc(source.revision ?? 0)),
    characterId,
    characterName: cleanName(source.characterName ?? characterName2, "Character"),
    defaultActorId: actors.some((item) => item.id === source.defaultActorId) ? source.defaultActorId ?? null : actors[0]?.id ?? null,
    actors,
    createdAt: typeof source.createdAt === "number" ? source.createdAt : now,
    updatedAt: typeof source.updatedAt === "number" ? source.updatedAt : now
  };
}
function emptySnapshot(chatId, now = Date.now()) {
  return { schemaVersion: SCHEMA_VERSION, chatId, revision: 0, actors: {}, focusedActorIds: [], updatedAt: now };
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
  return profiles.flatMap(
    (profile) => profile.actors.filter((actor) => actor.enabled).map((actor) => ({ characterId: profile.characterId, actor, profile }))
  );
}
function allAssets(profile) {
  return profile.actors.flatMap(
    (actor) => actor.outfits.flatMap((outfit) => outfit.expressions.flatMap((expression) => expression.assets))
  );
}
function findActor(catalog, actorId) {
  return catalog.find((entry) => entry.actor.id === actorId) ?? null;
}
function enabledOutfit(actor, id) {
  const requested = actor.outfits.find((item) => item.id === id && item.enabled);
  if (requested) return requested;
  return actor.outfits.find((item) => item.id === actor.defaultOutfitId && item.enabled) ?? actor.outfits.filter((item) => item.enabled).sort((a, b) => b.priority - a.priority || a.order - b.order)[0] ?? null;
}
function enabledExpression(outfit, id) {
  const requested = outfit.expressions.find((item) => item.id === id && item.enabled);
  if (requested) return requested;
  return outfit.expressions.find((item) => item.id === outfit.defaultExpressionId && item.enabled) ?? outfit.expressions.filter((item) => item.enabled).sort((a, b) => b.priority - a.priority || a.order - b.order)[0] ?? null;
}
function enabledAsset(expression) {
  return expression.assets.filter((item) => item.enabled).sort((a, b) => b.priority - a.priority || b.createdAt - a.createdAt)[0] ?? null;
}
function resolveActorState(entry, previous, decision, override, settings, focused) {
  const actor = entry.actor;
  const currentOutfitId = override?.outfitId ?? previous?.outfitId ?? actor.defaultOutfitId;
  const mayChangeOutfit = !!decision && decision.confidence >= settings.detection.outfitConfidence && actor.outfits.some((item) => item.id === decision.outfitId && item.enabled && item.allowAutoSwitch);
  const outfitId = override?.outfitId ?? (mayChangeOutfit ? decision?.outfitId : currentOutfitId);
  const outfit = enabledOutfit(actor, outfitId);
  if (!outfit) return null;
  const stateConfident = !!decision && decision.confidence >= settings.detection.stateConfidence;
  const detectedExpressionId = stateConfident && outfit.expressions.some((item) => item.id === decision?.expressionId) ? decision?.expressionId : previous?.expressionId;
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
    label: `${actor.name} \xB7 ${outfit.name} \xB7 ${expression.name}`,
    focused,
    confidence: decision?.confidence ?? previous?.confidence ?? 1
  };
}
function applyDecision(snapshot, catalog, decision, overrides, settings, now = Date.now()) {
  const actors = { ...snapshot.actors };
  const focused = new Set(decision.focusedActorIds.filter((id) => findActor(catalog, id)));
  for (const entry of catalog) {
    const item = decision.actors.find((candidate) => candidate.actorId === entry.actor.id) ?? null;
    const state = resolveActorState(
      entry,
      actors[entry.actor.id] ?? null,
      item,
      overrides[entry.actor.id] ?? null,
      settings,
      focused.has(entry.actor.id)
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
    updatedAt: now
  };
}
function applyManualOverride(timeline, catalog, override, settings, now = Date.now()) {
  const nextOverrides = { ...timeline.manualOverrides, [override.actorId]: override };
  const focusIds = timeline.snapshot.focusedActorIds.length ? timeline.snapshot.focusedActorIds : [override.actorId];
  const decision = {
    schemaVersion: SCHEMA_VERSION,
    focusedActorIds: focusIds,
    actors: []
  };
  return {
    ...timeline,
    revision: timeline.revision + 1,
    manualOverrides: nextOverrides,
    snapshot: applyDecision(timeline.snapshot, catalog, decision, nextOverrides, settings, now),
    updatedAt: now
  };
}
function clearManualOverride(timeline, actorId, now = Date.now()) {
  const { [actorId]: _removed, ...manualOverrides } = timeline.manualOverrides;
  return { ...timeline, revision: timeline.revision + 1, manualOverrides, updatedAt: now };
}
function consumeOnceOverrides(overrides) {
  return Object.fromEntries(Object.entries(overrides).filter(([, override]) => override.scope !== "once"));
}
function inspectProfile(profile) {
  const issues = [];
  const hashes = /* @__PURE__ */ new Map();
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
    issues.push({ severity: "warning", code: "duplicate-content", message: `${count} media references share hash ${hash.slice(0, 10)}\u2026` });
  }
  return issues;
}

// node_modules/fflate/esm/index.mjs
import { createRequire } from "module";
var require2 = createRequire("/");
var _a;
var Worker;
var isMarkedAsUntransferable;
try {
  _a = require2("worker_threads"), Worker = _a.Worker, isMarkedAsUntransferable = _a.isMarkedAsUntransferable;
} catch (e) {
}
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
var b2 = function(d, b) {
  return d[b] | d[b + 1] << 8;
};
var b4 = function(d, b) {
  return (d[b] | d[b + 1] << 8 | d[b + 2] << 16 | d[b + 3] << 24) >>> 0;
};
var b8 = function(d, b) {
  return b4(d, b) + b4(d, b + 4) * 4294967296;
};
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
function unzipSync(data, opts) {
  var files = {};
  var e = data.length - 22;
  for (; b4(data, e) != 101010256; --e) {
    if (!e || data.length - e > 65558)
      err(13);
  }
  ;
  var c = b2(data, e + 8);
  if (!c)
    return {};
  var o = b4(data, e + 16);
  var z = b4(data, e - 20) == 117853008;
  if (z) {
    var ze = b4(data, e - 12);
    z = b4(data, ze) == 101075792;
    if (z) {
      c = b4(data, ze + 32);
      o = b4(data, ze + 48);
    }
  }
  var fltr = opts && opts.filter;
  for (var i = 0; i < c; ++i) {
    var _a2 = zh(data, o, z), c_2 = _a2[0], sc = _a2[1], su = _a2[2], fn = _a2[3], no = _a2[4], off = _a2[5], b = slzh(data, off);
    o = no;
    if (!fltr || fltr({
      name: fn,
      size: sc,
      originalSize: su,
      compression: c_2
    })) {
      if (!c_2)
        files[fn] = slc(data, b, b + sc);
      else if (c_2 == 8)
        files[fn] = inflateSync(data.subarray(b, b + sc), { out: new u8(su) });
      else
        err(14, "unknown compression type " + c_2);
    }
  }
  return files;
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
  if (parts.some((part) => !part || part === "." || part === ".." || part.includes("\0"))) return null;
  if (parts[0] === "__MACOSX" || parts.some((part) => part.startsWith("."))) return null;
  return parts.join("/");
}
function mimeForName(name) {
  const extension = name.split(".").pop()?.toLocaleLowerCase() ?? "";
  return MIME_TYPES[extension] ?? null;
}
function importTarget(candidate, layout, defaultActorName) {
  const folders = candidate.segments.map((segment) => cleanName(segment));
  const expression = cleanName(candidate.fileName, "Neutral");
  if (layout === "actor-outfit-expression") {
    return {
      actorName: folders[0] ?? defaultActorName,
      outfitName: folders[1] ?? "Default",
      expressionName: expression
    };
  }
  return {
    actorName: defaultActorName,
    outfitName: folders[0] ?? "Default",
    expressionName: expression
  };
}
function assertUnambiguousCandidates(candidates, layout, defaultActorName) {
  const paths = /* @__PURE__ */ new Map();
  const destinations = /* @__PURE__ */ new Map();
  const conflicts = [];
  for (const candidate of candidates) {
    const pathKey = candidate.path.normalize("NFKC").toLocaleLowerCase();
    const priorPath = paths.get(pathKey);
    if (priorPath) conflicts.push(`${priorPath} conflicts with ${candidate.path}`);
    else paths.set(pathKey, candidate.path);
    const target = importTarget(candidate, layout, defaultActorName);
    const destinationKey = [
      target.actorName,
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
    throw new Error(`Ambiguous import collisions: ${[...new Set(conflicts)].slice(0, 8).join("; ")}`);
  }
}
function extractArchive(bytes) {
  if (bytes.byteLength > MAX_ARCHIVE_BYTES) throw new Error(`Archive exceeds ${MAX_ARCHIVE_BYTES} bytes.`);
  let expandedBytes = 0;
  let acceptedCount = 0;
  const rejected = /* @__PURE__ */ new Map();
  const unzipped = unzipSync(bytes, {
    filter(info) {
      const path = normalizedArchivePath(info.name);
      if (!path) return false;
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
  });
  const candidates = [];
  const errors = [...rejected].map(([path, reason]) => `${path}: ${reason}`);
  for (const [rawPath, data] of Object.entries(unzipped)) {
    const path = normalizedArchivePath(rawPath);
    if (!path || data.byteLength === 0) continue;
    const mimeType = mimeForName(path);
    if (!mimeType) continue;
    const parts = path.split("/");
    const rawFileName = parts.pop() ?? path;
    candidates.push({
      path,
      fileName: rawFileName,
      bytes: data,
      mimeType,
      segments: parts
    });
  }
  return { candidates, errors };
}
function readLumiStageManifest(bytes) {
  let manifestBytes = null;
  const data = unzipSync(bytes, {
    filter(info) {
      const path = normalizedArchivePath(info.name);
      if (path !== "manifest.json") return false;
      if (info.originalSize > 5 * 1024 * 1024) throw new Error("LumiStage manifest exceeds 5 MB.");
      return true;
    }
  });
  manifestBytes = data["manifest.json"] ?? null;
  if (!manifestBytes) return null;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(manifestBytes));
    if (parsed?.kind !== "lumistage-archive" || parsed.schemaVersion !== 1 || !parsed.profile || !Array.isArray(parsed.assets)) {
      throw new Error("Unsupported LumiStage archive manifest.");
    }
    return parsed;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Invalid LumiStage manifest.");
  }
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
function findOrCreateActor(profile, name) {
  const key = normalizedKey(name);
  let actor = profile.actors.find((item) => normalizedKey(item.name) === key || item.aliases.some((alias) => normalizedKey(alias) === key));
  if (!actor) {
    actor = createActor(name);
    actor.outfits = [];
    actor.defaultOutfitId = null;
    actor.order = profile.actors.length;
    profile.actors.push(actor);
    profile.defaultActorId ??= actor.id;
  }
  return actor;
}
function findOrCreateOutfit(actor, name) {
  const key = normalizedKey(name);
  let outfit = actor.outfits.find((item) => normalizedKey(item.name) === key);
  if (!outfit) {
    outfit = createOutfit(name);
    outfit.expressions = [];
    outfit.defaultExpressionId = null;
    outfit.order = actor.outfits.length;
    actor.outfits.push(outfit);
    actor.defaultOutfitId ??= outfit.id;
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
function settleHostUploads(prepared, results, layout, defaultActorName) {
  const imported = [];
  const uploadedByPath = /* @__PURE__ */ new Map();
  const errors = [];
  for (let index = 0; index < prepared.length; index += 1) {
    const result = results[index];
    const item = prepared[index];
    if (!result?.id) {
      errors.push(`${item.candidate.path}: ${result?.error ?? "Upload failed."}`);
      continue;
    }
    const uploaded = {
      imageId: result.id,
      contentHash: item.hash,
      fileName: item.candidate.fileName,
      mimeType: item.candidate.mimeType
    };
    uploadedByPath.set(item.candidate.path, uploaded);
    imported.push({
      target: importTarget(item.candidate, layout, defaultActorName),
      ...uploaded
    });
  }
  return { imported, uploadedByPath, errors };
}
function mergeImportedAssets(source, imported, characterName2, now = Date.now()) {
  const profile = normalizeProfile(structuredClone(source), source.characterId, characterName2, now);
  const hashes = new Set(allAssets(profile).map((asset) => asset.contentHash));
  let importedCount = 0;
  let skipped = 0;
  for (const item of imported) {
    if (hashes.has(item.contentHash)) {
      skipped += 1;
      continue;
    }
    const actor = findOrCreateActor(profile, item.target.actorName);
    const outfit = findOrCreateOutfit(actor, item.target.outfitName);
    const expression = findOrCreateExpression(outfit, item.target.expressionName);
    const asset = {
      id: createId("asset"),
      imageId: item.imageId,
      contentHash: item.contentHash,
      fileName: item.fileName,
      mimeType: item.mimeType,
      mediaKind: item.mimeType.startsWith("video/") ? "video" : "image",
      enabled: true,
      priority: 0,
      createdAt: now
    };
    expression.assets.push(asset);
    hashes.add(item.contentHash);
    importedCount += 1;
  }
  profile.revision += 1;
  profile.updatedAt = now;
  return { profile, imported: importedCount, skipped };
}
function hydrateArchiveProfile(archive, characterId, characterName2, uploadedByPath, now = Date.now()) {
  const profile = normalizeProfile(
    { ...structuredClone(archive.profile), characterId, characterName: characterName2, revision: 0, updatedAt: now },
    characterId,
    characterName2,
    now
  );
  const pathsByAssetId = new Map(archive.assets.map((entry) => [entry.asset.id, entry.path]));
  for (const actor of profile.actors) for (const outfit of actor.outfits) {
    for (const expression of outfit.expressions) {
      expression.assets = expression.assets.flatMap((asset) => {
        const path = pathsByAssetId.get(asset.id);
        const upload = path ? uploadedByPath.get(path) : null;
        if (!upload) return [];
        return [{
          ...asset,
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
function removeAssets(profile, assetIds, now = Date.now()) {
  const next = structuredClone(profile);
  for (const actor of next.actors) for (const outfit of actor.outfits) {
    for (const expression of outfit.expressions) expression.assets = expression.assets.filter((asset) => !assetIds.has(asset.id));
  }
  next.revision += 1;
  next.updatedAt = now;
  return next;
}
function assetReferenceCount(profiles, imageId) {
  return profiles.reduce((sum, profile) => sum + allAssets(profile).filter((asset) => asset.imageId === imageId).length, 0);
}
function unreferencedImageIds(profiles, candidateImageIds) {
  return [...new Set(candidateImageIds)].filter((imageId) => assetReferenceCount(profiles, imageId) === 0);
}

// src/detector.ts
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function nullableString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}
function confidence(value) {
  const number = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return Math.min(1, Math.max(0, number));
}
function normalizeActorDecision(value) {
  const raw = asRecord(value);
  const actorId = nullableString(raw.actorId);
  if (!actorId) return null;
  return {
    actorId,
    outfitId: nullableString(raw.outfitId),
    expressionId: nullableString(raw.expressionId),
    confidence: confidence(raw.confidence)
  };
}
function normalizeDecision(value) {
  const raw = asRecord(value);
  const actors = Array.isArray(raw.actors) ? raw.actors.map(normalizeActorDecision).filter((item) => !!item) : [];
  const focusedActorIds = Array.isArray(raw.focusedActorIds) ? [...new Set(raw.focusedActorIds.filter((item) => typeof item === "string" && !!item))] : [];
  if (actors.length === 0 && focusedActorIds.length === 0) return null;
  return { schemaVersion: SCHEMA_VERSION, focusedActorIds, actors };
}
function parseJsonText(value) {
  const text = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
function parseDetectorResponse(response) {
  const tool = response.tool_calls?.find((item) => item.name === "set_stage_state");
  if (tool) return normalizeDecision(tool.args);
  if (typeof response.content === "string") return normalizeDecision(parseJsonText(response.content));
  return null;
}
function nodeSummary(entry) {
  return {
    actorId: entry.actor.id,
    name: entry.actor.name,
    aliases: entry.actor.aliases,
    outfits: entry.actor.outfits.filter((outfit) => outfit.enabled).map((outfit) => ({
      outfitId: outfit.id,
      name: outfit.name,
      aliases: outfit.aliases,
      allowAutoSwitch: outfit.allowAutoSwitch,
      expressions: outfit.expressions.filter((expression) => expression.enabled).map((expression) => ({
        expressionId: expression.id,
        name: expression.name,
        aliases: expression.aliases,
        cues: expression.cues,
        tags: expression.tags,
        sprites: expression.assets.map((asset) => ({
          fileName: asset.fileName,
          mediaKind: asset.mediaKind,
          enabled: asset.enabled
        }))
      }))
    }))
  };
}
function buildDetectorRequest(catalog, recentMessages, currentStates, settings) {
  const catalogJson = JSON.stringify(catalog.map(nodeSummary));
  const currentJson = JSON.stringify(currentStates);
  const system = [
    "You direct a character sprite stage after a completed roleplay reply.",
    "Choose only IDs present in the supplied catalog. Never invent IDs.",
    "Identify every actor whose visible state materially changes and which actors are the visual focus.",
    "The complete wardrobe is supplied in this single catalog: every enabled outfit folder, every enabled expression, and every sprite filename inside each expression.",
    "Use outfit folder names, aliases, expression names, aliases, cues, tags, and sprite filenames together to choose the closest visible state.",
    "An outfit is an ordinary selectable state. Return its ID whenever the scene best matches it; no separate outfit-change cue exists.",
    "Expression means the complete sprite state inside the selected outfit, including facial emotion, body position, and action.",
    "If a dimension is not supported by the text, return null so the current stage state remains sticky.",
    "Confidence is 0..1 for the combined visible-state match.",
    `Catalog: ${catalogJson}`,
    `Current states: ${currentJson}`
  ].join("\n");
  return {
    messages: [
      { role: "system", content: system },
      ...recentMessages.slice(-settings.detection.contextMessages),
      { role: "user", content: "Set the sprite stage for the latest assistant reply. Call set_stage_state exactly once." }
    ],
    connection_id: settings.detection.connectionId ?? void 0,
    model: settings.detection.model ?? void 0,
    parameters: {
      temperature: settings.detection.temperature,
      max_tokens: 420
    },
    tools: [{
      name: "set_stage_state",
      description: "Select focused actors and valid layered sprite states for the latest assistant reply.",
      parameters: {
        type: "object",
        additionalProperties: false,
        required: ["focusedActorIds", "actors"],
        properties: {
          focusedActorIds: { type: "array", items: { type: "string" } },
          actors: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["actorId", "outfitId", "expressionId", "confidence"],
              properties: {
                actorId: { type: "string" },
                outfitId: { type: ["string", "null"] },
                expressionId: { type: ["string", "null"] },
                confidence: { type: "number", minimum: 0, maximum: 1 }
              }
            }
          }
        }
      }
    }]
  };
}
function validateDecision(decision, catalog) {
  const actors = new Map(catalog.map((entry) => [entry.actor.id, entry.actor]));
  const validActors = [];
  for (const item of decision.actors) {
    const actor = actors.get(item.actorId);
    if (!actor) continue;
    const outfit = item.outfitId ? actor.outfits.find((candidate) => candidate.id === item.outfitId && candidate.enabled) : null;
    const expression = item.expressionId ? (outfit?.expressions ?? actor.outfits.flatMap((candidate) => candidate.expressions)).find((candidate) => candidate.id === item.expressionId && candidate.enabled) : null;
    validActors.push({
      ...item,
      outfitId: outfit?.id ?? null,
      expressionId: expression?.id ?? null
    });
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    focusedActorIds: decision.focusedActorIds.filter((actorId) => actors.has(actorId)),
    actors: validActors
  };
}

// src/storage.ts
var settingsPath = () => "settings.v1.json";
var profilePath = (characterId) => `profiles/${characterId}.v1.json`;
var timelinePath = (chatId) => `chats/${chatId}.v1.json`;
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
  async getSettings(userId) {
    const key = this.key(userId, settingsPath());
    const cached = this.settingsCache.get(key);
    if (cached) return structuredClone(cached);
    const raw = await this.storage.getJson(settingsPath(), { fallback: null, userId });
    const settings = raw ? normalizeSettings(raw) : defaultSettings();
    this.settingsCache.set(key, settings);
    return structuredClone(settings);
  }
  async saveSettings(userId, value, expectedRevision) {
    const path = settingsPath();
    const key = this.key(userId, path);
    return this.enqueue(key, async () => {
      const current = await this.getSettings(userId);
      if (current.revision !== expectedRevision) throw new RevisionConflict(current.revision);
      const settings = normalizeSettings({ ...value, revision: current.revision + 1, updatedAt: Date.now() });
      await this.storage.setJson(path, settings, { indent: 2, userId });
      this.settingsCache.set(key, settings);
      return structuredClone(settings);
    });
  }
  async getProfile(userId, characterId, characterName2 = "Character") {
    const path = profilePath(characterId);
    const key = this.key(userId, path);
    const cached = this.profileCache.get(key);
    if (cached) return structuredClone(cached);
    const raw = await this.storage.getJson(path, { fallback: null, userId });
    const profile = raw ? normalizeProfile(raw, characterId, characterName2) : createProfile(characterId, characterName2);
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
  async replaceProfile(userId, value) {
    const path = profilePath(value.characterId);
    const key = this.key(userId, path);
    return this.enqueue(key, async () => {
      const profile = normalizeProfile(value, value.characterId, value.characterName);
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
    const raw = await this.storage.getJson(path, { fallback: null, userId });
    const timeline = raw?.schemaVersion === 1 && raw.chatId === chatId ? { ...raw, layoutOverride: raw.layoutOverride ?? null } : createTimeline(chatId);
    this.timelineCache.set(key, timeline);
    return structuredClone(timeline);
  }
  async saveTimeline(userId, value, expectedRevision) {
    const path = timelinePath(value.chatId);
    const key = this.key(userId, path);
    return this.enqueue(key, async () => {
      const current = await this.getTimeline(userId, value.chatId);
      if (current.revision !== expectedRevision) throw new RevisionConflict(current.revision);
      const timeline = { ...structuredClone(value), schemaVersion: 1, updatedAt: Date.now() };
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
    const profiles = [];
    for (const file of files.filter((path) => /^profiles\/[^/]+\.v1\.json$/.test(path))) {
      const characterId = file.slice("profiles/".length, -".v1.json".length);
      profiles.push(await this.getProfile(userId, characterId));
    }
    return profiles;
  }
  clearUser(userId) {
    for (const cache of [this.settingsCache, this.profileCache, this.timelineCache]) {
      for (const key of cache.keys()) if (key.startsWith(`${userId}:`)) cache.delete(key);
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
  return records.filter((record) => !!record && record.owner_extension_identifier === LUMI_STAGE_ID).map((record) => record.id);
}

// src/timeline.ts
function findCachedDecision(records, message) {
  return records.find(
    (record) => record.messageId === message.id && record.swipeId === message.swipeId && record.contentHash === message.contentHash
  ) ?? null;
}
function upsertDecision(records, incoming, limit = 2e3) {
  return [
    ...records.filter((record) => !(record.messageId === incoming.messageId && record.swipeId === incoming.swipeId && record.contentHash === incoming.contentHash)),
    incoming
  ].slice(-limit);
}
function reconcileDecisionRecords(records, messages) {
  const active = new Map(messages.map((message) => [message.id, message]));
  return records.filter((record) => {
    const message = active.get(record.messageId);
    if (!message) return false;
    if (record.swipeId !== message.swipeId) return true;
    return record.contentHash === message.contentHash;
  });
}
function replayTimeline(timeline, catalog, settings, messages, now = Date.now()) {
  const decisions = reconcileDecisionRecords(timeline.decisions, messages);
  let snapshot = emptySnapshot(timeline.chatId, now);
  for (const message of messages) {
    if (message.role !== "assistant") continue;
    const record = findCachedDecision(decisions, message);
    if (record) {
      snapshot = applyDecision(
        snapshot,
        catalog,
        record.decision,
        timeline.manualOverrides,
        settings,
        record.createdAt
      );
    }
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
  const groupIds = metadata.group === true && Array.isArray(metadata.character_ids) ? metadata.character_ids.filter((id) => typeof id === "string" && id.length > 0) : directCharacterId ? [directCharacterId] : [];
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
var scheduled = /* @__PURE__ */ new Map();
var analysisQueues = /* @__PURE__ */ new Map();
var queueDepth = /* @__PURE__ */ new Map();
var lastDetection = /* @__PURE__ */ new Map();
var lastFrontendUserId = null;
var onEvent = spindle.on;
function asRecord2(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function readString(value, keys) {
  const raw = asRecord2(value);
  for (const key of keys) if (typeof raw[key] === "string" && raw[key]) return raw[key];
  return null;
}
function extractChatId(value) {
  return readString(value, ["chatId", "chat_id", "id"]);
}
function resolveUserId(chatId, eventUserId) {
  return eventUserId ?? (chatId ? chatUsers.get(chatId) : null) ?? lastFrontendUserId;
}
function send(message, userId) {
  spindle.sendToFrontend(message, userId);
}
function settleBackground(operation) {
  void operation.catch(() => void 0);
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
function queueKey(userId, chatId) {
  return `${userId}:${chatId}`;
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
async function assetViewsForProfiles(userId, profiles) {
  const assets = profiles.flatMap(allAssets);
  if (assets.length === 0) return {};
  if (!hasPermission("images")) return Object.fromEntries(assets.map((asset) => [asset.id, { ...asset, url: null, thumbUrl: null }]));
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
  const missing = [...new Set(assets.map((asset) => asset.imageId).filter((id) => !urls.has(id)))];
  const fetched = await mapWithConcurrency(
    missing,
    12,
    async (imageId) => spindle.images.get(imageId, { onlyOwned: true, specificity: "full", userId }).catch(() => null)
  );
  for (const item of fetched) if (item) urls.set(item.id, item.url);
  return Object.fromEntries(assets.map((asset) => {
    const url = urls.get(asset.imageId) ?? null;
    const separator = url?.includes("?") ? "&" : "?";
    return [asset.id, { ...asset, url, thumbUrl: url ? `${url}${separator}size=sm` : null }];
  }));
}
async function buildState(userId, chatId, characterId) {
  const context = activeContexts.get(userId);
  const activeChatId = chatId === void 0 ? context?.chatId ?? null : chatId;
  const activeCharacterId = characterId === void 0 ? context?.characterId ?? null : characterId;
  const settings = await repository.getSettings(userId);
  let profile = null;
  let timeline = null;
  let profiles = [];
  let activeCharacterName = null;
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
    assetViews: await assetViewsForProfiles(userId, profiles),
    connections: await connectionViews(userId),
    permissions: permissions(),
    activeChatId,
    activeCharacterId,
    activeCharacterName,
    queueDepth: activeChatId ? queueDepth.get(queueKey(userId, activeChatId)) ?? 0 : 0,
    lastDetection: lastDetection.get(userId) ?? { status: "idle", message: "No detection has run yet.", at: null }
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
    swipeId: Number.isFinite(message.swipe_id) ? message.swipe_id : 0
  }));
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
async function analyzeLatest(userId, chatId, force = false) {
  if (!hasPermission("generation") || !hasPermission("chat_mutation") || !hasPermission("chats")) {
    lastDetection.set(userId, { status: "error", message: "Generation, Chats, and Chat History permissions are required for automation.", at: Date.now() });
    await sendState(userId);
    return;
  }
  const settings = await repository.getSettings(userId);
  if (!settings.detection.enabled && !force) return;
  const set = await profilesForChat(userId, chatId);
  if (set.catalog.length === 0 || !set.profiles.some((profile) => allAssets(profile).some((asset) => asset.enabled))) {
    lastDetection.set(userId, { status: "error", message: "No enabled LumiStage media is configured for this chat.", at: Date.now() });
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
    contentHash
  });
  lastDetection.set(userId, { status: "running", message: record ? "Restoring cached stage decision\u2026" : "Analyzing the latest reply\u2026", at: Date.now() });
  await sendState(userId);
  if (!record) {
    const currentStates = Object.fromEntries(Object.entries(timeline.snapshot.actors).map(([actorId, state]) => [
      actorId,
      { outfitId: state.outfitId, expressionId: state.expressionId }
    ]));
    const request = buildDetectorRequest(
      set.catalog,
      messages.slice(-settings.detection.contextMessages).map(({ role, content }) => ({ role, content })),
      currentStates,
      settings
    );
    const response = await spindle.generate.quiet({ ...request, userId });
    const parsed = parseDetectorResponse(response);
    if (!parsed) throw new Error("The detector did not return a valid stage decision.");
    const decision = validateDecision(parsed, set.catalog);
    if (decision.actors.length === 0 && decision.focusedActorIds.length === 0) throw new Error("The detector returned no valid actors.");
    record = {
      messageId: latest.id,
      swipeId: latest.swipeId,
      contentHash,
      decision,
      provider: response.provider ?? null,
      model: response.model ?? settings.detection.model,
      createdAt: Date.now()
    };
    timeline.decisions = upsertDecision(timeline.decisions, record);
  }
  timeline = await rebuildTimeline(timeline, set.catalog, settings, messages);
  timeline.manualOverrides = consumeOnceOverrides(timeline.manualOverrides);
  timeline = await repository.saveTimeline(userId, timeline, expectedTimelineRevision);
  lastDetection.set(userId, {
    status: "success",
    message: `Stage settled for ${record.decision.focusedActorIds.length || record.decision.actors.length} actor(s).`,
    at: Date.now()
  });
  await sendState(userId);
}
function scheduleAnalysis(userId, chatId, delay = 120, force = false) {
  const key = queueKey(userId, chatId);
  const old = scheduled.get(key);
  if (old) clearTimeout(old);
  scheduled.set(key, setTimeout(() => {
    scheduled.delete(key);
    void enqueueAnalysis(userId, chatId, () => analyzeLatest(userId, chatId, force).catch(async (error) => {
      lastDetection.set(userId, {
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
  const profile = await repository.getProfile(userId, message.characterId, await characterName(userId, message.characterId));
  const defaultActor = profile.actors.find((actor) => actor.id === message.targetActorId) ?? profile.actors.find((actor) => actor.id === profile.defaultActorId) ?? profile.actors[0];
  const candidates = [];
  const errors = [];
  let archiveManifest = null;
  try {
    for (const [index, uploadId] of message.uploadIds.entries()) {
      send({ type: "import-progress", requestId: message.requestId, completed: index, total: message.uploadIds.length, message: "Reading staged uploads\u2026" }, userId);
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
    assertUnambiguousCandidates(candidates, message.layout, defaultActor?.name ?? profile.characterName);
    const existingByHash = new Map(allAssets(profile).map((asset) => [asset.contentHash, asset]));
    const prepared = [];
    const reusedByPath = /* @__PURE__ */ new Map();
    let skipped = 0;
    for (const candidate of candidates) {
      const hash = await sha256(candidate.bytes);
      const existing = existingByHash.get(hash);
      if (existing) {
        reusedByPath.set(candidate.path, {
          imageId: existing.imageId,
          contentHash: existing.contentHash,
          fileName: candidate.fileName,
          mimeType: candidate.mimeType
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
      strip_audio: candidate.mimeType.startsWith("video/")
    }));
    const results = uploadItems.length ? await spindle.images.uploadMany(uploadItems, { userId, concurrency: 8 }) : [];
    const settled = settleHostUploads(prepared, results, message.layout, defaultActor?.name ?? profile.characterName);
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
        message: `Stored ${index + 1} of ${prepared.length} media files\u2026`
      }, userId);
    }
    const next = archiveManifest ? hydrateArchiveProfile(archiveManifest, message.characterId, profile.characterName, settled.uploadedByPath) : mergeImportedAssets(profile, settled.imported, profile.characterName).profile;
    if (archiveManifest) next.revision = profile.revision + 1;
    const saved = await repository.replaceProfile(userId, next);
    const views = await assetViewsForProfiles(userId, [saved]);
    send({
      type: "import-complete",
      requestId: message.requestId,
      profile: saved,
      assetViews: views,
      imported: settled.imported.length,
      skipped,
      errors
    }, userId);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Import failed.");
  }
}
function archiveForProfile(profile) {
  const assets = [];
  for (const actor of profile.actors) for (const outfit of actor.outfits) {
    for (const expression of outfit.expressions) for (const asset of expression.assets) {
      const extension = asset.fileName.includes(".") ? asset.fileName.split(".").pop() : asset.mimeType.split("/").pop();
      assets.push({
        path: `assets/${asset.contentHash}.${extension || "bin"}`,
        characterId: profile.characterId,
        actorId: actor.id,
        outfitId: outfit.id,
        expressionId: expression.id,
        asset
      });
    }
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    kind: "lumistage-archive",
    exportedAt: Date.now(),
    profile,
    assets
  };
}
async function exportProfile(userId, characterId) {
  if (!hasPermission("images")) throw new Error("Images permission is required to export media.");
  const profile = await repository.getProfile(userId, characterId, await characterName(userId, characterId));
  const archive = archiveForProfile(profile);
  const urls = {};
  await mapWithConcurrency(archive.assets, 8, async (entry) => {
    const image = await spindle.images.get(entry.asset.imageId, { onlyOwned: true, specificity: "full", userId });
    if (image?.url) urls[entry.path] = image.url;
  });
  return { archive, urls };
}
async function handleMessage(message, userId) {
  if (message.type === "ready" || message.type === "refresh") {
    activeContexts.set(userId, { chatId: message.chatId, characterId: message.characterId });
    if (message.chatId) chatUsers.set(message.chatId, userId);
    await sendState(userId, message.chatId, message.characterId);
    return;
  }
  if (message.type === "character-editor") {
    if (!message.characterId) return;
    const profile = await repository.getProfile(userId, message.characterId, await characterName(userId, message.characterId));
    send({ type: "profile", profile, assetViews: await assetViewsForProfiles(userId, [profile]) }, userId);
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
    const saved = await repository.saveProfile(userId, message.profile, message.expectedRevision);
    send({ type: "saved", requestId: message.requestId, revision: saved.revision }, userId);
    send({ type: "profile", profile: saved, assetViews: await assetViewsForProfiles(userId, [saved]) }, userId);
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
    let timeline = clearManualOverride(current, message.actorId);
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
  if (message.type === "delete-assets") {
    if (!hasPermission("images")) throw new Error("Images permission is required to delete media.");
    const profile = await repository.getProfile(userId, message.characterId, await characterName(userId, message.characterId));
    const selected = new Set(message.assetIds);
    const assets = allAssets(profile).filter((asset) => selected.has(asset.id));
    const next = removeAssets(profile, selected);
    await repository.replaceProfile(userId, next);
    const profiles = await repository.listProfiles(userId);
    const unreferenced = unreferencedImageIds(profiles, assets.map((asset) => asset.imageId));
    const deletable = await confirmExtensionOwnedImageIds(
      unreferenced,
      (imageId) => spindle.images.get(imageId, { onlyOwned: true, specificity: "metadata", userId })
    );
    if (deletable.length) await spindle.images.deleteMany(deletable, { userId });
    send({ type: "profile", profile: next, assetViews: await assetViewsForProfiles(userId, [next]) }, userId);
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
    const views = await assetViewsForProfiles(userId, diagnosticProfiles);
    const media = diagnosticProfiles.flatMap(allAssets);
    const settings = await repository.getSettings(userId);
    send({
      type: "diagnostics",
      requestId: message.requestId,
      report: {
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        version: "1.0.0",
        permissions: permissions(),
        active: {
          hasChat: !!context?.chatId,
          hasCharacter: !!context?.characterId,
          queueDepth: context?.chatId ? queueDepth.get(queueKey(userId, context.chatId)) ?? 0 : 0
        },
        connection: {
          generationPermission: hasPermission("generation"),
          selection: settings.detection.connectionId ? "configured" : "active-host-connection",
          modelOverride: settings.detection.model ? "configured" : "none"
        },
        media: {
          total: media.length,
          missing: hasPermission("images") ? media.filter((asset) => !views[asset.id]?.url).length : null,
          ownershipVerified: hasPermission("images")
        },
        catalog: profile ? {
          actors: profile.actors.length,
          outfits: profile.actors.reduce((sum, actor) => sum + actor.outfits.length, 0),
          assets: allAssets(profile).length,
          issues: inspectProfile(profile)
        } : null,
        detector: lastDetection.get(userId) ?? null
      }
    }, userId);
  }
}
spindle.onFrontendMessage(async (payload, userId) => {
  lastFrontendUserId = userId;
  const message = payload;
  try {
    await handleMessage(message, userId);
  } catch (error) {
    if (error instanceof RevisionConflict) {
      send({
        type: "error",
        requestId: "requestId" in message ? message.requestId : void 0,
        code: "REVISION_CONFLICT",
        message: error.message,
        currentRevision: error.currentRevision
      }, userId);
      await sendState(userId);
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
for (const event of ["MESSAGE_EDITED", "MESSAGE_SWIPED", "SWIPE_EDITED"]) {
  onEvent(event, (payload, eventUserId) => {
    const raw = asRecord2(payload);
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
