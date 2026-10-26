"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { GLOSSARY, SECTIONS } from "@/lib/statistics/content";

function slug(term: string) {
  return term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function GlossarySearch() {
  const [query, setQuery] = useState("");
  const [onlyLabs, setOnlyLabs] = useState(false);
  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return GLOSSARY.filter((entry) => {
      if (onlyLabs && !entry.lab) return false;
      if (!value) return true;
      return [entry.term, entry.arabic, entry.definition, ...(entry.synonyms ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(value);
    });
  }, [query, onlyLabs]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-background px-3 py-2">
          <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search English or Arabic — try p-value, فترة الثقة, confounder"
            aria-label="Search the glossary"
            className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
        <label className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-[11px] text-muted-foreground">
          <input type="checkbox" checked={onlyLabs} onChange={(event) => setOnlyLabs(event.target.checked)} className="h-3.5 w-3.5 accent-foreground" />
          Only terms with a lab
        </label>
        <span className="font-mono text-[10px] text-muted-foreground" aria-live="polite">
          {filtered.length} / {GLOSSARY.length}
        </span>
      </div>

      <dl className="grid gap-2 md:grid-cols-2">
        {filtered.map((entry) => {
          const section = SECTIONS.find((item) => item.number === entry.section);
          return (
            <div key={entry.term} id={slug(entry.term)} className="scroll-mt-28 rounded-2xl border border-border bg-background p-3">
              <dt className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-sm font-medium text-foreground">{entry.term}</span>
                <span dir="rtl" lang="ar" className="text-xs text-muted-foreground">
                  {entry.arabic}
                </span>
              </dt>
              <dd className="mt-1 text-[11px] leading-5 text-muted-foreground">{entry.definition}</dd>
              <dd className="mt-2 flex flex-wrap gap-2 text-[10px]">
                <Link
                  href={`/learn/statistics/journey/${section?.journey ?? "synthesis"}#s${entry.section}`}
                  className="inline-flex min-h-6 items-center rounded-full border border-border px-2 py-0.5 text-foreground hover:border-border-strong"
                >
                  Source §{entry.section}
                </Link>
                {entry.lab ? (
                  <Link href={`/learn/statistics/labs/${entry.lab}`} className="inline-flex min-h-6 items-center rounded-full border border-border px-2 py-0.5 text-muted-foreground hover:text-foreground">
                    Lab
                  </Link>
                ) : null}
              </dd>
            </div>
          );
        })}
      </dl>
      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-xs text-muted-foreground">
          No term matches “{query}”. The glossary keeps the source&apos;s English statistical terms beside the Arabic
          explanation; try a shorter term or a synonym.
        </p>
      ) : null}
    </div>
  );
}
