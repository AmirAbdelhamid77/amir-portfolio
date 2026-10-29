// Integrity tests for the curated study-hub layers (Hansa Deep Research Corpus
// integration). These guard the data contracts the study hub and the hands-on
// lab pages rely on: valid subject/topic placement against the REAL taxonomy,
// unique ids, honest rights classes and external links that stay links.
//
//   npm run test:content
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { register } from "node:module";
import { test } from "node:test";
// The study catalogue resolves through the same loader hook the sql-vault test
// registers: it understands @/ aliases, .ts/.tsx modules and JSON imports.
register("../../scripts/study-loader.mjs", import.meta.url);
import { SUBJECTS } from "../../lib/study/taxonomy.ts";
import { HANDS_ON_LABS, REFERENCE_RECORDS } from "../../lib/study/curated.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const topics = new Map(SUBJECTS.map((subject) => [subject.id, subject.topics.map(([id]) => id)]));
const referencesJson = JSON.parse(readFileSync(path.join(ROOT, "content/study/references.json"), "utf8"));

test("reference records are placed on real subject desks", () => {
  assert.ok(REFERENCE_RECORDS.length >= 1000, "the curated reference layer stays substantial");
  for (const record of REFERENCE_RECORDS) {
    assert.equal(record.kind, "reference", `${record.id} is a reference record`);
    assert.ok(topics.get(record.subject)?.includes(record.topic), `${record.id} places ${record.subject}/${record.topic} on a real desk`);
  }
});

test("every fabric module desk gains reference material", () => {
  const fabricTopics = topics.get("fabric").filter((topic) => topic !== "overview");
  for (const topic of fabricTopics) {
    const count = REFERENCE_RECORDS.filter((r) => r.subject === "fabric" && r.topic === topic).length;
    assert.ok(count > 0, `fabric/${topic} has ${count} reference records — acceptance requires > 0`);
  }
});

test("reference ids, URLs and provenance are intact", () => {
  const ids = new Set();
  const urls = new Set();
  for (const record of REFERENCE_RECORDS) {
    assert.ok(!ids.has(record.id), `duplicate reference id ${record.id}`);
    ids.add(record.id);
    assert.ok(/^https:\/\//.test(record.href), `${record.id} links to https`);
    assert.ok(!urls.has(record.href), `duplicate reference URL ${record.href}`);
    urls.add(record.href);
    assert.ok(record.source.includes("corpus "), `${record.id} keeps its corpus id in the source field`);
    assert.match(record.status, /Rights class (LINK_ONLY|REDISTRIBUTABLE)/, `${record.id} states its rights class`);
    assert.ok(record.context.length <= 360, `${record.id} gloss fits the rendered context length`);
  }
});

test("no exam-prep or answer-key source survives curation", () => {
  const banned = /certiace\.com|msfthub\.com|kengio\.github\.io/;
  for (const record of REFERENCE_RECORDS) {
    assert.ok(!banned.test(record.href), `${record.id} links to a rejected exam-prep/answer-key domain`);
  }
});

test("the curation ledger accounts for every input record", () => {
  const { curated, input, duplicates, rejections } = referencesJson.meta;
  const rejectedTotal = Object.values(rejections).reduce((sum, n) => sum + n, 0);
  assert.equal(curated + rejectedTotal, input, "curated + rejected must equal the input record count");
  assert.ok(duplicates >= 0);
  assert.equal(curated, REFERENCE_RECORDS.length, "published layer matches the meta count");
});

test("hands-on labs carry license, provenance and a real source", () => {
  assert.ok(HANDS_ON_LABS.length >= 20, "the hands-on layer stays substantial");
  const slugs = new Set();
  for (const lab of HANDS_ON_LABS) {
    assert.ok(!slugs.has(lab.slug), `duplicate lab slug ${lab.slug}`);
    slugs.add(lab.slug);
    assert.equal(lab.rightsClass, "REDISTRIBUTABLE", `${lab.slug} must be redistributable`);
    assert.ok(lab.license, `${lab.slug} names its license`);
    assert.ok(/^https:\/\/github\.com\//.test(lab.sourceUrl), `${lab.slug} points at its source repository`);
    assert.ok(lab.corpusLabId, `${lab.slug} keeps its corpus lab id`);
    assert.ok(topics.get(lab.subject)?.includes(lab.topic), `${lab.slug} places ${lab.subject}/${lab.topic} on a real desk`);
    assert.ok(lab.environment, `${lab.slug} states its environment`);
  }
});

test("mslearn-fabric labs carry recovered titles, not folder names", () => {
  for (const lab of HANDS_ON_LABS.filter((item) => item.sourceUrl.includes("mslearn-fabric"))) {
    assert.ok(!/^00?-?\s|^[0-9]{2}[a-d]? \b|^Lab LAB-|^Assets$|^Starter$|^sample-data/i.test(lab.title) || lab.titleSource === "human-pass (instruction YAML)",
      `${lab.slug} title "${lab.title}" looks like a folder name`);
    assert.ok(lab.title.length >= 12, `${lab.slug} title is descriptive`);
  }
});

test("study record ids never collide across the catalogue", async () => {
  const { studyRecords } = await import("../../lib/study/server.ts");
  const records = studyRecords();
  const ids = new Set();
  for (const record of records) {
    assert.ok(!ids.has(record.id), `duplicate study record id ${record.id}`);
    ids.add(record.id);
  }
  assert.ok(records.filter((r) => r.id.startsWith("hands-on-")).length === HANDS_ON_LABS.length,
    "every published lab appears exactly once in the catalogue");
  assert.ok(records.some((r) => r.id.startsWith("ref-doc-")), "references joined the catalogue");
});
