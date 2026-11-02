// Recursive corpus extractor for the Intelligent Atlas assignment.
//
// It reads the real content adapters used by the application, plus the app
// route tree, and emits one ledger row per content unit. It deliberately keeps
// held answers and explanations out of the ledger: the Atlas needs stems,
// locators and review states, not a second copy of restricted assessment data.
//
// Outputs (intelligent-atlas/analysis/):
//   units.jsonl           one row per content unit
//   corpus-manifest.json  source families, route inventory and denominators
//   media.json            meaningful media references and inspection state
//   routes.json           static + generated route inventory
//
// This is extraction, not semantic review. The semantic pass is a separate
// deterministic step so its method and limits stay inspectable.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "intelligent-atlas", "analysis");
mkdirSync(outDir, { recursive: true });

const readJson = (rel) => JSON.parse(readFileSync(path.join(root, rel), "utf8"));
const sha = (value) =>
  createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
const clean = (value = "") =>
  String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#|]/g, " ")
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const inlineText = (inline = []) =>
  inline
    .map((part) => (typeof part === "string" ? part : part?.text ?? ""))
    .join("");

function blockText(block) {
  if (!block || typeof block !== "object") return "";
  const own = block.text ?? inlineText(block.inline ?? []);
  const children = [];
  for (const key of ["blocks", "items", "rows", "cells"]) {
    const value = block[key];
    if (Array.isArray(value)) {
      for (const item of value) {
        if (Array.isArray(item)) children.push(item.map((cell) => blockText(cell)).join(" "));
        else children.push(blockText(item));
      }
    }
  }
  return clean([own, ...children].filter(Boolean).join(" "));
}

function sectionize(blocks, { headingTypes = ["h2", "heading"], anchorOf } = {}) {
  const sections = [];
  let current = { title: "Opening", anchor: "opening", blocks: [] };
  let index = 0;
  for (const block of blocks ?? []) {
    const isHeading =
      headingTypes.includes(block?.type) &&
      (block.level === undefined || block.level === 2 || block.level === 1);
    if (isHeading) {
      if (current.blocks.length || current.title !== "Opening") sections.push(current);
      index += 1;
      current = {
        title: clean(block.text || `Section ${index}`),
        anchor: block.anchor || anchorOf?.(block, index) || `section-${index}`,
        blocks: [],
      };
      continue;
    }
    current.blocks.push(block);
  }
  if (current.blocks.length || current.title !== "Opening") sections.push(current);
  return sections.map((section, i) => ({
    ...section,
    index: i + 1,
    text: section.blocks.map(blockText).filter(Boolean).join("\n\n"),
  }));
}

const units = [];
const media = [];
const sources = [];
const seen = new Set();

function addSource(source) {
  if (seen.has(source.id)) return;
  seen.add(source.id);
  sources.push(source);
}

function addUnit(unit) {
  const text = clean(unit.text ?? "");
  const row = {
    unitId: unit.unitId,
    sourceKind: unit.sourceKind,
    sourceFamily: unit.sourceFamily,
    originalId: unit.originalId ?? "",
    revisionOrFingerprint: unit.revisionOrFingerprint ?? sha(text),
    sourcePath: unit.sourcePath ?? "",
    locator: unit.locator ?? "",
    canonicalHref: unit.canonicalHref ?? "",
    language: unit.language ?? "en",
    subjectPlacements: unit.subjectPlacements ?? [],
    contentForms: unit.contentForms ?? ["text"],
    publicationPolicy: unit.publicationPolicy ?? "public-route",
    assessmentPolicy: unit.assessmentPolicy ?? "not-an-assessment",
    extractionState: unit.extractionState ?? "extracted",
    semanticAnalysisState: unit.semanticAnalysisState ?? "pending",
    reviewedBy: unit.reviewedBy ?? "",
    reviewedAt: unit.reviewedAt ?? "",
    conceptCandidates: unit.conceptCandidates ?? [],
    relationCandidates: unit.relationCandidates ?? [],
    resourceMappings: unit.resourceMappings ?? [],
    limitations: unit.limitations ?? [],
    exclusionReason: unit.exclusionReason ?? "",
    title: clean(unit.title ?? ""),
    text,
  };
  units.push(row);
}

