// The dealer's hand, stated as data.
//
// R4 restores the prototype's modal dealer: the whole hand at once, an edition
// rail, capability tags and a reader beside the hand. This module derives those
// pieces from the edition's own reviewed fields, so the renderer can stay a
// renderer and the tests can hold the shape still.
//
// Nothing here invents a claim. Every summary, reader field and provenance line
// is a restatement of `insight` (via `insightCards` / `cardBody`) or of the
// stage model's day list. Capability tags describe what a card *can do*; they
// are not a review state and never turn a candidate into a published claim.

import type { Insight } from "./insights.ts";
import { cardBody, insightCards, type CardKind } from "./models.ts";
import { dayLabel, type StageEdition, type TimelineDay } from "./stage-model.ts";

export const DEALER_CAPABILITIES = ["discover", "read", "assess", "relate"] as const;
export type DealerCapability = (typeof DEALER_CAPABILITIES)[number];

export const CAPABILITY_LABEL: Record<DealerCapability, string> = {
  discover: "discover",
  read: "read",
  assess: "assess",
  relate: "relate",
};

/** What each card kind is allowed to claim it can do. */
const CARD_CAPABILITIES: Record<CardKind, readonly DealerCapability[]> = {
  principle: ["read", "relate"],
  caveat: ["read", "assess"],
  evidence: ["read", "discover"],
};

const KIND_LABEL: Record<CardKind, string> = {
  principle: "Principle",
  caveat: "Caveat",
  evidence: "Evidence",
};

export type DealerFieldTone = "plain" | "takeaway" | "caveat";

export type DealerField = {
  label: string;
  value: string;
  tone: DealerFieldTone;
};

export type DealerCard = {
  id: string;
  kind: CardKind;
  kindLabel: string;
  reviewState: string;
  /** "Technical review" / "Published" — a state, never an endorsement. */
  reviewLabel: string;
  title: string;
  summary: string;
  capabilities: Record<DealerCapability, boolean>;
  fields: DealerField[];
  /** A verbatim source line, shown as a quote rather than paraphrased. */
  evidence: { quote: string; attribution: string } | null;
  provenance: { source: string; locator: string; reviewer: string; checked: string };
  href: string;
  hrefLabel: string;
  /** Accessible name for the card button; one name per card. */
  label: string;
};

function capabilitiesFor(kind: CardKind): Record<DealerCapability, boolean> {
  const on = new Set(CARD_CAPABILITIES[kind]);
  return Object.fromEntries(
    DEALER_CAPABILITIES.map((capability) => [capability, on.has(capability)]),
  ) as Record<DealerCapability, boolean>;
}

function reviewLabel(state: string) {
  return state === "published" ? "Published" : "Technical review";
}

/** `26 Oct 2026` from an ISO date, without reading the visitor's locale. */
export function checkedLabel(iso: string) {
  const date = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * The full hand for one edition, oldest idea first (principle, caveat,
 * evidence). The order is identity, not a ranking.
 */
export function dealerHand(insight: Insight): DealerCard[] {
  const body = (kind: CardKind) => cardBody(insight, kind);
  return insightCards(insight).map((card) => {
    const kindBody = body(card.kind);
    const common = {
      id: card.id,
      kind: card.kind,
      kindLabel: KIND_LABEL[card.kind],
      reviewState: insight.reviewStatus,
      reviewLabel: reviewLabel(insight.reviewStatus),
      title: card.title,
      capabilities: capabilitiesFor(card.kind),
      provenance: {
        source: insight.sourceId,
        locator: insight.sourceLocator,
        reviewer: insight.reviewer,
        checked: checkedLabel(insight.checkedAt),
      },
      label: card.label,
    };

    if (card.kind === "principle") {
      return {
        ...common,
        summary: insight.takeaway,
        fields: [
          { label: "What changes", value: insight.takeaway, tone: "takeaway" as const },
          { label: "How to test it", value: insight.prediction, tone: "plain" as const },
        ],
        evidence: null,
        href: insight.lessonHref,
        hrefLabel: "Read the lesson",
      };
    }

    if (card.kind === "caveat") {
      return {
        ...common,
        summary: insight.caveat,
        fields: [
          { label: "The condition", value: insight.caveat, tone: "caveat" as const },
          { label: "Why it matters", value: kindBody.note, tone: "plain" as const },
        ],
        evidence: null,
        href: insight.practiceHref,
        hrefLabel: "Try a practice question",
      };
    }

    return {
      ...common,
      summary: `Microsoft Learn · checked ${checkedLabel(insight.checkedAt)}`,
      fields: [
        { label: "Checked", value: checkedLabel(insight.checkedAt), tone: "plain" as const },
        { label: "Reviewed by", value: insight.reviewer, tone: "plain" as const },
        { label: "Source id", value: insight.sourceId, tone: "plain" as const },
      ],
      evidence: {
        quote: insight.sourceLocator,
        attribution: `Microsoft Learn · ${insight.sourceId}`,
      },
      href: insight.sourceUrl,
      hrefLabel: "Open the Microsoft Learn source",
    };
  });
}

/** Which capabilities the whole hand can offer, for the hand header. */
export function capabilitySummary(cards: readonly DealerCard[]) {
  return Object.fromEntries(
    DEALER_CAPABILITIES.map((capability) => [
      capability,
      cards.some((card) => card.capabilities[capability]),
    ]),
  ) as Record<DealerCapability, boolean>;
}

export function capabilityRow(cards: readonly DealerCard[]) {
  const summary = capabilitySummary(cards);
  return DEALER_CAPABILITIES.map((id) => ({
    id,
    label: CAPABILITY_LABEL[id],
    on: summary[id],
  }));
}

/** The cycle order a reader moves through with "Next card". */
export function nextCardId(cards: readonly DealerCard[], currentId: string | null) {
  if (!cards.length) return null;
  const index = cards.findIndex((card) => card.id === currentId);
  return cards[(index + 1) % cards.length]?.id ?? cards[0].id;
}

export type DealerRailDay = {
  date: string;
  /** `26` — the rail is a calendar, not a sentence. */
  dayNumber: string;
  weekday: string;
  label: string;
  editionId: string | null;
  /** Quiet days are placeholders: present, never selectable. */
  selectable: boolean;
  isCurrent: boolean;
  isToday: boolean;
};

export function dealerRail(
  days: readonly TimelineDay[],
  selectedId: string | null,
): DealerRailDay[] {
  return days.map((day) => ({
    date: day.date,
    dayNumber: day.date.slice(8, 10),
    weekday: day.dayLabel.split(" ")[0] ?? "",
    label: day.dayLabel,
    editionId: day.editionId,
    selectable: Boolean(day.editionId),
    isCurrent: Boolean(day.editionId) && day.editionId === selectedId,
    isToday: day.isToday,
  }));
}

const EDITION_ID = /^hansa-insight-[a-z0-9-]+$/;
const DAILY_KEY = /^daily:(\d{4}-\d{2}-\d{2})$/;

/**
 * Resolve `?dealer=` to an edition the stage may actually show. Accepts the
 * edition id and the prototype's `daily:YYYY-MM-DD` key; anything else is null,
 * so a shared link can never open a deck the model withheld.
 */
export function parseDealerEdition(
  value: string | null | undefined,
  editions: readonly StageEdition[],
): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  const daily = DAILY_KEY.exec(raw);
  if (daily) {
    return editions.find((edition) => edition.date === daily[1])?.id ?? null;
  }
  if (!EDITION_ID.test(raw)) return null;
  return editions.some((edition) => edition.id === raw) ? raw : null;
}

