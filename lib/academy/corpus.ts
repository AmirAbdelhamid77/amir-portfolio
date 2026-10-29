// Typed accessors for the corpus Academy lessons extracted by
// scripts/extract-corpus-courseware.mjs from the MIT-licensed
// MicrosoftLearning courseware clones. Server-only: renders on the server or
// in the sitemap; the content file is read through node:fs so the node test
// runner can import this module without path aliases or import attributes.
import { readFileSync } from "node:fs";
import path from "node:path";

function readJson<T>(relative: string): T {
  return JSON.parse(readFileSync(path.join(process.cwd(), relative), "utf8")) as T;
}

export type LessonBlock =
  | { type: "p" | "note" | "h2" | "h3" | "h4"; text: string }
  | { type: "code"; lang: string; text: string }
  | { type: "ol" | "ul"; items: string[] }
  | { type: "table"; rows: string[][] }
  | { type: "image"; alt: string; href: string };

export type CorpusLesson = {
  track: string;
  slug: string;
  sourcePath: string;
  githubUrl: string;
  title: string;
  module: string | null;
  description: string | null;
  duration: string | null;
  level: string | null;
  kind: "lab" | "demo";
  blocks: LessonBlock[];
};

export type CorpusTrack = {
  track: string;
  title: string;
  repo: string;
  repoUrl: string;
  lessons: CorpusLesson[];
};

type LessonsDoc = {
  kind: string;
  license: string;
  attribution: string;
  sources: { repo: string; url: string; license: string }[];
  tracks: CorpusTrack[];
};

const doc = readJson<LessonsDoc>("content/academy/lessons.json");
if (doc.kind !== "hansa-corpus-academy-lessons") throw new Error("unexpected academy content file");
if (doc.license !== "MIT") throw new Error("Academy lessons must be MIT-licensed content");

export const ACADEMY_ATTRIBUTION = doc.attribution;
export const ACADEMY_TRACKS: CorpusTrack[] = doc.tracks;
export const ACADEMY_LESSONS: CorpusLesson[] = doc.tracks.flatMap((track) => track.lessons);

export const academyLessonHref = (lesson: CorpusLesson) => `/learn/academy/${lesson.track}/${lesson.slug}/`;

export function getAcademyLesson(track: string, slug: string): CorpusLesson | undefined {
  return ACADEMY_LESSONS.find((lesson) => lesson.track === track && lesson.slug === slug);
}

export function getAcademyTrack(track: string): CorpusTrack | undefined {
  return ACADEMY_TRACKS.find((entry) => entry.track === track);
}
