import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import {
  MAX_ENTRY_COUNT,
  MAX_EXPANDED_BYTES,
  MAX_IMAGE_BYTES,
  assertArchiveBudget,
  assertUnambiguousCandidates,
  assetReferenceCount,
  directCandidate,
  extractArchive,
  importTarget,
  normalizedArchivePath,
  settleHostUploads,
  unreferencedImageIds,
} from "../src/importer";
import { allAssets } from "../src/model";
import { profileA } from "./fixtures";

describe("safe import mapping", () => {
  it("rejects traversal, hidden/system entries, and unsafe direct paths", () => {
    expect(normalizedArchivePath("../escape.png")).toBeNull();
    expect(normalizedArchivePath("actor/../../escape.png")).toBeNull();
    expect(normalizedArchivePath("__MACOSX/junk.png")).toBeNull();
    expect(() => directCandidate("../escape.png", new Uint8Array([1]))).toThrow(/unsafe path/i);
  });

  it("fills explicit Default levels for shallower layouts", () => {
    const direct = directCandidate("Happy.png", new Uint8Array([1]));
    expect(importTarget(direct, "outfit-expression", "Aster")).toEqual({
      actorName: "Aster",
      outfitName: "Default",
      expressionName: "Happy",
    });
    const nested = directCandidate("Bryn/Formal/Smile.webp", new Uint8Array([1]));
    expect(importTarget(nested, "actor-outfit-expression", "Aster")).toEqual({
      actorName: "Bryn",
      outfitName: "Formal",
      expressionName: "Smile",
    });
  });

  it("detects case-folded filename and destination collisions before upload", () => {
    const candidates = [
      directCandidate("Casual/Happy.png", new Uint8Array([1])),
      directCandidate("casual/HAPPY.PNG", new Uint8Array([2])),
    ];
    expect(() => assertUnambiguousCandidates(candidates, "outfit-expression", "Aster"))
      .toThrow(/ambiguous import collisions/i);
  });

  it("accepts supported static, animated, and video codecs and skips unsupported files", () => {
    const archive = zipSync({
      "Casual/Standing/Neutral.png": strToU8("png"),
      "Casual/Standing/Loop.gif": strToU8("gif"),
      "Casual/Standing/Scene.webm": strToU8("webm"),
      "Casual/Standing/Scene.mp4": strToU8("mp4"),
      "Casual/Standing/Audio.mp3": strToU8("audio"),
      "../escape.png": strToU8("bad"),
    });
    const result = extractArchive(archive);
    expect(result.candidates.map((item) => item.mimeType).sort()).toEqual([
      "image/gif",
      "image/png",
      "video/mp4",
      "video/webm",
    ]);
  });

  it("enforces archive bomb and per-entry limits without allocating bomb-sized data", () => {
    expect(() => assertArchiveBudget(MAX_ENTRY_COUNT + 1, 1)).toThrow(/more than/i);
    expect(() => assertArchiveBudget(1, MAX_EXPANDED_BYTES + 1)).toThrow(/expands beyond/i);
    expect(() => directCandidate("huge.png", new Uint8Array(MAX_IMAGE_BYTES + 1))).toThrow(/exceeds/i);
  });

  it("reports partial host upload failures per file and commits successful items only", () => {
    const prepared = [
      { candidate: directCandidate("Casual/Happy.png", new Uint8Array([1])), hash: "one" },
      { candidate: directCandidate("Casual/Sad.png", new Uint8Array([2])), hash: "two" },
    ];
    const settled = settleHostUploads(prepared, [{ id: "image-one" }, { error: "codec rejected" }], "outfit-expression", "Aster");
    expect(settled.imported).toHaveLength(1);
    expect(settled.uploadedByPath.get(prepared[0].candidate.path)?.imageId).toBe("image-one");
    expect(settled.errors).toEqual(["Casual/Sad.png: codec rejected"]);
  });

  it("only selects image IDs that became unreferenced across every profile", () => {
    const first = profileA();
    const second = structuredClone(first);
    second.characterId = "other-character";
    const shared = allAssets(first)[0].imageId;
    const unique = allAssets(first)[1].imageId;
    for (const item of allAssets(second)) if (item.imageId === unique) item.imageId = "other";
    expect(assetReferenceCount([first, second], shared)).toBe(2);
    expect(unreferencedImageIds([second], [shared, unique, unique])).toEqual([unique]);
  });
});
