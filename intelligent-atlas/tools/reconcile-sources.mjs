// D01: reconcile current content sources against the corpus manifest.
//
// Counts are kept separate: source files, extracted units, unique resources,
// revision overlays and discoverable routes are different denominators.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const ATLAS = join(ROOT, "intelligent-atlas");
const manifest = JSON.parse(readFileSync(join(ATLAS, "analysis", "corpus-manifest.json"), "utf8"));
const units = readFileSync(join(ATLAS, "analysis", "units-analyzed.jsonl"), "utf8")
  .trim()
  .split(/\r?\n/)
  .map((line) => JSON.parse(line));

// The corpus manifest fingerprints normalized JSON values (JSON.stringify),
// not raw bytes. Reproduce that normalization exactly so formatting changes do
// not masquerade as content changes.
const sha = (file) => {
  const raw = readFileSync(file, "utf8");
  if (file.endsWith(".json")) {
    return createHash("sha256").update(JSON.stringify(JSON.parse(raw))).digest("hex");
  }
  return createHash("sha256").update(raw).digest("hex");
};
const contentFiles = [];
function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(json|jsonl|md|html)$/i.test(entry.name)) contentFiles.push(full);
  }
}
walk(join(ROOT, "content"));
contentFiles.push(join(ROOT, "lib", "rti", "lessons.ts"));

const tracked = new Map(manifest.sources.map((source) => [source.path, source]));
const current = contentFiles.map((file) => {
  const path = relative(ROOT, file).replaceAll("\\", "/");
  return {
    path,
    bytes: statSync(file).size,
    sha256: sha(file),
    tracked: tracked.has(path),
    family: tracked.get(path)?.family ?? (path.startsWith("content/intake/") ? "intake-export" : "untracked-live-content"),
  };
});

const changed = [];
const unchanged = [];
const untracked = [];
for (const file of current) {
  if (!file.tracked) {
    untracked.push(file);
    continue;
  }
  const expected = tracked.get(file.path).fingerprint;
  if (expected === file.sha256) unchanged.push(file);
  else changed.push({ ...file, expected, actual: file.sha256 });
}
const missing = manifest.sources.filter((source) => !existsSync(join(ROOT, source.path)));

const families = {};
for (const unit of units) {
  const family = unit.sourceFamily;
  families[family] ??= {
    units: 0,
    mapped: 0,
    unmapped: 0,
    metadataOnly: 0,
    nonLearning: 0,
    uniqueResources: new Set(),
    revisionOverlays: 0,
  };
  const entry = families[family];
  entry.units += 1;
  if (unit.semanticAnalysisState === "analyzed-mapped") entry.mapped += 1;
  else if (unit.semanticAnalysisState === "analyzed-unmapped") entry.unmapped += 1;
  else if (unit.semanticAnalysisState === "excluded-metadata-only") entry.metadataOnly += 1;
  else if (unit.semanticAnalysisState === "excluded-nonlearning") entry.nonLearning += 1;
  if (unit.canonicalHref) entry.uniqueResources.add(unit.canonicalHref);
  if ((unit.contentForms ?? []).includes("revision-overlay")) entry.revisionOverlays += 1;
}
for (const entry of Object.values(families)) entry.uniqueResources = entry.uniqueResources.size;

const r11Ids = new Set(
  units.filter((unit) => unit.sourceFamily === "fabric-r11").map((unit) => unit.originalId),
);
const fabricIds = new Set(
  units.filter((unit) => unit.sourceFamily === "fabric-questions").map((unit) => unit.originalId),
);
const overlappingRevisionIds = [...r11Ids].filter((id) => fabricIds.has(id));

