import { describe, expect, it } from "vitest";
import { createTimeline, defaultSettings } from "../src/model";
import {
  LumiStageRepository,
  RevisionConflict,
  profilePath,
  settingsPath,
  timelinePath,
  type UserStorageApi,
} from "../src/storage";

class MemoryStorage implements UserStorageApi {
  readonly values = new Map<string, unknown>();
  readonly writes: string[] = [];

  private key(userId: string | undefined, path: string) {
    return `${userId ?? "default"}:${path}`;
  }

  async getJson<T>(path: string, options?: { fallback?: T; userId?: string }): Promise<T> {
    const key = this.key(options?.userId, path);
    return (this.values.has(key) ? structuredClone(this.values.get(key)) : options?.fallback) as T;
  }

  async setJson(path: string, value: unknown, options?: { indent?: number; userId?: string }): Promise<void> {
    await Promise.resolve();
    this.writes.push(this.key(options?.userId, path));
    this.values.set(this.key(options?.userId, path), structuredClone(value));
  }

  async list(prefix = "", userId?: string): Promise<string[]> {
    const root = `${userId ?? "default"}:`;
    return [...this.values.keys()]
      .filter((key) => key.startsWith(root))
      .map((key) => key.slice(root.length))
      .filter((path) => path.startsWith(prefix));
  }

  async delete(path: string, userId?: string): Promise<void> {
    this.values.delete(this.key(userId, path));
  }
}

describe("private user storage repository", () => {
  it("uses only versioned LumiStage-owned per-character and per-chat paths", () => {
    expect(settingsPath()).toBe("settings.v1.json");
    expect(profilePath("character")).toBe("profiles/character.v1.json");
    expect(timelinePath("chat")).toBe("chats/chat.v1.json");
  });

  it("serializes writes and rejects a stale concurrent settings mutation", async () => {
    const storage = new MemoryStorage();
    const repository = new LumiStageRepository(storage);
    const settings = defaultSettings(1);
    const results = await Promise.allSettled([
      repository.saveSettings("user", { ...settings, preloadAdjacent: 4 }, 0),
      repository.saveSettings("user", { ...settings, preloadAdjacent: 8 }, 0),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((result): result is PromiseRejectedResult => result.status === "rejected");
    expect(rejected?.reason).toBeInstanceOf(RevisionConflict);
    expect((rejected?.reason as RevisionConflict).currentRevision).toBe(1);
    expect(storage.writes).toEqual(["user:settings.v1.json"]);
  });

  it("isolates caches and stored records by user", async () => {
    const storage = new MemoryStorage();
    const repository = new LumiStageRepository(storage);
    const first = await repository.getProfile("first", "character", "First");
    const second = await repository.getProfile("second", "character", "Second");
    expect(first.characterName).toBe("First");
    expect(second.characterName).toBe("Second");
    first.characterName = "Changed";
    expect((await repository.getProfile("first", "character")).characterName).toBe("First");
  });

  it("restores the complete chat stage and layout after a repository reload", async () => {
    const storage = new MemoryStorage();
    const firstRepository = new LumiStageRepository(storage);
    const timeline = createTimeline("chat", 1);
    timeline.revision = 1;
    timeline.layoutOverride = { width: 640, height: 480, idleOpacity: 0.3 };
    timeline.snapshot.actors.actor = {
      actorId: "actor",
      characterId: "character",
      outfitId: "outfit",
      poseId: "pose",
      expressionId: "expression",
      assetId: "asset",
      imageId: "image",
      label: "Actor · Outfit · Pose · Expression",
      focused: true,
      confidence: 0.9,
    };
    await firstRepository.saveTimeline("user", timeline, 0);
    const reloaded = await new LumiStageRepository(storage).getTimeline("user", "chat");
    expect(reloaded.layoutOverride).toMatchObject({ width: 640, height: 480 });
    expect(reloaded.snapshot.actors.actor.expressionId).toBe("expression");
  });

  it("rejects a stale detector timeline after a manual timeline write wins", async () => {
    const storage = new MemoryStorage();
    const repository = new LumiStageRepository(storage);
    const manual = createTimeline("chat", 1);
    manual.revision = 1;
    manual.manualOverrides.actor = { actorId: "actor", scope: "locked", createdAt: 2 };
    await repository.saveTimeline("user", manual, 0);
    const staleDetector = createTimeline("chat", 1);
    staleDetector.revision = 1;
    await expect(repository.saveTimeline("user", staleDetector, 0)).rejects.toMatchObject({ currentRevision: 1 });
    expect((await repository.getTimeline("user", "chat")).manualOverrides.actor.scope).toBe("locked");
  });
});
