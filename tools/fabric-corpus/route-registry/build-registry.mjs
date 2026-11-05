#!/usr/bin/env node
// FC05 — build the route registry from frozen inputs, fail-closed.
//
//   node tools/fabric-corpus/route-registry/build-registry.mjs
//
// Reads (all fs, no JSON imports):
//   - tools/fabric-corpus/registry/identity.json   (FC02 ledger, in repo)
//   - tools/fabric-corpus/registry/aliases.json    (FC02 redirect ledger, in repo)
//   - <FABRIC_CORPUS_BUILD_DIR>/compiler-output/<family>/manifest.json
//   - <FABRIC_CORPUS_BUILD_DIR>/compiler-output/<family>/nodes/**.json (titles)
//
// Writes (outside Git, RELEASE_AND_STORAGE.md):
//   <FABRIC_CORPUS_BUILD_DIR>/route-registry/route-registry.json
//
// Fail-closed publication rule — an article is published ONLY when ALL hold:
//   1. ledger disposition === 'eligible-article';
//   2. its family manifest exists in the build workspace and lists the file;
//   3. the compiler did NOT quarantine it;
//   4. ledger sha256 === compiler manifest sha256 (blob integrity);
//   5. its rightsState is not a hold state.
// Every non-published article row is emitted into `excluded` with its reason.
// Zero silent drops: published + excluded must equal the ledger article-row
// total (eligible + hold dispositions) or the script exits non-zero without
// writing a registry.
//
// Deterministic: sorted output, canonical JSON, no clock, no absolute paths.
// `registryRevision` is the SHA-256 of the canonical registry body, so two
// identical inputs produce byte-identical registries.

import {
  createHash,
} from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '..', '..', '..', '..');
const PINNED_REVISION = '774592ea3f2d4558f763d6e5b74abf4785948fb5';

/** Rights states that never publish (hold states). 'review-required' is the
 *  state carried by rights-notice holds; 'unresolved-review' is the
 *  unavailable hold state. Fail-closed belt-and-braces: eligible rows should
 *  never carry these, but the rule is enforced regardless. */
const HOLD_RIGHTS_STATES = new Set(['unresolved-review', 'review-required']);

const MAX_CHAIN_DEPTH = 10;

function buildDir() {
  return resolve(
    process.env.FABRIC_CORPUS_BUILD_DIR ?? join(REPO_ROOT, '..', 'fabric-corpus-build'),
  );
}

function canonicalJson(value) {
  return JSON.stringify(value, null, 2) + '\n';
}

/** Load all family manifests from the build workspace. Manifest file paths
 *  are corpus-docset-relative WITHOUT the docs/ prefix (e.g.
 *  'fundamentals/analyze-train-data.md'); the ledger carries
 *  'docs/<family>/<rest>.md', so rows are keyed under both spellings' ledger
 *  form. */
function loadFamilyManifests(outputRoot) {
  const manifests = new Map(); // family -> manifest
  const filesByPath = new Map(); // 'docs/<family>/<rest>.md' -> { family, entry }
  for (const name of readdirSync(outputRoot, { withFileTypes: true }).map((e) => e.name).sort()) {
    const manifestPath = join(outputRoot, name, 'manifest.json');
    if (!existsSync(manifestPath)) continue;
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    manifests.set(manifest.family ?? name, manifest);
    for (const file of manifest.files) {
      const ledgerPath = file.path.startsWith('docs/') ? file.path : `docs/${file.path}`;
      filesByPath.set(ledgerPath, { family: manifest.family ?? name, entry: file });
    }
  }
  return { manifests, filesByPath };
}

/** Extract title + description from a compiled node's front matter, with
 *  filename fallback for the title. Reads only the head of the JSON for
 *  speed? No — whole-file reads keep this simple and deterministic. */
function nodeTitle(nodeAbsPath, fallback) {
  if (!existsSync(nodeAbsPath)) return { title: fallback, description: null };
  const node = JSON.parse(readFileSync(nodeAbsPath, 'utf8'));
  const data = node.frontMatter?.data ?? null;
  const title = typeof data?.title === 'string' && data.title.trim() !== ''
    ? data.title.trim()
    : fallback;
  const description = typeof data?.description === 'string' && data.description.trim() !== ''
    ? data.description.trim()
    : null;
  return { title, description };
}

