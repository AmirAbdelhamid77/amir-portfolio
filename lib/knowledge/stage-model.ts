// The public stage model for the three-scene Home (milestone M6).
//
// One boundary, three scenes: timeline, knowledge, closing. This module is the
// only place that decides what a visitor may see. An edition enters the stage
// only when its review status is allowed for the audience, and the knowledge
// scene receives counts and destinations, never candidate claims or edges. It is
// pure and dependency-free so the server, the client and the tests build the
// same model from the same inputs, and so a review artifact cannot be smuggled
// through a prop that this file does not produce.
//
// Two audiences, never mixed:
//   public — only `published` editions and only published graph edges. Today
//            that is zero of both, so the stage renders its honest empty state
//            with real learning, practice, search and Atlas destinations.
//   review — adds `technical_review` editions, which the Home labels as such.
//            It never changes the Atlas projection: that flag is decided in
//            `lib/atlas/server.ts`, not here.

import type { Insight } from "./insights";

export const TIMELINE_SPAN_DAYS = 15;

export type Audience = "public" | "review";

export type Destination = {
  href: string;
  label: string;
  description: string;
};

export type StageEdition = {
  id: string;
  date: string;
  dayLabel: string;
  topic: string;
  title: string;
  reviewStatus: string;
  conceptId: string;
  lessonHref: string;
  practiceHref: string;
};

export type TimelineDay = {
  date: string;
  dayLabel: string;
  isToday: boolean;
  editionId: string | null;
  editionTitle: string | null;
  reviewStatus: string | null;
};

export type TimelineScene = {
  days: TimelineDay[];
  editions: StageEdition[];
  latestEditionId: string | null;
  todayHasEdition: boolean;
  /** Review-status editions the audience may not see. A count, never content. */
  withheldEditions: number;
  emptyNotice: string;
};

export type GraphScene = {
  state: "empty" | "ready";
  publishedConcepts: number;
  publishedEdges: number;
  withheldConcepts: number;
  withheldEdges: number;
  notice: string;
  discovery: Destination[];
};

export type StageModel = {
  audience: Audience;
  today: string;
  timeline: TimelineScene;
  graph: GraphScene;
  closing: { destinations: Destination[] };
  review: { status: "published" | "technical_review" | "none"; notice: string };
};

/** Minimal structural shape of an Atlas projection; avoids a cross-import. */
export type GraphSnapshot = {
  notice: string;
  concepts: readonly { editorialState: string }[];
  semanticEdges: readonly { editorialState: string }[];
};

const ALLOWED: Record<Audience, readonly string[]> = {
  public: ["published"],
  review: ["published", "technical_review"],
};

const DAY_FORMAT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

/** `YYYY-MM-DD` in UTC, the only date identity the stage uses. */
export function dayKey(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(`${String(value).slice(0, 10)}T00:00:00Z`);
  return date.toISOString().slice(0, 10);
}

