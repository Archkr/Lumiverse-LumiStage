import { describe, expect, it } from "vitest";
import {
  buildDetectorRequest,
  parseDetectorResponse,
  validateDecision,
} from "../src/detector";
import { buildCatalog, defaultSettings } from "../src/model";
import { profileA } from "./fixtures";

describe("detector contract", () => {
  it("parses the exact structured character and variant result", () => {
    const decision = parseDetectorResponse({
      tool_calls: [{
        name: "set_stage_state",
        args: {
          focusedCharacterIds: ["character-a"],
          characters: [{
            characterId: "character-a",
            outfitId: "outfit-casual",
            expressionId: "expression-neutral",
            variantId: "variant-neutral-b",
            confidence: 1.4,
          }],
        },
      }],
    });
    expect(decision?.schemaVersion).toBe(2);
    expect(decision?.focusedCharacterIds).toEqual(["character-a"]);
    expect(decision?.characters[0]).toEqual(expect.objectContaining({
      variantId: "variant-neutral-b",
      confidence: 1,
    }));
  });

  it("rejects incomplete and mismatched IDs as complete units", () => {
    const catalog = buildCatalog([profileA()]);
    const parsed = parseDetectorResponse({
      content: JSON.stringify({
        focusedCharacterIds: ["character-a", "missing"],
        characters: [
          {
            characterId: "character-a",
            outfitId: "outfit-formal",
            expressionId: "expression-neutral",
            variantId: "variant-neutral-a",
            confidence: 0.9,
          },
          {
            characterId: "missing",
            outfitId: "x",
            expressionId: "y",
            variantId: "z",
            confidence: 1,
          },
        ],
      }),
    });
    if (!parsed) throw new Error("Expected parsed decision.");
    const validated = validateDecision(parsed, catalog);
    expect(validated.focusedCharacterIds).toEqual([]);
    expect(validated.characters).toEqual([]);
  });

  it("sends every outfit, expression, and sprite filename in one catalog", () => {
    const profile = profileA();
    const request = buildDetectorRequest(
      buildCatalog([profile]),
      [{ role: "assistant", content: "Aster smiles." }],
      {
        "character-a": {
          outfitId: "outfit-casual",
          expressionId: "expression-neutral",
          variantId: "variant-neutral-a",
        },
      },
      defaultSettings(1),
    );
    const system = String((request.messages as Array<{ content: string }>)[0].content);
    expect(system).toContain("Casual");
    expect(system).toContain("Formal");
    expect(system).toContain("Neutral");
    expect(system).toContain("neutral-soft.png");
    expect(system).toContain("neutral-side.png");
    expect(system).toContain("variant-neutral-b");
    expect(system).toContain("Outfits are ordinary selectable states");
    const tool = (request.tools as Array<Record<string, any>>)[0];
    const required = tool.parameters.properties.characters.items.required;
    expect(required).toEqual([
      "characterId",
      "outfitId",
      "expressionId",
      "variantId",
      "confidence",
    ]);
  });
});
