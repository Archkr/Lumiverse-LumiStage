// @vitest-environment happy-dom

import { render, screen } from "@testing-library/preact";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTimeline, defaultSettings } from "../src/model";
import type { BackendToFrontend, FrontendState } from "../src/types";
import { LumiStageClient } from "../src/ui/client";
import { Stage } from "../src/ui/stage";
import { profileA } from "./fixtures";

afterEach(() => {
  document.body.replaceChildren();
});

describe("floating stage emphasis", () => {
  it("does not dim a lone character when the detector returns no explicit focus", () => {
    let receive: (message: BackendToFrontend) => void = () => undefined;
    const client = new LumiStageClient({
      sendToBackend: vi.fn(),
      onBackendMessage(handler: (message: BackendToFrontend) => void) {
        receive = handler;
        return () => { receive = () => undefined; };
      },
    } as never);
    const profile = profileA();
    const timeline = createTimeline("chat", 1);
    timeline.snapshot.characters[profile.characterId] = {
      characterId: profile.characterId,
      outfitId: "outfit-casual",
      expressionId: "expression-neutral",
      variantId: "variant-neutral-a",
      imageId: "image-neutral-a",
      label: "Aster · Casual · Neutral",
      focused: false,
      confidence: 1,
    };
    const state: FrontendState = {
      settings: defaultSettings(1),
      profile,
      stageProfiles: [profile],
      timeline,
      snapshot: timeline.snapshot,
      variantViews: {
        "variant-neutral-a": {
          ...profile.outfits[0].expressions[0].variants[0],
          url: "https://example.invalid/neutral.png",
          thumbUrl: null,
        },
      },
      connections: [],
      permissions: {
        generation: true,
        chats: true,
        chatMutation: true,
        characters: true,
        images: true,
        uiPanels: true,
      },
      activeChatId: "chat",
      activeCharacterId: profile.characterId,
      activeCharacterName: profile.characterName,
      queueDepth: 0,
      detectorDebugRuns: [],
      lastDetection: { status: "idle", message: "Ready", at: null },
    };
    client.start();
    receive({ type: "state", state });

    const view = render(
      <Stage
        client={client}
        mobile={false}
        onFullscreen={vi.fn()}
        onHide={vi.fn()}
        onQuick={vi.fn()}
        onResize={vi.fn()}
      />,
    );

    expect(screen.getByAltText("Aster · Casual · Neutral")).toBeTruthy();
    expect(document.querySelector(".ls-stage-character")?.getAttribute("data-idle")).toBe("false");

    view.unmount();
    client.destroy();
  });
});
