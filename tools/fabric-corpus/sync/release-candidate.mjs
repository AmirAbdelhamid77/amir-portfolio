#!/usr/bin/env node
// Hansa fabric-corpus sync machinery — release candidate (FC09/W3-C).
//
//   node tools/fabric-corpus/sync/release-candidate.mjs \
//     --base <real docs root> --successor <sim/docs root> --plan <sync-plan.json> \
//     --base-output <sync/base-output> --out <sync/rc-output/<label>> \
//     [--revision <pinned sha>]
//
// Drives the FROZEN FC03 compiler (compileFamily/writeOutputs from
// tools/fabric-corpus/compiler/compile.mjs — the same entry point the CLI and
// compile-all-families.mjs use) per the sync plan, against the successor copy:
//
//   - action=recompile rows: fresh nodes compiled from the successor; the
//     per-article source sha -> output sha mapping is recorded and gated
//     (the compiled node's own source.sha256/source.path must equal the
//     plan's successor selection — source-to-output traceability);
//   - action=keep rows: the BASE artifact bytes are reused into the candidate
//     export AND verified byte-identical against a fresh successor compile of
//     the same article — the reproducibility check (a 'keep' that would not
//     reproduce byte-for-byte fails the run; nothing ships silently);
//   - action=tombstone rows: no node is emitted; a tombstone record carries
//     logicalPath, last revision, last source sha and last node sha, with a
//     retention-policy placeholder (upstream removal / rename / withdrawal);
//   - rights withdrawals additionally emit withdrawal records with
//     action=purge-on-publish; the withdrawn article is excluded from the
//     candidate article set (fail-closed assertion) — the actual deletion of
//     published routes/assets/shards/caches is a DEPLOYMENT-TIME action of
//     the release publisher, never performed by this offline fixture;
//   - changed fragments under non-article families (include sources) get
//     their compiled fragment nodes refreshed too.
//
// Base compiles are produced once into --base-output (pinned revision) and
// reused on later runs. Receipts are canonical JSON, no clock, no absolute
// paths. Exit 0 clean, 1 on any accounting/reproducibility failure (the
// receipt is still written), 2 usage.

import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { compileFamily, writeOutputs } from '../compiler/compile.mjs';
import {
  PINNED_CORPUS_REVISION,
  canonicalJson,
  parseArgs,
  readJson,
  sha256Buffer,
  toPosix,
} from './lib.mjs';

const USAGE =
  'usage: release-candidate.mjs --base <docsRoot> --successor <docsRoot> --plan <sync-plan.json> ' +
  '--base-output <dir> --out <dir> [--revision <sha>]';

const RETENTION_POLICY_PLACEHOLDER = 'placeholder-retain-until-approved-policy-v0';

// ---------------------------------------------------------------------------
// Compile helpers
// ---------------------------------------------------------------------------

/** Compile one family against a corpus root, writing full artifacts into
 *  outDir (only when the family manifest is not already there — base compiles
 *  are produced once and reused). Returns the family manifest object. */
function ensureBaseCompile({ corpusRootAbs, outDirAbs, family, revision }) {
  const manifestPath = join(outDirAbs, family, 'manifest.json');
  if (existsSync(manifestPath)) {
    const manifest = readJson(manifestPath);
    if (manifest.corpusRevision && revision && manifest.corpusRevision !== revision) {
      throw new Error(`base-output manifest for "${family}" is pinned to ${manifest.corpusRevision}, expected ${revision}`);
    }
    return manifest;
  }
  const result = compileFamily({ corpusRootAbs, family, corpusRevision: revision });
  writeOutputs({ result, outDirAbs, family });
  return readJson(manifestPath);
}

function nodeFileFor(sourcePath) {
  return `nodes/${sourcePath.replace(/\.md$/i, '.json')}`;
}

// ---------------------------------------------------------------------------
// Release candidate
// ---------------------------------------------------------------------------

/** Run the release candidate per the sync plan. All accounting and the
 *  reproducibility check run before any candidate nodes are written.
 *  Every run requires a new output directory. */
