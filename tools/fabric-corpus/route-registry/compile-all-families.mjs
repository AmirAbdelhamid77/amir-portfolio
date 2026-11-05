#!/usr/bin/env node
// FC05 — compile every route-plan family of the pinned corpus into the build
// workspace.
//
//   node tools/fabric-corpus/route-registry/compile-all-families.mjs \
//     [--families admin,onelake,...] [--only-missing] [--dry-run]
//
// The family list is the exact set of families that own article rows in the
// identity ledger (tools/fabric-corpus/registry/identity.json) — the
// "route-plan families". It is derived from the ledger at run time, never
// hard-coded, so FC02 ledger updates flow through.
//
// Reuses the frozen FC03 compiler entry point (compileFamily) so this script
// cannot diverge from the compiler contract. Outputs land in
// <FABRIC_CORPUS_BUILD_DIR>/compiler-output/<family>/{nodes,manifest.json,receipt.json}
// plus a batch receipt at compiler-output/compile-batch.json (build evidence
// only — outside Git, per RELEASE_AND_STORAGE.md).
//
// Exit codes: 0 = every requested family compiled (quarantines allowed, they
// are reported); 2 = usage/IO error.

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { compileFamily, writeOutputs } from '../compiler/compile.mjs';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '..', '..', '..', '..');
const CORPUS_ROOT_DEFAULT = 'D:/BeUI/fabric-docs-light/docs';
const PINNED_REVISION = '774592ea3f2d4558f763d6e5b74abf4785948fb5';

function parseArgs(argv) {
  const args = { families: null, onlyMissing: false, dryRun: false, revision: PINNED_REVISION };
  const rest = [...argv];
  while (rest.length > 0) {
    const a = rest.shift();
    if (a === '--families') {
      args.families = (rest.shift() ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    } else if (a === '--only-missing') {
      args.onlyMissing = true;
    } else if (a === '--dry-run') {
      args.dryRun = true;
    } else if (a === '--revision') {
      args.revision = rest.shift();
    } else {
      process.stderr.write(`unknown argument: ${a}\n`);
      process.exit(2);
    }
  }
  return args;
}

/** Route-plan families: the families owning article-candidate rows in the
 *  identity ledger, sorted. Derived, not hard-coded (FC02 is the writer). */
function routePlanFamilies(identityPath) {
  const identity = JSON.parse(readFileSync(identityPath, 'utf8'));
  const families = new Set();
  for (const row of identity.rows) {
    if (row.kind !== 'article-candidate') continue;
    const match = row.path.match(/^docs\/([^/]+)\//);
    if (match) families.add(match[1]);
  }
  return [...families].sort();
}

/** Non-article source families that compiled articles include from. They
 *  carry no ledger article rows (so they never enter the route registry) but
 *  their compiled nodes are required to render resolved [!INCLUDE] bodies.
 *  FC03 compiles article families; this batch adds the include sources so
 *  the renderer can inline every resolved fragment (zero silent drops). */
const INCLUDE_SOURCE_FAMILIES = ['includes'];

function main() {
  const args = parseArgs(process.argv.slice(2));
  const buildDir = resolve(
    process.env.FABRIC_CORPUS_BUILD_DIR ?? join(REPO_ROOT, '..', 'fabric-corpus-build'),
  );
  const outDir = join(buildDir, 'compiler-output');
  const corpusRoot = resolve(process.env.FABRIC_CORPUS_ROOT ?? CORPUS_ROOT_DEFAULT);

  const all = routePlanFamilies(join(REPO_ROOT, 'tools', 'fabric-corpus', 'registry', 'identity.json'));
  if (all.length === 0) {
    process.stderr.write('error: identity ledger has no article rows — refusing to compile nothing\n');
    process.exit(2);
  }
  const compileable = [...all, ...INCLUDE_SOURCE_FAMILIES.filter((f) => existsSync(join(corpusRoot, f)))];
  const requested = args.families ? args.families.filter((f) => compileable.includes(f)) : compileable;
  if (args.families) {
    const unknown = args.families.filter((f) => !compileable.includes(f));
    if (unknown.length > 0) {
      process.stderr.write(`error: not compilable families: ${unknown.join(', ')}\n`);
      process.exit(2);
    }
  }

  const batch = {
    script: 'tools/fabric-corpus/route-registry/compile-all-families.mjs',
    corpusRevision: args.revision,
    corpusRoot: 'D:/BeUI/fabric-docs-light/docs (pinned, read-only)',
    outDir,
    families: [],
  };

  let failed = 0;
  for (const family of requested) {
    const familyOutDir = join(outDir, family);
    const manifestPath = join(familyOutDir, 'manifest.json');
    if (args.onlyMissing && args.families === null && existsSync(manifestPath)) {
      const prior = JSON.parse(readFileSync(manifestPath, 'utf8'));
      batch.families.push({
        family,
        skipped: 'already-compiled',
        revision: prior.corpusRevision,
        files: prior.totals?.files ?? null,
        quarantinedFiles: prior.totals?.quarantinedFiles ?? null,
      });
      process.stdout.write(`skip ${family} (already compiled)\n`);
      continue;
    }
    if (args.dryRun) {
      batch.families.push({ family, skipped: 'dry-run' });
      continue;
    }
    const started = Date.now();
    try {
      const result = compileFamily({ corpusRootAbs: corpusRoot, family, corpusRevision: args.revision });
      writeOutputs({ result, outDirAbs: outDir, family });
      const elapsedMs = Date.now() - started;
      const t = result.receipt.totals;
      batch.families.push({
        family,
        skipped: null,
        elapsedMs,
        files: t.files,
        quarantinedFiles: t.quarantinedFiles,
        dependencyEdges: t.dependencyEdges,
        sanitizationActions: t.sanitizationActions,
        unsupported: t.unsupported,
        commentedDirectives: t.commentedDirectives,
      });
      process.stdout.write(
        `compiled ${family}: files=${t.files} quarantined=${t.quarantinedFiles} ` +
        `unsupported=${t.unsupported} elapsed=${(elapsedMs / 1000).toFixed(1)}s\n`,
      );
    } catch (err) {
      failed += 1;
      batch.families.push({ family, skipped: null, error: String(err && err.message ? err.message : err) });
      process.stderr.write(`FAILED ${family}: ${err.message}\n`);
    }
  }

  batch.totals = {
    requested: requested.length,
    compiled: batch.families.filter((f) => f.skipped === null && !f.error).length,
    skipped: batch.families.filter((f) => f.skipped !== null).length,
    failed,
  };
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'compile-batch.json'), JSON.stringify(batch, null, 2) + '\n', 'utf8');
  process.stdout.write(
    `batch: compiled=${batch.totals.compiled} skipped=${batch.totals.skipped} failed=${batch.totals.failed}` +
    ` -> ${join(outDir, 'compile-batch.json')}\n`,
  );
  process.exit(failed > 0 ? 2 : 0);
}

main();
