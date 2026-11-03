// Search and the learning registry consume the same source adapter.
// Search never owns the learning taxonomy or controls publication eligibility.
//
// The destination index is deliberately narrower than the learning registry:
//   * question stems are not destinations; they live in the question bank and
//     are linked from search as a bank, not listed one row per question;
//   * mirrored courseware keeps one row per canonical page, not one per copy;
//   * titles lose the wrapping quotes that came from YAML frontmatter.
import { sourceDocuments } from "@/lib/study/source-documents";
import { SUBJECTS, topicHref } from "@/lib/study/taxonomy";
import { TOPIC_GOALS } from "@/lib/study/briefs";
import { applySearchAliases } from "./aliases";
import type { SearchDocument } from "./query";

const QUOTE_EDGES = /^[\s'"?“”‘’]+|[\s'"?“”‘’]+$/g;

function cleanTitle(value: string): string {
  return value.replace(QUOTE_EDGES, "").trim();
}

function cleanSummary(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * The canonical destinations a reader can open. Every row points at a page that
 * exists; progress, answers and review states stay at their source.
 */
export function buildSiteSearchIndex(): SearchDocument[] {
  const documents: SearchDocument[] = [];
  const seen = new Set<string>();

  for (const document of sourceDocuments()) {
    if (document.kind === "question") continue;
    const title = cleanTitle(document.title);
    if (!title) continue;
    const key = `${document.url.replace(/\/+$/, "")}|${title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    documents.push({
      ...document,
      title,
      summary: cleanSummary(document.summary),
      url: document.id === "page-home" ? "/" : document.url,
    });
  }

  for (const subject of SUBJECTS) {
    const document: SearchDocument = {
      id: `subject-${subject.id}`,
      title: subject.title,
      url: `/learn/${subject.id}/`,
      kind: "course",
      summary: subject.goal,
      topic: [subject.title],
      language: "en",
      course: subject.title,
      // No topic titles here: a subject page is a destination for its own
      // name, not for every word its topics happen to use.
      keywords: ["subject", "learning path"],
    };
    const key = `${document.url}|${document.title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    documents.push(document);
  }

  for (const subject of SUBJECTS) {
    for (const [topic, title] of subject.topics) {
      const goal = TOPIC_GOALS[`${subject.id}.${topic}`] ?? subject.goal;
      const document: SearchDocument = {
        id: `topic-${subject.id}-${topic}`,
        title: `${title} — ${subject.title}`,
        url: topicHref(subject.id, topic),
        kind: "topic",
        summary: goal,
        topic: [subject.title, title],
        language: "en",
        course: subject.title,
        keywords: [subject.title, title, "topic", "learning path", "practice"],
      };
      const key = `${document.url}|${document.title.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      documents.push(document);
    }
  }

  return applySearchAliases(documents);
}
