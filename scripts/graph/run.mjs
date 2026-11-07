import { buildSync } from "esbuild";
import { execFileSync } from "node:child_process";
import path from "node:path";

const outfile = path.join(".scratch", "graph-build.cjs");
buildSync({
  entryPoints: ["scripts/graph/entry.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile,
  tsconfig: "tsconfig.json",
  logLevel: "warning",
  loader: { ".json": "json" },
});
execFileSync(process.execPath, [outfile], { stdio: "inherit" });
