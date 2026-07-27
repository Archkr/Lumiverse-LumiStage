import { unzipSync } from "fflate";
import { cleanName, createId, normalizedKey } from "./ids";
import { allAssets, createActor, createOutfit, createExpression, normalizeProfile } from "./model";
import type {
  ActorProfile,
  CharacterProfileV1,
  ExpressionState,
  ImportLayout,
  OutfitFolder,
  StageAsset,
  LumiStageArchiveV1,
} from "./types";

export const MAX_ARCHIVE_BYTES = 250 * 1024 * 1024;
export const MAX_EXPANDED_BYTES = 1024 * 1024 * 1024;
export const MAX_ENTRY_COUNT = 5000;
export const MAX_IMAGE_BYTES = 25 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

const MIME_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  webm: "video/webm",
  mp4: "video/mp4",
};

export function assertArchiveBudget(entryCount: number, expandedBytes: number): void {
  if (entryCount > MAX_ENTRY_COUNT) {
    throw new Error(`Archive contains more than ${MAX_ENTRY_COUNT} supported files.`);
  }
  if (expandedBytes > MAX_EXPANDED_BYTES) {
    throw new Error(`Archive expands beyond ${MAX_EXPANDED_BYTES} bytes.`);
  }
}

export interface ImportCandidate {
  path: string;
  fileName: string;
  bytes: Uint8Array;
  mimeType: string;
  segments: string[];
}

export interface ImportTarget {
  actorName: string;
  outfitName: string;
  expressionName: string;
}

export function normalizedArchivePath(value: string): string | null {
  const path = value.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!path || path.endsWith("/")) return null;
  const parts = path.split("/");
  if (parts.some((part) => !part || part === "." || part === ".." || part.includes("\0"))) return null;
  if (parts[0] === "__MACOSX" || parts.some((part) => part.startsWith("."))) return null;
  return parts.join("/");
}

export function mimeForName(name: string): string | null {
  const extension = name.split(".").pop()?.toLocaleLowerCase() ?? "";
  return MIME_TYPES[extension] ?? null;
}

export function importTarget(
  candidate: Pick<ImportCandidate, "segments" | "fileName">,
  layout: ImportLayout,
  defaultActorName: string,
): ImportTarget {
  const folders = candidate.segments.map((segment) => cleanName(segment));
  const expression = cleanName(candidate.fileName, "Neutral");
  if (layout === "actor-outfit-expression") {
    return {
      actorName: folders[0] ?? defaultActorName,
      outfitName: folders[1] ?? "Default",
      expressionName: expression,
    };
  }
  return {
    actorName: defaultActorName,
    outfitName: folders[0] ?? "Default",
    expressionName: expression,
  };
}

export function assertUnambiguousCandidates(
  candidates: ImportCandidate[],
  layout: ImportLayout,
  defaultActorName: string,
): void {
  const paths = new Map<string, string>();
  const destinations = new Map<string, string>();
  const conflicts: string[] = [];
  for (const candidate of candidates) {
    const pathKey = candidate.path.normalize("NFKC").toLocaleLowerCase();
    const priorPath = paths.get(pathKey);
    if (priorPath) conflicts.push(`${priorPath} conflicts with ${candidate.path}`);
    else paths.set(pathKey, candidate.path);

    const target = importTarget(candidate, layout, defaultActorName);
    const destinationKey = [
      target.actorName,
      target.outfitName,
      target.expressionName,
      candidate.fileName,
    ].map(normalizedKey).join("/");
    const priorDestination = destinations.get(destinationKey);
    if (priorDestination && priorDestination !== candidate.path) {
      conflicts.push(`${priorDestination} and ${candidate.path} resolve to the same destination`);
    } else {
      destinations.set(destinationKey, candidate.path);
    }
  }
  if (conflicts.length) {
    throw new Error(`Ambiguous import collisions: ${[...new Set(conflicts)].slice(0, 8).join("; ")}`);
  }
}

