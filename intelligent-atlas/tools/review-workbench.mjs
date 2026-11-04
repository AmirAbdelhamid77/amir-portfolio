// Semantic review workbench.
//
// The corpus is far larger than one review pass, so review has to be resumable.
// This tool never decides anything on its own: it selects an auditable batch of
// unread units, renders a reading sheet with the real surrounding context, and
// validates the decisions a human or agent writes by hand.
//
// Commands (run from the repository root):
//   node intelligent-atlas/tools/review-workbench.mjs coverage
//   node intelligent-atlas/tools/review-workbench.mjs queue --reason=domain-not-modelled
//   node intelligent-atlas/tools/review-workbench.mjs queue --reason=thin-fragment --limit=12 --write
//   node intelligent-atlas/tools/review-workbench.mjs sheet --batch=<batchId>
//   node intelligent-atlas/tools/review-workbench.mjs check
//
// States are kept separate on purpose: a unit in a batch is still `not-read`.
// Only a decision in review-decisions.json advances the semantic reading state,
// and no decision published anything.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const ATLAS = join(ROOT, "intelligent-atlas");
const ANALYSIS = join(ATLAS, "analysis");
const SEMANTIC = join(ATLAS, "semantic");
const BATCH_DIR = join(SEMANTIC, "batches");
const SHEET_DIR = join(SEMANTIC, "sheets");
const DECISIONS_PATH = join(SEMANTIC, "review-decisions.json");

const ELIGIBLE_STATES = new Set(["analyzed-mapped", "analyzed-unmapped"]);
const DECISION_VALUES = ["accepted", "revised", "held", "unresolved-gap"];
const CANDIDATE_VERDICTS = ["confirmed", "revised", "missed", "false-positive"];
const ESSENTIAL_MEANINGS = [
  "prose",
  "question",
  "formula",
  "procedure",
  "derived-summary",
  "figure",
  "index",
  "table",
];
const SCOPES = ["vertical-slice", "quality-sample", "batch-review"];

// Unmatched reasons are reviewed smallest group first, so early batches close
// whole categories instead of sampling every category thinly.
const REASON_ORDER = [
  "domain-not-modelled",
  "navigation-index",
  "thin-fragment",
  "formula-fragment",
  "template-boilerplate",
  "procedural-step",
  "no-lexical-signal",
  "question-paraphrase",
];

const args = process.argv.slice(2);
const command = args[0] ?? "coverage";
const option = (name, fallback = null) => {
  const hit = args.find((arg) => arg === `--${name}` || arg.startsWith(`--${name}=`));
  if (!hit) return fallback;
  if (hit === `--${name}`) return true;
  return hit.slice(name.length + 3);
};
const has = (name) => args.includes(`--${name}`);

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const normalize = (value) => String(value ?? "").replace(/\s+/g, " ").trim();
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const textHash = (unit) => sha256(normalize(unit.text));

const units = readFileSync(join(ANALYSIS, "units-analyzed.jsonl"), "utf8")
  .trim()
  .split(/\r?\n/)
  .map((line) => JSON.parse(line));
const unitById = new Map(units.map((unit) => [unit.unitId, unit]));
const graph = readJson(join(ANALYSIS, "graph-build.json"));
const conceptById = new Map(graph.nodes.map((node) => [node.id, node]));
const relationTypes = new Set(graph.edges.map((edge) => edge.relationType));
const decisionsDoc = readJson(DECISIONS_PATH);
const decisions = decisionsDoc.decisions;
const decidedIds = new Set(decisions.map((decision) => decision.unitId));

const eligibleUnits = units.filter((unit) => ELIGIBLE_STATES.has(unit.semanticAnalysisState));
const unmatchedUnits = eligibleUnits.filter((unit) => !(unit.conceptCandidates ?? []).length);
const reasonOf = (unit) => unit.unmappedReason ?? "none";

// --- context: what surrounds a unit in its own source -----------------------
const bySource = new Map();
for (const unit of units) {
  if (!bySource.has(unit.sourcePath)) bySource.set(unit.sourcePath, []);
  bySource.get(unit.sourcePath).push(unit);
}

