#!/usr/bin/env node
// Hansa fabric-corpus sync machinery — sync diff + reverse dependency closure (FC09/W3-C).
//
//   node tools/fabric-corpus/sync/sync-diff.mjs \
//     --base <real docs root> --successor <sim/docs root> --label <label> \
//     --families fundamentals,onelake --receipts <compiler-output> \
//     [--withdrawals <sidecar.json>] [--mutation-manifest <path>] \
//     --out <sync-plan.json>
//
// Compares the base (pinned, real corpus) subtree against the successor copy
// and produces the sync plan:
//   - added / modified / renamed / removed / rights-changed sets (sha-based;
//     rename detection = identical blob sha at a new path);
//   - the REVERSE DEPENDENCY CLOSURE: which compiled articles must recompile
//     because (a) they changed directly, (b) they include a changed fragment
//     (direct or transitive, read from the base family compile receipts),
//     (c) they are unchanged parents of changed fragments, or (d) a link/
//     image edge of theirs now resolves differently (renamed/removed/added
//     target paths flip the `exists`/`anchorExists` fields inside their
//     compiled nodes);
//   - per-article action (recompile / keep / tombstone), the dependency edges
//     used, and the invalidation efficiency number (recompile set vs the full
//     article set).
//
// Fail-closed: receipt blob shas are re-verified against the base corpus
// before planning; withdrawal rows must reference in-scope articles.
// Deterministic: canonical JSON, sorted rows, no clock. Exit 0 clean.

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { classifyHref, createParseMemo, resolveWithinRoots } from '../compiler/deps.mjs';

import {
  PINNED_CORPUS_REVISION,
  canonicalJson,
  deriveLogicalPath,
  parseArgs,
  readJson,
  sha256Buffer,
  toPosix,
  walkFiles,
} from './lib.mjs';

const USAGE =
  'usage: sync-diff.mjs --base <docsRoot> --successor <docsRoot> --label <label> ' +
  '--families a,b --receipts <compiler-output> [--withdrawals <sidecar.json>] ' +
  '[--mutation-manifest <path>] --out <sync-plan.json>';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '..', '..', '..', '..');

// Include occurrence shape mirrored from the frozen compiler parser
// (parse.mjs INCLUDE_DIRECTIVE / INLINE_INCLUDE — same directive token).
// The scanner works on raw lines, so occurrences are matched non-anchored:
// the compiler resolves block-level directives AND inline occurrences inside
// paragraphs (e.g. `&#x2705; [!INCLUDE [A](a.md)] in [!INCLUDE [B](b.md)]`),
// and every occurrence affects the fragment's content.
const INCLUDE_OCCURRENCE = /\[!INCLUDE\s+\[([^\]]*)\]\(([^()\s]+)\)\]/gi;

// ---------------------------------------------------------------------------
// Base inputs
// ---------------------------------------------------------------------------

/** Load the base family receipts, verifying every recorded blob sha against
 *  the real base corpus on disk (fail-closed drift gate). Also extracts
 *  dependency edges from the compiled node ASTs: the receipt edge walk does
 *  not descend into zone constructs (:::row:::/:::column:::), so includes
 *  nested there appear in the compiled AST WITHOUT resolution annotations.
 *  Those markers are resolved here with the compiler's own relative-path
 *  rules so the reverse dependency closure is conservative — every marker
 *  the source carries becomes a closure edge, and the release-candidate
 *  reproducibility check proves any extra recompilation byte-neutral. */
