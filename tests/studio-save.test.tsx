// @vitest-environment happy-dom

import { act, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import type { SpindleModelComboboxOptions } from "lumiverse-spindle-types";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTimeline, defaultSettings } from "../src/model";
import type { BackendToFrontend, FrontendState, FrontendToBackend } from "../src/types";
import { LumiStageClient } from "../src/ui/client";
import { StudioWorkspace } from "../src/ui/studio";
import { profileA } from "./fixtures";

afterEach(() => {
  document.body.replaceChildren();
});

function backendState(revision: number): FrontendState {
  const profile = profileA();
  profile.revision = revision;
  return {
    settings: defaultSettings(1),
    profile,
    stageProfiles: [profile],
    timeline: createTimeline("chat", 1),
    snapshot: null,
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
    activeChatId: "chat",
    activeCharacterId: profile.characterId,
    activeCharacterName: profile.characterName,
    queueDepth: 0,
    lastDetection: { status: "idle", message: "Ready", at: null },
  };
}

describe("Studio save conflict recovery", () => {
  it("saves the preserved draft against the latest backend revision instead of disabling Save", async () => {
    let receive: (message: BackendToFrontend) => void = () => undefined;
    const sendToBackend = vi.fn((message: FrontendToBackend) => {
      if (message.type === "save-profile") {
        receive({
          type: "operation-complete",
          requestId: message.requestId,
          revision: message.expectedRevision + 1,
        });
      }
    });
    const client = new LumiStageClient({
      sendToBackend,
      onBackendMessage(handler: (message: BackendToFrontend) => void) {
        receive = handler;
        return () => { receive = () => undefined; };
      },
      components: {
        mountSelect(target: Element) {
          return {
            componentId: "select",
            element: target,
            update: vi.fn(),
            destroy: vi.fn(),
            getValue: vi.fn(() => ""),
            refresh: vi.fn(),
          };
        },
      },
    } as never);
    client.start();
    receive({ type: "state", state: backendState(3) });
    const view = render(<StudioWorkspace client={client} />);

    const outfitName = screen.getByLabelText("Outfit folder name");
    fireEvent.input(outfitName, { target: { value: "Edited Outfit" } });
    expect((screen.getByRole("button", { name: "Save changes" }) as HTMLButtonElement).disabled).toBe(false);

    await act(async () => {
      receive({ type: "state", state: backendState(4) });
    });
    expect(await screen.findByText(/backend changed while you were editing/i)).toBeTruthy();
    const save = screen.getByRole("button", { name: "Save changes" });
    expect((save as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(save);

    await waitFor(() => {
      const request = sendToBackend.mock.calls
        .map(([message]) => message)
        .find((message) => message.type === "save-profile");
      expect(request).toEqual(expect.objectContaining({
        type: "save-profile",
        expectedRevision: 4,
        profile: expect.objectContaining({
          revision: 4,
          outfits: expect.arrayContaining([
            expect.objectContaining({ name: "Edited Outfit" }),
          ]),
        }),
      }));
    });
    expect((await screen.findByRole("button", { name: "Saved" }) as HTMLButtonElement).disabled).toBe(true);

    view.unmount();
    client.destroy();
  });

  it("updates and persists a model selected through the native picker", async () => {
    let receive: (message: BackendToFrontend) => void = () => undefined;
    let modelOnChange: SpindleModelComboboxOptions["onChange"];
    const sendToBackend = vi.fn((message: FrontendToBackend) => {
      if (message.type === "save-settings") {
        receive({
          type: "operation-complete",
          requestId: message.requestId,
          revision: message.expectedRevision + 1,
          result: {
            settings: {
              ...message.settings,
              revision: message.expectedRevision + 1,
            },
          },
        });
      }
    });
    const mountedHandle = (target: Element, value: unknown = "") => ({
      componentId: crypto.randomUUID(),
      element: target,
      update: vi.fn(),
      destroy: vi.fn(),
      getValue: vi.fn(() => value),
      refresh: vi.fn(),
    });
    const client = new LumiStageClient({
      sendToBackend,
      onBackendMessage(handler: (message: BackendToFrontend) => void) {
        receive = handler;
        return () => { receive = () => undefined; };
      },
      components: {
        mountBadge: vi.fn((target: Element) => mountedHandle(target)),
        mountSelect: vi.fn((target: Element) => mountedHandle(target)),
        mountSwitch: vi.fn((target: Element) => mountedHandle(target, true)),
        mountModelCombobox: vi.fn((
          target: Element,
          options: SpindleModelComboboxOptions,
        ) => {
          modelOnChange = options.onChange;
          return mountedHandle(target, options.value ?? "");
        }),
        mountNumberStepper: vi.fn((target: Element) => mountedHandle(target, 5)),
        mountRangeSlider: vi.fn((target: Element) => mountedHandle(target, 60)),
        mountPagination: vi.fn((target: Element) => mountedHandle(target)),
      },
    } as never);
    client.start();
    const state = backendState(3);
    state.settings.revision = 4;
    state.settings.detection.connectionId = "connection-a";
    state.settings.detection.model = "model-old";
    state.connections = [{
      id: "connection-a",
      name: "Primary",
      provider: "openai",
      model: "model-old",
      isDefault: true,
      hasApiKey: true,
    }];
    receive({ type: "state", state });
    const view = render(<StudioWorkspace client={client} />);
    fireEvent.click(screen.getByRole("button", { name: "Settings" }));
    await waitFor(() => expect(modelOnChange).toBeTypeOf("function"));

    await act(async () => {
      modelOnChange?.("model-new");
    });
    const save = screen.getByRole("button", { name: "Save settings" });
    expect((save as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(save);

    await waitFor(() => {
      const request = sendToBackend.mock.calls
        .map(([message]) => message)
        .find((message) => message.type === "save-settings");
      expect(request).toEqual(expect.objectContaining({
        type: "save-settings",
        expectedRevision: 4,
        settings: expect.objectContaining({
          detection: expect.objectContaining({ model: "model-new" }),
        }),
      }));
    });

    view.unmount();
    client.destroy();
  });
});
