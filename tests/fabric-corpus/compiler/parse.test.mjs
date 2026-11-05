// Parser tests: spans, slugs, front matter, tables, code, lists, Learn constructs.
import test from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parseSource, slugify, splitLines } from '../../../tools/fabric-corpus/compiler/parse.mjs';
import { FIXTURE_CORPUS } from './helpers.mjs';

const readFixture = (name) => readFileSync(join(FIXTURE_CORPUS, 'docs', name), 'utf8');

test('splitLines handles CRLF and LF', () => {
  assert.deepStrictEqual(splitLines('a\r\nb\nc\rd'), ['a', 'b', 'c', 'd']);
});

test('slugify follows GitHub-flavored rules', () => {
  assert.strictEqual(slugify("What's new?"), 'whats-new');
  assert.strictEqual(slugify('Deep_Dive-Topic (2026)'), 'deep_dive-topic-2026');
  // Every whitespace char maps to one hyphen (no collapsing), like github-slugger.
  assert.strictEqual(slugify('Multi   spaces here'), 'multi---spaces-here');
  assert.strictEqual(slugify('  Trimmed — and kept  '), 'trimmed--and-kept');
});

test('front matter: unknown keys preserved, hash-comment lines recorded', () => {
  const parsed = parseSource(readFixture('front-matter-unknown-keys.md'));
  // parseSource returns the raw front-matter object; `present` is added at
  // artifact build time (emit.mjs).
  assert.ok(parsed.frontMatter, 'front matter block detected');
  // Unknown keys survive (not dropped by an allowlist).
  assert.strictEqual(parsed.frontMatter.data['ms.custom'], 'keep-me-please');
  assert.deepStrictEqual(parsed.frontMatter.data['no-loc'], ['Copilot', 'Fabric']);
  assert.strictEqual(parsed.frontMatter.data.experimental_flag, true);
  assert.strictEqual(parsed.frontMatter.data.max_rows, 42);
  // YAML treats the '#customer intent' line as a comment; it must be preserved verbatim.
  assert.deepStrictEqual(parsed.frontMatter.comments, [
    '#customer intent: As a learner I want unknown front-matter keys preserved.',
  ]);
  assert.strictEqual(parsed.frontMatter.span.end.line, 8);
});

test('fixture headings: slugs, dedup and exact spans', () => {
  const parsed = parseSource(readFixture('headings-anchors.md'));
  const headings = parsed.nodes.filter((n) => n.type === 'heading');
  assert.deepStrictEqual(headings.map((h) => [h.level, h.slug]), [
    [1, 'alpha-plan'],
    [2, 'whats-new'],
    [2, 'whats-new-1'],
    [3, 'deep_dive-topic-2026'],
    [2, 'multi---spaces-here'],
  ]);
  // Line 6: "# Alpha plan" -> cols 1..12, exclusive end 13.
  assert.deepStrictEqual(headings[0].span, {
    start: { line: 6, column: 1 },
    end: { line: 6, column: 13 },
  });
  assert.deepStrictEqual(headings[0].inline[0].span, {
    start: { line: 6, column: 3 },
    end: { line: 6, column: 13 },
  });
  // Line 12: "### Deep_Dive-Topic (2026)" -> 26 chars, exclusive end 27.
  assert.deepStrictEqual(headings[3].span.end, { line: 12, column: 27 });
});

test('table: alignment, header/rows, cell spans', () => {
  const parsed = parseSource(readFixture('tables-code.md'));
  const table = parsed.nodes.find((n) => n.type === 'table');
  assert.ok(table, 'table parsed');
  assert.deepStrictEqual(table.alignments, ['left', 'center', 'right']);
  assert.strictEqual(table.header.length, 3);
  assert.strictEqual(table.rows.length, 2);
  assert.strictEqual(table.header[0].inline[0].value, 'Column A');
  assert.deepStrictEqual(table.rows[0].map((c) => c.inline[0].value), ['left', 'center', 'right']);
  // Table spans lines 4..7 (front matter occupies 1..4... check actual span lines)
  assert.strictEqual(table.span.start.line, table.header[0].span.start.line);
});

test('code fences: language detection and exact value ranges', () => {
  const parsed = parseSource(readFixture('tables-code.md'));
  const codes = parsed.nodes.filter((n) => n.type === 'code');
  assert.strictEqual(codes.length, 2);
  assert.strictEqual(codes[0].language, 'ts');
  assert.strictEqual(codes[0].value, 'export const answer = 42;');
  assert.strictEqual(codes[1].language, null);
  assert.strictEqual(codes[1].value, 'no language fence');
  // Code span covers open fence through closing fence.
  assert.ok(codes[0].span.end.line > codes[0].span.start.line);
});

