import { applyDecision, emptySnapshot, type CatalogEntry } from "./model";
import type {
  ChatTimelineV1,
  DecisionRecord,
  LumiStageSettingsV1,
} from "./types";

export interface TimelineMessageKey {
  id: string;
  role: string;
  swipeId: number;
  contentHash: string;
}

export function findCachedDecision(
  records: DecisionRecord[],
  message: Pick<TimelineMessageKey, "id" | "swipeId" | "contentHash">,
): DecisionRecord | null {
  return records.find((record) =>
    record.messageId === message.id
    && record.swipeId === message.swipeId
    && record.contentHash === message.contentHash
  ) ?? null;
}

export function upsertDecision(records: DecisionRecord[], incoming: DecisionRecord, limit = 2000): DecisionRecord[] {
  return [
    ...records.filter((record) => !(
      record.messageId === incoming.messageId
      && record.swipeId === incoming.swipeId
      && record.contentHash === incoming.contentHash
    )),
    incoming,
  ].slice(-limit);
}

/**
 * Drop deleted-message records and stale content for the currently selected
 * swipe while retaining inactive swipe records for instant restoration.
 */
export function reconcileDecisionRecords(
  records: DecisionRecord[],
  messages: TimelineMessageKey[],
): DecisionRecord[] {
  const active = new Map(messages.map((message) => [message.id, message]));
  return records.filter((record) => {
    const message = active.get(record.messageId);
    if (!message) return false;
    if (record.swipeId !== message.swipeId) return true;
    return record.contentHash === message.contentHash;
  });
}

export function replayTimeline(
  timeline: ChatTimelineV1,
  catalog: CatalogEntry[],
  settings: LumiStageSettingsV1,
  messages: TimelineMessageKey[],
  now = Date.now(),
): ChatTimelineV1 {
  const decisions = reconcileDecisionRecords(timeline.decisions, messages);
  let snapshot = emptySnapshot(timeline.chatId, now);
  for (const message of messages) {
    if (message.role !== "assistant") continue;
    const record = findCachedDecision(decisions, message);
    if (record) {
      snapshot = applyDecision(
        snapshot,
        catalog,
        record.decision,
        timeline.manualOverrides,
        settings,
        record.createdAt,
      );
    }
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
    ? metadata.character_ids.filter((id): id is string => typeof id === "string" && id.length > 0)
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