function addMedia({ id, sourcePath, locator, src, alt, caption, kind = "figure" }) {
  media.push({
    mediaId: id,
    sourcePath,
    locator,
    src,
    alt: clean(alt ?? ""),
    caption: clean(caption ?? ""),
    kind,
    inspectionState: alt || caption ? "alt-and-caption-inspected; pixels-not-independently-reviewed" : "not-inspected",
    limitation: "Alt/caption text is not proof that the rendered image matches the claim; visual review remains pending.",
  });
}

// ---------------------------------------------------------------- route tree
function walkPages(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...walkPages(absolute));
    else if (entry.name === "page.tsx") found.push(absolute);
  }
  return found;
}

function routeOf(file) {
  const rel = path.relative(path.join(root, "app"), path.dirname(file)).split(path.sep).join("/");
  if (!rel) return "/";
  return `/${rel.replace(/\[([^\]]+)\]/g, ":$1")}/`.replace(/\/+/g, "/");
}

function metadataTitle(source) {
  const match = source.match(/title:\s*(?:\{\s*absolute:\s*)?["'`]([^"'`]+)["'`]/);
  return match ? clean(match[1]) : "";
}

const routeRows = [];
for (const file of walkPages(path.join(root, "app"))) {
  const source = readFileSync(file, "utf8");
  const route = routeOf(file);
  const dynamic = route.includes(":");
  routeRows.push({
    route,
    file: path.relative(root, file).split(path.sep).join("/"),
    dynamic,
    title: metadataTitle(source),
    kind: route === "/" ? "home" : /^\/(learn|study|explore)/.test(route) ? "learning" : /^\/(lab|practice)/.test(route) ? "practice" : /^\/(work|services|about|experience|contact)/.test(route) ? "professional" : "utility",
    analysisDisposition: dynamic ? "dynamic-pattern; concrete instances enumerated from content" : "static-route-accounted",
  });
}
routeRows.sort((a, b) => a.route.localeCompare(b.route));

// ---------------------------------------------------------------- insights
const insightFeed = readJson("content/knowledge/insights.json");
addSource({
  id: "content/knowledge/insights.json",
  family: "daily-insights",
  path: "content/knowledge/insights.json",
  fingerprint: sha(insightFeed),
  publicationPolicy: "eligibleInsights; preview requires explicit caller decision",
});
for (const insight of insightFeed.items) {
  addUnit({
    unitId: `insight:${insight.id}`,
    sourceKind: "insight-edition",
    sourceFamily: "daily-insights",
    originalId: insight.id,
    sourcePath: "content/knowledge/insights.json",
    locator: `items[id=${insight.id}]`,
    canonicalHref: `/?insight=${encodeURIComponent(insight.id)}#today`,
    subjectPlacements: ["fabric"],
    contentForms: ["scenario", "principle", "caveat", "source-locator"],
    publicationPolicy: `insight reviewStatus=${insight.reviewStatus}; preview label required outside explicit preview`,
    assessmentPolicy: "not-scored",
    title: insight.cardTitle,
    text: [
      insight.title,
      insight.topic,
      insight.scenario,
      insight.prediction,
      insight.takeaway,
      insight.caveat,
      insight.sourceLocator,
    ].join("\n"),
    limitations: [
      "One edition carries three explanatory facets of one idea, not three independent concepts.",
      `Review status: ${insight.reviewStatus}; reviewer: ${insight.reviewer}.`,
    ],
  });
}

// ---------------------------------------------------------------- fabric bank
const fabric = readJson("content/fabric/index.json");
addSource({ id: "content/fabric/index.json", family: "fabric-questions", path: "content/fabric/index.json", fingerprint: sha(fabric), publicationPolicy: "existing bank; original answer/review status retained" });
for (const q of fabric) {
  addUnit({
    unitId: `fabric-q:${q.id}`,
    sourceKind: "question",
    sourceFamily: "fabric-questions",
    originalId: q.id,
    sourcePath: "content/fabric/index.json",
    locator: `id=${q.id}`,
    canonicalHref: `/lab/dp-600/explore/?question=${encodeURIComponent(q.id)}`,
    subjectPlacements: ["fabric", ...(q.pack === "video06" ? ["power-bi"] : [])],
    contentForms: ["question-stem", ...(q.hasCode ? ["code"] : [])],
    assessmentPolicy: "existing bank; answer status retained; no new grading",
    title: q.title,
    text: [q.title, q.prompt, q.topic, q.pack, q.objectiveId, ...(q.refs ?? []), ...(q.subjects ?? [])].join("\n"),
    limitations: [`Pack ${q.pack}; objective ${q.objectiveId ?? "not recorded"}; confidence ${q.confidence ?? "not recorded"}.`],
  });
}

const additions = readJson("content/fabric/additions/questions.json");
addSource({ id: "content/fabric/additions/questions.json", family: "fabric-additions", path: "content/fabric/additions/questions.json", fingerprint: sha(additions), publicationPolicy: "existing source; blockers and review labels retained; answers withheld from this ledger" });
for (const q of additions) {
  const stem = clean(q.stemHtml);
  addUnit({
    unitId: `fabric-add:${q.id}`,
    sourceKind: "question",
    sourceFamily: "fabric-additions",
    originalId: q.id,
    sourcePath: "content/fabric/additions/questions.json",
    locator: `id=${q.id}`,
    canonicalHref: `/lab/dp-600/explore/?question=${encodeURIComponent(q.id)}`,
    subjectPlacements: [q.exam === "PL-300" ? "power-bi" : "fabric"],
    contentForms: ["question-stem", ...(q.images?.length ? ["media-reference"] : [])],
    assessmentPolicy: "existing bank; blockers retained; no new grading",
    title: stem.slice(0, 120),
    text: [stem, q.caseLabel, q.exam].filter(Boolean).join("\n"),
    limitations: [
      "Stem only; options, controls, answers and explanation intentionally excluded from this ledger.",
      q.blockers?.length ? `Existing blockers: ${q.blockers.join("; ")}` : "No blockers recorded in the source record.",
      `Source records: ${(q.sourceRecords ?? []).join(", ") || "not recorded"}.`,
    ],
  });
  for (const [i, image] of (q.images ?? []).entries()) {
    addMedia({ id: `fabric-add:${q.id}:image-${i}`, sourcePath: "content/fabric/additions/questions.json", locator: `id=${q.id}; images[${i}]`, src: image, alt: "", caption: "", kind: "question-image" });
  }
}

const r11 = readJson("content/fabric/r11/questions.json");
addSource({ id: "content/fabric/r11/questions.json", family: "fabric-r11", path: "content/fabric/r11/questions.json", fingerprint: sha(r11), publicationPolicy: "revision overlay on existing question identity; not a second question", assessmentPolicy: "gradingEnabled and scientificStatus retained; HOLD remains held" });
for (const q of r11) {
  addUnit({
    unitId: `fabric-r11:${q.id}`,
    sourceKind: "question-revision-overlay",
    sourceFamily: "fabric-r11",
    originalId: q.id,
    sourcePath: "content/fabric/r11/questions.json",
    locator: `id=${q.id}`,
    canonicalHref: `/lab/dp-600/explore/?question=${encodeURIComponent(q.hansaId)}`,
    subjectPlacements: ["fabric"],
    contentForms: ["question-stem", "revision-overlay"],
    publicationPolicy: "overlay; preserve original question identity and answer policy",
    assessmentPolicy: `gradingEnabled=${q.gradingEnabled}; scientificStatus=${q.scientificStatus}`,
    title: clean(q.stem).slice(0, 120),
    text: [clean(q.stem), q.caseStudy, q.reviewNote, q.remaining].filter(Boolean).join("\n"),
    limitations: [
      `R11 overlay for hansaId ${q.hansaId}; original source ${q.sourceId}.`,
      "Stem only; answer, officialAnswer, explanation and options excluded from this ledger.",
      `Review: ${q.scientificStatus} / ${q.reviewKind ?? "kind not recorded"}.`,
    ],
  });
}

const notes = readJson("content/fabric/notes.json");
addSource({ id: "content/fabric/notes.json", family: "fabric-notes", path: "content/fabric/notes.json", fingerprint: sha(notes), publicationPolicy: "existing study notes; source pack context retained" });
for (const pack of notes) {
  for (const chapter of pack.chapters) {
    addUnit({
      unitId: `fabric-note:${pack.pack}/${chapter.id}`,
      sourceKind: "note",
      sourceFamily: "fabric-notes",
      originalId: `${pack.pack}/${chapter.id}`,
      sourcePath: "content/fabric/notes.json",
      locator: `pack=${pack.pack}; chapter=${chapter.id}`,
      canonicalHref: `/lab/dp-600/resources/?pack=${encodeURIComponent(pack.pack)}#study-notes`,
      subjectPlacements: ["fabric"],
      contentForms: ["note", "timestamped-summary"],
      title: chapter.title,
      text: [chapter.title, ...(chapter.points ?? [])].join("\n"),
      limitations: [`Video segment ${chapter.startSeconds ?? "?"}–${chapter.end ?? "?"}; notes summarize a source video, not a re-execution.`],
    });
  }
}

const cases = readJson("content/fabric/cases.json");
addSource({ id: "content/fabric/cases.json", family: "fabric-cases", path: "content/fabric/cases.json", fingerprint: sha(cases), publicationPolicy: "existing case scenarios" });
for (const c of cases) {
  addUnit({
    unitId: `fabric-case:${c.id}`,
    sourceKind: "case-study",
    sourceFamily: "fabric-cases",
    originalId: c.id,
    sourcePath: "content/fabric/cases.json",
    locator: `id=${c.id}`,
    canonicalHref: "/lab/dp-600/cases/",
    subjectPlacements: ["fabric"],
    contentForms: ["scenario"],
    title: c.title,
    text: [c.title, c.text].join("\n"),
    limitations: ["Scenario text only; linked question answers are not used as evidence for semantic relations."],
  });
}

// ---------------------------------------------------------------- academy
const academy = readJson("content/academy/lessons.json");
addSource({ id: "content/academy/lessons.json", family: "academy", path: "content/academy/lessons.json", fingerprint: sha(academy), publicationPolicy: `MIT courseware; ${academy.attribution}` });
for (const track of academy.tracks) {
  for (const lesson of track.lessons) {
    const sections = sectionize(lesson.blocks, {
      headingTypes: ["h2", "h3"],
      anchorOf: (block, index) => `section-${index}`,
    });
    if (!sections.length) {
      addUnit({
        unitId: `academy:${track.track}:${lesson.slug}`,
        sourceKind: "lesson",
        sourceFamily: "academy",
        originalId: `${track.track}/${lesson.slug}`,
        sourcePath: "content/academy/lessons.json",
        locator: `tracks[${track.track}].lessons[slug=${lesson.slug}]`,
        canonicalHref: `/learn/academy/${track.track}/${lesson.slug}/`,
        subjectPlacements: [track.track === "power-bi" ? "power-bi" : "fabric"],
        contentForms: ["lesson"],
        publicationPolicy: "MIT courseware mirrored with attribution",
        title: lesson.title,
        text: [lesson.title, lesson.description, lesson.module].join("\n"),
      });
    }
    for (const section of sections) {
      addUnit({
        unitId: `academy:${track.track}:${lesson.slug}#${section.anchor}`,
        sourceKind: "lesson-section",
        sourceFamily: "academy",
        originalId: `${track.track}/${lesson.slug}#${section.anchor}`,
        sourcePath: "content/academy/lessons.json",
        locator: `tracks[${track.track}].lessons[slug=${lesson.slug}] > ${section.title}`,
        canonicalHref: `/learn/academy/${track.track}/${lesson.slug}/#${section.anchor}`,
        subjectPlacements: [track.track === "power-bi" ? "power-bi" : "fabric"],
        contentForms: ["lesson-section", "lab-steps"],
        publicationPolicy: "MIT courseware mirrored with attribution; source stays authoritative",
        title: section.title,
        text: [lesson.title, section.title, section.text].join("\n"),
        limitations: ["Mirrored MicrosoftLearning lab; no runtime execution is claimed."],
      });
      for (const block of section.blocks) {
        const imageMatch = String(block?.text ?? "").match(/!\[([^\]]*)\]\(([^)]+)\)/);
        if (imageMatch) {
          addMedia({
            id: `academy:${track.track}:${lesson.slug}:${section.anchor}:${sha(imageMatch[2]).slice(0, 8)}`,
            sourcePath: "content/academy/lessons.json",
            locator: `${lesson.slug} > ${section.title}`,
            src: imageMatch[2],
            alt: imageMatch[1],
            caption: "",
            kind: "lab-screenshot",
          });
        }
      }
    }
  }
}

