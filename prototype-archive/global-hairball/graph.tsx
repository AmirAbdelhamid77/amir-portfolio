"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { forceLayout } from "@/lib/knowledge-graph/layout";
import "./graph.css";

type Layer = "structure" | "declared" | "derived" | "candidate" | "review";
type Kind = "programme" | "subject" | "pack" | "journey" | "chapter" | "course" | "unit" | "source" | "page";

interface ClientNode {
  id: string;
  kind: Kind;
  label: string;
  subject?: string;
  unitKind?: string;
  container?: string;
  island?: number;
  degree?: number;
  href?: string;
  x?: number;
  y?: number;
  stage?: string;
  coverage?: string;
}

interface ClientEdge {
  from: string;
  to: string;
  kind: "contains" | "prerequisite" | "cites" | "derived-from" | "co-citation" | "lexical";
  layer: Layer;
  weight?: number;
  via?: string[];
  score?: number;
  terms?: string[];
  pointer?: string;
}

interface Dataset {
  version: string;
  generatedAt: string;
  nodes: ClientNode[];
  edges: ClientEdge[];
  islands: Record<number, { label: string; color: string; size: number; subjects: Record<string, number> }>;
  diagnostics: { level: string; code: string; message: string }[];
  stats: {
    nodes: Record<string, number>;
    edges: Record<string, number>;
    edgeLayers: Record<string, number>;
    islands: { id: number; size: number; label: string; subjects: Record<string, number> }[];
    modularity: number;
    clusters: number;
    components: number;
    isolatedUnits: number;
    topHubs: { id: string; label: string; degree: number }[];
    candidatePairs: number;
    candidateSubjects: Record<string, number>;
    subjectUnits: Record<string, number>;
    topSources: { id: string; label: string; citations: number; packs: number }[];
    atlas: { publishedConcepts: number; publishedEdges: number; reviewConcepts: number; reviewEdges: number };
  };
}

const SUBJECT_COLOR: Record<string, string> = {
  fabric: "#4C7DF0",
  statistics: "#2AA889",
  visualization: "#D9A21B",
  sql: "#C678DD",
  "power-bi": "#E06C75",
  python: "#3FA7D6",
  excel: "#5BA85A",
  analysis: "#D1785B",
};

const SUBJECT_LABEL: Record<string, string> = {
  fabric: "Fabric",
  statistics: "Statistics",
  visualization: "Visualization",
  sql: "SQL",
  "power-bi": "Power BI",
  python: "Python",
  excel: "Excel",
  analysis: "Analysis",
};

const KIND_LABEL: Record<string, string> = {
  programme: "Programme",
  subject: "Subject",
  pack: "Pack",
  journey: "Journey",
  chapter: "Chapter",
  course: "Course",
  unit: "Content unit",
  source: "Cited source",
  page: "Source page",
};

const EDGE_LABEL: Record<ClientEdge["kind"], string> = {
  contains: "membership",
  prerequisite: "prerequisite",
  cites: "cites",
  "derived-from": "derived from",
  "co-citation": "shared sources",
  lexical: "text similarity",
};

const LAYER_LABEL: Record<Layer, string> = {
  structure: "Structure",
  declared: "Declared",
  derived: "Derived",
  candidate: "Candidate",
  review: "Atlas review",
};

const LAYER_NOTE: Record<Layer, string> = {
  structure: "Containment: programme → subject → pack/journey/chapter → note. Navigational, not a knowledge claim.",
  declared: "The corpus itself names the relation: cited document, source page, prerequisite chain.",
  derived: "Computed from declared data only: two notes quoting the same document.",
  candidate: "TF-IDF text similarity. Inferred; unreviewed; never an Atlas assertion.",
  review: "Atlas editorial relations. Public projection is empty, so nothing is drawn.",
};

function edgeId(edge: ClientEdge) {
  return `${edge.kind}:${edge.from}->${edge.to}`;
}

