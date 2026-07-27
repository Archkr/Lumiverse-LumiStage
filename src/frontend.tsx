import { render } from "preact";
import type {
  SpindleCharacterEditorTabHandle,
  SpindleDrawerTabHandle,
  SpindleFloatWidgetHandle,
  SpindleFrontendContext,
  SpindleInputBarActionHandle,
  SpindleModalHandle,
} from "lumiverse-spindle-types";
import { LumiStageClient } from "./ui/client";
import { LUMI_STAGE_ICON } from "./ui/icons";
import { showQuickPicker } from "./ui/modals";
import { Stage } from "./ui/stage";
import { CharacterSetup, DrawerDashboard, StudioWorkspace } from "./ui/studio";
import { LUMI_STAGE_CSS } from "./ui/styles";

function initialPosition(width: number, height: number, x: number, y: number) {
  const inset = 18;
  return {
    x: x >= 0 ? x : Math.max(inset, window.innerWidth - width - inset),
    y: y >= 0 ? y : Math.max(inset, window.innerHeight - height - 96),
  };
}

export function setup(ctx: SpindleFrontendContext): () => void {
  ctx.deferReady();
  const client = new LumiStageClient(ctx);
  client.start();
  const removeStyle = ctx.dom.addStyle(LUMI_STAGE_CSS);
  const drawer = ctx.ui.registerDrawerTab({
    id: "studio",
    title: "LumiStage",
    shortName: "Stage",
    headerTitle: "LumiStage",
    description: "Independent outfit libraries, expression direction, and ensemble staging.",
    keywords: ["expressions", "sprites", "outfits", "stage", "batch"],
    iconSvg: LUMI_STAGE_ICON,
  });

  let characterTab: SpindleCharacterEditorTabHandle | null = null;
  let inputAction: SpindleInputBarActionHandle | null = null;
  let floatWidget: SpindleFloatWidgetHandle | null = null;
  let studioModal: SpindleModalHandle | null = null;
  let unsubscribeInput: (() => void) | null = null;
  let unsubscribeDrag: (() => void) | null = null;
  let renderedCharacterId: string | null = null;
  let syncing = false;
  let disposed = false;

  const openStudio = (characterId?: string) => {
    if (characterId) {
      const active = ctx.getActiveChat();
      client.refresh(active.chatId, characterId);
    }
    if (studioModal) return;
    studioModal = ctx.ui.showModal({
      title: "LumiStage — Expression Studio",
      width: 1440,
      maxHeight: 980,
      persistent: true,
    });
    render(<StudioWorkspace client={client} />, studioModal.root);
    studioModal.onDismiss(() => {
      if (!studioModal) return;
      render(null, studioModal.root);
      studioModal = null;
    });
  };

  render(<DrawerDashboard client={client} onOpenStudio={() => openStudio()} />, drawer.root);

  const saveAppearance = async (patch: Partial<ReturnType<LumiStageClient["getSnapshot"]>["backend"]["settings"]["appearance"]>) => {
    try {
      await client.saveAppearance(patch);
    } catch (error) {
      client.notify("error", error instanceof Error ? error.message : "Could not save stage layout.");
    }
  };

  const renderCharacterEditor = () => {
    if (!characterTab) return;
    const state = ctx.ui.characterEditor.getState();
    const characterId = state.open ? state.characterId : null;
    if (characterId === renderedCharacterId) return;
    renderedCharacterId = characterId;
    render(
      characterId
        ? <CharacterSetup client={client} characterId={characterId} onOpenStudio={openStudio} />
        : null,
      characterTab.root,
    );
  };

  const createCharacterTab = () => {
    if (characterTab) return;
    try {
      characterTab = ctx.ui.registerCharacterEditorTab({ id: "profile", title: "LumiStage" });
      renderedCharacterId = null;
      renderCharacterEditor();
    } catch {
      characterTab = null;
    }
  };

  const createInputAction = () => {
    if (inputAction) return;
    try {
      inputAction = ctx.ui.registerInputBarAction({
        id: "quick-select",
        label: "LumiStage",
        subtitle: "Choose outfit, expression, or lock",
        iconSvg: LUMI_STAGE_ICON,
        enabled: true,
      });
      unsubscribeInput = inputAction.onClick(() => showQuickPicker(client));
    } catch {
      inputAction = null;
    }
  };

  const renderStage = () => {
    if (!floatWidget) return;
    render(
      <Stage
        client={client}
        onQuick={() => showQuickPicker(client)}
        onFullscreen={() => {
          if (!floatWidget) return;
          const fullscreen = !floatWidget.isFullscreen();
          floatWidget.setFullscreen(fullscreen);
          void saveAppearance({ fullscreen });
        }}
        onHide={() => {
          floatWidget?.setVisible(false);
          void saveAppearance({ visible: false });
        }}
        onResize={(width, height, commit) => {
          floatWidget?.setSize(width, height);
          if (commit) void saveAppearance({ width, height });
        }}
      />,
      floatWidget.root,
    );
  };

  const createFloatWidget = () => {
    if (floatWidget) return;
    const appearance = client.effectiveAppearance();
    try {
      floatWidget = ctx.ui.createFloatWidget({
        width: appearance.width,
        height: appearance.height,
        initialPosition: initialPosition(appearance.width, appearance.height, appearance.x, appearance.y),
        snapToEdge: true,
        tooltip: "LumiStage — drag to move",
        chromeless: true,
        fullscreen: appearance.fullscreen,
      });
      floatWidget.setVisible(appearance.visible);
      unsubscribeDrag = floatWidget.onDragEnd(({ x, y }) => void saveAppearance({ x, y }));
      renderStage();
    } catch {
      floatWidget = null;
    }
  };

  const destroyCharacterTab = () => {
    if (!characterTab) return;
    render(null, characterTab.root);
    characterTab.destroy();
    characterTab = null;
    renderedCharacterId = null;
  };

  const destroyInputAction = () => {
    unsubscribeInput?.();
    unsubscribeInput = null;
    inputAction?.destroy();
    inputAction = null;
  };

  const destroyFloatWidget = () => {
    unsubscribeDrag?.();
    unsubscribeDrag = null;
    if (floatWidget) {
      render(null, floatWidget.root);
      floatWidget.destroy();
    }
    floatWidget = null;
  };

  const syncSurfaces = () => {
    if (disposed || syncing) return;
    syncing = true;
    try {
      const state = client.getSnapshot().backend;
      if (state.permissions.characters) createCharacterTab();
      else destroyCharacterTab();
      if (state.permissions.uiPanels) {
        createInputAction();
        createFloatWidget();
      } else {
        destroyInputAction();
        destroyFloatWidget();
      }
      inputAction?.setEnabled(Boolean(state.activeChatId && state.stageProfiles.length));
      if (floatWidget) {
        const appearance = client.effectiveAppearance();
        if (!floatWidget.isFullscreen()) {
          floatWidget.setSize(appearance.width, appearance.height);
          if (appearance.x >= 0 && appearance.y >= 0) floatWidget.moveTo(appearance.x, appearance.y);
        }
        if (floatWidget.isFullscreen() !== appearance.fullscreen) {
          floatWidget.setFullscreen(appearance.fullscreen);
        }
        floatWidget.setVisible(appearance.visible);
      }
    } finally {
      syncing = false;
    }
  };

  const unsubscribeClient = client.subscribe(syncSurfaces);
  const unsubscribeEditor = ctx.ui.characterEditor.onChange(renderCharacterEditor);
  const unsubscribeChat = ctx.events.on("CHAT_SWITCHED", () => {
    const active = ctx.getActiveChat();
    client.refresh(active.chatId, active.characterId);
  });

  const active = ctx.getActiveChat();
  client.send({ type: "ready", chatId: active.chatId, characterId: active.characterId });
  void ctx.permissions.getGranted().finally(() => {
    if (!disposed) {
      syncSurfaces();
      ctx.ready();
    }
  });

  return () => {
    disposed = true;
    unsubscribeChat();
    unsubscribeEditor();
    unsubscribeClient();
    destroyCharacterTab();
    destroyInputAction();
    destroyFloatWidget();
    if (studioModal) {
      render(null, studioModal.root);
      studioModal.dismiss();
      studioModal = null;
    }
    render(null, drawer.root);
    drawer.destroy();
    removeStyle();
    client.destroy();
  };
}