test('inline parsing: links, images, code, include directives with spans', () => {
  const src = [
    'Para with [a link](x.md) and ![alt](img.png "T") and `c` and',
    '[!INCLUDE [frag](includes/f.md)] end.',
  ].join('\n');
  const parsed = parseSource(src);
  const para = parsed.nodes[0];
  assert.strictEqual(para.type, 'paragraph');
  const kinds = para.inline.map((n) => n.type);
  assert.deepStrictEqual(kinds, ['text', 'link', 'text', 'image', 'text', 'inlineCode', 'text', 'softbreak', 'include', 'text']);
  const link = para.inline[1];
  assert.strictEqual(link.href, 'x.md');
  assert.strictEqual(link.children[0].value, 'a link');
  // "Para with " is 10 chars; the link occupies cols 11..24 (exclusive end 25).
  assert.deepStrictEqual(link.span, { start: { line: 1, column: 11 }, end: { line: 1, column: 25 } });
  const image = para.inline[3];
  assert.strictEqual(image.src, 'img.png');
  assert.strictEqual(image.alt, 'alt');
  assert.strictEqual(image.title, 'T');
  // Include on line 2 starts at column 1.
  const inc = para.inline[8];
  assert.strictEqual(inc.target, 'includes/f.md');
  assert.strictEqual(inc.span.start.line, 2);
  assert.strictEqual(inc.span.start.column, 1);
});

test('admonition and blockquote with nested content', () => {
  const src = '> [!WARNING]\n> Careful **now**.\n>\n> second paragraph\n';
  const parsed = parseSource(src);
  const adm = parsed.nodes.find((n) => n.type === 'admonition');
  assert.strictEqual(adm.kind, 'warning');
  const para = adm.children.find((n) => n.type === 'paragraph');
  const strong = para.inline.find((n) => n.type === 'emphasis');
  assert.strictEqual(strong.flavor, 'strong');
  assert.strictEqual(strong.children[0].value, 'now');
});

test('lists: nested list inside item, loose item with paragraph', () => {
  const src = [
    '- top one',
    '- top two',
    '  - nested a',
    '  - nested b',
    '',
    '  continuation paragraph',
  ].join('\n');
  const parsed = parseSource(src);
  const list = parsed.nodes.find((n) => n.type === 'list');
  assert.strictEqual(list.items.length, 2);
  assert.strictEqual(list.items[0].inline[0].value, 'top one');
  const nested = list.items[1].children.find((n) => n.type === 'list');
  assert.ok(nested, 'nested list inside item two');
  assert.strictEqual(nested.items.length, 2);
  const cont = list.items[1].children.find((n) => n.type === 'paragraph');
  assert.strictEqual(cont.inline[0].value, 'continuation paragraph');
});

test('ordered list start value', () => {
  const parsed = parseSource('3. third\n4. fourth\n');
  const list = parsed.nodes.find((n) => n.type === 'list');
  assert.strictEqual(list.ordered, true);
  assert.strictEqual(list.start, 3);
});

test('zone and tab constructs: nesting, attributes, children', () => {
  const parsed = parseSource(readFixture('zone-tab.md'));
  const zones = parsed.nodes.filter((n) => n.type === 'learnConstruct' && n.kind === 'zone');
  assert.strictEqual(zones.length, 2);
  assert.strictEqual(zones[0].attributes.pivot, 'basic-features');
  const tab = zones[0].children.find((n) => n.type === 'learnConstruct' && n.kind === 'tab');
  assert.ok(tab, 'tab nested inside zone');
  assert.strictEqual(tab.children[0].type, 'paragraph');
  assert.strictEqual(zones[1].attributes.pivot, 'extended-features');
});

test('image directive: attributes and end marker', () => {
  const parsed = parseSource(readFixture('image-alt.md'));
  const img = parsed.nodes.find((n) => n.type === 'learnConstruct' && n.kind === 'image');
  assert.ok(img);
  assert.strictEqual(img.attributes.type, 'content');
  assert.strictEqual(img.attributes.source, 'media/blue-circle.png');
  assert.strictEqual(img.attributes['alt-text'], 'A blue circle diagram.');
  assert.strictEqual(img.attributes.lightbox, 'media/blue-circle.png');
  assert.strictEqual(img.children[0].type, 'paragraph');
});

test('commented directives detected; ordinary comments preserved as htmlComment', () => {
  const parsed = parseSource(readFixture('commented-directive.md'));
  const commented = parsed.nodes.filter((n) => n.type === 'commentedDirective');
  assert.strictEqual(commented.length, 2);
  assert.ok(commented[0].directiveText.includes('[!INCLUDE [ghost include]'));
  assert.ok(commented[1].directiveText.includes('::: zone pivot="ghost"'));
  const comment = parsed.nodes.find((n) => n.type === 'htmlComment');
  assert.ok(comment, 'ordinary comment preserved');
  assert.ok(comment.text.includes('ordinary comment'));
});

test('script line parses as raw html block so content can be removed wholly', () => {
  const parsed = parseSource("<p>ok</p>\n\n<script>alert(1)</script>\n");
  const html = parsed.nodes.filter((n) => n.type === 'html');
  assert.strictEqual(html.length, 2);
  assert.strictEqual(html[1].raw, '<script>alert(1)</script>');
});

test('span accuracy spot check: deep columns in a paragraph line', () => {
  const src = 'Intro [deep link](a/b/c.md#frag) tail.';
  const parsed = parseSource(src);
  const link = parsed.nodes[0].inline.find((n) => n.type === 'link');
  // "Intro " is 6 chars, so the link starts at column 7 and is 26 chars long.
  assert.strictEqual(link.span.start.column, 7);
  assert.strictEqual(link.span.end.column, 33);
});