// The nearest earlier unit with a title is usually the section heading the
// fragment was cut from. Siblings come from the same source path only.
function contextFor(unit, span = 2) {
  const siblings = bySource.get(unit.sourcePath) ?? [unit];
  const index = siblings.findIndex((candidate) => candidate.unitId === unit.unitId);
  let heading = null;
  for (let step = index - 1; step >= 0 && step > index - 40; step -= 1) {
    const candidate = siblings[step];
    if (candidate.title && candidate.title.length > 3) {
      heading = { unitId: candidate.unitId, title: candidate.title };
      break;
    }
  }
  const before = siblings.slice(Math.max(0, index - span), index).map((candidate) => ({
    unitId: candidate.unitId,
    text: normalize(candidate.text).slice(0, 320),
  }));
  const after = siblings.slice(index + 1, index + 1 + span).map((candidate) => ({
    unitId: candidate.unitId,
    text: normalize(candidate.text).slice(0, 320),
  }));
  return {
    heading,
    before,
    after,
    note: siblings.length <= 1 ? "single-unit source: no sibling context available" : null,
  };
}

// --- coverage --------------------------------------------------------------
function coverage() {
  const reasonRows = new Map();
  for (const unit of eligibleUnits) {
    const reason = reasonOf(unit);
    if (reason === "none") continue;
    const row = reasonRows.get(reason) ?? { reason, total: 0, read: 0, matched: 0 };
    row.total += 1;
    if (decidedIds.has(unit.unitId)) row.read += 1;
    if ((unit.conceptCandidates ?? []).length) row.matched += 1;
    reasonRows.set(reason, row);
  }
  const reasonTable = REASON_ORDER.filter((reason) => reasonRows.has(reason))
    .concat([...reasonRows.keys()].filter((reason) => !REASON_ORDER.includes(reason)))
    .map((reason) => {
      const row = reasonRows.get(reason);
      return { ...row, open: row.total - row.read, batchOf: 20 };
    });

  const familyRows = new Map();
  for (const unit of eligibleUnits) {
    const row = familyRows.get(unit.sourceFamily) ?? {
      family: unit.sourceFamily,
      total: 0,
      read: 0,
      unmatched: 0,
      unmatchedRead: 0,
    };
    row.total += 1;
    if (decidedIds.has(unit.unitId)) row.read += 1;
    if (!(unit.conceptCandidates ?? []).length) {
      row.unmatched += 1;
      if (decidedIds.has(unit.unitId)) row.unmatchedRead += 1;
    }
    familyRows.set(unit.sourceFamily, row);
  }
  const familyTable = [...familyRows.values()].sort(
    (a, b) => b.unmatched - a.unmatched || b.total - a.total,
  );

  const unmatchedOpen = unmatchedUnits.filter((unit) => !decidedIds.has(unit.unitId)).length;
  const report = {
    corpus: {
      units: units.length,
      eligible: eligibleUnits.length,
      unmatched: unmatchedUnits.length,
      read: decidedIds.size,
      unmatchedRead: unmatchedUnits.filter((unit) => decidedIds.has(unit.unitId)).length,
    },
    progress: {
      readShareOfEligible: Number((decidedIds.size / eligibleUnits.length).toFixed(4)),
      unmatchedOpen,
      // Counts only: a batch is not reading, and no batch is ever reported closed
      // until its decisions exist in review-decisions.json.
      batchesOf20Remaining: Math.ceil(unmatchedOpen / 20),
      published: 0,
    },
    unwrittenDecisions: [...decidedIds].filter((unitId) => !unitById.has(unitId)),
    byReason: reasonTable,
    byFamily: familyTable,
    statement:
      "These counts describe queue progress and hand-written decisions. They are not publication and they are not full semantic reading of the corpus.",
  };
  return report;
}

function formatCoverage(report) {
  const lines = [];
  lines.push("# Semantic review coverage");
  lines.push("");
  lines.push(
    `Eligible ${report.corpus.eligible} of ${report.corpus.units} units. Read ${report.corpus.read} ` +
      `(${(100 * report.progress.readShareOfEligible).toFixed(2)}%). Unmatched open ${report.progress.unmatchedOpen} ` +
      `(${report.progress.batchesOf20Remaining} batches of 20). Published 0.`,
  );
  lines.push("");
  lines.push("| Unmatched reason | Total | Read | Open | Batches of 20 |");
  lines.push("|---|---:|---:|---:|---:|");
  for (const row of report.byReason) {
    lines.push(
      `| ${row.reason} | ${row.total} | ${row.read} | ${row.open} | ${Math.ceil(row.open / 20)} |`,
    );
  }
  lines.push("");
  lines.push("| Family | Eligible | Read | Unmatched | Unmatched read |");
  lines.push("|---|---:|---:|---:|---:|");
  for (const row of report.byFamily) {
    lines.push(
      `| ${row.family} | ${row.total} | ${row.read} | ${row.unmatched} | ${row.unmatchedRead} |`,
    );
  }
  lines.push("");
  lines.push(report.statement);
  return lines.join("\n") + "\n";
}

