import { describe, expect, it } from "vitest";
import {
  allVariants,
  applyBatchMutation,
  applyDecision,
  applyManualOverride,
  buildCatalog,
  createProfile,
  createTimeline,
  defaultSettings,
  normalizeProfile,
  normalizeSettings,
  resolveCharacterState,
  inspectProfile,
  suggestMergedExpressionName,
} from "../src/model";
import { profileA, profileB } from "./fixtures";

describe("V2 schema normalization and migration", () => {
  it("normalizes settings to one confidence gate", () => {
    const settings = normalizeSettings({
      revision: -3,
      detection: {
        enabled: true,
        contextMessages: 80,
        temperature: -1,
        stateConfidence: 0.72,
      },
    }, 10);
    expect(settings.schemaVersion).toBe(2);
    expect(settings.revision).toBe(0);
    expect(settings.detection.contextMessages).toBe(20);
    expect(settings.detection.temperature).toBe(0);
    expect(settings.detection.confidence).toBe(0.72);
  });

  it("hoists a legacy single owner while preserving IDs and media", () => {
    const legacy = {
      schemaVersion: 1,
      revision: 7,
      characterName: "Aster",
      defaultActorId: "legacy-owner",
      actors: [{
        id: "legacy-owner",
        name: "Aster",
        defaultOutfitId: "legacy-outfit",
        outfits: [{
          id: "legacy-outfit",
          name: "Casual",
          defaultExpressionId: "legacy-expression",
          expressions: [{
            id: "legacy-expression",
            name: "Happy",
            enabled: false,
            priority: 999,
            aliases: ["joy"],
            tags: ["smile"],
            cues: ["grins"],
            assets: [{
              id: "legacy-asset",
              imageId: "legacy-image",
              contentHash: "legacy-hash",
              fileName: "happy.png",
              mimeType: "image/png",
              enabled: false,
              priority: 12,
              createdAt: 4,
            }],
          }],
        }],
      }],
    };
    const migrated = normalizeProfile(legacy, "character-a", "Aster", 20);
    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.defaultOutfitId).toBe("legacy-outfit");
    expect(migrated.outfits[0].expressions[0]).toEqual(expect.objectContaining({
      id: "legacy-expression",
      name: "Happy",
    }));
    expect(migrated.outfits[0].expressions[0].variants[0]).toEqual(expect.objectContaining({
      id: "legacy-asset",
      imageId: "legacy-image",
    }));
    expect(migrated.outfits[0].expressions[0]).not.toHaveProperty("aliases");
    expect(migrated.outfits[0].expressions[0]).not.toHaveProperty("priority");
    expect(migrated.outfits[0].expressions[0].variants[0]).not.toHaveProperty("enabled");
  });

  it("uses collision-safe outfit names when migrating multiple legacy owners", () => {
    const expression = {
      id: "expression",
      name: "Neutral",
      assets: [{ id: "asset", imageId: "image", contentHash: "hash", fileName: "neutral.png", mimeType: "image/png" }],
    };
    const migrated = normalizeProfile({
      actors: [
        { id: "a", name: "Aster", outfits: [{ id: "oa", name: "Default", expressions: [expression] }] },
        { id: "b", name: "Briar", outfits: [{ id: "ob", name: "Default", expressions: [{ ...expression, id: "expression-b" }] }] },
      ],
    }, "character", "Card");
    expect(migrated.outfits.map((item) => item.name)).toEqual(["Aster / Default", "Briar / Default"]);
    expect(allVariants(migrated)).toHaveLength(2);
  });

  it("creates the minimal default hierarchy", () => {
    const profile = createProfile("character", "Aster", 5);
    expect(profile.outfits).toHaveLength(1);
    expect(profile.outfits[0].expressions[0].name).toBe("Neutral");
    expect(profile.outfits[0].expressions[0].variants).toEqual([]);
  });
});

