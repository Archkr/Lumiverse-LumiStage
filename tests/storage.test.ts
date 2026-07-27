import { describe, expect, it } from "vitest";
import {
  LumiStageRepository,
  RevisionConflict,
  profilePath,
  settingsPath,
  timelinePath,
  type UserStorageApi,
} from "../src/storage";
import { profileA } from "./fixtures";

class MemoryStorage implements UserStorageApi {
  values = new Map<string, unknown>();
  writes: string[] = [];

  private key(path: string, userId?: string) {
    return `${userId ?? ""}:${path}`;
  }

  async getJson<T>(path: string, options?: { fallback?: T; userId?: string }): Promise<T> {
    return structuredClone(
      this.values.has(this.key(path, options?.userId))
        ? this.values.get(this.key(path, options?.userId))
        : options?.fallback,
    ) as T;
  }

  async setJson(path: string, value: unknown, options?: { userId?: string }): Promise<void> {
    this.writes.push(path);
    this.values.set(this.key(path, options?.userId), structuredClone(value));
  }

  async list(prefix = "", userId?: string): Promise<string[]> {
    const marker = `${userId ?? ""}:`;
    return [...this.values.keys()]
      .filter((key) => key.startsWith(marker))
      .map((key) => key.slice(marker.length))
      .filter((path) => path.startsWith(prefix));
  }

  async delete(path: string, userId?: string): Promise<void> {
    this.values.delete(this.key(path, userId));
  }
}

describe("V2 user storage", () => {
  it("uses V2 paths and rejects stale profile mutations", async () => {
    const storage = new MemoryStorage();
    const repository = new LumiStageRepository(storage);
    const profile = await repository.getProfile("user", "character-a", "Aster");
    expect(profilePath("character-a")).toBe("profiles/character-a.v2.json");
    const saved = await repository.saveProfile("user", profile, 0);
    expect(saved.revision).toBe(1);
    await expect(repository.saveProfile("user", profile, 0))
      .rejects.toBeInstanceOf(RevisionConflict);
  });

  it("serializes concurrent writes per record", async () => {
    const storage = new MemoryStorage();
    const repository = new LumiStageRepository(storage);
    const settings = await repository.getSettings("user");
    const first = repository.saveSettings("user", settings, 0);
    const second = repository.saveSettings("user", settings, 0);
    await expect(first).resolves.toEqual(expect.objectContaining({ revision: 1 }));
    await expect(second).rejects.toBeInstanceOf(RevisionConflict);
    expect(settingsPath()).toBe("settings.v2.json");
  });

  it("migrates V1 profiles and writes the V2 record without losing media", async () => {
    const storage = new MemoryStorage();
    const current = profileA();
    storage.values.set("user:profiles/character-a.v1.json", {
      schemaVersion: 1,
      revision: 4,
      characterName: "Aster",
      defaultActorId: "owner",
      actors: [{
        id: "owner",
        name: "Aster",
        defaultOutfitId: current.defaultOutfitId,
        outfits: current.outfits.map((outfit) => ({
          ...outfit,
          expressions: outfit.expressions.map((expression) => ({
            ...expression,
            assets: expression.variants,
            variants: undefined,
          })),
        })),
      }],
    });
    const repository = new LumiStageRepository(storage);
    const migrated = await repository.getProfile("user", "character-a", "Aster");
    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.outfits[0].expressions[0].variants).toHaveLength(2);
    expect(storage.writes).toContain(profilePath("character-a"));
  });

  it("migrates layout and valid manual state while discarding old detector records", async () => {
    const storage = new MemoryStorage();
    storage.values.set("user:chats/chat.v1.json", {
      schemaVersion: 1,
      revision: 8,
      chatId: "chat",
      decisions: [{ incompatible: true }],
      manualOverrides: {
        owner: {
          actorId: "owner",
          outfitId: "outfit-casual",
          expressionId: "expression-neutral",
          assetId: "variant-neutral-a",
          scope: "locked",
          createdAt: 5,
        },
      },
      layoutOverride: { width: 500 },
      snapshot: {
        revision: 2,
        actors: {
          owner: {
            characterId: "character-a",
            outfitId: "outfit-casual",
            expressionId: "expression-neutral",
            assetId: "variant-neutral-a",
            imageId: "image",
            label: "Aster",
            focused: true,
            confidence: 1,
          },
        },
        focusedActorIds: ["owner"],
      },
    });
    const repository = new LumiStageRepository(storage);
    const timeline = await repository.getTimeline("user", "chat");
    expect(timeline.schemaVersion).toBe(2);
    expect(timeline.decisions).toEqual([]);
    expect(timeline.layoutOverride).toEqual({ width: 500 });
    expect(timeline.manualOverrides["character-a"]).toEqual(expect.objectContaining({
      characterId: "character-a",
      variantId: "variant-neutral-a",
      lock: "state",
    }));
    expect(timeline.snapshot.focusedCharacterIds).toEqual(["character-a"]);
    expect(timelinePath("chat")).toBe("chats/chat.v2.json");
  });
});
