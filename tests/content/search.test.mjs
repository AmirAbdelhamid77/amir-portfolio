// Tests for the site-wide search primitives.
//
// These run the pure query functions against a small fixed corpus, so a change
// to normalisation, ranking or the result contract fails here rather than in a
// browser. The real-index volume is checked by `scripts/qa-search-index.mjs`
// against the built `out/search/index.json`.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  RESULT_LIMIT,
  normalizeSearchText,
  scoreDocument,
  searchDocuments,
  searchSite,
  tokenize,
} from "../../lib/search/query.ts";

const docs = [
  {
    id: "section-21",
    title: "21. Hypothesis testing",
    url: "/learn/statistics/journey/hypothesis/",
    kind: "section",
    summary: "Null model, test statistic, p-value area and the decision rule.",
    topic: ["statistics", "hypothesis"],
    language: "en",
    keywords: ["p-value", "p value", "null hypothesis", "significance"],
  },
  {
    id: "lab-p-value",
    title: "p-value lab",
    url: "/learn/statistics/labs/p-value/",
    kind: "lab",
    summary: "Move the sample and watch the tail area change.",
    topic: ["statistics", "lab", "hypothesis"],
    language: "en",
    keywords: ["p-value", "tail", "alpha"],
  },
  {
    id: "fabric-direct-lake",
    title: "Direct Lake fallback behaviour",
    url: "/learn/fabric/model/",
    kind: "lesson",
    summary: "When a semantic model falls back to DirectQuery.",
    topic: ["Microsoft Fabric", "Semantic models"],
    language: "en",
    keywords: ["Direct Lake", "fallback", "DirectQuery"],
  },
  {
    id: "fabric-dax",
    title: "CALCULATE and filter context",
    url: "/learn/power-bi/model/",
    kind: "lesson",
    summary: "Which filters a measure sees when CALCULATE runs.",
    topic: ["Power BI", "Semantic models"],
    language: "en",
    keywords: ["DAX", "CALCULATE", "KEEPFILTERS"],
  },
  {
    id: "chartlab-box",
    title: "Box plot lab",
    url: "/explore/charts/box/",
    kind: "lab",
    summary: "Quartiles, fences and outliers on the same observations.",
    topic: ["data visualization", "chart", "box"],
    language: "en",
    keywords: ["box plot", "IQR", "outlier"],
  },
  {
    id: "star-schema",
    title: "Star schema fundamentals",
    url: "/learn/power-bi/model/star-schema/",
    kind: "lesson",
    summary: "Fact tables, dimension tables and the grain of a model.",
    topic: ["Power BI", "Model"],
    language: "en",
    keywords: ["fact table", "dimension", "dimensional model"],
  },
  {
    id: "glossary-bilingual",
    title: "Bilingual glossary",
    url: "/learn/statistics/glossary/",
    kind: "glossary",
    summary: "Statistics terms in English and Arabic.",
    topic: ["statistics", "reference"],
    language: "mixed",
    keywords: ["glossary", "arabic"],
  },
  {
    id: "arabic-histogram",
    title: "المدرج التكراري",
    url: "/learn/ar/histogram/",
    kind: "lesson",
    summary: "توزيع متغير كمي مستمر باستخدام فترات.",
    topic: ["data visualization", "العربية"],
    language: "ar",
    keywords: ["هيستوجرام", "histogram", "bins"],
  },
];

test("normalisation folds case, punctuation, diacritics and Arabic letter variants", () => {
  assert.equal(normalizeSearchText("P-Value"), "p value");
  assert.equal(normalizeSearchText("  Direct   Lake  "), "direct lake");
  assert.equal(normalizeSearchText("المدرج التكراري"), normalizeSearchText("المَدرَج التكراري"));
  assert.equal(normalizeSearchText("أحمد"), normalizeSearchText("احمد"));
  assert.equal(normalizeSearchText("مصطفى"), normalizeSearchText("مصطفي"));
  assert.equal(normalizeSearchText("VACUUM"), normalizeSearchText("vacuum"));
});

test("stop words drop out of question-shaped queries", () => {
  assert.deepEqual(tokenize("What is a star schema?"), ["star", "schema"]);
  assert.deepEqual(tokenize("كيف يعمل المدرج"), ["يعمل", "المدرج"]);
});

test("the benchmark queries reach a relevant destination", () => {
  const cases = [
    { query: "p-value", expect: "lab-p-value" },
    { query: "Direct Lake", expect: "fabric-direct-lake" },
    { query: "DAX", expect: "fabric-dax" },
    { query: "box plot", expect: "chartlab-box" },
    { query: "star schema", expect: "star-schema" },
    { query: "what is a star schema", expect: "star-schema" },
    { query: "المدرج التكراري", expect: "arabic-histogram" },
  ];
  for (const { query, expect } of cases) {
    const results = searchDocuments(docs, query);
    assert.ok(results.length > 0, `${query} returns results`);
    const topThree = results.slice(0, 3).map((row) => row.document.id);
    assert.ok(topThree.includes(expect), `${query} top-3 includes ${expect} (got ${topThree.join(", ")})`);
  }
});

