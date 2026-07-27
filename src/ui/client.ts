import type { SpindleFrontendContext } from "lumiverse-spindle-types";
import { zip, strToU8 } from "fflate";
import * as tus from "tus-js-client";
import { createId } from "../ids";
import { MAX_ENTRY_COUNT, MAX_EXPANDED_BYTES } from "../importer";
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

function pruneVariantViews(
  profiles: CharacterProfileV2[],
  views: FrontendState["variantViews"],
): FrontendState["variantViews"] {
  const validIds = new Set(profiles.flatMap((profile) =>
    profile.outfits.flatMap((outfit) =>
      outfit.expressions.flatMap((expression) => expression.variants.map((variant) => variant.id)),
    ),
  ));
  return Object.fromEntries(
    Object.entries(views).filter(([variantId]) => validIds.has(variantId)),
  );
}

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
  private desiredContext: { chatId: string | null; characterId: string | null } | null = null;

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
    this.ui = { ...this.ui, busy: false, progress: null };
    this.listeners.clear();
  }

  send(message: FrontendToBackend): void {
    if (message.type === "ready" || message.type === "refresh") {
      this.desiredContext = { chatId: message.chatId, characterId: message.characterId };
    }
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

  private request<T>(message: FrontendToBackend & { requestId: string }, timeoutMs = 60_000): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(message.requestId);
        this.emit({ busy: this.pending.size > 0, progress: null });
        reject(new Error("LumiStage request timed out."));
      }, timeoutMs);
      this.pending.set(message.requestId, { resolve: resolve as (value: unknown) => void, reject, timeout });
      this.emit({ busy: this.pending.size > 0 });
      try {
        this.send(message);
      } catch (error) {
        this.settle(
          message.requestId,
          null,
          error instanceof Error ? error : new Error("Could not send the LumiStage request."),
        );
      }
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
      const desired = this.desiredContext;
      if (
        desired
        && (message.state.activeChatId !== desired.chatId
          || (
            desired.characterId !== null
            && message.state.activeCharacterId !== desired.characterId
            && message.state.stageProfiles.some((profile) => profile.characterId === desired.characterId)
          ))
      ) {
        if (message.state.settings.revision >= this.ui.backend.settings.revision) {
          this.emit({
            backend: {
              ...this.ui.backend,
              settings: message.state.settings,
              connections: message.state.connections,
              permissions: message.state.permissions,
            },
          });
        }
        return;
      }
      const current = this.ui.backend;
      const currentProfiles = new Map(current.stageProfiles.map((profile) => [profile.characterId, profile]));
      const stageProfiles = message.state.stageProfiles.map((profile) => {
        const existing = currentProfiles.get(profile.characterId);
        return existing && existing.revision > profile.revision ? existing : profile;
      });
      const profile = message.state.profile
        ? stageProfiles.find((entry) => entry.characterId === message.state.profile?.characterId)
          ?? message.state.profile
        : null;
      const timeline = (
        current.timeline
        && message.state.timeline
        && current.timeline.chatId === message.state.timeline.chatId
        && current.timeline.revision > message.state.timeline.revision
      ) ? current.timeline : message.state.timeline;
      const validVariantIds = new Set(stageProfiles.flatMap((entry) =>
        entry.outfits.flatMap((outfit) =>
          outfit.expressions.flatMap((expression) => expression.variants.map((variant) => variant.id)),
        ),
      ));
      const variantViews = Object.fromEntries(
        Object.entries(message.state.variantViews).filter(([variantId]) => validVariantIds.has(variantId)),
      );
      this.emit({
        backend: {
          ...message.state,
          settings: current.settings.revision > message.state.settings.revision
            ? current.settings
            : message.state.settings,
          profile,
          stageProfiles,
          timeline,
          snapshot: timeline?.snapshot ?? null,
          variantViews,
        },
      });
      return;
    }
    if (message.type === "profile") {
      const existing = this.ui.backend.stageProfiles.find((profile) => profile.characterId === message.profile.characterId);
      const accepted = existing && existing.revision > message.profile.revision ? existing : message.profile;
      const stageProfiles = this.ui.backend.stageProfiles.some((profile) => profile.characterId === accepted.characterId)
        ? this.ui.backend.stageProfiles.map((profile) => profile.characterId === accepted.characterId ? accepted : profile)
        : [...this.ui.backend.stageProfiles, accepted];
      const isActive = this.ui.backend.activeCharacterId === accepted.characterId
        || this.ui.backend.profile?.characterId === accepted.characterId;
      this.emit({
        backend: {
          ...this.ui.backend,
          profile: isActive ? accepted : this.ui.backend.profile,
          stageProfiles,
          variantViews: pruneVariantViews(
            stageProfiles,
            { ...this.ui.backend.variantViews, ...message.variantViews },
          ),
        },
      });
      return;
    }
    if (message.type === "snapshot") {
      if (
        this.ui.backend.timeline?.chatId
        && this.ui.backend.timeline.chatId !== message.timeline.chatId
      ) return;
      if (
        this.ui.backend.timeline?.chatId === message.timeline.chatId
        && this.ui.backend.timeline.revision > message.timeline.revision
      ) return;
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
    if (message.type === "operation-complete") {
      this.settle(message.requestId, message.result ?? message.revision ?? true);
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
        backend: {
          ...this.ui.backend,
          profile: this.ui.backend.activeCharacterId === message.profile.characterId
            || this.ui.backend.profile?.characterId === message.profile.characterId
            ? message.profile
            : this.ui.backend.profile,
          stageProfiles,
          variantViews: pruneVariantViews(
            stageProfiles,
            { ...this.ui.backend.variantViews, ...message.variantViews },
          ),
        },
      });
      const suffix = message.errors.length ? ` ${message.errors.length} file(s) need attention.` : "";
      this.notify("success", `Imported ${message.imported} media file(s); skipped ${message.skipped}.${suffix}`);
      return;
    }
    if (message.type === "export-ready") {
      void this.finishExport(message.requestId, message.archive, message.urls);
      return;
    }
    if (message.type === "diagnostics") {
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

  async saveSettings(settings: LumiStageSettingsV2): Promise<LumiStageSettingsV2> {
    const requestId = createId("save");
    const result = await this.request<{ settings?: LumiStageSettingsV2 }>({
      type: "save-settings",
      requestId,
      settings,
      expectedRevision: settings.revision,
    });
    this.refresh(this.ui.backend.activeChatId, this.ui.backend.activeCharacterId);
    return result.settings ?? { ...settings, revision: settings.revision + 1 };
  }

  async saveProfile(profile: CharacterProfileV2): Promise<number> {
    const requestId = createId("save");
    const revision = await this.request<number>({
      type: "save-profile",
      requestId,
      profile,
      expectedRevision: profile.revision,
    });
    this.refresh(this.ui.backend.activeChatId, profile.characterId);
    return revision;
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

  async analyzeNow(): Promise<void> {
    const chatId = this.ui.backend.activeChatId;
    if (!chatId) {
      this.notify("warning", "Open a chat before running detection.");
      return;
    }
    await this.request({ type: "analyze-now", requestId: createId("analyze"), chatId });
  }

  private uploadFile(
    file: File,
    onProgress?: (sent: number, total: number) => void,
    timeoutMs = 10 * 60_000,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let settled = false;
      let timeout: ReturnType<typeof setTimeout> | null = null;
      const finish = (operation: () => void) => {
        if (settled) return;
        settled = true;
        if (timeout) clearTimeout(timeout);
        operation();
      };
      const upload = new tus.Upload(file, {
        endpoint: "/api/v1/spindle-uploads",
        chunkSize: 16 * 1024 * 1024,
        retryDelays: [0, 1000, 3000, 5000, 10000],
        removeFingerprintOnSuccess: true,
        metadata: { filename: file.name, extension: "lumi_stage" },
        onProgress,
        onError: (error) => finish(() => reject(error)),
        onSuccess: () => {
          const uploadId = (upload.url ?? "").split("/").filter(Boolean).pop();
          if (uploadId) finish(() => resolve(uploadId));
          else finish(() => reject(new Error("Upload completed without an upload ID.")));
        },
      });
      timeout = setTimeout(() => {
        void upload.abort(true).catch(() => undefined);
        finish(() => reject(new Error("LumiStage media upload timed out.")));
      }, Math.max(1, timeoutMs));
      upload.start();
    });
  }

  async importFiles(
    files: File[],
    baseProfile: CharacterProfileV2,
    layout: ImportLayoutV2,
    targetOutfitId?: string,
    targetExpressionId?: string,
  ): Promise<CharacterProfileV2> {
    const characterId = baseProfile.characterId;
    if (!characterId) throw new Error("Choose a character before importing media.");
    if (!files.length) return baseProfile;
    if (files.some((file) => /\.lumistage\.zip$|\.zip$/i.test(file.name))) {
      throw new Error("Archives cannot be mixed with media imports. Use Restore archive instead.");
    }
    this.emit({ busy: true, progress: { completed: 0, total: files.length, message: "Uploading media…" } });
    const uploads: Array<{ id: string; relativePath: string }> = [];
    const deadline = Date.now() + 10 * 60_000;
    try {
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
        }, deadline - Date.now());
        uploads.push({ id: uploadId, relativePath: file.webkitRelativePath || file.name });
      }
      const requestId = createId("import");
      const result = await this.request<{ profile?: CharacterProfileV2 }>({
        type: "import-assets",
        requestId,
        characterId,
        uploads,
        baseProfile: structuredClone(baseProfile),
        expectedRevision: baseProfile.revision,
        layout,
        targetOutfitId,
        targetExpressionId,
      }, Math.max(1, deadline - Date.now()));
      return result.profile ?? this.ui.backend.stageProfiles.find((profile) => profile.characterId === characterId) ?? baseProfile;
    } catch (error) {
      this.emit({ busy: this.pending.size > 0, progress: null });
      if (uploads.length) {
        const requestId = createId("discard");
        await this.request({
          type: "discard-uploads",
          requestId,
          uploadIds: uploads.map((upload) => upload.id),
        }).catch(() => undefined);
      }
      throw error;
    }
  }

  async deleteVariants(variantIds: string[]): Promise<void> {
    const characterId = this.ui.backend.profile?.characterId;
    if (!characterId || !variantIds.length) return;
    const requestId = createId("delete");
    await this.request({
      type: "delete-variants",
      requestId,
      characterId,
      variantIds,
      expectedRevision: this.ui.backend.profile?.revision ?? 0,
    });
  }

  async restoreArchive(file: File, profile: CharacterProfileV2): Promise<CharacterProfileV2> {
    if (!/\.lumistage\.zip$/i.test(file.name)) throw new Error("Choose exactly one .lumistage.zip archive.");
    this.emit({ busy: true, progress: { completed: 0, total: 1, message: "Uploading archive…" } });
    let id: string | null = null;
    const deadline = Date.now() + 10 * 60_000;
    try {
      id = await this.uploadFile(file, (sent, total) => this.emit({
        progress: { completed: total ? sent / total : 0, total: 1, message: `Uploading ${file.name}…` },
      }), deadline - Date.now());
      const result = await this.request<{ profile?: CharacterProfileV2 }>({
        type: "restore-archive",
        requestId: createId("restore"),
        characterId: profile.characterId,
        upload: { id, relativePath: file.name },
        expectedRevision: profile.revision,
        confirmed: true,
      }, Math.max(1, deadline - Date.now()));
      return result.profile ?? profile;
    } catch (error) {
      this.emit({ busy: this.pending.size > 0, progress: null });
      if (id) {
        await this.request({
          type: "discard-uploads",
          requestId: createId("discard"),
          uploadIds: [id],
        }).catch(() => undefined);
      }
      throw error;
    }
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
      const referencedPaths = new Set(archive.variants.map((variant) => variant.path));
      if (paths.length !== referencedPaths.size || paths.some((path) => !referencedPaths.has(path))) {
        throw new Error("Export is missing one or more referenced media URLs.");
      }
      if (paths.length + 1 > MAX_ENTRY_COUNT) {
        throw new Error(`Export contains more than ${MAX_ENTRY_COUNT} files.`);
      }
      let totalBytes = entries["manifest.json"].byteLength;
      for (let index = 0; index < paths.length; index += 1) {
        const path = paths[index];
        this.emit({ progress: { completed: index, total: paths.length, message: `Collecting ${path}…` } });
        const response = await fetch(urls[path], { credentials: "include" });
        if (!response.ok) throw new Error(`Could not export ${path}.`);
        entries[path] = new Uint8Array(await response.arrayBuffer());
        totalBytes += entries[path].byteLength;
        if (totalBytes > MAX_EXPANDED_BYTES) {
          throw new Error(`Export exceeds ${MAX_EXPANDED_BYTES} uncompressed bytes.`);
        }
      }
      this.emit({ progress: { completed: paths.length, total: paths.length, message: "Compressing archive…" } });
      const compressed = await new Promise<Uint8Array>((resolve, reject) => {
        zip(entries, { level: 6 }, (error, data) => error ? reject(error) : resolve(data));
      });
      const blob = new Blob([compressed as BlobPart], { type: "application/zip" });
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = href;
      anchor.download = `${archive.profile.characterName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "character"}.lumistage.zip`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
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
