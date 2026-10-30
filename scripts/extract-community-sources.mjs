// Extract questions from the five unlicensed community sources into
// review-only draft banks. No answer keys are shipped.
//
//   node scripts/extract-community-sources.mjs

import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMMUNITY = path.join(ROOT, "content/intake/community");
const STARK = path.join(process.env.LOCALAPPDATA ?? COMMUNITY, "Temp", "dp600-stark-v2-main");

// ---------------------------------------------------------------------------
// 1. chaturcr48 (71 questions, JSON)
// ---------------------------------------------------------------------------

async function extractChaturcr48() {
  const raw = await readFile(path.join(COMMUNITY, "chaturcr48/questions.json"), "utf8");
  const data = JSON.parse(raw);
  return (data.questions ?? []).map((q, index) => ({
    draftId: `chatur-${q.id ?? index}`,
    sourceId: q.id ?? `q${index}`,
    type: "single",
    topic: "DP-600",
    num: index + 1,
    stem: q.question ?? "",
    options: (q.options ?? []).map((opt, i) => ({
      id: String.fromCharCode(65 + i), text: String(opt),
    })),
    gradingEnabled: false,
  })).filter(q => q.stem.trim() && q.options.length >= 2);
}

// ---------------------------------------------------------------------------
// 2. Warren (filter to MCQ/multi from the embedded DP600_DATA)
// ---------------------------------------------------------------------------

async function extractWarren() {
  const html = await readFile(path.join(COMMUNITY, "warren/index.html"), "utf8");
  const match = html.match(/window\.DP600_DATA\s*=\s*(\{[\s\S]*?\});\s*\n/);
  if (!match) return [];
  const data = JSON.parse(match[1]);
  const convertible = new Set(["mcq", "multi"]);
  return (data.questions ?? [])
    .filter(q => convertible.has(q.type))
    .map((q, index) => ({
      draftId: `warren-${q.id ?? index}`,
      sourceId: q.id ?? `q${index}`,
      type: q.type === "multi" ? "multi" : "single",
      topic: `DP-600 domain ${q.topic ?? "?"}`,
      num: index + 1,
      difficulty: null,
      stem: q.stem ?? "",
      options: (q.options ?? []).map((opt, i) => ({
        id: String.fromCharCode(65 + i),
        text: typeof opt === "string" ? opt : opt.text ?? String(opt),
      })),
      gradingEnabled: false,
      warnings: (q.exhibits?.length ?? 0) > 0 ? ["May depend on an exhibit."] : [],
    }))
    .filter(q => q.stem.trim() && q.options.length >= 2);
}

// ---------------------------------------------------------------------------
// 3. Stark V2 — line-by-line field extraction from TypeScript
// ---------------------------------------------------------------------------

function stripTS(text) {
  // Remove import lines, export keywords, and type annotations
  return text
    .split("\n")
    .filter(l => !l.startsWith("import ") && !l.startsWith('import {'))
    .join("\n");
}

function extractStarkQuestions(text, fileName) {
  const questions = [];
  // Find each single({...}) or multi({...}) block using brace counting
  const helperRegex = /\b(single|multi)\s*\(\s*\{/g;
  let match;
  while ((match = helperRegex.exec(text)) !== null) {
    const helper = match[1];
    const start = match.index + match[0].length - 1; // position of {
    // Brace-count to find the matching close
    let depth = 0;
    let end = start;
    for (let i = start; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") { depth--; if (depth === 0) { end = i; break; } }
    }
    const block = text.slice(start, end + 1);

    // Extract fields with targeted regexes
    const id = block.match(/\bid:\s*['"]([^'"]+)['"]/)?.[1] ?? "";
    const prompt = block.match(/\bprompt:\s*'([\s\S]*?)',?\s*\n/)?.[1]
      ?? block.match(/\bprompt:\s*"([\s\S]*?)",?\s*\n/)?.[1] ?? "";
    const domain = block.match(/\bdomain:\s*'([^']+)'/)?.[1] ?? "DP-600";
    const subtopic = block.match(/\bsubtopic:\s*'([^']+)'/)?.[1] ?? "";
    const difficulty = block.match(/\bdifficulty:\s*(\d)/)?.[1] ?? null;
    const scenarioId = block.match(/\bscenarioId:\s*'([^']+)'/)?.[1] ?? null;

    // Extract options array (strings in square brackets)
    const optionsMatch = block.match(/\boptions:\s*\[([\s\S]*?)\]/);
    const options = [];
    if (optionsMatch) {
      // Parse string entries from the array
      const optTexts = optionsMatch[1].match(/'([^']*)'|"([^"]*)"/g) ?? [];
      optTexts.forEach((o, i) => {
        const cleaned = o.replace(/^['"]|['"]$/g, "").trim();
        if (cleaned) options.push({ id: String.fromCharCode(65 + i), text: cleaned });
      });
    }

    if (!prompt.trim() || options.length < 2) continue;

    questions.push({
      draftId: `stark-${id || `${fileName}-${questions.length}`}`,
      sourceId: id,
      type: helper === "multi" ? "multi" : "single",
      topic: domain,
      subtopic,
      num: questions.length + 1,
      difficulty: difficulty ? Number(difficulty) : null,
      stem: prompt.trim(),
      options,
      gradingEnabled: false,
      scenarioId,
    });
  }
  return questions;
}

