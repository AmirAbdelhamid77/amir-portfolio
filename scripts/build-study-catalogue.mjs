// Build the curated study-hub reference and hands-on layers from the Hansa
// Deep Research Corpus distillation in `content/intake/hansa-integration/`.
//
//   node scripts/build-study-catalogue.mjs
//
// Phase A (references): every curated record is LINK_ONLY or a linked
// REDISTRIBUTABLE repository — it is published as a link + a Hansa-written
// gloss, never as republished content. Phase B (hands-on labs): REDISTRIBUTABLE
// lab scaffolds from open-source repositories become structured lab pages.
//
// A structural defect (rights class missing, subject/topic not in the
// taxonomy mirror, duplicate id/URL/slug) stops the build with a non-zero
// exit, mirroring the import discipline of scripts/import-fabric-bank.mjs.
// Curation rejections are counted with reasons and written into the output
// meta block so the curation itself is auditable.

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INTAKE = "content/intake/hansa-integration";
const OUT = "content/study";

const sha256 = (text) => createHash("sha256").update(text).digest("hex");

// ---------------------------------------------------------------------------
// Taxonomy mirror of lib/study/taxonomy.ts (subjects + valid topics only).
// tests/content/study-catalogue.test.mjs re-validates the output against the
// real TypeScript taxonomy so a drift here fails the test suite.
// ---------------------------------------------------------------------------
const SUBJECT_TOPICS = {
  fabric: ["foundations", "ingestion", "transform", "query", "model", "security", "delivery", "streaming", "overview"],
  statistics: ["foundations", "describe", "probability", "distributions", "sampling", "hypothesis", "experiments", "relationships", "synthesis"],
  visualization: ["foundations", "comparison", "distribution", "relationships", "time", "composition", "accessibility", "overview"],
  "power-bi": ["prepare", "model", "report", "govern", "overview"],
  sql: ["overview", "foundations", "schema", "types-null", "filtering", "joins", "aggregation", "subqueries", "sets", "windows", "time", "text", "analytics", "quality", "transactions", "design", "performance", "warehouse", "postgresql", "interview", "toolkit"],
  python: ["overview"],
  excel: ["overview"],
  analysis: ["overview"],
};

// ---------------------------------------------------------------------------
// Reference curation
// ---------------------------------------------------------------------------

// Whole domains excluded from the reference layer, with the reason that is
// written into the output meta. Exam-prep and community answer-key sites are
// rejected to keep the site's "independent, not official / no dumps" posture;
// kernel/tooling docs are outside the analytics subjects.
const EXCLUDED_DOMAINS = {
  "certiace.com": "Exam-prep guide site; conflicts with the independent, not-official, no-dumps discipline",
  "msfthub.com": "Exam-prep aggregator; conflicts with the independent, not-official, no-dumps discipline",
  "kengio.github.io": "Community question-bank source; answer keys are not independently validated",
  "www.youtube.com": "Single video link; not a documentation reference for the study catalogue",
  "xeus-python.readthedocs.io": "Python kernel tooling; outside the published analytics subjects",
  "ipython.readthedocs.io": "Python kernel tooling; outside the published analytics subjects",
};

// github.com owners allowed into the reference layer: official publishers and
// established open-source analytics tooling. Unknown personal accounts stay
// out; the count lands in the meta block.
const GITHUB_OWNER_ALLOWLIST = new Set([
  "microsoft", "Microsoft", "MicrosoftLearning", "MicrosoftDocs", "microsoftdocs",
  "Azure", "Azure-Samples", "sql-bi", "TabularEditor", "daxlib", "m-kovalsky",
  "DataTalksClub", "duckdb", "pandas-dev", "apache", "databricks", "dbt-labs",
  "elementary-data", "kustonaut",
]);

// learn.microsoft.com sections carried into the catalogue.
const LEARN_ALLOWED_PREFIXES = [
  "fabric", "power-bi", "sql", "dax", "kusto", "analysis-services", "ssms",
];

