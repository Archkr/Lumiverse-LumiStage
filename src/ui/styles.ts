export const LUMI_STAGE_CSS = `
.ls2-root, .ls2-modal, .ls2-stage-root {
  --ls2-text: var(--lumiverse-text, #ececf2);
  --ls2-muted: var(--lumiverse-text-muted, #a3a5b4);
  --ls2-dim: var(--lumiverse-text-dim, #747788);
  --ls2-hint: var(--lumiverse-text-hint, var(--ls2-dim));
  --ls2-canvas: var(--lumiverse-bg-deep, var(--lumiverse-bg, #101116));
  --ls2-panel: var(--lumiverse-bg-elevated, var(--lumiverse-surface, #191a21));
  --ls2-raised: var(--lumiverse-surface-raised, var(--lumiverse-bg-hover, #22232b));
  --ls2-fill: var(--lumiverse-fill-subtle, rgba(255,255,255,.045));
  --ls2-fill-hover: var(--lumiverse-fill-hover, rgba(255,255,255,.075));
  --ls2-fill-strong: var(--lumiverse-fill-strong, rgba(255,255,255,.12));
  --ls2-input: var(--lumiverse-input-bg, var(--ls2-fill));
  --ls2-line: var(--lumiverse-border, rgba(255,255,255,.1));
  --ls2-line-subtle: var(--lumiverse-border-subtle, var(--ls2-line));
  --ls2-line-hover: var(--lumiverse-border-hover, rgba(255,255,255,.18));
  --ls2-accent: var(--lumiverse-primary, var(--lumiverse-accent, #8b7cf6));
  --ls2-accent-hover: var(--lumiverse-primary-hover, var(--lumiverse-accent, #9b8eff));
  --ls2-accent-fg: var(--lumiverse-primary-contrast, var(--lumiverse-on-primary, #fff));
  --ls2-accent-soft: var(--lumiverse-primary-010, var(--lumiverse-primary-muted, rgba(139,124,246,.1)));
  --ls2-accent-medium: var(--lumiverse-primary-020, var(--lumiverse-primary-light, rgba(139,124,246,.18)));
  --ls2-success: var(--lumiverse-success, #69c79f);
  --ls2-warning: var(--lumiverse-warning, #e1a75c);
  --ls2-danger: var(--lumiverse-danger, var(--lumiverse-error, #e17078));
  --ls2-glass: var(--lcs-glass-bg, var(--lumiverse-bg-panel, var(--ls2-panel)));
  --ls2-glass-border: var(--lcs-glass-border, var(--ls2-line));
  --ls2-glass-blur: var(--lcs-glass-blur, 16px);
  --ls2-radius-xs: var(--lcs-radius-xs, var(--lumiverse-radius-sm, 6px));
  --ls2-radius-sm: var(--lcs-radius-sm, var(--lumiverse-radius-md, 9px));
  --ls2-radius: var(--lcs-radius, var(--lumiverse-radius-lg, 13px));
  --ls2-radius-lg: var(--lumiverse-radius-xl, 18px);
  --ls2-shadow-sm: var(--lumiverse-shadow-sm, 0 4px 16px rgba(0,0,0,.14));
  --ls2-shadow: var(--lumiverse-shadow-md, 0 12px 35px rgba(0,0,0,.2));
  --ls2-transition: var(--lcs-transition-fast, var(--lumiverse-transition-fast, 150ms ease));
  color: var(--ls2-text);
  font-family: var(--lumiverse-font-family, Inter, ui-sans-serif, system-ui, sans-serif);
  font-size: calc(14px * var(--lumiverse-font-scale, 1));
  line-height: 1.45;
}
.ls2-root *, .ls2-root *::before, .ls2-root *::after,
.ls2-modal *, .ls2-modal *::before, .ls2-modal *::after,
.ls2-stage-root *, .ls2-stage-root *::before, .ls2-stage-root *::after { box-sizing: border-box; }
.ls2-root :is(h1,h2,h3,p,figure), .ls2-modal :is(h1,h2,h3,p,figure), .ls2-stage-root :is(h1,h2,h3,p,figure) { margin: 0; }
.ls2-root :is(button,input,select,textarea), .ls2-modal :is(button,input,select,textarea), .ls2-stage-root button { font: inherit; }
.ls2-root button, .ls2-modal button, .ls2-stage-root button { color: inherit; }
.ls2-root :focus-visible, .ls2-modal :focus-visible, .ls2-stage-root :focus-visible { outline: 2px solid var(--ls2-accent); outline-offset: 2px; }
.ls2-root svg, .ls2-modal svg, .ls2-stage-root svg { display: block; flex: 0 0 auto; }

.ls2-root { min-height: 100%; background: transparent; }
.ls2-drawer {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  container: lumi-stage / inline-size;
  background:
    radial-gradient(circle at 94% 0, color-mix(in srgb, var(--ls2-accent) 5%, transparent), transparent 25rem),
    transparent;
}

.ls2-nav {
  position: sticky; top: 0; z-index: 20;
  padding: 8px 10px;
  border-bottom: 1px solid var(--ls2-line-subtle);
  background: color-mix(in srgb, var(--ls2-glass) 92%, transparent);
  backdrop-filter: blur(var(--ls2-glass-blur));
}
.ls2-nav-primary {
  display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 4px;
  max-width: 560px; margin: 0 auto;
}
.ls2-nav-primary > button {
  appearance: none; min-width: 0; min-height: 42px; display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 7px 8px; border: 1px solid transparent; border-radius: var(--ls2-radius-sm);
  color: var(--ls2-dim); background: transparent; cursor: pointer; transition: all var(--ls2-transition);
}
.ls2-nav-primary > button span { overflow: hidden; max-width: 100%; font-size: 12px; font-weight: 700; text-overflow: ellipsis; white-space: nowrap; }
.ls2-nav-primary > button:hover { color: var(--ls2-text); background: var(--ls2-fill-hover); }
.ls2-nav-primary > button[data-active="true"] {
  color: var(--ls2-accent);
  border-color: color-mix(in srgb, var(--ls2-accent) 20%, var(--ls2-line));
  background: var(--ls2-accent-soft);
  box-shadow: inset 0 -2px 0 color-mix(in srgb, var(--ls2-accent) 72%, transparent);
}
.ls2-nav-menu {
  position: absolute; top: calc(100% + 7px); right: 10px; left: 10px; z-index: 25;
  max-width: 390px; margin-left: auto; overflow: hidden;
  border: 1px solid var(--ls2-glass-border); border-radius: var(--ls2-radius-lg);
  background: var(--lumiverse-bg-elevated, var(--lumiverse-bg, #191a21));
  box-shadow: 0 22px 70px color-mix(in srgb,var(--ls2-canvas) 70%,transparent),var(--ls2-shadow);
}
.ls2-nav:has(.ls2-nav-menu)::after { content: ""; position: fixed; inset: 0; z-index: 24; pointer-events: none; background: color-mix(in srgb,var(--ls2-canvas) 38%,transparent); }
.ls2-nav-menu-head { min-height: 42px; display: flex; align-items: center; justify-content: space-between; padding: 5px 7px 5px 13px; border-bottom: 1px solid var(--ls2-line); color: var(--ls2-muted); font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.ls2-nav-menu > button {
  appearance: none; width: 100%; min-height: 62px; display: grid; grid-template-columns: 36px minmax(0,1fr) auto; align-items: center; gap: 10px;
  padding: 9px 12px; border: 0; border-bottom: 1px solid var(--ls2-line-subtle);
  color: var(--ls2-muted); background: transparent; text-align: left; cursor: pointer; transition: all var(--ls2-transition);
}
.ls2-nav-menu > button:last-child { border-bottom: 0; }
.ls2-nav-menu > button:hover, .ls2-nav-menu > button[data-active="true"] { color: var(--ls2-text); background: var(--ls2-fill-hover); }
.ls2-nav-menu > button[data-active="true"] .ls2-nav-menu-icon { color: var(--ls2-accent); background: var(--ls2-accent-soft); }
.ls2-nav-menu-icon { width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm); background: var(--ls2-fill); }
.ls2-nav-menu > button > span:nth-child(2) { min-width: 0; display: flex; flex-direction: column; }
.ls2-nav-menu > button strong { color: inherit; font-size: 13px; }
.ls2-nav-menu > button small { margin-top: 2px; color: var(--ls2-dim); font-size: 11px; }
.ls2-content { flex: 1; min-height: 0; padding: 20px 16px 92px; }
.ls2-view { display: flex; flex-direction: column; gap: 14px; min-width: 0; animation: ls2-enter .18s ease-out; }

.ls2-view-header { display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: end; gap: 12px; padding: 2px 1px 3px; }
.ls2-view-heading { min-width: 0; }
.ls2-eyebrow { display: block; color: var(--ls2-accent); font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.ls2-view-heading h2 { margin-top: 3px; font-size: 21px; line-height: 1.18; letter-spacing: -.025em; }
.ls2-view-heading p { max-width: 520px; margin-top: 5px; color: var(--ls2-muted); font-size: 13px; line-height: 1.5; }
.ls2-view-actions, .ls2-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }

.ls2-surface {
  min-width: 0; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius);
  background: var(--ls2-panel); box-shadow: var(--ls2-shadow-sm);
}
.ls2-surface[data-padding="default"] { padding: 14px; }
.ls2-surface[data-padding="small"] { padding: 9px 11px; }
.ls2-surface[data-padding="none"] { padding: 0; overflow: hidden; }
.ls2-surface[data-tone="accent"] { border-color: color-mix(in srgb, var(--ls2-accent) 32%, var(--ls2-line)); background: linear-gradient(135deg, var(--ls2-accent-soft), var(--ls2-panel)); }
.ls2-surface[data-tone="danger"] { border-color: color-mix(in srgb, var(--ls2-danger) 36%, var(--ls2-line)); }
.ls2-section-title { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 12px; }
.ls2-section-title h3 { font-size: 13px; line-height: 1.3; letter-spacing: -.005em; }
.ls2-section-title p { margin-top: 3px; color: var(--ls2-muted); font-size: 12px; line-height: 1.45; }
.ls2-section-trailing { flex: 0 0 auto; }

.ls2-button, .ls2-icon-button {
  appearance: none; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm);
  color: var(--ls2-text); background: var(--ls2-fill); cursor: pointer; transition: all var(--ls2-transition);
}
.ls2-button {
  min-height: 34px; display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  padding: 7px 11px; font-size: 13px; font-weight: 700;
}
.ls2-button-small { min-height: 31px; padding: 5px 8px; font-size: 12px; }
.ls2-button:hover:not(:disabled), .ls2-icon-button:hover:not(:disabled) { border-color: var(--ls2-line-hover); background: var(--ls2-fill-hover); transform: translateY(-1px); }
.ls2-button-primary { color: var(--ls2-accent-fg); border-color: color-mix(in srgb, var(--ls2-accent) 75%, var(--ls2-line)); background: var(--ls2-accent); box-shadow: 0 5px 15px color-mix(in srgb, var(--ls2-accent) 18%, transparent); }
.ls2-button-primary:hover:not(:disabled) { border-color: var(--ls2-accent-hover); background: var(--ls2-accent-hover); }
.ls2-button-ghost { border-color: transparent; background: transparent; color: var(--ls2-muted); }
.ls2-button-danger { color: var(--ls2-danger); border-color: color-mix(in srgb, var(--ls2-danger) 25%, var(--ls2-line)); background: color-mix(in srgb, var(--ls2-danger) 7%, transparent); }
.ls2-button:disabled, .ls2-icon-button:disabled { opacity: .4; cursor: not-allowed; transform: none; }
.ls2-icon-button { width: 32px; height: 32px; display: inline-grid; place-items: center; padding: 0; }
.ls2-icon-button[data-active="true"] { color: var(--ls2-accent); border-color: color-mix(in srgb, var(--ls2-accent) 28%, var(--ls2-line)); background: var(--ls2-accent-soft); }
.ls2-icon-button[data-danger="true"]:hover { color: var(--ls2-danger); border-color: color-mix(in srgb, var(--ls2-danger) 28%, var(--ls2-line)); }

.ls2-status {
  min-height: 23px; display: inline-flex; align-items: center; gap: 6px; padding: 3px 8px;
  border: 1px solid var(--ls2-line); border-radius: 999px; color: var(--ls2-muted); background: var(--ls2-fill);
  font-size: 11px; font-weight: 750; white-space: nowrap; text-transform: capitalize;
}
.ls2-status-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ls2-dim); }
.ls2-status[data-tone="accent"] { color: var(--ls2-accent); border-color: color-mix(in srgb, var(--ls2-accent) 30%, var(--ls2-line)); background: var(--ls2-accent-soft); }
.ls2-status[data-tone="accent"] .ls2-status-dot { background: var(--ls2-accent); box-shadow: 0 0 0 3px var(--ls2-accent-soft); }
.ls2-status[data-tone="success"] { color: var(--ls2-success); border-color: color-mix(in srgb, var(--ls2-success) 30%, var(--ls2-line)); }
.ls2-status[data-tone="success"] .ls2-status-dot { background: var(--ls2-success); }
.ls2-status[data-tone="warning"] { color: var(--ls2-warning); border-color: color-mix(in srgb, var(--ls2-warning) 30%, var(--ls2-line)); }
.ls2-status[data-tone="warning"] .ls2-status-dot { background: var(--ls2-warning); }
.ls2-status[data-tone="danger"] { color: var(--ls2-danger); border-color: color-mix(in srgb, var(--ls2-danger) 30%, var(--ls2-line)); }
.ls2-status[data-tone="danger"] .ls2-status-dot { background: var(--ls2-danger); }

.ls2-field { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.ls2-field-label { color: var(--ls2-muted); font-size: 12px; font-weight: 700; }
.ls2-field-hint, .ls2-help { color: var(--ls2-dim); font-size: 11px; line-height: 1.45; }
.ls2-input, .ls2-select {
  width: 100%; min-height: 35px; padding: 7px 9px; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm);
  outline: none; color: var(--ls2-text); background: var(--ls2-input); transition: all var(--ls2-transition);
  font-size: 13px;
}
.ls2-input:hover, .ls2-select:hover { border-color: var(--ls2-line-hover); }
.ls2-input:focus, .ls2-select:focus { border-color: var(--ls2-accent); box-shadow: 0 0 0 3px var(--ls2-accent-soft); }
.ls2-input::placeholder { color: var(--ls2-hint); }
.ls2-select option { color: var(--ls2-text); background: var(--ls2-panel); }
.ls2-range { width: 100%; accent-color: var(--ls2-accent); }
.ls2-form-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; margin-bottom: 12px; }
.ls2-field-wide { grid-column: 1/-1; }
.ls2-inline-field { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 7px; }
.ls2-range-stack { display: grid; gap: 16px; }
.ls2-locked-value { display: flex; align-items: center; gap: 7px; margin-top: 12px; padding: 8px 9px; border-radius: var(--ls2-radius-sm); color: var(--ls2-muted); background: var(--ls2-fill); font-size: 12px; }

.ls2-toggle-row {
  position: relative; min-height: 48px; display: grid; grid-template-columns: minmax(0,1fr) auto auto; align-items: center; gap: 10px;
  padding: 8px 0; border-top: 1px solid var(--ls2-line-subtle); cursor: pointer;
}
.ls2-toggle-row:first-child { border-top: 0; padding-top: 0; }
.ls2-toggle-row:last-child { padding-bottom: 0; }
.ls2-toggle-row[data-disabled="true"] { opacity: .5; cursor: not-allowed; }
.ls2-toggle-copy { min-width: 0; display: flex; flex-direction: column; }
.ls2-toggle-copy strong { font-size: 13px; }
.ls2-toggle-copy small { margin-top: 2px; color: var(--ls2-muted); font-size: 11px; line-height: 1.4; }
.ls2-toggle-row input { position: absolute; opacity: 0; pointer-events: none; }
.ls2-toggle-track { width: 34px; height: 20px; display: block; padding: 2px; border: 1px solid var(--ls2-line-hover); border-radius: 999px; background: var(--ls2-fill); transition: all var(--ls2-transition); }
.ls2-toggle-track span { width: 14px; height: 14px; display: block; border-radius: 50%; background: var(--ls2-muted); transition: all var(--ls2-transition); }
.ls2-toggle-row input:checked + .ls2-toggle-track { border-color: var(--ls2-accent); background: var(--ls2-accent); }
.ls2-toggle-row input:checked + .ls2-toggle-track span { transform: translateX(14px); background: var(--ls2-accent-fg); }

.ls2-segmented { min-width: 0; display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 3px; padding: 3px; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm); background: var(--ls2-fill); }
.ls2-segmented button { min-width: 0; min-height: 33px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 5px 8px; border: 0; border-radius: calc(var(--ls2-radius-sm) - 3px); color: var(--ls2-muted); background: transparent; cursor: pointer; font-size: 12px; font-weight: 700; }
.ls2-segmented button:hover { color: var(--ls2-text); }
.ls2-segmented button[data-active="true"] { color: var(--ls2-text); background: var(--ls2-raised); box-shadow: var(--ls2-shadow-sm), inset 0 1px 0 color-mix(in srgb, var(--ls2-text) 6%, transparent); }

.ls2-search { min-width: 0; flex: 1; min-height: 35px; display: grid; grid-template-columns: auto minmax(0,1fr) auto; align-items: center; gap: 7px; padding: 0 9px; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm); color: var(--ls2-dim); background: var(--ls2-input); transition: all var(--ls2-transition); }
.ls2-search:focus-within { color: var(--ls2-accent); border-color: var(--ls2-accent); box-shadow: 0 0 0 3px var(--ls2-accent-soft); }
.ls2-search input { width: 100%; min-width: 0; border: 0; outline: 0; color: var(--ls2-text); background: transparent; font-size: 13px; }
.ls2-search input::placeholder { color: var(--ls2-hint); }
.ls2-search button { width: 24px; height: 24px; display: grid; place-items: center; padding: 0; border: 0; color: var(--ls2-dim); background: transparent; cursor: pointer; }

.ls2-notice, .ls2-safe-note {
  display: grid; grid-template-columns: auto minmax(0,1fr); align-items: start; gap: 9px; padding: 10px 11px;
  border: 1px solid color-mix(in srgb, var(--ls2-accent) 22%, var(--ls2-line)); border-radius: var(--ls2-radius-sm);
  color: var(--ls2-muted); background: var(--ls2-accent-soft); font-size: 12px;
}
.ls2-notice > div { display: flex; flex-direction: column; gap: 2px; }
.ls2-notice strong { color: var(--ls2-text); }
.ls2-notice[data-tone="success"], .ls2-safe-note { border-color: color-mix(in srgb, var(--ls2-success) 25%, var(--ls2-line)); background: color-mix(in srgb, var(--ls2-success) 7%, transparent); }
.ls2-notice[data-tone="warning"] { border-color: color-mix(in srgb, var(--ls2-warning) 30%, var(--ls2-line)); background: color-mix(in srgb, var(--ls2-warning) 8%, transparent); }
.ls2-notice[data-tone="danger"] { border-color: color-mix(in srgb, var(--ls2-danger) 30%, var(--ls2-line)); background: color-mix(in srgb, var(--ls2-danger) 8%, transparent); }
.ls2-global-notice { position: sticky; top: 66px; z-index: 18; margin: 8px 10px 0; overflow: hidden; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm); background: var(--ls2-glass); backdrop-filter: blur(var(--ls2-glass-blur)); box-shadow: var(--ls2-shadow-sm); }
.ls2-global-notice-copy { padding: 8px 10px; color: var(--ls2-muted); font-size: 12px; }
.ls2-progress { height: 2px; background: var(--ls2-fill); }
.ls2-progress span { height: 100%; display: block; background: var(--ls2-accent); transition: width .2s ease; }

.ls2-empty { min-height: 175px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 22px; text-align: center; }
.ls2-empty-icon { width: 48px; height: 48px; display: grid; place-items: center; margin-bottom: 11px; border: 1px solid color-mix(in srgb, var(--ls2-accent) 28%, var(--ls2-line)); border-radius: var(--ls2-radius-lg); color: var(--ls2-accent); background: var(--ls2-accent-soft); }
.ls2-empty strong { font-size: 15px; }
.ls2-empty p { max-width: 390px; margin-top: 5px; color: var(--ls2-muted); font-size: 12px; line-height: 1.5; }
.ls2-empty-action { margin-top: 14px; }

.ls2-cue-monitor {
  min-width: 0; min-height: 52px; display: grid; grid-template-columns: auto minmax(0,1fr) auto auto; align-items: center; gap: 10px;
  padding: 8px 9px 8px 12px; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius);
  background: linear-gradient(90deg,var(--ls2-fill),transparent),var(--ls2-panel);
  box-shadow: inset 3px 0 0 color-mix(in srgb,var(--ls2-accent) 65%,transparent);
}
.ls2-cue-monitor[data-tone="danger"] { box-shadow: inset 3px 0 0 var(--ls2-danger); }
.ls2-cue-monitor[data-tone="success"] { box-shadow: inset 3px 0 0 var(--ls2-success); }
.ls2-cue-monitor[data-tone="warning"] { box-shadow: inset 3px 0 0 var(--ls2-warning); }
.ls2-cue-monitor-light { width: 8px; height: 8px; border-radius: 50%; background: var(--ls2-accent); box-shadow: 0 0 0 4px var(--ls2-accent-soft); }
.ls2-cue-monitor[data-tone="danger"] .ls2-cue-monitor-light { background: var(--ls2-danger); box-shadow: 0 0 0 4px color-mix(in srgb,var(--ls2-danger) 12%,transparent); }
.ls2-cue-monitor[data-tone="success"] .ls2-cue-monitor-light { background: var(--ls2-success); box-shadow: 0 0 0 4px color-mix(in srgb,var(--ls2-success) 12%,transparent); }
.ls2-detector-state { min-width: 0; }
.ls2-detector-state > div { min-width: 0; display: flex; flex-direction: column; }
.ls2-detector-state strong { overflow: hidden; font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
.ls2-cue-monitor-label { color: var(--ls2-dim); font-size: 10px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
.ls2-cue-monitor-meta { color: var(--ls2-dim); font-size: 11px; white-space: nowrap; }

.ls2-onboarding { display: grid; gap: 12px; }
.ls2-onboarding-stage {
  position: relative; min-height: 430px; display: flex; align-items: flex-end; overflow: hidden;
  border: 1px solid color-mix(in srgb,var(--ls2-accent) 20%,var(--ls2-line)); border-radius: var(--ls2-radius-lg);
  background:
    radial-gradient(ellipse at 50% 30%,color-mix(in srgb,var(--ls2-accent) 10%,transparent),transparent 48%),
    linear-gradient(180deg,var(--ls2-canvas),color-mix(in srgb,var(--ls2-panel) 75%,var(--ls2-canvas)));
  box-shadow: var(--ls2-shadow-sm),inset 0 1px 0 color-mix(in srgb,var(--ls2-text) 5%,transparent);
}
.ls2-rig { position: absolute; inset: 0 0 40%; overflow: hidden; pointer-events: none; }
.ls2-rig-bar { position: absolute; top: 27px; left: 9%; right: 9%; height: 1px; background: var(--ls2-line-hover); box-shadow: 0 8px 0 var(--ls2-line-subtle); }
.ls2-rig-bar::before, .ls2-rig-bar::after { content: ""; position: absolute; top: -9px; width: 1px; height: 19px; background: var(--ls2-line-hover); }
.ls2-rig-bar::before { left: 13%; }
.ls2-rig-bar::after { right: 13%; }
.ls2-rig-lamp { position: absolute; top: 22px; width: 15px; height: 12px; border: 1px solid var(--ls2-line-hover); border-radius: 4px 4px 7px 7px; background: var(--ls2-raised); }
.ls2-rig-lamp::before { content: ""; position: absolute; left: 4px; top: -6px; width: 5px; height: 6px; border-left: 1px solid var(--ls2-line-hover); border-right: 1px solid var(--ls2-line-hover); }
.ls2-rig-lamp-left { left: 23%; transform: rotate(14deg); }
.ls2-rig-lamp-center { left: calc(50% - 7px); }
.ls2-rig-lamp-right { right: 23%; transform: rotate(-14deg); }
.ls2-rig-beam { position: absolute; top: 35px; width: 130px; height: 180px; opacity: .4; background: linear-gradient(180deg,color-mix(in srgb,var(--ls2-accent) 15%,transparent),transparent 85%); clip-path: polygon(47% 0,53% 0,100% 100%,0 100%); }
.ls2-rig-beam-left { left: 3%; transform: rotate(-8deg); transform-origin: top center; }
.ls2-rig-beam-center { left: calc(50% - 65px); opacity: .65; }
.ls2-rig-beam-right { right: 3%; transform: rotate(8deg); transform-origin: top center; }
.ls2-rig-mark { position: absolute; left: 50%; bottom: 3px; width: 60px; height: 60px; display: grid; place-items: center; border: 1px solid color-mix(in srgb,var(--ls2-accent) 35%,var(--ls2-line)); border-radius: 50%; color: var(--ls2-accent); background: var(--ls2-accent-soft); transform: translateX(-50%); box-shadow: 0 0 45px var(--ls2-accent-soft); }
.ls2-rig-floor { position: absolute; left: 10%; right: 10%; bottom: -7px; height: 1px; background: linear-gradient(90deg,transparent,var(--ls2-line-hover),transparent); }
.ls2-onboarding-copy {
  position: relative; z-index: 2; width: 100%; padding: 30px 28px 27px;
  border-top: 1px solid var(--ls2-line-subtle);
  background: linear-gradient(180deg,color-mix(in srgb,var(--ls2-panel) 78%,transparent),var(--ls2-panel));
  backdrop-filter: blur(14px);
}
.ls2-kicker { display: inline-flex; align-items: center; gap: 7px; color: var(--ls2-muted); font-size: 10px; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; }
.ls2-kicker > span { width: 18px; height: 1px; background: var(--ls2-accent); }
.ls2-onboarding-copy h3 { max-width: 440px; margin-top: 8px; font-size: 23px; line-height: 1.15; letter-spacing: -.025em; }
.ls2-onboarding-copy p { max-width: 530px; margin-top: 9px; color: var(--ls2-muted); font-size: 13px; line-height: 1.55; }
.ls2-onboarding-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }

.ls2-cue-sheet { overflow: hidden; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-lg); background: var(--ls2-panel); box-shadow: var(--ls2-shadow-sm); }
.ls2-cue-sheet-head { min-height: 62px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 14px; }
.ls2-cue-sheet-head > div { display: flex; flex-direction: column; gap: 2px; }
.ls2-cue-sheet-head strong { font-size: 15px; }
.ls2-cue-sheet-head > span { color: var(--ls2-muted); font-size: 12px; font-variant-numeric: tabular-nums; }
.ls2-cue-progress { height: 2px; background: var(--ls2-fill); }
.ls2-cue-progress > span { height: 100%; display: block; background: var(--ls2-accent); transition: width var(--ls2-transition); }
.ls2-cue-steps > button {
  appearance: none; width: 100%; min-height: 64px; display: grid; grid-template-columns: 28px 34px minmax(0,1fr) auto; align-items: center; gap: 9px;
  padding: 9px 13px; border: 0; border-top: 1px solid var(--ls2-line-subtle); color: var(--ls2-muted); background: transparent; text-align: left; cursor: pointer; transition: all var(--ls2-transition);
}
.ls2-cue-steps > button:hover { color: var(--ls2-text); background: var(--ls2-fill-hover); }
.ls2-cue-steps > button[data-done="true"] { color: var(--ls2-text); }
.ls2-cue-index { color: var(--ls2-dim); font: 11px/1 var(--lumiverse-font-mono,ui-monospace,monospace); }
.ls2-cue-steps > button[data-done="true"] .ls2-cue-index { color: var(--ls2-success); }
.ls2-cue-icon { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm); color: var(--ls2-accent); background: var(--ls2-fill); }
.ls2-cue-copy { min-width: 0; display: flex; flex-direction: column; }
.ls2-cue-copy strong, .ls2-cue-copy small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-cue-copy strong { color: inherit; font-size: 13px; }
.ls2-cue-copy small { margin-top: 2px; color: var(--ls2-dim); font-size: 11px; }

.ls2-scene { position: relative; }
.ls2-scene-head { display: flex; align-items: end; justify-content: space-between; gap: 10px; padding: 14px 15px 10px; }
.ls2-scene-head h3 { margin-top: 2px; font-size: 17px; }
.ls2-scene-head > span { color: var(--ls2-muted); font-size: 12px; }
.ls2-scene-cast { display: grid; grid-template-columns: repeat(auto-fit,minmax(145px,1fr)); gap: 1px; border-top: 1px solid var(--ls2-line); background: var(--ls2-line); }
.ls2-scene-actor { min-width: 0; background: var(--ls2-panel); }
.ls2-scene-media { position: relative; height: 235px; overflow: hidden; background: var(--lumiverse-card-image-bg, var(--ls2-canvas)); }
.ls2-scene-media-file { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; }
.ls2-scene-actor[data-focused="true"] .ls2-scene-media { box-shadow: inset 0 -3px 0 var(--ls2-accent); }
.ls2-focus-flag { position: absolute; top: 9px; left: 9px; display: inline-flex; align-items: center; gap: 4px; padding: 4px 7px; border: 1px solid color-mix(in srgb, var(--ls2-accent) 35%, var(--ls2-line)); border-radius: 999px; color: var(--ls2-accent); background: var(--ls2-glass); backdrop-filter: blur(var(--ls2-glass-blur)); font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
.ls2-scene-actor-copy { min-width: 0; padding: 10px 11px 12px; }
.ls2-scene-actor-copy strong, .ls2-scene-actor-copy span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-scene-actor-copy strong { font-size: 13px; }
.ls2-scene-actor-copy span { margin-top: 2px; color: var(--ls2-muted); font-size: 11px; }

.ls2-metric-grid { display: grid; grid-template-columns: repeat(3,1fr); overflow: hidden; border-top: 1px solid var(--ls2-line-subtle); border-bottom: 1px solid var(--ls2-line-subtle); }
.ls2-metric-grid > div { min-width: 0; display: grid; grid-template-columns: auto minmax(0,1fr); align-items: center; gap: 9px; padding: 11px 13px; border-left: 1px solid var(--ls2-line-subtle); color: var(--ls2-accent); background: transparent; }
.ls2-metric-grid > div:first-child { border-left: 0; }
.ls2-metric-grid span { min-width: 0; color: var(--ls2-muted); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; }
.ls2-metric-grid strong { display: block; color: var(--ls2-text); font-size: 15px; line-height: 1.1; }

.ls2-library-context { display: grid; grid-template-columns: auto minmax(0,1fr) minmax(120px,auto); align-items: center; gap: 9px; }
.ls2-context-avatar { width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid color-mix(in srgb, var(--ls2-accent) 25%, var(--ls2-line)); border-radius: 11px; color: var(--ls2-accent); background: var(--ls2-accent-soft); font-size: 12px; font-weight: 800; }
.ls2-library-context > div { min-width: 0; display: flex; flex-direction: column; }
.ls2-library-context strong, .ls2-library-context span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-library-context strong { font-size: 13px; }
.ls2-library-context span { color: var(--ls2-muted); font-size: 11px; }
.ls2-actor-select { min-width: 120px; width: auto; }
.ls2-folder-section { min-width: 0; }
.ls2-folder-section .ls2-section-title { align-items: center; margin-bottom: 7px; padding: 0 2px; }
.ls2-folder-strip { display: flex; gap: 7px; padding: 1px 1px 5px; overflow-x: auto; scrollbar-width: thin; scrollbar-color: var(--lcs-scrollbar-thumb,var(--ls2-line)) transparent; }
.ls2-folder-button {
  flex: 0 0 auto; min-width: 130px; max-width: 190px; display: grid; grid-template-columns: 30px minmax(0,1fr); align-items: center; gap: 8px;
  padding: 7px 9px 7px 7px; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius);
  color: var(--ls2-muted); background: var(--ls2-fill); text-align: left; cursor: pointer; transition: all var(--ls2-transition);
}
.ls2-folder-button:hover { color: var(--ls2-text); border-color: var(--ls2-line-hover); background: var(--ls2-fill-hover); }
.ls2-folder-button[data-active="true"] { color: var(--ls2-text); border-color: color-mix(in srgb, var(--ls2-accent) 35%, var(--ls2-line)); background: var(--ls2-accent-soft); box-shadow: inset 0 -2px 0 var(--ls2-accent); }
.ls2-folder-icon { width: 30px; height: 30px; display: grid; place-items: center; border-radius: 9px; color: var(--ls2-accent); background: var(--ls2-panel); }
.ls2-folder-button > span:last-child { min-width: 0; display: flex; flex-direction: column; }
.ls2-folder-button strong, .ls2-folder-button small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-folder-button strong { font-size: 12px; }
.ls2-folder-button small { color: var(--ls2-dim); font-size: 10px; }

.ls2-library-toolbar { display: flex; align-items: center; gap: 8px; padding: 10px; border-bottom: 1px solid var(--ls2-line); background: var(--ls2-fill); }
.ls2-library-subbar { min-height: 34px; display: flex; align-items: center; gap: 12px; padding: 5px 10px; border-bottom: 1px solid var(--ls2-line); color: var(--ls2-muted); font-size: 11px; }
.ls2-pagination { margin-left: auto; display: flex; align-items: center; gap: 4px; }
.ls2-pagination .ls2-icon-button { width: 25px; height: 25px; border-color: transparent; }
.ls2-pagination span { min-width: 36px; text-align: center; font-variant-numeric: tabular-nums; }
.ls2-asset-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(118px,1fr)); gap: 8px; padding: 10px; }
.ls2-asset-card { min-width: 0; overflow: hidden; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius); background: var(--ls2-fill); transition: all var(--ls2-transition); }
.ls2-asset-card:hover { border-color: var(--ls2-line-hover); transform: translateY(-1px); box-shadow: var(--ls2-shadow-sm); }
.ls2-asset-card[data-selected="true"] { border-color: var(--ls2-accent); box-shadow: 0 0 0 2px var(--ls2-accent-soft); }
.ls2-asset-card[data-inspected="true"] { box-shadow: inset 0 -2px 0 var(--ls2-accent); }
.ls2-asset-main { position: relative; width: 100%; height: 152px; display: block; padding: 0; border: 0; background: var(--lumiverse-card-image-bg, var(--ls2-canvas)); cursor: pointer; overflow: hidden; }
.ls2-asset-media, .ls2-expression-choice-media { width: 100%; height: 100%; object-fit: cover; }
.ls2-asset-overlay { position: absolute; left: 0; right: 0; bottom: 0; padding: 24px 8px 7px; background: linear-gradient(transparent, var(--lumiverse-scene-text-scrim, color-mix(in srgb,var(--ls2-canvas) 88%,transparent))); text-align: left; }
.ls2-asset-overlay strong, .ls2-asset-overlay small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-asset-overlay strong { color: var(--ls2-text); font-size: 12px; }
.ls2-asset-overlay small { color: color-mix(in srgb, var(--ls2-text) 72%, transparent); font-size: 10px; }
.ls2-asset-check { position: absolute; top: 7px; right: 7px; width: 21px; height: 21px; display: grid; place-items: center; border: 1px solid var(--ls2-glass-border); border-radius: 7px; color: var(--ls2-muted); background: var(--ls2-glass); backdrop-filter: blur(var(--ls2-glass-blur)); }
.ls2-asset-card[data-selected="true"] .ls2-asset-check { color: var(--ls2-accent-fg); border-color: var(--ls2-accent); background: var(--ls2-accent); }
.ls2-media-fallback { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; color: var(--ls2-dim); background: var(--ls2-fill); font-size: 10px; }

.ls2-inspector { border-color: color-mix(in srgb, var(--ls2-accent) 25%, var(--ls2-line)); }
.ls2-disclosure { overflow: hidden; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius); background: var(--ls2-panel); }
.ls2-disclosure summary { min-height: 43px; display: flex; align-items: center; justify-content: space-between; padding: 9px 12px; color: var(--ls2-muted); cursor: pointer; list-style: none; font-size: 12px; font-weight: 700; }
.ls2-disclosure summary::-webkit-details-marker { display: none; }
.ls2-disclosure summary > span { display: flex; align-items: center; gap: 7px; }
.ls2-disclosure[open] summary { color: var(--ls2-text); border-bottom: 1px solid var(--ls2-line); }
.ls2-disclosure[open] summary > svg { transform: rotate(180deg); }
.ls2-disclosure-body { display: grid; gap: 12px; padding: 13px; }

.ls2-selection-hero { display: grid; grid-template-columns: auto minmax(0,1fr) auto; align-items: center; gap: 11px; }
.ls2-selection-icon { width: 42px; height: 42px; display: grid; place-items: center; border-radius: var(--ls2-radius); color: var(--ls2-accent); background: var(--ls2-accent-soft); }
.ls2-selection-hero > div:nth-child(2) { min-width: 0; display: flex; flex-direction: column; }
.ls2-selection-hero strong { font-size: 13px; }
.ls2-selection-hero span { color: var(--ls2-muted); font-size: 11px; }
.ls2-action-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
.ls2-rename-preview { display: grid; gap: 4px; margin: 0 0 11px; padding: 8px; border-radius: var(--ls2-radius-sm); background: var(--ls2-fill); }
.ls2-rename-preview > div { min-width: 0; display: grid; grid-template-columns: minmax(0,1fr) auto minmax(0,1fr); align-items: center; gap: 7px; font-size: 11px; }
.ls2-rename-preview span, .ls2-rename-preview strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-rename-preview span { color: var(--ls2-muted); text-decoration: line-through; }
.ls2-table-wrap { overflow: auto; }
.ls2-matrix { min-width: 100%; border-collapse: separate; border-spacing: 3px; font-size: 11px; }
.ls2-matrix th { padding: 5px 6px; color: var(--ls2-muted); font-weight: 700; text-align: left; white-space: nowrap; }
.ls2-matrix td { min-width: 40px; height: 30px; padding: 4px; border-radius: 6px; color: var(--ls2-dim); background: var(--ls2-fill); text-align: center; }
.ls2-matrix td[data-complete="true"] { color: var(--ls2-success); background: color-mix(in srgb, var(--ls2-success) 9%, var(--ls2-fill)); }
.ls2-matrix td svg { margin: auto; }
.ls2-count { color: var(--ls2-muted); font-size: 11px; }

.ls2-route-summary { display: grid; grid-template-columns: auto minmax(0,1fr) auto; align-items: center; gap: 11px; }
.ls2-route-icon, .ls2-settings-route-icon { width: 42px; height: 42px; display: grid; place-items: center; border: 1px solid color-mix(in srgb,var(--ls2-accent) 28%,var(--ls2-line)); border-radius: var(--ls2-radius); color: var(--ls2-accent); background: var(--ls2-accent-soft); }
.ls2-route-summary > div { min-width: 0; display: flex; flex-direction: column; }
.ls2-route-summary strong { overflow: hidden; margin-top: 2px; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.ls2-route-summary small { overflow: hidden; color: var(--ls2-muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }

.ls2-settings-route { border-color: color-mix(in srgb,var(--ls2-accent) 28%,var(--ls2-line)); }
.ls2-settings-route-hero { min-height: 78px; display: grid; grid-template-columns: auto minmax(0,1fr) auto; align-items: center; gap: 12px; padding: 14px; background: linear-gradient(120deg,var(--ls2-accent-soft),transparent 72%); }
.ls2-settings-route-icon { width: 46px; height: 46px; }
.ls2-settings-route-hero > div { min-width: 0; display: flex; flex-direction: column; }
.ls2-settings-route-hero strong, .ls2-settings-route-hero small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-settings-route-hero strong { margin-top: 3px; font-size: 15px; }
.ls2-settings-route-hero small { margin-top: 2px; color: var(--ls2-muted); font-size: 11px; }
.ls2-settings-route-form { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); align-items: end; gap: 11px; padding: 14px; border-top: 1px solid var(--ls2-line); }
.ls2-settings-route-form > .ls2-button { grid-column: 1/-1; justify-self: start; }
.ls2-connection-list { display: grid; gap: 6px; }
.ls2-connection-list > button {
  appearance: none; width: 100%; min-height: 56px; display: grid; grid-template-columns: 34px minmax(0,1fr) auto; align-items: center; gap: 10px;
  padding: 8px 10px; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm);
  color: var(--ls2-muted); background: var(--ls2-fill); text-align: left; cursor: pointer; transition: all var(--ls2-transition);
}
.ls2-connection-list > button:hover { color: var(--ls2-text); border-color: var(--ls2-line-hover); background: var(--ls2-fill-hover); }
.ls2-connection-list > button[data-selected="true"] { color: var(--ls2-text); border-color: var(--ls2-accent); background: var(--ls2-accent-soft); box-shadow: 0 0 0 2px var(--ls2-accent-soft); }
.ls2-connection-mark { width: 34px; height: 34px; display: grid; place-items: center; border: 1px solid var(--ls2-line); border-radius: 10px; color: var(--ls2-accent); background: var(--ls2-panel); font-size: 10px; font-weight: 800; }
.ls2-connection-list > button > span:nth-child(2) { min-width: 0; display: flex; flex-direction: column; }
.ls2-connection-list strong, .ls2-connection-list small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-connection-list strong { font-size: 12px; }
.ls2-connection-list small { margin-top: 2px; color: var(--ls2-dim); font-size: 10px; }
.ls2-connection-state { padding: 3px 7px; border: 1px solid var(--ls2-line); border-radius: 999px; color: var(--ls2-warning); font-size: 10px; font-weight: 700; }
.ls2-connection-state[data-ready="true"] { color: var(--ls2-success); border-color: color-mix(in srgb,var(--ls2-success) 30%,var(--ls2-line)); }
.ls2-permission-strip { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.ls2-permission-strip > span { display: inline-flex; align-items: center; gap: 5px; padding: 5px 7px; border: 1px solid var(--ls2-line); border-radius: 999px; color: var(--ls2-warning); background: var(--ls2-fill); font-size: 10px; text-transform: capitalize; }
.ls2-permission-strip > span[data-granted="true"] { color: var(--ls2-success); }

.ls2-appearance-preview { display: grid; grid-template-columns: minmax(190px,1.25fr) minmax(130px,.75fr); align-items: center; }
.ls2-preview-window { position: relative; min-height: 190px; overflow: hidden; border-right: 1px solid var(--ls2-line); background: var(--lumiverse-card-image-bg,var(--ls2-canvas)); }
.ls2-preview-toolbar { height: 27px; display: flex; align-items: center; gap: 4px; padding: 0 8px; border-bottom: 1px solid var(--ls2-glass-border); background: var(--ls2-glass); backdrop-filter: blur(var(--ls2-glass-blur)); }
.ls2-preview-toolbar span { width: 6px; height: 6px; border-radius: 50%; background: var(--ls2-line-hover); }
.ls2-preview-actors { position: absolute; inset: 40px 15px 25px; display: flex; align-items: flex-end; justify-content: center; }
.ls2-preview-actors i { width: 42%; height: 78%; margin-right: -12%; border: 1px solid var(--ls2-line); border-radius: 50% 50% 14px 14px; opacity: .45; background: linear-gradient(160deg,var(--ls2-accent-soft),var(--ls2-raised)); transform: scale(.95); }
.ls2-preview-actors i[data-focus] { z-index: 1; height: 92%; opacity: 1; border-color: var(--ls2-accent); transform: scale(1.04); }
.ls2-preview-caption { position: absolute; left: 10px; right: 10px; bottom: 8px; overflow: hidden; color: var(--ls2-muted); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; text-align: center; }
.ls2-preview-copy { padding: 15px; }
.ls2-preview-copy strong { display: block; font-size: 12px; }
.ls2-preview-copy span { display: block; margin-top: 4px; color: var(--ls2-muted); font-size: 11px; line-height: 1.5; }

.ls2-health-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 7px; }
.ls2-health-grid > div { min-width: 0; display: grid; grid-template-columns: 28px minmax(0,1fr); align-items: center; gap: 7px; padding: 8px; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius-sm); background: var(--ls2-fill); }
.ls2-health-grid > div > span { width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; color: var(--ls2-warning); background: color-mix(in srgb, var(--ls2-warning) 8%, transparent); }
.ls2-health-grid > div[data-good="true"] > span { color: var(--ls2-success); background: color-mix(in srgb, var(--ls2-success) 8%, transparent); }
.ls2-health-grid strong, .ls2-health-grid small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-transform: capitalize; }
.ls2-health-grid strong { font-size: 11px; }
.ls2-health-grid small { color: var(--ls2-dim); font-size: 10px; }
.ls2-issue-list { display: grid; gap: 5px; }
.ls2-issue-list > div { display: grid; grid-template-columns: auto minmax(0,1fr); align-items: start; gap: 8px; padding: 8px; border-radius: var(--ls2-radius-sm); color: var(--ls2-muted); background: var(--ls2-fill); font-size: 11px; }
.ls2-issue-list > div[data-tone="error"] { color: var(--ls2-danger); }
.ls2-diagnostic-output { max-height: 500px; margin: 0; padding: 13px; overflow: auto; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius); color: var(--ls2-muted); background: var(--ls2-canvas); font: 10px/1.55 var(--lumiverse-font-mono,ui-monospace,monospace); white-space: pre; }

.ls2-savebar {
  position: sticky; bottom: 0; z-index: 21; min-height: 56px; display: flex; align-items: center; justify-content: space-between; gap: 9px;
  padding: 9px 12px calc(9px + env(safe-area-inset-bottom)); border-top: 1px solid var(--ls2-glass-border);
  background: var(--ls2-glass); backdrop-filter: blur(var(--ls2-glass-blur)); box-shadow: 0 -8px 25px color-mix(in srgb,var(--ls2-canvas) 25%,transparent);
}
.ls2-savebar > div:first-child { display: flex; align-items: center; gap: 7px; color: var(--ls2-muted); font-size: 11px; }
.ls2-save-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ls2-success); }
.ls2-savebar[data-dirty="true"] .ls2-save-dot { background: var(--ls2-warning); box-shadow: 0 0 0 3px color-mix(in srgb,var(--ls2-warning) 12%,transparent); }

.ls2-modal { display: flex; flex-direction: column; gap: 14px; color: var(--ls2-text); }
.ls2-modal-actions { display: flex; align-items: center; justify-content: flex-end; gap: 8px; padding-top: 2px; }
.ls2-modal-section-head { display: flex; justify-content: space-between; gap: 8px; margin-bottom: 10px; }
.ls2-modal-section-head > div { display: flex; flex-direction: column; }
.ls2-modal-section-head strong { font-size: 12px; }
.ls2-modal-section-head span { color: var(--ls2-muted); font-size: 11px; }
.ls2-dropzone { position: relative; min-height: 185px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; border: 1px dashed var(--ls2-line-hover); border-radius: var(--ls2-radius); text-align: center; background: var(--ls2-fill); transition: all var(--ls2-transition); }
.ls2-dropzone:hover, .ls2-dropzone[data-dragging="true"] { border-color: var(--ls2-accent); background: var(--ls2-accent-soft); }
.ls2-dropzone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.ls2-dropzone .ls2-button { pointer-events: none; }
.ls2-dropzone-icon { width: 47px; height: 47px; display: grid; place-items: center; margin-bottom: 10px; border: 1px solid color-mix(in srgb,var(--ls2-accent) 28%,var(--ls2-line)); border-radius: var(--ls2-radius-lg); color: var(--ls2-accent); background: var(--ls2-accent-soft); }
.ls2-dropzone strong { font-size: 14px; }
.ls2-dropzone p { margin: 4px 0 12px; color: var(--ls2-muted); font-size: 11px; }
.ls2-mapping-preview { display: grid; gap: 4px; margin-top: 10px; padding: 8px; border-radius: var(--ls2-radius-sm); background: var(--ls2-fill); }
.ls2-mapping-preview > div { display: grid; grid-template-columns: auto minmax(0,1fr); align-items: center; gap: 6px; color: var(--ls2-muted); font-size: 11px; }
.ls2-mapping-preview span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-mapping-preview small { color: var(--ls2-dim); font-size: 10px; }

.ls2-picker-context { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 9px; }
.ls2-picker-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(130px,1fr)); gap: 8px; max-height: 410px; overflow: auto; padding: 2px; }
.ls2-expression-choice { position: relative; min-width: 0; overflow: hidden; display: grid; grid-template-rows: 128px auto; padding: 0; border: 1px solid var(--ls2-line); border-radius: var(--ls2-radius); color: var(--ls2-text); background: var(--ls2-fill); text-align: left; cursor: pointer; transition: all var(--ls2-transition); }
.ls2-expression-choice:hover { border-color: var(--ls2-line-hover); transform: translateY(-1px); }
.ls2-expression-choice[data-selected="true"] { border-color: var(--ls2-accent); box-shadow: 0 0 0 2px var(--ls2-accent-soft); }
.ls2-expression-choice > span:nth-child(2) { min-width: 0; display: flex; flex-direction: column; padding: 8px 9px; }
.ls2-expression-choice strong, .ls2-expression-choice small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-expression-choice strong { font-size: 12px; }
.ls2-expression-choice small { color: var(--ls2-muted); font-size: 10px; }
.ls2-choice-check { position: absolute; top: 7px; right: 7px; width: 22px; height: 22px; display: grid; place-items: center; border-radius: 7px; color: var(--ls2-accent-fg); background: var(--ls2-accent); box-shadow: var(--ls2-shadow-sm); }
.ls2-picker-footer { display: grid; grid-template-columns: minmax(220px,1fr) auto; align-items: center; gap: 10px; padding-top: 10px; border-top: 1px solid var(--ls2-line); }

.ls2-character-panel { min-height: 100%; display: flex; flex-direction: column; gap: 14px; padding: 18px; }
.ls2-character-hero { display: grid; grid-template-columns: 50px minmax(0,1fr); align-items: center; gap: 12px; }
.ls2-character-hero .ls2-context-avatar { width: 50px; height: 50px; border-radius: 15px; font-size: 13px; }
.ls2-character-hero h2 { margin-top: 3px; font-size: 20px; }
.ls2-character-hero p { margin-top: 4px; color: var(--ls2-muted); font-size: 12px; }
.ls2-loading { min-height: 190px; display: flex; align-items: center; justify-content: center; gap: 9px; color: var(--ls2-muted); font-size: 13px; }
.ls2-loading span { width: 16px; height: 16px; border: 2px solid var(--ls2-line); border-top-color: var(--ls2-accent); border-radius: 50%; animation: ls2-spin .8s linear infinite; }

.ls2-stage-root { width: 100%; height: 100%; position: relative; overflow: hidden; opacity: var(--ls2-stage-opacity,1); touch-action: none; }
.ls2-stage-chrome { width: 100%; height: 100%; position: relative; overflow: hidden; border-radius: var(--ls2-radius-lg); }
.ls2-stage-root[data-chrome="true"] .ls2-stage-chrome { border: 1px solid var(--ls2-glass-border); background: var(--ls2-glass); backdrop-filter: blur(var(--ls2-glass-blur)); box-shadow: var(--ls2-shadow); }
.ls2-stage-grab { position: absolute; top: 0; left: 0; right: 0; z-index: 5; min-height: 34px; display: flex; align-items: center; gap: 8px; padding: 5px 6px 5px 10px; opacity: 0; transform: translateY(-4px); transition: all var(--ls2-transition); }
.ls2-stage-root:hover .ls2-stage-grab, .ls2-stage-root:focus-within .ls2-stage-grab { opacity: 1; transform: none; }
.ls2-stage-live { display: inline-flex; align-items: center; gap: 6px; color: var(--ls2-muted); font-size: 10px; font-weight: 800; letter-spacing: .09em; text-transform: uppercase; }
.ls2-stage-live > span { width: 6px; height: 6px; border-radius: 50%; background: var(--ls2-accent); box-shadow: 0 0 0 3px var(--ls2-accent-soft); }
.ls2-stage-actions { margin-left: auto; display: flex; gap: 2px; }
.ls2-stage-actions button { width: 26px; height: 24px; display: grid; place-items: center; padding: 0; border: 0; border-radius: 7px; color: var(--ls2-muted); background: transparent; cursor: pointer; }
.ls2-stage-actions button:hover { color: var(--ls2-text); background: var(--ls2-fill-hover); }
.ls2-stage-ensemble { position: absolute; inset: 28px 4px 2px; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; }
.ls2-stage-actor { position: relative; flex: 1 1 0; height: 100%; min-width: 0; margin-left: calc(var(--ls2-stage-overlap, .34) * -18%); opacity: var(--ls2-stage-idle-opacity,.46); transform: scale(.96); transform-origin: center bottom; filter: saturate(.78); transition: opacity var(--ls2-stage-transition),transform var(--ls2-stage-transition),filter var(--ls2-stage-transition); }
.ls2-stage-actor:first-child { margin-left: 0; }
.ls2-stage-actor[data-focused="true"] { z-index: 2; opacity: 1; transform: scale(var(--ls2-stage-focus-scale,1.035)); filter: none; }
.ls2-stage-actor-frame { width: 100%; height: 100%; }
.ls2-stage-actor-frame :is(img,video) { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; }
.ls2-stage-root[data-transition="crossfade"] .ls2-stage-actor-frame :is(img,video) { animation: ls2-fade var(--ls2-stage-transition) ease-out; }
.ls2-stage-root[data-transition="lift"] .ls2-stage-actor-frame :is(img,video) { animation: ls2-lift var(--ls2-stage-transition) ease-out; }
.ls2-stage-actor figcaption { position: absolute; left: 6px; right: 6px; bottom: 7px; z-index: 3; min-width: 0; padding: 7px 8px; border: 1px solid var(--ls2-glass-border); border-radius: var(--ls2-radius-sm); background: var(--ls2-glass); backdrop-filter: blur(var(--ls2-glass-blur)); box-shadow: var(--ls2-shadow-sm); text-align: center; }
.ls2-stage-actor figcaption strong, .ls2-stage-actor figcaption span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls2-stage-actor figcaption strong { font-size: 11px; }
.ls2-stage-actor figcaption span { margin-top: 1px; color: var(--ls2-muted); font-size: 10px; }
.ls2-stage-waiting { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--ls2-muted); text-align: center; }
.ls2-stage-waiting > div { width: 44px; height: 44px; display: grid; place-items: center; margin-bottom: 8px; border: 1px solid color-mix(in srgb,var(--ls2-accent) 25%,var(--ls2-line)); border-radius: 14px; color: var(--ls2-accent); background: var(--ls2-accent-soft); }
.ls2-stage-waiting strong { color: var(--ls2-text); font-size: 13px; }
.ls2-stage-waiting span { margin-top: 2px; font-size: 10px; }
.ls2-stage-resize { position: absolute; right: 1px; bottom: 1px; z-index: 7; width: 23px; height: 23px; padding: 0; border: 0; background: transparent; cursor: nwse-resize; touch-action: none; }
.ls2-stage-resize span, .ls2-stage-resize::after { content: ""; position: absolute; right: 5px; bottom: 5px; width: 9px; height: 1px; background: var(--ls2-accent); transform: rotate(-45deg); transform-origin: right center; opacity: .7; }
.ls2-stage-resize::after { width: 5px; right: 4px; bottom: 9px; }

@keyframes ls2-enter { from { opacity: 0; transform: translateY(3px); } }
@keyframes ls2-spin { to { transform: rotate(360deg); } }
@keyframes ls2-fade { from { opacity: 0; } }
@keyframes ls2-lift { from { opacity: 0; transform: translateY(8px) scale(.99); } }

@media (min-width: 700px) {
  .ls2-content { padding: 20px 18px 92px; }
  .ls2-asset-grid { grid-template-columns: repeat(auto-fill,minmax(135px,1fr)); }
}
@container lumi-stage (max-width: 520px) {
  .ls2-content { padding: 15px 10px 90px; }
  .ls2-view-header { grid-template-columns: 1fr; align-items: start; }
  .ls2-view-actions { justify-content: flex-start; }
  .ls2-view-actions .ls2-button { flex: 1 1 0; }
  .ls2-cue-monitor { grid-template-columns: auto minmax(0,1fr) auto; }
  .ls2-cue-monitor-meta { display: none; }
  .ls2-onboarding-stage { min-height: 420px; }
  .ls2-onboarding-copy { padding: 26px 22px 23px; }
  .ls2-settings-route-form { grid-template-columns: 1fr; }
  .ls2-settings-route-form > .ls2-button { grid-column: auto; }
  .ls2-form-grid, .ls2-action-grid, .ls2-picker-context, .ls2-appearance-preview { grid-template-columns: 1fr; }
  .ls2-preview-window { border-right: 0; border-bottom: 1px solid var(--ls2-line); }
  .ls2-library-context { grid-template-columns: auto minmax(0,1fr); }
  .ls2-actor-select { grid-column: 1/-1; width: 100%; }
  .ls2-library-toolbar { align-items: stretch; flex-direction: column; }
  .ls2-library-toolbar .ls2-toolbar { justify-content: space-between; }
  .ls2-asset-grid { grid-template-columns: repeat(3,minmax(0,1fr)); gap: 6px; padding: 7px; }
  .ls2-asset-main { height: 135px; }
  .ls2-selection-hero { grid-template-columns: auto minmax(0,1fr); }
  .ls2-selection-hero > .ls2-toolbar { grid-column: 1/-1; }
  .ls2-health-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .ls2-picker-footer { grid-template-columns: 1fr; }
}
@container lumi-stage (max-width: 390px) {
  .ls2-nav { padding-inline: 7px; }
  .ls2-nav-primary { gap: 2px; }
  .ls2-nav-primary > button { gap: 5px; padding-inline: 5px; }
  .ls2-view-heading h2 { font-size: 19px; }
  .ls2-asset-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
  .ls2-metric-grid > div { grid-template-columns: 1fr; justify-items: center; text-align: center; padding: 8px 4px; }
  .ls2-onboarding-stage { min-height: 405px; }
  .ls2-onboarding-copy { padding: 24px 18px 20px; }
  .ls2-onboarding-copy h3 { font-size: 21px; }
  .ls2-onboarding-actions .ls2-button { flex: 1 1 100%; }
  .ls2-route-summary { grid-template-columns: auto minmax(0,1fr); }
  .ls2-route-summary > .ls2-button { grid-column: 1/-1; }
  .ls2-settings-route-hero { grid-template-columns: auto minmax(0,1fr); }
  .ls2-settings-route-hero > .ls2-status { grid-column: 2; justify-self: start; }
  .ls2-cue-steps > button { grid-template-columns: 24px 32px minmax(0,1fr) auto; padding-inline: 10px; }
  .ls2-folder-button { min-width: 118px; }
  .ls2-scene-cast { grid-template-columns: 1fr; }
  .ls2-scene-media { height: 280px; }
  .ls2-picker-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }
}
@media (max-width: 520px) {
  .ls2-modal .ls2-form-grid, .ls2-modal .ls2-picker-context { grid-template-columns: 1fr; }
  .ls2-modal .ls2-picker-footer { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .ls2-root *, .ls2-modal *, .ls2-stage-root * { scroll-behavior: auto !important; animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
}
`;
