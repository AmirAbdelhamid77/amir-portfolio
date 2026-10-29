// Next.js 16.4.x static export writes per-segment RSC payloads into nested
// folders (e.g. out/work/__next.work/$d$slug/__PAGE__.txt), but the client
// router requests the flat, dot-separated name (e.g.
// /work/__next.work.$d$slug.__PAGE__.txt). Without an alias at that path every
// Link prefetch 404s and each navigation falls back to a full page load.
//
// This copies each segment payload to the name the client asks for. It runs
// automatically through the `postbuild` script and is idempotent. Remove it
// once `next build` emits the flat names itself.
//   node scripts/export-segment-aliases.mjs
import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

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

let written = 0;

for await (const file of walk(OUT)) {
  const parts = path.relative(OUT, file).split(path.sep);
  const segmentIndex = parts.findIndex((part) => part.startsWith("__next."));

  // Only files nested inside a `__next.*` segment folder need an alias.
  if (segmentIndex === -1 || segmentIndex === parts.length - 1) continue;

  const aliasName = parts.slice(segmentIndex).join(".");
  const targetParts = [...parts.slice(0, segmentIndex), aliasName];
  const target = path.join(OUT, ...targetParts);

  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(file, target);
  written += 1;
}

console.log(`Segment payload aliases: wrote ${written} file(s).`);