// learn.microsoft.com/en-us/fabric/<area>/ → topic. Unlisted areas fall back
// to the fabric title rules below; everything stays an organizational
// placement, which the basis string on each record states.
const FABRIC_AREA_TOPIC = {
  "data-factory": "ingestion",
  "data-movement": "ingestion",
  "real-time": "streaming",
  "real-time-intelligence": "streaming",
  "security": "security",
  "governance": "security",
  "purview": "security",
  "cicd": "delivery",
  "devops": "delivery",
  "deployment": "delivery",
  "lifecycle": "delivery",
  "warehouse": "query",
  "database": "query",
  "fundamentals": "foundations",
  "onelake": "foundations",
  "lakehouse": "foundations",
  "get-started": "foundations",
  "data-engineering": "transform",
};

// Title rules for fabric material without an area match (same vocabulary as
// the study-hub classifier in lib/study/taxonomy.ts).
const FABRIC_TITLE_RULES = [
  ["security", /security|permission|grant|mask|rls|ols|access control|governance|endorse|certif|sensitivity|protection/i],
  ["delivery", /deployment|git|lifecycle|monitor|cicd|ci\/cd|capacity|migration|bicep|arm template|api for lifecycle/i],
  ["model", /semantic|dax|star schema|dimension|slowly changing|direct lake|directlake|scd|measure/i],
  ["streaming", /kql|eventhouse|eventstream|real.time|streaming|kusto|activator|reflex/i],
  ["ingestion", /ingest|pipeline|orchestrat|copy job|data movement|mirroring|shortcut|dataflow gen2|opendeliver/i],
  ["transform", /delta|spark|notebook|parquet|vacuum|optimiz|transformation|dataflow|wrangler|environment/i],
  ["query", /sql|warehouse|query|t-sql|endpoint/i],
  ["foundations", /onelake|lakehouse|storage|architecture|tenant|workspace|domain|one lake/i],
];

const PUBLISHER_LABEL = {
  "learn.microsoft.com": "Official Microsoft Learn documentation",
  "microsoftlearning.github.io": "Official Microsoft courseware repository",
  "semantic-link-labs.readthedocs.io": "Semantic Link Labs — open-source Fabric tooling documentation",
  "microsoft.github.io": "Microsoft open-source documentation",
  "datatalksclub.github.io": "Data Engineering Zoomcamp — open course documentation",
  "github.com": "Open-source repository",
  "www.microsoft.com": "Microsoft product documentation",
};

const rejections = [];
const experimentRejections = [];
function reject(reason, record) {
  rejections.push({ reason, corpus_id: record?.corpus_id ?? record?.suggested_id ?? null });
}
function rejectExperiment(reason, record) {
  experimentRejections.push({ reason, corpus_id: record?.corpus_id ?? record?.suggested_id ?? null });
}

function cleanTitle(title) {
  return String(title ?? "").replace(/\s+/g, " ").trim();
}

function isJunkTitle(title) {
  return title.length < 6 || /^(find your guide|start studying)\b/i.test(title);
}

