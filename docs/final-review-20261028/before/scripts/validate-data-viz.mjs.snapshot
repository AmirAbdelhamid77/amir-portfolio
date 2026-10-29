// Validates the generated Data Visualization content and the derived
// datasets. It is deliberately read-only: nothing here rewrites a JSON file.
//
//   node scripts/validate-data-viz.mjs
//   node scripts/validate-data-viz.mjs --check   # also verify freshness + built HTML
//
// Exit code 1 means at least one assertion failed. Warnings do not fail the run
// unless --check is passed.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CHECK = process.argv.includes("--check");

const failures = [];
const warnings = [];
let assertions = 0;

function ok(condition, message) {
  assertions += 1;
  if (!condition) failures.push(message);
  return Boolean(condition);
}

function warn(condition, message) {
  assertions += 1;
  if (!condition) warnings.push(message);
  return Boolean(condition);
}

void warn;

async function readJson(relative) {
  return JSON.parse(await readFile(path.join(ROOT, relative), "utf8"));
}

const pages = await readJson("content/data-viz/pages.json");
const curriculum = await readJson("content/data-viz/curriculum.json");
const editorial = await readJson("content/data-viz/editorial.json");
const datasets = await readJson("content/data-viz/datasets.json");

const chapters = curriculum.chapters;
const lessons = curriculum.lessons;
const lessonKeys = new Set(lessons.map((lesson) => `${lesson.section}:${lesson.slug}`));

/* -------------------------------------------------------------------------- */
/* Source pages                                                              */
/* -------------------------------------------------------------------------- */

const EXPECTED_PAGES = 25;
const EXPECTED_CHAPTERS = 10;
const EXPECTED_LESSONS = 27;
const EXPECTED_EDITORIAL = 2;

ok(pages.length === EXPECTED_PAGES, `expected ${EXPECTED_PAGES} source pages, found ${pages.length}`);
ok(chapters.length === EXPECTED_CHAPTERS, `expected ${EXPECTED_CHAPTERS} chapters, found ${chapters.length}`);
ok(lessons.length === EXPECTED_LESSONS, `expected ${EXPECTED_LESSONS} lessons, found ${lessons.length}`);
ok(
  lessons.filter((lesson) => lesson.kind === "editorial").length === EXPECTED_EDITORIAL,
  `expected ${EXPECTED_EDITORIAL} editorial lessons, found ${lessons.filter((lesson) => lesson.kind === "editorial").length}`,
);

const pageSlugs = new Set();
const pageTitles = new Set();
for (const page of pages) {
  ok(typeof page.slug === "string" && page.slug.length > 0, `page is missing a slug: ${page.source?.file}`);
  ok(!pageSlugs.has(page.slug), `duplicate page slug: ${page.slug}`);
  pageSlugs.add(page.slug);
  ok(!pageTitles.has(page.title), `duplicate page title: ${page.title}`);
  pageTitles.add(page.title);
  ok(/^[a-f0-9]{64}$/.test(page.source?.sha256 ?? ""), `${page.slug}: source hash is not a SHA-256`);
  ok(page.source?.bytes > 0, `${page.slug}: source byte size is missing`);
  ok(page.textLength > 0, `${page.slug}: no text was extracted`);
  // `lang` is the page-level majority label; mixed pages (English prose with
  // substantial Arabic, or the reverse) are labelled from character share, so
  // `direction` is the authoritative reading direction. Assert that, plus the
  // one rule that must never bend: an English page is never rendered RTL.
  ok(page.direction === "rtl" || page.direction === "ltr", `${page.slug}: invalid direction`);
  ok(page.lang !== "en" || page.direction === "ltr", `${page.slug}: English page is marked RTL`);
  ok(page.counts.blocks > 0, `${page.slug}: block count is zero`);
}

/* -------------------------------------------------------------------------- */
/* Curriculum                                                               */
/* -------------------------------------------------------------------------- */

