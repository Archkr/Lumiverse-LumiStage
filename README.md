# LumiStage

LumiStage is an independent expression and sprite-direction studio for Lumiverse 1.1.0 and newer:

**Lumiverse character → Outfit folder → Expression slot → Sprite variants**

Profiles, detector decisions, manual locks, chat timelines, archives, and assets are owned by LumiStage. It does not inspect, synchronize with, migrate from, or modify Lumiverse’s built-in expression feature.

## Where the UI lives

- The **LumiStage drawer** is a compact live dashboard with the current state, connection health, stage visibility, manual direction, and an **Open Studio** button.
- **Open Studio** launches the complete Library, Live Stage, and Settings workspace in a large Lumiverse-themed modal.
- The **character editor’s LumiStage tab** provides a compact outfit and expression editor for the selected character.
- The **input-bar LumiStage action** opens the exact-sprite quick selector.
- The **floating stage** is chromeless, resizable, draggable, and fullscreen-capable.

## Highlights

- Editable outfit folders containing named expression slots with multiple sprite variants.
- Contextual Lumiverse-style selection mode with select-all-filtered, move, copy, delete, undo, and redo.
- Direct upload and safe ZIP mapping for:
  - `Expression.ext`
  - `Outfit/Expression.ext`
  - `Outfit/Expression/Variant.ext`
- PNG, JPEG, WebP, GIF, muted looping WebM, and muted looping MP4 media.
- One structured, low-temperature detector call after a successful generation. It receives every outfit, expression, sprite filename, and exact variant ID at once.
- One confidence threshold for the complete visual state. Invalid, malformed, low-confidence, or failed results preserve the previous stage.
- Manual apply-once direction, outfit locks, and exact-state locks.
- Message/swipe/content-hash decision caching and deterministic replay after edits or deletions.
- Group-chat composition based on real Lumiverse characters while excluding muted members.
- Portable `.lumistage.zip` archives and extension-ownership verification before permanent asset deletion.
- Lumiverse-native connection/model controls and dynamically inherited dark, light, glass, accent, density, and motion behavior.

## Installation

Install this repository as a Spindle extension in Lumiverse. The checked-in production entrypoints are:

- `dist/backend.js`
- `dist/frontend.js`

The manifest requests exactly `generation`, `chats`, `chat_mutation`, `characters`, `images`, and `ui_panels`.

## Using LumiStage

1. Open a character or chat, then open the **LumiStage** drawer.
2. Select **Open Studio**.
3. In **Library**, create or rename outfit folders, add expression slots, and import sprite variants.
4. Use **Select** for contextual batch operations on the current filtered expression grid.
5. In **Settings → Detection**, choose an existing Lumiverse LLM connection and model.
6. Use the input-bar action or **Live Stage → Direct stage** for manual state selection and locks.
7. Tune the floating stage under **Settings → Stage**.

## Private storage

LumiStage stores its V2 records under:

- `settings.v2.json`
- `profiles/<character-id>.v2.json`
- `chats/<chat-id>.v2.json`

Existing LumiStage V1 data migrates automatically. Character media and stable IDs are preserved, the obsolete internal owner layer is hoisted away, and incompatible detector cache records are discarded.

Media is stored through Lumiverse’s authenticated image system with extension and character ownership. Content hashes prevent duplicate uploads. An image is permanently deleted only when no saved LumiStage profile references it and Lumiverse confirms `owner_extension_identifier === "lumi_stage"`.

LumiStage has no compatibility bridge for core expressions or other expression formats.

## Development

```powershell
npm install
npm run check
```

`npm run check` runs strict TypeScript, unit and lifecycle tests, the production build, the independent-data source contract, and the extension safety scan.

Coverage includes V1 migration, complete-state confidence gating, exact variant selection, manual locks, swipe replay, group composition, storage revisions, expression-slot batch operations, archive safety, partial uploads, deletion ownership, native component cleanup, character-selection runtime regression, a 2,000-sprite catalog, and an eight-character stage.

## License

Lumiverse Community License 2.0. See [LICENSE.md](./LICENSE.md).
