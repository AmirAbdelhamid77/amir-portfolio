// Guards for the expanding knowledge tree.
//
// These tests use the generated subject, programme and Academy payloads. They
// assert the rules a learner experiences: subject roots are disjoint and
// collapsed by default, paging adds at most twelve children, the 150-node cap
// is enforced, search opens the deep path it found, URLs round-trip, empty
// packs stay hidden, and the radial map is deterministic with non-overlapping
// default labels.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildTreeIndex,
  emptyState,
  parseTreeUrl,
  revealNode,
  searchTree,
  serializeTreeUrl,
  showMore,
  toggleKeepBranches,
  toggleNode,
  visibleNodes,
} from "../../lib/knowledge-graph/tree-model.ts";
import {
  layoutRadial,
  nodeRadiusFor,
  VIEW_HALF_H,
  VIEW_HALF_W,
} from "../../lib/knowledge-graph/tree-layout.ts";
import { placeLabels, truncateLabel } from "../../lib/knowledge-graph/tree-labels.ts";

const subject = JSON.parse(readFileSync("public/graph/tree.json", "utf8"));
const dp600 = JSON.parse(readFileSync("public/graph/tree-dp600.json", "utf8"));
const rti = JSON.parse(readFileSync("public/graph/tree-rti.json", "utf8"));
const academy = JSON.parse(readFileSync("public/graph/tree-academy.json", "utf8"));

const subjectIndex = buildTreeIndex(subject);

function boxes(labels) {
  return labels.map((label) => ({
    id: label.id,
    x1: label.anchor === "start" ? label.x : label.anchor === "end" ? label.x - label.width : label.x - label.width / 2,
    x2: label.anchor === "start" ? label.x + label.width : label.anchor === "end" ? label.x : label.x + label.width / 2,
    y1: label.y - label.height / 2,
    y2: label.y + label.height / 2,
  }));
}

function assertNoLabelOverlaps(labels) {
  const rows = boxes(labels);
  for (let i = 0; i < rows.length; i += 1) {
    for (let j = i + 1; j < rows.length; j += 1) {
      const a = rows[i];
      const b = rows[j];
      const overlap = a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
      assert.equal(overlap, false, `${a.id} overlaps ${b.id}`);
    }
  }
}

function openPath(index, ids) {
  let state = emptyState("subject");
  for (const id of ids) {
    const result = toggleNode(index, state, id);
    assert.equal(result.blocked, false, `opening ${id} was blocked`);
    state = result.state;
  }
  return state;
}

test("the default subject view is eight roots and nothing else", () => {
  const visible = visibleNodes(subjectIndex, emptyState("subject"));
  assert.equal(visible.nodes.length, 8);
  assert.equal(visible.dataCount, 8);
  assert.equal(visible.capReached, false);
  assert.ok(visible.nodes.every((entry) => entry.depth === 0));
  assert.deepEqual(
    visible.nodes.map((entry) => entry.node.id).sort(),
    subject.roots.slice().sort(),
  );
});

test("the default map labels every root, without overlap", () => {
  const visible = visibleNodes(subjectIndex, emptyState("subject"));
  const layout = layoutRadial(visible.nodes);
  const result = placeLabels({
    visible: visible.nodes,
    positions: layout.positions,
    focus: null,
    selected: null,
    zoom: 1,
    overview: false,
  });
  assert.equal(result.labels.length, 8, "one label per root");
  assert.equal(result.skipped, 0);
  assertNoLabelOverlaps(result.labels);
  for (const label of result.labels) {
    assert.ok(label.x - label.width >= -VIEW_HALF_W - 1);
    assert.ok(label.x + label.width <= VIEW_HALF_W + 1);
    assert.ok(label.y - label.height / 2 >= -VIEW_HALF_H - 1);
    assert.ok(label.y + label.height / 2 <= VIEW_HALF_H + 1);
    assert.ok(label.text.length <= 24);
  }
});

