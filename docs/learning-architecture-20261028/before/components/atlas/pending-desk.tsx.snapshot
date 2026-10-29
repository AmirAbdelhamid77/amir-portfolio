"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Source } from "@/lib/atlas/model";
import "./reading-desk.css";
export type ReadingSource = Pick<Source,"id"|"title"|"url"|"locator"|"checkedAt">;

/** Bibliographic browsing is not a substitute public semantic graph. */
export function AtlasPendingDesk({sources,notice}:{sources:ReadingSource[];notice:string}) {
  const [query,setQuery]=useState("");
  const [selected,setSelected]=useState(sources[0]?.id??"");
  const [announcement,setAnnouncement]=useState("");
  useEffect(()=>{
    const restore=()=>{const id=new URLSearchParams(window.location.search).get("reading");setSelected(sources.some(s=>s.id===id)?id!:sources[0]?.id??"");};
    queueMicrotask(restore);window.addEventListener("popstate",restore);return()=>window.removeEventListener("popstate",restore);
  },[sources]);
  const matches=useMemo(()=>{const words=query.trim().toLowerCase().split(/\s+/).filter(Boolean);return sources.filter(s=>words.every(w=>[s.title,s.locator].join(" ").toLowerCase().includes(w)));},[sources,query]);
  const active=matches.find(s=>s.id===selected)??matches[0];
  function choose(source:ReadingSource){setSelected(source.id);setAnnouncement(`${source.title} selected. Source section and official link updated.`);const url=new URL(window.location.href);url.searchParams.set("reading",source.id);window.history.pushState(null,"",url);}
  function reset(){setQuery("");setSelected(sources[0]?.id??"");setAnnouncement("Reading desk reset. Learning progress was not changed.");const url=new URL(window.location.href);url.searchParams.delete("reading");window.history.pushState(null,"",url);}
  return <section className="atlas-reading" aria-labelledby="atlas-reading-title" data-testid="atlas-pending-desk">
    <header className="reading-masthead"><div><p className="reading-kicker">The evidence reading room</p><h2 id="atlas-reading-title">Start with the source.</h2></div><p className="reading-status"><span aria-hidden="true"/>Publication review is pending</p></header>
    <p className="reading-intro">{notice} Browse the public documentation and continue learning here. These source records are a bibliography, not published concept relationships.</p>
    <div className="reading-layout">
      <div className="reading-navigator"><label htmlFor="atlas-source-search">Find a source</label><input id="atlas-source-search" type="search" value={query} onChange={e=>setQuery(e.target.value.slice(0,120))} placeholder="Try shortcuts, security or mirroring"/><div className="reading-count"><span aria-live="polite">{matches.length} of {sources.length} sources</span><button type="button" onClick={reset}>Reset desk</button></div>
        <ul aria-label="Public documentation sources">{matches.map((source,index)=><li key={source.id}><button type="button" aria-pressed={source.id===active?.id} onClick={()=>choose(source)}><span aria-hidden="true" className="reading-number">{String(index+1).padStart(2,"0")}</span><span>{source.title}<small>Microsoft Learn</small></span><span aria-hidden="true">↗</span></button></li>)}</ul>
        {!matches.length&&<p className="reading-empty">No source matches. Try a broader term or reset the desk.</p>}
      </div>
      <div className="reading-folio" aria-live="polite" aria-atomic="true">
        {active?<article aria-label="Selected documentation source"><p className="reading-kicker">Source record / {active.id}</p><h3>{active.title}</h3><p className="reading-locator-label">Open at this section</p><p className="reading-locator">{active.locator}</p><a href={active.url} target="_blank" rel="noreferrer noopener">Read on Microsoft Learn <span aria-hidden="true">↗</span><span className="sr-only"> (opens a new tab)</span></a><p className="reading-provenance">Source record checked {active.checkedAt}. This date is inherited from the existing bibliography; it is not a new human publication approval.</p><p className="reading-caveat">No semantic connection is being asserted by the position of these sources. The reviewed graph remains behind its publication gate.</p></article>:<p className="reading-empty">The source reader appears when a matching public source is selected.</p>}
      </div>
    </div>
    <nav className="reading-continuation" aria-label="Continue while Atlas review is pending"><span>Keep learning</span><Link href="/learn/dp-600/ingestion/#understand">Read the ingestion lesson ↗</Link><Link href="/learn/dp-600/ingestion/#experiment">Try the comparison ↗</Link><Link href="/lab/dp-600/explore/">Independent practice ↗</Link><Link href="/lab/dp-600/resources/">Study resources ↗</Link></nav>
    <noscript><section><h3>All public source links</h3><ul>{sources.map(source=><li key={source.id}><a href={source.url}>{source.title} — {source.locator}</a></li>)}</ul><p>Search and source selection require JavaScript. These links remain available without it.</p></section></noscript>
    <p className="sr-only" role="status">{announcement}</p>
  </section>;
}
