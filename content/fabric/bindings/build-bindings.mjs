#!/usr/bin/env node
/**
 * FC06 — deterministic curriculum bindings generator.
 *
 * Reads the FROZEN route registry (FC05, commit e35724c) and the compiled
 * front matter of every published article, then emits:
 *
 *   content/fabric/bindings/primary.json     — one lb:<articleId>@<subject>.<topic>
 *                                              primary binding per published article
 *   content/fabric/bindings/secondary.json   — cross-subject placements (≤2/article,
 *                                              each with its rule id)
 *   content/fabric/collections/collections.json — per-topic reading collections
 *                                              grouped by docs subdirectory ×
 *                                              document class
 *
 * RULES ARE DETERMINISTIC. There is no human curation here and no clock in the
 * output: re-running the script over the same registry and compiler output
 * must produce byte-identical files (enforced by
 * tests/fabric-corpus/bindings/determinism.test.mjs). Editorial review of the
 * seeded placements is a later gate (handover 03 §Curriculum).
 *
 * Inputs (read-only):
 *   $FABRIC_CORPUS_BUILD_DIR/route-registry/route-registry.json   (default ../fabric-corpus-build)
 *   $FABRIC_CORPUS_BUILD_DIR/compiler-output/<family>/nodes/*.json
 *   lib/study/taxonomy.ts  (the binding target vocabulary; parsed, never modified)
 *
 * Output root override: $FABRIC_CONTENT_OUT (default <repoRoot>/content) —
 * used by the determinism test to build into a temp dir and byte-compare.
 *
 * Run: node content/fabric/bindings/build-bindings.mjs
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..", "..", "..");
const buildDir = path.resolve(
  process.env.FABRIC_CORPUS_BUILD_DIR ?? path.join(repoRoot, "..", "fabric-corpus-build"),
);
const registryPath = path.join(buildDir, "route-registry", "route-registry.json");
const compilerOutputDir = path.resolve(
  process.env.FABRIC_COMPILER_OUTPUT ?? path.join(buildDir, "compiler-output"),
);
const outRoot = path.resolve(process.env.FABRIC_CONTENT_OUT ?? path.join(repoRoot, "content"));

/* ------------------------------------------------------------------ */
/* Binding target vocabulary (lib/study/taxonomy.ts — parsed, not      */
/* modified; the test suite cross-checks the parse against the real    */
/* module).                                                            */
/* ------------------------------------------------------------------ */

const TAXONOMY_PATH = path.join(repoRoot, "lib", "study", "taxonomy.ts");

function parseFabricTopics(source) {
  // Each SUBJECTS entry sits on one line: `{id:'fabric',...,topics:[[..],..]},`
  const subjectMatch = source.match(/^\s*\{id:'fabric',.*?topics:\[(.*)\]\}\s*,?\s*$/m);
  if (!subjectMatch) {
    throw new Error(`build-bindings: could not parse the fabric subject from ${TAXONOMY_PATH}`);
  }
  const topics = [];
  const pair = /\['([a-z0-9-]+)','[^']*'\]/g;
  let m;
  while ((m = pair.exec(subjectMatch[1])) !== null) topics.push(m[1]);
  return topics;
}

const taxonomySource = readFileSync(TAXONOMY_PATH, "utf8");
const FABRIC_TOPICS = parseFabricTopics(taxonomySource);
if (FABRIC_TOPICS.length < 8) {
  throw new Error(
    `build-bindings: parsed only ${FABRIC_TOPICS.length} fabric topics from taxonomy.ts — refusing to run`,
  );
}

/* ------------------------------------------------------------------ */
/* Deterministic rules.                                                */
/* ------------------------------------------------------------------ */

/**
 * Family → fabric topic map. Every published article inherits its family's
 * topic (confidence "seeded"); two front-matter refinement rules below can
 * override (confidence "front-matter-refined"). One-line rationale each;
 * editorial review of these seeds is a later gate.
 */
