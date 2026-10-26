export const RELATIONS = {
  requires_understanding_of: "Requires understanding of", enables: "Enables",
  contrasts_with: "Contrasts with", tradeoff_with: "Trade-off with", complements: "Complements",
  related_in_decision: "Related in a decision", part_of_mechanism: "Part of the mechanism of",
} as const;
export type Relation = keyof typeof RELATIONS;
export type State = "candidate" | "technical_review" | "approved" | "published";
export type Concept = { id: string; title: string; aliases: string[]; definition: string; kind: string; sourceIds: string[]; editorialState: State; position: number[]; mapLabel: string[] };
export type Edge = { id: string; from: string; to: string; relationType: Relation; direction: "directed" | "symmetric"; claim: string; conditions: string; rationale: string; sourceIds: string[]; supportKind: "direct" | "inference"; revision: number; checkedAt: string; reviewer: string; editorialState: State };
export type Source = { id: string; title: string; url: string; locator: string; checkedAt: string; kind: string; visibility: string };
export type Resource = { id: string; title: string; href: string; kind: string; conceptIds: string[]; sourcePages: number[] };
export type Dataset = { schemaVersion: string; buildVersion: string; editorialState: State; reviewNotice: string; concepts: Concept[]; semanticEdges: Edge[]; sources: Source[]; catalog: Resource[]; toc: { id: string; title: string; resourceId: string; conceptIds: string[] }[] };
export type Atlas = Pick<Dataset, "schemaVersion" | "buildVersion" | "concepts" | "semanticEdges" | "sources" | "catalog" | "toc"> & { preview: boolean; notice: string };
export const DEFAULT_CONCEPT = "concept:fabric:shortcut";
const symmetric = new Set<Relation>(["contrasts_with", "tradeoff_with", "complements"]);

export function validateDataset(data: Dataset) {
  const unique = (items: { id: string }[]) => { if (new Set(items.map(item => item.id)).size !== items.length) throw new Error("Duplicate identity"); };
  unique(data.concepts); unique(data.semanticEdges); unique(data.sources); unique(data.catalog); unique(data.toc);
  if (data.schemaVersion !== "1.1" || !data.buildVersion) throw new Error("Missing version");
  const concepts = new Map(data.concepts.map(item => [item.id, item])), sources = new Set(data.sources.map(item => item.id));
  const aliases = new Map<string, string>();
  const evidence = (ids: string[]) => { if (!ids.length || ids.some(id => !sources.has(id))) throw new Error("Missing evidence"); };
  for (const source of data.sources) { if (new URL(source.url).hostname !== "learn.microsoft.com" || !source.locator || !source.checkedAt) throw new Error("Invalid official source"); }
  for (const concept of data.concepts) {
    if (!concept.id.startsWith("concept:") || !concept.definition || !concept.title || concept.position.length !== 2 || concept.position.some(value => !Number.isFinite(value))) throw new Error("Invalid concept");
    for (const alias of [concept.title, ...concept.aliases]) { const key = alias.trim().toLowerCase(); if (!key || (aliases.has(key) && aliases.get(key) !== concept.id)) throw new Error("Alias collision"); aliases.set(key, concept.id); }
    evidence(concept.sourceIds);
  }
  const seen = new Set<string>();
  for (const edge of data.semanticEdges) {
    if (!Object.hasOwn(RELATIONS, edge.relationType)) throw new Error("Structural/unknown relation forbidden");
    if (!concepts.has(edge.from) || !concepts.has(edge.to) || edge.from === edge.to) throw new Error("Invalid endpoints");
    if (symmetric.has(edge.relationType) && edge.direction !== "symmetric") throw new Error("Invalid symmetry");
    if (["enables", "part_of_mechanism", "requires_understanding_of"].includes(edge.relationType) && edge.direction !== "directed") throw new Error("Invalid direction");
    evidence(edge.sourceIds);
    if (!edge.claim || !edge.rationale || !edge.conditions || !edge.reviewer || !edge.checkedAt) throw new Error("Missing review/conditions");
    const pair = edge.direction === "symmetric" ? [edge.from, edge.to].sort() : [edge.from, edge.to];
    const key = JSON.stringify([...pair, edge.relationType, edge.claim.trim().toLowerCase()]);
    if (seen.has(key)) throw new Error("Duplicate assertion"); seen.add(key);
    if (edge.editorialState === "published" && (concepts.get(edge.from)!.editorialState !== "published" || concepts.get(edge.to)!.editorialState !== "published" || !edge.reviewer.startsWith("Human:"))) throw new Error("Publication requires human approval and published endpoints");
  }
  for (const resource of data.catalog) { if (!validResourceHref(resource.href) || resource.conceptIds.some(id => !concepts.has(id))) throw new Error("Invalid resource mapping"); }
  for (const entry of data.toc) { if (!data.catalog.some(resource => resource.id === entry.resourceId) || entry.conceptIds.some(id => !concepts.has(id))) throw new Error("Invalid TOC mapping"); }
}