// ---------------------------------------------------------------- SQL
const sqlIndex = readJson("content/sql/index.json");
const sqlVault = readJson("content/sql/vault.json");
addSource({ id: "content/sql/index.json", family: "sql", path: "content/sql/index.json", fingerprint: sha(sqlIndex), publicationPolicy: "preserved Notion source; domain qualifications remain" });
addSource({ id: "content/sql/vault.json", family: "sql", path: "content/sql/vault.json", fingerprint: sha(sqlVault), publicationPolicy: "preserved Notion source; full bodies local" });
for (const page of sqlVault.pages) {
  const moduleKey = page.module === null || page.module === undefined ? page.href.replace(/^\/learn\/sql\/|\/$/g, "") : String(page.module).padStart(2, "0");
  const sections = sectionize(page.blocks, {
    headingTypes: ["heading"],
    anchorOf: (block) => block.anchor || `section-${sha(block.text).slice(0, 6)}`,
  });
  for (const section of sections) {
    addUnit({
      unitId: `sql:${moduleKey}#${section.anchor}`,
      sourceKind: "lesson-section",
      sourceFamily: "sql",
      originalId: `${page.id}#${section.anchor}`,
      sourcePath: "content/sql/vault.json",
      locator: `pages[id=${page.id}] > ${section.title}`,
      canonicalHref: `${page.href}#${section.anchor}`,
      language: /[\u0600-\u06FF]/.test(section.text) ? "mixed" : "en",
      subjectPlacements: ["sql"],
      contentForms: ["lesson-section", ...(section.blocks.some((b) => b.type === "code") ? ["code"] : [])],
      publicationPolicy: "preserved source; answer keys not present in lesson body",
      title: section.title,
      text: [page.title, page.objective, section.title, section.text].join("\n"),
      limitations: ["Notion export preserved; examples are not claimed to have been executed against a live database."],
    });
  }
  for (const block of page.blocks ?? []) {
    if (block.type === "figure" || block.type === "image") {
      addMedia({ id: `sql:${moduleKey}:${sha(block.src ?? block.text ?? "").slice(0, 8)}`, sourcePath: "content/sql/vault.json", locator: page.title, src: block.src ?? "", alt: block.alt ?? "", caption: block.caption ?? "", kind: "lesson-figure" });
    }
  }
}
for (const drill of sqlIndex.drills) {
  addUnit({
    unitId: `sql-drill:${drill.id}`,
    sourceKind: "question",
    sourceFamily: "sql",
    originalId: drill.id,
    sourcePath: "content/sql/index.json",
    locator: `drills[id=${drill.id}]`,
    canonicalHref: drill.href,
    language: "mixed",
    subjectPlacements: ["sql"],
    contentForms: ["question-stem"],
    assessmentPolicy: "source-backed open-response self-check; unscored",
    title: drill.prompt.slice(0, 120),
    text: [drill.prompt, drill.topic].join("\n"),
    limitations: ["Open-response self-check; no answer key is used for graph evidence."],
  });
}
for (const q of sqlIndex.legacyQuestions ?? []) {
  addUnit({
    unitId: `sql-legacy:${q.id}`,
    sourceKind: "question",
    sourceFamily: "sql",
    originalId: q.id,
    sourcePath: "content/sql/index.json",
    locator: `legacyQuestions[id=${q.id}]`,
    canonicalHref: q.href ?? "/practice/sql/",
    language: "mixed",
    subjectPlacements: ["sql"],
    contentForms: ["question-stem"],
    assessmentPolicy: "existing question; original answer/grading retained",
    title: clean(q.prompt ?? q.title ?? q.id).slice(0, 120),
    text: clean([q.prompt, q.title, q.topic].filter(Boolean).join("\n")),
    limitations: ["Answer/explanation excluded from this ledger."],
  });
}

