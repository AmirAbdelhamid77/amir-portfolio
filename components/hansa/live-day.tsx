"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { liveDailyGroup } from "@/lib/knowledge/daily-bank";
import type { Insight } from "@/lib/knowledge/insights";
import { DayDealer } from "./day-dealer";
import { InsightDetailScene } from "./insight-detail-scene";
import { IslandNav } from "./island-nav";
import { LayerShell } from "./layer-shell";
import { useLiveDay } from "./use-live-day";

const fullDate = new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeZone: "UTC" });

export function LiveDay({ deck }: { deck: Insight[] }) {
  const params = useSearchParams();
  const today = useLiveDay();
  if (!today) return <p role="status" className="p-8">Loading daily insights…</p>;

  const date = params.get("date") ?? today;
  const insights = date <= today
    ? liveDailyGroup(deck, date).map(insight => ({ ...insight, date }))
    : [];
  const id = params.get("insight");
  const insight = insights.find(record => record.id === id);
  if (!insights.length || (id !== null && !insight)) {
    return (
      <section className="mx-auto max-w-xl px-4 py-24">
        <h1 className="text-3xl font-medium">This edition is unavailable</h1>
        <Link href="/" className="mt-4 inline-block underline">Return to the timeline</Link>
      </section>
    );
  }

  const label = fullDate.format(new Date(date + "T00:00:00Z"));
  const dayHref = `/day/live/?date=${date}`;
  const headingId = insight ? "insight-heading" : "day-heading";
  const rtl = insight?.language === "ar";

  return (
    <>
      <IslandNav current={label} />
      <LayerShell labelledBy={headingId}>
        <div className={`relative mx-auto flex min-h-dvh w-full flex-col px-4 py-20 ${insight ? "max-w-3xl" : "max-w-5xl"}`}>
          <Link
            href={insight ? dayHref : "/"}
            aria-label={insight ? "Close the insight and return to the day" : "Close the day and return to the timeline"}
            className="absolute right-4 top-20 inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            <X size={18} aria-hidden="true" />
          </Link>
          {insight ? (
            <>
              <Link href={dayHref} className="mr-14 w-fit text-sm text-muted-foreground hover:underline">
                <time dateTime={date}>{label}</time>
              </Link>
              <h1 id={headingId} dir={rtl ? "rtl" : undefined} lang={insight.language}
                className={`mt-2 text-balance text-3xl font-medium tracking-tight ${rtl ? "pr-14" : ""}`}>
                {insight.cardTitle}
              </h1>
              <InsightDetailScene key={`${date}/${insight.id}`} insight={insight} experimentId={null} />
            </>
          ) : (
            <>
              <h1 id={headingId} className="mr-14 text-balance text-4xl font-medium tracking-tight">
                <time dateTime={date}>{label}</time>
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                Three insights from the authoring bank. Each card shows its review status.
              </p>
              <div className="mt-10 flex flex-1 items-center justify-center">
                <DayDealer key={date} day={{ date, insights }} live />
              </div>
            </>
          )}
        </div>
      </LayerShell>
    </>
  );
}
