import { describe, expect, it } from "vitest";
import { buildDetectorRequest, parseDetectorResponse, validateDecision } from "../src/detector";
import { buildCatalog, defaultSettings } from "../src/model";
import { decision, profileA, profileB } from "./fixtures";

describe("structured detector contract", () => {
  it("prefers the named tool call and normalizes confidence", () => {
    const parsed = parseDetectorResponse({
      content: "not json",
      tool_calls: [{
        name: "set_stage_state",
        args: {
          focusedActorIds: ["actor-a", "actor-a"],
          actors: [{ ...decision().actors[0], confidence: 7 }],
        },
      }],
    });
    expect(parsed?.focusedActorIds).toEqual(["actor-a"]);
    expect(parsed?.actors[0].confidence).toBe(1);
  });

  it("accepts fenced JSON fallback and rejects malformed output", () => {
    expect(parseDetectorResponse({
      content: `\`\`\`json\n${JSON.stringify(decision())}\n\`\`\``,
    })?.actors[0].actorId).toBe("actor-a");
    expect(parseDetectorResponse({ content: "certainly happy" })).toBeNull();
  });

  it("drops every invented or disabled catalog ID", () => {
    const catalog = buildCatalog([profileA()]);
    const validated = validateDecision({
      schemaVersion: 1,
      focusedActorIds: ["actor-a", "invented"],
      actors: [
        { ...decision().actors[0], expressionId: "invented" },
        { ...decision().actors[0], actorId: "invented" },
      ],
    }, catalog);
    expect(validated.focusedActorIds).toEqual(["actor-a"]);
    expect(validated.actors).toHaveLength(1);
    expect(validated.actors[0].expressionId).toBeNull();
  });

  it("classifies an ensemble in one low-temperature request using only recent context", () => {
    const settings = defaultSettings(1);
    settings.detection.contextMessages = 5;
    const request = buildDetectorRequest(
      buildCatalog([profileA(), profileB()]),
      Array.from({ length: 8 }, (_, index) => ({ role: index % 2 ? "assistant" : "user", content: `message-${index}` })),
      {},
      settings,
    );
    expect(request.parameters).toMatchObject({ temperature: 0.1 });
    expect(request.tools).toHaveLength(1);
    const messages = request.messages as Array<{ role: string; content: string }>;
    expect(messages.filter((item) => item.content.startsWith("message-")).map((item) => item.content))
      .toEqual(["message-3", "message-4", "message-5", "message-6", "message-7"]);
    expect(messages[0].content).toContain("actor-a");
    expect(messages[0].content).toContain("actor-b");
  });
});

