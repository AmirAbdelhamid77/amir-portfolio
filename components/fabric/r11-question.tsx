"use client";
import { useEffect, useState } from "react";
import { ADDITIONS_KEY, parseAddedProgress } from "@/lib/fabric/additions";
import { gradeR11, parseR11Progress, r11Approved, r11Expected, R11_REVISION, R11_STORAGE_KEY, type R11Answer, type R11Block, type R11Question, type R11Study } from "@/lib/fabric/r11";
const control = "min-h-11 rounded-xl border border-border-strong bg-background p-3 text-sm focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";
export function R11QuestionView({ question: q, study }: { question: R11Question; study?: R11Study }) {
  const [answer, setAnswer] = useState<R11Answer>([]), [revealed, setRevealed] = useState(false), [checked, setChecked] = useState(false);
  const [storage, setStorage] = useState<"loading" | "ready" | "blocked">("loading"), [notice, setNotice] = useState("");
  const [priorAnswer, setPriorAnswer] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    let alive = true;
    Promise.resolve().then(() => {
      if (!alive) return;
      try {
        const progress = parseR11Progress(localStorage.getItem(R11_STORAGE_KEY));
        if (progress === null) { setStorage("blocked"); setNotice("Earlier saved data could not be read safely. It was preserved; this answer stays in memory."); }
        else { const item = progress[q.sourceId]; if (item) { setAnswer(item.answer); setRevealed(item.revealed); setChecked(item.checked && r11Approved(q)); } setStorage("ready"); }
        const legacy = parseAddedProgress(localStorage.getItem(ADDITIONS_KEY));
        setPriorAnswer(legacy?.[q.hansaId]?.values ?? null);
      } catch { setStorage("blocked"); setNotice("Browser saving is unavailable. Answers stay in memory."); }
    });
    return () => { alive = false; };
  }, [q]);
  function save(value: R11Answer, show = false, grade = false) {
    setAnswer(value); setRevealed(show); setChecked(grade);
    if (storage !== "ready") return;
    try {
      const latest = parseR11Progress(localStorage.getItem(R11_STORAGE_KEY));
      if (latest === null) throw new Error("preserve unreadable progress");
      localStorage.setItem(R11_STORAGE_KEY, JSON.stringify({ version: 1, revision: R11_REVISION, questions: { ...latest, [q.sourceId]: { answer: value, revealed: show, checked: grade } } }));
    } catch { setStorage("blocked"); setNotice("Saving failed. Existing saved data was preserved; this answer stays in memory."); }
  }
  const approved = r11Approved(q), result = gradeR11(q, answer), selections = Array.isArray(answer) ? answer : [];
  const part = (i: number, value: string) => { const next = [...selections]; next[i] = value; save(next); };
  const priorReviewed = q.r10Status.startsWith("APPROVED") && !approved;
  return <article className="min-w-0 space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-6 [overflow-wrap:anywhere]" data-testid="r11-question" data-source-id={q.sourceId}>
    <div className="flex flex-wrap gap-3 text-xs"><span>{q.sourceId} · DP-600 · Image-free practice</span><span className={approved ? "text-primary" : "text-muted-foreground"}>{approved ? "Documentation checked" : priorReviewed ? "Prior review; not rechecked" : "Scientific review open"}</span></div>
    <p className="text-xs text-muted-foreground">Personal study material; not an official Microsoft exam question. Product runtime has not been tested.</p>
    {!approved && <aside role="note" className="rounded-xl border border-amber-500 p-4 text-sm"><strong>Scientific grading is paused.</strong><p className="mt-2">{priorReviewed ? "This item has a prior R10 approval candidate, but it was not revalidated in R11. You can explore the source material without a score." : "The source question has unresolved scientific or source-evidence issues. It remains available for ungraded study."}</p></aside>}
    <h2 className="text-lg font-semibold">Question {q.sourceId}</h2><p className="whitespace-pre-wrap text-sm leading-7">{q.stem}</p>
    {study && <details className="rounded-xl border border-border p-4"><summary className="min-h-11 cursor-pointer py-2">Case study: {study.name}</summary><p className="mt-3 text-xs text-muted-foreground">Original case context is preserved. Any updated assumptions are stated in the revised question.</p><div role="region" aria-label="Original case study text" tabIndex={0} className="mt-3 max-h-96 overflow-auto whitespace-pre-wrap text-sm leading-7 focus-visible:outline-2 focus-visible:outline-primary">{study.text}</div>{study.semanticVisuals?.map((b, i) => <SemanticBlock key={i} block={b} />)}</details>}
    {q.semanticVisuals.map((b, i) => <SemanticBlock key={i} block={b} />)}
    {q.options && <fieldset className="min-w-0 space-y-3"><legend className="mb-3 text-sm">{q.type === "multi" ? "Select all applicable options" : "Select one option"}</legend>{q.options.map(o => <label key={o.letter} className={control + " flex items-start gap-3"}><input disabled={storage === "loading"} type={q.type === "multi" ? "checkbox" : "radio"} name={q.hansaId} value={o.letter} className="mt-1 shrink-0" checked={q.type === "multi" ? selections.includes(o.letter) : answer === o.letter} onChange={() => save(q.type === "multi" ? selections.includes(o.letter) ? selections.filter(x => x !== o.letter) : [...selections, o.letter] : o.letter)} /><span className="min-w-0"><strong>{o.letter}. </strong>{o.text}{o.code && <Code text={o.code} />}</span></label>)}</fieldset>}
    {q.type === "hotspot-dropdown" && q.blanks?.map((b, i) => <label key={i} className="block text-sm">{b.label}<select disabled={storage === "loading"} className={control + " mt-2 w-full min-w-0"} value={selections[i] ?? ""} onChange={e => part(i, e.target.value)}><option value="">Choose…</option>{b.options.map((o, j) => <option key={j} value={o}>{o}</option>)}</select></label>)}
    {q.type === "hotspot-yesno" && q.statements?.map((s, i) => <fieldset key={i} className="min-w-0 space-y-3 border-b border-border py-3"><legend className="text-sm">{s.text}</legend>{["Yes", "No"].map(v => <label key={v} className="mr-5 inline-flex min-h-11 items-center gap-2 text-sm"><input disabled={storage === "loading"} type="radio" name={`${q.hansaId}-${i}`} value={v} checked={selections[i] === v} onChange={() => part(i, v)} />{v}</label>)}</fieldset>)}
    {q.type === "dragdrop" && <div className="space-y-4"><p className="text-xs text-muted-foreground">Choose the value for each target. These controls support keyboard and touch. {q.drag?.reuse ? "Values may be reused." : "Each value can be used once."}</p>{q.drag?.targets.map((t, i) => <label key={i} className="block text-sm">{t.label}<select disabled={storage === "loading"} className={control + " mt-2 w-full min-w-0"} value={selections[i] ?? ""} onChange={e => part(i, e.target.value)}><option value="">Choose…</option>{q.drag!.items.map((v, j) => <option key={j} value={v} disabled={!q.drag!.reuse && selections.some((s, k) => k !== i && s === v)}>{v}</option>)}</select></label>)}</div>}
    <div className="flex flex-wrap gap-3"><button className={control} disabled={storage === "loading" || result === null} onClick={() => save(answer, true, true)}>Check reviewed answer</button><button className={control} disabled={storage === "loading"} onClick={() => save(answer, true)}>Read explanation</button><button className={control} disabled={storage === "loading"} onClick={() => save([])}>Reset this answer</button></div>
    <p role="status" className="text-sm">{notice}{checked && result !== null ? result ? " Correct according to the reviewed candidate." : " Incorrect according to the reviewed candidate." : ""}</p>
    {revealed && <section className="space-y-4 border-t border-border pt-4" aria-label="Answer and review notes"><h3 className="font-medium">{approved ? "Reviewed explanation" : "Source discussion — not graded"}</h3><p className="whitespace-pre-wrap text-sm leading-7">{q.explanation}</p><p className="whitespace-pre-wrap text-sm">{approved ? "Reviewed response" : "Unverified source response"}: {JSON.stringify(r11Expected(q))}</p><p className="text-xs text-muted-foreground">The original source key is retained separately and may disagree with the learner key or reviewed response.</p><details><summary className="min-h-11 cursor-pointer py-3 text-sm">Original answers and review history</summary><dl className="space-y-2 text-sm"><dt>Original source official answer</dt><dd>{JSON.stringify(q.original.officialAnswer)}</dd><dt>Original learner answer</dt><dd>{"answer" in q.original ? JSON.stringify(q.original.answer) : "Multipart source; see original part answers below."}</dd></dl><pre tabIndex={0} aria-label="Original answer parts" className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-xs focus-visible:outline-2 focus-visible:outline-primary">{JSON.stringify(q.original.blanks ?? q.original.statements ?? q.original.drag?.targets ?? {}, null, 2)}</pre><p className="mt-3 text-sm">{q.reviewNote}</p>{!approved && <p className="mt-3 text-sm">Still required: {q.remaining}</p>}</details><ul>{q.refs.filter(r => r.url.startsWith("https://learn.microsoft.com/")).map((r, i) => <li key={i}><a className="inline-block min-h-11 py-3 text-sm text-primary underline" href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a></li>)}</ul></section>}
    {priorAnswer && <details className="border-t border-border pt-3"><summary className="min-h-11 cursor-pointer py-3 text-sm">Your earlier source-version response (preserved)</summary><p className="text-xs text-muted-foreground">Read-only history. Revised questions can have different options, so this response is not graded or automatically migrated.</p><pre className="overflow-auto whitespace-pre-wrap text-xs" tabIndex={0} aria-label="Earlier source response">{JSON.stringify(priorAnswer, null, 2)}</pre></details>}
    <p className="text-xs text-muted-foreground">New review answers are saved only in this browser, separately from your existing Hansa progress.</p>
  </article>;
}
function Code({ text }: { text: string }) { return <pre tabIndex={0} aria-label="Scrollable source code" className="my-3 max-w-full overflow-auto rounded-xl border border-border bg-background p-4 text-xs leading-6 focus-visible:outline-2 focus-visible:outline-primary"><code>{text}</code></pre>; }
function SemanticBlock({ block: b }: { block: R11Block }) {
  return <section className="my-4 min-w-0 space-y-3 rounded-xl border border-border bg-background p-3"><h3 className="text-sm font-medium">{b.title ?? "Source exhibit"}</h3>{b.kind === "table" ? <div role="region" aria-label={b.title ?? "Source table"} tabIndex={0} className="overflow-auto focus-visible:outline-2 focus-visible:outline-primary"><table className="min-w-full border-collapse text-left text-sm"><thead><tr>{b.headers?.map((v, i) => <th key={i} scope="col" className="border border-border p-2">{v}</th>)}</tr></thead><tbody>{b.rows?.map((row, i) => <tr key={i}>{row.map((v, j) => <td key={j} className="border border-border p-2 align-top">{v}</td>)}</tr>)}</tbody></table></div> : b.kind === "code" ? <Code text={b.content ?? ""} /> : b.kind === "chart-description" ? <div className="space-y-2 text-sm">{Object.entries(b.labels ?? {}).map(([k, v]) => <p key={k}>{k}: {v}</p>)}<p>{b.description}</p></div> : <p className="whitespace-pre-wrap text-sm leading-7">{b.content}</p>}</section>;
}
