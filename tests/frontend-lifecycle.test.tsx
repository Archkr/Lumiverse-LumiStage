// @vitest-environment happy-dom

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, waitFor } from "@testing-library/preact";
import { setup } from "../src/frontend";
import { createTimeline, defaultSettings } from "../src/model";
import type { BackendToFrontend, FrontendState } from "../src/types";
import { profileA } from "./fixtures";

afterEach(() => {
  document.body.replaceChildren();
});

function root() {
  const element = document.createElement("div");
  document.body.append(element);
  return element;
}

function mountedHandle(target: Element, value: unknown = "") {
  return {
    componentId: crypto.randomUUID(),
    element: target,
    update: vi.fn(),
    destroy: vi.fn(),
    getValue: vi.fn(() => value),
    refresh: vi.fn(),
  };
}

function mockContext() {
  let backendHandler: ((message: BackendToFrontend) => void) | null = null;
  let editorHandler: (() => void) | null = null;
  const editorState = { open: false, characterId: null as string | null, activeTabId: null, extensions: {} };
  const removeStyle = vi.fn();
  const removeBackend = vi.fn();
  const removeChat = vi.fn();
  const removeEditor = vi.fn();
  const removeInputClick = vi.fn();
  const removeDrag = vi.fn();
  const drawer = {
    root: root(),
    tabId: "lumi_stage:studio",
    setTitle: vi.fn(),
    setShortName: vi.fn(),
    setBadge: vi.fn(),
    activate: vi.fn(),
    destroy: vi.fn(),
    onActivate: vi.fn(() => vi.fn()),
  };
  const character = {
    root: root(),
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
    root: root(),
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
  const modalRoot = root();
  const modal = {
    root: modalRoot,
    modalId: "studio-modal",
    dismiss: vi.fn(),
    setTitle: vi.fn(),
    onDismiss: vi.fn(() => vi.fn()),
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
    dom: { addStyle: vi.fn(() => removeStyle) },
    components: {
      mountBadge: vi.fn((target: Element) => mountedHandle(target)),
      mountSelect: vi.fn((target: Element) => mountedHandle(target)),
      mountSwitch: vi.fn((target: Element) => mountedHandle(target, false)),
      mountModelCombobox: vi.fn((target: Element) => mountedHandle(target)),
      mountNumberStepper: vi.fn((target: Element) => mountedHandle(target, 5)),
      mountRangeSlider: vi.fn((target: Element) => mountedHandle(target, 50)),
      mountPagination: vi.fn((target: Element) => mountedHandle(target)),
    },
    events: { on: vi.fn(() => removeChat), emit: vi.fn() },
    permissions: { getGranted: vi.fn(async () => []), request: vi.fn() },
    ui: {
      registerDrawerTab: vi.fn(() => drawer),
      registerCharacterEditorTab: vi.fn(() => character),
      registerInputBarAction: vi.fn(() => input),
      createFloatWidget: vi.fn(() => float),
      showModal: vi.fn(() => modal),
      showConfirm: vi.fn(async () => ({ confirmed: true })),
      characterEditor: {
        getState: vi.fn(() => editorState),
        onChange: vi.fn((handler: () => void) => {
          editorHandler = handler;
          return removeEditor;
        }),
      },
    },
  };
  return {
    context,
    drawer,
    character,
    input,
    float,
    modal,
    editorState,
    removeBackend,
    removeChat,
    removeEditor,
    removeInputClick,
    removeDrag,
    removeStyle,
    emitBackend(message: BackendToFrontend) {
      backendHandler?.(message);
    },
    emitEditor() {
      editorHandler?.();
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
    variantViews: {},
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
  it("registers permission-gated placements, opens the large Studio, and cleans subscriptions", async () => {
    const mock = mockContext();
    const cleanup = setup(mock.context as never);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(mock.context.deferReady).toHaveBeenCalledOnce();
    expect(mock.context.ui.registerDrawerTab).toHaveBeenCalledOnce();
    expect(mock.context.sendToBackend).toHaveBeenCalledWith({
      type: "ready",
      chatId: "chat",
      characterId: "character-a",
    });

    await act(async () => {
      mock.emitBackend({ type: "state", state: state({
        generation: true,
        chats: true,
        chatMutation: true,
        characters: true,
        images: true,
        uiPanels: true,
      }) });
    });
    expect(mock.context.ui.registerCharacterEditorTab).toHaveBeenCalledOnce();
    expect(mock.context.ui.registerInputBarAction).toHaveBeenCalledOnce();
    expect(mock.context.ui.createFloatWidget).toHaveBeenCalledOnce();
    const open = mock.drawer.root.querySelector(".ls-drawer-primary-actions .ls-button-primary");
    expect(open).not.toBeNull();
    await waitFor(() => {
      expect((open as HTMLButtonElement).disabled).toBe(false);
    });
    fireEvent.click(open as HTMLButtonElement);
    expect(mock.context.ui.showModal).toHaveBeenCalledWith(expect.objectContaining({
      width: 1440,
      maxHeight: 980,
    }));

    mock.editorState.open = true;
    mock.editorState.characterId = "character-a";
    expect(() => mock.emitEditor()).not.toThrow();

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
