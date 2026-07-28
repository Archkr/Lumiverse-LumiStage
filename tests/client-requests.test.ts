// @vitest-environment happy-dom

import { describe, expect, it, vi } from "vitest";
import { createTimeline, defaultSettings } from "../src/model";
import type { BackendToFrontend, FrontendState, FrontendToBackend } from "../src/types";
import { LumiStageClient } from "../src/ui/client";
import { profileA } from "./fixtures";

function state(): FrontendState {
  const profile = profileA();
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

describe("correlated client request lifecycle", () => {
  it("settles every control operation on operation-complete without leaving busy state", async () => {
    let receive: (message: BackendToFrontend) => void = () => undefined;
    const backend = state();
    const sendToBackend = vi.fn((message: FrontendToBackend) => {
      if (!("requestId" in message)) return;
      queueMicrotask(() => {
        if (message.type === "save-settings") {
          const saved = {
            ...message.settings,
            revision: message.expectedRevision + 1,
            updatedAt: 10,
          };
          backend.settings = saved;
          receive({
            type: "operation-complete",
            requestId: message.requestId,
            revision: message.expectedRevision + 1,
            result: {
              settings: saved,
            },
          });
          return;
        }
        if (message.type === "patch-settings") {
          const saved = {
            ...backend.settings,
            detection: message.patch.detection
              ? { ...backend.settings.detection, ...message.patch.detection }
              : backend.settings.detection,
            appearance: message.patch.appearance
              ? { ...backend.settings.appearance, ...message.patch.appearance }
              : backend.settings.appearance,
            preloadAdjacent: message.patch.preloadAdjacent ?? backend.settings.preloadAdjacent,
            revision: backend.settings.revision + 1,
            updatedAt: 11,
          };
          backend.settings = saved;
          receive({
            type: "operation-complete",
            requestId: message.requestId,
            revision: saved.revision,
            result: { settings: saved },
          });
          return;
        }
        receive({
          type: "operation-complete",
          requestId: message.requestId,
          revision: "expectedRevision" in message ? message.expectedRevision + 1 : undefined,
          result: message.type === "request-diagnostics" ? { ok: true } : undefined,
        });
      });
    });
    const client = new LumiStageClient({
      sendToBackend,
      onBackendMessage(handler: (message: BackendToFrontend) => void) {
        receive = handler;
        return () => { receive = () => undefined; };
      },
    } as never);
    client.start();
    receive({ type: "state", state: backend });

    const initialSettingsRevision = backend.settings.revision;
    const settings = await client.saveSettings(backend.settings);
    expect(settings.revision).toBe(initialSettingsRevision + 1);
    await client.saveProfile(backend.profile!);
    await client.saveChatLayout({ width: 500 });
    await client.applyManual({
      characterId: "character-a",
      outfitId: "outfit-casual",
      scope: "locked",
      lock: "outfit",
      createdAt: 1,
    });
    await client.clearManual("character-a");
    await client.patchSettings({
      detection: {
        connectionId: "connection-manual",
        model: "model-manual",
      },
    });
    await client.analyzeNow();
    await client.deleteVariants(["variant-neutral-a"]);
    await expect(client.diagnostics()).resolves.toEqual({ ok: true });

    expect(sendToBackend.mock.calls.map(([message]) => message.type)).toEqual(expect.arrayContaining([
      "save-settings",
      "patch-settings",
      "save-profile",
      "save-chat-layout",
      "apply-manual",
      "clear-manual",
      "analyze-now",
      "delete-variants",
      "request-diagnostics",
    ]));
    expect(sendToBackend.mock.calls.map(([message]) => message).find(
      (message) => message.type === "analyze-now",
    )).toEqual(expect.not.objectContaining({ detection: expect.anything() }));
    expect(client.getSnapshot().busy).toBe(false);
    expect(client.getSnapshot().progress).toBeNull();
    client.destroy();
  });

  it("cleans pending state when a synchronous backend send fails", async () => {
    const client = new LumiStageClient({
      sendToBackend() {
        throw new Error("transport unavailable");
      },
      onBackendMessage() {
        return () => undefined;
      },
    } as never);
    client.start();
    await expect(client.saveSettings(defaultSettings(0))).rejects.toThrow("transport unavailable");
    expect(client.getSnapshot().busy).toBe(false);
    client.destroy();
  });

  it("rejects pending work and clears busy state on unload", async () => {
    let receive: (message: BackendToFrontend) => void = () => undefined;
    const client = new LumiStageClient({
      sendToBackend: vi.fn(),
      onBackendMessage(handler: (message: BackendToFrontend) => void) {
        receive = handler;
        return () => { receive = () => undefined; };
      },
    } as never);
    client.start();
    receive({ type: "state", state: state() });
    const pending = client.analyzeNow();
    expect(client.getSnapshot().busy).toBe(true);
    client.destroy();
    await expect(pending).rejects.toThrow("LumiStage unloaded");
    expect(client.getSnapshot().busy).toBe(false);
  });

  it("rejects archives before staging an additive media import", async () => {
    const backend = state();
    const client = new LumiStageClient({
      sendToBackend: vi.fn(),
      onBackendMessage(handler: (message: BackendToFrontend) => void) {
        handler({ type: "state", state: backend });
        return () => undefined;
      },
    } as never);
    client.start();
    await expect(client.importFiles(
      [new File([new Uint8Array([1])], "backup.lumistage.zip")],
      backend.profile!,
      "automatic",
    )).rejects.toThrow("Use Restore archive");
    expect(client.getSnapshot().busy).toBe(false);
    client.destroy();
  });
});
