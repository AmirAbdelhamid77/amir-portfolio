from pathlib import Path
r=Path(__file__).resolve().parents[1];p=r/'components/study/orientation.tsx'
p.write_text('''"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useState} from "react";
import {SUBJECTS,topicHref} from "@/lib/study/taxonomy";
export function StudyOrientation(){
 const path=usePathname();
 const [context,setContext]=useState(""),[unit,setUnit]=useState(""),[review,setReview]=useState(false);
 useEffect(()=>{const restore=()=>{const q=new URL(location.href).searchParams;setContext(q.get("learningContext")??"");setUnit(q.get("learningUnit")??"");setReview(q.get("learningReview")==="1");};queueMicrotask(restore);addEventListener("popstate",restore);return()=>removeEventListener("popstate",restore);},[path]);
 if(!/^\\/(learn|lab|practice|explore)(\\/|$)/.test(path)||path.includes("/catalogue"))return null;
 const [contextSubject,contextTopic]=context.split(".");
 const selected=SUBJECTS.find(s=>s.id===contextSubject),topic=selected?.topics.find(t=>t[0]===contextTopic);
 const subject=path.includes("dp-600")?"fabric":path.includes("statistics")?"statistics":path.includes("/lab/power-bi")?"power-bi":path.includes("/lab/sql")?"sql":path.includes("/lab/python")?"python":path.includes("/lab/excel")?"excel":path==="/lab"||path==="/lab/"?"analysis":"visualization";
 const label=SUBJECTS.find(s=>s.id===subject)!.title;
 const validUnit=/^[\\w:.-]{1,150}$/.test(unit);
 const className="min-h-11 py-2 underline underline-offset-4";
 return <nav aria-label="Learning context" className="relative z-10 mx-auto mt-20 mb-[-48px] flex w-full max-w-6xl flex-wrap gap-x-5 gap-y-2 px-5 text-xs leading-6 text-muted-foreground"><Link className={className} href="/study/">Learning library</Link>{!path.includes("drafts")&&<Link className={className} href={`/study/${subject}/`}>{label} topics</Link>}{selected&&topic&&<Link className={className} href={path.includes("drafts")?"/study/review/":topicHref(selected.id,topic[0])}>Return to {topic[1]}</Link>}{selected&&validUnit&&<Link className={className} href={`${review&&path.includes("drafts")?"/study/review/path/":`/study/${selected.id}/path/`}#${unit}`}>Back to this lesson step</Link>}<span className="min-h-11 py-2">{path.includes("drafts")?"Review workspace · not approved":path.startsWith("/lab")||path.startsWith("/practice")?"Practice & review":"Learning & experiments"}</span></nav>;
}
''',encoding='utf8')
p=r/'components/study/path.css';s=p.read_text(encoding='utf8');s+='\n.path-step-nav{display:flex;justify-content:space-between;gap:20px;margin-bottom:12px;font-size:12px}.path-step-nav a{display:inline-flex;align-items:center;min-height:44px;text-decoration:underline;text-underline-offset:4px}\n';p.write_text(s,encoding='utf8')
p=r/'app/study/review/page.tsx';s=p.read_text(encoding='utf8').replace('<TopicBrowser items={reviewRecords()}/>','<Link className="study-open" href="/study/review/path/">Inspect declared lesson prerequisites and assessments ↗</Link><TopicBrowser items={reviewRecords()}/>');p.write_text(s,encoding='utf8')
