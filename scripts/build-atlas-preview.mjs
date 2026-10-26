// Separate, explicitly labeled editorial review artifact. The normal out/ export
// is rebuilt afterward with candidate relations excluded. Never deploy here.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync, readFileSync, cpSync } from "node:fs";
import { resolve } from "node:path";
const folder = resolve("build/atlas-preview"), marker = resolve(folder, "LOCAL_REVIEW_ONLY.json");
if (existsSync(folder) && !existsSync(marker)) throw new Error("Refusing to overwrite an unowned preview directory");
mkdirSync(folder, { recursive: true });
function build(preview) {
  const environment = { ...process.env, HANSA_ATLAS_REVIEW_PREVIEW: preview ? "1" : "0" };
  const result = process.platform === "win32"
    ? spawnSync("cmd.exe", ["/d", "/s", "/c", "npm run build"], { env: environment, stdio: "inherit", windowsHide: true })
    : spawnSync("npm", ["run", "build"], { env: environment, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`Build failed (${result.status})`);
}
try {
  build(true);
  const html = readFileSync("out/learn/dp-600/atlas/index.html", "utf8");
  if (!html.includes("Local review preview") && !html.includes("Documentation-reviewed local preview")) throw new Error("Missing local-review notice");
  cpSync("out", resolve(folder, "out"), { recursive: true });
  writeFileSync(marker, JSON.stringify({ purpose: "Local review only; not approved for deployment", humanPublicationReviewPending: true, generatedAt: new Date().toISOString(), host: "127.0.0.1", concepts: 42, semanticRelations: 49 }, null, 2));
} finally { build(false); }
console.log("Local Atlas review: build/atlas-preview/out. Default out/ restored with unpublished relations excluded. No deployment.");
