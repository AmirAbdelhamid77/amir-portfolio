#!/usr/bin/env node
// build-rights.mjs — FC02 rights ledger builder (deterministic).
//
// Usage:
//   node build-rights.mjs <coverage-manifest.json> [corpus-root] [output.json]
//
// Emits rights.json: rule-based rights table plus explicit exception rows.
// Ground rules (pinned revision 774592ea):
//   - ThirdPartyNotices.md: documentation and other content -> CC BY 4.0
//     (see LICENSE); code -> MIT (see LICENSE-CODE); trademarks reserved.
//   - Handoff 02 "Rights and known exceptions": per-asset review for media;
//     cross-repo includes and absent/external assets are dependency AND rights
//     holds until cleared; the two extensibility-toolkit
//     publishing-requirements-* articles carry embedded all-rights-reserved
//     footers whose effect is unresolved.
// This script NEVER clears a rights-gated row: every exception row carries
// status "hold", a rationale, a required action and an evidence pointer.
// Final rights disposition is a human gate (handoff 05 checkpoint 2).

import fs from "node:fs";
import path from "node:path";

const PINNED_REVISION = "774592ea3f2d4558f763d6e5b74abf4785948fb5";

const [, , manifestArg, corpusArg, outArg] = process.argv;
if (!manifestArg) {
  console.error("usage: node build-rights.mjs <coverage-manifest.json> [corpus-root] [output.json]");
  process.exit(2);
}
const manifestPath = path.resolve(manifestArg);
const output = path.resolve(
  outArg || path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "rights.json")
);
const corpusRoot = path.resolve(
  corpusArg ||
    process.env.FABRIC_CORPUS_ROOT ||
    path.join(path.dirname(manifestPath), "..", "fabric-docs-light")
);

const fail = (msg) => {
  console.error("BUILD FAIL: " + msg);
  process.exit(1);
};

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.revision !== PINNED_REVISION) fail(`manifest revision ${manifest.revision} != pinned`);
if (!Array.isArray(manifest.rows) || manifest.rows.length !== 15496) fail("manifest rows != 15496");

// ---------------------------------------------------------------------------
// Cross-repo include scan (same deterministic pattern as build-identity.mjs)
// ---------------------------------------------------------------------------

const CROSS_REPO_RE = /\(\s*~\/\.\.\/([^)\s]+)\s*\)/g;
const TEXT_EXTS = new Set([".md", ".yml", ".yaml", ".json", ".js", ".cjs"]);
const scanRows = manifest.rows.filter(
  (r) => r.present && TEXT_EXTS.has(path.posix.extname(r.path).toLowerCase())
);
const crossRepoRefs = new Map(); // path -> {count, targets:[]}
let leadingSlashNormalizations = 0;
for (const row of scanRows) {
  let text;
  try {
    text = fs.readFileSync(path.join(corpusRoot, row.path), "utf8");
  } catch {
    continue;
  }
  CROSS_REPO_RE.lastIndex = 0;
  let m;
  while ((m = CROSS_REPO_RE.exec(text)) !== null) {
    let target = m[1].replace(/\\/g, "/");
    while (target.startsWith("/")) {
      target = target.slice(1);
      leadingSlashNormalizations += 1; // upstream ~/..// double-slash typo (service-premium-what-is.md)
    }
    if (!target.includes("/")) continue;
    if (!crossRepoRefs.has(row.path)) crossRepoRefs.set(row.path, { count: 0, targets: [] });
    const rec = crossRepoRefs.get(row.path);
    rec.count += 1;
    rec.targets.push(target);
  }
}

const NOTICE_PAIR = [
  "docs/extensibility-toolkit/publishing-requirements-workload.md",
  "docs/extensibility-toolkit/publishing-requirements-item.md",
];

