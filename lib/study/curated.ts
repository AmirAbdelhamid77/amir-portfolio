// Typed accessors for the curated study-hub layers built by
// scripts/build-study-catalogue.mjs from the Hansa Deep Research Corpus
// distillation. The builder validates placement against its taxonomy mirror;
// this module re-validates against the real taxonomy at import time so a
// drifted content file stops the build.
//
// Server-only: every importer renders on the server or in the sitemap. The
// content files are read through node:fs instead of JSON imports so the node
// test runner (`npm run test:content`) can import this module without path
// aliases or import attributes; `next build` executes it from the repo root.
import { readFileSync } from "node:fs";
import path from "node:path";
import { SUBJECTS, type StudyRecord, type SubjectId } from "./taxonomy.ts";

type SubjectTopics = { [K in SubjectId]: readonly string[] };

const validTopics: SubjectTopics = SUBJECTS.reduce((acc, subject) => {
  acc[subject.id] = subject.topics.map(([id]) => id);
  return acc;
}, {} as SubjectTopics);

function assertPlacement(subject: string, topic: string, id: string): asserts subject is SubjectId {
  const topics = validTopics[subject as SubjectId];
  if (!topics) throw new Error(`Curated study record ${id}: unknown subject ${subject}`);
  if (!topics.includes(topic)) throw new Error(`Curated study record ${id}: topic ${topic} is not valid for subject ${subject}`);
}

function readJson<T>(relative: string): T {
  return JSON.parse(readFileSync(path.join(process.cwd(), relative), "utf8")) as T;
}

type CuratedReference = {
  id: string; title: string; href: string; subject: string; topic: string;
  context: string; language: string; source: string; basis: string; status: string;
};

type CuratedLab = {
  slug: string; catalogueId: string; title: string; subject: string; topic: string;
  summary: string; environment: string | null; prerequisites: string[]; steps: string[];
  expectedOutputs: string[]; validationChecks: string[]; assets: string[]; assetCount: number;
  license: string; rightsClass: string; sourceUrl: string; corpusLabId: string | null;
  corpusModuleId: string | null; titleSource: string; originNote: string; basis: string;
};

export const REFERENCE_RECORDS: StudyRecord[] = readJson<{ records: CuratedReference[] }>(
  "content/study/references.json",
).records.map((r) => {
  assertPlacement(r.subject, r.topic, r.id);
  return {
    id: r.id,
    title: r.title,
    href: r.href,
    subject: r.subject,
    topic: r.topic,
    kind: "reference",
    context: r.context,
    language: r.language,
    source: r.source,
    basis: r.basis,
    status: r.status,
  };
});

export type HandsOnLab = Omit<CuratedLab, "subject"> & { subject: SubjectId };

export const HANDS_ON_LABS: HandsOnLab[] = readJson<{ labs: CuratedLab[] }>(
  "content/study/experiments.json",
).labs.map((lab) => {
  assertPlacement(lab.subject, lab.topic, lab.catalogueId);
  return { ...lab, environment: lab.environment ?? "Source repository (environment not recorded)", subject: lab.subject as SubjectId };
});

export const handsOnLabHref = (lab: { slug: string }) => `/lab/hands-on/${lab.slug}/`;

export const HANDS_ON_RECORDS: StudyRecord[] = HANDS_ON_LABS.map((lab): StudyRecord => ({
  id: lab.catalogueId,
  title: lab.title,
  href: handsOnLabHref(lab),
  subject: lab.subject,
  topic: lab.topic,
  kind: "experiment",
  context: lab.summary || `${lab.environment} — hands-on lab from the source repository below.`,
  language: "en",
  source: `Hansa Deep Research Corpus / ${lab.corpusLabId ?? lab.slug} · ${lab.license}`,
  basis: lab.basis,
  status: `${lab.originNote} Rights class ${lab.rightsClass} (license ${lab.license}). No live Fabric execution is claimed; the source repository stays authoritative.`,
}));