async function extractStarkV2() {
  const questionDir = path.join(STARK, "src", "data", "questions");
  let files;
  try {
    files = (await readdir(questionDir)).filter(f => f.endsWith(".ts") && !f.startsWith("_") && f !== "index.ts" && f !== "meta.ts");
  } catch { return []; }

  const questions = [];
  for (const file of files) {
    const raw = await readFile(path.join(questionDir, file), "utf8");
    const text = stripTS(raw);
    const extracted = extractStarkQuestions(text, file.replace(".ts", ""));
    questions.push(...extracted);
  }
  return questions;
}

// ---------------------------------------------------------------------------
// Main — build draft banks
// ---------------------------------------------------------------------------

function toDraftBank(bank, exam, status, statusLabel, note, sourceInfo, questions) {
  return {
    kind: "hansa-draft-bank", version: 1, bank, exam,
    status, statusLabel,
    gradingEnabled: false, answersShipped: false,
    note, source: sourceInfo,
    questions,
  };
}

const chatur = await extractChaturcr48();
const warren = await extractWarren();
const stark = await extractStarkV2();

const banks = [
  toDraftBank("chaturcr48-dp600", "DP-600", "REVIEW",
    "NO LICENSE — community questions, review only",
    `${chatur.length} community DP-600 questions from chaturcr48/dp600_questions. No license — all rights reserved. Review only.`,
    { archive: "chaturcr48/dp600_questions (GitHub, no license)", verifier: "DIRECT_FETCH", release: "UNLICENSED_REVIEW_ONLY" },
    chatur),
  toDraftBank("warren-dp600", "DP-600", "REVIEW",
    "NO LICENSE — likely exam-dump content, review only",
    `${warren.length} MCQ/multi questions (from 222 total) from Warren-530/dp600-practice. Source: DP-600_en_with_discussion.pdf. No license. Do not redistribute.`,
    { archive: "Warren-530/dp600-practice (GitHub, no license)", verifier: "DIRECT_FETCH", release: "EXAM_DUMP_REVIEW_ONLY" },
    warren),
  toDraftBank("stark-v2-dp600", "DP-600", "REVIEW",
    "NO LICENSE — archived repo, review only",
    `${stark.length} questions from ${"mattamundson/dp600-stark-v2"} (archived, no license). Rich per-distractor content at origin.`,
    { archive: "mattamundson/dp600-stark-v2 (GitHub, no license, archived)", verifier: "CLONE_EXTRACT", release: "UNLICENSED_REVIEW_ONLY" },
    stark),
];

await mkdir(path.join(ROOT, "content/drafts"), { recursive: true });
for (const bank of banks) {
  await writeFile(path.join(ROOT, "content/drafts", `${bank.bank}.json`), JSON.stringify(bank) + "\n", "utf8");
  console.log(`${bank.bank}: ${bank.questions.length} questions`);
}
console.log(`Total review-only questions: ${banks.reduce((s, b) => s + b.questions.length, 0)}`);