const CLASS_META = {
  "explicit-rights-notice": {
    rationale:
      "Embedded validation footer carries an all-rights-reserved notice (handoff 02, Rights and known exceptions). The notice conflicts with the repository-level CC BY 4.0 grant in ThirdPartyNotices.md and its effect is unresolved.",
    requiredAction:
      "Human rights review (handoff 05 checkpoint 2): determine whether the embedded all-rights-reserved footer overrides the repository CC BY 4.0 grant for this file. No local body may be published before resolution. If restricted, use an approved original explanation or a local coverage record with an official source link, never counted as full-text delivery.",
    owner: "rights-reviewer (human gate); recorded by FC02",
  },
  "cross-repo-include": {
    rationale:
      "File embeds cross-repo include directives (~/../<repo>/...) whose targets live outside the pinned fabric-docs tree. The publish config lists six dependent repositories without pinned immutable revisions, so dependency closure and per-target rights are unverified.",
    requiredAction:
      "Dependency expansion gate: pin every referenced target at an immutable revision, verify per-target reuse rights, then clear. Until then the owning article must not be published with a full-text fidelity claim.",
    owner: "rights-reviewer + FC03 dependency expansion (human gate); recorded by FC02",
  },
  "cross-tree-reference": {
    rationale:
      "Manifest crossTreeHints > 0: the file references content outside the pinned fabric-docs tree (site-relative links to sibling docsets such as /power-bi/ and /azure/, or cross-repo hints). External references are dependency and rights holds until their targets exist pinned and cleared (handoff 02).",
    requiredAction:
      "Resolve every external reference: mapped to a pinned+cleared dependency (dep: row with immutable revision) or covered by an approved outbound-link policy. Hold full-text sign-off for the file until resolved.",
    owner: "rights-reviewer + dependency owner (human gate); recorded by FC02",
  },
  "unavailable-hold": {
    rationale:
      "Tracked in git at the pinned revision but absent from the sparse checkout: no bytes, no sha256, no content to classify or rights-evaluate. The coverage manifest keeps these explicit (handoff 02).",
    requiredAction:
      "Recover into an authorized staging area only if the row's role requires it, then classify and rights-evaluate. Keep visible in the ledger until resolved; never drop silently.",
    owner: "FC02 (ledger record) + integration lead (staging authorization)",
  },
};

// ---------------------------------------------------------------------------
// Build exception rows (one per affected path; classes merged)
// ---------------------------------------------------------------------------

const byPath = new Map();
function addException(rowPath, classes) {
  if (!byPath.has(rowPath)) byPath.set(rowPath, new Set());
  for (const c of classes) byPath.get(rowPath).add(c);
}

for (const row of manifest.rows) {
  const classes = [];
  if (NOTICE_PAIR.includes(row.path)) classes.push("explicit-rights-notice");
  if (crossRepoRefs.has(row.path)) classes.push("cross-repo-include");
  if ((row.crossTreeHints || 0) > 0) classes.push("cross-tree-reference");
  if (row.kind === "unavailable-or-special") classes.push("unavailable-hold");
  if (classes.length) addException(row.path, classes);
}

const exceptions = [];
let n = 0;
for (const rowPath of [...byPath.keys()].sort()) {
  n += 1;
  const classes = [...byPath.get(rowPath)].sort();
  const row = manifest.rows.find((r) => r.path === rowPath);
  const evidence = [];
  if (classes.includes("explicit-rights-notice")) {
    evidence.push(`file-inspection@${PINNED_REVISION.slice(0, 8)}:${rowPath}#embedded-validation-footer`);
  }
  if (classes.includes("cross-repo-include")) {
    evidence.push(
      `corpus-scan@${PINNED_REVISION.slice(0, 8)}:~/../include-directives(${crossRepoRefs.get(rowPath).count})`
    );
  }
  if (classes.includes("cross-tree-reference")) {
    evidence.push(`FULL_CORPUS_COVERAGE.json@${PINNED_REVISION.slice(0, 8)}#crossTreeHints=${row.crossTreeHints}`);
  }
  if (classes.includes("unavailable-hold")) {
    evidence.push(`FULL_CORPUS_COVERAGE.json@${PINNED_REVISION.slice(0, 8)}#tracked=true,present=false`);
  }
  exceptions.push({
    id: `ex-${String(n).padStart(4, "0")}`,
    path: rowPath,
    classes,
    rationale: classes.map((c) => CLASS_META[c].rationale).join(" "),
    requiredAction: classes.map((c) => CLASS_META[c].requiredAction).join(" "),
    owner: [...new Set(classes.map((c) => CLASS_META[c].owner))].join("; "),
    status: "hold",
    evidence,
  });
}