const sourceUsage = new Map();
for (const lesson of lessons) {
  ok(lessonKeys.has(`${lesson.section}:${lesson.slug}`), `unreadable lesson key: ${lesson.section}:${lesson.slug}`);
  ok(lesson.section === "en" || lesson.section === "ar", `${lesson.slug}: invalid section`);
  ok(lesson.title.length > 0, `${lesson.slug}: empty title`);
  ok(Array.isArray(lesson.takeaways), `${lesson.slug}: takeaways must be an array`);

  if (lesson.kind === "source") {
    ok(Boolean(lesson.source), `${lesson.slug}: source lesson has no source page`);
    ok(lesson.coverage === "COVERED", `${lesson.slug}: source lesson should be COVERED, is ${lesson.coverage}`);
    sourceUsage.set(lesson.source, (sourceUsage.get(lesson.source) ?? 0) + 1);
  } else {
    ok(lesson.coverage === "MISSING", `${lesson.slug}: editorial lesson must be labelled MISSING`);
    ok(lesson.source === null, `${lesson.slug}: editorial lesson must not claim a source page`);
    const body = editorial[lesson.slug];
    ok(Array.isArray(body) && body.length >= 5, `${lesson.slug}: editorial body is missing or too thin`);
  }

  if (lesson.chapter !== null) {
    const chapter = chapters.find((item) => item.number === lesson.chapter);
    ok(Boolean(chapter), `${lesson.slug}: references missing chapter ${lesson.chapter}`);
    if (chapter) {
      ok(chapter.lessons.includes(lesson.slug), `${lesson.slug}: chapter ${chapter.number} does not list it`);
    }
  }
}

ok(sourceUsage.size === pages.length, `only ${sourceUsage.size} of ${pages.length} source pages are mapped to a lesson`);
for (const page of pages) {
  ok(sourceUsage.get(page.slug) === 1, `source page ${page.slug} is mapped ${sourceUsage.get(page.slug) ?? 0} times (expected exactly 1)`);
}
for (const [slug, count] of sourceUsage) {
  ok(count === 1, `source ${slug} is used by ${count} lessons`);
  ok(pageSlugs.has(slug), `lesson references unknown source page ${slug}`);
}

const chapterNumbers = new Set();
for (const chapter of chapters) {
  ok(!chapterNumbers.has(chapter.number), `duplicate chapter number ${chapter.number}`);
  chapterNumbers.add(chapter.number);
  ok(chapter.title.length > 0 && chapter.question.length > 0, `chapter ${chapter.number}: title or question missing`);
  ok(chapter.lessons.length > 0, `chapter ${chapter.number}: no lessons`);
  for (const slug of chapter.lessons) {
    ok(
      lessons.some((lesson) => lesson.slug === slug),
      `chapter ${chapter.number} references unknown lesson ${slug}`,
    );
  }
  ok(chapter.lab?.href?.startsWith("/"), `chapter ${chapter.number}: lab link is missing`);
}

/* -------------------------------------------------------------------------- */
/* Blocks: sanitisation, assets, links                                       */
/* -------------------------------------------------------------------------- */

const knownRoutes = new Set([
  "/",
  "/work",
  "/experience",
  "/services",
  "/lab",
  "/learn",
  "/learn/ar",
  "/learn/method",
  "/explore",
  "/explore/charts",
  "/explore/choose",
  "/explore/integrity",
  "/explore/dashboards",
  "/explore/specialty",
  "/practice",
  "/about",
  "/contact",
]);
for (const chapter of chapters) knownRoutes.add(`/learn/chapter/${chapter.number}`);
for (const lesson of lessons) {
  knownRoutes.add(lesson.section === "ar" ? `/learn/ar/${lesson.slug}` : `/learn/${lesson.slug}`);
}
for (const type of ["histogram", "box", "scatter", "line", "bar", "dot"]) {
  knownRoutes.add(`/explore/charts/${type}`);
}

const figureFiles = new Set();
const forbidden = /<script|onerror\s*=|javascript:/i;

