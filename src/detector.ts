import type { CatalogEntry } from "./model";
import {
  SCHEMA_VERSION,
  type DetectionCharacterDecisionV2,
  type DetectionDecisionV2,
  type LumiStageSettingsV2,
  type ManualOverrideV2,
} from "./types";

export interface DetectorResponse {
  content?: string | null;
  tool_calls?: Array<{ name: string; args: unknown }>;
  provider?: string;
  model?: string;
  usage?: {
    prompt_tokens?: number;
    input_tokens?: number;
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function requiredString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function confidence(value: unknown): number {
  const number = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return Math.min(1, Math.max(0, number));
}

function legacyCharacterDecision(value: unknown): DetectionCharacterDecisionV2 | null {
  const raw = asRecord(value);
  const characterId = requiredString(raw.characterId);
  const outfitId = requiredString(raw.outfitId);
  const expressionId = requiredString(raw.expressionId);
  const variantId = requiredString(raw.variantId);
  if (!characterId || !outfitId || !expressionId || !variantId) return null;
  return {
    characterId,
    outfitId,
    expressionId,
    variantId,
    confidence: confidence(raw.confidence),
  };
}

function normalizedKey(value: string): string {
  return value.normalize("NFKC").trim().toLocaleLowerCase();
}

function selector(value: unknown, keys: string[]): string | null {
  const raw = asRecord(value);
  for (const key of keys) {
    const selected = requiredString(raw[key]);
    if (selected) return selected;
  }
  return null;
}

function resolveCharacterId(value: string, catalog: CatalogEntry[]): string | null {
  const exact = catalog.find((entry) => entry.characterId === value);
  if (exact) return exact.characterId;
  const key = normalizedKey(value);
  const named = catalog.filter((entry) => normalizedKey(entry.profile.characterName) === key);
  return named.length === 1 ? named[0].characterId : null;
}

function resolveCharacterDecision(
  value: unknown,
  catalog: CatalogEntry[],
): DetectionCharacterDecisionV2 | null {
  const raw = asRecord(value);
  const characterSelector = selector(raw, ["characterId", "character", "characterName"]);
  const fileSelector = selector(raw, ["fileName", "spriteFileName", "sprite", "variantId"]);
  if (!characterSelector || !fileSelector) return null;
  const characterId = resolveCharacterId(characterSelector, catalog);
  const entry = catalog.find((candidate) => candidate.characterId === characterId);
  if (!entry) return null;

  const rawParts = fileSelector.replace(/\\/g, "/").split("/").filter(Boolean);
  const selectedFileName = rawParts.at(-1) ?? fileSelector;
  const outfitHint = selector(raw, ["outfitName", "outfit", "outfitId"])
    ?? (rawParts.length >= 3 ? rawParts.at(-3) ?? null : null);
  const expressionHint = selector(raw, ["expressionName", "expression", "expressionId"])
    ?? (rawParts.length >= 2 ? rawParts.at(-2) ?? null : null);
  const locations = entry.profile.outfits.flatMap((outfit) =>
    outfit.expressions.flatMap((expression) =>
      expression.variants.map((variant) => ({ outfit, expression, variant }))
    )
  );
  const direct = locations.find(({ variant }) => variant.id === fileSelector);
  let matches = direct
    ? [direct]
    : locations.filter(({ variant }) => normalizedKey(variant.fileName) === normalizedKey(selectedFileName));
  if (matches.length > 1 && outfitHint) {
    const key = normalizedKey(outfitHint);
    const narrowed = matches.filter(({ outfit }) =>
      outfit.id === outfitHint || normalizedKey(outfit.name) === key
    );
    if (narrowed.length) matches = narrowed;
  }
  if (matches.length > 1 && expressionHint) {
    const key = normalizedKey(expressionHint);
    const narrowed = matches.filter(({ expression }) =>
      expression.id === expressionHint || normalizedKey(expression.name) === key
    );
    if (narrowed.length) matches = narrowed;
  }
  if (matches.length !== 1) return null;
  const [{ outfit, expression, variant }] = matches;
  return {
    characterId: entry.characterId,
    outfitId: outfit.id,
    expressionId: expression.id,
    variantId: variant.id,
    confidence: confidence(raw.confidence),
  };
}

export function normalizeDecision(
  value: unknown,
  catalog: CatalogEntry[] = [],
): DetectionDecisionV2 | null {
  const raw = asRecord(value);
  if (!Array.isArray(raw.characters) || !Array.isArray(raw.focusedCharacterIds)) return null;
  const parsedCharacters = raw.characters.map((item) =>
    catalog.length ? resolveCharacterDecision(item, catalog) : legacyCharacterDecision(item)
  );
  if (parsedCharacters.some((item) => !item)) return null;
  const characters = parsedCharacters as DetectionCharacterDecisionV2[];
  const focusValues = raw.focusedCharacterIds.map((item) =>
    typeof item === "string" && item
      ? catalog.length ? resolveCharacterId(item, catalog) : item
      : null
  );
  if (focusValues.some((item) => !item) || !characters.length) return null;
  const focusedCharacterIds = [...new Set(focusValues as string[])];
  return { schemaVersion: SCHEMA_VERSION, focusedCharacterIds, characters };
}

function parseJsonText(value: string): unknown {
  const text = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start < 0 || end <= start) return null;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

export function parseDetectorResponse(
  response: DetectorResponse,
  catalog: CatalogEntry[] = [],
): DetectionDecisionV2 | null {
  const tool = response.tool_calls?.find((item) => item.name === "set_stage_state");
  if (tool) return normalizeDecision(tool.args, catalog);
  if (typeof response.content === "string") return normalizeDecision(parseJsonText(response.content), catalog);
  return null;
}

function characterSummary(entry: CatalogEntry): Record<string, unknown> {
  return {
    characterId: entry.characterId,
    name: entry.profile.characterName,
    outfits: entry.profile.outfits.map((outfit) => ({
      outfitName: outfit.name,
      expressions: outfit.expressions.map((expression) => ({
        expressionName: expression.name,
        files: expression.variants.map((variant) => variant.fileName),
      })),
    })),
  };
}

export function constrainCatalogToManualOverrides(
  catalog: CatalogEntry[],
  overrides: Record<string, ManualOverrideV2>,
): CatalogEntry[] {
  return catalog.map((entry) => {
    const override = overrides[entry.characterId];
    if (!override?.outfitId) return entry;
    const outfit = entry.profile.outfits.find((candidate) => candidate.id === override.outfitId);
    if (!outfit) return entry;

    if (override.lock === "outfit") {
      return {
        ...entry,
        profile: {
          ...entry.profile,
          defaultOutfitId: outfit.id,
          outfits: [outfit],
        },
      };
    }

    const expression = outfit.expressions.find(
      (candidate) => candidate.id === override.expressionId,
    );
    const variant = expression?.variants.find(
      (candidate) => candidate.id === override.variantId,
    );
    if (!expression || !variant) return entry;
    return {
      ...entry,
      profile: {
        ...entry.profile,
        defaultOutfitId: outfit.id,
        outfits: [{
          ...outfit,
          defaultExpressionId: expression.id,
          expressions: [{
            ...expression,
            variants: [variant],
          }],
        }],
      },
    };
  });
}

function stateSummary(
  catalog: CatalogEntry[],
  states: Record<string, {
    outfitId: string | null;
    expressionId: string | null;
    variantId: string | null;
  }>,
): Array<Record<string, unknown>> {
  return Object.entries(states).flatMap(([characterId, state]) => {
    const profile = catalog.find((entry) => entry.characterId === characterId)?.profile;
    const outfit = profile?.outfits.find((item) => item.id === state.outfitId);
    const expression = outfit?.expressions.find((item) => item.id === state.expressionId);
    const variant = expression?.variants.find((item) => item.id === state.variantId);
    return profile && outfit && expression
      ? [{
          characterId,
          outfitName: outfit.name,
          expressionName: expression.name,
          fileName: variant?.fileName ?? null,
        }]
      : [];
  });
}

function overrideSummary(
  catalog: CatalogEntry[],
  overrides: Record<string, ManualOverrideV2>,
): Array<Record<string, unknown>> {
  return Object.values(overrides).flatMap((override) => {
    const profile = catalog.find((entry) => entry.characterId === override.characterId)?.profile;
    const outfit = profile?.outfits.find((item) => item.id === override.outfitId);
    const expression = outfit?.expressions.find((item) => item.id === override.expressionId);
    const variant = expression?.variants.find((item) => item.id === override.variantId);
    if (!profile || !outfit) return [];
    const lockedOutfit = {
      characterId: override.characterId,
      scope: override.scope,
      lock: override.lock,
      outfitName: outfit.name,
    };
    return override.lock === "outfit"
      ? [lockedOutfit]
      : [{
          ...lockedOutfit,
          expressionName: expression?.name ?? null,
          fileName: variant?.fileName ?? null,
        }];
  });
}

export function buildDetectorRequest(
  catalog: CatalogEntry[],
  recentMessages: Array<{ role: string; content: string }>,
  currentStates: Record<string, {
    outfitId: string | null;
    expressionId: string | null;
    variantId: string | null;
  }>,
  settings: LumiStageSettingsV2,
  overrides: Record<string, ManualOverrideV2> = {},
  enforceBudget = true,
): Record<string, unknown> {
  const detectorCatalog = constrainCatalogToManualOverrides(catalog, overrides);
  const system = [
    "You direct the visible character sprite stage after a completed roleplay reply.",
    "For each updated character, copy one exact fileName (including its extension) from the chosen catalog expression.",
    "The fileName is authoritative. Never invent a filename and never substitute a label such as Character / Outfit / Emotion.",
    "Return outfitName and expressionName exactly as listed so duplicate filenames can be resolved inside the right folder.",
    "Outfits are selectable visual states. You may switch away from the current outfit whenever the completed scene supports another outfit.",
    "Current states are context, not locks. Only entries under Manual locks constrain outfit or sprite selection.",
    "An outfit lock fixes only outfitName. Within that outfit, choose any listed expressionName and exact fileName that matches the completed scene.",
    "A state lock fixes the exact outfitName, expressionName, and fileName until it is cleared.",
    "Classify all relevant group-chat characters in this one call and identify the visual focus.",
    "Use the exact characterId from the catalog for each character and focusedCharacterIds entry.",
    "Confidence is 0..1 for the complete visible-state match.",
    `Catalog: ${JSON.stringify(detectorCatalog.map(characterSummary))}`,
    `Current states: ${JSON.stringify(stateSummary(detectorCatalog, currentStates))}`,
    `Manual locks: ${JSON.stringify(overrideSummary(detectorCatalog, overrides))}`,
  ].join("\n");
  const messages = [
    { role: "system", content: system },
    ...recentMessages.slice(-settings.detection.contextMessages),
    {
      role: "user",
      content: "Resolve the sprite stage for the latest assistant reply. Call set_stage_state exactly once.",
    },
  ];
  const tools = [{
    name: "set_stage_state",
    description: "Select the exact sprite filename and its outfit/expression folder for each visible character.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["focusedCharacterIds", "characters"],
      properties: {
        focusedCharacterIds: { type: "array", items: { type: "string" } },
        characters: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: [
              "characterId",
              "outfitName",
              "expressionName",
              "fileName",
              "confidence",
            ],
            properties: {
              characterId: { type: "string" },
              outfitName: { type: "string" },
              expressionName: { type: "string" },
              fileName: {
                type: "string",
                description: "Exact filename copied from the selected catalog expression, including extension.",
              },
              confidence: { type: "number", minimum: 0, maximum: 1 },
            },
          },
        },
      },
    },
  }];
  const estimatedInputTokens = Math.ceil((
    messages.reduce((sum, message) => sum + message.role.length + message.content.length, 0)
    + JSON.stringify(tools).length
  ) / 4);
  if (enforceBudget && estimatedInputTokens > 24_000) {
    throw new Error(
      `The detector catalog and context are too large (${estimatedInputTokens} estimated input tokens; limit 24000).`,
    );
  }
  return {
    estimatedInputTokens,
    messages,
    connection_id: settings.detection.connectionId ?? undefined,
    parameters: {
      temperature: settings.detection.temperature,
      max_tokens: settings.detection.maxOutputTokens,
      ...(settings.detection.model ? { model: settings.detection.model } : {}),
    },
    reasoning: { source: "off" },
    tools,
  };
}

