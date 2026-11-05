// FC06 — secondary binding rules.
//
//   node --experimental-strip-types --test tests/fabric-corpus/bindings/
//
// (c) secondary rows are cross-subject placements ONLY, at most 2 per
//     article, each carrying a rule id from the documented rule set, with
//     rule-consistent targets.

import assert from "node:assert/strict";
import { test } from "node:test";

import { bindings, primary, secondary, REGISTRY_AVAILABLE, publishedArticles } from "./helpers.mjs";

const RULE_IDS = new Set(secondary.rules.map((rule) => rule.id));

test("secondary rows are capped at 2 per article", () => {
  const perArticle = new Map();
  for (const row of secondary.rows) {
    perArticle.set(row.articleId, (perArticle.get(row.articleId) ?? 0) + 1);
  }
  for (const [articleId, count] of perArticle) {
    assert.ok(count <= 2, `${articleId} carries ${count} secondaries (cap is 2)`);
  }
  assert.equal(
    secondary.counts.secondary,
    secondary.rows.length,
    "secondary.json counts.secondary must equal the row count",
  );
  assert.equal(
    secondary.counts.articlesWithSecondaries,
    perArticle.size,
    "secondary.json counts.articlesWithSecondaries must match the rows",
  );
});

test("every secondary row carries a documented rule id", () => {
  assert.ok(RULE_IDS.size >= 1, "secondary.json must document at least one rule");
  for (const row of secondary.rows) {
    assert.ok(
      typeof row.ruleId === "string" && RULE_IDS.has(row.ruleId),
      `secondary row ${row.articleId} has unknown rule id '${row.ruleId}'`,
    );
    assert.match(row.ruleId, /^S-/, "secondary rule ids are prefixed S-");
  }
  const byRule = {};
  for (const row of secondary.rows) byRule[row.ruleId] = (byRule[row.ruleId] ?? 0) + 1;
  assert.deepEqual(secondary.counts.byRule, byRule, "counts.byRule must match the rows");
  assert.deepEqual(bindings.getSecondaryBindingsByRule(), secondary.counts.byRule);
});

test("secondaries are cross-subject and never duplicate the primary target", () => {
  const primaryByArticle = new Map(primary.rows.map((row) => [row.articleId, row]));
  const seen = new Set();
  for (const row of secondary.rows) {
    const key = `${row.articleId}|${row.subject}|${row.topic}`;
    assert.ok(!seen.has(key), `duplicate secondary placement ${key}`);
    seen.add(key);
    assert.notEqual(
      row.subject,
      "fabric",
      "secondaries are cross-subject placements and never target fabric",
    );
    const primaryRow = primaryByArticle.get(row.articleId);
    assert.ok(primaryRow, `secondary row references unbound article ${row.articleId}`);
    assert.notEqual(
      `${row.subject}.${row.topic}`,
      `${primaryRow.subject}.${primaryRow.topic}`,
      `secondary for ${row.articleId} repeats its primary target`,
    );
  }
});

test("each rule fires only for its documented evidence", () => {
  if (!REGISTRY_AVAILABLE) return; // denormalized family/kind checks need the registry
  const published = publishedArticles();
  const primaryByArticle = new Map(primary.rows.map((row) => [row.articleId, row]));
  for (const row of secondary.rows) {
    const primaryRow = primaryByArticle.get(row.articleId);
    const article = published.get(row.articleId);
    assert.ok(article && primaryRow);
    if (row.ruleId === "S-SQL-DIALECT") {
      assert.equal(article.family, "database", "S-SQL-DIALECT fires only in the database family");
      assert.equal(row.subject, "sql");
    } else if (row.ruleId === "S-POWERBI-FRONTMATTER") {
      assert.equal(row.subject, "power-bi");
      assert.ok(["govern", "model"].includes(row.topic), "power-bi target must be govern or model");
    } else if (row.ruleId === "S-DATA-SCIENCE-ANALYSIS") {
      assert.equal(article.family, "data-science", "S-DATA-SCIENCE-ANALYSIS fires only in the data-science family");
      assert.equal(`${row.subject}.${row.topic}`, "analysis.overview");
    } else if (row.ruleId === "S-SEMLINK-ANALYSIS") {
      assert.notEqual(article.family, "data-science", "semantic-link hits inside data-science use S-DATA-SCIENCE-ANALYSIS");
      assert.equal(`${row.subject}.${row.topic}`, "analysis.overview");
    }
  }
});

test("loader returns the same secondaries as the artifact", () => {
  const byArticle = new Map();
  for (const row of secondary.rows) {
    byArticle.set(row.articleId, [...(byArticle.get(row.articleId) ?? []), row]);
  }
  // Spot-check a spread of articles plus every article that HAS secondaries.
  const candidates = new Set([...byArticle.keys()]);
  for (const row of primary.rows.slice(0, 25)) candidates.add(row.articleId);
  for (const articleId of candidates) {
    const expected = byArticle.get(articleId) ?? [];
    const actual = bindings.getSecondaryBindings(articleId);
    assert.equal(actual.length, expected.length, `secondary count mismatch for ${articleId}`);
  }
  for (const doc of bindings.getSecondaryRuleDocs()) {
    assert.ok(RULE_IDS.has(doc.id), `loader rule doc '${doc.id}' unknown`);
    assert.ok(doc.description.length > 0, `rule ${doc.id} needs a description`);
  }
});