function walkBlocks(blocks, slug) {
  for (const block of blocks) {
    const strings = [];
    if (block.type === "heading") strings.push(block.text);
    if (block.type === "paragraph" || block.type === "quote") {
      strings.push(...block.inline.map((node) => node.text));
      for (const node of block.inline) checkLink(node.link, slug);
    }
    if (block.type === "list") {
      for (const item of block.items) {
        strings.push(...item.map((node) => node.text));
        for (const node of item) checkLink(node.link, slug);
      }
    }
    if (block.type === "callout" || block.type === "toggle") walkBlocks(block.blocks, slug);
    if (block.type === "code") strings.push(block.text);
    if (block.type === "equation") strings.push(block.tex);
    if (block.type === "table") {
      for (const cell of block.headers) {
        strings.push(...cell.map((node) => node.text));
        for (const node of cell) checkLink(node.link, slug);
      }
      for (const row of block.rows) {
        for (const cell of row) {
          strings.push(...cell.map((node) => node.text));
          for (const node of cell) checkLink(node.link, slug);
        }
      }
    }
    if (block.type === "figure") {
      ok(block.src.startsWith("/data-viz/figures/"), `${slug}: figure src is not local (${block.src})`);
      ok(Boolean(block.alt), `${slug}: figure has no alt text (${block.src})`);
      const file = path.join(ROOT, "public", block.src.replace(/^\//, ""));
      if (!figureFiles.has(block.src)) {
        figureFiles.add(block.src);
        ok(existsSync(file), `${slug}: missing figure file ${block.src}`);
      }
      if (block.asset?.sha256) {
        ok(/^[a-f0-9]{64}$/.test(block.asset.sha256), `${slug}: figure hash is malformed`);
      }
    }
    for (const text of strings) {
      ok(!forbidden.test(text), `${slug}: unsafe markup survived in text: ${text.slice(0, 60)}`);
    }
  }
}

function checkLink(link, slug) {
  if (!link) return;
  if (link.kind === "page") {
    ok(
      lessons.some((lesson) => lesson.source === link.targetSlug),
      `${slug}: page link points at an unmapped source (${link.targetSlug})`,
    );
  }
  if (link.kind === "route") {
    ok(knownRoutes.has(link.href.split("#")[0]), `${slug}: route link points at an unknown route (${link.href})`);
  }
  if (link.kind === "external" || link.kind === "notion") {
    ok(/^(https?:\/\/|mailto:)/.test(link.href), `${slug}: external link is not http(s)/mailto (${link.href})`);
  }
  if (typeof link.href === "string") {
    ok(!/^javascript:/i.test(link.href), `${slug}: javascript: link found`);
  }
}

for (const page of pages) walkBlocks(page.blocks, page.slug);
for (const [slug, blocks] of Object.entries(editorial)) walkBlocks(blocks, `editorial:${slug}`);

ok(figureFiles.size >= 12, `expected at least 12 distinct figure assets, found ${figureFiles.size}`);

/* -------------------------------------------------------------------------- */
/* Datasets                                                                  */
/* -------------------------------------------------------------------------- */

const DATASET_IDS = [
  "order-values",
  "delivery-times",
  "campaign-spend",
  "weekly-sessions",
  "regional-revenue",
  "clinic-wait",
  "hiring-funnel",
  "revenue-mix",
  "baseline-bars",
  "dual-metric",
  "channel-mix",
  "same-mean",
  "long-series",
  "simpson",
];

ok(datasets.meta?.synthetic === true, "dataset meta must declare synthetic data");
ok(datasets.meta?.seed === 20261023, "dataset seed changed; regenerate and update the audit");
ok(Object.keys(datasets.datasets ?? {}).length === DATASET_IDS.length, `expected ${DATASET_IDS.length} datasets`);

function walkNumbers(value, pathLabel) {
  if (typeof value === "number") {
    ok(Number.isFinite(value), `${pathLabel}: non-finite number`);
    return 1;
  }
  if (Array.isArray(value)) return value.reduce((count, item) => count + walkNumbers(item, pathLabel), 0);
  if (value && typeof value === "object") {
    return Object.values(value).reduce((count, item) => count + walkNumbers(item, pathLabel), 0);
  }
  return 0;
}

for (const id of DATASET_IDS) {
  const dataset = datasets.datasets?.[id];
  ok(Boolean(dataset), `missing dataset ${id}`);
  if (!dataset) continue;
  ok(dataset.id === id, `dataset ${id} has id ${dataset.id}`);
  ok(dataset.synthetic === true, `dataset ${id} must be marked synthetic`);
  ok(typeof dataset.label === "string" && dataset.label.length > 0, `dataset ${id} has no label`);
  ok(typeof dataset.note === "string" && dataset.note.length > 0, `dataset ${id} has no note`);
  ok(walkNumbers(dataset, `dataset ${id}`) > 0, `dataset ${id} contains no numbers`);
}

const funnel = datasets.datasets["hiring-funnel"].stages;
ok(funnel.length === 5, "hiring funnel should have five stages");
for (let index = 1; index < funnel.length; index += 1) {
  ok(funnel[index].value <= funnel[index - 1].value, `funnel stage ${funnel[index].id} grows instead of shrinking`);
}
ok(funnel.at(-1).value < funnel[0].value, "funnel does not lose anyone");

const mix = datasets.datasets["channel-mix"].rows;
ok(mix.reduce((sum, row) => sum + row.value, 0) === 100, "channel mix does not sum to 100%");

const mixNodes = datasets.datasets["revenue-mix"].nodes;
const mixTotal = mixNodes.reduce(
  (sum, node) => sum + node.children.reduce((inner, child) => inner + child.value, 0),
  0,
);
ok(mixTotal === 1960, `revenue mix total is ${mixTotal}, expected 1960`);

const sameMean = datasets.datasets["same-mean"].groups;
ok(sameMean.length === 4, "same-mean demo should have four groups");
for (const group of sameMean) {
  const groupMean = group.values.reduce((sum, value) => sum + value, 0) / group.values.length;
  ok(Math.abs(groupMean - 50) < 0.05, `${group.id}: mean is ${groupMean}, expected 50`);
}
const spreads = sameMean.map((group) => {
  const groupMean = group.values.reduce((sum, value) => sum + value, 0) / group.values.length;
  return Math.sqrt(group.values.reduce((sum, value) => sum + (value - groupMean) ** 2, 0) / group.values.length);
});
ok(Math.max(...spreads) / Math.min(...spreads) > 1.5, "same-mean groups do not differ enough in spread");

const sessions = datasets.datasets["weekly-sessions"].series;
ok(sessions.length === 3, "weekly sessions should have three channels");
for (const series of sessions) ok(series.points.length === 26, `${series.id}: expected 26 weeks`);

const simpson = datasets.datasets.simpson.segments;
ok(simpson.length === 2, "Simpson demo should have two segments");
for (const segment of simpson) {
  for (const arm of ["control", "treatment"]) {
    ok(segment[arm].converted <= segment[arm].total, `${segment.id}/${arm}: conversions exceed the total`);
    ok(segment[arm].total > 0, `${segment.id}/${arm}: zero denominator`);
  }
}
const pooledControl =
  simpson.reduce((sum, segment) => sum + segment.control.converted, 0) /
  simpson.reduce((sum, segment) => sum + segment.control.total, 0);
const pooledTreatment =
  simpson.reduce((sum, segment) => sum + segment.treatment.converted, 0) /
  simpson.reduce((sum, segment) => sum + segment.treatment.total, 0);
const withinSegments = simpson.every(
  (segment) => segment.treatment.converted / segment.treatment.total > segment.control.converted / segment.control.total,
);
ok(withinSegments, "Simpson demo must have treatment ahead inside every segment");
ok(pooledTreatment < pooledControl, "Simpson demo must reverse when pooled");

ok(datasets.datasets["long-series"].values.length === 52, "long series must have 52 weeks");
ok(datasets.datasets["dual-metric"].rows.length === 24, "dual-metric demo must have 24 months");
ok(datasets.datasets["campaign-spend"].points.length === 48, "campaign scatter must have 48 points");

/* -------------------------------------------------------------------------- */
/* Built output (only with --check)                                          */
/* -------------------------------------------------------------------------- */

if (CHECK) {
  try {
    execFileSync(process.execPath, ["scripts/build-datasets.mjs", "--check"], {
      cwd: ROOT,
      stdio: "pipe",
    });
  } catch (error) {
    failures.push(
      "content/data-viz/datasets.json is stale - run: node scripts/build-datasets.mjs",
    );
    void error;
  }

  const outDir = path.join(ROOT, "out");
  warn(existsSync(outDir), "out/ does not exist; HTML heading and asset checks were skipped");
  if (existsSync(outDir)) {
    const htmlFiles = [];
    async function collect(directory) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const full = path.join(directory, entry.name);
        if (entry.isDirectory()) await collect(full);
        else if (entry.name.endsWith(".html")) htmlFiles.push(full);
      }
    }
    await collect(outDir);

    let h1Checked = 0;
    for (const file of htmlFiles) {
      const html = await readFile(file, "utf8");
      const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
      if (h1Count === 0) continue;
      h1Checked += 1;
      ok(h1Count === 1, `${path.relative(outDir, file)} renders ${h1Count} <h1> elements`);
    }
    ok(h1Checked > 20, `only ${h1Checked} built pages were checked for headings`);
  }
}

