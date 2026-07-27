import {
  createProfile,
  createTimeline,
  defaultSettings,
  emptySnapshot,
  normalizeProfile,
  normalizeSettings,
} from "./model";
import {
  SCHEMA_VERSION,
  type CharacterProfileV2,
  type CharacterStageStateV2,
  type ChatTimelineV2,
  type LumiStageSettingsV2,
  type ManualOverrideV2,
} from "./types";

export interface UserStorageApi {
  getJson<T>(path: string, options?: { fallback?: T; userId?: string }): Promise<T>;
  setJson(path: string, value: unknown, options?: { indent?: number; userId?: string }): Promise<void>;
  list(prefix?: string, userId?: string): Promise<string[]>;
  delete(path: string, userId?: string): Promise<void>;
}

export const settingsPath = () => "settings.v2.json";
export const profilePath = (characterId: string) => `profiles/${characterId}.v2.json`;
export const timelinePath = (chatId: string) => `chats/${chatId}.v2.json`;
const oldSettingsPath = () => "settings.v1.json";
const oldProfilePath = (characterId: string) => `profiles/${characterId}.v1.json`;
const oldTimelinePath = (chatId: string) => `chats/${chatId}.v1.json`;

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function migrateTimeline(raw: unknown, chatId: string, now = Date.now()): ChatTimelineV2 {
  const source = asRecord(raw);
  if (source.schemaVersion === SCHEMA_VERSION && source.chatId === chatId) {
    const timeline = source as unknown as ChatTimelineV2;
    return {
      ...timeline,
      schemaVersion: SCHEMA_VERSION,
      chatId,
      decisions: Array.isArray(timeline.decisions) ? timeline.decisions : [],
      manualOverrides: timeline.manualOverrides ?? {},
      layoutOverride: timeline.layoutOverride ?? null,
      snapshot: timeline.snapshot?.schemaVersion === SCHEMA_VERSION
        ? timeline.snapshot
        : emptySnapshot(chatId, now),
    };
  }

  const legacySnapshot = asRecord(source.snapshot);
  const legacyStates = asRecord(legacySnapshot.actors);
  const characters: Record<string, CharacterStageStateV2> = {};
  const legacyToCharacter = new Map<string, string>();
  for (const [legacyId, value] of Object.entries(legacyStates)) {
    const state = asRecord(value);
    const characterId = typeof state.characterId === "string" ? state.characterId : null;
    if (!characterId) continue;
    legacyToCharacter.set(legacyId, characterId);
    characters[characterId] = {
      characterId,
      outfitId: typeof state.outfitId === "string" ? state.outfitId : null,
      expressionId: typeof state.expressionId === "string" ? state.expressionId : null,
      variantId: typeof state.assetId === "string" ? state.assetId : null,
      imageId: typeof state.imageId === "string" ? state.imageId : null,
      label: typeof state.label === "string" ? state.label : "LumiStage",
      focused: state.focused === true,
      confidence: typeof state.confidence === "number" ? state.confidence : 1,
    };
  }
  const manualOverrides: Record<string, ManualOverrideV2> = {};
  for (const [legacyId, value] of Object.entries(asRecord(source.manualOverrides))) {
    const item = asRecord(value);
    const characterId = typeof item.characterId === "string"
      ? item.characterId
      : legacyToCharacter.get(legacyId);
    if (!characterId || typeof item.outfitId !== "string") continue;
    manualOverrides[characterId] = {
      characterId,
      outfitId: item.outfitId,
      expressionId: typeof item.expressionId === "string" ? item.expressionId : null,
      variantId: typeof item.assetId === "string" ? item.assetId : null,
      scope: item.scope === "once" ? "once" : "locked",
      lock: typeof item.expressionId === "string" ? "state" : "outfit",
      createdAt: typeof item.createdAt === "number" ? item.createdAt : now,
    };
  }
  const focusedCharacterIds = Array.isArray(legacySnapshot.focusedActorIds)
    ? legacySnapshot.focusedActorIds
      .map((id) => typeof id === "string" ? legacyToCharacter.get(id) : null)
      .filter((id): id is string => !!id)
    : [];
  return {
    schemaVersion: SCHEMA_VERSION,
    revision: typeof source.revision === "number" ? Math.max(0, Math.trunc(source.revision)) : 0,
    chatId,
    decisions: [],
    manualOverrides,
    layoutOverride: source.layoutOverride && typeof source.layoutOverride === "object"
      ? source.layoutOverride as ChatTimelineV2["layoutOverride"]
      : null,
    snapshot: {
      schemaVersion: SCHEMA_VERSION,
      chatId,
      revision: typeof legacySnapshot.revision === "number" ? legacySnapshot.revision : 0,
      characters,
      focusedCharacterIds,
      updatedAt: typeof legacySnapshot.updatedAt === "number" ? legacySnapshot.updatedAt : now,
    },
    updatedAt: typeof source.updatedAt === "number" ? source.updatedAt : now,
  };
}

