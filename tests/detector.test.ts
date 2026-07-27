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

  it("resolves an exact filename from a different outfit back to stable IDs", () => {
    const catalog = buildCatalog([profileA()]);
    const decision = parseDetectorResponse({
      tool_calls: [{
        name: "set_stage_state",
        args: {
          focusedCharacterIds: ["Aster"],
          characters: [{
            characterId: "Aster",
            outfitName: "Formal",
            expressionName: "Composed",
            fileName: "composed.png",
            confidence: 0.95,
          }],
        },
      }],
    }, catalog);
    expect(decision).toEqual({
      schemaVersion: 2,
      focusedCharacterIds: ["character-a"],
      characters: [{
        characterId: "character-a",
        outfitId: "outfit-formal",
        expressionId: "expression-formal",
        variantId: "variant-expression-formal",
        confidence: 0.95,
      }],
    });
  });

  it("sends every outfit, expression, and exact filename without verbose internal variant IDs", () => {
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
    expect(system).not.toContain("variant-neutral-b");
    expect(system).toContain("fileName is authoritative");
    expect(system).toContain("You may switch away from the current outfit");
    expect(request.estimatedInputTokens).toEqual(expect.any(Number));
    expect(request.reasoning).toEqual({ source: "off" });
    expect((request.parameters as Record<string, unknown>).max_tokens).toBe(560);
    const tool = (request.tools as Array<Record<string, any>>)[0];
    const required = tool.parameters.properties.characters.items.required;
    expect(required).toEqual([
      "characterId",
      "outfitName",
      "expressionName",
      "fileName",
      "confidence",
    ]);
  });

  it("rejects duplicate character decisions and scales one-call output for ensembles", () => {
    const profile = profileA();
    const catalog = buildCatalog([profile]);
    const duplicate = {
      schemaVersion: 2 as const,
      focusedCharacterIds: ["character-a"],
      characters: [
        {
          characterId: "character-a",
          outfitId: "outfit-casual",
          expressionId: "expression-happy",
          variantId: "variant-expression-happy",
          confidence: 1,
        },
        {
          characterId: "character-a",
          outfitId: "outfit-casual",
          expressionId: "expression-happy",
          variantId: "variant-expression-happy",
          confidence: 1,
        },
      ],
    };
    expect(validateDecision(duplicate, catalog).characters).toEqual([]);
    const ensembleCatalog = Array.from({ length: 12 }, (_, index) => {
      const next = profileA();
      next.characterId = `character-${index}`;
      return buildCatalog([next])[0];
    });
    const request = buildDetectorRequest(ensembleCatalog, [], {}, defaultSettings(1));
    expect((request.parameters as Record<string, unknown>).max_tokens).toBeGreaterThan(560);
    expect((request.parameters as Record<string, unknown>).max_tokens).toBeLessThanOrEqual(2400);
  });
});
