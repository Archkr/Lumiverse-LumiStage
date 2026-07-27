import { describe, expect, it } from "vitest";
import {
  allAssets,
  applyBatchMutation,
  applyDecision,
  applyManualOverride,
  buildCatalog,
  consumeOnceOverrides,
  createTimeline,
  defaultSettings,
  normalizeProfile,
  normalizeSettings,
  resolveActorState,
} from "../src/model";
import { assetReferenceCount, mergeImportedAssets } from "../src/importer";
import { decision, profileA } from "./fixtures";

describe("versioned schema normalization", () => {
  it("repairs invalid settings and clamps performance values", () => {
    const settings = normalizeSettings({
      schemaVersion: 999,
      revision: -3,
      detection: { contextMessages: 500, temperature: -4, stateConfidence: 8, outfitConfidence: -1 },
      appearance: { transition: "spin", width: 20, height: 9000, opacity: 4, idleOpacity: 0 },
      preloadAdjacent: 99,
    }, 42);
    expect(settings.schemaVersion).toBe(1);
    expect(settings.revision).toBe(0);
    expect(settings.detection.contextMessages).toBe(20);
    expect(settings.detection.temperature).toBe(0);
    expect(settings.appearance.transition).toBe("crossfade");
    expect(settings.appearance.width).toBe(180);
    expect(settings.appearance.height).toBe(1000);
    expect(settings.preloadAdjacent).toBe(12);
  });

  it("restores missing hierarchy levels and valid defaults", () => {
    const profile = normalizeProfile({ actors: [{ id: "actor", name: "A", outfits: [] }] }, "character", "A", 5);
    expect(profile.schemaVersion).toBe(1);
    expect(profile.defaultActorId).toBe("actor");
    expect(profile.actors[0].outfits[0].expressions[0].name).toBe("Neutral");
  });

  it("flattens legacy pose folders into their outfit without losing media", () => {
    const legacy = profileA() as unknown as Record<string, unknown>;
    const actor = (legacy.actors as Array<Record<string, unknown>>)[0];
    const outfit = (actor.outfits as Array<Record<string, unknown>>)[0];
    const expressions = outfit.expressions;
    delete outfit.expressions;
    outfit.poses = [{ id: "legacy-pose", defaultExpressionId: "expression-neutral", expressions }];
    outfit.defaultPoseId = "legacy-pose";
    const normalized = normalizeProfile(legacy, "character-a", "Aster", 5);
    expect(normalized.actors[0].outfits[0].expressions.map((item) => item.id)).toContain("expression-happy");
    expect(allAssets(normalized).length).toBe(allAssets(profileA()).length);
  });
});

describe("hierarchical state resolution", () => {
  it("changes outfits from catalog selection without a separate cue field", () => {
    const profile = profileA();
    const entry = buildCatalog([profile])[0];
    const settings = defaultSettings(1);
    const formal = resolveActorState(entry, null, {
      actorId: "actor-a",
      outfitId: "outfit-formal",
      expressionId: "expression-formal",
      confidence: 0.95,
    }, null, settings, true)!;
    const changed = resolveActorState(entry, formal, {
      actorId: "actor-a",
      outfitId: "outfit-casual",
      expressionId: "expression-happy",
      confidence: 0.99,
    }, null, settings, true)!;
    expect(changed.outfitId).toBe("outfit-casual");
    expect(changed.expressionId).toBe("expression-happy");
  });

  it("gates expressions at 0.60 and outfit selections at 0.85", () => {
    const entry = buildCatalog([profileA()])[0];
    const settings = defaultSettings(1);
    const initial = resolveActorState(entry, null, decision().actors[0], null, settings, true)!;
    const low = resolveActorState(entry, initial, {
      ...decision().actors[0],
      expressionId: "expression-soft",
      confidence: 0.59,
    }, null, settings, true)!;
    expect(low.expressionId).toBe("expression-happy");

    const high = resolveActorState(entry, initial, {
      ...decision().actors[0],
      outfitId: "outfit-formal",
      expressionId: "expression-formal",
      confidence: 0.85,
    }, null, settings, true)!;
    expect(high.outfitId).toBe("outfit-formal");
    expect(high.expressionId).toBe("expression-formal");
  });

  it("manual locks always win and once-overrides are consumed", () => {
    const profile = profileA();
    const catalog = buildCatalog([profile]);
    const settings = defaultSettings(1);
    let timeline = createTimeline("chat", 1);
    timeline = applyManualOverride(timeline, catalog, {
      actorId: "actor-a",
      outfitId: "outfit-casual",
      expressionId: "expression-soft",
      scope: "locked",
      createdAt: 2,
    }, settings, 2);
    const automated = applyDecision(timeline.snapshot, catalog, decision({
      outfitId: "outfit-formal",
      expressionId: "expression-formal",
      confidence: 1,
    }), timeline.manualOverrides, settings, 3);
    expect(automated.actors["actor-a"].expressionId).toBe("expression-soft");
    expect(consumeOnceOverrides({
      locked: { actorId: "actor-a", scope: "locked", createdAt: 1 },
      once: { actorId: "actor-b", scope: "once", createdAt: 1 },
    })).toEqual({ locked: { actorId: "actor-a", scope: "locked", createdAt: 1 } });
  });
});

