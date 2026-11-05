// FC07 — fabric scorer stability and documented weights.
//
//   node --experimental-strip-types --test tests/fabric-corpus/search/
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  FABRIC_PHRASE_BOOSTS,
  FABRIC_WEIGHTS,
  buildSnippet,
  rankFabricArticles,
  scoreFabricArticle,
  FABRIC_RESULT_LIMIT,
} from "../../../lib/search/fabric-scorer.ts";

function article(overrides = {}) {
  return {
    articleId: "art:test/article",
    logicalPath: "/learn/fabric/docs/test/article/",
    title: "Test article about lakehouses",
    family: "test",
    terms: "lakehouse shortcut copy",
    sections: [
      { heading: "Overview", anchor: "overview", text: "A lakehouse combines storage and compute.", kind: "section" },
      { heading: "Shortcuts", anchor: "shortcuts", text: "Shortcuts reference external data without copying it.", kind: "section" },
    ],
    ...overrides,
  };
}

test("field weights order title > headings > body > nothing", () => {
  assert.ok(FABRIC_WEIGHTS.title > FABRIC_WEIGHTS.headings);
  assert.ok(FABRIC_WEIGHTS.headings > FABRIC_WEIGHTS.body);
  assert.ok(FABRIC_WEIGHTS.body > 0);
  assert.ok(FABRIC_WEIGHTS.terms > FABRIC_WEIGHTS.body && FABRIC_WEIGHTS.terms < FABRIC_WEIGHTS.headings);

  // Same token, same tf, different field → title ranks above heading-only.
  const titleHit = rankFabricArticles([article({ logicalPath: "/a/", sections: [] })], "lakehouses")[0];
  const headingHit = rankFabricArticles(
    [
      article({
        articleId: "art:test/heading",
        logicalPath: "/b/",
        title: "Unrelated title",
        terms: "",
        sections: [{ heading: "Lakehouses", anchor: "x", text: " filler filler filler filler filler filler ", kind: "section" }],
      }),
    ],
    "lakehouses",
  )[0];
  assert.ok(titleHit && headingHit);
  assert.ok(titleHit.score > headingHit.score, "title hit must outrank heading-only hit");
});

test("exact-phrase boost applies on top of token scores", () => {
  const tokens = ["star", "schema"];
  // Both articles carry the same title, terms, heading token counts and body —
  // they differ ONLY in adjacency, isolating the phrase boost.
  const withPhrase = article({
    articleId: "art:test/phrase",
    logicalPath: "/p/",
    sections: [{ heading: "Star schema", anchor: "s", text: "Design is a dimensional model.", kind: "section" }],
  });
  const noPhrase = article({
    articleId: "art:test/plain",
    logicalPath: "/n/",
    sections: [{ heading: "Schema star", anchor: "s", text: "Design is a dimensional model.", kind: "section" }],
  });
  const phraseHit = scoreFabricArticle(withPhrase, tokens, "star schema");
  const plainHit = scoreFabricArticle(noPhrase, tokens, "star schema");
  assert.ok(phraseHit && plainHit);
  const phrasePart = phraseHit.score - plainHit.score;
  assert.equal(phrasePart, FABRIC_PHRASE_BOOSTS.heading, "heading phrase boost applied exactly once");
});

test("term frequency saturates (tf/(tf+2))", () => {
  const once = article({ sections: [{ heading: "Shortcuts", anchor: "s", text: "one shortcut here", kind: "section" }] });
  const thrice = article({ sections: [{ heading: "Shortcuts", anchor: "s", text: "shortcut shortcut shortcut plus one shortcut here", kind: "section" }] });
  const a = scoreFabricArticle(once, ["shortcut"], "shortcut");
  const b = scoreFabricArticle(thrice, ["shortcut"], "shortcut");
  assert.ok(b.score > a.score, "more occurrences rank higher");
  // Saturation: 1→3 occurrences gains less than 0→1 did.
  const deltaFirst = a.score;
  const deltaThird = b.score - a.score;
  assert.ok(deltaThird < deltaFirst, "tf saturation: diminishing returns after the second hit");
});

test("tie-break by logicalPath for determinism", () => {
  const make = (logicalPath) =>
    article({
      articleId: `art:test/${logicalPath}`,
      logicalPath,
      title: "Mirror provisioning",
      terms: "mirror",
      sections: [{ heading: "Mirror", anchor: "m", text: "mirror mirror", kind: "section" }],
    });
  const hits = rankFabricArticles(
    [make("/learn/fabric/docs/zeta/"), make("/learn/fabric/docs/alpha/"), make("/learn/fabric/docs/mid/")],
    "mirror",
  );
  assert.deepEqual(
    hits.map((hit) => hit.logicalPath),
    ["/learn/fabric/docs/alpha/", "/learn/fabric/docs/mid/", "/learn/fabric/docs/zeta/"],
    "equal scores sort by logicalPath ascending",
  );
});

test("all-token gate: every token must match somewhere", () => {
  const hits = rankFabricArticles([article()], "lakehouse shortcuts");
  assert.equal(hits.length, 1);
  const miss = rankFabricArticles([article()], "lakehouse unrelatedtoken");
  assert.equal(miss.length, 0);
});

test("result limit and snippet keep the query terms intact", () => {
  const many = [];
  for (let index = 0; index < 20; index += 1) {
    many.push(
      article({
        articleId: `art:test/${index}`,
        logicalPath: `/learn/fabric/docs/test/${index}/`,
        title: `Shortcut article ${index}`,
        sections: [{ heading: "Shortcuts", anchor: "s", text: `Shortcut ${index} references external data without copying.`, kind: "section" }],
      }),
    );
  }
  const hits = rankFabricArticles(many, "shortcut", { limit: FABRIC_RESULT_LIMIT });
  assert.equal(hits.length, FABRIC_RESULT_LIMIT);
  assert.equal(hits.every((hit) => hit.kind === "fabric-docs"), true);
  const snippet = hits[0].snippet.toLowerCase();
  assert.ok(snippet.includes("shortcut"), "snippet carries the matched term verbatim");
});

test("snippet window: term present, boundaries respected", () => {
  const longText = `${"filler ".repeat(200)}the shortcut feature arrives here ${"tail ".repeat(200)}`;
  const snippet = buildSnippet("Shortcuts", longText, ["shortcut"]);
  assert.ok(snippet.includes("shortcut"));
  assert.ok(snippet.length <= 320, "snippet stays a window, not the section");
  const headingFallback = buildSnippet("Shortcuts only", "", ["shortcut"]);
  assert.equal(headingFallback, "Shortcuts only");
});