// --- queue -----------------------------------------------------------------
function selectBatch({ reasons, families, limit, units: explicit }) {
  if (explicit.length) {
    const missing = explicit.filter((unitId) => !unitById.has(unitId));
    if (missing.length) throw new Error(`unknown unit ids: ${missing.join(", ")}`);
    const ineligible = explicit.filter((unitId) => !ELIGIBLE_STATES.has(unitById.get(unitId).semanticAnalysisState));
    if (ineligible.length) throw new Error(`ineligible unit ids: ${ineligible.join(", ")}`);
    const chosen = explicit.map((unitId) => unitById.get(unitId));
    const reasonCounts = {};
    for (const unit of chosen) reasonCounts[reasonOf(unit)] = (reasonCounts[reasonOf(unit)] ?? 0) + 1;
    return {
      schemaVersion: "intelligent-atlas-review-batch/1.0",
      batchId: `batch-${sha256(chosen.map((unit) => unit.unitId).join("\u0000")).slice(0, 12)}`,
      generatedAt: new Date().toISOString().slice(0, 10),
      state: "not-read",
      selection: {
        reasons: reasons.length ? reasons : "explicit-units",
        families: families.length ? families : "any",
        limit: chosen.length,
        order: "explicit unit-id list",
        remainingInPool: null,
      },
      reasonCounts,
      units: chosen.map((unit) => batchUnit(unit)),
    };
  }
  const pool = unmatchedUnits.filter((unit) => {
    if (decidedIds.has(unit.unitId)) return false;
    if (reasons.length && !reasons.includes(reasonOf(unit))) return false;
    if (families.length && !families.includes(unit.sourceFamily)) return false;
    return true;
  });
  pool.sort((a, b) => {
    const reasonDelta = REASON_ORDER.indexOf(reasonOf(a)) - REASON_ORDER.indexOf(reasonOf(b));
    if (reasonDelta) return reasonDelta;
    const lengthDelta = (a.text ?? "").length - (b.text ?? "").length;
    if (lengthDelta) return lengthDelta;
    return a.unitId < b.unitId ? -1 : a.unitId > b.unitId ? 1 : 0;
  });
  const selected = pool.slice(0, limit);
  const reasonCounts = {};
  for (const unit of selected) reasonCounts[reasonOf(unit)] = (reasonCounts[reasonOf(unit)] ?? 0) + 1;
  const id = `batch-${sha256(selected.map((unit) => unit.unitId).join("\u0000")).slice(0, 12)}`;
  return {
    schemaVersion: "intelligent-atlas-review-batch/1.0",
    batchId: id,
    generatedAt: new Date().toISOString().slice(0, 10),
    state: "not-read",
    selection: {
      reasons: reasons.length ? reasons : "any-unmatched",
      families: families.length ? families : "any",
      limit,
      order: "reason priority, then shortest unit text, then unitId",
      remainingInPool: Math.max(0, pool.length - selected.length),
    },
    reasonCounts,
    units: selected.map((unit) => batchUnit(unit)),
  };
}

function batchUnit(unit) {
  return {
    unitId: unit.unitId,
    sourceFamily: unit.sourceFamily,
    sourcePath: unit.sourcePath,
    locator: unit.locator,
    canonicalHref: unit.canonicalHref,
    language: unit.language,
    contentForms: unit.contentForms ?? [],
    unmappedReason: reasonOf(unit),
    unmappedDetail: unit.unmappedDetail ?? null,
    title: unit.title ?? null,
    textHash: textHash(unit),
    textLength: (unit.text ?? "").length,
    candidates: (unit.conceptCandidates ?? []).map((candidate) => ({
      conceptId: candidate.conceptId,
      confidence: candidate.confidence,
      rank: candidate.rank,
      score: candidate.score,
    })),
  };
}

