export const LUMI_STAGE_CSS = String.raw`
body.ls-host-select-portals [data-spindle-component-portal],
body.ls-host-select-portals [class*="popoverPortal"] {
  z-index: 10005 !important;
}

:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form, .ls-stage-root) {
  --ls-bg: var(--lumiverse-bg);
  --ls-panel: color-mix(in srgb, var(--lumiverse-bg) 93%, var(--lumiverse-text) 7%);
  --ls-panel-raised: color-mix(in srgb, var(--lumiverse-bg) 88%, var(--lumiverse-text) 12%);
  --ls-panel-deep: color-mix(in srgb, var(--lumiverse-bg) 97%, var(--lumiverse-text) 3%);
  --ls-hover: var(--lumiverse-fill-hover);
  --ls-fill: var(--lumiverse-fill);
  --ls-fill-subtle: var(--lumiverse-fill-subtle);
  --ls-line: var(--lumiverse-border);
  --ls-line-hover: var(--lumiverse-border-hover, var(--lumiverse-border));
  --ls-text: var(--lumiverse-text);
  --ls-muted: var(--lumiverse-text-muted);
  --ls-dim: var(--lumiverse-text-dim);
  --ls-accent: var(--lumiverse-accent, var(--lumiverse-primary));
  --ls-accent-fg: var(--lumiverse-accent-fg, var(--lumiverse-bg));
  --ls-success: var(--lumiverse-success);
  --ls-warning: var(--lumiverse-warning);
  --ls-danger: var(--lumiverse-danger);
  --ls-radius: var(--lumiverse-radius);
  --ls-radius-sm: max(6px, calc(var(--ls-radius) * .72));
  --ls-radius-lg: max(12px, calc(var(--ls-radius) * 1.3));
  --ls-accent-soft: color-mix(in srgb, var(--ls-accent) 11%, transparent);
  --ls-shadow-sm: var(--lumiverse-shadow-sm, 0 5px 16px color-mix(in srgb, var(--ls-bg) 42%, transparent));
  --ls-shadow-md: var(--lumiverse-shadow-md, 0 14px 38px color-mix(in srgb, var(--ls-bg) 54%, transparent));
  --ls-fast: var(--lumiverse-transition-fast, 140ms ease);
  box-sizing: border-box;
  color: var(--ls-text);
  font-size: calc(13px * var(--lumiverse-font-scale, 1));
  line-height: 1.45;
}
:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form, .ls-stage-root) *,
:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form, .ls-stage-root) *::before,
:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form, .ls-stage-root) *::after { box-sizing: border-box; }
:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form, .ls-stage-root) button,
:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form) input { font: inherit; }
:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form, .ls-stage-root) button:focus-visible,
:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form) input:focus-visible {
  outline: 2px solid var(--ls-accent);
  outline-offset: 2px;
}
:where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-modal-form, .ls-stage-root) svg {
  display: block;
}

.ls-kicker {
  display: block;
  color: var(--ls-accent);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .16em;
  line-height: 1.2;
  text-transform: uppercase;
}
.ls-toolbar { display: flex; align-items: center; gap: 7px; flex-wrap: wrap; }
.ls-button {
  appearance: none;
  min-width: 0;
  min-height: 35px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 12px;
  border: 1px solid var(--ls-line);
  border-radius: var(--ls-radius-sm);
  background: linear-gradient(145deg, var(--ls-panel-raised), var(--ls-panel));
  color: var(--ls-text);
  cursor: pointer;
  font-weight: 650;
  box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 5%, transparent);
  transition: background var(--ls-fast), border-color var(--ls-fast), box-shadow var(--ls-fast), transform var(--ls-fast);
}
.ls-button > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-button:hover:not(:disabled) { background: var(--ls-hover); border-color: var(--ls-line-hover); box-shadow: var(--ls-shadow-sm); transform: translateY(-1px); }
.ls-button:active:not(:disabled) { box-shadow: none; transform: translateY(0); }
.ls-button:disabled { opacity: .45; cursor: default; }
.ls-button-primary { border-color: color-mix(in srgb, var(--ls-accent) 72%, var(--ls-line)); background: linear-gradient(145deg, color-mix(in srgb, var(--ls-accent) 88%, var(--ls-text) 12%), var(--ls-accent)); color: var(--ls-accent-fg); }
.ls-button-primary:hover:not(:disabled) { background: color-mix(in srgb, var(--ls-accent) 86%, var(--ls-text) 14%); box-shadow: 0 7px 20px color-mix(in srgb, var(--ls-accent) 22%, transparent); }
.ls-button-ghost { background: transparent; border-color: transparent; color: var(--ls-muted); }
.ls-button-danger { color: var(--ls-danger); border-color: color-mix(in srgb, var(--ls-danger) 38%, var(--ls-line)); background: color-mix(in srgb, var(--ls-danger) 7%, var(--ls-panel)); }
.ls-button-small { min-height: 30px; padding: 0 9px; font-size: 11px; }
.ls-icon-button {
  width: 32px;
  height: 32px;
  display: inline-grid;
  place-items: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--ls-muted);
  cursor: pointer;
  transition: background var(--ls-fast), color var(--ls-fast), border-color var(--ls-fast);
}
.ls-icon-button:hover:not(:disabled), .ls-icon-button[data-active="true"] { background: var(--ls-hover); border-color: var(--ls-line); color: var(--ls-text); }
.ls-icon-button[data-danger="true"]:hover:not(:disabled) { color: var(--ls-danger); border-color: color-mix(in srgb, var(--ls-danger) 35%, var(--ls-line)); }
.ls-icon-button:disabled { opacity: .32; cursor: default; }
.ls-field { min-width: 0; display: flex; flex-direction: column; gap: 6px; }
.ls-field-label { color: var(--ls-text); font-size: 11px; font-weight: 700; }
.ls-field-hint { color: var(--ls-dim); font-size: 10px; line-height: 1.4; }
.ls-input {
  width: 100%;
  height: 36px;
  padding: 0 10px;
  border: 1px solid var(--ls-line);
  border-radius: 8px;
  background: var(--ls-panel-deep);
  color: var(--ls-text);
  outline: 0;
  transition: background var(--ls-fast), border-color var(--ls-fast), box-shadow var(--ls-fast);
}
.ls-input:hover { border-color: var(--ls-line-hover); }
.ls-input:focus { border-color: var(--ls-accent); background: var(--ls-panel); box-shadow: 0 0 0 3px var(--ls-accent-soft); }
.ls-native-control { min-width: 0; }
.ls-native-pagination { padding: 10px 18px 14px; border-top: 1px solid var(--ls-line); background: var(--ls-bg); }
.ls-native-badge { display: inline-flex; }
.ls-status {
  min-width: 0;
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 7px;
  overflow: hidden;
  border: 1px solid var(--ls-line);
  border-radius: 999px;
  background: var(--ls-fill-subtle);
  color: var(--ls-muted);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.2;
}
.ls-status-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-status-dot { width: 6px; height: 6px; flex: 0 0 auto; border-radius: 50%; background: var(--ls-dim); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ls-dim) 12%, transparent); }
.ls-status[data-tone="success"] { color: var(--ls-success); border-color: color-mix(in srgb, var(--ls-success) 32%, var(--ls-line)); background: color-mix(in srgb, var(--ls-success) 8%, transparent); }
.ls-status[data-tone="success"] .ls-status-dot { background: var(--ls-success); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ls-success) 14%, transparent); }
.ls-status[data-tone="warning"] { color: var(--ls-warning); border-color: color-mix(in srgb, var(--ls-warning) 32%, var(--ls-line)); background: color-mix(in srgb, var(--ls-warning) 8%, transparent); }
.ls-status[data-tone="warning"] .ls-status-dot { background: var(--ls-warning); }
.ls-status[data-tone="danger"] { color: var(--ls-danger); border-color: color-mix(in srgb, var(--ls-danger) 32%, var(--ls-line)); background: color-mix(in srgb, var(--ls-danger) 8%, transparent); }
.ls-status[data-tone="danger"] .ls-status-dot { background: var(--ls-danger); }
.ls-status[data-tone="accent"] { color: var(--ls-accent); border-color: color-mix(in srgb, var(--ls-accent) 32%, var(--ls-line)); background: var(--ls-accent-soft); }
.ls-status[data-tone="accent"] .ls-status-dot { background: var(--ls-accent); }
.ls-search {
  min-width: 190px;
  flex: 1 1 280px;
  height: 36px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  border: 1px solid var(--ls-line);
  border-radius: 9px;
  background: var(--ls-panel-deep);
  color: var(--ls-dim);
}
.ls-search:focus-within { border-color: var(--ls-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ls-accent) 14%, transparent); }
.ls-search input { min-width: 0; flex: 1; border: 0; outline: 0; background: transparent; color: var(--ls-text); }
.ls-search button { width: 24px; height: 24px; display: grid; place-items: center; border: 0; background: transparent; color: var(--ls-dim); cursor: pointer; }
.ls-empty { min-height: 230px; display: grid; place-items: center; align-content: center; gap: 9px; padding: 28px; text-align: center; color: var(--ls-muted); }
.ls-empty-icon { width: 48px; height: 48px; display: grid; place-items: center; border: 1px solid var(--ls-line); border-radius: 15px; background: var(--ls-panel-raised); color: var(--ls-accent); }
.ls-empty > strong { color: var(--ls-text); font-size: 15px; }
.ls-empty > p { max-width: 390px; margin: 0; color: var(--ls-muted); font-size: 12px; }
.ls-empty-action { margin-top: 5px; }
.ls-media-fallback { display: grid; place-items: center; align-content: center; gap: 6px; background: var(--ls-panel-deep); color: var(--ls-dim); }
.ls-media-fallback span { font-size: 9px; }
.ls-global-notice {
  position: absolute;
  z-index: 100;
  top: 12px;
  left: 50%;
  width: min(420px, calc(100% - 28px));
  transform: translateX(-50%);
  overflow: hidden;
  border: 1px solid var(--ls-line);
  border-radius: 10px;
  background: var(--ls-panel-raised);
  box-shadow: 0 12px 38px color-mix(in srgb, var(--ls-bg) 50%, transparent);
}
.ls-global-notice-copy { padding: 9px 12px; font-size: 11px; font-weight: 650; text-align: center; }
.ls-progress { height: 2px; background: var(--ls-fill); }
.ls-progress span { display: block; height: 100%; background: var(--ls-accent); transition: width var(--ls-fast); }

/* Drawer dashboard */
.ls-drawer {
  position: relative;
  min-width: 0;
  min-height: 100%;
  padding: 18px 18px calc(18px + env(safe-area-inset-bottom));
  background: var(--ls-bg);
  background-image: radial-gradient(circle at 100% 0, color-mix(in srgb, var(--ls-accent) 8%, transparent), transparent 34%);
  color: var(--ls-text);
}
.ls-drawer-cue-line { min-width: 0; display: flex; align-items: center; gap: 9px; margin-bottom: 18px; }
.ls-drawer-cue-rule { width: 30px; height: 1px; flex: 0 0 auto; background: var(--ls-accent); box-shadow: 12px 0 22px var(--ls-accent); }
.ls-drawer-cue-line > small { min-width: 0; flex: 1 1 auto; overflow: hidden; color: var(--ls-dim); font-size: 8px; font-weight: 800; letter-spacing: .16em; text-overflow: ellipsis; white-space: nowrap; }
.ls-drawer-cue-line > .ls-status { max-width: min(44%, 150px); flex: 0 1 auto; }
.ls-drawer-context { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.ls-drawer-context > div { min-width: 0; }
.ls-drawer-context h2 { margin: 5px 0 3px; font-size: 20px; line-height: 1.1; letter-spacing: -.02em; }
.ls-drawer-context p { margin: 0; overflow-wrap: anywhere; color: var(--ls-muted); font-size: 11px; }
.ls-current-preview {
  position: relative;
  min-height: 185px;
  display: grid;
  grid-template-columns: minmax(100px, 42%) 1fr;
  align-items: end;
  gap: 14px;
  overflow: hidden;
  margin-bottom: 12px;
  padding: 14px;
  border: 1px solid var(--ls-line);
  border-radius: var(--ls-radius-lg);
  background:
    radial-gradient(circle at 48% 35%, color-mix(in srgb, var(--ls-accent) 8%, transparent), transparent 55%),
    linear-gradient(145deg, var(--ls-panel), var(--ls-panel-deep));
  box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent), var(--ls-shadow-sm);
}
.ls-current-preview::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, transparent 49.8%, color-mix(in srgb, var(--ls-line) 45%, transparent) 50%, transparent 50.2%),
    linear-gradient(0deg, transparent 49.8%, color-mix(in srgb, var(--ls-line) 28%, transparent) 50%, transparent 50.2%);
  background-size: 38px 38px;
  mask-image: linear-gradient(to top, black, transparent 70%);
}
.ls-current-preview-media { position: relative; z-index: 1; width: 100%; height: 160px; object-fit: contain; }
.ls-current-preview > div:last-child { position: relative; z-index: 1; padding-bottom: 10px; }
.ls-current-preview > div:last-child strong { display: block; margin: 5px 0 2px; font-size: 15px; }
.ls-current-preview > div:last-child small { display: block; color: var(--ls-muted); font-size: 10px; }
.ls-current-preview-empty { min-height: 150px; grid-template-columns: 44px 1fr; align-items: center; }
.ls-current-preview-empty > span { position: relative; z-index: 1; width: 44px; height: 44px; display: grid; place-items: center; border: 1px solid color-mix(in srgb, var(--ls-accent) 30%, var(--ls-line)); border-radius: 14px; background: var(--ls-accent-soft); color: var(--ls-accent); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 5%, transparent); }
.ls-current-preview-empty small { margin-top: 2px; }
.ls-drawer-status {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 12px;
  border: 1px solid var(--ls-line);
  border-radius: 10px;
  background: linear-gradient(110deg, color-mix(in srgb, var(--ls-accent) 5%, var(--ls-panel)), var(--ls-panel-deep));
  box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent);
}
.ls-drawer-status > div { min-width: 0; flex: 1 1 auto; display: flex; align-items: center; gap: 9px; }
.ls-drawer-status > div > span:last-child { min-width: 0; }
.ls-status-icon { width: 30px; height: 30px; flex: 0 0 auto; display: grid; place-items: center; border: 1px solid color-mix(in srgb, var(--ls-accent) 18%, var(--ls-line)); border-radius: 9px; background: var(--ls-accent-soft); color: var(--ls-accent); }
.ls-drawer-status strong, .ls-drawer-status small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-drawer-status strong { font-size: 11px; }
.ls-drawer-status small { color: var(--ls-dim); font-size: 9px; }
.ls-cue-dot { width: 7px; height: 7px; flex: 0 0 auto; border-radius: 50%; background: var(--ls-dim); }
.ls-cue-dot[data-live="true"] { background: var(--ls-success); box-shadow: 0 0 0 4px color-mix(in srgb, var(--ls-success) 12%, transparent); }
.ls-drawer-primary-actions { display: grid; grid-template-columns: 1fr auto; gap: 8px; margin: 14px 0 10px; }
.ls-drawer-primary-actions .ls-button { min-height: 38px; }
.ls-drawer-utility { overflow: hidden; border: 1px solid var(--ls-line); border-radius: 10px; background: color-mix(in srgb, var(--ls-panel) 72%, transparent); }
.ls-drawer-utility button {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px;
  border: 0;
  background: transparent;
  color: var(--ls-muted);
  cursor: pointer;
  text-align: left;
  transition: background var(--ls-fast), color var(--ls-fast);
}
.ls-drawer-utility button + button { border-top: 1px solid var(--ls-line); }
.ls-drawer-utility button:hover:not(:disabled) { background: var(--ls-hover); color: var(--ls-text); }
.ls-drawer-utility button:disabled { opacity: .4; cursor: default; }
.ls-drawer-empty { display: flex; align-items: flex-start; gap: 9px; margin-top: 12px; padding: 11px; border: 1px dashed color-mix(in srgb, var(--ls-accent) 22%, var(--ls-line)); border-radius: 9px; background: color-mix(in srgb, var(--ls-accent) 5%, var(--ls-panel)); color: var(--ls-muted); font-size: 10px; }
.ls-drawer-empty svg { flex: 0 0 auto; color: var(--ls-accent); }

.ls-debug-panel { min-width: 0; overflow: hidden; margin-top: 16px; border: 1px solid var(--ls-line); border-radius: 11px; background: linear-gradient(155deg, var(--ls-panel), var(--ls-panel-deep)); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent), var(--ls-shadow-sm); }
.ls-debug-head { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 11px 12px; border-bottom: 1px solid var(--ls-line); background: color-mix(in srgb, var(--ls-panel-raised) 65%, transparent); }
.ls-debug-head > div { min-width: 0; }
.ls-debug-head strong, .ls-debug-head small { display: block; }
.ls-debug-head strong { margin-top: 3px; font-size: 12px; }
.ls-debug-head small { overflow: hidden; color: var(--ls-dim); font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
.ls-debug-head > .ls-button { flex: 0 0 auto; }
.ls-debug-scroll { height: clamp(240px, 40dvh, 420px); overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; padding: 10px; }
.ls-debug-empty { height: 100%; min-height: 180px; display: grid; place-items: center; align-content: center; gap: 8px; color: var(--ls-dim); font-size: 10px; text-align: center; }
.ls-debug-empty svg { color: var(--ls-accent); }
.ls-debug-run { min-width: 0; padding: 10px 0 14px; border-bottom: 1px solid color-mix(in srgb, var(--ls-line) 72%, transparent); }
.ls-debug-run:first-child { padding-top: 0; }
.ls-debug-run:last-child { padding-bottom: 0; border-bottom: 0; }
.ls-debug-run > header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.ls-debug-run > header > span { color: var(--ls-muted); font-size: 9px; font-weight: 700; }
.ls-debug-run > header > strong { padding: 2px 6px; border: 1px solid var(--ls-line); border-radius: 999px; background: var(--ls-panel-raised); color: var(--ls-muted); font-size: 7px; letter-spacing: .07em; text-transform: uppercase; }
.ls-debug-run > header > strong[data-status="running"] { border-color: color-mix(in srgb, var(--ls-accent) 38%, var(--ls-line)); color: var(--ls-accent); }
.ls-debug-run > header > strong[data-status="accepted"], .ls-debug-run > header > strong[data-status="cached"] { border-color: color-mix(in srgb, var(--ls-success) 38%, var(--ls-line)); color: var(--ls-success); }
.ls-debug-run > header > strong[data-status="rejected"], .ls-debug-run > header > strong[data-status="skipped"] { border-color: color-mix(in srgb, var(--ls-warning) 42%, var(--ls-line)); color: var(--ls-warning); }
.ls-debug-run > header > strong[data-status="cancelled"], .ls-debug-run > header > strong[data-status="error"] { border-color: color-mix(in srgb, var(--ls-danger) 40%, var(--ls-line)); color: var(--ls-danger); }
.ls-debug-run > small { display: block; margin: 4px 0 8px; overflow-wrap: anywhere; color: var(--ls-dim); font-size: 7px; line-height: 1.45; }
.ls-debug-bubble { max-width: 94%; overflow: hidden; border: 1px solid var(--ls-line); border-radius: 10px; }
.ls-debug-thinking { margin: 0 auto 7px 0; background: var(--ls-panel-raised); }
.ls-debug-thinking summary { min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 7px; padding: 8px 9px; color: var(--ls-muted); cursor: pointer; list-style: none; }
.ls-debug-thinking summary::-webkit-details-marker { display: none; }
.ls-debug-thinking summary > span { font-size: 9px; font-weight: 700; }
.ls-debug-thinking summary > small { overflow: hidden; color: var(--ls-dim); font-size: 7px; text-align: right; text-overflow: ellipsis; white-space: nowrap; }
.ls-debug-thinking summary > svg { transition: transform var(--ls-fast); }
.ls-debug-thinking[open] summary > svg { transform: rotate(180deg); }
.ls-debug-output { margin-left: auto; padding: 9px; border-color: color-mix(in srgb, var(--ls-accent) 24%, var(--ls-line)); background: color-mix(in srgb, var(--ls-accent) 6%, var(--ls-panel-deep)); }
.ls-debug-bubble-title { min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 7px; margin-bottom: 7px; }
.ls-debug-bubble-title > span { font-size: 9px; font-weight: 700; }
.ls-debug-bubble-title > small { overflow: hidden; color: var(--ls-dim); font-size: 7px; text-overflow: ellipsis; white-space: nowrap; }
.ls-debug-bubble pre { max-height: none; overflow: visible; margin: 0; padding: 8px; border: 1px solid color-mix(in srgb, var(--ls-line) 75%, transparent); border-radius: 7px; background: var(--ls-panel-deep); color: var(--ls-muted); font: 8px/1.45 ui-monospace, SFMono-Regular, Consolas, monospace; overflow-wrap: anywhere; white-space: pre-wrap; word-break: break-word; }
.ls-debug-thinking pre { border-width: 1px 0 0; border-radius: 0; }

/* Full Studio */
.ls-studio {
  position: relative;
  width: 100%;
  height: min(820px, calc(100dvh - 142px));
  min-height: 620px;
  display: grid;
  grid-template-rows: 58px minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid var(--ls-line);
  border-radius: calc(var(--ls-radius) * 1.1);
  background: var(--ls-bg);
  background-image: radial-gradient(circle at 50% 0, color-mix(in srgb, var(--ls-accent) 5%, transparent), transparent 36%);
  color: var(--ls-text);
  box-shadow: var(--ls-shadow-md);
}
.ls-studio-topbar {
  min-width: 0;
  display: grid;
  grid-template-columns: 210px 1fr minmax(260px, 380px);
  align-items: center;
  gap: 16px;
  padding: 0 14px;
  border-bottom: 1px solid var(--ls-line);
  background: color-mix(in srgb, var(--ls-panel) 96%, transparent);
  box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent);
  backdrop-filter: blur(12px);
}
.ls-studio-brand { min-width: 0; display: flex; align-items: center; gap: 9px; }
.ls-brand-mark { width: 32px; height: 32px; flex: 0 0 auto; display: grid; place-items: center; border: 1px solid color-mix(in srgb, var(--ls-accent) 35%, var(--ls-line)); border-radius: 9px; background: linear-gradient(145deg, var(--ls-accent-soft), var(--ls-panel-raised)); color: var(--ls-accent); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 6%, transparent), var(--ls-shadow-sm); }
.ls-studio-brand > span:last-child { min-width: 0; }
.ls-studio-brand strong, .ls-studio-brand small { display: block; }
.ls-studio-brand strong { overflow: hidden; font-size: 13px; letter-spacing: .01em; text-overflow: ellipsis; white-space: nowrap; }
.ls-studio-brand small { overflow: hidden; color: var(--ls-dim); font-size: 9px; text-overflow: ellipsis; white-space: nowrap; }
.ls-studio-topbar nav { height: 100%; display: flex; justify-content: center; gap: 2px; }
.ls-studio-topbar nav button {
  position: relative;
  min-width: 98px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 14px;
  border: 0;
  background: transparent;
  color: var(--ls-muted);
  cursor: pointer;
  font-size: 11px;
  font-weight: 700;
  transition: background var(--ls-fast), color var(--ls-fast);
}
.ls-studio-topbar nav button::after { content: ""; position: absolute; right: 16px; bottom: -1px; left: 16px; height: 2px; border-radius: 2px 2px 0 0; background: transparent; }
.ls-studio-topbar nav button:hover { color: var(--ls-text); background: var(--ls-fill-subtle); }
.ls-studio-topbar nav button[data-active="true"] { color: var(--ls-text); background: color-mix(in srgb, var(--ls-accent) 5%, transparent); }
.ls-studio-topbar nav button[data-active="true"]::after { background: var(--ls-accent); box-shadow: 0 -4px 12px color-mix(in srgb, var(--ls-accent) 25%, transparent); }
.ls-studio-context { min-width: 0; display: flex; justify-content: flex-end; align-items: center; gap: 8px; }
.ls-character-select { min-width: 180px; max-width: 260px; flex: 1; }
.ls-studio-content { min-height: 0; overflow: hidden; background: var(--ls-bg); }
.ls-page { height: 100%; overflow: auto; padding: 26px 30px; background: var(--ls-bg); }
.ls-page-center { height: 100%; display: grid; place-items: center; }
.ls-workspace-title { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid var(--ls-line); }
.ls-workspace-title > div:first-child { min-width: 0; }
.ls-workspace-title h2 { margin: 6px 0 4px; font-size: 24px; line-height: 1.05; letter-spacing: -.025em; }
.ls-workspace-title p { max-width: 620px; margin: 0; color: var(--ls-muted); font-size: 12px; }
.ls-workspace-actions { flex: 0 0 auto; }

/* Library */
.ls-library-view { height: 100%; min-height: 0; display: grid; grid-template-columns: 196px minmax(0, 1fr); background: var(--ls-bg); }
.ls-library-view:has(.ls-variant-tray) { grid-template-columns: 196px minmax(0, 1fr) 310px; }
.ls-outfit-rail { min-width: 0; display: grid; grid-template-rows: 58px minmax(0, 1fr) 34px; border-right: 1px solid var(--ls-line); background: linear-gradient(180deg, var(--ls-panel), var(--ls-panel-deep)); }
.ls-outfit-rail-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 10px 8px 14px; border-bottom: 1px solid var(--ls-line); }
.ls-outfit-rail-head strong { display: block; margin-top: 2px; font-size: 12px; }
.ls-outfit-list { overflow: auto; padding: 8px; }
.ls-outfit-list > button {
  position: relative;
  width: 100%;
  min-height: 48px;
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto;
  align-items: center;
  gap: 7px;
  margin-bottom: 4px;
  padding: 7px 8px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--ls-muted);
  cursor: pointer;
  text-align: left;
}
.ls-outfit-list > button { transition: background var(--ls-fast), border-color var(--ls-fast), color var(--ls-fast), transform var(--ls-fast); }
.ls-outfit-list > button:hover { background: var(--ls-hover); color: var(--ls-text); transform: translateX(1px); }
.ls-outfit-list > button[data-active="true"] { border-color: color-mix(in srgb, var(--ls-accent) 30%, var(--ls-line)); background: linear-gradient(90deg, var(--ls-accent-soft), var(--ls-panel-raised) 32%); color: var(--ls-text); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent); }
.ls-outfit-list > button[data-active="true"]::before { content: ""; position: absolute; top: 10px; bottom: 10px; left: -1px; width: 2px; border-radius: 0 2px 2px 0; background: var(--ls-accent); }
.ls-outfit-list button span { min-width: 0; }
.ls-outfit-list button strong, .ls-outfit-list button small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-outfit-list button strong { font-size: 11px; }
.ls-outfit-list button small { color: var(--ls-dim); font-size: 9px; }
.ls-outfit-list button i { color: var(--ls-accent); font-size: 8px; font-style: normal; text-transform: uppercase; }
.ls-outfit-rail-foot { display: flex; align-items: center; padding: 0 13px; border-top: 1px solid var(--ls-line); color: var(--ls-dim); font-size: 8px; }
.ls-outfit-rail-foot span { display: inline-flex; align-items: center; gap: 5px; }
.ls-library-main { min-width: 0; min-height: 0; display: grid; grid-template-rows: auto auto auto minmax(0, 1fr) auto; background: var(--ls-bg); }
.ls-library-toolbar { min-height: 62px; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 18px; border-bottom: 1px solid var(--ls-line); background: var(--ls-bg); }
.ls-outfit-title { min-width: 0; }
.ls-outfit-title input {
  max-width: min(430px, 65vw);
  display: block;
  margin: 2px 0 1px;
  padding: 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--ls-text);
  font-size: 18px;
  font-weight: 750;
  letter-spacing: -.015em;
}
.ls-outfit-title > span:last-child { color: var(--ls-dim); font-size: 9px; }
.ls-library-command-row { min-height: 54px; display: flex; align-items: center; gap: 10px; padding: 8px 18px; border-bottom: 1px solid var(--ls-line); background: color-mix(in srgb, var(--ls-panel) 94%, transparent); backdrop-filter: blur(10px); }
.ls-expression-scroll { min-height: 0; overflow: auto; padding: 18px; }
.ls-expression-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 13px; align-content: start; }
.ls-expression-card { min-width: 0; overflow: visible; border: 0; background: transparent; }
.ls-expression-card-hit { width: 100%; display: block; padding: 0; border: 0; background: transparent; color: var(--ls-text); cursor: pointer; text-align: left; }
.ls-expression-stack { position: relative; height: 174px; }
.ls-stack-back { position: absolute; border: 1px solid var(--ls-line); border-radius: 10px; background: var(--ls-panel-raised); }
.ls-stack-back-two { inset: 0 8px 10px 8px; transform: translateY(-5px); opacity: .45; }
.ls-stack-back-one { inset: 0 4px 5px 4px; transform: translateY(-2px); opacity: .72; }
.ls-expression-media {
  position: absolute;
  inset: 0 0 0;
  z-index: 2;
  width: 100%;
  height: 100%;
  border: 1px solid var(--ls-line);
  border-radius: 11px;
  background: var(--ls-panel-deep);
  object-fit: contain;
  transition: border-color var(--ls-fast), transform var(--ls-fast), box-shadow var(--ls-fast);
}
.ls-expression-card-hit:hover .ls-expression-media { border-color: var(--ls-line-hover); transform: translateY(-2px); box-shadow: 0 10px 24px color-mix(in srgb, var(--ls-bg) 35%, transparent); }
.ls-expression-card[data-inspected="true"] .ls-expression-media,
.ls-expression-card[data-selected="true"] .ls-expression-media { border-color: var(--ls-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ls-accent) 20%, transparent); }
.ls-default-flag, .ls-variant-count, .ls-card-check { position: absolute; z-index: 3; display: inline-flex; align-items: center; justify-content: center; border: 1px solid var(--ls-line); background: var(--ls-panel-raised); }
.ls-default-flag { top: 8px; left: 8px; min-height: 21px; padding: 0 7px; border-color: color-mix(in srgb, var(--ls-accent) 35%, var(--ls-line)); border-radius: 6px; color: var(--ls-accent); font-size: 8px; font-weight: 800; text-transform: uppercase; }
.ls-variant-count { right: 8px; bottom: 8px; min-width: 24px; height: 22px; padding: 0 6px; border-radius: 11px; color: var(--ls-muted); font-size: 9px; font-weight: 800; }
.ls-card-check { top: 8px; right: 8px; width: 23px; height: 23px; border-radius: 7px; color: var(--ls-accent-fg); }
.ls-card-check[data-selected="true"] { border-color: var(--ls-accent); background: var(--ls-accent); }
.ls-expression-copy { display: block; min-width: 0; padding: 9px 3px 0; }
.ls-expression-copy strong, .ls-expression-copy small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-expression-copy strong { font-size: 11px; }
.ls-expression-copy small { color: var(--ls-dim); font-size: 9px; }
.ls-batch-bar {
  display: grid;
  grid-template-columns: auto auto minmax(170px, 250px) auto;
  align-items: center;
  gap: 14px;
  padding: 9px 14px;
  border-bottom: 1px solid color-mix(in srgb, var(--ls-accent) 35%, var(--ls-line));
  background: var(--ls-panel-raised);
}
.ls-batch-count { display: grid; grid-template-columns: auto auto; column-gap: 5px; align-items: baseline; }
.ls-batch-count span { color: var(--ls-accent); font-size: 16px; font-weight: 800; }
.ls-batch-count strong { font-size: 10px; }
.ls-batch-count small { grid-column: 1 / -1; color: var(--ls-dim); font-size: 8px; }
.ls-batch-select-links { display: flex; gap: 8px; }
.ls-batch-select-links button { padding: 0; border: 0; background: transparent; color: var(--ls-accent); cursor: pointer; font-size: 9px; }
.ls-batch-destination { min-width: 0; }
.ls-variant-tray { min-width: 0; min-height: 0; overflow: auto; padding: 16px; border-left: 1px solid var(--ls-line); background: var(--ls-panel); }
.ls-tray-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--ls-line); }
.ls-tray-head h3 { margin: 4px 0 0; font-size: 16px; }
.ls-tray-actions { display: flex; gap: 6px; margin: 10px 0 14px; }
.ls-variant-list { display: flex; flex-direction: column; gap: 7px; }
.ls-variant-row { min-width: 0; display: grid; grid-template-columns: 54px minmax(0, 1fr) auto; align-items: center; gap: 8px; padding: 7px; border: 1px solid var(--ls-line); border-radius: 9px; background: var(--ls-panel-deep); transition: background var(--ls-fast), border-color var(--ls-fast), transform var(--ls-fast); }
.ls-variant-row:hover { border-color: var(--ls-line-hover); background: var(--ls-panel-raised); transform: translateY(-1px); }
.ls-variant-preview { width: 54px; height: 54px; padding: 0; overflow: hidden; border: 0; border-radius: 7px; background: var(--ls-fill-subtle); cursor: zoom-in; }
.ls-variant-preview > * { width: 100%; height: 100%; object-fit: contain; }
.ls-variant-row > span { min-width: 0; }
.ls-variant-row strong, .ls-variant-row small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-variant-row strong { font-size: 9px; }
.ls-variant-row small { color: var(--ls-dim); font-size: 8px; }
.ls-variant-row > div { display: flex; flex-direction: column; }
.ls-variant-row .ls-icon-button { width: 26px; height: 24px; }
.ls-tray-empty { display: flex; align-items: center; gap: 9px; padding: 14px; border: 1px dashed var(--ls-line); border-radius: 9px; color: var(--ls-muted); font-size: 9px; }
.ls-lightbox { height: min(720px, 76vh); display: grid; place-items: center; background: var(--ls-bg); }
.ls-lightbox > * { max-width: 100%; max-height: 100%; object-fit: contain; }

/* Live stage workspace */
.ls-live-stage-board { position: relative; min-height: 340px; overflow: hidden; border: 1px solid var(--ls-line); border-radius: var(--ls-radius-lg); background: linear-gradient(180deg, var(--ls-panel-deep), var(--ls-bg)); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent); }
.ls-live-stage-board::before { content: ""; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--ls-accent) 11%, transparent), transparent 58%); }
.ls-stage-board-grid { position: relative; min-height: 340px; display: flex; align-items: stretch; justify-content: center; gap: 16px; padding: 24px; }
.ls-stage-board-grid > article { min-width: 190px; max-width: 290px; flex: 1; display: grid; grid-template-rows: minmax(230px, 1fr) auto; overflow: hidden; border: 1px solid var(--ls-line); border-radius: 13px; background: var(--ls-panel); box-shadow: var(--ls-shadow-sm); transition: border-color var(--ls-fast), transform var(--ls-fast); }
.ls-stage-board-grid > article:hover { border-color: var(--ls-line-hover); transform: translateY(-2px); }
.ls-stage-board-grid > article[data-focused="true"] { border-color: color-mix(in srgb, var(--ls-accent) 45%, var(--ls-line)); box-shadow: 0 0 32px color-mix(in srgb, var(--ls-accent) 10%, transparent); }
.ls-live-character-media { min-height: 230px; padding: 10px 10px 0; }
.ls-live-character-media > * { width: 100%; height: 100%; object-fit: contain; }
.ls-live-character-copy { padding: 12px; border-top: 1px solid var(--ls-line); background: var(--ls-panel-raised); }
.ls-live-character-copy > strong, .ls-live-character-copy > small { display: block; }
.ls-live-character-copy > strong { margin: 4px 0 1px; font-size: 13px; }
.ls-live-character-copy > small { color: var(--ls-muted); font-size: 9px; }
.ls-live-character-copy > div { display: flex; gap: 6px; margin-top: 8px; }
.ls-live-character-copy > div span { display: inline-flex; align-items: center; gap: 4px; padding: 3px 6px; border: 1px solid var(--ls-line); border-radius: 5px; color: var(--ls-dim); font-size: 8px; }
.ls-live-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px; }
.ls-live-controls > section { padding: 17px; border: 1px solid var(--ls-line); border-radius: 11px; background: linear-gradient(145deg, var(--ls-panel), var(--ls-panel-deep)); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent); }
.ls-live-controls h3 { margin: 4px 0 10px; font-size: 15px; }
.ls-live-controls p { color: var(--ls-muted); font-size: 10px; }

/* Settings */
.ls-settings-layout { min-height: 500px; display: grid; grid-template-columns: 210px minmax(0, 1fr); gap: 18px; }
.ls-settings-nav { display: flex; flex-direction: column; gap: 5px; }
.ls-settings-nav button {
  position: relative;
  width: 100%;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  padding: 10px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: var(--ls-muted);
  cursor: pointer;
  text-align: left;
}
.ls-settings-nav button { transition: background var(--ls-fast), border-color var(--ls-fast), color var(--ls-fast), transform var(--ls-fast); }
.ls-settings-nav button:hover { background: var(--ls-hover); color: var(--ls-text); transform: translateX(1px); }
.ls-settings-nav button[data-active="true"] { border-color: var(--ls-line); background: linear-gradient(90deg, var(--ls-accent-soft), var(--ls-panel-raised) 34%); color: var(--ls-text); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent); }
.ls-settings-nav button[data-active="true"]::before { content: ""; position: absolute; top: 9px; bottom: 9px; left: -1px; width: 2px; background: var(--ls-accent); }
.ls-settings-nav strong, .ls-settings-nav small { display: block; }
.ls-settings-nav strong { font-size: 10px; }
.ls-settings-nav small { color: var(--ls-dim); font-size: 8px; }
.ls-settings-content { min-width: 0; display: flex; flex-direction: column; gap: 14px; }
.ls-settings-card { padding: 20px; border: 1px solid var(--ls-line); border-radius: 12px; background: linear-gradient(145deg, var(--ls-panel), var(--ls-panel-deep)); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 4%, transparent), var(--ls-shadow-sm); }
.ls-settings-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin-bottom: 18px; padding-bottom: 16px; border-bottom: 1px solid var(--ls-line); }
.ls-settings-card-head h3 { margin: 5px 0 3px; font-size: 17px; }
.ls-settings-card-head p { max-width: 600px; margin: 0; color: var(--ls-muted); font-size: 10px; }
.ls-settings-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px; }
.ls-detector-save-state { display: flex; align-items: center; gap: 6px; min-height: 22px; margin: -5px 0 10px; color: var(--ls-dim); font-size: 9px; }
.ls-detector-save-state[data-state="saving"] { color: var(--ls-accent); }
.ls-detector-save-state[data-state="error"] { color: var(--ls-danger); }
.ls-detector-save-state[data-state="saved"] svg { color: var(--ls-success); }
.ls-detector-save-state[data-state="saving"] svg { animation: ls-spin .8s linear infinite; }
.ls-setting-row { min-height: 58px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(100px, 220px); align-items: center; gap: 16px; padding: 10px 0; border-top: 1px solid var(--ls-line); }
.ls-setting-row > div:first-child strong, .ls-setting-row > div:first-child span { display: block; }
.ls-setting-row > div:first-child strong { font-size: 10px; }
.ls-setting-row > div:first-child span { margin-top: 2px; color: var(--ls-dim); font-size: 9px; }
.ls-setting-row > div:last-child { display: flex; justify-content: flex-end; }
.ls-settings-inline-actions { display: flex; gap: 8px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--ls-line); }
.ls-data-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ls-data-actions > button { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto; align-items: center; gap: 9px; padding: 14px; border: 1px solid var(--ls-line); border-radius: 10px; background: var(--ls-panel-deep); color: var(--ls-muted); cursor: pointer; text-align: left; }
.ls-data-actions > button:hover:not(:disabled) { border-color: var(--ls-line-hover); background: var(--ls-hover); color: var(--ls-text); }
.ls-data-actions > button:disabled { opacity: .4; cursor: default; }
.ls-data-actions strong, .ls-data-actions small { display: block; }
.ls-data-actions strong { color: var(--ls-text); font-size: 10px; }
.ls-data-actions small { color: var(--ls-dim); font-size: 8px; }
.ls-permission-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; }
.ls-permission-grid span { display: inline-flex; align-items: center; gap: 5px; padding: 6px 8px; border: 1px solid var(--ls-line); border-radius: 6px; color: var(--ls-danger); font-size: 8px; }
.ls-permission-grid span[data-granted="true"] { color: var(--ls-success); }
.ls-diagnostic-summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
.ls-diagnostic-summary > div { padding: 10px; border-radius: 8px; background: var(--ls-panel-deep); }
.ls-diagnostic-summary span, .ls-diagnostic-summary strong, .ls-diagnostic-summary small { display: block; }
.ls-diagnostic-summary span { color: var(--ls-dim); font-size: 8px; text-transform: uppercase; }
.ls-diagnostic-summary strong { margin: 3px 0; font-size: 13px; text-transform: capitalize; }
.ls-diagnostic-summary small { color: var(--ls-muted); font-size: 8px; }
.ls-diagnostics-card pre { max-height: 260px; overflow: auto; margin: 12px 0 0; padding: 12px; border: 1px solid var(--ls-line); border-radius: 8px; background: var(--ls-panel-deep); color: var(--ls-muted); font-size: 9px; white-space: pre-wrap; }

/* Character editor */
.ls-character-setup { min-height: 320px; padding: 16px; color: var(--ls-text); background: var(--ls-bg); }
.ls-character-loading { min-height: 260px; display: grid; place-items: center; align-content: center; gap: 10px; color: var(--ls-muted); }
.ls-loading-pulse { width: 26px; height: 26px; border: 2px solid var(--ls-line); border-top-color: var(--ls-accent); border-radius: 50%; animation: ls-spin .8s linear infinite; }
.ls-character-setup-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 15px; padding-bottom: 14px; border-bottom: 1px solid var(--ls-line); }
.ls-character-setup-head h2 { margin: 5px 0 2px; font-size: 19px; }
.ls-character-setup-head p { margin: 0; color: var(--ls-muted); font-size: 10px; }
.ls-character-outfit-strip { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; }
.ls-character-outfit-strip button { flex: 0 0 auto; min-height: 34px; display: inline-flex; align-items: center; gap: 6px; padding: 0 10px; border: 1px solid var(--ls-line); border-radius: 8px; background: var(--ls-panel); color: var(--ls-muted); cursor: pointer; }
.ls-character-outfit-strip button[data-active="true"] { border-color: var(--ls-accent); background: var(--ls-panel-raised); color: var(--ls-text); }
.ls-character-outfit-strip button small { min-width: 18px; height: 18px; display: grid; place-items: center; border-radius: 9px; background: var(--ls-fill-subtle); color: var(--ls-dim); font-size: 8px; }
.ls-character-add-outfit { border-style: dashed !important; }
.ls-character-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 9px 0; }
.ls-character-toolbar > div strong, .ls-character-toolbar > div span { display: block; }
.ls-character-toolbar > div strong { font-size: 12px; }
.ls-character-toolbar > div span { color: var(--ls-dim); font-size: 9px; }
.ls-character-expression-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(125px, 1fr)); gap: 10px; }
.ls-character-expression-card, .ls-character-new-expression { min-height: 154px; overflow: hidden; display: grid; grid-template-rows: 112px auto; padding: 0; border: 1px solid var(--ls-line); border-radius: 10px; background: var(--ls-panel); color: var(--ls-text); cursor: pointer; text-align: left; }
.ls-character-expression-card:hover, .ls-character-new-expression:hover { border-color: var(--ls-line-hover); background: var(--ls-hover); }
.ls-character-expression-card[data-default="true"] { border-color: color-mix(in srgb, var(--ls-accent) 45%, var(--ls-line)); }
.ls-character-expression-card > :first-child { width: 100%; height: 112px; object-fit: contain; background: var(--ls-panel-deep); }
.ls-character-expression-card > span { padding: 7px 8px; }
.ls-character-expression-card strong, .ls-character-expression-card small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-character-expression-card strong { font-size: 10px; }
.ls-character-expression-card small { color: var(--ls-dim); font-size: 8px; }
.ls-character-expression-card i { position: absolute; display: none; }
.ls-character-new-expression { place-items: center; align-content: center; grid-template-rows: auto auto; gap: 6px; border-style: dashed; color: var(--ls-muted); text-align: center; }

/* Import, prompts, quick selector */
.ls-modal-form, .ls-import-modal, .ls-quick-picker { background: var(--ls-bg); color: var(--ls-text); }
.ls-modal-form { display: flex; flex-direction: column; gap: 18px; padding: 18px; }
.ls-modal-actions { display: flex; justify-content: flex-end; gap: 8px; }
.ls-import-modal { display: flex; flex-direction: column; gap: 14px; padding: 18px; }
.ls-dropzone { position: relative; min-height: 210px; display: grid; place-items: center; align-content: center; gap: 7px; padding: 24px; border: 1px dashed var(--ls-line-hover); border-radius: 13px; background: radial-gradient(circle at 50% 36%, var(--ls-accent-soft), transparent 56%), var(--ls-panel-deep); text-align: center; transition: background var(--ls-fast), border-color var(--ls-fast), box-shadow var(--ls-fast); }
.ls-dropzone[data-dragging="true"] { border-color: var(--ls-accent); background: color-mix(in srgb, var(--ls-bg) 90%, var(--ls-accent) 10%); }
.ls-dropzone input { position: absolute; inset: 0; z-index: 2; width: 100%; opacity: 0; cursor: pointer; }
.ls-dropzone .ls-button { pointer-events: none; }
.ls-dropzone-mark { width: 48px; height: 48px; display: grid; place-items: center; border: 1px solid color-mix(in srgb, var(--ls-accent) 35%, var(--ls-line)); border-radius: 14px; background: var(--ls-panel-raised); color: var(--ls-accent); }
.ls-dropzone strong { font-size: 14px; }
.ls-dropzone p { margin: 0 0 4px; color: var(--ls-muted); font-size: 10px; }
.ls-import-mapping { display: grid; grid-template-columns: minmax(0, 1fr) minmax(210px, 260px); gap: 14px; padding: 15px; border: 1px solid var(--ls-line); border-radius: 11px; background: var(--ls-panel); }
.ls-import-mapping h3 { margin: 4px 0 2px; font-size: 14px; }
.ls-import-mapping p { margin: 0; color: var(--ls-muted); font-size: 9px; }
.ls-mapping-preview { grid-column: 1 / -1; max-height: 155px; overflow: auto; padding: 7px; border-radius: 8px; background: var(--ls-panel-deep); }
.ls-mapping-preview > div { display: flex; align-items: center; gap: 7px; padding: 5px 6px; color: var(--ls-muted); font-size: 9px; }
.ls-mapping-preview small { display: block; padding: 5px 6px; color: var(--ls-dim); font-size: 8px; }
.ls-validation-note { display: flex; align-items: center; gap: 8px; padding: 9px 10px; border: 1px solid color-mix(in srgb, var(--ls-success) 28%, var(--ls-line)); border-radius: 8px; color: var(--ls-muted); font-size: 9px; }
.ls-validation-note svg { color: var(--ls-success); }
.ls-quick-picker { padding: 18px; }
.ls-picker-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.ls-picker-body { height: min(440px, 52dvh); min-height: 320px; display: grid; grid-template-columns: minmax(0, 1fr) 250px; gap: 14px; margin-top: 12px; }
.ls-picker-expression-grid { min-height: 0; height: 100%; display: grid; grid-template-columns: repeat(auto-fill, minmax(125px, 1fr)); grid-auto-rows: 160px; gap: 9px; align-content: start; overflow-x: hidden; overflow-y: auto; overscroll-behavior: contain; scrollbar-gutter: stable; padding: 2px 8px 2px 2px; }
.ls-picker-expression { position: relative; height: 160px; overflow: hidden; display: grid; grid-template-rows: 120px minmax(0, 1fr); padding: 0; border: 1px solid var(--ls-line); border-radius: 9px; background: var(--ls-panel); color: var(--ls-text); cursor: pointer; text-align: left; transition: border-color var(--ls-fast), box-shadow var(--ls-fast), transform var(--ls-fast); }
.ls-picker-expression:hover { border-color: var(--ls-line-hover); box-shadow: var(--ls-shadow-sm); transform: translateY(-1px); }
.ls-picker-expression[data-selected="true"] { border-color: var(--ls-accent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--ls-accent) 18%, transparent); }
.ls-picker-expression-media { width: 100%; height: 120px; object-fit: contain; background: var(--ls-panel-deep); }
.ls-picker-expression > span { display: block; padding: 7px 8px; }
.ls-picker-expression strong, .ls-picker-expression small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-picker-expression strong { font-size: 10px; }
.ls-picker-expression small { color: var(--ls-dim); font-size: 8px; }
.ls-picker-expression > i { position: absolute; top: 7px; right: 7px; width: 22px; height: 22px; display: grid; place-items: center; border-radius: 7px; background: var(--ls-accent); color: var(--ls-accent-fg); }
.ls-picker-variants { min-width: 0; min-height: 0; overflow: hidden; display: grid; grid-template-rows: auto auto minmax(0, 1fr); padding: 13px; border: 1px solid var(--ls-line); border-radius: 10px; background: var(--ls-panel); }
.ls-picker-variants h3 { margin: 4px 0 10px; font-size: 14px; }
.ls-picker-variants > div { min-height: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 7px; align-content: start; overflow: auto; overscroll-behavior: contain; scrollbar-gutter: stable; }
.ls-picker-variants button { min-width: 0; overflow: hidden; padding: 0; border: 1px solid var(--ls-line); border-radius: 8px; background: var(--ls-panel-deep); color: var(--ls-muted); cursor: pointer; }
.ls-picker-variants button[data-selected="true"] { border-color: var(--ls-accent); color: var(--ls-text); }
.ls-picker-variants button > :first-child { width: 100%; height: 86px; object-fit: contain; }
.ls-picker-variants button span { display: block; overflow: hidden; padding: 5px; font-size: 7px; text-overflow: ellipsis; white-space: nowrap; }
.ls-picker-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 14px; padding-top: 13px; border-top: 1px solid var(--ls-line); }
.ls-modal-empty { min-height: 320px; background: var(--ls-bg); }

/* Floating stage */
.ls-stage-root { width: 100%; height: 100%; min-width: 0; min-height: 0; container-name: lumi-stage; container-type: size; opacity: var(--ls2-stage-opacity); color: var(--ls-text); }
.ls-stage-chrome { position: relative; width: 100%; height: 100%; min-width: 0; min-height: 0; display: grid; grid-template-rows: 34px minmax(0, 1fr); overflow: hidden; border: 1px solid var(--ls-line); border-radius: 13px; background: radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--ls-accent) 7%, transparent), transparent 58%), color-mix(in srgb, var(--ls-bg) 92%, transparent); box-shadow: var(--ls-shadow-md), inset 0 1px color-mix(in srgb, var(--ls-text) 5%, transparent); backdrop-filter: blur(10px); }
.ls-stage-root[data-chrome="false"] .ls-stage-chrome { grid-template-rows: 0 minmax(0, 1fr); border-color: transparent; background: transparent; backdrop-filter: none; }
.ls-stage-root[data-chrome="false"] .ls-stage-grab { opacity: 0; pointer-events: none; }
.ls-stage-grab { min-width: 0; display: flex; align-items: center; justify-content: space-between; padding: 0 7px 0 10px; border-bottom: 1px solid var(--ls-line); background: linear-gradient(90deg, color-mix(in srgb, var(--ls-accent) 5%, var(--ls-panel)), var(--ls-panel)); cursor: move; }
.ls-stage-live { display: inline-flex; align-items: center; gap: 6px; color: var(--ls-muted); font-size: 9px; font-weight: 750; }
.ls-stage-live > span { width: 6px; height: 6px; border-radius: 50%; background: var(--ls-success); box-shadow: 0 0 0 3px color-mix(in srgb, var(--ls-success) 12%, transparent); }
.ls-stage-actions { flex: 0 0 auto; display: flex; }
.ls-stage-actions button { width: 26px; height: 26px; display: grid; place-items: center; padding: 0; border: 1px solid transparent; border-radius: 7px; background: transparent; color: var(--ls-muted); cursor: pointer; transition: background var(--ls-fast), border-color var(--ls-fast), color var(--ls-fast); }
.ls-stage-actions button:hover { background: var(--ls-hover); color: var(--ls-text); }
.ls-stage-ensemble { min-height: 0; display: flex; align-items: end; justify-content: center; overflow: hidden; padding: 8px; }
.ls-stage-character { min-width: 0; height: 100%; flex: 1 1 0; display: grid; grid-template-rows: minmax(0, 1fr) auto; margin: 0 calc(var(--ls2-stage-overlap) * -18%); opacity: 1; transform: scale(.94); transform-origin: bottom center; transition: opacity var(--ls2-stage-transition), transform var(--ls2-stage-transition); }
.ls-stage-character[data-idle="true"] { opacity: var(--ls2-stage-idle-opacity); }
.ls-stage-character[data-focused="true"] { z-index: 2; transform: scale(var(--ls2-stage-focus-scale)); }
.ls-stage-character-frame { min-height: 0; display: flex; align-items: end; justify-content: center; overflow: hidden; }
.ls-stage-character-frame > * { max-width: 100%; max-height: 100%; object-fit: contain; }
.ls-stage-character figcaption { padding: 5px 7px; text-align: center; text-shadow: 0 1px 5px var(--ls-bg); }
.ls-stage-character figcaption strong, .ls-stage-character figcaption span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-stage-character figcaption strong { font-size: 9px; }
.ls-stage-character figcaption span { color: var(--ls-muted); font-size: 7px; }
.ls-stage-waiting { min-width: 0; min-height: 0; display: grid; place-items: center; align-content: center; gap: 8px; padding: 14px 32px; overflow: hidden; color: var(--ls-muted); text-align: center; }
.ls-stage-waiting > div { width: 46px; height: 46px; display: grid; place-items: center; border: 1px solid color-mix(in srgb, var(--ls-accent) 30%, var(--ls-line)); border-radius: 14px; background: linear-gradient(145deg, var(--ls-accent-soft), var(--ls-panel)); color: var(--ls-accent); box-shadow: inset 0 1px color-mix(in srgb, var(--ls-text) 5%, transparent), var(--ls-shadow-sm); }
.ls-stage-waiting-copy { min-width: 0; display: grid; gap: 2px; }
.ls-stage-waiting-copy strong, .ls-stage-waiting-copy > span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ls-stage-waiting-copy strong { color: var(--ls-text); font-size: 12px; line-height: 1.3; }
.ls-stage-waiting-copy > span { color: var(--ls-muted); font-size: 8px; line-height: 1.35; }
.ls-stage-resize { position: absolute; right: 1px; bottom: 1px; width: 22px; height: 22px; border: 0; background: transparent; cursor: nwse-resize; }
.ls-stage-resize span { position: absolute; right: 4px; bottom: 4px; width: 8px; height: 8px; border-right: 1px solid var(--ls-muted); border-bottom: 1px solid var(--ls-muted); }
.ls-stage-root[data-transition="cut"] .ls-stage-character { transition: none; }
.ls-stage-root[data-transition="lift"] .ls-stage-character { transform: translateY(8px) scale(.94); }
.ls-stage-root[data-transition="lift"] .ls-stage-character[data-focused="true"] { transform: translateY(0) scale(var(--ls2-stage-focus-scale)); }

@container lumi-stage (max-height: 180px) {
  .ls-stage-waiting {
    grid-template-columns: auto minmax(0, 1fr);
    place-items: center start;
    align-content: center;
    gap: 10px;
    padding: 8px 32px 8px 14px;
    text-align: left;
  }
  .ls-stage-waiting > div { width: 38px; height: 38px; border-radius: 11px; }
  .ls-stage-waiting > div svg { width: 20px; height: 20px; }
}

@container lumi-stage (max-width: 280px) {
  .ls-stage-waiting { padding-right: 26px; padding-left: 10px; gap: 8px; }
  .ls-stage-waiting-copy > span { white-space: normal; }
}

@keyframes ls-spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .ls-studio-topbar { grid-template-columns: 170px 1fr auto; }
  .ls-character-select { min-width: 132px; max-width: 170px; }
  .ls-library-view:has(.ls-variant-tray) { grid-template-columns: 180px minmax(0, 1fr) 270px; }
  .ls-outfit-rail { grid-template-rows: 58px minmax(0, 1fr); }
  .ls-outfit-rail-foot { display: none; }
  .ls-batch-bar { grid-template-columns: auto 1fr auto; }
  .ls-batch-destination { grid-column: 1 / 3; }
  .ls-expression-grid { grid-template-columns: repeat(auto-fill, minmax(135px, 1fr)); }
}

@media (max-width: 720px) {
  .ls-studio { height: calc(100dvh - 96px); min-height: 500px; grid-template-rows: auto minmax(0, 1fr); border-radius: 0; }
  .ls-studio-topbar { grid-template-columns: 1fr auto; grid-template-rows: 48px 42px; gap: 0; padding: 0 10px; }
  .ls-studio-topbar nav { grid-column: 1 / -1; grid-row: 2; order: 3; border-top: 1px solid var(--ls-line); }
  .ls-studio-topbar nav button { min-width: 0; flex: 1; padding: 0 8px; }
  .ls-studio-context { grid-column: 2; grid-row: 1; }
  .ls-character-select { display: block; min-width: 120px; max-width: 150px; }
  .ls-library-view, .ls-library-view:has(.ls-variant-tray) { position: relative; display: grid; grid-template-columns: 1fr; grid-template-rows: 78px minmax(0, 1fr); }
  .ls-outfit-rail { display: block; overflow: hidden; border-right: 0; border-bottom: 1px solid var(--ls-line); }
  .ls-outfit-rail-head { height: 32px; padding: 2px 8px 0 10px; border: 0; }
  .ls-outfit-rail-head .ls-kicker { display: none; }
  .ls-outfit-list { display: flex; gap: 5px; overflow-x: auto; padding: 4px 8px 8px; }
  .ls-outfit-list > button { width: auto; min-width: 122px; min-height: 38px; flex: 0 0 auto; grid-template-columns: 18px minmax(70px, 1fr); margin: 0; padding: 5px 7px; }
  .ls-outfit-list > button i { display: none; }
  .ls-outfit-list > button[data-active="true"]::before { top: auto; right: 12px; bottom: -1px; left: 12px; width: auto; height: 2px; }
  .ls-library-toolbar { min-height: 52px; padding: 7px 10px; }
  .ls-library-toolbar .ls-toolbar { display: none; }
  .ls-library-command-row { flex-wrap: wrap; padding: 7px 10px; }
  .ls-library-command-row .ls-search { flex-basis: 100%; }
  .ls-library-command-row .ls-toolbar { width: 100%; justify-content: flex-end; }
  .ls-expression-scroll { padding: 10px; }
  .ls-expression-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .ls-expression-stack { height: 148px; }
  .ls-variant-tray { position: absolute; z-index: 20; inset: 82px 0 0; border: 0; border-top: 1px solid var(--ls-line); background: var(--ls-bg); box-shadow: 0 -16px 40px color-mix(in srgb, var(--ls-bg) 45%, transparent); }
  .ls-batch-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 8px 10px; }
  .ls-batch-select-links { flex: 1; }
  .ls-batch-destination { width: 100%; order: 3; }
  .ls-batch-bar > .ls-toolbar { width: 100%; order: 4; }
  .ls-page { padding: 18px 14px; }
  .ls-workspace-title { align-items: flex-start; flex-direction: column; gap: 12px; margin-bottom: 16px; padding-bottom: 14px; }
  .ls-workspace-title h2 { font-size: 21px; }
  .ls-stage-board-grid { overflow-x: auto; justify-content: flex-start; padding: 14px; }
  .ls-stage-board-grid > article { min-width: 210px; }
  .ls-live-controls { grid-template-columns: 1fr; }
  .ls-settings-layout { display: block; }
  .ls-settings-nav { flex-direction: row; overflow-x: auto; margin-bottom: 12px; }
  .ls-settings-nav button { min-width: 150px; flex: 0 0 auto; }
  .ls-settings-nav button[data-active="true"]::before { top: auto; right: 10px; bottom: -1px; left: 10px; width: auto; height: 2px; }
  .ls-settings-card { padding: 15px; }
  .ls-settings-form-grid, .ls-data-actions { grid-template-columns: 1fr; }
  .ls-setting-row { grid-template-columns: 1fr auto; }
  .ls-permission-grid, .ls-diagnostic-summary { grid-template-columns: 1fr 1fr; }
  .ls-picker-controls { grid-template-columns: 1fr; }
  .ls-picker-body { height: auto; min-height: 0; grid-template-columns: 1fr; }
  .ls-picker-expression-grid { height: min(300px, 35dvh); }
  .ls-picker-variants { max-height: 220px; }
  .ls-picker-variants > div { grid-template-columns: repeat(3, 1fr); max-height: 150px; }
  .ls-picker-footer { align-items: stretch; flex-direction: column; }
  .ls-picker-footer > .ls-toolbar { justify-content: flex-end; }
  .ls-import-mapping { grid-template-columns: 1fr; }
  .ls-mapping-preview { grid-column: 1; }
}

@media (max-width: 420px) {
  .ls-drawer { padding: 14px; }
  .ls-current-preview { min-height: 165px; grid-template-columns: 42% 1fr; padding: 10px; }
  .ls-current-preview-media { height: 145px; }
  .ls-drawer-primary-actions { grid-template-columns: 1fr; }
  .ls-studio-brand small { display: none; }
  .ls-studio-topbar nav button { font-size: 9px; }
  .ls-studio-topbar nav button svg { display: none; }
  .ls-studio-context .ls-button span { display: none; }
  .ls-expression-stack { height: 132px; }
  .ls-character-setup { padding: 12px; }
  .ls-character-setup-head { align-items: stretch; flex-direction: column; }
  .ls-character-toolbar { align-items: flex-start; flex-direction: column; }
  .ls-character-expression-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ls-picker-variants > div { grid-template-columns: repeat(2, 1fr); }
  .ls-picker-footer .ls-toolbar { display: grid; grid-template-columns: 1fr 1fr; }
  .ls-picker-footer .ls-button-primary { grid-column: 1 / -1; }
  .ls-permission-grid, .ls-diagnostic-summary { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  :where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-stage-root) *,
  :where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-stage-root) *::before,
  :where(.ls-drawer, .ls-studio, .ls-character-setup, .ls-import-modal, .ls-quick-picker, .ls-stage-root) *::after {
    scroll-behavior: auto !important;
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
  }
}
`;
