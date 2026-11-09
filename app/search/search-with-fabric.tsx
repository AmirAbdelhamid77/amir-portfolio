"use client";

// FC07 — the Fabric documentation results band, merged into the /search page.
//
// MERGE CONTRACT (documented for tests/fabric-corpus/search/merge.test.mjs and
// docs/fabric-corpus/reports/fc07-report.md):
//
//   Band 1 — the existing metadata results. Rendered by the untouched
//   components/search/search-client.tsx over the existing metadata index
//   (lib/search/documents.ts → buildSearchIndexPayload). Existing scores,
//   de-duplication, groups and order are unchanged byte-for-byte; the
//   merge-regression test freezes the current top-10 for five fixture queries.
//
//   Band 2 — Fabric documentation results ("fabric-docs" rows), ranked ONLY by
//   lib/search/fabric-scorer.ts (score desc, logicalPath asc) and capped at
//   FABRIC_RESULT_LIMIT. Rows link to article anchors via next/link with the
//   unprefixed logical path — the same link rendering the metadata rows use
//   (Next applies the base path to Link hrefs itself; the base path is applied
//   exactly once, per RELEASE_AND_STORAGE.md).
//
//   NO INTERLEAVING. The two scorers use incommensurate scales (metadata:
//   whole-field hit weights with kind priority; fabric: field-weighted term
//   frequency saturation). A single interleaved order would require a proven
//   deterministic mapping between two unrelated scales — none exists — so the
//   stable merge is two bands in fixed order. Proven-deterministic interleaving
//   could be added later only with a shared scale; this component documents
//   that boundary explicitly.
//
//   Filters: the metadata kind chips filter band 1 only. The fabric band is
//   its own result type; hiding it behind metadata kind chips would strand it
//   behind a filter set that does not describe it.
//
// QUERY SEAM (integration point for the lead): SearchClient owns the query
// state and mirrors it to the URL (`q=`). It cannot be modified (components/**
// is outside FC07's write area), so this band tracks the query through the
// URL (mount + popstate) and through the native `input` events of the page's
// search input (React controlled inputs emit real DOM events that bubble).
// If the lead later approves a small SearchClient refactor (e.g. an optional
// `onQueryChange` prop), this listener should be replaced by that prop.
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { SearchClient } from "@/components/search/search-client";
import type { SearchDocument } from "@/lib/search/query";
import {
  FabricSearch,
  type FabricSearchOutcome,
} from "@/lib/search/fabric-shards";
import {
  FABRIC_RESULT_LIMIT,
  type FabricHit,
} from "@/lib/search/fabric-scorer";
import { createFabricWorkerClient, type FabricWorkerClient } from "@/lib/search/fabric-worker-client";

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