// Ordered mapping rules; the first match wins. Each returns {subject, topic,
// basis} or undefined (rejected by the caller's fallback policy).
function mapReference(record) {
  const title = record._title;
  const url = record.url;
  const domain = record.domain;

  const learnArea = url.match(/learn\.microsoft\.com\/[a-z-]{2,8}\/([a-z0-9-]+)\//);
  if (domain === "learn.microsoft.com") {
    const area = learnArea?.[1];
    if (!area) return undefined;
    if (!LEARN_ALLOWED_PREFIXES.includes(area)) {
      // Azure, REST and adjacent sections only when the page is
      // analytics-relevant; the subject follows the product the page is about.
      const relevant = /^(azure|rest)$/.test(area) &&
        /synapse|data.?explorer|event.?hub|storage|data.?factory|databricks|kusto|fabric|azure-sql|power-bi|open-datasets|data-warehouse|architecture\/example-scenario\/data/i.test(`${url}`);
      if (!relevant) return undefined;
      if (/rest\/api\/power-bi|\/azure\/azure-sql/i.test(url)) {
        return { subject: /power-bi/.test(url) ? "power-bi" : "sql", topic: "overview", basis: "Curator rule: REST/Azure SQL page matched by product; organizational placement, not scientific validation" };
      }
      if (/open-datasets|architecture\/example-scenario\/data/i.test(url)) {
        return { subject: "fabric", topic: "overview", basis: "Curator rule: open dataset or analytics architecture scenario; organizational placement, not scientific validation" };
      }
      return { subject: "fabric", topic: "overview", basis: "Curator rule: Azure page matches analytics keywords; organizational placement, not scientific validation" };
    }
    const fabricArea = area === "fabric" ? url.match(/learn\.microsoft\.com\/[a-z-]{2,8}\/fabric\/([a-z0-9-]+)\//)?.[1] : undefined;
    if (fabricArea && FABRIC_AREA_TOPIC[fabricArea]) {
      return { subject: "fabric", topic: FABRIC_AREA_TOPIC[fabricArea], basis: `Official documentation area (fabric/${fabricArea}); organizational placement, not scientific validation` };
    }
    if (area === "fabric") {
      const rule = FABRIC_TITLE_RULES.find(([, pattern]) => pattern.test(`${title} ${url}`));
      return {
        subject: "fabric",
        topic: rule?.[0] ?? "overview",
        basis: rule ? "Metadata/title rule; organizational placement, not scientific validation" : "Broad subject placement; finer editorial mapping pending",
      };
    }
    if (area === "power-bi" || area === "dax" || area === "analysis-services") {
      const rule = POWER_BI_TITLE_RULES.find(([, pattern]) => pattern.test(`${title} ${url}`));
      return { subject: "power-bi", topic: rule?.[0] ?? "model", basis: "Metadata/title rule; organizational placement, not scientific validation" };
    }
    if (area === "sql" || area === "ssms") {
      return { subject: "sql", topic: "overview", basis: "Official SQL documentation; organizational placement, not scientific validation" };
    }
    if (area === "kusto") {
      return { subject: "fabric", topic: "streaming", basis: "KQL/Kusto documentation area; organizational placement, not scientific validation" };
    }
    if (area === "credentials" || area === "training") {
      if (/DP-600|DP-700|Fabric|Real-Time Intelligence|Analytics Engineer|Data Engineer/i.test(`${title} ${url}`)) return { subject: "fabric", topic: "overview", basis: "Certification/official training page matched by exam or product name; organizational placement" };
      if (/PL-300|Power BI|Data Analyst/i.test(`${title} ${url}`)) return { subject: "power-bi", topic: "overview", basis: "Certification/official training page matched by exam or product name; organizational placement" };
      return undefined;
    }
    // Adjacent official sections that carry analytics-relevant pages only.
    const ADJACENT_AREAS = {
      "purview": ["fabric", "security"],
      "entra": ["fabric", "security"],
      "data-integration": ["fabric", "ingestion"],
      "data-migration": ["sql", "overview"],
      "industry": ["fabric", "overview"],
      "troubleshoot": ["sql", "overview"],
    };
    if (ADJACENT_AREAS[area]) {
      const [subject, topic] = ADJACENT_AREAS[area];
      return { subject, topic, basis: `Official documentation area (${area}/); organizational placement, not scientific validation` };
    }
    if (area === "python" && /semantic-link|sempy/i.test(url)) {
      return { subject: "fabric", topic: "model", basis: "Semantic Link (sempy) Python API documentation; organizational placement" };
    }
    if (area === "powershell" && /power-bi|sqlserver|kusto/i.test(url)) {
      const subject = /power-bi/i.test(url) ? "power-bi" : /kusto/i.test(url) ? "fabric" : "sql";
      return { subject, topic: subject === "power-bi" ? "govern" : subject === "fabric" ? "streaming" : "overview", basis: "Official PowerShell module matched by product; organizational placement" };
    }
    if (area === "dotnet" && /analysisservices|tabular|semantic/i.test(url)) {
      return { subject: "power-bi", topic: "model", basis: "Tabular Object Model / Analysis Services .NET API; organizational placement" };
    }
    if (area === "shows" && /DP-600|DP-700|fabric|power-bi|kusto|data-exposed/i.test(`${title} ${url}`)) {
      return { subject: "fabric", topic: "overview", basis: "Official Microsoft Learn show matched by exam or product name; organizational placement" };
    }
    return undefined;
  }

  if (domain === "semantic-link-labs.readthedocs.io") {
    const rule = FABRIC_TITLE_RULES.find(([, pattern]) => pattern.test(title));
    return { subject: "fabric", topic: rule?.[0] ?? "model", basis: "Semantic Link Labs documentation; organizational placement, not scientific validation" };
  }

  if (domain === "microsoftlearning.github.io") {
    if (/power.?bi|PL-300/i.test(title)) {
      const rule = POWER_BI_TITLE_RULES.find(([, pattern]) => pattern.test(title));
      return { subject: "power-bi", topic: rule?.[0] ?? "overview", basis: "Official courseware title rule; organizational placement" };
    }
    if (/sql|T-SQL/i.test(title)) return { subject: "sql", topic: "overview", basis: "Official courseware title rule; organizational placement" };
    const rule = FABRIC_TITLE_RULES.find(([, pattern]) => pattern.test(title));
    return { subject: "fabric", topic: rule?.[0] ?? "overview", basis: "Official courseware title rule; organizational placement" };
  }

  if (domain === "microsoft.github.io") {
    const rule = FABRIC_TITLE_RULES.find(([, pattern]) => pattern.test(title));
    return { subject: "fabric", topic: rule?.[0] ?? "overview", basis: "Microsoft open-source documentation title rule; organizational placement" };
  }

  if (domain === "datatalksclub.github.io") {
    return { subject: "analysis", topic: "overview", basis: "Open data-engineering course; broad foundation placement, not a subject-specific claim" };
  }

  if (domain === "www.microsoft.com") {
    if (/fabric|power.?bi|sql|analytics/i.test(title)) {
      const rule = FABRIC_TITLE_RULES.find(([, pattern]) => pattern.test(title));
      return { subject: "fabric", topic: rule?.[0] ?? "overview", basis: "Product page matched by name; organizational placement" };
    }
    return undefined;
  }

  if (domain === "github.com") {
    const owner = url.match(/github\.com\/([^/]+)/)?.[1];
    if (!owner || !GITHUB_OWNER_ALLOWLIST.has(owner)) return undefined;
    if (/fabric|onelake|eventhouse|kql|kusto|semantic-link/i.test(`${url} ${title}`)) {
      const rule = FABRIC_TITLE_RULES.find(([, pattern]) => pattern.test(`${title} ${url}`));
      return { subject: "fabric", topic: rule?.[0] ?? "overview", basis: `Repository matched by name (${owner}); organizational placement` };
    }
    if (/power.?bi|dax|tabular|pbi/i.test(`${url} ${title}`)) {
      const rule = POWER_BI_TITLE_RULES.find(([, pattern]) => pattern.test(`${title} ${url}`));
      return { subject: "power-bi", topic: rule?.[0] ?? "model", basis: `Repository matched by name (${owner}); organizational placement` };
    }
    if (/duckdb|sql|warehouse/i.test(`${url} ${title}`)) return { subject: "sql", topic: "overview", basis: `Repository matched by name (${owner}); organizational placement` };
    if (/pandas|python|jupyter/i.test(`${url} ${title}`)) return { subject: "python", topic: "overview", basis: `Repository matched by name (${owner}); organizational placement` };
    if (/dbt|airflow|data.?engineering|zoomcamp|kafka|spark/i.test(`${url} ${title}`)) return { subject: "analysis", topic: "overview", basis: `Repository matched by name (${owner}); broad data-engineering placement` };
    return { subject: "analysis", topic: "overview", basis: `Allowed repository (${owner}); broad placement pending finer mapping` };
  }

  return undefined;
}

const POWER_BI_TITLE_RULES = [
  ["govern", /publish|security|permission|workspace|deploy|rls|refresh|governance|tenant/i],
  ["report", /visual|report|dashboard|filter|slicer|bookmark/i],
  ["prepare", /power query|transform|prepare|etl|load|ingest|clean|mashup/i],
  ["model", /dax|model|relationship|measure|calculate|tabular|semantic|star/i],
];

// ---------------------------------------------------------------------------
// Experiment (hands-on lab) curation
// ---------------------------------------------------------------------------

// Domains published as lab pages; everything else is held back with a reason.
const PUBLISHED_EXP_DOMAINS = new Set(["fabric", "power-bi", "sql"]);
const HELD_BACK_DOMAINS = {
  general: "Azure administrator / M365 / architecture labs — outside the published analytics subjects",
  "data-eng": "Generic data-engineering tooling (zoomcamp cohort pages, dbt observability docs) — no matching subject desk yet",
};

// Human pass over the corpus lab records whose folder-name titles could not be
// recovered automatically. Sources: lab YAML headers in the corpus clones
// (Hansa_Deep_Research_Corpus/_WORK/clones/MicrosoftLearning__mslearn-fabric/
// Instructions/Labs/22c-*, 22d-*, 26c-*, 26d-*); 00-Setup is the environment
// preparation folder (VM-Setup.txt).
const TITLE_OVERRIDES = {
  "exp-0023": "Set up the lab environment",
  "exp-0034": "Use Copilot in Microsoft Fabric data warehouse",
  "exp-0035": "Chat with your data using Microsoft Fabric data agents",
  "exp-0037": "Transform data with notebooks in Microsoft Fabric",
  "exp-0038": "Transform data in a Fabric data warehouse using T-SQL",
};

// Human placement pass over coarse corpus module labels: 00-Setup is not a
// query lab, the 22c/22d Copilot labs work against a warehouse, and the 26c/26d
// transform labs were labelled "model" by the corpus folder harvest.
const TOPIC_OVERRIDES = {
  "exp-0023": { topic: "foundations", from: "query" },
  "exp-0034": { topic: "query", from: "foundations" },
  "exp-0035": { topic: "query", from: "foundations" },
  "exp-0037": { topic: "transform", from: "model" },
  "exp-0038": { topic: "query", from: "model" },
};

// Environment label fallback when the corpus record carries none. The default
// is marked as inferred so the lab page can state it honestly.
const ENVIRONMENT_DEFAULTS = {
  fabric: "Microsoft Fabric workspace (inferred; source record had none)",
  "power-bi": "Power BI Desktop / Microsoft Fabric workspace (inferred; source record had none)",
  sql: "SQL Server environment (inferred; source record had none)",
};

// module label → topic per subject (only where a direct carry-over is wrong or
// coarse); unlisted modules are used verbatim when they are valid topics.
const MODULE_TOPIC_MAP = {
  "power-bi": { foundations: "overview", security: "govern" },
};

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72).replace(/-+$/g, "");
}