// ---------------------------------------------------------------------------
// Rules table (default state per scope; overrides listed as rules too)
// ---------------------------------------------------------------------------

const rules = [
  {
    id: "R1",
    scope: "kind in {article-candidate, structured-doc, fragment, navigation} (Markdown/YAML docs)",
    rightsState: "cc-by-4.0-docs",
    rationale:
      "ThirdPartyNotices.md at the pinned revision grants documentation and other content under CC BY 4.0 (see LICENSE).",
    evidence: "fabric-docs-light/ThirdPartyNotices.md@774592ea; fabric-docs-light/LICENSE@774592ea",
  },
  {
    id: "R2",
    scope: "code content (and the LICENSE-CODE / LICENSE grant texts themselves)",
    rightsState: "mit-code",
    rationale:
      "ThirdPartyNotices.md grants any code in the repository under the MIT License (see LICENSE-CODE). LICENSE-CODE holds the MIT text; LICENSE holds the CC BY 4.0 legal text and is treated as the grant document pair.",
    evidence: "fabric-docs-light/ThirdPartyNotices.md@774592ea; fabric-docs-light/LICENSE-CODE@774592ea",
  },
  {
    id: "R3",
    scope: "kind = asset (images, media, datasets, downloads)",
    rightsState: "review-required",
    rationale:
      "Handoff 02: review each screenshot, icon, dataset, download and cross-repo fragment. The blanket CC BY 4.0 grant is not assumed to cover per-asset branding/attribution questions; asset-level clearance is pending.",
    evidence: "handoff 02_FABRIC_KNOWLEDGE_MAP.md §Rights and known exceptions",
  },
  {
    id: "R4",
    scope: "kind = unavailable-or-special",
    rightsState: "unresolved-review",
    rationale: "Content absent from the sparse checkout: no bytes or hash, no evaluation possible.",
    evidence: "FULL_CORPUS_COVERAGE.json@774592ea#tracked=true,present=false (15 rows)",
  },
  {
    id: "R5",
    scope: "kind in {redirect, repository-control, support} (functional/config text retained, not published as editorial content)",
    rightsState: "cc-by-4.0-docs",
    rationale:
      "Textual repository content covered by the CC BY 4.0 'documentation and other content' grant; consumed for publishing behaviour, not republished as editorial pages.",
    evidence: "fabric-docs-light/ThirdPartyNotices.md@774592ea",
  },
  {
    id: "R6",
    scope: "kind = rights (LICENSE, LICENSE-CODE, ThirdPartyNotices.md)",
    rightsState: "ThirdPartyNotices.md -> cc-by-4.0-docs; LICENSE and LICENSE-CODE -> mit-code",
    rationale: "These files ARE the grant documents; they are retained and drive attribution obligations.",
    evidence: "fabric-docs-light/{LICENSE,LICENSE-CODE,ThirdPartyNotices.md}@774592ea",
  },
  {
    id: "R7 (override)",
    scope: "docs/extensibility-toolkit/publishing-requirements-{workload,item}.md",
    rightsState: "review-required",
    rationale:
      "Embedded validation footers carry all-rights-reserved notices; repository-level CC BY 4.0 cannot be applied until the notice scope is resolved by the human rights gate.",
    evidence: "handoff 02_FABRIC_KNOWLEDGE_MAP.md §Rights and known exceptions; file inspection@774592ea",
  },
  {
    id: "R8 (override)",
    scope: "any row with crossTreeHints > 0 or cross-repo include references (~/../<repo>/...)",
    rightsState: "rights-exception",
    rationale:
      "Cross-tree references and cross-repo includes are dependency and rights holds until a pinned+cleared dependency exists (handoff 02). Recorded as explicit exception rows; never cleared by this registry.",
    evidence: "handoff 02_FABRIC_KNOWLEDGE_MAP.md §Rights; FULL_CORPUS_COVERAGE.json#crossTreeHints; corpus-scan@774592ea",
  },
  {
    id: "R9",
    scope: "unavailable/special and external dependencies discovered by scan (dep: rows)",
    rightsState: "rights-exception (hold)",
    rationale:
      "Unpinned external targets cannot carry a rights decision; Microsoft Learn service terms are separate from the Git reuse grant.",
    evidence: "handoff 02_FABRIC_KNOWLEDGE_MAP.md §Rights and known exceptions",
  },
];

