import { describe, expect, it } from "vitest";
import {
  applyDecision,
  applyManualOverride,
  buildCatalog,
  createTimeline,
  defaultSettings,
} from "../src/model";
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

  it("replays an outfit-lock anchor chronologically and preserves manual expression shifts", () => {
    const catalog = buildCatalog([profileA()]);
    const settings = defaultSettings(1);
    const oldDecision = {
      ...recordA("before-lock", 0, "before-lock"),
      createdAt: 10,
    };
    const timeline = createTimeline("chat", 1);
    timeline.decisions = [oldDecision];
    timeline.snapshot = applyDecision(
      timeline.snapshot,
      catalog,
      oldDecision.decision,
      {},
      settings,
      oldDecision.createdAt,
    );
    const locked = applyManualOverride(timeline, catalog, {
      characterId: "character-a",
      outfitId: "outfit-casual",
      expressionId: "expression-angry",
      variantId: "variant-expression-angry",
      scope: "locked",
      lock: "outfit",
      createdAt: 20,
    }, settings, 20);

    const replayed = replayTimeline(
      locked,
      catalog,
      settings,
      [{ id: "before-lock", role: "assistant", swipeId: 0, contentHash: "before-lock" }],
      30,
    );
    expect(replayed.manualOverrides["character-a"]).toEqual(expect.objectContaining({
      lock: "outfit",
      expressionId: "expression-angry",
      variantId: "variant-expression-angry",
      createdAt: 20,
    }));
    expect(replayed.snapshot.characters["character-a"]).toEqual(expect.objectContaining({
      outfitId: "outfit-casual",
      expressionId: "expression-angry",
      variantId: "variant-expression-angry",
    }));
  });

  it("uses the retained snapshot as the anchor for legacy outfit locks", () => {
    const catalog = buildCatalog([profileA()]);
    const settings = defaultSettings(1);
    const oldDecision = {
      ...recordA("before-lock", 0, "before-lock"),
      createdAt: 10,
    };
    const timeline = createTimeline("chat", 1);
    timeline.decisions = [oldDecision];
    timeline.snapshot = applyDecision(
      timeline.snapshot,
      catalog,
      {
        schemaVersion: 2,
        focusedCharacterIds: ["character-a"],
        characters: [{
          characterId: "character-a",
          outfitId: "outfit-casual",
          expressionId: "expression-angry",
          variantId: "variant-expression-angry",
          confidence: 1,
        }],
      },
      {},
      settings,
      20,
    );
    timeline.manualOverrides["character-a"] = {
      characterId: "character-a",
      outfitId: "outfit-casual",
      scope: "locked",
      lock: "outfit",
      createdAt: 20,
    };

    const replayed = replayTimeline(
      timeline,
      catalog,
      settings,
      [{ id: "before-lock", role: "assistant", swipeId: 0, contentHash: "before-lock" }],
      30,
    );
    expect(replayed.snapshot.characters["character-a"]).toEqual(expect.objectContaining({
      outfitId: "outfit-casual",
      expressionId: "expression-angry",
      variantId: "variant-expression-angry",
    }));
  });

  it("allows post-lock decisions to change expressions but never the locked outfit", () => {
    const catalog = buildCatalog([profileA()]);
    const settings = defaultSettings(1);
    const timeline = createTimeline("chat", 1);
    timeline.manualOverrides["character-a"] = {
      characterId: "character-a",
      outfitId: "outfit-casual",
      expressionId: "expression-angry",
      variantId: "variant-expression-angry",
      scope: "locked",
      lock: "outfit",
      createdAt: 20,
    };
    timeline.decisions = [
      {
        ...recordA("before-lock", 0, "before-lock", {
          outfitId: "outfit-formal",
          expressionId: "expression-formal",
          variantId: "variant-expression-formal",
        }),
        createdAt: 10,
      },
      {
        ...recordA("after-lock", 0, "after-lock", {
          expressionId: "expression-happy",
          variantId: "variant-expression-happy",
        }),
        createdAt: 30,
      },
      {
        ...recordA("invalid-outfit", 0, "invalid-outfit", {
          outfitId: "outfit-formal",
          expressionId: "expression-formal",
          variantId: "variant-expression-formal",
        }),
        createdAt: 40,
      },
    ];

    const replayed = replayTimeline(
      timeline,
      catalog,
      settings,
      [
        { id: "before-lock", role: "assistant", swipeId: 0, contentHash: "before-lock" },
        { id: "after-lock", role: "assistant", swipeId: 0, contentHash: "after-lock" },
        { id: "invalid-outfit", role: "assistant", swipeId: 0, contentHash: "invalid-outfit" },
      ],
      50,
    );
    expect(replayed.snapshot.characters["character-a"]).toEqual(expect.objectContaining({
      outfitId: "outfit-casual",
      expressionId: "expression-happy",
      variantId: "variant-expression-happy",
    }));
  });

  it("keeps a chronological state lock exact across later decisions", () => {
    const catalog = buildCatalog([profileA()]);
    const settings = defaultSettings(1);
    const timeline = createTimeline("chat", 1);
    timeline.manualOverrides["character-a"] = {
      characterId: "character-a",
      outfitId: "outfit-casual",
      expressionId: "expression-angry",
      variantId: "variant-expression-angry",
      scope: "locked",
      lock: "state",
      createdAt: 20,
    };
    timeline.decisions = [{
      ...recordA("after-lock", 0, "after-lock", {
        expressionId: "expression-happy",
        variantId: "variant-expression-happy",
      }),
      createdAt: 30,
    }];

    const replayed = replayTimeline(
      timeline,
      catalog,
      settings,
      [{ id: "after-lock", role: "assistant", swipeId: 0, contentHash: "after-lock" }],
      40,
    );
    expect(replayed.snapshot.characters["character-a"]).toEqual(expect.objectContaining({
      outfitId: "outfit-casual",
      expressionId: "expression-angry",
      variantId: "variant-expression-angry",
    }));
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
