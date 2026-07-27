import type { SpindleFrontendContext } from "lumiverse-spindle-types";
import { zipSync, strToU8 } from "fflate";
import * as tus from "tus-js-client";
import { createId } from "../ids";
import { createProfile, createTimeline, defaultSettings } from "../model";
import type {
  BackendToFrontend,
  CharacterProfileV2,
  FrontendState,
  FrontendToBackend,
  ImportLayoutV2,
  LumiStageSettingsV2,
  ManualOverrideV2,
} from "../types";

type Listener = () => void;

export interface ClientUiState {
  backend: FrontendState;
  busy: boolean;
  progress: { completed: number; total: number; message: string } | null;
  notice: { tone: "info" | "success" | "warning" | "error"; message: string } | null;
}

const EMPTY_BACKEND: FrontendState = {
  settings: defaultSettings(0),
  profile: null,
  stageProfiles: [],
  timeline: null,
  snapshot: null,
  variantViews: {},
  connections: [],
  permissions: {
    generation: false,
    chats: false,
    chatMutation: false,
    characters: false,
    images: false,
    uiPanels: false,
  },
  activeChatId: null,
  activeCharacterId: null,
  activeCharacterName: null,
  queueDepth: 0,
  lastDetection: { status: "idle", message: "Connecting to LumiStage…", at: null },
};

export class LumiStageClient {
  private listeners = new Set<Listener>();
  private dismissTimer: ReturnType<typeof setTimeout> | null = null;
  private ui: ClientUiState = { backend: EMPTY_BACKEND, busy: false, progress: null, notice: null };
  private unsubscribeBackend: (() => void) | null = null;
  private pending = new Map<string, { resolve: (value: unknown) => void; reject: (error: Error) => void; timeout: ReturnType<typeof setTimeout> }>();

  constructor(readonly ctx: SpindleFrontendContext) {}

  getSnapshot = (): ClientUiState => this.ui;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private emit(partial: Partial<ClientUiState>): void {
    this.ui = { ...this.ui, ...partial };
    for (const listener of this.listeners) listener();
  }

  start(): void {
    this.unsubscribeBackend = this.ctx.onBackendMessage((payload) => this.receive(payload as BackendToFrontend));
  }

  destroy(): void {
    this.unsubscribeBackend?.();
    this.unsubscribeBackend = null;
    if (this.dismissTimer) clearTimeout(this.dismissTimer);
    for (const entry of this.pending.values()) {
      clearTimeout(entry.timeout);
      entry.reject(new Error("LumiStage unloaded."));
    }
    this.pending.clear();
    this.listeners.clear();
  }

  send(message: FrontendToBackend): void {
    this.ctx.sendToBackend(message);
  }

  refresh(chatId: string | null, characterId: string | null): void {
    this.send({ type: "refresh", chatId, characterId });
  }

  notify(tone: ClientUiState["notice"] extends infer T ? T extends { tone: infer U } ? U : never : never, message: string): void {
    if (this.dismissTimer) clearTimeout(this.dismissTimer);
    this.emit({ notice: { tone, message } });
    this.dismissTimer = setTimeout(() => this.emit({ notice: null }), 6500);
  }

