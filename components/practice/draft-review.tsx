"use client";

// Review surface for the two intake packages staged as disabled drafts.
//
// Rules this component holds, in order of importance:
//   1. No answer is rendered, because none is loaded — the shipped projections
//      were stripped of keys, explanations, per-option rationales and review
//      logs by scripts/build-draft-banks.mjs.
//   2. The banks stay separate: one switcher, one list, one status banner at a
//      time, each question keeping its own package id and status.
//   3. Nothing is written to storage. Existing practice progress lives under
//      the established Fabric and Data Lab keys, and this surface never opens
//      them, so staging a draft cannot reset or rewrite an exam history.

import { useEffect, useMemo, useState } from "react";
import type { DraftBank, DraftQuestion } from "@/lib/drafts/data";
import { draftBody, filterDrafts } from "@/lib/drafts/data";
import { cn } from "@/lib/utils";

type BankId = "dp600-r18" | "pl300-v88" | "notion-28" | "corpus-candidates" | "kengio-dp700" | "chaturcr48-dp600" | "warren-dp600" | "stark-v2-dp600";

const BANK_LABEL: Record<BankId, string> = {
  "dp600-r18": "DP-600 · R18 candidate",
  "pl300-v88": "PL-300 · V88 checkpoint",
  "notion-28": "Creative patterns · 28 candidates",
  "corpus-candidates": "Corpus intake · 37 candidates",
  "kengio-dp700": "DP-700 · kengio community bank (MIT)",
  "chaturcr48-dp600": "DP-600 · chaturcr48 (71 Q)",
  "warren-dp600": "DP-600 · Warren (122 Q)",
  "stark-v2-dp600": "DP-600 · Stark V2 (1,213 Q)",
};

const control = "min-h-11 rounded-xl border border-border-strong bg-background p-3 text-sm";

async function loadBank(id: BankId): Promise<DraftBank> {
  if (id === "notion-28") {
    const loaded = await import("@/content/intake/notion-assessments.json");
    return loaded.default as unknown as DraftBank;
  }
  if (id === "corpus-candidates") {
    const loaded = await import("@/content/drafts/corpus-candidates.json");
    return loaded.default as unknown as DraftBank;
  }
  if (id === "kengio-dp700") {
    const loaded = await import("@/content/drafts/kengio-dp700.json");
    return loaded.default as unknown as DraftBank;
  }
  if (id === "chaturcr48-dp600") {
    const loaded = await import("@/content/drafts/chaturcr48-dp600.json");
    return loaded.default as unknown as DraftBank;
  }
  if (id === "warren-dp600") {
    const loaded = await import("@/content/drafts/warren-dp600.json");
    return loaded.default as unknown as DraftBank;
  }
  if (id === "stark-v2-dp600") {
    const loaded = await import("@/content/drafts/stark-v2-dp600.json");
    return loaded.default as unknown as DraftBank;
  }
  const loaded =
    id === "dp600-r18"
      ? await import("@/content/drafts/dp600-r18.json")
      : await import("@/content/drafts/pl300-v88.json");
  return loaded.default as unknown as DraftBank;
}

