// Hansa fabric-corpus compiler — dependency graph (FC03).
//
// Builds the dependency graph from a parsed AST and annotates nodes:
// includes, images (markdown + Learn :::image), links, anchors, locale refs,
// applicability markers (zone pivot / moniker ranges), and commented-out
// directives (which regex-only scanning cannot certify — see handover 02:
// RTI get-data-fluent.md).
//
// Resolution is safe and rooted: relative paths resolve against the including
// file and must stay inside the allowed roots. Any of the following blocks
// the affected node with a reason (quarantine) while accounting continues:
//   - path traversal out of the allowed roots
//   - `~/../<repo>/...` paths into sibling repositories that are not pinned
//     (structured dependency holds; `~/<path>` INSIDE the docset resolves)
//   - cycles in include chains
//   - missing include targets
//   - deep (chain) occurrences of the above, propagated to the parent node
//
// Determinism: no clocks, no network; the only I/O is the IO facade supplied
// by the caller (exists / readText over the pinned corpus).

import { parseSource, slugify } from './parse.mjs';
import { sha256Text } from './emit.mjs';

// ---------------------------------------------------------------------------
// Link classification
// ---------------------------------------------------------------------------

const URL_SCHEME = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;
// Common Learn locale path prefixes (site-absolute links scoped to a locale).
const LOCALES = new Set([
  'ar-sa', 'bn-in', 'cs-cz', 'da-dk', 'de-de', 'el-gr', 'en-biz', 'en-dev',
  'en-gb', 'en-ie', 'en-id', 'en-my', 'en-nz', 'en-ph', 'en-sg', 'en-us',
  'es-ar', 'es-cl', 'es-es', 'es-mx', 'et-ee', 'fi-fi', 'fr-be', 'fr-ca',
  'fr-fr', 'he-il', 'hi-in', 'hr-hr', 'hu-hu', 'id-id', 'it-it', 'ja-jp',
  'ko-kr', 'lt-lt', 'lv-lv', 'ms-my', 'nb-no', 'nl-nl', 'pl-pl', 'pt-br',
  'pt-pt', 'ro-ro', 'ru-ru', 'sk-sk', 'sl-si', 'sr-latn-rs', 'sv-se',
  'th-th', 'tr-tr', 'uk-ua', 'vi-vn', 'zh-cn', 'zh-hk', 'zh-tw',
]);

/**
 * Classify a link/image href into an accounting class.
 * Returns { classification, anchor, scheme }.
 *  - anchor-only:    "#fragment"
 *  - external:       absolute URL (http/https/protocol-relative)
 *  - mail:           mailto:
 *  - site-absolute:  "/path" without a locale prefix
 *  - locale-ref:     "/<locale>/path" (e.g. "/en-us/...")
 *  - relative-md:    relative path to a corpus Markdown file
 *  - relative-asset: relative path to a media/binary asset
 *  - relative-other: any other relative target
 */
export function classifyHref(href) {
  const result = { classification: 'relative-other', anchor: null, scheme: null };
  const h = String(href ?? '');
  const hashIdx = h.indexOf('#');
  result.anchor = hashIdx === -1 ? null : h.slice(hashIdx + 1) || null;
  if (h.startsWith('#')) {
    result.classification = 'anchor-only';
    return result;
  }
  const schemeMatch = h.match(URL_SCHEME);
  if (schemeMatch) {
    result.scheme = schemeMatch[1].toLowerCase();
    if (result.scheme === 'mailto') result.classification = 'mail';
    else result.classification = 'external';
    return result;
  }
  if (h.startsWith('//')) {
    result.classification = 'external';
    result.scheme = 'protocol-relative';
    return result;
  }
  if (h.startsWith('/')) {
    const first = h.slice(1).split('/')[0].toLowerCase();
    if (LOCALES.has(first)) result.classification = 'locale-ref';
    else result.classification = 'site-absolute';
    return result;
  }
  const noAnchor = hashIdx === -1 ? h : h.slice(0, hashIdx);
  if (/\.(md|markdown)$/i.test(noAnchor)) result.classification = 'relative-md';
  else if (/\.(png|jpe?g|gif|svg|webp|bmp|ico|tiff?|pdf|zip|mp4|mp3|wav|csv|json|yaml|yml|pptx?|docx?|xlsx?)$/i.test(noAnchor)) result.classification = 'relative-asset';
  else result.classification = 'relative-other';
  return result;
}

