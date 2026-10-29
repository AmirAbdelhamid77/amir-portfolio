"use client";
/* eslint-disable @next/next/no-img-element -- preserve supplied static exhibit dimensions and files */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Explorer } from "./explorer";
import { R11QuestionView } from "./r11-question";
import type { R11Question, R11Study } from "@/lib/fabric/r11";
import { QuestionView } from "./question-view";
import { CASE_BY_ID, SOURCE_BY_ID, loadIndex, loadQuestions, packLabel } from "@/lib/fabric/data";
import { useFabricStore, toggleBookmark, toggleFlag } from "@/lib/fabric/storage";
import type { FabricIndexEntry, FabricQuestion } from "@/lib/fabric/types";
import { ADDITIONS_KEY, additionSource, gradeAdded, parseAddedProgress, type AddedProgress, type AddedQuestion } from "@/lib/fabric/additions";
const control="min-h-11 rounded-xl border border-border-strong bg-background p-3 text-sm";
type Row = { id: string; title: string; search: string; exam: string; source: string; added?: AddedQuestion; legacy?: FabricIndexEntry; r11?: R11Question };
const questionId = (value: string) => /^T1Q\d+$/i.test(value) ? "new-json-" + value.toLowerCase() : value;
export function UnifiedBank({ atlasLinks = [] }: { atlasLinks?: { questionId: string; title: string; href: string }[] }) {
  const [rows,setRows]=useState<Row[]>([]),[selected,setSelected]=useState(""),[query,setQuery]=useState(""),[exam,setExam]=useState("DP-600"),[source,setSource]=useState("all"),[pending,setPending]=useState(false),[limit,setLimit]=useState(40),[error,setError]=useState(""),[legacy,setLegacy]=useState(false),[back,setBack]=useState("");
  const [studies,setStudies]=useState<R11Study[]>([]),[review,setReview]=useState("all");
  useEffect(()=>{
    let alive=true;
    const p=new URLSearchParams(location.search);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore external URL state after hydration
    setLegacy(p.get("view")==="legacy");setSelected(questionId(p.get("question")||""));setQuery(p.get("q")||"");
    if(p.get("exam")==="PL-300"||p.get("exam")==="all")setExam(p.get("exam")!);
    const ret=p.get("atlasReturn");if(ret?.startsWith("/learn/dp-600/atlas/?")&&!ret.includes("\\")&&ret.length<2048)setBack(ret);
    Promise.all([loadIndex(),import("@/content/fabric/additions/questions.json"),import("@/content/fabric/r11/questions.json"),import("@/content/fabric/r11/case-studies.json")]).then(([index,mod,r11Module,caseModule])=>{
      if(!alive)return;
      const added=mod.default as AddedQuestion[];
      const enriched = new Map((r11Module.default as unknown as R11Question[]).map(q=>[q.hansaId,q]));
      setStudies(caseModule.default as R11Study[]);
      setRows([...index.map(q=>({id:q.id,title:q.title,search:[q.title,q.prompt,q.topic,...q.subjects].join(" ").toLowerCase(),exam:"DP-600",source:"Existing learning bank",legacy:q})),...added.map((q,i)=>{
        const r11=enriched.get(q.id);
        return {id:q.id,title:r11?`${r11.sourceId} · Image-free practice`:`${additionSource(q.id)} · ${i+1}`,search:(r11?[r11.sourceId,r11.stem,studiesText(r11,caseModule.default as R11Study[]),...(r11.options??[]).map(o=>o.text)]:[q.stemHtml,q.contextHtml,...q.options.map(o=>o.text)]).join(" ").replace(/<[^>]*>/g," ").toLowerCase(),exam:q.exam,source:additionSource(q.id),added:q,r11};
      })]);
    }).catch(()=>alive&&setError("The bank could not load. Reload to retry; saved progress was not changed."));
    return()=>{alive=false;};
  },[]);
  const results=useMemo(()=>rows.filter(r=>(exam==="all"||r.exam===exam)&&(source==="all"||r.source===source)&&(!pending||(!r.r11&&!!r.added?.blockers.length))&&(review==="all"||(review==="reviewed"?!!r.r11?.gradingEnabled:!!r.r11&&!r.r11.gradingEnabled))&&query.trim().toLowerCase().split(/\s+/).every(w=>r.search.includes(w)||r.title.toLowerCase().includes(w))),[rows,exam,source,pending,review,query]);
  const current=rows.find(r=>r.id===selected);
  function open(id:string){setSelected(id);const p=new URLSearchParams({question:id,exam,q:query});if(back)p.set("atlasReturn",back);history.pushState(null,"","?"+p);}
  useEffect(()=>{const restore=()=>{const p=new URLSearchParams(location.search);setSelected(questionId(p.get("question")||""));setQuery(p.get("q")||"");setExam(p.get("exam")||"DP-600");};addEventListener("popstate",restore);return()=>removeEventListener("popstate",restore);},[]);
  if(legacy)return <><Link className={control+" inline-block mb-5"} href="/lab/dp-600/explore/" onClick={()=>setLegacy(false)}>All source questions</Link><Explorer/></>;
  return <div className="space-y-5" data-testid="unified-bank">
    <p className="text-sm leading-7">One searchable catalogue: 834 existing learning questions + 532 imported source records. The existing 222-question source bank now includes image-free tables, code and case context; it has not been added twice. Eleven revised questions have documentation-backed grading, while the other 211 remain available for ungraded study. 80 imports belong to PL-300. Timed sessions retain the existing bank.</p>
    <div className="flex flex-wrap gap-3"><Link className={control} href="/lab/dp-600/explore/?view=legacy">Existing bank: advanced filters and history</Link>{back&&<a className={control} href={back}>Return to Atlas view</a>}</div>
    <div className="grid gap-3 sm:grid-cols-3"><label className="text-sm">Search questions<input className={control+" mt-1 w-full"} value={query} onChange={e=>{setQuery(e.target.value);setLimit(40);}}/></label><label className="text-sm">Exam scope<select className={control+" mt-1 w-full"} value={exam} onChange={e=>setExam(e.target.value)}><option>DP-600</option><option>PL-300</option><option value="all">Both exams</option></select></label><label className="text-sm">Source<select className={control+" mt-1 w-full"} value={source} onChange={e=>setSource(e.target.value)}><option value="all">All sources</option>{[...new Set(rows.map(r=>r.source))].map(s=><option key={s}>{s}</option>)}</select></label></div>
    <label className="flex min-h-11 items-center gap-3 text-sm"><input type="checkbox" checked={pending} onChange={e=>setPending(e.target.checked)}/>Images required later</label>
    <label className="block text-sm">Image-free bank review<select className={control+" mt-1 w-full sm:max-w-md"} value={review} onChange={e=>{setReview(e.target.value);setLimit(40);}}><option value="all">All sources and review states</option><option value="reviewed">Documentation-checked revisions (11)</option><option value="held">Image-free questions with grading paused (211)</option></select></label>
    <p role="status" className="text-sm">{error||(!rows.length?"Loading question bank…":`${results.length} source records match`)}</p>
    {atlasLinks.some(l=>l.questionId===selected)&&<nav aria-label="Concepts related to this question" className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 p-4"><span className="text-sm">Explore the ideas:</span>{atlasLinks.filter(l=>l.questionId===selected).map(l=><a key={l.href} className={control} href={l.href}>{l.title}</a>)}</nav>}
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(220px,1fr)_minmax(0,2fr)]"><div><ul className="max-h-[65vh] space-y-2 overflow-y-auto">{results.slice(0,limit).map(r=><li key={r.id}><button className={control+" w-full text-left "+(r.id===selected?"border-primary bg-primary/10":"")} onClick={()=>open(r.id)}><span className="block font-medium">{r.title}</span><span className="block text-xs mt-2 text-muted-foreground">{r.exam} · {r.source}{r.r11?(r.r11.gradingEnabled?" · Documentation checked":" · Grading paused"):r.added?.blockers.length?" · ⚑ Images required later":""}</span><span className="mt-2 line-clamp-2 block text-xs">{r.search.slice(0,180)}</span></button></li>)}</ul>{limit<results.length&&<button className={control+" mt-3"} onClick={()=>setLimit(limit+40)}>Show more questions</button>}</div><section aria-label="Selected question" className="min-w-0">{current?.r11?<R11QuestionView key={current.id} question={current.r11} study={studies.find(s=>s.id===current.r11?.caseStudy)}/>:current?.added?<AddedView key={current.id} question={current.added}/>:current?.legacy?<LegacyView key={current.id} entry={current.legacy}/>:<p className="rounded-2xl border border-border p-5 text-sm">Select a question to practise. Existing saved sessions and progress are retained.</p>}</section></div>
  </div>;
}
function studiesText(q:R11Question,studies:R11Study[]){return studies.find(s=>s.id===q.caseStudy)?.text??"";}
function AddedView({question:q}:{question:AddedQuestion}) {
  const [values,setValues]=useState<Record<string,string>>({}),[checked,setChecked]=useState(false),[progress,setProgress]=useState<AddedProgress>({}),[storage,setStorage]=useState<"loading"|"ready"|"blocked">("loading"),[notice,setNotice]=useState("");
  useEffect(()=>{let alive=true;Promise.resolve().then(()=>{if(!alive)return;try{const d=parseAddedProgress(localStorage.getItem(ADDITIONS_KEY));if(d===null){setStorage("blocked");setNotice("Saved imported-question data is unreadable and was preserved. This question stays in memory.");return;}setProgress(d);setValues(d[q.id]?.values||{});setChecked(d[q.id]?.checked||false);setStorage("ready");}catch{setStorage("blocked");setNotice("Saving is unavailable; answers stay in memory.");}});return()=>{alive=false;};},[q.id]);
  function save(v:Record<string,string>,c=false){setValues(v);setChecked(c);if(storage!=="ready")return;try{const latest=parseAddedProgress(localStorage.getItem(ADDITIONS_KEY));if(!latest)throw new Error();const next={...latest,[q.id]:{values:v,checked:c}};localStorage.setItem(ADDITIONS_KEY,JSON.stringify({version:1,questions:next}));setProgress(next);}catch{setStorage("blocked");setNotice("Saving failed; existing saved data was preserved.");}}
  const result=gradeAdded(q,values);
  return <article className="space-y-5 rounded-2xl border border-border bg-card p-4 sm:p-6" data-testid="added-question">
    <p className="text-xs text-muted-foreground">{q.exam} · {additionSource(q.id)} · {Object.keys(progress).length} imported questions saved</p>
    {q.blockers.length>0&&<div role="note" className="rounded-xl border border-amber-500 p-4 text-sm"><strong>⚑ Images required later — scoring paused</strong><ul className="mt-2 list-disc pl-5">{q.blockers.map(b=><li key={b}>{b}</li>)}</ul></div>}
    {q.contextHtml&&<details><summary className="min-h-11 cursor-pointer py-3">Case / code context</summary><Html value={q.contextHtml}/></details>}
    <Html value={q.stemHtml}/>{q.images.map(im=><figure key={im.src}><img src={im.src} alt={im.caption} className="max-w-full"/><figcaption className="text-sm">{im.caption}</figcaption></figure>)}
    {q.mode==="controls"?<div className="space-y-4"><p className="text-xs text-muted-foreground">Choose each target value. Dropdowns provide a keyboard and touch alternative to dragging; source target order is retained.</p>{q.controls.map(c=><label key={c.id} className="block text-sm">{c.label}<select disabled={storage==="loading"} className={control+" mt-2 w-full"} value={values[c.id]||""} onChange={e=>save({...values,[c.id]:e.target.value})}><option value="">Choose…</option>{c.options.map((o,i)=><option key={i} value={o}>{o}</option>)}</select></label>)}</div>:<fieldset className="space-y-3"><legend className="mb-3 text-sm">{q.mode==="multi"?"Select all applicable options":"Select one option"}</legend>{q.options.map(o=><label key={o.id} className={control+" flex items-start gap-3"}><input disabled={storage==="loading"} className="mt-1" type={q.mode==="multi"?"checkbox":"radio"} name={q.id} checked={values[o.id]==="1"} onChange={()=>save(q.mode==="multi"?{...values,[o.id]:values[o.id]==="1"?"0":"1"}:{[o.id]:"1"})}/><span>{o.id}. {o.text}</span></label>)}</fieldset>}
    <div className="flex flex-wrap gap-3"><button className={control} disabled={result===null||storage==="loading"} onClick={()=>save(values,true)}>Check against source answer</button><button className={control} onClick={()=>setChecked(true)}>Read supplied explanation</button><button className={control} onClick={()=>save({})}>Reset this imported question</button></div>
    <p role="status" className="text-sm">{notice}{checked&&result!==null?(result?" Matches the supplied answer.":" Differs from the supplied answer."):""}</p>
    {checked&&<div className="space-y-4 border-t border-border pt-4"><p className="text-xs text-muted-foreground">{q.review}. Matching wording in another source may have a different answer; no automatic adjudication was applied.</p><p className="break-words text-sm">Supplied answer: {q.mode==="controls"?q.controls.map(c=>c.label+" → "+c.answer).join("; "):q.answers.join(", ")}</p><Html value={q.explanationHtml}/>{q.revealImages?.map(im=><a key={im.src} className="block min-h-11 py-3 text-primary underline" href={im.src}>{im.caption}</a>)}<ul>{q.refs.map((r,i)=><li key={i}><a className="inline-block min-h-11 py-3 text-primary underline" href={r.url}>{r.title}</a></li>)}</ul></div>}
  </article>;
}
function Html({value}:{value:string}){return <div className="overflow-x-auto break-words text-sm leading-7 [&_pre]:whitespace-pre-wrap [&_table]:min-w-full [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_p]:my-3 [&_li]:ml-5 [&_li]:list-disc" dangerouslySetInnerHTML={{__html:value}}/>;}
function LegacyView({entry}:{entry:FabricIndexEntry}) {
  const [q,setQ]=useState<FabricQuestion|null>(null),[values,setValues]=useState<string[]>([]),[checked,setChecked]=useState(false);const {store}=useFabricStore();
  useEffect(()=>{let alive=true;loadQuestions([entry.id],new Map([[entry.id,entry.pack]])).then(qs=>{if(alive)setQ(qs[0]);});return()=>{alive=false;};},[entry]);
  if(!q)return <p>Loading original question…</p>;
  return <><QuestionView question={q} order={q.options.map(o=>o.id)} value={values} onChange={setValues} revealed={checked} index={0} total={1} sources={SOURCE_BY_ID} caseStudy={q.caseStudyId?CASE_BY_ID.get(q.caseStudyId)??null:null} bookmarked={store.bookmarks.includes(q.id)} flagged={store.flags.includes(q.id)} onToggleBookmark={()=>toggleBookmark(q.id)} onToggleFlag={()=>toggleFlag(q.id)} packTitle={packLabel(q.pack)} videoHref={null}/><button className={control+" mt-3"} disabled={!values.length} onClick={()=>setChecked(true)}>Read answer and explanation</button></>;
}
