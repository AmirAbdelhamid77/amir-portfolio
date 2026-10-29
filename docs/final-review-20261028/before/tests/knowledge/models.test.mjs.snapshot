import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  INITIAL_EXPERIMENT,
  cardBody,
  deriveVerdict,
  experimentFor,
  insightCards,
} from "../../lib/knowledge/models.ts";

const feed = JSON.parse(
  fs.readFileSync(new URL("../../content/knowledge/insights.json", import.meta.url), "utf8"),
);

const retention = feed.items.find((item) => item.id.includes("shortcut-reference"));
const deletion = feed.items.find((item) => item.id.includes("shortcut-delete"));
const discovery = feed.items.find((item) => item.id.includes("shortcut-discovery"));

test("every preview edition maps to the interaction its objective supports", () => {
  assert.equal(experimentFor(retention), "retention");
  assert.equal(experimentFor(deletion), "deletion");
  assert.equal(experimentFor(discovery), "discovery");
  assert.equal(
    experimentFor({ ...retention, id: "hansa-insight-unmatched-v1" }),
    null,
  );
});

test("the retention model derives a different pattern from the same input", () => {
  const reference = deriveVerdict("retention", { ...INITIAL_EXPERIMENT, retained: false });
  const copy = deriveVerdict("retention", { ...INITIAL_EXPERIMENT, retained: true });

  assert.notEqual(reference.headline, copy.headline);
  assert.equal(reference.tone, "positive");
  assert.equal(copy.tone, "caution");
  assert.equal(reference.rows.at(-1).state, "not needed");
  assert.equal(copy.rows.at(-1).state, "required");
  // The caveat stays attached: a shortcut is never described as a retained result.
  assert.match(copy.detail, /not a retained, transformed snapshot/);
});

test("the deletion model distinguishes the reference object from its target", () => {
  const remove = deriveVerdict("deletion", { ...INITIAL_EXPERIMENT, action: "remove-shortcut" });
  const through = deriveVerdict("deletion", { ...INITIAL_EXPERIMENT, action: "delete-through" });

  assert.equal(remove.rows[1].state, "unchanged");
  assert.equal(through.rows[0].state, "remains");
  assert.equal(through.rows[1].state, "can be deleted");
  assert.match(through.detail, /write permissions/);
});

test("table discovery needs both Tables and supported table data", () => {
  const cases = [
    { location: "tables", data: "delta", expected: true },
    { location: "tables", data: "files", expected: false },
    { location: "files", data: "delta", expected: false },
    { location: "files", data: "files", expected: false },
  ];
  for (const entry of cases) {
    const verdict = deriveVerdict("discovery", {
      ...INITIAL_EXPERIMENT,
      location: entry.location,
      data: entry.data,
    });
    assert.equal(verdict.tone === "positive", entry.expected, JSON.stringify(entry));
    assert.equal(verdict.rows.at(-1).state, entry.expected ? "possible" : "no");
  }
});

test("derived cards use stable IDs and never invent a fourth claim", () => {
  const first = insightCards(retention);
  const second = insightCards(retention);

  assert.deepEqual(first.map((card) => card.id), second.map((card) => card.id));
  assert.deepEqual(
    first.map((card) => card.kind),
    ["principle", "caveat", "evidence"],
  );
  assert.equal(new Set(first.map((card) => card.id)).size, 3);
  for (const card of first) {
    assert.ok(card.id.startsWith(retention.id));
    assert.ok(card.preview.split(/\s+/).length <= 16, card.preview);
    assert.ok(card.label.length > 0);
  }
});

test("card bodies quote the reviewed fields and keep their destinations", () => {
  const principle = cardBody(retention, "principle");
  const caveat = cardBody(retention, "caveat");
  const evidence = cardBody(retention, "evidence");

  assert.equal(principle.quote, retention.takeaway);
  assert.equal(principle.href, retention.lessonHref);
  assert.equal(caveat.quote, retention.caveat);
  assert.equal(caveat.href, retention.practiceHref);
  assert.equal(evidence.quote, retention.sourceLocator);
  assert.equal(evidence.href, retention.sourceUrl);
  assert.match(evidence.note, /human publication review pending/);
});

test("derivation does not mutate the edition", () => {
  const before = JSON.stringify(feed.items);
  for (const item of feed.items) {
    const id = experimentFor(item);
    if (!id) continue;
    deriveVerdict(id, INITIAL_EXPERIMENT);
    insightCards(item).forEach((card) => cardBody(item, card.kind));
  }
  assert.equal(JSON.stringify(feed.items), before);
});
