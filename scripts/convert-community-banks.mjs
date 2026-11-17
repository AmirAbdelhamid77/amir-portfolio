// Convert the Howard Ginsburg (MIT) and Patrick Wiloak (CC BY 4.0) community
// question banks into Hansa pack format for the import pipeline.
//
//   node scripts/convert-community-banks.mjs
//
// Reads the fetched source files and writes LAB_PACKS.merged.json +
// SOURCES.merged.json for each pack. Answer keys are preserved from the
// source; the provenance strings make clear that Hansa did not author or
// independently validate them.

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = path.join(ROOT, "content/intake/hansa-integration/packs");

// -----------------------------------------------------------------------
// Howard Ginsburg — JSON, MIT, 120 questions
// -----------------------------------------------------------------------

async function convertHoward() {
  const raw = await readFile(path.join(BASE, "howard-dp600/source.json"), "utf8");
  const source = JSON.parse(raw);
  const scenarios = source.scenarios ?? {};
  const questions = [];

  for (const q of source.questions) {
    const scenario = q.scenario_id ? (scenarios[q.scenario_id] ?? "") : "";
    const correctIds = Array.isArray(q.answer) ? q.answer : [q.answer];

    const options = (q.options ?? []).map(opt => {
      const isCorrect = correctIds.includes(opt.id);
      const why = isCorrect
        ? "Matches the source answer key. " + (q.explanation ? q.explanation.slice(0, 200) : "")
        : "Not the source answer key. See the question-level explanation for the reasoning.";
      return { id: opt.id, text: opt.text, why };
    });

    // Map Howard's type to Hansa type
    const type = q.type === "multi" ? "multi" : "single";

    // Build a short title from the stem
    const title = q.stem.replace(/<[^>]*>/g, "").split(/[.?!\n]/)[0].trim().slice(0, 80) || q.id;

    // Collect unique URLs for refs
    const urls = new Set();
    for (const ref of q.refs ?? []) urls.add(ref);
    const refKeys = [...urls].map((url, i) => `howard-ref-${q.id.toLowerCase()}-${i}`);

    questions.push({
      id: `HOWARD-${q.id.toUpperCase()}`,
      topic: q.domain_title ?? "DP-600",
      title,
      prompt: q.stem,
      type,
      options,
      correct: correctIds,
      explanation: q.explanation ?? "",
      videoSeconds: null,
      refs: refKeys,
      code: "",
      origin: "foundation",
      difficulty: null,
      scenario: scenario ? { title: `Scenario ${q.scenario_id}`, text: scenario } : undefined,
      importMetadata: {
        exam_objective: `Domain ${q.domain} > ${q.domain_title ?? ""}`,
        provenance: "Community-authored DP-600 practice questions by Howard Ginsburg (MIT License, howardginsburg/MicrosoftStudyGuides). Hansa did not author, review, or independently validate these questions or their answer keys. Reproduced under the MIT license with attribution.",
        validation: "Answer keys preserved verbatim from the source. Not independently validated by Hansa. Single extraction pass; treat as community practice material, not doctrine.",
      },
      _refUrls: [...urls].map((url, i) => ({ key: refKeys[i], url, title: `Reference ${i + 1} for ${q.id}` })),
    });
  }

  // Collect all unique ref URLs into a registry
  const registry = {
    "howard-source-repo": ["Howard Ginsburg — MicrosoftStudyGuides (MIT)", "https://github.com/howardginsburg/MicrosoftStudyGuides"],
    "howard-dp600-study-guide": ["Current Microsoft DP-600 study guide", "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-600"],
  };
  for (const q of questions) {
    for (const ref of q._refUrls) {
      if (!registry[ref.key]) registry[ref.key] = [ref.title, ref.url];
    }
  }
  // Clean up internal _refUrls
  for (const q of questions) delete q._refUrls;

  return { key: "howard-dp600", label: "Howard Ginsburg DP-600 (MIT)", questions, registry,
    description: "120 community-authored DP-600 practice questions by Howard Ginsburg, published under the MIT License. Grounded in public Microsoft Learn documentation. Hansa did not author, review, or independently validate these questions. Mirrored with attribution under the MIT license." };
}

