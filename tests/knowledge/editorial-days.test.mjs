// Guards for the editorial day composition (owner request 2026-11-10).
//
// The timeline keeps the three real dated editions and adds two bank records
// to each. These tests prove that no date is invented, no record is promoted,
// no question-bank source enters a day, and the three-per-day contract cannot
// silently regress to one.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { eligibleInsights } from "../../lib/knowledge/insights.ts";
import {
  adaptBankRecord,
  buildEditorialDays,
  EDITORIAL_PLACEMENTS,
  EditorialDayError,
} from "../../lib/knowledge/editorial-days.ts";

const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const feed = read("content/knowledge/insights.json");
const bank = read("docs/daily-insight-bank-20261106/INSIGHT_BANK.json");

const baseItems = eligibleInsights(feed.items, true);
const baseDays = [...new Set(baseItems.map((i) => i.date))]
  .sort()
  .map((date) => ({ date, insights: baseItems.filter((i) => i.date === date) }));

const placedIds = EDITORIAL_PLACEMENTS.flatMap((p) => p.bankIds);
const byId = (id) => bank.items.find((item) => item.id === id);

test("every real date keeps its identity and carries exactly three insights", () => {
  const days = buildEditorialDays(baseDays, bank.items);
  assert.deepEqual(
    days.map((d) => d.date),
    baseDays.map((d) => d.date),
    "the composition must not add, remove or reorder a dated edition",
  );
  assert.equal(days.length, 3);
  for (const day of days) {
    assert.equal(day.insights.length, 3, day.date);
    assert.equal(new Set(day.insights.map((i) => i.id)).size, 3, day.date);
  }
  assert.equal(new Set(days.flatMap((d) => d.insights.map((i) => i.id))).size, 9);
  for (const baseDay of baseDays) {
    const preserved = days.find((d) => d.date === baseDay.date).insights[0];
    assert.deepEqual(preserved, baseDay.insights[0], `${baseDay.date} edition changed`);
    assert.equal(preserved.reviewStatus, "technical_review");
  }
});

test("the six additions are the reviewed local drafts named by the placement ledger", () => {
  assert.equal(placedIds.length, 6);
  assert.equal(new Set(placedIds).size, 6);
  const days = buildEditorialDays(baseDays, bank.items);
  for (const placement of EDITORIAL_PLACEMENTS) {
    const day = days.find((d) => d.date === placement.date);
    assert.ok(day, placement.date);
    for (const id of placement.bankIds) {
      const insight = day.insights.find((i) => i.id === id);
      assert.ok(insight, `${placement.date}: ${id}`);
      const record = byId(id);
      assert.ok(record, id);
      assert.equal(record.reviewStatus, "draft");
      assert.equal(record.sourceReviewed, true);
      assert.equal(record.scientificallyVerified, false);
      assert.equal(record.publicationApproved, false);
      assert.equal(record.source.path, "content/fabric/notes.json");
      assert.ok(record.evidence?.pointer, id);
      assert.ok(record.sourceNavigation?.trim(), id);
      assert.equal(record.language, "ar");
      assert.equal(insight.date, placement.date);
      assert.equal(insight.reviewStatus, "draft");
      assert.equal(insight.statusLabel, "Draft — unverified");
      assert.equal(insight.language, "ar");
      assert.equal(insight.sourceKind, "local");
      assert.equal(insight.sourceUrl, record.lessonHref);
      assert.match(insight.sourceLocator, /content\/fabric\/notes\.json/);
      assert.equal(insight.checkedAt, "2026-11-06");
    }
  }
});

test("unreviewed, promoted or malformed records fail closed", () => {
  const record = byId("hansa-bank-295");
  assert.ok(record);
  for (const patch of [
    { sourceReviewed: false },
    { reviewStatus: "published" },
    { reviewStatus: "draft", publicationApproved: true },
    { scenario: "" },
    { lessonHref: "https://example.com" },
    { source: { ...record.source, path: "" } },
  ]) {
    assert.throws(
      () => adaptBankRecord({ ...record, ...patch }, "2026-10-24"),
      EditorialDayError,
      JSON.stringify(patch),
    );
  }
});

test("invented dates, missing records, duplicate placements and a fourth insight all throw", () => {
  assert.throws(
    () =>
      buildEditorialDays(baseDays, bank.items, [
        { date: "2026-10-27", bankIds: ["hansa-bank-295", "hansa-bank-304"] },
      ]),
    /never invents a date/,
  );
  assert.throws(
    () =>
      buildEditorialDays(baseDays, bank.items, [
        { date: "2026-10-24", bankIds: ["hansa-bank-999"] },
      ]),
    /was not found/,
  );
  assert.throws(
    () =>
      buildEditorialDays(baseDays, bank.items, [
        { date: "2026-10-24", bankIds: ["hansa-bank-295"] },
        { date: "2026-10-24", bankIds: ["hansa-bank-304"] },
      ]),
    /more than one placement/,
  );
  assert.throws(
    () =>
      buildEditorialDays(baseDays, bank.items, [
        {
          date: "2026-10-24",
          bankIds: ["hansa-bank-295", "hansa-bank-304", "hansa-bank-298"],
        },
        { date: "2026-10-25", bankIds: ["hansa-bank-323"] },
        { date: "2026-10-26", bankIds: ["hansa-bank-296", "hansa-bank-297"] },
      ]),
    /exactly 3/,
  );
  assert.throws(
    () => buildEditorialDays(baseDays, bank.items, []),
    /exactly 3/,
    "a day left with one insight must not render as a one-insight day",
  );
  assert.throws(
    () =>
      buildEditorialDays(baseDays, bank.items, [
        { date: "2026-10-24", bankIds: ["hansa-bank-295", "hansa-bank-304"] },
        { date: "2026-10-25", bankIds: ["hansa-bank-295", "hansa-bank-298"] },
        { date: "2026-10-26", bankIds: ["hansa-bank-296", "hansa-bank-297"] },
      ]),
    /more than once/,
  );
});

test("composition is pure: neither the dated feed nor the bank is mutated", () => {
  const beforeDays = JSON.stringify(baseDays);
  const beforeBank = JSON.stringify(bank.items);
  buildEditorialDays(baseDays, bank.items);
  assert.equal(JSON.stringify(baseDays), beforeDays);
  assert.equal(JSON.stringify(bank.items), beforeBank);
});