// ---------------------------------------------------------------- statistics
const statsSource = readJson("content/statistics/source.json");
addSource({ id: "content/statistics/source.json", family: "statistics", path: "content/statistics/source.json", fingerprint: sha(statsSource), publicationPolicy: "exported Notion source preserved; Arabic and English wording retained" });
for (const section of statsSource.sections) {
  addUnit({
    unitId: `stats:${section.id}`,
    sourceKind: "lesson-section",
    sourceFamily: "statistics",
    originalId: section.id,
    sourcePath: "content/statistics/source.json",
    locator: `sections[id=${section.id}]`,
    canonicalHref: `/learn/statistics/source/#${section.anchor}`,
    language: /[\u0600-\u06FF]/.test(section.textLength ? section.title : "") ? "mixed" : "en",
    subjectPlacements: ["statistics"],
    contentForms: ["lesson-section", "formula", "table"],
    publicationPolicy: "source body preserved",
    title: section.titleEn || section.title,
    text: [section.titleEn, section.title, section.blocks.map(blockText).join("\n")].join("\n"),
    limitations: [`Source counts: ${JSON.stringify(section.counts)}.`],
  });
}
for (const [index, formula] of statsSource.formulas.entries()) {
  addUnit({
    unitId: `stats-formula:${index}`,
    sourceKind: "formula",
    sourceFamily: "statistics",
    originalId: `formula-${index}`,
    sourcePath: "content/statistics/source.json",
    locator: `formulas[${index}]`,
    canonicalHref: `/learn/statistics/formulas/`,
    language: "mixed",
    subjectPlacements: ["statistics"],
    contentForms: ["formula"],
    publicationPolicy: "source formula preserved",
    title: formula.tex || formula.raw,
    text: [formula.raw, formula.tex, formula.section].filter(Boolean).join("\n"),
    limitations: [`Formula matched=${formula.matched}; section=${formula.section}.`],
  });
}

