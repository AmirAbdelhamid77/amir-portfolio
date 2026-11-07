#!/usr/bin/env node
// Hansa fabric-corpus sync machinery — synthetic upstream successor (FC09/W3-C).
//
//   node tools/fabric-corpus/sync/simulate-upstream.mjs \
//     --corpus <real docs root> --out <sync/upstream-sim/<label>> \
//     --label <label> --families fundamentals,onelake \
//     [--receipts <compiler-output>] [--revision <pinned sha>]
//
// Builds a SYNTHETIC SUCCESSOR of the pinned corpus in the build workspace
// (never touches D:/BeUI/fabric-docs-light, which is read-only):
//   <out>/docs/                    successor docs root (copy + mutations)
//   <out>/mutation-manifest.json   every mutation with before/after sha256
//   <out>/label.json               machine-readable run descriptor
//
// The copy consists of (1) whole family directories (every file kind, so
// media/breadcrumb survive) and (2) a computed SUPPORT SET: every corpus path
// that the family compile receipts resolve (includes, links, images), grown
// transitively through include fragments. The support set is what makes the
// successor environment faithful enough that recompiling UNCHANGED articles
// reproduces the base compile byte-for-byte (checked by release-candidate.mjs).
//
// Mutations are deterministic (fixed content, no clock) and exercise every
// diff class: add article, modify article body, modify a SHARED include
// fragment, rename/move an article, remove an article, flip a front-matter
// title. Exit codes: 0 clean, 2 usage/environment error (fail-closed).

import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolveWithinRoots } from '../compiler/deps.mjs';

import {
  PINNED_CORPUS_REVISION,
  canonicalJson,
  deriveLogicalPath,
  parseArgs,
  readJson,
  sha256Buffer,
  sha256Text,
  toPosix,
} from './lib.mjs';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '..', '..', '..', '..');
const DEFAULT_BUILD_DIR = resolve(REPO_ROOT, '..', 'fabric-corpus-build');

const USAGE =
  'usage: simulate-upstream.mjs --corpus <docsRoot> --out <simDir> --label <label> ' +
  '--families a,b [--receipts <compiler-output>] [--revision <sha>]';

// ---------------------------------------------------------------------------
// Deterministic mutation content (fixed bytes; never derived from a clock)
// ---------------------------------------------------------------------------

const ADDED_ARTICLE_REL = 'onelake/sync-probe-added-article.md';
const ADDED_ARTICLE_CONTENT = `---
title: "OneLake sync probe (synthetic successor article)"
description: "Deterministic synthetic article created by the FC09 upstream simulator to exercise the added-article diff class of the sync machinery."
ms.topic: concept-article
ms.date: 01/01/2026
ms.custom: hansa-sync-probe
---

# OneLake sync probe (synthetic successor article)

This article exists only in the synthetic successor tree produced by
\`tools/fabric-corpus/sync/simulate-upstream.mjs\`. It never originates from
the pinned upstream revision and exists to exercise the added-article class
of the sync diff, the reverse dependency closure and the release-candidate
pipeline.

It must never be published from a real upstream revision; the release
candidate marks it as a synthetic addition in its receipt.
`;

const MODIFY_BODY_REL = 'fundamentals/fabric-trial.md';
const MODIFY_BODY_APPENDIX =
  '\n\nThis paragraph was appended deterministically by the FC09 upstream simulator ' +
  '(mutation modify-article-body). It exists only in the synthetic successor revision and ' +
  'exercises the modified-article class of the sync machinery. It carries no heading so ' +
  'existing anchor targets in this article remain stable for inbound links.\n';

const MODIFY_INCLUDE_REL = 'includes/product-name.md';
const MODIFY_INCLUDE_AFTER_BODY = 'Microsoft Fabric (sync probe: shared include mutated in the synthetic successor)\n';

const RENAME_OLD_REL = 'fundamentals/building-reports.md';
const RENAME_NEW_REL = 'fundamentals/reports/building-reports.md';

const REMOVE_REL = 'fundamentals/canadian-time-zone-changes.md';