export function validResourceHref(href: string) {
  return /^\/learn\/dp-600\/ingestion\/(?:#(?:understand|experiment))?$/.test(href)
    || /^\/lab\/dp-600\/explore\/\?question=(?:fb-|new-)[a-z0-9-]{1,100}$/.test(href)
    || /^\/lab\/dp-600\/resources\/\?pack=[a-z0-9-]{1,30}#study-notes$/.test(href);
}
export function resourceReturnHref(href: string, view: View) {
  if (!validResourceHref(href)) return "";
  const [path, hash] = href.split("#"), [route, query] = path.split("?");
  const p = new URLSearchParams(query); p.set("atlasReturn", viewHref(view));
  return route + "?" + p + (hash ? "#" + hash : "");
}

// Explicit public allowlist. Candidate/editorial records never go into client props.
export function projectAtlas(data: Dataset, preview = false): Atlas {
  validateDataset(data);
  const allowed = (state: State) => state === "published" || (preview && state === "technical_review");
  const concepts = data.concepts.filter(item => allowed(item.editorialState));
  const ids = new Set(concepts.map(item => item.id));
  const semanticEdges = data.semanticEdges.filter(item => allowed(item.editorialState) && ids.has(item.from) && ids.has(item.to));
  const used = new Set([...concepts.flatMap(item => item.sourceIds), ...semanticEdges.flatMap(item => item.sourceIds)]);
  return { schemaVersion: data.schemaVersion, buildVersion: data.buildVersion, preview, notice: preview ? data.reviewNotice : "The reviewed public graph is not yet published. Normal lessons and practice remain available.", concepts, semanticEdges, sources: data.sources.filter(item => used.has(item.id)), catalog: data.catalog.filter(item => item.conceptIds.some(id => ids.has(id))), toc: data.toc.filter(item => item.conceptIds.some(id => ids.has(id))) };
}

export type View = { concept: string; edge: string; source: string; relation: string; hops: number; incoming: boolean; zoom: number; x: number; y: number };
export function defaultView(): View { return { concept: DEFAULT_CONCEPT, edge: "", source: "all", relation: "all", hops: 1, incoming: false, zoom: 1, x: 0, y: 0 }; }
export function parseView(search: string, atlas: Atlas): { view: View; warning: string } {
  const fallback = defaultView();
  if (search.length > 2048) return { view: fallback, warning: "This Atlas link is too long. Default view restored." };
  const params = new URLSearchParams(search), view = { ...fallback }; let warning = "";
  if (params.has("v") && params.get("v") !== "1") return { view, warning: "Unknown view version. Default view restored." };
  const concept = params.get("concept");
  if (concept && atlas.concepts.some(item => item.id === concept)) view.concept = concept;
  else if (concept) warning = "Unknown concept. Default view restored.";
  const edge = params.get("edge"); if (edge && atlas.semanticEdges.some(item => item.id === edge)) view.edge = edge;
  const source = params.get("source"); if (source && atlas.sources.some(item => item.id === source)) view.source = source;
  const relation = params.get("relation"); if (relation && Object.hasOwn(RELATIONS, relation)) view.relation = relation;
  view.hops = params.get("hops") === "2" ? 2 : 1; view.incoming = params.get("incoming") === "1";
  for (const key of ["zoom", "x", "y"] as const) { const raw = params.get(key); const n = Number(raw); if (raw !== null && Number.isFinite(n)) view[key] = key === "zoom" ? Math.max(.6, Math.min(2.5, n)) : Math.max(-400, Math.min(400, n)); }
  if ([...params.keys()].some(key => !["v", "concept", "edge", "source", "relation", "hops", "incoming", "zoom", "x", "y"].includes(key))) warning ||= "Unrecognized view fields were ignored.";
  return { view, warning };
}
export function viewHref(view: View) {
  const p = new URLSearchParams({ v: "1", concept: view.concept, source: view.source, relation: view.relation, hops: String(view.hops), incoming: view.incoming ? "1" : "0", zoom: String(view.zoom), x: String(view.x), y: String(view.y) });
  if (view.edge) p.set("edge", view.edge);
  return "/learn/dp-600/atlas/?" + p;
}
export function safeReturn(value: string | null, atlas: Atlas) {
  if (!value || !value.startsWith("/learn/dp-600/atlas/?") || value.length > 2048 || value.includes("\\")) return "";
  return viewHref(parseView(value.split("?")[1], atlas).view);
}
export function neighborhood(atlas: Atlas, view: View) {
  const eligible = atlas.semanticEdges.filter(edge => (view.source === "all" || edge.sourceIds.includes(view.source)) && (view.relation === "all" || edge.relationType === view.relation));
  const visited = new Set([view.concept]); let frontier = [view.concept];
  for (let hop = 0; hop < Math.min(2, view.hops); hop++) {
    const active = new Set(frontier);
    const next = new Set<string>();
    for (const edge of eligible) {
      if (active.has(edge.from)) next.add(edge.to);
      if ((edge.direction === "symmetric" || view.incoming) && active.has(edge.to)) next.add(edge.from);
    }
    frontier = [...next].filter(id => !visited.has(id)); frontier.forEach(id => visited.add(id));
  }
  const all = atlas.concepts.filter(concept => visited.has(concept.id));
  const concepts = [atlas.concepts.find(item => item.id === view.concept), ...all.filter(item => item.id !== view.concept)].filter((item): item is Concept => !!item).slice(0, 40);
  const shown = new Set(concepts.map(item => item.id)); const allEdges = eligible.filter(edge => shown.has(edge.from) && shown.has(edge.to));
  return { concepts, edges: allEdges.slice(0, 80), hiddenConcepts: all.length - concepts.length, hiddenEdges: Math.max(0, allEdges.length - 80) };
}
export function searchConcepts(atlas: Atlas, query: string) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return atlas.concepts.filter(item => words.every(word => [item.title, ...item.aliases, item.definition].join(" ").toLowerCase().includes(word)));
}
export const JOURNEY_KEY = "hansa-atlas-journey-v1";
export type JourneyState = { version: 1; step: number; visited: number[]; answer: string; reflection: string };
export const emptyJourney = (): JourneyState => ({ version: 1, step: 0, visited: [], answer: "", reflection: "" });
export function parseJourney(raw: string | null): JourneyState | null {
  if (raw === null) return emptyJourney();
  if (raw.length > 8000) return null;
  try { const d = JSON.parse(raw); if (d.version !== 1 || !Number.isInteger(d.step) || d.step < 0 || d.step > 3 || !Array.isArray(d.visited) || d.visited.length > 4 || new Set(d.visited).size !== d.visited.length || d.visited.some((x: unknown) => !Number.isInteger(x) || Number(x) < 0 || Number(x) > 3) || !["", "shortcut", "mirroring"].includes(d.answer) || typeof d.reflection !== "string" || d.reflection.length > 1500) return null; return { version: 1, step: d.step, visited: d.visited, answer: d.answer, reflection: d.reflection }; } catch { return null; }
}