// ---------------------------------------------------------------- data visualization
const dvPages = readJson("content/data-viz/pages.json");
const dvCurriculum = readJson("content/data-viz/curriculum.json");
addSource({ id: "content/data-viz/pages.json", family: "visualization", path: "content/data-viz/pages.json", fingerprint: sha(dvPages), publicationPolicy: "exported Notion pages preserved; Arabic/English variants retained" });
addSource({ id: "content/data-viz/curriculum.json", family: "visualization", path: "content/data-viz/curriculum.json", fingerprint: sha(dvCurriculum), publicationPolicy: "editorial curriculum over source pages" });
// A source export page is not a route. Resolve it to the curriculum lesson that
// cites that page (`lesson.source === page.slug`), because that is the only
// in-site surface that renders it. Pages without a curriculum lesson keep their
// source export URL so the ledger never invents a local route.
const dvLessonBySource = new Map();
for (const lesson of dvCurriculum.lessons ?? []) {
  if (lesson.source) dvLessonBySource.set(lesson.source, lesson);
}
const dvPageHref = (page) => {
  const lesson = dvLessonBySource.get(page.slug);
  if (lesson) return lesson.section === "ar" ? `/learn/ar/${lesson.slug}/` : `/learn/${lesson.slug}/`;
  return page.canonicalUrl ?? "";
};
for (const page of dvPages) {
  const sections = sectionize(page.blocks, {
    headingTypes: ["heading"],
    anchorOf: (block) => block.anchor || `section-${sha(block.text).slice(0, 6)}`,
  });
  for (const section of sections) {
    addUnit({
      unitId: `dv:${page.slug}#${section.anchor}`,
      sourceKind: "lesson-section",
      sourceFamily: "visualization",
      originalId: `${page.notionId}#${section.anchor}`,
      sourcePath: "content/data-viz/pages.json",
      locator: `pages[slug=${page.slug}] > ${section.title}`,
      canonicalHref: dvPageHref(page),
      language: page.lang === "ar" ? "ar" : "en",
      subjectPlacements: ["visualization"],
      contentForms: ["lesson-section", ...(section.blocks.some((b) => b.type === "figure") ? ["figure"] : []), ...(section.blocks.some((b) => b.type === "table") ? ["table"] : [])],
      publicationPolicy: "source export preserved; figure assets cited by hash",
      title: section.title,
      text: [page.title, section.title, section.text].join("\n"),
      limitations: ["Source Notion export; rendered layout not re-reviewed."],
    });
    for (const block of section.blocks) {
      if (block.type === "figure") {
        addMedia({
          id: `dv:${page.slug}:${sha(block.src ?? block.caption ?? block.alt ?? "").slice(0, 10)}`,
          sourcePath: "content/data-viz/pages.json",
          locator: `${page.slug} > ${section.title}`,
          src: block.src,
          alt: block.alt,
          caption: block.caption,
          kind: "teaching-figure",
        });
      }
    }
  }
}
for (const lesson of dvCurriculum.lessons ?? []) {
  addUnit({
    unitId: `dv-lesson:${lesson.section}:${lesson.slug}`,
    sourceKind: "curriculum-lesson",
    sourceFamily: "visualization",
    originalId: `${lesson.section}/${lesson.slug}`,
    sourcePath: "content/data-viz/curriculum.json",
    locator: `lessons[slug=${lesson.slug}]`,
    canonicalHref: lesson.section === "ar" ? `/learn/ar/${lesson.slug}/` : `/learn/${lesson.slug}/`,
    language: lesson.section === "ar" ? "ar" : "en",
    subjectPlacements: ["visualization"],
    contentForms: ["editorial-overview"],
    publicationPolicy: "editorial curriculum; source page remains authoritative",
    title: lesson.title,
    text: [lesson.title, lesson.intro, ...(lesson.takeaways ?? [])].join("\n"),
    limitations: ["Editorial overview, not a second copy of the source body."],
  });
}

