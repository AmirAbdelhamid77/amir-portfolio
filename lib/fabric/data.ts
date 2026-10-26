// Typed access to the generated Fabric content layer.
//
// Small, frequently used metadata (packs, sources, coverage) is statically
// imported. The 834-question index and the per-pack question records are
// dynamically imported so the homepage and the hub never pay for them.

import packsJson from "@/content/fabric/packs.json";
import metaJson from "@/content/fabric/meta.json";
import sourcesJson from "@/content/fabric/sources.json";
import casesJson from "@/content/fabric/cases.json";
import { loadPack } from "./pack-loaders.generated";
import type {
  FabricCaseStudy,
  FabricIndexEntry,
  FabricMeta,
  FabricPack,
  FabricPackNotes,
  FabricQuestion,
  FabricSourceRef,
  ObjectiveId,
  SubjectId,
} from "./types";
import { DOMAIN_BY_ID, OBJECTIVE_BY_ID, SUBJECT_BY_ID } from "./taxonomy";

export const PACKS = packsJson as unknown as FabricPack[];
export const META = metaJson as unknown as FabricMeta;
export const SOURCES = sourcesJson as unknown as FabricSourceRef[];
export const CASE_STUDIES = casesJson as unknown as FabricCaseStudy[];

export const PACK_BY_KEY = new Map(PACKS.map((pack) => [pack.key, pack]));
export const SOURCE_BY_ID = new Map(SOURCES.map((source) => [source.id, source]));
export const CASE_BY_ID = new Map(CASE_STUDIES.map((study) => [study.id, study]));

/** Coverage figures shipped with the build; also recomputed by the tests. */
export const COVERAGE = META.coverage;
export const COUNTS = META.counts;

let indexPromise: Promise<FabricIndexEntry[]> | null = null;

/** The explorer's dataset. Loaded on demand, never on the hub. */
export function loadIndex(): Promise<FabricIndexEntry[]> {
  if (!indexPromise) {
    indexPromise = import("@/content/fabric/index.json").then(
      (module) => module.default as unknown as FabricIndexEntry[],
    );
  }
  return indexPromise;
}

let notesPromise: Promise<FabricPackNotes[]> | null = null;

export function loadNotes(): Promise<FabricPackNotes[]> {
  if (!notesPromise) {
    notesPromise = import("@/content/fabric/notes.json").then(
      (module) => module.default as unknown as FabricPackNotes[],
    );
  }
  return notesPromise;
}

const packCache = new Map<string, Promise<FabricQuestion[]>>();
const questionCache = new Map<string, FabricQuestion>();

function getPackQuestions(pack: string): Promise<FabricQuestion[]> {
  let promise = packCache.get(pack);
  if (!promise) {
    promise = loadPack(pack).then((questions) => {
      for (const question of questions) questionCache.set(question.id, question);
      return questions;
    });
    packCache.set(pack, promise);
  }
  return promise;
}

export function getCachedQuestion(id: string): FabricQuestion | undefined {
  return questionCache.get(id);
}

/**
 * Load exactly the packs a session needs. A guided session on one topic pulls
 * one chunk; a full mock pulls the packs it drew from.
 */
export async function loadQuestions(
  ids: string[],
  packsByQuestion: Map<string, string>,
): Promise<FabricQuestion[]> {
  const missing = ids.filter((id) => !questionCache.has(id));
  const packs = new Set<string>();
  for (const id of missing) {
    const pack = packsByQuestion.get(id);
    if (pack) packs.add(pack);
  }
  if (packs.size > 0) {
    await Promise.all([...packs].map((pack) => getPackQuestions(pack)));
  }
  return ids
    .map((id) => questionCache.get(id))
    .filter((question): question is FabricQuestion => Boolean(question));
}

export function packLabel(pack: string) {
  return PACK_BY_KEY.get(pack)?.title ?? pack;
}

export function subjectLabel(id: SubjectId) {
  return SUBJECT_BY_ID.get(id)?.label ?? id;
}

export function objectiveLabel(objectiveId: ObjectiveId | null, domain: string | null) {
  if (objectiveId) {
    const objective = OBJECTIVE_BY_ID.get(objectiveId);
    if (objective) return `DP-600 ${objective.id} · ${objective.label}`;
  }
  if (domain) {
    const domainMeta = DOMAIN_BY_ID.get(domain as "1" | "2" | "3");
    if (domainMeta) return `DP-600 ${domainMeta.id} · ${domainMeta.label} (sub-objective not stated)`;
  }
  return "No objective mapping";
}

export function videoUrl(videoId: string, seconds: number | null) {
  if (!videoId) return null;
  const base = `https://www.youtube.com/watch?v=${videoId}`;
  return seconds === null ? base : `${base}&t=${seconds}s`;
}

/** `96` → `1:36`; `3720` → `1:02:00`. */
export function formatTimestamp(seconds: number | null) {
  if (seconds === null || seconds < 0) return null;
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = total % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
    : `${minutes}:${String(rest).padStart(2, "0")}`;
}

/** Every source video, de-duplicated, with the packs that reference it. */
export function videoIndex() {
  const map = new Map<
    string,
    { id: string; title: string; creator: string; duration: string; packs: string[] }
  >();
  for (const pack of PACKS) {
    if (!pack.video?.id) continue;
    const existing = map.get(pack.video.id);
    if (existing) {
      existing.packs.push(pack.key);
      continue;
    }
    map.set(pack.video.id, {
      id: pack.video.id,
      title: pack.video.title,
      creator: pack.video.creator,
      duration: pack.video.duration,
      packs: [pack.key],
    });
  }
  return [...map.values()];
}
