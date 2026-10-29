// Tests for the site-wide search primitives.
//
// These run the pure query functions against a small fixed corpus, so a change to
// normalisation or ranking fails here rather than in a browser. The v2 plan's
// benchmark queries (p-value, Direct Lake, DAX, box plot, المدرج التكراري) are
// asserted against a corpus shaped like the real index.
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  normalizeSearchText,
  scoreDocument,
  searchDocuments,
} from "../../lib/search/query.ts";

const docs = [
  {
    id: "section-21",
    title: "21. Hypothesis testing",
    url: "/learn/statistics/journey/hypothesis/#s21",
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
    url: "/lab/dp-600/explore/?question=fb-direct-lake",
    kind: "question",
    summary: "When a semantic model falls back to DirectQuery.",
    topic: ["Microsoft Fabric / DP-600", "Semantic models & Direct Lake"],
    language: "en",
    keywords: ["Direct Lake", "fallback", "DirectQuery"],
  },
  {
    id: "fabric-dax",
    title: "CALCULATE and filter context",
    url: "/lab/dp-600/explore/?question=fb-dax",
    kind: "question",
    summary: "Which filters a measure sees when CALCULATE runs.",
    topic: ["Microsoft Fabric / DP-600", "Semantic models & Direct Lake", "DP-600 3.1"],
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
    id: "arabic-histogram",
    title: "المدرج التكراري",
    url: "/learn/ar/histogram/",
    kind: "lesson",
    summary: "توزيع متغير كمي مستمر باستخدام فترات.",
    topic: ["data visualization", "العربية"],
    language: "ar",
    keywords: ["هيستوجرام", "بins"],
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

test("the v2 benchmark queries reach a relevant destination", () => {
  const cases = [
    { query: "p-value", expect: "lab-p-value" },
    { query: "Direct Lake", expect: "fabric-direct-lake" },
    { query: "DAX", expect: "fabric-dax" },
    { query: "box plot", expect: "chartlab-box" },
    { query: "المدرج التكراري", expect: "arabic-histogram" },
  ];
  for (const { query, expect } of cases) {
    const results = searchDocuments(docs, query);
    assert.ok(results.length > 0, `${query} returns results`);
    const topThree = results.slice(0, 3).map((row) => row.document.id);
    assert.ok(topThree.includes(expect), `${query} top-3 includes ${expect} (got ${topThree.join(", ")})`);
  }
});

test("every token must match, so extra words narrow the set", () => {
  const broad = searchDocuments(docs, "lake");
  const narrow = searchDocuments(docs, "direct lake");
  assert.ok(narrow.length <= broad.length);
  assert.equal(narrow[0]?.document.id, "fabric-direct-lake");
  assert.equal(searchDocuments(docs, "lake submarine").length, 0);
});

test("title matches outrank summary-only matches", () => {
  const results = searchDocuments(docs, "box");
  assert.equal(results[0].document.id, "chartlab-box");
});

test("filters narrow by kind and language without dropping the query", () => {
  const labs = searchDocuments(docs, "p", { kinds: ["lab"] });
  assert.ok(labs.every((row) => row.document.kind === "lab"));
  const arabic = searchDocuments(docs, "", { language: "ar" });
  assert.deepEqual(arabic.map((row) => row.document.id), ["arabic-histogram"]);
  assert.equal(searchDocuments(docs, "p-value", { language: "ar" }).length, 0);
});

test("an empty query lists everything rather than nothing", () => {
  assert.equal(searchDocuments(docs, "").length, docs.length);
  assert.equal(searchDocuments(docs, "   ").length, docs.length);
});

test("scoring is deterministic and symmetric for repeated calls", () => {
  const first = searchDocuments(docs, "fabric").map((row) => row.document.id);
  const second = searchDocuments(docs, "fabric").map((row) => row.document.id);
  assert.deepEqual(first, second);
  assert.ok(scoreDocument(docs[2], ["fabric"]) > 0);
  assert.equal(scoreDocument(docs[2], ["zzz"]), 0);
});
