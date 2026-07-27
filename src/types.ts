export const SCHEMA_VERSION = 2 as const;
export const LUMI_STAGE_ID = "lumi_stage";

export type MediaKind = "image" | "video";
export type TransitionStyle = "crossfade" | "lift" | "cut";
export type StudioView = "library" | "stage" | "settings";

export interface StageVariantV2 {
  id: string;
  imageId: string;
  contentHash: string;
  fileName: string;
  mimeType: string;
  mediaKind: MediaKind;
  order: number;
  createdAt: number;
}

export interface ExpressionSlotV2 {
  id: string;
  name: string;
  order: number;
  variants: StageVariantV2[];
}

export interface OutfitFolderV2 {
  id: string;
  name: string;
  order: number;
  defaultExpressionId: string | null;
  expressions: ExpressionSlotV2[];
}

export interface CharacterProfileV2 {
  schemaVersion: 2;
  revision: number;
  characterId: string;
  characterName: string;
  defaultOutfitId: string | null;
  outfits: OutfitFolderV2[];
  createdAt: number;
  updatedAt: number;
}

export interface DetectionSettingsV2 {
  enabled: boolean;
  connectionId: string | null;
  model: string | null;
  contextMessages: number;
  temperature: number;
  confidence: number;
}

export interface StageAppearanceSettingsV2 {
  transition: TransitionStyle;
  transitionMs: number;
  opacity: number;
  focusedScale: number;
  idleOpacity: number;
  showCaptions: boolean;
  showChrome: boolean;
  ensembleOverlap: number;
  width: number;
  height: number;
  x: number;
  y: number;
  fullscreen: boolean;
  visible: boolean;
}

export interface LumiStageSettingsV2 {
  schemaVersion: 2;
  revision: number;
  detection: DetectionSettingsV2;
  appearance: StageAppearanceSettingsV2;
  preloadAdjacent: number;
  updatedAt: number;
}

export interface CharacterStageStateV2 {
  characterId: string;
  outfitId: string | null;
  expressionId: string | null;
  variantId: string | null;
  imageId: string | null;
  label: string;
  focused: boolean;
  confidence: number;
}

export interface StageSnapshotV2 {
  schemaVersion: 2;
  chatId: string;
  revision: number;
  characters: Record<string, CharacterStageStateV2>;
  focusedCharacterIds: string[];
  updatedAt: number;
}

export interface DetectionCharacterDecisionV2 {
  characterId: string;
  outfitId: string | null;
  expressionId: string | null;
  variantId: string | null;
  confidence: number;
}

export interface DetectionDecisionV2 {
  schemaVersion: 2;
  focusedCharacterIds: string[];
  characters: DetectionCharacterDecisionV2[];
}

export interface DecisionRecordV2 {
  messageId: string;
  swipeId: number;
  contentHash: string;
  decision: DetectionDecisionV2;
  provider: string | null;
  model: string | null;
  createdAt: number;
}

export type OverrideScope = "once" | "locked";
export type OverrideLock = "outfit" | "state";

export interface ManualOverrideV2 {
  characterId: string;
  outfitId: string | null;
  expressionId?: string | null;
  variantId?: string | null;
  scope: OverrideScope;
  lock: OverrideLock;
  createdAt: number;
}

export interface ChatTimelineV2 {
  schemaVersion: 2;
  revision: number;
  chatId: string;
  decisions: DecisionRecordV2[];
  manualOverrides: Record<string, ManualOverrideV2>;
  layoutOverride: Partial<StageAppearanceSettingsV2> | null;
  snapshot: StageSnapshotV2;
  updatedAt: number;
}

export interface ArchiveVariantEntryV2 {
  path: string;
  characterId: string;
  outfitId: string;
  expressionId: string;
  variant: StageVariantV2;
}

export interface LumiStageArchiveV2 {
  schemaVersion: 2;
  kind: "lumistage-archive";
  exportedAt: number;
  profile: CharacterProfileV2;
  variants: ArchiveVariantEntryV2[];
}

export interface PermissionState {
  generation: boolean;
  chats: boolean;
  chatMutation: boolean;
  characters: boolean;
  images: boolean;
  uiPanels: boolean;
}

