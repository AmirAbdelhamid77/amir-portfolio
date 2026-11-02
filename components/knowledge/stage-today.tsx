"use client";
// Gate 0 — TODAY. The date is the hero: it fills the screen and hides
// everything else. Clicking the CTA swaps the date for a full-viewport card
// table (the existing KnowledgeDealer), and dealing the deck reveals today's
// insight cards; a plain anchor hands over to the reading gate below.
//
// The date is presentational only: the server renders the latest edition's
// date as the honest no-JS fallback, and an effect swaps in the visitor's live
// local date after hydration. No storage is read or written (a landing guard).
// Reduced motion and small screens get the takeover swap without animation.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowDown, X } from "lucide-react";

type StageTodayProps = {
  /** The latest edition's date label (server-rendered fallback). */
  editionDateLabel: string;
  topic: string;
  editions: number;
  connections: { pending: boolean; links: number };
  /** The stage-built dealer (cards, reader panel and callbacks included). */
  dealer: ReactNode;
  dealerStatus: string;
};

function liveDateLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date())
    .toUpperCase();
}

export function StageToday({
  editionDateLabel,
  topic,
  editions,
  connections,
  dealer,
  dealerStatus,
}: StageTodayProps) {
  // `null` until mounted: server render and the first client frame show the
  // edition's date, so hydration matches. The live date is display-only, and
  // the swap is deferred to a frame so it never cascades a render mid-commit.
  const [today, setToday] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setToday(liveDateLabel()));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Escape closes the takeover and hands focus back to the CTA that opened it.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        ctaRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const headline = today ?? editionDateLabel;

  return (
    <div className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-5 md:px-8">
      {!open ? (
        <div className="my-auto py-10">
          <p className="stage-kicker">Today · the daily insight</p>
          <h1 id="stage-today-title" className="stage-date">
            {headline}
          </h1>
          <p className="stage-manifesto">
            One idea a day, dealt like a card: the claim, its caveat and its
            source — nothing generated, everything checked.
          </p>
          <div className="stage-today-ctas">
            {/* A client state swap, not a navigation: the takeover replaces
                this gate's content in place, so this is a real button. */}
            <button
              ref={ctaRef}
              type="button"
              onClick={() => setOpen(true)}
              className="press inline-flex h-11 items-center gap-2 rounded-full border border-transparent bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Deal today&rsquo;s insight
              <ArrowDown className="size-4" aria-hidden="true" />
            </button>
          </div>
          <p className="stage-status mt-8">
            <span>
              <span className="dot" aria-hidden="true" />
              {topic} · {editions} preview editions
            </span>
            <span>
              {connections.pending
                ? "Atlas semantic layer awaiting publication"
                : `${connections.links} published connections`}
            </span>
          </p>
        </div>
      ) : (
        <div
          className="stage-takeover"
          id="today-deal"
          role="region"
          aria-label="Today's insight card table"
        >
          <div className="stage-takeover-head">
            <span>
              {headline} · latest edition {editionDateLabel}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={() => {
                setOpen(false);
                ctaRef.current?.focus();
              }}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-4 text-xs hover:bg-card"
            >
              <X className="size-3.5" aria-hidden="true" />
              Close the table
            </button>
          </div>

          {dealer}

          <div className="stage-today-ctas justify-center">
            {/* Hash navigation hands the reader to the reading gate below; the
                takeover closes so coming back up restores the date. */}
            <a
              href="#today"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border-strong bg-background px-5 text-sm font-medium hover:bg-card"
            >
              Read the full edition
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
          </div>
          <p role="status" aria-live="polite" className="sr-only">
            {dealerStatus}
          </p>
        </div>
      )}
    </div>
  );
}