// -----------------------------------------------------------------------
// Patrick Wiloak — Markdown, CC BY 4.0, 30 questions
// -----------------------------------------------------------------------

async function convertPatrick() {
  const raw = await readFile(path.join(BASE, "patrick-dp600/source.md"), "utf8");
  const questions = [];

  // Split into question blocks
  const blocks = raw.split(/^### Question /m).slice(1);

  for (const block of blocks) {
    const lines = block.split("\n");
    const number = parseInt(lines[0].trim(), 10) || questions.length + 1;

    // Extract domain tag if present
    const domainMatch = block.match(/Domain\s+(\d)/i);
    const domain = domainMatch ? Number(domainMatch[1]) : 0;
    const domainTitle = { 1: "Maintain a data analytics solution", 2: "Prepare data", 3: "Implement and manage semantic models" }[domain] ?? "DP-600";

    // Extract scenario (text before options)
    const optionStart = lines.findIndex(l => /^[A-D][.)]\s/.test(l.trim()));
    if (optionStart === -1) continue;

    // Scenario: lines between the question number line and the first option
    // Skip the "Scenario:" prefix if present
    let scenarioText = "";
    const scenarioMatch = block.match(/\*\*Scenario:\*\*\s*([\s\S]*?)(?=\n[A-D][.)]|\n###|$)/);
    if (scenarioMatch) scenarioText = scenarioMatch[1].trim();

    // The stem is the first non-scenario line before options
    // Actually the stem is the first line after the question number (before Scenario)
    let stem = "";
    for (let i = 1; i < optionStart; i++) {
      const line = lines[i]?.trim();
      if (!line || line.startsWith("**Scenario:**") || line === scenarioText) continue;
      if (!stem) stem = line;
    }
    if (!stem) {
      // Fallback: first line
      stem = lines[1]?.trim() ?? `Question ${number}`;
    }

    // Extract options A-D
    const options = [];
    for (let i = optionStart; i < lines.length; i++) {
      const match = lines[i].match(/^([A-D])[.)]\s+(.*)/);
      if (match) {
        // Collect continuation lines
        let text = match[2];
        for (let j = i + 1; j < lines.length; j++) {
          if (/^[A-D][.)]\s/.test(lines[j].trim()) || lines[j].startsWith("<details") || lines[j].trim() === "") break;
          text += " " + lines[j].trim();
        }
        options.push({ id: match[1], text: text.trim(), why: "" });
      }
    }

    // Extract correct answer and explanation from the details block
    const details = block.match(/<details>[\s\S]*?<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/);
    let correctAnswer = "";
    let explanation = "";
    if (details) {
      const summary = details[1].trim();
      const body = details[2].trim();
      // Summary typically has the correct letter(s)
      const answerMatch = summary.match(/([A-D](?:\s*(?:,|and)\s*[A-D])*)/);
      if (answerMatch) correctAnswer = answerMatch[1];
      // Body has the Why explanation
      const whyMatch = body.match(/\*\*Why:?\*\*\s*([\s\S]*)/i) ?? body.match(/Why:?\s*([\s\S]*)/i);
      explanation = whyMatch ? whyMatch[1].trim() : body;
    }

    if (!correctAnswer) continue; // skip if no answer found
    const correct = correctAnswer.match(/[A-D]/g) ?? [];

    // Add why to each option
    for (const opt of options) {
      if (correct.includes(opt.id)) {
        opt.why = "Matches the source answer key. " + (explanation ? explanation.slice(0, 200) : "");
      } else {
        opt.why = "Not the source answer key. See the question-level explanation for the reasoning.";
      }
    }

    // Build title from stem
    const title = stem.replace(/<[^>]*>/g, "").split(/[.?!\n]/)[0].trim().slice(0, 80) || `Question ${number}`;

    // Find inline links for refs
    const urlMatches = [...block.matchAll(/\((https?:\/\/[^)]+)\)/g)].map(m => m[1]);
    const uniqueUrls = [...new Set(urlMatches)].filter(u => !u.includes("datatalks.club") && !u.includes("linkedin.com"));
    const refKeys = uniqueUrls.map((_, i) => `patrick-ref-${number}-${i}`);

    questions.push({
      id: `PATRICK-${String(number).padStart(3, "0")}`,
      topic: domainTitle,
      title,
      prompt: stem,
      type: "single",
      options,
      correct,
      explanation: explanation || "",
      videoSeconds: null,
      refs: refKeys.length ? refKeys : ["patrick-source-repo"],
      code: "",
      origin: "foundation",
      difficulty: null,
      scenario: scenarioText ? { title: `Scenario for question ${number}`, text: scenarioText } : undefined,
      importMetadata: {
        exam_objective: domain > 0 ? `Domain ${domain} > ${domainTitle}` : "DP-600",
        provenance: "Community-authored DP-600 practice questions by Patrick Wiloak (CC BY 4.0, PatrickWiloak/data-zero-to-hero). Hansa did not author, review, or independently validate these questions or their answer keys. Reproduced under the CC BY 4.0 license with attribution.",
        validation: "Answer keys preserved verbatim from the source. Not independently validated by Hansa. Single extraction pass; treat as community practice material, not doctrine.",
      },
      _refUrls: uniqueUrls.map((url, i) => ({ key: refKeys[i] ?? `patrick-ref-${number}-${i}`, url, title: `Reference ${i + 1}` })),
    });
  }

  // Registry
  const registry = {
    "patrick-source-repo": ["Patrick Wiloak — data-zero-to-hero (CC BY 4.0)", "https://github.com/PatrickWiloak/data-zero-to-hero"],
    "patrick-dp600-study-guide": ["Current Microsoft DP-600 study guide", "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/dp-600"],
  };
  for (const q of questions) {
    for (const ref of q._refUrls ?? []) {
      if (!registry[ref.key]) registry[ref.key] = [ref.title, ref.url];
    }
  }
  for (const q of questions) delete q._refUrls;

  return { key: "patrick-dp600", label: "Patrick Wiloak DP-600 (CC BY 4.0)", questions, registry,
    description: "30 community-authored DP-600 practice questions by Patrick Wiloak, published under the CC BY 4.0 license. Grounded in the official exam skills outline. Hansa did not author, review, or independently validate these questions. Mirrored with attribution under the CC BY 4.0 license." };
}

