"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, GitBranch, RotateCcw, TriangleAlert } from "lucide-react";
import {
  DECISION_NODES,
  DECISION_RESULTS,
  SECTIONS,
} from "@/lib/statistics/content";

interface Step {
  nodeId: string;
  question: string;
  answer: string;
}

export function ToolNavigator() {
  const [nodeId, setNodeId] = useState("goal");
  const [history, setHistory] = useState<Step[]>([]);
  const [resultId, setResultId] = useState<string | null>(null);

  const node = DECISION_NODES.find((item) => item.id === nodeId);
  const result = resultId ? DECISION_RESULTS.find((item) => item.id === resultId) : null;

  function choose(label: string, next: string) {
    if (!node) return;
    setHistory((current) => [...current, { nodeId: node.id, question: node.question, answer: label }]);
    if (next.startsWith("result:")) {
      setResultId(next.replace("result:", ""));
    } else {
      setNodeId(next);
      setResultId(null);
    }
  }

  function back() {
    if (!history.length) return;
    const last = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setResultId(null);
    setNodeId(last.nodeId);
  }

  function reset() {
    setNodeId("goal");
    setHistory([]);
    setResultId(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
          <GitBranch className="h-3.5 w-3.5" aria-hidden="true" />
          {history.length === 0 ? (
            <span>Start</span>
          ) : (
            history.map((step) => (
              <span key={`${step.nodeId}-${step.answer}`} className="inline-flex items-center gap-1.5">
                <span className="rounded-full border border-border px-2 py-0.5">{step.answer}</span>
                <ArrowRight className="h-2.5 w-2.5" aria-hidden="true" />
              </span>
            ))
          )}
          <span className="text-foreground">{result ? "Recommendation" : nodeId}</span>
        </div>
        <div className="flex gap-1.5">
          <button type="button" onClick={back} disabled={!history.length} className="press inline-flex h-7 items-center gap-1 rounded-full border border-border px-2.5 text-[10px] text-muted-foreground disabled:opacity-40">
            <ArrowLeft className="h-3 w-3" aria-hidden="true" /> Back
          </button>
          <button type="button" onClick={reset} className="press inline-flex h-7 items-center gap-1 rounded-full border border-border px-2.5 text-[10px] text-muted-foreground">
            <RotateCcw className="h-3 w-3" aria-hidden="true" /> Reset
          </button>
        </div>
      </div>

      {result ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.05] p-4" aria-live="polite">
          <p className="text-[10px] uppercase tracking-[0.12em] text-emerald-800 dark:text-emerald-300">A defensible starting point</p>
          <h3 className="mt-1 text-lg font-medium text-foreground">{result.title}</h3>
          <p className="mt-1 text-sm font-medium text-foreground/80">{result.tool}</p>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">{result.why}</p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Assumptions</p>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-5 text-muted-foreground">
                {result.assumptions.map((item) => (
                  <li key={item} className="flex gap-1.5">
                    <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.05] p-3">
              <p className="text-[10px] uppercase tracking-[0.12em] text-amber-800 dark:text-amber-300">Avoid</p>
              <ul className="mt-1.5 space-y-1 text-[11px] leading-5 text-muted-foreground">
                {result.avoid.map((item) => (
                  <li key={item} className="flex gap-1.5">
                    <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href={`/learn/statistics/journey/${SECTIONS.find((section) => section.number === result.section)?.journey ?? "synthesis"}#s${result.section}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-medium text-background"
            >
              Read §{result.section} <ArrowRight className="h-3 w-3" aria-hidden="true" />
            </Link>
            {result.lab ? (
              <Link href={`/learn/statistics/labs/${result.lab}`} className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground">
                Open the lab
              </Link>
            ) : null}
          </div>
          <p className="mt-3 border-t border-emerald-500/20 pt-2 text-[10px] leading-5 text-muted-foreground">
            This is educational guidance, not an automatic validity guarantee. The assumptions still have to be checked
            against your actual design and data.
          </p>
        </div>
      ) : node ? (
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Question</p>
          <h3 className="mt-1 text-base font-medium text-foreground">{node.question}</h3>
          {node.help ? <p className="mt-1 text-xs leading-6 text-muted-foreground">{node.help}</p> : null}
          <div className="mt-3 grid gap-1.5">
            {node.options.map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => choose(option.label, option.next)}
                className="press flex items-center justify-between gap-3 rounded-xl border border-border bg-card/30 px-3 py-2.5 text-left text-xs text-foreground transition-colors hover:border-border-strong hover:bg-card/60"
              >
                {option.label}
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <details className="rounded-xl border border-border bg-background/60">
        <summary className="cursor-pointer px-3 py-2 text-[11px] text-muted-foreground">
          Browse all recommendations (direct index)
        </summary>
        <ul className="grid gap-1 border-t border-border p-3 sm:grid-cols-2">
          {DECISION_RESULTS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => {
                  setResultId(item.id);
                  setNodeId("goal");
                  setHistory([]);
                }}
                className="w-full rounded-lg border border-transparent px-2 py-1.5 text-left text-[11px] text-muted-foreground hover:border-border hover:text-foreground"
              >
                {item.title} <span className="text-muted-foreground">· {item.tool}</span>
              </button>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