// Classify untracked files by evidence: do their identifiers already appear in
// extracted units? A zero-overlap file is not silently excluded; it is listed
// for an explicit disposition.
const unitIds = new Set(units.map((unit) => unit.originalId));
function collectIds(value, out = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectIds(item, out);
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      if (["id", "sourceId", "websiteId", "slug"].includes(key) && typeof item === "string") out.add(item);
      else collectIds(item, out);
    }
  }
  return out;
}
function classifyUntracked(file) {
  let overlap = 0;
  try {
    const parsed = JSON.parse(readFileSync(join(ROOT, file.path), "utf8"));
    const ids = collectIds(parsed);
    overlap = [...ids].filter((id) => unitIds.has(id)).length;
  } catch {
    overlap = 0;
  }
  if (overlap > 0) {
    return {
      disposition: "consumed-upstream-fragment",
      overlap,
      reason: "Its identifiers already appear in extracted units through a tracked aggregate.",
    };
  }
  if (file.path.startsWith("content/intake/")) {
    return {
      disposition: "preserved-intake-export",
      overlap,
      reason:
        "Preserved source export used for provenance; live extraction flows through the tracked content files. It is not counted as a second unit family.",
    };
  }
  if (file.path.startsWith("content/drafts/")) {
    return {
      disposition: "excluded-disabled-draft",
      overlap,
      reason: "Draft bank policy is NO_GO/disabled; not approved Hansa content and not part of the semantic corpus.",
    };
  }
  if (file.path.startsWith("content/atlas/")) {
    return {
      disposition: "separate-existing-atlas-artifact",
      overlap,
      reason: "Prior Atlas editorial artifact; its concepts and edges are outside this corpus build and require a separate reconciliation.",
    };
  }
  if (
    /(?:^|\/)(?:manifest|meta|packs|sources|id-map|search|datasets|editorial)\.json$/.test(file.path)
  ) {
    return {
      disposition: "supporting-metadata",
      overlap,
      reason: "Supporting metadata or generated index for a tracked family, not an independent teachable unit.",
    };
  }
  return {
    disposition: "needs-explicit-disposition",
    overlap,
    reason: "No tracked aggregate currently accounts for this file; it remains a coverage gap.",
  };
}
const classifiedUntracked = untracked.map((file) => ({ ...file, ...classifyUntracked(file) }));

const report = {
  schemaVersion: "intelligent-atlas-source-reconciliation/2.0",
  generatedAt: "2026-11-01",
  checkedAgainst: "intelligent-atlas/analysis/corpus-manifest.json",
  denominators: {
    manifestSourceFiles: manifest.sources.length,
    currentContentFiles: current.length,
    extractedUnits: units.length,
    eligibleUnits: units.filter((unit) =>
      ["analyzed-mapped", "analyzed-unmapped"].includes(unit.semanticAnalysisState),
    ).length,
    metadataOnlyUnits: units.filter((unit) => unit.semanticAnalysisState === "excluded-metadata-only").length,
    nonLearningUnits: units.filter((unit) => unit.semanticAnalysisState === "excluded-nonlearning").length,
    uniqueCanonicalResources: new Set(units.map((unit) => unit.canonicalHref).filter(Boolean)).size,
    revisionOverlayUnits: units.filter((unit) => (unit.contentForms ?? []).includes("revision-overlay")).length,
    discoverableRoutes: manifest.routeCount,
    mediaReferences: manifest.mediaCount,
  },
  sourceFiles: {
    trackedUnchanged: unchanged.length,
    trackedChanged: changed.length,
    untracked: untracked.length,
    missingFromDisk: missing.length,
    changed,
    missing: missing.map((source) => source.path),
    untracked: classifiedUntracked.map(({ path, family, bytes, disposition, overlap, reason }) => ({
      path,
      family,
      bytes,
      disposition,
      overlap,
      reason,
    })),
  },
  families,
  revisionOverlays: {
    r11UnitIds: r11Ids.size,
    overlappingExistingQuestionIds: overlappingRevisionIds.length,
    newQuestionIdsIntroduced: r11Ids.size - overlappingRevisionIds.length,
    note:
      "A revision overlay changes an existing question identity; it is not a second question. Counts are not added to the question denominator.",
  },
  routes: {
    total: manifest.routeCount,
    concrete: manifest.concreteRouteCount,
    dynamic: manifest.dynamicRouteCount,
    note: "Route discovery is structural navigation evidence, not semantic coverage.",
  },
  lateAdditions: {
    untrackedLiveContent: classifiedUntracked.filter((file) => file.family === "untracked-live-content"),
    intakeExports: classifiedUntracked.filter((file) => file.family === "intake-export").length,
    dispositions: classifiedUntracked.reduce((counts, file) => {
      counts[file.disposition] = (counts[file.disposition] ?? 0) + 1;
      return counts;
    }, {}),
    needsDisposition: classifiedUntracked.filter((file) => file.disposition === "needs-explicit-disposition"),
    note:
      "Intake exports are preserved source evidence, not automatically live website families. Untracked live content is classified by identifier overlap; zero-overlap files remain explicit coverage gaps.",
  },
  limits: [
    "A matching fingerprint proves the source file is unchanged; it does not prove semantic correctness.",
    "The manifest is dated 2026-10-31 and this reconciliation is dated 2026-11-01.",
    "Rendered media pixels remain not independently reviewed unless separately recorded.",
  ],
};

