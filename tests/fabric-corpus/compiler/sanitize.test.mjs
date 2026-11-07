// Sanitizer tests: URL scheme allowlist, raw HTML removal, logging.
import test from 'node:test';
import { strict as assert } from 'node:assert';

import { sanitizeHref, sanitizeHtmlRaw, sanitizeDocument } from '../../../tools/fabric-corpus/compiler/sanitize.mjs';
import { parseSource } from '../../../tools/fabric-corpus/compiler/parse.mjs';
import { sha256Text } from '../../../tools/fabric-corpus/compiler/emit.mjs';

test('URL allowlist: allowed schemes and shapes', () => {
  for (const href of [
    'https://example.com', 'http://example.com', 'mailto:a@b.example',
    'relative.md', './rel.png', '../up/x.md', '/site/root', '#frag',
    'data:image/png;base64,AAAA', 'data:image/jpeg,x',
  ]) {
    assert.strictEqual(sanitizeHref(href).action, 'allow', href);
  }
});

test('URL allowlist: dangerous schemes neutralized', () => {
  for (const href of [
    'javascript:alert(1)', 'vbscript:msgbox', 'JaVaScRiPt:alert(1)',
    'data:text/html,<script>', 'data:image/svg+xml,<svg onload=alert(1)>',
    'file:///C:/x', 'ftp://x', 'about:blank', 'chrome://settings',
  ]) {
    assert.strictEqual(sanitizeHref(href).action, 'neutralize', href);
  }
  assert.strictEqual(sanitizeHref('javascript:alert(1)').reason, 'disallowed-scheme:javascript');
  assert.strictEqual(sanitizeHref('data:text/html,<b>').reason, 'data-url-not-safe-image');
});

test('URL allowlist: whitespace/control-char and entity colon evasion caught', () => {
  assert.strictEqual(sanitizeHref('java\tscript:alert(1)').action, 'neutralize');
  assert.strictEqual(sanitizeHref('java\nscript:alert(1)').action, 'neutralize');
  assert.strictEqual(sanitizeHref(' javascript:alert(1)').action, 'neutralize');
  assert.strictEqual(sanitizeHref('java&#115;cript:alert(2)').action, 'neutralize');
  assert.strictEqual(sanitizeHref('java&colon;alert(2)').action, 'neutralize');
});

test('sanitizeHtmlRaw removes dangerous elements with content and logs them', () => {
  const { html, changed, emptied, log } = sanitizeHtmlRaw("<p>keep</p><script>var x = '</b>';</script><p>tail</p>");
  assert.strictEqual(html, '<p>keep</p><p>tail</p>');
  assert.strictEqual(changed, true);
  assert.strictEqual(emptied, false);
  const scriptLog = log.find((l) => l.detail === '<script> block');
  assert.ok(scriptLog);
  assert.strictEqual(scriptLog.sha256, sha256Text("<script>var x = '</b>';</script>"));
});

test('sanitizeHtmlRaw strips on* attributes and disallowed url attributes, keeps benign', () => {
  const { html, log } = sanitizeHtmlRaw('<div onclick="x()" onmouseover=\'y()\' class="ok">t</div>');
  assert.strictEqual(html, '<div class="ok">t</div>');
  assert.strictEqual(log.filter((l) => l.action === 'attribute-removed').length, 2);

  const { html: html2 } = sanitizeHtmlRaw('<a href="javascript:x()" title="t">y</a>');
  assert.strictEqual(html2, '<a title="t">y</a>');

  const benign = sanitizeHtmlRaw('<p class="x">hello <b>world</b> &amp; more</p>');
  assert.strictEqual(benign.changed, false);
  assert.strictEqual(benign.html, '<p class="x">hello <b>world</b> &amp; more</p>');
});

test('sanitizeHtmlRaw: data:image src allowed, data:text/html removed', () => {
  const ok = sanitizeHtmlRaw('<img src="data:image/png;base64,AA">');
  assert.strictEqual(ok.changed, false);
  const bad = sanitizeHtmlRaw('<img src="data:text/html,x">');
  assert.strictEqual(bad.changed, true);
  assert.strictEqual(bad.log[0].action, 'url-attribute-removed');
});

test('sanitizeDocument neutralizes link hrefs, keeps text, logs receipt entry', () => {
  const parsed = parseSource('See [the thing](javascript:alert(1)) now.');
  const { log } = sanitizeDocument(parsed.nodes);
  const link = parsed.nodes[0].inline.find((n) => n.type === 'link');
  assert.strictEqual(link.href, '#');
  assert.strictEqual(link.hrefOriginal, 'javascript:alert(1)');
  assert.strictEqual(link.sanitized.action, 'neutralized');
  assert.strictEqual(link.children[0].value, 'the thing'); // anchor text preserved
  assert.strictEqual(log.length, 1);
  assert.strictEqual(log[0].kind, 'url-neutralized');
  assert.strictEqual(log[0].sha256, sha256Text('javascript:alert(1)'));
});

test('sanitizeDocument removes script blocks wholly and records removedRaw', () => {
  const parsed = parseSource("Hello\n\n<script>alert('x')</script>\n\nBye\n");
  const { log } = sanitizeDocument(parsed.nodes);
  const removed = parsed.nodes.find((n) => n.type === 'htmlRemoved');
  assert.ok(removed, 'script block removed');
  assert.strictEqual(removed.removedRaw, "<script>alert('x')</script>");
  assert.strictEqual(log.some((l) => l.kind === 'html-removed'), true);
  // No silent loss: the paragraph before and after survive.
  assert.strictEqual(parsed.nodes.filter((n) => n.type === 'paragraph').length, 2);
});

test('sanitizeDocument: benign html untouched, event handlers stripped in blocks', () => {
  const parsed = parseSource('<div onclick="x()">t</div>\n');
  const { log } = sanitizeDocument(parsed.nodes);
  const html = parsed.nodes[0];
  assert.strictEqual(html.type, 'html');
  assert.strictEqual(html.raw, '<div>t</div>');
  assert.strictEqual(html.sanitized, true);
  assert.strictEqual(log.length, 1);
});
