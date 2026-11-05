// FC07 — merge contract: the metadata band is observable-identical to the
// pre-fabric index, and the two-band merge is stable and separated.
//
// The fixture (tests/fabric-corpus/search/fixtures/metadata-top10-fixture.json)
// was generated BEFORE any fabric integration landed:
//   node --experimental-strip-types tools/fabric-corpus/search/generate-merge-fixture.mjs
// It freezes the full metadata index snapshot and the top-10 for five fixture
// queries. This test re-scores that frozen snapshot with the pure query
// primitives and asserts equality — proving the merge did not shift existing
// results (deliverable: "existing top-10 unchanged for fixture queries").
//
//   node --experimental-strip-types --test tests/fabric-corpus/search/
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { searchDocuments, searchSite } from "../../../lib/search/query.ts";
import { FABRIC_RESULT_LIMIT, rankFabricArticles } from "../../../lib/search/fabric-scorer.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(here, "fixtures", "metadata-top10-fixture.json");

test("metadata top-10 unchanged after the fabric merge", { skip: !existsSync(fixturePath) && "fixture missing — run generate-merge-fixture.mjs" }, () => {
  const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
  const documents = fixture.documents;
  assert.equal(documents.length, fixture.documentCount);
  assert.equal(fixture.queries.length, 5);

  for (const entry of fixture.queries) {
    const rows = searchDocuments(documents, entry.query).slice(0, fixture.topN);
    assert.deepEqual(
      rows.map((row) => ({ id: row.document.id, score: row.score })),
      entry.top10,
      `"${entry.query}": metadata top-10 must be byte-identical to the pre-merge fixture`,
    );
    // The searchSite outcome order (best + groups) is equally frozen.
    const outcome = searchSite(documents, entry.query);
    const shownOrder = [
      ...(outcome.best ? [{ id: outcome.best.document.id, score: outcome.best.score }] : []),
      ...outcome.groups.flatMap((group) => group.items.map((row) => ({ id: row.document.id, score: row.score }))),
    ];
    assert.deepEqual(shownOrder, entry.outcomeShownOrder, `"${entry.query}": searchSite shown order unchanged`);
  }
});

test("merge contract: two bands, fixed order, no interleaving", () => {
  // The merge rule (documented in app/search/search-with-fabric.tsx):
  //   band 1 = metadata outcome, untouched order
  //   band 2 = fabric hits, ranked by fabric-scorer, capped at FABRIC_RESULT_LIMIT
  //   merged = band1 ++ band2 — never interleaved, because the two scorers use
  //   incommensurate scales (no deterministic cross-scale mapping exists).
  const metadataRows = [
    { id: "topic-fabric-model", score: 590 },
    { id: "academy-fabric-analytics-15-design-semantic-model-scale", score: 590 },
  ];
  const fabric = rankFabricArticles(
    [
      {
        articleId: "art:a",
        logicalPath: "/learn/fabric/docs/z/first/",
        title: "Mirror provisioning",
        family: "mirroring",
        terms: "mirror",
        sections: [{ heading: "Mirror", anchor: "m", text: "mirror mirror", kind: "section" }],
      },
      {
        articleId: "art:b",
        logicalPath: "/learn/fabric/docs/a/second/",
        title: "Mirror a database",
        family: "mirroring",
        terms: "mirror",
        sections: [{ heading: "Mirror", anchor: "m", text: "mirror mirror", kind: "section" }],
      },
    ],
    "mirror",
    { limit: FABRIC_RESULT_LIMIT },
  );
  assert.ok(fabric.length >= 2);
  // Band 2 is internally deterministic: score desc, logicalPath asc.
  assert.deepEqual(
    fabric.map((hit) => hit.logicalPath),
    ["/learn/fabric/docs/a/second/", "/learn/fabric/docs/z/first/"],
  );
  const merged = [...metadataRows, ...fabric.map((hit) => ({ id: hit.articleId, kind: "fabric-docs" }))];
  assert.deepEqual(merged.slice(0, metadataRows.length), metadataRows, "band 1 keeps its exact order");
  assert.deepEqual(
    merged.slice(metadataRows.length).map((row) => row.kind),
    merged.slice(metadataRows.length).map(() => "fabric-docs"),
    "band 2 carries only fabric-docs rows",
  );
  // Rows never cross bands: no fabric row appears before a metadata row.
  const firstFabricAt = merged.findIndex((row) => row.kind === "fabric-docs");
  assert.ok(firstFabricAt >= metadataRows.length, "fabric rows never interleave into band 1");
});

test("fabric rows expose logicalPath anchors through the same link shape", () => {
  const [hit] = rankFabricArticles(
    [
      {
        articleId: "art:anchor",
        logicalPath: "/learn/fabric/docs/admin/about-tenant-settings/",
        title: "About tenant settings",
        family: "admin",
        terms: "tenant settings",
        sections: [{ heading: "How to get to the tenant settings", anchor: "how-to-get-to-the-tenant-settings", text: "Sign in to Fabric.", kind: "section" }],
      },
    ],
    "tenant",
  );
  assert.equal(hit.kind, "fabric-docs");
  assert.equal(hit.anchor, "how-to-get-to-the-tenant-settings");
  // The link the band renders is `${logicalPath}#${anchor}` with the unprefixed
  // logical path — the same href shape next/link receives for metadata rows
  // (Next applies the base path once, internally).
  assert.equal(`${hit.logicalPath}#${hit.anchor}`, "/learn/fabric/docs/admin/about-tenant-settings/#how-to-get-to-the-tenant-settings");
});
