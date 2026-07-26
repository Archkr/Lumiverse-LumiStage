import { describe, expect, it, vi } from "vitest";
import { confirmExtensionOwnedImageIds } from "../src/ownership";

describe("permanent deletion ownership confirmation", () => {
  it("keeps only successfully looked-up LumiStage-owned asset IDs", async () => {
    const lookup = vi.fn(async (id: string) => {
      if (id === "ours") return { id, owner_extension_identifier: "lumi_stage" };
      if (id === "foreign") return { id, owner_extension_identifier: "another_extension" };
      if (id === "error") throw new Error("permission revoked");
      return null;
    });
    await expect(confirmExtensionOwnedImageIds(["ours", "ours", "foreign", "missing", "error"], lookup))
      .resolves.toEqual(["ours"]);
    expect(lookup).toHaveBeenCalledTimes(4);
  });
});

