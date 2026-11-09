import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { exportSegmentAliases } from "../../scripts/export-segment-aliases.mjs";

function write(root, path, body = path) {
  const absolute = join(root, ...path.split("/"));
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, body);
}

test("segment aliases copy to the flat router name and prune the nested originals", async () => {
  const root = mkdtempSync(join(tmpdir(), "hansa-segment-aliases-"));
  const out = join(root, "out");
  try {
    write(out, "work/index.html");
    write(out, "work/index.txt");
    write(out, "work/__next._tree.txt");
    write(out, "work/__next.work/$d$slug/__PAGE__.txt", "page payload");
    write(out, "work/__next.work/$d$slug/__next._tree.txt", "tree payload");

    const result = await exportSegmentAliases(out);
    assert.deepEqual(result, { written: 2, directories: 1, prunedFiles: 2 });

    assert.equal(
      readFileSync(join(out, "work", "__next.work.$d$slug.__PAGE__.txt"), "utf8"),
      "page payload",
    );
    assert.equal(
      readFileSync(join(out, "work", "__next.work.$d$slug.__next._tree.txt"), "utf8"),
      "tree payload",
    );
    assert.equal(existsSync(join(out, "work", "__next.work")), false, "the nested root is pruned");
    assert.equal(readFileSync(join(out, "work", "index.html"), "utf8"), "work/index.html");
    assert.equal(readFileSync(join(out, "work", "__next._tree.txt"), "utf8"), "work/__next._tree.txt");

    const rerun = await exportSegmentAliases(out);
    assert.deepEqual(rerun, { written: 0, directories: 0, prunedFiles: 0 });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
