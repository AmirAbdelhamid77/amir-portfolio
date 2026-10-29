"use client";

// The question-bank explorer: one dataset, one filter pipeline (shared with the
// session builder), and a detail pane that keeps the full question, its
// rationales and its sources readable without leaving the list.

import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  CircleDashed,
  Filter,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { QuestionView } from "@/components/fabric/question-view";
import { Callout, DataTable } from "@/components/fabric/ui";
import {
  CASE_BY_ID,
  PACKS,
  PACK_BY_KEY,
  SOURCE_BY_ID,
  loadIndex,
  loadQuestions,
  objectiveLabel,
  packLabel,
  subjectLabel,
  videoUrl,
} from "@/lib/fabric/data";
import { filterEntries, type StatusFilter } from "@/lib/fabric/engine";
import { learnerFromStore, toggleBookmark, useFabricStore } from "@/lib/fabric/storage";
import { OBJECTIVES, SUBJECTS } from "@/lib/fabric/taxonomy";
import type { FabricIndexEntry, FabricQuestion, Scope, SubjectId } from "@/lib/fabric/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 40;

interface Filters {
  q: string;
  pack: string;
  subject: string;
  objective: string;
  scope: string;
  type: string;
  status: StatusFilter;
  difficulty: string;
}

const EMPTY_FILTERS: Filters = {
  q: "",
  pack: "all",
  subject: "all",
  objective: "all",
  scope: "all",
  type: "all",
  status: "all",
  difficulty: "all",
};

