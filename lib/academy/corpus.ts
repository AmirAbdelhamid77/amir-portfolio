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

// R4: the courseware markdown points at `./Images/...` and
// `Linked_image_Files/...` beside its source file. Those paths are not copied
// into this repository, so an unchanged href becomes a 404 on the exported
// page. Resolve every relative link against the lesson's source directory and
// point it at the same file in the MIT-licensed courseware repository. The
// GitHub blob page shows the image without rehosting it, which is the rights
// position the lesson footer already states.
const LEARN_BASE = "https://learn.microsoft.com/en-us";

export function resolveAcademyHref(href: string, sourcePath: string, repoUrl: string): string {
  if (/^(https?:|mailto:|#)/.test(href)) return href;
  // The DAX module links a Learn docs path without its host.
  if (href.startsWith("/")) return `${LEARN_BASE}${href}`;
  const [pathname, hash = ""] = href.split("#");
  const [clean, query = ""] = pathname.split("?");
  const resolved = path.posix.normalize(
    path.posix.join(path.posix.dirname(sourcePath), clean),
  );
  const suffix = `${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
  return `${repoUrl}/blob/main/${encodeURI(resolved)}${suffix}`;
}

function resolveInline(text: string, sourcePath: string, repoUrl: string): string {
  return text.replace(
    /(!?\[[^\]]*\]\()([^)]+)(\))/g,
    (_match, open: string, href: string, close: string) =>
      `${open}${resolveAcademyHref(href, sourcePath, repoUrl)}${close}`,
  );
}

function resolveBlock(
  block: LessonBlock,
  sourcePath: string,
  repoUrl: string,
): LessonBlock {
  if (block.type === "image") {
    return { ...block, href: resolveAcademyHref(block.href, sourcePath, repoUrl) };
  }
  if ("text" in block) return { ...block, text: resolveInline(block.text, sourcePath, repoUrl) };
  if ("items" in block) {
    return { ...block, items: block.items.map((item) => resolveInline(item, sourcePath, repoUrl)) };
  }
  if ("rows" in block) {
    return {
      ...block,
      rows: block.rows.map((row) =>
        row.map((cell) => resolveInline(cell, sourcePath, repoUrl)),
      ),
    };
  }
  return block;
}

const resolvedTracks: CorpusTrack[] = doc.tracks.map((track) => ({
  ...track,
  lessons: track.lessons.map((lesson) => ({
    ...lesson,
    blocks: lesson.blocks.map((block) =>
      resolveBlock(block, lesson.sourcePath, track.repoUrl),
    ),
  })),
}));

export const ACADEMY_ATTRIBUTION = doc.attribution;
export const ACADEMY_TRACKS: CorpusTrack[] = resolvedTracks;
export const ACADEMY_LESSONS: CorpusLesson[] = resolvedTracks.flatMap((track) => track.lessons);

export const academyLessonHref = (lesson: CorpusLesson) => `/learn/academy/${lesson.track}/${lesson.slug}/`;

export function getAcademyLesson(track: string, slug: string): CorpusLesson | undefined {
  return ACADEMY_LESSONS.find((lesson) => lesson.track === track && lesson.slug === slug);
}

export function getAcademyTrack(track: string): CorpusTrack | undefined {
  return ACADEMY_TRACKS.find((entry) => entry.track === track);
}
