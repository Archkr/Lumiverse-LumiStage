import { applyDecision, emptySnapshot, type CatalogEntry } from "./model";
import type {
  ChatTimelineV2,
  DecisionRecordV2,
  LumiStageSettingsV2,
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
  let snapshot = emptySnapshot(timeline.chatId, now);
  for (const message of messages) {
    if (message.role !== "assistant") continue;
    const cached = decisions.find((record) =>
      record.messageId === message.id
      && record.swipeId === message.swipeId
      && record.contentHash === message.contentHash
    );
    if (!cached) continue;
    snapshot = applyDecision(
      snapshot,
      catalog,
      cached.decision,
      timeline.manualOverrides,
      settings,
      cached.createdAt,
    );
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
