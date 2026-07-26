import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

async function filesUnder(path) {
  const info = await stat(path);
  if (info.isFile()) return [path];
  const entries = await readdir(path);
  return (await Promise.all(entries.map((entry) => filesUnder(resolve(path, entry))))).flat();
}

const sourceFiles = await filesUnder(resolve(root, "src"));
const findings = [];
const risky = [
  ["dynamic code execution", /\beval\s*\(|new\s+Function\s*\(/],
  ["cookie access", /\bdocument\.cookie\b/],
  ["unscoped browser persistence", /\b(?:localStorage|sessionStorage)\b/],
  ["raw HTML assignment", /\.innerHTML\s*=/],
  ["websocket creation", /\bnew\s+WebSocket\s*\(/],
];
for (const file of sourceFiles) {
  const text = await readFile(file, "utf8");
  for (const [label, pattern] of risky) if (pattern.test(text)) findings.push(`${file}: ${label}`);
}

const manifest = JSON.parse(await readFile(resolve(root, "spindle.json"), "utf8"));
for (const permission of ["app_manipulation", "interceptor", "image_gen"]) {
  if (manifest.permissions.includes(permission)) findings.push(`spindle.json: disallowed permission ${permission}`);
}
for (const entry of [manifest.entry_backend, manifest.entry_frontend]) {
  try {
    const info = await stat(resolve(root, entry));
    if (!info.isFile() || info.size === 0) findings.push(`${entry}: bundle is missing or empty`);
    if (info.size > 5 * 1024 * 1024) findings.push(`${entry}: bundle exceeds 5 MB`);
  } catch {
    findings.push(`${entry}: bundle is missing`);
  }
}

if (findings.length) {
  console.error(findings.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`LumiStage safety scan passed across ${sourceFiles.length} source files.`);
}

