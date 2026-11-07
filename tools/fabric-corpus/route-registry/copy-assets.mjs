#!/usr/bin/env node
// FC05 — copy referenced corpus image assets into the app's public tree, with
// a fail-closed asset manifest.
//
//   node tools/fabric-corpus/route-registry/copy-assets.mjs [--copy=f1,f2] [--dry-run]
//
// Wave 2 policy (task FC05, ASSET POLICY): only the REPRESENTATIVE families
// get their referenced images copied into public/fabric-docs-assets/, keyed
// by the DOCSET-RELATIVE asset path (e.g. public/fabric-docs-assets/
// fundamentals/media/x.png) so cross-family references (../fundamentals/…,
// ../includes/…) copy once under their owning directory (source corpus is
// read-only). The script is family-parameterized so FC13 can run it for ALL
// families by passing --copy=<all or a list>.
//
// Outputs:
//   public/fabric-docs-assets/<family>/<family-relative-path>   (copied bytes)
//   <FABRIC_CORPUS_BUILD_DIR>/route-registry/asset-manifest.json (receipt)
//
// The manifest is what the renderer consults at build time: a family absent
// from it, or an asset missing from its entry, renders the accessible
// fallback figure — never a broken image request. Missing referenced assets
// are recorded per family in `suppressed` with their reason (no silent
// drops).
//
// Deterministic: sorted scans, no clock in the manifest content, canonical
// JSON. Exit codes: 0 ok; 2 usage/IO error.

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '..', '..', '..', '..');
const CORPUS_ROOT_DEFAULT = 'D:/BeUI/fabric-docs-light/docs';
const REPRESENTATIVE_FAMILIES = ['admin', 'data-factory', 'fundamentals', 'onelake', 'real-time-intelligence'];

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|bmp|avif|tiff?|ico|svg)$/i;

/** Collect image references from a compiled node tree.
 *  Image shapes in compiled nodes (FC03): top-level blocks of type
 *  'content'/'complex' ({source, alt-text}) and learnConstruct kind 'image'
 *  with attributes.source/attributes.alt-text. */
function collectImages(blocks, out) {
  for (const block of blocks ?? []) {
    collectImages(block.children, out);
    collectImages(block.items, out);
    if (block.type === 'content' || block.type === 'complex') {
      pushImage(block.source, block['alt-text'], out);
    } else if (block.type === 'learnConstruct' && block.kind === 'image') {
      pushImage(block.attributes?.source, block.attributes?.['alt-text'], out);
    }
    for (const key of ['inline', 'header', 'rows']) {
      const value = block[key];
      if (!Array.isArray(value)) continue;
      for (const entry of value) collectImages(entry.children, out);
    }
  }
}

function pushImage(source, alt, out) {
  if (typeof source !== 'string' || source.trim() === '') return;
  out.push({ source: normalizeSource(source), alt: typeof alt === 'string' ? alt : null });
}

function normalizeSource(source) {
  let s = String(source).replace(/\\/g, '/');
  if (s.startsWith('./')) s = s.slice(2);
  return s;
}

/**
 * Resolve one image reference to its docset-relative asset key.
 * Sources are relative to the ARTICLE FILE's directory inside the docset
 * (`docs/<family>/<article-dir>/`), and may climb out of the family
 * (`../fundamentals/media/…`, `../includes/media/…` are common upstream
 * authoring). Returns the docset-relative key WITHOUT the `docs/` prefix
 * (e.g. `fundamentals/media/x.png`), or null when the reference escapes the
 * docset or is malformed.
 */
function resolveAssetKey(source, family, articleDirSegments) {
  const parts = [family, ...articleDirSegments, ...normalizeSource(source).split('/')];
  const out = [];
  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') {
      if (out.length === 0) return null; // escapes docs/
      out.pop();
    } else {
      out.push(part);
    }
  }
  return out.length > 0 ? out.join('/') : null;
}

/** Image pixel dimensions for the formats that carry a fixed header
 *  (PNG/JPEG/GIF); null otherwise — the renderer only emits width/height
 *  when derivable. */
function imageDimensions(abs) {
  try {
    const buf = readFileSync(abs);
    if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
      return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    }
    if (buf.length > 10 && buf.toString('ascii', 0, 3) === 'GIF') {
      return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
    }
    if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      let offset = 2;
      while (offset + 9 < buf.length) {
        if (buf[offset] !== 0xff) { offset += 1; continue; }
        const marker = buf[offset + 1];
        const length = buf.readUInt16BE(offset + 2);
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { width: buf.readUInt16BE(offset + 7), height: buf.readUInt16BE(offset + 5) };
        }
        offset += 2 + length;
      }
    }
  } catch {
    // unreadable → dimensions unknown; the file itself is still copied
  }
  return { width: null, height: null };
}