test("opening a four-child root reaches the twelve-node default ceiling", () => {
  const powerBi = subjectIndex.childrenOf.get("subject:power-bi") ?? [];
  assert.equal(powerBi.length, 4);
  const state = openPath(subjectIndex, ["subject:power-bi"]);
  const visible = visibleNodes(subjectIndex, state);
  assert.equal(visible.dataCount, 12);

  const layout = layoutRadial(visible.nodes);
  const labels = placeLabels({
    visible: visible.nodes,
    positions: layout.positions,
    focus: "subject:power-bi",
    selected: "subject:power-bi",
    zoom: 1,
    overview: false,
  });
  assertNoLabelOverlaps(labels.labels);
});

test("paging reveals twelve children at a time and reports the remainder", () => {
  const fabricChildren = subjectIndex.childrenOf.get("subject:fabric") ?? [];
  assert.ok(fabricChildren.length > 12, "Fabric must exercise paging");

  let state = openPath(subjectIndex, ["subject:fabric"]);
  let visible = visibleNodes(subjectIndex, state);
  const firstPage = visible.nodes.filter((entry) => entry.parentId === "subject:fabric" && !entry.more);
  const more = visible.nodes.find((entry) => entry.more);
  assert.equal(firstPage.length, 12);
  assert.ok(more, "a +N more control is rendered");
  assert.equal(more.more.remaining, fabricChildren.length - 12);

  const result = showMore(subjectIndex, state, "subject:fabric");
  assert.equal(result.blocked, false);
  state = result.state;
  visible = visibleNodes(subjectIndex, state);
  const secondPage = visible.nodes.filter((entry) => entry.parentId === "subject:fabric" && !entry.more);
  assert.equal(secondPage.length, Math.min(24, fabricChildren.length));
  assert.equal(visible.nodes.filter((entry) => entry.more).length, fabricChildren.length > 24 ? 1 : 0);
});

test("accordion closes an open sibling; Keep branches open preserves it", () => {
  const a = "subject:power-bi";
  const b = "subject:sql";
  let state = openPath(subjectIndex, [a]);
  state = openPath(subjectIndex, [b]);
  // openPath starts from an empty state, so reproduce the interaction directly.
  state = toggleNode(subjectIndex, emptyState("subject"), a).state;
  state = toggleNode(subjectIndex, state, b).state;
  assert.equal(state.open.has(a), false, "opening SQL closes Power BI");
  assert.equal(state.open.has(b), true);

  let keep = toggleKeepBranches(emptyState("subject"));
  keep = toggleNode(subjectIndex, keep, a).state;
  keep = toggleNode(subjectIndex, keep, b).state;
  assert.equal(keep.open.has(a), true);
  assert.equal(keep.open.has(b), true);
});

test("the hard view cap blocks a branch instead of silently truncating it", () => {
  let state = toggleKeepBranches(emptyState("subject"));
  const opened = toggleNode(subjectIndex, state, "subject:fabric");
  assert.equal(opened.blocked, false);
  state = opened.state;

  const branches = (subjectIndex.childrenOf.get("subject:fabric") ?? []).filter((node) => node.children > 0);
  assert.ok(branches.length >= 12, "Fabric has enough branches to reach the cap");
  let blocked = null;
  for (const branch of branches) {
    const result = toggleNode(subjectIndex, state, branch.id);
    if (result.blocked) {
      blocked = result;
      break;
    }
    state = result.state;
  }
  assert.ok(blocked, "opening enough branches must hit the 150-node view limit");
  assert.match(blocked.reason, /150-node view limit/);
  assert.ok(visibleNodes(subjectIndex, state).dataCount <= 150);
});

test("search opens the deep path and pages the target into view", () => {
  const deep = subject.nodes.find((node) => {
    if (node.kind !== "unit" || !node.parent) return false;
    const siblings = subjectIndex.childrenOf.get(node.parent) ?? [];
    return siblings.findIndex((entry) => entry.id === node.id) >= 30;
  });
  assert.ok(deep, "a unit beyond the third page must exist");

  const results = searchTree(subjectIndex, deep.label, 5);
  assert.ok(results.some((result) => result.node.id === deep.id));

  const revealed = revealNode(subjectIndex, emptyState("subject"), deep.id);
  assert.equal(revealed.blocked, false);
  const visible = visibleNodes(subjectIndex, revealed.state);
  assert.ok(visible.nodes.some((entry) => entry.id === deep.id), "the search target is visible");
  assert.ok(revealed.state.open.has(deep.parent), "the target's parent is open");
  assert.ok(
    visible.nodes.some((entry) => entry.parentId === deep.parent && entry.id === deep.id),
    "the parent page includes the target",
  );
});

