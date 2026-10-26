"use client";
// The archive is the quiet, complete list behind the stage. It stays a plain
// document with a native <details> explanation so it still works with
// JavaScript off; filtering is the only enhancement.

import { useMemo, useState } from "react";
import type { Insight } from "@/lib/knowledge/insights";
import { searchInsights } from "@/lib/knowledge/insights";

export function InsightArchive({
  items,
  onOpen,
}: {
  items: Insight[];
  onOpen: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const topics = useMemo(
    () => [...new Set(items.map((item) => item.topic))],
    [items],
  );
  const results = searchInsights(items, query, topic);

  return (
    <section
      id="archive"
      aria-labelledby="archive-title"
      className="mx-auto mt-8 w-full max-w-[1200px] scroll-mt-24 px-5 pb-20 md:px-8"
    >
      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border-strong pt-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Keep exploring
          </p>
          <h2
            id="archive-title"
            className="mt-2 text-2xl font-medium tracking-tight sm:text-3xl"
          >
            The insight archive
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          {results.length} of {items.length} preview editions
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <label className="min-w-0 flex-1 basis-full text-xs sm:basis-64" htmlFor="archive-query">
          <span className="text-muted-foreground">Search editions</span>
          <input
            id="archive-query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try permissions or Files"
            className="mt-1.5 block min-h-11 w-full rounded-xl border border-border-strong bg-background px-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          />
        </label>
        <label className="text-xs" htmlFor="archive-topic">
          <span className="text-muted-foreground">Topic</span>
          <select
            id="archive-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            className="mt-1.5 block min-h-11 rounded-xl border border-border-strong bg-background px-3 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <option value="all">All topics</option>
            {topics.map((entry) => (
              <option key={entry}>{entry}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setTopic("all");
          }}
          className="min-h-11 self-end rounded-full border border-border-strong px-4 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Clear filters
        </button>
      </div>

      <p role="status" className="mt-3 text-xs text-muted-foreground">
        {results.length === 0
          ? "No preview edition matches that search. Try another term or clear the filters."
          : `${results.length} edition${results.length === 1 ? "" : "s"} available`}
      </p>

      <ul className="mt-4 divide-y divide-border border-y border-border">
        {results.map((item) => (
          <li key={item.id} id={`edition-${item.id}`} className="scroll-mt-24">
            <div className="grid gap-3 py-5 md:grid-cols-[9rem_minmax(0,1fr)_auto] md:items-start">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground tabular-nums">
                <time dateTime={item.date}>{item.date}</time>
                <span className="mt-1 block text-primary">{item.topic}</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-medium tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-1.5 max-w-[68ch] text-[13px] leading-6 text-muted-foreground">
                  {item.scenario}
                </p>
                <details className="group mt-1">
                  <summary className="min-h-11 cursor-pointer list-none py-2.5 text-[13px] font-medium text-foreground underline decoration-border-strong underline-offset-4 marker:hidden hover:decoration-primary">
                    Read the reasoning and source
                  </summary>
                  <div className="pb-2">
                    <p className="max-w-[62ch] text-[13px] leading-6">
                      {item.takeaway}
                    </p>
                    <p className="mt-1.5 max-w-[62ch] text-[13px] leading-6 text-muted-foreground">
                      {item.caveat}
                    </p>
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      {item.sourceLocator} · checked {item.checkedAt} ·{" "}
                      {item.reviewStatus.replace("_", " ")}
                    </p>
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex min-h-11 items-center text-[13px] underline underline-offset-4"
                    >
                      Microsoft Learn source
                    </a>
                  </div>
                </details>
              </div>
              <div className="flex flex-wrap items-start gap-2 md:flex-col md:items-end">
                <button
                  type="button"
                  onClick={() => onOpen(item.id)}
                  className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-4 text-xs font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  Open this edition
                </button>
                <a
                  href={`?insight=${encodeURIComponent(item.id)}`}
                  className="inline-flex min-h-11 items-center px-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Permalink
                </a>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-[80ch] text-[11px] leading-5 text-muted-foreground">
        Source references are independent of the historical question-bank answer
        keys. No question IDs, answers, saved progress or Atlas review states are
        changed by reading this page.
      </p>
    </section>
  );
}
