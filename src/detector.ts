import { SCHEMA_VERSION, type DetectionActorDecision, type DetectionDecisionV1, type LumiStageSettingsV1 } from "./types";
import type { CatalogEntry } from "./model";

export interface DetectorResponse {
  content?: string;
  tool_calls?: Array<{ name?: string; args?: unknown }>;
  provider?: string;
  model?: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function confidence(value: unknown): number {
  const number = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return Math.min(1, Math.max(0, number));
}

function normalizeActorDecision(value: unknown): DetectionActorDecision | null {
  const raw = asRecord(value);
  const actorId = nullableString(raw.actorId);
  if (!actorId) return null;
  return {
    actorId,
    outfitId: nullableString(raw.outfitId),
    expressionId: nullableString(raw.expressionId),
    confidence: confidence(raw.confidence),
  };
}

export function normalizeDecision(value: unknown): DetectionDecisionV1 | null {
  const raw = asRecord(value);
  const actors = Array.isArray(raw.actors)
    ? raw.actors.map(normalizeActorDecision).filter((item): item is DetectionActorDecision => !!item)
    : [];
  const focusedActorIds = Array.isArray(raw.focusedActorIds)
    ? [...new Set(raw.focusedActorIds.filter((item): item is string => typeof item === "string" && !!item))]
    : [];
  if (actors.length === 0 && focusedActorIds.length === 0) return null;
  return { schemaVersion: SCHEMA_VERSION, focusedActorIds, actors };
}

function parseJsonText(value: string): unknown {
  const text = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
    }
    return null;
  }
}

export function parseDetectorResponse(response: DetectorResponse): DetectionDecisionV1 | null {
  const tool = response.tool_calls?.find((item) => item.name === "set_stage_state");
  if (tool) return normalizeDecision(tool.args);
  if (typeof response.content === "string") return normalizeDecision(parseJsonText(response.content));
  return null;
}

function nodeSummary(entry: CatalogEntry): Record<string, unknown> {
  return {
    actorId: entry.actor.id,
    name: entry.actor.name,
    aliases: entry.actor.aliases,
    outfits: entry.actor.outfits.filter((outfit) => outfit.enabled).map((outfit) => ({
      outfitId: outfit.id,
      name: outfit.name,
      aliases: outfit.aliases,
      allowAutoSwitch: outfit.allowAutoSwitch,
      expressions: outfit.expressions.filter((expression) => expression.enabled).map((expression) => ({
        expressionId: expression.id,
        name: expression.name,
        aliases: expression.aliases,
        cues: expression.cues,
        tags: expression.tags,
        sprites: expression.assets.map((asset) => ({
          fileName: asset.fileName,
          mediaKind: asset.mediaKind,
          enabled: asset.enabled,
        })),
      })),
    })),
  };
}

export function buildDetectorRequest(
  catalog: CatalogEntry[],
  recentMessages: Array<{ role: string; content: string }>,
  currentStates: Record<string, { outfitId: string | null; expressionId: string | null }>,
  settings: LumiStageSettingsV1,
): Record<string, unknown> {
  const catalogJson = JSON.stringify(catalog.map(nodeSummary));
  const currentJson = JSON.stringify(currentStates);
  const system = [
    "You direct a character sprite stage after a completed roleplay reply.",
    "Choose only IDs present in the supplied catalog. Never invent IDs.",
    "Identify every actor whose visible state materially changes and which actors are the visual focus.",
    "The complete wardrobe is supplied in this single catalog: every enabled outfit folder, every enabled expression, and every sprite filename inside each expression.",
    "Use outfit folder names, aliases, expression names, aliases, cues, tags, and sprite filenames together to choose the closest visible state.",
    "An outfit is an ordinary selectable state. Return its ID whenever the scene best matches it; no separate outfit-change cue exists.",
    "Expression means the complete sprite state inside the selected outfit, including facial emotion, body position, and action.",
    "If a dimension is not supported by the text, return null so the current stage state remains sticky.",
    "Confidence is 0..1 for the combined visible-state match.",
    `Catalog: ${catalogJson}`,
    `Current states: ${currentJson}`,
  ].join("\n");
  return {
    messages: [
      { role: "system", content: system },
      ...recentMessages.slice(-settings.detection.contextMessages),
      { role: "user", content: "Set the sprite stage for the latest assistant reply. Call set_stage_state exactly once." },
    ],
    connection_id: settings.detection.connectionId ?? undefined,
    model: settings.detection.model ?? undefined,
    parameters: {
      temperature: settings.detection.temperature,
      max_tokens: 420,
    },
    tools: [{
      name: "set_stage_state",
      description: "Select focused actors and valid layered sprite states for the latest assistant reply.",
      parameters: {
        type: "object",
        additionalProperties: false,
        required: ["focusedActorIds", "actors"],
        properties: {
          focusedActorIds: { type: "array", items: { type: "string" } },
          actors: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["actorId", "outfitId", "expressionId", "confidence"],
              properties: {
                actorId: { type: "string" },
                outfitId: { type: ["string", "null"] },
                expressionId: { type: ["string", "null"] },
                confidence: { type: "number", minimum: 0, maximum: 1 },
              },
            },
          },
        },
      },
    }],
  };
}

export function validateDecision(decision: DetectionDecisionV1, catalog: CatalogEntry[]): DetectionDecisionV1 {
  const actors = new Map(catalog.map((entry) => [entry.actor.id, entry.actor]));
  const validActors: DetectionActorDecision[] = [];
  for (const item of decision.actors) {
    const actor = actors.get(item.actorId);
    if (!actor) continue;
    const outfit = item.outfitId ? actor.outfits.find((candidate) => candidate.id === item.outfitId && candidate.enabled) : null;
    const expression = item.expressionId
      ? (outfit?.expressions ?? actor.outfits.flatMap((candidate) => candidate.expressions))
        .find((candidate) => candidate.id === item.expressionId && candidate.enabled)
      : null;
    validActors.push({
      ...item,
      outfitId: outfit?.id ?? null,
      expressionId: expression?.id ?? null,
    });
  }
  return {
    schemaVersion: SCHEMA_VERSION,
    focusedActorIds: decision.focusedActorIds.filter((actorId) => actors.has(actorId)),
    actors: validActors,
  };
}
