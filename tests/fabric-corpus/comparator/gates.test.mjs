// FC13 — comparator gates re-asserted from the canonical full-corpus render
// reports (the renderer itself enforces them fail-closed; these tests pin the
// measured artifacts so a regressed renderer cannot pass silently).
//
//   node --experimental-strip-types --test tests/fabric-corpus/comparator/
//
// Requires the full renders to exist (tools/fabric-corpus/bench-comparator/
// render-static-html.mjs --profile root|subpath); tests skip with a clear
// message otherwise.

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..", "..");
const buildDir =
  process.env.FABRIC_CORPUS_BUILD_DIR ?? path.join(repoRoot, "..", "fabric-corpus-build");

const EXPECTED_PUBLISHED = 2716;
const EXPECTED_EXCLUDED = 81;

function loadReport(profile) {
  const file = path.join(buildDir, "comparator", profile, "render-report.json");
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, "utf8"));
}

for (const profile of ["root", "subpath"]) {
  const report = loadReport(profile);

  test(`comparator gates [${profile}]: full render report present and fresh`, (t) => {
    if (!report) {
      t.skip(`comparator/${profile}/render-report.json missing — run render-static-html.mjs --profile ${profile}`);
    }
    assert.equal(report.schema, "hansa.fabric-comparator-render/1");
    assert.equal(report.profile, profile);
    assert.equal(report.corpusRevision, "774592ea3f2d4558f763d6e5b74abf4785948fb5");
    assert.equal(report.allGatesPass, true);
  });

  test(`comparator gates [${profile}]: coverage reconciliation vs the route registry`, (t) => {
    if (!report) t.skip("report missing");
    const registry = JSON.parse(
      readFileSync(path.join(buildDir, "route-registry", "route-registry.json"), "utf8"),
    );
    const published = registry.families.reduce((acc, f) => acc + f.articles.length, 0);
    assert.equal(published, EXPECTED_PUBLISHED);
    assert.equal(registry.excluded.length, EXPECTED_EXCLUDED);
    assert.equal(report.gates.coverage.expected, published);
    assert.equal(report.gates.coverage.rendered, published);
    assert.deepEqual(report.gates.coverage.missing, []);
    assert.equal(report.gates.coverage.pass, true);
    // The comparator ships exactly the article pages + docs index + aliases + 404.
    assert.equal(report.output.articlePages, published);
    assert.equal(report.output.docsIndexPages, 1);
    assert.equal(report.output.notFoundPages, 1);
    assert.equal(
      report.output.fileCount,
      published + 1 + 1 + report.output.aliasPages,
      "one HTML per published article plus docs index, 404 and alias pages — nothing else",
    );
  });

  test(`comparator gates [${profile}]: every excluded logical path is absent`, (t) => {
    if (!report) t.skip("report missing");
    assert.equal(report.gates.exclusions.excludedRows, EXPECTED_EXCLUDED);
    assert.deepEqual(report.gates.exclusions.present, []);
    assert.equal(report.gates.exclusions.pass, true);
  });

  test(`comparator gates [${profile}]: base path applied exactly once (prefix gate)`, (t) => {
    if (!report) t.skip("report missing");
    const gate = report.gates.prefix;
    assert.equal(gate.profile, profile);
    assert.equal(gate.basePath, profile === "root" ? "" : "/REPOSITORY_NAME");
    assert.deepEqual(gate.violations, []);
    assert.equal(gate.pass, true);
  });

  test(`comparator gates [${profile}]: every referenced asset resolves in the shared tree`, (t) => {
    if (!report) t.skip("report missing");
    const gate = report.gates.assets;
    assert.ok(gate.refs > 9000, `expected the full corpus image set, got ${gate.refs}`);
    assert.equal(gate.resolved, gate.refs);
    assert.deepEqual(gate.missing, []);
    assert.equal(gate.pass, true);
  });

  test(`comparator gates [${profile}]: no-JS proof across every emitted HTML file`, (t) => {
    if (!report) t.skip("report missing");
    const gate = report.gates.noJs;
    assert.equal(gate.filesScanned, report.output.fileCount);
    assert.equal(gate.scriptTags, 0);
    assert.deepEqual(gate.violations, []);
    assert.equal(gate.pass, true);
  });

  test(`comparator gates [${profile}]: structural spot checks (5 articles, heading parity)`, (t) => {
    if (!report) t.skip("report missing");
    const spot = report.gates.spotChecks;
    assert.equal(spot.articles, 5);
    assert.equal(spot.allPass, true);
    for (const detail of spot.details) {
      assert.equal(detail.present, true, detail.sourcePath);
      assert.equal(detail.headingsMatch, true, `${detail.sourcePath}: ${detail.nodeHeadings} node vs ${detail.htmlHeadings} html headings`);
      assert.equal(detail.hasTitle, true, detail.sourcePath);
      assert.equal(detail.hasProvenance, true, detail.sourcePath);
      assert.equal(detail.hasBodyContent, true, detail.sourcePath);
    }
  });
}
