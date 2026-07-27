import type { JSX } from "preact";

export type IconName =
  | "aperture" | "stage" | "library" | "batch" | "automation" | "appearance"
  | "diagnostics" | "search" | "plus" | "upload" | "sparkles" | "play"
  | "lock" | "unlock" | "check" | "close" | "expand" | "eye" | "eyeOff"
  | "undo" | "redo" | "copy" | "trash" | "move" | "tag" | "settings"
  | "chevronLeft" | "chevronRight" | "chevronDown" | "image" | "actors"
  | "outfit" | "expression" | "download" | "refresh" | "menu"
  | "info" | "warning" | "success";

const paths: Record<IconName, JSX.Element> = {
  aperture: <><circle cx="12" cy="12" r="8.5" /><path d="M8.7 4.2 13 11.7m6.8-3.1-8.6.1m4.1 11.1L11 12.3m-6.8 3.1 8.6-.1" /></>,
  stage: <><path d="M4 4h16M6 4v5m12-5v5M5 20h14" /><path d="M8 8.5c1.4 1 2.7 1.5 4 1.5s2.6-.5 4-1.5V18H8z" /></>,
  library: <><path d="M4 5.5h6l1.6 2H20v11H4z" /><path d="M4 8h16" /></>,
  batch: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><path d="M17 14v6m-3-3h6" /></>,
  automation: <><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1m-8.6 8.6-2.1 2.1" /><circle cx="12" cy="12" r="3.4" /></>,
  appearance: <><path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.7 1.8-1.5 0-.5-.2-.9-.2-1.4 0-.8.6-1.4 1.4-1.4h1.8c2.3 0 4.2-1.9 4.2-4.2C21 7.3 17 3 12 3Z" /><circle cx="7.5" cy="11" r=".8" /><circle cx="10" cy="7.4" r=".8" /><circle cx="14.4" cy="7" r=".8" /><circle cx="17.4" cy="10.2" r=".8" /></>,
  diagnostics: <><path d="M5 19V9m5 10V5m5 14v-7m4 7V3" /><path d="M3 21h18" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  upload: <><path d="M12 16V4m-4 4 4-4 4 4" /><path d="M4 15v5h16v-5" /></>,
  sparkles: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2z" /><path d="m18 14 .7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7zM5 13l.6 1.8 1.9.7-1.9.6L5 18l-.6-1.9-1.9-.6 1.9-.7z" /></>,
  play: <path d="m8 5 11 7-11 7z" />,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  unlock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 7.4-2.1" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  expand: <><path d="M9 4H4v5m11-5h5v5M9 20H4v-5m11 5h5v-5" /><path d="m4 9 5-5m6 0 5 5M4 15l5 5m6 0 5-5" /></>,
  eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
  eyeOff: <><path d="m3 3 18 18M10.5 6.2A10.5 10.5 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.3 3.1M6.3 6.3C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6c1.4 0 2.7-.3 3.8-.8" /></>,
  undo: <><path d="M9 7 4 12l5 5" /><path d="M5 12h8a6 6 0 0 1 6 6" /></>,
  redo: <><path d="m15 7 5 5-5 5" /><path d="M19 12h-8a6 6 0 0 0-6 6" /></>,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></>,
  trash: <><path d="M4 7h16M9 7V4h6v3m3 0-1 14H7L6 7" /><path d="M10 11v6m4-6v6" /></>,
  move: <><path d="M12 3v18m0-18-3 3m3-3 3 3m-3 15-3-3m3 3 3-3M3 12h18M3 12l3-3m-3 3 3 3m15-3-3-3m3 3-3 3" /></>,
  tag: <><path d="M20 13 13 20l-9-9V4h7z" /><circle cx="8" cy="8" r="1" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m4 17 5-5 4 4 2-2 5 4" /></>,
  actors: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20a5.5 5.5 0 0 1 11 0" /><circle cx="17" cy="9" r="2.3" /><path d="M15 15a4.5 4.5 0 0 1 5.5 4.4" /></>,
  outfit: <><path d="M8 4 5 7l3 3v10h8V10l3-3-3-3c-.8 1.3-2.1 2-4 2S8.8 5.3 8 4Z" /></>,
  expression: <><circle cx="12" cy="12" r="9" /><path d="M8.5 10h.1m6.8 0h.1M8 15c1.2 1.3 2.5 2 4 2s2.8-.7 4-2" /></>,
  download: <><path d="M12 4v12m-4-4 4 4 4-4" /><path d="M4 19h16" /></>,
  refresh: <><path d="M20 7v5h-5" /><path d="M19 12a7 7 0 1 0-1.6 4.5" /></>,
  menu: <path d="M5 7h14M5 12h14M5 17h14" />,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10h.01" /></>,
  warning: <><path d="m12 3 10 18H2z" /><path d="M12 9v5m0 3h.01" /></>,
  success: <><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>,
};

export function Icon({ name, size = 18, class: className }: { name: IconName; size?: number; class?: string }) {
  return (
    <svg class={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export const LUMI_STAGE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h16M6 4v5m12-5v5M5 20h14"/><path d="M8 8.5c1.4 1 2.7 1.5 4 1.5s2.6-.5 4-1.5V18H8z"/></svg>`;
