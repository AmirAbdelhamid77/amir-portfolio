#!/usr/bin/env node
// FC05 — generate static alias pages for resolved upstream redirects.
//
//   node tools/fabric-corpus/route-registry/write-alias-routes.mjs \
//     [--families admin,data-factory,fundamentals,onelake,real-time-intelligence] [--dry-run]
//
// Wave 2 limit: only aliases whose redirect SOURCE sits in the
// representative families get pages now (recorded in the report; full
// rollout is FC12/FC13). The mechanism is the portable one from the task
// brief: plain HTML files in public/fabric-aliases/ with
//   <meta http-equiv="refresh"> + a <noscript> visible link,
// using safeRedirectTarget semantics (same-origin paths only,
// lib/fabric/paths.ts). public/ files are copied verbatim by `next build`
// into out/ (verified in the FC05 build run), so no Next route files are
// needed and the static export stays renderer-neutral.
//
// A source '/docs/<family>/<rest>.md' becomes
// public/fabric-aliases/<family>/<rest>.html — mirroring the upstream
// docset-relative path with an .html extension.
//
// Outputs (outside Git; the whole tree is gitignored, RELEASE_AND_STORAGE.md
// "Never in Git history: generated HTML/indexes"):
//   public/fabric-aliases/<family>/<rest>.html
//   <FABRIC_CORPUS_BUILD_DIR>/route-registry/alias-pages.json (receipt)
//
// Exit codes: 0 ok; 2 usage/IO error.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { safeRedirectTarget } from '../../../lib/fabric/paths.ts';

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), '..', '..', '..', '..');
const WAVE2_FAMILIES = ['admin', 'data-factory', 'fundamentals', 'onelake', 'real-time-intelligence'];

function parseArgs(argv) {
  const args = { families: WAVE2_FAMILIES, dryRun: false };
  for (const a of argv) {
    if (a.startsWith('--families=')) args.families = a.slice('--families='.length).split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--dry-run') args.dryRun = true;
    else { process.stderr.write(`unknown argument: ${a}\n`); process.exit(2); }
  }
  return args;
}

/** Escape for HTML text and attribute contexts (content is registry data,
 *  never trusted raw). */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function aliasPageHtml({ from, targetLogicalPath, delaySeconds = 0 }) {
  // Base path is applied here exactly once (this IS the output boundary for
  // these files); NEXT_PUBLIC_BASE_PATH matches next.config.ts.
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const candidate = `${basePath}${targetLogicalPath}`;
  // safeRedirectTarget: same-origin path gate (no scheme, no //, no
  // backslash, no control chars, length capped). Invalid → visible link only.
  const safeTarget = safeRedirectTarget(candidate);
  const refresh = safeTarget
    ? `<meta http-equiv="refresh" content="${delaySeconds}; url=${escapeHtml(safeTarget)}">`
    : '';
  const visibleHref = safeTarget ?? `${basePath}/learn/fabric/docs/`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${refresh}
<meta name="robots" content="noindex">
<title>Page moved — Hansa Fabric docs</title>
</head>
<body>
<p>This address (<code>${escapeHtml(from)}</code>) moved in the Microsoft
Fabric documentation. The article now lives at
<a href="${escapeHtml(visibleHref)}">${escapeHtml(visibleHref)}</a>.</p>
<noscript><p>Use the link above to continue.</p></noscript>
</body>
</html>
`;
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

  // Honour the provisioning public root so a clean-room build writes alias
  // pages into its own tree instead of the working checkout.
  const publicRoot = resolve(process.env.FABRIC_PUBLIC_ROOT ?? join(REPO_ROOT, 'public'));
  const outRoot = join(publicRoot, 'fabric-aliases');
  const pages = [];
  let unsafeTargets = 0;
  const byFamily = {};

  for (const alias of registry.aliases) {
    const candidate = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${alias.to}`;
    if (safeRedirectTarget(candidate) === null) unsafeTargets += 1;
    const match = alias.from.match(/^\/docs\/([^/]+)\/(.+)\.md$/);
    if (!match) continue;
    const [, family, rest] = match;
    if (!args.families.includes(family)) continue;
    const htmlPath = join(outRoot, family, `${rest}.html`);
    const html = aliasPageHtml({ from: alias.from, targetLogicalPath: alias.to });
    if (!args.dryRun) {
      mkdirSync(dirname(htmlPath), { recursive: true });
      writeFileSync(htmlPath, html, 'utf8');
    }
    pages.push({ from: alias.from, file: `public/fabric-aliases/${family}/${rest}.html`, to: alias.to, kind: alias.kind });
    byFamily[family] = (byFamily[family] ?? 0) + 1;
  }

  if (!args.dryRun) {
    const receipt = {
      schema: 'hansa.fabric-alias-pages/1',
      corpusRevision: registry.corpusRevision,
      families: args.families,
      pages,
      counts: { pages: pages.length, byFamily, unsafeTargets },
    };
    mkdirSync(join(buildDir, 'route-registry'), { recursive: true });
    writeFileSync(
      join(buildDir, 'route-registry', 'alias-pages.json'),
      JSON.stringify(receipt, null, 2) + '\n',
      'utf8',
    );
    process.stdout.write(
      `alias pages: ${pages.length} written (${Object.entries(byFamily).map(([f, n]) => `${f}=${n}`).join(', ')})` +
      ` unsafeTargets=${unsafeTargets}\n`,
    );
  } else {
    process.stdout.write(`dry run: ${pages.length} alias pages would be written; unsafeTargets=${unsafeTargets}\n`);
  }
}

main();
