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
  random: () => number,
): DetectionCharacterDecisionV2 | null {
  const raw = asRecord(value);
  const characterSelector = selector(raw, ["characterId", "character", "characterName"]);
  const outfitSelector = selector(raw, ["outfitName", "outfit", "outfitId"]);
  const expressionSelector = selector(raw, ["expressionName", "expression", "expressionId"]);
  if (!characterSelector || !outfitSelector || !expressionSelector) return null;
  const characterId = resolveCharacterId(characterSelector, catalog);
  const entry = catalog.find((candidate) => candidate.characterId === characterId);
  if (!entry) return null;
  const outfitKey = normalizedKey(outfitSelector);
  const outfits = entry.profile.outfits.filter(
    (outfit) =>
      outfit.id === outfitSelector
      || normalizedKey(outfit.name) === outfitKey,
  );
  if (outfits.length !== 1) return null;
  const [outfit] = outfits;
  const expressionKey = normalizedKey(expressionSelector);
  const expressions = outfit.expressions.filter(
    (expression) =>
      expression.id === expressionSelector
      || normalizedKey(expression.name) === expressionKey,
  );
  if (expressions.length !== 1 || expressions[0].variants.length === 0) return null;
  const [expression] = expressions;
  const roll = random();
  const normalizedRoll = Number.isFinite(roll)
    ? Math.max(0, Math.min(0.9999999999999999, roll))
    : 0;
  const variant = expression.variants[
    Math.floor(normalizedRoll * expression.variants.length)
  ];
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
  random: () => number = Math.random,
): DetectionDecisionV2 | null {
  const raw = asRecord(value);
  if (!Array.isArray(raw.characters) || !Array.isArray(raw.focusedCharacterIds)) return null;
  const parsedCharacters = raw.characters.map((item) =>
    catalog.length ? resolveCharacterDecision(item, catalog, random) : legacyCharacterDecision(item)
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
  random: () => number = Math.random,
): DetectionDecisionV2 | null {
  const tool = response.tool_calls?.find((item) => item.name === "set_stage_state");
  if (tool) return normalizeDecision(tool.args, catalog, random);
  if (typeof response.content === "string") {
    return normalizeDecision(parseJsonText(response.content), catalog, random);
  }
  return null;
}

function characterSummary(entry: CatalogEntry): Record<string, unknown> {
  return {
    characterId: entry.characterId,
    name: entry.profile.characterName,
    outfits: entry.profile.outfits.flatMap((outfit) => {
      const expressions = outfit.expressions
        .filter((expression) => expression.variants.length > 0)
        .map((expression) => ({ expressionName: expression.name }));
      return expressions.length ? [{ outfitName: outfit.name, expressions }] : [];
    }),
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
    return profile && outfit && expression
      ? [{
          characterId,
          outfitName: outfit.name,
          expressionName: expression.name,
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
    "Catalog expressionName values are general visible sprite states, not an emotion-only taxonomy.",
    "A state may describe facial emotion, full-body pose or posture, an activity or prop use, interaction or relative positioning with another character, physical condition, transformation, or narrative sequence/context.",
    "Examples include states such as \"drinking coffee\", \"after the fight\", or \"straddling another character\"; interpret every label from the perspective of the character who owns that catalog.",
    "Select the most specific expressionName directly supported by the completed scene, preferring a matching pose, action, interaction, condition, or contextual state over a generic mood such as happy or sad.",
    "For compound, relational, and sequence states, require every material part of the label to be supported: the action or pose, the other participant when named or implied, and ordering such as before/after. Do not select one merely because its emotional tone fits.",
    "For each updated character, return one exact outfitName and expressionName copied from the catalog.",
    "Variants and filenames are intentionally hidden from you. LumiStage randomly selects an eligible variant after you choose the expression.",
    "Outfits are selectable visual states. You may switch away from the current outfit whenever the completed scene supports another outfit.",
    "Current states are context, not locks. Only entries under Manual locks constrain outfit or sprite selection.",
    "An outfit lock fixes only outfitName. Within that outfit, choose any listed expressionName that matches the completed scene.",
    "A state lock fixes the exact outfitName and expressionName until it is cleared; LumiStage separately preserves its exact locked variant.",
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
      content: "Resolve the sprite stage for the latest assistant reply using the most specific scene-supported visible state for each character. Call set_stage_state exactly once.",
    },
  ];
  const tools = [{
    name: "set_stage_state",
    description: "Select each visible character's outfit and catalog expression, including poses, actions, interactions, conditions, and contextual states as well as emotions.",
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
              "confidence",
            ],
            properties: {
              characterId: { type: "string" },
              outfitName: { type: "string" },
              expressionName: {
                type: "string",
                description: "Exact catalog state label. It may represent an emotion, pose, action, interaction, condition, transformation, or sequence/context.",
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