const FAMILY_TOPIC_MAP = [
  { family: "admin", topic: "security", rationale: "Tenant/admin-center governance of estate access and settings." },
  { family: "apps", topic: "delivery", rationale: "Fabric Apps authoring, publishing, authentication and monitoring lifecycle." },
  { family: "cicd", topic: "delivery", rationale: "Git integration and deployment pipelines are the lifecycle & operations topic." },
  { family: "data-engineering", topic: "transform", rationale: "Spark, notebook and Delta transformation work." },
  { family: "data-factory", topic: "ingestion", rationale: "Pipelines, copy jobs and orchestration move data into the estate." },
  { family: "data-science", topic: "transform", rationale: "Notebook/Spark experimentation; analytical cross-placement attached as a secondary (S-DATA-SCIENCE-ANALYSIS)." },
  { family: "data-warehouse", topic: "query", rationale: "Warehouse content centres on T-SQL analytical querying." },
  { family: "database", topic: "query", rationale: "SQL database content is T-SQL relational querying; the fabric 'model' topic means semantic models & DAX, which this surface does not cover (documented deviation from the seed map example)." },
  { family: "embed", topic: "streaming", rationale: "All embed-family articles embed Real-Time Dashboard items." },
  { family: "enterprise", topic: "delivery", rationale: "Capacity, billing, licensing and capacity planning are estate operations." },
  { family: "extensibility-toolkit", topic: "foundations", rationale: "Documents the platform extension architecture (workloads, items, auth)." },
  { family: "fundamentals", topic: "foundations", rationale: "Platform fundamentals and architecture introductions." },
  { family: "governance", topic: "security", rationale: "Governance is half of the security & governance topic." },
  { family: "graph", topic: "query", rationale: "GQL graph querying and its language reference." },
  { family: "iq", topic: "model", rationale: "Fabric IQ ontologies and planning cubes/formulas model meaning over platform data." },
  { family: "known-issues", topic: "overview", rationale: "Cross-topic issue index; the overview topic holds cross-topic material." },
  { family: "mirroring", topic: "ingestion", rationale: "Mirroring replicates external databases into OneLake." },
  { family: "onelake", topic: "foundations", rationale: "OneLake is the storage architecture." },
  { family: "real-time-hub", topic: "streaming", rationale: "The real-time hub feeds Real-Time Intelligence." },
  { family: "real-time-intelligence", topic: "streaming", rationale: "Eventhouse, KQL, eventstreams and activator are the streaming workload." },
  { family: "security", topic: "security", rationale: "Direct match with the security & governance topic." },
  { family: "workload-development-kit", topic: "foundations", rationale: "Workload development documents the platform architecture for extension authors." },
];

/**
 * Front-matter refinements of the family default. Applied in order; the first
 * match wins. Both target fabric.model. Each carries a one-line rationale.
 */
const REFINEMENT_RULES = [
  {
    id: "FM-SEMANTIC-MODEL",
    description:
      "Family default for enterprise/fundamentals AND compiled front-matter title matches /semantic model/i → fabric.model. Premium/Direct Lake semantic-model feature docs belong with the semantic-model topic rather than estate operations or platform fundamentals.",
    families: ["enterprise", "fundamentals"],
    test: (frontMatter) => /semantic model/i.test(String(frontMatter.title ?? "")),
    topic: "model",
  },
  {
    id: "FM-PBI-TRANSFORM-MODEL",
    description:
      "ms.subservice === 'pbi-transform-model' AND family default is not model → fabric.model. The transform-and-model subservice marks Power BI semantic-model feature docs.",
    families: null, // any family whose default is not already the target
    test: (frontMatter) => frontMatter["ms.subservice"] === "pbi-transform-model",
    topic: "model",
  },
];

/**
 * ms.topic → kind chip for the reading UI and the collections classes.
 * Unknown/missing ms.topic falls back to "concept" (deterministic default).
 */
const MS_TOPIC_KIND = {
  "concept-article": "concept",
  overview: "concept",
  article: "concept",
  "best-practice": "concept",
  "example-scenario": "concept",
  "solution-overview": "concept",
  "reliability-article": "concept",
  "partner-tools": "concept",
  glossary: "reference",
  "release-notes": "reference",
  "whats-new": "reference",
  "product-comparison": "reference",
  reference: "reference",
  "how-to": "how-to",
  "get-started": "how-to",
  "install-set-up-deploy": "how-to",
  troubleshooting: "how-to",
  "troubleshooting-general": "how-to",
  "troubleshooting-error-codes": "how-to",
  "troubleshooting-problem-resolution": "how-to",
  "limits-and-quotas": "how-to",
  faq: "how-to",
  "upgrade-and-migration-article": "how-to",
  tutorial: "tutorial",
  sample: "tutorial",
  quickstart: "tutorial",
  "quickstart-sdk": "tutorial",
};

