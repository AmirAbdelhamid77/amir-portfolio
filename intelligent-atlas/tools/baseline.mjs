// Preservation baseline for the visual-review assignment.
// Reads git status and records hashes of every pre-existing dirty path before
// this task writes anything. It never stages, resets or cleans.
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "intelligent-atlas", "evidence");
mkdirSync(outDir, { recursive: true });

const head = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
const branch = execSync("git branch --show-current", { encoding: "utf8" }).trim();
const status = execSync("git status --porcelain=v1", { encoding: "utf8" })
  .split(/\r?\n/)
  .filter(Boolean);

const files = [];
for (const line of status) {
  const raw = line.slice(3).trim().replace(/^"|"$/g, "");
  if (!raw) continue;
  const candidates = raw.includes(" -> ") ? raw.split(" -> ") : [raw];
  for (const rel of candidates) {
    const absolute = path.join(root, rel);
    if (!existsSync(absolute)) {
      files.push({ status: line.slice(0, 2).trim(), path: rel, missing: true });
      continue;
    }
    if (statSync(absolute).isDirectory()) {
      const walk = (dir) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const child = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(child);
          else {
            const bytes = readFileSync(child);
            files.push({
              status: line.slice(0, 2).trim(),
              path: path.relative(root, child).split(path.sep).join("/"),
              bytes: bytes.length,
              sha256: createHash("sha256").update(bytes).digest("hex"),
            });
          }
        }
      };
      walk(absolute);
      continue;
    }
    const bytes = readFileSync(absolute);
    files.push({
      status: line.slice(0, 2).trim(),
      path: rel,
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    });
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  head,
  branch,
  dirtyCount: files.length,
  note: "Pre-existing tracked/untracked changes recorded before intelligent-atlas/ work. No reset, clean or stash was run.",
  files,
};
writeFileSync(path.join(outDir, "baseline-preservation.json"), JSON.stringify(output, null, 2) + "\n");
console.log(`recorded ${files.length} dirty paths at ${head}`);
