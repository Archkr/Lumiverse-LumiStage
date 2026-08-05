export const MOBILE_STAGE_BREAKPOINT = 600;
export const MOBILE_STAGE_VIEWPORT_PADDING = 12;
export const MOBILE_STAGE_MAX_WIDTH = 360;
export const MOBILE_STAGE_MIN_HEIGHT = 180;
export const MOBILE_STAGE_MAX_HEIGHT = 280;

export interface StageViewport {
  width: number;
  height: number;
  coarsePointer: boolean;
}

export interface StageWidgetLayout {
  width: number;
  height: number;
  mobile: boolean;
}

export function resolveStageWidgetLayout(
  requested: { width: number; height: number },
  viewport: StageViewport,
): StageWidgetLayout {
  const width = Math.max(1, Math.round(requested.width));
  const height = Math.max(1, Math.round(requested.height));
  const mobile = viewport.coarsePointer || viewport.width <= MOBILE_STAGE_BREAKPOINT;
  if (!mobile) return { width, height, mobile: false };

  const availableWidth = Math.max(1, Math.round(viewport.width) - MOBILE_STAGE_VIEWPORT_PADDING * 2);
  const availableHeight = Math.max(1, Math.round(viewport.height) - MOBILE_STAGE_VIEWPORT_PADDING * 2);
  const mobileHeightCap = Math.min(
    MOBILE_STAGE_MAX_HEIGHT,
    Math.max(MOBILE_STAGE_MIN_HEIGHT, Math.round(viewport.height * 0.38)),
  );

  return {
    width: Math.min(width, availableWidth, MOBILE_STAGE_MAX_WIDTH),
    height: Math.min(height, availableHeight, mobileHeightCap),
    mobile: true,
  };
}
