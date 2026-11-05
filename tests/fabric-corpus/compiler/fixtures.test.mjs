// Fixture-driven compile tests: goldens, quarantine classes, schema conformance.
import test from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';

import {
  compileFixtures, freshDir, EXPECTED_DIR, FIXTURE_FAMILY, FIXTURE_CORPUS,
  assertSchemaConforms, assertCanonicalJson,
} from './helpers.mjs';

const OUT = join(tmpdir(), 'hansa-fc03-fixture-out');

test('fixture corpus compiles; quarantine classes are exactly as specified', () => {
  const { receipt, manifest } = compileFixtures(freshDir(OUT));

  // Quarantine classes per fixture (one class each, cycles propagate a chain note).
  const byPath = new Map(receipt.files.map((f) => [f.path, f]));
  const reasonsOf = (p) => [...new Set(byPath.get(p).quarantineEntries.map((q) => q.reason))];
  assert.deepStrictEqual(reasonsOf('docs/include-missing.md'), ['include-missing-target']);
  assert.deepStrictEqual(reasonsOf('docs/include-traversal.md'), ['include-path-traversal']);
  const cycleReasons = [
    ...reasonsOf('docs/include-cycle-a.md'),
    ...reasonsOf('docs/include-cycle-b.md'),
  ];
  assert.ok(cycleReasons.includes('include-cycle'), JSON.stringify(cycleReasons));
  assert.ok(cycleReasons.includes('include-chain'), JSON.stringify(cycleReasons));
  // Clean files have no quarantine.
  for (const clean of ['docs/headings-anchors.md', 'docs/tables-code.md', 'docs/links.md', 'docs/image-alt.md', 'docs/zone-tab.md', 'docs/front-matter-unknown-keys.md', 'docs/sanitizer.md', 'docs/raw-html-script.md', 'docs/include-resolved.md']) {
    assert.strictEqual(byPath.get(clean).quarantined, false, `${clean} must not be quarantined`);
  }
  // Manifest agrees with the receipt on quarantine accounting.
  assert.strictEqual(manifest.totals.quarantinedFiles, receipt.totals.quarantinedFiles);
  assert.strictEqual(manifest.totals.files, receipt.totals.files);
});

test('golden: headings-anchors compiled node matches hand-reviewed output', () => {
  const { readNode } = compileFixtures(OUT);
  const actual = readNode('docs/headings-anchors.md');
  const expected = JSON.parse(readFileSync(join(EXPECTED_DIR, 'headings-anchors.nodes.json'), 'utf8'));
  assert.deepStrictEqual(actual, expected);
});

test('golden: include-missing compiled node matches hand-reviewed output', () => {
  const { readNode } = compileFixtures(OUT);
  const actual = readNode('docs/include-missing.md');
  const expected = JSON.parse(readFileSync(join(EXPECTED_DIR, 'include-missing.nodes.json'), 'utf8'));
  assert.deepStrictEqual(actual, expected);
});

test('commented-out directives are detected, never resolved as dependencies', () => {
  const { readNode, receipt } = compileFixtures(OUT);
  const node = readNode('docs/commented-directive.md');
  const commented = node.nodes.filter((n) => n.type === 'commentedDirective');
  assert.strictEqual(commented.length, 2);
  // The commented include must NOT resolve: no include node exists in this file.
  assert.strictEqual(node.nodes.some((n) => n.type === 'include'), false);
  // And the ordinary comment stays a benign htmlComment.
  assert.ok(node.nodes.some((n) => n.type === 'htmlComment'));
  // Receipt carries the same accounting.
  const entry = receipt.files.find((f) => f.path === 'docs/commented-directive.md');
  assert.strictEqual(entry.commentedDirectives.length, 2);
});

test('resolved include records fragment provenance', () => {
  const { readNode, receipt } = compileFixtures(OUT);
  const node = readNode('docs/include-resolved.md');
  const include = node.nodes.find((n) => n.type === 'include');
  assert.strictEqual(include.resolved, 'docs/includes/shared-fragment.md');
  assert.strictEqual(include.exists, true);
  assert.strictEqual(include.blocked, false);
  assert.ok(typeof include.fragmentSha256 === 'string' && include.fragmentSha256.length === 64);
  assert.ok(include.fragmentNodeCount >= 1);
  const entry = receipt.files.find((f) => f.path === 'docs/include-resolved.md');
  const includeEdge = entry.edges.find((e) => e.kind === 'include');
  assert.strictEqual(includeEdge.resolved, 'docs/includes/shared-fragment.md');
});

test('sanitizer fixture: dangerous urls neutralized, data image allowed, all logged', () => {
  const { readNode, receipt } = compileFixtures(OUT);
  const node = readNode('docs/sanitizer.md');
  const links = node.nodes
    .filter((n) => n.type === 'paragraph')
    .flatMap((n) => n.inline)
    .filter((n) => n.type === 'link');
  const neutralized = links.filter((l) => l.sanitized?.action === 'neutralized');
  assert.strictEqual(neutralized.length, 4); // javascript, vbscript, data:text/html, entity-obfuscated
  assert.ok(links.every((l) => l.sanitized || l.href !== '#'));
  const dataImage = links.find((l) => l.href.startsWith('data:image/'));
  assert.ok(dataImage, 'data:image link survives');
  assert.strictEqual(dataImage.sanitized, undefined);
  const entry = receipt.files.find((f) => f.path === 'docs/sanitizer.md');
  assert.strictEqual(entry.sanitizationLog.filter((l) => l.kind === 'url-neutralized').length, 4);
});