const FLIP_TITLE_REL = 'onelake/onelake-capacity-consumption.md';
const FLIP_TITLE_BEFORE_LINE = 'title: OneLake capacity consumption example';
const FLIP_TITLE_AFTER_LINE = 'title: OneLake capacity consumption example (synthetic successor title)';

// Include occurrence shape mirrored from the frozen compiler parser
// (parse.mjs INCLUDE_DIRECTIVE / INLINE_INCLUDE — same directive token),
// matched non-anchored over raw lines: the compiler resolves block directives
// AND inline occurrences inside paragraphs, and the transitive support scan
// must follow both.
const INCLUDE_OCCURRENCE = /\[!INCLUDE\s+\[([^\]]*)\]\(([^()\s]+)\)\]/gi;

// ---------------------------------------------------------------------------
// Support-set computation
// ---------------------------------------------------------------------------

/** Collect every corpus path the given families' compile receipts resolve,
 *  outside the family directories themselves, and grow it transitively
 *  through include fragments found in the corpus. Returns a sorted array of
 *  docs-relative posix paths that exist in the corpus. */
export function computeSupportSet({ corpusRoot, receiptsRoot, families }) {
  const familyPrefixes = families.map((f) => `${f}/`);
  const support = new Set();
  const queue = [];
  const scanned = new Set();
  const seen = new Set();

  const addCandidate = (relPath) => {
    const p = toPosix(relPath);
    if (!p || seen.has(p)) return;
    seen.add(p);
    if (familyPrefixes.some((pre) => p.startsWith(pre))) return; // inside copied family dirs
    if (p.startsWith('docs/')) return; // defensive: receipts are docs-relative already
    const abs = join(corpusRoot, ...p.split('/'));
    const exists = statSync(abs, { throwIfNoEntry: false })?.isFile() === true;
    if (!exists) return; // unresolved references (exists:false edges) reproduce as-is
    support.add(p);
    if (p.toLowerCase().endsWith('.md')) queue.push(p);
  };

  /** Scan one markdown file (support fragment or family-internal document)
   *  for include targets and add every resolvable one as a candidate. */
  const scanFragment = (fragRel) => {
    const p = toPosix(fragRel);
    if (scanned.has(p)) return;
    scanned.add(p);
    const fragAbs = join(corpusRoot, ...p.split('/'));
    let text;
    try {
      text = readFileSync(fragAbs, 'utf8');
    } catch {
      return;
    }
    const targets = [];
    for (const line of text.split(/\r?\n/)) {
      for (const m of line.matchAll(INCLUDE_OCCURRENCE)) targets.push(m[2]);
    }
    for (const raw of targets) {
      const resolved = resolveWithinRoots(p, raw, ['']);
      if (resolved.ok) addCandidate(resolved.path);
    }
  };

  for (const family of families) {
    const receiptPath = join(receiptsRoot, family, 'receipt.json');
    if (!existsSync(receiptPath)) {
      throw new Error(`receipt missing for family "${family}" under the receipts root (run the compiler first)`);
    }
    const receipt = readJson(receiptPath);
    for (const file of receipt.files) {
      for (const edge of file.edges ?? []) {
        if (edge.resolved && ['include', 'link', 'image', 'image-lightbox'].includes(edge.kind)) {
          addCandidate(edge.resolved);
        }
      }
      // Compiled node ASTs may carry include markers the receipt edge walk
      // does not descend into (zone-nested includes without annotations).
      // Those targets must exist in the successor too or the successor
      // compile diverges from the base compile (caught fail-closed by the
      // release-candidate reproducibility check — but cheap to prevent).
      const nodeRel = `nodes/${file.path.replace(/\.md$/i, '.json')}`;
      const nodeFile = join(receiptsRoot, family, ...nodeRel.split('/'));
      if (existsSync(nodeFile)) {
        const compiled = readJson(nodeFile);
        collectAstTargets(compiled.nodes, file.path, (target) => {
          const resolved = resolveWithinRoots(file.path, target, ['']);
          if (resolved.ok) addCandidate(resolved.path);
        });
      }
      // Seed the transitive scan with every family markdown file too:
      // include chains may run THROUGH family-internal fragments (article ->
      // <family>/includes/x.md -> top-level includes/y.md) without any
      // receipt edge pointing outside the family.
      if (file.path.toLowerCase().endsWith('.md')) scanFragment(file.path);
    }
  }

  // Transitive growth: include fragments may include further fragments.
  while (queue.length > 0) {
    scanFragment(queue.pop());
  }

  return [...support].sort();
}

