// Guards for the knowledge neighbourhood model (R1).
//
// These run against the real candidate Atlas: 42 concepts, 49 semantic edges,
// all technical review, zero published. The model is the only selector the
// review surface uses, so these tests assert the rules that keep it honest:
// grouping, stored direction, a fair branch budget, membership that is not a
// relation, search, entrances and a deterministic non-overlapping layout.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { projectAtlas } from "../../lib/atlas/model.ts";
import {
  DEFAULT_LIMIT,
  GROUPS,
  buildEntrances,
  buildNeighbourhood,
  degreeMap,
  edgePath,
  groupNote,
  kindLabel,
  layoutNeighbourhood,
  searchNeighbourhood,
} from "../../lib/knowledge/neighbourhood.ts";

const docs = ["editorial", "dp600-extension", "dp600-continuation"].map((name) =>
  JSON.parse(readFileSync(`content/atlas/${name}.json`, "utf8")),
);
const merged = {
  ...docs[0],
  concepts: docs.flatMap((doc) => doc.concepts),
  semanticEdges: docs.flatMap((doc) => doc.semanticEdges),
  sources: docs.flatMap((doc) => doc.sources),
  catalog: docs.flatMap((doc) => doc.catalog),
  toc: docs.flatMap((doc) => doc.toc),
};
const atlas = projectAtlas(merged, true);

test("the candidate corpus is the one the review expects", () => {
  assert.equal(atlas.concepts.length, 42);
  assert.equal(atlas.semanticEdges.length, 49);
  assert.ok(atlas.concepts.every((concept) => concept.editorialState === "technical_review"));
  assert.equal(new Set(atlas.semanticEdges.map((edge) => edge.id)).size, 49);
});

test("every concept has a neighbourhood and no edge is counted twice", () => {
  const degree = degreeMap(atlas);
  for (const concept of atlas.concepts) {
    const model = buildNeighbourhood(atlas, concept.id);
    assert.ok(model, concept.id);
    assert.equal(model.total, degree.get(concept.id));
    const ids = model.shown.concat(model.hidden).map((entry) => entry.edge.id);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(model.shown.length + model.hidden.length, model.total);
    assert.equal(model.hiddenCount, model.hidden.length);
  }
});

test("unknown concepts return null instead of a fabricated centre", () => {
  assert.equal(buildNeighbourhood(atlas, "concept:missing"), null);
  assert.equal(buildNeighbourhood(projectAtlas(merged), "concept:fabric:shortcut"), null);
});

test("groups and stored direction agree with the relation type", () => {
  for (const concept of atlas.concepts) {
    const model = buildNeighbourhood(atlas, concept.id, { expand: true });
    for (const entry of model.shown) {
      const edge = entry.edge;
      assert.ok(
        ["requires_understanding_of", "contrasts_with", "tradeoff_with", "enables", "complements", "related_in_decision", "part_of_mechanism"].includes(
          edge.relationType,
        ),
      );
      if (entry.group === "requires") {
        assert.equal(edge.relationType, "requires_understanding_of");
        assert.equal(edge.from, concept.id);
        assert.equal(entry.direction, "out");
        assert.match(entry.directionSentence, /requires understanding of .* first/);
      } else if (entry.group === "unlocks") {
        assert.equal(edge.relationType, "requires_understanding_of");
        assert.equal(edge.to, concept.id);
        assert.equal(entry.direction, "in");
        assert.match(entry.directionSentence, /requires understanding of this concept first/);
      } else if (entry.group === "contrasts") {
        assert.ok(["contrasts_with", "tradeoff_with"].includes(edge.relationType));
        assert.equal(entry.direction, "symmetric");
      } else {
        assert.ok(["enables", "complements", "related_in_decision", "part_of_mechanism"].includes(edge.relationType));
        assert.equal(entry.group, "related");
        assert.ok(entry.relationLabel.length > 0);
      }
    }
    assert.deepEqual(
      model.groups.map((group) => group.key),
      GROUPS.map((group) => group.key),
    );
  }
});

