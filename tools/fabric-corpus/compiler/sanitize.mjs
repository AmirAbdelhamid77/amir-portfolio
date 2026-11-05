// Hansa fabric-corpus compiler — sanitizer (FC03).
//
// 1. URL scheme allowlist. Applied to every link href and image source.
//    Allowed: https:, http:, mailto:, site-relative (/x, ./x, ../x, bare),
//    pure fragment (#x), and `data:image/*` EXCLUDING SVG.
//    Rationale (recorded, per architecture "Sanitize HTML and URL schemes"):
//    - allowlist beats blocklist: unknown schemes (ftp:, file:, about:, ...)
//      are neutralized, not just javascript:/vbscript:.
//    - data:image/* raster formats are allowed so self-contained inline
//      images survive; `data:image/svg+xml` is NOT allowed because SVG can
//      carry script; other data: (e.g. data:text/html) are active content.
//    Neutralized nodes keep their text/alt (nothing is lost) and record the
//    original value plus a receipt log entry.
//
// 2. Raw HTML sanitization. Dangerous constructs are removed:
//      script, iframe, object, embed, style, form, base, meta, link
//    and on* attributes plus url-bearing attributes with disallowed schemes
//    are stripped from every remaining tag. Benign HTML is preserved
//    verbatim. Every removal/transform produces a receipt log entry, so no
//    block disappears silently.
//
// Determinism: pure functions over strings; no clock, no I/O, no randomness.

import { sha256Text } from './emit.mjs';

const ALLOWED_SCHEMES = new Set(['https', 'http', 'mailto']);
// data: image media types that cannot execute script.
const SAFE_DATA_IMAGE = /^data:image\/(?:png|jpe?g|gif|webp|bmp|avif|apng|tiff?|x-icon|vnd\.microsoft\.icon)\b/i;

// Strip characters commonly used to smuggle a scheme past naive checks.
function normalizeForSchemeCheck(value) {
  let v = String(value ?? '');
  // Remove control chars and whitespace entirely before the first colon
  // (covers "java\tscript:", " javascript:", "java\nscript:").
  const colonIdx = v.search(/:/);
  const head = colonIdx === -1 ? v : v.slice(0, colonIdx);
  const tail = colonIdx === -1 ? '' : v.slice(colonIdx);
  return head.replace(/[\x00-\x20\x7f]/g, '') + tail;
}

// Minimal entity decode for URL-scheme smuggling: numeric character
// references (&#115; / &#x73;) and the common named forms (&colon;, &Tab;,
// &NewLine;). Applied before scheme detection only — attribute values are
// otherwise preserved verbatim.
function decodeUrlEntities(v) {
  let s = String(v ?? '');
  let prev = null;
  // Bounded loop: decode until stable (max 3 rounds guards pathological input).
  for (let round = 0; round < 3 && s !== prev; round++) {
    prev = s;
    s = s
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => safeCodePoint(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => safeCodePoint(parseInt(dec, 10)))
      .replace(/&colon;/gi, ':')
      .replace(/&Tab;/gi, '\t')
      .replace(/&NewLine;/gi, '\n');
  }
  return s;
}

function safeCodePoint(cp) {
  if (!Number.isInteger(cp) || cp < 0 || cp > 0x10ffff || Number.isNaN(cp)) return '\uFFFD';
  return String.fromCodePoint(cp);
}

const decodeColonEntities = decodeUrlEntities;

/**
 * Decide the sanitization action for a URL.
 * Returns { action: 'allow' } or
 *         { action: 'neutralize', reason: '<scheme>' | 'no-scheme-disallowed' }.
 */
export function sanitizeHref(href) {
  if (href == null) return { action: 'allow' };
  const raw = String(href);
  const trimmed = raw.trim();
  if (trimmed === '') return { action: 'allow' };
  if (trimmed.startsWith('#')) return { action: 'allow' }; // pure fragment
  const checked = decodeColonEntities(normalizeForSchemeCheck(trimmed));
  const schemeMatch = checked.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  if (!schemeMatch) {
    // No scheme: relative path (may start with /). Relative paths cannot
    // carry a scheme, so they are allowed.
    return { action: 'allow' };
  }
  const scheme = schemeMatch[1].toLowerCase();
  if (scheme === 'data') {
    if (SAFE_DATA_IMAGE.test(checked)) return { action: 'allow' };
    return { action: 'neutralize', reason: 'data-url-not-safe-image' };
  }
  if (ALLOWED_SCHEMES.has(scheme)) return { action: 'allow' };
  return { action: 'neutralize', reason: `disallowed-scheme:${scheme}` };
}

// ---------------------------------------------------------------------------
// Raw HTML sanitization
// ---------------------------------------------------------------------------

