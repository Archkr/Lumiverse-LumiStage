import { afterAll, describe, expect, it, vi } from "vitest";

describe("operator-scoped backend runtime", () => {
  it("keeps character selection scoped to the active user", async () => {
    type FrontendHandler = (payload: unknown, userId: string) => Promise<void>;
    type EventHandler = (payload: unknown, userId?: string) => void;
    const handlers: { frontend?: FrontendHandler } = {};
    const eventHandlers = new Map<string, EventHandler>();
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
    const staged = new Map<string, { fileName: string; data: Uint8Array }>();
    const deleteMany = vi.fn(async () => undefined);
    const chatGetMessages = vi.fn(async (): Promise<Array<Record<string, unknown>>> => []);
    const generateQuiet = vi.fn();
    const uploadMany = vi.fn(async (items: unknown[]): Promise<Array<{ id?: string; error?: string }>> =>
      items.map((_item, index) => ({ id: `stored-image-${uploadMany.mock.calls.length}-${index}` })),
    );
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
        uploadMany,
        deleteMany,
      },
      chats: { get: chatsGet },
      chat: { getMessages: chatGetMessages },
      connections: { list: connectionsList },
      generate: { quiet: generateQuiet },
      uploads: {
        get: vi.fn(async (id: string) => staged.get(id) ?? null),
        delete: vi.fn(async (id: string) => { staged.delete(id); }),
      },
      ui: { openDrawerTab },
      on: vi.fn((event: string, handler: EventHandler) => {
        eventHandlers.set(event, handler);
        return vi.fn();
      }),
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
    const initialProfile = structuredClone(
      sendToFrontend.mock.calls.find(([message]) => message.type === "profile")?.[0].profile,
    );
    initialProfile.outfits.push({
      id: "outfit-unsaved",
      name: "Rain Coat",
      order: initialProfile.outfits.length,
      defaultExpressionId: "expression-unsaved",
      expressions: [{
        id: "expression-unsaved",
        name: "Quiet Resolve",
        order: 0,
        variants: [],
      }],
    });
    staged.set("upload-one", { fileName: "asset-file.png", data: new Uint8Array([1, 2, 3]) });
    sendToFrontend.mockClear();
    await handleFrontend({
      type: "import-assets",
      requestId: "import-one",
      characterId: "character-a",
      uploads: [{ id: "upload-one", relativePath: "asset-file.png" }],
      baseProfile: initialProfile,
      expectedRevision: 0,
      layout: "automatic",
      targetOutfitId: "outfit-unsaved",
      targetExpressionId: "expression-unsaved",
    }, "user-a");
    const firstImport = sendToFrontend.mock.calls
      .map(([message]) => message)
      .find((message) => message.type === "import-complete");
    expect(firstImport).toBeTruthy();
    expect(firstImport.profile.outfits.map((outfit: { name: string }) => outfit.name)).toContain("Rain Coat");
    const firstExpression = firstImport.profile.outfits
      .find((outfit: { id: string }) => outfit.id === "outfit-unsaved")
      .expressions.find((expression: { id: string }) => expression.id === "expression-unsaved");
    expect(firstExpression.name).toBe("Quiet Resolve");
    expect(firstExpression.variants[0].fileName).toBe("asset-file.png");
    expect(sendToFrontend).toHaveBeenCalledWith(expect.objectContaining({
      type: "operation-complete",
      requestId: "import-one",
      revision: 1,
    }), "user-a");
    expect(uploadMany).toHaveBeenCalledTimes(1);

    const secondDraft = structuredClone(firstImport.profile);
    secondDraft.outfits.push({
      id: "outfit-second",
      name: "Evening",
      order: secondDraft.outfits.length,
      defaultExpressionId: "expression-second",
      expressions: [{
        id: "expression-second",
        name: "Composed",
        order: 0,
        variants: [],
      }],
    });
    staged.set("upload-two", { fileName: "same-bytes.png", data: new Uint8Array([1, 2, 3]) });
    sendToFrontend.mockClear();
    await handleFrontend({
      type: "import-assets",
      requestId: "import-two",
      characterId: "character-a",
      uploads: [{ id: "upload-two", relativePath: "same-bytes.png" }],
      baseProfile: secondDraft,
      expectedRevision: 1,
      layout: "automatic",
      targetOutfitId: "outfit-second",
      targetExpressionId: "expression-second",
    }, "user-a");
    const secondImport = sendToFrontend.mock.calls
      .map(([message]) => message)
      .find((message) => message.type === "import-complete");
    const referencedImageIds = secondImport.profile.outfits.flatMap(
      (outfit: { expressions: Array<{ variants: Array<{ imageId: string }> }> }) =>
        outfit.expressions.flatMap((expression) => expression.variants.map((variant) => variant.imageId)),
    );
    expect(referencedImageIds.filter((id: string) => id === firstExpression.variants[0].imageId)).toHaveLength(2);
    expect(uploadMany).toHaveBeenCalledTimes(1);

    staged.set("upload-three", { fileName: "tree.png", data: new Uint8Array([4, 5, 6]) });
    sendToFrontend.mockClear();
    await handleFrontend({
      type: "import-assets",
      requestId: "import-three",
      characterId: "character-a",
      uploads: [{ id: "upload-three", relativePath: "Tree Outfit/Tree Mood/tree.png" }],
      baseProfile: secondImport.profile,
      expectedRevision: 2,
      layout: "automatic",
    }, "user-a");
    const thirdImport = sendToFrontend.mock.calls
      .map(([message]) => message)
      .find((message) => message.type === "import-complete");
    expect(thirdImport.profile.outfits.find((outfit: { name: string }) => outfit.name === "Tree Outfit")
      ?.expressions.some((expression: { name: string }) => expression.name === "Tree Mood")).toBe(true);
    expect(uploadMany).toHaveBeenCalledTimes(2);

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

    async function expectCompletion(message: Record<string, unknown>, requestId: string) {
      sendToFrontend.mockClear();
      await (handleFrontend as FrontendHandler)(message, "user-a");
      expect(sendToFrontend).toHaveBeenCalledWith(
        expect.objectContaining({ type: "operation-complete", requestId }),
        "user-a",
      );
    }

    await expectCompletion({
      type: "save-settings",
      requestId: "save-settings",
      settings: {
        schemaVersion: 2,
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
          focusedScale: 1,
          idleOpacity: 0.5,
          showCaptions: true,
          showChrome: true,
          ensembleOverlap: 0.3,
          width: 320,
          height: 420,
          x: -1,
          y: -1,
          fullscreen: false,
          visible: true,
        },
        preloadAdjacent: 3,
        updatedAt: 0,
      },
      expectedRevision: 0,
    }, "save-settings");
    await expectCompletion({
      type: "save-profile",
      requestId: "save-profile",
      profile: thirdImport.profile,
      expectedRevision: 3,
    }, "save-profile");
    await expectCompletion({
      type: "apply-manual",
      requestId: "apply-manual",
      chatId: "chat-a",
      override: {
        characterId: "character-a",
        outfitId: "outfit-second",
        scope: "locked",
        lock: "outfit",
        createdAt: 1,
      },
    }, "apply-manual");
    await expectCompletion({
      type: "clear-manual",
      requestId: "clear-manual",
      chatId: "chat-a",
      characterId: "character-a",
    }, "clear-manual");
    await expectCompletion({
      type: "save-chat-layout",
      requestId: "save-layout",
      chatId: "chat-a",
      layoutOverride: { width: 500 },
      expectedRevision: 2,
    }, "save-layout");
    await expectCompletion({
      type: "analyze-now",
      requestId: "analyze-now",
      chatId: "chat-a",
    }, "analyze-now");
    await expectCompletion({
      type: "delete-variants",
      requestId: "delete-variants",
      characterId: "character-a",
      variantIds: [],
      expectedRevision: 4,
    }, "delete-variants");
    const afterDelete = structuredClone(
      sendToFrontend.mock.calls.map(([message]) => message)
        .find((message) => message.type === "profile").profile,
    );

    staged.set("partial-one", { fileName: "one.png", data: new Uint8Array([11]) });
    staged.set("partial-two", { fileName: "two.png", data: new Uint8Array([12]) });
    uploadMany.mockResolvedValueOnce([{ id: "orphan-image" }, { error: "codec rejected" }]);
    sendToFrontend.mockClear();
    await handleFrontend({
      type: "import-assets",
      requestId: "partial-import",
      characterId: "character-a",
      uploads: [
        { id: "partial-one", relativePath: "Partial/One.png" },
        { id: "partial-two", relativePath: "Partial/Two.png" },
      ],
      baseProfile: afterDelete,
      expectedRevision: 5,
      layout: "automatic",
    }, "user-a");
    expect(sendToFrontend).toHaveBeenCalledWith(expect.objectContaining({
      type: "error",
      requestId: "partial-import",
    }), "user-a");
    expect(sendToFrontend).not.toHaveBeenCalledWith(expect.objectContaining({
      type: "operation-complete",
      requestId: "partial-import",
    }), "user-a");
    expect(deleteMany).toHaveBeenCalledWith(["orphan-image"], { userId: "user-a" });

    sendToFrontend.mockClear();
    await handleFrontend({
      type: "save-profile",
      requestId: "stale-save",
      profile: afterDelete,
      expectedRevision: 4,
    }, "user-a");
    expect(sendToFrontend).toHaveBeenCalledWith(expect.objectContaining({
      type: "error",
      requestId: "stale-save",
      code: "REVISION_CONFLICT",
      currentRevision: 5,
    }), "user-a");
    await expectCompletion({
      type: "request-diagnostics",
      requestId: "diagnostics",
    }, "diagnostics");

    const automaticOutfit = thirdImport.profile.outfits.find(
      (outfit: { id: string }) => outfit.id === "outfit-second",
    );
    const automaticExpression = automaticOutfit.expressions.find(
      (expression: { id: string }) => expression.id === "expression-second",
    );
    const automaticVariant = automaticExpression.variants[0];
    chatGetMessages.mockResolvedValue([{
      id: "assistant-final",
      role: "assistant",
      content: "Aster smiles after the reply is complete.",
      swipe_id: 0,
    }]);
    generateQuiet.mockResolvedValue({
      tool_calls: [{
        name: "set_stage_state",
        args: {
          focusedCharacterIds: ["character-a"],
          characters: [{
            characterId: "character-a",
            outfitName: automaticOutfit.name,
            expressionName: automaticExpression.name,
            fileName: automaticVariant.fileName,
            confidence: 1,
          }],
        },
      }],
    });
    eventHandlers.get("GENERATION_STARTED")?.({
      generationId: "generation-one",
      chatId: "chat-a",
    }, "user-a");
    eventHandlers.get("MESSAGE_EDITED")?.({
      chatId: "chat-a",
      message: {
        id: "assistant-final",
        role: "assistant",
        content: "Aster smiles after the reply is complete.",
      },
    }, "user-a");
    await new Promise((resolve) => setTimeout(resolve, 360));
    expect(generateQuiet).not.toHaveBeenCalled();

    eventHandlers.get("GENERATION_ENDED")?.({
      generationId: "generation-one",
      chatId: "chat-a",
      messageId: "assistant-final",
    }, "user-a");
    await vi.waitFor(() => {
      expect(generateQuiet).toHaveBeenCalledTimes(1);
    }, { timeout: 2_000 });
    const detectorRequest = generateQuiet.mock.calls[0][0];
    expect(detectorRequest.messages.map((message: { role: string }) => message.role)).toEqual([
      "system",
      "assistant",
      "user",
    ]);
    expect(JSON.stringify(detectorRequest.messages)).not.toContain("__isChatHistory");
    expect(JSON.stringify(detectorRequest.messages)).not.toContain("variant-");
    await vi.waitFor(() => {
      const settledState = [...sendToFrontend.mock.calls]
        .reverse()
        .map(([message]) => message)
        .find((message) =>
          message.type === "state"
          && message.state.snapshot?.characters?.["character-a"]?.variantId === automaticVariant.id
        );
      expect(settledState).toBeTruthy();
      expect(settledState.state.snapshot.characters["character-a"]).toEqual(expect.objectContaining({
        outfitId: automaticOutfit.id,
        expressionId: automaticExpression.id,
        variantId: automaticVariant.id,
      }));
    }, { timeout: 2_000 });

    await handleFrontend({ type: "open-connections" }, "user-a");
    expect(openDrawerTab).toHaveBeenCalledWith("connections", { userId: "user-a" });
  });
});

afterAll(() => {
  delete (globalThis as typeof globalThis & { spindle?: unknown }).spindle;
});