function sheet(batch) {
  const lines = [];
  lines.push(`# Review sheet ${batch.batchId}`);
  lines.push("");
  lines.push(
    `State: **${batch.state}**. ${batch.units.length} units, selected by ` +
      `${JSON.stringify(batch.selection.reasons)} from ${batch.selection.remainingInPool ?? 0} remaining in pool.`,
  );
  lines.push("");
  lines.push(
    "A unit in this sheet is still `not-read`. Reading it means writing a decision with a verbatim " +
      "evidence quote into `intelligent-atlas/semantic/review-decisions.json` and rebuilding the ledger.",
  );
  for (const [index, entry] of batch.units.entries()) {
    const unit = unitById.get(entry.unitId);
    const context = contextFor(unit);
    lines.push("");
    lines.push(`## ${index + 1}. \`${entry.unitId}\``);
    lines.push("");
    lines.push(
      `- family: \`${entry.sourceFamily}\` | language: \`${entry.language}\` | forms: ${(entry.contentForms ?? []).join(", ") || "—"}`,
    );
    lines.push(`- locator: \`${entry.locator}\` | href: \`${entry.canonicalHref}\``);
    lines.push(`- unmatched reason: \`${entry.unmappedReason}\`${entry.unmappedDetail ? ` — ${entry.unmappedDetail}` : ""}`);
    lines.push(
      `- candidates: ${
        entry.candidates.length
          ? entry.candidates
              .map((candidate) => `\`${candidate.conceptId}\` (${candidate.confidence} r${candidate.rank} s${candidate.score})`)
              .join(", ")
          : "none (unmatched)"
      }`,
    );
    if (entry.title) lines.push(`- title: ${entry.title}`);
    if (context.heading) lines.push(`- nearest heading: ${context.heading.title} (\`${context.heading.unitId}\`)`);
    if (context.note) lines.push(`- context note: ${context.note}`);
    lines.push("");
    lines.push("**Text**");
    lines.push("");
    lines.push("```text");
    lines.push(normalize(unit.text).slice(0, 2400));
    lines.push("```");
    if (context.before.length) {
      lines.push("");
      lines.push("**Before**");
      for (const sibling of context.before) lines.push(`- \`${sibling.unitId}\`: ${sibling.text}`);
    }
    if (context.after.length) {
      lines.push("");
      lines.push("**After**");
      for (const sibling of context.after) lines.push(`- \`${sibling.unitId}\`: ${sibling.text}`);
    }
    lines.push("");
    lines.push("**Decision to write**");
    lines.push("");
    lines.push("```json");
    lines.push(
      JSON.stringify(
        {
          unitId: entry.unitId,
          scope: "batch-review",
          batchId: batch.batchId,
          parentContext: "<what surrounds this unit in the source>",
          reading: "<what the unit actually claims, in your words>",
          essentialMeaning: "<prose|question|formula|procedure|derived-summary|figure|index|table>",
          evidenceQuote: "<verbatim substring of the text above>",
          candidateVerdict: "<confirmed|revised|missed|false-positive>",
          concepts: [{ conceptId: "concept:<domain>:<slug>", role: "primary|secondary" }],
          relationHints: [],
          decision: "<accepted|revised|held|unresolved-gap>",
          decisionCode: "<short-kebab-case-code>",
          rationale: "<why this decision, traceable to the text>",
          unresolved: [],
        },
        null,
        2,
      ),
    );
    lines.push("```");
  }
  lines.push("");
  lines.push("## After the batch");
  lines.push("");
  lines.push("1. Append the decisions to `intelligent-atlas/semantic/review-decisions.json`.");
  lines.push("2. Run `node intelligent-atlas/tools/review-workbench.mjs check`.");
  lines.push("3. Run `node intelligent-atlas/tools/build-semantic-ledger.mjs`.");
  lines.push("4. Run `node intelligent-atlas/tools/review-workbench.mjs coverage`.");
  return lines.join("\n") + "\n";
}

function writeBatch(batch) {
  mkdirSync(BATCH_DIR, { recursive: true });
  mkdirSync(SHEET_DIR, { recursive: true });
  const batchPath = join(BATCH_DIR, `${batch.batchId}.json`);
  writeFileSync(batchPath, JSON.stringify(batch, null, 2) + "\n");
  const sheetPath = join(SHEET_DIR, `${batch.batchId}.md`);
  writeFileSync(sheetPath, sheet(batch));
  return {
    batch: batchPath.replace(ROOT + "\\", "").replace(ROOT + "/", ""),
    sheet: sheetPath.replace(ROOT + "\\", "").replace(ROOT + "/", ""),
  };
}

