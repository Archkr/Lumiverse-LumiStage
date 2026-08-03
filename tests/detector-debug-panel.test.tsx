// @vitest-environment happy-dom

import { fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTimeline, defaultSettings } from "../src/model";
import type { BackendToFrontend, DetectorDebugRun, FrontendState } from "../src/types";
import { LumiStageClient } from "../src/ui/client";
import { DetectorDebugPanel, formatDetectorDebugTranscript } from "../src/ui/studio";

function debugRun(
  id: string,
  status: DetectorDebugRun["status"],
  reasoning: string | null,
  raw = true,
): DetectorDebugRun {
  return {
    id,
    trigger: id === "run-1" ? "completion" : "manual",
    source: raw ? "provider" : "cache",
    status,
    startedAt: id === "run-1" ? 1_000 : 2_000,
    completedAt: id === "run-1" ? 1_125 : 2_050,
    durationMs: id === "run-1" ? 125 : 50,
    messageId: `message-${id}`,
    connectionId: "connection-a",
    connectionName: "Primary",
    requestedModel: "detector-model",
    responseProvider: "openai",
    responseModel: "detector-model",
    confidenceThreshold: 0.6,
    reasoning,
    rawResponse: raw
      ? {
          content: null,
          toolCalls: [{
            name: "set_stage_state",
            args: {
              focusedCharacterIds: ["character-a"],
              characters: [{
                characterId: "character-a",
                outfitName: "Casual",
                expressionName: "Happy",
                confidence: 0.9,
              }],
            },
          }],
          finishReason: "tool_calls",
          usage: {
            promptTokens: 100,
            inputTokens: null,
            completionTokens: 20,
            totalTokens: 120,
          },
        }
      : null,
    parsedDecision: {
      schemaVersion: 2,
      focusedCharacterIds: ["character-a"],
      characters: [{
        characterId: "character-a",
        outfitId: "outfit-casual",
        expressionId: "expression-happy",
        variantId: "variant-happy",
        confidence: 0.9,
      }],
    },
    outcome: raw ? "Applied the detector decision to the stage." : "Restored and applied a cached detector decision.",
    error: null,
  };
}

function setupPanel(runs: DetectorDebugRun[]) {
  let receive: (message: BackendToFrontend) => void = () => undefined;
  const client = new LumiStageClient({
    sendToBackend: vi.fn(),
    onBackendMessage(handler: (message: BackendToFrontend) => void) {
      receive = handler;
      return () => { receive = () => undefined; };
    },
  } as never);
  const timeline = createTimeline("chat-a", 1);
  const state: FrontendState = {
    settings: defaultSettings(1),
    profile: null,
    stageProfiles: [],
    timeline,
    snapshot: timeline.snapshot,
    variantViews: {},
    connections: [],
    permissions: {
      generation: true,
      chats: true,
      chatMutation: true,
      characters: true,
      images: true,
      uiPanels: true,
    },
    activeChatId: "chat-a",
    activeCharacterId: null,
    activeCharacterName: null,
    queueDepth: 0,
    detectorDebugRuns: runs,
    lastDetection: { status: "success", message: "Ready", at: 2_050 },
  };
  client.start();
  receive({ type: "state", state });
  const notify = vi.spyOn(client, "notify");
  const view = render(<DetectorDebugPanel client={client} />);
  return {
    client,
    notify,
    unmount() {
      view.unmount();
      client.destroy();
    },
  };
}

afterEach(() => {
  document.body.replaceChildren();
  Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
  Object.defineProperty(document, "execCommand", { value: undefined, configurable: true });
});

describe("detector debug panel", () => {
  it("mounts every run, keeps thinking collapsed, and copies only thinking plus readable model output", async () => {
    const runs = [
      debugRun("run-1", "accepted", "First hidden thought."),
      debugRun("run-2", "cached", null, false),
    ];
    const writeText = vi.fn(async (_text: string) => undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    const panel = setupPanel(runs);

    expect(document.querySelectorAll(".ls-debug-run")).toHaveLength(2);
    expect(screen.getByText("First hidden thought.")).toBeTruthy();
    expect(document.querySelectorAll("details.ls-debug-thinking[open]")).toHaveLength(0);
    expect(screen.getAllByText("Output")).toHaveLength(2);
    expect(screen.getByText("Cached decision; original model output is unavailable.")).toBeTruthy();
    expect(screen.getByText(/Expression: Happy/)).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /copy all/i }));
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    const copied = writeText.mock.calls[0][0];
    expect(copied).toContain("Thinking\n\nFirst hidden thought.");
    expect(copied).toContain("Output\n\nCharacter: character-a");
    expect(copied).toContain("Outfit: Casual");
    expect(copied).toContain("Expression: Happy");
    expect(copied).toContain("First hidden thought.");
    expect(copied).toContain("Cached decision; original model output is unavailable.");
    expect(copied).not.toContain("Status:");
    expect(copied).not.toContain("variantId");
    expect(copied).not.toContain("tool_calls");
    expect(copied).not.toContain("~~~");
    expect(panel.notify).toHaveBeenCalledWith("success", "Copied 2 detector runs.");

    panel.unmount();
  });

  it("falls back to selection-based copying when the Clipboard API is unavailable", async () => {
    const execCommand = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", { value: execCommand, configurable: true });
    const panel = setupPanel([debugRun("run-1", "accepted", "Fallback thought.")]);

    fireEvent.click(screen.getByRole("button", { name: /copy all/i }));
    await waitFor(() => expect(execCommand).toHaveBeenCalledWith("copy"));
    expect(panel.notify).toHaveBeenCalledWith("success", "Copied 1 detector run.");

    panel.unmount();
  });

  it("formats only reasoning and provider output without internal diagnostics", () => {
    const run = debugRun("run-1", "error", "Parsed reasoning.");
    run.error = "The detector did not return a valid stage decision.";
    run.outcome = "Detector run failed.";
    const transcript = formatDetectorDebugTranscript([run]);
    expect(transcript).toContain("Parsed reasoning.");
    expect(transcript).toContain("Expression: Happy");
    expect(transcript).not.toContain("The detector did not return a valid stage decision.");
    expect(transcript).not.toContain("Status:");
  });
});
