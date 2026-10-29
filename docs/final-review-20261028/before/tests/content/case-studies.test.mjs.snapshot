// Integrity tests for the portfolio case studies.
//
// These are domain checks, not rendering checks: they assert that a published
// metric declares its own unit/base and that the two safety rates cannot be
// compared in a way that makes lost-time cases exceed recordable cases, which is
// definitionally impossible when the population and window are the same.
//
//   npm run test:content
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { CASE_STUDIES, getCaseStudy } from "../../lib/case-studies.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLIC = path.join(ROOT, "public");

test("every case study declares a role, timeframe, limitation and outcome", () => {
  assert.ok(CASE_STUDIES.length >= 3);
  for (const study of CASE_STUDIES) {
    assert.ok(study.slug.length > 0);
    assert.ok(study.title.length > 0);
    assert.ok(study.role.length > 0, `${study.slug} states the role`);
    assert.ok(study.timeframe.length > 0, `${study.slug} states the timeframe`);
    assert.ok(study.limitations.length > 40, `${study.slug} states its limitations`);
    assert.ok(study.outcome.length > 0, `${study.slug} states an outcome`);
    assert.ok(study.sections.length > 0, `${study.slug} has body sections`);
  }
});

test("every metric exposes a label and a qualifying note", () => {
  for (const study of CASE_STUDIES) {
    for (const metric of study.metrics) {
      assert.ok(metric.value.length > 0, `${study.slug} metric value`);
      assert.ok(metric.label.length > 0, `${study.slug} metric label`);
      assert.ok(metric.note && metric.note.length > 0, `${study.slug} ${metric.label} declares a note`);
    }
  }
});

/** Pull `per 200,000 hours` / `per 1,000,000 hours` out of a metric note. */
function baseHours(note) {
  const match = /per\s+([\d,]+)\s+hours/i.exec(note ?? "");
  return match ? Number(match[1].replace(/,/g, "")) : null;
}

test("the HSE safety rates declare their hour base and stay mutually consistent", () => {
  const study = getCaseStudy("hse-analytics");
  assert.ok(study, "the HSE case study exists");

  const trir = study.metrics.find((metric) => metric.label === "TRIR");
  const ltifr = study.metrics.find((metric) => metric.label === "LTIFR");
  assert.ok(trir && ltifr, "TRIR and LTIFR are published");

  const trirBase = baseHours(trir.note);
  const ltifrBase = baseHours(ltifr.note);
  assert.equal(trirBase, 200_000, "TRIR declares the OSHA 200,000-hour base");
  assert.equal(ltifrBase, 1_000_000, "LTIFR declares the 1,000,000-hour base");

  // Convert both to the same denominator before comparing. Lost-time injuries are
  // a subset of recordable cases, so the common-base recordable rate must be the
  // larger of the two.
  const trirPerMillion = (Number(trir.value) * 1_000_000) / trirBase;
  const ltifrPerMillion = (Number(ltifr.value) * 1_000_000) / ltifrBase;
  assert.ok(
    trirPerMillion > ltifrPerMillion,
    `TRIR ${trirPerMillion}/1M must exceed LTIFR ${ltifrPerMillion}/1M — LTIs are a subset of recordables`,
  );

  // The copy quotes the converted figure, so a change to either rate must update it.
  assert.ok(
    trir.note.includes(trirPerMillion.toFixed(2)),
    `TRIR note quotes the ${trirPerMillion.toFixed(2)} per-million equivalent`,
  );
});

test("screenshots referenced by case studies exist in public/", () => {
  for (const study of CASE_STUDIES) {
    for (const shot of study.gallery ?? []) {
      assert.ok(shot.alt.length > 0, `${shot.src} has alternative text`);
      assert.ok(shot.caption.length > 0, `${shot.src} has a caption`);
      assert.ok(shot.width > 0 && shot.height > 0, `${shot.src} reserves its dimensions`);
      assert.ok(existsSync(path.join(PUBLIC, shot.src)), `${shot.src} exists`);
      for (const candidate of (shot.srcSet ?? "").split(",").map((part) => part.trim().split(" ")[0])) {
        if (!candidate) continue;
        assert.ok(existsSync(path.join(PUBLIC, candidate)), `${candidate} exists`);
      }
    }
  }
});