// --- check -----------------------------------------------------------------
function check() {
  const errors = [];
  const warnings = [];
  const seen = new Set();

  for (const decision of decisions) {
    const where = decision.unitId ?? "<missing unitId>";
    if (!decision.unitId) {
      errors.push("Decision without a unitId");
      continue;
    }
    if (seen.has(decision.unitId)) errors.push(`${where}: duplicate decision`);
    seen.add(decision.unitId);

    const unit = unitById.get(decision.unitId);
    if (!unit) {
      errors.push(`${where}: unknown unit`);
      continue;
    }
    if (!ELIGIBLE_STATES.has(unit.semanticAnalysisState)) {
      errors.push(`${where}: unit is not eligible (${unit.semanticAnalysisState})`);
    }
    for (const key of ["scope", "parentContext", "reading", "essentialMeaning", "evidenceQuote", "candidateVerdict", "concepts", "decision", "decisionCode", "rationale", "unresolved"]) {
      if (!(key in decision)) errors.push(`${where}: missing field ${key}`);
    }
    if (!SCOPES.includes(decision.scope)) errors.push(`${where}: unknown scope ${decision.scope}`);
    if (!DECISION_VALUES.includes(decision.decision)) errors.push(`${where}: unknown decision ${decision.decision}`);
    if (!CANDIDATE_VERDICTS.includes(decision.candidateVerdict)) {
      errors.push(`${where}: unknown candidateVerdict ${decision.candidateVerdict}`);
    }
    if (!ESSENTIAL_MEANINGS.includes(decision.essentialMeaning)) {
      errors.push(`${where}: unknown essentialMeaning ${decision.essentialMeaning}`);
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(decision.decisionCode ?? "")) {
      errors.push(`${where}: decisionCode is not kebab-case`);
    }
    if (!Array.isArray(decision.unresolved)) errors.push(`${where}: unresolved must be an array`);
    if (!normalize(decision.rationale)) errors.push(`${where}: empty rationale`);

    if (!decision.evidenceQuote) {
      errors.push(`${where}: missing evidence quote`);
    } else if (!normalize(unit.text).includes(normalize(decision.evidenceQuote))) {
      errors.push(`${where}: evidence quote is not a verbatim substring of the unit text`);
    }

    if (!Array.isArray(decision.concepts)) {
      errors.push(`${where}: concepts must be an array`);
    } else {
      const conceptIds = new Set();
      for (const entry of decision.concepts) {
        if (!conceptById.has(entry.conceptId)) {
          errors.push(`${where}: unknown concept ${entry.conceptId}`);
        }
        if (conceptIds.has(entry.conceptId)) errors.push(`${where}: concept ${entry.conceptId} listed twice`);
        conceptIds.add(entry.conceptId);
        if (!["primary", "secondary"].includes(entry.role)) {
          errors.push(`${where}: unknown concept role ${entry.role}`);
        }
      }
      if (decision.decision === "accepted" && !decision.concepts.length) {
        warnings.push(`${where}: accepted with no concepts`);
      }
    }

    for (const hint of decision.relationHints ?? []) {
      if (!conceptById.has(hint.from)) errors.push(`${where}: relation hint from unknown concept ${hint.from}`);
      if (!conceptById.has(hint.to)) errors.push(`${where}: relation hint to unknown concept ${hint.to}`);
      if (!relationTypes.has(hint.relationType)) {
        errors.push(`${where}: relation hint uses unknown relationType ${hint.relationType}`);
      }
      if (hint.from === hint.to) errors.push(`${where}: relation hint points at itself`);
    }

    // A decision must reach a real conclusion about the matcher: a confirmed or
    // revised concept, or an explicit statement that the matcher missed or
    // over-matched. Silence is not a verdict.
    const candidates = unit.conceptCandidates ?? [];
    if (candidates.length && decision.candidateVerdict === "missed") {
      warnings.push(`${where}: verdict "missed" but the matcher did propose ${candidates.length} candidate(s)`);
    }
    if (!candidates.length && ["confirmed", "revised", "false-positive"].includes(decision.candidateVerdict)) {
      warnings.push(`${where}: verdict "${decision.candidateVerdict}" on a unit the matcher left unmatched`);
    }

    if (decision.batchId) {
      const batchPath = join(BATCH_DIR, `${decision.batchId}.json`);
      if (!existsSync(batchPath)) {
        errors.push(`${where}: batch ${decision.batchId} has no batch file`);
      } else {
        const batch = readJson(batchPath);
        const entry = batch.units.find((candidate) => candidate.unitId === decision.unitId);
        if (!entry) errors.push(`${where}: unit is not a member of batch ${decision.batchId}`);
        else if (entry.textHash !== textHash(unit)) {
          errors.push(`${where}: unit text changed since batch ${decision.batchId} was written`);
        }
      }
    }
  }

  for (const file of existsSync(BATCH_DIR) ? readdirSync(BATCH_DIR).filter((name) => name.endsWith(".json")) : []) {
    const batch = readJson(join(BATCH_DIR, file));
    for (const entry of batch.units) {
      const unit = unitById.get(entry.unitId);
      if (!unit) errors.push(`${batch.batchId}: batch references unknown unit ${entry.unitId}`);
      else if (entry.textHash !== textHash(unit)) {
        errors.push(`${batch.batchId}: unit text changed since the batch was written (${entry.unitId})`);
      }
    }
  }

  const summaryPath = join(ANALYSIS, "semantic-ledger-summary.json");
  const ledger = existsSync(summaryPath) ? readJson(summaryPath) : null;
  if (!ledger) {
    warnings.push("no semantic-ledger-summary.json: run build-semantic-ledger.mjs");
  } else {
    const ledgerRead = ledger.semanticReading?.read ?? 0;
    if (ledgerRead !== decisions.length) {
      warnings.push(
        `ledger is stale: summary reports ${ledgerRead} read, review-decisions.json has ${decisions.length}. ` +
          "Re-run build-semantic-ledger.mjs.",
      );
    }
    if ((ledger.publication?.published ?? 0) !== 0) {
      errors.push("ledger reports published units; publication requires human approval that does not exist");
    }
  }

  const coverageReport = coverage();
  return {
    ok: errors.length === 0,
    decisions: decisions.length,
    eligible: coverageReport.corpus.eligible,
    unmatchedOpen: coverageReport.progress.unmatchedOpen,
    errors,
    warnings,
    statement:
      errors.length === 0
        ? "Decisions are internally consistent and every quote is verbatim. This is a technical check, not publication approval."
        : "Decision integrity failed. Fix the listed errors before rebuilding the ledger.",
  };
}

