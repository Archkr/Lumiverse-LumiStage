import { describe, expect, it } from "vitest";
import { allAssets, applyDecision, buildCatalog, defaultSettings, emptySnapshot } from "../src/model";
import { profileA } from "./fixtures";

describe("bounded large-library behavior", () => {
  it("indexes a 2,000-asset library within an interactive budget", () => {
    const profile = profileA();
    for (const outfit of profile.actors[0].outfits) {
      for (const pose of outfit.poses) for (const item of pose.expressions) item.assets = [];
    }
    const expression = profile.actors[0].outfits[0].poses[0].expressions[0];
    expression.assets = Array.from({ length: 2000 }, (_, index) => ({
      id: `asset-${index}`,
      imageId: `image-${index}`,
      contentHash: `hash-${index}`,
      fileName: `${index}.webp`,
      mimeType: "image/webp",
      mediaKind: "image" as const,
      enabled: true,
      priority: index % 5,
      createdAt: index,
    }));
    const start = performance.now();
    const indexed = allAssets(profile);
    const elapsed = performance.now() - start;
    expect(indexed).toHaveLength(2000);
    expect(elapsed).toBeLessThan(500);
  });

  it("resolves an eight-actor ensemble in one bounded pass", () => {
    const profiles = Array.from({ length: 8 }, (_, index) => {
      const profile = profileA();
      profile.characterId = `character-${index}`;
      profile.actors[0].id = `actor-${index}`;
      profile.actors[0].name = `Actor ${index}`;
      return profile;
    });
    const catalog = buildCatalog(profiles);
    const decision = {
      schemaVersion: 1 as const,
      focusedActorIds: ["actor-4"],
      actors: catalog.map(({ actor }) => ({
        actorId: actor.id,
        outfitId: actor.defaultOutfitId,
        poseId: actor.outfits[0].defaultPoseId,
        expressionId: actor.outfits[0].poses[0].defaultExpressionId,
        confidence: 0.9,
        explicitOutfitCue: false,
      })),
    };
    const start = performance.now();
    const snapshot = applyDecision(emptySnapshot("group"), catalog, decision, {}, defaultSettings(1), 2);
    const elapsed = performance.now() - start;
    expect(Object.keys(snapshot.actors)).toHaveLength(8);
    expect(snapshot.focusedActorIds).toEqual(["actor-4"]);
    expect(elapsed).toBeLessThan(500);
  });
});