/** Recursively copy one corpus directory into the sim root. */
function copyDir(srcAbs, destAbs, counter) {
  mkdirSync(destAbs, { recursive: true });
  for (const entry of readdirSync(srcAbs, { withFileTypes: true })) {
    const s = join(srcAbs, entry.name);
    const d = join(destAbs, entry.name);
    if (entry.isDirectory()) copyDir(s, d, counter);
    else if (entry.isFile()) {
      copyFileSync(s, d);
      counter.files += 1;
      counter.bytes += statSync(s).size;
    }
  }
}

/** Walk a compiled node AST and invoke fn for every include marker target
 *  (covers markers the receipt edge walk does not descend into). */
function collectAstTargets(blocks, _sourceRel, fn) {
  const walk = (list) => {
    for (const node of list ?? []) {
      if (node.type === 'include' && typeof node.target === 'string') fn(node.target);
      if (Array.isArray(node.children)) walk(node.children);
      if (Array.isArray(node.nodes)) walk(node.nodes);
      if (Array.isArray(node.inline)) walk(node.inline);
      if (Array.isArray(node.items)) for (const item of node.items) {
        if (Array.isArray(item?.children)) walk(item.children);
        if (Array.isArray(item?.inline)) walk(item.inline);
      }
      if (Array.isArray(node.header)) walk(node.header);
      if (Array.isArray(node.rows)) for (const rowCells of node.rows) walk(rowCells);
    }
  };
  walk(blocks);
}