/** Build the published/excluded classification for every ledger article row. */
function classifyArticles(identity, filesByPath, outputRoot) {
  const published = [];
  const excluded = [];
  for (const row of identity.rows) {
    if (row.kind !== 'article-candidate') continue;
    // logicalPath and id come from the ledger; ledger is authority.
    const logicalPath = row.plannedDestination;
    const base = {
      articleId: row.id,
      sourcePath: row.path,
      logicalPath,
      logicalPathIfItWereEligible: logicalPath,
    };

    if (row.disposition !== 'eligible-article') {
      excluded.push({ ...base, reason: row.disposition });
      continue;
    }
    if (HOLD_RIGHTS_STATES.has(row.rightsState)) {
      excluded.push({ ...base, reason: `rights-hold:${row.rightsState}` });
      continue;
    }

    const compiled = filesByPath.get(row.path);
    if (!compiled) {
      excluded.push({ ...base, reason: 'compiler-node-missing' });
      continue;
    }
    if (compiled.entry.sha256 !== row.sha256) {
      excluded.push({ ...base, reason: 'blob-hash-mismatch' });
      continue;
    }
    if (compiled.entry.quarantined) {
      const reasons = (compiled.entry.quarantineReasons ?? []).join(', ');
      excluded.push({
        ...base,
        reason: `compiler-quarantine:${reasons === '' ? 'unspecified' : reasons}`,
      });
      continue;
    }

    // Parse the logical path into family + intra-family article segments.
    // /learn/fabric/docs/<family>/<segment>/.../<slug>/ (trailing slash).
    const m = logicalPath.match(/^\/learn\/fabric\/docs\/([^/]+)\/(.+)\/$/);
    if (!m) {
      excluded.push({ ...base, reason: 'logical-path-shape' });
      continue;
    }
    const family = m[1];
    const segments = m[2].split('/');
    const slug = segments[segments.length - 1];
    const { title, description } = nodeTitle(
      join(outputRoot, compiled.family, compiled.entry.nodeFile),
      slug,
    );
    published.push({
      articleId: row.id,
      family,
      slug,
      articleSegments: segments,
      sourcePath: row.path,
      sha256: row.sha256,
      title,
      description,
      logicalPath,
      nodeFile: `${compiled.family}/${compiled.entry.nodeFile}`,
      rightsState: row.rightsState,
      published: true,
    });
  }
  published.sort((a, b) => (a.logicalPath < b.logicalPath ? -1 : a.logicalPath > b.logicalPath ? 1 : 0));
  excluded.sort((a, b) => (a.articleId < b.articleId ? -1 : a.articleId > b.articleId ? 1 : 0));
  return { published, excluded };
}

/** Shape of one redirect target: either a resolved corpus doc path
 *  (`docs/<rest>` — extensionless, as upstream writes site paths) with its
 *  fragment/query, or an `unresolvable` reason. */
function classifyTargetShape(to, targetKind) {
  const work = String(to ?? '');
  if (targetKind === 'absolute-url') return { unresolvable: 'target-external-url' };
  if (targetKind === 'other-docset-site-relative') return { unresolvable: 'target-other-docset' };
  if (targetKind !== 'fabric-site-relative' && targetKind !== 'docs-relative') {
    return { unresolvable: `target-kind-${targetKind}` };
  }
  let current = work;
  let fragment = '';
  let query = '';
  const hashAt = current.indexOf('#');
  if (hashAt !== -1) { fragment = current.slice(hashAt + 1); current = current.slice(0, hashAt); }
  const queryAt = current.indexOf('?');
  if (queryAt !== -1) { query = current.slice(queryAt + 1); current = current.slice(0, queryAt); }
  let doc = null;
  if (current.startsWith('/fabric/')) doc = `docs/${current.slice('/fabric/'.length)}`;
  else if (current.startsWith('/docs/')) doc = current.slice(1);
  else return { unresolvable: 'target-shape-unknown' };
  return { doc, fragment, query };
}

/** Wire aliases: for every redirect row, resolve through the chain map and
 *  keep only rows whose final target is a PUBLISHED local article. */