export class LumiStageRepository {
  private settingsCache = new Map<string, LumiStageSettingsV2>();
  private profileCache = new Map<string, CharacterProfileV2>();
  private timelineCache = new Map<string, ChatTimelineV2>();
  private writes = new Map<string, Promise<unknown>>();

  constructor(private readonly storage: UserStorageApi) {}

  private key(userId: string, path: string): string {
    return `${userId}:${path}`;
  }

  private enqueue<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.writes.get(key) ?? Promise.resolve();
    const next = previous.catch(() => undefined).then(operation);
    this.writes.set(key, next);
    const cleanup = () => {
      if (this.writes.get(key) === next) this.writes.delete(key);
    };
    void next.then(cleanup, cleanup);
    return next;
  }

  private async readCurrentOrOld<T>(
    currentPath: string,
    oldPath: string,
    userId: string,
  ): Promise<{ raw: T | null; migrated: boolean }> {
    const current = await this.storage.getJson<T | null>(currentPath, { fallback: null, userId });
    if (current) return { raw: current, migrated: false };
    const old = await this.storage.getJson<T | null>(oldPath, { fallback: null, userId });
    return { raw: old, migrated: !!old };
  }

  async getSettings(userId: string): Promise<LumiStageSettingsV2> {
    const path = settingsPath();
    const key = this.key(userId, path);
    const cached = this.settingsCache.get(key);
    if (cached) return structuredClone(cached);
    const { raw, migrated } = await this.readCurrentOrOld<unknown>(
      path,
      oldSettingsPath(),
      userId,
    );
    const settings = raw ? normalizeSettings(raw) : defaultSettings();
    if (migrated) await this.storage.setJson(path, settings, { indent: 2, userId });
    this.settingsCache.set(key, settings);
    return structuredClone(settings);
  }

  async saveSettings(
    userId: string,
    value: LumiStageSettingsV2,
    expectedRevision: number,
  ): Promise<LumiStageSettingsV2> {
    const path = settingsPath();
    const key = this.key(userId, path);
    return this.enqueue(key, async () => {
      const current = await this.getSettings(userId);
      if (current.revision !== expectedRevision) throw new RevisionConflict(current.revision);
      const settings = normalizeSettings({
        ...value,
        revision: current.revision + 1,
        updatedAt: Date.now(),
      });
      await this.storage.setJson(path, settings, { indent: 2, userId });
      this.settingsCache.set(key, settings);
      return structuredClone(settings);
    });
  }

  async getProfile(
    userId: string,
    characterId: string,
    characterName = "Character",
  ): Promise<CharacterProfileV2> {
    const path = profilePath(characterId);
    const key = this.key(userId, path);
    const cached = this.profileCache.get(key);
    if (cached) return structuredClone(cached);
    const { raw, migrated } = await this.readCurrentOrOld<unknown>(
      path,
      oldProfilePath(characterId),
      userId,
    );
    const profile = raw
      ? normalizeProfile(raw, characterId, characterName)
      : createProfile(characterId, characterName);
    if (migrated) await this.storage.setJson(path, profile, { indent: 2, userId });
    this.profileCache.set(key, profile);
    return structuredClone(profile);
  }

  async saveProfile(
    userId: string,
    value: CharacterProfileV2,
    expectedRevision: number,
    characterName = value.characterName,
  ): Promise<CharacterProfileV2> {
    const path = profilePath(value.characterId);
    const key = this.key(userId, path);
    return this.enqueue(key, async () => {
      const current = await this.getProfile(userId, value.characterId, characterName);
      if (current.revision !== expectedRevision) throw new RevisionConflict(current.revision);
      const profile = normalizeProfile(
        { ...value, revision: current.revision + 1, updatedAt: Date.now() },
        value.characterId,
        characterName,
      );
      await this.storage.setJson(path, profile, { indent: 2, userId });
      this.profileCache.set(key, profile);
      return structuredClone(profile);
    });
  }

  async replaceProfile(userId: string, value: CharacterProfileV2): Promise<CharacterProfileV2> {
    const path = profilePath(value.characterId);
    const key = this.key(userId, path);
    return this.enqueue(key, async () => {
      const profile = normalizeProfile(value, value.characterId, value.characterName);
      await this.storage.setJson(path, profile, { indent: 2, userId });
      this.profileCache.set(key, profile);
      return structuredClone(profile);
    });
  }

  async getTimeline(userId: string, chatId: string): Promise<ChatTimelineV2> {
    const path = timelinePath(chatId);
    const key = this.key(userId, path);
    const cached = this.timelineCache.get(key);
    if (cached) return structuredClone(cached);
    const { raw, migrated } = await this.readCurrentOrOld<unknown>(
      path,
      oldTimelinePath(chatId),
      userId,
    );
    const timeline = raw ? migrateTimeline(raw, chatId) : createTimeline(chatId);
    if (migrated) await this.storage.setJson(path, timeline, { indent: 2, userId });
    this.timelineCache.set(key, timeline);
    return structuredClone(timeline);
  }

  async saveTimeline(
    userId: string,
    value: ChatTimelineV2,
    expectedRevision: number,
  ): Promise<ChatTimelineV2> {
    const path = timelinePath(value.chatId);
    const key = this.key(userId, path);
    return this.enqueue(key, async () => {
      const current = await this.getTimeline(userId, value.chatId);
      if (current.revision !== expectedRevision) throw new RevisionConflict(current.revision);
      const timeline = {
        ...structuredClone(value),
        schemaVersion: SCHEMA_VERSION,
        updatedAt: Date.now(),
      };
      await this.storage.setJson(path, timeline, { indent: 2, userId });
      this.timelineCache.set(key, timeline);
      return structuredClone(timeline);
    });
  }

  async deleteTimeline(userId: string, chatId: string): Promise<void> {
    const path = timelinePath(chatId);
    const key = this.key(userId, path);
    await this.enqueue(key, async () => {
      await this.storage.delete(path, userId);
      this.timelineCache.delete(key);
    });
  }

  async listProfiles(userId: string): Promise<CharacterProfileV2[]> {
    const files = await this.storage.list("profiles/", userId);
    const characterIds = new Set<string>();
    for (const path of files) {
      const match = /^profiles\/([^/]+)\.v[12]\.json$/.exec(path);
      if (match) characterIds.add(match[1]);
    }
    const profiles: CharacterProfileV2[] = [];
    for (const characterId of characterIds) {
      profiles.push(await this.getProfile(userId, characterId));
    }
    return profiles;
  }

  clearUser(userId: string): void {
    for (const cache of [this.settingsCache, this.profileCache, this.timelineCache]) {
      for (const key of cache.keys()) {
        if (key.startsWith(`${userId}:`)) cache.delete(key);
      }
    }
  }
}

export class RevisionConflict extends Error {
  constructor(public readonly currentRevision: number) {
    super(`Revision conflict; current revision is ${currentRevision}.`);
    this.name = "RevisionConflict";
  }
}
