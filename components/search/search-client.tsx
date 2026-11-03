"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import {
  DESTINATION_KINDS,
  KIND_LABEL,
  searchSite,
  type SearchDocument,
  type SearchKind,
  type SearchLanguage,
  type SearchOutcome,
} from "@/lib/search/query";
import { SITE_METRICS } from "@/lib/site-metrics";
import { cn } from "@/lib/utils";

const LANGUAGES: { value: SearchLanguage | "all"; label: string }[] = [
  { value: "all", label: "Any language" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

type Status = "loading" | "ready" | "error";

/** Odd indexes in a one-capture-group split are the matched text. */
function highlight(text: string, tokens: string[]) {
  const usable = tokens
    .filter((token) => token.length >= 2)
    .map((token) => token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (usable.length === 0) return text;
  const parts = text.split(new RegExp(`(${usable.join("|")})`, "gi"));
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <mark key={`${part}-${index}`} className="rounded bg-primary/15 px-0.5 text-foreground">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

function ResultRow({
  document,
  tokens,
  emphasis = false,
}: {
  document: SearchDocument;
  tokens: string[];
  emphasis?: boolean;
}) {
  return (
    <li>
      <Link
        href={document.url}
        className={cn(
          "group block rounded-2xl border border-border bg-card/40 px-4 py-3 transition-colors hover:border-border-strong hover:bg-card/70",
          emphasis && "border-border-strong bg-card/70 px-5 py-4",
        )}
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
          className={cn(
            "mt-1.5 block font-medium text-foreground",
            emphasis ? "text-base" : "text-sm",
          )}
          lang={document.language === "ar" ? "ar" : undefined}
          dir={document.language === "ar" ? "rtl" : undefined}
        >
          {highlight(document.title, tokens)}
        </span>
        {document.summary ? (
          <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
            {document.summary}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

export function SearchClient({
  total,
  featured,
}: {
  total: number;
  featured: SearchDocument[];
}) {
  const uid = useId();
  const [query, setQuery] = useState("");
  const [kinds, setKinds] = useState<SearchKind[]>([]);
  const [language, setLanguage] = useState<SearchLanguage | "all">("all");
  const [documents, setDocuments] = useState<SearchDocument[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [urlReady, setUrlReady] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const url = new URL("index.json", window.location.href);
    fetch(url.toString(), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`index ${response.status}`);
        return response.json() as Promise<{ documents?: SearchDocument[] }>;
      })
      .then((payload) => {
        setDocuments(Array.isArray(payload.documents) ? payload.documents : []);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  // Cmd/Ctrl+K is an enhancement on top of the visible field, never the only
  // way in: the field is always in the page and in the tab order.
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

  // The URL is the external system this page synchronises with: read it on
  // load and on Back/Forward, then mirror changes without a navigation.
  useEffect(() => {
    const apply = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
      const kindParam = params.get("kind");
      const requested = kindParam
        ? kindParam
            .split(",")
            .filter((value): value is SearchKind => value in KIND_LABEL)
            .filter((value) => value !== "question")
        : [];
      setKinds(requested);
      const langParam = params.get("lang");
      setLanguage(langParam === "en" || langParam === "ar" ? langParam : "all");
    };
    apply();
    setUrlReady(true);
    const onPop = () => apply();
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!urlReady) return;
    const url = new URL(window.location.href);
    if (deferredQuery) url.searchParams.set("q", deferredQuery);
    else url.searchParams.delete("q");
    if (kinds.length) url.searchParams.set("kind", kinds.join(","));
    else url.searchParams.delete("kind");
    if (language !== "all") url.searchParams.set("lang", language);
    else url.searchParams.delete("lang");
    window.history.replaceState(null, "", url);
  }, [deferredQuery, kinds, language, urlReady]);

  const outcome = useMemo<SearchOutcome | null>(() => {
    if (!deferredQuery.trim() || documents.length === 0) return null;
    return searchSite(documents, deferredQuery, { kinds, language });
  }, [documents, deferredQuery, kinds, language]);

  const toggleKind = (kind: SearchKind) =>
    setKinds((current) =>
      current.includes(kind) ? current.filter((value) => value !== kind) : [...current, kind],
    );
  const reset = () => {
    setQuery("");
    setKinds([]);
    setLanguage("all");
  };
  const activeFilters = kinds.length + (language === "all" ? 0 : 1);
  const hasQuery = deferredQuery.trim().length > 0;

  return (
    <div>
      <div className="rounded-3xl border border-border bg-card/40 p-4 sm:p-5">
        <label htmlFor={`${uid}-input`} className="block text-xs font-medium text-foreground">
          Search the curriculum
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
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Direct Lake, star schema, p-value, box plot…"
            autoComplete="off"
            className="h-11 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
          One field for lessons, topics, labs and reference. Press{" "}
          <kbd className="rounded border border-border px-1 font-mono text-[10px]">Ctrl</kbd> or{" "}
          <kbd className="rounded border border-border px-1 font-mono text-[10px]">⌘</kbd> +{" "}
          <kbd className="rounded border border-border px-1 font-mono text-[10px]">K</kbd> to focus.
        </p>

        <fieldset className="mt-4">
          <legend className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Type
          </legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {DESTINATION_KINDS.map((kind) => {
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

        {status === "loading" ? (
          <p className="mt-3 text-[11px] text-muted-foreground" role="status">
            Loading the index…
          </p>
        ) : null}
        {status === "error" ? (
          <p className="mt-3 text-[11px] text-muted-foreground" role="status">
            The index could not load. The start-here links below still work.
          </p>
        ) : null}
      </div>

      {!hasQuery ? (
        <section className="mt-8" aria-label="Start here">
          <h2 className="text-sm font-medium">Start here</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Six ways into the {total} indexed destinations.
          </p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {featured.map((document) => (
              <ResultRow key={document.id} document={document} tokens={[]} />
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Or browse the{" "}
            <Link href="/learn" className="text-foreground underline underline-offset-4">
              learning library
            </Link>
            .
          </p>
        </section>
      ) : (
        <>
          <p className="mt-6 text-xs text-muted-foreground" role="status" aria-live="polite">
            {outcome ? `${outcome.shown} result${outcome.shown === 1 ? "" : "s"}` : "Searching…"}
            {outcome?.refine ? " · narrow the query or choose a type to see the rest" : ""}
          </p>

          {outcome && outcome.best ? (
            <section className="mt-4" aria-label="Best match">
              <ul>
                <ResultRow document={outcome.best.document} tokens={outcome.tokens} emphasis />
              </ul>
            </section>
          ) : null}

          {outcome?.groups.map((group) => (
            <section key={group.kind} className="mt-6" aria-label={group.label}>
              <h2 className="flex items-baseline justify-between gap-3 text-xs font-medium">
                <span>{group.label}</span>
                <button
                  type="button"
                  onClick={() => setKinds([group.kind])}
                  className="text-[11px] font-normal text-muted-foreground hover:text-foreground"
                >
                  Filter to {group.label.toLowerCase()}
                </button>
              </h2>
              <ul className="mt-2 space-y-2">
                {group.items.map((row) => (
                  <ResultRow key={row.document.id} document={row.document} tokens={outcome.tokens} />
                ))}
              </ul>
            </section>
          ))}

          {outcome && outcome.total === 0 ? (
            <div className="mt-4 rounded-3xl border border-border bg-card/40 p-6">
              <p className="text-sm font-medium">Nothing matched that query.</p>
              <p className="mt-1 text-xs leading-6 text-muted-foreground">
                Try a broader term, or start with a subject from the learning library.
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                <Link href="/learn" className="text-foreground underline underline-offset-4">
                  Browse the learning library
                </Link>
              </p>
            </div>
          ) : null}

          {hasQuery ? (
            <div className="mt-8 rounded-2xl border border-border bg-card/40 p-4">
              <p className="text-xs font-medium">Looking for a practice question?</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                <Link
                  href={`/lab/dp-600/explore/?q=${encodeURIComponent(deferredQuery)}`}
                  className="inline-flex items-center gap-1 text-foreground underline underline-offset-4"
                >
                  Search {SITE_METRICS.practice.fabricQuestions} Fabric questions
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
                <Link
                  href="/lab/"
                  className="inline-flex items-center gap-1 text-foreground underline underline-offset-4"
                >
                  Analyst question banks
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