describe("state resolution", () => {
  it("applies outfit, expression, and exact variant together at the confidence gate", () => {
    const profile = profileA();
    const entry = buildCatalog([profile])[0];
    const settings = defaultSettings(1);
    const previous = resolveCharacterState(entry, null, null, null, settings, true);
    const low = resolveCharacterState(entry, previous, {
      characterId: "character-a",
      outfitId: "outfit-formal",
      expressionId: "expression-formal",
      variantId: "variant-expression-formal",
      confidence: 0.59,
    }, null, settings, true);
    expect(low?.outfitId).toBe("outfit-casual");
    const high = resolveCharacterState(entry, previous, {
      characterId: "character-a",
      outfitId: "outfit-formal",
      expressionId: "expression-formal",
      variantId: "variant-expression-formal",
      confidence: 0.6,
    }, null, settings, true);
    expect(high).toEqual(expect.objectContaining({
      outfitId: "outfit-formal",
      expressionId: "expression-formal",
      variantId: "variant-expression-formal",
    }));
  });

  it("lets an outfit lock constrain automation while a state lock wins completely", () => {
    const profile = profileA();
    const entry = buildCatalog([profile])[0];
    const settings = defaultSettings(1);
    const previous = resolveCharacterState(entry, null, null, null, settings, true);
    const outfitDecision = {
      characterId: "character-a",
      outfitId: "outfit-casual",
      expressionId: "expression-happy",
      variantId: "variant-expression-happy",
      confidence: 1,
    };
    const outfitLocked = resolveCharacterState(entry, previous, outfitDecision, {
      characterId: "character-a",
      outfitId: "outfit-casual",
      expressionId: "expression-angry",
      variantId: "variant-expression-angry",
      scope: "locked",
      lock: "outfit",
      createdAt: 1,
    }, settings, true);
    expect(outfitLocked).toEqual(expect.objectContaining({
      outfitId: "outfit-casual",
      expressionId: "expression-happy",
      variantId: "variant-expression-happy",
    }));
    const stateLocked = resolveCharacterState(entry, previous, outfitDecision, {
      characterId: "character-a",
      outfitId: "outfit-casual",
      expressionId: "expression-neutral",
      variantId: "variant-neutral-b",
      scope: "locked",
      lock: "state",
      createdAt: 1,
    }, settings, true);
    expect(stateLocked?.variantId).toBe("variant-neutral-b");
  });

  it("stores an outfit anchor without preventing later automated expressions", () => {
    const profile = profileA();
    const catalog = buildCatalog([profile]);
    const settings = defaultSettings(1);
    const timeline = createTimeline("chat", 1);
    const locked = applyManualOverride(timeline, catalog, {
      characterId: "character-a",
      outfitId: "outfit-casual",
      expressionId: "expression-angry",
      variantId: "variant-expression-angry",
      scope: "locked",
      lock: "outfit",
      createdAt: 2,
    }, settings, 2);
    expect(locked.snapshot.characters["character-a"]).toEqual(expect.objectContaining({
      outfitId: "outfit-casual",
      expressionId: "expression-angry",
      variantId: "variant-expression-angry",
    }));
    expect(locked.manualOverrides["character-a"]).toEqual({
      characterId: "character-a",
      outfitId: "outfit-casual",
      expressionId: "expression-angry",
      variantId: "variant-expression-angry",
      scope: "locked",
      lock: "outfit",
      createdAt: 2,
    });

    const switched = applyDecision(locked.snapshot, catalog, {
      schemaVersion: 2,
      focusedCharacterIds: ["character-a"],
      characters: [{
        characterId: "character-a",
        outfitId: "outfit-casual",
        expressionId: "expression-happy",
        variantId: "variant-expression-happy",
        confidence: 1,
      }],
    }, locked.manualOverrides, settings, 3);
    expect(switched.characters["character-a"]).toEqual(expect.objectContaining({
      outfitId: "outfit-casual",
      expressionId: "expression-happy",
      variantId: "variant-expression-happy",
    }));

    const manuallyShifted = applyManualOverride(locked, catalog, {
      characterId: "character-a",
      outfitId: "outfit-casual",
      expressionId: "expression-happy",
      variantId: "variant-expression-happy",
      scope: "once",
      lock: "state",
      createdAt: 4,
    }, settings, 4);
    expect(manuallyShifted.manualOverrides["character-a"]).toEqual({
      characterId: "character-a",
      outfitId: "outfit-casual",
      expressionId: "expression-happy",
      variantId: "variant-expression-happy",
      scope: "locked",
      lock: "outfit",
      createdAt: 4,
    });
    expect(manuallyShifted.snapshot.characters["character-a"]).toEqual(expect.objectContaining({
      outfitId: "outfit-casual",
      expressionId: "expression-happy",
      variantId: "variant-expression-happy",
    }));
  });

  it("composes group-chat character states by real character ID", () => {
    const profiles = [profileA(), profileB()];
    const timeline = createTimeline("chat", 1);
    const snapshot = applyDecision(timeline.snapshot, buildCatalog(profiles), {
      schemaVersion: 2,
      focusedCharacterIds: ["character-b"],
      characters: [{
        characterId: "character-b",
        outfitId: "outfit-b",
        expressionId: "expression-b",
        variantId: "variant-b",
        confidence: 1,
      }],
    }, {}, defaultSettings(1), 2);
    expect(Object.keys(snapshot.characters).sort()).toEqual(["character-b"]);
    expect(snapshot.characters["character-b"].focused).toBe(true);
  });

  it("preserves the complete prior snapshot and focus when any decision is below confidence", () => {
    const profiles = [profileA(), profileB()];
    const catalog = buildCatalog(profiles);
    const initial = applyDecision(createTimeline("chat", 1).snapshot, catalog, {
      schemaVersion: 2,
      focusedCharacterIds: ["character-a"],
      characters: [{
        characterId: "character-a",
        outfitId: "outfit-casual",
        expressionId: "expression-happy",
        variantId: "variant-expression-happy",
        confidence: 1,
      }],
    }, {}, defaultSettings(1), 2);
    const preserved = applyDecision(initial, catalog, {
      schemaVersion: 2,
      focusedCharacterIds: ["character-b"],
      characters: [{
        characterId: "character-b",
        outfitId: "outfit-b",
        expressionId: "expression-b",
        variantId: "variant-b",
        confidence: 0.2,
      }],
    }, {}, defaultSettings(1), 3);
    expect(preserved).toBe(initial);
    expect(preserved.focusedCharacterIds).toEqual(["character-a"]);
  });

  it("preserves duplicate expression records for blocking Studio validation", () => {
    const profile = profileA();
    profile.outfits[0].expressions.push({
      ...structuredClone(profile.outfits[0].expressions[0]),
      id: "duplicate-expression-id",
    });
    const normalized = normalizeProfile(profile, profile.characterId, profile.characterName);
    expect(normalized.outfits[0].expressions).toHaveLength(profile.outfits[0].expressions.length);
    expect(inspectProfile(normalized)).toContainEqual(expect.objectContaining({
      severity: "error",
      code: "duplicate-expression",
    }));
  });
});