describe("batch and deduplication", () => {
  it("supports reversible batch mutations without mutating the prior profile", () => {
    const profile = profileA();
    const original = structuredClone(profile);
    const assetId = allAssets(profile)[0].id;
    const changed = applyBatchMutation(profile, { type: "set-enabled", assetIds: [assetId], enabled: false }, 10);
    expect(allAssets(changed).find((item) => item.id === assetId)?.enabled).toBe(false);
    expect(profile).toEqual(original);
    expect(structuredClone(original)).toEqual(profile);
  });

  it("batch-adds metadata, duplicates, moves, and session-trashes selected media", () => {
    const profile = profileA();
    const selected = allAssets(profile)[0];
    const expression = profile.actors[0].outfits[0].expressions[0];
    let changed = applyBatchMutation(profile, {
      type: "add-aliases",
      expressionIds: [expression.id],
      aliases: ["resting", "calm"],
    }, 2);
    expect(changed.actors[0].outfits[0].expressions[0].aliases).toEqual(["resting", "calm"]);
    changed = applyBatchMutation(changed, { type: "duplicate", assetIds: [selected.id] }, 3);
    const duplicates = allAssets(changed).filter((item) => item.contentHash === selected.contentHash);
    expect(duplicates).toHaveLength(2);
    const duplicateId = duplicates.find((item) => item.id !== selected.id)!.id;
    changed = applyBatchMutation(changed, {
      type: "move",
      assetIds: [duplicateId],
      outfitId: "outfit-formal",
    }, 4);
    const formalAssets = changed.actors[0].outfits[1].expressions.flatMap((item) => item.assets);
    expect(formalAssets.some((item) => item.id === duplicateId)).toBe(true);
    const trashed = applyBatchMutation(changed, { type: "delete", assetIds: [duplicateId] }, 5);
    expect(allAssets(trashed).some((item) => item.id === duplicateId)).toBe(false);
    expect(allAssets(changed).some((item) => item.id === duplicateId)).toBe(true);
  });

  it("deduplicates imported content hashes and counts cross-profile references", () => {
    const profile = profileA();
    const existing = allAssets(profile)[0];
    const result = mergeImportedAssets(profile, [{
      target: { actorName: "Aster", outfitName: "Casual", expressionName: "Neutral" },
      imageId: "duplicate-image",
      contentHash: existing.contentHash,
      fileName: "copy.png",
      mimeType: "image/png",
    }], profile.characterName, 10);
    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(1);
    const second = structuredClone(profile);
    allAssets(second)[0].imageId = existing.imageId;
    expect(assetReferenceCount([profile, second], existing.imageId)).toBe(2);
  });
});
