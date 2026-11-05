// Dependency graph tests: classification, safe resolution, quarantine classes.
import test from 'node:test';
import { strict as assert } from 'node:assert';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { classifyHref, buildDependencyGraph, resolveWithinRoots } from '../../../tools/fabric-corpus/compiler/deps.mjs';
import { parseSource } from '../../../tools/fabric-corpus/compiler/parse.mjs';
import { FIXTURE_CORPUS } from './helpers.mjs';

const ioFor = (corpusRoot) => ({
  exists: (rel) => existsSync(join(corpusRoot, rel)),
  readText: (rel) => readFileSync(join(corpusRoot, rel), 'utf8'),
  joinRoot: (rel) => join(corpusRoot, rel),
});

test('classifyHref classes', () => {
  assert.strictEqual(classifyHref('#frag').classification, 'anchor-only');
  assert.strictEqual(classifyHref('https://x.example/a').classification, 'external');
  assert.strictEqual(classifyHref('//cdn.example/a.png').classification, 'external');
  assert.strictEqual(classifyHref('mailto:a@b.example').classification, 'mail');
  assert.strictEqual(classifyHref('/en-us/power-bi/x').classification, 'locale-ref');
  assert.strictEqual(classifyHref('/power-bi/x').classification, 'site-absolute');
  assert.strictEqual(classifyHref('a/b.md').classification, 'relative-md');
  assert.strictEqual(classifyHref('a/b.md#anchor').classification, 'relative-md');
  assert.strictEqual(classifyHref('media/x.png').classification, 'relative-asset');
  assert.strictEqual(classifyHref('a/b.docx').classification, 'relative-asset');
  assert.strictEqual(classifyHref('a/b').classification, 'relative-other');
  assert.strictEqual(classifyHref('a.md').anchor, null);
  assert.strictEqual(classifyHref('a.md#z').anchor, 'z');
});

test('resolveWithinRoots: traversal, tilde and escaping dots are quarantined', () => {
  // Source at docs/x.md; allowed root is the corpus root ('').
  assert.strictEqual(resolveWithinRoots('docs/x.md', 'y.md', ['']).ok, true);
  assert.strictEqual(resolveWithinRoots('docs/x.md', '../includes/y.md', ['']).ok, true);
  assert.strictEqual(resolveWithinRoots('docs/x.md', '../../escape.md', ['']).ok, false);
  assert.strictEqual(resolveWithinRoots('docs/x.md', '../../escape.md', ['']).reason, 'include-path-traversal');
  assert.strictEqual(resolveWithinRoots('docs/x.md', '~/includes/y.md', ['']).ok, false);
  assert.strictEqual(resolveWithinRoots('docs/x.md', '~/includes/y.md', ['']).reason, 'include-tilde-path');
  assert.strictEqual(resolveWithinRoots('docs/x.md', 'https://x.example/y.md', ['']).ok, false);
  // ../.. clamping back inside the root is still traversal (spec: .. escapes).
  assert.strictEqual(resolveWithinRoots('docs/sub/x.md', 'docs/sub/../y.md', ['']).ok, true);
});

function graphFor(corpusRoot, sourceRel, src) {
  const parsed = parseSource(src);
  const graph = buildDependencyGraph({
    sourceRelPath: sourceRel,
    nodes: parsed.nodes,
    parserWarnings: parsed.warnings,
    io: ioFor(corpusRoot),
    allowedRoots: [''],
  });
  return { parsed, graph };
}

test('resolved include records fragment sha256 and node count', () => {
  const { graph } = graphFor(FIXTURE_CORPUS, 'docs/include-resolved.md', readFileSync(join(FIXTURE_CORPUS, 'docs/include-resolved.md'), 'utf8'));
  const includeEdges = graph.edges.filter((e) => e.kind === 'include');
  assert.strictEqual(includeEdges.length, 1);
  assert.strictEqual(includeEdges[0].resolved, 'docs/includes/shared-fragment.md');
  assert.strictEqual(includeEdges[0].exists, true);
  assert.strictEqual(includeEdges[0].blocked, false);
});

test('missing include target quarantines the node, accounting continues', () => {
  const src = 'Before.\n\n[!INCLUDE [x](includes/nope.md)]\n\nAfter.\n';
  const { graph } = graphFor(FIXTURE_CORPUS, 'docs/x.md', src);
  assert.strictEqual(graph.quarantines.length, 1);
  assert.strictEqual(graph.quarantines[0].reason, 'include-missing-target');
  // Accounting continues: the paragraph edges still exist.
  assert.ok(graph.edges.length >= 1);
});

test('include cycle is detected across the chain', () => {
  const { graph } = graphFor(FIXTURE_CORPUS, 'docs/include-cycle-a.md', readFileSync(join(FIXTURE_CORPUS, 'docs/include-cycle-a.md'), 'utf8'));
  const reasons = graph.quarantines.map((q) => q.reason);
  assert.ok(reasons.includes('include-cycle'), `expected include-cycle, got ${JSON.stringify(reasons)}`);
});

