import { createProfile, createTimeline, defaultSettings, normalizeProfile, normalizeSettings } from "./model";
import type { CharacterProfileV1, ChatTimelineV1, LumiStageSettingsV1 } from "./types";

export interface UserStorageApi {
  getJson<T>(path: string, options?: { fallback?: T; userId?: string }): Promise<T>;
  setJson(path: string, value: unknown, options?: { indent?: number; userId?: string }): Promise<void>;
  list(prefix?: string, userId?: string): Promise<string[]>;
  delete(path: string, userId?: string): Promise<void>;
}

export const settingsPath = () => "settings.v1.json";
export const profilePath = (characterId: string) => `profiles/${characterId}.v1.json`;
export const timelinePath = (chatId: string) => `chats/${chatId}.v1.json`;

export class LumiStageRepository {
  private settingsCache = new Map<string, LumiStageSettingsV1>();
  private profileCache = new Map<string, CharacterProfileV1>();
  private timelineCache = new Map<string, ChatTimelineV1>();
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

  async getSettings(userId: string): Promise<LumiStageSettingsV1> {
    const key = this.key(userId, settingsPath());
    const cached = this.settingsCache.get(key);
    if (cached) return structuredClone(cached);
    const raw = await this.storage.getJson<unknown>(settingsPath(), { fallback: null, userId });
    const settings = raw ? normalizeSettings(raw) : defaultSettings();
    this.settingsCache.set(key, settings);
    return structuredClone(settings);
  }

  async saveSettings(userId: string, value: LumiStageSettingsV1, expectedRevision: number): Promise<LumiStageSettingsV1> {
    const path = settingsPath();
    const key = this.key(userId, path);
    return this.enqueue(key, async () => {
      const current = await this.getSettings(userId);
      if (current.revision !== expectedRevision) throw new RevisionConflict(current.revision);
      const settings = normalizeSettings({ ...value, revision: current.revision + 1, updatedAt: Date.now() });
      await this.storage.setJson(path, settings, { indent: 2, userId });
      this.settingsCache.set(key, settings);
      return structuredClone(settings);
    });
  }

  async getProfile(userId: string, characterId: string, characterName = "Character"): Promise<CharacterProfileV1> {
    const path = profilePath(characterId);
    const key = this.key(userId, path);
    const cached = this.profileCache.get(key);
    if (cached) return structuredClone(cached);
    const raw = await this.storage.getJson<unknown>(path, { fallback: null, userId });
    const profile = raw ? normalizeProfile(raw, characterId, characterName) : createProfile(characterId, characterName);
    this.profileCache.set(key, profile);
    return structuredClone(profile);
  }

  async saveProfile(
    userId: string,
    value: CharacterProfileV1,
    expectedRevision: number,
    characterName = value.characterName,
  ): Promise<CharacterProfileV1> {
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

  async replaceProfile(userId: string, value: CharacterProfileV1): Promise<CharacterProfileV1> {
    const path = profilePath(value.characterId);
    const key = this.key(userId, path);
    return this.enqueue(key, async () => {
      const profile = normalizeProfile(value, value.characterId, value.characterName);
      await this.storage.setJson(path, profile, { indent: 2, userId });
      this.profileCache.set(key, profile);
      return structuredClone(profile);
    });
  }

  async getTimeline(userId: string, chatId: string): Promise<ChatTimelineV1> {
    const path = timelinePath(chatId);
    const key = this.key(userId, path);
    const cached = this.timelineCache.get(key);
    if (cached) return structuredClone(cached);
    const raw = await this.storage.getJson<ChatTimelineV1 | null>(path, { fallback: null, userId });
    const timeline = raw?.schemaVersion === 1 && raw.chatId === chatId
      ? { ...raw, layoutOverride: raw.layoutOverride ?? null }
      : createTimeline(chatId);
    this.timelineCache.set(key, timeline);
    return structuredClone(timeline);
  }

  async saveTimeline(userId: string, value: ChatTimelineV1, expectedRevision: number): Promise<ChatTimelineV1> {
    const path = timelinePath(value.chatId);
    const key = this.key(userId, path);
    return this.enqueue(key, async () => {
      const current = await this.getTimeline(userId, value.chatId);
      if (current.revision !== expectedRevision) throw new RevisionConflict(current.revision);
      const timeline = { ...structuredClone(value), schemaVersion: 1 as const, updatedAt: Date.now() };
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

  async listProfiles(userId: string): Promise<CharacterProfileV1[]> {
    const files = await this.storage.list("profiles/", userId);
    const profiles: CharacterProfileV1[] = [];
    for (const file of files.filter((path) => /^profiles\/[^/]+\.v1\.json$/.test(path))) {
      const characterId = file.slice("profiles/".length, -".v1.json".length);
      profiles.push(await this.getProfile(userId, characterId));
    }
    return profiles;
  }

  clearUser(userId: string): void {
    for (const cache of [this.settingsCache, this.profileCache, this.timelineCache]) {
      for (const key of cache.keys()) if (key.startsWith(`${userId}:`)) cache.delete(key);
    }
  }
}

export class RevisionConflict extends Error {
  constructor(public readonly currentRevision: number) {
    super(`Revision conflict; current revision is ${currentRevision}.`);
    this.name = "RevisionConflict";
  }
}
