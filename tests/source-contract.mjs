import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const forbidden = [
  "/expressions",
  "extensions.expressions",
  "expression_groups",
  "EXPRESSION_CHANGED",
];
const rejectedModelTokens = [
  "aliases",
  "cues",
  "tags",
  "priority",
  "allowAutoSwitch",
  "outfitConfidence",
];
const rejectedPoseModel = /\bposeIds?\b|["']?poses?["']?\s*\??\s*[:=]/;

async function filesUnder(path) {
  const info = await stat(path);
  if (info.isFile()) return [path];
  const entries = await readdir(path);
  return (await Promise.all(entries.map((entry) => filesUnder(resolve(path, entry))))).flat();
}

const targets = [
  ...(await filesUnder(resolve(root, "src"))),
  ...(await filesUnder(resolve(root, "dist"))),
  resolve(root, "spindle.json"),
];
const violations = [];
for (const file of targets) {
  const text = await readFile(file, "utf8");
  for (const token of forbidden) {
    if (text.includes(token)) violations.push(`${file}: forbidden core-expression reference ${JSON.stringify(token)}`);
  }
  if (file.includes(`${resolve(root, "src")}`) || file.includes(`${resolve(root, "dist")}`)) {
    for (const token of rejectedModelTokens) {
      if (text.includes(token)) violations.push(`${file}: rejected LumiStage model concept ${JSON.stringify(token)}`);
    }
    if (rejectedPoseModel.test(text)) {
      violations.push(`${file}: pose semantics must remain expression labels, not a separate pose model`);
    }
  }
}

const manifest = JSON.parse(await readFile(resolve(root, "spindle.json"), "utf8"));
const expectedPermissions = ["generation", "chats", "chat_mutation", "characters", "images", "ui_panels"];
if (JSON.stringify(manifest.permissions) !== JSON.stringify(expectedPermissions)) {
  violations.push(`spindle.json: permissions must be exactly ${expectedPermissions.join(", ")}`);
}
if (manifest.identifier !== "lumi_stage") violations.push("spindle.json: identifier must be lumi_stage");
if (manifest.minimum_lumiverse_version !== "1.1.0") violations.push("spindle.json: minimum Lumiverse version must be 1.1.0");

const backend = await readFile(resolve(root, "src/backend.ts"), "utf8");
const detector = await readFile(resolve(root, "src/detector.ts"), "utf8");
const frontend = await readFile(resolve(root, "src/frontend.tsx"), "utf8");
const backendBundle = await readFile(resolve(root, "dist/backend.js"), "utf8");
const frontendBundle = await readFile(resolve(root, "dist/frontend.js"), "utf8");
const studio = await readFile(resolve(root, "src/ui/studio.tsx"), "utf8");
const controls = await readFile(resolve(root, "src/ui/host-controls.tsx"), "utf8");
if (!/export\s+function\s+setup\s*\(/.test(frontend)) violations.push("frontend: Spindle requires a named setup export");
if (!/\bsetup\b/.test(frontendBundle) || !/export\s*\{/.test(frontendBundle)) {
  violations.push("dist/frontend.js: production bundle is missing a named setup export");
}
if (!backend.includes('onEvent("GENERATION_ENDED"')) violations.push("backend: missing completed-generation trigger");
if (!backend.includes('onEvent("GENERATION_STOPPED"')) violations.push("backend: stopped generations are not explicitly ignored");
if (!backend.includes("spindle.characters.get(characterId, userId)")) violations.push("backend: character reads must carry operator userId");
if (!backend.includes("spindle.chats.get(chatId, userId)")) violations.push("backend: chat reads must carry operator userId");
if (!backend.includes("spindle.connections.list(userId)")) violations.push("backend: connection reads must carry operator userId");
if (!backend.includes("{ ...request, userId }")) violations.push("backend: detector generation must carry operator userId");
for (const [label, text] of [["src/detector.ts", detector], ["dist/backend.js", backendBundle]]) {
  if (text.includes("max_tokens")) {
    violations.push(`${label}: detector requests must not impose a max_tokens output cap`);
  }
  if (!text.includes("{ model: settings.detection.model }")) {
    violations.push(`${label}: selected detector model is not dispatched through quiet-call parameters`);
  }
}
if (/^\s*model:\s*settings\.detection\.model\s*\?\?/m.test(detector)) {
  violations.push("src/detector.ts: selected model is using the ignored top-level quiet-call field");
}
if (!frontend.includes("width: 1440") || !frontend.includes("maxHeight: 980")) {
  violations.push("frontend: full Studio must use the large host modal");
}
if (!studio.includes("DrawerDashboard") || !studio.includes("StudioWorkspace")) {
  violations.push("frontend: missing separated dashboard and Studio workspace");
}
if (!controls.includes("mountModelCombobox") || !controls.includes("mountSwitch")) {
  violations.push("frontend: settings must mount Lumiverse native controls");
}
for (const file of [
  resolve(root, "src/types.ts"),
  resolve(root, "src/detector.ts"),
  resolve(root, "src/importer.ts"),
  resolve(root, "src/ui/studio.tsx"),
]) {
  const text = await readFile(file, "utf8");
  if (/\bactor(?:s|Id)?\b/i.test(text)) {
    violations.push(`${file}: internal owner layer survived outside the V1 migration reader`);
  }
}
if (backend.includes('onEvent("GENERATION_STARTED"') && backend.match(/GENERATION_STARTED[\s\S]{0,800}scheduleAnalysis/)) {
  violations.push("backend: detection must not run when generation starts");
}

if (violations.length) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`LumiStage source contract passed across ${targets.length} files.`);
}