// ---------------------------------------------------------------------------
// Path resolution inside allowed roots
// ---------------------------------------------------------------------------

function toPosix(p) {
  return String(p).replace(/\\/g, '/');
}

function normalizeRelPath(rel) {
  // Normalize a corpus-relative posix path: resolve . and .. lexically.
  // `escaped` is true when a .. climbed above the root at any point — such
  // paths are traversal even though naive normalization would clamp them.
  const parts = rel.split('/');
  const out = [];
  let escaped = false;
  for (const part of parts) {
    if (part === '' || part === '.') continue;
    if (part === '..') {
      if (out.length === 0) escaped = true;
      else out.pop();
    } else {
      out.push(part);
    }
  }
  return { path: out.join('/'), escaped };
}

/**
 * Describe a cross-repository `~/../<repo>/...` include target as a
 * structured dependency row (for the receipt dependency holds and the
 * consolidated dependency manifest). Tilde targets that stay inside the
 * docset root never reach this function (they resolve).
 */
function describeCrossRepoDependency(rawTarget) {
  // Handles both `~/../<repo>/...` and the stray double-slash form
  // `~/..//<repo>/...` found in the corpus (enterprise service-premium-what-is).
  const m = rawTarget.match(/^~\/\.\.\/+([^/]+)\/(.*)$/);
  if (m) {
    return { kind: 'cross-repo-include', targetRepo: m[1], inRepoPath: m[2] };
  }
  return { kind: 'cross-repo-include', targetRepo: null, inRepoPath: rawTarget };
}

/**
 * Resolve `href` (as written in a file at `sourceRelPath`, corpus-relative
 * posix) against `allowedRoots` (corpus-relative posix directory paths).
 * Returns { ok: true, path } or { ok: false, reason, detail }.
 *
 * Tilde semantics (docfx): `~/<path>` resolves against the docset root — here
 * the corpus root — so `~/includes/x.md` resolves to `includes/x.md` when the
 * fragment is pinned. A path that climbs above the docset root
 * (`~/../<repo>/...`) names a SIBLING REPOSITORY that is not pinned: it stays
 * blocked with reason `include-tilde-path` as a dependency hold (fail-closed;
 * the receiving article must not publish without the fragment).
 */
export function resolveWithinRoots(sourceRelPath, href, allowedRoots) {
  const raw = toPosix(href).trim();
  if (raw.startsWith('~')) {
    const hashIdx = raw.indexOf('#');
    const h = hashIdx === -1 ? raw.slice(1) : raw.slice(1, hashIdx);
    const { path: normalized, escaped } = normalizeRelPath(h);
    const inside = !escaped && allowedRoots.some((root) => normalized === root || normalized.startsWith(root === '' ? '' : root + '/'));
    if (inside) {
      return { ok: true, path: normalized };
    }
    return { ok: false, reason: 'include-tilde-path', detail: raw };
  }
  if (URL_SCHEME.test(raw)) {
    return { ok: false, reason: 'non-file-url', detail: raw };
  }
  // Strip a #fragment before filesystem resolution (anchors are accounted
  // separately as edge.anchor).
  const hashIdx = raw.indexOf('#');
  const h = hashIdx === -1 ? raw : raw.slice(0, hashIdx);
  if (h === '') {
    return { ok: false, reason: 'non-file-url', detail: raw };
  }
  let combined;
  if (h.startsWith('/')) {
    // Site-root relative inside the corpus: interpret against the first root.
    combined = (allowedRoots[0] ?? '') + h;
  } else {
    const baseDir = sourceRelPath.includes('/') ? sourceRelPath.slice(0, sourceRelPath.lastIndexOf('/')) : '';
    combined = baseDir === '' ? h : `${baseDir}/${h}`;
  }
  const { path: normalized, escaped } = normalizeRelPath(combined);
  if (escaped) {
    return { ok: false, reason: 'include-path-traversal', detail: h };
  }
  const inside = allowedRoots.some((root) => normalized === root || normalized.startsWith(root === '' ? '' : root + '/'));
  if (!inside) {
    return { ok: false, reason: 'include-path-traversal', detail: h };
  }
  return { ok: true, path: normalized };
}

