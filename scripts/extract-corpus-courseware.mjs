// Extract corpus courseware and question material into site content.
//
//   node scripts/extract-corpus-courseware.mjs \
//     --corpus "D:/BeUI/HansaDatabase/Hansa_Deep_Research_Corpus"
//
// Produces:
//   content/academy/lessons.json        — Academy lessons extracted from the
//                                         MIT-licensed MicrosoftLearning courseware
//                                         clones (mslearn-fabric, PL-300), with
//                                         attribution and source pointers on every
//                                         lesson.
//   content/drafts/kengio-dp700.json    — 150 community DP-700 questions (kengio,
//                                         MIT). Grading disabled; answer keys stay
//                                         at the MIT source, never shipped.
//   content/drafts/corpus-candidates.json — 38 corpus assessment candidates
//                                         (prompts + options; answer keys absent
//                                         at source). Grading disabled.
//
// Rights discipline: lessons mirror only MIT-licensed repository content with
// attribution; the two draft banks ship no expected answers; nothing from
// LINK_ONLY or INTERNAL_ONLY corpus records is republished.

import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
function arg(name, fallback) {
  const index = args.indexOf(`--${name}`);
  return index === -1 ? fallback : args[index + 1];
}
const CORPUS = path.resolve(arg("corpus", "D:/BeUI/HansaDatabase/Hansa_Deep_Research_Corpus"));
const CLONES = path.join(CORPUS, "_WORK", "clones");

const sha256 = async (text) => {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(text).digest("hex");
};

// ---------------------------------------------------------------------------
// Markdown → blocks (conservative, courseware-shaped)
// ---------------------------------------------------------------------------

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { meta: {}, body: text };
  const meta = {};
  let currentKey = null;
  for (const line of match[1].split(/\r?\n/)) {
    const pair = line.match(/^(\s*)([A-Za-z_][\w-]*):\s*(.*)$/);
    if (pair && pair[1].length === 0) {
      currentKey = pair[2];
      meta[currentKey] = pair[3].trim();
    } else if (currentKey && line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, "").trim();
      if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
      meta[currentKey].push(value);
    }
  }
  // Also extract commonly nested fields (title, module, description, duration, level)
  // regardless of indentation depth — the labs nest them under `lab:`.
  for (const field of ["title", "module", "description", "duration", "level"]) {
    if (!meta[field]) {
      const nested = match[1].match(new RegExp(`^\\s+${field}:\\s*(.+)$`, "m"));
      if (nested) meta[field] = nested[1].trim();
    }
  }
  return { meta, body: text.slice(match[0].length) };
}

function parseBlocks(body) {
  const blocks = [];
  const lines = body.split(/\r?\n/);
  let paragraph = [];
  let code = null; // { lang, lines }
  let list = null; // { ordered, items: string[] }
  let quote = [];
  let table = null; // { rows: string[][] }

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "p", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({ type: list.ordered ? "ol" : "ul", items: list.items });
      list = null;
    }
  };
  const flushQuote = () => {
    if (quote.length) {
      blocks.push({ type: "note", text: quote.join(" ").trim() });
      quote = [];
    }
  };
  const flushTable = () => {
    if (table) {
      blocks.push({ type: "table", rows: table.rows });
      table = null;
    }
  };
  const flushAll = () => { flushParagraph(); flushList(); flushQuote(); flushTable(); };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");

    if (code !== null) {
      if (/^```/.test(line)) { blocks.push({ type: "code", lang: code.lang, text: code.lines.join("\n") }); code = null; }
      else code.lines.push(rawLine);
      continue;
    }

    const fence = line.match(/^```(\S*)\s*$/);
    if (fence) { flushAll(); code = { lang: fence[1] || "", lines: [] }; continue; }

    if (!line.trim()) { flushAll(); continue; }

    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushAll();
      const level = Math.min(heading[1].length + 1, 4); // demote: the page supplies the h1
      blocks.push({ type: `h${level}`, text: heading[2].trim() });
      continue;
    }

    const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
    if (image) { flushAll(); blocks.push({ type: "image", alt: image[1], href: image[2] }); continue; }

    if (/^>\s?/.test(line)) {
      flushParagraph(); flushList(); flushTable();
      quote.push(line.replace(/^>\s?/, ""));
      continue;
    }

    const ordered = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (ordered) {
      flushParagraph(); flushQuote(); flushTable();
      if (!list || !list.ordered) { flushList(); list = { ordered: true, items: [] }; }
      list.items.push(ordered[2].trim());
      continue;
    }

    const unordered = line.match(/^\s*[-*+]\s+(.*)$/);
    if (unordered) {
      flushParagraph(); flushQuote(); flushTable();
      if (!list || list.ordered) { flushList(); list = { ordered: false, items: [] }; }
      list.items.push(unordered[1].trim());
      continue;
    }

    if (/^\|.*\|$/.test(line)) {
      flushParagraph(); flushList(); flushQuote();
      const cells = line.split("|").slice(1, -1).map((cell) => cell.trim());
      if (cells.every((cell) => /^:?-{2,}:?$/.test(cell))) continue; // separator row
      if (!table) table = { rows: [] };
      table.rows.push(cells);
      continue;
    }

    flushList(); flushQuote(); flushTable();
    paragraph.push(line.trim());
  }
  flushAll();
  return blocks;
}