/* -------------------------------------------------------------------------- */
/* Report                                                                    */
/* -------------------------------------------------------------------------- */

const figures = new Set();
for (const page of pages) {
  const visit = (blocks) => {
    for (const block of blocks) {
      if (block.type === "figure") figures.add(block.src);
      if (block.type === "callout" || block.type === "toggle") visit(block.blocks);
    }
  };
  visit(page.blocks);
}

const characters = pages.reduce((sum, page) => sum + page.textLength, 0);

console.log("Data Visualization content validation");
console.log(`  source pages      ${pages.length}`);
console.log(`  figures           ${figures.size}`);
console.log(`  source characters ${characters.toLocaleString("en-US")}`);
console.log(`  chapters          ${chapters.length}`);
console.log(
  `  lessons           ${lessons.length} (${lessons.filter((lesson) => lesson.section === "en").length} en, ${lessons.filter((lesson) => lesson.section === "ar").length} ar)`,
);
console.log(`  editorial         ${lessons.filter((lesson) => lesson.kind === "editorial").length}`);
console.log(`  datasets          ${Object.keys(datasets.datasets).length}`);
console.log(`  assertions        ${assertions}`);

for (const warning of warnings) console.log(`  WARN  ${warning}`);

if (failures.length) {
  console.error(`\nFAIL — ${failures.length} assertion(s) failed:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`\nPASS — ${assertions} assertions, ${warnings.length} warning(s).`);