export function loadBaseReceipts({ baseRoot, receiptsRoot, families }) {
  const receipts = {};
  for (const family of families) {
    const receiptPath = join(receiptsRoot, family, 'receipt.json');
    if (!existsSync(receiptPath)) {
      throw new Error(`base receipt missing for family "${family}" (run the compiler over the pinned corpus first)`);
    }
    const receipt = readJson(receiptPath);
    if (receipt.corpusRevision && receipt.corpusRevision !== PINNED_CORPUS_REVISION) {
      throw new Error(`base receipt for "${family}" is pinned to ${receipt.corpusRevision}, expected ${PINNED_CORPUS_REVISION}`);
    }
    const nodeEdges = new Map(); // sourcePath -> extracted edges[]
    for (const file of receipt.files) {
      const abs = join(baseRoot, ...file.path.split('/'));
      const actual = sha256Buffer(readFileSync(abs));
      if (actual !== file.sha256) {
        throw new Error(`base drift: ${file.path} sha on disk (${actual.slice(0, 12)}…) != receipt (${file.sha256.slice(0, 12)}…)`);
      }
      const nodeRel = `nodes/${file.path.replace(/\.md$/i, '.json')}`;
      const nodeFile = join(receiptsRoot, family, ...nodeRel.split('/'));
      if (existsSync(nodeFile)) {
        const compiled = readJson(nodeFile);
        if (compiled.source?.sha256 && compiled.source.sha256 !== file.sha256) {
          throw new Error(`compiled node drift: ${file.path} node source sha != receipt sha`);
        }
        nodeEdges.set(file.path, extractAstEdges(compiled.nodes, file.path, baseRoot));
      }
    }
    receipts[family] = { receipt, nodeEdges };
  }
  return receipts;
}

/** Walk a compiled AST and collect include/link/image edges. Un-annotated
 *  targets (zone-nested markers) are resolved with the compiler's relative
 *  resolution rules; unresolvable markers are kept with resolved:null. */
