import { unzip, unzipSync } from "fflate";
import { cleanName, createId, normalizedKey } from "./ids";
import {
  allVariants,
  createExpression,
  createOutfit,
  normalizeProfile,
} from "./model";
import type {
  CharacterProfileV2,
  ExpressionSlotV2,
  ImportLayoutV2,
  LumiStageArchiveV2,
  OutfitFolderV2,
  StageVariantV2,
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

export interface ImportTargetV2 {
  outfitName: string;
  expressionName: string;
}

export function normalizedArchivePath(value: string): string | null {
  const path = value.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!path || path.endsWith("/")) return null;
  const parts = path.split("/");
  if (parts.some((part) => !part || part === "." || part === ".." || part.includes("\0"))) {
    return null;
  }
  if (parts[0] === "__MACOSX" || parts.some((part) => part.startsWith("."))) return null;
  return parts.join("/");
}

export function mimeForName(name: string): string | null {
  const extension = name.split(".").pop()?.toLocaleLowerCase() ?? "";
  return MIME_TYPES[extension] ?? null;
}

export function importTarget(
  candidate: Pick<ImportCandidate, "segments" | "fileName">,
  layout: ImportLayoutV2,
): ImportTargetV2 {
  const folders = candidate.segments.map((segment) => cleanName(segment));
  const leafExpression = cleanName(candidate.fileName, "Neutral");
  if (layout === "outfit-expression-variant") {
    return {
      outfitName: folders[0] ?? "Default",
      expressionName: folders[1] ?? leafExpression,
    };
  }
  if (layout === "outfit-expression") {
    return {
      outfitName: folders[0] ?? "Default",
      expressionName: leafExpression,
    };
  }
  if (folders.length >= 2) {
    return { outfitName: folders[0], expressionName: folders[1] };
  }
  return {
    outfitName: folders[0] ?? "Default",
    expressionName: leafExpression,
  };
}