test("the branch budget never starves an occupied group", () => {
  let multiGroup = 0;
  for (const concept of atlas.concepts) {
    const model = buildNeighbourhood(atlas, concept.id);
    const occupied = model.groups.filter((group) => group.count > 0);
    if (occupied.length > 1) multiGroup += 1;
    for (const group of occupied) {
      assert.ok(
        group.entries.some((entry) => entry.shown),
        `${concept.title}: ${group.key} has no visible branch`,
      );
    }
    assert.ok(model.shown.length <= DEFAULT_LIMIT);
    assert.ok(model.shown.length <= model.total);
  }
  assert.ok(multiGroup >= 15, "the corpus should exercise multi-group neighbourhoods");
});

test("expand reveals every branch and the hidden count is honest", () => {
  const concept = atlas.concepts.find((item) => item.title === "Database Mirroring");
  const limited = buildNeighbourhood(atlas, concept.id);
  const expanded = buildNeighbourhood(atlas, concept.id, { expand: true });
  assert.equal(limited.total, 6);
  assert.equal(limited.hiddenCount, 0);
  assert.equal(expanded.shown.length, 6);

  const busy = atlas.concepts.find((item) => item.title === "Direct Lake");
  const busyLimited = buildNeighbourhood(atlas, busy.id, { limit: 3 });
  const busyExpanded = buildNeighbourhood(atlas, busy.id, { expand: true });
  assert.equal(busyLimited.shown.length, 3);
  assert.equal(busyLimited.hiddenCount, busyLimited.total - 3);
  assert.equal(busyExpanded.hiddenCount, 0);
  assert.equal(busyExpanded.shown.length, busyExpanded.total);
});

test("same-kind membership is context, never a relation", () => {
  const model = buildNeighbourhood(atlas, "concept:fabric:shortcut");
  const neighbourIds = new Set(model.shown.concat(model.hidden).map((entry) => entry.concept.id));
  assert.ok(model.membership.count > 0);
  assert.equal(model.membership.label, "Technology mechanism");
  assert.ok(model.membership.starters.every((concept) => !neighbourIds.has(concept.id)));
  assert.ok(model.membership.starters.every((concept) => concept.id !== model.centre.id));
  assert.ok(model.membership.starters.every((concept) => concept.kind === model.centre.kind));
  for (const member of model.membership.starters) {
    assert.ok(!model.shown.some((entry) => entry.concept.id === member.id));
  }
});

test("evidence and reading resolve to real records", () => {
  const model = buildNeighbourhood(atlas, "concept:fabric:rls");
  assert.ok(model.evidence.length >= model.centre.sourceIds.length);
  const sourceIds = new Set(atlas.sources.map((source) => source.id));
  assert.ok(model.evidence.every((source) => sourceIds.has(source.id)));
  assert.ok(model.reading.every((resource) => resource.conceptIds.includes(model.centre.id)));
  assert.deepEqual(model.published, { concepts: 0, edges: 0 });
});

test("search covers title, aliases and definition, title first", () => {
  assert.equal(searchNeighbourhood(atlas, "shortcut")[0].title, "OneLake shortcuts");
  assert.ok(searchNeighbourhood(atlas, "shortcuts").some((concept) => concept.title === "OneLake shortcuts"));
  assert.ok(searchNeighbourhood(atlas, "اختصار").some((concept) => concept.title === "OneLake shortcuts"));
  const defined = searchNeighbourhood(atlas, "delta tables");
  assert.ok(defined.some((concept) => concept.id === "concept:fabric:lakehouse"));
  assert.equal(searchNeighbourhood(atlas, "").length, 0);
  assert.ok(searchNeighbourhood(atlas, "zzzzzz").length === 0);
  assert.ok(searchNeighbourhood(atlas, "security").length <= 6);
  const ranked = searchNeighbourhood(atlas, "security");
  assert.ok(ranked[0].title.toLowerCase().includes("security"));
});

test("entrances rank real starters by degree and report real counts", () => {
  const entrances = buildEntrances(atlas);
  assert.equal(entrances.total.length, 42);
  assert.equal(entrances.edges, 49);
  assert.equal(entrances.starters[0].title, "Direct Lake");
  const degree = degreeMap(atlas);
  for (let index = 1; index < entrances.starters.length; index += 1) {
    assert.ok((degree.get(entrances.starters[index - 1].id) ?? 0) >= (degree.get(entrances.starters[index].id) ?? 0));
  }
  const counts = Object.fromEntries(entrances.kinds.map((kind) => [kind.key, kind.count]));
  assert.deepEqual(counts, { technology_mechanism: 36, method: 3, decision_principle: 2, fundamental_concept: 1 });
  assert.ok(entrances.kinds.every((kind) => kind.starter?.kind === kind.key));
  assert.deepEqual(entrances.published, { concepts: 0, edges: 0 });
  assert.equal(kindLabel("unknown_kind"), "Concept");
  assert.ok(groupNote("requires").length > 0);
});