export function runReleaseCandidate({
  baseRoot,
  successorRoot,
  plan,
  baseOutputDir,
  outDir,
  revision = plan.baseCorpusRevision ?? PINNED_CORPUS_REVISION,
}) {
  if (plan.schema !== 'hansa.fabric-sync/sync-plan/1') {
    throw new Error(`unexpected plan schema: ${plan.schema}`);
  }
  if (existsSync(outDir)) throw new Error('candidate output must be a fresh directory');
  const families = plan.families;
  const failures = [];
  const warnings = [];

  // Fragment families: top-level directories of changed non-article paths
  // that are not article families (e.g. the top-level includes/ sources).
  const fragmentFamilies = new Set();
  for (const p of plan.diffs.fragmentChanges ?? []) {
    const top = p.split('/')[0];
    if (!families.includes(top)) fragmentFamilies.add(top);
  }

  // 1. Base compiles (pinned revision), produced once and reused.
  const baseManifests = new Map();
  for (const family of [...families, ...fragmentFamilies]) {
    baseManifests.set(family, ensureBaseCompile({ corpusRootAbs: baseRoot, outDirAbs: baseOutputDir, family, revision }));
  }

  // 2. Successor compiles per article family (fresh, in memory).
  const successorNodes = new Map(); // family -> Map(nodeFile -> json string)
  for (const family of families) {
    const result = compileFamily({
      corpusRootAbs: successorRoot,
      family,
      corpusRevision: plan.successorRevision ?? revision,
    });
    successorNodes.set(family, result.nodeJsonByName);
  }
  const successorFragmentNodes = new Map(); // family -> Map(nodeFile -> json)
  for (const family of fragmentFamilies) {
    if (statSync(join(successorRoot, family), { throwIfNoEntry: false })?.isDirectory() !== true) continue;
    const result = compileFamily({
      corpusRootAbs: successorRoot,
      family,
      corpusRevision: plan.successorRevision ?? revision,
    });
    successorFragmentNodes.set(family, result.nodeJsonByName);
  }

  const receiptArticles = [];
  const tombstones = [];
  const withdrawals = [];
  const fragmentRefresh = [];
  const emittedNodes = new Map(); // nodeRel ('<family>/nodes/<...>.json') -> bytes source descriptor

  // 3. Per-article accounting (no writes yet).
  for (const row of plan.articles) {
    const family = row.sourcePath.split('/')[0];
    const nodeFile = nodeFileFor(row.sourcePath);
    const nodeRel = `${family}/${nodeFile}`;
    const baseManifest = baseManifests.get(family);
    const baseNodeSha = baseManifest?.checksums?.[nodeFile] ?? null;
    const baseNodeAbs = join(baseOutputDir, family, ...nodeFile.split('/'));

    if (row.action === 'tombstone') {
      const disposition = row.reason === 'rights-withdrawn' ? 'purge-on-publish' : 'retain-as-tombstone';
      const tombstone = {
        logicalPath: row.logicalPath,
        sourcePath: row.sourcePath,
        articleId: row.articleId,
        lastRevision: plan.baseCorpusRevision,
        lastSourceSha256: row.baseSha256,
        lastNodeSha256: baseNodeSha,
        lastNodeFile: baseNodeSha ? nodeRel : null,
        reason: row.reason,
        retentionPolicy: RETENTION_POLICY_PLACEHOLDER,
        disposition,
      };
      tombstones.push(tombstone);
      if (row.reason === 'rights-withdrawn') {
        withdrawals.push({
          ...tombstone,
          route: row.logicalPath,
          action: 'purge-on-publish',
          note:
            'Accounting record only. The purge of published routes, assets, search shards and caches, and the ' +
            'disqualification of affected snapshots from rollback, are deployment-time actions executed by the ' +
            'release publisher — never performed by this offline fixture.',
        });
      }
      continue;
    }

    if (row.action === 'keep') {
      const baseBytes = existsSync(baseNodeAbs) ? readFileSync(baseNodeAbs) : null;
      if (!baseBytes) {
        failures.push(`keep row ${row.sourcePath}: base artifact missing at ${nodeRel}`);
        continue;
      }
      const baseBytesSha = sha256Buffer(baseBytes);
      if (baseBytesSha !== baseNodeSha) {
        failures.push(`keep row ${row.sourcePath}: base artifact checksum drift at ${nodeRel}`);
        continue;
      }
      // Reproducibility check: the successor compile must reproduce the base
      // node byte-for-byte. A mismatch means the plan (or the environment)
      // is wrong — fail closed rather than silently shipping a changed node
      // under a 'keep' label.
      const freshJson = successorNodes.get(family)?.get(nodeFile);
      let byteIdentical = false;
      if (freshJson === undefined) {
        failures.push(`keep row ${row.sourcePath}: successor compile produced no node (${nodeFile})`);
      } else if (sha256Buffer(Buffer.from(freshJson, 'utf8')) === baseBytesSha) {
        byteIdentical = true;
      } else {
        failures.push(`reproducibility failure: keep row ${row.sourcePath} recompiled differently from the base compile`);
      }
      emittedNodes.set(nodeRel, { kind: 'reuse-base', baseNodeAbs });
      receiptArticles.push({
        sourcePath: row.sourcePath,
        family,
        articleId: row.articleId,
        logicalPath: row.logicalPath,
        action: 'keep',
        reason: row.reason,
        provenance: 'reused-base-artifact',
        sourceSha256: row.baseSha256,
        outputNodeSha256: baseNodeSha,
        nodeFile: nodeRel,
        reproducibilityChecked: true,
        byteIdenticalToBase: byteIdentical,
      });
      continue;
    }

    if (row.action === 'recompile') {
      const freshJson = successorNodes.get(family)?.get(nodeFile);
      if (freshJson === undefined) {
        failures.push(`recompile row ${row.sourcePath}: successor compile produced no node (${nodeFile})`);
        continue;
      }
      const compiled = JSON.parse(freshJson);
      // Traceability gate: the compiled node must name the exact successor
      // source the plan selected.
      if (row.successorSha256 && compiled.source?.sha256 !== row.successorSha256) {
        failures.push(
          `traceability failure: ${row.sourcePath} node source sha ${compiled.source?.sha256} != plan successor sha ${row.successorSha256}`,
        );
      }
      if (compiled.source?.path !== row.sourcePath) {
        failures.push(`traceability failure: ${row.sourcePath} node source path mismatch (${compiled.source?.path})`);
      }
      const outputSha = sha256Buffer(Buffer.from(freshJson, 'utf8'));
      emittedNodes.set(nodeRel, { kind: 'fresh', bytes: Buffer.from(freshJson, 'utf8') });
      receiptArticles.push({
        sourcePath: row.sourcePath,
        family,
        articleId: row.articleId,
        logicalPath: row.logicalPath,
        action: 'recompile',
        reason: row.reason,
        provenance: 'recompiled-from-successor',
        sourceSha256: row.successorSha256,
        baseSourceSha256: row.baseSha256 ?? null,
        outputNodeSha256: outputSha,
        baseNodeSha256: baseNodeSha,
        nodeFile: nodeRel,
        reproducibilityChecked: false,
        byteIdenticalToBase: outputSha === baseNodeSha,
      });
      continue;
    }

    failures.push(`plan row ${row.sourcePath}: unknown action "${row.action}"`);
  }

  // 4. Fragment refresh for changed include-source fragments.
  for (const fragPath of plan.diffs.fragmentChanges ?? []) {
    const top = fragPath.split('/')[0];
    if (families.includes(top)) continue; // article families carry their own nodes
    const freshMap = successorFragmentNodes.get(top);
    if (!freshMap) continue;
    const nodeFile = nodeFileFor(fragPath);
    const freshJson = freshMap.get(nodeFile);
    const baseNodeSha = baseManifests.get(top)?.checksums?.[nodeFile] ?? null;
    if (freshJson === undefined) {
      failures.push(`fragment refresh: successor compile produced no node for ${fragPath}`);
      continue;
    }
    const freshSha = sha256Buffer(Buffer.from(freshJson, 'utf8'));
    const nodeRel = `${top}/${nodeFile}`;
    emittedNodes.set(nodeRel, { kind: 'fresh', bytes: Buffer.from(freshJson, 'utf8') });
    fragmentRefresh.push({
      path: fragPath,
      nodeFile: nodeRel,
      baseNodeSha256: baseNodeSha,
      freshNodeSha256: freshSha,
      changed: freshSha !== baseNodeSha,
    });
  }

  // 5. Fail-closed accounting assertions (before any write).
  const candidatePaths = new Set(receiptArticles.map((a) => a.sourcePath));
  for (const w of plan.diffs.rightsChanged ?? []) {
    if (candidatePaths.has(w.sourcePath)) {
      failures.push(`withdrawn article ${w.sourcePath} still present in the candidate article set`);
    }
    const withdrawnRow = plan.articles.find((r) => r.sourcePath === w.sourcePath);
    if (withdrawnRow?.action !== 'tombstone') {
      failures.push(`withdrawn article ${w.sourcePath} is not tombstoned in the plan`);
    }
    if (withdrawnRow?.logicalPath == null) {
      failures.push(`withdrawn article ${w.sourcePath} has no logical route recorded`);
    }
  }
  const plannedCandidate = plan.counts.recompile + plan.counts.keep;
  if (receiptArticles.length !== plannedCandidate) {
    failures.push(`candidate accounting: emitted ${receiptArticles.length} articles, plan expects ${plannedCandidate}`);
  }
  if (tombstones.length !== plan.counts.tombstone) {
    failures.push(`tombstone accounting: emitted ${tombstones.length}, plan expects ${plan.counts.tombstone}`);
  }
  // No tombstoned logicalPath may leak a node into the candidate export.
  for (const t of tombstones) {
    if (!t.lastNodeFile) continue;
    if (emittedNodes.has(t.lastNodeFile)) failures.push(`tombstoned article ${t.sourcePath} has a node in the candidate export`);
  }

  const reproducibility = {
    checked: receiptArticles.filter((a) => a.reproducibilityChecked).length,
    byteIdenticalCount: receiptArticles.filter((a) => a.byteIdenticalToBase === true).length,
    mismatches: failures.filter((f) => f.startsWith('reproducibility failure')),
    result: failures.some((f) => f.startsWith('reproducibility failure')) ? 'fail' : 'pass',
  };

  const receipt = {
    schema: 'hansa.fabric-sync/rc-receipt/1',
    label: plan.label,
    baseCorpusRevision: plan.baseCorpusRevision,
    successorRevision: plan.successorRevision,
    retentionPolicy: RETENTION_POLICY_PLACEHOLDER,
    families: [...families].sort(),
    fragmentFamilies: [...fragmentFamilies].sort(),
    articles: receiptArticles,
    counts: {
      plannedArticles: plan.counts.articlesInScope,
      recompiled: receiptArticles.filter((a) => a.action === 'recompile').length,
      keptReused: receiptArticles.filter((a) => a.action === 'keep').length,
      added: receiptArticles.filter((a) => a.reason === 'added').length,
      renamedIn: receiptArticles.filter((a) => a.reason?.startsWith('renamed-from:')).length,
      removed: tombstones.filter((t) => t.reason === 'removed-upstream').length,
      renamedAway: tombstones.filter((t) => t.reason?.startsWith('renamed-to:')).length,
      withdrawn: withdrawals.length,
      tombstoned: tombstones.length,
      invalidationEfficiency: plan.efficiency,
    },
    tombstones,
    withdrawals,
    fragmentRefresh,
    reproducibility,
    failures,
    warnings,
  };

  // 6. Claim the directory exclusively. Failed checks leave only diagnostics.
  mkdirSync(dirname(outDir), { recursive: true });
  mkdirSync(outDir);
  if (failures.length > 0) {
    writeFileSync(join(outDir, 'rc-receipt.json'), canonicalJson(receipt), 'utf8');
    return { receipt, outDir };
  }
  for (const [nodeRel, src] of emittedNodes) {
    const destAbs = join(outDir, ...nodeRel.split('/'));
    mkdirSync(dirname(destAbs), { recursive: true });
    if (src.kind === 'fresh') writeFileSync(destAbs, src.bytes);
    else copyFileSync(src.baseNodeAbs, destAbs);
  }
  writeFileSync(join(outDir, 'tombstones.json'), canonicalJson(tombstones), 'utf8');
  writeFileSync(join(outDir, 'withdrawals.json'), canonicalJson(withdrawals), 'utf8');
  writeFileSync(join(outDir, 'rc-receipt.json'), canonicalJson(receipt), 'utf8');

  return { receipt, outDir };
}