export function extractArchive(bytes: Uint8Array): { candidates: ImportCandidate[]; errors: string[] } {
  if (bytes.byteLength > MAX_ARCHIVE_BYTES) throw new Error(`Archive exceeds ${MAX_ARCHIVE_BYTES} bytes.`);
  let expandedBytes = 0;
  let acceptedCount = 0;
  const rejected = new Map<string, string>();
  const unzipped = unzipSync(bytes, {
    filter(info) {
      const path = normalizedArchivePath(info.name);
      if (!path) return false;
      const mimeType = mimeForName(path);
      if (!mimeType) return false;
      acceptedCount += 1;
      expandedBytes += info.originalSize;
      const limit = mimeType.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
      if (info.originalSize > limit) {
        rejected.set(path, `File exceeds ${limit} bytes.`);
        return false;
      }
      assertArchiveBudget(acceptedCount, expandedBytes);
      return true;
    },
  });

  const candidates: ImportCandidate[] = [];
  const errors = [...rejected].map(([path, reason]) => `${path}: ${reason}`);
  for (const [rawPath, data] of Object.entries(unzipped)) {
    const path = normalizedArchivePath(rawPath);
    if (!path || data.byteLength === 0) continue;
    const mimeType = mimeForName(path);
    if (!mimeType) continue;
    const parts = path.split("/");
    const rawFileName = parts.pop() ?? path;
    candidates.push({
      path,
      fileName: rawFileName,
      bytes: data,
      mimeType,
      segments: parts,
    });
  }
  return { candidates, errors };
}

export function readLumiStageManifest(bytes: Uint8Array): LumiStageArchiveV1 | null {
  let manifestBytes: Uint8Array | null = null;
  const data = unzipSync(bytes, {
    filter(info) {
      const path = normalizedArchivePath(info.name);
      if (path !== "manifest.json") return false;
      if (info.originalSize > 5 * 1024 * 1024) throw new Error("LumiStage manifest exceeds 5 MB.");
      return true;
    },
  });
  manifestBytes = data["manifest.json"] ?? null;
  if (!manifestBytes) return null;
  try {
    const parsed = JSON.parse(new TextDecoder().decode(manifestBytes)) as LumiStageArchiveV1;
    if (parsed?.kind !== "lumistage-archive" || parsed.schemaVersion !== 1 || !parsed.profile || !Array.isArray(parsed.assets)) {
      throw new Error("Unsupported LumiStage archive manifest.");
    }
    return parsed;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Invalid LumiStage manifest.");
  }
}

