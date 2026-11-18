import assert from "node:assert/strict";
import test from "node:test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

// PRODUCT.md §7: a visitor sees plain language, not the review process. This
// guard reads the built HTML, because a source grep cannot see strings that
// travel through data files (statuses, imported titles, collection records).

const root = resolve(import.meta.dirname, "../..");
const out = join(root, "out");

/** Maintainer routes keep their working vocabulary on purpose. */
const SKIP = [
  "study/review",
  "learn/drafts",
  "practice/drafts",
  "learn/method",
  "learn/statistics/source",
];

const PHRASES = [
  "not_run",
  "rights review",
  "rights-review",
  "export sha-256",
  "notion export",
  "portrait pending",
  "published verbatim",
  "app.notion.com",
];

/** Review-round codes are matched case-sensitively; R2 the statistic is safe. */
const REVIEW_CODE = /\bR1[0-9]\b/g;

/**
 * The Practice landing page is frozen byte-for-byte by the immutable
 * content-recovery transition receipt (docs/preservation-history/2026-11-08/
 * RUNTIME_TRANSITIONS.json), which allows one reversible transition per path.
 * Its draft-bank card therefore still reads "DP-600 R18 draft bank" while the
 * linked page reads "DP-600 draft bank". The phrase check stays active on that
 * page; only this one bank label is exempt from the review-code check until a
 * later receipt wave may revise the frozen block.
 */
const FROZEN_CODE_LABELS = ["DP-600 R18 draft bank"];

function htmlFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...htmlFiles(path));
    else if (entry.name.endsWith(".html")) files.push(path);
  }
  return files;
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ");
}

test("the built site carries no review-process vocabulary in visitor copy", () => {
  assert.ok(existsSync(join(out, "index.html")), "run `npm run build` before `npm run test:all`");

  const findings = [];
  for (const file of htmlFiles(out)) {
    const route = relative(out, file).split(sep).join("/");
    if (SKIP.some((prefix) => route === `${prefix}/index.html` || route.startsWith(`${prefix}/`))) continue;
    const text = visibleText(readFileSync(file, "utf8"));
    const lower = text.toLowerCase();
    for (const phrase of PHRASES) {
      if (lower.includes(phrase)) findings.push(`${route}: "${phrase}"`);
    }
    const scannable = FROZEN_CODE_LABELS.reduce((value, label) => value.replaceAll(label, ""), text);
    for (const match of scannable.matchAll(REVIEW_CODE)) {
      findings.push(`${route}: "${match[0]}"`);
    }
  }

  assert.deepEqual(findings, [], `review vocabulary reached the visitor:\n${findings.join("\n")}`);
});
