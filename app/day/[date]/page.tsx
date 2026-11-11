import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { X } from "lucide-react";
import { IslandNav } from "@/components/hansa/island-nav";
import { LayerShell } from "@/components/hansa/layer-shell";
import { DayDealer } from "@/components/hansa/day-dealer";
import { EDITORIAL_DAYS } from "@/lib/knowledge/editorial-feed";
import type { DayLedgerDay } from "@/lib/knowledge/day-ledger";

// Level 2 — the Day layer (redesign plan §2, §10). A real statically
// generated route: direct links, refresh and back all work without server
// features; from the Home the layer reads as stacked over the timeline via
// the depth transition and the browser's own history.
//
// Since 2026-11-10 each day also carries two labelled bank drafts. The route
// list is unchanged: the composition appends to existing real dates instead
// of inventing new ones.

const DAYS: DayLedgerDay[] = EDITORIAL_DAYS;
const DAY_DATES = new Set(DAYS.map((day) => day.date));

export function generateStaticParams() {
  return DAYS.map((day) => ({ date: day.date }));
}

export const dynamicParams = false;

const UTC_FULL = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  const day = DAYS.find((entry) => entry.date === date);
  if (!day) return {};
  const lead = day.insights[0];
  const hasDrafts = day.insights.some((i) => i.reviewStatus === "draft");
  return {
    title: `${UTC_FULL.format(new Date(day.date))} — Hansa`,
    description: `${day.insights.length} ${day.insights.length === 1 ? "insight" : "insights"}: ${day.insights.map((i) => i.cardTitle).join(", ")}.`,
    alternates: { canonical: `/day/${day.date}/` },
    // A day that contains unverified drafts must not be indexed as reviewed
    // content. It stays reachable and follows links; only discovery changes.
    robots: hasDrafts ? { index: false, follow: true } : undefined,
    openGraph: {
      title: lead?.cardTitle ?? day.date,
      description: lead?.takeaway?.slice(0, 140) ?? "",
      url: `/day/${day.date}/`,
    },
  };
}

export default async function DayPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!DAY_DATES.has(date)) notFound();
  const day = DAYS.find((entry) => entry.date === date)!;
  const drafts = day.insights.filter((i) => i.reviewStatus === "draft").length;
  return (
    <>
      <IslandNav current={UTC_FULL.format(new Date(day.date))} />
      <LayerShell labelledBy="day-heading">
        <div className="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4 py-20">
          <Link
            href="/"
            aria-label="Close the day and return to the timeline"
            className="absolute right-4 top-20 inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <X size={18} aria-hidden="true" />
          </Link>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Day layer
          </p>
          <h1 id="day-heading" className="mt-2 text-balance text-4xl font-medium tracking-tight">
            {UTC_FULL.format(new Date(day.date))}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
            {day.insights.length}{" "}
            {day.insights.length === 1 ? "insight" : "insights"} for this day. Activate a card to
            read it; the timeline stays one step back.
          </p>
          {drafts ? (
            <p className="mt-3 max-w-xl rounded-2xl border border-border bg-card/60 p-3 text-sm leading-6 text-muted-foreground">
              This day includes {drafts} authoring draft{drafts === 1 ? "" : "s"} from the local
              insight bank. {drafts === 1 ? "It is" : "They are"} unverified and independent review
              is pending; the technical-review edition is marked separately.
            </p>
          ) : null}
          <div className="mt-10 flex flex-1 items-center justify-center">
            <DayDealer day={day} />
          </div>
        </div>
      </LayerShell>
    </>
  );
}
