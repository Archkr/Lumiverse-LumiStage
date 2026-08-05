import { describe, expect, it } from "vitest";
import { resolveStageWidgetLayout } from "../src/ui/stage-layout";

describe("floating stage viewport layout", () => {
  it("preserves the saved stage size on desktop", () => {
    expect(resolveStageWidgetLayout(
      { width: 520, height: 640 },
      { width: 1440, height: 900, coarsePointer: false },
    )).toEqual({ width: 520, height: 640, mobile: false });
  });

  it("requests a compact stage for a phone under Lumiverse's new mobile contract", () => {
    expect(resolveStageWidgetLayout(
      { width: 320, height: 420 },
      { width: 390, height: 844, coarsePointer: false },
    )).toEqual({ width: 320, height: 280, mobile: true });
  });

  it("treats coarse-pointer tablets as mobile without filling the viewport", () => {
    expect(resolveStageWidgetLayout(
      { width: 800, height: 600 },
      { width: 1024, height: 768, coarsePointer: true },
    )).toEqual({ width: 360, height: 280, mobile: true });
  });

  it("keeps a short landscape stage inside Lumiverse's padded viewport", () => {
    expect(resolveStageWidgetLayout(
      { width: 800, height: 600 },
      { width: 844, height: 390, coarsePointer: true },
    )).toEqual({ width: 360, height: 180, mobile: true });
  });

  it("lets the available viewport win on extremely small screens", () => {
    expect(resolveStageWidgetLayout(
      { width: 320, height: 420 },
      { width: 200, height: 160, coarsePointer: true },
    )).toEqual({ width: 176, height: 136, mobile: true });
  });
});