/** `MON 26 OCT` — uppercase so the timeline reads as a calendar, not a sentence. */
export function dayLabel(key: string): string {
  const date = new Date(`${key}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return key;
  return DAY_FORMAT.format(date).replace(/,/g, "").toUpperCase();
}

function shiftDays(key: string, days: number): string {
  const date = new Date(`${key}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Destinations the empty public stage must still offer. All site-relative. */
export function stageDestinations(): Destination[] {
  return [
    {
      href: "/learn",
      label: "Learn a subject",
      description: "The visualization course, statistics reference and Fabric notes.",
    },
    {
      href: "/practice/catalogue",
      label: "Practise a question",
      description: "Question banks in their learning context, with saved progress.",
    },
    {
      href: "/search",
      label: "Search everything",
      description: "One index over lessons, practice, references and the Atlas desk.",
    },
    {
      href: "/learn/dp-600/atlas/",
      label: "Check the Atlas state",
      description: "Sources, review status and what is not published yet.",
    },
  ];
}

function toEdition(item: Insight): StageEdition {
  return {
    id: item.id,
    date: item.date,
    dayLabel: dayLabel(item.date),
    topic: item.topic,
    title: item.title,
    reviewStatus: item.reviewStatus,
    conceptId: item.conceptId,
    lessonHref: item.lessonHref,
    practiceHref: item.practiceHref,
  };
}

function buildTimeline(
  editions: StageEdition[],
  today: string,
  withheld: number,
  span = TIMELINE_SPAN_DAYS,
): TimelineScene {
  const byDate = new Map<string, StageEdition>();
  for (const edition of editions) {
    // One edition per day: the newest wins and the rest stay out of the clock,
    // because two cards on one date would invent an order the source lacks.
    if (!byDate.has(edition.date)) byDate.set(edition.date, edition);
  }

  const days: TimelineDay[] = [];
  for (let offset = 0; offset < span; offset += 1) {
    const date = shiftDays(today, -offset);
    const edition = byDate.get(date) ?? null;
    days.push({
      date,
      dayLabel: dayLabel(date),
      isToday: offset === 0,
      editionId: edition?.id ?? null,
      editionTitle: edition?.title ?? null,
      reviewStatus: edition?.reviewStatus ?? null,
    });
  }

  const latest = editions[0] ?? null;
  const todayHasEdition = Boolean(days[0]?.editionId);
  const emptyNotice = todayHasEdition
    ? ""
    : latest
      ? `No edition for ${dayLabel(today)}. The latest available edition is ${latest.dayLabel}.`
      : `No edition is available yet. Editions appear on this clock once they are published; until then, start from a subject below.`;

  return {
    days,
    editions,
    latestEditionId: latest?.id ?? null,
    todayHasEdition,
    withheldEditions: withheld,
    emptyNotice,
  };
}

function buildGraph(graph: GraphSnapshot, audience: Audience): GraphScene {
  // Only published edges can make the scene "ready". A review audience sees the
  // withheld count so it can say how much is waiting, but it still may not draw
  // an unpublished edge as supported; that rule belongs here, not in a renderer.
  const published = (item: { editorialState: string }) => item.editorialState === "published";
  const concepts = {
    shown: graph.concepts.filter(published).length,
    withheld: graph.concepts.filter((item) => !published(item)).length,
  };
  const edges = {
    shown: graph.semanticEdges.filter(published).length,
    withheld: graph.semanticEdges.filter((item) => !published(item)).length,
  };
  const state = edges.shown > 0 ? "ready" : "empty";

  return {
    state,
    publishedConcepts: concepts.shown,
    publishedEdges: edges.shown,
    withheldConcepts: concepts.withheld,
    withheldEdges: edges.withheld,
    notice:
      state === "ready"
        ? graph.notice
        : audience === "review"
          ? `${edges.withheld} candidate connections are under technical review and are not published.`
          : "Reviewed connections are not published yet. The lessons, practice and search below are available now.",
    discovery: stageDestinations(),
  };
}

/**
 * Build the three-scene model. Throws on an unknown audience rather than
 * guessing, because a typo must never widen the publication boundary.
 */
export function buildStageModel(input: {
  items: readonly Insight[];
  graph: GraphSnapshot;
  audience: Audience;
  today: Date | string;
}): StageModel {
  const allowed = ALLOWED[input.audience];
  if (!allowed) throw new Error(`buildStageModel: unknown audience ${String(input.audience)}`);

  const today = dayKey(input.today);
  const statuses = new Set(allowed);
  const visible = input.items.filter(
    (item) => statuses.has(item.reviewStatus) && dayKey(item.date) === item.date,
  );
  const withheld = input.items.filter(
    (item) => item.reviewStatus === "technical_review" && !statuses.has(item.reviewStatus),
  ).length;

  const editions = visible
    .map(toEdition)
    .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));

  const status: StageModel["review"]["status"] = editions.some(
    (edition) => edition.reviewStatus === "technical_review",
  )
    ? "technical_review"
    : editions.length
      ? "published"
      : "none";

  return {
    audience: input.audience,
    today,
    timeline: buildTimeline(editions, today, withheld),
    graph: buildGraph(input.graph, input.audience),
    closing: { destinations: stageDestinations() },
    review: {
      status,
      notice:
        status === "technical_review"
          ? "Editions under editorial review. Technical review is not publication."
          : status === "published"
            ? "Published editions, with their sources."
            : "No edition is published yet. Nothing on this page claims otherwise.",
    },
  };
}