export interface VariantView extends StageVariantV2 {
  url: string | null;
  thumbUrl: string | null;
}

export interface LlmConnectionView {
  id: string;
  name: string;
  provider: string;
  model: string;
  isDefault: boolean;
  hasApiKey: boolean;
}

export interface FrontendState {
  settings: LumiStageSettingsV2;
  profile: CharacterProfileV2 | null;
  stageProfiles: CharacterProfileV2[];
  timeline: ChatTimelineV2 | null;
  snapshot: StageSnapshotV2 | null;
  variantViews: Record<string, VariantView>;
  connections: LlmConnectionView[];
  permissions: PermissionState;
  activeChatId: string | null;
  activeCharacterId: string | null;
  activeCharacterName: string | null;
  queueDepth: number;
  lastDetection: {
    status: "idle" | "running" | "success" | "error";
    message: string;
    at: number | null;
  };
}

export type BatchMutationV2 =
  | { type: "move"; expressionIds: string[]; outfitId: string }
  | { type: "copy"; expressionIds: string[]; outfitId: string }
  | { type: "delete"; expressionIds: string[] };

export type ImportLayoutV2 = "automatic" | "outfit-expression" | "outfit-expression-variant";

export interface ImportRequestV2 {
  requestId: string;
  characterId: string;
  uploadIds: string[];
  layout: ImportLayoutV2;
  targetOutfitId?: string;
  targetExpressionId?: string;
}

export type FrontendToBackend =
  | { type: "ready"; chatId: string | null; characterId: string | null }
  | { type: "refresh"; chatId: string | null; characterId: string | null }
  | { type: "save-settings"; requestId: string; settings: LumiStageSettingsV2; expectedRevision: number }
  | { type: "save-profile"; requestId: string; profile: CharacterProfileV2; expectedRevision: number }
  | { type: "save-chat-layout"; requestId: string; chatId: string; layoutOverride: Partial<StageAppearanceSettingsV2> | null; expectedRevision: number }
  | { type: "apply-manual"; requestId: string; chatId: string; override: ManualOverrideV2 }
  | { type: "clear-manual"; requestId: string; chatId: string; characterId: string }
  | { type: "analyze-now"; requestId: string; chatId: string }
  | ({ type: "import-assets" } & ImportRequestV2)
  | { type: "delete-variants"; requestId: string; characterId: string; variantIds: string[] }
  | { type: "request-export"; requestId: string; characterId: string }
  | { type: "request-diagnostics"; requestId: string }
  | { type: "open-connections" }
  | { type: "character-editor"; characterId: string | null };

export type BackendToFrontend =
  | { type: "state"; state: FrontendState }
  | { type: "profile"; profile: CharacterProfileV2; variantViews: Record<string, VariantView> }
  | { type: "snapshot"; timeline: ChatTimelineV2; variantViews: Record<string, VariantView> }
  | { type: "saved"; requestId: string; revision: number }
  | { type: "import-progress"; requestId: string; completed: number; total: number; message: string }
  | { type: "import-complete"; requestId: string; profile: CharacterProfileV2; variantViews: Record<string, VariantView>; imported: number; skipped: number; errors: string[] }
  | { type: "export-ready"; requestId: string; archive: LumiStageArchiveV2; urls: Record<string, string> }
  | { type: "diagnostics"; requestId: string; report: Record<string, unknown> }
  | { type: "notice"; tone: "info" | "success" | "warning" | "error"; message: string }
  | { type: "error"; requestId?: string; code: string; message: string; currentRevision?: number };

export const DEFAULT_SETTINGS: LumiStageSettingsV2 = {
  schemaVersion: SCHEMA_VERSION,
  revision: 0,
  detection: {
    enabled: true,
    connectionId: null,
    model: null,
    contextMessages: 5,
    temperature: 0.1,
    confidence: 0.6,
  },
  appearance: {
    transition: "crossfade",
    transitionMs: 280,
    opacity: 1,
    focusedScale: 1.035,
    idleOpacity: 0.46,
    showCaptions: true,
    showChrome: true,
    ensembleOverlap: 0.34,
    width: 320,
    height: 420,
    x: -1,
    y: -1,
    fullscreen: false,
    visible: true,
  },
  preloadAdjacent: 3,
  updatedAt: 0,
};
