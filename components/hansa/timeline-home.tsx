"use client";

// Level 1 of the redesigned Home (redesign plan §2, §8–9): the island
// navigation and the forked beUI Timeline occupying the stage. Selecting a
// day centres it; activating the centred day again opens the day layer
// (/day/[date], Stage D). Dates, titles, topics and review statuses come from
// the existing fail-closed insight feed — nothing is invented.

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { Timeline } from "@/components/hansa/day-timeline";
import { DayMedia } from "@/components/hansa/day-media";
import { IslandNav } from "@/components/hansa/island-nav";
import type { DayLedgerDay } from "@/lib/knowledge/day-ledger";

const UTC_DAY = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "2-digit",
  timeZone: "UTC",
});
const UTC_MONTH = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
const UTC_FULL = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function TimelineHome({ days, defaultDay }: { days: DayLedgerDay[]; defaultDay?: string }) {
  const router = useRouter();

  const events = days.map((day) => ({
    id: day.date,
    date: day.date,
    title: day.insights[0]?.title ?? day.date,
    media: <DayMedia day={day} />,
    meta: (
      <span>
        {day.insights.length} {day.insights.length === 1 ? "insight" : "insights"}
      </span>
    ),
  }));

  const onOpen = useCallback(
    (id: string) => {
      router.push(`/day/${id}/`);
    },
    [router],
  );

  const announce = useCallback(
    (event: { date: string | Date }, index: number) =>
      `${UTC_FULL.format(new Date(event.date))}, ${days[index]?.insights.length ?? 0} ${days[index]?.insights.length === 1 ? "insight" : "insights"}, ${index + 1} of ${days.length}`,
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
        <Timeline
          events={events}
          defaultValue={defaultDay ?? events[events.length - 1]?.id}
          onOpen={onOpen}
          itemWidth={340}
          years
          ruler
          cables
          formatDate={(date) => UTC_DAY.format(date).replace(",", "")}
          formatYear={(date) => UTC_MONTH.format(date)}
          announce={announce}
          aria-label="Daily insight timeline"
        />
      </div>
    </div>
  );
}