// ---------------------------------------------------------------------------
// Lessons from the MicrosoftLearning courseware clones
// ---------------------------------------------------------------------------

const TRACKS = [
  {
    track: "fabric-analytics",
    title: "Fabric analytics labs",
    repo: "MicrosoftLearning/mslearn-fabric",
    repoUrl: "https://github.com/MicrosoftLearning/mslearn-fabric",
    clone: path.join(CLONES, "MicrosoftLearning__mslearn-fabric"),
    base: "Instructions/Labs",
    kind: "lab",
  },
  {
    track: "power-bi",
    title: "Power BI data analyst labs & demos",
    repo: "MicrosoftLearning/PL-300-Microsoft-Power-BI-Data-Analyst",
    repoUrl: "https://github.com/MicrosoftLearning/PL-300-Microsoft-Power-BI-Data-Analyst",
    clone: path.join(CLONES, "MicrosoftLearning__PL-300-Microsoft-Power-BI-Data-Analyst"),
    base: "Instructions",
    kind: "lab+demo",
  },
];

const lessons = [];
let imageCount = 0;

for (const spec of TRACKS) {
  const dir = path.join(spec.clone, spec.base);
  const files = (await readdir(dir, { recursive: true }))
    .filter((f) => f.endsWith(".md"))
    .sort();
  for (const file of files) {
    const relative = `${spec.base}/${file.replaceAll("\\", "/")}`;
    const raw = await readFile(path.join(dir, file), "utf8");
    const { meta, body } = parseFrontmatter(raw);
    const blocks = parseBlocks(body);
    const folder = path.dirname(file).replaceAll("\\", "/");
    const name = path.basename(file, ".md");
    const slug = `${folder === "." ? "" : folder.replaceAll("/", "-") + "-"}${name}`.toLowerCase();
    const title = (meta.title && String(meta.title)) || name;

    // Rewrite image hrefs to their GitHub blob locations so figures stay reachable.
    for (const block of blocks) {
      if (block.type === "image") {
        const clean = block.href.replace(/^\.\//, "").split("#")[0];
        block.href = `${spec.repoUrl}/blob/main/${spec.base}/${folder === "." ? "" : folder + "/"}${clean}`;
        imageCount += 1;
      }
    }

    lessons.push({
      track: spec.track,
      slug,
      sourcePath: relative,
      githubUrl: `${spec.repoUrl}/blob/main/${relative}`,
      title,
      module: meta.module ? String(meta.module) : null,
      description: meta.description ? String(meta.description) : null,
      duration: meta.duration ? String(meta.duration) : null,
      level: meta.level ? String(meta.level) : null,
      kind: folder.toLowerCase().includes("demo") ? "demo" : "lab",
      blocks,
    });
  }
}

const uniqueSlugs = new Set(lessons.map((lesson) => `${lesson.track}/${lesson.slug}`));
if (uniqueSlugs.size !== lessons.length) throw new Error("duplicate lesson slugs");
const empty = lessons.filter((lesson) => lesson.blocks.length === 0);
if (empty.length) throw new Error(`lessons with no content: ${empty.map((l) => l.slug).join(", ")}`);

const lessonsDoc = {
  kind: "hansa-corpus-academy-lessons",
  generatedAt: new Date().toISOString(),
  license: "MIT",
  attribution: "Mirrored from the open MicrosoftLearning courseware repositories (MIT). Microsoft authors the content; this site republishes it under the license with attribution and source links, unmodified except for formatting.",
  sources: TRACKS.map((spec) => ({ repo: spec.repo, url: spec.repoUrl, license: "MIT" })),
  tracks: TRACKS.map((spec) => ({
    track: spec.track,
    title: spec.title,
    repo: spec.repo,
    repoUrl: spec.repoUrl,
    lessons: lessons.filter((lesson) => lesson.track === spec.track),
  })),
};
await mkdir(path.join(ROOT, "content/academy"), { recursive: true });
await writeFile(path.join(ROOT, "content/academy/lessons.json"), `${JSON.stringify(lessonsDoc)}\n`, "utf8");

// ---------------------------------------------------------------------------
// Question banks → disabled review drafts (no answer keys shipped)
// ---------------------------------------------------------------------------

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

// --- kengio DP-700 mock banks (MIT) ---
const KENGIO = path.join(CLONES, "kengio__dp-700-study-guide", "practice", "data");
const kengioQuestions = [];
for (const file of ["dp-700-mock-1.json", "dp-700-mock-2.json", "dp-700-mock-3.json"]) {
  const mock = await readJson(path.join(KENGIO, file));
  mock.questions.forEach((question, index) => {
    kengioQuestions.push({
      draftId: `kengio-${question.id}`,
      sourceId: question.id,
      type: "single",
      topic: question.domain,
      num: index + 1,
      difficulty: question.difficulty ?? null,
      stem: question.question,
      options: Object.entries(question.choices ?? {}).map(([id, text]) => ({ id, text: String(text) })),
      gradingEnabled: false,
    });
  });
}
const kengioBank = {
  kind: "hansa-draft-bank",
  version: 1,
  bank: "kengio-dp700",
  exam: "DP-700",
  status: "REVIEW",
  statusLabel: "Community bank (MIT) — grading off; answer keys stay at the source",
  gradingEnabled: false,
  answersShipped: false,
  note: "Community-authored DP-700 practice questions from the MIT-licensed kengio/dp-700-study-guide repository, mirrored without their answer keys or explanations. The keys exist at the MIT source for reviewers; this site never presents them as validated. Hansa authored none of these questions.",
  source: {
    archive: "kengio/dp-700-study-guide (GitHub, MIT license)",
    verifier: "CORPUS_HARVEST_CLONE",
    release: "COMMUNITY_BANK_UNVALIDATED_REVIEW_ONLY",
    note: "License permits redistribution with attribution. Answer keys are deliberately not shipped: community keys are never presented as validated.",
  },
  questions: kengioQuestions,
};

// --- corpus assessment candidates (keys absent at source) ---
const CANDIDATES = path.resolve(arg("candidates", "../hansa-integration/data/questions/candidate_pool.jsonl"));
const candidateLines = (await readFile(CANDIDATES, "utf8")).trim().split("\n").filter((line) => line.trim());
const candidateQuestions = [];
let duplicateCandidates = 0;
for (const line of candidateLines) {
  const candidate = JSON.parse(line);
  const draftId = `corpus-${candidate.candidate_id}`;
  // The harvested assessments repeat items across files; keep the first occurrence.
  if (candidateQuestions.some((question) => question.draftId === draftId)) { duplicateCandidates += 1; continue; }
  candidateQuestions.push({
    draftId: `corpus-${candidate.candidate_id}`,
    sourceId: candidate.candidate_id,
    type: candidate.type === "multi" ? "multi" : "single",
    topic: candidate.topic ?? "Unspecified",
    num: candidateQuestions.length + 1,
    difficulty: candidate.difficulty ?? null,
    stem: candidate.prompt,
    options: (candidate.options ?? []).map((option, optionIndex) => ({
      id: option.id ?? String.fromCharCode(65 + optionIndex),
      text: typeof option === "string" ? option : option.text ?? "",
    })),
    gradingEnabled: false,
  });
}
const candidateBank = {
  kind: "hansa-draft-bank",
  version: 1,
  bank: "corpus-candidates",
  exam: "Corpus intake",
  status: "REVIEW",
  statusLabel: "Corpus assessment candidates — answer keys absent at source",
  gradingEnabled: false,
  answersShipped: false,
  note: "Question-like items extracted by the deep-research pipeline from community assessment sources. Prompts and options are as harvested; no answer keys, explanations or rationales exist at source (correct: [] in the prepared data). Any keying would be Hansa authorship and stays out until a human subject-matter review exists.",
  source: {
    archive: "hansa-integration/data/questions/candidate_pool.jsonl (deep-research corpus distillation)",
    verifier: "CORPUS_PREPARED_DATA",
    release: "CANDIDATES_UNKEYED_REVIEW_ONLY",
    note: "Integration plan section 4/6: the corpus assessments collection is unvalidated community material, integrated for review only.",
  },
  questions: candidateQuestions,
};

for (const bank of [kengioBank, candidateBank]) {
  const ids = new Set(bank.questions.map((question) => question.draftId));
  if (ids.size !== bank.questions.length) throw new Error(`duplicate draft ids in ${bank.bank}`);
  for (const question of bank.questions) {
    if (!question.stem?.trim()) throw new Error(`empty stem in ${bank.bank}/${question.draftId}`);
    if (question.options.length < 2) throw new Error(`too few options in ${bank.bank}/${question.draftId}`);
    for (const key of ["correctAnswer", "explanation", "shortAnswer", "correct", "why"]) {
      if (key in question) throw new Error(`answer field "${key}" present in ${bank.bank}/${question.draftId}`);
    }
  }
}

await mkdir(path.join(ROOT, "content/drafts"), { recursive: true });
await writeFile(path.join(ROOT, "content/drafts/kengio-dp700.json"), `${JSON.stringify(kengioBank)}\n`, "utf8");
await writeFile(path.join(ROOT, "content/drafts/corpus-candidates.json"), `${JSON.stringify(candidateBank)}\n`, "utf8");

console.log(`lessons extracted: ${lessons.length} (images relinked: ${imageCount})`);
console.log(`kengio questions: ${kengioQuestions.length} | corpus candidates: ${candidateQuestions.length}`);
