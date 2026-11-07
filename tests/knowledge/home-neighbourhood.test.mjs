import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("the Home asks for the public Atlas explicitly, never the env-driven one", () => {
  const landing = read("components/knowledge/hansa-landing.tsx");
  assert.match(landing, /getAtlasPublic\(\)/);
  assert.doesNotMatch(
    landing,
    /getAtlas\(\)/,
    "the Home must not inherit an accidentally enabled review projection",
  );
  assert.match(
    landing,
    /process\.env\.HANSA_NEIGHBOURHOOD_REVIEW === "1" \? getAtlasReview\(\) : null/,
    "candidate records exist only inside the separate review switch",
  );
});

test("the candidate neighbourhood is lazy and the public branch survives", () => {
  const scene = read("components/knowledge/stage-knowledge.tsx");
  assert.match(scene, /EditionNeighbourhoodLazy/);
  assert.match(scene, /neighbourhood && insight \?/);
  assert.match(scene, /model\.graph\.discovery/, "the public destinations remain reachable");

  const lazy = read("components/knowledge/neighbourhood/edition-lazy.tsx");
  assert.match(lazy, /ssr:\s*false/);
  assert.match(lazy, /import\("\.\/edition"\)/);
});

test("the Atlas desk returns to the edition that sent the reader", () => {
  const explorer = read("components/atlas/explorer.tsx");
  assert.match(explorer, /readEditionReturn/);
  assert.match(explorer, /homeEditionHref\(returnEdition\)/);
});

test("R1 stays the accepted surface: the embed opts in, it does not change it", () => {
  const review = read("components/knowledge/neighbourhood/review.tsx");
  assert.doesNotMatch(review, /atlasHref=/);
  assert.doesNotMatch(review, /headingLevel=/);
  const field = read("components/knowledge/neighbourhood/field.tsx");
  assert.match(field, /headingLevel = "h2"/, "the review page keeps its h2 centre");
});