test("layout places every shown branch, in bounds, with room between neighbours", () => {
  let checked = 0;
  for (const concept of atlas.concepts) {
    for (const expand of [false, true]) {
      const model = buildNeighbourhood(atlas, concept.id, { expand });
      const placements = layoutNeighbourhood(model.groups);
      assert.equal(placements.length, model.shown.length);
      for (const placement of placements) {
        assert.ok(placement.x >= 5 && placement.x <= 95, `${concept.title}: x ${placement.x}`);
        assert.ok(placement.y >= 5 && placement.y <= 95, `${concept.title}: y ${placement.y}`);
      }
      for (let a = 0; a < placements.length; a += 1) {
        for (let b = a + 1; b < placements.length; b += 1) {
          const delta = Math.abs(placements[a].angle - placements[b].angle) % 360;
          const separation = Math.min(delta, 360 - delta);
          assert.ok(separation > 10, `${concept.title}: two branches ${separation}deg apart`);
        }
      }
      checked += 1;
    }
  }
  assert.equal(checked, 84);
});

test("branch cards never overlap at the two field sizes the CSS produces", () => {
  // Mirrors `neighbourhood.css`: the field is 1190x560 at a 1280 viewport with
  // 168x66 cards, and 940x451 at 1024 with 146x66 cards; below 1024 the field is
  // a list, so those are the only two fan sizes.
  const fields = [
    { name: "1280", w: 1190, h: 560, card: { w: 168, h: 66 } },
    { name: "1024", w: 940, h: 451, card: { w: 146, h: 66 } },
  ];
  let checked = 0;
  for (const concept of atlas.concepts) {
    for (const expand of [false, true]) {
      const model = buildNeighbourhood(atlas, concept.id, { expand });
      const placements = layoutNeighbourhood(model.groups);
      for (const field of fields) {
        const boxes = placements.map((placement) => ({
          title: model.shown.find((entry) => entry.edge.id === placement.id)?.concept.title ?? placement.id,
          x: (placement.x / 100) * field.w,
          y: (placement.y / 100) * field.h,
        }));
        for (const box of boxes) {
          const gap = Math.min(
            box.x - field.card.w / 2,
            field.w - (box.x + field.card.w / 2),
            box.y - field.card.h / 2,
            field.h - (box.y + field.card.h / 2),
          );
          assert.ok(gap >= 8, `${concept.title} @${field.name}: ${box.title} sits ${Math.round(gap)} px from the edge`);
        }
        for (let a = 0; a < boxes.length; a += 1) {
          for (let b = a + 1; b < boxes.length; b += 1) {
            const overlapX = field.card.w - Math.abs(boxes[a].x - boxes[b].x);
            const overlapY = field.card.h - Math.abs(boxes[a].y - boxes[b].y);
            assert.ok(
              overlapX <= 0 || overlapY <= 0,
              `${concept.title} @${field.name}: ${boxes[a].title} and ${boxes[b].title} overlap ${Math.round(overlapX)}x${Math.round(overlapY)} px`,
            );
          }
        }
        checked += 1;
      }
    }
  }
  assert.equal(checked, 168);
});

test("a single occupied group sits on the left, and empty groups take no space", () => {
  const one = layoutNeighbourhood([
    { key: "requires", entries: [{ edge: { id: "e1" } }] },
    { key: "unlocks", entries: [] },
    { key: "contrasts", entries: [] },
    { key: "related", entries: [] },
  ]);
  assert.equal(one.length, 1);
  assert.equal(one[0].angle, 180);
  assert.ok(one[0].x < 20);
  assert.equal(one[0].y, 50);
  assert.deepEqual(layoutNeighbourhood([]), []);
});

test("the edge path starts at the centre and ends at the branch", () => {
  const path = edgePath({ x: 50, y: 50 }, { x: 20, y: 30 });
  assert.match(path, /^M 50 50 Q /);
  assert.ok(path.endsWith("20 30"));
});
