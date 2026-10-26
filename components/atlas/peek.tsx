"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { defaultView, neighborhood, safeReturn, viewHref, RELATIONS, type Atlas } from "@/lib/atlas/model";
export function AtlasPeek({ atlas }: { atlas: Atlas }) {
  const [returnTo, setReturnTo] = useState("");
  useEffect(() => { const target = safeReturn(new URLSearchParams(window.location.search).get("atlasReturn"), atlas); Promise.resolve().then(() => setReturnTo(target)); }, [atlas]);
  const slice = neighborhood(atlas, { ...defaultView(), incoming: true });
  return <section className="rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-7" aria-labelledby="atlas-peek-title" data-testid="atlas-peek">
    <p className="text-xs font-medium uppercase tracking-widest text-primary">Knowledge Atlas · Peek</p>
    <h2 id="atlas-peek-title" className="mt-3 text-2xl font-medium">See how this decision connects.</h2>
    <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">Reference, replication, identity and query access are connected ideas. Inspect why a connection holds before choosing a pattern.</p>
    {atlas.preview && <p className="mt-3 text-xs leading-6 text-muted-foreground">Local review preview · relations checked against Microsoft documentation; human publication review pending.</p>}
    {slice.edges.length ? <ul className="mt-5 grid gap-3 md:grid-cols-2">{slice.edges.slice(0, 4).map(edge => <li key={edge.id}><Link href={viewHref({ ...defaultView(), edge: edge.id, incoming: true })} className="block min-h-11 rounded-2xl border border-border-strong bg-background p-4 text-sm leading-6"><span className="text-xs text-primary">{RELATIONS[edge.relationType]}</span><span className="mt-1 block">{edge.claim}</span><span className="mt-2 block text-xs underline">Why connected? →</span></Link></li>)}</ul> : <p className="mt-4 text-sm leading-7">{atlas.notice}</p>}
    <div className="mt-5 flex flex-wrap gap-3"><Link className="min-h-11 rounded-full bg-primary px-5 py-3 text-sm text-primary-foreground" href={returnTo || viewHref(defaultView())}>{returnTo ? "Return to your Atlas view" : "Explore the full Atlas"}</Link><Link className="min-h-11 rounded-full border border-border-strong px-5 py-3 text-sm" href="/learn/dp-600/atlas/journey/">Start the guided journey</Link></div>
  </section>;
}
