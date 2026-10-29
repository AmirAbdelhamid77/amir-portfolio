import assert from "node:assert/strict";
import test from "node:test";

import {
  blockCount,
  interpret,
  overrideFor,
  respond,
  suggestions,
} from "../../lib/data-viz/assistant.ts";

test("every suggestion produces a recommendation, not a clarification", () => {
  for (const prompt of suggestions()) {
    const response = respond(prompt);
    assert.equal(response.status, "answer", prompt);
    if (response.status === "answer") {
      assert.ok(response.decision.primary.title.length > 0);
      assert.ok(response.paragraphs.length >= 2);
    }
  }
});

test("a prompt with no task asks what the reader is trying to do", () => {
  const response = respond("show me the data please");
  assert.equal(response.status, "clarify");
  if (response.status === "clarify") {
    assert.match(response.question, /trying to do/);
    assert.equal(response.options.length, 6);
    assert.equal(response.options[0].value, "distribution");
  }
});

test("a task without a shape asks about the data shape", () => {
  const response = respond("compare the numbers");
  assert.equal(response.status, "clarify");
  if (response.status === "clarify") {
    assert.match(response.question, /shape/);
    assert.ok(response.options.length >= 1);
  }
});

test("the same prompt always yields the same recommendation", () => {
  const prompt = "Show the distribution of order values by channel";
  const first = respond(prompt);
  const second = respond(prompt);
  assert.deepEqual(first, second);
  if (first.status === "answer") {
    assert.equal(first.decision.primary.chart, "box");
    assert.equal(first.decision.rule, "box-by-category");
    assert.equal(first.input.categories, 6);
  }
});

test("answering the task question infers the canonical shape and says so", () => {
  const response = respond("show me something", { task: "comparison" });
  assert.equal(response.status, "answer");
  if (response.status === "answer") {
    assert.equal(response.input.task, "comparison");
    assert.equal(response.input.shape, "category-value");
    assert.equal(response.confidence, "medium");
    assert.ok(response.assumptions.some((line) => /inferred from the task/.test(line)));
  }
});

test("explicit category counts survive and change the pie advice", () => {
  const few = respond("show the share of revenue by product", { categories: 4 });
  const many = respond("show the share of revenue by product", { categories: 9 });
  assert.equal(few.status, "answer");
  assert.equal(many.status, "answer");
  if (few.status === "answer" && many.status === "answer") {
    assert.equal(few.input.categories, 4);
    assert.equal(many.input.categories, 9);
    // Bars stay the primary encoding; the pie alternative is demoted by count.
    assert.equal(few.decision.primary.chart, "bar");
    assert.equal(many.decision.primary.chart, "bar");
    const pieFew = few.decision.alternatives.find((item) => item.chart === "pie");
    const pieMany = many.decision.alternatives.find((item) => item.chart === "pie");
    assert.equal(pieFew?.verdict, "acceptable");
    assert.equal(pieMany?.verdict, "avoid");
  }
});

test("exact-value prompts still produce a defensible primary chart", () => {
  const response = respond("compare exact revenue values by region");
  assert.equal(response.status, "answer");
  if (response.status === "answer") {
    assert.equal(response.input.exactValues, true);
    assert.ok(response.paragraphs.length >= 2);
  }
});

test("spelled-out counts are read as categories; year windows are not", () => {
  const regions = interpret("compare revenue across eight regions");
  assert.equal(regions.categories, 8);
  const window = interpret("has retention changed over the last two years");
  assert.equal(window.categories, null);
});

test("a scatter or correlation prompt is classified as a relationship", () => {
  const response = respond("scatter of spend vs signups");
  assert.equal(response.status, "answer");
  if (response.status === "answer") {
    assert.equal(response.input.task, "relationship");
    assert.equal(response.input.shape, "two-continuous");
    assert.equal(response.decision.primary.chart, "scatter");
  }
});

test("clarification answers map back to the right override", () => {
  const taskQuestion = respond("hello");
  assert.deepEqual(overrideFor(taskQuestion, "trend"), { task: "trend" });
  const shapeQuestion = respond("compare totals");
  assert.deepEqual(overrideFor(shapeQuestion, "category-value"), {
    shape: "category-value",
  });
  const answer = respond("compare revenue by region");
  assert.deepEqual(overrideFor(answer, "ignored"), {});
});

test("every citation stays inside the site and every activity step is explained", () => {
  const response = respond("track the hiring funnel");
  assert.equal(response.status, "answer");
  for (const citation of response.citations) {
    assert.match(citation.url, /^\//);
    assert.equal(citation.domain, "hansa.local");
  }
  assert.ok(response.activity.length >= 3);
  for (const step of response.activity) {
    assert.ok(step.detail.length > 0);
  }
});

test("block counts match the text the workspace will reveal", () => {
  const answer = respond("compare revenue by region");
  assert.equal(answer.status, "answer");
  if (answer.status === "answer") {
    assert.equal(blockCount(answer), answer.paragraphs.length);
  }
  const question = respond("hello");
  assert.equal(blockCount(question), 1);
});
