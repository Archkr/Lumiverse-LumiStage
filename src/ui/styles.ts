export const LUMI_STAGE_CSS = String.raw`
.ls-root, .ls-stage-root, .ls-modal-root {
  --ls-ink: var(--lumiverse-text, #edf4ff);
  --ls-muted: var(--lumiverse-text-dim, #8794a8);
  --ls-border: color-mix(in srgb, var(--lumiverse-border, #526070) 72%, rgba(86, 217, 232, .2));
  --ls-panel: color-mix(in srgb, var(--lumiverse-bg, #0d1420) 90%, #102635);
  --ls-panel-2: color-mix(in srgb, var(--lumiverse-fill-subtle, #152130) 84%, #0b2730);
  --ls-well: color-mix(in srgb, var(--lumiverse-bg-dark, #080d15) 92%, #0b1e29);
  --ls-cyan: #63dce7;
  --ls-amber: #f0b65b;
  --ls-green: #75d6a3;
  --ls-red: #ed7d87;
  --ls-radius: 14px;
  box-sizing: border-box;
  color: var(--ls-ink);
  font-family: var(--lumiverse-font-family, Inter, ui-sans-serif, system-ui, sans-serif);
  font-size: calc(13px * var(--lumiverse-font-scale, 1));
}
.ls-root *, .ls-stage-root *, .ls-modal-root * { box-sizing: border-box; }
.ls-root button, .ls-root input, .ls-root select, .ls-root textarea,
.ls-stage-root button, .ls-stage-root input, .ls-modal-root button, .ls-modal-root input, .ls-modal-root select {
  font: inherit;
}
.ls-root :focus-visible, .ls-stage-root :focus-visible, .ls-modal-root :focus-visible {
  outline: 2px solid var(--ls-cyan);
  outline-offset: 2px;
}
.ls-root {
  min-height: 100%;
  background:
    radial-gradient(circle at 85% 2%, rgba(99, 220, 231, .08), transparent 26rem),
    linear-gradient(180deg, color-mix(in srgb, var(--ls-panel) 94%, transparent), var(--ls-well));
}
.ls-shell { min-height: 100%; display: flex; flex-direction: column; }
.ls-mast {
  position: relative;
  padding: calc(18px + env(safe-area-inset-top)) 16px 14px;
  border-bottom: 1px solid var(--ls-border);
  background: linear-gradient(145deg, rgba(240, 182, 91, .09), transparent 44%);
  overflow: hidden;
}
.ls-mast::before, .ls-mast::after {
  content: "";
  position: absolute;
  width: 54px;
  height: 1px;
  top: 12px;
  background: linear-gradient(90deg, transparent, var(--ls-amber));
  opacity: .75;
}
.ls-mast::before { left: 0; }
.ls-mast::after { right: 0; transform: scaleX(-1); }
.ls-brand { display: flex; align-items: center; gap: 11px; }
.ls-mark {
  width: 38px; height: 38px; display: grid; place-items: center;
  border: 1px solid color-mix(in srgb, var(--ls-amber) 65%, var(--ls-border));
  border-radius: 11px 11px 18px 18px;
  color: var(--ls-amber);
  background: rgba(240, 182, 91, .06);
  box-shadow: inset 0 0 18px rgba(240, 182, 91, .06);
}
.ls-mark svg { width: 23px; height: 23px; }
.ls-brand-copy { min-width: 0; }
.ls-eyebrow {
  margin: 0 0 2px; color: var(--ls-cyan); font-size: 9px; font-weight: 800;
  letter-spacing: .18em; text-transform: uppercase;
}
.ls-title { margin: 0; font-family: Georgia, "Times New Roman", serif; font-size: 22px; font-weight: 500; letter-spacing: .01em; }
.ls-subtitle { margin: 5px 0 0; color: var(--ls-muted); font-size: 11px; line-height: 1.45; }
.ls-nav {
  display: flex; gap: 5px; overflow-x: auto; scrollbar-width: none;
  padding: 9px 10px; border-bottom: 1px solid var(--ls-border);
  background: color-mix(in srgb, var(--ls-well) 90%, transparent);
}
.ls-nav::-webkit-scrollbar { display: none; }
.ls-nav-btn {
  flex: 0 0 auto; min-height: 32px; padding: 6px 10px;
  border: 1px solid transparent; border-radius: 9px; color: var(--ls-muted);
  background: transparent; cursor: pointer; font-size: 11px; font-weight: 700;
}
.ls-nav-btn:hover { color: var(--ls-ink); background: rgba(255,255,255,.04); }
.ls-nav-btn[aria-selected="true"] {
  color: var(--ls-ink); border-color: var(--ls-border);
  background: linear-gradient(180deg, rgba(99,220,231,.12), rgba(99,220,231,.035));
  box-shadow: inset 0 -2px 0 rgba(99,220,231,.45);
}
.ls-main { flex: 1; min-height: 0; padding: 13px; }
.ls-section { display: grid; gap: 11px; animation: ls-enter .2s ease-out; }
.ls-section-head { display: flex; gap: 10px; align-items: flex-start; justify-content: space-between; }
.ls-section-title { margin: 0; font-size: 14px; letter-spacing: .01em; }
.ls-section-note { margin: 3px 0 0; color: var(--ls-muted); font-size: 10.5px; line-height: 1.45; }
.ls-card {
  position: relative; padding: 12px; border: 1px solid var(--ls-border); border-radius: var(--ls-radius);
  background: linear-gradient(150deg, color-mix(in srgb, var(--ls-panel-2) 92%, transparent), color-mix(in srgb, var(--ls-panel) 94%, transparent));
  box-shadow: 0 10px 28px rgba(0,0,0,.12);
}
.ls-card::before {
  content: ""; position: absolute; left: 10px; right: 10px; top: -1px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99,220,231,.45), transparent);
}
.ls-card-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 9px; }
.ls-card-title { margin: 0; font-size: 11px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: color-mix(in srgb, var(--ls-ink) 85%, var(--ls-cyan)); }
.ls-badge {
  display: inline-flex; align-items: center; min-height: 20px; padding: 2px 7px;
  border: 1px solid var(--ls-border); border-radius: 999px; color: var(--ls-muted);
  background: rgba(0,0,0,.14); font-size: 9.5px; font-weight: 700;
}
.ls-badge[data-tone="success"] { color: var(--ls-green); border-color: color-mix(in srgb, var(--ls-green) 45%, transparent); }
.ls-badge[data-tone="warning"] { color: var(--ls-amber); border-color: color-mix(in srgb, var(--ls-amber) 45%, transparent); }
.ls-badge[data-tone="error"] { color: var(--ls-red); border-color: color-mix(in srgb, var(--ls-red) 45%, transparent); }
.ls-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 7px; }
.ls-button {
  min-height: 32px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 6px 10px; border: 1px solid var(--ls-border); border-radius: 9px;
  color: var(--ls-ink); background: rgba(255,255,255,.035); cursor: pointer; font-weight: 700; font-size: 10.5px;
}
.ls-button:hover:not(:disabled) { border-color: color-mix(in srgb, var(--ls-cyan) 55%, var(--ls-border)); background: rgba(99,220,231,.08); }
.ls-button:disabled { opacity: .42; cursor: not-allowed; }
.ls-button-primary { border-color: color-mix(in srgb, var(--ls-cyan) 58%, var(--ls-border)); background: linear-gradient(180deg, rgba(99,220,231,.18), rgba(99,220,231,.075)); }
.ls-button-warm { border-color: color-mix(in srgb, var(--ls-amber) 58%, var(--ls-border)); background: rgba(240,182,91,.1); }
.ls-button-danger { color: var(--ls-red); }
.ls-icon-btn {
  width: 30px; min-width: 30px; height: 30px; padding: 0; border: 1px solid var(--ls-border);
  border-radius: 9px; color: var(--ls-muted); background: rgba(0,0,0,.12); cursor: pointer;
}
.ls-icon-btn:hover { color: var(--ls-ink); border-color: var(--ls-cyan); }
.ls-field { display: grid; gap: 5px; }
.ls-field-label { color: var(--ls-muted); font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
.ls-input, .ls-select, .ls-textarea {
  width: 100%; min-height: 34px; padding: 7px 9px; border: 1px solid var(--ls-border); border-radius: 9px;
  background: color-mix(in srgb, var(--ls-well) 88%, transparent); color: var(--ls-ink); outline: none;
}
.ls-input:focus, .ls-select:focus, .ls-textarea:focus { border-color: var(--ls-cyan); box-shadow: 0 0 0 3px rgba(99,220,231,.09); }
.ls-textarea { resize: vertical; min-height: 72px; }
.ls-switch-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 34px; }
.ls-switch-copy strong { display: block; font-size: 11px; }
.ls-switch-copy span { color: var(--ls-muted); font-size: 9.5px; line-height: 1.35; }
.ls-switch {
  width: 38px; height: 22px; padding: 2px; border: 1px solid var(--ls-border); border-radius: 999px;
  background: rgba(0,0,0,.22); cursor: pointer;
}
.ls-switch::after { content: ""; display: block; width: 16px; height: 16px; border-radius: 50%; background: var(--ls-muted); transition: transform .18s ease, background .18s ease; }
.ls-switch[aria-checked="true"]::after { transform: translateX(16px); background: var(--ls-cyan); }
.ls-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; }
.ls-stat-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
.ls-stat { padding: 9px; border: 1px solid var(--ls-border); border-radius: 10px; background: rgba(0,0,0,.12); }
.ls-stat strong { display: block; font-size: 17px; font-weight: 500; font-family: Georgia, serif; color: var(--ls-amber); }
.ls-stat span { color: var(--ls-muted); font-size: 9px; text-transform: uppercase; letter-spacing: .07em; }
.ls-empty {
  min-height: 140px; display: grid; place-items: center; text-align: center;
  border: 1px dashed var(--ls-border); border-radius: 13px; padding: 18px; color: var(--ls-muted);
  background: linear-gradient(135deg, rgba(99,220,231,.025), rgba(240,182,91,.025));
}
.ls-empty strong { color: var(--ls-ink); display: block; margin-bottom: 4px; }
.ls-live-list { display: grid; gap: 7px; }
.ls-live-row {
  display: grid; grid-template-columns: 38px minmax(0, 1fr) auto; align-items: center; gap: 9px;
  padding: 8px; border: 1px solid var(--ls-border); border-radius: 11px; background: rgba(0,0,0,.12);
}
.ls-live-avatar { width: 38px; height: 38px; border-radius: 9px; object-fit: contain; object-position: bottom; background: var(--ls-well); }
.ls-live-avatar-fallback { display: grid; place-items: center; color: var(--ls-cyan); font-weight: 800; border: 1px solid var(--ls-border); }
.ls-live-name { font-size: 11px; font-weight: 750; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ls-live-state { color: var(--ls-muted); font-size: 9.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ls-tree { display: grid; gap: 7px; }
.ls-tree-row { display: flex; align-items: center; gap: 6px; }
.ls-tree-btn {
  flex: 1; min-width: 0; display: flex; align-items: center; justify-content: space-between; gap: 8px;
  min-height: 34px; padding: 7px 9px; border: 1px solid transparent; border-radius: 9px;
  color: var(--ls-muted); background: transparent; cursor: pointer; text-align: left;
}
.ls-tree-btn:hover { background: rgba(255,255,255,.035); color: var(--ls-ink); }
.ls-tree-btn[data-active="true"] { border-color: var(--ls-border); background: rgba(99,220,231,.075); color: var(--ls-ink); }
.ls-tree-count { color: var(--ls-muted); font-size: 9px; }
.ls-library-layout { display: grid; grid-template-columns: 132px minmax(0, 1fr); gap: 9px; align-items: start; }
.ls-library-tree { position: sticky; top: 0; max-height: 66vh; overflow: auto; }
.ls-asset-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.ls-asset {
  position: relative; min-width: 0; border: 1px solid var(--ls-border); border-radius: 11px;
  overflow: hidden; background: var(--ls-well); cursor: pointer;
}
.ls-asset[data-selected="true"] { border-color: var(--ls-cyan); box-shadow: 0 0 0 2px rgba(99,220,231,.15); }
.ls-asset-media { width: 100%; aspect-ratio: 3 / 4; display: block; object-fit: contain; object-position: bottom center; background: radial-gradient(circle at 50% 88%, rgba(99,220,231,.08), transparent 58%); }
.ls-asset-meta { padding: 7px; border-top: 1px solid var(--ls-border); }
.ls-asset-name { font-size: 9.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ls-asset-kind { color: var(--ls-muted); font-size: 8.5px; text-transform: uppercase; letter-spacing: .08em; }
.ls-asset-check { position: absolute; top: 6px; left: 6px; accent-color: var(--ls-cyan); }
.ls-selectbar { position: sticky; bottom: 8px; z-index: 3; display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 8px; border: 1px solid var(--ls-border); border-radius: 12px; background: color-mix(in srgb, var(--ls-panel) 92%, transparent); box-shadow: 0 10px 30px rgba(0,0,0,.28); }
.ls-matrix { width: 100%; border-collapse: separate; border-spacing: 3px; font-size: 9px; }
.ls-matrix th { color: var(--ls-muted); font-weight: 700; padding: 4px; }
.ls-matrix td { text-align: center; padding: 7px 4px; border: 1px solid var(--ls-border); border-radius: 6px; }
.ls-matrix td[data-complete="true"] { color: var(--ls-green); background: rgba(117,214,163,.07); }
.ls-matrix td[data-complete="false"] { color: var(--ls-amber); background: rgba(240,182,91,.05); }
.ls-range { width: 100%; accent-color: var(--ls-cyan); }
.ls-progress { height: 5px; border-radius: 999px; background: rgba(0,0,0,.25); overflow: hidden; }
.ls-progress-bar { height: 100%; background: linear-gradient(90deg, var(--ls-cyan), var(--ls-amber)); transition: width .15s ease; }
.ls-notice {
  position: sticky; top: 8px; z-index: 8; margin: 0 10px 8px; padding: 9px 11px;
  border: 1px solid var(--ls-border); border-left: 3px solid var(--ls-cyan); border-radius: 9px;
  background: var(--ls-panel); box-shadow: 0 10px 26px rgba(0,0,0,.24); font-size: 10.5px;
}
.ls-notice[data-tone="success"] { border-left-color: var(--ls-green); }
.ls-notice[data-tone="warning"] { border-left-color: var(--ls-amber); }
.ls-notice[data-tone="error"] { border-left-color: var(--ls-red); }
.ls-diagnostic { margin: 0; padding: 10px; max-height: 50vh; overflow: auto; white-space: pre-wrap; word-break: break-word; color: var(--ls-muted); background: var(--ls-well); border: 1px solid var(--ls-border); border-radius: 10px; font: 10px/1.55 ui-monospace, SFMono-Regular, Consolas, monospace; }
.ls-footer { padding: 9px 13px calc(9px + env(safe-area-inset-bottom)); border-top: 1px solid var(--ls-border); display: flex; justify-content: space-between; gap: 8px; color: var(--ls-muted); font-size: 9px; }

.ls-stage-root { width: 100%; height: 100%; position: relative; overflow: hidden; border-radius: 16px; touch-action: none; }
.ls-stage {
  position: relative; width: 100%; height: 100%; display: flex; align-items: flex-end; justify-content: center;
  opacity: var(--ls-stage-opacity, 1);
  background: radial-gradient(ellipse at 50% 105%, rgba(99,220,231,.09), transparent 54%);
}
.ls-stage[data-chrome="true"] { border: 1px solid var(--ls-border); background: linear-gradient(180deg, rgba(7,12,19,.25), rgba(7,12,19,.74)); box-shadow: 0 20px 55px rgba(0,0,0,.32); }
.ls-stage-rig { position: absolute; inset: 0; pointer-events: none; opacity: .55; }
.ls-stage-rig::before { content: ""; position: absolute; left: 8%; right: 8%; top: 16px; height: 1px; background: linear-gradient(90deg, transparent, rgba(240,182,91,.55), transparent); }
.ls-stage-rig::after { content: ""; position: absolute; left: 50%; bottom: 0; width: 60%; height: 15%; transform: translateX(-50%); border-radius: 50%; background: radial-gradient(ellipse, rgba(99,220,231,.12), transparent 70%); }
.ls-stage-ensemble { position: absolute; inset: 28px 4px 0; display: flex; align-items: flex-end; justify-content: center; overflow: hidden; }
.ls-sprite {
  position: relative; height: 100%; min-width: 0; flex: 0 1 76%; margin-left: calc(var(--ls-overlap, .34) * -45%);
  filter: brightness(.72) saturate(.8); opacity: var(--ls-idle-opacity, .46); transform: scale(.96);
  transform-origin: bottom center; transition: opacity var(--ls-transition-ms, 280ms) ease, filter var(--ls-transition-ms, 280ms) ease, transform var(--ls-transition-ms, 280ms) cubic-bezier(.16,1,.3,1);
}
.ls-sprite:first-child { margin-left: 0; }
.ls-sprite[data-focused="true"] { z-index: 3; filter: none; opacity: 1; transform: scale(var(--ls-focused-scale, 1.035)); }
.ls-sprite-media { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; object-position: bottom center; pointer-events: none; user-select: none; }
.ls-sprite[data-transition="lift"] .ls-sprite-media { animation: ls-sprite-lift var(--ls-transition-ms, 280ms) cubic-bezier(.16,1,.3,1); }
.ls-sprite[data-transition="crossfade"] .ls-sprite-media { animation: ls-sprite-fade var(--ls-transition-ms, 280ms) ease; }
.ls-sprite-caption {
  position: absolute; left: 50%; bottom: 7px; transform: translateX(-50%); z-index: 5;
  max-width: calc(100% - 12px); padding: 3px 8px; border: 1px solid rgba(255,255,255,.12); border-radius: 999px;
  background: rgba(6,10,16,.72); color: #f4f7fb; font-size: 9px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  backdrop-filter: blur(8px);
}
.ls-stage-toolbar {
  position: absolute; z-index: 8; top: 6px; left: 6px; right: 6px; min-height: 28px;
  display: flex; align-items: center; gap: 5px; padding: 3px 5px;
  border: 1px solid rgba(255,255,255,.09); border-radius: 10px;
  background: rgba(7,12,19,.65); backdrop-filter: blur(9px);
  opacity: 0; transform: translateY(-4px); transition: .16s ease;
}
.ls-stage-root:hover .ls-stage-toolbar, .ls-stage-root:focus-within .ls-stage-toolbar { opacity: 1; transform: none; }
.ls-stage-title { flex: 1; min-width: 0; color: #eaf0f7; font-size: 9px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ls-stage-btn { width: 24px; height: 22px; border: 0; border-radius: 7px; color: #c4cedb; background: transparent; cursor: pointer; }
.ls-stage-btn:hover { color: #fff; background: rgba(99,220,231,.14); }
.ls-stage-resize {
  position: absolute; right: 1px; bottom: 1px; width: 22px; height: 22px; z-index: 8;
  border: 0; background: transparent; cursor: nwse-resize; touch-action: none;
}
.ls-stage-resize::before, .ls-stage-resize::after {
  content: ""; position: absolute; right: 5px; bottom: 5px; width: 8px; height: 1px;
  background: rgba(99,220,231,.68); transform: rotate(-45deg); transform-origin: right center;
}
.ls-stage-resize::after { width: 4px; right: 4px; bottom: 8px; }
.ls-stage-empty { position: absolute; inset: 0; display: grid; place-items: center; padding: 20px; text-align: center; color: rgba(224,234,245,.58); font-size: 10px; line-height: 1.5; }

.ls-modal-root { display: grid; gap: 12px; }
.ls-modal-actions { display: flex; justify-content: flex-end; gap: 7px; padding-top: 4px; }
.ls-file-drop { min-height: 120px; display: grid; place-items: center; text-align: center; border: 1px dashed var(--ls-border); border-radius: 12px; background: rgba(99,220,231,.025); cursor: pointer; }
.ls-file-drop:hover { border-color: var(--ls-cyan); }
.ls-file-drop input { display: none; }

@keyframes ls-enter { from { opacity: 0; transform: translateY(3px); } }
@keyframes ls-sprite-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes ls-sprite-lift { from { opacity: 0; transform: translateY(8px) scale(.99); } to { opacity: 1; transform: none; } }

@media (max-width: 520px) {
  .ls-main { padding: 10px; }
  .ls-library-layout { grid-template-columns: 1fr; }
  .ls-library-tree { position: static; display: flex; overflow-x: auto; max-height: none; padding-bottom: 3px; }
  .ls-tree { display: flex; }
  .ls-tree-row { flex: 0 0 auto; }
  .ls-tree-btn { min-width: 110px; }
  .ls-asset-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .ls-grid-2 { grid-template-columns: 1fr; }
  .ls-stage-toolbar { opacity: 1; transform: none; min-height: 34px; }
  .ls-stage-ensemble { top: 34px; }
  .ls-sprite { flex-basis: 88%; }
}
@media (max-width: 390px) {
  .ls-mast { padding: 15px 12px 12px; }
  .ls-subtitle { display: none; }
  .ls-asset-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ls-stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (prefers-reduced-motion: reduce) {
  .ls-section, .ls-sprite-media { animation: none !important; }
  .ls-sprite, .ls-switch::after, .ls-stage-toolbar, .ls-progress-bar { transition: none !important; }
}
`;
