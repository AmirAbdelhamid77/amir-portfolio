import assert from "node:assert/strict";
import test from "node:test";
import { displayTitle } from "../../lib/copy/title.ts";

// Titles already in the repository carry the Notion page icon and the author's
// ordering prefix. Re-importing would rewrite broad content and its receipts, so
// the cleanup is applied at render time. The importer scripts themselves are
// sealed by an earlier receipt wave and must not be edited.

const FIXTURES = [
  ["📊 Data Visualization — Comprehensive & Deep Reference", "Data Visualization — Comprehensive & Deep Reference"],
  ["📊 Bar Plot — مخطط الأعمدة", "Bar Plot — مخطط الأعمدة"],
  ["🎨 الجزء 6: الألوان في Data Visualization", "الجزء 6: الألوان في Data Visualization"],
  ["📌 ملاحظة", "ملاحظة"],
  ["1️⃣ Foundations", "Foundations"],
  ["3️⃣ 03 — Core chart types", "Core chart types"],
  ["03 — Core chart types", "Core chart types"],
  ["03. Core chart types", "Core chart types"],
  ["3) Core chart types", "Core chart types"],
  ["  📊   Spaced   title  ", "Spaced title"],
];

const UNCHANGED = [
  "R2 is not a review code",
  "2026 goals",
  "Part 6: الألوان",
  "Section 10 — testing",
  "A — B",
];

test("displayTitle strips the page icon and the author's ordering prefix", () => {
  for (const [input, expected] of FIXTURES) {
    assert.equal(displayTitle(input), expected, input);
  }
});

test("legitimate titles that only look like prefixes are left alone", () => {
  for (const value of UNCHANGED) {
    assert.equal(displayTitle(value), value);
  }
});

test("title cleanup is idempotent", () => {
  for (const [input] of FIXTURES) {
    const once = displayTitle(input);
    assert.equal(displayTitle(once), once, input);
  }
});
