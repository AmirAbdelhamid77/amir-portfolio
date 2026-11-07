#!/usr/bin/env node
// Hansa fabric-corpus compiler — consolidated dependency manifest (W3-A).
//
// Aggregates the per-family compile receipts into ONE canonical JSON manifest
// of every cross-repo dependency hold (include-tilde-path quarantines):
//
//   node tools/fabric-corpus/compiler/build-dependency-manifest.mjs \
//     [--build-dir D:/BeUI/fabric-corpus-build/compiler-output] \
//     [--out dependency-manifest.json] [--families a,b,c]
//
// Per article row: ledger identity (articleId / plannedDestination / kind /
// rightsState), the exact include references under hold (target, sibling
// repo, in-repo path, span), where each held include sits (nearest preceding
// heading), and the article's own headings — i.e. which sections exist
// locally and what content is missing until the dependency is acquired.
//
// Deterministic: sorted rows, canonical JSON, no clocks, no absolute paths.
// The manifest does NOT change publication: held articles stay quarantined in
// their receipts, so the route registry excludes them (fail-closed). This
// artifact is decision material for dependency acquisition only.

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { emitJson, sha256Buffer, COMPILER_NAME, COMPILER_VERSION } from './emit.mjs';

export const DEPENDENCY_MANIFEST_SCHEMA = 'hansa.fabric-dependency-manifest/1';

function usage() {
  process.stderr.write(
    'usage: build-dependency-manifest.mjs [--build-dir <compiler-output>] [--out <filename>] [--families <a,b,c>]\n',
  );
}

/** Recursively find directories that contain a receipt.json (families). */
function findReceiptFamilies(buildDirAbs) {
  const out = [];
  const visit = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      if (!entry.isDirectory()) continue;
      const child = join(dir, entry.name);
      if (statSync(join(child, 'receipt.json'), { throwIfNoEntry: false })?.isFile()) {
        out.push(entry.name);
      } else {
        visit(child);
      }
    }
  };
  visit(buildDirAbs);
  return out;
}

/** Nearest preceding heading (by 1-based line) for a span, from an ordered
 *  heading list [{ line, text, slug }]. */
function underHeading(headings, span) {
  const line = span?.start?.line ?? -1;
  let best = null;
  for (const h of headings) {
    if (h.line < line) best = h;
    else break;
  }
  return best ? { line: best.line, text: best.text, slug: best.slug } : null;
}

function collectIncludesAndHeadings(nodeJson) {
  const headings = [];
  const includes = [];
  const walk = (list) => {
    for (const node of list) {
      if (node.type === 'heading') {
        headings.push({ line: node.span?.start?.line ?? 0, level: node.level, text: node.text, slug: node.slug });
      }
      if (node.type === 'include') {
        includes.push({
          line: node.span?.start?.line ?? 0,
          target: node.target,
          resolved: node.resolved ?? null,
          exists: node.exists ?? null,
          blocked: node.blocked === true,
          blockedReason: node.blockedReason ?? null,
        });
      }
      if (Array.isArray(node.inline)) walk(node.inline);
      if (Array.isArray(node.children)) walk(node.children);
      if (node.type === 'list') {
        walk(node.items);
      }
      if (node.type === 'table') {
        walk(node.header);
        for (const row of node.rows) walk(row);
      }
    }
  };
  walk(nodeJson.nodes ?? []);
  headings.sort((a, b) => a.line - b.line || a.level - b.level);
  includes.sort((a, b) => a.line - b.line);
  return { headings, includes };
}

/**
 * Build the manifest object from the given receipts. Pure: same inputs give a
 * byte-identical return value.
 */
