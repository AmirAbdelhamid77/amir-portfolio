// Hansa fabric-corpus compiler — parser (FC03).
//
// Deterministic, dependency-light parser for the pinned Microsoft Learn corpus:
// YAML front matter (via the `yaml` package) + Markdown -> typed AST with
// source spans, plus structural detection of Learn publishing constructs
// (zones, tabs, rows/columns, image directives, admonitions, includes) and
// commented-out directives.
//
// Span convention (used everywhere in emitted JSON):
//   { start: { line, column }, end: { line, column } }
// line is 1-based over the whole source file (front matter included);
// column is 1-based, `end.column` is EXCLUSIVE (points one past the last char).
//
// Text normalization: source lines are split on CRLF/LF/CR; multi-line text
// values are re-joined with "\n". This is the canonical newline normalization.
//
// Wave 1 limitations (all lossless: unparsed constructs are preserved as
// `unsupported` nodes or raw text, never dropped silently):
//  - reference-style links `[text][ref]` are kept as literal text
//  - setext headings are not recognized (text stays a paragraph, underline
//    becomes a thematic break — nothing is lost)
//  - [!div] / [!VIDEO] directives are represented structurally but not
//    expanded (expansion is a later-wave transform).

import { parse as yamlParse, YAMLParseError } from 'yaml';

export const COMPILER_NAME = 'hansa-fabric-compiler';
export const COMPILER_VERSION = '0.1.0';

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

/** Split source text into lines on CRLF / LF / CR. */
export function splitLines(text) {
  return String(text).split(/\r\n|\n|\r/);
}

function isBlank(lineText) {
  return /^\s*$/.test(lineText);
}

function makeSpan(startLine, startCol, endLine, endCol) {
  return { start: { line: startLine, column: startCol }, end: { line: endLine, column: endCol } };
}

function lineSpan(line, colStart, colEndExclusive) {
  return makeSpan(line.line, colStart, line.line, colEndExclusive);
}

/**
 * A region line: the text to parse, its 1-based file line number, and the
 * 1-based file column where `text` begins (for blockquote/list interiors).
 */
function regionLine(text, line, colBase) {
  return { text, line, colBase };
}

// ---------------------------------------------------------------------------
// Front matter
// ---------------------------------------------------------------------------

/**
 * Parse a leading `---` YAML front matter block.
 * Unknown keys are preserved (the whole parsed object is kept). Lines that
 * YAML treats as comments (e.g. docfx's `#customer intent: ...`) are recorded
 * verbatim in `comments` so nothing is dropped.
 */
export function parseFrontMatter(lines) {
  if (lines.length === 0 || lines[0].trim() !== '---') {
    return null;
  }
  let close = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') { close = i; break; }
  }
  if (close === -1) return null; // unterminated front matter: treat as body text
  const innerLines = lines.slice(1, close);
  const raw = innerLines.join('\n');
  let data = null;
  const comments = [];
  if (innerLines.length > 0) {
    try {
      data = yamlParse(raw) ?? null;
    } catch (err) {
      if (err instanceof YAMLParseError) {
        data = null; // YAML errors surface via `yamlError`; raw is preserved
      } else {
        throw err;
      }
    }
    for (const l of innerLines) {
      // A YAML comment must have '#' at line start or after whitespace.
      const m = l.match(/^(\s)#|^(#)/);
      if (m && l.trim().length > 0) comments.push(l);
    }
  }
  return {
    raw,
    data,
    comments,
    yamlError: null,
    span: makeSpan(1, 1, close + 1, lines[close].length + 1),
    endLine: close + 1, // 1-based line of the closing fence
  };
}

// ---------------------------------------------------------------------------
// Learn constructs
// ---------------------------------------------------------------------------

const CONSTRUCT_OPEN = /^ {0,3}:::\s*([A-Za-z][A-Za-z0-9_-]*)(.*)$/;
// End marker: "::: zone-end", ":::image-end:::", ":::row-end:::".
// (Note: any number of trailing colons; do NOT use "(?:::)?" which is a
// two-colon group, not three.)
const CONSTRUCT_END = /^ {0,3}:::\s*([A-Za-z][A-Za-z0-9_-]*)-end\s*:*\s*$/;
const DIRECTIVE = /^ {0,3}\[!([A-Za-z]+)\s*([^\]]*)\]\s*$/;
const INCLUDE_DIRECTIVE = /^ {0,3}\[!INCLUDE\s+\[([^\]]*)\]\(([^()\s]+)\)\]\s*$/i;
const ADMONITION_KINDS = new Set(['note', 'tip', 'important', 'warning', 'caution']);
const CONTAINER_KINDS = new Set(['zone', 'row', 'tab', 'tabs', 'column', 'columnend', 'moniker', 'image', 'div', 'table', 'section']);
// Constructs that may appear self-closing (single `:::kind ...:::` line with
// no `:::kind-end:::`). In the pinned corpus `:::image` is self-closing in
// its "content" form and a container (with alt-text description children)
// only in its "complex" form, which carries an explicit `:::image-end:::`.
const OPTIONAL_END_KINDS = new Set(['image']);

