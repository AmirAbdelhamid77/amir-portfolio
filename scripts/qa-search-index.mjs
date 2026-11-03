// Release gate for site search.
//
// `tests/content/search.test.mjs` proves the ranking rules on a small fixture.
// This script proves the index that actually shipped: it reads the built
// `out/search/index.json` and fails when a benchmark query stops reaching a
// relevant page, when a result screen explodes past its cap, or when the
// payload carries question stems or duplicate destinations.
//
//   npm run build && npm run qa:search-index
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  RESULT_LIMIT,
  TYPE_LIMIT,
  searchDocuments,
  searchSite,
} from "../lib/search/query.ts";

const ROOT = process.cwd();
const INDEX_PATH = path.join(ROOT, "out", "search", "index.json");

const failures = [];
let checks = 0;

function check(name, condition, detail = "") {
  checks += 1;
  if (condition) {
    console.log(`PASS  ${name}`);
    return;
  }
  failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
  console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
}

let payload;
try {
  payload = JSON.parse(readFileSync(INDEX_PATH, "utf8"));
} catch (error) {
  console.error(`Cannot read ${INDEX_PATH}. Run \`npm run build\` first.`);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

const documents = Array.isArray(payload.documents) ? payload.documents : [];
const ids = new Set(documents.map((document) => document.id));

/** FNV-1a over the serialised documents, the same function the builder uses. */
function contentHash(value) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

// ---- payload shape -------------------------------------------------------

check("the index file exists and parses", documents.length > 0, `${documents.length} documents`);
check("payload version is 2", payload.version === 2, `got ${payload.version}`);
check("counts.total matches the document array", payload.counts?.total === documents.length);
check(
  "counts.byKind adds up to the total",
  Object.values(payload.counts?.byKind ?? {}).reduce((sum, value) => sum + value, 0) ===
    documents.length,
);
check(
  "the content hash matches the documents",
  payload.hash === contentHash(JSON.stringify(documents)),
  `payload ${payload.hash}, recomputed ${contentHash(JSON.stringify(documents))}`,
);
check(
  "no question stems are indexed as destinations",
  documents.every((document) => document.kind !== "question"),
  `${documents.filter((document) => document.kind === "question").length} question rows`,
);
check(
  "every destination has a title, summary and internal URL",
  documents.every(
    (document) =>
      document.title?.trim() &&
      document.summary?.trim() &&
      typeof document.url === "string" &&
      document.url.startsWith("/"),
  ),
);
check(
  "no destination URL carries a query string",
  documents.every((document) => !document.url.includes("?")),
);
check(
  "document IDs are unique",
  ids.size === documents.length,
  `${documents.length - ids.size} duplicates`,
);
check(
  "the index covers the whole site, not one subject",
  new Set(documents.map((document) => document.kind)).size >= 7,
);

// ---- benchmark queries ---------------------------------------------------

// Each case names the destinations that genuinely teach the idea. The query
// passes when one of them is in the raw top three.
const BENCHMARKS = [
  { query: "sql", expect: ["subject-sql"] },
  { query: "fabric", expect: ["subject-fabric"] },
  { query: "dax", expect: ["topic-fabric-model", "academy-fabric-analytics-14-create-dax-calculations"] },
  {
    query: "star schema",
    expect: [
      "academy-fabric-analytics-26-design-dimensional-models",
      "academy-power-bi-demos-04-design-data-model",
    ],
  },
  {
    query: "dimensional model",
    expect: ["academy-fabric-analytics-26-design-dimensional-models"],
  },
  {
    query: "Direct Lake",
    expect: [
      "topic-fabric-model",
      "academy-fabric-analytics-15-design-semantic-model-scale",
      "academy-fabric-analytics-16-optimize-semantic-model-performance",
    ],
  },
  {
    query: "medallion",
    expect: ["academy-fabric-analytics-03b-medallion-lakehouse"],
  },
  {
    query: "row level security",
    expect: ["academy-power-bi-demos-12-enforce-rls", "academy-power-bi-labs-11-secure-data-access"],
  },
  {
    query: "deployment pipeline",
    expect: ["academy-fabric-analytics-21-implement-cicd", "topic-fabric-delivery"],
  },
  { query: "p-value", expect: ["stats-section-s19", "stats-formula-p-value"] },
  { query: "box plot", expect: ["chartlab-box"] },
  { query: "grain", expect: ["sql-grain-lens", "academy-fabric-analytics-26-design-dimensional-models"] },
  // Arabic: the query is written with the same letters a reader types; the
  // index folds diacritics and alef/ya variants.
  { query: "المدرج التكراري", expect: ["lesson-ar-histogram"] },
  { query: "مخطط الصندوق", expect: ["lesson-ar-box-plot"] },
];

for (const { query, expect } of BENCHMARKS) {
  const topThree = searchDocuments(documents, query)
    .slice(0, 3)
    .map((row) => row.document.id);
  check(
    `"${query}" reaches a relevant page in the top three`,
    topThree.some((id) => expect.includes(id)),
    `expected one of ${expect.join(", ")}; got ${topThree.join(", ") || "nothing"}`,
  );
}

check(
  "a nonsense query returns nothing",
  searchSite(documents, "zzzqqq").total === 0,
  `${searchSite(documents, "zzzqqq").total} results`,
);

// ---- result-screen contract ---------------------------------------------

for (const query of ["data", "sql", "fabric", "power", "table", "model"]) {
  const outcome = searchSite(documents, query);
  check(
    `"${query}" shows at most ${RESULT_LIMIT} destinations`,
    outcome.shown <= RESULT_LIMIT,
    `${outcome.shown} shown of ${outcome.total}`,
  );
  check(
    `"${query}" reports that more exists when it is capped`,
    outcome.total <= outcome.shown || outcome.refine,
    `${outcome.total} total, ${outcome.shown} shown, refine=${outcome.refine}`,
  );

  const displayed = [
    outcome.best?.document,
    ...outcome.groups.flatMap((group) => group.items.map((row) => row.document)),
  ].filter(Boolean);
  const titles = displayed.map((document) =>
    document.title.replace(/\s+/g, " ").trim().toLowerCase(),
  );
  check(
    `"${query}" does not repeat a destination`,
    new Set(titles).size === titles.length,
    `${titles.length - new Set(titles).size} repeated title(s)`,
  );
  check(
    `"${query}" keeps the best match out of its own group`,
    !outcome.groups.some((group) =>
      group.items.some((row) => row.document.id === outcome.best?.document.id),
    ),
  );
}

const filtered = searchSite(documents, "data", { kinds: ["lesson"] });
check(
  "a type filter never exceeds the hard cap",
  filtered.shown <= TYPE_LIMIT,
  `${filtered.shown} shown`,
);
check(
  "a type filter only returns that type",
  filtered.groups.every((group) => group.kind === "lesson") &&
    filtered.best?.document.kind === "lesson",
);

const arabicOnly = searchSite(documents, "المدرج", { language: "ar" });
check(
  "the language filter keeps only Arabic pages",
  arabicOnly.groups.every((group) =>
    group.items.every((row) => row.document.language === "ar"),
  ) && (arabicOnly.best ? arabicOnly.best.document.language === "ar" : true),
);

// ---- report --------------------------------------------------------------

console.log("");
console.log(`${checks - failures.length}/${checks} checks passed`);
console.log(
  `Index: ${payload.counts.total} destinations, ${payload.hash}, ${(
    readFileSync(INDEX_PATH).length / 1024
  ).toFixed(0)} KB`,
);
if (failures.length > 0) {
  console.error(`\n${failures.length} search gate failure(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
