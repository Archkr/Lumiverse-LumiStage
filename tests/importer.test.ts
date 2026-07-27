import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import {
  assertArchiveBudget,
  assertUnambiguousCandidates,
  directCandidate,
  extractArchive,
  extractLumiStageArchive,
  hydrateArchiveProfile,
  importTarget,
  mergeImportedAssets,
  normalizedArchivePath,
  settleHostUploads,
  unreferencedImageIds,
  variantReferenceCount,
} from "../src/importer";
import { allVariants } from "../src/model";
import { profileA, profileB } from "./fixtures";

describe("import mapping and safety", () => {
  it("maps root, Outfit/Expression.ext, and Outfit/Expression/Variant.ext", () => {
    expect(importTarget(
      { segments: [], fileName: "Happy.png" },
      "automatic",
    )).toEqual({ outfitName: "Default", expressionName: "Happy" });
    expect(importTarget(
      { segments: ["Formal"], fileName: "Composed.png" },
      "automatic",
    )).toEqual({ outfitName: "Formal", expressionName: "Composed" });
    expect(importTarget(
      { segments: ["Formal", "Happy"], fileName: "side-smile.png" },
      "automatic",
    )).toEqual({ outfitName: "Formal", expressionName: "Happy" });
  });

  it("rejects traversal, over-deep paths, and case-insensitive collisions", () => {
    expect(normalizedArchivePath("../escape.png")).toBeNull();
    expect(normalizedArchivePath("Outfit/../escape.png")).toBeNull();
    const a = directCandidate("Formal/Happy/A.png", new Uint8Array([1]));
    const b = directCandidate("formal/happy/a.PNG", new Uint8Array([2]));
    expect(() => assertUnambiguousCandidates([a, b], "automatic"))
      .toThrow(/Ambiguous import collisions/);
    const deep = directCandidate("A/B/C/D.png", new Uint8Array([1]));
    expect(() => assertUnambiguousCandidates([deep], "automatic"))
      .toThrow(/deeper than Outfit\/Expression\/Variant/);
  });

  it("enforces archive entry and expansion limits", () => {
    expect(() => assertArchiveBudget(5001, 1)).toThrow(/more than/);
    expect(() => assertArchiveBudget(1, 1024 * 1024 * 1024 + 1)).toThrow(/expands beyond/);
  });

  it("ignores unsupported codecs and reads supported nested variants", () => {
    const zip = zipSync({
      "Formal/Happy/front.png": new Uint8Array([1, 2, 3]),
      "Formal/Happy/readme.txt": strToU8("no"),
    });
    const extracted = extractArchive(zip);
    expect(extracted.candidates).toHaveLength(1);
    expect(extracted.candidates[0]).toEqual(expect.objectContaining({
      path: "Formal/Happy/front.png",
      mimeType: "image/png",
      segments: ["Formal", "Happy"],
    }));
  });

  it("asynchronously extracts a validated LumiStage archive", async () => {
    const profile = profileA();
    const archive = {
      schemaVersion: 2 as const,
      kind: "lumistage-archive" as const,
      exportedAt: 1,
      profile,
      variants: allVariants(profile).map((variant, index) => ({
        path: `assets/${index}.png`,
        characterId: profile.characterId,
        outfitId: profile.outfits.find((outfit) =>
          outfit.expressions.some((expression) => expression.variants.some((item) => item.id === variant.id))
        )!.id,
        expressionId: profile.outfits.flatMap((outfit) => outfit.expressions)
          .find((expression) => expression.variants.some((item) => item.id === variant.id))!.id,
        variant,
      })),
    };
    const zip = zipSync({
      "manifest.json": strToU8(JSON.stringify(archive)),
      ...Object.fromEntries(archive.variants.map((entry, index) => [entry.path, new Uint8Array([index + 1])])),
    });
    const extracted = await extractLumiStageArchive(zip);
    expect(extracted.manifest.kind).toBe("lumistage-archive");
    expect(extracted.candidates).toHaveLength(archive.variants.length);
  });

  it("reports partial host upload failures per file", () => {
    const candidates = [
      directCandidate("Casual/happy.png", new Uint8Array([1])),
      directCandidate("Casual/angry.png", new Uint8Array([2])),
    ];
    const settled = settleHostUploads(
      candidates.map((candidate, index) => ({ candidate, hash: `hash-${index}` })),
      [{ id: "image-one" }, { error: "codec rejected" }],
      "automatic",
    );
    expect(settled.imported).toHaveLength(1);
    expect(settled.errors).toEqual(["Casual/angry.png: codec rejected"]);
  });
});