const KINDS = ["concept", "how-to", "reference", "tutorial"];

/** ms.topic → collection class ("procedures/reference-heavy clusters grouped distinctly"). */
const KIND_CLASS = {
  concept: "concepts",
  "how-to": "procedures",
  reference: "reference",
  tutorial: "concepts",
};

const KIND_PLURAL = { concept: "concepts", "how-to": "how-to", reference: "reference", tutorial: "tutorials" };

const CLASS_LABEL = { concepts: "Concepts & guides", procedures: "Procedures", reference: "Reference" };

/**
 * Secondary rule S-SQL-DIALECT: database-family articles whose title or
 * description matches an ordered pattern list get one sql.<topic> secondary.
 * First match wins; no match → no secondary (cross-subject placements exist
 * only where a documented rule fires).
 */
const SQL_TOPIC_PATTERNS = [
  ["windows", /window function|over\s*\(\s*partition/i],
  ["joins", /\bjoins?\b|inner join|outer join|cross join/i],
  ["aggregation", /aggregat|group by|rollup/i],
  ["subqueries", /subquery|common table expression|\bctes?\b/i],
  ["sets", /\bunion\b|\bintersect\b|\bexcept\b|set operator/i],
  ["transactions", /transaction|\bdml\b|\bddl\b|isolation|deadlock/i],
  ["time", /date(time)?\s+function|\bdatetime2?\b|temporal|time zone/i],
  ["text", /string function|pattern match|full.text|\bn?varchar\b/i],
  ["quality", /data quality|referential integrity|check constraint|\bconstraint\b/i],
  ["performance", /performance|\bindexes?\b|query plan|\bstatistics\b|columnstore|batch mode/i],
  ["design", /database design|normaliz|schema design|primary key|foreign key/i],
  ["types-null", /data type|\bnull\b|\bcast\b|\bconvert\b|collation/i],
  ["filtering", /\bwhere\b|\bfilter/i],
  ["warehouse", /warehouse|\bdwh\b/i],
  ["foundations", /\bsql\b|t-sql|query/i],
];

/**
 * Secondary rule S-POWERBI-FRONTMATTER: a powerbi-/pbi- prefixed ms.subservice
 * marks Power BI product surface → power-bi.<topic>. pbi-transform-model → model;
 * every other powerbi-serviced value observed in the corpus (powerbi-admin,
 * powerbi-premium, powerbi-eim, pbi-security) is admin/premium/EIM governance
 * → govern.
 */
const PBI_SUBSERVICE_TOPIC = { "pbi-transform-model": "model" };
const PBI_DEFAULT_TOPIC = "govern";
const PBI_SUBSERVICE_RX = /^(powerbi-|pbi-)/;

const SECONDARY_RULES = [
  { id: "S-SQL-DIALECT", subject: "sql" },
  { id: "S-POWERBI-FRONTMATTER", subject: "power-bi" },
  { id: "S-DATA-SCIENCE-ANALYSIS", subject: "analysis" },
  { id: "S-SEMLINK-ANALYSIS", subject: "analysis" },
];
/** Deterministic priority when more rules than the cap fire; cap = 2/article. */
const SECONDARY_CAP = 2;
const SECONDARY_PRIORITY = SECONDARY_RULES.map((r) => r.id);

/* ------------------------------------------------------------------ */
/* Helpers.                                                            */
/* ------------------------------------------------------------------ */

function assertValidTarget(subject, topic, context) {
  if (subject === "fabric") {
    if (!FABRIC_TOPICS.includes(topic)) {
      throw new Error(`build-bindings: invalid fabric topic '${topic}' for ${context}`);
    }
    return;
  }
  // Cross-subject targets are validated by the test suite against the full
  // taxonomy; here we keep the build's own vocabulary conservative.
  const allowed = {
    sql: [
      "overview", "foundations", "schema", "types-null", "filtering", "joins",
      "aggregation", "subqueries", "sets", "windows", "time", "text",
      "analytics", "quality", "transactions", "design", "performance",
      "warehouse", "postgresql", "interview", "toolkit",
    ],
    "power-bi": ["prepare", "model", "report", "govern", "overview"],
    analysis: ["overview"],
  };
  if (!allowed[subject] || !allowed[subject].includes(topic)) {
    throw new Error(`build-bindings: invalid secondary target ${subject}.${topic} for ${context}`);
  }
}

function kindFor(frontMatter, registryTitle) {
  const value = frontMatter["ms.topic"];
  if (typeof value === "string" && MS_TOPIC_KIND[value]) return MS_TOPIC_KIND[value];
  if (typeof value === "string") return "concept"; // unknown ms.topic → deterministic default
  // No ms.topic at all: fall back to the registry title shape.
  return "concept";
}

function familyOfArticleId(articleId) {
  const rest = articleId.startsWith("art:") ? articleId.slice(4) : articleId;
  const slash = rest.indexOf("/");
  return slash === -1 ? rest : rest.slice(0, slash);
}

function directoryOf(sourcePath) {
  const rel = sourcePath.replace(/^docs\//, "");
  const segments = rel.split("/");
  return segments.length > 2 ? segments.slice(0, -1).join("/") : segments[0];
}

function displaySegment(segment) {
  return segment
    .split("-")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

/* ------------------------------------------------------------------ */
/* Build.                                                              */
/* ------------------------------------------------------------------ */

if (!existsSync(registryPath)) {
  throw new Error(
    `build-bindings: route registry missing at ${registryPath}. ` +
      "Set FABRIC_CORPUS_BUILD_DIR or run tools/fabric-corpus/route-registry/build-registry.mjs first.",
  );
}

const registry = JSON.parse(readFileSync(registryPath, "utf8"));
if (registry.schema !== "hansa.fabric-route-registry/1") {
  throw new Error(`build-bindings: unexpected registry schema '${registry.schema}' — refusing to bind`);
}

const familyDefault = new Map(FAMILY_TOPIC_MAP.map((entry) => [entry.family, entry.topic]));

/** articleId → compiled front matter (data object). */
const frontMatterByArticle = new Map();
for (const family of registry.families) {
  for (const article of family.articles) {
    if (!article.published) continue;
    const file = path.join(compilerOutputDir, article.nodeFile);
    let node;
    try {
      node = JSON.parse(readFileSync(file, "utf8"));
    } catch (error) {
      throw new Error(`build-bindings: cannot read compiled node for ${article.articleId}: ${error.message}`);
    }
    const data =
      node && node.frontMatter && typeof node.frontMatter === "object" && node.frontMatter.data
        ? node.frontMatter.data
        : {};
    frontMatterByArticle.set(article.articleId, data);
  }
}

/* ---- Primary bindings -------------------------------------------- */

const refinementCounts = new Map();
const primaryRows = [];
const primaryByArticle = new Map();

for (const family of registry.families) {
  for (const article of family.articles) {
    if (!article.published) continue;
    const fm = frontMatterByArticle.get(article.articleId);
    const defaultTopic = familyDefault.get(family.family);
    if (!defaultTopic) {
      throw new Error(`build-bindings: no family→topic rule for family '${family.family}'`);
    }

    let topic = defaultTopic;
    let confidence = "seeded";
    let ruleId = `F-${family.family.toUpperCase().replace(/-/g, "-")}`;
    for (const rule of REFINEMENT_RULES) {
      if (rule.families && !rule.families.includes(family.family)) continue;
      if (rule.topic === defaultTopic) continue; // refinement would be a no-op
      if (!rule.test(fm)) continue;
      topic = rule.topic;
      confidence = "front-matter-refined";
      ruleId = rule.id;
      refinementCounts.set(rule.id, (refinementCounts.get(rule.id) ?? 0) + 1);
      break;
    }

    assertValidTarget("fabric", topic, article.articleId);
    const kind = kindFor(fm, article.title);
    const row = {
      bindingId: `lb:${article.articleId}@fabric.${topic}`,
      role: "primary",
      articleId: article.articleId,
      subject: "fabric",
      topic,
      confidence,
      ruleId,
      kind,
      family: family.family,
      slug: article.slug,
      title: article.title,
      description: article.description ?? null,
      sourcePath: article.sourcePath,
      logicalPath: article.logicalPath,
    };
    if (primaryByArticle.has(article.articleId)) {
      throw new Error(`build-bindings: duplicate primary binding for ${article.articleId}`);
    }
    primaryByArticle.set(article.articleId, row);
    primaryRows.push(row);
  }
}

primaryRows.sort((a, b) => (a.articleId < b.articleId ? -1 : a.articleId > b.articleId ? 1 : 0));

/* ---- Secondary bindings ------------------------------------------ */

function secondaryCandidates(article, fm, primaryRow) {
  const candidates = [];
  const haystack = `${article.title}\n${article.description ?? ""}`;

  if (article.family === "database") {
    for (const [topic, pattern] of SQL_TOPIC_PATTERNS) {
      if (pattern.test(haystack)) {
        candidates.push({ ruleId: "S-SQL-DIALECT", subject: "sql", topic });
        break;
      }
    }
  }

  const subservice = fm["ms.subservice"];
  if (typeof subservice === "string" && PBI_SUBSERVICE_RX.test(subservice)) {
    candidates.push({
      ruleId: "S-POWERBI-FRONTMATTER",
      subject: "power-bi",
      topic: PBI_SUBSERVICE_TOPIC[subservice] ?? PBI_DEFAULT_TOPIC,
    });
  }

  if (article.family === "data-science") {
    candidates.push({ ruleId: "S-DATA-SCIENCE-ANALYSIS", subject: "analysis", topic: "overview" });
  } else if (/semantic link|\bsempy\b/i.test(haystack)) {
    candidates.push({ ruleId: "S-SEMLINK-ANALYSIS", subject: "analysis", topic: "overview" });
  }

  // Cross-subject only: a secondary never repeats the primary target.
  return candidates.filter(
    (candidate) => !(candidate.subject === primaryRow.subject && candidate.topic === primaryRow.topic),
  );
}

const secondaryRows = [];
const secondaryByRule = new Map();
for (const article of registry.families.flatMap((f) => f.articles).filter((a) => a.published)) {
  const fm = frontMatterByArticle.get(article.articleId);
  const primaryRow = primaryByArticle.get(article.articleId);
  const candidates = secondaryCandidates(article, fm, primaryRow)
    .filter((candidate) => SECONDARY_PRIORITY.includes(candidate.ruleId));
  const seen = new Set();
  const applied = [];
  for (const candidate of candidates) {
    const key = `${candidate.subject}.${candidate.topic}`;
    if (seen.has(key)) continue;
    seen.add(key);
    applied.push(candidate);
  }
  applied.sort((a, b) => SECONDARY_PRIORITY.indexOf(a.ruleId) - SECONDARY_PRIORITY.indexOf(b.ruleId));
  for (const candidate of applied.slice(0, SECONDARY_CAP)) {
    assertValidTarget(candidate.subject, candidate.topic, `${article.articleId} (secondary)`);
    secondaryByRule.set(candidate.ruleId, (secondaryByRule.get(candidate.ruleId) ?? 0) + 1);
    secondaryRows.push({
      bindingId: `lb:${article.articleId}@${candidate.subject}.${candidate.topic}`,
      role: "secondary",
      articleId: article.articleId,
      subject: candidate.subject,
      topic: candidate.topic,
      ruleId: candidate.ruleId,
    });
  }
}

secondaryRows.sort((a, b) =>
  a.articleId === b.articleId
    ? a.ruleId === b.ruleId
      ? a.subject < b.subject ? -1 : 1
      : a.ruleId < b.ruleId ? -1 : 1
    : a.articleId < b.articleId ? -1 : 1,
);

/* ---- Held articles (fail-closed exclusions) ----------------------- */

const heldByTopic = {};
const heldIds = [];
for (const row of registry.excluded) {
  const family = familyOfArticleId(row.articleId);
  const topic = familyDefault.get(family);
  if (!topic) {
    throw new Error(`build-bindings: no family→topic rule for excluded row '${row.articleId}' (family '${family}')`);
  }
  heldByTopic[topic] = (heldByTopic[topic] ?? 0) + 1;
  heldIds.push(row.articleId);
}
heldIds.sort();

/* ---- Counts -------------------------------------------------------- */

function sortedCounts(map) {
  const out = {};
  for (const key of [...map.keys()].sort()) out[key] = map.get(key);
  return out;
}

const primaryByTopic = new Map();
const confidenceCounts = new Map();
for (const row of primaryRows) {
  primaryByTopic.set(row.topic, (primaryByTopic.get(row.topic) ?? 0) + 1);
  confidenceCounts.set(row.confidence, (confidenceCounts.get(row.confidence) ?? 0) + 1);
}

/* ---- Collections ---------------------------------------------------- */

const collectionMap = new Map(); // topic → (dir × class) → rows
for (const row of primaryRows) {
  const directory = directoryOf(row.sourcePath);
  const kindClass = KIND_CLASS[row.kind] ?? "concepts";
  const key = `${directory}\u0000${kindClass}`;
  if (!collectionMap.has(row.topic)) collectionMap.set(row.topic, new Map());
  const byTopic = collectionMap.get(row.topic);
  if (!byTopic.has(key)) byTopic.set(key, { directory, kindClass, rows: [] });
  byTopic.get(key).rows.push(row);
}

function buildCollectionId(topic, directory, kindClass) {
  return `col:${topic}:${directory.replace(/\//g, "-")}:${kindClass}`;
}

const collections = [];
for (const [topic, byTopic] of collectionMap) {
  for (const [, group] of byTopic) {
    const { directory, kindClass, rows } = group;
    rows.sort((a, b) => (a.articleId < b.articleId ? -1 : a.articleId > b.articleId ? 1 : 0));
    const byKind = { concept: 0, "how-to": 0, reference: 0, tutorial: 0 };
    for (const row of rows) byKind[row.kind] += 1;
    const families = [...new Set(rows.map((row) => row.family))].sort();
    const directoryLabel = directory
      .split("/")
      .map(displaySegment)
      .join(" / ");
    const classLabel = CLASS_LABEL[kindClass];
    const kindSummary = KINDS.filter((kind) => byKind[kind] > 0)
      .map((kind) => `${byKind[kind]} ${KIND_PLURAL[kind]}`)
      .join(", ");
    collections.push({
      id: buildCollectionId(topic, directory, kindClass),
      topic,
      title: `${directoryLabel} — ${classLabel}`,
      description: `Deterministic reading collection: ${rows.length} published article${
        rows.length === 1 ? "" : "s"
      } from docs/${directory} (${families.join(", ")} family), grouped as ${classLabel.toLowerCase()}. Kinds: ${kindSummary}.`,
      directory,
      class: kindClass,
      families,
      articleIds: rows.map((row) => row.articleId),
      counts: { articles: rows.length, byKind },
    });
  }
}
collections.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

const collectionsByTopic = new Map();
for (const collection of collections) {
  collectionsByTopic.set(collection.topic, (collectionsByTopic.get(collection.topic) ?? 0) + 1);
}
const collectionsByClass = new Map();
for (const collection of collections) {
  collectionsByClass.set(collection.class, (collectionsByClass.get(collection.class) ?? 0) + 1);
}

/* ---- Validate before writing (fail-closed) -------------------------- */

const publishedIds = registry.families
  .flatMap((f) => f.articles)
  .filter((a) => a.published)
  .map((a) => a.articleId)
  .sort();
if (primaryRows.length !== publishedIds.length) {
  throw new Error(
    `build-bindings: primary rows (${primaryRows.length}) != published articles (${publishedIds.length})`,
  );
}
for (const id of publishedIds) {
  if (!primaryByArticle.has(id)) throw new Error(`build-bindings: published article ${id} has no primary binding`);
}
const boundTopics = new Set(primaryRows.map((row) => row.topic));
for (const topic of boundTopics) {
  if (!collectionsByTopic.has(topic)) {
    throw new Error(`build-bindings: topic ${topic} has bound articles but no collections`);
  }
}
const collectionArticleIndex = new Map();
for (const collection of collections) {
  for (const articleId of collection.articleIds) {
    const row = primaryByArticle.get(articleId);
    if (!row) {
      throw new Error(`build-bindings: collection ${collection.id} references unbound article ${articleId}`);
    }
    if (row.topic !== collection.topic) {
      throw new Error(`build-bindings: collection ${collection.id} holds ${articleId} bound to ${row.topic}`);
    }
    const existing = collectionArticleIndex.get(articleId);
    if (existing) {
      throw new Error(
        `build-bindings: article ${articleId} appears in collections ${existing} and ${collection.id}`,
      );
    }
    collectionArticleIndex.set(articleId, collection.id);
  }
}

/* ---- Emit ----------------------------------------------------------- */

const primaryDoc = {
  schema: "hansa.fabric-bindings-primary/1",
  corpusRevision: registry.corpusRevision,
  registryRevision: registry.registryRevision,
  routeNamespace: registry.routeNamespace,
  identityContract: "docs/fabric-corpus/contracts/IDENTITY_REGISTRY.md#LearningBinding",
  familyTopicMap: FAMILY_TOPIC_MAP.map((entry) => ({
    family: entry.family,
    topic: entry.topic,
    ruleId: `F-${entry.family.toUpperCase().replace(/-/g, "-")}`,
    defaultConfidence: "seeded",
    rationale: entry.rationale,
  })),
  refinementRules: REFINEMENT_RULES.map((rule) => ({ id: rule.id, description: rule.description })),
  counts: {
    primary: primaryRows.length,
    publishedArticles: publishedIds.length,
    byTopic: sortedCounts(primaryByTopic),
    byConfidence: sortedCounts(confidenceCounts),
    byRefinementRule: Object.fromEntries([...refinementCounts.entries()].sort()),
    heldTotal: heldIds.length,
    heldByTopic: Object.fromEntries(Object.entries(heldByTopic).sort()),
  },
  held: { total: heldIds.length, byTopic: Object.fromEntries(Object.entries(heldByTopic).sort()), articleIds: heldIds },
  rows: primaryRows,
};

const secondaryDoc = {
  schema: "hansa.fabric-bindings-secondary/1",
  corpusRevision: registry.corpusRevision,
  registryRevision: registry.registryRevision,
  cap: SECONDARY_CAP,
  priorityOrder: SECONDARY_PRIORITY,
  rules: SECONDARY_RULES.map((rule) => ({
    id: rule.id,
    subject: rule.subject,
    description:
      rule.id === "S-SQL-DIALECT"
        ? "database-family articles: title+description tested against an ordered SQL pattern list (first match wins) → sql.<topic>."
        : rule.id === "S-POWERBI-FRONTMATTER"
          ? "ms.subservice starting powerbi-/pbi- → power-bi.govern (pbi-transform-model → power-bi.model)."
          : rule.id === "S-DATA-SCIENCE-ANALYSIS"
            ? "data-science-family articles → analysis.overview (cross-subject analytical practice)."
            : "title+description matching /semantic link|sempy/i outside the data-science family → analysis.overview.",
  })),
  counts: {
    secondary: secondaryRows.length,
    articlesWithSecondaries: new Set(secondaryRows.map((row) => row.articleId)).size,
    byRule: sortedCounts(secondaryByRule),
  },
  rows: secondaryRows,
};

const collectionsDoc = {
  schema: "hansa.fabric-reading-collections/1",
  corpusRevision: registry.corpusRevision,
  registryRevision: registry.registryRevision,
  groupingRule:
    "Collections partition each topic's bound articles by docs subdirectory × document class (procedures/reference split from concepts per ms.topic); deterministic, no curation.",
  counts: {
    collections: collections.length,
    byTopic: sortedCounts(collectionsByTopic),
    byClass: sortedCounts(collectionsByClass),
    heldTotal: heldIds.length,
  },
  collections,
};

const outDir = path.join(outRoot, "fabric");
const bindingsDir = path.join(outDir, "bindings");
const collectionsDir = path.join(outDir, "collections");
mkdirSync(bindingsDir, { recursive: true });
mkdirSync(collectionsDir, { recursive: true });

const write = (file, doc) => writeFileSync(file, JSON.stringify(doc, null, 2) + "\n", "utf8");
write(path.join(bindingsDir, "primary.json"), primaryDoc);
write(path.join(bindingsDir, "secondary.json"), secondaryDoc);
write(path.join(collectionsDir, "collections.json"), collectionsDoc);

/* ---- Stdout summary (report input; not part of the artifacts) ------- */

console.log("build-bindings: wrote");
console.log(`  ${path.join(bindingsDir, "primary.json")}`);
console.log(`  ${path.join(bindingsDir, "secondary.json")}`);
console.log(`  ${path.join(collectionsDir, "collections.json")}`);
console.log(`registry revision: ${registry.registryRevision} (corpus ${registry.corpusRevision})`);
console.log(`primary: ${primaryRows.length} (seeded ${confidenceCounts.get("seeded") ?? 0}, front-matter-refined ${confidenceCounts.get("front-matter-refined") ?? 0})`);
for (const [topic, count] of sortedCountsMap(primaryByTopic)) console.log(`  fabric.${topic}: ${count}`);
console.log(`held (excluded, unbound): ${heldIds.length}`);
console.log(`secondary: ${secondaryRows.length} across ${Object.keys(sortedCounts(secondaryByRule)).length} rules`);
for (const [rule, count] of sortedCountsMap(secondaryByRule)) console.log(`  ${rule}: ${count}`);
console.log(`collections: ${collections.length}`);

function sortedCountsMap(map) {
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}