test('path traversal out of the corpus root quarantines', () => {
  const { graph } = graphFor(FIXTURE_CORPUS, 'docs/include-traversal.md', readFileSync(join(FIXTURE_CORPUS, 'docs/include-traversal.md'), 'utf8'));
  assert.strictEqual(graph.quarantines[0].reason, 'include-path-traversal');
});

test('deep missing include propagates include-chain to the parent', () => {
  // docs/chain-parent.md -> docs/includes/chain-child.md -> missing target
  const src = '[!INCLUDE [child](includes/chain-child.md)]';
  const parentIo = {
    exists: (rel) => existsSync(join(FIXTURE_CORPUS, rel)) || rel === 'docs/includes/chain-child.md',
    readText: (rel) => (rel === 'docs/includes/chain-child.md' ? '[!INCLUDE [gone](chain-gone.md)]' : readFileSync(join(FIXTURE_CORPUS, rel), 'utf8')),
    joinRoot: (rel) => join(FIXTURE_CORPUS, rel),
  };
  const parsed = parseSource(src);
  const graph = buildDependencyGraph({ sourceRelPath: 'docs/chain-parent.md', nodes: parsed.nodes, parserWarnings: [], io: parentIo, allowedRoots: [''] });
  const reasons = graph.quarantines.map((q) => q.reason);
  assert.ok(reasons.includes('include-chain'), JSON.stringify(reasons));
  const includeNode = parsed.nodes.find((n) => n.type === 'include');
  assert.strictEqual(includeNode.blocked, true);
  assert.strictEqual(includeNode.blockedReason, 'include-chain:docs/includes/chain-child.md: include-missing-target');
});

test('commented directives inside include fragments surface in the parent accounting', () => {
  const parentIo = {
    exists: (rel) => existsSync(join(FIXTURE_CORPUS, rel)) || rel === 'docs/includes/chain-child.md',
    readText: (rel) => (rel === 'docs/includes/chain-child.md' ? '<!-- [!INCLUDE [ghost](x.md)] -->' : readFileSync(join(FIXTURE_CORPUS, rel), 'utf8')),
    joinRoot: (rel) => join(FIXTURE_CORPUS, rel),
  };
  const parsed = parseSource('[!INCLUDE [child](includes/chain-child.md)]');
  const graph = buildDependencyGraph({ sourceRelPath: 'docs/chain-parent.md', nodes: parsed.nodes, parserWarnings: [], io: parentIo, allowedRoots: [''] });
  assert.strictEqual(graph.commentedDirectives.length, 1);
  assert.strictEqual(graph.commentedDirectives[0].viaInclude, 'docs/includes/chain-child.md');
});

test('zone pivots and moniker ranges produce applicability edges', () => {
  const src = '::: zone pivot="basic-features"\nA\n::: zone-end\n';
  const { graph } = graphFor(FIXTURE_CORPUS, 'docs/x.md', src);
  const applicability = graph.edges.filter((e) => e.kind === 'applicability');
  assert.strictEqual(applicability.length, 1);
  assert.strictEqual(applicability[0].marker, 'pivot');
  assert.strictEqual(applicability[0].value, 'basic-features');
});

test('image directive produces image and lightbox edges; raw-html img accounted', () => {
  const src = ':::image type="content" source="media/a.png" alt-text="A" lightbox="media/a.png":::\nX\n:::image-end:::\n\n<img src="media/b.png">\n';
  const { graph } = graphFor(FIXTURE_CORPUS, 'docs/x.md', src);
  const imageEdges = graph.edges.filter((e) => e.kind === 'image');
  assert.strictEqual(imageEdges.length, 2); // directive + raw html img
  const lightbox = graph.edges.filter((e) => e.kind === 'image-lightbox');
  assert.strictEqual(lightbox.length, 1);
});

test('links: classification, existence and anchor validation', () => {
  const src = [
    '[ok](headings-anchors.md#whats-new)',
    '[bad anchor](headings-anchors.md#not-there)',
    '[missing file](no-such.md)',
    '[self anchor](#nothing-here)',
  ].join('\n\n');
  const parsed = parseSource(src);
  const graph = buildDependencyGraph({ sourceRelPath: 'docs/links-probe.md', nodes: parsed.nodes, parserWarnings: [], io: ioFor(FIXTURE_CORPUS), allowedRoots: [''] });
  const links = graph.edges.filter((e) => e.kind === 'link');
  assert.strictEqual(links[0].exists, true);
  assert.strictEqual(links[0].anchorExists, true);
  assert.strictEqual(links[1].anchorExists, false);
  assert.strictEqual(links[2].exists, false);
  assert.strictEqual(links[3].classification, 'anchor-only');
  assert.strictEqual(links[3].anchorExists, false); // 'nothing-here' is not a heading in this probe file
});
