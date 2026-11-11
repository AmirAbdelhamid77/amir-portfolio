import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { X } from "lucide-react";
import { IslandNav } from "@/components/hansa/island-nav";
import { LayerShell } from "@/components/hansa/layer-shell";
import { InsightDetailScene } from "@/components/hansa/insight-detail-scene";
import { EDITORIAL_DAYS } from "@/lib/knowledge/editorial-feed";
import type { DayLedgerDay } from "@/lib/knowledge/day-ledger";
import { experimentFor } from "@/lib/knowledge/models";
import type { Insight } from "@/lib/knowledge/insights";

// Level 3 — the Insight detail (redesign plan §2, §10). The existing decision
// instrument (InsightScene) is reused with its logic unchanged: situation,
// optional experiment, reveal-the-reasoning, caveat, evidence with checked
// date, lesson and practice links. No score, no saved answer; question-bank
// data and progress storage are untouched.
//
// Bank records use the same instrument with two honest additions: their
// stored `draft` status is shown, and the source link points back to the
// local lesson instead of claiming a Microsoft Learn URL.

const DAYS: DayLedgerDay[] = EDITORIAL_DAYS;

type DetailParams = { date: string; insightId: string };

export function generateStaticParams(): DetailParams[] {
  return DAYS.flatMap((day) =>
    day.insights.map((insight) => ({ date: day.date, insightId: insight.id })),
  );
}

export const dynamicParams = false;

const UTC_FULL = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export async function generateMetadata({ params }: { params: Promise<DetailParams> }): Promise<Metadata> {
  const { date, insightId } = await params;
  const insight = DAYS.find((d) => d.date === date)?.insights.find((i) => i.id === insightId);
  if (!insight) return {};
  return {
    title: `${insight.cardTitle} — Hansa`,
    description: `${insight.topic}: ${insight.title} ${insight.takeaway.slice(0, 110)}`,
    alternates: { canonical: `/day/${date}/${insightId}/` },
    robots:
      insight.reviewStatus === "draft" ? { index: false, follow: true } : undefined,
    openGraph: {
      title: insight.cardTitle,
      description: insight.takeaway.slice(0, 140),
      url: `/day/${date}/${insightId}/`,
    },
  };
}

export default async function InsightDetailPage({ params }: { params: Promise<DetailParams> }) {
  const { date, insightId } = await params;
  const day = DAYS.find((entry) => entry.date === date);
  const insight: Insight | undefined = day?.insights.find((entry) => entry.id === insightId);
  if (!day || !insight) notFound();
  const experimentId = experimentFor(insight);
  const rtl = insight.language === "ar";

  return (
    <>
      <IslandNav current={UTC_FULL.format(new Date(day.date))} />
      <LayerShell labelledBy="insight-heading">
        <div className="relative mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 py-20">
          <Link
            href={`/day/${day.date}/`}
            aria-label="Close the insight and return to the day"
            className="absolute right-4 top-20 inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <X size={18} aria-hidden="true" />
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <Link href={`/day/${day.date}/`} className="hover:underline underline-offset-4">
              {UTC_FULL.format(new Date(day.date))}
            </Link>{" "}
            · insight
          </p>
          <h1
            id="insight-heading"
            dir={rtl ? "rtl" : undefined}
            lang={insight.language}
            // RTL titles begin at the right edge, where the close control sits;
            // reserve its width so the first line never runs under it.
            className={`mt-2 text-balance text-3xl font-medium tracking-tight${rtl ? " pr-14" : ""}`}
          >
            {insight.cardTitle}
          </h1>
          <InsightDetailScene insight={insight} experimentId={experimentId} />
        </div>
      </LayerShell>
    </>
  );
}
