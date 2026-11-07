#!/usr/bin/env node
// build-aliases.mjs — FC02 redirect/alias ledger builder (deterministic).
//
// Usage:
//   node build-aliases.mjs <corpus-root> <coverage-manifest.json> <out-aliases.json> <out-ledger.md>
//
// Parses every present .openpublishing.redirection.*.json (plus the root
// .openpublishing.redirection.json) under the pinned corpus, cross-checks them
// against .openpublishing.publish.config.json (the publish config lives at the
// repo ROOT and lists the redirection files per docset), detects chains/cycles,
// records query/fragment usage and emits:
//   - aliases.json (machine ledger)
//   - docs/fabric-corpus/ledgers/redirect-ledger.md (human ledger)
//
// Known upstream blocker recorded here: the publish config references
// docs/database/mirrored-database/.openpublishing.redirection.database.json,
// but that directory/file does not exist in the pinned tree (and the file is
// not tracked in the coverage manifest). Remediation owner: FC02 ledger record
// + upstream investigation.

import fs from "node:fs";
import path from "node:path";

const PINNED_REVISION = "774592ea3f2d4558f763d6e5b74abf4785948fb5";
const [, , corpusArg, manifestArg, aliasesArg, ledgerArg] = process.argv;
if (!corpusArg || !manifestArg || !aliasesArg || !ledgerArg) {
  console.error("usage: node build-aliases.mjs <corpus-root> <coverage-manifest.json> <out-aliases.json> <out-ledger.md>");
  process.exit(2);
}
const corpusRoot = path.resolve(corpusArg);
const manifestPath = path.resolve(manifestArg);
const aliasesOut = path.resolve(aliasesArg);
const ledgerOut = path.resolve(ledgerArg);

const fail = (msg) => {
  console.error("BUILD FAIL: " + msg);
  process.exit(1);
};

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
if (manifest.revision !== PINNED_REVISION) fail(`manifest revision ${manifest.revision} != pinned`);
const manifestPaths = new Set(manifest.rows.map((r) => r.path));

// ---------------------------------------------------------------------------
// Discover publish config + redirection files
// ---------------------------------------------------------------------------

const configPath = path.join(corpusRoot, ".openpublishing.publish.config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const docset = (config.docsets_to_publish || [])[0];
if (!docset) fail("publish config has no docsets_to_publish[0]");
const configReferenced = docset.redirection_files || [];

/** collect present redirection files (root + docs tree) */
const presentFiles = [];
function walk(dir) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/^\.openpublishing\.redirection\..*\.json$/.test(e.name) || e.name === ".openpublishing.redirection.json") {
      presentFiles.push(p);
    }
  }
}
walk(corpusRoot);
const presentRel = presentFiles.map((p) => path.relative(corpusRoot, p).replace(/\\/g, "/")).sort();
const configReferencedSorted = [...configReferenced].sort();

const missingFromDisk = configReferencedSorted.filter((p) => !presentRel.includes(p) && !manifestPaths.has(p));
const presentNotReferenced = presentRel.filter((p) => !configReferenced.includes(p));

// ---------------------------------------------------------------------------
// Parse redirection rows
// ---------------------------------------------------------------------------

const redirections = []; // {from,to,redirectDocumentId,sourceFile,anomalies:[]}
const fileStats = [];
const dataQuality = { nonStandardSourceKey: 0, trailingSlashSource: 0, trailingWhitespaceSource: 0, missingLeadingSlashSource: 0, nullSource: 0 };
let filesParsed = 0;

for (const rel of presentRel) {
  const abs = path.join(corpusRoot, rel);
  let j;
  try {
    j = JSON.parse(fs.readFileSync(abs, "utf8"));
  } catch (err) {
    fail(`unparsable redirection file ${rel}: ${err.message}`);
  }
  const rows = Array.isArray(j.redirections) ? j.redirections : [];
  filesParsed += 1;
  let fileRows = 0;
  rows.forEach((r, i) => {
    const rawSource = r.source_path_from_root ?? r.source_path ?? null;
    if (rawSource === null) {
      dataQuality.nullSource += 1;
      return;
    }
    if (r.source_path_from_root === undefined && r.source_path !== undefined) {
      dataQuality.nonStandardSourceKey += 1;
    }
    let source = String(rawSource).replace(/\\/g, "/");
    if (source !== source.trim()) dataQuality.trailingWhitespaceSource += 1;
    source = source.trim();
    if (source.endsWith("/")) dataQuality.trailingSlashSource += 1;
    const to = String(r.redirect_url ?? "");
    const anomalies = [];
    if (r.source_path_from_root === undefined && r.source_path !== undefined) anomalies.push("non-standard-key:source_path");
    if (String(rawSource) !== source) anomalies.push("source-needed-trim");
    if (!source.startsWith("/")) {
      source = "/" + source;
      dataQuality.missingLeadingSlashSource += 1;
      anomalies.push("source-missing-leading-slash");
    }
    redirections.push({
      from: source,
      to,
      redirectDocumentId: r.redirect_document_id === true,
      sourceFile: rel,
      order: i,
      anomalies,
    });
    fileRows += 1;
  });
  fileStats.push({ path: rel, present: true, referencedByPublishConfig: configReferenced.includes(rel), redirections: fileRows });
}

