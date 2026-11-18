// Guards learner-facing copy against internal review vocabulary.
//
// The site has a maintainer workspace for approval states, hashes and coverage
// matrices. That vocabulary is correct there and wrong in a lesson. This script
// scans the learner surfaces and fails on a short, explicit list of phrases.
//
//   npm run lint:copy
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

/** Directories that hold learner-facing pages. */
const ROOTS = ["app", "components"];

/** Maintainer routes keep their review language on purpose. */
const SKIP = [
  "app/study/review",
  "app/learn/drafts",
  "app/practice/drafts",
  "app/learn/statistics/source",
  "app/learn/method",
  "components/learn/intake-review.tsx",
  "components/practice/draft-review.tsx",
  "node_modules",
];

/**
 * Phrases that describe the review process instead of the material.
 * Keep this list short and specific: a broad word such as "review" appears in
 * legitimate learner copy ("review your answer").
 */
const BANNED = [
  "coverage gap",
  "not approved",
  "unapproved",
  "review state",
  "publication state",
  "REVIEW_REQUIRED",
  "NO_GO",
  "NOT_RUN",
  "rights review",
  "rights-review",
  "Export SHA-256",
  "owner's Notion export",
  "owner’s Notion export",
  "Notion export",
  "app.notion.com",
  "PORTRAIT PENDING",
  "Portrait pending",
  "published verbatim",
  "no automatic mastery",
  "prerequisite lock",
  "pedagogical inference",
  "content-reviewed",
  "source-declared",
  "gains a new approval state",
  "remains isolated",
  "grading disabled",
  "does not confer",
  "does not validate the answer",
];

const EXTENSIONS = new Set([".ts", ".tsx"]);

/**
 * Review-round codes ("R10", "R18") are matched case-sensitively: lowercase
 * identifiers such as `r18` are code, not copy. R2 (the statistic) is excluded.
 */
const BANNED_PATTERNS = [/\bR1[0-9]\b/g];

/**
 * The Practice landing page is frozen byte-for-byte by the immutable
 * content-recovery transition receipt, so its draft-bank card still names the
 * bank revision. One label is exempt from the review-code pattern; every other
 * check on that page stays active.
 */
const FROZEN_CODE_LABELS = ["DP-600 R18 draft bank"];

function* files(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(ROOT, absolute).replaceAll("\\", "/");
    if (SKIP.some((prefix) => relative === prefix || relative.startsWith(prefix + "/"))) continue;
    if (entry.isDirectory()) yield* files(absolute);
    else if (EXTENSIONS.has(path.extname(entry.name))) yield absolute;
  }
}

const findings = [];

for (const root of ROOTS) {
  for (const file of files(path.join(ROOT, root))) {
    const relative = path.relative(ROOT, file).replaceAll("\\", "/");
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      // A comment explaining an internal decision is not learner copy.
      if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) return;
      const lower = line.toLowerCase();
      for (const phrase of BANNED) {
        if (lower.includes(phrase.toLowerCase())) {
          findings.push({
            file: relative,
            line: index + 1,
            phrase,
            text: trimmed.slice(0, 160),
          });
        }
      }
      for (const pattern of BANNED_PATTERNS) {
        const scannable = FROZEN_CODE_LABELS.reduce(
          (value, label) => value.replaceAll(label, ""),
          line,
        );
        for (const match of scannable.matchAll(pattern)) {
          findings.push({
            file: relative,
            line: index + 1,
            phrase: match[0],
            text: trimmed.slice(0, 160),
          });
        }
      }
    });
  }
}

if (findings.length === 0) {
  console.log("Copy check: no review vocabulary in learner-facing files.");
  process.exit(0);
}

console.error(`Copy check failed: ${findings.length} finding(s).\n`);
for (const finding of findings) {
  console.error(`${finding.file}:${finding.line}  "${finding.phrase}"`);
  console.error(`  ${finding.text}`);
}
console.error("\nMove the sentence to /about/sources, or rewrite it for the learner.");
process.exit(1);
