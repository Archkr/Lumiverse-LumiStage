import { afterAll, describe, expect, it, vi } from "vitest";

describe("operator-scoped backend runtime", () => {
  it("keeps character selection scoped to the active user", async () => {
    type FrontendHandler = (payload: unknown, userId: string) => Promise<void>;
    const handlers: { frontend?: FrontendHandler } = {};
    const charactersGet = vi.fn(async () => ({ id: "character-a", name: "Aster" }));
    const chatsGet = vi.fn(async () => ({ id: "chat-a", character_id: "character-a" }));
    const connectionsList = vi.fn(async () => [{
      id: "connection-a",
      name: "Primary",
      provider: "openai",
      model: "gpt-4.1-mini",
      is_default: true,
      has_api_key: true,
    }]);
    const openDrawerTab = vi.fn(async () => undefined);
    const sendToFrontend = vi.fn();
    const spindle = {
      userStorage: {
        getJson: vi.fn(async (_path: string, options?: { fallback?: unknown }) => options?.fallback ?? null),
        setJson: vi.fn(async () => undefined),
        list: vi.fn(async () => []),
        delete: vi.fn(async () => undefined),
      },
      permissions: {
        has: vi.fn(() => true),
        onChanged: vi.fn(() => vi.fn()),
      },
      characters: { get: charactersGet },
      images: {
        list: vi.fn(async () => ({ data: [], total: 0 })),
        get: vi.fn(async () => null),
      },
      chats: { get: chatsGet },
      chat: { getMessages: vi.fn(async () => []) },
      connections: { list: connectionsList },
      generate: { quiet: vi.fn() },
      uploads: { get: vi.fn(), delete: vi.fn() },
      ui: { openDrawerTab },
      on: vi.fn(() => vi.fn()),
      onFrontendMessage: vi.fn((handler: FrontendHandler) => {
        handlers.frontend = handler;
        return vi.fn();
      }),
      sendToFrontend,
    };
    (globalThis as typeof globalThis & { spindle: unknown }).spindle = spindle;

    await import("../src/backend");
    const handleFrontend = handlers.frontend;
    expect(handleFrontend).toBeTypeOf("function");
    if (!handleFrontend) throw new Error("Backend did not register its frontend handler.");
    await handleFrontend({ type: "character-editor", characterId: "character-a" }, "user-a");

    expect(charactersGet).toHaveBeenCalledWith("character-a", "user-a");
    expect(sendToFrontend).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "profile",
        profile: expect.objectContaining({ characterId: "character-a", characterName: "Aster" }),
      }),
      "user-a",
    );

    await handleFrontend({ type: "ready", chatId: "chat-a", characterId: "character-a" }, "user-a");
    expect(chatsGet).toHaveBeenCalledWith("chat-a", "user-a");
    expect(connectionsList).toHaveBeenCalledWith("user-a");
    expect(sendToFrontend).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "state",
        state: expect.objectContaining({
          connections: [expect.objectContaining({ id: "connection-a", hasApiKey: true })],
        }),
      }),
      "user-a",
    );

    await handleFrontend({ type: "open-connections" }, "user-a");
    expect(openDrawerTab).toHaveBeenCalledWith("connections", { userId: "user-a" });
  });
});

afterAll(() => {
  delete (globalThis as typeof globalThis & { spindle?: unknown }).spindle;
});
