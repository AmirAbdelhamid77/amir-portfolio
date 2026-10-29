import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  KIND_LABEL,
  MODE_LABEL,
  type CatalogueEntry,
} from "@/lib/catalogue";

/**
 * One catalogue card, one link.
 *
 * The whole card is deliberately *not* clickable: a card wrapped in an anchor
 * would either need a second "Start" link (two links to one place, a 2.4.4
 * problem) or swallow the description into the link name. The single action
 * carries a descriptive label so it still makes sense in a screen-reader link
 * list, which repeated "Start" text does not.
 */
export function CatalogueCard({ entry }: { entry: CatalogueEntry }) {
  return (
    <article className="flex flex-col rounded-3xl border border-border bg-card/40 p-5 transition-colors hover:border-border-strong sm:p-6">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full border border-border-strong bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {KIND_LABEL[entry.kind]}
        </span>
        {entry.modes.map((mode) => (
          <span
            key={mode}
            className="rounded-full bg-foreground/[0.06] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/70"
          >
            {MODE_LABEL[mode]}
          </span>
        ))}
      </div>

      <h3 className="mt-3 text-base font-medium tracking-tight text-foreground">
        {entry.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{entry.purpose}</p>

      <dl className="mt-4 grid gap-2 text-[11px] leading-5 sm:grid-cols-2">
        <div>
          <dt className="font-mono uppercase tracking-[0.1em] text-muted-foreground">Inside</dt>
          <dd className="text-foreground/80">{entry.inside}</dd>
        </div>
        <div>
          <dt className="font-mono uppercase tracking-[0.1em] text-muted-foreground">Level</dt>
          <dd className="text-foreground/80">{entry.level}</dd>
        </div>
        <div>
          <dt className="font-mono uppercase tracking-[0.1em] text-muted-foreground">Prerequisites</dt>
          <dd className="text-foreground/80">{entry.prerequisites}</dd>
        </div>
        <div>
          <dt className="font-mono uppercase tracking-[0.1em] text-muted-foreground">Practice</dt>
          <dd className="text-foreground/80">{entry.practice ?? "No linked question bank"}</dd>
        </div>
        <div>
          <dt className="font-mono uppercase tracking-[0.1em] text-muted-foreground">Language</dt>
          <dd className="text-foreground/80">{entry.languages.join(" · ")}</dd>
        </div>
      </dl>

      {entry.caveat ? (
        <p className="mt-3 text-[11px] leading-5 text-muted-foreground">{entry.caveat}</p>
      ) : null}

      <Link
        href={entry.href}
        className="group mt-auto inline-flex min-h-10 items-center gap-1.5 pt-4 text-sm font-medium text-foreground"
      >
        {entry.linkLabel}
        <ArrowRight
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden="true"
        />
      </Link>
    </article>
  );
}
