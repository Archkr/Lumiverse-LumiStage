import { afterAll, describe, expect, it, vi } from "vitest";

describe("operator-scoped backend runtime", () => {
  it("keeps character selection scoped to the active user", async () => {
    type FrontendHandler = (payload: unknown, userId: string) => Promise<void>;
    type EventHandler = (payload: unknown, userId?: string) => void;
    const handlers: { frontend?: FrontendHandler } = {};
    const eventHandlers = new Map<string, EventHandler>();
    const charactersGet = vi.fn(async () => ({ id: "character-a", name: "Aster" }));
    const chatsGet = vi.fn(async () => ({ id: "chat-a", character_id: "character-a" }));
    const defaultConnectionModel = "gpt-4.1-mini";
    let defaultConnectionUpdatedAt = 100;
    const connectionsList = vi.fn(async () => [
      {
        id: "connection-a",
        name: "Primary",
        provider: "openai",
        model: defaultConnectionModel,
        preset_id: "preset-with-legacy-model",
        is_default: true,
        has_api_key: true,
        updated_at: defaultConnectionUpdatedAt,
      },
      {
        id: "connection-manual",
        name: "Manual detector",
        provider: "openai",
        model: "manual-default",
        preset_id: null,
        is_default: false,
        has_api_key: true,
        updated_at: 200,
      },
    ]);
    const openDrawerTab = vi.fn(async () => undefined);
    const sendToFrontend = vi.fn();
    const staged = new Map<string, { fileName: string; data: Uint8Array }>();
    const deleteMany = vi.fn(async () => undefined);
    const chatGetMessages = vi.fn(async (): Promise<Array<Record<string, unknown>>> => []);
    const generateQuiet = vi.fn();
    const generateRaw = vi.fn();
    const userStorageValues = new Map<string, unknown>();
    const storageKey = (path: string, userId?: string) => `${userId ?? ""}:${path}`;
    let settingsWriteBarrier: Promise<void> | null = null;
    let settingsWriteStarted: (() => void) | null = null;
    const uploadMany = vi.fn(async (items: unknown[]): Promise<Array<{ id?: string; error?: string }>> =>
      items.map((_item, index) => ({ id: `stored-image-${uploadMany.mock.calls.length}-${index}` })),
    );
    const spindle = {
      userStorage: {
        getJson: vi.fn(async (path: string, options?: { fallback?: unknown; userId?: string }) =>
          structuredClone(
            userStorageValues.has(storageKey(path, options?.userId))
              ? userStorageValues.get(storageKey(path, options?.userId))
              : options?.fallback ?? null,
          )),
        setJson: vi.fn(async (path: string, value: unknown, options?: { userId?: string }) => {
          if (path === "settings.v2.json" && settingsWriteBarrier) {
            settingsWriteStarted?.();
            await settingsWriteBarrier;
          }
          userStorageValues.set(storageKey(path, options?.userId), structuredClone(value));
        }),
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
      generate: { quiet: generateQuiet, raw: generateRaw },
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
    const secondOutfitDraft = secondImport.profile.outfits.find(
      (outfit: { id: string }) => outfit.id === "outfit-second",
    );
    secondOutfitDraft.expressions.push({
      id: "expression-second-alt",
      name: "Bright",
      order: 1,
      variants: [{
        ...firstExpression.variants[0],
        id: "variant-second-alt",
        fileName: "bright.png",
        order: 0,
      }],
    });

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
          connections: expect.arrayContaining([
            expect.objectContaining({ id: "connection-a", hasApiKey: true }),
          ]),
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
          connectionId: "connection-a",
          model: "saved-model",
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
      (expression: { id: string }) => expression.id === "expression-second-alt",
    );
    const automaticVariant = automaticExpression.variants[0];
    const lockedStartingExpression = automaticOutfit.expressions.find(
      (expression: { id: string }) => expression.id === "expression-second",
    );
    await expectCompletion({
      type: "apply-manual",
      requestId: "lock-outfit-for-analysis",
      chatId: "chat-a",
      override: {
        characterId: "character-a",
        outfitId: automaticOutfit.id,
        expressionId: lockedStartingExpression.id,
        variantId: lockedStartingExpression.variants[0].id,
        scope: "locked",
        lock: "outfit",
        createdAt: 2,
      },
    }, "lock-outfit-for-analysis");
    const lockedState = [...sendToFrontend.mock.calls]
      .reverse()
      .map(([message]) => message)
      .find((message) => message.type === "state");
    expect(lockedState.state.timeline.manualOverrides["character-a"]).toEqual({
      characterId: "character-a",
      outfitId: automaticOutfit.id,
      expressionId: lockedStartingExpression.id,
      variantId: lockedStartingExpression.variants[0].id,
      scope: "locked",
      lock: "outfit",
      createdAt: 2,
    });
    expect(lockedState.state.snapshot.characters["character-a"]).toEqual(expect.objectContaining({
      outfitId: automaticOutfit.id,
      expressionId: lockedStartingExpression.id,
      variantId: lockedStartingExpression.variants[0].id,
    }));
    const completedMessages = [{
      id: "assistant-final",
      role: "assistant",
      content: "Aster smiles after the reply is complete.",
      swipe_id: 0,
    }];
    let delayedCompletionReads = 0;
    chatGetMessages.mockImplementation(async () => {
      if (delayedCompletionReads < 2) {
        delayedCompletionReads += 1;
        return [{
          id: "assistant-stale",
          role: "assistant",
          content: "This stale reply must never be analyzed.",
          swipe_id: 0,
        }];
      }
      return completedMessages;
    });
    generateQuiet.mockImplementation(async (request: Record<string, unknown>) => {
      const parameters = request.parameters as Record<string, unknown>;
      return {
        provider: "openai",
        model: typeof parameters.model === "string" && parameters.model
          ? parameters.model
          : defaultConnectionModel,
        reasoning: "The completed scene supports Aster's bright expression.",
        finish_reason: "tool_calls",
        usage: { prompt_tokens: 42, completion_tokens: 9, total_tokens: 51 },
        tool_calls: [{
          name: "set_stage_state",
          args: {
            focusedCharacterIds: ["character-a"],
            characters: [{
              characterId: "character-a",
              outfitName: automaticOutfit.name,
              expressionName: automaticExpression.name,
              confidence: 1,
            }],
          },
        }],
      };
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
    expect(JSON.stringify(detectorRequest)).not.toContain(automaticVariant.fileName);
    expect(JSON.stringify(detectorRequest)).not.toContain('"fileName":');
    expect(JSON.stringify(detectorRequest)).not.toContain('"files":');
    expect(JSON.stringify(detectorRequest.messages)).not.toContain("This stale reply");
    expect(detectorRequest.connection_id).toBe("connection-a");
    expect(detectorRequest).not.toHaveProperty("model");
    expect(detectorRequest.parameters).toEqual(expect.objectContaining({
      temperature: 0.1,
      model: "saved-model",
    }));
    expect(detectorRequest.reasoning).toEqual({ source: "inherit" });
    expect(generateRaw).not.toHaveBeenCalled();
    const detectorSystem = String(detectorRequest.messages[0].content);
    const detectorCatalog = JSON.parse(
      detectorSystem
        .split("\n")
        .find((line: string) => line.startsWith("Catalog: "))
        ?.slice("Catalog: ".length) ?? "[]",
    );
    expect(detectorCatalog[0].outfits.map(
      (outfit: { outfitName: string }) => outfit.outfitName,
    )).toEqual(["Evening"]);
    expect(detectorCatalog[0].outfits[0].expressions.map(
      (expression: { expressionName: string }) => expression.expressionName,
    )).toEqual(["Composed", "Bright"]);
    expect(detectorSystem).not.toContain("Rain Coat");
    expect(detectorSystem).not.toContain("Tree Outfit");
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
    const acceptedDebugState = [...sendToFrontend.mock.calls]
      .reverse()
      .map(([message]) => message)
      .find((message) => message.type === "state" && message.state.detectorDebugRuns?.some(
        (run: { messageId: string; status: string }) => run.messageId === "assistant-final" && run.status === "accepted",
      ));
    const acceptedDebugRun = acceptedDebugState?.state.detectorDebugRuns.find(
      (run: { messageId: string; status: string }) => run.messageId === "assistant-final" && run.status === "accepted",
    );
    expect(acceptedDebugRun).toEqual(expect.objectContaining({
      source: "provider",
      reasoning: "The completed scene supports Aster's bright expression.",
      responseProvider: "openai",
      responseModel: "saved-model",
      parsedDecision: expect.objectContaining({
        characters: [expect.objectContaining({ expressionId: automaticExpression.id })],
      }),
      rawResponse: expect.objectContaining({
        finishReason: "tool_calls",
        toolCalls: [expect.objectContaining({ name: "set_stage_state" })],
        usage: expect.objectContaining({ promptTokens: 42, totalTokens: 51 }),
      }),
    }));

    await expectCompletion({
      type: "patch-settings",
      requestId: "persist-selected-detector",
      patch: {
        detection: {
          connectionId: "connection-manual",
          model: "manual-model",
          contextMessages: 3,
          temperature: 0.2,
          confidence: 0.7,
        },
      },
    }, "persist-selected-detector");
    generateQuiet.mockClear();
    sendToFrontend.mockClear();
    await Promise.all([
      handleFrontend({
        type: "analyze-now",
        requestId: "analyze-selected-model-one",
        chatId: "chat-a",
      }, "user-a"),
      handleFrontend({
        type: "analyze-now",
        requestId: "analyze-selected-model-two",
        chatId: "chat-a",
      }, "user-a"),
    ]);
    for (const requestId of ["analyze-selected-model-one", "analyze-selected-model-two"]) {
      expect(sendToFrontend).toHaveBeenCalledWith(
        expect.objectContaining({ type: "operation-complete", requestId }),
        "user-a",
      );
    }
    expect(generateQuiet).toHaveBeenCalledTimes(1);
    expect(generateQuiet.mock.calls[0][0]).toEqual(expect.objectContaining({
      connection_id: "connection-manual",
      parameters: expect.objectContaining({
        temperature: 0.2,
        model: "manual-model",
      }),
    }));
    expect(generateQuiet.mock.calls[0][0].parameters).not.toHaveProperty("max_tokens");
    expect(generateQuiet.mock.calls[0][0]).not.toHaveProperty("model");
    expect(generateRaw).not.toHaveBeenCalled();
    const concurrentDebugState = [...sendToFrontend.mock.calls]
      .reverse()
      .map(([message]) => message)
      .find((message) => message.type === "state" && message.state.detectorDebugRuns?.some(
        (run: { status: string; source: string }) => run.status === "cached" && run.source === "cache",
      ));
    expect(concurrentDebugState?.state.detectorDebugRuns).toEqual(expect.arrayContaining([
      expect.objectContaining({ trigger: "manual", source: "provider", status: "accepted" }),
      expect.objectContaining({ trigger: "manual", source: "cache", status: "cached" }),
    ]));

    eventHandlers.get("GENERATION_ENDED")?.({
      generationId: "generation-one",
      chatId: "chat-a",
      messageId: "assistant-final",
    }, "user-a");
    await new Promise((resolve) => setTimeout(resolve, 240));
    expect(generateQuiet).toHaveBeenCalledTimes(1);

    await handleFrontend({
      type: "analyze-now",
      requestId: "analyze-selected-model-after-duplicate-event",
      chatId: "chat-a",
    }, "user-a");
    expect(sendToFrontend).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "operation-complete",
        requestId: "analyze-selected-model-after-duplicate-event",
      }),
      "user-a",
    );
    expect(generateQuiet).toHaveBeenCalledTimes(1);

    eventHandlers.get("MESSAGE_EDITED")?.({
      chatId: "chat-a",
      message: {
        id: "assistant-final",
        role: "assistant",
        content: "Aster smiles after the reply is complete.",
      },
    }, "user-a");
    await new Promise((resolve) => setTimeout(resolve, 360));
    expect(generateQuiet).toHaveBeenCalledTimes(1);

    await expectCompletion({
      type: "patch-settings",
      requestId: "persist-default-connection-override",
      patch: {
        detection: {
          connectionId: null,
          model: "default-connection-override",
        },
      },
    }, "persist-default-connection-override");
    generateQuiet.mockClear();
    await handleFrontend({
      type: "analyze-now",
      requestId: "analyze-default-connection-model",
      chatId: "chat-a",
    }, "user-a");
    expect(generateQuiet).toHaveBeenCalledWith(expect.objectContaining({
      connection_id: undefined,
      parameters: expect.objectContaining({
        model: "default-connection-override",
      }),
    }));
    expect(generateQuiet.mock.calls[0][0]).not.toHaveProperty("model");
    expect(generateRaw).not.toHaveBeenCalled();

    await expectCompletion({
      type: "patch-settings",
      requestId: "persist-connection-default",
      patch: {
        detection: { model: null },
      },
    }, "persist-connection-default");
    generateQuiet.mockClear();
    await handleFrontend({
      type: "analyze-now",
      requestId: "analyze-default-connection-default-model",
      chatId: "chat-a",
    }, "user-a");
    expect(generateQuiet).toHaveBeenCalledTimes(1);
    expect(generateQuiet).toHaveBeenCalledWith(expect.objectContaining({
      connection_id: undefined,
      parameters: expect.objectContaining({
        model: "",
      }),
    }));

    sendToFrontend.mockClear();
    await handleFrontend({
      type: "request-diagnostics",
      requestId: "dispatch-diagnostics",
    }, "user-a");
    const diagnostics = sendToFrontend.mock.calls
      .map(([message]) => message)
      .find((message) =>
        message.type === "operation-complete"
        && message.requestId === "dispatch-diagnostics"
      )?.result;
    expect(diagnostics.connection).toEqual(expect.objectContaining({
      selection: "default-host-connection",
      requestedConnectionId: "connection-a",
      requestedConnectionName: "Primary",
      requestedModel: defaultConnectionModel,
      modelSource: "connection-default",
      latestDecisionModel: defaultConnectionModel,
      lastDispatch: expect.objectContaining({
        dispatchId: expect.any(String),
        trigger: "manual",
        settingsRevision: expect.any(Number),
        settingsEpoch: expect.any(Number),
        configuredConnectionId: null,
        resolvedConnectionId: "connection-a",
        connectionPresetId: "preset-with-legacy-model",
        modelSource: "connection-default",
        requestedModel: defaultConnectionModel,
        sentModelParameter: "",
        responseProvider: "openai",
        responseModel: defaultConnectionModel,
        providerInvoked: true,
        status: "success",
      }),
    }));
    expect(diagnostics.persistence).toEqual(expect.objectContaining({
      settingsRevision: expect.any(Number),
      configuredConnectionId: null,
      configuredModel: null,
      detectorSettingsEpoch: expect.any(Number),
      obsoleteDetectorCancellations: expect.any(Number),
    }));

    generateQuiet.mockClear();
    defaultConnectionUpdatedAt = 101;
    eventHandlers.get("MESSAGE_EDITED")?.({
      chatId: "chat-a",
      message: {
        id: "assistant-final",
        role: "assistant",
        content: "Aster smiles after the reply is complete.",
      },
    }, "user-a");
    await new Promise((resolve) => setTimeout(resolve, 360));
    expect(generateQuiet).toHaveBeenCalledTimes(1);
    expect(generateQuiet.mock.calls[0][0].parameters).toEqual(expect.objectContaining({
      model: "",
    }));

    await handleFrontend({
      type: "patch-settings",
      requestId: "prepare-obsolete-detector-analysis",
      patch: { detection: { temperature: 0.25 } },
    }, "user-a");
    generateQuiet.mockClear();
    let releaseObsoleteStart: () => void = () => {};
    const obsoleteStarted = new Promise<void>((resolve) => {
      releaseObsoleteStart = resolve;
    });
    let obsoleteAborted = false;
    generateQuiet.mockImplementationOnce(async (request: Record<string, unknown>) =>
      new Promise((_resolve, reject) => {
        const signal = request.signal as AbortSignal;
        releaseObsoleteStart();
        signal.addEventListener("abort", () => {
          obsoleteAborted = true;
          reject(signal.reason);
        }, { once: true });
      }));
    const staleAnalysis = handleFrontend({
      type: "analyze-now",
      requestId: "obsolete-detector-analysis",
      chatId: "chat-a",
    }, "user-a");
    await obsoleteStarted;
    await handleFrontend({
      type: "patch-settings",
      requestId: "replace-obsolete-detector-model",
      patch: {
        detection: {
          connectionId: "connection-manual",
          model: "replacement-model",
        },
      },
    }, "user-a");
    await staleAnalysis;
    expect(obsoleteAborted).toBe(true);
    expect(generateQuiet).toHaveBeenCalledTimes(2);
    expect(generateQuiet.mock.calls.map(([request]) =>
      (request.parameters as Record<string, unknown>).model
    )).toEqual(["", "replacement-model"]);
    const cancellationDebugState = [...sendToFrontend.mock.calls]
      .reverse()
      .map(([message]) => message)
      .find((message) => message.type === "state" && message.state.detectorDebugRuns?.some(
        (run: { status: string }) => run.status === "cancelled",
      ));
    expect(cancellationDebugState?.state.detectorDebugRuns).toContainEqual(expect.objectContaining({
      status: "cancelled",
      error: "Cancelled because detector settings changed.",
    }));

    generateQuiet.mockClear();
    let releaseSettingsWrite: () => void = () => {};
    settingsWriteBarrier = new Promise<void>((resolve) => {
      releaseSettingsWrite = resolve;
    });
    const writeStarted = new Promise<void>((resolve) => {
      settingsWriteStarted = resolve;
    });
    const saveForAutomaticTrigger = handleFrontend({
      type: "patch-settings",
      requestId: "persist-model-before-automatic-trigger",
      patch: {
        detection: { model: "automatic-race-model" },
      },
    }, "user-a");
    await writeStarted;
    completedMessages.splice(0, completedMessages.length, {
      id: "assistant-race",
      role: "assistant",
      content: "Aster settles into a confident smile.",
      swipe_id: 0,
    });
    eventHandlers.get("GENERATION_STARTED")?.({
      generationId: "generation-race",
      chatId: "chat-a",
    }, "user-a");
    eventHandlers.get("GENERATION_ENDED")?.({
      generationId: "generation-race",
      chatId: "chat-a",
      messageId: "assistant-race",
    }, "user-a");
    await new Promise((resolve) => setTimeout(resolve, 240));
    expect(generateQuiet).not.toHaveBeenCalled();

    releaseSettingsWrite();
    settingsWriteBarrier = null;
    settingsWriteStarted = null;
    await saveForAutomaticTrigger;
    await vi.waitFor(() => expect(generateQuiet).toHaveBeenCalledTimes(1), { timeout: 2_000 });
    expect(generateQuiet.mock.calls[0][0].parameters).toEqual(expect.objectContaining({
      model: "automatic-race-model",
    }));

    await handleFrontend({ type: "open-connections" }, "user-a");
    expect(openDrawerTab).toHaveBeenCalledWith("connections", { userId: "user-a" });

    completedMessages.splice(0, completedMessages.length, {
      id: "assistant-debug-low",
      role: "assistant",
      content: "Aster's visible state is uncertain.",
      swipe_id: 0,
    });
    generateQuiet.mockImplementationOnce(async () => ({
      provider: "openai",
      model: "automatic-race-model",
      reasoning: "The available expression is only weakly supported.",
      tool_calls: [{
        name: "set_stage_state",
        args: {
          focusedCharacterIds: ["character-a"],
          characters: [{
            characterId: "character-a",
            outfitName: automaticOutfit.name,
            expressionName: automaticExpression.name,
            confidence: 0.2,
          }],
        },
      }],
    }));
    sendToFrontend.mockClear();
    await handleFrontend({
      type: "analyze-now",
      requestId: "debug-low-confidence",
      chatId: "chat-a",
    }, "user-a");
    const rejectedDebugState = [...sendToFrontend.mock.calls]
      .reverse()
      .map(([message]) => message)
      .find((message) => message.type === "state" && message.state.detectorDebugRuns?.some(
        (run: { messageId: string; status: string }) => run.messageId === "assistant-debug-low" && run.status === "rejected",
      ));
    expect(rejectedDebugState?.state.detectorDebugRuns).toContainEqual(expect.objectContaining({
      messageId: "assistant-debug-low",
      status: "rejected",
      reasoning: "The available expression is only weakly supported.",
      outcome: expect.stringContaining("below the 70% confidence threshold"),
    }));

    completedMessages.splice(0, completedMessages.length, {
      id: "assistant-debug-malformed",
      role: "assistant",
      content: "Aster waits for a clear direction.",
      swipe_id: 0,
    });
    generateQuiet.mockImplementationOnce(async () => ({
      provider: "openai",
      model: "automatic-race-model",
      reasoning: "I could not produce the requested tool call.",
      content: "No structured decision available.",
    }));
    sendToFrontend.mockClear();
    await handleFrontend({
      type: "analyze-now",
      requestId: "debug-malformed-output",
      chatId: "chat-a",
    }, "user-a");
    const malformedDebugState = [...sendToFrontend.mock.calls]
      .reverse()
      .map(([message]) => message)
      .find((message) => message.type === "state" && message.state.detectorDebugRuns?.some(
        (run: { messageId: string; status: string }) => run.messageId === "assistant-debug-malformed" && run.status === "error",
      ));
    expect(malformedDebugState?.state.detectorDebugRuns).toContainEqual(expect.objectContaining({
      messageId: "assistant-debug-malformed",
      status: "error",
      reasoning: "I could not produce the requested tool call.",
      rawResponse: expect.objectContaining({ content: "No structured decision available." }),
      error: "The detector did not return a valid stage decision.",
    }));

    eventHandlers.get("CHAT_DELETED")?.({ chatId: "chat-a" }, "user-a");
    await new Promise((resolve) => setTimeout(resolve, 0));
    sendToFrontend.mockClear();
    await handleFrontend({ type: "ready", chatId: "chat-a", characterId: "character-a" }, "user-a");
    const stateAfterDelete = [...sendToFrontend.mock.calls]
      .reverse()
      .map(([message]) => message)
      .find((message) => message.type === "state");
    expect(stateAfterDelete?.state.detectorDebugRuns).toEqual([]);
  });
});

afterAll(() => {
  delete (globalThis as typeof globalThis & { spindle?: unknown }).spindle;
});