// -----------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------

const howard = await convertHoward();
const patrick = await convertPatrick();

for (const pack of [howard, patrick]) {
  const dir = path.join(BASE, pack.key);
  await mkdirSafe(dir);

  const packDoc = {
    [pack.key]: {
      label: pack.label,
      description: pack.description,
      questions: pack.questions,
    },
  };
  await writeFile(path.join(dir, "LAB_PACKS.merged.json"), JSON.stringify(packDoc, null, 1) + "\n", "utf8");
  await writeFile(path.join(dir, "SOURCES.merged.json"), JSON.stringify(pack.registry, null, 1) + "\n", "utf8");

  const flat = pack.questions.map(q => ({
    id: q.id, sourceId: q.id, pack: pack.key, topic: q.topic, title: q.title,
    prompt: q.prompt, type: q.type, options: q.options, correct: q.correct,
    explanation: q.explanation, code: q.code || "",
  }));
  await writeFile(path.join(dir, "QUESTION_BANK.merged.json"), JSON.stringify(flat) + "\n", "utf8");

  const map = pack.questions.map(q => ({
    source: "hansa-corpus-" + pack.key,
    source_id: q.id,
    website_id: "fb-" + q.id.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    pack: pack.key,
  }));
  await writeFile(path.join(dir, "ID_MAPPING.json"), JSON.stringify(map, null, 1) + "\n", "utf8");

  await writeFile(path.join(dir, "QA_REPORT.json"), JSON.stringify({
    status: "community-bank-mirrored-2026-10-30",
    runtime_checks_passed: "not-applicable (community bank mirrored with attribution, no package runtime)",
    total_questions: pack.questions.length,
    packs: 1,
    website_questions: pack.questions.length,
    added_questions: pack.questions.length,
    five_option_questions: 0,
  }, null, 1) + "\n", "utf8");

  console.log(`${pack.key}: ${pack.questions.length} questions, ${Object.keys(pack.registry).length} registry entries`);
}

async function mkdirSafe(dir) {
  const { mkdir } = await import("node:fs/promises");
  await mkdir(dir, { recursive: true });
}