function parseArgs(argv) {
  const args = { copy: REPRESENTATIVE_FAMILIES, dryRun: false };
  for (const a of argv) {
    if (a.startsWith('--copy=')) {
      const value = a.slice('--copy='.length);
      args.copy = value === 'all' ? 'all' : value.split(',').map((s) => s.trim()).filter(Boolean);
    } else if (a === '--dry-run') {
      args.dryRun = true;
    } else {
      process.stderr.write(`unknown argument: ${a}\n`);
      process.exit(2);
    }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const buildDir = resolve(
    process.env.FABRIC_CORPUS_BUILD_DIR ?? join(REPO_ROOT, '..', 'fabric-corpus-build'),
  );
  const registryPath = join(buildDir, 'route-registry', 'route-registry.json');
  if (!existsSync(registryPath)) {
    process.stderr.write('error: route registry missing — run build-registry.mjs first\n');
    process.exit(2);
  }
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  const corpusRoot = resolve(process.env.FABRIC_CORPUS_ROOT ?? CORPUS_ROOT_DEFAULT);
  const compilerOutput = join(buildDir, 'compiler-output');
  const publicRoot = join(REPO_ROOT, 'public', 'fabric-docs-assets');

  const families = registry.families.map((f) => f.family).sort();
  const manifest = {
    schema: 'hansa.fabric-asset-manifest/1',
    corpusRevision: registry.corpusRevision,
    families: {},
  };
  const summary = [];

  for (const family of families) {
    const familyRow = registry.families.find((f) => f.family === family);
    const shouldCopy = args.copy === 'all' || args.copy.includes(family);
    const referenced = new Map(); // familyRel -> { articles:Set, alt, bytes, width, height }
    const suppressed = [];
    let scannedArticles = 0;

    for (const article of familyRow.articles) {
      const nodeAbs = join(compilerOutput, ...article.nodeFile.split('/'));
      if (!existsSync(nodeAbs)) continue; // registry/loaders fail closed elsewhere
      scannedArticles += 1;
      const node = JSON.parse(readFileSync(nodeAbs, 'utf8'));
      const images = [];
      collectImages(node.nodes, images);
      // Article dir inside the family = intra-family path minus the slug.
      const articleDirSegments = article.articleSegments.slice(0, -1);
      for (const image of images) {
        if (!IMAGE_EXT.test(image.source)) {
          suppressed.push({ sourcePath: image.source, article: article.articleId, reason: 'not-an-image-extension' });
          continue;
        }
        const assetKey = resolveAssetKey(image.source, family, articleDirSegments);
        if (assetKey === null) {
          suppressed.push({ sourcePath: image.source, article: article.articleId, reason: 'source-escapes-docset' });
          continue;
        }
        const existing = referenced.get(assetKey);
        if (existing) existing.articles.add(article.articleId);
        else referenced.set(assetKey, { articles: new Set([article.articleId]), alt: image.alt });
      }
    }

    const familyManifest = {
      family,
      policy: shouldCopy ? 'copied' : 'not-copied',
      scannedArticles,
      referencedCount: referenced.size,
      copiedCount: 0,
      copiedBytes: 0,
      assets: {},
      suppressed,
    };

    for (const assetKey of [...referenced.keys()].sort()) {
      const ref = referenced.get(assetKey);
      const corpusAbs = join(corpusRoot, ...assetKey.split('/'));
      if (!existsSync(corpusAbs)) {
        suppressed.push({
          sourcePath: assetKey,
          article: [...ref.articles][0],
          reason: 'missing-in-corpus',
        });
        continue;
      }
      if (!shouldCopy || args.dryRun) continue;
      const bytes = statBytes(corpusAbs);
      const dims = imageDimensions(corpusAbs);
      const target = join(publicRoot, ...assetKey.split('/'));
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(corpusAbs, target);
      familyManifest.assets[assetKey] = { bytes, width: dims.width, height: dims.height };
      familyManifest.copiedCount += 1;
      familyManifest.copiedBytes += bytes;
    }

    manifest.families[family] = familyManifest;
    summary.push({
      family,
      policy: familyManifest.policy,
      referenced: referenced.size,
      copied: familyManifest.copiedCount,
      copiedBytes: familyManifest.copiedBytes,
      suppressed: familyManifest.suppressed.length,
    });
  }

  if (!args.dryRun) {
    mkdirSync(join(buildDir, 'route-registry'), { recursive: true });
    const manifestPath = join(buildDir, 'route-registry', 'asset-manifest.json');
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
    for (const row of summary) {
      process.stdout.write(
        `${row.family.padEnd(26)} policy=${row.policy.padEnd(11)} referenced=${String(row.referenced).padEnd(5)} ` +
        `copied=${String(row.copied).padEnd(5)} bytes=${String(row.copiedBytes).padEnd(9)} suppressed=${row.suppressed}\n`,
      );
    }
    const totalCopied = summary.reduce((n, r) => n + r.copied, 0);
    const totalBytes = summary.reduce((n, r) => n + r.copiedBytes, 0);
    process.stdout.write(`assets: copied=${totalCopied} bytes=${totalBytes} -> manifest ${manifestPath}\n`);
  } else {
    process.stdout.write('dry run: nothing copied, no manifest written\n');
  }
}

function statBytes(abs) {
  // readFileSync length is fine for images up to a few MB and avoids an import.
  return readFileSync(abs).length;
}

main();
