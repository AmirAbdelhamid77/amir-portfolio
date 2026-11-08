// Recovery collections (content-recovery mission, 2026-11-09).
// Every loader reads a committed recovery artifact and preserves the source
// review status verbatim. Nothing here upgrades, invents or filters statuses:
// the honest label travels with the record.

import insightBank from "@/docs/daily-insight-bank-20261106/INSIGHT_BANK.json";
import dependencyManifest from "@/content/recovery/dependency-manifest.json";
import rtiBlueprints from "@/content/recovery/rti-lab-blueprints.json";
import patternsLessons from "@/content/recovery/patterns-lessons.json";
import patternsModules from "@/content/recovery/patterns-modules.json";
import r18Bank from "@/content/recovery/r18-learner-bank.json";
import pl300Index from "@/content/recovery/pl300-v88-index.json";
import atlasExtension from "@/content/atlas/fabric-extension.json";

export const STATUS_LABELS = {
  draft: "Draft — unverified",
  technical_review: "Technical review",
  reviewed: "Reviewed",
} as const;

export type InsightRecord = {
  id: string;
  subject: string;
  topic: string;
  title: string;
  scenario: string;
  prediction: string;
  takeaway: string;
  caveat: string;
  language: string;
  scenarioBasis?: string;
  reviewStatus: string;
  sourceReviewed?: boolean;
  scientificallyVerified?: boolean;
  publicationApproved?: boolean;
  reviewBlockers?: string[];
  source?: unknown;
  evidence?: unknown;
  lessonHref?: string;
  sourceNavigation?: unknown;
};

/** The 400 recovered insight records (397 Arabic drafts, 3 English technical-review). */
export function getInsightRecords(): InsightRecord[] {
  return (insightBank as { items: InsightRecord[] }).items;
}

export type HeldArticle = {
  articleId: string;
  family: string;
  logicalPath: string;
  sourcePath: string;
  disposition: string;
  rightsState: string;
  dependencyHolds: { inRepoPath: string; kind: string; target: string }[];
  quarantineReasons?: string[];
};

/** The 79 dependency-held Fabric articles, recovered from the compiler's
 * dependency manifest (the 81 total also includes 2 rights-notice and
 * 1 external-dependency holds recorded in the wave reports). */
export function getHeldArticles(): HeldArticle[] {
  const manifest = dependencyManifest as { articles: HeldArticle[] };
  return manifest.articles;
}

export type RtiBlueprint = {
  lab_id: string;
  title: string;
  task?: string;
  data_origin?: string;
  source_based_expected_evidence?: string;
  prerequisites?: string;
  validation_status?: string;
  grading_enabled?: boolean;
  deployment_allowed?: boolean;
  frames?: unknown;
};

export function getRtiBlueprints(): RtiBlueprint[] {
  return rtiBlueprints as RtiBlueprint[];
}

export type PatternLesson = {
  slug: string;
  title: string;
  explanation?: unknown;
  objectives?: unknown;
  walkthrough?: unknown;
  misconceptions_and_tradeoffs?: unknown;
  practice?: unknown;
  model_feedback?: unknown;
  doc_patterns?: unknown;
  page_ids?: string[];
};

export function getPatternLessons(): PatternLesson[] {
  return (patternsLessons as { lessons?: PatternLesson[] } & PatternLesson[]).lessons ??
    (patternsLessons as unknown as PatternLesson[]);
}

export function getPatternModules(): { slug?: string; title?: string; [k: string]: unknown }[] {
  return patternsModules as unknown as { slug?: string; title?: string; [k: string]: unknown }[];
}

export type R18Question = {
  id: string;
  topic: number;
  num: number;
  type: string;
  caseStudy: string;
  stem: string;
  options?: unknown;
  gradingEnabled: boolean;
};

export function getR18Bank(): { meta: { title?: string; exam?: string }; questions: R18Question[] } {
  const bank = r18Bank as { meta: { title?: string; exam?: string }; questions: R18Question[] };
  return bank;
}

export function getPl300Index(): {
  bank: string;
  restriction: string;
  records: { id: string; legacy_id: string; video_id: string; video_title: string; videoUrl: string; source: string }[];
} {
  return pl300Index as never;
}

export type AtlasResourceRecord = {
  id: string;
  articleId: string;
  title: string;
  kind: string;
  logicalPath: string;
  mappingDisposition: string;
};

/** The 1,057 awaiting-review Atlas resource records. Their target articles
 * are published; only the concept mapping is unreviewed. */
export function getAtlasResourceRecords(): AtlasResourceRecord[] {
  const extension = atlasExtension as { resourceRecords: AtlasResourceRecord[] };
  return extension.resourceRecords;
}
