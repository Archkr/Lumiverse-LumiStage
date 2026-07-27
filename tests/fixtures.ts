import type {
  ActorProfile,
  CharacterProfileV1,
  DecisionRecord,
  DetectionActorDecision,
  ExpressionState,
  OutfitFolder,
  StageAsset,
} from "../src/types";

export function asset(id: string, hash = id): StageAsset {
  return {
    id,
    imageId: `image-${id}`,
    contentHash: hash,
    fileName: `${id}.png`,
    mimeType: "image/png",
    mediaKind: "image",
    enabled: true,
    priority: 0,
    createdAt: 100,
  };
}

function expression(id: string, name: string, media: StageAsset[] = [asset(`asset-${id}`)]): ExpressionState {
  return {
    id,
    name,
    aliases: [],
    cues: [],
    tags: [],
    enabled: true,
    priority: 0,
    order: 0,
    assets: media,
  };
}

function outfit(id: string, name: string, expressions: ExpressionState[]): OutfitFolder {
  return {
    id,
    name,
    aliases: [],
    tags: [],
    enabled: true,
    priority: 0,
    order: 0,
    allowAutoSwitch: true,
    defaultExpressionId: expressions[0]?.id ?? null,
    expressions,
  };
}

export function profileA(): CharacterProfileV1 {
  const actor: ActorProfile = {
    id: "actor-a",
    name: "Aster",
    aliases: ["A"],
    enabled: true,
    order: 0,
    defaultOutfitId: "outfit-casual",
    outfits: [
      outfit("outfit-casual", "Casual", [
        expression("expression-neutral", "Neutral"),
        expression("expression-happy", "Happy"),
        expression("expression-soft", "Sitting softly"),
      ]),
      outfit("outfit-formal", "Formal", [expression("expression-formal", "Composed stance")]),
    ],
  };
  return {
    schemaVersion: 1,
    revision: 0,
    characterId: "character-a",
    characterName: "Aster",
    defaultActorId: actor.id,
    actors: [actor],
    createdAt: 1,
    updatedAt: 1,
  };
}

export function profileB(): CharacterProfileV1 {
  const actor: ActorProfile = {
    id: "actor-b",
    name: "Bryn",
    aliases: [],
    enabled: true,
    order: 0,
    defaultOutfitId: "outfit-b",
    outfits: [
      outfit("outfit-b", "Default", [expression("expression-b", "Alert")]),
    ],
  };
  return {
    schemaVersion: 1,
    revision: 0,
    characterId: "character-b",
    characterName: "Bryn",
    defaultActorId: actor.id,
    actors: [actor],
    createdAt: 1,
    updatedAt: 1,
  };
}

export function decision(
  actor: Partial<DetectionActorDecision> = {},
  focusedActorIds = ["actor-a"],
) {
  return {
    schemaVersion: 1 as const,
    focusedActorIds,
    actors: [{
      actorId: "actor-a",
      outfitId: "outfit-casual",
      expressionId: "expression-happy",
      confidence: 0.9,
      ...actor,
    }],
  };
}

export function record(
  messageId: string,
  swipeId: number,
  contentHash: string,
  actor: Partial<DetectionActorDecision> = {},
): DecisionRecord {
  return {
    messageId,
    swipeId,
    contentHash,
    decision: decision(actor),
    provider: "mock",
    model: "mock-model",
    createdAt: 100 + swipeId,
  };
}