describe("expression-slot batch operations", () => {
  it("suggests a shared base name for numbered import slots", () => {
    expect(suggestMergedExpressionName([
      { name: "Happy_1" },
      { name: "Happy-2" },
      { name: "Happy (3)" },
    ])).toBe("Happy");
    expect(suggestMergedExpressionName([
      { name: "Drinking coffee" },
      { name: "Holding mug" },
    ])).toBe("Drinking coffee");
  });

  it("merges selected slots, deduplicates variants, and preserves a stable target and default", () => {
    const profile = profileA();
    const outfit = profile.outfits[0];
    const first = outfit.expressions[0];
    const second = outfit.expressions[1];
    first.name = "Happy 1";
    second.name = "Happy 2";
    second.variants.push({
      ...first.variants[0],
      id: "duplicate-content-variant",
      imageId: "duplicate-content-image",
      order: second.variants.length,
    });
    outfit.defaultExpressionId = second.id;

    const merged = applyBatchMutation(profile, {
      type: "merge",
      expressionIds: [first.id, second.id],
      outfitId: outfit.id,
      name: "Happy",
    }, 10);
    const result = merged.outfits[0].expressions.find((item) => item.id === first.id);
    expect(result?.name).toBe("Happy");
    expect(result?.variants.map((item) => item.fileName)).toEqual([
      "neutral-soft.png",
      "neutral-side.png",
      "happy.png",
    ]);
    expect(result?.variants.map((item) => item.order)).toEqual([0, 1, 2]);
    expect(merged.outfits[0].expressions.some((item) => item.id === second.id)).toBe(false);
    expect(merged.outfits[0].defaultExpressionId).toBe(first.id);
    expect(merged.updatedAt).toBe(10);
    expect(profile.outfits[0].expressions.some((item) => item.id === second.id)).toBe(true);
  });

  it("rejects merging into an unselected expression name", () => {
    const profile = profileA();
    const unchanged = applyBatchMutation(profile, {
      type: "merge",
      expressionIds: ["expression-neutral", "expression-happy"],
      outfitId: "outfit-casual",
      name: "Angry",
    }, 10);
    expect(unchanged).toBe(profile);
  });

  it("moves slots and merges variants into matching destination names", () => {
    const profile = profileA();
    profile.outfits[1].expressions.push({
      id: "existing-happy",
      name: "Happy",
      order: 1,
      variants: [],
    });
    const moved = applyBatchMutation(profile, {
      type: "move",
      expressionIds: ["expression-happy"],
      outfitId: "outfit-formal",
    }, 10);
    expect(moved.revision).toBe(profile.revision);
    expect(moved.outfits[0].expressions.some((item) => item.id === "expression-happy")).toBe(false);
    expect(moved.outfits[1].expressions.find((item) => item.name === "Happy")?.variants).toHaveLength(1);
  });

  it("copies with independent records that reference the same owned images", () => {
    const profile = profileA();
    const source = profile.outfits[0].expressions[0];
    const copied = applyBatchMutation(profile, {
      type: "copy",
      expressionIds: [source.id],
      outfitId: "outfit-formal",
    }, 10);
    expect(copied.revision).toBe(profile.revision);
    const clone = copied.outfits[1].expressions.find((item) => item.name === source.name);
    expect(clone?.id).not.toBe(source.id);
    expect(clone?.variants[0].id).not.toBe(source.variants[0].id);
    expect(clone?.variants[0].imageId).toBe(source.variants[0].imageId);
  });

  it("deletes complete expression slots and repairs defaults", () => {
    const profile = profileA();
    const deleted = applyBatchMutation(profile, {
      type: "delete",
      expressionIds: ["expression-neutral"],
    }, 10);
    expect(deleted.outfits[0].expressions.map((item) => item.id)).not.toContain("expression-neutral");
    expect(deleted.outfits[0].defaultExpressionId).toBe("expression-happy");
  });
});