writeFileSync(
  join(ATLAS, "analysis", "source-reconciliation-v2.json"),
  JSON.stringify(report, null, 2) + "\n",
);

const md = `# Source reconciliation v2 — 2026-11-01

Checked against \`intelligent-atlas/analysis/corpus-manifest.json\` (generated ${manifest.generatedAt}).

## Denominators

| Measure | Count |
|---|---:|
| Manifest source files | ${report.denominators.manifestSourceFiles} |
| Current content files discovered | ${report.denominators.currentContentFiles} |
| Extracted units | ${report.denominators.extractedUnits} |
| Eligible units (mapped + unmapped) | ${report.denominators.eligibleUnits} |
| Metadata-only units | ${report.denominators.metadataOnlyUnits} |
| Non-learning units | ${report.denominators.nonLearningUnits} |
| Unique canonical resources | ${report.denominators.uniqueCanonicalResources} |
| Revision overlay units | ${report.denominators.revisionOverlayUnits} |
| Discoverable routes | ${report.denominators.discoverableRoutes} |
| Media references | ${report.denominators.mediaReferences} |

These denominators are not interchangeable. A unit is not a unique resource, and a revision overlay is not a new question.

## Source file integrity

- Tracked and byte-identical: **${report.sourceFiles.trackedUnchanged}**
- Tracked but changed: **${report.sourceFiles.trackedChanged}**
- Missing from disk: **${report.sourceFiles.missingFromDisk}**
- Untracked content files: **${report.sourceFiles.untracked}** (${report.lateAdditions.intakeExports} intake exports, ${report.lateAdditions.untrackedLiveContent.length} untracked live-content files)

${changed.length ? changed.map((file) => `- CHANGED: \`${file.path}\`\n  - expected \`${file.expected}\`\n  - actual \`${file.actual}\``).join("\n") : "No tracked source file changed since the manifest."}

## Family ledger

| Family | Units | Mapped | Unmapped | Metadata-only | Non-learning | Unique resources | Revision overlays |
|---|---:|---:|---:|---:|---:|---:|---:|
${Object.entries(families)
  .map(
    ([family, entry]) =>
      `| ${family} | ${entry.units} | ${entry.mapped} | ${entry.unmapped} | ${entry.metadataOnly} | ${entry.nonLearning} | ${entry.uniqueResources} | ${entry.revisionOverlays} |`,
  )
  .join("\n")}

## Revision overlays

- R11 overlay unit IDs: **${r11Ids.size}**
- Overlapping existing question IDs: **${overlappingRevisionIds.length}**
- New question identities: **${r11Ids.size - overlappingRevisionIds.length}**

## Late additions and untracked files

| Disposition | Files |
|---|---:|
${Object.entries(report.lateAdditions.dispositions)
  .map(([disposition, count]) => `| ${disposition} | ${count} |`)
  .join("\n")}

Untracked files are classified by identifier overlap with extracted units. Files with no overlap are **not** silently excluded: ${report.lateAdditions.needsDisposition.length} remain explicit coverage gaps and are listed in the JSON artifact. Intake exports are preserved evidence and are not promoted to live content.

## Limits

${report.limits.map((limit) => `- ${limit}`).join("\n")}
`;
writeFileSync(join(ATLAS, "analysis", "source-reconciliation-v2.md"), md);

console.log(
  JSON.stringify(
    {
      out: "intelligent-atlas/analysis/source-reconciliation-v2.json",
      trackedUnchanged: unchanged.length,
      trackedChanged: changed.length,
      untracked: untracked.length,
      missing: missing.length,
      families: Object.keys(families).length,
    },
    null,
    2,
  ),
);