// ---------------------------------------------------------------- exams
const examFiles = readdirSync(path.join(root, "content", "exams")).filter((f) => f.endsWith(".json"));
for (const file of examFiles) {
  const exam = readJson(`content/exams/${file}`);
  addSource({ id: `content/exams/${file}`, family: "exams", path: `content/exams/${file}`, fingerprint: sha(exam), publicationPolicy: "existing practice exam; answers retained in source, excluded here", assessmentPolicy: "scored practice exam; original grading" });
  for (const q of exam.questions ?? []) {
    addUnit({
      unitId: `exam:${exam.slug}:${q.id}`,
      sourceKind: "question",
      sourceFamily: "exams",
      originalId: q.id,
      sourcePath: `content/exams/${file}`,
      locator: `questions[id=${q.id}]`,
      canonicalHref: `/lab/${exam.slug}/`,
      subjectPlacements: [exam.slug === "fundamentals" ? "analysis" : exam.slug === "statistics" ? "statistics" : exam.slug === "power-bi" ? "power-bi" : exam.slug === "fabric-rti" ? "fabric" : exam.slug],
      contentForms: ["question-stem"],
      assessmentPolicy: "scored practice exam; answer/explanation excluded from this ledger",
      title: q.prompt.slice(0, 120),
      text: [q.prompt, q.topic, exam.title].join("\n"),
      limitations: ["Answer index and explanation excluded."],
    });
  }
}

