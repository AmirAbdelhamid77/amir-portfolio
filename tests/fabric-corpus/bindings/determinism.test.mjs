// FC06 — determinism gate.
//
//   node --experimental-strip-types --test tests/fabric-corpus/bindings/
//
// (f) re-running content/fabric/bindings/build-bindings.mjs over the frozen
//     route registry produces byte-identical artifacts. The rebuild goes to a
//     temp dir (FABRIC_CONTENT_OUT), so the committed files are never touched.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import { repoRoot, REGISTRY_AVAILABLE } from "./helpers.mjs";

const scriptPath = path.join(repoRoot, "content", "fabric", "bindings", "build-bindings.mjs");
const ARTIFACTS = [
  "fabric/bindings/primary.json",
  "fabric/bindings/secondary.json",
  "fabric/collections/collections.json",
];

test("build-bindings.mjs is byte-identical on re-run", (t) => {
  if (!REGISTRY_AVAILABLE) t.skip("registry not built yet");
  const tmp = mkdtempSync(path.join(os.tmpdir(), "fc06-determinism-"));
  try {
    const result = spawnSync(process.execPath, [scriptPath], {
      cwd: repoRoot,
      env: { ...process.env, FABRIC_CONTENT_OUT: tmp },
      encoding: "utf8",
    });
    assert.equal(
      result.status,
      0,
      `build-bindings.mjs failed in the temp dir:\n${result.stdout}\n${result.stderr}`,
    );
    for (const rel of ARTIFACTS) {
      const committedPath = path.join(repoRoot, "content", rel);
      const rebuiltPath = path.join(tmp, rel);
      assert.ok(existsSync(rebuiltPath), `rebuilt artifact missing: ${rel}`);
      const committed = readFileSync(committedPath);
      const rebuilt = readFileSync(rebuiltPath);
      assert.equal(
        Buffer.compare(committed, rebuilt),
        0,
        `${rel} is not byte-identical after a rebuild — the generator has nondeterministic output`,
      );
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