function fileSha(absPath) {
  return sha256Buffer(readFileSync(absPath));
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Apply the six deterministic mutations to the successor tree. Each step
 *  computes its entry against the BASE corpus bytes and the mutated
 *  successor bytes; any unexpected shape fails closed. */
export function applyMutations({ corpusRoot, docsRoot, families }) {
  const mutations = [];
  const rel = (p) => p;
  const baseAbs = (p) => join(corpusRoot, ...p.split('/'));
  const simAbs = (p) => join(docsRoot, ...p.split('/'));

  // M1 — add new article.
  {
    mkdirSync(dirname(simAbs(ADDED_ARTICLE_REL)), { recursive: true });
    writeFileSync(simAbs(ADDED_ARTICLE_REL), ADDED_ARTICLE_CONTENT, 'utf8');
    mutations.push({
      id: 'm1-add-article',
      kind: 'add-article',
      path: rel(ADDED_ARTICLE_REL),
      beforeSha256: null,
      afterSha256: fileSha(simAbs(ADDED_ARTICLE_REL)),
      beforeBytes: null,
      afterBytes: Buffer.byteLength(ADDED_ARTICLE_CONTENT, 'utf8'),
      derivedLogicalPath: deriveLogicalPath(ADDED_ARTICLE_REL),
      detail: 'new article written into the successor tree (onelake family)',
    });
  }

  // M2 — modify an existing article's body (append-only, no heading change).
  {
    const before = readFileSync(simAbs(MODIFY_BODY_REL));
    const baseSha = fileSha(baseAbs(MODIFY_BODY_REL));
    if (baseSha !== sha256Buffer(before)) {
      throw new Error(`M2 precondition failed: successor copy of ${MODIFY_BODY_REL} differs from the base corpus`);
    }
    const after = Buffer.concat([before, Buffer.from(MODIFY_BODY_APPENDIX, 'utf8')]);
    writeFileSync(simAbs(MODIFY_BODY_REL), after);
    mutations.push({
      id: 'm2-modify-article-body',
      kind: 'modify-article-body',
      path: rel(MODIFY_BODY_REL),
      beforeSha256: baseSha,
      afterSha256: sha256Buffer(after),
      beforeBytes: before.length,
      afterBytes: after.length,
      detail: 'appended a fixed trailing paragraph (no heading; anchors stay stable)',
    });
  }

  // M3 — modify a SHARED include fragment (referenced by several articles).
  {
    const simPath = simAbs(MODIFY_INCLUDE_REL);
    const original = readFileSync(simPath, 'utf8');
    const closeIdx = original.indexOf('---', 3);
    if (!original.startsWith('---') || closeIdx === -1) {
      throw new Error(`M3 precondition failed: ${MODIFY_INCLUDE_REL} has no closing front-matter fence`);
    }
    const beforeSha = fileSha(baseAbs(MODIFY_INCLUDE_REL));
    const after = original.slice(0, closeIdx + 3) + '\n' + MODIFY_INCLUDE_AFTER_BODY;
    writeFileSync(simPath, after, 'utf8');
    mutations.push({
      id: 'm3-modify-shared-include',
      kind: 'modify-shared-include',
      path: rel(MODIFY_INCLUDE_REL),
      beforeSha256: beforeSha,
      afterSha256: sha256Buffer(Buffer.from(after, 'utf8')),
      beforeBytes: Buffer.byteLength(original, 'utf8'),
      afterBytes: Buffer.byteLength(after, 'utf8'),
      detail:
        'include-source fragment under docs/includes mutated; every article that includes it ' +
        '(directly or transitively) must recompile via the reverse dependency closure',
    });
  }

  // M4 — rename/move an article (path change, identical blob).
  {
    const src = simAbs(RENAME_OLD_REL);
    const dest = simAbs(RENAME_NEW_REL);
    const beforeSha = fileSha(baseAbs(RENAME_OLD_REL));
    mkdirSync(dirname(dest), { recursive: true });
    renameSync(src, dest);
    const afterSha = fileSha(dest);
    if (beforeSha !== afterSha) {
      throw new Error('M4 precondition failed: rename changed the blob bytes');
    }
    mutations.push({
      id: 'm4-rename-article',
      kind: 'rename-article',
      path: rel(RENAME_OLD_REL),
      pathAfter: rel(RENAME_NEW_REL),
      beforeSha256: beforeSha,
      afterSha256: afterSha,
      beforeBytes: statSync(dest).size,
      afterBytes: statSync(dest).size,
      derivedLogicalPathAfter: deriveLogicalPath(RENAME_NEW_REL),
      detail: 'moved into a nested intra-family directory (blob-identical; detected as rename, not remove+add)',
    });
  }

  // M5 — remove an article.
  {
    const beforeSha = fileSha(baseAbs(REMOVE_REL));
    unlinkSync(simAbs(REMOVE_REL));
    mutations.push({
      id: 'm5-remove-article',
      kind: 'remove-article',
      path: rel(REMOVE_REL),
      beforeSha256: beforeSha,
      afterSha256: null,
      beforeBytes: statSync(baseAbs(REMOVE_REL)).size,
      afterBytes: null,
      detail: 'deleted from the successor tree; must produce a tombstone, never a silent disappearance',
    });
  }

  // M6 — flip one article's front-matter title.
  {
    const simPath = simAbs(FLIP_TITLE_REL);
    const original = readFileSync(simPath, 'utf8');
    if (!original.includes(FLIP_TITLE_BEFORE_LINE)) {
      throw new Error(`M6 precondition failed: expected title line not found in ${FLIP_TITLE_REL}`);
    }
    const after = original.replace(FLIP_TITLE_BEFORE_LINE, FLIP_TITLE_AFTER_LINE);
    writeFileSync(simPath, after, 'utf8');
    mutations.push({
      id: 'm6-flip-front-matter-title',
      kind: 'flip-front-matter-title',
      path: rel(FLIP_TITLE_REL),
      beforeSha256: fileSha(baseAbs(FLIP_TITLE_REL)),
      afterSha256: sha256Buffer(Buffer.from(after, 'utf8')),
      beforeBytes: Buffer.byteLength(original, 'utf8'),
      afterBytes: Buffer.byteLength(after, 'utf8'),
      beforeTitle: FLIP_TITLE_BEFORE_LINE.replace(/^title: /, ''),
      afterTitle: FLIP_TITLE_AFTER_LINE.replace(/^title: /, ''),
      detail: 'front-matter title rewritten in place; body untouched',
    });
  }

  void families;
  return mutations;
}

// ---------------------------------------------------------------------------
// Orchestration
// ---------------------------------------------------------------------------

/** Run one simulation. Pure with respect to inputs: the same corpus bytes,
 *  families and label produce a byte-identical successor tree and mutation
 *  manifest. Returns the manifest object. */
export function runSimulation({ corpusRoot, outDir, label, families, receiptsRoot, revision = PINNED_CORPUS_REVISION }) {
  for (const family of families) {
    if (statSync(join(corpusRoot, family), { throwIfNoEntry: false })?.isDirectory() !== true) {
      throw new Error(`family directory not found in corpus: ${family}`);
    }
  }
  const docsRoot = join(outDir, 'docs');
  mkdirSync(dirname(outDir), { recursive: true });
  mkdirSync(outDir);
  mkdirSync(docsRoot);

  // 1. Copy whole family directories (every file kind).
  const copied = { files: 0, bytes: 0 };
  for (const family of families) copyDir(join(corpusRoot, family), join(docsRoot, family), copied);

  // 2. Copy the computed support set (includes, linked docs, assets, yml).
  const supportPaths = computeSupportSet({ corpusRoot, receiptsRoot, families });
  let supportCopied = 0;
  for (const relPath of supportPaths) {
    const src = join(corpusRoot, ...relPath.split('/'));
    const dest = join(docsRoot, ...relPath.split('/'));
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    supportCopied += 1;
  }

  // 3. Apply the deterministic mutations.
  const mutations = applyMutations({ corpusRoot, docsRoot, families });

  // 4. Manifest (deterministic: no clock; revision hash over the mutations).
  const manifest = {
    schema: 'hansa.fabric-sync/mutation-manifest/1',
    label,
    baseCorpusRevision: revision,
    mutationScript: 'tools/fabric-corpus/sync/simulate-upstream.mjs',
    families: [...families].sort(),
    mutations: mutations.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)),
    stats: {
      familyFilesCopied: copied.files,
      familyBytesCopied: copied.bytes,
      supportFilesCopied: supportCopied,
      supportPaths: supportPaths.length,
      mutations: mutations.length,
    },
  };
  manifest.mutationRevision = sha256Text(canonicalJson({ mutations: manifest.mutations, families: manifest.families, label, schema: manifest.schema }));

  writeFileSync(join(outDir, 'mutation-manifest.json'), canonicalJson(manifest), 'utf8');
  writeFileSync(
    join(outDir, 'label.json'),
    canonicalJson({
      schema: 'hansa.fabric-sync/sim-label/1',
      label,
      baseCorpusRevision: revision,
      families: manifest.families,
      successorRevision: manifest.mutationRevision,
      docsRootIs: 'docs/ under this directory',
    }),
    'utf8',
  );
  return { manifest, docsRoot, supportPaths };
}

