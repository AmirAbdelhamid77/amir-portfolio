"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import {
  KIND_LABEL,
  KIND_ORDER,
  searchDocuments,
  type SearchDocument,
  type SearchKind,
  type SearchLanguage,
} from "@/lib/search/query";
import type { SubjectId } from "@/lib/fabric/types";
import { cn } from "@/lib/utils";

/** Curated queries the index is known to answer; used as an empty-state path out. */
const SUGGESTIONS = [
  { label: "p-value", query: "p-value" },
  { label: "Direct Lake", query: "Direct Lake" },
  { label: "DAX", query: "DAX" },
  { label: "box plot", query: "box plot" },
  { label: "المدرج التكراري", query: "المدرج التكراري" },
];

const LANGUAGES: { value: SearchLanguage | "all"; label: string }[] = [
  { value: "all", label: "Any language" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
  { value: "mixed", label: "Mixed" },
];

const PAGE_SIZE = 30;

type FabricState = "idle" | "loading" | "ready" | "error";

export function SearchClient({ documents }: { documents: SearchDocument[] }) {
  const uid = useId();
  const [query, setQuery] = useState("");
  const [kinds, setKinds] = useState<SearchKind[]>([]);
  const [language, setLanguage] = useState<SearchLanguage | "all">("all");
  const [includeFabric, setIncludeFabric] = useState(false);
  const [fabricDocs, setFabricDocs] = useState<SearchDocument[]>([]);
  const [fabricError, setFabricError] = useState(false);
  const fabricRequested = useRef(false);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl+K is an enhancement on top of the visible field, never the only way
  // in: the field is always in the page and in the tab order.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Read shareable filters once, after hydration, then mirror them back. The URL is
  // the external system this effect synchronises with; seeding state from it once
  // is the point, not a render loop.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") ?? "";
    const kindParam = params.get("kind");
    const langParam = params.get("lang") as SearchLanguage | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of window.location
    if (q) setQuery(q);
    if (kindParam) {
      const requested = kindParam.split(",").filter((value): value is SearchKind => value in KIND_LABEL);
      if (requested.length) setKinds(requested);
    }
    if (langParam === "en" || langParam === "ar" || langParam === "mixed") {
      setLanguage(langParam);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (deferredQuery) url.searchParams.set("q", deferredQuery);
    else url.searchParams.delete("q");
    if (kinds.length) url.searchParams.set("kind", kinds.join(","));
    else url.searchParams.delete("kind");
    if (language !== "all") url.searchParams.set("lang", language);
    else url.searchParams.delete("lang");
    window.history.replaceState(null, "", url);
  }, [deferredQuery, kinds, language]);

  // The 834-question shard loads only when asked for, once. Loading state is
  // derived rather than mirrored, so the effect never sets state synchronously.
  useEffect(() => {
    if (!includeFabric || fabricRequested.current) return;
    fabricRequested.current = true;
    let alive = true;
    Promise.all([
      import("@/content/fabric/index.json"),
      import("@/content/fabric/packs.json"),
      import("@/lib/fabric/taxonomy"),
    ])
      .then(([indexModule, packsModule, taxonomy]) => {
        if (!alive) return;
        const entries = indexModule.default as unknown as {
          id: string;
          sourceId: string;
          pack: string;
          topic: string;
          title: string;
          prompt: string;
          subject: string;
          objectiveId: string | null;
        }[];
        const packs = packsModule.default as unknown as { key: string; title: string }[];
        const packTitle = new Map(packs.map((pack) => [pack.key, pack.title]));
        setFabricDocs(
          entries.map((entry) => ({
            id: `fabric-${entry.id}`,
            title: entry.title,
            url: `/lab/dp-600/explore/?question=${encodeURIComponent(entry.id)}`,
            kind: "question" as const,
            summary: entry.prompt,
            topic: [
              taxonomy.SUBJECT_BY_ID.get(entry.subject as SubjectId)?.label ?? entry.topic,
              packTitle.get(entry.pack) ?? entry.pack,
              entry.objectiveId ? `DP-600 ${entry.objectiveId}` : "objective not stated",
            ],
            language: "en" as const,
            level: "intermediate",
            course: "Microsoft Fabric / DP-600",
            sourceId: entry.sourceId,
          })),
        );
      })
      .catch(() => {
        if (alive) setFabricError(true);
      });
    return () => {
      alive = false;
    };
  }, [includeFabric]);

  const fabricState: FabricState = !includeFabric
    ? "idle"
    : fabricDocs.length > 0
      ? "ready"
      : fabricError
        ? "error"
        : "loading";

  const allDocuments = useMemo(
    () => (includeFabric && fabricDocs.length ? [...documents, ...fabricDocs] : documents),
    [documents, fabricDocs, includeFabric],
  );

  const results = useMemo(
    () => searchDocuments(allDocuments, deferredQuery, { kinds, language }),
    [allDocuments, deferredQuery, kinds, language],
  );

  const shown = results.slice(0, visible);
  const toggleKind = (kind: SearchKind) =>
    setKinds((current) =>
      current.includes(kind) ? current.filter((value) => value !== kind) : [...current, kind],
    );
  const reset = () => {
    setQuery("");
    setKinds([]);
    setLanguage("all");
    setVisible(PAGE_SIZE);
  };
  const activeFilters = kinds.length + (language === "all" ? 0 : 1);

  return (
    <div>
      <div className="rounded-3xl border border-border bg-card/40 p-4 sm:p-5">
        <label htmlFor={`${uid}-input`} className="block text-xs font-medium text-foreground">
          Search courses, lessons, sections, labs, questions and case studies
        </label>
        <div className="relative mt-2">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            id={`${uid}-input`}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="p-value, Direct Lake, DAX, box plot, المدرج التكراري…"
            autoComplete="off"
            className="h-11 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
          Matches English and Arabic, ignores diacritics and punctuation, and every token must
          match. <kbd className="rounded border border-border px-1 font-mono text-[10px]">Ctrl</kbd>
          <span aria-hidden="true">/</span>
          <kbd className="rounded border border-border px-1 font-mono text-[10px]">⌘</kbd> +{" "}
          <kbd className="rounded border border-border px-1 font-mono text-[10px]">K</kbd> focuses
          the field; the field itself is always tabbable.
        </p>

        <fieldset className="mt-4">
          <legend className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Type
          </legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {KIND_ORDER.map((kind) => {
              const pressed = kinds.includes(kind);
              return (
                <button
                  key={kind}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => toggleKind(kind)}
                  className={cn(
                    "min-h-8 rounded-full border px-3 text-xs transition-colors",
                    pressed
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground",
                  )}
                >
                  {KIND_LABEL[kind]}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div>
            <label
              htmlFor={`${uid}-lang`}
              className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground"
            >
              Language
            </label>
            <select
              id={`${uid}-lang`}
              value={language}
              onChange={(event) => setLanguage(event.target.value as SearchLanguage | "all")}
              className="ms-2 h-8 rounded-full border border-border bg-background px-2 text-xs"
            >
              {LANGUAGES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={includeFabric}
              onChange={(event) => setIncludeFabric(event.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Include 834 Fabric questions (loads a separate index)
          </label>

          {activeFilters > 0 || query ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-8 items-center gap-1 rounded-full border border-border px-3 text-xs text-muted-foreground hover:border-border-strong hover:text-foreground"
            >
              <X className="h-3 w-3" aria-hidden="true" />
              Clear search and filters
            </button>
          ) : null}
        </div>

        {includeFabric && fabricState !== "ready" ? (
          <p className="mt-3 text-[11px] text-muted-foreground" role="status">
            {fabricState === "error"
              ? "The Fabric question index could not load. The rest of the results still work."
              : "Loading the Fabric question index…"}
          </p>
        ) : null}
      </div>

      <p className="mt-6 text-xs text-muted-foreground" aria-live="polite">
        {results.length} result{results.length === 1 ? "" : "s"}
        {deferredQuery ? ` for “${deferredQuery}”` : ""}
        {kinds.length ? ` · ${kinds.length} type filter${kinds.length === 1 ? "" : "s"}` : ""}
      </p>

      {shown.length === 0 ? (
        <div className="mt-4 rounded-3xl border border-border bg-card/40 p-6">
          <p className="text-sm font-medium">Nothing matched that query.</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            Try a broader term, or start from one of these:
          </p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((suggestion) => (
              <li key={suggestion.label}>
                <Link
                  href={`/search/?q=${encodeURIComponent(suggestion.query)}`}
                  className="inline-flex min-h-8 items-center rounded-full border border-border bg-background px-3 text-xs text-muted-foreground hover:border-border-strong hover:text-foreground"
                >
                  {suggestion.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Or browse the{" "}
            <Link href="/learn/catalogue" className="text-foreground underline underline-offset-4">
              learning catalogue
            </Link>{" "}
            and the{" "}
            <Link href="/practice/catalogue" className="text-foreground underline underline-offset-4">
              practice catalogue
            </Link>
            .
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2">
          {shown.map(({ document }) => (
            <li key={document.id}>
              <Link
                href={document.url}
                className="group block rounded-2xl border border-border bg-card/40 px-4 py-3 transition-colors hover:border-border-strong hover:bg-card/70"
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {KIND_LABEL[document.kind]}
                  </span>
                  {document.course ? (
                    <span className="text-[11px] text-muted-foreground">{document.course}</span>
                  ) : null}
                  {document.language === "ar" ? (
                    <span lang="ar" className="text-[11px] text-muted-foreground">
                      العربية
                    </span>
                  ) : null}
                </span>
                <span
                  className="mt-1.5 block text-sm font-medium text-foreground"
                  lang={document.language === "ar" ? "ar" : undefined}
                  dir={document.language === "ar" ? "rtl" : undefined}
                >
                  {document.title}
                </span>
                {document.summary ? (
                  <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                    {document.summary}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}

      {results.length > shown.length ? (
        <button
          type="button"
          onClick={() => setVisible((current) => current + PAGE_SIZE)}
          className="mt-4 inline-flex min-h-10 items-center rounded-full border border-border px-4 text-xs text-muted-foreground hover:border-border-strong hover:text-foreground"
        >
          Show {Math.min(PAGE_SIZE, results.length - shown.length)} more of {results.length}
        </button>
      ) : null}
    </div>
  );
}
