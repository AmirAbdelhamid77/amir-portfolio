"use client";
import { motion, useReducedMotion } from "motion/react";
import { circleLayout, circleEndpoints, circleState } from "@/lib/atlas/circle-layout";
import "./circle-map.css";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { defaultView, resourceReturnHref, neighborhood, parseView, viewHref, searchConcepts, RELATIONS, type Atlas, type View, type Edge } from "@/lib/atlas/model";
const button = "min-h-11 rounded-xl border border-border-strong bg-background px-3 py-2 text-sm hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

export function AtlasExplorer({ atlas }: { atlas: Atlas }) {
  const [view, setView] = useState<View>(defaultView), [query, setQuery] = useState(""), [map, setMap] = useState(false), [notice, setNotice] = useState("");
  const inspector = useRef<HTMLElement>(null), uid = useId().replaceAll(":", "");
  useEffect(() => {
    const sync = () => { const result = parseView(window.location.search, atlas); setView(result.view); setNotice(result.warning); };
    Promise.resolve().then(sync); window.addEventListener("popstate", sync); return () => window.removeEventListener("popstate", sync);
  }, [atlas]);
  function update(patch: Partial<View>, focusInspector = false) {
    const next = { ...view, ...patch }; setView(next); window.history.pushState(null, "", viewHref(next));
    if (focusInspector) window.requestAnimationFrame(() => { inspector.current?.focus({ preventScroll: true }); if (window.matchMedia("(max-width: 1279px)").matches) inspector.current?.scrollIntoView({ block: "start", behavior: "instant" }); });
  }
  const mapContainer = useRef<HTMLDivElement>(null);
  const [mapWidth, setMapWidth] = useState(1000);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const element = mapContainer.current; if (!element) return;
    const observer = new ResizeObserver(entries => { const width = entries[0]?.contentRect.width; if (width) setMapWidth(width); });
    observer.observe(element); return () => observer.disconnect();
  }, [map, atlas.concepts.length]);
  const slice = neighborhood(atlas, view);
  const layout = circleLayout(slice.concepts, mapWidth);
  const transition = { duration: reduceMotion ? 0 : .18, ease: "easeOut" as const };
  const matches = searchConcepts(atlas, query);
  const concept = atlas.concepts.find(item => item.id === view.concept) ?? atlas.concepts[0];
  const selectedEdge = atlas.semanticEdges.find(item => item.id === view.edge);
  const edgeLabel = (edge: Edge) => `${atlas.concepts.find(item => item.id === edge.from)?.title} ${RELATIONS[edge.relationType].toLowerCase()} ${atlas.concepts.find(item => item.id === edge.to)?.title}`;
  const resourceHref = (href: string) => resourceReturnHref(href, view);
  function evidence(ids: string[]) { return <ul className="mt-3 space-y-3">{ids.map(id => { const source = atlas.sources.find(item => item.id === id)!; return <li key={id} className="text-sm leading-6"><a href={source.url} className="inline-block min-h-11 py-2 font-medium text-primary underline underline-offset-4">{source.title} — Microsoft Learn</a><p className="text-xs text-muted-foreground">{source.locator} · checked {source.checkedAt}</p></li>; })}</ul>; }
  if (!atlas.concepts.length) return <section className="rounded-3xl border border-border-strong p-6"><h2 className="text-xl font-medium">Publication review is pending</h2><p className="mt-3 text-sm leading-7">{atlas.notice}</p><Link href="/learn/dp-600/ingestion/" className="mt-4 inline-block min-h-11 py-3 text-primary underline">Continue with the ingestion lesson</Link></section>;
  return <div data-testid="atlas-explorer" className="space-y-5">
    {atlas.preview && <p className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm leading-7" data-testid="review-notice">{atlas.notice}</p>}
    <div className="flex flex-wrap items-center gap-3"><Link className={button} href="/learn/dp-600/ingestion/">← Back to the lesson</Link><Link className={button} href="/learn/dp-600/atlas/journey/">Guided journey →</Link><button className={button} onClick={() => { const next = defaultView(); setQuery(""); update(next); setNotice("View reset. Your learning progress was not changed."); }}>Reset view</button><button className={button} onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); setNotice("Atlas link copied. It contains view settings only, no answers or progress."); } catch { setNotice("Copy is unavailable. Select the address in your browser to share this view."); } }}>Copy view link</button></div>
    <p role="status" aria-live="polite" className="min-h-6 text-sm text-muted-foreground">{notice}</p>
    <div className="grid items-start gap-5 xl:grid-cols-[240px_minmax(0,1fr)_320px]">
      <aside className="min-w-0 rounded-3xl border border-border-strong bg-card/40 p-4" aria-label="Atlas navigator">
        <label className="block text-sm font-medium">Find a concept<input type="search" className="mt-2 block min-h-11 w-full rounded-xl border border-border-strong bg-background px-3 text-sm" value={query} onChange={event => setQuery(event.target.value.slice(0, 80))} /></label>
        <p className="mt-2 text-xs leading-6 text-muted-foreground">{matches.length} of {atlas.concepts.length} concepts · aliases included</p>
        <ul className="mt-3 space-y-2">{matches.map(item => <li key={item.id}><button className={`${button} w-full text-start ${item.id === view.concept ? "border-primary bg-primary/5 font-medium" : ""}`} aria-pressed={item.id === view.concept} onClick={() => update({ concept: item.id, edge: "" }, true)}>{item.title}</button></li>)}</ul>
        {!matches.length && <p className="mt-4 text-sm leading-7">No concept matches. Try a shorter term or an alias.</p>}
        <details className="mt-5 border-t border-border pt-3"><summary className="min-h-11 cursor-pointer py-3 text-sm font-medium">Guide navigator — separate from the graph</summary><p className="text-xs leading-6 text-muted-foreground">Source order and chapter membership do not create semantic connections.</p><ul className="mt-3">{atlas.toc.map(item => <li key={item.id}><a className="inline-block min-h-11 py-2 text-sm text-primary underline" href={resourceHref(atlas.catalog.find(resource => resource.id === item.resourceId)!.href)}>{item.title}</a></li>)}</ul><p className="text-xs leading-6 text-muted-foreground">Representative coverage across the three DP-600 domains. Detailed objective coverage and question mapping remain in progress.</p></details>
      </aside>
      <section className="min-w-0 space-y-4" aria-label="Semantic connections">
        <div className="rounded-3xl border border-border-strong p-4">
          <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Evidence lens<select className="mt-2 block min-h-11 w-full rounded-xl border border-border-strong bg-background px-3" aria-label="Evidence lens" value={view.source} onChange={event => update({ source: event.target.value, edge: "" })}><option value="all">All reviewed sources</option>{atlas.sources.map(source => <option key={source.id} value={source.id}>{source.title}</option>)}</select></label><label className="text-sm">Relationship<select className="mt-2 block min-h-11 w-full rounded-xl border border-border-strong bg-background px-3" aria-label="Relationship" value={view.relation} onChange={event => update({ relation: event.target.value, edge: "" })}><option value="all">All semantic types</option>{Object.entries(RELATIONS).filter(([id]) => atlas.semanticEdges.some(edge => edge.relationType === id)).map(([id, title]) => <option value={id} key={id}>{title}</option>)}</select></label></div>
          <label className="mt-3 flex min-h-11 items-center gap-3 text-sm"><input className="size-4 accent-primary" type="checkbox" checked={view.incoming} onChange={event => update({ incoming: event.target.checked, edge: "" })} />Include incoming directed connections</label>
          <div className="mt-2 flex flex-wrap items-center gap-2"><button className={button} disabled={view.hops === 1} onClick={() => update({ hops: 1, edge: "" })}>Focus −</button><span className="text-sm">{view.hops}-hop focus</span><button className={button} disabled={view.hops === 2} onClick={() => update({ hops: 2, edge: "" })}>Focus +</button><button className={button + " xl:hidden"} aria-pressed={map} onClick={() => setMap(!map)}>{map ? "Use the connection list" : "Open the optional map"}</button></div>
          <p className="mt-3 text-xs leading-6 text-muted-foreground">Filters combine; they do not change a claim. Arrows follow the stored direction; symmetric relations work both ways. Hidden prerequisites still apply.</p>
        </div>
        <div className={`${map ? "block" : "hidden xl:block"} overflow-hidden rounded-3xl border border-border-strong bg-card/30`} data-testid="atlas-map">
          <div className="flex flex-wrap gap-2 border-b border-border p-3">{[["Zoom in", { zoom: Math.min(2.5, view.zoom + .2) }], ["Zoom out", { zoom: Math.max(.6, view.zoom - .2) }], ["Fit map", { zoom: 1, x: 0, y: 0 }], ["Pan left", { x: Math.max(-400, view.x - 70) }], ["Pan right", { x: Math.min(400, view.x + 70) }], ["Pan up", { y: Math.max(-400, view.y - 70) }], ["Pan down", { y: Math.min(400, view.y + 70) }]].map(([title, patch]) => <button key={String(title)} className={button} onClick={() => update(patch as Partial<View>)}>{String(title)}</button>)}</div>
          <p id={uid + "-map-help"} className="px-4 pt-3 text-xs leading-6 text-muted-foreground">Select a circle to open its definition, evidence and learning links. Tab between concepts and connections; Enter or Space opens details. Selected: filled circle. Related: solid outline. Prerequisite: dashed outline. Size fits the label, not importance.</p>
          <div ref={mapContainer} className={"atlas-circle-viewport"}>
          <svg role="group" aria-label="Semantic concept map; equivalent labeled connection list follows" aria-describedby={uid + "-map-help"} style={{ width: "100%", height: layout.height, minWidth: 280 }} viewBox={`${view.x + layout.width/2 - layout.width/2 / view.zoom} ${view.y + layout.height/2 - layout.height/2 / view.zoom} ${layout.width / view.zoom} ${layout.height / view.zoom}`}>
            <title>Documented DP-600 relationships</title><defs><marker id={`${uid}-arrow`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="currentColor" /></marker></defs>
            {slice.edges.map(edge => {
              const a = layout.nodes.find(item => item.id === edge.from)!, b = layout.nodes.find(item => item.id === edge.to)!;
              const endpoints = circleEndpoints(a, b);
              return <g key={edge.id} role="button" tabIndex={0} aria-label={edgeLabel(edge)} aria-pressed={edge.id === view.edge} className={"atlas-circle-edge" + " " + (edge.id === view.edge ? "text-primary" : "text-muted-foreground")} onClick={() => update({ edge: edge.id }, true)} onKeyDown={event => { if (["Enter"," "].includes(event.key)) { event.preventDefault(); update({ edge: edge.id }, true); } }}>
                <title>{edge.claim}</title>
                <motion.line initial={false} animate={endpoints} transition={transition} className={"atlas-circle-edgeLine"} stroke="currentColor" strokeWidth={edge.id===view.edge ? 4 : 2} strokeDasharray={edge.direction === "symmetric" ? "6 4" : undefined} markerEnd={edge.direction === "directed" ? `url(#${uid}-arrow)` : undefined} />
                <motion.line initial={false} animate={endpoints} transition={transition} stroke="transparent" strokeWidth="20" />
              </g>;
            })}
            {layout.nodes.map(item => {
              const state = circleState(item.id, view.concept, atlas.semanticEdges);
              return <motion.g initial={false} animate={{ x: item.position[0], y: item.position[1] }} transition={transition} key={item.id} role="button" tabIndex={0} aria-label={`Select ${item.lines.join(" ")} ${state}. ${item.title}`} aria-pressed={item.id === view.concept} data-concept-id={item.id} data-state={state} className={"atlas-circle-node"} onClick={() => update({ concept: item.id, edge: "" }, true)} onKeyDown={event => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); update({ concept: item.id, edge: "" }, true); } }}>
                <title>{`${item.title} — ${state}. Open definition, evidence and learning links.`}</title>
                <circle r={item.radius + 9} className={"atlas-circle-ring"} aria-hidden="true" />
                <g className={"atlas-circle-face"}>
                  <circle r={item.radius} className={"atlas-circle-surface"} />
                  <text textAnchor="middle" className="fill-foreground font-medium" style={{ fontSize: item.fontSize, pointerEvents: "none" }} aria-hidden="true">{item.lines.map((line,index) => <tspan key={index} x="0" y={(index - (item.lines.length - 1)/2) * 19 - 6}>{line}{" "}</tspan>)}<tspan x="0" y={(item.lines.length - 1)/2 * 19 + 17} style={{ fontSize: 11, fontWeight: 400 }}>{state}</tspan></text>
                </g>
              </motion.g>;
            })}
          </svg></div><p className="px-4 pb-4 text-xs leading-6 text-muted-foreground">Solid arrow: directed mechanism or enabling condition. Dashed line: symmetric comparison. Focus a connection to hear its type or inspect the labeled list below. Prerequisites use explicit understanding relations only; hidden prerequisites still apply.</p>
        </div>
        <div className="rounded-3xl border border-border-strong p-4"><h2 className="text-lg font-medium">Connections you can explain</h2><p className="mt-2 text-sm leading-7 text-muted-foreground" role="status">{slice.concepts.length} concepts · {slice.edges.length} relations in this focus. {slice.hiddenConcepts || slice.hiddenEdges ? `${slice.hiddenConcepts} concepts and ${slice.hiddenEdges} relations hidden by display limits.` : ""}</p>
          <ul className="mt-4 space-y-3">{slice.edges.map(edge => <li key={edge.id}><button className={`${button} w-full p-4 text-start ${view.edge === edge.id ? "border-primary bg-primary/5" : ""}`} onClick={() => update({ edge: edge.id }, true)} aria-pressed={view.edge === edge.id}><span className="block text-xs font-medium text-primary">{edge.direction === "directed" ? "Directed →" : "Symmetric ↔"} · {RELATIONS[edge.relationType]}</span><span className="mt-2 block leading-6">{edge.claim}</span><span className="mt-2 block text-xs underline">Inspect conditions and evidence</span></button></li>)}</ul>
          {!slice.edges.length && <p className="mt-4 text-sm leading-7">No reviewed relationships match this focus and these filters. Reset the view or include incoming connections.</p>}
        </div>
      </section>
      <aside ref={inspector} tabIndex={-1} className="min-w-0 scroll-mt-20 rounded-3xl border border-primary/30 bg-card/40 p-5 focus:outline-2 focus:outline-primary xl:sticky xl:top-20" aria-label="Atlas inspector" data-testid="atlas-inspector">
        {selectedEdge ? <><p className="text-xs font-medium text-primary">Relationship inspector</p><h2 className="mt-3 text-xl font-medium leading-8">{selectedEdge.claim}</h2><p className="mt-3 text-xs leading-6 text-muted-foreground">{edgeLabel(selectedEdge)} · {selectedEdge.supportKind === "inference" ? "Explicitly labeled synthesis of sources" : "Direct source support"}</p><h3 className="mt-5 text-sm font-medium">Under which conditions?</h3><p className="mt-2 text-sm leading-7">{selectedEdge.conditions}</p><h3 className="mt-5 text-sm font-medium">Why this connection?</h3><p className="mt-2 text-sm leading-7 text-muted-foreground">{selectedEdge.rationale}</p>{evidence(selectedEdge.sourceIds)}<button className={button+" mt-4"} onClick={() => update({ edge: "" })}>Back to the concept</button></> : <><p className="text-xs font-medium text-primary">Concept inspector</p><h2 className="mt-3 text-2xl font-medium">{concept.title}</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">{concept.definition}</p>{evidence(concept.sourceIds)}</>}
        <div className="mt-6 border-t border-border pt-4"><h3 className="text-sm font-medium">Learn and apply</h3>{atlas.catalog.filter(resource => resource.conceptIds.includes(concept.id)).map(resource => <Link className="mt-2 block min-h-11 py-2 text-sm text-primary underline underline-offset-4" key={resource.id} href={resourceHref(resource.href)}>{resource.title} →</Link>)}{!atlas.catalog.some(resource => resource.conceptIds.includes(concept.id)) && <p className="mt-2 text-sm leading-7 text-muted-foreground">No dedicated local lesson mapping reviewed yet. Use the official sources above.</p>}<p className="mt-3 text-xs leading-6 text-muted-foreground">Question, lesson and note links are documentation-reviewed catalogue associations, not answer validation. Publishing the candidate concepts still needs human review; the existing question bank and saved attempts are unchanged.</p></div>
      </aside>
    </div>
    <noscript><section className="rounded-3xl border border-border-strong p-5"><h2 className="text-xl font-medium">Complete linear Atlas — no JavaScript required</h2><p className="mt-3 text-sm leading-7">Search and view controls require JavaScript. All concept definitions, relationship conditions and evidence remain readable here.</p><dl className="mt-5 space-y-4">{atlas.concepts.map(item => <div key={item.id}><dt className="font-medium">{item.title}</dt><dd className="mt-1 text-sm leading-7">{item.definition}</dd></div>)}</dl><ol className="mt-6 space-y-5">{atlas.semanticEdges.map(edge => <li key={edge.id}><h3 className="font-medium">{edge.claim}</h3><p className="mt-2 text-sm leading-7">{edge.conditions}</p><p className="mt-2 text-sm leading-7">{edge.rationale}</p>{evidence(edge.sourceIds)}</li>)}</ol></section></noscript>
  </div>;
}