// ---------------------------------------------------------------------------
// Counts + serialization
// ---------------------------------------------------------------------------

const byClass = {};
for (const e of exceptions) for (const c of e.classes) byClass[c] = (byClass[c] || 0) + 1;
const identityRightsStates = {};
for (const row of manifest.rows) {
  // Mirror build-identity.mjs decision logic so rights.json and identity.json agree.
  let state;
  if (row.kind === "unavailable-or-special") state = "unresolved-review";
  else if (row.kind === "asset") state = "review-required";
  else if (NOTICE_PAIR.includes(row.path)) state = "review-required";
  else if (crossRepoRefs.has(row.path) || (row.crossTreeHints || 0) > 0) state = "rights-exception";
  else if (row.kind === "rights") state = row.path === "ThirdPartyNotices.md" ? "cc-by-4.0-docs" : "mit-code";
  else state = "cc-by-4.0-docs";
  identityRightsStates[state] = (identityRightsStates[state] || 0) + 1;
}

const doc = {
  generatedAt: new Date().toISOString(),
  revision: PINNED_REVISION,
  contract: "docs/fabric-corpus/contracts/IDENTITY_REGISTRY.md",
  policy: {
    statement:
      "Rule-based rights ledger. Exceptions carry status=hold with rationale, required action, owner and evidence. This ledger never clears a rights-gated row; final rights disposition is a human gate (handoff 05 checkpoint 2).",
    grants: [
      { grant: "CC BY 4.0", scope: "documentation and other content", source: "ThirdPartyNotices.md@774592ea -> LICENSE" },
      { grant: "MIT", scope: "code", source: "ThirdPartyNotices.md@774592ea -> LICENSE-CODE" },
      { grant: "reserved", scope: "trademarks, logos, names", source: "ThirdPartyNotices.md@774592ea" },
    ],
    references: [
      "https://creativecommons.org/licenses/by/4.0/legalcode",
      "https://www.microsoft.com/en-us/legal/intellectualproperty/copyright/permissions",
      "https://learn.microsoft.com/en-us/legal/termsofuse",
    ],
  },
  rules,
  exceptions,
  counts: {
    exceptions: exceptions.length,
    exceptionsByClass: byClass,
    identityRightsStates,
    crossRepoIncludeFiles: crossRepoRefs.size,
    corpusScanLeadingSlashNormalizations: leadingSlashNormalizations,
  },
};

fs.writeFileSync(output, JSON.stringify(doc, null, 1) + "\n", "utf8");
console.log(`rights ledger built: ${output}`);
console.log(`  exceptions=${exceptions.length} byClass=${JSON.stringify(byClass)}`);
console.log(`  identityRightsStates=${JSON.stringify(identityRightsStates)}`);