export function buildDependencyManifest({ receipts, ledgerRows, corpusRevision }) {
  const ledgerByPath = new Map(ledgerRows.map((r) => [r.path, r]));
  const rows = [];
  for (const { family, receipt, nodesReader } of receipts) {
    if (receipt.family !== family || receipt.corpusRevision !== corpusRevision ||
        receipt.compiler?.name !== COMPILER_NAME || receipt.compiler?.version !== COMPILER_VERSION) {
      throw new Error(`dependency manifest: incompatible compiler receipt for ${family}`);
    }
    for (const file of receipt.files) {
      if (!file.dependencyHolds || file.dependencyHolds.length === 0) continue;
      const sourcePath = `docs/${file.path}`;
      const ledgerRow = ledgerByPath.get(sourcePath) ?? null;
      const { headings, includes } = nodesReader
        ? collectIncludesAndHeadings(nodesReader(file.path))
        : { headings: [], includes: [] };
      rows.push({
        family,
        sourcePath,
        articleId: ledgerRow?.id ?? null,
        ledgerKind: ledgerRow?.kind ?? null,
        disposition: ledgerRow?.disposition ?? null,
        logicalPath: ledgerRow?.plannedDestination ?? null,
        rightsState: ledgerRow?.rightsState ?? null,
        quarantined: file.quarantined,
        quarantineReasons: [...new Set(file.quarantineEntries.map((q) => q.reason))].sort(),
        dependencyHolds: file.dependencyHolds.map((h) => ({
          target: h.target,
          kind: h.kind,
          targetRepo: h.targetRepo ?? null,
          inRepoPath: h.inRepoPath ?? null,
          span: h.span,
          underHeading: underHeading(headings, h.span),
        })),
        // Sections the article itself publishes (its own headings); the
        // held include contents are the missing sections until acquired.
        ownSections: headings.map((h) => ({ level: h.level, text: h.text, slug: h.slug })),
        includeNodes: includes,
      });
    }
  }
  rows.sort((a, b) => (a.family < b.family ? -1 : a.family > b.family ? 1 : 0) || (a.sourcePath < b.sourcePath ? -1 : a.sourcePath > b.sourcePath ? 1 : 0));

  const byRepo = new Map();
  const byFamily = new Map();
  const targets = new Map();
  for (const row of rows) {
    for (const h of row.dependencyHolds) {
      const repo = h.targetRepo ?? '(unclassified)';
      const repoEntry = byRepo.get(repo) ?? { targetRepo: repo, includes: 0, files: new Set() };
      repoEntry.includes += 1;
      repoEntry.files.add(row.sourcePath);
      byRepo.set(repo, repoEntry);
      const famEntry = byFamily.get(row.family) ?? { family: row.family, files: new Set(), includes: 0 };
      famEntry.files.add(row.sourcePath);
      famEntry.includes += h.kind === 'cross-repo-include' ? 1 : 0;
      byFamily.set(row.family, famEntry);
      targets.set(h.target, repo);
    }
  }

  const body = {
    schema: DEPENDENCY_MANIFEST_SCHEMA,
    version: 1,
    compiler: { name: COMPILER_NAME, version: COMPILER_VERSION },
    corpusRevision: corpusRevision ?? null,
    articles: rows,
    summary: {
      files: rows.length,
      heldIncludes: rows.reduce((a, r) => a + r.dependencyHolds.length, 0),
      distinctTargets: targets.size,
      byTargetRepo: [...byRepo.values()]
        .map((e) => ({ targetRepo: e.targetRepo, includes: e.includes, files: e.files.size }))
        .sort((a, b) => (b.includes - a.includes) || (a.targetRepo < b.targetRepo ? -1 : a.targetRepo > b.targetRepo ? 1 : 0)),
      byFamily: [...byFamily.values()]
        .map((e) => ({ family: e.family, files: e.files.size, heldIncludes: e.includes }))
        .sort((a, b) => (a.family < b.family ? -1 : a.family > b.family ? 1 : 0)),
    },
  };
  const bodyJson = emitJson(body);
  const manifest = { ...body, manifestSha256: sha256Buffer(Buffer.from(bodyJson, 'utf8')) };
  return { manifest, manifestJson: emitJson(manifest) };
}

function main(argv) {
  const args = [...argv];
  let buildDir = null;
  let out = 'dependency-manifest.json';
  let families = null;
  while (args.length > 0) {
    const a = args.shift();
    if (a === '--build-dir') buildDir = args.shift() ?? null;
    else if (a === '--out') out = args.shift() ?? null;
    else if (a === '--families') families = (args.shift() ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--help' || a === '-h') { usage(); process.exit(0); return; }
  }
  if (!buildDir || !out) { usage(); process.exit(2); return; }
  const buildDirAbs = resolve(process.cwd(), buildDir);
  const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));

  const familyNames = families ?? findReceiptFamilies(buildDirAbs);
  const receipts = [];
  let corpusRevision = null;
  for (const family of familyNames) {
    const receiptPath = join(buildDirAbs, family, 'receipt.json');
    if (statSync(receiptPath, { throwIfNoEntry: false })?.isFile() !== true) {
      process.stderr.write(`error: missing compiler receipt for ${family}\n`);
      process.exit(2);
      return;
    }
    const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
    if (corpusRevision === null) corpusRevision = receipt.corpusRevision;
    else if (receipt.corpusRevision !== corpusRevision) {
      process.stderr.write(`error: corpusRevision mismatch in ${family} (${receipt.corpusRevision} != ${corpusRevision})\n`);
      process.exit(2);
      return;
    }
    receipts.push({
      family,
      receipt,
      nodesReader: (fileRel) => JSON.parse(readFileSync(join(buildDirAbs, family, 'nodes', `${fileRel.replace(/\.md$/i, '.json')}`), 'utf8')),
    });
  }

  const ledger = JSON.parse(readFileSync(join(repoRoot, 'tools', 'fabric-corpus', 'registry', 'identity.json'), 'utf8'));
  const { manifest, manifestJson } = buildDependencyManifest({ receipts, ledgerRows: ledger.rows, corpusRevision });

  const outAbs = resolve(buildDirAbs, out);
  writeFileSync(outAbs, manifestJson, 'utf8');
  const s = manifest.summary;
  process.stdout.write(
    `dependency-manifest: files=${s.files} heldIncludes=${s.heldIncludes} distinctTargets=${s.distinctTargets} ` +
    `repos=${s.byTargetRepo.map((r) => `${r.targetRepo}:${r.includes}`).join(',')} ` +
    `families=${s.byFamily.map((f) => `${f.family}:${f.files}`).join(',')}\n` +
    `output: ${out}\n`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}