  private request<T>(message: FrontendToBackend & { requestId: string }, timeoutMs = 120_000): Promise<T> {
    this.emit({ busy: true });
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(message.requestId);
        this.emit({ busy: false });
        reject(new Error("LumiStage request timed out."));
      }, timeoutMs);
      this.pending.set(message.requestId, { resolve: resolve as (value: unknown) => void, reject, timeout });
      this.send(message);
    });
  }

  private settle(requestId: string, value: unknown, error?: Error): void {
    const pending = this.pending.get(requestId);
    if (!pending) return;
    clearTimeout(pending.timeout);
    this.pending.delete(requestId);
    this.emit({ busy: this.pending.size > 0, progress: null });
    if (error) pending.reject(error);
    else pending.resolve(value);
  }

  private receive(message: BackendToFrontend): void {
    if (message.type === "state") {
      this.emit({ backend: message.state });
      return;
    }
    if (message.type === "profile") {
      const stageProfiles = this.ui.backend.stageProfiles.some((profile) => profile.characterId === message.profile.characterId)
        ? this.ui.backend.stageProfiles.map((profile) => profile.characterId === message.profile.characterId ? message.profile : profile)
        : [...this.ui.backend.stageProfiles, message.profile];
      this.emit({ backend: { ...this.ui.backend, profile: message.profile, stageProfiles, variantViews: { ...this.ui.backend.variantViews, ...message.variantViews } } });
      return;
    }
    if (message.type === "snapshot") {
      this.emit({
        backend: {
          ...this.ui.backend,
          timeline: message.timeline,
          snapshot: message.timeline.snapshot,
          variantViews: { ...this.ui.backend.variantViews, ...message.variantViews },
        },
      });
      return;
    }
    if (message.type === "saved") {
      this.settle(message.requestId, message.revision);
      return;
    }
    if (message.type === "import-progress") {
      this.emit({ progress: { completed: message.completed, total: message.total, message: message.message } });
      return;
    }
    if (message.type === "import-complete") {
      const stageProfiles = this.ui.backend.stageProfiles.some((profile) => profile.characterId === message.profile.characterId)
        ? this.ui.backend.stageProfiles.map((profile) => profile.characterId === message.profile.characterId ? message.profile : profile)
        : [...this.ui.backend.stageProfiles, message.profile];
      this.emit({
        backend: { ...this.ui.backend, profile: message.profile, stageProfiles, variantViews: { ...this.ui.backend.variantViews, ...message.variantViews } },
      });
      this.settle(message.requestId, message);
      const suffix = message.errors.length ? ` ${message.errors.length} file(s) need attention.` : "";
      this.notify("success", `Imported ${message.imported} media file(s); skipped ${message.skipped}.${suffix}`);
      return;
    }
    if (message.type === "export-ready") {
      void this.finishExport(message.requestId, message.archive, message.urls);
      return;
    }
    if (message.type === "diagnostics") {
      this.settle(message.requestId, message.report);
      return;
    }
    if (message.type === "notice") {
      this.notify(message.tone, message.message);
      return;
    }
    if (message.type === "error") {
      const error = new Error(message.message);
      if (message.requestId) this.settle(message.requestId, null, error);
      this.notify("error", message.message);
    }
  }

  async saveSettings(settings: LumiStageSettingsV2): Promise<void> {
    const requestId = createId("save");
    await this.request<number>({
      type: "save-settings",
      requestId,
      settings,
      expectedRevision: this.ui.backend.settings.revision,
    });
    this.refresh(this.ui.backend.activeChatId, this.ui.backend.activeCharacterId);
  }

  async saveProfile(profile: CharacterProfileV2): Promise<void> {
    const requestId = createId("save");
    await this.request<number>({
      type: "save-profile",
      requestId,
      profile,
      expectedRevision: this.ui.backend.profile?.revision ?? profile.revision,
    });
    this.refresh(this.ui.backend.activeChatId, profile.characterId);
  }

  effectiveAppearance() {
    return {
      ...this.ui.backend.settings.appearance,
      ...(this.ui.backend.timeline?.layoutOverride ?? {}),
    };
  }

  async saveChatLayout(layoutOverride: Partial<LumiStageSettingsV2["appearance"]> | null): Promise<void> {
    const timeline = this.ui.backend.timeline;
    const chatId = this.ui.backend.activeChatId;
    if (!timeline || !chatId) throw new Error("Open a chat before saving a chat-specific layout.");
    const requestId = createId("layout");
    await this.request<number>({
      type: "save-chat-layout",
      requestId,
      chatId,
      layoutOverride,
      expectedRevision: timeline.revision,
    });
    this.refresh(chatId, this.ui.backend.activeCharacterId);
  }

  async saveAppearance(patch: Partial<LumiStageSettingsV2["appearance"]>): Promise<void> {
    if (this.ui.backend.timeline?.layoutOverride) {
      await this.saveChatLayout({ ...this.effectiveAppearance(), ...patch });
      return;
    }
    const settings = this.ui.backend.settings;
    await this.saveSettings({ ...settings, appearance: { ...settings.appearance, ...patch } });
  }

  async applyManual(override: ManualOverrideV2): Promise<void> {
    const chatId = this.ui.backend.activeChatId;
    if (!chatId) throw new Error("Open a chat before changing the live stage.");
    const requestId = createId("manual");
    await this.request({ type: "apply-manual", requestId, chatId, override });
  }

  async clearManual(characterId: string): Promise<void> {
    const chatId = this.ui.backend.activeChatId;
    if (!chatId) return;
    const requestId = createId("manual");
    await this.request({ type: "clear-manual", requestId, chatId, characterId });
  }

  analyzeNow(): void {
    const chatId = this.ui.backend.activeChatId;
    if (!chatId) {
      this.notify("warning", "Open a chat before running detection.");
      return;
    }
    this.send({ type: "analyze-now", requestId: createId("analyze"), chatId });
  }

  private uploadFile(file: File, onProgress?: (sent: number, total: number) => void): Promise<string> {
    return new Promise((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: "/api/v1/spindle-uploads",
        chunkSize: 16 * 1024 * 1024,
        retryDelays: [0, 1000, 3000, 5000, 10000],
        removeFingerprintOnSuccess: true,
        metadata: { filename: file.name, extension: "lumi_stage" },
        onProgress,
        onError: (error) => reject(error),
        onSuccess: () => {
          const uploadId = (upload.url ?? "").split("/").filter(Boolean).pop();
          if (uploadId) resolve(uploadId);
          else reject(new Error("Upload completed without an upload ID."));
        },
      });
      upload.start();
    });
  }

  async importFiles(
    files: File[],
    layout: ImportLayoutV2,
    targetOutfitId?: string,
    targetExpressionId?: string,
  ): Promise<void> {
    const characterId = this.ui.backend.profile?.characterId ?? this.ui.backend.activeCharacterId;
    if (!characterId) throw new Error("Choose a character before importing media.");
    if (!files.length) return;
    this.emit({ busy: true, progress: { completed: 0, total: files.length, message: "Uploading media…" } });
    const uploadIds: string[] = [];
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const uploadId = await this.uploadFile(file, (sent, total) => {
        this.emit({
          progress: {
            completed: index + (total ? sent / total : 0),
            total: files.length,
            message: `Uploading ${file.name}…`,
          },
        });
      });
      uploadIds.push(uploadId);
    }
    const requestId = createId("import");
    await this.request({
      type: "import-assets",
      requestId,
      characterId,
      uploadIds,
      layout,
      targetOutfitId,
      targetExpressionId,
    }, 10 * 60_000);
  }

  async deleteVariants(variantIds: string[]): Promise<void> {
    const characterId = this.ui.backend.profile?.characterId;
    if (!characterId || !variantIds.length) return;
    const requestId = createId("delete");
    await this.request({ type: "delete-variants", requestId, characterId, variantIds });
  }

  async exportProfile(): Promise<void> {
    const characterId = this.ui.backend.profile?.characterId;
    if (!characterId) throw new Error("Choose a character before exporting.");
    const requestId = createId("export");
    await this.request({ type: "request-export", requestId, characterId }, 10 * 60_000);
  }

  private async finishExport(
    requestId: string,
    archive: Extract<BackendToFrontend, { type: "export-ready" }>["archive"],
    urls: Record<string, string>,
  ): Promise<void> {
    try {
      const entries: Record<string, Uint8Array> = {
        "manifest.json": strToU8(JSON.stringify(archive, null, 2)),
      };
      const paths = Object.keys(urls);
      for (let index = 0; index < paths.length; index += 1) {
        const path = paths[index];
        this.emit({ progress: { completed: index, total: paths.length, message: `Collecting ${path}…` } });
        const response = await fetch(urls[path], { credentials: "include" });
        if (!response.ok) throw new Error(`Could not export ${path}.`);
        entries[path] = new Uint8Array(await response.arrayBuffer());
      }
      const blob = new Blob([zipSync(entries, { level: 6 }) as BlobPart], { type: "application/zip" });
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `${archive.profile.characterName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "character"}.lumistage.zip`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(href), 30_000);
      this.settle(requestId, true);
      this.notify("success", "LumiStage archive exported.");
    } catch (error) {
      this.settle(requestId, null, error instanceof Error ? error : new Error("Export failed."));
      this.notify("error", error instanceof Error ? error.message : "Export failed.");
    }
  }

  async diagnostics(): Promise<Record<string, unknown>> {
    const requestId = createId("diagnostics");
    return this.request<Record<string, unknown>>({ type: "request-diagnostics", requestId });
  }

  ensureDraftProfile(characterId: string, characterName: string): CharacterProfileV2 {
    return this.ui.backend.profile ?? createProfile(characterId, characterName);
  }

  ensureDraftTimeline(chatId: string): ReturnType<typeof createTimeline> {
    return this.ui.backend.timeline ?? createTimeline(chatId);
  }
}