// ---------------------------------------------------------------------------
// Memoized parse of referenced corpus files
// ---------------------------------------------------------------------------

/**
 * Create a memoizing parse cache over the IO facade. All io methods take
 * corpus-relative posix paths: { exists(rel) -> bool, readText(rel) -> string,
 * joinRoot(rel) -> absolute path }.
 */
export function createParseMemo(io) {
  const memo = new Map();
  return function memoParse(relPath) {
    const rel = toPosix(relPath);
    if (memo.has(rel)) return memo.get(rel);
    // Pre-insert a marker so include cycles resolve deterministically even
    // under re-entrant parsing (the full entry is set below).
    const entry = { path: rel, exists: io.exists(rel) };
    memo.set(rel, entry);
    if (!entry.exists) return entry;
    const text = io.readText(rel);
    entry.sha256 = sha256Text(text);
    const parsed = parseSource(text);
    entry.nodeCount = parsed.nodes.length;
    entry.parsed = parsed;
    entry.headingSlugs = [];
    collectSlugs(parsed.nodes, entry.headingSlugs);
    entry.includeNodes = [];
    entry.commentedDirectives = [];
    collectIncludeNodes(parsed.nodes, entry.includeNodes, entry.commentedDirectives);
    return entry;
  };
}

function collectSlugs(nodes, out) {
  const walk = (list) => {
    for (const node of list) {
      if (node.type === 'heading' && node.slug) out.push(node.slug);
      if (Array.isArray(node.children)) walk(node.children);
      if (node.type === 'list') for (const item of node.items) if (Array.isArray(item.children)) walk(item.children);
    }
  };
  walk(nodes);
}

function collectIncludeNodes(nodes, includes, commented) {
  const walkInline = (list) => {
    for (const node of list) {
      if (node.type === 'include') includes.push(node);
      if (Array.isArray(node.children)) walkInline(node.children);
    }
  };
  const walkBlocks = (list) => {
    for (const node of list) {
      if (node.type === 'include') includes.push(node);
      if (node.type === 'commentedDirective') commented.push(node);
      walkInline(node.inline ?? []);
      if (node.type === 'table') {
        for (const cell of [...node.header, ...node.rows.flat()]) walkInline(cell.inline ?? []);
      }
      if (node.type === 'list') {
        for (const item of node.items) {
          walkInline(item.inline ?? []);
          if (Array.isArray(item.children)) walkBlocks(item.children);
        }
      }
      if (Array.isArray(node.children)) walkBlocks(node.children);
    }
  };
  walkBlocks(nodes);
}

// ---------------------------------------------------------------------------
// Include chain resolution
// ---------------------------------------------------------------------------

/**
 * Resolve one include node.
 *  node:     the include AST node (annotated in place)
 *  fromRel:  corpus-relative path of the file containing the node
 *  chain:    array of corpus-relative paths already on the include chain
 * Returns 'clean' | 'blocked:<reason>'.
 */
