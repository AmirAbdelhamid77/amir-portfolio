"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Compass, Layers, Search } from "lucide-react";
import { searchInsights, selectedInsight, type Insight } from "@/lib/knowledge/insights";
import { AtlasPeek } from "@/components/atlas/peek";
import type { Atlas } from "@/lib/atlas/model";

const action = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border-strong px-5 py-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";
export function KnowledgeStage({ items, atlas, notice }: { items: Insight[]; atlas: Atlas; notice: string }) {
  const [selected, setSelected] = useState(items[0]?.id ?? "");
  const [dealt, setDealt] = useState(0);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("all");
  const [message, setMessage] = useState("");
  useEffect(() => {
    function restore() {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("insight");
      setSelected(selectedInsight(items, id)?.id ?? "");
      setMessage(id && !items.some(item => item.id === id) ? "That insight is unavailable. Showing the latest preview edition." : "");
    }
    // Defer the initial URL read; browser APIs never run in static rendering.
    Promise.resolve().then(restore);
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [items]);
  const current = selectedInsight(items, selected);
  const results = searchInsights(items, query, topic);
  function choose(id: string) {
    setSelected(id); setMessage("Insight selected. Open the explanation when you are ready.");
    const url = new URL(window.location.href); url.searchParams.set("insight",id);
    window.history.pushState({}, "", url);
  }
  if (!current) return <section className="mx-auto max-w-3xl px-5 py-32"><h1 className="text-4xl">The next insight is being checked.</h1><p className="mt-6 leading-8">No eligible content is available. Explore the existing lessons while editorial review continues.</p><Link href="/learn/catalogue/" className={action}>Browse learning</Link></section>;
  const card = items[dealt % items.length];
  return <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 sm:px-6 md:pt-28">
    <div className="mb-10 flex flex-wrap items-center justify-between gap-3 border-b border-border-strong pb-4 text-xs text-muted-foreground">
      <span className="font-mono uppercase tracking-[.14em]">Hansa / Knowledge Stage</span><span>Prototype C · Local editorial preview</span>
    </div>
    <header className="mb-10 max-w-3xl">
      <p className="text-sm font-medium text-primary">A small idea. A better decision.</p>
      <h1 className="mt-4 text-balance text-5xl font-medium leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">Make room for<br/><span className="text-primary">one good question.</span></h1>
      <p className="mt-5 max-w-xl text-pretty text-base leading-8 text-muted-foreground">Start with a situation. Unpack the reasoning. Follow the idea into a lesson, a practice session, or the Atlas.</p>
    </header>
    <nav aria-label="Insight editions" className="mb-5 rounded-2xl border border-border-strong bg-card p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-medium">Daily Insight <span className="font-normal text-muted-foreground">/ condensed timeline</span></h2><a className="inline-flex min-h-11 items-center text-sm underline underline-offset-4" href="#insight-archive">All editions <ArrowRight className="ml-2 size-4" aria-hidden="true"/></a></div>
      <ol className="mt-2 grid gap-2 sm:grid-cols-3">{items.map(item => <li key={item.id}><a href={`#archive-${item.id}`} onClick={event=>{event.preventDefault();choose(item.id);}} aria-current={current.id===item.id?"date":undefined} className={`block min-h-11 rounded-xl border p-3 text-sm transition-colors ${current.id===item.id?"border-primary bg-primary/10":"border-border-strong hover:bg-muted"}`}><time className="font-mono text-xs" dateTime={item.date}>{item.date}</time><span className="mt-1 block font-medium">{item.cardTitle}</span></a></li>)}</ol>
    </nav>
    <div className="grid items-start gap-5 lg:grid-cols-[1.65fr_1fr]">
      <section aria-labelledby="daily-title" className="rounded-3xl border border-border-strong bg-card p-6 sm:p-9">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"><span className="font-mono uppercase tracking-widest">01 / Think it through</span><span>{current.topic} · Preview edition <time dateTime={current.date}>{current.date}</time></span></div>
        <h2 id="daily-title" className="mt-7 text-balance text-3xl font-medium leading-tight tracking-tight sm:text-4xl">{current.title}</h2>
        <p className="mt-5 text-base leading-8">{current.scenario}</p>
        <p className="mt-4 border-l-2 border-primary pl-4 text-sm leading-7 text-muted-foreground">{current.prediction}</p>
        <details key={current.id} className="mt-7 rounded-2xl border border-border-strong bg-background p-4 sm:p-5" data-testid="daily-reveal">
          <summary className="min-h-11 cursor-pointer py-3 font-medium">Reveal the reasoning</summary>
          <div className="pb-2 pt-3"><p className="text-lg font-medium leading-8">{current.takeaway}</p><p className="mt-3 text-sm leading-7 text-muted-foreground">{current.caveat}</p><p className="mt-4 text-xs leading-6 text-muted-foreground">Source checked {current.checkedAt} · Human publication review pending</p><a className="mt-2 inline-flex min-h-11 items-center text-sm underline underline-offset-4" href={current.sourceUrl}>Read Microsoft Learn · {current.sourceLocator}</a></div>
        </details>
        <div className="mt-6 flex flex-wrap gap-3"><Link className={`${action} bg-foreground text-background hover:bg-foreground/90`} href={current.lessonHref}><BookOpen className="size-4" aria-hidden="true"/>Read the lesson</Link><Link className={action} href={current.practiceHref}>Explore practice <ArrowRight className="size-4" aria-hidden="true"/></Link></div>
        <p className="mt-4 text-xs leading-6 text-muted-foreground">A reflection prompt, with no score or saved answer.</p>
      </section>
      <section aria-labelledby="dealer-title" className="overflow-hidden rounded-3xl border border-border-strong bg-primary/5 p-6 sm:p-7">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">02 / Change your lens</p>
        <h2 id="dealer-title" className="mt-4 text-2xl font-medium tracking-tight">Deal an idea.</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">One knowledge card at a time. A new angle on the decision, with its caveat attached.</p>
        <div className="relative mt-7 pb-3 pr-3"><div aria-hidden="true" className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl border border-border-strong bg-card"/><article className="relative min-h-64 rounded-2xl border border-border-strong bg-background p-5" aria-labelledby="card-title"><p className="flex items-center justify-between text-xs text-muted-foreground"><Layers className="size-4" aria-hidden="true"/><span className="font-mono tabular-nums">{dealt % items.length+1} / {items.length}</span></p><h3 id="card-title" className="mt-6 text-xl font-medium">{card.cardTitle}</h3><p className="mt-3 text-sm leading-7">{card.takeaway}</p><details className="mt-3" key={card.id}><summary className="min-h-11 cursor-pointer py-3 text-sm underline underline-offset-4">Caveat & source</summary><p className="text-sm leading-7 text-muted-foreground">{card.caveat}</p><a href={card.sourceUrl} className="inline-flex min-h-11 items-center text-sm underline">Microsoft Learn</a></details></article></div>
        <div className="mt-5 flex flex-wrap gap-2"><button type="button" className={`${action} bg-foreground text-background hover:bg-foreground/90`} onClick={()=>{setDealt(value=>(value+1)%items.length);setMessage("Next knowledge card dealt.");}}>Deal next card</button><button type="button" className={action} onClick={()=>{setDealt(0);setMessage("Knowledge deck reset to the first card.");}}>Reset deck</button></div>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">Ordered rotation · No streak, score or tracking.</p>
      </section>
    </div>
    <p role="status" aria-live="polite" className="mt-3 min-h-6 text-sm text-muted-foreground">{message}</p>
    <div className="mt-10"><AtlasPeek atlas={atlas}/></div>
    <section className="mt-12" aria-labelledby="doors-title"><h2 id="doors-title" className="text-2xl font-medium tracking-tight">Choose your next step.</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{[
      {title:"Learn",body:"Build an explanation before choosing a tool.",href:"/learn/catalogue/",Icon:BookOpen},
      {title:"Practice",body:"Transfer the reasoning into an independent session.",href:"/practice/catalogue/",Icon:Layers},
      {title:"Atlas",body:"Inspect the evidence behind a connection.",href:"/learn/dp-600/atlas/",Icon:Compass}
    ].map(({title,body,href,Icon})=><Link key={title} href={href} className="rounded-2xl border border-border-strong p-6 transition-colors hover:bg-card"><Icon className="size-5 text-primary" aria-hidden="true"/><h3 className="mt-4 text-lg font-medium">{title} <span aria-hidden="true">→</span></h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p></Link>)}</div></section>
    <section id="insight-archive" className="mt-14 scroll-mt-20" aria-labelledby="archive-title"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Keep exploring</p><h2 id="archive-title" className="mt-3 text-3xl font-medium tracking-tight">The insight archive.</h2></div><Link href="/search/" className={action}><Search className="size-4" aria-hidden="true"/>Search all Hansa</Link></div>
      <div className="mt-5 flex flex-wrap gap-3"><label className="min-w-0 flex-1 basis-full text-sm sm:basis-0" htmlFor="insight-query">Search preview insights<input id="insight-query" className="mt-2 block min-h-11 w-full rounded-xl border border-border-strong bg-background px-4" value={query} onChange={e=>setQuery(e.target.value)} type="search" placeholder="Try permissions or Files"/></label><label className="text-sm" htmlFor="insight-topic">Topic<select id="insight-topic" value={topic} onChange={e=>setTopic(e.target.value)} className="mt-2 block min-h-11 rounded-xl border border-border-strong bg-background px-4"><option value="all">All topics</option>{[...new Set(items.map(item=>item.topic))].map(t=><option key={t}>{t}</option>)}</select></label><button className={`${action} self-end`} onClick={()=>{setQuery("");setTopic("all");}}>Clear filters</button></div>
      <p role="status" className="mt-3 text-sm text-muted-foreground">{results.length} preview {results.length===1?"insight":"insights"}{results.length===0?". Try another term or clear filters.":""}</p>
      <div className="mt-4 grid gap-3">{results.map(item=><article key={item.id} id={`archive-${item.id}`} className="scroll-mt-20 rounded-2xl border border-border-strong p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-medium">{item.title}</h3><time className="font-mono text-xs text-muted-foreground" dateTime={item.date}>{item.date} · {item.topic}</time></div><p className="mt-3 text-sm leading-7">{item.scenario}</p><details className="mt-2"><summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">Read this insight</summary><p className="text-sm leading-7">{item.takeaway} {item.caveat}</p><a className="inline-flex min-h-11 items-center text-sm underline" href={item.sourceUrl}>Source · {item.sourceLocator}</a></details><a className="inline-flex min-h-11 items-center text-sm underline" href={`?insight=${item.id}`}>Open edition permalink</a></article>)}</div>
    </section>
    <aside className="mt-10 border-t border-border-strong pt-5 text-xs leading-6 text-muted-foreground">{notice} Source references are independent from historical question-bank answer keys. No question IDs or review states have been changed.</aside>
    <noscript><p className="mt-5 rounded-xl border border-border-strong p-4">JavaScript is off. Read every edition and its explanation in the archive below the stage. Deck rotation and filters require JavaScript.</p></noscript>
  </div>;
}