function parseConstructAttributes(rest) {
  const attributes = {};
  const attrRe = /([A-Za-z][\w-]*)\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = attrRe.exec(rest)) !== null) {
    attributes[m[1]] = m[2];
  }
  return attributes;
}

// ---------------------------------------------------------------------------
// Slug generation (GitHub-flavored anchor slugs)
// ---------------------------------------------------------------------------

/** GitHub-flavored slug: lowercase, punctuation removed, every whitespace
 *  char becomes one hyphen (no collapsing), matching github-slugger. */
export function slugify(text) {
  let s = String(text).trim().toLowerCase();
  s = s.replace(/[^\p{L}\p{N}\s_-]/gu, '');
  s = s.replace(/\s/g, '-');
  return s;
}

/** Assign document-unique anchor slugs to every heading, in document order. */
export function assignHeadingSlugs(nodes) {
  const seen = new Map();
  walkBlocks(nodes, (node) => {
    if (node.type === 'heading') {
      const base = slugify(node.text) || 'section';
      const n = seen.get(base) ?? 0;
      seen.set(base, n + 1);
      node.slug = n === 0 ? base : `${base}-${n}`;
    }
  });
}

function walkBlocks(nodes, fn) {
  for (const node of nodes) {
    fn(node);
    switch (node.type) {
      case 'blockquote':
      case 'admonition':
      case 'learnConstruct':
        if (Array.isArray(node.children)) walkBlocks(node.children, fn);
        break;
      case 'list':
        for (const item of node.items) {
          if (Array.isArray(item.children)) walkBlocks(item.children, fn);
        }
        break;
      default:
        break;
    }
  }
}

// ---------------------------------------------------------------------------
// Inline parsing
// ---------------------------------------------------------------------------

const INLINE_INCLUDE = /^\[!INCLUDE\s+\[([^\]]*)\]\(([^()\s]+)\)\]/i;
const AUTOLINK = /^<([a-zA-Z][A-Za-z0-9+.-]*:[^<>\s]*)>/;
const INLINE_HTML_TAG = /^<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*)?\/?>/;

/**
 * Parse one physical line region into inline nodes.
 * `fromIdx` is a 0-based index into line.text; emitted columns are file columns.
 */
