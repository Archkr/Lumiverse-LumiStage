import type { CatalogEntry } from "./model";
import {
  SCHEMA_VERSION,
  type DetectionCharacterDecisionV2,
  type DetectionDecisionV2,
  type LumiStageSettingsV2,
} from "./types";

export interface DetectorResponse {
  content?: string | null;
  tool_calls?: Array<{ name: string; args: unknown }>;
  provider?: string;
  model?: string;
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

function normalizeCharacterDecision(value: unknown): DetectionCharacterDecisionV2 | null {
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

export function normalizeDecision(value: unknown): DetectionDecisionV2 | null {
  const raw = asRecord(value);
  if (!Array.isArray(raw.characters) || !Array.isArray(raw.focusedCharacterIds)) return null;
  const parsedCharacters = raw.characters.map(normalizeCharacterDecision);
  if (parsedCharacters.some((item) => !item)) return null;
  const characters = parsedCharacters as DetectionCharacterDecisionV2[];
  const focusValues = raw.focusedCharacterIds.filter(
    (item): item is string => typeof item === "string" && !!item,
  );
  if (focusValues.length !== raw.focusedCharacterIds.length || !characters.length) return null;
  const focusedCharacterIds = [...new Set(focusValues)];
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

export function parseDetectorResponse(response: DetectorResponse): DetectionDecisionV2 | null {
  const tool = response.tool_calls?.find((item) => item.name === "set_stage_state");
  if (tool) return normalizeDecision(tool.args);
  if (typeof response.content === "string") return normalizeDecision(parseJsonText(response.content));
  return null;
}

function characterSummary(entry: CatalogEntry): Record<string, unknown> {
  return {
    characterId: entry.characterId,
    name: entry.profile.characterName,
    outfits: entry.profile.outfits.map((outfit) => ({
      outfitId: outfit.id,
      name: outfit.name,
      expressions: outfit.expressions.map((expression) => ({
        expressionId: expression.id,
        name: expression.name,
        sprites: expression.variants.map((variant) => ({
          variantId: variant.id,
          fileName: variant.fileName,
          mediaKind: variant.mediaKind,
        })),
      })),
    })),
  };
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
): Record<string, unknown> {
  const system = [
    "You direct the visible character sprite stage after a completed roleplay reply.",
    "Choose only IDs present in the complete catalog. Never invent or rewrite an ID.",
    "The catalog contains every outfit folder, every expression, and every sprite filename.",
    "Choose the exact sprite variant whose filename and expression best match the visible emotion, action, and presentation.",
    "Outfits are ordinary selectable states and may change whenever the latest scene supports a different outfit.",
    "Classify all relevant group-chat characters in this one call and identify the visual focus.",
    "Return one complete outfit, expression, and exact sprite variant for every character you update.",
    "Confidence is 0..1 for the complete visible-state match.",
    `Catalog: ${JSON.stringify(catalog.map(characterSummary))}`,
    `Current states: ${JSON.stringify(currentStates)}`,
  ].join("\n");
  return {
    messages: [
      { role: "system", content: system },
      ...recentMessages.slice(-settings.detection.contextMessages),
      {
        role: "user",
        content: "Resolve the sprite stage for the latest assistant reply. Call set_stage_state exactly once.",
      },
    ],
    connection_id: settings.detection.connectionId ?? undefined,
    model: settings.detection.model ?? undefined,
    parameters: {
      temperature: settings.detection.temperature,
      max_tokens: 560,
    },
    tools: [{
      name: "set_stage_state",
      description: "Select focused characters and exact sprite variants for the latest reply.",
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
                "outfitId",
                "expressionId",
                "variantId",
                "confidence",
              ],
              properties: {
                characterId: { type: "string" },
                outfitId: { type: "string" },
                expressionId: { type: "string" },
                variantId: { type: "string" },
                confidence: { type: "number", minimum: 0, maximum: 1 },
              },
            },
          },
        },
      },
    }],
  };
}

export function validateDecision(
  decision: DetectionDecisionV2,
  catalog: CatalogEntry[],
): DetectionDecisionV2 {
  const entries = new Map(catalog.map((entry) => [entry.characterId, entry.profile]));
  const characters: DetectionCharacterDecisionV2[] = [];
  let invalid = false;
  for (const item of decision.characters) {
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