export function assertUnambiguousCandidates(
  candidates: ImportCandidate[],
  layout: ImportLayoutV2,
): void {
  const paths = new Map<string, string>();
  const destinations = new Map<string, string>();
  const conflicts: string[] = [];
  for (const candidate of candidates) {
    if (candidate.segments.length > 2) {
      conflicts.push(`${candidate.path} is deeper than Outfit/Expression/Variant.ext`);
      continue;
    }
    const pathKey = candidate.path.normalize("NFKC").toLocaleLowerCase();
    const priorPath = paths.get(pathKey);
    if (priorPath) conflicts.push(`${priorPath} conflicts with ${candidate.path}`);
    else paths.set(pathKey, candidate.path);

    const target = importTarget(candidate, layout);
    const destinationKey = [
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
    throw new Error(
      `Ambiguous import collisions: ${[...new Set(conflicts)].slice(0, 8).join("; ")}`,
    );
  }
}

export function extractArchive(bytes: Uint8Array): {
  candidates: ImportCandidate[];
  errors: string[];
} {
  if (bytes.byteLength > MAX_ARCHIVE_BYTES) {
    throw new Error(`Archive exceeds ${MAX_ARCHIVE_BYTES} bytes.`);
  }
  let expandedBytes = 0;
  let acceptedCount = 0;
  const rejected = new Map<string, string>();
  const unzipped = unzipSync(bytes, {
    filter(info) {
      const path = normalizedArchivePath(info.name);
      if (!path || path === "manifest.json") return false;
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

export type ReadableLumiStageArchive = LumiStageArchiveV2 | {
  schemaVersion: 1;
  kind: "lumistage-archive";
  profile: unknown;
  assets: unknown[];
};

export function readLumiStageManifest(bytes: Uint8Array): ReadableLumiStageArchive | null {
  const data = unzipSync(bytes, {
    filter(info) {
      const path = normalizedArchivePath(info.name);
      if (path !== "manifest.json") return false;
      if (info.originalSize > 5 * 1024 * 1024) {
        throw new Error("LumiStage manifest exceeds 5 MB.");
      }
      return true;
    },
  });
  const manifestBytes = data["manifest.json"];
  if (!manifestBytes) return null;
  return parseManifestBytes(manifestBytes);
}

function parseManifestBytes(manifestBytes: Uint8Array): ReadableLumiStageArchive {
  try {
    const parsed = JSON.parse(new TextDecoder().decode(manifestBytes)) as Record<string, unknown>;
    if (
      parsed.kind !== "lumistage-archive"
      || (parsed.schemaVersion !== 1 && parsed.schemaVersion !== 2)
      || !parsed.profile
    ) {
      throw new Error("Unsupported LumiStage archive manifest.");
    }
    return parsed as unknown as ReadableLumiStageArchive;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Invalid LumiStage manifest.");
  }
}

export async function extractLumiStageArchive(bytes: Uint8Array): Promise<{
  manifest: ReadableLumiStageArchive;
  candidates: ImportCandidate[];
  errors: string[];
}> {
  if (bytes.byteLength > MAX_ARCHIVE_BYTES) {
    throw new Error(`Archive exceeds ${MAX_ARCHIVE_BYTES} bytes.`);
  }
  let expandedBytes = 0;
  let acceptedCount = 0;
  const rejected = new Map<string, string>();
  const unzipped = await new Promise<Record<string, Uint8Array>>((resolve, reject) => {
    unzip(bytes, {
      filter(info) {
        const path = normalizedArchivePath(info.name);
        if (!path) return false;
        if (path === "manifest.json") {
          if (info.originalSize > 5 * 1024 * 1024) {
            throw new Error("LumiStage manifest exceeds 5 MB.");
          }
          return true;
        }
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
    }, (error, result) => error ? reject(error) : resolve(result));
  });
  const manifestEntry = Object.entries(unzipped).find(([path]) =>
    normalizedArchivePath(path) === "manifest.json"
  );
  if (!manifestEntry) throw new Error("The archive does not contain a LumiStage manifest.");
  const manifest = parseManifestBytes(manifestEntry[1]);
  const candidates: ImportCandidate[] = [];
  for (const [rawPath, data] of Object.entries(unzipped)) {
    const path = normalizedArchivePath(rawPath);
    if (!path || path === "manifest.json" || data.byteLength === 0) continue;
    const mimeType = mimeForName(path);
    if (!mimeType) continue;
    const parts = path.split("/");
    const fileName = parts.pop() ?? path;
    candidates.push({ path, fileName, bytes: data, mimeType, segments: parts });
  }
  return {
    manifest,
    candidates,
    errors: [...rejected].map(([path, reason]) => `${path}: ${reason}`),
  };
}

export function directCandidate(
  fileName: string,
  bytes: Uint8Array,
  mimeTypeHint?: string,
): ImportCandidate {
  const path = normalizedArchivePath(fileName);
  if (!path) throw new Error("The selected file has an unsafe path.");
  const mimeType = mimeForName(path)
    ?? (mimeTypeHint && /^(?:image|video)\//.test(mimeTypeHint) ? mimeTypeHint : null);
  if (!mimeType) throw new Error(`${fileName} is not a supported image or video.`);
  const limit = mimeType.startsWith("video/") ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (bytes.byteLength > limit) throw new Error(`${fileName} exceeds ${limit} bytes.`);
  const segments = path.split("/");
  const leaf = segments.pop() ?? fileName;
  return { path, fileName: leaf, bytes, mimeType, segments };
}

function findOrCreateOutfit(profile: CharacterProfileV2, name: string): OutfitFolderV2 {
  const key = normalizedKey(name);
  let outfit = profile.outfits.find((item) => normalizedKey(item.name) === key);
  if (!outfit) {
    outfit = createOutfit(name);
    outfit.expressions = [];
    outfit.defaultExpressionId = null;
    outfit.order = profile.outfits.length;
    profile.outfits.push(outfit);
    profile.defaultOutfitId ??= outfit.id;
  }
  return outfit;
}

function findOrCreateExpression(outfit: OutfitFolderV2, name: string): ExpressionSlotV2 {
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

export interface ImportedVariantV2 {
  target: ImportTargetV2;
  targetOutfitId?: string;
  targetExpressionId?: string;
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
  layout: ImportLayoutV2,
): {
  imported: ImportedVariantV2[];
  uploadedByPath: Map<string, {
    imageId: string;
    contentHash: string;
    fileName: string;
    mimeType: string;
  }>;
  errors: string[];
} {
  const imported: ImportedVariantV2[] = [];
  const uploadedByPath = new Map<string, {
    imageId: string;
    contentHash: string;
    fileName: string;
    mimeType: string;
  }>();
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
      target: importTarget(item.candidate, layout),
      ...uploaded,
    });
  }
  return { imported, uploadedByPath, errors };
}

export function mergeImportedAssets(
  source: CharacterProfileV2,
  imported: ImportedVariantV2[],
  characterName: string,
  now = Date.now(),
): { profile: CharacterProfileV2; imported: number; skipped: number } {
  const profile = normalizeProfile(
    structuredClone(source),
    source.characterId,
    characterName,
    now,
  );
  let importedCount = 0;
  let skipped = 0;
  for (const item of imported) {
    const outfit = item.targetOutfitId
      ? profile.outfits.find((entry) => entry.id === item.targetOutfitId)
      : findOrCreateOutfit(profile, item.target.outfitName);
    if (!outfit) throw new Error(`Import target outfit ${item.targetOutfitId} no longer exists.`);
    const expression = item.targetExpressionId
      ? outfit.expressions.find((entry) => entry.id === item.targetExpressionId)
      : findOrCreateExpression(outfit, item.target.expressionName);
    if (!expression) throw new Error(`Import target expression ${item.targetExpressionId} no longer exists.`);
    if (expression.variants.some((variant) => variant.contentHash === item.contentHash)) {
      skipped += 1;
      continue;
    }
    const variant: StageVariantV2 = {
      id: createId("variant"),
      imageId: item.imageId,
      contentHash: item.contentHash,
      fileName: item.fileName,
      mimeType: item.mimeType,
      mediaKind: item.mimeType.startsWith("video/") ? "video" : "image",
      order: expression.variants.length,
      createdAt: now,
    };
    expression.variants.push(variant);
    importedCount += 1;
  }
  profile.revision += 1;
  profile.updatedAt = now;
  return { profile, imported: importedCount, skipped };
}

function archiveEntries(archive: ReadableLumiStageArchive): Array<{
  path: string;
  variantId: string;
}> {
  const raw = archive as unknown as Record<string, unknown>;
  const entries = Array.isArray(raw.variants)
    ? raw.variants
    : Array.isArray(raw.assets) ? raw.assets : [];
  return entries.flatMap((value) => {
    const entry = value && typeof value === "object" ? value as Record<string, unknown> : {};
    const media = entry.variant && typeof entry.variant === "object"
      ? entry.variant as Record<string, unknown>
      : entry.asset && typeof entry.asset === "object"
        ? entry.asset as Record<string, unknown>
        : {};
    return typeof entry.path === "string" && typeof media.id === "string"
      ? [{ path: entry.path, variantId: media.id }]
      : [];
  });
}

export function hydrateArchiveProfile(
  archive: ReadableLumiStageArchive,
  characterId: string,
  characterName: string,
  uploadedByPath: Map<string, {
    imageId: string;
    contentHash: string;
    fileName: string;
    mimeType: string;
  }>,
  now = Date.now(),
): CharacterProfileV2 {
  const profile = normalizeProfile(
    {
      ...(structuredClone(archive.profile) as Record<string, unknown>),
      characterId,
      characterName,
      revision: 0,
      updatedAt: now,
    },
    characterId,
    characterName,
    now,
  );
  const entries = archiveEntries(archive);
  const pathsByVariantId = new Map<string, string>();
  const referencedPaths = new Set<string>();
  for (const entry of entries) {
    const path = normalizedArchivePath(entry.path);
    if (!path || path === "manifest.json") throw new Error(`Archive manifest contains an unsafe path: ${entry.path}`);
    if (pathsByVariantId.has(entry.variantId)) throw new Error(`Archive manifest repeats variant ID ${entry.variantId}.`);
    pathsByVariantId.set(entry.variantId, path);
    referencedPaths.add(path);
  }
  const profileVariants = allVariants(profile);
  if (pathsByVariantId.size !== profileVariants.length) {
    throw new Error("Archive manifest does not contain exactly one media reference for every profile variant.");
  }
  for (const path of referencedPaths) {
    if (!uploadedByPath.has(path)) throw new Error(`Archive is missing referenced media ${path}.`);
  }
  for (const path of uploadedByPath.keys()) {
    if (!referencedPaths.has(path)) throw new Error(`Archive contains unreferenced media ${path}.`);
  }
  for (const outfit of profile.outfits) {
    for (const expression of outfit.expressions) {
      expression.variants = expression.variants.flatMap((variant) => {
        const path = pathsByVariantId.get(variant.id);
        const upload = path ? uploadedByPath.get(path) : null;
        if (!upload) return [];
        return [{
          ...variant,
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

export function removeVariants(
  profile: CharacterProfileV2,
  variantIds: Set<string>,
  now = Date.now(),
): CharacterProfileV2 {
  const next = structuredClone(profile);
  for (const outfit of next.outfits) {
    for (const expression of outfit.expressions) {
      expression.variants = expression.variants
        .filter((variant) => !variantIds.has(variant.id))
        .map((variant, order) => ({ ...variant, order }));
    }
  }
  next.revision += 1;
  next.updatedAt = now;
  return next;
}

export function variantReferenceCount(
  profiles: CharacterProfileV2[],
  imageId: string,
): number {
  return profiles.reduce(
    (sum, profile) => sum + allVariants(profile).filter((variant) => variant.imageId === imageId).length,
    0,
  );
}

export function unreferencedImageIds(
  profiles: CharacterProfileV2[],
  candidateImageIds: Iterable<string>,
): string[] {
  return [...new Set(candidateImageIds)].filter(
    (imageId) => variantReferenceCount(profiles, imageId) === 0,
  );
}