export function DraftReview() {
  const [bankId, setBankId] = useState<BankId>("dp600-r18");
  const [banks, setBanks] = useState<Partial<Record<BankId, DraftBank>>>({});
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  useEffect(()=>{const restore=()=>{const u=new URL(location.href),bank=u.searchParams.get('bank');if(bank==='dp600-r18'||bank==='pl300-v88'||bank==='notion-28'||bank==='corpus-candidates'||bank==='kengio-dp700'||bank==='chaturcr48-dp600'||bank==='warren-dp600'||bank==='stark-v2-dp600')setBankId(bank);setQuery((u.searchParams.get('q')??'').slice(0,160));};queueMicrotask(restore);addEventListener('popstate',restore);return()=>removeEventListener('popstate',restore);},[]);
  // One counter per bank, so switching banks starts from the first page
  // without an effect that resets state after render.
  const [limits, setLimits] = useState<Record<BankId, number>>({
    "dp600-r18": 40,
    "pl300-v88": 40,
    "notion-28": 40,
    "corpus-candidates": 40,
    "kengio-dp700": 40,
    "chaturcr48-dp600": 40,
    "warren-dp600": 40,
    "stark-v2-dp600": 40,
  });
  const limit = limits[bankId];

  useEffect(() => {
    let alive = true;
    if (banks[bankId]) return;
    loadBank(bankId)
      .then((bank) => {
        if (alive) setBanks((previous) => ({ ...previous, [bankId]: bank }));
      })
      .catch(() => {
        if (alive) setError("The draft bank could not load. Reload to retry; saved progress was not changed.");
      });
    return () => {
      alive = false;
    };
  }, [bankId, banks]);

  const bank = banks[bankId];
  const results = useMemo(() => (bank ? filterDrafts(bank.questions, query) : []), [bank, query]);

  return (
    <div className="space-y-5" data-testid="draft-review">
      <div
        role="group"
        aria-label="Draft bank"
        className="flex flex-wrap gap-2"
      >
        {(Object.keys(BANK_LABEL) as BankId[]).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={bankId === id}
            onClick={() => setBankId(id)}
            className={cn(
              "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              bankId === id
                ? "border-foreground bg-foreground text-background"
                : "border-border-strong text-muted-foreground hover:text-foreground",
            )}
          >
            {BANK_LABEL[id]}
          </button>
        ))}
      </div>

      <label className="block text-sm">
        <span className="text-muted-foreground">Search this draft bank</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="id, topic, objective or wording"
          className={cn(control, "mt-1 w-full")}
        />
      </label>

      {!bank && !error ? (
        <p className="rounded-2xl border border-border bg-card/40 p-4 text-sm text-muted-foreground" role="status">
          Loading the draft bank…
        </p>
      ) : null}
      {error ? (
        <p className="rounded-2xl border border-border bg-card/40 p-4 text-sm text-muted-foreground" role="alert">
          {error}
        </p>
      ) : null}

      {bank ? (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <span>
              {bank.status} · {bank.questions.length} draft questions
            </span>
            <span className="tabular-nums">
              {results.length} match{results.length === 1 ? "" : "es"} · {Math.min(limit, results.length)} shown
            </span>
          </div>

          <p className="text-sm leading-7 text-muted-foreground">
            {bank.statusLabel}. {bank.source?.note ?? bank.note ?? ""}
          </p>

          <ol className="space-y-3">
            {results.slice(0, limit).map((question) => (
              <DraftRow key={question.draftId} question={question} bank={bank} />
            ))}
          </ol>

          {results.length === 0 ? (
            <p className="rounded-2xl border border-border bg-card/40 p-4 text-sm text-muted-foreground">
              No draft matches that search.
            </p>
          ) : null}

          {results.length > limit ? (
            <button
              type="button"
              onClick={() => setLimits((previous) => ({ ...previous, [bankId]: (previous[bankId] ?? 40) + 40 }))}
              className={cn(
                control,
                "inline-flex items-center rounded-full px-5 font-medium",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              )}
            >
              Show 40 more ({results.length - limit} remaining)
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function DraftRow({ question, bank }: { question: DraftQuestion; bank: DraftBank }) {
  const body = draftBody(question);
  return (
    <li className="rounded-2xl border border-border bg-card/40">
      <details className="group p-4">
        <summary
          className={cn(
            "flex cursor-pointer list-none items-start justify-between gap-3 text-sm",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          )}
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {question.sourceId}
            {question.topic !== undefined ? ` · topic ${question.topic}` : ""}
            {question.exam_objective ? ` · ${question.exam_objective}` : ""}
          </span>
          <span
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-90"
          >
            ›
          </span>
        </summary>
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          <p className="text-sm leading-7">{body}</p>
          {question.code ? (
            <pre className="overflow-x-auto rounded-xl border border-border bg-background p-3 text-xs leading-6">
              {question.code}
            </pre>
          ) : null}
          <ul className="space-y-1.5">
            {question.options.map((option, index) => (
              <li key={option.letter ?? option.id ?? index} className="flex gap-2 text-sm leading-6">
                <span className="font-mono text-xs text-muted-foreground">{option.letter ?? option.id}</span>
                <span className="text-foreground/85">{option.text}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <span>Grading disabled · no answer shipped</span>
            <span>
              {[bank.exam, bank.status].filter(Boolean).join(" · ")} · draft id {question.draftId}
              {question.track ? ` · ${question.track.replace(/_/g, " ")}` : ""}
            </span>
          </div>
          {question.refs?.length ? (
            <ul className="space-y-1">
              {question.refs.map((ref) => (
                <li key={ref.u}>
                  <a
                    href={ref.u}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-xs underline underline-offset-4 hover:text-foreground"
                  >
                    {ref.t}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
          {question.video_url ? (
            <a
              href={question.video_url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs underline underline-offset-4 hover:text-foreground"
            >
              {question.video_title}
              {question.video_timestamp_seconds !== undefined
                ? ` @ ${question.video_timestamp_seconds}s`
                : ""}
            </a>
          ) : null}
        </div>
      </details>
    </li>
  );
}