export function extractAstEdges(blocks, sourceRel, baseRoot) {
  const edges = [];
  const fileExists = (rel) =>
    rel !== null && statSync(join(baseRoot, ...rel.split('/')), { throwIfNoEntry: false })?.isFile() === true;
  const walk = (list) => {
    for (const node of list ?? []) {
      if (node.type === 'include' && typeof node.target === 'string') {
        const resolved = typeof node.resolved === 'string' ? node.resolved : resolveIncludeHref(sourceRel, node.target);
        edges.push({
          kind: 'include',
          href: node.target,
          resolved: resolved ?? null,
          exists: typeof node.exists === 'boolean' ? node.exists : fileExists(resolved ?? null),
          blocked: node.blocked === true,
          zoneNested: typeof node.resolved !== 'string',
        });
      } else if (node.type === 'link' && typeof node.href === 'string') {
        const relative = ['relative-md', 'relative-asset', 'relative-other'].includes(node.classification);
        const resolved = typeof node.resolved === 'string' ? node.resolved : (relative ? resolveIncludeHref(sourceRel, node.href) : null);
        if (resolved) {
          edges.push({
            kind: 'link',
            href: node.href,
            resolved,
            exists: typeof node.exists === 'boolean' ? node.exists : fileExists(resolved),
            zoneNested: typeof node.resolved !== 'string',
          });
        }
      } else if (node.type === 'image' && typeof node.src === 'string') {
        const resolved = typeof node.srcResolved === 'string' ? node.srcResolved : resolveIncludeHref(sourceRel, node.src);
        if (resolved) {
          edges.push({ kind: 'image', href: node.src, resolved, exists: typeof node.srcExists === 'boolean' ? node.srcExists : fileExists(resolved) });
        }
      }
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
  return edges;
}

/** Map ledger path -> {id, plannedDestination, rightsState} for article rows.
 *  Tolerant: the ledger may be unavailable in unit-test fixtures. */
function loadLedgerArticleRows() {
  const ledgerPath = join(REPO_ROOT, 'tools', 'fabric-corpus', 'registry', 'identity.json');
  if (!existsSync(ledgerPath)) return new Map();
  const identity = readJson(ledgerPath);
  const map = new Map();
  for (const row of identity.rows ?? []) {
    if (row.kind === 'article-candidate') map.set(row.path, row);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Diff computation
// ---------------------------------------------------------------------------

function hashFile(absPath) {
  return sha256Buffer(readFileSync(absPath));
}

/** Classify every in-scope path into added/modified/renamed/removed/unchanged.
 *  Scope = every path in the successor tree plus every base path under the
 *  family directories. Returns plain classification maps. */
export function computePathDiff({ baseRoot, successorRoot, families }) {
  if (resolve(baseRoot) === resolve(successorRoot)) {
    const shas = new Map(walkFiles(baseRoot).map(({ rel, abs }) => [rel, hashFile(abs)]));
    return {
      baseShas: shas, successorShas: shas, modified: [], added: [], removed: [], renamed: [],
      unchanged: [...shas.keys()], renamedTargetsConsumed: [],
    };
  }
  const successorFiles = walkFiles(successorRoot); // [{abs, rel}]
  const successorByPath = new Map(successorFiles.map((f) => [f.rel, f.abs]));
  const successorShas = new Map();
  for (const [p, abs] of successorByPath) successorShas.set(p, hashFile(abs));

  // Base side: family directories are walked in full (keyed docs-relative:
  // '<family>/<rel>'); every other base path that the successor happens to
  // contain is also compared (support files).
  const baseByPath = new Map();
  for (const family of families) {
    const familyDir = join(baseRoot, family);
    if (statSync(familyDir, { throwIfNoEntry: false })?.isDirectory() !== true) {
      throw new Error(`family directory not found in base corpus: ${family}`);
    }
    for (const f of walkFiles(familyDir)) baseByPath.set(`${family}/${f.rel}`, f.abs);
  }
  for (const p of successorByPath.keys()) {
    if (!baseByPath.has(p)) {
      const abs = join(baseRoot, ...p.split('/'));
      if (statSync(abs, { throwIfNoEntry: false })?.isFile() === true) baseByPath.set(p, abs);
    }
  }

  const modified = [];
  const added = [];
  const unchanged = [];
  const removedCandidates = [];
  const baseShas = new Map();

  for (const [p, abs] of baseByPath) {
    const baseSha = hashFile(abs);
    baseShas.set(p, baseSha);
    if (!successorShas.has(p)) removedCandidates.push(p);
    else if (successorShas.get(p) !== baseSha) modified.push(p);
    else unchanged.push(p);
  }
  for (const p of successorShas.keys()) {
    if (!baseShas.has(p)) added.push(p);
  }

  // Rename detection: a removed candidate whose blob sha appears at an added
  // path is a rename/move, not a removal.
  const additionsBySha = new Map();
  for (const p of added) {
    const sha = successorShas.get(p);
    const paths = additionsBySha.get(sha) ?? [];
    paths.push(p);
    additionsBySha.set(sha, paths);
  }
  const removalCountsBySha = new Map();
  for (const p of removedCandidates) {
    const sha = baseShas.get(p);
    removalCountsBySha.set(sha, (removalCountsBySha.get(sha) ?? 0) + 1);
  }
  const renamed = [];
  const removed = [];
  const consumedAdded = new Set();
  for (const oldPath of removedCandidates) {
    const sha = baseShas.get(oldPath);
    const candidates = additionsBySha.get(sha);
    const newPath = candidates?.length === 1 && removalCountsBySha.get(sha) === 1 ? candidates[0] : null;
    if (newPath) {
      renamed.push({ from: oldPath, to: newPath, sha256: sha });
      consumedAdded.add(newPath);
    } else {
      removed.push(oldPath);
    }
  }
  const addedOnly = added.filter((p) => !consumedAdded.has(p));

  return {
    successorShas,
    baseShas,
    modified: modified.sort(),
    added: addedOnly.sort(),
    removed: removed.sort(),
    renamed: renamed.sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0)),
    unchanged: unchanged.sort(),
    renamedTargetsConsumed: [...consumedAdded].sort(),
  };
}

// ---------------------------------------------------------------------------
// Reverse dependency closure
// ---------------------------------------------------------------------------

/** Collect the dependency edges of one file: the receipt's edge list merged
 *  (deduped) with the compiled-AST edges — the AST is the superset that also
 *  carries zone-nested markers the receipt walk does not descend into. */
function edgesFor(receipts, relPath) {
  for (const family of Object.keys(receipts)) {
    const file = receipts[family].receipt.files.find((f) => f.path === relPath);
    if (!file) continue;
    const merged = new Map();
    const add = (edge) => {
      const key = `${edge.kind}|${edge.resolved ?? ''}|${edge.href ?? ''}`;
      const existing = merged.get(key);
      if (!existing) merged.set(key, { ...edge });
      else if (existing.zoneNested === true && edge.zoneNested !== true) merged.set(key, { ...existing, zoneNested: false });
    };
    for (const edge of file.edges ?? []) if (edge.resolved) add(edge);
    for (const edge of receipts[family].nodeEdges.get(relPath) ?? []) if (edge.resolved) add(edge);
    return [...merged.values()];
  }
  return [];
}

/** Resolve a local fragment target using the active compiler's path policy. */
function resolveIncludeHref(fromRel, href) {
  const result = resolveWithinRoots(fromRel, href, ['']);
  return result.ok ? result.path : null;
}

/** Transitive include targets of a fragment file, by scanning the BASE bytes
 *  (receipt edges only cover the first hop). Cycle-guarded. */
export function transitiveIncludesOf(baseRoot, startRel) {
  const out = new Set();
  const queue = [toPosix(startRel)];
  const seen = new Set([toPosix(startRel)]);
  while (queue.length > 0) {
    const fragRel = queue.pop();
    const abs = join(baseRoot, ...fragRel.split('/'));
    let text;
    try {
      text = readFileSync(abs, 'utf8');
    } catch {
      continue;
    }
    const targets = [];
    for (const line of text.split(/\r?\n/)) {
      for (const m of line.matchAll(INCLUDE_OCCURRENCE)) {
        targets.push(m[2]);
      }
    }
    for (const href of targets) {
      const resolved = resolveIncludeHref(fragRel, href);
      if (!resolved || seen.has(resolved)) continue;
      if (statSync(join(baseRoot, ...resolved.split('/')), { throwIfNoEntry: false })?.isFile() !== true) continue;
      seen.add(resolved);
      out.add(resolved);
      queue.push(resolved);
    }
  }
  return [...out].sort();
}

/**
 * Compute the sync plan. Pure: same inputs -> byte-identical plan JSON.
 */
export function computeSyncPlan({
  baseRoot,
  successorRoot,
  label,
  families,
  receiptsRoot,
  withdrawals = null,
  mutationManifest = null,
  revision = PINNED_CORPUS_REVISION,
}) {
  const receipts = loadBaseReceipts({ baseRoot, receiptsRoot, families });
  const diff = computePathDiff({ baseRoot, successorRoot, families });
  const ledger = loadLedgerArticleRows();

  const familySet = new Set(families);
  const isFamilyPath = (p) => familySet.has(p.split('/')[0]);

  // Path-kind classification: ledger article rows win; family-dir markdown
  // under an `includes/` segment is a fragment; other md is an article
  // (ledger-unknown, e.g. the synthetic added article); everything else is
  // fragment/asset/support material.
  const kindOf = (p) => {
    const row = ledger.get(`docs/${p}`);
    if (row) return 'article';
    if (!p.toLowerCase().endsWith('.md')) return p.match(/\.(png|jpe?g|gif|svg|bmp|webp)$/i) ? 'asset' : 'support';
    if (!isFamilyPath(p)) return 'fragment';
    return /(^|\/)includes\//.test(p) ? 'fragment' : 'article';
  };

  // Diff-set entries with metadata.
  const entryFor = (p, shas) => ({
    path: p,
    kind: kindOf(p),
    sha256: shas.base ? shas.base : null,
    successorSha256: shas.successor ? shas.successor : null,
  });

  const addedEntries = diff.added.map((p) => ({ ...entryFor(p, { successor: diff.successorShas.get(p) }), kind: kindOf(p) === 'support' ? 'support' : kindOf(p) }));
  const modifiedEntries = diff.modified.map((p) => entryFor(p, { base: diff.baseShas.get(p), successor: diff.successorShas.get(p) }));
  const removedEntries = diff.removed.map((p) => entryFor(p, { base: diff.baseShas.get(p) }));
  const renamedEntries = diff.renamed.map((r) => ({
    from: r.from,
    to: r.to,
    kind: kindOf(r.from),
    sha256: r.sha256,
    logicalPathBefore: ledger.get(`docs/${r.from}`)?.plannedDestination ?? deriveLogicalPath(r.from),
    logicalPathAfter: ledger.get(`docs/${r.to}`)?.plannedDestination ?? deriveLogicalPath(r.to),
  }));

  // Rights-changed set: withdrawal sidecar entries (in production this class
  // also comes from comparing upstream rights metadata; in this environment
  // the sidecar is the only rights channel).
  const withdrawalsLoaded = withdrawals ? readJson(withdrawals) : null;
  if (withdrawals && (withdrawalsLoaded?.schema !== 'hansa.fabric-sync/withdrawal-sidecar/1' ||
    !Array.isArray(withdrawalsLoaded.entries))) {
    throw new Error('invalid withdrawal sidecar schema');
  }
  const withdrawalEntries = (withdrawalsLoaded?.entries ?? []).map((e) => ({
    sourcePath: toPosix(e.sourcePath).replace(/^docs\//, ''),
    rightsState: e.rightsState,
    reason: e.reason ?? null,
    effectiveRevision: e.effectiveRevision ?? null,
  }));
  const withdrawalsByPath = new Map();
  for (const w of withdrawalEntries) {
    if (!diff.baseShas.has(w.sourcePath) || !isFamilyPath(w.sourcePath) || kindOf(w.sourcePath) !== 'article') {
      throw new Error(`withdrawal sidecar references out-of-scope path: ${w.sourcePath}`);
    }
    if (w.rightsState !== 'withdrawn') {
      throw new Error(`withdrawal sidecar entry ${w.sourcePath} has unsupported rightsState "${w.rightsState}" (expected "withdrawn")`);
    }
    if (withdrawalsByPath.has(w.sourcePath)) throw new Error(`duplicate withdrawal for ${w.sourcePath}`);
    withdrawalsByPath.set(w.sourcePath, w);
  }
  if (withdrawalsLoaded && (withdrawalsLoaded.corpusRevision !== revision || withdrawalsLoaded.label !== label)) {
    throw new Error('withdrawal sidecar revision or label does not match the sync inputs');
  }
  const withdrawnBlobs = new Set(withdrawalEntries.map((w) => diff.baseShas.get(w.sourcePath)));
  for (const p of [...diff.added, ...diff.renamedTargetsConsumed, ...diff.modified]) {
    if (kindOf(p) === 'article' && withdrawnBlobs.has(diff.successorShas.get(p)) && !withdrawalsByPath.has(p)) {
      throw new Error(`successor article ${p} reuses a withdrawn source blob; resolve its rights disposition before sync`);
    }
  }

  // Changed non-article paths (fragments/assets/support) drive the include
  // closure; removed/renamed-old ARTICLE paths drive the link closure.
  const changedReferenceTargets = new Set();
  for (const e of modifiedEntries) if (e.kind !== 'article') changedReferenceTargets.add(e.path);
  for (const e of removedEntries) changedReferenceTargets.add(e.path);
  for (const r of renamedEntries) changedReferenceTargets.add(r.from);
  const addedTargets = new Set([...diff.added, ...diff.renamedTargetsConsumed]);
  const modifiedTargets = new Set(diff.modified);
  const headingIndex = (root) => createParseMemo({
    exists: (path) => statSync(join(root, path), { throwIfNoEntry: false })?.isFile() === true,
    readText: (path) => readFileSync(join(root, path), 'utf8'),
  });
  const baseHeadings = headingIndex(baseRoot);
  const successorHeadings = headingIndex(successorRoot);

  // Per-article rows.
  const articlePaths = new Set();
  for (const family of families) {
    for (const file of receipts[family].receipt.files) {
      if (kindOf(file.path) === 'article') articlePaths.add(file.path);
    }
  }
  for (const p of [...diff.added, ...diff.modified]) {
    if (kindOf(p) === 'article') articlePaths.add(p);
  }
  for (const r of diff.renamed) {
    if (kindOf(r.to) === 'article') articlePaths.add(r.to);
  }

  const rows = [];
  const fragmentChanges = [...changedReferenceTargets].sort();

  for (const p of [...articlePaths].sort()) {
    const ledgerRow = ledger.get(`docs/${p}`);
    const baseSha = diff.baseShas.get(p) ?? null;
    const succSha = diff.successorShas.get(p) ?? null;
    const row = {
      sourcePath: p,
      ledgerPath: `docs/${p}`,
      articleId: ledgerRow?.id ?? (kindOf(p) === 'article' ? `art:${p.replace(/\.md$/i, '')}` : null),
      logicalPath: ledgerRow?.plannedDestination ?? deriveLogicalPath(p),
      kind: kindOf(p),
      baseSha256: baseSha,
      successorSha256: succSha,
      action: null,
      reason: null,
      closureKinds: [],
      dependencyEdges: [],
    };

    const withdrawal = withdrawalsByPath.get(p);
    const renameOut = diff.renamed.find((r) => r.from === p);
    const renameIn = diff.renamed.find((r) => r.to === p);

    if (withdrawal) {
      row.action = 'tombstone';
      row.reason = 'rights-withdrawn';
      row.withdrawal = withdrawal;
    } else if (renameOut) {
      row.action = 'tombstone';
      row.reason = `renamed-to:${renameOut.to}`;
    } else if (renameIn) {
      row.action = 'recompile';
      row.reason = 'renamed-from:' + renameIn.from;
      row.closureKinds.push('renamed');
    } else if (succSha !== null && baseSha !== null && succSha !== baseSha) {
      row.action = 'recompile';
      row.reason = 'changed-directly';
      row.closureKinds.push('direct-change');
    } else if (baseSha === null && succSha !== null) {
      row.action = 'recompile';
      row.reason = 'added';
      row.closureKinds.push('added');
    } else if (baseSha !== null && succSha === null) {
      row.action = 'tombstone';
      row.reason = 'removed-upstream';
      row.closureKinds.push('removed');
    } else {
      row.action = 'keep';
      row.reason = 'unchanged';
    }

    // Closure for rows that are not already tombstoned/renamed: does this
    // article depend on a changed reference target?
    if (row.action === 'keep') {
      const edges = edgesFor(receipts, p);
      const hitEdges = [];
      let includeHit = false;
      let linkHit = false;
      let anchorHit = false;
      for (const edge of edges) {
        if (!edge.resolved) continue;
        const closureTargets = new Set([edge.resolved]);
        if (edge.kind === 'include' && edge.exists) {
          for (const t of transitiveIncludesOf(baseRoot, edge.resolved)) closureTargets.add(t);
        }
        const hit = [...closureTargets].filter((t) => changedReferenceTargets.has(t) || addedTargets.has(t));
        if (hit.length > 0) {
          hitEdges.push({ kind: edge.kind, href: edge.href, resolved: edge.resolved, changedTargets: hit.sort() });
          if (edge.kind === 'include') includeHit = true;
          if (edge.kind === 'link' || edge.kind === 'image' || edge.kind === 'image-lightbox') linkHit = true;
        }
        if (edge.kind === 'link' && modifiedTargets.has(edge.resolved)) {
          const { classification, anchor } = classifyHref(edge.href);
          if (classification === 'relative-md' && anchor) {
            const before = baseHeadings(edge.resolved).headingSlugs.includes(anchor);
            const after = successorHeadings(edge.resolved).headingSlugs.includes(anchor);
            if (before !== after) {
              anchorHit = true;
              hitEdges.push({
                kind: edge.kind, href: edge.href, resolved: edge.resolved,
                changedTargets: [edge.resolved], anchor, anchorBefore: before, anchorAfter: after,
              });
            }
          }
        }
      }
      if (includeHit) {
        row.action = 'recompile';
        row.reason = 'includes-changed-fragment';
        row.closureKinds.push('include-closure');
        row.dependencyEdges = hitEdges;
      } else if (linkHit) {
        row.action = 'recompile';
        row.reason = 'link-target-path-changed';
        row.closureKinds.push('link-closure');
        row.dependencyEdges = hitEdges;
      } else if (anchorHit) {
        row.action = 'recompile';
        row.reason = 'link-target-anchor-changed';
        row.dependencyEdges = hitEdges;
      }
      if (anchorHit) row.closureKinds.push('anchor-closure');
    }

    rows.push(row);
  }

  rows.sort((a, b) => (a.sourcePath < b.sourcePath ? -1 : a.sourcePath > b.sourcePath ? 1 : 0));

  const counts = {
    articlesInScope: rows.length,
    recompile: rows.filter((r) => r.action === 'recompile').length,
    keep: rows.filter((r) => r.action === 'keep').length,
    tombstone: rows.filter((r) => r.action === 'tombstone').length,
    added: rows.filter((r) => r.reason === 'added').length,
    renamed: renamedEntries.length,
    removed: rows.filter((r) => r.reason === 'removed-upstream').length,
    withdrawn: rows.filter((r) => r.reason === 'rights-withdrawn').length,
  };
  const efficiency = {
    fullSet: counts.articlesInScope,
    recompileSet: counts.recompile,
    keptByteReuse: counts.keep,
    invalidationRatio: counts.articlesInScope === 0 ? null : Number((counts.recompile / counts.articlesInScope).toFixed(4)),
  };

  const plan = {
    schema: 'hansa.fabric-sync/sync-plan/1',
    label,
    baseCorpusRevision: revision,
    successorRevision: mutationManifest?.mutationRevision ?? null,
    families: [...families].sort(),
    diffs: {
      added: addedEntries,
      modified: modifiedEntries,
      renamed: renamedEntries,
      removed: removedEntries,
      rightsChanged: withdrawalEntries,
      fragmentChanges,
    },
    articles: rows,
    counts,
    efficiency,
  };

  return plan;
}

function main(argv) {
  let args;
  try {
    args = parseArgs(argv, { required: ['base', 'successor', 'label', 'families', 'receipts', 'out'] });
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
  const receiptsRoot = resolve(process.cwd(), toPosix(args.receipts));
  const outPath = resolve(process.cwd(), toPosix(args.out));
  const families = toPosix(args.families).split(',').map((f) => f.trim()).filter((f) => f !== '');
  const withdrawals = args.withdrawals ? resolve(process.cwd(), toPosix(args.withdrawals)) : null;
  const mutationManifestPath = args['mutation-manifest'] ? resolve(process.cwd(), toPosix(args['mutation-manifest'])) : null;

  try {
    const plan = computeSyncPlan({
      baseRoot,
      successorRoot,
      label: toPosix(args.label),
      families,
      receiptsRoot,
      withdrawals,
      mutationManifest: mutationManifestPath ? readJson(mutationManifestPath) : null,
    });
    mkdirSync(resolve(outPath, '..'), { recursive: true });
    writeFileSync(outPath, canonicalJson(plan), 'utf8');
    const c = plan.counts;
    process.stdout.write(
      `sync-plan: label=${plan.label} articles=${c.articlesInScope} recompile=${c.recompile} ` +
        `keep=${c.keep} tombstone=${c.tombstone} added=${c.added} renamed=${c.renamed} removed=${c.removed} ` +
        `withdrawn=${c.withdrawn} invalidationRatio=${plan.efficiency.invalidationRatio}\n` +
        `written: ${outPath}\n`,
    );
  } catch (err) {
    process.stderr.write(`error: ${err.message}\n`);
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}