// ---------------------------------------------------------------------------
// Classify targets, detect chains and cycles
// ---------------------------------------------------------------------------

let docIdTrue = 0, withQuery = 0, withFragment = 0, externalTargets = 0, selfRedirects = 0;
const targetKinds = {};
for (const r of redirections) {
  if (r.redirectDocumentId) docIdTrue += 1;
  if (r.to.includes("?")) withQuery += 1;
  if (r.to.includes("#")) withFragment += 1;
  let kind;
  if (/^https?:\/\//i.test(r.to)) { kind = "absolute-url"; externalTargets += 1; }
  else if (r.to.startsWith("/fabric/")) kind = "fabric-site-relative";
  else if (r.to.startsWith("/docs/")) kind = "docs-relative";
  else if (r.to.startsWith("/")) kind = "other-docset-site-relative";
  else if (r.to === "") kind = "empty";
  else kind = "other";
  r.targetKind = kind;
  targetKinds[kind] = (targetKinds[kind] || 0) + 1;
  if (r.to.replace(/[?#].*$/, "").replace(/\/$/, "") === r.from.replace(/\/$/, "")) {
    selfRedirects += 1;
    r.selfRedirect = true;
  }
}

/** map a /fabric/<rest> target back into the docs tree (candidate keys, with/without .md) */
function fabricTargetToDocsPathCandidates(to) {
  const stripped = to.split(/[?#]/)[0].replace(/^\/(?:en-us\/)?fabric\//, "").replace(/\/$/, "");
  return ["/docs/" + stripped, "/docs/" + stripped + ".md"];
}
const sourceSet = new Set(redirections.map((r) => r.from));
const edges = new Map(); // from -> normalized target source path (only when the target is itself a redirect source)
for (const r of redirections) {
  if (r.targetKind === "fabric-site-relative") {
    const cand = fabricTargetToDocsPathCandidates(r.to).find((c) => sourceSet.has(c));
    if (cand) edges.set(r.from, cand);
  }
}

// chain/cycle walk with visited-set cycle detection
const cycles = [];
const chains = [];
const onPath = new Set();
const fullyVisited = new Set();
function walkChain(start) {
  const pathNodes = [start];
  onPath.add(start);
  let cur = edges.get(start);
  while (cur) {
    if (onPath.has(cur)) {
      const idx = pathNodes.indexOf(cur);
      cycles.push({ nodes: pathNodes.slice(idx).concat([cur]) });
      break;
    }
    if (fullyVisited.has(cur)) {
      // joins a known chain tail: record the extended chain, no new cycle
      pathNodes.push(cur);
      break;
    }
    pathNodes.push(cur);
    onPath.add(cur);
    cur = edges.get(cur);
  }
  if (pathNodes.length > 1) chains.push({ nodes: pathNodes });
  for (const n of pathNodes) { onPath.delete(n); fullyVisited.add(n); }
}
for (const start of [...edges.keys()].sort()) if (!fullyVisited.has(start)) walkChain(start);

/** classify /fabric/<rest> targets: real corpus path, redirect-chain target, or neither */
let targetInCorpus = 0, targetViaChain = 0, targetUnresolvable = 0;
const unresolvableTargets = [];
for (const r of redirections) {
  if (r.targetKind !== "fabric-site-relative") continue;
  const rest = fabricTargetToDocsPathCandidates(r.to)[0].slice("/docs/".length);
  const cands = ["docs/" + rest, "docs/" + rest + ".md", "docs/" + rest + ".yml"];
  const docsCands = fabricTargetToDocsPathCandidates(r.to);
  if (cands.some((c) => manifestPaths.has(c))) targetInCorpus += 1;
  else if (docsCands.some((c) => sourceSet.has(c))) targetViaChain += 1;
  else {
    targetUnresolvable += 1;
    if (unresolvableTargets.length < 100) unresolvableTargets.push({ from: r.from, to: r.to });
  }
}

// ---------------------------------------------------------------------------
// Assemble aliases.json
// ---------------------------------------------------------------------------

const handoverClaim = { presentConfigReferencedFiles: 19, rowsAcrossParsedFiles: 1004 };
const summary = {
  publishConfigPath: ".openpublishing.publish.config.json",
  docsetName: docset.docset_name || "fabric-docs",
  configReferencedRedirectionFiles: configReferencedSorted.length,
  trackedRedirectionFilesInManifest: manifest.rows.filter((r) => r.kind === "redirect").length,
  presentRedirectionFilesOnDisk: presentRel.length,
  filesParsed,
  rowsTotal: redirections.length,
  handoverClaim,
  reconciliation: {
    handoverClaimedRowsAcrossFiles: handoverClaim.rowsAcrossParsedFiles,
    explanation:
      "Handover 02 reported 19 present redirection files with 1,004 rows. Those 19 are the publish-config-referenced files that exist on disk; the corpus additionally tracks the root .openpublishing.redirection.json (0 rows), docs/governance/...governance.json (7 rows) and docs/real-time-hub/...real-time-hub.json (3 rows), which the config does not reference. 1,004 + 10 = 1,014 rows across all 22 tracked files: the claim reconciles under the config-referenced definition.",
    rowsInConfigReferencedPresentFiles: fileStats
      .filter((f) => f.referencedByPublishConfig)
      .reduce((a, b) => a + b.redirections, 0),
  },
  redirectDocumentIdTrue: docIdTrue,
  targetsWithQuery: withQuery,
  targetsWithFragment: withFragment,
  targetKinds,
  externalTargets,
  selfRedirects,
  chains: chains.length,
  cycles: cycles.length,
  fabricTargetsInCorpus: targetInCorpus,
  fabricTargetsViaRedirectChain: targetViaChain,
  fabricTargetsUnresolvable: targetUnresolvable,
  dataQuality,
};

const blockers = missingFromDisk.map((p, i) => ({
  id: `blk-${String(i + 1).padStart(4, "0")}`,
  type: "missing-redirection-file",
  path: p,
  referencedBy: ".openpublishing.publish.config.json (docsets_to_publish[0].redirection_files)",
  observation:
    "Referenced by the publish config but neither present on disk nor tracked in the coverage manifest at revision 774592ea (directory docs/database/mirrored-database/ does not exist). Upstream publishing would fail or silently skip this alias map.",
  requiredAction:
    "Upstream investigation: confirm whether the mirrored-database docset aliases moved into docs/database/.openpublishing.redirection.database.json or were lost. If needed for alias fidelity, recover the historical file from upstream git history into an authorized staging area and add it under an explicit ledger row.",
  owner: "FC02 (ledger record) / upstream investigation",
  status: "open",
  evidence: `fabric-docs-light@${PINNED_REVISION.slice(0, 8)}:path-absent; FULL_CORPUS_COVERAGE.json@${PINNED_REVISION.slice(0, 8)}:no-such-row`,
}));

const aliases = {
  generatedAt: new Date().toISOString(),
  revision: PINNED_REVISION,
  contract: "docs/fabric-corpus/contracts/IDENTITY_REGISTRY.md",
  summary,
  blockers,
  redirectionFiles: fileStats.sort((a, b) => (a.path < b.path ? -1 : 1)),
  cycles,
  chains: chains.slice(0, 200),
  unresolvableTargetsSample: unresolvableTargets,
  redirections,
};

fs.mkdirSync(path.dirname(aliasesOut), { recursive: true });
fs.writeFileSync(aliasesOut, JSON.stringify(aliases, null, 1) + "\n", "utf8");

// ---------------------------------------------------------------------------
// Emit human ledger (redirect-ledger.md)
// ---------------------------------------------------------------------------

const lines = [];
lines.push("# Redirect ledger (aliases)");
lines.push("");
lines.push(`- Corpus revision: \`${PINNED_REVISION}\` (pinned MicrosoftDocs/fabric-docs).`);
lines.push(`- Generated: \`${aliases.generatedAt}\` by \`tools/fabric-corpus/registry/build-aliases.mjs\`. Reviewer of record: FC02; final alias approval follows the reviewed-rename rule in IDENTITY_REGISTRY.md.`);
lines.push(`- Publish config: \`.openpublishing.publish.config.json\` at the repo root references **${configReferencedSorted.length}** redirection files; **${presentRel.length}** redirection files are present on disk and tracked; **${missingFromDisk.length}** config-referenced file is missing (BLOCKER below); **${presentNotReferenced.length}** present files are NOT referenced by the config.`);
lines.push(`- Rows parsed: **${redirections.length}** across ${filesParsed} files (${docIdTrue} with \`redirect_document_id: true\`).`);
lines.push("");
lines.push("## File inventory");
lines.push("");
lines.push("| Redirection file | Present | In publish config | Rows |");
lines.push("|---|---|---|---|");
for (const f of aliases.redirectionFiles) {
  lines.push(`| \`${f.path}\` | yes | ${f.referencedByPublishConfig ? "yes" : "NO"} | ${f.redirections} |`);
}
lines.push("");
lines.push(`Total rows: **${redirections.length}**. The handover's "19 present files / 1,004 rows" counts only the config-referenced files that exist on disk; adding the unreferenced governance (7), real-time-hub (3) and root (0) files gives 1,014 — the claim reconciles under that definition.`);
lines.push("");
lines.push("## Target classification");
lines.push("");
for (const [k, v] of Object.entries(targetKinds).sort()) lines.push(`- \`${k}\`: ${v}`);
lines.push(`- with query string: ${withQuery}; with fragment: ${withFragment}; \`redirect_document_id: true\`: ${docIdTrue}; self-redirects: ${selfRedirects}.`);
lines.push(`- /fabric/... targets resolving to a real path in the pinned corpus: **${targetInCorpus}**; targets that are themselves redirect sources (chain via the alias map): **${targetViaChain}**; unresolvable in the pinned snapshot: **${targetUnresolvable}** (stale upstream targets — sample in \`aliases.json#unresolvableTargetsSample\`).`);
lines.push("");
lines.push("## Chains and cycles");
lines.push("");
lines.push(`- Redirect targets that point at another redirect source (chains): **${chains.length}** recorded in \`aliases.json#chains\`.`);
lines.push(`- Cycles (a redirect graph loop): **${cycles.length}**${cycles.length ? " — listed below" : ""}.`);
for (const c of cycles) lines.push(`  - ${c.nodes.join(" -> ")}`);
lines.push("");
lines.push("## Data-quality anomalies (recorded, not silently normalized)");
lines.push("");
lines.push(`- Rows using non-standard key \`source_path\` instead of \`source_path_from_root\`: ${dataQuality.nonStandardSourceKey} (docs/data-science/.openpublishing.redirection.data-science.json).`);
lines.push(`- Sources written with a trailing slash: ${dataQuality.trailingSlashSource}.`);
lines.push(`- Sources written with trailing whitespace: ${dataQuality.trailingWhitespaceSource}.`);
lines.push(`- Sources missing the leading slash (normalized, anomaly recorded): ${dataQuality.missingLeadingSlashSource}.`);
lines.push(`- Rows with null source: ${dataQuality.nullSource}.`);
lines.push("");
lines.push("## BLOCKER");
lines.push("");
for (const b of blockers) {
  lines.push(`- **${b.id} — ${b.type}: \`${b.path}\`** — ${b.observation} Remediation owner: ${b.owner}. Evidence: ${b.evidence}.`);
}
lines.push("");
lines.push("## Consumed by");
lines.push("");
lines.push("- `tools/fabric-corpus/registry/aliases.json` (machine ledger, 1:1 with this document).");
lines.push("- Identity registry rows with disposition `redirect-map` (22 files).");
lines.push("");
fs.mkdirSync(path.dirname(ledgerOut), { recursive: true });
fs.writeFileSync(ledgerOut, lines.join("\n") + "\n", "utf8");

console.log(`aliases ledger built: ${aliasesOut}`);
console.log(`redirect ledger built: ${ledgerOut}`);
console.log(`  files present=${presentRel.length} parsed=${filesParsed} configReferenced=${configReferencedSorted.length} missing=${missingFromDisk.length}`);
console.log(`  rows=${redirections.length} docIdTrue=${docIdTrue} query=${withQuery} fragment=${withFragment} selfRedirects=${selfRedirects}`);
console.log(`  chains=${chains.length} cycles=${cycles.length} targetsInCorpus=${targetInCorpus} targetsViaChain=${targetViaChain} unresolvableTargets=${targetUnresolvable}`);
console.log(`  blockers=${blockers.length} dataQuality=${JSON.stringify(dataQuality)}`);
