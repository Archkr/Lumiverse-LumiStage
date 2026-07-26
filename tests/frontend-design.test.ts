import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const styles = readFileSync(resolve(root, "src/ui/styles.ts"), "utf8");
const studio = readFileSync(resolve(root, "src/ui/studio.tsx"), "utf8");
const frontend = readFileSync(resolve(root, "src/frontend.tsx"), "utf8");

describe("frontend design contract", () => {
  it("inherits Lumiverse dynamic color, type, shape, motion, and glass tokens", () => {
    expect(styles).toContain("--ls2-text: var(--lumiverse-text");
    expect(styles).toContain("--ls2-canvas: var(--lumiverse-bg-deep");
    expect(styles).toContain("--ls2-panel: var(--lumiverse-bg-elevated");
    expect(styles).toContain("--ls2-accent: var(--lumiverse-primary");
    expect(styles).toContain("--ls2-line: var(--lumiverse-border");
    expect(styles).toContain("--ls2-glass: var(--lcs-glass-bg");
    expect(styles).toMatch(/\.ls2-nav-menu\s*\{[\s\S]*?background:\s*var\(--lumiverse-bg-elevated/);
    expect(styles).toContain("var(--lumiverse-font-family");
    expect(styles).toContain("var(--lumiverse-font-scale");
    expect(styles).toContain("var(--lumiverse-transition-fast");
    expect(styles).not.toMatch(/--ls-(?:cyan|amber|navy|charcoal)\b/);
  });

  it("keeps the studio responsive and accessible", () => {
    expect(styles).toContain("env(safe-area-inset-bottom)");
    expect(styles).toContain("container: lumi-stage / inline-size");
    expect(styles).toContain("@container lumi-stage (max-width: 390px)");
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain(":focus-visible");
    expect(studio).toContain('aria-label="LumiStage workspace"');
    expect(studio).toContain('aria-current={view === item.id ? "page" : undefined}');
  });

  it("ships only the replacement modular frontend", () => {
    expect(existsSync(resolve(root, "src/ui/components.tsx"))).toBe(false);
    expect(frontend).toContain('from "./ui/studio"');
    expect(frontend).toContain('from "./ui/stage"');
    expect(frontend).toContain('from "./ui/modals"');
    expect(frontend).toMatch(/export\s+function\s+setup\s*\(/);
    expect(studio).not.toContain("window.prompt");
    expect(studio).not.toContain("ls2-appbar");
    expect(studio).toContain("ls2-onboarding-stage");
    expect(studio).toContain("ls2-cue-sheet");
    expect(studio).toContain("function SettingsView");
    expect(studio).toContain('type: "open-connections"');
    for (const view of ["Stage", "Library", "Batch", "Automation", "Appearance", "Settings", "Diagnostics"]) {
      expect(studio).toContain(`label: "${view}"`);
    }
  });
});