function resolveIncludeNode(node, fromRel, chain, ctx) {
  const classification = classifyHref(node.target);
  if (classification.scheme && classification.classification !== 'relative-md' && classification.classification !== 'relative-other') {
    node.resolved = null;
    node.exists = null;
    node.blocked = true;
    node.blockedReason = 'include-non-file-url';
    ctx.quarantines.push({ nodeType: 'include', reason: node.blockedReason, detail: node.target, span: node.span });
    return 'blocked';
  }
  const res = resolveWithinRoots(fromRel, node.target, ctx.allowedRoots);
  if (!res.ok) {
    node.resolved = null;
    node.exists = null;
    node.blocked = true;
    node.blockedReason = res.reason;
    if (res.reason === 'include-tilde-path') {
      // Structured dependency hold: the fragment lives in a sibling repo that
      // is not pinned. Rows flow to the receipt (per-file `dependencyHolds`)
      // and to the consolidated dependency manifest; the article stays
      // quarantined (fail-closed — no silent partial publication).
      ctx.dependencyHolds.push({ target: res.detail, ...describeCrossRepoDependency(res.detail), span: node.span });
    }
    ctx.quarantines.push({ nodeType: 'include', reason: res.reason, detail: res.detail, span: node.span });
    return 'blocked';
  }
  const targetRel = res.path;
  if (chain.includes(targetRel)) {
    node.resolved = targetRel;
    node.exists = true;
    node.blocked = true;
    node.blockedReason = 'include-cycle';
    node.chain = [...chain];
    ctx.quarantines.push({ nodeType: 'include', reason: 'include-cycle', detail: `${node.target} (chain: ${chain.join(' -> ')} -> ${targetRel})`, span: node.span });
    return 'blocked';
  }
  const entry = ctx.memoParse(targetRel);
  node.resolved = targetRel;
  node.exists = entry.exists;
  node.fragmentSha256 = entry.exists ? entry.sha256 : null;
  node.fragmentNodeCount = entry.exists ? entry.nodeCount : null;
  if (!entry.exists) {
    node.blocked = true;
    node.blockedReason = 'include-missing-target';
    ctx.quarantines.push({ nodeType: 'include', reason: 'include-missing-target', detail: node.target, span: node.span });
    return 'blocked';
  }
  // Clean so far; deeper chain problems may still override below.
  node.blocked = false;
  node.blockedReason = null;
  // Recurse into the fragment's own includes, propagating deep problems.
  const fragmentWarning = entry.parsed.warnings[0];
  let deepBlocked = fragmentWarning ? `${targetRel}: ${fragmentWarning.reason}` : null;
  for (const childNode of entry.includeNodes) {
    const outcome = resolveIncludeNode(childNode, targetRel, [...chain, targetRel], ctx);
    if (outcome !== 'clean' && deepBlocked === null) {
      deepBlocked = `${targetRel}: ${childNode.blockedReason}`;
    }
  }
  // Commented directives inside fragments must be visible in the parent's
  // accounting: regex-only scanning cannot certify closure (handover 02).
  for (const cd of entry.commentedDirectives) {
    ctx.commentedDirectives.push({
      viaInclude: targetRel,
      span: cd.span,
      directiveText: cd.directiveText,
    });
  }
  if (deepBlocked) {
    node.blocked = true;
    node.blockedReason = `include-chain:${deepBlocked}`;
    ctx.quarantines.push({ nodeType: 'include', reason: 'include-chain', detail: deepBlocked, span: node.span });
    return 'blocked';
  }
  return 'clean';
}

// ---------------------------------------------------------------------------
// Graph build over a whole parsed file
// ---------------------------------------------------------------------------

/**
 * Build the dependency graph for one source file.
 *  params:
 *    sourceRelPath  corpus-relative posix path of the file
 *    nodes          parsed block nodes (annotated in place)
 *    parserWarnings warnings from parseSource
 *    io             { exists, readText, joinRoot }
 *    allowedRoots   corpus-relative posix directory prefixes (default [''])
 * Returns { edges, quarantines, commentedDirectives }.
 */
