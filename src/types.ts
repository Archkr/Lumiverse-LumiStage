export const SCHEMA_VERSION = 1 as const;
export const LUMI_STAGE_ID = "lumi_stage";

export type MediaKind = "image" | "video";
export type TransitionStyle = "crossfade" | "lift" | "cut";
export type StudioView = "stage" | "library" | "batch" | "automation" | "appearance" | "diagnostics";

export interface StageAsset {
  id: string;
  imageId: string;
  contentHash: string;
  fileName: string;
  mimeType: string;
  mediaKind: MediaKind;
  enabled: boolean;
  priority: number;
  createdAt: number;
}

export interface ExpressionState {
  id: string;
  name: string;
  aliases: string[];
  cues: string[];
  tags: string[];
  enabled: boolean;
  priority: number;
  order: number;
  assets: StageAsset[];
}

export interface PoseState {
  id: string;
  name: string;
  aliases: string[];
  cues: string[];
  tags: string[];
  enabled: boolean;
  priority: number;
  order: number;
  defaultExpressionId: string | null;
  expressions: ExpressionState[];
}

export interface OutfitFolder {
  id: string;
  name: string;
  aliases: string[];
  cues: string[];
  tags: string[];
  enabled: boolean;
  priority: number;
  order: number;
  allowAutoSwitch: boolean;
  defaultPoseId: string | null;
  poses: PoseState[];
}

export interface ActorProfile {
  id: string;
  name: string;
  aliases: string[];
  enabled: boolean;
  order: number;
  defaultOutfitId: string | null;
  outfits: OutfitFolder[];
}

export interface CharacterProfileV1 {
  schemaVersion: 1;
  revision: number;
  characterId: string;
  characterName: string;
  defaultActorId: string | null;
  actors: ActorProfile[];
  createdAt: number;
  updatedAt: number;
}

export interface DetectionSettings {
  enabled: boolean;
  connectionId: string | null;
  model: string | null;
  contextMessages: number;
  temperature: number;
  stateConfidence: number;
  outfitConfidence: number;
}