// ---------------------------------------------------------------- curated references & labs
const references = readJson("content/study/references.json");
addSource({ id: "content/study/references.json", family: "curated-references", path: "content/study/references.json", fingerprint: sha(references), publicationPolicy: "LINK_ONLY metadata; full text not republished" });
for (const r of references.records) {
  addUnit({
    unitId: `ref:${r.id}`,
    sourceKind: "reference",
    sourceFamily: "curated-references",
    originalId: r.id,
    sourcePath: "content/study/references.json",
    locator: `records[id=${r.id}]`,
    canonicalHref: r.href,
    language: r.language ?? "en",
    subjectPlacements: [r.subject],
    contentForms: ["link", "bibliographic-metadata"],
    publicationPolicy: `LINK_ONLY; rightsClass=${r.rightsClass}`,
    extractionState: "metadata-only",
    semanticAnalysisState: "not-full-text",
    title: r.title,
    text: [r.title, r.context, r.topic, r.source].filter(Boolean).join("\n"),
    limitations: ["LINK_ONLY: only metadata/gloss inspected; the external work is not republished or fully audited.", `Source: ${r.source}; status: ${r.status}.`],
  });
}

const experiments = readJson("content/study/experiments.json");
addSource({ id: "content/study/experiments.json", family: "hands-on-labs", path: "content/study/experiments.json", fingerprint: sha(experiments), publicationPolicy: "lab scaffolds; license and source URL retained" });
for (const lab of experiments.labs) {
  addUnit({
    unitId: `lab:${lab.catalogueId}`,
    sourceKind: "experiment",
    sourceFamily: "hands-on-labs",
    originalId: lab.catalogueId,
    sourcePath: "content/study/experiments.json",
    locator: `labs[slug=${lab.slug}]`,
    canonicalHref: `/lab/hands-on/${lab.slug}/`,
    subjectPlacements: [lab.subject],
    contentForms: ["lab-steps", "validation-checks"],
    publicationPolicy: `license=${lab.license}; rightsClass=${lab.rightsClass}; source stays authoritative`,
    assessmentPolicy: "lab validation checks; no runtime grading",
    title: lab.title,
    text: [lab.title, lab.summary, lab.environment, ...(lab.prerequisites ?? []), ...(lab.steps ?? []), ...(lab.validationChecks ?? [])].join("\n"),
    limitations: [`No live execution claimed. ${lab.originNote}`],
  });
}

