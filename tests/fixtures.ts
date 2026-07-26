import type {
  ActorProfile,
  CharacterProfileV1,
  DecisionRecord,
  DetectionActorDecision,
  ExpressionState,
  OutfitFolder,
  PoseState,
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

function pose(id: string, name: string, expressions: ExpressionState[]): PoseState {
  return {
    id,
    name,
    aliases: [],
    cues: [],
    tags: [],
    enabled: true,
    priority: 0,
    order: 0,
    defaultExpressionId: expressions[0]?.id ?? null,
    expressions,
  };
}

function outfit(id: string, name: string, poses: PoseState[]): OutfitFolder {
  return {
    id,
    name,
    aliases: [],
    cues: [],
    tags: [],
    enabled: true,
    priority: 0,
    order: 0,
    allowAutoSwitch: true,
    defaultPoseId: poses[0]?.id ?? null,
    poses,
  };
}

export function profileA(): CharacterProfileV1 {
  const standing = pose("pose-standing", "Standing", [
    expression("expression-neutral", "Neutral"),
    expression("expression-happy", "Happy"),
  ]);
  const sitting = pose("pose-sitting", "Sitting", [expression("expression-soft", "Soft")]);
  const formalPose = pose("pose-formal", "Formal stance", [expression("expression-formal", "Composed")]);
  const actor: ActorProfile = {
    id: "actor-a",
    name: "Aster",
    aliases: ["A"],
    enabled: true,
    order: 0,
    defaultOutfitId: "outfit-casual",
    outfits: [
      outfit("outfit-casual", "Casual", [standing, sitting]),
      outfit("outfit-formal", "Formal", [formalPose]),
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
      outfit("outfit-b", "Default", [
        pose("pose-b", "Default", [expression("expression-b", "Alert")]),
      ]),
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
      poseId: "pose-standing",
      expressionId: "expression-happy",
      confidence: 0.9,
      explicitOutfitCue: false,
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

