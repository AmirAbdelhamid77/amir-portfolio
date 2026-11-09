#!/usr/bin/env node
// Build the reviewed runtime-addition ledger.
//
// The two frozen preservation baselines predate 171 committed runtime files.
// This generator discovers exactly the files those baselines do not cover,
// derives each file's introducing commit from Git, and refuses to write unless
// every file belongs to a named, reviewed wave below. A generated corpus output
// (public/fabric-*) and anything still untracked is rejected: additions must be
// committed bytes with provenance.
//
// Usage:
//   node scripts/build-runtime-additions-receipt.mjs
//     Dry run: print the plan and any unassigned file; write nothing.
//   node scripts/build-runtime-additions-receipt.mjs --write
//     Create the receipt. Fails if it already exists.
//   node scripts/build-runtime-additions-receipt.mjs --update --review="..."
//     Rewrite it after review. Every previously pinned path must still be
//     present and unchanged; paths may not be dropped. The review note is
//     stored in the receipt.
//   node scripts/build-runtime-additions-receipt.mjs --check
//     Compare disk and Git provenance with the committed receipt. Exit 1 on any
//     drift; write nothing.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { implementationReceipt } from "./atlas-implementation-receipt.mjs";
import {
  ADDITION_BASELINES,
  GENERATED_RUNTIME_ROOTS,
  isGeneratedRuntimePath,
  RUNTIME_ADDITION_SCOPE,
  RUNTIME_ADDITIONS,
} from "./runtime-additions-receipt.mjs";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RECEIPT_DATE = "2026-11-08";
const RUNTIME_DIRS = ["app", "lib", "components", "content", "public", "tests"];
const HASH = /^[a-f0-9]{64}$/;
const COMMIT = /^[a-f0-9]{40}$/;

// Six reviewed waves, grouped by the commits that introduced them. The wave
// titles and review notes are the audit record: a new commit that introduces a
// runtime file must be added here deliberately, with its own note, before the
// receipt can be written.
export const REVIEWED_WAVES = [
  {
    id: "home-day-and-archive",
    title: "Timeline home, fail-closed day ledger and archive fallback",
    review:
      "Reviewed in the cleanup-20261108 audit: the timeline Home shell, fail-closed day ledger, day routes and the archive fallback are the owner-authorized release-default Home. No recovered source body, question bank or media was rewritten.",
    commits: [
      "026f4a750ca3587586810f90943bef2ff338c868",
      "8c72012635564cf5c28c854e76c2c9bc36175eb3",
      "c2949624324da38fd90c75b13fcfe8cff70eaba6",
    ],
  },
  {
    id: "fabric-corpus-compiler-and-search",
    title: "Fabric corpus compiler, route registry, search and bindings",
    review:
      "Reviewed against the docs/fabric-corpus contracts: the compiler, route registry, search shards, bindings and their tests are reproducible tooling. Generated corpus outputs stay outside Git and are not pinned here.",
    commits: [
      "1ded03b57e5566d51c3bc3e8c588bb18a6c7effe",
      "a138f7f3874c5ea5dcec916ef99609204642d0b1",
      "a9d0d2b64b450a6b91b59ea40f0f0944c519189b",
      "ae34717deac8d4b3b45458f82d030ec6b047a8ec",
      "b46048aeb107b7ce41825c34f27f0a87919c038d",
      "e35724cd31a6713d8a8088b3580c5c4d496aaf71",
      "65a92aaf2a45bd2ddc6905458896867966f07230",
      "fa802ab67c7a2195a72c1509e9c3b7f586bbe23b",
    ],
  },
  {
    id: "atlas-records",
    title: "Fabric Atlas records, targets and isolation coverage",
    review:
      "Reviewed by the Atlas isolation and target tests: published-record projections, approvals and isolation coverage. No candidate or held record becomes public and no semantic edge, TOC hierarchy or progress state changed.",
    commits: [
      "34a6240083beeff9b118aa0f6a301921771d0ae1",
      "528ac20aededccdfd853da24eb71e0d08397e195",
      "bbb001bab5e2ba8edbca2178153b002feca18f5b",
    ],
  },
  {
    id: "recovery-collections",
    title: "Recovered collection pages and all 48 storytelling files",
    review:
      "Reviewed against RECOVERY_SOURCE_PARITY.json: the record pages and all 48 storytelling HTML files are preserved with their routes, anchors and IDs. Restricted question bytes and private QA remain outside the public export.",
    commits: ["a8e1d9b243f5a76c340a5779d7873ad24cd7a041"],
  },
  {
    id: "knowledge-graph-prototype",
    title: "Knowledge graph prototype and deterministic data builders",
    review:
      "Reviewed as the noindex prototype/network tree and its deterministic local data builders. It does not alter published Atlas semantics, curriculum progress or any public route contract.",
    commits: ["37f8c0abc313baab2f377e76515dcaf79a1c6d8e"],
  },
  {
    id: "recovery-navigation",
    title: "Recovery navigation, collection shelves and anchor fixes",
    review:
      "Reviewed in the cleanup-20261108 navigation audit: contextual shelves link existing collections without duplicating or republishing restricted material. Routes, anchors, IDs and saved progress are preserved.",
    commits: ["7c6b1d15fc35bd100fc936d4c7b5a4ccb7edc68d"],
  },
  {
    id: "split-worker-release",
    title: "Split-Worker release tests and reviewed-addition coverage",
    review:
      "Reviewed with the split-Worker release: the routing, configuration, split-gate and additions-loader tests are the acceptance evidence for this wave. No recovered content, question bank, media or saved progress changed.",
    commits: ["ba329c407764b1fb7d843509723b3ac13872af54"],
  },
  {
    id: "segment-alias-prune",
    title: "Segment alias prune regression coverage",
    review:
      "Reviewed with the live split release: the test proves flat RSC alias creation, nested __next.* pruning and an idempotent rerun. It protects the deterministic 26,060-file postbuild export; no recovered content, question bank, media or saved progress changed.",
    commits: ["894c2663f10548c4061963be64b554ad0aa216ac"],
  },
];