// --- main ------------------------------------------------------------------
let output;
if (command === "coverage") {
  const report = coverage();
  // --json must serialise: writing the object itself throws ERR_INVALID_ARG_TYPE.
  output = has("json") ? `${JSON.stringify(report, null, 2)}\n` : formatCoverage(report);
  process.stdout.write(output);
} else if (command === "queue") {
  const reasons = String(option("reason", "any"))
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => value !== "any");
  const families = String(option("family", "any"))
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((value) => value !== "any");
  const limit = Number(option("limit", 20));
  if (!Number.isInteger(limit) || limit < 1 || limit > 200) {
    console.error("--limit must be an integer between 1 and 200");
    process.exit(2);
  }
  const explicit = String(option("units", ""))
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const batch = selectBatch({ reasons, families, limit, units: explicit });
  if (!batch.units.length) {
    console.error("No unread unit matches that selection. Run `coverage` to see what is open.");
    process.exit(1);
  }
  const written = has("write") ? writeBatch(batch) : null;
  output = has("json") ? JSON.stringify(batch, null, 2) + "\n" : sheet(batch);
  process.stdout.write(output);
  if (written) process.stderr.write(`\nWrote ${written.batch}\nWrote ${written.sheet}\n`);
} else if (command === "sheet") {
  const batchId = option("batch");
  if (!batchId) {
    console.error("sheet needs --batch=<batchId> (see intelligent-atlas/semantic/batches/)");
    process.exit(2);
  }
  const batchPath = join(BATCH_DIR, `${batchId}.json`);
  if (!existsSync(batchPath)) {
    console.error(`No batch file at ${batchPath}`);
    process.exit(1);
  }
  process.stdout.write(sheet(readJson(batchPath)));
} else if (command === "check") {
  const result = check();
  process.stdout.write(JSON.stringify(result, null, 2) + "\n");
  if (!result.ok) process.exit(1);
} else {
  console.error(`Unknown command "${command}". Use: coverage | queue | sheet | check`);
  process.exit(2);
}
