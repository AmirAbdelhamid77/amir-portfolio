"use client";

import { useId, useState } from "react";
import { PATTERNS, REFERENCES } from "@/lib/academy/ingestion";
import { COMPARISON_ROWS, filterComparison } from "@/lib/academy/pattern-comparison";

// EasyUI Smart Comparison informed the search/differences pattern. Original Hansa
// implementation: semantic table + narrow-screen definitions, without pricing UI.
export function PatternComparison() {
  const id = useId();
  const [query, setQuery] = useState("");
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const rows = filterComparison(COMPARISON_ROWS, query, differencesOnly);
  const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";
  return (
    <div className="mt-6 min-w-0" data-testid="pattern-comparison">
      <noscript><p className="mb-3 text-sm leading-7">Filtering requires JavaScript. The complete comparison and its evidence are shown below.</p></noscript>
      <div className="flex flex-wrap items-end gap-4 print:hidden">
        <label className="block min-w-0 flex-1 basis-full text-sm font-medium sm:basis-64">
          Search comparison criteria
          <input type="search" value={query} onChange={event => setQuery(event.target.value)}
            aria-describedby={`${id}-help`} className={`mt-2 block min-h-11 w-full rounded-xl border border-border-strong bg-background px-3 py-2 font-normal ${focus}`} />
        </label>
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" checked={differencesOnly} onChange={event => setDifferencesOnly(event.target.checked)} className="size-4 accent-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary" />
          Differences only
        </label>
        <button type="button" onClick={() => { setQuery(""); setDifferencesOnly(false); }}
          className={`min-h-11 rounded-full border border-border-strong px-4 py-2 text-sm hover:bg-card ${focus}`}>Reset comparison</button>
      </div>
      <p id={`${id}-help`} className="mt-3 text-sm leading-7 text-muted-foreground">Compare requirements, not a universal winner. Search matches a criterion and its explanations; each result keeps all three patterns together. Differences only hides shared prerequisites, which still apply.</p>
      <p role="status" aria-live="polite" aria-atomic="true" className="mt-2 text-sm tabular-nums print:hidden">{rows.length} of {COMPARISON_ROWS.length} criteria shown.</p>
      {!rows.length && <p className="mt-4 rounded-xl border border-border-strong p-4 text-sm print:hidden">No matching criteria. Clear the search or reset the comparison to see all requirements.</p>}
      <div className="mt-4 hidden md:block print:block">
        <table className="w-full table-fixed border-collapse text-start text-sm leading-7">
          <caption className="pb-3 text-start font-medium">Shortcut, Database Mirroring and Copy + orchestration — decision criteria</caption>
          <thead><tr><th scope="col" className="w-1/5 border-b border-border-strong p-3 text-start">Criterion</th>{PATTERNS.map(pattern => <th scope="col" key={pattern.id} className="border-b border-border-strong p-3 text-start">{pattern.title}</th>)}</tr></thead>
          <tbody>{COMPARISON_ROWS.map(row => <tr key={row.id} className={rows.includes(row) ? "" : "hidden print:table-row"}>
            <th scope="row" className="border-b border-border p-3 text-start align-top font-medium">{row.label}</th>
            {row.values.map((value, index) => <td key={PATTERNS[index].id} className="border-b border-border p-3 align-top text-muted-foreground">{value}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
      <dl aria-label="Pattern comparison by criterion" className="mt-4 space-y-4 md:hidden print:hidden">
        {COMPARISON_ROWS.map(row => <div key={row.id} className={rows.includes(row) ? "rounded-2xl border border-border-strong bg-card/40 p-4" : "hidden"}>
          <dt className="font-medium">{row.label}</dt>
          <dd><dl className="mt-3 space-y-3">{PATTERNS.map((pattern, index) => <div key={pattern.id}><dt className="text-sm font-medium">{pattern.title}</dt><dd className="mt-1 text-sm leading-7 text-muted-foreground">{row.values[index]}</dd></div>)}</dl></dd>
        </div>)}
      </dl>
      <details className="mt-4 text-sm leading-7">
        <summary className={`min-h-11 cursor-pointer py-3 font-medium ${focus}`}>Comparison evidence and scope</summary>
        <p className="text-muted-foreground">Existing Hansa lesson definitions, checked against Microsoft documentation on 25 October 2026. Database Mirroring is the scope here; metadata mirroring can use references. No Fabric execution or performance benchmark is implied. Connector support and permissions need separate validation.</p>
        <ul className="mt-2 space-y-1">{REFERENCES.map(reference => <li key={reference.id}><a href={reference.url} className={`inline-block min-h-11 py-2 underline underline-offset-4 ${focus}`}>{reference.title} — Microsoft Learn</a></li>)}</ul>
      </details>
    </div>
  );
}
