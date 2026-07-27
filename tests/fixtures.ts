import type {
  CharacterProfileV2,
  DecisionRecordV2,
  DetectionCharacterDecisionV2,
  ExpressionSlotV2,
  OutfitFolderV2,
  StageVariantV2,
} from "../src/types";

export function variant(id: string, fileName = `${id}.png`): StageVariantV2 {
  return {
    id,
    imageId: `image-${id}`,
    contentHash: `hash-${id}`,
    fileName,
    mimeType: "image/png",
    mediaKind: "image",
    order: 0,
    createdAt: 1,
  };
}

export function expression(
  id: string,
  name: string,
  variants: StageVariantV2[] = [variant(`variant-${id}`, `${name.toLocaleLowerCase()}.png`)],
): ExpressionSlotV2 {
  return { id, name, order: 0, variants };
}

export function outfit(
  id: string,
  name: string,
  expressions: ExpressionSlotV2[],
): OutfitFolderV2 {
  expressions.forEach((item, order) => { item.order = order; });
  return {
    id,
    name,
    order: 0,
    defaultExpressionId: expressions[0]?.id ?? null,
    expressions,
  };
}

export function profileA(): CharacterProfileV2 {
  const outfits = [
    outfit("outfit-casual", "Casual", [
      expression("expression-neutral", "Neutral", [
        variant("variant-neutral-a", "neutral-soft.png"),
        { ...variant("variant-neutral-b", "neutral-side.png"), order: 1 },
      ]),
      expression("expression-happy", "Happy"),
      expression("expression-angry", "Angry"),
    ]),
    outfit("outfit-formal", "Formal", [
      expression("expression-formal", "Composed"),
    ]),
  ];
  outfits.forEach((item, order) => { item.order = order; });
  return {
    schemaVersion: 2,
    revision: 0,
    characterId: "character-a",
    characterName: "Aster",
    defaultOutfitId: "outfit-casual",
    outfits,
    createdAt: 1,
    updatedAt: 1,
  };
}

export function profileB(): CharacterProfileV2 {
  return {
    schemaVersion: 2,
    revision: 0,
    characterId: "character-b",
    characterName: "Briar",
    defaultOutfitId: "outfit-b",
    outfits: [
      outfit("outfit-b", "Default", [
        expression("expression-b", "Alert", [variant("variant-b", "alert.png")]),
      ]),
    ],
    createdAt: 1,
    updatedAt: 1,
  };
}

export function decisionA(
  patch: Partial<DetectionCharacterDecisionV2> = {},
): DetectionCharacterDecisionV2 {
  return {
    characterId: "character-a",
    outfitId: "outfit-casual",
    expressionId: "expression-happy",
    variantId: "variant-expression-happy",
    confidence: 0.9,
    ...patch,
  };
}

export function recordA(
  messageId: string,
  swipeId: number,
  contentHash: string,
  patch: Partial<DetectionCharacterDecisionV2> = {},
): DecisionRecordV2 {
  return {
    messageId,
    swipeId,
    contentHash,
    requestFingerprint: "fingerprint",
    decision: {
      schemaVersion: 2,
      focusedCharacterIds: ["character-a"],
      characters: [decisionA(patch)],
    },
    provider: "test",
    model: "test-model",
    createdAt: 5,
  };
}