const DANGEROUS_ELEMENTS = ['script', 'iframe', 'object', 'embed', 'style', 'form', 'base', 'meta', 'link'];
const URL_ATTRS = 'href|src|action|formaction|poster|background|cite|xlink:href|data';
const URL_ATTR_RE = new RegExp(`\\s(${URL_ATTRS})\\s*=\\s*("[^"]*"|'[^']*'|[^\\s>]+)`, 'gi');
const ON_ATTR_RE = /\son[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const TAG_RE = /<[a-zA-Z][/][^>]*>|<[a-zA-Z][^>]*>/g;

function snippetOf(s, max = 120) {
  const t = String(s).replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

/**
 * Sanitize a raw HTML fragment.
 * Returns { html, changed, emptied, log } where log is a list of entries:
 *   { action, detail, snippet, sha256 }  (action: element-removed |
 *    attribute-removed | url-attribute-removed)
 */
export function sanitizeHtmlRaw(rawHtml) {
  let s = String(rawHtml ?? '');
  const log = [];
  const logRemove = (action, detail, removed) => {
    log.push({
      action,
      detail,
      snippet: snippetOf(removed),
      sha256: sha256Text(removed),
    });
  };

  // 1. Remove dangerous elements (whole element incl. content), then any
  //    leftover open/close tags for the same element (unclosed forms).
  for (const tag of DANGEROUS_ELEMENTS) {
    const blockRe = new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}\\s*>`, 'gi');
    s = s.replace(blockRe, (m) => {
      logRemove('element-removed', `<${tag}> block`, m);
      return '';
    });
    const openRe = new RegExp(`<${tag}\\b[^>]*/?>`, 'gi');
    s = s.replace(openRe, (m) => {
      logRemove('element-removed', `<${tag}> open tag (unclosed)`, m);
      return '';
    });
    const closeRe = new RegExp(`</${tag}\\s*>`, 'gi');
    s = s.replace(closeRe, (m) => {
      logRemove('element-removed', `</${tag}> close tag (orphan)`, m);
      return '';
    });
  }

  // 2. Scrub attributes on remaining tags.
  s = s.replace(TAG_RE, (tagMatch) => {
    let tag = tagMatch;
    tag = tag.replace(ON_ATTR_RE, (m) => {
      logRemove('attribute-removed', 'event handler attribute', m);
      return '';
    });
    tag = tag.replace(URL_ATTR_RE, (m, attr, quotedValue) => {
      const value = quotedValue.replace(/^["']|["']$/g, '');
      const decision = sanitizeHref(decodeColonEntities(value));
      if (decision.action === 'neutralize') {
        logRemove('url-attribute-removed', `${attr}="${value}" (${decision.reason})`, m);
        return '';
      }
      return m;
    });
    return tag;
  });

  const changed = s !== rawHtml;
  const emptied = s.trim().length === 0;
  return { html: s, changed, emptied, log };
}

// ---------------------------------------------------------------------------
// AST-level sanitization
// ---------------------------------------------------------------------------

const logPush = (log, entry) => {
  log.push(entry);
};

/**
 * Sanitize an AST in place. Mutates link/image/inlineHtml/html nodes and
 * returns { log } where each entry is:
 *   { kind: 'url-neutralized'|'html-removed'|'html-transformed',
 *     span, detail, sha256, snippet }
 */
export function sanitizeDocument(nodes) {
  const log = [];

  const neutralizeUrlNode = (node, prop, originalProp, kindLabel) => {
    const value = node[prop];
    if (typeof value !== 'string' || value.length === 0) return;
    const decision = sanitizeHref(value);
    if (decision.action === 'allow') return;
    node[originalProp] = value;
    node[prop] = '#';
    node.sanitized = { action: 'neutralized', reason: decision.reason };
    logPush(log, {
      kind: 'url-neutralized',
      span: node.span,
      detail: `${kindLabel} ${node[originalProp]} -> # (${decision.reason})`,
      sha256: sha256Text(value),
      snippet: snippetOf(value),
    });
  };

  const sanitizeInlineList = (list) => {
    if (!Array.isArray(list)) return;
    for (const node of list) {
      if (node.type === 'link') {
        neutralizeUrlNode(node, 'href', 'hrefOriginal', 'link href');
        sanitizeInlineList(node.children);
      } else if (node.type === 'image') {
        neutralizeUrlNode(node, 'src', 'srcOriginal', 'image src');
      } else if (node.type === 'inlineHtml') {
        const res = sanitizeHtmlRaw(node.raw);
        if (res.emptied) {
          node.type = 'inlineHtmlRemoved';
          node.removedRaw = node.raw;
          delete node.raw;
          logPush(log, {
            kind: 'html-removed',
            span: node.span,
            detail: 'inline html emptied by sanitizer',
            sha256: sha256Text(res.html),
            snippet: snippetOf(node.removedRaw),
          });
        } else if (res.changed) {
          node.raw = res.html;
          node.sanitized = true;
          for (const entry of res.log) {
            logPush(log, { kind: 'html-transformed', span: node.span, detail: entry.detail, sha256: entry.sha256, snippet: entry.snippet });
          }
        }
      }
      if (Array.isArray(node.children)) sanitizeInlineList(node.children);
    }
  };

  const walk = (list) => {
    for (const node of list) {
      // Inline content first (document order).
      if (node.type === 'paragraph' || node.type === 'heading') sanitizeInlineList(node.inline);
      if (node.type === 'table') {
        for (const cell of [...node.header, ...node.rows.flat()]) sanitizeInlineList(cell.inline);
      }
      if (node.type === 'list') {
        for (const item of node.items) sanitizeInlineList(item.inline);
      }
      if (node.type === 'html') {
        const res = sanitizeHtmlRaw(node.raw);
        for (const entry of res.log) {
          logPush(log, { kind: 'html-transformed', span: node.span, detail: entry.detail, sha256: entry.sha256, snippet: entry.snippet });
        }
        if (res.emptied) {
          node.type = 'htmlRemoved';
          node.removedRaw = node.raw;
          delete node.raw;
          logPush(log, {
            kind: 'html-removed',
            span: node.span,
            detail: 'html block fully removed by sanitizer',
            sha256: sha256Text(res.html),
            snippet: snippetOf(node.removedRaw),
          });
        } else if (res.changed) {
          node.raw = res.html;
          node.sanitized = true;
        }
      }
      if (Array.isArray(node.children)) walk(node.children);
      if (node.type === 'list') {
        for (const item of node.items) if (Array.isArray(item.children)) walk(item.children);
      }
    }
  };

  walk(nodes);
  return { log };
}
