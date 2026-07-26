// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { setup } from "../src/frontend";
import { createTimeline, defaultSettings } from "../src/model";
import type { BackendToFrontend, FrontendState } from "../src/types";
import { profileA } from "./fixtures";

afterEach(() => {
  document.body.replaceChildren();
});

function handleRoot() {
  const root = document.createElement("div");
  document.body.append(root);
  return root;
}

function mockContext() {
  let backendHandler: ((message: BackendToFrontend) => void) | null = null;
  const removeStyle = vi.fn();
  const removeBackend = vi.fn();
  const removeChat = vi.fn();
  const removeEditor = vi.fn();
  const removeInputClick = vi.fn();
  const removeDrag = vi.fn();
  const drawer = {
    root: handleRoot(),
    tabId: "lumi_stage:studio",
    setTitle: vi.fn(),
    setShortName: vi.fn(),
    setBadge: vi.fn(),
    activate: vi.fn(),
    destroy: vi.fn(),
    onActivate: vi.fn(() => vi.fn()),
  };
  const character = {
    root: handleRoot(),
    tabId: "lumi_stage:profile",
    setTitle: vi.fn(),
    activate: vi.fn(),
    destroy: vi.fn(),
    onActivate: vi.fn(() => vi.fn()),
  };
  const input = {
    actionId: "lumi_stage:quick-select",
    setLabel: vi.fn(),
    setSubtitle: vi.fn(),
    setEnabled: vi.fn(),
    onClick: vi.fn(() => removeInputClick),
    destroy: vi.fn(),
  };
  let visible = true;
  let fullscreen = false;
  const float = {
    root: handleRoot(),
    widgetId: "widget",
    moveTo: vi.fn(),
    getPosition: vi.fn(() => ({ x: 1, y: 2 })),
    setSize: vi.fn(),
    setVisible: vi.fn((next: boolean) => { visible = next; }),
    isVisible: vi.fn(() => visible),
    setFullscreen: vi.fn((next: boolean) => { fullscreen = next; }),
    isFullscreen: vi.fn(() => fullscreen),
    destroy: vi.fn(),
    onDragEnd: vi.fn(() => removeDrag),
  };
  const context = {
    deferReady: vi.fn(),
    ready: vi.fn(),
    getActiveChat: vi.fn(() => ({ chatId: "chat", characterId: "character-a" })),
    sendToBackend: vi.fn(),
    onBackendMessage: vi.fn((handler: (message: BackendToFrontend) => void) => {
      backendHandler = handler;
      return removeBackend;
    }),
    dom: {
      addStyle: vi.fn(() => removeStyle),
    },
    events: {
      on: vi.fn(() => removeChat),
      emit: vi.fn(),
    },
    permissions: {
      getGranted: vi.fn(async () => []),
      request: vi.fn(),
    },
    ui: {
      registerDrawerTab: vi.fn(() => drawer),
      registerCharacterEditorTab: vi.fn(() => character),
      registerInputBarAction: vi.fn(() => input),
      createFloatWidget: vi.fn(() => float),
      characterEditor: {
        getState: vi.fn(() => ({ open: false, characterId: null, activeTabId: null, extensions: {} })),
        onChange: vi.fn(() => removeEditor),
      },
    },
  };
  return {
    context,
    drawer,
    character,
    input,
    float,
    removeBackend,
    removeChat,
    removeEditor,
    removeInputClick,
    removeDrag,
    removeStyle,
    emitBackend(message: BackendToFrontend) {
      backendHandler?.(message);
    },
  };
}

function state(permissions: FrontendState["permissions"]): FrontendState {
  const profile = profileA();
  return {
    settings: defaultSettings(1),
    profile,
    stageProfiles: [profile],
    timeline: createTimeline("chat", 1),
    snapshot: null,
    assetViews: {},
    connections: [],
    permissions,
    activeChatId: "chat",
    activeCharacterId: "character-a",
    activeCharacterName: "Aster",
    queueDepth: 0,
    lastDetection: { status: "idle", message: "Ready", at: null },
  };
}

describe("frontend host lifecycle", () => {
  it("registers permission-gated placements, removes them on revocation, and cleans every subscription", async () => {
    const mock = mockContext();
    const cleanup = setup(mock.context as never);
    await Promise.resolve();
    expect(mock.context.deferReady).toHaveBeenCalledOnce();
    expect(mock.context.ui.registerDrawerTab).toHaveBeenCalledOnce();
    expect(mock.context.sendToBackend).toHaveBeenCalledWith({
      type: "ready",
      chatId: "chat",
      characterId: "character-a",
    });

    mock.emitBackend({ type: "state", state: state({
      generation: true,
      chats: true,
      chatMutation: true,
      characters: true,
      images: true,
      uiPanels: true,
    }) });
    expect(mock.context.ui.registerCharacterEditorTab).toHaveBeenCalledOnce();
    expect(mock.context.ui.registerInputBarAction).toHaveBeenCalledOnce();
    expect(mock.context.ui.createFloatWidget).toHaveBeenCalledOnce();

    mock.emitBackend({ type: "state", state: state({
      generation: true,
      chats: true,
      chatMutation: true,
      characters: false,
      images: true,
      uiPanels: false,
    }) });
    expect(mock.character.destroy).toHaveBeenCalledOnce();
    expect(mock.input.destroy).toHaveBeenCalledOnce();
    expect(mock.float.destroy).toHaveBeenCalledOnce();

    cleanup();
    expect(mock.drawer.destroy).toHaveBeenCalledOnce();
    expect(mock.removeBackend).toHaveBeenCalledOnce();
    expect(mock.removeChat).toHaveBeenCalledOnce();
    expect(mock.removeEditor).toHaveBeenCalledOnce();
    expect(mock.removeInputClick).toHaveBeenCalledOnce();
    expect(mock.removeDrag).toHaveBeenCalledOnce();
    expect(mock.removeStyle).toHaveBeenCalledOnce();
  });
});
