// DayMedia (redesign plan §9): the timeline card's visual. No stock imagery —
// a large day-of-month numeral, one chip per insight topic (at most 3) and a
// quiet status marker. Pure HTML and CSS, non-interactive: the card itself is
// the button.
//
// Since 2026-11-10 a day can carry a technical-review edition plus labelled
// bank drafts, so the marker shows every distinct status instead of hiding
// the drafts behind the first one.

import type { DayLedgerDay } from "@/lib/knowledge/day-ledger";
import { reviewStatusLabel } from "@/lib/knowledge/review-status";

export function DayMedia({ day }: { day: DayLedgerDay }) {
  const dayOfMonth = Number(day.date.slice(8, 10));
  const statuses = [...new Set(day.insights.map((i) => reviewStatusLabel(i.reviewStatus)))];
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full w-full flex-col justify-between bg-background p-3"
    >
      <span className="pointer-events-none absolute -right-1 -top-3 select-none font-medium leading-none tracking-tighter text-foreground/[0.07] tabular-nums"
        style={{ fontSize: "5.5rem" }}
      >
        {dayOfMonth}
      </span>
      <div className="mt-auto flex flex-wrap items-center gap-1.5">
        {day.insights.slice(0, 3).map((insight) => (
          <span
            key={insight.id}
            className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground"
          >
            {insight.topic}
          </span>
        ))}
      </div>
      {statuses.length ? (
        <div className="mt-1.5 flex flex-col gap-0.5">
          {statuses.map((status) => (
            <span
              key={status}
              className="inline-flex w-fit items-center gap-1 text-[11px] text-muted-foreground"
            >
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full ${
                  status.startsWith("Draft") ? "bg-warning" : "bg-primary/60"
                }`}
              />
              {status}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