describe("variant merge, deduplication, and ownership references", () => {
  it("adds several filenames as variants of one expression", () => {
    const source = profileA();
    const result = mergeImportedAssets(source, [
      {
        target: { outfitName: "Formal", expressionName: "Joy" },
        imageId: "new-1",
        contentHash: "new-hash-1",
        fileName: "front.png",
        mimeType: "image/png",
      },
      {
        target: { outfitName: "Formal", expressionName: "Joy" },
        imageId: "new-2",
        contentHash: "new-hash-2",
        fileName: "side.png",
        mimeType: "image/png",
      },
    ], "Aster", 10);
    const joy = result.profile.outfits
      .find((item) => item.name === "Formal")
      ?.expressions.find((item) => item.name === "Joy");
    expect(joy?.variants.map((item) => item.fileName)).toEqual(["front.png", "side.png"]);
  });

  it("reuses a content hash across destinations while deduplicating within one destination", () => {
    const source = profileA();
    const existing = allVariants(source)[0];
    const result = mergeImportedAssets(source, [{
      target: { outfitName: "Formal", expressionName: "Duplicate" },
      imageId: existing.imageId,
      contentHash: existing.contentHash,
      fileName: "duplicate.png",
      mimeType: "image/png",
    }], "Aster");
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(0);
    expect(
      result.profile.outfits.find((item) => item.name === "Formal")
        ?.expressions.find((item) => item.name === "Duplicate")
        ?.variants[0].imageId,
    ).toBe(existing.imageId);
    const duplicate = mergeImportedAssets(result.profile, [{
      target: { outfitName: "Formal", expressionName: "Duplicate" },
      imageId: existing.imageId,
      contentHash: existing.contentHash,
      fileName: "duplicate-again.png",
      mimeType: "image/png",
    }], "Aster");
    expect(duplicate.imported).toBe(0);
    expect(duplicate.skipped).toBe(1);
  });

  it("commits an unsaved ID-targeted outfit and expression without renaming either", () => {
    const source = profileA();
    source.outfits.push({
      id: "outfit-unsaved",
      name: "Rain Coat",
      order: source.outfits.length,
      defaultExpressionId: "expression-unsaved",
      expressions: [{
        id: "expression-unsaved",
        name: "Quiet Resolve",
        order: 0,
        variants: [],
      }],
    });
    const result = mergeImportedAssets(source, [{
      target: { outfitName: "ignored filename outfit", expressionName: "asset-file-name" },
      targetOutfitId: "outfit-unsaved",
      targetExpressionId: "expression-unsaved",
      imageId: "image-new",
      contentHash: "hash-new",
      fileName: "WRONG-NAME.png",
      mimeType: "image/png",
    }], "Aster");
    expect(result.profile.outfits.map((outfit) => outfit.name)).toContain("Rain Coat");
    const expression = result.profile.outfits
      .find((outfit) => outfit.id === "outfit-unsaved")
      ?.expressions.find((item) => item.id === "expression-unsaved");
    expect(expression?.name).toBe("Quiet Resolve");
    expect(expression?.variants[0].fileName).toBe("WRONG-NAME.png");
  });

  it("restores multiple variant records that intentionally share one archive media path", () => {
    const profile = profileA();
    const variants = allVariants(profile);
    const entries = variants.map((variant, index) => ({
      path: index < 2 ? "assets/shared.png" : `assets/${index}.png`,
      characterId: profile.characterId,
      outfitId: profile.outfits.find((outfit) =>
        outfit.expressions.some((expression) => expression.variants.some((item) => item.id === variant.id))
      )!.id,
      expressionId: profile.outfits.flatMap((outfit) => outfit.expressions)
        .find((expression) => expression.variants.some((item) => item.id === variant.id))!.id,
      variant,
    }));
    const uploaded = new Map(
      [...new Set(entries.map((entry) => entry.path))].map((path) => [path, {
        imageId: path === "assets/shared.png" ? "shared-image" : `image-${path}`,
        contentHash: `hash-${path}`,
        fileName: path.split("/").pop()!,
        mimeType: "image/png",
      }]),
    );
    const restored = hydrateArchiveProfile({
      schemaVersion: 2,
      kind: "lumistage-archive",
      exportedAt: 1,
      profile,
      variants: entries,
    }, profile.characterId, profile.characterName, uploaded);
    expect(allVariants(restored).filter((variant) => variant.imageId === "shared-image")).toHaveLength(2);
  });

  it("only marks an image unreferenced after every profile reference is gone", () => {
    const a = profileA();
    const b = profileB();
    const shared = allVariants(a)[0].imageId;
    allVariants(b)[0].imageId = shared;
    expect(variantReferenceCount([a, b], shared)).toBe(2);
    expect(unreferencedImageIds([a, b], [shared])).toEqual([]);
    expect(unreferencedImageIds([], [shared])).toEqual([shared]);
  });
});