export interface StageAppearanceSettings {
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

export interface LumiStageSettingsV1 {
  schemaVersion: 1;
  revision: number;
  detection: DetectionSettings;
  appearance: StageAppearanceSettings;
  preloadAdjacent: number;
  updatedAt: number;
}

export interface ActorStageState {
  actorId: string;
  characterId: string;
  outfitId: string | null;
  poseId: string | null;
  expressionId: string | null;
  assetId: string | null;
  imageId: string | null;
  label: string;
  focused: boolean;
  confidence: number;
}

export interface StageSnapshotV1 {
  schemaVersion: 1;
  chatId: string;
  revision: number;
  actors: Record<string, ActorStageState>;
  focusedActorIds: string[];
  updatedAt: number;
}

export interface DetectionActorDecision {
  actorId: string;
  outfitId: string | null;
  poseId: string | null;
  expressionId: string | null;
  confidence: number;
  explicitOutfitCue: boolean;
}

export interface DetectionDecisionV1 {
  schemaVersion: 1;
  focusedActorIds: string[];
  actors: DetectionActorDecision[];
}

export interface DecisionRecord {
  messageId: string;
  swipeId: number;
  contentHash: string;
  decision: DetectionDecisionV1;
  provider: string | null;
  model: string | null;
  createdAt: number;
}

export type OverrideScope = "once" | "locked";

export interface ManualOverride {
  actorId: string;
  outfitId?: string | null;
  poseId?: string | null;
  expressionId?: string | null;
  scope: OverrideScope;
  createdAt: number;
}

export interface ChatTimelineV1 {
  schemaVersion: 1;
  revision: number;
  chatId: string;
  decisions: DecisionRecord[];
  manualOverrides: Record<string, ManualOverride>;
  layoutOverride: Partial<StageAppearanceSettings> | null;
  snapshot: StageSnapshotV1;
  updatedAt: number;
}

export interface ArchiveAssetEntry {
  path: string;
  characterId: string;
  actorId: string;
  outfitId: string;
  poseId: string;
  expressionId: string;
  asset: StageAsset;
}

export interface LumiStageArchiveV1 {
  schemaVersion: 1;
  kind: "lumistage-archive";
  exportedAt: number;
  profile: CharacterProfileV1;
  assets: ArchiveAssetEntry[];
}

export interface PermissionState {
  generation: boolean;
  chats: boolean;
  chatMutation: boolean;
  characters: boolean;
  images: boolean;
  uiPanels: boolean;
}

export interface AssetView extends StageAsset {
  url: string | null;
  thumbUrl: string | null;
}

export interface FrontendState {
  settings: LumiStageSettingsV1;
  profile: CharacterProfileV1 | null;
  stageProfiles: CharacterProfileV1[];
  timeline: ChatTimelineV1 | null;
  snapshot: StageSnapshotV1 | null;
  assetViews: Record<string, AssetView>;
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

export type BatchMutation =
  | { type: "set-enabled"; assetIds: string[]; enabled: boolean }
  | { type: "set-priority"; assetIds: string[]; priority: number }
  | { type: "add-tags"; expressionIds: string[]; tags: string[] }
  | { type: "add-aliases"; expressionIds: string[]; aliases: string[] }
  | { type: "rename"; expressionIds: string[]; find: string; replace: string }
  | { type: "move"; assetIds: string[]; outfitId: string; poseId: string }
  | { type: "duplicate"; assetIds: string[] }
  | { type: "delete"; assetIds: string[] };

export type ImportLayout = "outfit-pose-expression" | "actor-outfit-pose-expression";

export interface ImportRequest {
  requestId: string;
  characterId: string;
  uploadIds: string[];
  layout: ImportLayout;
  targetActorId?: string;
}

export type FrontendToBackend =
  | { type: "ready"; chatId: string | null; characterId: string | null }
  | { type: "refresh"; chatId: string | null; characterId: string | null }
  | { type: "save-settings"; requestId: string; settings: LumiStageSettingsV1; expectedRevision: number }
  | { type: "save-profile"; requestId: string; profile: CharacterProfileV1; expectedRevision: number }
  | { type: "save-chat-layout"; requestId: string; chatId: string; layoutOverride: Partial<StageAppearanceSettings> | null; expectedRevision: number }
  | { type: "apply-manual"; requestId: string; chatId: string; override: ManualOverride }
  | { type: "clear-manual"; requestId: string; chatId: string; actorId: string }
  | { type: "analyze-now"; requestId: string; chatId: string }
  | ({ type: "import-assets" } & ImportRequest)
  | { type: "delete-assets"; requestId: string; characterId: string; assetIds: string[] }
  | { type: "request-export"; requestId: string; characterId: string }
  | { type: "request-diagnostics"; requestId: string }
  | { type: "character-editor"; characterId: string | null };

export type BackendToFrontend =
  | { type: "state"; state: FrontendState }
  | { type: "profile"; profile: CharacterProfileV1; assetViews: Record<string, AssetView> }
  | { type: "snapshot"; timeline: ChatTimelineV1; assetViews: Record<string, AssetView> }
  | { type: "saved"; requestId: string; revision: number }
  | { type: "import-progress"; requestId: string; completed: number; total: number; message: string }
  | { type: "import-complete"; requestId: string; profile: CharacterProfileV1; assetViews: Record<string, AssetView>; imported: number; skipped: number; errors: string[] }
  | { type: "export-ready"; requestId: string; archive: LumiStageArchiveV1; urls: Record<string, string> }
  | { type: "diagnostics"; requestId: string; report: Record<string, unknown> }
  | { type: "notice"; tone: "info" | "success" | "warning" | "error"; message: string }
  | { type: "error"; requestId?: string; code: string; message: string; currentRevision?: number };

export const DEFAULT_SETTINGS: LumiStageSettingsV1 = {
  schemaVersion: SCHEMA_VERSION,
  revision: 0,
  detection: {
    enabled: true,
    connectionId: null,
    model: null,
    contextMessages: 5,
    temperature: 0.1,
    stateConfidence: 0.6,
    outfitConfidence: 0.85,
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