function main(argv) {
  let args;
  try {
    args = parseArgs(argv, { required: ['corpus', 'out', 'label', 'families'] });
  } catch (err) {
    failWithUsage(USAGE, err);
    return;
  }
  if (args.help) {
    process.stdout.write(`${USAGE}\n`);
    return;
  }
  const corpusRoot = resolve(process.cwd(), toPosix(args.corpus));
  const outDir = resolve(process.cwd(), toPosix(args.out));
  const receiptsRoot = args.receipts
    ? resolve(process.cwd(), toPosix(args.receipts))
    : join(DEFAULT_BUILD_DIR, 'compiler-output');
  const families = toPosix(args.families).split(',').map((f) => f.trim()).filter((f) => f !== '');
  const label = toPosix(args.label);
  const revision = args.revision ? toPosix(args.revision) : PINNED_CORPUS_REVISION;

  try {
    const { manifest } = runSimulation({ corpusRoot, outDir, label, families, receiptsRoot, revision });
    const m = manifest.stats;
    process.stdout.write(
      `simulator: label=${label} families=${manifest.families.join(',')} ` +
        `familyFiles=${m.familyFilesCopied} supportFiles=${m.supportFilesCopied} mutations=${m.mutations} ` +
        `successorRevision=${manifest.mutationRevision.slice(0, 12)}…\n` +
        `written: ${outDir}\n`,
    );
  } catch (err) {
    process.stderr.write(`error: ${err.message}\n`);
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}
