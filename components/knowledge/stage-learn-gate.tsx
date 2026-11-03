// Gate 2 — the Learn Gate. A full-viewport hand-off into the learning
// catalogue: a curated row of real destinations (lib/catalogue.ts verbatim —
// titles, purposes, honest "inside" counts) and the catalogue totals with the
// repo's own number ticker. Every link leaves the landing for the real page.

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LEARNING_ENTRIES, LEARNING_TOTALS } from "@/lib/catalogue";
import { NumberTicker } from "@/components/motion/number-ticker";

/** The catalogue destinations the gate surfaces, in reading order. */
const GATE_IDS = ["dp600-academy", "data-visualization", "statistics", "fabric-rti", "arabic"] as const;

export function StageLearnGate() {
  const entries = GATE_IDS.map((id) =>
    LEARNING_ENTRIES.find((entry) => entry.id === id),
  ).filter((entry) => entry !== undefined);

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col justify-center px-5 py-12 md:px-8">
      <p className="stage-kicker">The Learn Gate</p>
      <h2 id="stage-learn-title" className="stage-gate-title">
        Learn the <em>craft</em>.
      </h2>
      <p className="stage-section-note">
        Courses, references and labs built the same way as the insight above:
        every claim sourced, every count real. {LEARNING_TOTALS.courses} courses,{" "}
        {LEARNING_TOTALS.references} references and{" "}
        {LEARNING_TOTALS.interactiveLabs} interactive labs are open now.
      </p>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <li key={entry.id}>
            <Link
              href={entry.href}
              className="group flex h-full flex-col rounded-2xl border border-border bg-card/60 p-5 transition-colors hover:border-border-strong hover:bg-card"
            >
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                {entry.kind}
              </span>
              <span className="mt-2 text-[15px] font-medium leading-6">{entry.title}</span>
              <span className="mt-1.5 text-xs leading-6 text-muted-foreground">
                {entry.purpose}
              </span>
              <span className="mt-3 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {entry.inside}
              </span>
              <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary">
                {entry.linkLabel}
                <ArrowUpRight
                  className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
        <p className="stage-status">
          <span>
            <NumberTicker value={LEARNING_TOTALS.chapters} /> course chapters
          </span>
          <span>
            <NumberTicker value={LEARNING_TOTALS.arabicLessons} /> Arabic lessons
          </span>
        </p>
        <Link
          href="/learn"
          className="press inline-flex h-11 items-center gap-2 rounded-full border border-transparent bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          Open the learning catalogue
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
