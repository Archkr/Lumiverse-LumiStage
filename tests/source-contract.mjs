import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const forbidden = [
  "/expressions",
  "extensions.expressions",
  "expression_groups",
  "EXPRESSION_CHANGED",
];

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
}

const manifest = JSON.parse(await readFile(resolve(root, "spindle.json"), "utf8"));
const expectedPermissions = ["generation", "chats", "chat_mutation", "characters", "images", "ui_panels"];
if (JSON.stringify(manifest.permissions) !== JSON.stringify(expectedPermissions)) {
  violations.push(`spindle.json: permissions must be exactly ${expectedPermissions.join(", ")}`);
}
if (manifest.identifier !== "lumi_stage") violations.push("spindle.json: identifier must be lumi_stage");
if (manifest.minimum_lumiverse_version !== "1.1.0") violations.push("spindle.json: minimum Lumiverse version must be 1.1.0");

const backend = await readFile(resolve(root, "src/backend.ts"), "utf8");
const frontend = await readFile(resolve(root, "src/frontend.tsx"), "utf8");
const frontendBundle = await readFile(resolve(root, "dist/frontend.js"), "utf8");
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
if (backend.includes('onEvent("GENERATION_STARTED"') && backend.match(/GENERATION_STARTED[\s\S]{0,800}scheduleAnalysis/)) {
  violations.push("backend: detection must not run when generation starts");
}

if (violations.length) {
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`LumiStage source contract passed across ${targets.length} files.`);
}
