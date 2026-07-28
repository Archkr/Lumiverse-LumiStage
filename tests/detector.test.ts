import { describe, expect, it } from "vitest";
import {
  buildDetectorRequest,
  constrainCatalogToManualOverrides,
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

  it("resolves the selected expression and randomly chooses one of its variants", () => {
    const catalog = buildCatalog([profileA()]);
    const response = {
      tool_calls: [{
        name: "set_stage_state",
        args: {
          focusedCharacterIds: ["Aster"],
          characters: [{
            characterId: "Aster",
            outfitName: "Casual",
            expressionName: "Neutral",
            confidence: 0.95,
          }],
        },
      }],
    };
    const firstVariant = parseDetectorResponse(response, catalog, () => 0);
    const lastVariant = parseDetectorResponse(response, catalog, () => 0.999);
    expect(firstVariant).toEqual({
      schemaVersion: 2,
      focusedCharacterIds: ["character-a"],
      characters: [{
        characterId: "character-a",
        outfitId: "outfit-casual",
        expressionId: "expression-neutral",
        variantId: "variant-neutral-a",
        confidence: 0.95,
      }],
    });
    expect(lastVariant?.characters[0].variantId).toBe("variant-neutral-b");
  });

  it("sends outfit and expression names without any variant details", () => {
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
    expect(system).not.toContain("neutral-soft.png");
    expect(system).not.toContain("neutral-side.png");
    expect(system).not.toContain("variant-neutral-b");
    expect(system).not.toContain('"files"');
    expect(system).not.toContain('"fileName"');
    expect(system).toContain("Variants and filenames are intentionally hidden from you");
    expect(system).toContain("randomly selects an eligible variant");
    expect(system).toContain("You may switch away from the current outfit");
    expect(request.estimatedInputTokens).toEqual(expect.any(Number));
    expect(request.reasoning).toEqual({ source: "off" });
    expect(request.parameters).toEqual({ temperature: 0.1 });
    expect(request.parameters).not.toHaveProperty("max_tokens");
    const tool = (request.tools as Array<Record<string, any>>)[0];
    const required = tool.parameters.properties.characters.items.required;
    expect(required).toEqual([
      "characterId",
      "outfitName",
      "expressionName",
      "confidence",
    ]);
    expect(tool.parameters.properties.characters.items.properties).not.toHaveProperty("fileName");
  });

  it("instructs the model to match general visible states instead of only emotions", () => {
    const request = buildDetectorRequest(
      buildCatalog([profileA()]),
      [{
        role: "assistant",
        content: "After the sparring match, Aster sits at the counter drinking coffee.",
      }],
      {},
      defaultSettings(1),
    );
    const messages = request.messages as Array<{ role: string; content: string }>;
    const system = messages[0].content;
    const finalInstruction = messages.at(-1)?.content;
    expect(system).toContain("general visible sprite states, not an emotion-only taxonomy");
    expect(system).toContain("full-body pose or posture");
    expect(system).toContain("interaction or relative positioning with another character");
    expect(system).toContain("\"drinking coffee\"");
    expect(system).toContain("\"after the fight\"");
    expect(system).toContain("\"straddling another character\"");
    expect(system).toContain("preferring a matching pose, action, interaction, condition, or contextual state");
    expect(system).toContain("require every material part of the label to be supported");
    expect(finalInstruction).toContain("most specific scene-supported visible state");

    const tool = (request.tools as Array<Record<string, any>>)[0];
    expect(tool.description).toContain("poses, actions, interactions, conditions, and contextual states");
    expect(tool.parameters.properties.characters.items.properties.expressionName.description)
      .toContain("pose, action, interaction, condition, transformation, or sequence/context");
    expect(tool.parameters.properties.characters.items.properties).not.toHaveProperty("fileName");
  });

  it("lets the detector change expressions inside an outfit lock", () => {
    const catalog = buildCatalog([profileA()]);
    const settings = defaultSettings(1);
    const outfitLock = {
      "character-a": {
        characterId: "character-a",
        outfitId: "outfit-casual",
        expressionId: "expression-neutral",
        variantId: "variant-neutral-a",
        scope: "locked" as const,
        lock: "outfit" as const,
        createdAt: 1,
      },
    };
    const outfitRequest = buildDetectorRequest(catalog, [], {}, settings, outfitLock);
    const outfitSystem = String(
      (outfitRequest.messages as Array<{ content: string }>)[0].content,
    );
    const outfitLockLine = outfitSystem
      .split("\n")
      .find((line) => line.startsWith("Manual locks: "));
    expect(outfitSystem).toContain("An outfit lock fixes only outfitName");
    expect(outfitLockLine).toContain('"lock":"outfit"');
    expect(outfitLockLine).toContain('"outfitName":"Casual"');
    expect(outfitLockLine).not.toContain("Neutral");
    expect(outfitLockLine).not.toContain("neutral-soft.png");
    const outfitCatalog = JSON.parse(
      outfitSystem
        .split("\n")
        .find((line) => line.startsWith("Catalog: "))
        ?.slice("Catalog: ".length) ?? "[]",
    );
    expect(outfitCatalog[0].outfits.map((outfit: { outfitName: string }) => outfit.outfitName))
      .toEqual(["Casual"]);
    expect(outfitCatalog[0].outfits[0].expressions.map(
      (expression: { expressionName: string }) => expression.expressionName,
    )).toEqual(["Neutral", "Happy", "Angry"]);
    expect(outfitSystem).not.toContain("Formal");
    expect(outfitSystem).not.toContain("composed.png");

    const constrainedCatalog = constrainCatalogToManualOverrides(catalog, outfitLock);
    expect(parseDetectorResponse({
      tool_calls: [{
        name: "set_stage_state",
        args: {
          focusedCharacterIds: ["character-a"],
          characters: [{
            characterId: "character-a",
            outfitName: "Formal",
            expressionName: "Composed",
            confidence: 1,
          }],
        },
      }],
    }, constrainedCatalog)).toBeNull();
    expect(parseDetectorResponse({
      tool_calls: [{
        name: "set_stage_state",
        args: {
          focusedCharacterIds: ["character-a"],
          characters: [{
            characterId: "character-a",
            outfitName: "Casual",
            expressionName: "Happy",
            confidence: 1,
          }],
        },
      }],
    }, constrainedCatalog)?.characters[0]).toEqual(expect.objectContaining({
      outfitId: "outfit-casual",
      expressionId: "expression-happy",
    }));

    const stateRequest = buildDetectorRequest(catalog, [], {}, settings, {
      "character-a": {
        ...outfitLock["character-a"],
        lock: "state",
      },
    });
    const stateLockLine = String(
      (stateRequest.messages as Array<{ content: string }>)[0].content,
    )
      .split("\n")
      .find((line) => line.startsWith("Manual locks: "));
    expect(stateLockLine).toContain('"lock":"state"');
    expect(stateLockLine).toContain('"expressionName":"Neutral"');
    expect(stateLockLine).not.toContain("neutral-soft.png");
    expect(stateLockLine).not.toContain('"fileName"');
    const stateSystem = String(
      (stateRequest.messages as Array<{ content: string }>)[0].content,
    );
    const stateCatalog = JSON.parse(
      stateSystem
        .split("\n")
        .find((line) => line.startsWith("Catalog: "))
        ?.slice("Catalog: ".length) ?? "[]",
    );
    expect(stateCatalog[0].outfits).toEqual([expect.objectContaining({
      outfitName: "Casual",
      expressions: [expect.objectContaining({
        expressionName: "Neutral",
      })],
    })]);
    expect(JSON.stringify(stateCatalog)).not.toContain("neutral-soft.png");
    expect(JSON.stringify(stateCatalog)).not.toContain('"files"');

    const constrainedStateCatalog = constrainCatalogToManualOverrides(catalog, {
      "character-a": {
        ...outfitLock["character-a"],
        lock: "state",
      },
    });
    expect(parseDetectorResponse({
      tool_calls: [{
        name: "set_stage_state",
        args: {
          focusedCharacterIds: ["character-a"],
          characters: [{
            characterId: "character-a",
            outfitName: "Casual",
            expressionName: "Neutral",
            confidence: 1,
          }],
        },
      }],
    }, constrainedStateCatalog, () => 0.999)?.characters[0].variantId)
      .toBe("variant-neutral-a");
  });

  it("rejects duplicate character decisions and forwards the selected model without an output cap", () => {
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
    const settings = defaultSettings(1);
    settings.detection.model = "reasoning-model";
    const request = buildDetectorRequest(ensembleCatalog, [], {}, settings);
    expect(request).not.toHaveProperty("model");
    expect(request.parameters).toEqual({
      temperature: 0.1,
      model: "reasoning-model",
    });
    expect(request.parameters).not.toHaveProperty("max_tokens");
  });
});