test("the URL restores focus and open branches, and leaves invalid ids out", () => {
  let state = openPath(subjectIndex, ["subject:power-bi"]);
  state = revealNode(subjectIndex, state, "subject:sql").state;
  const query = serializeTreeUrl(subjectIndex, state);
  assert.match(query, /focus=subject%3Asql/);
  assert.match(query, /open=/);

  const restored = parseTreeUrl(subjectIndex, query, "subject");
  assert.equal(restored.warning, "");
  assert.equal(restored.state.focus, "subject:sql");
  assert.equal(restored.state.open.has("subject:power-bi"), true);
  assert.equal(serializeTreeUrl(subjectIndex, restored.state), query);

  const bad = parseTreeUrl(subjectIndex, "?focus=subject%3Amissing&open=subject%3Amissing", "subject");
  assert.match(bad.warning, /not in this lens/);
  assert.equal(bad.state.open.size, 0);
  assert.equal(bad.state.focus, null);
});

test("empty packs are hidden from the subject and programme lenses", () => {
  const hidden = subject.report.hiddenEmptyPacks.map((entry) => entry.id);
  assert.equal(hidden.length, 9);
  for (const id of hidden) {
    assert.equal(subject.nodes.some((node) => node.id === id), false, `${id} leaked into the subject tree`);
    assert.equal(dp600.nodes.some((node) => node.id === id), false, `${id} leaked into DP-600`);
    assert.equal(rti.nodes.some((node) => node.id === id), false, `${id} leaked into RTI`);
  }
});

test("programme and Academy lenses keep their declared counts", () => {
  assert.equal(dp600.report.nodeCount, 1011);
  assert.equal(dp600.report.roots.length, 1);
  assert.equal(rti.report.nodeCount, 10);
  assert.equal(rti.report.roots.length, 1);
  assert.equal(academy.report.nodeCount, 143);
  assert.equal(academy.nodes.filter((node) => node.kind === "course").length, 2);
  assert.equal(academy.nodes.filter((node) => node.kind === "chapter").length, 66);
  assert.equal(academy.nodes.filter((node) => node.kind === "unit").length, 74);
  assert.equal(academy.report.nodeCount, 1 + 2 + 66 + 74);
});

test("source grouping is URL-derived, complete and not mixed into the subject tree", () => {
  const report = subject.report;
  assert.equal(report.sourceGroups.length, 29);
  assert.equal(report.ungroupedSources.length, 0);
  const fabricBucket = report.sourceBuckets.find((bucket) => bucket.id === "group:sources:fabric");
  assert.equal(fabricBucket.count, 198);
  assert.equal(report.sourceGroups.reduce((sum, group) => sum + group.count, 0), 198);
  for (const group of report.sourceGroups) {
    assert.ok(group.host.length > 0);
    assert.ok(group.area.length > 0);
    assert.ok(subject.nodes.some((node) => node.id === group.id));
  }
});

test("declared cross-references contain only the declared layer", () => {
  const kinds = new Set(subject.crossRefs.map((edge) => edge.kind));
  for (const kind of kinds) assert.ok(["cites", "derived-from", "prerequisite"].includes(kind));
  assert.equal(subject.nodes.length, new Set(subject.nodes.map((node) => node.id)).size);
  assert.equal(subject.report.orphans.unitsWithoutParent, 0);
  assert.equal(subject.report.multiParent.length, 0);
});

test("the force pass is deterministic for the same open set", () => {
  const state = openPath(subjectIndex, ["subject:power-bi"]);
  const visible = visibleNodes(subjectIndex, state);
  const a = layoutRadial(visible.nodes);
  const b = layoutRadial(visible.nodes);
  assert.equal(a.positions.size, b.positions.size);
  for (const [id, position] of a.positions) {
    const other = b.positions.get(id);
    assert.ok(other);
    assert.equal(position.x.toFixed(4), other.x.toFixed(4));
    assert.equal(position.y.toFixed(4), other.y.toFixed(4));
  }
});

