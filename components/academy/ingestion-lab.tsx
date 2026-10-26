"use client";
import { useEffect, useRef, useState } from "react";
import { Panel } from "@/components/fabric/ui";
import { ACADEMY_KEY, DEFAULT_CONSTRAINTS, PATTERNS, TRANSFER, evaluate, emptyLessonState, parseLessonState, completedCount } from "@/lib/academy/ingestion";
import type { Constraints, LessonState, Pattern } from "@/lib/academy/ingestion";
const button = "min-h-11 rounded-full border border-border-strong bg-background px-4 py-2 text-sm text-foreground hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";
const choice = "flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-border-strong bg-background p-3 text-sm leading-6 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary";
export function IngestionLab() {
    const [constraints, setConstraints] = useState<Constraints>({ ...DEFAULT_CONSTRAINTS });
    const [prediction, setPrediction] = useState<Pattern | null>(null), [revealed, setRevealed] = useState(false);
    const [lesson, setLesson] = useState<LessonState>(emptyLessonState), [ready, setReady] = useState(false);
    const [storageMessage, setStorageMessage] = useState("Loading this browser's lesson progress…"), [notice, setNotice] = useState("");
    const canWrite = useRef(false), importRef = useRef<HTMLInputElement>(null);
    useEffect(() => { let alive = true; Promise.resolve().then(() => { if (!alive)
        return; try {
        const parsed = parseLessonState(localStorage.getItem(ACADEMY_KEY));
        if (parsed) {
            setLesson(parsed);
            canWrite.current = true;
            setStorageMessage("Progress stays in this browser only. Export it before clearing browser data.");
        }
        else {
            setStorageMessage("Saved lesson data could not be read and has been preserved. This visit works without saving. Reset this lesson to replace only its saved data.");
        }
    }
    catch {
        setStorageMessage("Browser storage is unavailable. You can practise and export this visit, but it will not resume automatically.");
    } setReady(true); }); return () => { alive = false; }; }, []);
    function save(next: LessonState) { setLesson(next); if (canWrite.current) {
        try {
            localStorage.setItem(ACADEMY_KEY, JSON.stringify(next));
        }
        catch {
            canWrite.current = false;
            setStorageMessage("Progress could not be saved. Export this visit to keep it; practice still works.");
        }
    } }
    function resetLesson() { const next = emptyLessonState(); setLesson(next); try {
        localStorage.setItem(ACADEMY_KEY, JSON.stringify(next));
        canWrite.current = true;
        setStorageMessage("Lesson reset. Progress stays in this browser only.");
    }
    catch {
        canWrite.current = false;
        setStorageMessage("Lesson reset for this visit; storage is unavailable.");
    } setNotice("Only this ingestion lesson was reset. Existing quiz history is preserved."); }
    function update<K extends keyof Constraints>(key: K, value: Constraints[K]) { setConstraints(c => ({ ...c, [key]: value })); }
    function check(id: string) { const answer = lesson.answers[id]; if (!answer) {
        setNotice("Select an answer before checking.");
        return;
    } const next = { ...lesson, checked: [...new Set([...lesson.checked, id])], journal: [...lesson.journal, { id, answer, confidence: lesson.confidence }].slice(-30) }; save(next); setNotice(TRANSFER.find(q => q.id === id)!.rationales[answer]); }
    function exportProgress() { const blob = new Blob([JSON.stringify(lesson, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "hansa-ingestion-progress.json"; document.body.appendChild(a); a.click(); a.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 30000); setNotice("Lesson progress download requested. It contains only this lesson's answers and review journal."); }
    async function importProgress(file: File | undefined) { if (!file)
        return; if (file.size > 50000) {
        setNotice("Import rejected: choose a lesson export smaller than 50 KB.");
        return;
    } try {
        const parsed = parseLessonState(await file.text());
        if (!parsed) {
            setNotice("Import rejected: incompatible or damaged lesson export. Current answers are preserved.");
            return;
        }
        save(parsed);
        setNotice("Lesson export restored. Existing Fabric quiz history is untouched.");
    }
    catch {
        setNotice("The file could not be read. Current answers are preserved.");
    }
    finally {
        if (importRef.current)
            importRef.current.value = "";
    } }
    const result = evaluate(constraints), done = completedCount(lesson);
    return <div className="space-y-8">
  <Panel title="2. Predict before exploring" description="Start with a Gold table already in OneLake. Both workspaces have the required access. You need to reuse it without another ingestion copy or custom transformation.">
   <fieldset className="grid gap-2 sm:grid-cols-3"><legend className="mb-3 text-sm font-medium">Which pattern would you choose?</legend>{PATTERNS.map(p => <label key={p.id} className={choice}><input className="mt-1 size-4 shrink-0 accent-primary" type="radio" name="prediction" value={p.id} checked={prediction === p.id} onChange={() => { setPrediction(p.id); setRevealed(false); }}/>{p.title}</label>)}</fieldset>
   <button className={`${button} mt-4`} onClick={() => setRevealed(true)}>Check prediction</button>
   <p role="status" className="mt-3 text-sm leading-7">{revealed ? !prediction ? "Select a pattern, then check again." : prediction === "shortcut" ? "Correct. A shortcut reuses the accessible table without a separate ingestion replica." : "A replica or copy adds materialized data. A shortcut fits this no-copy reuse case; verify access at both paths." : ""}</p>
  </Panel>
  <Panel title="3. Change the requirements" description="A bounded architecture simulation, not a Fabric connection. Each control changes the decision and the reasons. This lab assumes batch Copy supports the selected source, and external files are a supported shortcut target. Validate actual connectors and identities separately.">
   <div className="grid items-start gap-6 lg:grid-cols-2">
    <div className="space-y-5">
     <label className="block text-sm font-medium">Source supplied<select className="mt-2 block min-h-11 w-full rounded-xl border border-border-strong bg-background p-3" value={constraints.source} onChange={e => update("source", e.target.value as Constraints["source"])}><option value="gold">Published OneLake Gold table</option><option value="database">Operational database tables</option><option value="files">Supported external object files</option></select></label>
     <fieldset className="space-y-2"><legend className="mb-2 text-sm font-medium">Required outcome</legend>{([["reference", "Reuse in place; no ingestion replica"], ["replica", "Continuous read-only analytical replica"], ["snapshot", "Retain a dated batch result"]] as const).map(([id, label]) => <label className={choice} key={id}><input className="mt-1 size-4 shrink-0 accent-primary" type="radio" name="goal" checked={constraints.goal === id} onChange={() => update("goal", id)}/>{label}</label>)}</fieldset>
     <label className={choice}><input className="mt-1 size-4 shrink-0 accent-primary" type="checkbox" checked={constraints.access} onChange={e => update("access", e.target.checked)}/>Required source, connection and destination access is available</label>
     {constraints.source === "database" && <label className={choice}><input className="mt-1 size-4 shrink-0 accent-primary" type="checkbox" checked={constraints.mirrorSupported} onChange={e => update("mirrorSupported", e.target.checked)}/>Database Mirroring supports this source and its prerequisites are met</label>}
     <label className={choice}><input className="mt-1 size-4 shrink-0 accent-primary" type="checkbox" checked={constraints.transform} onChange={e => update("transform", e.target.checked)}/>Custom cleansing or joins are required</label>
     <button className={button} onClick={() => { setConstraints({ ...DEFAULT_CONSTRAINTS }); setPrediction(null); setRevealed(false); }}>Reset exploration</button>
    </div>
    <div className="space-y-4">
     <div role="status" aria-atomic="true" className="rounded-2xl border border-primary/40 bg-primary/5 p-4"><p className="text-sm font-medium">{result.summary}</p></div>
     <ol aria-label="Decision trace" className="space-y-3">{result.decisions.map(d => <li key={d.pattern} className="rounded-2xl border border-border-strong p-4"><h3 className="text-sm font-medium">{PATTERNS.find(p => p.id === d.pattern)!.title} · {d.fits ? "Fits" : "Does not satisfy this case alone"}</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{d.explanation}</p></li>)}</ol>
     <p className="text-xs leading-6 text-muted-foreground">This tool compares only the stated patterns. For continuous data with custom transformation or unsupported sources, investigate a multi-stage architecture rather than treating the empty result as a platform limitation.</p>
    </div>
   </div>
  </Panel>
  <Panel title="4. Apply it to new cases" description="Three original Hansa exercises. Choose, check the reasoning, retry if needed. Completion means these cases were answered correctly; it is not an exam-readiness or mastery score.">
   <p className="text-sm" data-testid="lesson-progress">{done} of {TRANSFER.length} transfer cases correct{done === TRANSFER.length ? " · Lesson practice complete" : ""}</p>
   <p className="mt-2 text-xs leading-6 text-muted-foreground">{storageMessage}</p>
   <label className="mt-4 block text-sm">Confidence for your next answer<select aria-label="Confidence for your next answer" disabled={!ready} className="ml-3 min-h-11 rounded-xl border border-border-strong bg-background p-2" value={lesson.confidence} onChange={e => save({ ...lesson, confidence: e.target.value as LessonState["confidence"] })}><option value="low">Low — reviewing</option><option value="medium">Medium</option><option value="high">High</option></select></label>
   <div className="mt-5 space-y-6">{TRANSFER.map((q, i) => <section key={q.id} aria-labelledby={q.id} className="rounded-2xl border border-border-strong p-4 sm:p-5"><h3 id={q.id} className="font-medium">Case {i + 1}: {q.title}</h3><p className="mt-2 text-sm leading-7">{q.prompt}</p><fieldset disabled={!ready} className="mt-4 grid gap-2"><legend className="sr-only">Answer for {q.title}</legend>{PATTERNS.map(p => <label className={choice} key={p.id}><input className="mt-1 size-4 shrink-0 accent-primary" type="radio" name={q.id} checked={lesson.answers[q.id] === p.id} onChange={() => save({ ...lesson, answers: { ...lesson.answers, [q.id]: p.id }, checked: lesson.checked.filter(id => id !== q.id) })}/>{p.title}</label>)}</fieldset><div className="mt-3 flex flex-wrap items-center gap-3"><button disabled={!ready} className={button} onClick={() => check(q.id)}>Check case {i + 1}</button><details className="text-sm"><summary className="min-h-11 cursor-pointer py-3">Hint for case {i + 1}</summary><p className="max-w-xl leading-7 text-muted-foreground">{q.hint}</p></details></div>{lesson.checked.includes(q.id) && <p className="mt-3 rounded-xl bg-primary/5 p-3 text-sm leading-7">{q.rationales[lesson.answers[q.id]]}</p>}</section>)}</div>
   <div role="status" aria-atomic="true" className="mt-4 text-sm leading-7">{notice}</div>
   <details className="mt-6"><summary className="cursor-pointer py-3 text-sm font-medium">Review journal ({lesson.journal.length} recent checks)</summary><p className="text-xs leading-6 text-muted-foreground">Low-confidence correct answers are useful review candidates. Only the latest 30 checks are retained.</p>{lesson.journal.length ? <ol className="mt-3 space-y-2">{lesson.journal.map((j, i) => { const q = TRANSFER.find(q => q.id === j.id)!; return <li className="text-sm leading-7" key={i}>{q.title}: {j.answer === q.answer ? "Correct" : "Revisit"} · confidence {j.confidence} · {PATTERNS.find(p => p.id === j.answer)!.title}</li>; })}</ol> : <p className="text-sm">No answers checked yet.</p>}</details>
   <details className="mt-5 rounded-xl border border-border-strong p-4"><summary className="min-h-11 cursor-pointer py-2 text-sm font-medium">Manual progress backup</summary><p className="mt-2 text-sm leading-7 text-muted-foreground">If your browser blocks downloads, copy this JSON into a local .json file. Import that file to restore this lesson. The text below always reflects your current lesson progress.</p><label className="mt-3 block text-sm">Progress JSON<textarea readOnly aria-label="Progress JSON" spellCheck={false} rows={8} className="mt-2 block w-full min-w-0 rounded-xl border border-border-strong bg-background p-3 font-mono text-xs leading-6" value={JSON.stringify(lesson, null, 2)} /></label></details>
   <div className="mt-5 flex flex-wrap gap-3"><button disabled={!ready} className={button} onClick={exportProgress}>Export lesson progress</button><label className={`${button} cursor-pointer`}>Import lesson progress<input ref={importRef} type="file" accept=".json,application/json" disabled={!ready} className="mt-2 block max-w-full text-xs" onChange={e => void importProgress(e.target.files?.[0])}/></label><button disabled={!ready} className={button} onClick={resetLesson}>Reset this lesson</button></div>
  </Panel>
 </div>;
}