export function Explorer() {
  const { store } = useFabricStore();
  const learner = useMemo(() => learnerFromStore(store), [store]);

  const [entries, setEntries] = useState<FabricIndexEntry[] | null>(null);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(false);
  const deferredQuery = useDeferredValue(filters.q);
  const listRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  // URL is the source of truth for shareable links; read it once, then keep it
  // in sync without triggering a client-side navigation. The window only exists
  // after hydration, so this cannot be initial state.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the URL is the external system this effect synchronises with
    setFilters({
      q: params.get("q") ?? params.get("search") ?? "",
      pack: params.get("pack") ?? "all",
      subject: params.get("subject") ?? "all",
      objective: params.get("objective") ?? "all",
      scope: params.get("scope") ?? "all",
      type: params.get("type") ?? "all",
      status: (params.get("status") as StatusFilter) ?? "all",
      difficulty: params.get("difficulty") ?? "all",
    });
    const q = params.get("question");
    if (q) setSelectedId(q);
  }, []);

  useEffect(() => {
    let alive = true;
    loadIndex()
      .then((list) => {
        if (alive) setEntries(list);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const results = useMemo(() => {
    if (!entries) return [];
    const filtered = filterEntries(
      entries,
      {
        packs: filters.pack === "all" ? undefined : [filters.pack],
        subjects: filters.subject === "all" ? undefined : [filters.subject as SubjectId],
        objectives: filters.objective === "all" ? undefined : [filters.objective],
        scopes: filters.scope === "all" ? undefined : [filters.scope as Scope],
        types: filters.type === "all" ? undefined : [filters.type as FabricIndexEntry["type"]],
        difficulties:
          filters.difficulty === "all"
            ? undefined
            : filters.difficulty === "none"
              ? [-1]
              : [Number(filters.difficulty)],
        status: filters.status,
      },
      learner,
    );
    const needle = deferredQuery.trim().toLowerCase();
    if (!needle) return filtered;
    const tokens = needle.split(/\s+/);
    return filtered.filter((entry) => {
      const haystack = `${entry.sourceId} ${entry.title} ${entry.prompt} ${entry.topic} ${packLabel(entry.pack)}`.toLowerCase();
      return tokens.every((token) => haystack.includes(token));
    });
  }, [entries, filters, deferredQuery, learner]);

  // The selection is derived, not mirrored: if the current filters exclude the
  // chosen question, the first result stands in without another render cycle.
  const selectedEntry =
    results.find((entry) => entry.id === selectedId) ?? results[0] ?? null;

  const select = useCallback((id: string) => {
    setSelectedId(id);
    setVisible(PAGE_SIZE);
    const url = new URL(window.location.href);
    url.searchParams.set("question", id);
    window.history.replaceState(null, "", url);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      window.setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    }
  }, []);

  const setFilter = useCallback(<K extends keyof Filters>(key: K, value: Filters[K]) => {
    setVisible(PAGE_SIZE);
    setFilters((current) => ({ ...current, [key]: value }));
    const url = new URL(window.location.href);
    if (value === "all" || value === "") url.searchParams.delete(key === "q" ? "search" : key);
    else url.searchParams.set(key === "q" ? "search" : key, String(value));
    window.history.replaceState(null, "", url);
  }, []);

  const activeFilters =
    (filters.pack !== "all" ? 1 : 0) +
    (filters.subject !== "all" ? 1 : 0) +
    (filters.objective !== "all" ? 1 : 0) +
    (filters.scope !== "all" ? 1 : 0) +
    (filters.type !== "all" ? 1 : 0) +
    (filters.status !== "all" ? 1 : 0) +
    (filters.difficulty !== "all" ? 1 : 0);

  return (
    <div>
      <div className="sticky top-14 z-20 -mx-4 border-b border-border bg-background/85 px-4 py-3 backdrop-blur-xl md:-mx-6 md:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search questions</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={filters.q}
              onChange={(event) => setFilter("q", event.target.value)}
              placeholder="Search Direct Lake, deployment pipeline, VACUUM…"
              className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-9 text-xs outline-none placeholder:text-muted-foreground focus:border-primary"
            />
            {filters.q ? (
              <button
                type="button"
                onClick={() => setFilter("q", "")}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : null}
          </label>

          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            aria-expanded={showFilters}
            className={cn(
              "press inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-xs",
              activeFilters > 0
                ? "border-foreground/30 bg-foreground/5 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            <Filter className="h-3.5 w-3.5" aria-hidden="true" />
            Filters
            {activeFilters > 0 ? <span className="font-mono">{activeFilters}</span> : null}
          </button>

          <span className="font-mono text-[11px] text-muted-foreground" aria-live="polite">
            {entries ? `${results.length} of ${entries.length}` : "loading…"}
          </span>
        </div>

        {showFilters ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              label="Source pack"
              value={filters.pack}
              onChange={(value) => setFilter("pack", value)}
              options={[
                { value: "all", label: "All packs" },
                ...PACKS.map((pack) => ({ value: pack.key, label: `${pack.title} (${pack.questionCount})` })),
              ]}
            />
            <Select
              label="Fabric topic"
              value={filters.subject}
              onChange={(value) => setFilter("subject", value)}
              options={[
                { value: "all", label: "Any topic" },
                ...SUBJECTS.map((subject) => ({ value: subject.id, label: subject.label })),
              ]}
            />
            <Select
              label="DP-600 objective"
              value={filters.objective}
              onChange={(value) => setFilter("objective", value)}
              options={[
                { value: "all", label: "Any objective" },
                ...OBJECTIVES.map((objective) => ({
                  value: objective.id,
                  label: `${objective.id} · ${objective.label}`,
                })),
              ]}
            />
            <Select
              label="Question type"
              value={filters.type}
              onChange={(value) => setFilter("type", value)}
              options={[
                { value: "all", label: "Any type" },
                { value: "single", label: "Single answer" },
                { value: "multi", label: "Multi-select" },
                { value: "sequence", label: "Ordered sequence" },
              ]}
            />
            <Select
              label="Alignment"
              value={filters.scope}
              onChange={(value) => setFilter("scope", value)}
              options={[
                { value: "all", label: "Any alignment" },
                { value: "core", label: "DP-600 focused" },
                { value: "support", label: "DP-600 supporting" },
                { value: "adjacent", label: "DP-700 adjacent" },
                { value: "review", label: "Needs review" },
              ]}
            />
            <Select
              label="Difficulty"
              value={filters.difficulty}
              onChange={(value) => setFilter("difficulty", value)}
              options={[
                { value: "all", label: "Any difficulty" },
                { value: "4", label: "4 / 5" },
                { value: "5", label: "5 / 5" },
                { value: "none", label: "Not supplied" },
              ]}
            />
            <Select
              label="Your status"
              value={filters.status}
              onChange={(value) => setFilter("status", value as StatusFilter)}
              options={[
                { value: "all", label: "Any status" },
                { value: "unattempted", label: "Never attempted" },
                { value: "incorrect", label: "Last answer wrong" },
                { value: "bookmarked", label: "Bookmarked" },
                { value: "flagged", label: "Flagged" },
                { value: "repeated", label: "Wrong twice or more" },
              ]}
            />
            {activeFilters > 0 || filters.q ? (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setFilters(EMPTY_FILTERS);
                    window.history.replaceState(null, "", window.location.pathname);
                  }}
                  className="inline-flex h-10 items-center gap-1.5 rounded-full border border-border px-3.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                  Clear all filters
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div ref={listRef}>
          {!entries ? (
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-card/40 p-4 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading the question index…
            </div>
          ) : results.length === 0 ? (
            <Callout tone="warning" title="No question matches those filters">
              Filters combine, so a pack plus a topic plus “wrong twice or more” can legitimately
              match nothing. Clear one filter to widen the search.
            </Callout>
          ) : (
            <>
              <ul className="grid gap-1.5">
                {results.slice(0, visible).map((entry) => {
                  const stats = store.questions[entry.id];
                  const active = entry.id === selectedId;
                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => select(entry.id)}
                        aria-current={active ? "true" : undefined}
                        className={cn(
                          "w-full rounded-xl border p-3 text-left transition-colors",
                          active
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card/30 hover:border-border-strong hover:bg-card/60",
                        )}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                            {entry.sourceId} · {packLabel(entry.pack)}
                          </span>
                          <span className="flex shrink-0 items-center gap-1">
                            {store.bookmarks.includes(entry.id) ? (
                              <BookmarkCheck className="h-3 w-3 text-primary" aria-label="Bookmarked" />
                            ) : null}
                            {stats?.attempts ? (
                              stats.lastCorrect ? (
                                <CheckCircle2 className="h-3 w-3 text-success" aria-label="Last answer correct" />
                              ) : (
                                <X className="h-3 w-3 text-destructive" aria-label="Last answer wrong" />
                              )
                            ) : (
                              <CircleDashed className="h-3 w-3 text-muted-foreground" aria-label="Not attempted" />
                            )}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-foreground">{entry.title}</span>
                        <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                          {subjectLabel(entry.subject)} · {entry.type} · {entry.optionCount} options
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {visible < results.length ? (
                <button
                  type="button"
                  onClick={() => setVisible((value) => value + PAGE_SIZE)}
                  className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-border-strong text-xs hover:bg-card"
                >
                  Show {Math.min(PAGE_SIZE, results.length - visible)} more
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </button>
              ) : null}
              <p className="mt-3 text-[11px] text-muted-foreground">
                Showing {Math.min(visible, results.length)} of {results.length} matching questions.
              </p>
            </>
          )}
        </div>

        <div ref={detailRef} className="min-w-0">
          {selectedEntry ? (
            <QuestionDetail
              key={selectedEntry.id}
              entry={selectedEntry}
              onNavigate={(direction) => {
                const index = results.findIndex((item) => item.id === selectedEntry.id);
                const next = results[index + direction];
                if (next) select(next.id);
              }}
              position={{
                index: results.findIndex((item) => item.id === selectedEntry.id) + 1,
                total: results.length,
              }}
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center">
              <p className="text-sm font-medium">Pick a question from the list</p>
              <p className="mx-auto mt-1.5 max-w-sm text-xs leading-6 text-muted-foreground">
                The full stem, every option rationale and the source references appear here. Use the
                search box or the filters to narrow 834 questions down.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-xl border border-border bg-background px-2.5 text-xs outline-none focus:border-primary"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function QuestionDetail({
  entry,
  position,
  onNavigate,
}: {
  entry: FabricIndexEntry;
  position: { index: number; total: number };
  onNavigate: (direction: -1 | 1) => void;
}) {
  const { store } = useFabricStore();
  const [question, setQuestion] = useState<FabricQuestion | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [failed, setFailed] = useState(false);

  // The component is keyed by question id, so selecting another question mounts
  // a fresh instance: no state reset is needed inside the effect.
  useEffect(() => {
    let alive = true;
    loadQuestions([entry.id], new Map([[entry.id, entry.pack]]))
      .then((loaded) => {
        if (!alive) return;
        const found = loaded[0] ?? null;
        setQuestion(found);
        if (found?.type === "sequence") setAnswers(found.options.map((option) => option.id));
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [entry.id, entry.pack]);

  const bookmarked = store.bookmarks.includes(entry.id);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate(-1)}
            disabled={position.index <= 1}
            className="press inline-flex h-8 items-center gap-1 rounded-full border border-border px-2.5 text-[11px] disabled:opacity-40"
          >
            <ArrowLeft className="h-3 w-3" aria-hidden="true" />
            Previous
          </button>
          <button
            type="button"
            onClick={() => onNavigate(1)}
            disabled={position.index >= position.total}
            className="press inline-flex h-8 items-center gap-1 rounded-full border border-border px-2.5 text-[11px] disabled:opacity-40"
          >
            Next
            <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </button>
          <span className="font-mono text-[10px] text-muted-foreground">
            {position.index} / {position.total}
          </span>
        </div>
        <button
          type="button"
          onClick={() => toggleBookmark(entry.id)}
          aria-pressed={bookmarked}
          className={cn(
            "press inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-[11px]",
            bookmarked ? "border-foreground/30 bg-foreground/5 text-foreground" : "border-border text-muted-foreground",
          )}
        >
          {bookmarked ? <BookmarkCheck className="h-3 w-3" aria-hidden="true" /> : <Bookmark className="h-3 w-3" aria-hidden="true" />}
          {bookmarked ? "Saved" : "Save"}
        </button>
      </div>

      {failed ? (
        <Callout tone="warning" title="This question failed to load">
          The pack chunk did not arrive. Reload the page; the rest of the bank is unaffected.
        </Callout>
      ) : !question ? (
        <div className="flex items-center gap-2 rounded-3xl border border-border bg-card/40 p-8 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Loading the full question…
        </div>
      ) : (
        <>
          <QuestionView
            question={question}
            order={question.options.map((option) => option.id)}
            value={answers}
            onChange={setAnswers}
            revealed={checked}
            locked={checked}
            index={position.index - 1}
            total={position.total}
            sources={SOURCE_BY_ID}
            caseStudy={question.caseStudyId ? CASE_BY_ID.get(question.caseStudyId) ?? null : null}
            bookmarked={bookmarked}
            flagged={store.flags.includes(entry.id)}
            onToggleBookmark={() => toggleBookmark(entry.id)}
            onToggleFlag={() => undefined}
            packTitle={packLabel(question.pack)}
            videoHref={
              question.sourceVideoUrl ??
              (PACK_BY_KEY.get(question.pack)?.video?.id
                ? videoUrl(PACK_BY_KEY.get(question.pack)!.video!.id, question.videoSeconds)
                : null)
            }
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!checked ? (
              <button
                type="button"
                onClick={() => setChecked(true)}
                disabled={answers.length === 0}
                className="press inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-xs font-medium text-background disabled:opacity-40"
              >
                Check answer
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setChecked(false);
                  setAnswers(question.type === "sequence" ? question.options.map((option) => option.id) : []);
                }}
                className="press inline-flex h-9 items-center gap-2 rounded-full border border-border-strong px-4 text-xs"
              >
                Try again
              </button>
            )}
            <Link
              href="/lab/dp-600/study/"
              className="text-[11px] text-muted-foreground underline decoration-border-strong underline-offset-4 hover:text-foreground"
            >
              Study a set like this
            </Link>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-card/30 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Classification
            </p>
            <div className="mt-2 grid gap-1.5 text-[11px] leading-5 text-muted-foreground">
              <p>
                <span className="text-foreground">Alignment:</span>{" "}
                {entry.scope === "core"
                  ? "DP-600 focused"
                  : entry.scope === "support"
                    ? "DP-600 supporting / topic-derived"
                    : entry.scope === "adjacent"
                      ? "DP-700 adjacent"
                      : "Needs review"}{" "}
                · confidence {entry.confidence}
              </p>
              <p>
                <span className="text-foreground">Objective:</span>{" "}
                {objectiveLabel(entry.objectiveId, entry.domain)}
              </p>
              <p>
                <span className="text-foreground">Fabric topic:</span> {subjectLabel(entry.subject)}
              </p>
              {question.sourceObjective ? (
                <p>
                  <span className="text-foreground">Source objective text:</span>{" "}
                  <span className="italic">“{question.sourceObjective}”</span>
                </p>
              ) : (
                <p>
                  <span className="text-foreground">Source objective text:</span> none supplied by
                  this pack — the mapping above comes from the topic rules, not from the author.
                </p>
              )}
              <p>
                <span className="text-foreground">Origin:</span> {question.origin}
                {question.validation ? ` · ${question.validation}` : ""}
              </p>
            </div>
            <details className="mt-3">
              <summary className="cursor-pointer text-[11px] text-muted-foreground">
                Export this record as a table row
              </summary>
              <div className="mt-2">
                <DataTable
                  caption="Question metadata"
                  head={["Field", "Value"]}
                  rows={[
                    ["Internal id", entry.id],
                    ["Source id", entry.sourceId],
                    ["Type", entry.type],
                    ["Options", entry.optionCount],
                    ["Correct options", entry.answerCount],
                    ["Difficulty", entry.difficulty ?? "not supplied"],
                    ["References", entry.refs.join(", ") || "none"],
                  ]}
                />
              </div>
            </details>
          </div>
        </>
      )}
    </div>
  );
}
