// DayMedia (redesign plan §9): the timeline card's visual. No stock imagery —
// a large day-of-month numeral, one chip per insight topic (at most 3) and a
// quiet status marker. Pure HTML and CSS, non-interactive: the card itself is
// the button.

import type { DayLedgerDay } from "@/lib/knowledge/day-ledger";

const STATUS_LABEL: Record<string, string> = {
  preview: "Preview",
  technical_review: "Technical review",
};

export function DayMedia({ day }: { day: DayLedgerDay }) {
  const dayOfMonth = Number(day.date.slice(8, 10));
  const status = [...new Set(day.insights.map((i) => i.reviewStatus))]
    .map((s) => STATUS_LABEL[s] ?? null)
    .filter(Boolean)[0];
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
      {status ? (
        <span className="mt-1.5 inline-flex w-fit items-center gap-1 text-[11px] text-muted-foreground">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-warning" />
          {status}
        </span>
      ) : null}
    </div>
  );
}