export function validateDecision(
  decision: DetectionDecisionV2,
  catalog: CatalogEntry[],
): DetectionDecisionV2 {
  const entries = new Map(catalog.map((entry) => [entry.characterId, entry.profile]));
  const characters: DetectionCharacterDecisionV2[] = [];
  const seenCharacterIds = new Set<string>();
  let invalid = false;
  for (const item of decision.characters) {
    if (seenCharacterIds.has(item.characterId)) {
      invalid = true;
      break;
    }
    seenCharacterIds.add(item.characterId);
    const profile = entries.get(item.characterId);
    const outfit = profile?.outfits.find((candidate) => candidate.id === item.outfitId);
    const expression = outfit?.expressions.find(
      (candidate) => candidate.id === item.expressionId,
    );
    const variant = expression?.variants.find((candidate) => candidate.id === item.variantId);
    if (!profile || !outfit || !expression || !variant) {
      invalid = true;
      break;
    }
    characters.push(item);
  }
  const focusedCharacterIds = decision.focusedCharacterIds.filter((id) => entries.has(id));
  if (focusedCharacterIds.length !== decision.focusedCharacterIds.length) invalid = true;
  return {
    schemaVersion: SCHEMA_VERSION,
    focusedCharacterIds: invalid ? [] : focusedCharacterIds,
    characters: invalid ? [] : characters,
  };
}
