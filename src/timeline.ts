import { applyDecision, emptySnapshot, type CatalogEntry } from "./model";
import type {
  ChatTimelineV2,
  DecisionRecordV2,
  DetectionDecisionV2,
  LumiStageSettingsV2,
  ManualOverrideV2,
  StageSnapshotV2,
} from "./types";

export interface TimelineMessageKey {
  id: string;
  role: string;
  swipeId: number;
  contentHash: string;
}

export function findCachedDecision(
  records: DecisionRecordV2[],
  message: Pick<TimelineMessageKey, "id" | "swipeId" | "contentHash">,
  requestFingerprint?: string,
): DecisionRecordV2 | null {
  if (!requestFingerprint) return null;
  return records.find((record) =>
    record.messageId === message.id
    && record.swipeId === message.swipeId
    && record.contentHash === message.contentHash
    && record.requestFingerprint === requestFingerprint
  ) ?? null;
}

export function upsertDecision(
  records: DecisionRecordV2[],
  incoming: DecisionRecordV2,
  limit = 2000,
): DecisionRecordV2[] {
  return [
    ...records.filter((record) => !(
      record.messageId === incoming.messageId
      && record.swipeId === incoming.swipeId
      && record.contentHash === incoming.contentHash
    )),
    incoming,
  ].slice(-limit);
}

export function reconcileDecisionRecords(
  records: DecisionRecordV2[],
  messages: TimelineMessageKey[],
): DecisionRecordV2[] {
  const active = new Map(messages.map((message) => [message.id, message]));
  return records.filter((record) => {
    const message = active.get(record.messageId);
    if (!message) return false;
    if (record.swipeId !== message.swipeId) return true;
    return record.contentHash === message.contentHash;
  });
}

export function replayTimeline(
  timeline: ChatTimelineV2,
  catalog: CatalogEntry[],
  settings: LumiStageSettingsV2,
  messages: TimelineMessageKey[],
  now = Date.now(),
): ChatTimelineV2 {
  const decisions = reconcileDecisionRecords(timeline.decisions, messages);
  const retainedSnapshot = applyDecision(
    timeline.snapshot,
    catalog,
    {
      schemaVersion: 2,
      focusedCharacterIds: [],
      characters: [],
    },
    timeline.manualOverrides,
    settings,
    now,
  );
  const latestAssistant = [...messages].reverse().find((message) => message.role === "assistant");
  const latestDecision = latestAssistant
    ? decisions.find((record) =>
        record.messageId === latestAssistant.id
        && record.swipeId === latestAssistant.swipeId
        && record.contentHash === latestAssistant.contentHash
      )
    : null;
  const latestDecisionRejected = latestDecision?.decision.characters.some(
    (character) => character.confidence < settings.detection.confidence,
  ) ?? false;
  let snapshot = emptySnapshot(timeline.chatId, now);
  const pendingOverrides = Object.values(timeline.manualOverrides)
    .sort((left, right) => left.createdAt - right.createdAt);
  const activeOverrides: Record<string, ManualOverrideV2> = {};
  let overrideIndex = 0;

  const applyManualAnchor = (
    current: StageSnapshotV2,
    override: ManualOverrideV2,
  ): StageSnapshotV2 => {
    activeOverrides[override.characterId] = override;
    const retained = timeline.snapshot.characters[override.characterId];
    const retainedInOutfit = retained?.outfitId === override.outfitId ? retained : null;
    const expressionId = override.expressionId ?? retainedInOutfit?.expressionId;
    const variantId = override.variantId ?? retainedInOutfit?.variantId;
    const anchored = override.outfitId && expressionId
      ? catalog
        .find((entry) => entry.characterId === override.characterId)
        ?.profile.outfits
        .find((outfit) => outfit.id === override.outfitId)
        ?.expressions
        .find((expression) => expression.id === expressionId)
      : null;
    const variant = anchored?.variants.find((item) => item.id === variantId)
      ?? anchored?.variants
        .slice()
        .sort((left, right) => left.order - right.order || left.createdAt - right.createdAt)[0]
      ?? null;
    const characters = anchored && variant
      ? [{
          characterId: override.characterId,
          outfitId: override.outfitId,
          expressionId: anchored.id,
          variantId: variant.id,
          confidence: 1,
        }]
      : [];
    const anchorDecision: DetectionDecisionV2 = {
      schemaVersion: 2,
      focusedCharacterIds: current.focusedCharacterIds.length
        ? current.focusedCharacterIds
        : [override.characterId],
      characters,
    };
    return applyDecision(
      current,
      catalog,
      anchorDecision,
      activeOverrides,
      settings,
      override.createdAt,
    );
  };

  const applyOverridesThrough = (
    current: StageSnapshotV2,
    createdAt: number,
  ): StageSnapshotV2 => {
    let next = current;
    while (
      overrideIndex < pendingOverrides.length
      && pendingOverrides[overrideIndex].createdAt <= createdAt
    ) {
      next = applyManualAnchor(next, pendingOverrides[overrideIndex]);
      overrideIndex += 1;
    }
    return next;
  };

  for (const message of messages) {
    if (message.role !== "assistant") continue;
    const cached = decisions.find((record) =>
      record.messageId === message.id
      && record.swipeId === message.swipeId
      && record.contentHash === message.contentHash
    );
    if (!cached) continue;
    snapshot = applyOverridesThrough(snapshot, cached.createdAt);
    snapshot = applyDecision(
      snapshot,
      catalog,
      cached.decision,
      activeOverrides,
      settings,
      cached.createdAt,
    );
  }
  snapshot = applyOverridesThrough(snapshot, Number.POSITIVE_INFINITY);
  if (
    !latestAssistant
    || !latestDecision
    || latestDecisionRejected
    || Object.keys(snapshot.characters).length === 0
  ) {
    snapshot = retainedSnapshot;
  }
  return {
    ...timeline,
    decisions,
    snapshot,
    revision: timeline.revision + 1,
    updatedAt: now,
  };
}

export function resolveChatCharacterIds(chat: Record<string, unknown>): {
  characterIds: string[];
  primaryCharacterId: string | null;
} {
  const metadata = chat.metadata && typeof chat.metadata === "object" && !Array.isArray(chat.metadata)
    ? chat.metadata as Record<string, unknown>
    : {};
  const directCharacterId = typeof chat.character_id === "string"
    ? chat.character_id
    : typeof chat.characterId === "string"
      ? chat.characterId
      : null;
  const groupIds = metadata.group === true && Array.isArray(metadata.character_ids)
    ? metadata.character_ids.filter(
      (id): id is string => typeof id === "string" && id.length > 0,
    )
    : directCharacterId ? [directCharacterId] : [];
  const muted = new Set(
    Array.isArray(metadata.muted_character_ids)
      ? metadata.muted_character_ids.filter((id): id is string => typeof id === "string")
      : [],
  );
  const characterIds = [...new Set(groupIds)].filter((id) => !muted.has(id));
  return {
    characterIds,
    primaryCharacterId: characterIds.includes(directCharacterId ?? "")
      ? directCharacterId
      : characterIds[0] ?? null,
  };
}