/** Wraps a full label so the visible text still contains the whole title. */
function wrapLabel(text: string, max = 34): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (!line) line = word;
    else if (`${line} ${word}`.length <= max) line += ` ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export default function GraphExplorer() {
  const [data, setData] = useState<Dataset | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [layers, setLayers] = useState<Set<Layer>>(() => new Set<Layer>(["declared"]));
  const [showSources, setShowSources] = useState(true);
  const [colorMode, setColorMode] = useState<"subject" | "island" | "kind">("subject");
  const [mode, setMode] = useState<"global" | "local">("global");
  const [depth, setDepth] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"graph" | "list">("graph");
  const [status, setStatus] = useState("Loading the graph…");
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [zoomTier, setZoomTier] = useState<"far" | "near">("far");
  const [inspectorAll, setInspectorAll] = useState(false);

  const shellRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const viewportRef = useRef<SVGGElement>(null);
  const nodeEls = useRef(new Map<string, SVGGElement>());
  const edgeEls = useRef(new Map<string, SVGLineElement>());
  const viewRef = useRef({ x: 0, y: 0, k: 0.7 });
  const posRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const dragRef = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null);
  const panRef = useRef<{ x: number; y: number; viewX: number; viewY: number } | null>(null);

  // ---------------------------------------------------------------------- load
  useEffect(() => {
    let cancelled = false;
    fetch("/graph/dataset.json")
      .then((response) => {
        if (!response.ok) throw new Error(`dataset ${response.status}`);
        return response.json() as Promise<Dataset>;
      })
      .then((payload) => {
        if (cancelled) return;
        setData(payload);
        const base = new Map<string, { x: number; y: number }>();
        for (const node of payload.nodes) if (node.x !== undefined && node.y !== undefined) base.set(node.id, { x: node.x, y: node.y });
        // Containers are not laid out by the simulation. Place each at the mean
        // of the nodes it declares, which follows the real structure.
        const children = new Map<string, string[]>();
        for (const edge of payload.edges) {
          if (edge.kind !== "contains") continue;
          const list = children.get(edge.from) ?? [];
          list.push(edge.to);
          children.set(edge.from, list);
        }
        const containerIds = payload.nodes.filter((node) => node.x === undefined).map((node) => node.id);
        const resolve = (id: string, guard: Set<string>): { x: number; y: number } => {
          const known = base.get(id);
          if (known) return known;
          const kids = children.get(id) ?? [];
          const points = kids.map((kid) => {
            if (guard.has(kid)) return null;
            guard.add(kid);
            return resolve(kid, guard);
          });
          const valid = points.filter((point): point is { x: number; y: number } => Boolean(point));
          if (!valid.length) return { x: 0, y: 0 };
          return {
            x: valid.reduce((total, point) => total + point.x, 0) / valid.length,
            y: valid.reduce((total, point) => total + point.y, 0) / valid.length,
          };
        };
        for (const id of containerIds) base.set(id, resolve(id, new Set([id])));
        posRef.current = base;
        setPositions(base);
        setStatus(
          `${payload.stats.subjectUnits ? Object.values(payload.stats.subjectUnits).reduce((a, b) => a + b, 0) : 0} content units, ` +
            `${payload.nodes.filter((node) => node.kind === "source" || node.kind === "page").length} documents, ` +
            `${payload.edges.length} edges.`,
        );
      })
      .catch((reason: Error) => {
        if (cancelled) return;
        setError(reason.message);
        setStatus("The graph dataset could not be loaded.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nodeById = useMemo(() => new Map((data?.nodes ?? []).map((node) => [node.id, node])), [data]);

  // ------------------------------------------------------------------ subgraph
  const shown = useMemo(() => {
    if (!data) return { nodes: [] as ClientNode[], edges: [] as ClientEdge[], local: false };
    const baseNodes = data.nodes.filter((node) => {
      if (node.kind === "source" || node.kind === "page") return showSources && (layers.has("declared") || layers.has("derived"));
      if (node.kind === "unit") return true;
      return layers.has("structure");
    });
    const baseIds = new Set(baseNodes.map((node) => node.id));
    let edges = data.edges.filter((edge) => layers.has(edge.layer) && baseIds.has(edge.from) && baseIds.has(edge.to));
    if (mode !== "local" || !selectedId || !baseIds.has(selectedId)) {
      return { nodes: baseNodes, edges, local: false, baseIds };
    }
    // Obsidian's local graph: breadth-first from the selected node, revealing
    // neighbours level by level up to the chosen depth.
    const adjacency = new Map<string, { id: string; edge: ClientEdge }[]>();
    for (const edge of edges) {
      const a = adjacency.get(edge.from) ?? [];
      a.push({ id: edge.to, edge });
      adjacency.set(edge.from, a);
      const b = adjacency.get(edge.to) ?? [];
      b.push({ id: edge.from, edge });
      adjacency.set(edge.to, b);
    }
    const keep = new Set<string>([selectedId]);
    let frontier = [selectedId];
    for (let level = 0; level < depth; level += 1) {
      const next: string[] = [];
      for (const id of frontier) {
        for (const link of adjacency.get(id) ?? []) {
          if (keep.has(link.id)) continue;
          keep.add(link.id);
          next.push(link.id);
        }
      }
      frontier = next;
    }
    const localNodes = baseNodes.filter((node) => keep.has(node.id));
    edges = edges.filter((edge) => keep.has(edge.from) && keep.has(edge.to));
    return { nodes: localNodes, edges, local: true, baseIds };
  }, [data, layers, showSources, mode, selectedId, depth]);

  // Local layout: recompute only for the focused neighbourhood.
  const localLayout = useMemo(() => {
    if (!shown.local || shown.nodes.length === 0) return null;
    return forceLayout(
      shown.nodes.map((node) => ({ id: node.id, community: node.island ?? 0, weight: 1 + Math.sqrt(node.degree ?? 0) })),
      shown.edges.map((edge) => ({ a: edge.from, b: edge.to, weight: edge.kind === "prerequisite" ? 2.5 : 1 })),
      { iterations: 240, linkDistance: 62, charge: 260, gravity: 0.055, seed: shown.nodes.length + depth },
    );
  }, [shown, depth]);

  const positionOf = useCallback(
    (id: string) => {
      if (shown.local && localLayout) return localLayout.get(id) ?? { x: 0, y: 0 };
      return positions.get(id) ?? { x: 0, y: 0 };
    },
    [shown.local, localLayout, positions],
  );

  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const edge of shown.edges) {
      const a = map.get(edge.from) ?? new Set<string>();
      a.add(edge.to);
      map.set(edge.from, a);
      const b = map.get(edge.to) ?? new Set<string>();
      b.add(edge.from);
      map.set(edge.to, b);
    }
    return map;
  }, [shown.edges]);

  const neighbourOf = hoveredId ?? selectedId;
  const highlighted = useMemo(() => {
    if (!neighbourOf) return null;
    const set = new Set<string>([neighbourOf]);
    for (const id of adjacency.get(neighbourOf) ?? []) set.add(id);
    return set;
  }, [neighbourOf, adjacency]);

  // ------------------------------------------------------------------- camera
  const applyView = useCallback((view: { x: number; y: number; k: number }) => {
    viewportRef.current?.setAttribute("transform", `translate(${view.x} ${view.y}) scale(${view.k})`);
    const nextTier = view.k >= 1.7 ? "near" : "far";
    setZoomTier((current) => (current === nextTier ? current : nextTier));
  }, []);

  const fit = useCallback(() => {
    if (!shown.nodes.length || !size.w || !size.h) return;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const node of shown.nodes) {
      const point = positionOf(node.id);
      if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    }
    const width = Math.max(40, maxX - minX);
    const height = Math.max(40, maxY - minY);
    // Full-corpus fit stays below the label threshold, so the first view is the
    // shape of the corpus rather than a wall of titles.
    const k = Math.max(0.05, Math.min(1.15, Math.min((size.w - 80) / width, (size.h - 80) / height)));
    const view = {
      k,
      x: size.w / 2 - ((minX + maxX) / 2) * k,
      y: size.h / 2 - ((minY + maxY) / 2) * k,
    };
    viewRef.current = view;
    applyView(view);
  }, [shown.nodes, size, positionOf, applyView]);

  useEffect(() => {
    const element = shellRef.current;
    if (!element) return;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const next = { w: Math.round(rect.width), h: Math.round(rect.height) };
      setSize((current) => (current.w === next.w && current.h === next.h ? current : next));
    };
    // Measure once explicitly: an occluded or background window may not deliver
    // the observer's initial callback, and the canvas must still be sized.
    const frame = requestAnimationFrame(measure);
    const timer = window.setTimeout(measure, 0);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
    // The canvas only exists after the dataset loads; re-attach then.
  }, [data]);

  useEffect(() => {
    if (!size.w || !size.h || !shown.nodes.length) return;
    // Deferred so the camera update happens after commit rather than
    // synchronously inside the effect (and in a background tab where rAF is
    // paused, a timer still runs).
    const timer = window.setTimeout(fit, 0);
    return () => window.clearTimeout(timer);
    // Fit when the visible graph changes shape, not on every pointer move.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h, shown.nodes.length, shown.local, mode, depth]);

  // ------------------------------------------------------------------ pointers
  const toGraph = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    const view = viewRef.current;
    if (!rect) return { x: 0, y: 0 };
    return { x: (clientX - rect.left - view.x) / view.k, y: (clientY - rect.top - view.y) / view.k };
  }, []);

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    panRef.current = { x: event.clientX, y: event.clientY, viewX: viewRef.current.x, viewY: viewRef.current.y };
    (event.currentTarget as SVGSVGElement).setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (drag) {
      const point = toGraph(event.clientX, event.clientY);
      const next = { x: point.x - drag.dx, y: point.y - drag.dy };
      posRef.current.set(drag.id, next);
      drag.moved = true;
      nodeEls.current.get(drag.id)?.setAttribute("transform", `translate(${next.x} ${next.y})`);
      for (const element of edgeEls.current.values()) {
        if (element.dataset.from === drag.id) {
          element.setAttribute("x1", String(next.x));
          element.setAttribute("y1", String(next.y));
        }
        if (element.dataset.to === drag.id) {
          element.setAttribute("x2", String(next.x));
          element.setAttribute("y2", String(next.y));
        }
      }
      return;
    }
    const pan = panRef.current;
    if (!pan) return;
    const view = { ...viewRef.current, x: pan.viewX + (event.clientX - pan.x), y: pan.viewY + (event.clientY - pan.y) };
    viewRef.current = view;
    applyView(view);
  };

  const onPointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    if (dragRef.current) {
      const moved = dragRef.current.moved;
      dragRef.current = null;
      setPositions(new Map(posRef.current));
      if (moved) setStatus("Node moved. Fit restores the derived layout.");
    }
    panRef.current = null;
    (event.currentTarget as SVGSVGElement).releasePointerCapture?.(event.pointerId);
  };

  const onWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const view = viewRef.current;
    const factor = Math.exp(-event.deltaY * 0.0016);
    const k = Math.max(0.05, Math.min(3.2, view.k * factor));
    const px = event.clientX - rect.left;
    const py = event.clientY - rect.top;
    const next = { k, x: px - ((px - view.x) * k) / view.k, y: py - ((py - view.y) * k) / view.k };
    viewRef.current = next;
    applyView(next);
  };

  const zoomBy = (factor: number) => {
    const view = viewRef.current;
    const cx = size.w / 2;
    const cy = size.h / 2;
    const k = Math.max(0.05, Math.min(3.2, view.k * factor));
    const next = { k, x: cx - ((cx - view.x) * k) / view.k, y: cy - ((cy - view.y) * k) / view.k };
    viewRef.current = next;
    applyView(next);
  };

  // ------------------------------------------------------------------ keyboard
  const focusNode = (id: string) => {
    setFocusId(id);
    requestAnimationFrame(() => nodeEls.current.get(id)?.focus());
  };

  const moveFocus = (id: string, key: string) => {
    if (!data) return;
    const origin = positionOf(id);
    let best: { id: string; score: number } | null = null;
    for (const node of shown.nodes) {
      if (node.id === id) continue;
      const point = positionOf(node.id);
      const dx = point.x - origin.x;
      const dy = point.y - origin.y;
      const along = key === "ArrowRight" ? dx : key === "ArrowLeft" ? -dx : key === "ArrowDown" ? dy : -dy;
      const across = key === "ArrowRight" || key === "ArrowLeft" ? Math.abs(dy) : Math.abs(dx);
      if (along <= 1) continue;
      const score = along + across * 1.8;
      if (!best || score < best.score) best = { id: node.id, score };
    }
    if (best) focusNode(best.id);
  };

  const onNodeKeyDown = (event: React.KeyboardEvent, node: ClientNode) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(node.id);
      return;
    }
    if (event.key === "ArrowRight" || event.key === "ArrowLeft" || event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveFocus(node.id, event.key);
    }
    if (event.key === "Escape") {
      setSelectedId(null);
      setStatus("Selection cleared.");
    }
  };

  const select = (id: string) => {
    setSelectedId(id);
    setInspectorAll(false);
    setFocusId(id);
    const node = nodeById.get(id);
    if (node) setStatus(`${node.label} selected.`);
  };

  // --------------------------------------------------------------------- search
  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2) return [] as ClientNode[];
    return shown.nodes
      .filter((node) => node.label.toLowerCase().includes(needle))
      .sort((a, b) => (a.label.length - b.label.length) || (a.label < b.label ? -1 : 1))
      .slice(0, 30);
  }, [query, shown.nodes]);
  const matchIds = useMemo(() => new Set(matches.map((node) => node.id)), [matches]);

  // ----------------------------------------------------------------- inspector
  const selected = selectedId ? nodeById.get(selectedId) : undefined;
  const incident = useMemo(() => {
    if (!selectedId || !data) return [] as ClientEdge[];
    return data.edges
      .filter((edge) => edge.from === selectedId || edge.to === selectedId)
      .sort((a, b) => a.kind.localeCompare(b.kind));
  }, [selectedId, data]);
  const sharedPartners = useMemo(() => {
    if (!selected || !data || selected.kind !== "unit") return [] as { node: ClientNode; shared: string[] }[];
    const mySources = new Set(data.edges.filter((edge) => edge.kind === "cites" && edge.from === selected.id).map((edge) => edge.to));
    if (!mySources.size) return [];
    const partners = new Map<string, string[]>();
    for (const edge of data.edges) {
      if (edge.kind !== "cites" || !mySources.has(edge.to) || edge.from === selected.id) continue;
      const list = partners.get(edge.from) ?? [];
      list.push(edge.to);
      partners.set(edge.from, list);
    }
    return [...partners.entries()]
      .map(([id, shared]) => ({ node: nodeById.get(id), shared }))
      .filter((entry): entry is { node: ClientNode; shared: string[] } => Boolean(entry.node))
      .sort((a, b) => b.shared.length - a.shared.length || (a.node.id < b.node.id ? -1 : 1))
      .slice(0, 8);
  }, [selected, data, nodeById]);

  const colourOf = useCallback(
    (node: ClientNode) => {
      if (node.kind === "source" || node.kind === "page") return "#7C8794";
      if (node.kind !== "unit") return "var(--muted-foreground)";
      if (colorMode === "kind") return "#4C7DF0";
      if (colorMode === "island") return data?.islands[node.island ?? -1]?.color ?? "#8A8F98";
      return SUBJECT_COLOR[node.subject ?? ""] ?? "#8A8F98";
    },
    [colorMode, data],
  );

  const radiusOf = (node: ClientNode) => {
    const degree = node.degree ?? 0;
    if (node.kind === "source") return Math.min(14, 3 + Math.sqrt(degree) * 1.6);
    if (node.kind === "page") return Math.min(11, 3 + Math.sqrt(degree) * 1.6);
    if (node.kind === "unit") return Math.min(9, 2.4 + Math.sqrt(degree) * 1.25);
    return 8;
  };

  const labelVisible = (node: ClientNode) => {
    if (node.id === selectedId || node.id === hoveredId || matchIds.has(node.id) || zoomTier === "near") return true;
    // Far view: only the real hubs are named. Documents are named only when
    // many units actually cite them, so the overview stays readable.
    if (node.kind === "source" || node.kind === "page") return (node.degree ?? 0) >= 20;
    if (node.kind === "unit") return (node.degree ?? 0) >= 6;
    return true;
  };

  const enableLayer = (layer: Layer) => {
    setLayers((current) => {
      const next = new Set(current);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
    // Structure needs containers; derived/candidate are note-to-note overlays.
    setStatus(`${LAYER_LABEL[layer]} layer toggled.`);
  };

  const reset = () => {
    setSelectedId(null);
    setHoveredId(null);
    setQuery("");
    setMode("global");
    setLayers(new Set<Layer>(["declared"]));
    setShowSources(true);
    const base = new Map<string, { x: number; y: number }>();
    if (data) for (const node of data.nodes) if (node.x !== undefined && node.y !== undefined) base.set(node.id, { x: node.x, y: node.y });
    // Keep container centroids from the loaded map.
    for (const [id, point] of positions) if (!base.has(id)) base.set(id, point);
    posRef.current = base;
    setPositions(base);
    setStatus("Graph reset to the declared source graph.");
    requestAnimationFrame(fit);
  };

  // ---------------------------------------------------------------------- render
  if (error) {
    return (
      <div className="kng-error" role="alert">
        <p>The graph dataset could not be loaded ({error}).</p>
        <p>
          Run <code>npm run graph:build</code> and reload.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="kng-loading" aria-live="polite">
        Building the view from the derived dataset…
      </div>
    );
  }

  return (
    <div className="kng">
      <div className="kng-bar">
        <div className="kng-tabs" role="tablist" aria-label="View">
          <button type="button" role="tab" aria-selected={tab === "graph"} className={tab === "graph" ? "kng-tab is-on" : "kng-tab"} onClick={() => setTab("graph")}>
            Graph
          </button>
          <button type="button" role="tab" aria-selected={tab === "list"} className={tab === "list" ? "kng-tab is-on" : "kng-tab"} onClick={() => setTab("list")}>
            List
          </button>
        </div>
        <form
          className="kng-search"
          role="search"
          onSubmit={(event) => {
            event.preventDefault();
            if (matches[0]) {
              select(matches[0].id);
              setTab("graph");
            }
          }}
        >
          <label className="kng-sr" htmlFor="kng-query">
            Search titles
          </label>
          <input
            id="kng-query"
            type="search"
            value={query}
            placeholder="Search 824 titles…"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                if (matches[0]) {
                  select(matches[0].id);
                  setTab("graph");
                }
              }
              if (event.key === "Escape") setQuery("");
            }}
          />
          {query.trim().length >= 2 ? <span className="kng-count">{matches.length} match{matches.length === 1 ? "" : "es"}</span> : null}
        </form>
        <div className="kng-actions">
          <button type="button" className="kng-btn" onClick={() => zoomBy(1.3)} aria-label="Zoom in">
            +
          </button>
          <button type="button" className="kng-btn" onClick={() => zoomBy(1 / 1.3)} aria-label="Zoom out">
            −
          </button>
          <button type="button" className="kng-btn" onClick={fit}>
            Fit
          </button>
          <button type="button" className="kng-btn" onClick={reset}>
            Reset
          </button>
        </div>
      </div>

      <div className="kng-main">
        <aside className="kng-controls" aria-label="Graph layers and filters">
          <section>
            <h2>Mode</h2>
            <div className="kng-seg" role="group" aria-label="Graph scope">
              <button type="button" aria-pressed={mode === "global"} className={mode === "global" ? "is-on" : ""} onClick={() => setMode("global")}>
                Global
              </button>
              <button
                type="button"
                aria-pressed={mode === "local"}
                className={mode === "local" ? "is-on" : ""}
                onClick={() => {
                  if (!selectedId) setStatus("Select a node first; the local graph starts from it.");
                  setMode("local");
                }}
              >
                Local
              </button>
            </div>
            <label className="kng-field">
              Depth
              <select value={depth} onChange={(event) => setDepth(Number(event.target.value))}>
                <option value={1}>1 hop</option>
                <option value={2}>2 hops</option>
              </select>
            </label>
            {mode === "local" && !selectedId ? <p className="kng-hint">Select a node to anchor the local graph.</p> : null}
          </section>

          <section>
            <h2>Relationship layers</h2>
            {(["declared", "derived", "candidate", "structure"] as Layer[]).map((layer) => (
              <label key={layer} className="kng-check">
                <input type="checkbox" checked={layers.has(layer)} onChange={() => enableLayer(layer)} />
                <span>
                  <strong>{LAYER_LABEL[layer]}</strong>
                  <em>
                    {data.stats.edgeLayers[layer] ?? 0} edges
                    {layer === "candidate" && (data.stats.edgeLayers[layer] ?? 0) === 0 ? " (off by default)" : ""}
                  </em>
                </span>
              </label>
            ))}
            <p className="kng-note">{LAYER_NOTE[layers.has("candidate") ? "candidate" : "declared"]}</p>
            <label className="kng-check">
              <input type="checkbox" checked={showSources} onChange={() => setShowSources((value) => !value)} />
              <span>
                <strong>Source documents</strong>
                <em>{data.nodes.filter((node) => node.kind === "source" || node.kind === "page").length} nodes</em>
              </span>
            </label>
          </section>

          <section>
            <h2>Colour</h2>
            <label className="kng-field">
              Group by
              <select value={colorMode} onChange={(event) => setColorMode(event.target.value as typeof colorMode)}>
                <option value="subject">Subject (declared)</option>
                <option value="island">Citation island (computed)</option>
                <option value="kind">Node kind</option>
              </select>
            </label>
            <ul className="kng-legend">
              {Object.entries(data.stats.subjectUnits)
                .sort((a, b) => b[1] - a[1])
                .map(([subject, count]) => (
                  <li key={subject}>
                    <span className="kng-dot" style={{ background: SUBJECT_COLOR[subject] ?? "#8A8F98" }} aria-hidden="true" />
                    {SUBJECT_LABEL[subject] ?? subject} <em>{count}</em>
                  </li>
                ))}
            </ul>
          </section>

          <section>
            <h2>Provenance</h2>
            <dl className="kng-stats">
              <div>
                <dt>Units</dt>
                <dd>{Object.values(data.stats.subjectUnits).reduce((a, b) => a + b, 0)}</dd>
              </div>
              <div>
                <dt>Documents</dt>
                <dd>{data.nodes.filter((node) => node.kind === "source" || node.kind === "page").length}</dd>
              </div>
              <div>
                <dt>Declared edges</dt>
                <dd>{data.stats.edgeLayers.declared ?? 0}</dd>
              </div>
              <div>
                <dt>Derived co-citation</dt>
                <dd>{data.stats.edgeLayers.derived ?? 0}</dd>
              </div>
              <div>
                <dt>Candidate pairs</dt>
                <dd>{data.stats.candidatePairs}</dd>
              </div>
              <div>
                <dt>Citation islands</dt>
                <dd>{data.stats.islands.filter((island) => island.id >= 0).length}</dd>
              </div>
              <div>
                <dt>Isolated units</dt>
                <dd>{data.stats.isolatedUnits}</dd>
              </div>
            </dl>
            <div className="kng-atlas">
              <h3>Atlas gate</h3>
              <p>
                Published: <strong>{data.stats.atlas.publishedConcepts}</strong> concepts / <strong>{data.stats.atlas.publishedEdges}</strong> links.
              </p>
              <p>
                {data.stats.atlas.reviewConcepts} concepts and {data.stats.atlas.reviewEdges} links remain in technical review and are not drawn.
              </p>
            </div>
          </section>
        </aside>

        <div className="kng-stage">
          {tab === "graph" ? (
            <>
              <div className="kng-canvas" ref={shellRef} data-testid="graph-canvas" data-size={`${size.w}x${size.h}`}>
                <svg
                  ref={svgRef}
                  width={size.w}
                  height={size.h}
                  viewBox={`0 0 ${size.w} ${size.h}`}
                  role="application"
                  aria-label="Curriculum knowledge graph. Use Tab to reach a node, arrow keys to move, Enter to select, Escape to clear."
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  onWheel={onWheel}
                  className="kng-svg"
                >
                  <defs>
                    <marker id="kng-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 0 L 8 4 L 0 8 z" fill="currentColor" />
                    </marker>
                  </defs>
                  <g ref={viewportRef}>
                    <g className="kng-edges">
                      {shown.edges.map((edge) => {
                        const a = positionOf(edge.from);
                        const b = positionOf(edge.to);
                        const id = edgeId(edge);
                        const dim = highlighted ? !(highlighted.has(edge.from) && highlighted.has(edge.to)) : false;
                        const className = `kng-edge kng-edge--${edge.kind}${dim ? " is-dim" : ""}`;
                        return (
                          <line
                            key={id}
                            ref={(element) => {
                              if (element) edgeEls.current.set(id, element);
                              else edgeEls.current.delete(id);
                            }}
                            data-from={edge.from}
                            data-to={edge.to}
                            x1={a.x}
                            y1={a.y}
                            x2={b.x}
                            y2={b.y}
                            className={className}
                            strokeWidth={edge.kind === "co-citation" ? Math.min(2.2, 0.6 + (edge.weight ?? 1) * 0.3) : undefined}
                            markerEnd={edge.kind === "prerequisite" ? "url(#kng-arrow)" : undefined}
                          />
                        );
                      })}
                    </g>
                    <g className="kng-nodes">
                      {shown.nodes.map((node) => {
                        const point = positionOf(node.id);
                        const id = node.id;
                        const isSelected = selectedId === id;
                        const dim = highlighted ? !highlighted.has(id) : false;
                        const isMatch = matchIds.has(id);
                        const r = radiusOf(node);
                        const color = colourOf(node);
                        const radius = shown.local ? r * 1.45 : r;
                        return (
                          <g
                            key={id}
                            ref={(element) => {
                              if (element) nodeEls.current.set(id, element);
                              else nodeEls.current.delete(id);
                            }}
                            transform={`translate(${point.x} ${point.y})`}
                            className={`kng-node kng-node--${node.kind}${dim ? " is-dim" : ""}${isMatch ? " is-match" : ""}`}
                            role="button"
                            tabIndex={focusId === id ? 0 : -1}
                            aria-label={`${node.label}. ${KIND_LABEL[node.kind]}${node.subject ? `, ${SUBJECT_LABEL[node.subject] ?? node.subject}` : ""}. ${node.degree ?? 0} links.`}
                            aria-pressed={isSelected}
                            onPointerDown={(event) => {
                              event.stopPropagation();
                              const point = toGraph(event.clientX, event.clientY);
                              dragRef.current = { id, dx: point.x - positionOf(id).x, dy: point.y - positionOf(id).y, moved: false };
                              (event.currentTarget as SVGGElement).focus();
                              setFocusId(id);
                            }}
                            onClick={(event) => {
                              event.stopPropagation();
                              select(id);
                            }}
                            onDoubleClick={(event) => {
                              event.stopPropagation();
                              select(id);
                              setMode("local");
                            }}
                            onPointerEnter={() => setHoveredId(id)}
                            onPointerLeave={() => setHoveredId(null)}
                            onKeyDown={(event) => onNodeKeyDown(event, node)}
                          >
                            {node.kind === "source" ? (
                              <rect x={-radius} y={-radius} width={radius * 2} height={radius * 2} rx={2} fill={color} />
                            ) : node.kind === "page" ? (
                              <path d={`M 0 ${-radius} L ${radius} 0 L 0 ${radius} L ${-radius} 0 Z`} fill={color} />
                            ) : node.kind === "unit" ? (
                              <circle r={radius} fill={color} />
                            ) : (
                              <circle r={Math.max(9, radius)} fill="var(--card)" stroke={color} strokeWidth={1.4} strokeDasharray="3 2" />
                            )}
                            {isSelected ? <circle r={radius + 4} className="kng-ring" /> : null}
                            {labelVisible(node) ? (
                              <text className="kng-label" y={radius + 12} textAnchor="middle">
                                {wrapLabel(node.label).map((line, index) => (
                                  <tspan key={line + index} x={0} dy={index === 0 ? 0 : 11}>
                                    {index < wrapLabel(node.label).length - 1 ? `${line} ` : line}
                                  </tspan>
                                ))}
                              </text>
                            ) : null}
                          </g>
                        );
                      })}
                    </g>
                  </g>
                </svg>
                {shown.local ? (
                  <p className="kng-modeTag">
                    Local graph · {shown.nodes.length} nodes · depth {depth}
                  </p>
                ) : null}
              </div>
              <p className="kng-status" aria-live="polite">
                {status}
              </p>
              <ul className="kng-edgesKey" aria-label="Edge legend">
                <li>
                  <span className="kng-key kng-key--cites" aria-hidden="true" /> cites / derived-from
                </li>
                <li>
                  <span className="kng-key kng-key--prerequisite" aria-hidden="true" /> declared prerequisite
                </li>
                <li>
                  <span className="kng-key kng-key--contains" aria-hidden="true" /> containment
                </li>
                <li>
                  <span className="kng-key kng-key--co-citation" aria-hidden="true" /> shared sources (derived)
                </li>
                <li>
                  <span className="kng-key kng-key--lexical" aria-hidden="true" /> text similarity (candidate)
                </li>
              </ul>
            </>
          ) : (
            <ListView data={data} onSelect={(id) => { select(id); setTab("graph"); }} />
          )}
        </div>

        <aside className="kng-inspector" aria-label="Inspector">
          {selected ? (
            <div className="kng-inspect">
              <p className="kng-eyebrow">
                {KIND_LABEL[selected.kind]}
                {selected.subject ? ` · ${SUBJECT_LABEL[selected.subject] ?? selected.subject}` : ""}
              </p>
              <h2>{selected.label}</h2>
              <p className="kng-meta">
                {selected.degree ?? 0} links
                {selected.container ? ` · ${nodeById.get(selected.container)?.label ?? selected.container}` : ""}
                {selected.stage ? ` · ${selected.stage}` : ""}
              </p>
              {selected.island !== undefined && selected.island >= 0 && data.islands[selected.island] ? (
                <p className="kng-meta">
                  <span className="kng-dot" style={{ background: data.islands[selected.island].color }} aria-hidden="true" />
                  Citation island: {data.islands[selected.island].label} ({data.islands[selected.island].size} units)
                </p>
              ) : null}
              {selected.href ? (
                <a className="kng-open" href={selected.href}>
                  Open in Hansa
                </a>
              ) : null}
              <div className="kng-buttons">
                <button type="button" className="kng-btn" onClick={() => { setMode("local"); setStatus(`Local graph anchored on ${selected.label}.`); }}>
                  Focus locally
                </button>
                {mode === "local" ? (
                  <button type="button" className="kng-btn" onClick={() => { setMode("global"); setStatus("Back to the global graph."); }}>
                    Global
                  </button>
                ) : null}
              </div>

              <h3>Relationships</h3>
              <p className="kng-note">
                Every line below comes from the dataset. Declared and derived edges are separated; candidates are unreviewed.
              </p>
              <ul className="kng-rel">
                {(inspectorAll ? incident : incident.slice(0, 14)).map((edge) => {
                  const otherId = edge.from === selected.id ? edge.to : edge.from;
                  const other = nodeById.get(otherId);
                  if (!other) return null;
                  const direction = edge.from === selected.id ? "→" : "←";
                  return (
                    <li key={edgeId(edge)}>
                      <span className={`kng-layer kng-layer--${edge.layer}`}>{LAYER_LABEL[edge.layer]}</span>
                      <button type="button" className="kng-link" onClick={() => select(other.id)}>
                        {direction} {other.label}
                      </button>
                      <em>
                        {EDGE_LABEL[edge.kind]}
                        {edge.kind === "co-citation" && edge.via ? ` · ${edge.via.length} source${edge.via.length === 1 ? "" : "s"}` : ""}
                        {edge.kind === "lexical" && edge.score !== undefined ? ` · ${Math.round(edge.score * 100)}%` : ""}
                        {edge.kind === "contains" && edge.weight ? ` · position ${edge.weight}` : ""}
                      </em>
                      {edge.pointer ? <code>{edge.pointer}</code> : null}
                      {edge.via && edge.kind !== "co-citation" ? <code>{edge.via.join(", ")}</code> : null}
                      {edge.kind === "co-citation" && edge.via ? <code>{edge.via.map((id) => nodeById.get(id)?.label ?? id).join(" · ")}</code> : null}
                      {edge.terms ? <code>shared terms: {edge.terms.join(", ")}</code> : null}
                    </li>
                  );
                })}
              </ul>
              {incident.length > 14 ? (
                <button type="button" className="kng-more" onClick={() => setInspectorAll((value) => !value)}>
                  {inspectorAll ? "Show fewer" : `Show all ${incident.length}`}
                </button>
              ) : null}

              {sharedPartners.length ? (
                <>
                  <h3>Shared sources</h3>
                  <p className="kng-note">Other units citing the same document. Derived from the same refs, not a reviewed claim.</p>
                  <ul className="kng-partners">
                    {sharedPartners.map((entry) => (
                      <li key={entry.node.id}>
                        <button type="button" className="kng-link" onClick={() => select(entry.node.id)}>
                          {entry.node.label}
                        </button>
                        <em>
                          {entry.shared.map((id) => nodeById.get(id)?.label ?? id).join(" · ")}
                        </em>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          ) : (
            <div className="kng-inspect kng-inspect--empty">
              <h2>Select a node</h2>
              <p>
                Click or keyboard-select any node to read its provenance. Double-click or <strong>Focus locally</strong> opens the Obsidian-style local
                graph around it.
              </p>
              <h3>What is drawn</h3>
              <p>
                Nodes are the real units of the corpus plus the documents they cite. Default edges are only what the corpus declares: chapter refs, lesson
                source pages and prerequisite chains. Shared-source and text-similarity edges are separate layers and are off until you ask for them.
              </p>
              <h3>Computed findings</h3>
              <p>
                {data.stats.components} connected islands, {data.stats.isolatedUnits} units with no verified link. Louvain clustering returns{" "}
                {data.stats.clusters} groups (modularity {data.stats.modularity}), the same partition as the islands: the verified citation graph has no
                hidden community structure beyond document sharing.
              </p>
              <p>
                Atlas: {data.stats.atlas.publishedConcepts} published concepts and {data.stats.atlas.publishedEdges} published links.{" "}
                {data.stats.atlas.reviewConcepts}/{data.stats.atlas.reviewEdges} remain in technical review and are never drawn.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function ListView({ data, onSelect }: { data: Dataset; onSelect: (id: string) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const units = data.nodes.filter((node) => node.kind === "unit");
  const groups = new Map<string, ClientNode[]>();
  for (const unit of units) {
    const key = unit.subject ?? "other";
    const list = groups.get(key) ?? [];
    list.push(unit);
    groups.set(key, list);
  }
  const candidates = data.edges.filter((edge) => edge.kind === "lexical").sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const byId = new Map(data.nodes.map((node) => [node.id, node]));
  return (
    <div className="kng-list">
      <h2>Accessible list of the same corpus</h2>
      <p>
        {units.length} content units across {groups.size} subjects, with the documents each unit cites. Open a subject to read its containers and units.
      </p>
      {[...groups.entries()]
        .sort((a, b) => b[1].length - a[1].length)
        .map(([subject, list]) => {
          const id = `list-${subject}`;
          const expanded = open === id;
          const containers = new Map<string, ClientNode[]>();
          for (const unit of list) {
            const key = unit.container ?? `subject:${subject}`;
            const items = containers.get(key) ?? [];
            items.push(unit);
            containers.set(key, items);
          }
          return (
            <section key={subject} className="kng-listGroup">
              <h3>
                <button type="button" aria-expanded={expanded} onClick={() => setOpen(expanded ? null : id)}>
                  {SUBJECT_LABEL[subject] ?? subject} <em>{list.length} units</em>
                </button>
              </h3>
              {expanded ? (
                <ul>
                  {[...containers.entries()].map(([container, items]) => (
                    <li key={container}>
                      <p className="kng-listContainer">{byId.get(container)?.label ?? container}</p>
                      <ul>
                        {items
                          .sort((a, b) => (a.label < b.label ? -1 : 1))
                          .map((unit) => {
                            const sources = data.edges.filter((edge) => edge.kind === "cites" && edge.from === unit.id).map((edge) => byId.get(edge.to)?.label ?? edge.to);
                            return (
                              <li key={unit.id}>
                                <button type="button" className="kng-link" onClick={() => onSelect(unit.id)}>
                                  {unit.label}
                                </button>
                                <span className="kng-listMeta">
                                  {unit.degree ?? 0} links
                                  {sources.length ? ` · cites ${sources.join("; ")}` : ""}
                                </span>
                              </li>
                            );
                          })}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
      <section className="kng-listGroup">
        <h3>
          Inferred candidate pairs <em>{candidates.length}</em>
        </h3>
        <p>Text similarity only. These are not reviewed relations and are not drawn until the candidate layer is enabled.</p>
        <ul>
          {candidates.slice(0, 40).map((edge) => (
            <li key={edgeId(edge)}>
              <button type="button" className="kng-link" onClick={() => onSelect(edge.from)}>
                {byId.get(edge.from)?.label}
              </button>{" "}
              ↔{" "}
              <button type="button" className="kng-link" onClick={() => onSelect(edge.to)}>
                {byId.get(edge.to)?.label}
              </button>{" "}
              <em>
                {Math.round((edge.score ?? 0) * 100)}% · {edge.terms?.join(", ")}
              </em>
            </li>
          ))}
        </ul>
      </section>
      <p className="kng-note">
        Atlas: {data.stats.atlas.publishedConcepts} published concepts / {data.stats.atlas.publishedEdges} links;{" "}
        {data.stats.atlas.reviewConcepts}/{data.stats.atlas.reviewEdges} in review, excluded.
      </p>
    </div>
  );
}
