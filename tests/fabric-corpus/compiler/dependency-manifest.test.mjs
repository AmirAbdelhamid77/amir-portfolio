// W3-A consolidated dependency manifest: aggregation, ledger join, determinism.
import test from 'node:test';
import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { compileFixtures, freshDir } from './helpers.mjs';
import { buildDependencyManifest } from '../../../tools/fabric-corpus/compiler/build-dependency-manifest.mjs';
import { emitJson } from '../../../tools/fabric-corpus/compiler/emit.mjs';

const OUT = join(tmpdir(), 'hansa-fc03-depman-out');

test('dependency manifest: fixture hold rows aggregate with ledger join and stay deterministic', () => {
  const { result, receipt } = compileFixtures(freshDir(OUT));
  const nodesReader = (fileRel) =>
    JSON.parse(result.nodeJsonByName.get(`nodes/${fileRel.replace(/\.md$/i, '.json')}`));

  // Ledger rows shaped like tools/fabric-corpus/registry/identity.json rows.
  // The join key is 'docs/' + receipt file.path: in the real corpus the
  // corpus root IS the docs/ directory (receipt paths are '<family>/...'), so
  // the ledger prefix is 'docs/'. In the FIXTURE corpus the family itself is
  // named 'docs' under the corpus root, hence the doubled 'docs/docs/' path.
  const ledgerRows = [
    {
      id: 'art:test/include-tilde-repo',
      path: 'docs/docs/include-tilde-repo.md',
      kind: 'article-candidate',
      disposition: 'eligible-article',
      plannedDestination: '/learn/fabric/docs/include-tilde-repo/',
      rightsState: 'cc-by-4.0-docs',
    },
  ];

  const a = buildDependencyManifest({
    receipts: [{ family: 'docs', receipt, nodesReader }],
    ledgerRows,
    corpusRevision: null,
  });
  const b = buildDependencyManifest({
    receipts: [{ family: 'docs', receipt, nodesReader }],
    ledgerRows,
    corpusRevision: null,
  });
  assert.strictEqual(a.manifestJson, b.manifestJson, 'manifest build is deterministic');
  assert.throws(() => buildDependencyManifest({
    receipts: [{ family: 'docs', receipt: { ...receipt, compiler: { ...receipt.compiler, version: '0.1.0' } }, nodesReader }],
    ledgerRows,
    corpusRevision: null,
  }), /incompatible compiler receipt for docs/);

  const manifest = a.manifest;
  assert.strictEqual(manifest.schema, 'hansa.fabric-dependency-manifest/1');
  assert.strictEqual(manifest.summary.files, 1);
  assert.strictEqual(manifest.summary.heldIncludes, 1);
  assert.strictEqual(manifest.summary.distinctTargets, 1);
  assert.deepStrictEqual(manifest.summary.byTargetRepo, [{ targetRepo: 'sibling-repo', includes: 1, files: 1 }]);
  assert.deepStrictEqual(manifest.summary.byFamily, [{ family: 'docs', files: 1, heldIncludes: 1 }]);

  const row = manifest.articles[0];
  assert.strictEqual(row.family, 'docs');
  assert.strictEqual(row.sourcePath, 'docs/docs/include-tilde-repo.md');
  assert.strictEqual(row.articleId, 'art:test/include-tilde-repo');
  assert.strictEqual(row.disposition, 'eligible-article');
  assert.strictEqual(row.quarantined, true);
  assert.deepStrictEqual(row.quarantineReasons, ['include-tilde-path']);
  assert.strictEqual(row.dependencyHolds.length, 1);
  assert.strictEqual(row.dependencyHolds[0].target, '~/../sibling-repo/docs/includes/external-fragment.md');
  assert.strictEqual(row.dependencyHolds[0].targetRepo, 'sibling-repo');
  assert.strictEqual(row.dependencyHolds[0].inRepoPath, 'docs/includes/external-fragment.md');
  assert.ok(row.dependencyHolds[0].span && row.dependencyHolds[0].span.start.line >= 1);
  // underHeading is null when no heading precedes the include; the fixture
  // include sits at the top of its document, so null is the correct,
  // deterministic answer here.
  assert.strictEqual(row.dependencyHolds[0].underHeading, null);
  // The article's own published sections are its headings.
  assert.ok(Array.isArray(row.ownSections));
  // Include nodes are accounted with resolution state.
  assert.strictEqual(row.includeNodes.length, 1);
  assert.strictEqual(row.includeNodes[0].blocked, true);
  assert.strictEqual(row.includeNodes[0].blockedReason, 'include-tilde-path');

  // The manifest JSON is canonical and self-verifying (sha256 of the body).
  const body = { ...manifest };
  delete body.manifestSha256;
  assert.strictEqual(
    manifest.manifestSha256,
    createHash('sha256').update(emitJson(body), 'utf8').digest('hex'),
  );
});

test('dependency manifest: unledgered rows carry null identity without crashing', () => {
  const corpusRevision = '774592ea3f2d4558f763d6e5b74abf4785948fb5';
  const { result, receipt } = compileFixtures(OUT, corpusRevision);
  const nodesReader = (fileRel) =>
    JSON.parse(result.nodeJsonByName.get(`nodes/${fileRel.replace(/\.md$/i, '.json')}`));
  const manifest = buildDependencyManifest({
    receipts: [{ family: 'docs', receipt, nodesReader }],
    ledgerRows: [],
    corpusRevision,
  }).manifest;
  assert.strictEqual(manifest.corpusRevision, corpusRevision);
  assert.strictEqual(manifest.articles[0].articleId, null);
  assert.strictEqual(manifest.articles[0].ledgerKind, null);
  assert.strictEqual(manifest.articles[0].logicalPath, null);
});
