import { describe, expect, it } from "vitest";
import { buildCatalog, createTimeline, defaultSettings } from "../src/model";
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