function FabricRow({ hit, tokens }: { hit: FabricHit; tokens: string[] }) {
  const href = hit.anchor ? `${hit.logicalPath}#${hit.anchor}` : hit.logicalPath;
  return (
    <li>
      <Link
        href={href}
        className="group block rounded-2xl border border-border bg-card/40 px-4 py-3 transition-colors hover:border-border-strong hover:bg-card/70"
      >
        <span className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Fabric docs
          </span>
          {hit.family ? <span className="text-[11px] text-muted-foreground">{hit.family}</span> : null}
        </span>
        <span className="mt-1.5 block text-sm font-medium text-foreground">
          {highlight(hit.title, tokens)}
        </span>
        {hit.snippet ? (
          <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{hit.snippet}</span>
        ) : null}
        {hit.heading ? (
          <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            § {highlight(hit.heading, tokens)}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

type BandState = {
  status: FabricSearchOutcome["status"] | "idle";
  hits: FabricHit[];
  tokens: string[];
  partial: boolean;
  failedShards: string[];
  loadedShards: number;
  candidateShards: number;
  /** The query this state answers; display derives "loading" when stale. */
  query: string;
};

const EMPTY_STATE: BandState = {
  status: "idle",
  hits: [],
  tokens: [],
  partial: false,
  failedShards: [],
  loadedShards: 0,
  candidateShards: 0,
  query: "",
};

/**
 * Wraps the existing metadata search (untouched) and renders the Fabric
 * documentation band below it. See the merge contract above.
 */
export function SearchWithFabric({
  total,
  featured,
}: {
  total: number;
  featured: SearchDocument[];
}) {
  const [query, setQuery] = useState("");
  const [state, setState] = useState<BandState>(EMPTY_STATE);
  const fabricRef = useRef<FabricSearch | null>(null);
  const workerRef = useRef<FabricWorkerClient | null>(null);
  const latestQueryRef = useRef("");
  if (fabricRef.current == null) {
    fabricRef.current = new FabricSearch();
  }
  if (workerRef.current == null) {
    workerRef.current = createFabricWorkerClient();
  }

  useEffect(() => {
    return () => {
      workerRef.current?.dispose();
    };
  }, []);

  // Query seam: SearchClient mirrors q= to the URL on every keystroke; native
  // `input` events bubble out of its React-controlled field, so both paths
  // converge here. See QUERY SEAM in the header comment.
  //
  // Listen in the bubble phase, not capture. A capture listener runs before
  // SearchClient's React onChange; its synchronous setState re-renders the
  // controlled field with the old value and React's handler then reads the
  // cleared DOM, so the first keystroke is lost. Bubbling lets the child own
  // the event first and both updates batch into one render.
  useEffect(() => {
    const readUrl = () => {
      const params = new URLSearchParams(window.location.search);
      setQuery(params.get("q") ?? "");
    };
    readUrl();
    const onInput = (event: Event) => {
      const target = event.target;
      if (target instanceof HTMLInputElement && target.type === "search") {
        setQuery(target.value);
      }
    };
    const onPop = () => readUrl();
    document.addEventListener("input", onInput);
    window.addEventListener("popstate", onPop);
    return () => {
      document.removeEventListener("input", onInput);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  const deferredQuery = query.trim();

  // Pipeline: collect (manifest → routing → candidate shards) on the main
  // thread, scoring in the Worker. All setState calls happen inside the async
  // callback — never synchronously in the effect body — and every completion
  // checks it still answers the newest query before landing.
  useEffect(() => {
    const fabric = fabricRef.current;
    const worker = workerRef.current;
    if (!fabric || !worker || !deferredQuery) return;
    latestQueryRef.current = deferredQuery;
    const controller = new AbortController();
    (async () => {
      try {
        const collected = await fabric.collect(deferredQuery, controller.signal);
        if (controller.signal.aborted || latestQueryRef.current !== deferredQuery) return;
        if (collected.status !== "ok") {
          setState({ ...EMPTY_STATE, status: collected.status, query: deferredQuery, tokens: collected.tokens });
          return;
        }
        const hits = await worker.score(deferredQuery, collected.shards, FABRIC_RESULT_LIMIT);
        if (controller.signal.aborted || latestQueryRef.current !== deferredQuery) return;
        setState({
          status: "ok",
          hits,
          tokens: collected.tokens,
          partial: collected.partial,
          failedShards: collected.failedShards,
          loadedShards: collected.loadedShards,
          candidateShards: collected.candidateShards,
          query: deferredQuery,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (latestQueryRef.current !== deferredQuery) return;
        setState({ ...EMPTY_STATE, status: "unavailable", query: deferredQuery });
      }
    })();
    return () => {
      controller.abort();
    };
  }, [deferredQuery]);

  // Derived view: state that does not answer the current query renders as
  // loading (never stale results) without a cascading setState.
  const view = viewFor(state, deferredQuery);
  const hasQuery = deferredQuery.length > 0;
  const hidden =
    !hasQuery ||
    view.status === "missing" ||
    (view.status === "ok" && view.hits.length === 0 && !view.partial);

  // Keep SearchClient at the same tree position whether or not the Fabric
  // band is visible. Returning it alone in one branch and as the first child
  // of a fragment in the other remounts the controlled input and clears the
  // query on the first keystroke.
  return (
    <>
      <SearchClient total={total} featured={featured} />
      {hidden ? null : (
        <section className="mt-8" aria-label="Fabric documentation results">
          <h2 className="text-sm font-medium">Fabric documentation</h2>
          <p className="mt-1 text-xs text-muted-foreground" role="status" aria-live="polite">
            {statusText(view)}
          </p>
          {view.status === "ok" && view.hits.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {view.hits.map((hit) => (
                <FabricRow key={hit.articleId} hit={hit} tokens={view.tokens} />
              ))}
            </ul>
          ) : null}
          {view.status === "ok" && !view.partial && view.hits.length === 0 ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Nothing matched in the Fabric documentation corpus for this query.
            </p>
          ) : null}
          <p className="mt-3 text-[11px] leading-5 text-muted-foreground">
            Full-text matches inside published Fabric articles (Microsoft Learn, CC BY 4.0), opened at the
            matching section. Ranked after the lesson results above.
          </p>
        </section>
      )}
    </>
  );
}

function viewFor(state: BandState, query: string): BandState {
  if (!query) return EMPTY_STATE;
  if (state.query === query) return state;
  return { ...EMPTY_STATE, status: "idle", query };
}

function statusText(view: BandState): string {
  if (view.status === "idle") return "Searching the Fabric documentation index…";
  if (view.status === "ok" && view.partial) {
    return `Partial results — ${view.failedShards.length} of ${
      view.failedShards.length + view.loadedShards
    } index shards did not load; matches below come from the rest.`;
  }
  if (view.status === "ok") {
    return `${view.hits.length} match${view.hits.length === 1 ? "" : "es"} in the Microsoft Fabric documentation corpus`;
  }
  if (view.status === "version-drift") {
    return "The Fabric documentation index is updating; the band is temporarily unavailable. Reload to pick up the new version.";
  }
  return "The Fabric documentation index could not load right now. The lesson results above still work.";
}
