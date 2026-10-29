"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  Code2,
  Database,
  Layers,
  Search,
  Sigma,
  Table2,
  Trophy,
} from "lucide-react";
import type { ExamSummary } from "@/lib/exams";
import { useLabStore } from "@/lib/lab-storage";
import { cn } from "@/lib/utils";

const ICONS = {
  database: Database,
  chart: BarChart3,
  table: Table2,
  code: Code2,
  sigma: Sigma,
  layers: Layers,
} as const;

const TOPIC_ICON: Record<string, keyof typeof ICONS> = {
  SQL: "database",
  "Power BI": "chart",
  Excel: "table",
  Python: "code",
  Statistics: "sigma",
  Fundamentals: "layers",
};

const TOPIC_CHIP: Record<string, string> = {
  SQL: "bg-primary/10 text-primary",
  "Power BI": "bg-warning/15 text-foreground",
  Excel: "bg-success/15 text-foreground",
  Python: "bg-violet/15 text-foreground",
  Statistics: "bg-accent/20 text-foreground",
  Fundamentals: "bg-rose-500/10 text-foreground",
};

export function ExamCatalog({ exams }: { exams: ExamSummary[] }) {
  const [topic, setTopic] = useState("All");
  const [query, setQuery] = useState("");
  const store = useLabStore();

  const topics = useMemo(
    () => ["All", ...Array.from(new Set(exams.map((exam) => exam.topic)))],
    [exams],
  );

  const filtered = exams.filter((exam) => {
    const matchesTopic = topic === "All" || exam.topic === topic;
    const needle = query.trim().toLowerCase();
    const matchesQuery =
      !needle ||
      exam.title.toLowerCase().includes(needle) ||
      exam.description.toLowerCase().includes(needle) ||
      exam.topic.toLowerCase().includes(needle);
    return matchesTopic && matchesQuery;
  });

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/40 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by topic">
          {topics.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTopic(item)}
              aria-pressed={topic === item}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs transition-colors",
                topic === item
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>
        <label className="relative block sm:w-56">
          <span className="sr-only">Search exams</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search exams…"
            className="h-9 w-full rounded-full border border-border bg-background pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground focus:border-primary"
          />
        </label>
      </div>

      <p className="mt-4 text-xs text-muted-foreground" aria-live="polite">
        {filtered.length} exam{filtered.length === 1 ? "" : "s"} ·{" "}
        {filtered.reduce((sum, exam) => sum + exam.questionCount, 0)} questions
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((exam) => {
          const Icon = ICONS[TOPIC_ICON[exam.topic] ?? "layers"];
          const score = store[exam.slug]?.best;
          return (
            <Link
              key={exam.slug}
              href={`/lab/${exam.slug}`}
              className="group flex flex-col rounded-3xl border border-border bg-card/50 p-5 transition-colors hover:border-border-strong hover:bg-card"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    TOPIC_CHIP[exam.topic] ?? "bg-card text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="flex items-center gap-2">
                  {score !== undefined ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      <Trophy className="h-2.5 w-2.5 text-warning" aria-hidden="true" />
                      {score}%
                    </span>
                  ) : null}
                  <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {exam.level}
                  </span>
                </div>
              </div>

              <h3 className="mt-4 text-base font-medium tracking-tight">{exam.title}</h3>
              <p className="mt-1.5 flex-1 text-xs leading-6 text-muted-foreground">
                {exam.description}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
                <span className="font-mono">
                  {exam.questionCount} Q · {exam.durationMinutes} min · {exam.passMark}%
                </span>
                <span className="inline-flex items-center gap-1 text-foreground">
                  Open
                  <ArrowRight
                    className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-dashed border-border p-10 text-center">
          <p className="text-sm font-medium">No exams match that filter.</p>
          <button
            type="button"
            onClick={() => {
              setTopic("All");
              setQuery("");
            }}
            className="mt-2 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Clear filters
          </button>
        </div>
      ) : null}
    </div>
  );
}
