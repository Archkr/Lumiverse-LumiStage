import { describe, expect, it } from "vitest";
import { applyDecision, buildCatalog, createTimeline, defaultSettings } from "../src/model";
import {
  findCachedDecision,
  reconcileDecisionRecords,
  replayTimeline,
  resolveChatCharacterIds,
  upsertDecision,
} from "../src/timeline";
import { profileA, recordA } from "./fixtures";

describe("decision cache and replay", () => {
  it("keys cached decisions by message, swipe, and content hash", () => {
    const first = recordA("message", 0, "hash-a");
    const second = recordA("message", 1, "hash-b", {
      expressionId: "expression-angry",
      variantId: "variant-expression-angry",
    });
    const records = upsertDecision(upsertDecision([], first), second);
    expect(findCachedDecision(records, { id: "message", swipeId: 0, contentHash: "hash-a" }, "fingerprint")).toBe(first);
    expect(findCachedDecision(records, { id: "message", swipeId: 1, contentHash: "hash-b" }, "fingerprint")).toBe(second);
    expect(findCachedDecision(records, { id: "message", swipeId: 0, contentHash: "hash-a" }, "changed")).toBeNull();
    expect(findCachedDecision([{ ...first, requestFingerprint: undefined }], {
      id: "message",
      swipeId: 0,
      contentHash: "hash-a",
    }, "fingerprint")).toBeNull();
  });

  it("invalidates active edits while retaining inactive swipe records", () => {
    const records = [
      recordA("message", 0, "old"),
      recordA("message", 1, "active"),
      recordA("deleted", 0, "gone"),
    ];
    const reconciled = reconcileDecisionRecords(records, [{
      id: "message",
      role: "assistant",
      swipeId: 1,
      contentHash: "edited",
    }]);
    expect(reconciled.map((item) => [item.swipeId, item.contentHash])).toEqual([[0, "old"]]);
  });

  it("replays unchanged decisions without another detector call", () => {
    const timeline = createTimeline("chat", 1);
    timeline.decisions = [
      recordA("first", 0, "hash-first"),
      recordA("second", 0, "hash-second", {
        expressionId: "expression-angry",
        variantId: "variant-expression-angry",
      }),
    ];
    const replayed = replayTimeline(
      timeline,
      buildCatalog([profileA()]),
      defaultSettings(1),
      [
        { id: "first", role: "assistant", swipeId: 0, contentHash: "hash-first" },
        { id: "second", role: "assistant", swipeId: 0, contentHash: "hash-second" },
      ],
      20,
    );
    expect(replayed.snapshot.characters["character-a"].expressionId).toBe("expression-angry");
    expect(replayed.snapshot.characters["character-a"].variantId).toBe("variant-expression-angry");
    expect(replayed.snapshot.focusedCharacterIds).toEqual(["character-a"]);
  });

  it("preserves the last valid stage while a swipe or regeneration has no replacement decision", () => {
    const catalog = buildCatalog([profileA()]);
    const settings = defaultSettings(1);
    const timeline = createTimeline("chat", 1);
    const current = recordA("message", 0, "old-swipe");
    timeline.decisions = [current];
    timeline.snapshot = applyDecision(
      timeline.snapshot,
      catalog,
      current.decision,
      {},
      settings,
      10,
    );

    const swiped = replayTimeline(
      timeline,
      catalog,
      settings,
      [{ id: "message", role: "assistant", swipeId: 1, contentHash: "new-swipe" }],
      20,
    );
    expect(swiped.snapshot.characters["character-a"]).toEqual(
      timeline.snapshot.characters["character-a"],
    );
    expect(swiped.snapshot.focusedCharacterIds).toEqual(["character-a"]);

    const regenerating = replayTimeline(
      { ...timeline, decisions: [] },
      catalog,
      settings,
      [],
      30,
    );
    expect(regenerating.snapshot.characters["character-a"]).toEqual(
      timeline.snapshot.characters["character-a"],
    );
    expect(regenerating.snapshot.focusedCharacterIds).toEqual(["character-a"]);
  });

  it("rolls back to the latest surviving decision after a message is deleted", () => {
    const catalog = buildCatalog([profileA()]);
    const settings = defaultSettings(1);
    const first = recordA("first", 0, "first");
    const second = recordA("second", 0, "second", {
      expressionId: "expression-angry",
      variantId: "variant-expression-angry",
    });
    const timeline = createTimeline("chat", 1);
    timeline.decisions = [first, second];
    timeline.snapshot = applyDecision(
      applyDecision(timeline.snapshot, catalog, first.decision, {}, settings, 10),
      catalog,
      second.decision,
      {},
      settings,
      20,
    );

    const replayed = replayTimeline(
      timeline,
      catalog,
      settings,
      [{ id: "first", role: "assistant", swipeId: 0, contentHash: "first" }],
      30,
    );
    expect(replayed.snapshot.characters["character-a"].expressionId).toBe("expression-happy");
    expect(replayed.snapshot.characters["character-a"].variantId).toBe("variant-expression-happy");
  });
});

describe("group membership", () => {
  it("uses public group metadata and excludes muted members", () => {
    const resolved = resolveChatCharacterIds({
      character_id: "character-a",
      metadata: {
        group: true,
        character_ids: ["character-a", "character-b", "character-b"],
        muted_character_ids: ["character-b"],
      },
    });
    expect(resolved).toEqual({
      characterIds: ["character-a"],
      primaryCharacterId: "character-a",
    });
  });
});