function classifyAliases(aliases, publishedBySourcePath, ledgerById) {
  // Chain map keyed by docs-relative source path.
  const chainMap = new Map();
  for (const row of aliases.redirections) {
    let from = String(row.from ?? '');
    if (from.endsWith('/')) from = from.slice(0, -1);
    if (from.startsWith('/docs/')) {
      const shape = classifyTargetShape(row.to, row.targetKind);
      chainMap.set(from.slice(1), shape);
    }
  }

  const wired = [];
  const suppressed = [];
  const seenFrom = new Set();

  for (const row of aliases.redirections) {
    let from = String(row.from ?? '');
    if (from.endsWith('/')) from = from.slice(0, -1);
    // Corpus-internal alias pages only exist for .md document sources.
    if (!from.startsWith('/docs/') || !from.endsWith('.md')) {
      suppressed.push({
        from: row.from,
        reason: from.endsWith('.md') ? 'source-outside-corpus' : 'source-not-document',
        targetKind: row.targetKind,
      });
      continue;
    }
    if (seenFrom.has(from)) {
      suppressed.push({ from: row.from, reason: 'duplicate-source', targetKind: row.targetKind });
      continue;
    }
    seenFrom.add(from);

    // Follow the chain with cycle + depth guards. Chain keys are .md
    // document sources; targets are extensionless site paths, so the lookup
    // converts the doc path to its .md form first.
    let shape = classifyTargetShape(row.to, row.targetKind);
    let chained = false;
    let hops = 0;
    while (!shape.unresolvable) {
      const docMd = shape.doc.endsWith('.md') ? shape.doc : `${shape.doc}.md`;
      if (!chainMap.has(docMd)) break;
      if (hops >= MAX_CHAIN_DEPTH) { shape = { unresolvable: 'chain-too-deep' }; break; }
      const next = chainMap.get(docMd);
      if (next.unresolvable) { shape = next; break; }
      if (next.doc === shape.doc) { shape = { unresolvable: 'self-redirect' }; break; }
      shape = { doc: next.doc, fragment: next.fragment || shape.fragment, query: next.query || shape.query };
      chained = true;
      hops += 1;
    }

    if (shape.unresolvable) {
      suppressed.push({ from: row.from, reason: shape.unresolvable, targetKind: row.targetKind });
      continue;
    }
    if (shape.query !== '') {
      suppressed.push({ from: row.from, reason: 'target-has-query', targetKind: row.targetKind });
      continue;
    }

    // Final doc must be a ledger article row (any disposition) so held
    // targets get a precise reason instead of "unresolvable". Identity ids
    // are 'art:<family>/<path>' — docset-relative, no extension.
    const docMd = shape.doc.endsWith('.md') ? shape.doc : `${shape.doc}.md`;
    const ledgerRow = ledgerById.get(`art:${docMd.replace(/^docs\//, '').replace(/\.md$/i, '')}`);
    if (!ledgerRow) {
      suppressed.push({ from: row.from, reason: 'target-not-article', targetKind: row.targetKind });
      continue;
    }
    const published = publishedBySourcePath.get(ledgerRow.path);
    if (!published) {
      suppressed.push({ from: row.from, reason: 'target-not-published', targetKind: row.targetKind });
      continue;
    }

    wired.push({
      from: row.from,
      to: published.logicalPath + (shape.fragment !== '' ? `#${shape.fragment}` : ''),
      kind: chained ? 'chain' : 'direct',
      targetKind: row.targetKind,
      targetArticleId: published.articleId,
      redirectDocumentId: row.redirectDocumentId === true,
    });
  }

  wired.sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0));
  suppressed.sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : 0));
  return { wired, suppressed };
}

