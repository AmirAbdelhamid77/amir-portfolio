// Next.js 16.4.x static export writes per-segment RSC payloads into nested
// folders (e.g. out/work/__next.work/$d$slug/__PAGE__.txt), but the client
// router requests the flat, dot-separated name (e.g.
// /work/__next.work.$d$slug.__PAGE__.txt). Without an alias at that path every
// Link prefetch 404s and each navigation falls back to a full page load.
//
// This copies each segment payload to the name the client asks for, then
// removes the nested originals: nothing requests them, and keeping both trees
// doubled the export's payload paths and stalled the Workers asset manifest.
// It runs automatically through the `postbuild` script and is idempotent.
// Remove it once `next build` emits only the flat names itself.
//   node scripts/export-segment-aliases.mjs
import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.resolve("out");

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

export async function exportSegmentAliases(out = OUT) {
  let written = 0;
  const nestedRoots = new Map();

  for await (const file of walk(out)) {
    const parts = path.relative(out, file).split(path.sep);
    const segmentIndex = parts.findIndex((part) => part.startsWith("__next."));

    // Only files nested inside a `__next.*` segment folder need an alias.
    if (segmentIndex === -1 || segmentIndex === parts.length - 1) continue;

    const aliasName = parts.slice(segmentIndex).join(".");
    const targetParts = [...parts.slice(0, segmentIndex), aliasName];
    const target = path.join(out, ...targetParts);

    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(file, target);
    written += 1;

    const nestedRoot = parts.slice(0, segmentIndex + 1).join(path.sep);
    nestedRoots.set(nestedRoot, (nestedRoots.get(nestedRoot) ?? 0) + 1);
  }

  // Prune only after every alias has been written. The alias is the file the
  // client router requests; the nested copy is dead weight in the asset tree.
  let prunedFiles = 0;
  for (const [relativeRoot, files] of nestedRoots) {
    await rm(path.join(out, relativeRoot), { recursive: true, force: true });
    prunedFiles += files;
  }

  return { written, directories: nestedRoots.size, prunedFiles };
}

const isDirectRun =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const result = await exportSegmentAliases();
  console.log(
    `Segment payload aliases: wrote ${result.written} file(s); pruned ${result.directories} ` +
      `nested director${result.directories === 1 ? "y" : "ies"} (${result.prunedFiles} file(s)).`,
  );
}