test('raw html fixture: script+iframe removed with content, benign html preserved, on* stripped', () => {
  const { readNode, receipt } = compileFixtures(OUT);
  const node = readNode('docs/raw-html-script.md');
  const removed = node.nodes.filter((n) => n.type === 'htmlRemoved');
  assert.strictEqual(removed.length, 2);
  assert.ok(removed.some((n) => n.removedRaw.includes('alert')));
  assert.ok(removed.some((n) => n.removedRaw.includes('iframe')));
  const benign = node.nodes.find((n) => n.type === 'html' && n.raw.includes('<b>bold</b>'));
  assert.ok(benign, 'benign paragraph preserved');
  const stripped = node.nodes.find((n) => n.type === 'html' && n.raw === '<div>Click targets</div>');
  assert.ok(stripped, 'onclick/onmouseover stripped');
  const entry = receipt.files.find((f) => f.path === 'docs/raw-html-script.md');
  assert.ok(entry.sanitizationLog.length >= 5);
  // Every removal is logged with a sha256 for auditability (no silent loss).
  for (const l of entry.sanitizationLog) assert.match(l.sha256, /^[0-9a-f]{64}$/);
});

test('images fixture: alt text and lightbox edges recorded', () => {
  const { readNode, receipt } = compileFixtures(OUT);
  const node = readNode('docs/image-alt.md');
  const mdImage = node.nodes
    .filter((n) => n.type === 'paragraph')
    .flatMap((n) => n.inline)
    .find((n) => n.type === 'image');
  assert.strictEqual(mdImage.alt, 'A red square');
  assert.strictEqual(mdImage.title, 'The red square');
  const learnImage = node.nodes.find((n) => n.type === 'learnConstruct' && n.kind === 'image');
  assert.strictEqual(learnImage.attributes['alt-text'], 'A blue circle diagram.');
  const entry = receipt.files.find((f) => f.path === 'docs/image-alt.md');
  const kinds = entry.edges.filter((e) => e.kind.startsWith('image')).map((e) => e.kind);
  assert.ok(kinds.includes('image-lightbox'));
});

test('links fixture: classifications and anchor existence', () => {
  const { receipt } = compileFixtures(OUT);
  const entry = receipt.files.find((f) => f.path === 'docs/links.md');
  const links = entry.edges.filter((e) => e.kind === 'link');
  const byHref = new Map(links.map((l) => [l.href, l]));
  assert.strictEqual(byHref.get('https://example.com/docs').classification, 'external');
  assert.strictEqual(byHref.get('mailto:someone@example.com').classification, 'mail');
  assert.strictEqual(byHref.get('#links-fixture').classification, 'anchor-only');
  assert.strictEqual(byHref.get('#links-fixture').anchorExists, true);
  assert.strictEqual(byHref.get('/en-us/power-bi/fundamentals/desktop-get-started').classification, 'locale-ref');
  assert.strictEqual(byHref.get('/azure/topic/page').classification, 'site-absolute');
  assert.strictEqual(byHref.get('headings-anchors.md#whats-new').anchorExists, true);
  assert.strictEqual(byHref.get('no-such-page.md').exists, false);
});

test('zone/tab fixture: nested constructs represented structurally', () => {
  const { readNode, receipt } = compileFixtures(OUT);
  const node = readNode('docs/zone-tab.md');
  const zones = node.nodes.filter((n) => n.type === 'learnConstruct' && n.kind === 'zone');
  assert.strictEqual(zones.length, 2);
  assert.strictEqual(zones[0].attributes.pivot, 'basic-features');
  const tab = zones[0].children.find((n) => n.type === 'learnConstruct' && n.kind === 'tab');
  assert.ok(tab);
  assert.strictEqual(tab.children.length, 1);
  const entry = receipt.files.find((f) => f.path === 'docs/zone-tab.md');
  const pivots = entry.edges.filter((e) => e.kind === 'applicability');
  assert.deepStrictEqual(pivots.map((p) => p.value), ['basic-features', 'extended-features']);
});

test('tables/code fixture: alignments, cells, code values', () => {
  const { readNode } = compileFixtures(OUT);
  const node = readNode('docs/tables-code.md');
  const table = node.nodes.find((n) => n.type === 'table');
  assert.deepStrictEqual(table.alignments, ['left', 'center', 'right']);
  assert.strictEqual(table.rows.length, 2);
  const codes = node.nodes.filter((n) => n.type === 'code');
  assert.deepStrictEqual(codes.map((c) => [c.language, c.value]), [
    ['ts', 'export const answer = 42;'],
    [null, 'no language fence'],
  ]);
});

test('every emitted artifact conforms to its schema', () => {
  const { receipt, manifest, result, familyDir } = compileFixtures(OUT);
  assertSchemaConforms(receipt, 'receipt.schema.json');
  assertSchemaConforms(manifest, 'family-manifest.schema.json');
  // Conformance of every compiled node.
  for (const [nodeFile, json] of result.nodeJsonByName) {
    const parsedNode = JSON.parse(json);
    assertSchemaConforms(parsedNode, 'compiled-node.schema.json');
    void nodeFile;
  }
  void familyDir;
});

test('all emitted artifacts are canonical JSON', () => {
  const { result, familyDir } = compileFixtures(OUT);
  for (const [nodeFile, json] of result.nodeJsonByName) {
    assertCanonicalJson(json, nodeFile);
  }
  assertCanonicalJson(result.manifestJson, 'manifest.json');
  assertCanonicalJson(result.receiptJson, 'receipt.json');
  void familyDir;
});

test('manifest checksums match the emitted node files', () => {
  const { manifest, familyDir } = compileFixtures(OUT);
  for (const [name, sha] of Object.entries(manifest.checksums)) {
    const bytes = readFileSync(join(familyDir, ...name.split('/')));
    assert.strictEqual(createHash('sha256').update(bytes).digest('hex'), sha, name);
  }
});