function main() {
  const identityPath = join(REPO_ROOT, 'tools', 'fabric-corpus', 'registry', 'identity.json');
  const aliasesPath = join(REPO_ROOT, 'tools', 'fabric-corpus', 'registry', 'aliases.json');
  const outputRoot = join(buildDir(), 'compiler-output');

  if (!existsSync(identityPath) || !existsSync(aliasesPath)) {
    process.stderr.write('error: FC02 ledgers missing from the repository\n');
    process.exit(2);
  }
  if (statSync(outputRoot, { throwIfNoEntry: false })?.isDirectory() !== true) {
    process.stderr.write(`error: compiler output missing under ${outputRoot} — run compile-all-families.mjs first (fail-closed, nothing written)\n`);
    process.exit(2);
  }

  const identity = JSON.parse(readFileSync(identityPath, 'utf8'));
  const aliases = JSON.parse(readFileSync(aliasesPath, 'utf8'));
  if (identity.manifest?.corpusRevision && identity.manifest.corpusRevision !== PINNED_REVISION) {
    process.stderr.write(`error: identity ledger revision ${identity.manifest.corpusRevision} != pinned ${PINNED_REVISION}\n`);
    process.exit(2);
  }

  const { filesByPath } = loadFamilyManifests(outputRoot);
  const { published, excluded } = classifyArticles(identity, filesByPath, outputRoot);

  const ledgerRows = identity.rows.filter((r) => r.kind === 'article-candidate');
  const ledgerEligible = ledgerRows.filter((r) => r.disposition === 'eligible-article').length;
  const ledgerHolds = ledgerRows.length - ledgerEligible;

  const counts = {
    families: new Set(published.map((a) => a.family)).size,
    ledgerArticleRows: ledgerRows.length,
    ledgerEligible,
    ledgerHolds,
    publishedArticles: published.length,
    excludedArticles: excluded.length,
    excludedByReason: {},
  };
  for (const row of excluded) {
    const category = row.reason.split(':')[0];
    counts.excludedByReason[category] = (counts.excludedByReason[category] ?? 0) + 1;
  }

  // Zero silent drops (hard gate).
  const reconciled =
    counts.publishedArticles + counts.excludedArticles === counts.ledgerArticleRows;
  if (!reconciled) {
    process.stderr.write(
      `FAIL-CLOSED: reconciliation failed — published(${counts.publishedArticles}) + ` +
      `excluded(${counts.excludedArticles}) != ledger rows(${counts.ledgerArticleRows}); no registry written.\n`,
    );
    process.exit(1);
  }

  const publishedBySourcePath = new Map(published.map((a) => [a.sourcePath, a]));
  const ledgerById = new Map(identity.rows.map((r) => [r.id, r]));

  const { wired, suppressed } = classifyAliases(aliases, publishedBySourcePath, ledgerById);
  const aliasCounts = {
    ledgerRows: aliases.summary?.rowsTotal ?? aliases.redirections.length,
    wired: wired.length,
    suppressed: suppressed.length,
    suppressedByReason: {},
  };
  for (const row of suppressed) aliasCounts.suppressedByReason[row.reason] = (aliasCounts.suppressedByReason[row.reason] ?? 0) + 1;

  const families = [];
  const byFamily = new Map();
  for (const article of published) {
    if (!byFamily.has(article.family)) byFamily.set(article.family, []);
    byFamily.get(article.family).push({
      articleId: article.articleId,
      family: article.family,
      slug: article.slug,
      articleSegments: article.articleSegments,
      sourcePath: article.sourcePath,
      sha256: article.sha256,
      title: article.title,
      description: article.description,
      logicalPath: article.logicalPath,
      nodeFile: article.nodeFile,
      rightsState: article.rightsState,
      published: true,
    });
  }
  for (const family of [...byFamily.keys()].sort()) {
    const articles = byFamily.get(family);
    families.push({
      family,
      articles,
      counts: { published: articles.length, excluded: 0 },
    });
  }
  // Family-level excluded counts (articles that belong to the family but are
  // held) so the docs index can show honest held numbers per family.
  for (const row of excluded) {
    const family = row.sourcePath.match(/^docs\/([^/]+)\//)?.[1] ?? 'unknown';
    const existing = families.find((f) => f.family === family);
    if (existing) existing.counts.excluded += 1;
    else families.push({ family, articles: [], counts: { published: 0, excluded: 1 } });
  }
  families.sort((a, b) => (a.family < b.family ? -1 : a.family > b.family ? 1 : 0));

  const registry = {
    schema: 'hansa.fabric-route-registry/1',
    corpusRevision: PINNED_REVISION,
    routeNamespace: '/learn/fabric/docs/',
    families,
    excluded,
    aliases: wired,
    aliasesSuppressed: suppressed,
    counts: { ...counts, aliases: aliasCounts },
  };

  const body = canonicalJson({ ...registry, registryRevision: null });
  const registryRevision = createHash('sha256').update(body).digest('hex');
  const out = canonicalJson({ ...registry, registryRevision });

  const outDir = join(buildDir(), 'route-registry');
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, 'route-registry.json');
  writeFileSync(outPath, out, 'utf8');

  process.stdout.write(
    `registry: families=${families.length} published=${counts.publishedArticles} ` +
    `excluded=${counts.excludedArticles} aliasesWired=${aliasCounts.wired} ` +
    `aliasesSuppressed=${aliasCounts.suppressed} revision=${registryRevision.slice(0, 12)}…\n` +
    `written: ${outPath}\n`,
  );
}

main();
