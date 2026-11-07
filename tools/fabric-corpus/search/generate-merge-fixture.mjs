// FC07 — generate the metadata search regression fixture.
//
// Captures the CURRENT top-10 metadata-index results for five fixture queries
// BEFORE any fabric integration lands, so tests can assert the merge kept the
// metadata band observable-identical (deliverable 5e).
//
//   node --experimental-strip-types tools/fabric-corpus/search/generate-merge-fixture.mjs
//
// The heavy import chain (lib/search/documents.ts → lib/study/**) uses `@/`
// aliases, extensionless relative imports and JSON imports. That is the app's
// bundler surface, not the test surface — this one-off script bridges it with
// module hooks (tools/fabric-corpus/search/lib/fixture-loader-hooks.mjs). The
// committed fixture is data only: tests load it with fs and re-score it with
// the pure lib/search/query.ts functions.
//
// Deterministic: no clock, no randomness; output ordering follows the builder.
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";

const here = path.dirname(fileURLToPath(import.meta.url));
register(new URL("./lib/fixture-loader-hooks.mjs", import.meta.url));

const { buildSiteSearchIndex } = await import("../../../lib/search/documents.ts");
const { searchDocuments, searchSite } = await import("../../../lib/search/query.ts");

/** Fixture queries spanning the index's surfaces (aliases, prefixes, kinds). */
const FIXTURE_QUERIES = [
  "star schema",
  "p-value",
  "direct lake",
  "box plot",
  "medallion",
];

const TOP_N = 10;

const documents = buildSiteSearchIndex();

const queries = FIXTURE_QUERIES.map((query) => {
  const rows = searchDocuments(documents, query).slice(0, TOP_N);
  const outcome = searchSite(documents, query);
  return {
    query,
    top10: rows.map((row) => ({ id: row.document.id, score: row.score })),
    outcomeShownOrder: [
      ...(outcome.best ? [{ id: outcome.best.document.id, score: outcome.best.score }] : []),
      ...outcome.groups.flatMap((group) =>
        group.items.map((row) => ({ id: row.document.id, score: row.score })),
      ),
    ],
  };
});

for (const entry of queries) {
  if (entry.top10.length === 0) {
    console.error(`FAIL: fixture query "${entry.query}" has zero metadata results — pick a query that hits the current index.`);
    process.exit(1);
  }
}

const fixture = {
  // Provenance is content-derived only — no clock, no revision drift.
  fixture: "hansa.metadata-search-regression/1",
  source: "buildSiteSearchIndex() + searchDocuments/searchSite (lib/search/query.ts)",
  documentCount: documents.length,
  topN: TOP_N,
  queries,
  // Full document snapshot: the test re-scores THIS frozen index, so a query.ts
  // change that shifts existing ranking fails the test even if it emerges only
  // through some scoring path not covered by the recorded top-10 rows.
  documents,
};

const outPath = path.join(
  here,
  "..",
  "..",
  "..",
  "tests",
  "fabric-corpus",
  "search",
  "fixtures",
  "metadata-top10-fixture.json",
);
mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(fixture, null, 1) + "\n", "utf8");

console.log(`PASS  fixture written: ${outPath}`);
console.log(`      documents=${documents.length}`);
for (const entry of queries) {
  console.log(`      "${entry.query}" → ${entry.top10.length} rows, best=${entry.top10[0]?.id ?? "(none)"} (${entry.top10[0]?.score ?? 0})`);
}