function parseArgs(argv) {
  const args = { write: false, update: false, check: false, review: null, root: REPO_ROOT };
  for (const raw of argv) {
    if (raw === "--write") args.write = true;
    else if (raw === "--update") args.update = true;
    else if (raw === "--check") args.check = true;
    else if (raw.startsWith("--review=")) args.review = raw.slice("--review=".length);
    else if (raw.startsWith("--root=")) args.root = resolve(raw.slice("--root=".length));
    else throw new Error(`build-runtime-additions-receipt: unsupported argument ${raw}`);
  }
  if ([args.write, args.update, args.check].filter(Boolean).length > 1) {
    throw new Error("choose at most one of --write, --update, --check");
  }
  if (args.update && (!args.review || args.review.trim().length < 40)) {
    throw new Error("--update requires --review with at least 40 characters");
  }
  return args;
}

function walk(root, dir, files = []) {
  for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) walk(root, path, files);
    else if (entry.isFile()) files.push(path.split(sep).join("/"));
    else throw new Error(`unsupported runtime entry: ${path}`);
  }
  return files;
}

function sha256(root, path) {
  return createHash("sha256").update(readFileSync(join(root, path))).digest("hex");
}

function introducingCommit(root, path) {
  const output = execFileSync(
    "git",
    ["-c", "core.quotePath=false", "log", "--diff-filter=A", "--format=%H", "--", path],
    { cwd: root, encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter(Boolean)
    .pop();
  assert.ok(output, `No introducing commit for ${path}; commit the file before pinning it`);
  assert.match(output, COMMIT, `Unexpected commit id for ${path}`);
  return output;
}

function gitTracked(root, path) {
  try {
    execFileSync("git", ["ls-files", "--error-unmatch", "--", path], {
      cwd: root,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

export function discoverAdditions(root) {
  const checkout = resolve(root);
  const easyuiManifest = JSON.parse(
    readFileSync(resolve(checkout, "docs/design-system/easyui-v2/INTEGRATION_MANIFEST.json"), "utf8"),
  );
  const easyuiBaseline = JSON.parse(
    readFileSync(resolve(checkout, "docs/design-system/easyui-v2/PRESERVATION_BASELINE.json"), "utf8"),
  );
  const implementation = implementationReceipt(checkout);
  const additions = [];

  for (const dir of RUNTIME_DIRS) {
    for (const path of walk(checkout, dir)) {
      if (path.endsWith(".md")) continue;
      if (isGeneratedRuntimePath(path)) continue;
      if (Object.hasOwn(easyuiBaseline.files, path)) continue;
      const change = easyuiManifest.runtimeChanges.find((entry) => entry.path === path);
      if (
        change &&
        change.beforeSha256 === null &&
        implementation.expected(path, change.sha256) === sha256(checkout, path)
      ) {
        continue;
      }
      if (implementation.covers(path, null)) continue;
      additions.push(path);
    }
  }
  return additions.sort();
}

export function buildReceipt(root, waves = REVIEWED_WAVES) {
  const paths = discoverAdditions(root);
  const waveByCommit = new Map();
  for (const wave of waves) {
    assert.match(wave.id, /^[a-z0-9-]+$/, `Invalid wave id ${wave.id}`);
    assert.ok(wave.title.length >= 3, `Wave ${wave.id} needs a title`);
    assert.ok(wave.review.length >= 40, `Wave ${wave.id} needs a review note`);
    for (const commit of wave.commits) {
      assert.match(commit, COMMIT, `Wave ${wave.id} has an invalid commit`);
      assert.ok(!waveByCommit.has(commit), `Commit ${commit} appears in two waves`);
      waveByCommit.set(commit, wave);
    }
  }

  const unassigned = [];
  const entries = new Map();
  for (const path of paths) {
    assert.ok(!isGeneratedRuntimePath(path), `Generated output reached the addition scan: ${path}`);
    assert.ok(gitTracked(root, path), `Runtime addition is not tracked by Git: ${path}`);
    const commit = introducingCommit(root, path);
    const wave = waveByCommit.get(commit);
    if (!wave) {
      unassigned.push(`${path} (${commit})`);
      continue;
    }
    const bytes = readFileSync(join(root, path));
    assert.ok(!entries.has(path), `Duplicate runtime addition: ${path}`);
    entries.set(path, {
      path,
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      commit,
      wave: wave.id,
    });
  }
  if (unassigned.length > 0) {
    throw new Error(
      "Unreviewed runtime additions; add their commits to REVIEWED_WAVES before writing:\n  " +
        unassigned.join("\n  "),
    );
  }

  const receiptWaves = [];
  for (const wave of waves) {
    const files = [...entries.values()]
      .filter((entry) => entry.wave === wave.id)
      .sort((a, b) => (a.path < b.path ? -1 : 1))
      .map(({ path, bytes, sha256, commit }) => ({ path, bytes, sha256, commit }));
    assert.ok(files.length > 0, `Reviewed wave ${wave.id} pins no files; refusing an empty wave`);
    receiptWaves.push({
      id: wave.id,
      title: wave.title,
      review: wave.review,
      commits: [...wave.commits],
      files,
    });
  }

  const receipt = {
    scope: RUNTIME_ADDITION_SCOPE,
    date: RECEIPT_DATE,
    reason:
      "Every entry is a committed runtime file introduced after both frozen preservation baselines. Each is pinned to its exact bytes and introducing commit; no baseline path, generated corpus root or restricted source is covered.",
    baselines: [...ADDITION_BASELINES].sort(),
    generatedRoots: [...GENERATED_RUNTIME_ROOTS].sort(),
    waves: receiptWaves,
  };
  return { receipt, paths, entries };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const receiptPath = resolve(args.root, RUNTIME_ADDITIONS);
  const exists = existsSync(receiptPath);
  if (args.check && !exists) throw new Error(`Receipt is missing: ${RUNTIME_ADDITIONS}`);
  if (args.write && exists) throw new Error(`Receipt already exists; use --update after review`);
  if (args.update && !exists) throw new Error(`Receipt does not exist; use --write`);

  const { receipt, paths } = buildReceipt(args.root);
  const total = receipt.waves.reduce((sum, wave) => sum + wave.files.length, 0);
  assert.equal(total, paths.length);
  console.log(`runtime additions: ${total} files in ${receipt.waves.length} reviewed waves`);
  for (const wave of receipt.waves) {
    console.log(`  ${wave.id}: ${wave.files.length} files, ${wave.commits.length} commits`);
  }

  if (args.check) {
    const current = JSON.parse(readFileSync(receiptPath, "utf8"));
    const { review, previousReceiptSha256, ...core } = current;
    assert.deepEqual(receipt, core, "Runtime additions receipt is stale; run --update after review");
    // Review metadata is written by --update, so it is validated rather than
    // regenerated: the deterministic core above still has to match byte-for-byte.
    if (review !== undefined) {
      assert.equal(typeof review, "string", "Receipt review note must be a string");
      assert.ok(review.trim().length >= 40, "Receipt review note is too short");
    }
    if (previousReceiptSha256 !== undefined) {
      assert.match(
        previousReceiptSha256,
        HASH,
        "Receipt predecessor hash must be a SHA-256 hex digest",
      );
    }
    console.log("PASS: runtime additions receipt matches disk and Git provenance");
    return;
  }

  if (!args.write && !args.update) {
    console.log("DRY RUN: no receipt written (use --write or --update --review=...)");
    return;
  }

  if (args.update) {
    const current = JSON.parse(readFileSync(receiptPath, "utf8"));
    const previous = new Map(current.waves.flatMap((wave) => wave.files.map((file) => [file.path, file])));
    for (const [path, entry] of previous) {
      const next = receipt.waves.flatMap((wave) => wave.files).find((file) => file.path === path);
      assert.ok(next, `--update cannot drop a reviewed addition: ${path}`);
      assert.equal(next.sha256, entry.sha256, `--update cannot rewrite a reviewed addition: ${path}`);
      assert.equal(next.commit, entry.commit, `--update cannot change provenance: ${path}`);
    }
    receipt.review = args.review.trim();
    receipt.previousReceiptSha256 = createHash("sha256").update(readFileSync(receiptPath)).digest("hex");
  }

  writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n");
  console.log(`PASS: wrote ${RUNTIME_ADDITIONS}`);
}

const isDirectRun = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  try {
    main();
  } catch (error) {
    console.error(`FAIL: ${error.message}`);
    process.exitCode = 1;
  }
}