test("matching is whole-word: two-letter tokens never prefix-match a longer word", () => {
  const bi = searchDocuments(docs, "bi").map((row) => row.document.id);
  assert.ok(!bi.includes("glossary-bilingual"), "bi must not match Bilingual");
  const p = searchDocuments(docs, "p").map((row) => row.document.id);
  assert.ok(!p.includes("fabric-dax"), "p must not match Power");
  assert.ok(p.includes("lab-p-value"), "p must still match the word p in p-value");
});

test("three-letter prefixes narrow while typing", () => {
  const results = searchDocuments(docs, "histo").map((row) => row.document.id);
  assert.ok(results.includes("arabic-histogram"));
});

test("every token must match, so extra words narrow the set", () => {
  const broad = searchDocuments(docs, "lake");
  const narrow = searchDocuments(docs, "direct lake");
  assert.ok(narrow.length <= broad.length);
  assert.equal(searchSite(docs, "direct lake").best?.document.id, "fabric-direct-lake");
  assert.equal(searchDocuments(docs, "lake submarine").length, 0);
});

test("title matches outrank summary-only matches", () => {
  assert.equal(searchSite(docs, "box").best?.document.id, "chartlab-box");
});

test("filters narrow by kind and language without dropping the query", () => {
  const labs = searchDocuments(docs, "p", { kinds: ["lab"] });
  assert.ok(labs.every((row) => row.document.kind === "lab"));
  const arabic = searchDocuments(docs, "المدرج", { language: "ar" });
  assert.deepEqual(arabic.map((row) => row.document.id), ["arabic-histogram"]);
  assert.equal(searchDocuments(docs, "p-value", { language: "ar" }).length, 0);
});

test("an empty query returns nothing; the page shows start-here links instead", () => {
  assert.equal(searchSite(docs, "").total, 0);
  assert.equal(searchSite(docs, "   ").shown, 0);
  assert.equal(searchSite(docs, "").best, null);
});

test("the first screen is capped and the best match is not repeated", () => {
  const many = Array.from({ length: 200 }, (_, index) => ({
    id: `synthetic-${index}`,
    title: `Data concept ${index}`,
    url: `/learn/synthetic/${index}/`,
    kind: "lesson",
    summary: "A synthetic lesson about data.",
    topic: ["data"],
    language: "en",
  }));
  const outcome = searchSite(many, "data");
  assert.equal(outcome.total, 200);
  assert.ok(outcome.shown <= RESULT_LIMIT, `shown ${outcome.shown} exceeds ${RESULT_LIMIT}`);
  assert.equal(outcome.refine, true);
  const ids = [outcome.best?.document.id, ...outcome.groups.flatMap((group) => group.items.map((row) => row.document.id))];
  assert.equal(new Set(ids).size, ids.length, "no document is rendered twice");
});

test("a type filter may show more, but never past the hard cap", () => {
  const many = Array.from({ length: 200 }, (_, index) => ({
    id: `lab-${index}`,
    title: `Distribution lab ${index}`,
    url: `/explore/charts/${index}/`,
    kind: "lab",
    summary: "A synthetic lab.",
    topic: ["data visualization"],
    language: "en",
  }));
  const outcome = searchSite(many, "distribution", { kinds: ["lab"] });
  assert.ok(outcome.shown <= 50);
});

test("duplicate titles collapse to one destination", () => {
  const copies = [
    ...docs,
    {
      id: "box-copy",
      title: "Box plot lab",
      url: "/learn/academy/box-plot/",
      kind: "lesson",
      summary: "The same lab mirrored from courseware.",
      topic: ["data visualization"],
      language: "en",
    },
  ];
  const rows = searchSite(copies, "box plot");
  const titles = [
    rows.best?.document.title,
    ...rows.groups.flatMap((group) => group.items.map((row) => row.document.title)),
  ].filter(Boolean);
  assert.equal(new Set(titles).size, titles.length);
});

test("scoring is deterministic and symmetric for repeated calls", () => {
  const first = searchDocuments(docs, "fabric").map((row) => row.document.id);
  const second = searchDocuments(docs, "fabric").map((row) => row.document.id);
  assert.deepEqual(first, second);
  assert.ok(scoreDocument(docs[2], ["lake"]) > 0);
  assert.equal(scoreDocument(docs[2], ["zzz"]), 0);
});