// ---------------------------------------------------------------- RTI lessons
// The RTI lesson bodies live in TypeScript. This extractor reads the array
// source directly and keeps the declared fields; it does not execute the module.
const rtiSource = readFileSync(path.join(root, "lib/rti/lessons.ts"), "utf8");
const rtiBlocks = [...rtiSource.matchAll(/\n  \{\n    id: "([^"]+)",[\s\S]*?\n  \},/g)];
for (const match of rtiBlocks) {
  const block = match[0];
  const get = (field) => {
    const m = block.match(new RegExp(`${field}:\\s*\\n?\\s*"([\\s\\S]*?)",\\n`, "m"));
    return m ? clean(m[1]) : "";
  };
  const list = (field) => {
    const m = block.match(new RegExp(`${field}: \\[([\\s\\S]*?)\\],`, "m"));
    return m ? [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]) : [];
  };
  const slug = get("slug");
  const title = get("title");
  if (!slug || !title) continue;
  addUnit({
    unitId: `rti:${slug}`,
    sourceKind: "lesson",
    sourceFamily: "fabric-rti",
    originalId: get("id") || slug,
    sourcePath: "lib/rti/lessons.ts",
    locator: `LESSONS[slug=${slug}]`,
    canonicalHref: `/learn/fabric-rti/${slug}/`,
    subjectPlacements: ["fabric"],
    contentForms: ["lesson", "walkthrough", "lab-reference"],
    publicationPolicy: "pinned workshop source; runtime status retained",
    assessmentPolicy: "no grading enabled",
    title,
    text: [title, get("domain"), get("summary"), get("objective"), ...list("objectives"), ...list("misconceptions"), ...list("prerequisites"), ...list("walkthrough")].join("\n"),
    limitations: [get("verification"), get("limitation")].filter(Boolean),
  });
}
addSource({ id: "lib/rti/lessons.ts", family: "fabric-rti", path: "lib/rti/lessons.ts", fingerprint: sha(rtiSource), publicationPolicy: "pinned workshop source; runtime NOT_RUN where declared" });

// ---------------------------------------------------------------- professional content
// Portfolio routes are discoverable but are not forced into scientific concepts.
for (const route of routeRows.filter((r) => r.kind === "professional" && !r.dynamic)) {
  addUnit({
    unitId: `page:${route.route}`,
    sourceKind: "public-page",
    sourceFamily: "professional-pages",
    originalId: route.route,
    sourcePath: route.file,
    locator: "route page",
    canonicalHref: route.route,
    subjectPlacements: [],
    contentForms: ["page"],
    publicationPolicy: "public route",
    extractionState: "route-inventoried",
    semanticAnalysisState: "not-a-learning-concept",
    title: route.title || route.route,
    text: route.title || route.route,
    limitations: ["Professional/public information page; discoverability placement only, not a scientific concept."],
  });
}

// ---------------------------------------------------------------- write
const familyCounts = {};
for (const unit of units) familyCounts[unit.sourceFamily] = (familyCounts[unit.sourceFamily] ?? 0) + 1;

const manifest = {
  schemaVersion: "corpus-manifest/1.0",
  generatedAt: new Date().toISOString(),
  generatedBy: "intelligent-atlas/tools/build-corpus.mjs",
  scope: "visual-review assignment; extraction and inventory only",
  unitCount: units.length,
  familyCounts,
  sourceCount: sources.length,
  mediaCount: media.length,
  routeCount: routeRows.length,
  concreteRouteCount: routeRows.filter((r) => !r.dynamic).length,
  dynamicRouteCount: routeRows.filter((r) => r.dynamic).length,
  routeRows,
  sources,
  denominators: {
    unitsExtracted: units.length,
    unitsPendingSemanticAnalysis: units.filter((u) => u.semanticAnalysisState === "pending").length,
    unitsMetadataOnly: units.filter((u) => u.semanticAnalysisState === "not-full-text").length,
    mediaReferences: media.length,
    mediaNotIndependentlyReviewed: media.filter((m) => m.inspectionState !== "visually-reviewed").length,
  },
  limits: [
    "This manifest proves discovery and extraction, not scientific validation of every claim.",
    "Held answers, options and explanations are intentionally absent from the ledger.",
    "External LINK_ONLY works are represented by metadata only.",
    "Rendered screenshots and figures were not independently visually reviewed in this pass.",
  ],
};

writeFileSync(path.join(outDir, "units.jsonl"), units.map((u) => JSON.stringify(u)).join("\n") + "\n");
writeFileSync(path.join(outDir, "corpus-manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
writeFileSync(path.join(outDir, "media.json"), JSON.stringify({ generatedAt: manifest.generatedAt, count: media.length, items: media }, null, 2) + "\n");
writeFileSync(path.join(outDir, "routes.json"), JSON.stringify({ generatedAt: manifest.generatedAt, routes: routeRows }, null, 2) + "\n");

console.log(`extracted ${units.length} units across ${sources.length} sources; ${media.length} media refs; ${routeRows.length} routes`);
console.log(familyCounts);
