import assert from "node:assert/strict";
import test from "node:test";
import { CHART_META, decide } from "../../lib/data-viz/decision.ts";

const CASES = [
  { task: "distribution", shape: "one-continuous", primary: "histogram", rule: "histogram" },
  { task: "distribution", shape: "continuous-by-category", primary: "box", rule: "box-by-category" },
  { task: "comparison", shape: "continuous-by-category", primary: "box", rule: "box-comparison" },
  { task: "relationship", shape: "two-continuous", primary: "scatter", rule: "scatter" },
  { task: "trend", shape: "time-series", primary: "line", rule: "line" },
  { task: "comparison", shape: "category-value", primary: "bar", rule: "bar" },
  { task: "composition", shape: "hierarchy", primary: "treemap", rule: "treemap" },
  { task: "composition", shape: "category-value", primary: "bar", rule: "pie" },
  { task: "stages", shape: "stage-counts", primary: "funnel", rule: "funnel" },
  { task: "relationship", shape: "category-value", primary: "heatmap", rule: "heatmap" },
];

test("every exact task/shape pair maps to its documented rule", () => {
  for (const item of CASES) {
    const result = decide({ ...item, categories: 6, exactValues: false });
    assert.equal(result.rule, item.rule, `${item.task}/${item.shape} hit rule ${result.rule}`);
    assert.equal(result.matched, "exact");
    assert.equal(result.primary.chart, item.primary);
    assert.equal(result.primary.verdict, "recommended");
  }
});

test("the assistant is deterministic", () => {
  const input = { task: "comparison", shape: "category-value", categories: 8, exactValues: true };
  assert.deepEqual(decide(input), decide(input));
});

test("a missing exact pair falls back to shape, then task", () => {
  const byShape = decide({ task: "trend", shape: "two-continuous", categories: 4, exactValues: false });
  assert.equal(byShape.matched, "shape");
  assert.equal(byShape.primary.chart, "scatter");

  const byTask = decide({ task: "stages", shape: "two-continuous", categories: 4, exactValues: false });
  assert.equal(byTask.matched, "shape", "shape wins before task when a rule shares the shape");

  const taskOnly = decide({ task: "stages", shape: "time-series", categories: 4, exactValues: false });
  assert.equal(taskOnly.matched, "shape", "time-series has its own rule");
});

test("no chart is ever both acceptable and forbidden", () => {
  const inputs = [];
  for (const task of ["distribution", "comparison", "trend", "relationship", "composition", "stages"]) {
    for (const shape of [
      "one-continuous",
      "continuous-by-category",
      "two-continuous",
      "category-value",
      "time-series",
      "hierarchy",
      "stage-counts",
    ]) {
      for (const categories of [1, 5, 12, 13, 40]) {
        inputs.push({ task, shape, categories, exactValues: categories % 2 === 0 });
      }
    }
  }

  for (const input of inputs) {
    const result = decide(input);
    const accepted = new Set([
      result.primary.chart,
      ...result.alternatives.filter((item) => item.verdict !== "avoid").map((item) => item.chart),
    ]);
    for (const avoided of result.avoid) {
      assert.ok(!accepted.has(avoided.chart), `${avoided.chart} is both accepted and avoided for ${JSON.stringify(input)}`);
    }
    assert.equal(result.primary.verdict, "recommended");
    assert.ok(result.primary.reason.length > 20, "primary recommendation needs a reason");
  }
});

test("pie charts are discouraged once the slices cannot be ranked", () => {
  const six = decide({ task: "composition", shape: "category-value", categories: 6, exactValues: false });
  const pie = six.alternatives.find((item) => item.chart === "pie");
  assert.ok(pie, "composition/category-value should mention pie as an alternative");
  assert.equal(pie.verdict, "avoid");

  const four = decide({ task: "composition", shape: "category-value", categories: 4, exactValues: false });
  assert.equal(four.alternatives.find((item) => item.chart === "pie")?.verdict, "acceptable");
});

test("bar charts over time are only acceptable for a handful of periods", () => {
  const few = decide({ task: "trend", shape: "time-series", categories: 6, exactValues: false });
  assert.equal(few.alternatives.find((item) => item.chart === "bar")?.verdict, "acceptable");

  const many = decide({ task: "trend", shape: "time-series", categories: 26, exactValues: false });
  assert.equal(many.alternatives.find((item) => item.chart === "bar")?.verdict, "avoid");
});

test("many categories change the bar advice rather than silently passing", () => {
  const thirteen = decide({ task: "comparison", shape: "category-value", categories: 13, exactValues: false });
  assert.match(thirteen.primary.reason, /Top N/);

  const forty = decide({ task: "comparison", shape: "category-value", categories: 40, exactValues: false });
  assert.match(forty.primary.reason, /dot plot|Top-N/);
});

test("exact-value questions get a warning attached to the box summary", () => {
  const result = decide({ task: "comparison", shape: "continuous-by-category", categories: 4, exactValues: true });
  assert.equal(result.primary.chart, "box");
  assert.match(result.primary.reason, /dot strip|table/);
});

test("every chart in the metadata table has a title and the labs point at real routes", () => {
  for (const [chart, meta] of Object.entries(CHART_META)) {
    assert.ok(meta.title.length > 0, `${chart} has no title`);
    if (meta.lab) {
      assert.match(meta.lab, /^\/(explore|practice)\//, `${chart} lab is not an internal route`);
    }
  }
});