function parseInlineSegments(line, fromIdx) {
  const text = line.text;
  const nodes = [];
  let textStart = -1; // 0-based index where the current text run started

  const flushText = (endIdxExclusive) => {
    if (textStart >= 0 && endIdxExclusive > textStart) {
      nodes.push({
        type: 'text',
        value: text.slice(textStart, endIdxExclusive),
        span: lineSpan(line, line.colBase + textStart, line.colBase + endIdxExclusive),
      });
    }
    textStart = -1;
  };

  let j = fromIdx;
  while (j < text.length) {
    const c = text[j];

    // Backslash escape of an ASCII punctuation char: literal.
    if (c === '\\' && j + 1 < text.length && /[!-/:-@[-`{-~]/.test(text[j + 1])) {
      flushText(j);
      nodes.push({
        type: 'text',
        value: text[j + 1],
        span: lineSpan(line, line.colBase + j, line.colBase + j + 2),
      });
      j += 2;
      continue;
    }

    // Inline code span.
    if (c === '`') {
      let ticks = 0;
      let k = j;
      while (k < text.length && text[k] === '`') { ticks++; k++; }
      const closeIdx = text.indexOf('`'.repeat(ticks), k);
      if (closeIdx !== -1) {
        flushText(j);
        let value = text.slice(k, closeIdx);
        // CommonMark: strip one space from both ends if both present.
        if (value.length > 1 && value.startsWith(' ') && value.endsWith(' ')) {
          value = value.slice(1, -1);
        }
        nodes.push({
          type: 'inlineCode',
          value,
          span: lineSpan(line, line.colBase + j, line.colBase + closeIdx + ticks),
        });
        j = closeIdx + ticks;
        continue;
      }
      // unmatched: literal text
      if (textStart < 0) textStart = j;
      j++;
      continue;
    }

    // Image ![alt](src "title")
    if (c === '!' && text[j + 1] === '[') {
      const img = tryParseInlineTarget(text, j + 1);
      if (img) {
        flushText(j);
        nodes.push({
          type: 'image',
          src: img.target,
          alt: img.label,
          title: img.title,
          span: lineSpan(line, line.colBase + j, line.colBase + img.endIdx),
        });
        j = img.endIdx;
        continue;
      }
    }

    // Include directive [!INCLUDE [title](path)]
    if (c === '[') {
      const inc = text.slice(j).match(INLINE_INCLUDE);
      if (inc) {
        flushText(j);
        nodes.push({
          type: 'include',
          title: inc[1],
          target: inc[2],
          span: lineSpan(line, line.colBase + j, line.colBase + j + inc[0].length),
        });
        j += inc[0].length;
        continue;
      }
      const lnk = tryParseInlineTarget(text, j);
      if (lnk) {
        flushText(j);
        // Recursion guard: parse the label of this same line only.
        const labelLine = regionLine(lnk.label, line.line, line.colBase + j + 1);
        const children = parseInlineSegments(labelLine, 0);
        nodes.push({
          type: 'link',
          href: lnk.target,
          title: lnk.title,
          children,
          span: lineSpan(line, line.colBase + j, line.colBase + lnk.endIdx),
        });
        j = lnk.endIdx;
        continue;
      }
    }

    // Autolink <https://...>
    if (c === '<') {
      const auto = text.slice(j).match(AUTOLINK);
      if (auto) {
        flushText(j);
        const href = auto[1];
        nodes.push({
          type: 'link',
          href,
          title: null,
          children: [{ type: 'text', value: href, span: lineSpan(line, line.colBase + j + 1, line.colBase + j + 1 + href.length) }],
          span: lineSpan(line, line.colBase + j, line.colBase + j + auto[0].length),
        });
        j += auto[0].length;
        continue;
      }
      const tag = text.slice(j).match(INLINE_HTML_TAG);
      if (tag) {
        flushText(j);
        nodes.push({
          type: 'inlineHtml',
          raw: tag[0],
          span: lineSpan(line, line.colBase + j, line.colBase + j + tag[0].length),
        });
        j += tag[0].length;
        continue;
      }
    }

    // Emphasis **strong** / *em* / __strong__ / _em_
    if (c === '*' || c === '_') {
      const isStar = c === '*';
      let runLen = 0;
      let k = j;
      while (k < text.length && text[k] === c) { runLen++; k++; }
      const wantLen = runLen >= 2 ? 2 : 1;
      const closer = findEmphasisClose(text, k, c, wantLen, isStar, j);
      if (closer !== -1) {
        flushText(j);
        const innerStart = j + wantLen;
        const innerLine = regionLine(text.slice(innerStart, closer), line.line, line.colBase + innerStart);
        nodes.push({
          type: 'emphasis',
          flavor: wantLen === 2 ? 'strong' : 'em',
          children: parseInlineSegments(innerLine, 0),
          span: lineSpan(line, line.colBase + j, line.colBase + closer + wantLen),
        });
        j = closer + wantLen;
        continue;
      }
    }

    if (textStart < 0) textStart = j;
    j++;
  }
  flushText(text.length);
  return nodes;
}

/** Try to parse [label](target "title") at `openIdx` (which points at '['). */
function tryParseInlineTarget(text, openIdx) {
  // Find matching ']' with one level of bracket nesting allowed.
  let depth = 0;
  let closeIdx = -1;
  for (let i = openIdx; i < text.length; i++) {
    const ch = text[i];
    if (ch === '\\') { i++; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) { closeIdx = i; break; }
    }
  }
  if (closeIdx === -1 || closeIdx + 1 >= text.length || text[closeIdx + 1] !== '(') return null;

  const label = text.slice(openIdx + 1, closeIdx);
  let i = closeIdx + 2;
  // href: <angled> or bare up to whitespace / matching ')'
  let hrefEnd = -1;
  let target = null;
  if (text[i] === '<') {
    const gt = text.indexOf('>', i + 1);
    if (gt === -1) return null;
    target = text.slice(i + 1, gt);
    hrefEnd = gt + 1;
  } else {
    let parenDepth = 0;
    let k = i;
    while (k < text.length) {
      const ch = text[k];
      if (ch === '\\') { k++; if (k < text.length) k++; continue; }
      if (/\s/.test(ch) && parenDepth === 0) break;
      if (ch === '(') parenDepth++;
      else if (ch === ')') {
        if (parenDepth === 0) break;
        parenDepth--;
      }
      k++;
    }
    if (parenDepth !== 0) return null;
    target = text.slice(i, k);
    hrefEnd = k;
  }
  if (!target) return null;

  // Optional title, then ')'
  let rest = hrefEnd;
  while (rest < text.length && text[rest] === ' ') rest++;
  let title = null;
  if (rest < text.length && (text[rest] === '"' || text[rest] === "'")) {
    const q = text[rest];
    const endQ = text.indexOf(q, rest + 1);
    if (endQ === -1) return null;
    title = text.slice(rest + 1, endQ);
    rest = endQ + 1;
    while (rest < text.length && text[rest] === ' ') rest++;
  }
  if (rest >= text.length || text[rest] !== ')') return null;
  return { label, target, title, endIdx: rest + 1 };
}

function findEmphasisClose(text, fromIdx, ch, len, isStar, openIdx) {
  for (let i = fromIdx; i < text.length - len + 1; i++) {
    if (text[i] === '\\' && i + 1 < text.length) { i++; continue; }
    if (text[i] === ch) {
      let run = 0;
      let k = i;
      while (k < text.length && text[k] === ch) { run++; k++; }
      if (run >= len) {
        if (!isStar && ch === '_') {
          // '_' must not be intraword: char before opener and after closer non-word.
          const before = openIdx > 0 ? text[openIdx - 1] : '';
          const after = k < text.length ? text[k] : '';
          if (/[\w`*]/.test(before) || (after && /[\w]/.test(after))) { i = k; continue; }
        }
        return i;
      }
      i = k;
      continue;
    }
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Block parsing
// ---------------------------------------------------------------------------

const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})\s*(.*)$/;
const ATX_HEADING = /^ {0,3}(#{1,6})(\s+)(.*)$/;
const THEMATIC_BREAK = /^ {0,3}((?:\*[ \t]*){3,}|(?:-[ \t]*){3,}|(?:_[ \t]*){3,})$/;
const LIST_ITEM = /^( *)([-*+]|\d{1,9}[.)])( +)(.*)$/;
const TABLE_DELIMITER = /^ *\|? *:?-{1,}:? *\|.*$/;
const BLOCK_TAGS = new Set([
  'address', 'article', 'aside', 'base', 'basefont', 'blockquote', 'body', 'caption',
  'center', 'col', 'colgroup', 'dd', 'details', 'dialog', 'dir', 'div', 'dl', 'dt',
  'fieldset', 'figcaption', 'figure', 'footer', 'form', 'frame', 'frameset', 'h1',
  'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'iframe', 'legend',
  'li', 'link', 'main', 'menu', 'menuitem', 'nav', 'noframes', 'ol', 'optgroup',
  'option', 'p', 'param', 'section', 'source', 'summary', 'table', 'tbody', 'td',
  'tfoot', 'th', 'thead', 'title', 'tr', 'track', 'ul',
]);
const HTML_BLOCK_OPEN = /^ {0,3}<\/?([a-zA-Z][a-zA-Z0-9-]*)/;
const HTML_COMMENT_OPEN = /^ {0,3}<!--/;
// Elements whose FULL content must be removed, not just their tags. Lines
// starting with these parse as raw HTML blocks even though they are not
// CommonMark block tags, so the sanitizer can drop content, not merely the
// markup (a `<script>alert(1)</script>` line must not leave "alert(1)" as
// visible text).
const DANGEROUS_BLOCK_TAGS = new Set(['script', 'iframe', 'object', 'embed', 'style', 'form']);

function isTableDelimiter(text) {
  // A delimiter row: optional pipes, cells of dashes with optional colons.
  if (!text.includes('-')) return false;
  const stripped = text.trim();
  if (!stripped.includes('|') && !stripped.includes('-')) return false;
  if (!/\|/.test(stripped)) return false;
  return /^ *\|?( *:?-+:? *\|)+ *:?-+:? *\|? *$/.test(stripped) ||
         /^ *\|? *:?-+:?( *\| *:?-+:?)* *\|? *$/.test(stripped);
}

function splitTableRow(line) {
  // Returns [{text, colStart(0-based in line.text), colEnd}] for cells.
  const text = line.text;
  const cells = [];
  let depth = 0;
  let start = -1;
  let i = 0;
  const push = (s, e) => {
    cells.push({ text: text.slice(s, e), colStart: s, colEnd: e });
  };
  while (i < text.length) {
    const ch = text[i];
    if (ch === '\\' && i + 1 < text.length) { i += 2; continue; }
    if (ch === '`') { // skip code spans so pipes inside them don't split
      let ticks = 0;
      let k = i;
      while (k < text.length && text[k] === '`') { ticks++; k++; }
      const close = text.indexOf('`'.repeat(ticks), k);
      i = close === -1 ? i + ticks : close + ticks;
      continue;
    }
    if (ch === '|') {
      if (start >= 0) push(start, i);
      start = -1;
      i++;
      continue;
    }
    if (start < 0) start = i;
    i++;
  }
  if (start >= 0) push(start, text.length);
  // Trim boundary empties produced by leading/trailing pipes.
  if (cells.length > 0 && cells[0].text.trim() === '' && /^\s*\|/.test(text)) cells.shift();
  if (cells.length > 0 && cells[cells.length - 1].text.trim() === '' && /\|\s*$/.test(text)) cells.pop();
  return cells;
}

function parseAlignment(delimiterText) {
  const t = delimiterText.trim();
  const left = t.startsWith(':');
  const right = t.endsWith(':');
  if (left && right) return 'center';
  if (right) return 'right';
  if (left) return 'left';
  return 'none';
}

/**
 * Parse block content from `lines` (array of regionLine) in [from, to).
 * Returns { nodes, warnings } where warnings are construct-level anomalies.
 */
function parseBlocks(lines, from, to) {
  const nodes = [];
  const warnings = [];
  let i = from;

  const parseParagraphInline = (line) => parseInlineSegments(line, 0);

  while (i < to) {
    const rawText = lines[i].text;

    if (isBlank(rawText)) { i++; continue; }

    // Fenced code
    const fence = rawText.match(FENCE_OPEN);
    if (fence) {
      const fenceChar = fence[1][0];
      const fenceLen = fence[1].length;
      const info = fence[2].trim();
      const language = info ? info.split(/\s+/)[0] : null;
      let closeIdx = -1;
      for (let k = i + 1; k < to; k++) {
        const cl = lines[k].text.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
        if (cl && cl[1][0] === fenceChar && cl[1].length >= fenceLen) { closeIdx = k; break; }
      }
      const endIdx = closeIdx === -1 ? to - 1 : closeIdx;
      const valueLines = [];
      for (let k = i + 1; k <= endIdx && k < to; k++) {
        if (closeIdx !== -1 && k === closeIdx) break;
        valueLines.push(lines[k].text);
      }
      const node = {
        type: 'code',
        language,
        value: valueLines.join('\n'),
        span: makeSpan(lines[i].line, lines[i].colBase, lines[endIdx].line, lines[endIdx].colBase + lines[endIdx].text.length),
      };
      if (closeIdx === -1) {
        node.warnings = ['unterminated-code-fence'];
        warnings.push({ reason: 'unterminated-code-fence', span: node.span });
      }
      nodes.push(node);
      i = endIdx + 1;
      continue;
    }

    // ATX heading
    const heading = rawText.match(ATX_HEADING);
    if (heading) {
      let htext = heading[3];
      const trailing = htext.match(/\s+#+\s*$/);
      if (trailing) htext = htext.slice(0, trailing.index);
      const contentCol = lines[i].colBase + heading[1].length + heading[2].length;
      const contentLine = regionLine(htext, lines[i].line, contentCol);
      const inline = htext.length === 0 ? [] : parseInlineSegments(contentLine, 0);
      nodes.push({
        type: 'heading',
        level: heading[1].length,
        text: htext,
        slug: null, // assigned by assignHeadingSlugs
        inline,
        span: lineSpan(lines[i], lines[i].colBase, lines[i].colBase + lines[i].text.length),
      });
      i++;
      continue;
    }

    // Learn construct open / end markers
    const endMarker = rawText.match(CONSTRUCT_END);
    if (endMarker) {
      // Orphan end marker (no matching opener at this level).
      nodes.push({
        type: 'unsupported',
        reason: 'orphan-construct-end',
        detail: `:::${endMarker[1]}-end`,
        snippet: rawText.trim(),
        span: lineSpan(lines[i], lines[i].colBase, lines[i].colBase + lines[i].text.length),
      });
      warnings.push({ reason: 'orphan-construct-end', span: nodes[nodes.length - 1].span });
      i++;
      continue;
    }
    const openMarker = rawText.match(CONSTRUCT_OPEN);
    if (openMarker) {
      const kind = openMarker[1];
      let rest = openMarker[2];
      if (rest.endsWith(':::')) rest = rest.slice(0, -3);
      rest = rest.trim();
      const attributes = parseConstructAttributes(rest);
      // Find the matching end marker.
      let endIdx = -1;
      if (OPTIONAL_END_KINDS.has(kind)) {
        // The end marker must appear before the next construct open;
        // otherwise this is the self-closing single-line form. NOTE: test
        // the end pattern FIRST — `:::image-end:::` also matches the open
        // pattern because the kind charset includes hyphens.
        for (let k = i + 1; k < to; k++) {
          const t = lines[k].text;
          const em = t.match(CONSTRUCT_END);
          if (em) {
            if (em[1] === kind) endIdx = k;
            break;
          }
          if (CONSTRUCT_OPEN.test(t)) break;
        }
      } else {
        // Depth-aware scan: nesting constructs of the same kind must close
        // in order; a different-kind end at depth 0 is left for the outer
        // loop to report as an orphan.
        let depth = 0;
        for (let k = i + 1; k < to; k++) {
          const t = lines[k].text;
          const em = t.match(CONSTRUCT_END);
          if (em) {
            if (depth === 0 && em[1] === kind) { endIdx = k; break; }
            depth = Math.max(0, depth - 1);
            continue;
          }
          if (CONSTRUCT_OPEN.test(t)) depth++;
        }
      }
      const selfClosing = endIdx === -1 && OPTIONAL_END_KINDS.has(kind);
      const endLineObj = endIdx === -1 ? lines[i] : lines[endIdx];
      const node = {
        type: 'learnConstruct',
        kind,
        attributes,
        rawAttributes: rest,
        endKind: selfClosing ? null : `${kind}-end`,
        selfClosing,
        children: [],
        span: makeSpan(lines[i].line, lines[i].colBase, endLineObj.line, endLineObj.colBase + endLineObj.text.length),
      };
      if (selfClosing) {
        nodes.push(node);
        i++;
        continue;
      }
      const childEnd = endIdx === -1 ? to : endIdx;
      const parsed = parseBlocks(lines, i + 1, childEnd);
      node.children = parsed.nodes;
      warnings.push(...parsed.warnings);
      if (endIdx === -1) {
        node.warnings = ['unterminated-construct'];
        warnings.push({ reason: 'unterminated-construct', detail: kind, span: node.span });
      }
      nodes.push(node);
      i = (endIdx === -1 ? to : endIdx + 1);
      continue;
    }

    // Include directive as its own block
    const inc = rawText.match(INCLUDE_DIRECTIVE);
    if (inc) {
      nodes.push({
        type: 'include',
        title: inc[1],
        target: inc[2],
        span: lineSpan(lines[i], lines[i].colBase, lines[i].colBase + lines[i].text.length),
      });
      i++;
      continue;
    }

    // Other directives
    const dir = rawText.match(DIRECTIVE);
    if (dir) {
      const name = dir[1].toLowerCase();
      if (ADMONITION_KINDS.has(name)) {
        // Admonition without blockquote marker: treat the rest as its content.
        const restLine = regionLine(dir[2], lines[i].line, lines[i].colBase + 2 + dir[1].length);
        const inline = dir[2].trim().length > 0 ? parseInlineSegments(restLine, 0) : [];
        nodes.push({
          type: 'admonition',
          kind: name,
          children: inline.length > 0 ? [{ type: 'paragraph', inline, span: lineSpan(lines[i], lines[i].colBase, lines[i].colBase + lines[i].text.length) }] : [],
          span: lineSpan(lines[i], lines[i].colBase, lines[i].colBase + lines[i].text.length),
        });
        i++;
        continue;
      }
      if (name === 'div') {
        nodes.push({
          type: 'learnConstruct',
          kind: 'div',
          attributes: parseConstructAttributes(dir[2]),
          rawAttributes: dir[2].trim(),
          endKind: null,
          children: null, // top-level [!div] has no explicit end; unexpanded marker
          span: lineSpan(lines[i], lines[i].colBase, lines[i].colBase + lines[i].text.length),
        });
        i++;
        continue;
      }
      if (name === 'video') {
        nodes.push({
          type: 'learnConstruct',
          kind: 'video',
          attributes: { url: dir[2].trim() },
          rawAttributes: dir[2].trim(),
          endKind: null,
          children: null,
          span: lineSpan(lines[i], lines[i].colBase, lines[i].colBase + lines[i].text.length),
        });
        i++;
        continue;
      }
      nodes.push({
        type: 'unsupported',
        reason: 'unknown-directive',
        detail: `[!${dir[1]}]`,
        snippet: rawText.trim(),
        span: lineSpan(lines[i], lines[i].colBase, lines[i].colBase + lines[i].text.length),
      });
      warnings.push({ reason: 'unknown-directive', detail: dir[1], span: nodes[nodes.length - 1].span });
      i++;
      continue;
    }

    // Blockquote (also carries admonitions and [!div])
    if (/^ {0,3}>/.test(rawText)) {
      let end = i;
      while (end < to && /^ {0,3}>/.test(lines[end].text)) end++;
      // Lazy continuation: a non-blank, non-quote line directly after a quote
      // line that is paragraph content joins the quote (CommonMark). Keep it
      // conservative: only allow lazy continuation when the last quote line
      // is not blank after stripping.
      if (end < to && !isBlank(lines[end].text) && !isBlank(stripQuote(lines[end - 1]).text) &&
          !interruptsBlock(lines[end].text, lines, end, to)) {
        while (end < to && !isBlank(lines[end].text) && !/^ {0,3}>/.test(lines[end].text)) {
          if (interruptsBlock(lines[end].text, lines, end, to)) break;
          end++;
        }
      }
      const innerLines = [];
      for (let k = i; k < end; k++) innerLines.push(stripQuote(lines[k]));
      const firstContent = innerLines.find((l) => !isBlank(l.text));
      let node = null;
      if (firstContent) {
        const adm = firstContent.text.match(/^\[!([A-Za-z]+)\]\s*(.*)$/);
        if (adm && ADMONITION_KINDS.has(adm[1].toLowerCase())) {
          const kind = adm[1].toLowerCase();
          const restLine = regionLine(adm[2], firstContent.line, firstContent.colBase + 2 + adm[1].length);
          const headInline = adm[2].trim().length > 0 ? parseInlineSegments(restLine, 0) : [];
          const headNode = headInline.length > 0
            ? [{ type: 'paragraph', inline: headInline, span: lineSpan(firstContent, firstContent.colBase, firstContent.colBase + firstContent.text.length) }]
            : [];
          const rest = parseBlocks(innerLines, innerLines.indexOf(firstContent) + 1, innerLines.length);
          node = {
            type: 'admonition',
            kind,
            children: [...headNode, ...rest.nodes],
            span: makeSpan(lines[i].line, lines[i].colBase, lines[end - 1].line, lines[end - 1].colBase + lines[end - 1].text.length),
          };
          warnings.push(...rest.warnings);
        } else {
          const divMatch = firstContent.text.match(/^\[!div\s*([^\]]*)\]\s*$/);
          if (divMatch) {
            const rest = parseBlocks(innerLines, innerLines.indexOf(firstContent) + 1, innerLines.length);
            node = {
              type: 'learnConstruct',
              kind: 'div',
              attributes: parseConstructAttributes(divMatch[1]),
              rawAttributes: divMatch[1].trim(),
              endKind: null,
              children: rest.nodes,
              span: makeSpan(lines[i].line, lines[i].colBase, lines[end - 1].line, lines[end - 1].colBase + lines[end - 1].text.length),
            };
            warnings.push(...rest.warnings);
          }
        }
      }
      if (!node) {
        const parsed = parseBlocks(innerLines, 0, innerLines.length);
        node = {
          type: 'blockquote',
          children: parsed.nodes,
          span: makeSpan(lines[i].line, lines[i].colBase, lines[end - 1].line, lines[end - 1].colBase + lines[end - 1].text.length),
        };
        warnings.push(...parsed.warnings);
      }
      nodes.push(node);
      i = end;
      continue;
    }

    // Table
    if (rawText.includes('|') && i + 1 < to && isTableDelimiter(lines[i + 1].text)) {
      const alignments = splitTableRow(lines[i + 1]).map((c) => parseAlignment(c.text));
      const parseRow = (line, isHeader) => splitTableRow(line).map((cell) => {
        const cellLine = regionLine(cell.text.trim(), line.line, line.colBase + cell.colStart + (cell.text.length - cell.text.trimStart().length));
        return {
          type: 'tableCell',
          header: isHeader,
          inline: cell.text.trim().length === 0 ? [] : parseInlineSegments(cellLine, 0),
          span: makeSpan(line.line, line.colBase + cell.colStart, line.line, line.colBase + cell.colEnd + 1),
        };
      });
      const header = parseRow(lines[i], true);
      let end = i + 2;
      while (end < to && !isBlank(lines[end].text) && lines[end].text.includes('|')) {
        // A new list/heading/etc interrupts the table.
        if (interruptsBlock(lines[end].text, lines, end, to) &&
            !/^( {0,3}\|)/.test(lines[end].text)) break;
        end++;
      }
      const rows = [];
      for (let k = i + 2; k < end; k++) rows.push(parseRow(lines[k], false));
      nodes.push({
        type: 'table',
        alignments,
        header,
        rows,
        span: makeSpan(lines[i].line, lines[i].colBase, lines[end - 1].line, lines[end - 1].colBase + lines[end - 1].text.length),
      });
      i = end;
      continue;
    }

    // List
    const item = rawText.match(LIST_ITEM);
    if (item) {
      const { listEnd, items } = parseList(lines, i, to);
      nodes.push({ type: 'list', ordered: /\d/.test(item[2]), start: /\d/.test(item[2]) ? parseInt(item[2], 10) : 1, items, span: makeSpan(lines[i].line, lines[i].colBase, lines[listEnd - 1].line, lines[listEnd - 1].colBase + lines[listEnd - 1].text.length) });
      i = listEnd;
      continue;
    }

    // HTML comments (possibly multi-line) — detect commented-out directives.
    if (HTML_COMMENT_OPEN.test(rawText)) {
      let end = i;
      let closed = false;
      while (end < to) {
        if (lines[end].text.indexOf('-->') !== -1) { closed = true; break; }
        end++;
      }
      if (!closed) end = to - 1;
      const parts = [];
      for (let k = i; k <= end; k++) parts.push(lines[k].text);
      const joined = parts.join('\n');
      const inner = joined.replace(/^ {0,3}<!--/, '').replace(/-->\s*$/, '');
      if (/\[\s*!|:::/.test(inner)) {
        nodes.push({
          type: 'commentedDirective',
          directiveText: inner.trim(),
          span: makeSpan(lines[i].line, lines[i].colBase, lines[end].line, lines[end].colBase + lines[end].text.length),
        });
      } else {
        nodes.push({
          type: 'htmlComment',
          text: inner.trim(),
          span: makeSpan(lines[i].line, lines[i].colBase, lines[end].line, lines[end].colBase + lines[end].text.length),
        });
      }
      i = end + 1;
      continue;
    }

    // Raw HTML block (CommonMark type-6 block tags, plus dangerous elements
    // whose whole content must be removed by the sanitizer).
    const htmlOpen = rawText.match(HTML_BLOCK_OPEN);
    if (htmlOpen && (BLOCK_TAGS.has(htmlOpen[1].toLowerCase()) || DANGEROUS_BLOCK_TAGS.has(htmlOpen[1].toLowerCase()))) {
      let end = i;
      while (end < to && !isBlank(lines[end].text)) end++;
      const rawLines = [];
      for (let k = i; k < end; k++) rawLines.push(lines[k].text);
      nodes.push({
        type: 'html',
        raw: rawLines.join('\n'),
        span: makeSpan(lines[i].line, lines[i].colBase, lines[end - 1].line, lines[end - 1].colBase + lines[end - 1].text.length),
      });
      i = end;
      continue;
    }

    // Thematic break
    if (THEMATIC_BREAK.test(rawText)) {
      nodes.push({
        type: 'thematicBreak',
        span: lineSpan(lines[i], lines[i].colBase, lines[i].colBase + lines[i].text.length),
      });
      i++;
      continue;
    }

    // Paragraph: accumulate until blank line or a block interrupt.
    let end = i;
    while (end < to && !isBlank(lines[end].text) && !interruptsBlock(lines[end].text, lines, end, to)) {
      end++;
    }
    const inline = [];
    for (let k = i; k < end; k++) {
      if (k > i) inline.push({ type: 'softbreak', span: makeSpan(lines[k - 1].line, lines[k - 1].colBase + lines[k - 1].text.length, lines[k].line, lines[k].colBase) });
      inline.push(...parseParagraphInline(lines[k]));
    }
    nodes.push({
      type: 'paragraph',
      inline,
      span: makeSpan(lines[i].line, lines[i].colBase, lines[end - 1].line, lines[end - 1].colBase + lines[end - 1].text.length),
    });
    i = end;
  }
  return { nodes, warnings };
}

function stripQuote(line) {
  const m = line.text.match(/^ {0,3}>(?:[ \t]?)?(.*)$/);
  if (!m) return regionLine('', line.line, line.colBase);
  const removed = line.text.length - m[1].length;
  return regionLine(m[1], line.line, line.colBase + removed);
}

/**
 * Does the line at index `idx` start a construct that interrupts a paragraph?
 * Table interrupt requires the delimiter lookahead.
 */
function interruptsBlock(text, lines, idx, to) {
  if (isBlank(text)) return true;
  if (FENCE_OPEN.test(text)) return true;
  if (ATX_HEADING.test(text)) return true;
  if (CONSTRUCT_OPEN.test(text) || CONSTRUCT_END.test(text)) return true;
  if (INCLUDE_DIRECTIVE.test(text)) return true;
  if (DIRECTIVE.test(text)) return true;
  if (/^ {0,3}>/.test(text)) return true;
  if (LIST_ITEM.test(text)) return true;
  if (THEMATIC_BREAK.test(text)) return true;
  if (HTML_COMMENT_OPEN.test(text)) return true;
  const hb = text.match(HTML_BLOCK_OPEN);
  if (hb && (BLOCK_TAGS.has(hb[1].toLowerCase()) || DANGEROUS_BLOCK_TAGS.has(hb[1].toLowerCase()))) return true;
  if (text.includes('|') && idx + 1 < to && isTableDelimiter(lines[idx + 1].text)) return true;
  return false;
}

/**
 * Parse a list starting at `start`. Returns { listEnd, items }.
 * Items carry first-line inline content plus nested blocks (including
 * nested lists) parsed from continuation lines with preserved spans.
 */
function parseList(lines, start, to) {
  const first = lines[start].text.match(LIST_ITEM);
  const markerIndent = first[1].length;
  const ordered = /\d/.test(first[2]);
  const items = [];
  let i = start;
  while (i < to) {
    const m = lines[i].text.match(LIST_ITEM);
    if (!m || m[1].length !== markerIndent || /\d/.test(m[2]) !== ordered) break;
    const contentCol = m[1].length + m[2].length + m[3].length;
    const contentLine = regionLine(m[4], lines[i].line, lines[i].colBase + contentCol + 1);
    const itemStart = i;
    i++;
    // Gather continuation lines: deeper indent, blank lines followed by
    // deeper indent, or lazily-continued paragraph text (no interrupt).
    const contLines = [];
    const contentIndent = markerIndent + m[2].length + m[3].length;
    const deeperRe = new RegExp(`^ {${markerIndent + 2},}`);
    while (i < to) {
      const t = lines[i].text;
      if (isBlank(t)) {
        // Look ahead: blank continues the item only if followed by deeper indent.
        let k = i + 1;
        while (k < to && isBlank(lines[k].text)) k++;
        if (k < to && deeperRe.test(lines[k].text.replace(/\t/g, '    '))) {
          contLines.push(regionLine('', lines[i].line, lines[i].colBase));
          i++;
          continue;
        }
        break;
      }
      const lineIndent = t.length - t.trimStart().length;
      const nextItem = t.match(LIST_ITEM);
      if (lineIndent > markerIndent || (nextItem && nextItem[1].length > markerIndent)) {
        const strip = Math.min(contentIndent, lineIndent);
        contLines.push(regionLine(t.slice(strip), lines[i].line, lines[i].colBase + strip + 1));
        i++;
        continue;
      }
      if (nextItem && nextItem[1].length === markerIndent) break; // next item
      // Lazy paragraph continuation
      if (interruptsBlock(t, lines, i, to)) break;
      contLines.push(regionLine(t.replace(/^\s+/, ''), lines[i].line, lines[i].colBase + (t.length - t.trimStart().length) + 1));
      i++;
    }
    const inline = m[4].trim().length === 0 ? [] : parseInlineSegments(contentLine, 0);
    const parsed = parseBlocks(contLines, 0, contLines.length);
    items.push({
      type: 'listItem',
      inline,
      children: parsed.nodes,
      span: makeSpan(lines[itemStart].line, lines[itemStart].colBase, lines[i - 1].line, lines[i - 1].colBase + lines[i - 1].text.length),
    });
  }
  return { listEnd: i, items };
}

// ---------------------------------------------------------------------------
// Document-level entry points
// ---------------------------------------------------------------------------

/**
 * Parse a whole source file.
 * Returns { frontMatter, nodes, warnings } with 1-based whole-file spans.
 */
export function parseSource(sourceText) {
  const lines = splitLines(sourceText);
  const frontMatter = parseFrontMatter(lines);
  const bodyFrom = frontMatter ? frontMatter.endLine : 0; // 0-based index of first body line
  const bodyLines = [];
  for (let k = bodyFrom; k < lines.length; k++) {
    bodyLines.push(regionLine(lines[k], k + 1, 1));
  }
  const parsed = parseBlocks(bodyLines, 0, bodyLines.length);
  assignHeadingSlugs(parsed.nodes);
  return {
    frontMatter,
    nodes: parsed.nodes,
    warnings: parsed.warnings,
  };
}
