// Derived interaction models and knowledge cards for a Daily Insight.
//
// Nothing here invents domain claims. Every verdict and card is computed from
// the insight's own reviewed fields in content/knowledge/insights.json
// (scenario, takeaway, caveat, source). The models only re-state those fields
// as a decision the reader can operate, which is why they can ship before a
// human publication review: the *scenario* is already marked preview, and the
// model adds no new factual assertion.
import type { Insight } from "@/lib/knowledge/insights";

export type ExperimentId = "retention" | "deletion" | "discovery";

export type ExperimentState = {
  /** "retention": does another team need a separately stored result? */
  retained: boolean;
  /** "deletion": which object is being deleted? */
  action: "remove-shortcut" | "delete-through";
  /** "discovery": where the shortcut is created, and what it points at. */
  location: "files" | "tables";
  data: "delta" | "files";
};

export const INITIAL_EXPERIMENT: ExperimentState = {
  retained: false,
  action: "remove-shortcut",
  location: "tables",
  data: "delta",
};

/** Map an edition to the one interactive model its objective supports. */
export function experimentFor(insight: Insight): ExperimentId | null {
  if (insight.id.includes("shortcut-reference")) return "retention";
  if (insight.id.includes("shortcut-delete")) return "deletion";
  if (insight.id.includes("shortcut-discovery")) return "discovery";
  return null;
}

export type VerdictTone = "plain" | "caution" | "positive";

export type Verdict = {
  /** The derived answer, not a restatement of the scenario. */
  headline: string;
  detail: string;
  tone: VerdictTone;
  /** Exact objects and their state, used by the figure and the text summary. */
  rows: { label: string; state: string }[];
};

export function deriveVerdict(
  id: ExperimentId,
  state: ExperimentState,
): Verdict {
  if (id === "retention") {
    return state.retained
      ? {
          headline: "A separately retained result",
          detail:
            "A shortcut points at data; it is not a retained, transformed snapshot. If another team needs its own stored result, that is a pipeline to build and keep in step.",
          tone: "caution",
          rows: [
            { label: "Consumers", state: "two teams" },
            { label: "Existing Delta table", state: "still the source" },
            { label: "Second retained result", state: "required" },
          ],
        }
      : {
          headline: "An internal OneLake shortcut",
          detail:
            "Both teams can read the existing table through a shortcut. One location stays the source of truth and nothing new is retained.",
          tone: "positive",
          rows: [
            { label: "Consumers", state: "two teams" },
            { label: "Existing Delta table", state: "source of truth" },
            { label: "Second retained result", state: "not needed" },
          ],
        };
  }

  if (id === "deletion") {
    return state.action === "remove-shortcut"
      ? {
          headline: "The reference goes; the data stays",
          detail:
            "Removing the shortcut object deletes the reference. Its target is left intact.",
          tone: "plain",
          rows: [
            { label: "Shortcut object", state: "deleted" },
            { label: "Target data", state: "unchanged" },
          ],
        }
      : {
          headline: "Deletion can pass through",
          detail:
            "Deleting a file or folder inside a shortcut can delete the target data when the caller has the required write permissions.",
          tone: "caution",
          rows: [
            { label: "Shortcut object", state: "remains" },
            { label: "Target data", state: "can be deleted" },
          ],
        };
  }

  const tableDiscovery = state.location === "tables" && state.data === "delta";
  if (tableDiscovery) {
    return {
      headline: "Eligible for table discovery",
      detail:
        "A shortcut under Tables can surface table data, subject to the documented placement rules for supported table data.",
      tone: "positive",
      rows: [
        { label: "Location", state: "Tables" },
        { label: "Content", state: "Delta table" },
        { label: "Discovery", state: "possible" },
      ],
    };
  }

  return {
    headline:
      state.location === "files"
        ? "Still just Files"
        : "Not a table on its own",
    detail:
      state.location === "files"
        ? "Table discovery does not happen in Files, whatever the target holds."
        : "A folder of arbitrary files is not automatically a Delta table; supported table data and the documented placement rules are required.",
    tone: "caution",
    rows: [
      { label: "Location", state: state.location === "files" ? "Files" : "Tables" },
      { label: "Content", state: state.data === "delta" ? "Delta table" : "Arbitrary files" },
      { label: "Discovery", state: "no" },
    ],
  };
}

export type CardKind = "principle" | "caveat" | "evidence";

export type InsightCard = {
  /** Stable across a re-render and across the deck → hand → reader cycle. */
  id: string;
  kind: CardKind;
  eyebrow: string;
  title: string;
  /** Short face copy. Full text lives in the reader, never on the card. */
  preview: string;
  /** Accessible name for the card button. */
  label: string;
};

/** The reader's full content, assembled only from the edition's own fields. */
export type CardBody = {
  quote: string;
  note: string;
  href?: string;
  hrefLabel?: string;
  meta?: string;
};

/** Derive the hand from reviewed fields. No bank or Atlas state is read here. */
export function insightCards(insight: Insight): InsightCard[] {
  return [
    {
      id: `${insight.id}::principle`,
      kind: "principle",
      eyebrow: "Principle",
      title: insight.cardTitle,
      preview: truncate(insight.takeaway, 15),
      label: `Principle card: ${insight.cardTitle}`,
    },
    {
      id: `${insight.id}::caveat`,
      kind: "caveat",
      eyebrow: "Caveat",
      title: "What this does not mean",
      preview: truncate(insight.caveat, 15),
      label: `Caveat card for ${insight.cardTitle}`,
    },
    {
      id: `${insight.id}::evidence`,
      kind: "evidence",
      eyebrow: "Evidence",
      title: "Source check",
      preview: `Microsoft Learn · checked ${shortDate(insight.checkedAt)}`,
      label: `Evidence card for ${insight.cardTitle}`,
    },
  ];
}

export function cardBody(
  insight: Insight,
  kind: CardKind,
): CardBody {
  if (kind === "principle") {
    return {
      quote: insight.takeaway,
      note: insight.prediction,
      href: insight.lessonHref,
      hrefLabel: "Read the lesson",
      meta: `${insight.topic} · ${insight.reviewStatus.replace("_", " ")}`,
    };
  }
  if (kind === "caveat") {
    return {
      quote: insight.caveat,
      note: "Keep this condition attached to the claim; the simplified version is the one that misleads.",
      href: insight.practiceHref,
      hrefLabel: "Try a practice question",
      meta: `${insight.topic} · edge case`,
    };
  }
  return {
    quote: insight.sourceLocator,
    note: `Reviewed by ${insight.reviewer}. Source checked ${insight.checkedAt}; human publication review pending.`,
    href: insight.sourceUrl,
    hrefLabel: "Open the Microsoft Learn source",
    meta: insight.sourceId,
  };
}

function truncate(text: string, words: number) {
  const parts = text.split(/\s+/);
  if (parts.length <= words) return text;
  return `${parts.slice(0, words).join(" ")}…`;
}

function shortDate(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}
