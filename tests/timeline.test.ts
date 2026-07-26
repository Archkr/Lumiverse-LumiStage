import { describe, expect, it } from "vitest";
import { buildCatalog, createTimeline, defaultSettings } from "../src/model";
import {
  findCachedDecision,
  reconcileDecisionRecords,
  replayTimeline,
  resolveChatCharacterIds,
  upsertDecision,
} from "../src/timeline";
import { profileA, profileB, record } from "./fixtures";

describe("message/swipe decision cache", () => {
  it("keys decisions by message, swipe, and content hash", () => {
    const records = [
      record("message", 0, "hash-0"),
      record("message", 1, "hash-1", { expressionId: "expression-neutral" }),
    ];
    expect(findCachedDecision(records, { id: "message", swipeId: 1, contentHash: "hash-1" }))
      .toBe(records[1]);
    expect(findCachedDecision(records, { id: "message", swipeId: 1, contentHash: "edited" }))
      .toBeNull();
  });

  it("preserves inactive swipes, invalidates an edited active swipe, and drops deletions", () => {
    const records = [
      record("kept", 0, "old-active"),
      record("kept", 1, "inactive"),
      record("deleted", 0, "gone"),
    ];
    const reconciled = reconcileDecisionRecords(records, [
      { id: "kept", role: "assistant", swipeId: 0, contentHash: "edited-active" },
    ]);
    expect(reconciled.map((item) => item.contentHash)).toEqual(["inactive"]);
  });

  it("replays cached ensemble focus without another model call", () => {
    const profiles = [profileA(), profileB()];
    const timeline = createTimeline("chat", 1);
    const a = record("a", 0, "ha");
    const b = record("b", 0, "hb", {
      actorId: "actor-b",
      outfitId: "outfit-b",
      poseId: "pose-b",
      expressionId: "expression-b",
    });
    b.decision.focusedActorIds = ["actor-b"];
    timeline.decisions = [a, b];
    const replayed = replayTimeline(timeline, buildCatalog(profiles), defaultSettings(1), [
      { id: "a", role: "assistant", swipeId: 0, contentHash: "ha" },
      { id: "b", role: "assistant", swipeId: 0, contentHash: "hb" },
    ], 50);
    expect(Object.keys(replayed.snapshot.actors).sort()).toEqual(["actor-a", "actor-b"]);
    expect(replayed.snapshot.focusedActorIds).toEqual(["actor-b"]);
    expect(replayed.snapshot.actors["actor-a"].focused).toBe(false);
    expect(replayed.snapshot.actors["actor-b"].focused).toBe(true);
  });

  it("replaces an identical cache key once and bounds history", () => {
    const old = record("message", 0, "hash");
    const replacement = { ...old, createdAt: 999 };
    expect(upsertDecision([old], replacement, 20)).toEqual([replacement]);
    expect(upsertDecision([record("a", 0, "a"), record("b", 0, "b")], record("c", 0, "c"), 2))
      .toHaveLength(2);
  });
});

describe("group chat composition", () => {
  it("excludes muted members and chooses a visible primary actor", () => {
    expect(resolveChatCharacterIds({
      character_id: "character-a",
      metadata: {
        group: true,
        character_ids: ["character-a", "character-b", "character-b"],
        muted_character_ids: ["character-a"],
      },
    })).toEqual({
      characterIds: ["character-b"],
      primaryCharacterId: "character-b",
    });
  });
});

