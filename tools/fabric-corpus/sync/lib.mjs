// Hansa fabric-corpus sync machinery — shared library (FC09/W3-C).
//
// Pure helpers used by simulate-upstream.mjs, sync-diff.mjs and
// release-candidate.mjs. All JSON is read with fs (never JSON imports —
// repo test constraint), all emitted artifacts are canonical JSON with
// recursively sorted object keys (arrays keep order), trailing newline.
// No clocks, no network, no absolute paths in emitted artifacts: the same
// inputs always produce byte-identical outputs.

import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';


/** Pinned upstream corpus revision (the only revision in this environment). */
export const PINNED_CORPUS_REVISION = '774592ea3f2d4558f763d6e5b74abf4785948fb5';

export function sha256Text(text) {
  return createHash('sha256').update(String(text), 'utf8').digest('hex');
}

export function sha256Buffer(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

export function toPosix(p) {
  return String(p ?? '').replace(/\\/g, '/');
}

/** Recursively sort object keys (arrays keep order); throws on undefined. */
export function sortDeep(value) {
  if (value === undefined) {
    throw new TypeError('sortDeep: undefined is not representable');
  }
  if (value === null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(sortDeep);
  const out = {};
  for (const k of Object.keys(value).sort()) out[k] = sortDeep(value[k]);
  return out;
}

/** Canonical artifact bytes: sorted keys, 2-space JSON, trailing newline. */
export function canonicalJson(value) {
  return `${JSON.stringify(sortDeep(value), null, 2)}\n`;
}

/** Recursively collect files under absDir. Returns [{abs, rel}] where rel is
 *  a posix path relative to absDir, sorted in codepoint order (mirrors the
 *  compiler's deterministic walk, but for ALL file kinds). */
export function walkFiles(absDir, relBase = '') {
  const out = [];
  const entries = readdirSync(absDir, { withFileTypes: true });
  const sorted = entries
    .map((e) => ({ name: e.name, isDir: e.isDirectory(), isFile: e.isFile() }))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const entry of sorted) {
    const abs = join(absDir, entry.name);
    const rel = relBase === '' ? entry.name : `${relBase}/${entry.name}`;
    if (entry.isDir) out.push(...walkFiles(abs, rel));
    else if (entry.isFile) out.push({ abs, rel });
  }
  return out;
}

/** Read + parse a JSON document with fs (no JSON imports). */
export function readJson(absPath) {
  return JSON.parse(readFileSync(absPath, 'utf8'));
}

/** Family-directory classifier: a path is an include/fragment source when it
 *  lives in a per-family `includes/` directory or the top-level `includes/`
 *  directory of the docs root. */
export function isIncludeSourcePath(docsRelPath) {
  const p = toPosix(docsRelPath);
  return p === 'includes' || p.startsWith('includes/') || /(^|\/)includes\//.test(p);
}

/** Resolve one include/link href from a file at `fromRel` (docs-relative)
 *  with the compiler's own rules (deps.mjs resolveWithinRoots, relative
 *  shapes only): `~/`-prefixed, site-absolute and URL-shaped targets are not
 *  filesystem references and yield null. Returns a normalized docs-relative
 *  posix path, or null. */
export function resolveRelativeDocPath(fromRel, href) {
  const h = toPosix(href).trim();
  if (h.startsWith('~') || h.startsWith('/') || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(h)) return null;
  const hashIdx = h.indexOf('#');
  const noAnchor = hashIdx === -1 ? h : h.slice(0, hashIdx);
  if (noAnchor === '') return null;
  const baseDir = fromRel.includes('/') ? fromRel.slice(0, fromRel.lastIndexOf('/')) : '';
  const combined = baseDir === '' ? noAnchor : `${baseDir}/${noAnchor}`;
  const parts = [];
  let escaped = false;
  for (const part of combined.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') {
      if (parts.length === 0) escaped = true;
      else parts.pop();
    } else parts.push(part);
  }
  if (escaped || parts.length === 0) return null;
  return parts.join('/');
}

/** Derive the planned logical route from a docs-relative source path, using
 *  the FC02 rule (family seed = first docs segment; the rest becomes the
 *  intra-family path without the .md extension):
 *    docs/<family>/<rest>.md -> /learn/fabric/docs/<family>/<rest-without-.md>/
 *  Used for rows the identity ledger cannot know about (synthetic added or
 *  renamed articles); ledger rows take precedence when available. */
export function deriveLogicalPath(docsRelPath) {
  const p = toPosix(docsRelPath).replace(/^docs\//, '').replace(/\.md$/i, '');
  const slash = p.indexOf('/');
  if (slash === -1) return null;
  const family = p.slice(0, slash);
  const rest = p.slice(slash + 1);
  return `/learn/fabric/docs/${family}/${rest}/`;
}

/** Parse CLI args of the shape --key value / --key=value into an object;
 *  unknown bare tokens are collected under `positional`. */
export function parseArgs(argv, { required = [], optional = [] } = {}) {
  const args = { positional: [] };
  const rest = [...argv];
  while (rest.length > 0) {
    const a = rest.shift();
    if (a === '--help' || a === '-h') {
      args.help = true;
      continue;
    }
    let key = a;
    let value;
    if (a.startsWith('--')) {
      const eq = a.indexOf('=');
      if (eq !== -1) {
        key = a.slice(0, eq);
        value = a.slice(eq + 1);
      } else if (rest.length > 0 && !rest[0].startsWith('--')) {
        value = rest.shift();
      } else {
        value = 'true';
      }
      args[key.slice(2)] = value;
    } else {
      args.positional.push(a);
    }
  }
  const missing = required.filter((k) => args[k] === undefined);
  if (missing.length > 0) {
    const err = new Error(`missing required arguments: ${missing.map((k) => `--${k}`).join(', ')}`);
    err.usage = true;
    throw err;
  }
  void optional;
  return args;
}

export function failWithUsage(usageText, err) {
  process.stderr.write(`error: ${err.message}\n${err.usage ? usageText : ''}\n`);
  process.exit(2);
}
