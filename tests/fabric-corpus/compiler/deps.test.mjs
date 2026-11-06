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
  // W3-A rule (compiler 0.2.0): docfx tilde semantics — `~/<path>` resolves
  // against the docset root (the corpus root here). Previously ANY tilde path
  // was a hold; now only paths that climb above the docset root stay blocked.
  assert.strictEqual(resolveWithinRoots('docs/x.md', '~/includes/y.md', ['']).ok, true);
  assert.strictEqual(resolveWithinRoots('docs/x.md', '~/includes/y.md', ['']).path, 'includes/y.md');
  assert.strictEqual(resolveWithinRoots('docs/x.md', '~/../other-repo/docs/y.md', ['']).ok, false);
  assert.strictEqual(resolveWithinRoots('docs/x.md', '~/../other-repo/docs/y.md', ['']).reason, 'include-tilde-path');
  // Stray double-slash form found in the corpus (~/..//powerbi-repo/...) also
  // escapes the docset root.
  assert.strictEqual(resolveWithinRoots('docs/x.md', '~/..//other-repo/y.md', ['']).ok, false);
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

test('nested inline includes resolve once and propagate fragment holds', () => {
  const source = [
    ':::row:::',
    ':::column:::',
    '**[!INCLUDE [nested](nested.md)]**',
    ':::column-end:::',
    ':::row-end:::',
  ].join('\n');
  const files = new Map([
    ['docs/nested.md', source.replace('nested.md', 'missing.md')],
  ]);
  const parsed = parseSource(source);
  const graph = buildDependencyGraph({
    sourceRelPath: 'docs/start.md',
    nodes: parsed.nodes,
    parserWarnings: parsed.warnings,
    io: { exists: (path) => files.has(path), readText: (path) => files.get(path) },
  });
  const [include] = graph.edges.filter((edge) => edge.kind === 'include');
  assert.equal(graph.edges.filter((edge) => edge.kind === 'include').length, 1);
  assert.equal(include.resolved, 'docs/nested.md');
  assert.equal(include.inline, true);
  assert.equal(include.blocked, true);
  assert.match(include.reason, /include-chain:docs\/nested\.md: include-missing-target/);
});

test('a parser warning in an included fragment quarantines its article', () => {
  const source = '[!INCLUDE [fragment](fragment.md)]';
  const parsed = parseSource(source);
  const graph = buildDependencyGraph({
    sourceRelPath: 'docs/start.md',
    nodes: parsed.nodes,
    parserWarnings: parsed.warnings,
    io: {
      exists: (path) => path === 'docs/fragment.md',
      readText: () => '::: zone pivot="sample"\nNo closing marker.',
    },
  });
  assert.equal(graph.edges[0].blocked, true);
  assert.equal(graph.edges[0].reason, 'include-chain:docs/fragment.md: unterminated-construct');
  assert.equal(graph.quarantines[0].reason, 'include-chain');
});

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

test('tilde root include resolves; cross-repo tilde include quarantines with a structured dependency row', () => {
  // `~/includes/...` resolves inside the docset root (W3-A rule).
  const root = graphFor(FIXTURE_CORPUS, 'docs/include-tilde-root.md', readFileSync(join(FIXTURE_CORPUS, 'docs/include-tilde-root.md'), 'utf8'));
  assert.deepStrictEqual(root.graph.quarantines, []);
  assert.deepStrictEqual(root.graph.dependencyHolds, []);
  const rootEdge = root.graph.edges.find((e) => e.kind === 'include');
  assert.strictEqual(rootEdge.resolved, 'includes/root-fragment.md');
  assert.strictEqual(rootEdge.exists, true);
  assert.strictEqual(rootEdge.blocked, false);

  // `~/../<repo>/...` escapes the docset root: fail-closed hold + structured row.
  const repo = graphFor(FIXTURE_CORPUS, 'docs/include-tilde-repo.md', readFileSync(join(FIXTURE_CORPUS, 'docs/include-tilde-repo.md'), 'utf8'));
  assert.deepStrictEqual(repo.graph.quarantines.map((q) => q.reason), ['include-tilde-path']);
  assert.strictEqual(repo.graph.dependencyHolds.length, 1);
  const hold = repo.graph.dependencyHolds[0];
  assert.strictEqual(hold.target, '~/../sibling-repo/docs/includes/external-fragment.md');
  assert.strictEqual(hold.kind, 'cross-repo-include');
  assert.strictEqual(hold.targetRepo, 'sibling-repo');
  assert.strictEqual(hold.inRepoPath, 'docs/includes/external-fragment.md');
  assert.ok(hold.span && hold.span.start.line >= 1);
  const node = repo.parsed.nodes.find((n) => n.type === 'include');
  assert.strictEqual(node.blocked, true);
  assert.strictEqual(node.blockedReason, 'include-tilde-path');
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
