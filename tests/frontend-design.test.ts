import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const styles = readFileSync(resolve(root, "src/ui/styles.ts"), "utf8");
const studio = readFileSync(resolve(root, "src/ui/studio.tsx"), "utf8");
const frontend = readFileSync(resolve(root, "src/frontend.tsx"), "utf8");
const controls = readFileSync(resolve(root, "src/ui/host-controls.tsx"), "utf8");

describe("replacement frontend design contract", () => {
  it("uses opaque Lumiverse-derived surfaces without a fixed palette", () => {
    expect(styles).toContain("--ls-bg: var(--lumiverse-bg)");
    expect(styles).toContain("--ls-text: var(--lumiverse-text)");
    expect(styles).toContain("--ls-accent: var(--lumiverse-accent");
    expect(styles).toContain("--ls-line: var(--lumiverse-border)");
    expect(styles).toMatch(/\.ls-drawer\s*\{[\s\S]*?background:\s*var\(--ls-bg\)/);
    expect(styles).toMatch(/\.ls-studio\s*\{[\s\S]*?background:\s*var\(--ls-bg\)/);
    expect(styles).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    expect(styles).not.toMatch(/rgba?\(/i);
  });

  it("mounts Lumiverse first-party controls through lifecycle-safe wrappers", () => {
    for (const method of [
      "mountSwitch",
      "mountSelect",
      "mountModelCombobox",
      "mountNumberStepper",
      "mountRangeSlider",
      "mountPagination",
      "mountBadge",
    ]) {
      expect(controls).toContain(method);
    }
    expect(controls).toContain("handle.current?.destroy()");
  });

  it("uses a tabless dashboard and a large three-view Studio modal", () => {
    expect(frontend).toContain("width: 1440");
    expect(frontend).toContain("maxHeight: 980");
    expect(frontend).toContain("<DrawerDashboard");
    expect(studio).toContain(">Library</button>");
    expect(studio).toContain(">Live Stage</button>");
    expect(studio).toContain(">Settings</button>");
    expect(studio).not.toContain("Privacy by design");
    expect(studio).not.toContain("Cue phrases");
    expect(studio).not.toContain("Actor aliases");
    expect(studio).not.toContain('label: "Batch"');
  });

  it("keeps batch selection contextual and implements mobile architecture", () => {
    expect(studio).toContain('class="ls-batch-bar"');
    expect(studio).toContain("Select all filtered");
    expect(studio).toMatch(/>\s*Move\s*<\/Button>/);
    expect(studio).toMatch(/>\s*Copy\s*<\/Button>/);
    expect(styles).toContain("@media (max-width: 720px)");
    expect(styles).toContain("@media (max-width: 420px)");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain("env(safe-area-inset-bottom)");
    expect(styles).toContain(":focus-visible");
  });
});