function lines(value) {
  if (!Array.isArray(value)) return [];
  return value.map((line) => String(line).replace(/\s+/g, " ").replace(/^[\s*#>-]+/, "").trim()).filter(Boolean).slice(0, 12);
}

function assertValidPlacement(subject, topic, where) {
  if (!SUBJECT_TOPICS[subject]) throw new Error(`${where}: unknown subject ${subject}`);
  if (!SUBJECT_TOPICS[subject].includes(topic)) throw new Error(`${where}: topic ${topic} is not valid for subject ${subject}`);
}

// ---------------------------------------------------------------------------

const [referenceLinesText, experimentLinesText] = await Promise.all([
  readFile(path.join(ROOT, INTAKE, "reference_records.jsonl"), "utf8"),
  readFile(path.join(ROOT, INTAKE, "experiment_records.jsonl"), "utf8"),
]);

// --- Phase A: references ---
const seenUrls = new Map();
const references = [];
let referenceDuplicates = 0;

for (const line of referenceLinesText.split("\n")) {
  if (!line.trim()) continue;
  const record = JSON.parse(line);
  const title = cleanTitle(record.title);
  if (EXCLUDED_DOMAINS[record.domain]) { reject(EXCLUDED_DOMAINS[record.domain], record); continue; }
  if (isJunkTitle(title)) { reject("Scraper-noise title", record); continue; }
  if (!/^https?:\/\//.test(record.url ?? "")) { reject("Missing or malformed URL", record); continue; }
  if (record.rights_class !== "LINK_ONLY" && record.rights_class !== "REDISTRIBUTABLE") {
    reject(`Unsupported rights class ${record.rights_class}`, record); continue;
  }
  const urlKey = record.url.replace(/\/+$/, "").replace(/#.*$/, "").replace(/\?.*$/, "").toLowerCase();
  if (seenUrls.has(urlKey)) { referenceDuplicates += 1; reject("Duplicate URL (already curated)", record); continue; }
  const placement = mapReference({ ...record, _title: title });
  if (!placement) { reject("No deterministic subject/topic rule matched", record); continue; }
  assertValidPlacement(placement.subject, placement.topic, `reference ${record.corpus_id}`);

  const publisher = PUBLISHER_LABEL[record.domain] ?? "External reference";
  const licenseNote = record.rights_class === "REDISTRIBUTABLE"
    ? `Rights class REDISTRIBUTABLE (open license) — linked; the source remains authoritative.`
    : `Rights class LINK_ONLY — linked and paraphrased only, never republished.`;
  const context = `${publisher}: ${title}. Linked for navigation and provenance only — open the source for the full content.`;
  const status = `${licenseNote} Curated from the Hansa Deep Research Corpus (${record.corpus_id}); reviewed at its origin; no endorsement or currency claim.`;

  seenUrls.set(urlKey, record.corpus_id);
  references.push({
    id: `ref-${record.corpus_id.toLowerCase()}`,
    title,
    href: record.url,
    subject: placement.subject,
    topic: placement.topic,
    kind: "reference",
    context,
    language: "en",
    source: `${record.domain} · corpus ${record.corpus_id}`,
    basis: placement.basis,
    status,
    rightsClass: record.rights_class,
    sha256: record.sha256,
    outlineCount: record.section_count ?? 0,
  });
}

// --- Phase B: hands-on labs ---
const usedSlugs = new Set();
const labs = [];
for (const line of experimentLinesText.split("\n")) {
  if (!line.trim()) continue;
  const record = JSON.parse(line);
  if (!PUBLISHED_EXP_DOMAINS.has(record.domain)) {
    rejectExperiment(`Held back — ${HELD_BACK_DOMAINS[record.domain]}`, record); continue;
  }
  if (record.rights_class !== "REDISTRIBUTABLE") {
    rejectExperiment(`Lab rights class ${record.rights_class} is not publishable`, record); continue;
  }
  if (!record.license_spdx) { rejectExperiment("Lab missing license_spdx", record); continue; }
  if (/thank|credit|license|readme/i.test(record.title ?? "") && lines(record.instructions_head).length === 0) {
    rejectExperiment("Folder is not a lab (credits/meta folder with no instructions)", record); continue;
  }
  const subject = record.domain;
  const override = TOPIC_OVERRIDES[record.suggested_id];
  if (override && override.from !== record.module) {
    throw new Error(`Topic override for ${record.suggested_id} expected module ${override.from}, record says ${record.module}`);
  }
  const topic = override?.topic ?? (MODULE_TOPIC_MAP[subject]?.[record.module] ?? record.module);
  assertValidPlacement(subject, topic, `experiment ${record.suggested_id}`);

  const title = TITLE_OVERRIDES[record.suggested_id] ?? cleanTitle(record.title);
  let slug = `${record.suggested_id}-${slugify(title)}`;
  while (usedSlugs.has(slug)) slug = `${slug}-2`;
  usedSlugs.add(slug);

  const basis = override
    ? `Human placement pass: corpus module label (${override.from}) corrected using the lab's own instruction file; organizational placement`
    : "Source lab module label carried over; organizational placement, not scientific validation";

  labs.push({
    slug,
    catalogueId: `hands-on-${slug}`,
    title,
    subject,
    topic,
    summary: cleanTitle(record.summary),
    environment: record.environment ?? ENVIRONMENT_DEFAULTS[record.domain],
    prerequisites: lines(record.prerequisites),
    steps: lines(record.instructions_head),
    expectedOutputs: lines(record.expected_outputs_head),
    validationChecks: lines(record.validation_checks_head),
    assets: lines(record.assets_head),
    assetCount: record.asset_count ?? 0,
    license: record.license_spdx,
    rightsClass: record.rights_class,
    sourceUrl: record.source_url,
    corpusLabId: record.corpus_refs?.lab_id ?? null,
    corpusModuleId: record.corpus_refs?.module_id ?? null,
    titleSource: TITLE_OVERRIDES[record.suggested_id] ? "human-pass (instruction YAML)" : record.title_source,
    originNote: record.integration_note ?? "Authoring scaffold from the source repository.",
    basis,
  });
}

// --- Final validation ---
const refIds = new Set(references.map((r) => r.id));
if (refIds.size !== references.length) throw new Error("Duplicate reference ids");
for (const reference of references) {
  assertValidPlacement(reference.subject, reference.topic, reference.id);
}
const labSlugs = new Set(labs.map((l) => l.slug));
if (labSlugs.size !== labs.length) throw new Error("Duplicate lab slugs");

const rejectionCounts = {};
for (const { reason } of rejections) rejectionCounts[reason] = (rejectionCounts[reason] ?? 0) + 1;
const experimentRejectionCounts = {};
for (const { reason } of experimentRejections) experimentRejectionCounts[reason] = (experimentRejectionCounts[reason] ?? 0) + 1;

const referenceMeta = {
  generatedAt: new Date().toISOString(),
  source: `${INTAKE}/reference_records.jsonl`,
  sourceSha256: sha256(referenceLinesText),
  curated: references.length,
  input: 3131,
  duplicates: referenceDuplicates,
  rejections: rejectionCounts,
};
const experimentMeta = {
  generatedAt: new Date().toISOString(),
  source: `${INTAKE}/experiment_records.jsonl`,
  sourceSha256: sha256(experimentLinesText),
  curated: labs.length,
  input: 46,
  heldBack: experimentRejectionCounts,
};

await Promise.all([
  writeFile(path.join(ROOT, OUT, "references.json"), JSON.stringify({ meta: referenceMeta, records: references }, null, 1) + "\n"),
  writeFile(path.join(ROOT, OUT, "experiments.json"), JSON.stringify({ meta: experimentMeta, labs }, null, 1) + "\n"),
]);

const bySubject = {};
for (const reference of references) bySubject[`${reference.subject}/${reference.topic}`] = (bySubject[`${reference.subject}/${reference.topic}`] ?? 0) + 1;
console.log(`References curated: ${references.length} of 3,131 (duplicates: ${referenceDuplicates})`);
for (const [key, count] of Object.entries(bySubject).sort()) console.log(`  ${key.padEnd(28)} ${count}`);
console.log(`Experiments published: ${labs.length} of 46 — ${labs.map((l) => l.slug).join(", ")}`);
console.log(`Reference rejections: ${rejections.length}`);
for (const [reason, count] of Object.entries(rejectionCounts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(count).padStart(4)}  ${reason}`);
console.log(`Experiment hold-backs: ${experimentRejections.length}`);
for (const [reason, count] of Object.entries(experimentRejectionCounts).sort((a, b) => b[1] - a[1])) console.log(`  ${String(count).padStart(4)}  ${reason}`);
