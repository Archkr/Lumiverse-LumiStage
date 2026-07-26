# LumiStage

LumiStage is an independent expression and sprite-direction studio for Lumiverse 1.1.0 and newer. It layers each character as:

**Actor → Outfit → Pose → Expression → Media**

Its profiles, detector decisions, manual locks, chat timelines, archives, and assets are owned by LumiStage. It does not inspect, synchronize with, migrate from, or modify Lumiverse’s built-in expression feature.

## Highlights

- Cinematic, theme-aware Studio with Live Stage, Library, Batch Lab, Automation, Appearance, and Diagnostics views.
- Chromeless floating ensemble stage with focus emphasis, preload-before-swap media, drag, resize, fullscreen, captions, transitions, opacity, scale, overlap, visibility, and persistent per-user placement.
- PNG, JPEG, WebP, GIF, muted looping WebM, and muted looping MP4 media.
- Actor/outfit trees, pose folders, aliases, cue phrases, defaults, automatic-outfit switches, search, bounded 96-item media pages, page/range/filter selection, and drag ordering.
- Reversible batch enable/disable, priority, tags, aliases, rename transforms, duplication, move/reassign, session trash, undo, and redo.
- Manual apply-once states and persistent chat locks. Locks always override automation.
- One structured, low-temperature detector call after a successful completed generation. It validates every returned ID and uses confidence gates for state changes and sticky outfits.
- Message/swipe/content-hash decision caching. Swipes restore instantly; edits invalidate only the active stale branch; deletions are removed during replay.
- Group-chat ensemble composition using public membership metadata while excluding muted characters.
- Resumable direct/ZIP upload, preflight traversal/collision/codec/size/bomb checks, content-hash deduplication, partial-failure reporting, and extension-ownership verification before permanent deletion.
- Portable `.lumistage.zip` archives containing versioned metadata and extension-owned media only.
- Privacy-safe diagnostics: no transcript content and no raw model output.

## Installation

Install this repository as a Spindle extension in Lumiverse. The checked-in production entrypoints are:

- `dist/backend.js`
- `dist/frontend.js`

The manifest requests only `generation`, `chats`, `chat_mutation`, `characters`, `images`, and `ui_panels`.

## Using LumiStage

1. Open a character or chat and choose the **LumiStage** drawer.
2. In **Library**, create or select an actor/outfit/pose hierarchy and import media.
3. Confirm the ZIP mapping layout before upload:
   - `Outfit/Pose/Expression.ext`
   - `Actor/Outfit/Pose/Expression.ext`
4. Use **Batch Lab** for reversible multi-item changes, then save the library.
5. Use **Automation** to select an optional connection/model and tune confidence.
6. Use the input-bar action for a manual apply-once state or persistent lock.
7. Tune and reveal the floating stage under **Appearance**.

Outfits are intentionally sticky. Automation changes them only when the latest completed reply contains an explicit outfit-change cue, confidence reaches the configured outfit threshold, and the destination outfit allows automatic switching.

## Data boundaries

LumiStage user storage uses these private, versioned paths:

- `settings.v1.json`
- `profiles/<character-id>.v1.json`
- `chats/<chat-id>.v1.json`

Media is stored through Lumiverse’s authenticated image system with extension and character ownership. Content hashes prevent duplicate imports. A media row is permanently deleted only after no saved profile references it and Lumiverse confirms `owner_extension_identifier === "lumi_stage"`.

LumiStage has no compatibility bridge for other expression formats.

## Development

```powershell
npm install
npm run check
```

`npm run check` runs strict TypeScript, unit/integration/contract tests, the production build, the independent-data source contract, and the extension safety scan. The tests include schema repair, fallbacks, confidence gates, sticky outfits, locks, swipe replay, group composition, storage revisions, batch undo, import safety, partial uploads, deletion ownership, frontend revocation/cleanup, a 2,000-asset catalog, and an eight-actor stage.

## Architecture

```text
Spindle events ──> detector + cache ──> per-chat timeline ──> stage snapshot
                         │
per-character profile ───┴───────────> layered resolver ───> asset views
        │
Library / Batch Lab ──> revision queue ──> private user storage
        │
ZIP/direct import ──> safety + hash ──> Lumiverse image ownership
```

## Accessibility and themes

The Studio uses Lumiverse theme variables and shared interaction conventions while keeping an original charcoal/navy stage language with warm cue lighting and restrained cyan status accents. It supports dark, light, and glass hosts, safe-area insets, reduced motion, keyboard focus, labeled controls, and layouts down to 360 px.

## License

Lumiverse Community License 2.0. See [LICENSE.md](./LICENSE.md).

