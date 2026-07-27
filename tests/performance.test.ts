import { describe, expect, it } from "vitest";
import { buildDetectorRequest } from "../src/detector";
import {
  applyDecision,
  buildCatalog,
  createProfile,
  defaultSettings,
  emptySnapshot,
} from "../src/model";
import type { CharacterProfileV2 } from "../src/types";

function largeProfile(count: number): CharacterProfileV2 {
  const profile = createProfile("character-large", "Large");
  const expression = profile.outfits[0].expressions[0];
  expression.variants = Array.from({ length: count }, (_, index) => ({
    id: `variant-${index}`,
    imageId: `image-${index}`,
    contentHash: `hash-${index}`,
    fileName: `sprite-${index}.png`,
    mimeType: "image/png",
    mediaKind: "image" as const,
    order: index,
    createdAt: index,
  }));
  return profile;
}

function ensembleProfile(index: number): CharacterProfileV2 {
  const profile = createProfile(`character-${index}`, `Character ${index}`);
  const outfit = profile.outfits[0];
  outfit.id = `outfit-${index}`;
  profile.defaultOutfitId = outfit.id;
  const expression = outfit.expressions[0];
  expression.id = `expression-${index}`;
  outfit.defaultExpressionId = expression.id;
  expression.variants = [{
    id: `variant-ensemble-${index}`,
    imageId: `image-ensemble-${index}`,
    contentHash: `hash-ensemble-${index}`,
    fileName: `ensemble-${index}.png`,
    mimeType: "image/png",
    mediaKind: "image",
    order: 0,
    createdAt: index,
  }];
  return profile;
}

describe("bounded large-library operations", () => {
  it("builds the complete 2,000-sprite detector catalog without truncation", () => {
    const profile = largeProfile(2000);
    const started = performance.now();
    const request = buildDetectorRequest(buildCatalog([profile]), [], {}, defaultSettings(1));
    const elapsed = performance.now() - started;
    const system = String((request.messages as Array<{ content: string }>)[0].content);
    expect(system).toContain("sprite-0.png");
    expect(system).toContain("sprite-1999.png");
    expect(elapsed).toBeLessThan(1000);
  });

  it("resolves an eight-character ensemble in one bounded pass", () => {
    const profiles = Array.from({ length: 8 }, (_, index) => ensembleProfile(index));
    const catalog = buildCatalog(profiles);
    const decision = {
      schemaVersion: 2 as const,
      focusedCharacterIds: ["character-4"],
      characters: profiles.map((profile, index) => ({
        characterId: profile.characterId,
        outfitId: `outfit-${index}`,
        expressionId: `expression-${index}`,
        variantId: `variant-ensemble-${index}`,
        confidence: 1,
      })),
    };
    const started = performance.now();
    const snapshot = applyDecision(
      emptySnapshot("chat"),
      catalog,
      decision,
      {},
      defaultSettings(1),
    );
    const elapsed = performance.now() - started;
    expect(Object.keys(snapshot.characters)).toHaveLength(8);
    expect(snapshot.focusedCharacterIds).toEqual(["character-4"]);
    expect(elapsed).toBeLessThan(100);
  });
});