export function buildDependencyGraph({ sourceRelPath, nodes, parserWarnings = [], io, allowedRoots = [''] }) {
  const ctx = {
    allowedRoots,
    memoParse: createParseMemo(io),
    edges: [],
    quarantines: [],
    commentedDirectives: [],
    dependencyHolds: [],
  };
  const fileSlugs = new Set();
  {
    const slugs = [];
    collectSlugs(nodes, slugs);
    for (const s of slugs) fileSlugs.add(s);
  }

  const resolveTarget = (fromRel, href) => {
    const cls = classifyHref(href);
    if (cls.classification === 'relative-md' || cls.classification === 'relative-asset' || cls.classification === 'relative-other') {
      const res = resolveWithinRoots(fromRel, href, ctx.allowedRoots);
      if (!res.ok) return { classification: cls.classification, resolved: null, exists: null, anchor: cls.anchor, error: res.reason };
      // Only anchored Markdown links need a parse of the destination.
      // Images, downloads, and plain links need an existence check.
      const entry = cls.classification === 'relative-md' && cls.anchor
        ? ctx.memoParse(res.path)
        : { exists: io.exists(res.path) };
      return { classification: cls.classification, resolved: res.path, exists: entry.exists, anchor: cls.anchor, slugs: entry.headingSlugs ?? null };
    }
    return { classification: cls.classification, resolved: null, exists: null, anchor: cls.anchor };
  };

  const handleLink = (node) => {
    const target = resolveTarget(sourceRelPath, node.href);
    node.classification = target.classification;
    node.resolved = target.resolved;
    node.exists = target.classification === 'relative-md' || target.classification === 'relative-asset' || target.classification === 'relative-other' ? target.exists : null;
    if (target.anchor) node.anchor = target.anchor;
    if (target.anchor != null && target.classification === 'anchor-only') {
      node.anchorExists = fileSlugs.has(target.anchor);
    } else if (target.anchor && target.classification === 'relative-md' && target.exists && target.slugs) {
      node.anchorExists = target.slugs.includes(target.anchor);
    }
    ctx.edges.push({
      kind: 'link',
      classification: target.classification,
      href: node.href,
      resolved: target.resolved,
      exists: node.exists,
      anchor: target.anchor,
      ...(typeof node.anchorExists === 'boolean' ? { anchorExists: node.anchorExists } : {}),
      span: node.span,
    });
  };

  const handleImage = (node) => {
    for (const [prop, edgeKind] of [['src', 'image'], ['lightbox', 'image-lightbox']]) {
      const raw = node[prop];
      if (typeof raw !== 'string' || raw.length === 0) continue;
      const target = resolveTarget(sourceRelPath, raw);
      node[`${prop}Resolved`] = target.resolved;
      node[`${prop}Exists`] = target.resolved === null ? null : target.exists;
      ctx.edges.push({
        kind: edgeKind,
        classification: target.classification,
        href: raw,
        resolved: target.resolved,
        exists: target.resolved === null ? null : target.exists,
        anchor: target.anchor,
        span: node.span,
      });
    }
  };

  const walkBlocks = (list) => {
    for (const node of list) {
      // Inline nodes first (document order), then the block node itself.
      if (node.type === 'paragraph' || node.type === 'heading') {
        for (const inlineNode of node.inline ?? []) walkInline(inlineNode);
      }
      switch (node.type) {
        case 'include': {
          const outcome = resolveIncludeNode(node, sourceRelPath, [sourceRelPath], ctx);
          ctx.edges.push({
            kind: 'include',
            href: node.target,
            resolved: node.resolved ?? null,
            exists: node.exists ?? null,
            blocked: node.blocked === true,
            reason: node.blockedReason ?? null,
            span: node.span,
          });
          void outcome;
          break;
        }
        case 'learnConstruct': {
          if (node.kind === 'image') {
            handleImage({ src: node.attributes?.source ?? null, lightbox: node.attributes?.lightbox ?? null, span: node.span });
          }
          // Applicability markers: zone pivots and moniker ranges.
          const attrs = node.attributes ?? {};
          if (node.kind === 'zone' && typeof attrs.pivot === 'string') {
            ctx.edges.push({ kind: 'applicability', marker: 'pivot', value: attrs.pivot, href: null, resolved: null, exists: null, span: node.span });
          }
          if (node.kind === 'moniker') {
            const range = attrs['moniker-range'] ?? attrs.range ?? null;
            if (typeof range === 'string') {
              ctx.edges.push({ kind: 'applicability', marker: 'moniker', value: range, href: null, resolved: null, exists: null, span: node.span });
            }
          }
          if (node.kind === 'video' && typeof attrs.url === 'string') {
            ctx.edges.push({ kind: 'video', classification: classifyHref(attrs.url).classification, href: attrs.url, resolved: null, exists: null, span: node.span });
          }
          if (Array.isArray(node.children)) walkBlocks(node.children);
          break;
        }
        case 'blockquote':
        case 'admonition':
          if (Array.isArray(node.children)) walkBlocks(node.children);
          break;
        case 'list':
          for (const item of node.items) {
            for (const inlineNode of item.inline ?? []) walkInline(inlineNode);
            if (Array.isArray(item.children)) walkBlocks(item.children);
          }
          break;
        case 'table':
          for (const cell of [...node.header, ...node.rows.flat()]) {
            for (const inlineNode of cell.inline ?? []) walkInline(inlineNode);
          }
          break;
        case 'commentedDirective':
          ctx.commentedDirectives.push({ span: node.span, directiveText: node.directiveText });
          ctx.edges.push({ kind: 'commented-directive', href: null, resolved: null, exists: null, span: node.span, directiveText: node.directiveText });
          break;
        case 'html':
          // Image references inside raw HTML (<img src="...">) are accounted.
          for (const m of String(node.raw ?? '').matchAll(/<img\b[^>]*\bsrc\s*=\s*"([^"]*)"/gi)) {
            const target = resolveTarget(sourceRelPath, m[1]);
            ctx.edges.push({ kind: 'image', classification: target.classification, href: m[1], resolved: target.resolved, exists: target.exists, span: node.span, via: 'raw-html' });
          }
          break;
        default:
          break;
      }
    }
  };

  const walkInline = (node) => {
    if (!node || typeof node !== 'object') return;
    if (node.type === 'link') handleLink(node);
    else if (node.type === 'image') handleImage(node);
    else if (node.type === 'inlineHtml') {
      // Image references inside inline HTML (<img src="...">) are accounted.
      for (const m of String(node.raw ?? '').matchAll(/<img\b[^>]*\bsrc\s*=\s*"([^"]*)"/gi)) {
        const target = resolveTarget(sourceRelPath, m[1]);
        ctx.edges.push({ kind: 'image', classification: target.classification, href: m[1], resolved: target.resolved, exists: target.exists, span: node.span, via: 'inline-html' });
      }
    }
    else if (node.type === 'include') {
      const outcome = resolveIncludeNode(node, sourceRelPath, [sourceRelPath], ctx);
      ctx.edges.push({
        kind: 'include',
        href: node.target,
        resolved: node.resolved ?? null,
        exists: node.exists ?? null,
        blocked: node.blocked === true,
        reason: node.blockedReason ?? null,
        span: node.span,
        inline: true,
      });
      void outcome;
    }
    for (const child of node.children ?? []) walkInline(child);
  };

  // Single depth-first pass in document order (inlines are handled when
  // their parent block is reached).
  walkBlocks(nodes);

  // Parser-level warnings become quarantine entries (unknown directives,
  // unterminated constructs) — dependency closure cannot be certified for them.
  for (const w of parserWarnings) {
    ctx.quarantines.push({ nodeType: 'parse', reason: w.reason, detail: w.detail ?? null, span: w.span });
  }

  return {
    edges: ctx.edges,
    quarantines: ctx.quarantines,
    commentedDirectives: ctx.commentedDirectives,
    dependencyHolds: ctx.dependencyHolds,
  };
}

// Re-export for callers that want slug normalization without importing parse.
export { slugify };
