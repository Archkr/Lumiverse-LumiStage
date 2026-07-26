import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const pathFromHere = (path) => fileURLToPath(new URL(path, import.meta.url));

await mkdir(pathFromHere("../dist/"), { recursive: true });

await Promise.all([
  build({
    entryPoints: [pathFromHere("../src/backend.ts")],
    outfile: pathFromHere("../dist/backend.js"),
    bundle: true,
    format: "esm",
    platform: "node",
    target: "esnext",
    sourcemap: false,
    legalComments: "none",
  }),
  build({
    entryPoints: [pathFromHere("../src/frontend.tsx")],
    outfile: pathFromHere("../dist/frontend.js"),
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "esnext",
    sourcemap: false,
    legalComments: "none",
  }),
]);

console.log("Built LumiStage backend and frontend.");
