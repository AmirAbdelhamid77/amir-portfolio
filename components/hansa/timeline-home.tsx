"use client";

// Level 1 of the redesigned Home (redesign plan §2, §8–9): the island
// navigation and the forked beUI Timeline occupying the stage. Selecting a
// day centres it; activating the centred day again opens the day layer
// (/day/[date], Stage D). Dates, titles, topics and review statuses come from
// the existing fail-closed insight feed — nothing is invented.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { Timeline } from "@/components/hansa/day-timeline";
import { DayMedia } from "@/components/hansa/day-media";
import { IslandNav } from "@/components/hansa/island-nav";
import type { DayLedgerDay } from "@/lib/knowledge/day-ledger";
import type { Insight } from "@/lib/knowledge/insights";
import { LIVE_DAILY_START, liveDailyGroup } from "@/lib/knowledge/daily-bank";
import { useLiveDay } from "./use-live-day";

// A full, unambiguous civil date on every card: day, month name and four-digit
// year, read in UTC so a build or a visitor's timezone cannot move it.
const UTC_DAY = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const UTC_MONTH = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const UTC_FULL = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function dayHref(date: string) {
  return date >= LIVE_DAILY_START ? `/day/live/?date=${date}` : `/day/${date}/`;
}

export function TimelineHome({ archive, deck }: { archive: DayLedgerDay[]; deck: Insight[] }) {
  const router = useRouter();
  const today = useLiveDay();
  const days = useMemo(() => {
    if (!today) return archive;
    const date = new Date(today + "T00:00:00Z");
    const recent: DayLedgerDay[] = [];
    for (let offset = 0; offset < 7; offset += 1) {
      const stamp = date.toISOString().slice(0, 10);
      const group = liveDailyGroup(deck, stamp);
      if (!group.length) break;
      recent.unshift({ date: stamp, insights: group.map(insight => ({ ...insight, date: stamp })) });
      date.setUTCDate(date.getUTCDate() - 1);
    }
    return [...archive, ...recent];
  }, [archive, deck, today]);

  const events = days.map((day) => {
    const drafts = day.insights.filter((insight) => insight.reviewStatus === "draft").length;
    return {
      id: day.date,
      date: day.date,
      title: day.insights[0]?.title ?? day.date,
      media: <DayMedia day={day} />,
      meta: (
        <span>
          {day.insights.length} {day.insights.length === 1 ? "insight" : "insights"}
          {drafts ? ` · ${drafts} draft${drafts === 1 ? "" : "s"}` : ""}
        </span>
      ),
    };
  });

  const onOpen = useCallback(
    (id: string) => {
      router.push(dayHref(id));
    },
    [router],
  );

  const announce = useCallback(
    (event: { date: string | Date }, index: number) => {
      const day = days[index];
      const count = day?.insights.length ?? 0;
      const drafts = day?.insights.filter((insight) => insight.reviewStatus === "draft").length ?? 0;
      return `${UTC_FULL.format(new Date(event.date))}, ${count} ${count === 1 ? "insight" : "insights"}${drafts ? `, ${drafts} unverified draft${drafts === 1 ? "" : "s"}` : ""}, ${index + 1} of ${days.length}`;
    },
    [days],
  );

  // While the timeline shell is mounted it owns the viewport: suppress the
  // shared site header/footer for this route only (see globals.css), so the
  // island is the single navigation surface. Reverts on unmount.
  useEffect(() => {
    document.body.dataset.homeV2 = "true";
    return () => {
      delete document.body.dataset.homeV2;
    };
  }, []);

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <IslandNav current="Today" />
      {/* sr-only product heading: the visual surface is the timeline itself. */}
      <h1 className="sr-only">Hansa: a daily data insight</h1>
      {/* The stage starts below the island so the cables appear to hang from
          it; the 72px offset matches the plan and the fork's height math. The
          layout's own <main id="main"> remains the page's main landmark. */}
      <div className="pt-[72px]">
        {today ? <Timeline
          key={today}
          events={events}
          defaultValue={events[events.length - 1]?.id}
          onOpen={onOpen}
          itemWidth={340}
          years
          ruler
          cables
          formatDate={(date) => UTC_DAY.format(date).replace(",", "")}
          formatYear={(date) => UTC_MONTH.format(date)}
          announce={announce}
          aria-label="Daily insight timeline"
        /> : <p role="status" className="mx-auto max-w-md px-4 py-16 text-center">Loading today’s insights…</p>}
        {/* Day list (plan §12): every day reachable as a link in the
            prerendered HTML, independent of the timeline's JavaScript. */}
        <nav aria-label="All days" className="sr-only">
          <ul>
            {days.map((day) => {
              const drafts = day.insights.filter(
                (insight) => insight.reviewStatus === "draft",
              ).length;
              return (
                <li key={day.date}>
                  <Link href={dayHref(day.date)}>
                    <time dateTime={day.date}>{UTC_FULL.format(new Date(day.date))}</time> —{" "}
                    {day.insights.length}{" "}
                    {day.insights.length === 1 ? "insight" : "insights"}
                    {drafts
                      ? ` (${drafts} unverified draft${drafts === 1 ? "" : "s"})`
                      : ""}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