test("node size grows with square-root descendant count, not raw degree", () => {
  const small = subject.nodes.find((node) => node.kind === "pack" && node.contentDescendants <= 16);
  const large = subject.nodes.find((node) => node.kind === "pack" && node.contentDescendants >= 30);
  assert.ok(small && large);
  assert.ok(nodeRadiusFor(large, 1) > nodeRadiusFor(small, 1));
  assert.ok(nodeRadiusFor(large, 1) <= 16);
});

test("labels stay selective, truncate at 24 characters and obey the zoom threshold", () => {
  const focus = subjectIndex.childrenOf.get("subject:sql")[0];
  assert.ok(focus);
  const revealed = revealNode(subjectIndex, emptyState("subject"), focus.id);
  const visible = visibleNodes(subjectIndex, revealed.state);
  const layout = layoutRadial(visible.nodes);
  const focused = placeLabels({
    visible: visible.nodes,
    positions: layout.positions,
    focus: focus.id,
    selected: focus.id,
    zoom: 1,
    overview: false,
  });
  assert.ok(focused.labels.some((label) => label.id === focus.id));
  assertNoLabelOverlaps(focused.labels);

  const zoomed = placeLabels({
    visible: visible.nodes,
    positions: layout.positions,
    focus: focus.id,
    selected: focus.id,
    zoom: 1.8,
    overview: false,
  });
  assert.equal(zoomed.labels.some((label) => label.id === focus.id), true, "the focus label survives zoom");
  assert.equal(zoomed.labels.some((label) => label.id === "subject:sql"), false, "root labels hide above the threshold");
  assert.equal(zoomed.rootsHiddenByZoom, true);

  const zoomedNoFocus = placeLabels({
    visible: visible.nodes,
    positions: layout.positions,
    focus: null,
    selected: null,
    zoom: 1.8,
    overview: false,
  });
  assert.equal(zoomedNoFocus.labels.length, 8, "without a focus, zoom keeps every root labelled");
  assert.equal(zoomedNoFocus.rootsHiddenByZoom, false);

  const overview = placeLabels({
    visible: visible.nodes,
    positions: layout.positions,
    focus: focus.id,
    selected: focus.id,
    zoom: 1,
    overview: true,
  });
  assert.equal(overview.labels.length, 0);

  assert.equal(truncateLabel("x".repeat(30)).length, 24);
  assert.ok(truncateLabel("x".repeat(30)).endsWith("…"));
});

test("a narrow map counter-scales labels instead of shrinking the text", () => {
  const visible = visibleNodes(subjectIndex, emptyState("subject"));
  const layout = layoutRadial(visible.nodes);
  const options = {
    visible: visible.nodes,
    positions: layout.positions,
    focus: null,
    selected: null,
    zoom: 1,
    overview: false,
  };
  const base = placeLabels({ ...options, fontScale: 1 });
  const narrow = placeLabels({ ...options, fontScale: 1.5 });

  assert.equal(base.labels.length, 8);
  assert.equal(narrow.labels.length, 8, "the eight roots still fit at the 1.5x ceiling");
  assertNoLabelOverlaps(narrow.labels);

  const baseLabel = base.labels.find((label) => label.id === "subject:fabric");
  const narrowLabel = narrow.labels.find((label) => label.id === "subject:fabric");
  assert.ok(baseLabel && narrowLabel);
  assert.ok(narrowLabel.width > baseLabel.width * 1.45, "the estimated box grows with the font");
  assert.ok(narrowLabel.height > baseLabel.height * 1.45);

  // A focused twelve-node view keeps the focus and its children labelled even
  // when the font is enlarged; roots may give way first.
  const powerBi = subjectIndex.childrenOf.get("subject:power-bi") ?? [];
  const open = visibleNodes(subjectIndex, openPath(subjectIndex, ["subject:power-bi"]));
  const openLayout = layoutRadial(open.nodes);
  const focused = placeLabels({
    ...options,
    visible: open.nodes,
    positions: openLayout.positions,
    focus: "subject:power-bi",
    selected: "subject:power-bi",
    fontScale: 1.5,
  });
  assert.ok(focused.labels.some((label) => label.id === "subject:power-bi"), "the focus keeps its label");
  for (const child of powerBi) {
    assert.ok(focused.labels.some((label) => label.id === child.id), `child ${child.id} keeps its label`);
  }
  assertNoLabelOverlaps(focused.labels);
});