/** The URL for a shared deck, keeping every unrelated parameter. */
export function dealerQuery(search: string, editionId: string) {
  const params = new URLSearchParams(search);
  params.set("insight", editionId);
  params.set("dealer", editionId);
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** The same URL with the deck closed; the edition stays selected. */
export function closedDealerQuery(search: string) {
  const params = new URLSearchParams(search);
  params.delete("dealer");
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const SAVED_CARDS_KEY = "hansa.dealer.saved.v1";
/** Same-tab signal so a closing scene can pick up a save made in the dealer. */
export const SAVED_CARDS_EVENT = "hansa:dealer-saved";
export const SAVED_LIMIT = 24;
const CARD_ID = /^hansa-insight-[a-z0-9-]+::(principle|caveat|evidence)$/;

/** Fail-closed local bookmark parsing: stale or foreign ids are dropped. */
export function parseSavedCards(raw: string | null | undefined): string[] {
  if (!raw) return [];
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const saved: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !CARD_ID.test(item) || seen.has(item)) continue;
    seen.add(item);
    saved.push(item);
    if (saved.length >= SAVED_LIMIT) break;
  }
  return saved;
}

export function toggleSavedCard(saved: readonly string[], cardId: string): string[] {
  if (!CARD_ID.test(cardId)) return [...saved];
  if (saved.includes(cardId)) return saved.filter((id) => id !== cardId);
  return [cardId, ...saved.filter((id) => id !== cardId)].slice(0, SAVED_LIMIT);
}

export function savedCardsForEdition(
  saved: readonly string[],
  editionId: string,
): string[] {
  return saved.filter((id) => id.startsWith(`${editionId}::`));
}

export type SavedGroupEntry = {
  cardId: string;
  editionId: string;
  title: string;
  kind: CardKind;
  kindLabel: string;
  day: string;
};

/**
 * Resolve saved ids against the editions currently on the stage. A bookmark for
 * an edition this audience may not see simply disappears; it is never borrowed
 * from another date.
 */
export function savedGroups(
  saved: readonly string[],
  items: readonly Insight[],
): SavedGroupEntry[] {
  const groups: SavedGroupEntry[] = [];
  for (const cardId of saved) {
    const editionId = cardId.split("::")[0];
    const insight = items.find((item) => item.id === editionId);
    if (!insight) continue;
    const card = dealerHand(insight).find((entry) => entry.id === cardId);
    if (!card) continue;
    groups.push({
      cardId,
      editionId,
      title: card.title,
      kind: card.kind,
      kindLabel: card.kindLabel,
      day: dayLabel(insight.date),
    });
  }
  return groups;
}

export type DealStep = {
  index: number;
  delayMs: number;
  /** Slight alternating tilt so the hand lands like cards, not a list. */
  rotate: number;
  lift: number;
};

/** Deterministic stagger for the deal entrance; capped so a hand never crawls. */
export function dealPlan(count: number): DealStep[] {
  const total = Math.max(0, Math.min(Math.trunc(count), 8));
  return Array.from({ length: total }, (_, index) => ({
    index,
    delayMs: Math.min(index * 70, 280),
    rotate: index % 2 === 0 ? -1.6 : 1.2,
    lift: 18 + index * 3,
  }));
}