export function directCandidate(fileName: string, bytes: Uint8Array, mimeTypeHint?: string): ImportCandidate {
  const path = normalizedArchivePath(fileName);
  if (!path) throw new Error("The selected file has an unsafe path.");
  const mimeType = mimeForName(path) ?? (mimeTypeHint && /^(?:image|video)\//.test(mimeTypeHint) ? mimeTypeHint : null);
  if (!mimeType) throw new Error(`${fileName} is not a supported image or video.`);
  const limit = mimeType.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (bytes.byteLength > limit) throw new Error(`${fileName} exceeds ${limit} bytes.`);
  const segments = path.split("/");
  const leaf = segments.pop() ?? fileName;
  return { path, fileName: leaf, bytes, mimeType, segments };
}

function findOrCreateActor(profile: CharacterProfileV1, name: string): ActorProfile {
  const key = normalizedKey(name);
  let actor = profile.actors.find((item) => normalizedKey(item.name) === key || item.aliases.some((alias) => normalizedKey(alias) === key));
  if (!actor) {
    actor = createActor(name);
    actor.outfits = [];
    actor.defaultOutfitId = null;
    actor.order = profile.actors.length;
    profile.actors.push(actor);
    profile.defaultActorId ??= actor.id;
  }
  return actor;
}

function findOrCreateOutfit(actor: ActorProfile, name: string): OutfitFolder {
  const key = normalizedKey(name);
  let outfit = actor.outfits.find((item) => normalizedKey(item.name) === key);
  if (!outfit) {
    outfit = createOutfit(name);
    outfit.expressions = [];
    outfit.defaultExpressionId = null;
    outfit.order = actor.outfits.length;
    actor.outfits.push(outfit);
    actor.defaultOutfitId ??= outfit.id;
  }
  return outfit;
}

function findOrCreateExpression(outfit: OutfitFolder, name: string): ExpressionState {
  const key = normalizedKey(name);
  let expression = outfit.expressions.find((item) => normalizedKey(item.name) === key);
  if (!expression) {
    expression = createExpression(name);
    expression.order = outfit.expressions.length;
    outfit.expressions.push(expression);
    outfit.defaultExpressionId ??= expression.id;
  }
  return expression;
}

export interface ImportedAsset {
  target: ImportTarget;
  imageId: string;
  contentHash: string;
  fileName: string;
  mimeType: string;
}

export interface PreparedImport {
  candidate: ImportCandidate;
  hash: string;
}

export interface HostUploadResult {
  id?: string;
  error?: string;
}

export function settleHostUploads(
  prepared: PreparedImport[],
  results: HostUploadResult[],
  layout: ImportLayout,
  defaultActorName: string,
): {
  imported: ImportedAsset[];
  uploadedByPath: Map<string, { imageId: string; contentHash: string; fileName: string; mimeType: string }>;
  errors: string[];
} {
  const imported: ImportedAsset[] = [];
  const uploadedByPath = new Map<string, { imageId: string; contentHash: string; fileName: string; mimeType: string }>();
  const errors: string[] = [];
  for (let index = 0; index < prepared.length; index += 1) {
    const result = results[index];
    const item = prepared[index];
    if (!result?.id) {
      errors.push(`${item.candidate.path}: ${result?.error ?? "Upload failed."}`);
      continue;
    }
    const uploaded = {
      imageId: result.id,
      contentHash: item.hash,
      fileName: item.candidate.fileName,
      mimeType: item.candidate.mimeType,
    };
    uploadedByPath.set(item.candidate.path, uploaded);
    imported.push({
      target: importTarget(item.candidate, layout, defaultActorName),
      ...uploaded,
    });
  }
  return { imported, uploadedByPath, errors };
}

export function mergeImportedAssets(
  source: CharacterProfileV1,
  imported: ImportedAsset[],
  characterName: string,
  now = Date.now(),
): { profile: CharacterProfileV1; imported: number; skipped: number } {
  const profile = normalizeProfile(structuredClone(source), source.characterId, characterName, now);
  const hashes = new Set(allAssets(profile).map((asset) => asset.contentHash));
  let importedCount = 0;
  let skipped = 0;
  for (const item of imported) {
    if (hashes.has(item.contentHash)) {
      skipped += 1;
      continue;
    }
    const actor = findOrCreateActor(profile, item.target.actorName);
    const outfit = findOrCreateOutfit(actor, item.target.outfitName);
    const expression = findOrCreateExpression(outfit, item.target.expressionName);
    const asset: StageAsset = {
      id: createId("asset"),
      imageId: item.imageId,
      contentHash: item.contentHash,
      fileName: item.fileName,
      mimeType: item.mimeType,
      mediaKind: item.mimeType.startsWith("video/") ? "video" : "image",
      enabled: true,
      priority: 0,
      createdAt: now,
    };
    expression.assets.push(asset);
    hashes.add(item.contentHash);
    importedCount += 1;
  }
  profile.revision += 1;
  profile.updatedAt = now;
  return { profile, imported: importedCount, skipped };
}

export function hydrateArchiveProfile(
  archive: LumiStageArchiveV1,
  characterId: string,
  characterName: string,
  uploadedByPath: Map<string, { imageId: string; contentHash: string; fileName: string; mimeType: string }>,
  now = Date.now(),
): CharacterProfileV1 {
  const profile = normalizeProfile(
    { ...structuredClone(archive.profile), characterId, characterName, revision: 0, updatedAt: now },
    characterId,
    characterName,
    now,
  );
  const pathsByAssetId = new Map(archive.assets.map((entry) => [entry.asset.id, entry.path]));
  for (const actor of profile.actors) for (const outfit of actor.outfits) {
    for (const expression of outfit.expressions) {
      expression.assets = expression.assets.flatMap((asset) => {
        const path = pathsByAssetId.get(asset.id);
        const upload = path ? uploadedByPath.get(path) : null;
        if (!upload) return [];
        return [{
          ...asset,
          imageId: upload.imageId,
          contentHash: upload.contentHash,
          fileName: upload.fileName,
          mimeType: upload.mimeType,
          mediaKind: upload.mimeType.startsWith("video/") ? "video" as const : "image" as const,
          createdAt: now,
        }];
      });
    }
  }
  profile.revision = 1;
  return profile;
}

export function removeAssets(profile: CharacterProfileV1, assetIds: Set<string>, now = Date.now()): CharacterProfileV1 {
  const next = structuredClone(profile);
  for (const actor of next.actors) for (const outfit of actor.outfits) {
    for (const expression of outfit.expressions) expression.assets = expression.assets.filter((asset) => !assetIds.has(asset.id));
  }
  next.revision += 1;
  next.updatedAt = now;
  return next;
}

export function assetReferenceCount(profiles: CharacterProfileV1[], imageId: string): number {
  return profiles.reduce((sum, profile) => sum + allAssets(profile).filter((asset) => asset.imageId === imageId).length, 0);
}

export function unreferencedImageIds(profiles: CharacterProfileV1[], candidateImageIds: Iterable<string>): string[] {
  return [...new Set(candidateImageIds)].filter((imageId) => assetReferenceCount(profiles, imageId) === 0);
}