function main(argv) {
  let args;
  try {
    args = parseArgs(argv, { required: ['base', 'successor', 'plan', 'base-output', 'out'] });
  } catch (err) {
    process.stderr.write(`error: ${err.message}\n${USAGE}\n`);
    process.exit(2);
    return;
  }
  if (args.help) {
    process.stdout.write(`${USAGE}\n`);
    return;
  }
  const baseRoot = resolve(process.cwd(), toPosix(args.base));
  const successorRoot = resolve(process.cwd(), toPosix(args.successor));
  const planPath = resolve(process.cwd(), toPosix(args.plan));
  const baseOutputDir = resolve(process.cwd(), toPosix(args['base-output']));
  const outDir = resolve(process.cwd(), toPosix(args.out));

  try {
    const plan = readJson(planPath);
    const { receipt, outDir: written } = runReleaseCandidate({ baseRoot, successorRoot, plan, baseOutputDir, outDir });
    const c = receipt.counts;
    process.stdout.write(
      `rc: label=${receipt.label} recompiled=${c.recompiled} kept=${c.keptReused} ` +
        `tombstoned=${c.tombstoned} withdrawn=${c.withdrawn} ` +
        `reproducibility=${receipt.reproducibility.result} (${receipt.reproducibility.byteIdenticalCount}/${receipt.reproducibility.checked}) ` +
        `efficiency=${c.invalidationEfficiency.invalidationRatio}\n` +
        `written: ${written}\n`,
    );
    if (receipt.failures.length > 0) {
      process.stderr.write(`FAIL-CLOSED: ${receipt.failures.length} accounting/reproducibility failure(s):\n`);
      for (const f of receipt.failures) process.stderr.write(`  - ${f}\n`);
      process.exit(1);
      return;
    }
  } catch (err) {
    process.stderr.write(`error: ${err.message}\n`);
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}
