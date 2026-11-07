"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Info,
  List,
  Map as MapIcon,
  Minus,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties } from "react";
import type { Hierarchy, TreeNode } from "@/lib/knowledge-graph/hierarchy";
import type { LensId } from "@/lib/knowledge-graph/lenses";
import {
  ancestorPath,
  buildTreeIndex,
  deselectNode,
  emptyState,
  parseTreeUrl,
  revealNode,
  searchTree,
  selectNode,
  serializeTreeUrl,
  showMore,
  siblingsOf,
  toggleKeepBranches,
  toggleNode,
  toggleOverview as toggleOverviewState,
  visibleNodes,
  type TreeIndex,
  type TreeState,
  type VisibleNode,
} from "@/lib/knowledge-graph/tree-model";
import {
  layoutRadial,
  VIEW_HALF_H,
  VIEW_HALF_W,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type PlacedNode,
} from "@/lib/knowledge-graph/tree-layout";
import { placeLabels, LABEL_FONT_SIZE } from "@/lib/knowledge-graph/tree-labels";
import "./tree.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

interface LensMeta {
  id: LensId;
  mode: "subject" | "programme";
  label: string;
  shortLabel: string;
  file: string;
  description: string;
  nodeCount: number;
  edgeCount: number;
  depth: number;
  roots: string[];
  bytes: number;
}

interface TreesManifest {
  version: string;
  generatedAt: string;
  lenses: LensMeta[];
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
  academy: "#8B5CF6",
};

const FALLBACK_COLOR = "#7A8699";

const KIND_LABEL: Record<string, string> = {
  programme: "Programme",
  subject: "Subject",
  pack: "Pack",
  journey: "Journey",
  chapter: "Chapter",
  course: "Course",
  unit: "Study note",
  source: "Cited source",
  page: "Source page",
  group: "Group",
  more: "More",
};

const UNIT_LABEL: Record<string, string> = {
  lesson: "Lesson",
  "study-note": "Study note",
  "external-foundation": "Foundation",
  "rti-lesson": "RTI lesson",
};

const RELATION_LABEL: Record<string, string> = {
  cites: "cites",
  "derived-from": "is derived from",
  prerequisite: "comes after",
};

function kindLabel(node: TreeNode): string {
  if (node.kind === "unit" && node.unitKind) return UNIT_LABEL[node.unitKind] ?? "Study note";
  if (node.kind === "group" && node.id.startsWith("group:source")) return "Source group";
  if (node.kind === "group") return "Collection";
  return KIND_LABEL[node.kind] ?? "Node";
}

function isExternal(href: string | undefined): boolean {
  return Boolean(href && /^https?:/i.test(href));
}

function hostOf(href: string | undefined): string {
  if (!href) return "";
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function pathOf(index: TreeIndex, id: string): string[] {
  return ancestorPath(index, id).map((parent) => index.byId.get(parent)?.label ?? parent);
}

function linearVisible(visible: VisibleNode[]): VisibleNode[] {
  const byParent = new Map<string, VisibleNode[]>();
  const roots: VisibleNode[] = [];
  for (const entry of visible) {
    if (!entry.parentId) {
      roots.push(entry);
      continue;
    }
    const list = byParent.get(entry.parentId) ?? [];
    list.push(entry);
    byParent.set(entry.parentId, list);
  }
  const out: VisibleNode[] = [];
  const walk = (entry: VisibleNode) => {
    out.push(entry);
    for (const child of byParent.get(entry.id) ?? []) walk(child);
  };
  for (const root of roots) walk(root);
  return out;
}

function lensColor(index: TreeIndex, rootId: string): string {
  const root = index.byId.get(rootId);
  return SUBJECT_COLOR[root?.subject ?? ""] ?? FALLBACK_COLOR;
}

// Mobile starts in the linear list. `useSyncExternalStore` reads the media
// query without a setState-in-effect and keeps the server snapshot stable.
const MOBILE_QUERY = "(max-width: 767px)";
function subscribeMobile(callback: () => void) {
  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function mobileSnapshot() {
  return window.matchMedia(MOBILE_QUERY).matches;
}
function serverMobileSnapshot() {
  return false;
}

function focusElement(element: Element | null | undefined) {
  if (element instanceof HTMLElement || element instanceof SVGElement) element.focus();
}

export default function TreeExplorer() {
  const reduceMotion = useReducedMotion();
  const searchId = useId();
  const cardTitleId = useId();
  const cache = useRef(new Map<string, Hierarchy>());
  const loadToken = useRef(0);
  const nodeRefs = useRef(new Map<string, Element>());
  const mapRef = useRef<SVGSVGElement>(null);
  const cardTitleRef = useRef<HTMLHeadingElement>(null);
  const cardReturnRef = useRef<Element | null>(null);
  const handledCardFocus = useRef(0);
  const [mapWidth, setMapWidth] = useState(VIEW_WIDTH);
  const [rovingId, setRovingId] = useState<string | null>(null);
  const [cardFocusRequest, setCardFocusRequest] = useState(0);

  const [manifest, setManifest] = useState<LensMeta[] | null>(null);
  const [lens, setLens] = useState<LensId>("subject");
  const [tree, setTree] = useState<Hierarchy | null>(null);
  const [state, setState] = useState<TreeState>(() => emptyState("subject"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [viewChoice, setViewChoice] = useState<"map" | "list" | null>(null);
  const isMobile = useSyncExternalStore(subscribeMobile, mobileSnapshot, serverMobileSnapshot);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchIndex, setSearchIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; panX: number; panY: number; id: number } | null>(null);

  // Labels live in the 1200-unit canvas. On a narrow map that would shrink
  // 14px text to 7-9px on screen, so the label layer is counter-scaled to keep
  // a readable screen size while the collision pass uses the same scale.
  // The map mounts after the tree loads, so this is a callback ref rather than
  // a mount effect that would find nothing to observe.
  const frameObserver = useRef<ResizeObserver | null>(null);
  const attachFrame = useCallback((node: HTMLDivElement | null) => {
    frameObserver.current?.disconnect();
    frameObserver.current = null;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width > 0) setMapWidth(width);
    });
    observer.observe(node);
    frameObserver.current = observer;
  }, []);

  const loadTree = useCallback(async (meta: LensMeta): Promise<Hierarchy> => {
    const hit = cache.current.get(meta.file);
    if (hit) return hit;
    const response = await fetch(`${BASE}/graph/${meta.file}`);
    if (!response.ok) throw new Error(`${meta.file}: ${response.status}`);
    const data = (await response.json()) as Hierarchy;
    cache.current.set(meta.file, data);
    return data;
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch(`${BASE}/graph/trees.json`, { signal: controller.signal });
        if (!response.ok) throw new Error(`trees.json: ${response.status}`);
        const data = (await response.json()) as TreesManifest;
        if (cancelled) return;
        const params = new URLSearchParams(window.location.search);
        const requested = params.get("lens");
        const meta =
          data.lenses.find((entry) => entry.id === requested) ??
          data.lenses.find((entry) => entry.id === "subject") ??
          data.lenses[0];
        if (!meta) throw new Error("No tree lens is available.");
        const loaded = await loadTree(meta);
        if (cancelled) return;
        const index = buildTreeIndex(loaded);
        const parsed = parseTreeUrl(index, window.location.search, meta.id);
        setManifest(data.lenses);
        setLens(meta.id);
        setTree(loaded);
        setState(parsed.state);
        setNotice(parsed.warning);
        setLoading(false);
      } catch (cause) {
        if (cancelled || controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : "The map could not be loaded.");
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [loadTree]);

  const view = viewChoice ?? (isMobile ? "list" : "map");
  const index = useMemo(() => (tree ? buildTreeIndex(tree) : null), [tree]);
  const visible = useMemo(() => (index ? visibleNodes(index, state) : null), [index, state]);
  const layout = useMemo(
    () => (visible ? layoutRadial(visible.nodes, { overview: state.overview }) : null),
    [visible, state.overview],
  );
  const labelScale = useMemo(() => {
    const screenFont = LABEL_FONT_SIZE * (mapWidth / VIEW_WIDTH);
    return Math.min(1.5, Math.max(1, Number((11 / screenFont).toFixed(3))));
  }, [mapWidth]);
  const labels = useMemo(() => {
    if (!layout || !visible) return { labels: [], skipped: 0, rootsHiddenByZoom: false };
    return placeLabels({
      visible: visible.nodes,
      positions: layout.positions,
      focus: state.focus,
      selected: state.selected,
      zoom,
      overview: state.overview,
      fontScale: labelScale,
    });
  }, [layout, visible, state.focus, state.selected, zoom, state.overview, labelScale]);

  const selected = state.selected ? index?.byId.get(state.selected) ?? null : null;
  const selectedPath = selected && index ? pathOf(index, selected.id) : [];
  const selectedPlaced = state.selected ? layout?.positions.get(state.selected) ?? null : null;
  const selectedColor = selectedPlaced && index ? lensColor(index, selectedPlaced.rootId) : FALLBACK_COLOR;

  const crossRefs = useMemo(() => {
    if (!tree || !index || !state.selected) return [];
    const seen = new Set<string>();
    const rows: { id: string; from: string; to: string; kind: string; target: TreeNode; direction: "out" | "in" }[] = [];
    for (const edge of tree.crossRefs) {
      if (edge.from !== state.selected && edge.to !== state.selected) continue;
      const other = edge.from === state.selected ? edge.to : edge.from;
      const target = index.byId.get(other);
      if (!target) continue;
      const key = `${edge.kind}:${other}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        id: key,
        from: edge.from,
        to: edge.to,
        kind: edge.kind,
        target,
        direction: edge.from === state.selected ? "out" : "in",
      });
    }
    return rows;
  }, [tree, index, state.selected]);

  const drawnRefs = useMemo(() => {
    if (!layout || !state.selected) return [];
    const selectedPosition = layout.positions.get(state.selected);
    if (!selectedPosition) return [];
    return crossRefs
      .map((edge) => {
        const target = layout.positions.get(edge.target.id);
        if (!target) return null;
        const midX = (selectedPosition.x + target.x) / 2;
        const midY = (selectedPosition.y + target.y) / 2;
        const dx = target.x - selectedPosition.x;
        const dy = target.y - selectedPosition.y;
        return {
          id: edge.id,
          d: `M ${selectedPosition.x.toFixed(2)} ${selectedPosition.y.toFixed(2)} Q ${(midX - dy * 0.14).toFixed(2)} ${(
            midY +
            dx * 0.14
          ).toFixed(2)} ${target.x.toFixed(2)} ${target.y.toFixed(2)}`,
        };
      })
      .filter((entry): entry is { id: string; d: string } => Boolean(entry))
      .slice(0, 24);
  }, [crossRefs, layout, state.selected]);

  const edges = useMemo(() => {
    if (!visible || !layout) return [];
    return visible.nodes
      .filter((entry) => entry.parentId)
      .map((entry) => {
        const child = layout.positions.get(entry.id);
        const parent = entry.parentId ? layout.positions.get(entry.parentId) : null;
        if (!child || !parent) return null;
        return {
          id: entry.id,
          d: `M ${parent.x.toFixed(2)} ${parent.y.toFixed(2)} L ${child.x.toFixed(2)} ${child.y.toFixed(2)}`,
          color: lensColor(index!, child.rootId),
        };
      })
      .filter((entry): entry is { id: string; d: string; color: string } => Boolean(entry));
  }, [visible, layout, index]);

  const listRows = useMemo(() => (visible ? linearVisible(visible.nodes) : []), [visible]);
  const activeMapId = useMemo(() => {
    const nodes = visible?.nodes ?? [];
    if (rovingId && nodes.some((entry) => entry.id === rovingId)) return rovingId;
    if (state.focus && nodes.some((entry) => entry.id === state.focus)) return state.focus;
    return nodes[0]?.id ?? null;
  }, [rovingId, visible, state.focus]);
  const searchResults = useMemo(() => (index ? searchTree(index, query, 8) : []), [index, query]);

  // Keep the URL shareable. The tree is static-exported, so replacing history
  // state avoids a route round-trip on every branch click.
  useEffect(() => {
    if (!index) return;
    const next = serializeTreeUrl(index, state);
    const target = `${window.location.pathname}${next}`;
    if (`${window.location.pathname}${window.location.search}` !== target) {
      window.history.replaceState(null, "", target);
    }
  }, [index, state]);

  // AnimatePresence keeps exiting nodes in the DOM for the spring duration with
  // their old props. Take them out of the tab order as soon as the visible set
  // changes so a departing node can never become a second tab stop.
  useEffect(() => {
    if (!visible) return;
    const ids = new Set(visible.nodes.map((entry) => entry.id));
    for (const [id, element] of nodeRefs.current) {
      if (!ids.has(id)) element.setAttribute("tabindex", "-1");
    }
  }, [visible]);

  // Keyboard activation of a leaf (or any node in the overview) moves focus
  // into the details card. The request counter lets the same leaf focus its
  // card twice; the handled ref prevents later selections from stealing focus.
  useEffect(() => {
    if (cardFocusRequest === 0 || handledCardFocus.current === cardFocusRequest) return;
    handledCardFocus.current = cardFocusRequest;
    cardTitleRef.current?.focus();
  }, [cardFocusRequest, selected]);

  const chooseLens = useCallback(
    async (next: LensId) => {
      if (!manifest || next === lens) return;
      const meta = manifest.find((entry) => entry.id === next);
      if (!meta) return;
      const token = ++loadToken.current;
      setLoading(true);
      setNotice("");
      try {
        const loaded = await loadTree(meta);
        if (token !== loadToken.current) return;
        setTree(loaded);
        setLens(next);
        setState(emptyState(next));
        setQuery("");
        setSearchOpen(false);
        setZoom(1);
        setPan({ x: 0, y: 0 });
        setLoading(false);
      } catch (cause) {
        if (token !== loadToken.current) return;
        setNotice(cause instanceof Error ? cause.message : "That lens could not be loaded.");
        setLoading(false);
      }
    },
    [lens, loadTree, manifest],
  );

  const moveFocus = useCallback((id: string) => {
    setRovingId(id);
    window.setTimeout(() => {
      focusElement(nodeRefs.current.get(id));
    }, 0);
  }, []);

  const announce = useCallback((message: string) => setNotice(message), []);

  const activate = useCallback(
    (entry: VisibleNode, source: "pointer" | "keyboard" = "pointer") => {
      if (!index) return;
      if (entry.more) {
        const result = showMore(index, state, entry.more.parentId);
        if (result.blocked) announce(result.reason ?? "The view limit was reached.");
        else setState(result.state);
        return;
      }

      // Only a keyboard origin is worth restoring: a pointer user's focus is
      // already where they clicked, and body focus must never be restored.
      const origin =
        source === "keyboard" && document.activeElement && document.activeElement !== document.body
          ? document.activeElement
          : null;

      if (state.overview) {
        cardReturnRef.current = origin;
        setState(selectNode(state, entry.id));
        if (source === "keyboard") setCardFocusRequest((value) => value + 1);
        return;
      }
      if (entry.node.children > 0) {
        const result = toggleNode(index, state, entry.id);
        if (result.blocked) {
          announce(result.reason ?? "The view limit was reached.");
          return;
        }
        cardReturnRef.current = origin;
        setState(result.state);
        return;
      }
      cardReturnRef.current = origin;
      setState(selectNode(state, entry.id));
      setNotice("");
      if (source === "keyboard") setCardFocusRequest((value) => value + 1);
    },
    [announce, index, state],
  );

  const closeCard = useCallback(
    (returnFocus: boolean) => {
      const origin = cardReturnRef.current;
      const selectedId = state.selected;
      cardReturnRef.current = null;
      setState(deselectNode(state));
      if (!returnFocus) return;
      window.setTimeout(() => {
        if (origin && origin.isConnected) {
          focusElement(origin);
          return;
        }
        const row = selectedId
          ? [...document.querySelectorAll<HTMLElement>(".kt-list-row")].find(
              (element) => element.dataset.rowId === selectedId,
            )
          : null;
        const node = selectedId ? nodeRefs.current.get(selectedId) : null;
        const fallback = activeMapId ? nodeRefs.current.get(activeMapId) : null;
        focusElement(
          (node && node.isConnected ? node : null) ??
            (row && row.isConnected ? row : null) ??
            (fallback && fallback.isConnected ? fallback : null),
        );
      }, 0);
    },
    [activeMapId, state],
  );

  const chooseSearchResult = useCallback(
    (id: string) => {
      if (!index) return;
      if (state.overview) {
        setState(selectNode(state, id));
        setQuery("");
        setSearchOpen(false);
        return;
      }
      const result = revealNode(index, state, id);
      if (result.blocked) {
        announce(result.reason ?? "The target is outside the view limit.");
        return;
      }
      setState(result.state);
      setQuery("");
      setSearchOpen(false);
      setNotice("");
      moveFocus(id);
    },
    [announce, index, moveFocus, state],
  );

  const onNodeKey = useCallback(
    (event: React.KeyboardEvent<Element>, entry: VisibleNode) => {
      if (!index) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (!entry.node.children) return;
        if (!state.open.has(entry.id) && !state.overview) {
          const result = toggleNode(index, state, entry.id);
          if (result.blocked) announce(result.reason ?? "The view limit was reached.");
          else {
            cardReturnRef.current = document.activeElement;
            setState(result.state);
          }
          return;
        }
        const child = visible?.nodes.find((item) => item.parentId === entry.id);
        if (child) moveFocus(child.id);
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (state.open.has(entry.id) && !state.overview) {
          const result = toggleNode(index, state, entry.id);
          if (result.blocked) announce(result.reason ?? "The view limit was reached.");
          else {
            cardReturnRef.current = document.activeElement;
            setState(result.state);
          }
          return;
        }
        if (entry.parentId) moveFocus(entry.parentId);
        return;
      }
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        const siblings = siblingsOf(index, entry.id);
        const position = siblings.indexOf(entry.id);
        if (position < 0) return;
        const next = event.key === "ArrowUp" ? position - 1 : position + 1;
        const target = siblings[(next + siblings.length) % siblings.length];
        if (target) moveFocus(target);
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate(entry, "keyboard");
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        closeCard(false);
      }
    },
    [activate, announce, closeCard, index, moveFocus, state, visible],
  );

  const resetView = () => {
    if (!index) return;
    setState(emptyState(lens));
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setNotice("");
  };

  const switchMode = (mode: "subject" | "programme") => {
    if (mode === "subject") chooseLens("subject");
    else if (lens === "subject") chooseLens("dp-600");
  };

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    const target = event.target as Element;
    if (target.closest("[data-node]") || target.closest("[data-control]")) return;
    drag.current = { x: event.clientX, y: event.clientY, panX: pan.x, panY: pan.y, id: event.pointerId };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    const active = drag.current;
    if (!active || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const scale = VIEW_WIDTH / Math.max(1, rect.width);
    setPan({
      x: active.panX + (event.clientX - active.x) * scale,
      y: active.panY + (event.clientY - active.y) * scale,
    });
  };

  const endDrag = () => {
    drag.current = null;
    setDragging(false);
  };

  const zoomBy = (delta: number) => setZoom((value) => Math.min(2.2, Math.max(0.62, Number((value + delta).toFixed(2)))));

  const selectedHost = hostOf(selected?.href);
  const referenceRows = crossRefs.slice(0, 5);
  const moreReferences = Math.max(0, crossRefs.length - referenceRows.length);

  if (loading && !tree) {
    return (
      <div className="kt kt-state" role="status" aria-live="polite">
        <div className="kt-spinner" aria-hidden="true" />
        <p>Growing the map…</p>
        <p className="kt-muted">Reading the declared containment tree.</p>
      </div>
    );
  }

  if (error || !tree || !index || !visible || !layout) {
    return (
      <div className="kt kt-state" role="alert">
        <h2>The map could not be loaded</h2>
        <p className="kt-muted">{error || "The tree payload is empty."}</p>
        <button type="button" className="kt-button" onClick={() => window.location.reload()}>
          Try again
        </button>
      </div>
    );
  }

  const lensMeta = manifest?.find((entry) => entry.id === lens);
  const mode = lens === "subject" ? "subject" : "programme";
  const countText = `${visible.dataCount.toLocaleString()} shown`;
  const hasCard = Boolean(selected);
  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 165, damping: 24, mass: 0.7 };

  return (
    <div className="kt">
      <div className="kt-instrument">
        <div className="kt-row kt-row--primary">
          <div className="kt-segmented" role="group" aria-label="Tree lens">
            <button
              type="button"
              className={mode === "subject" ? "is-on" : ""}
              aria-pressed={mode === "subject"}
              onClick={() => switchMode("subject")}
            >
              By subject
            </button>
            <button
              type="button"
              className={mode === "programme" ? "is-on" : ""}
              aria-pressed={mode === "programme"}
              onClick={() => switchMode("programme")}
            >
              By programme
            </button>
          </div>

          {mode === "programme" ? (
            <div className="kt-programmes" role="group" aria-label="Programme lens">
              {manifest
                ?.filter((entry) => entry.mode === "programme")
                .map((entry) => (
                  <button
                    type="button"
                    key={entry.id}
                    className={entry.id === lens ? "is-on" : ""}
                    aria-pressed={entry.id === lens}
                    onClick={() => chooseLens(entry.id)}
                  >
                    {entry.shortLabel}
                  </button>
                ))}
            </div>
          ) : null}

          <div className="kt-view-tabs" role="tablist" aria-label="View mode">
            <button
              type="button"
              role="tab"
              aria-selected={view === "map"}
              className={view === "map" ? "is-on" : ""}
              onClick={() => setViewChoice("map")}
            >
              <MapIcon size={14} aria-hidden="true" />
              Map
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "list"}
              className={view === "list" ? "is-on" : ""}
              onClick={() => setViewChoice("list")}
            >
              <List size={14} aria-hidden="true" />
              List
            </button>
          </div>

          <span className={`kt-count${visible.capReached ? " is-limit" : ""}`} aria-live="polite">
            {countText}
          </span>
        </div>

        <div className="kt-row kt-row--tools">
          <div
            className="kt-search"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setSearchOpen(false);
            }}
          >
            <label className="kt-sr" htmlFor={searchId}>
              Search this tree
            </label>
            <Search size={15} aria-hidden="true" className="kt-search-icon" />
            <input
              id={searchId}
              type="search"
              value={query}
              placeholder="Search this tree"
              autoComplete="off"
              onChange={(event) => {
                setQuery(event.target.value);
                setSearchOpen(true);
                setSearchIndex(0);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setSearchIndex((value) => Math.min(searchResults.length - 1, value + 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setSearchIndex((value) => Math.max(0, value - 1));
                } else if (event.key === "Enter" && searchResults.length) {
                  event.preventDefault();
                  chooseSearchResult(searchResults[Math.min(searchIndex, searchResults.length - 1)].node.id);
                } else if (event.key === "Escape") {
                  setSearchOpen(false);
                }
              }}
            />
            {query ? (
              <button
                type="button"
                className="kt-icon-button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setSearchOpen(false);
                }}
              >
                <X size={14} aria-hidden="true" />
              </button>
            ) : null}
            {searchOpen && query ? (
              <div className="kt-search-results" role="listbox" aria-label="Search results">
                {searchResults.length ? (
                  searchResults.map((result, position) => (
                    <button
                      type="button"
                      key={result.node.id}
                      role="option"
                      aria-selected={position === searchIndex}
                      className={position === searchIndex ? "is-active" : ""}
                      onMouseEnter={() => setSearchIndex(position)}
                      onClick={() => chooseSearchResult(result.node.id)}
                    >
                      <span className="kt-result-label">{result.node.label}</span>
                      <span className="kt-result-path">
                        {kindLabel(result.node)}
                        {result.path.length ? ` · ${result.path.join(" / ")}` : ""}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="kt-search-empty">No match in this lens. Try a shorter phrase.</p>
                )}
              </div>
            ) : null}
          </div>

          <label className="kt-check">
            <input
              type="checkbox"
              checked={state.keepBranches}
              onChange={() => setState(toggleKeepBranches(state))}
            />
            <span>Keep branches open</span>
          </label>

          <button
            type="button"
            className={`kt-button${state.overview ? " is-on" : ""}`}
            aria-pressed={state.overview}
            onClick={() => {
              setState(toggleOverviewState(state));
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
          >
            {state.overview ? "Back to branches" : "Show everything"}
          </button>

          <button type="button" className="kt-icon-button kt-reset" aria-label="Reset the view" onClick={resetView}>
            <RotateCcw size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="kt-context">
          <Info size={13} aria-hidden="true" />
          <span>{lensMeta?.description}</span>
          {state.overview ? <strong>Overview: every node, labels off.</strong> : null}
        </div>

        {notice ? (
          <div className="kt-notice" role="status">
            <span>{notice}</span>
            <button type="button" className="kt-icon-button" aria-label="Dismiss message" onClick={() => setNotice("")}>
              <X size={13} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      <div className={`kt-workbench${hasCard ? " has-card" : ""}`}>
        {view === "map" ? (
          <div className="kt-map-shell" role="tabpanel" aria-label="Radial map">
            <div className="kt-map-frame" ref={attachFrame}>
              <svg
                ref={mapRef}
                className={`kt-map${dragging ? " is-dragging" : ""}`}
                viewBox={`${-VIEW_HALF_W} ${-VIEW_HALF_H} ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
                style={{ "--kt-label-scale": labelScale } as CSSProperties}
                role="group"
                aria-label={`${lensMeta?.shortLabel ?? "Knowledge"} radial tree. Arrow keys move between nodes; Enter opens; Escape closes details. Use the List view for a linear outline.`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                onClick={(event) => {
                  const target = event.target as Element;
                  if (target === event.currentTarget || target.getAttribute("data-bg") === "true") {
                    if (state.selected) closeCard(false);
                  }
                }}
              >
                <defs>
                  <radialGradient id="kt-wash" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--kt-root-wash)" stopOpacity="0.75" />
                    <stop offset="62%" stopColor="var(--kt-root-wash)" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="var(--kt-root-wash)" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect
                  data-bg="true"
                  x={-VIEW_HALF_W}
                  y={-VIEW_HALF_H}
                  width={VIEW_WIDTH}
                  height={VIEW_HEIGHT}
                  fill="url(#kt-wash)"
                  className="kt-bg"
                />
                <g
                  transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}
                  className="kt-world"
                  style={{ transition: reduceMotion || dragging ? "none" : "transform 180ms ease-out" }}
                >
                  <g className="kt-guides" aria-hidden="true">
                    {layout.rings
                      .filter((radius) => radius > 0)
                      .map((radius) => (
                        <circle key={radius} r={radius} />
                      ))}
                    <line x1={-VIEW_HALF_W} y1={0} x2={VIEW_HALF_W} y2={0} />
                    <line x1={0} y1={-VIEW_HALF_H} x2={0} y2={VIEW_HALF_H} />
                  </g>

                  <g className="kt-edges" aria-hidden="true">
                    {edges.map((edge) => (
                      <motion.path
                        key={edge.id}
                        d={edge.d}
                        fill="none"
                        stroke={edge.color}
                        initial={false}
                        animate={{ d: edge.d }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                      />
                    ))}
                  </g>

                  <g className="kt-xrefs" aria-hidden="true">
                    {drawnRefs.map((edge) => (
                      <path key={edge.id} d={edge.d} />
                    ))}
                  </g>

                  <g className="kt-nodes">
                    <AnimatePresence initial={false}>
                      {visible.nodes.map((entry) => {
                        const position = layout.positions.get(entry.id);
                        if (!position) return null;
                        const color = lensColor(index, position.rootId);
                        const open = state.open.has(entry.id);
                        const isSelected = state.selected === entry.id;
                        const parentPosition = entry.parentId ? layout.positions.get(entry.parentId) : null;
                        const markR = position.radius + 4.2;
                        const markArm = Math.min(4, Math.max(2.6, position.radius * 0.3));
                        return (
                          <motion.g
                            key={entry.id}
                            ref={(element) => {
                              if (element) nodeRefs.current.set(entry.id, element);
                              else nodeRefs.current.delete(entry.id);
                            }}
                            data-node="true"
                            data-node-id={entry.id}
                            className={`kt-node${isSelected ? " is-selected" : ""}${open ? " is-open" : ""}`}
                            role="button"
                            tabIndex={activeMapId === entry.id ? 0 : -1}
                            aria-label={`${kindLabel(entry.node)}: ${entry.node.label}.${
                              entry.node.children
                                ? ` ${entry.node.children} direct ${entry.node.children === 1 ? "branch" : "branches"}, ${
                                    open ? "expanded" : "collapsed"
                                  }.`
                                : " Leaf."
                            }${entry.more ? ` ${entry.more.remaining} more items.` : ""}`}
                            aria-expanded={entry.node.children ? open : undefined}
                            aria-pressed={isSelected || undefined}
                            initial={
                              reduceMotion
                                ? false
                                : {
                                    opacity: 0,
                                    x: parentPosition?.x ?? position.x,
                                    y: parentPosition?.y ?? position.y,
                                    scale: 0.4,
                                  }
                            }
                            animate={{ opacity: 1, x: position.x, y: position.y, scale: 1 }}
                            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
                            transition={spring}
                            onFocus={() => setRovingId(entry.id)}
                            onClick={(event) => {
                              event.stopPropagation();
                              setRovingId(entry.id);
                              activate(entry, "pointer");
                            }}
                            onKeyDown={(event) => onNodeKey(event, entry)}
                          >
                            <title>{entry.node.label}</title>
                            <circle className="kt-hit" r={position.radius + 9} />
                            <NodeGlyph entry={entry} position={position} color={color} open={open} />
                            {isSelected ? <circle className="kt-selected-ring" r={position.radius + 5} /> : null}
                            {entry.node.children && !state.overview ? (
                              <path
                                className="kt-expand-mark"
                                d={`M${markR - markArm} ${markR}h${markArm * 2}M${markR} ${markR - markArm}v${markArm * 2}`}
                              />
                            ) : null}
                          </motion.g>
                        );
                      })}
                    </AnimatePresence>
                  </g>

                  <g className="kt-labels" aria-hidden="true">
                    {labels.labels.map((label) => {
                      const entry = visible.nodes.find((node) => node.id === label.id);
                      return (
                        <text
                          key={label.id}
                          x={label.x}
                          y={label.y}
                          textAnchor={label.anchor}
                          dominantBaseline="middle"
                          className={`kt-label kt-label--d${label.depth}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            if (entry) activate(entry);
                          }}
                        >
                          <title>{label.fullText}</title>
                          {label.text}
                        </text>
                      );
                    })}
                  </g>
                </g>
              </svg>

              <div className="kt-zoom" data-control="true" role="group" aria-label="Map zoom">
                <button type="button" aria-label="Zoom in" onClick={() => zoomBy(0.16)}>
                  <Plus size={14} aria-hidden="true" />
                </button>
                <span aria-live="polite">{Math.round(zoom * 100)}%</span>
                <button type="button" aria-label="Zoom out" onClick={() => zoomBy(-0.16)}>
                  <Minus size={14} aria-hidden="true" />
                </button>
              </div>

              <div className="kt-map-hint">
                Drag to pan · click a ring to open · leaves open a card
              </div>
            </div>

            <p className="kt-mobile-note">
              Overview only. Tap a ring to open its card; the List tab has the full outline.
            </p>

            <div className="kt-key" aria-label="Shape key">
              <span>
                <i className="kt-key-root" aria-hidden="true" /> Subject
              </span>
              <span>
                <i className="kt-key-branch" aria-hidden="true" /> Branch
              </span>
              <span>
                <i className="kt-key-note" aria-hidden="true" /> Note
              </span>
              <span>
                <i className="kt-key-source" aria-hidden="true" /> Source
              </span>
              <span className="kt-key-note-text">Structure edges only. Dashed lines are declared cross-references for the selected node.</span>
            </div>
          </div>
        ) : (
          <div className="kt-list-shell" role="tabpanel" aria-label="Tree list">
            <p className="kt-list-intro">
              The same branches, in reading order. Each row is a button: open or collapse a branch, select a leaf for its card.
            </p>
            <ul className="kt-list">
              {listRows.map((entry) => {
                const open = state.open.has(entry.id);
                const isSelected = state.selected === entry.id;
                const color = layout.positions.get(entry.id)
                  ? lensColor(index, layout.positions.get(entry.id)!.rootId)
                  : FALLBACK_COLOR;
                return (
                  <li
                    key={entry.id}
                    style={{ marginInlineStart: `${Math.min(entry.depth, 6) * 16}px` }}
                    className={isSelected ? "is-selected" : ""}
                  >
                    <button
                      type="button"
                      className="kt-list-row"
                      data-row-id={entry.id}
                      aria-expanded={entry.node.children ? open : undefined}
                      aria-pressed={isSelected || undefined}
                      onClick={(event) => activate(entry, event.detail === 0 ? "keyboard" : "pointer")}
                    >
                      <span className="kt-list-chevron" aria-hidden="true">
                        {entry.more ? (
                          <Plus size={13} />
                        ) : entry.node.children ? (
                          open ? (
                            <ChevronDown size={13} />
                          ) : (
                            <ChevronRight size={13} />
                          )
                        ) : (
                          <span className="kt-list-dot" style={{ background: color }} />
                        )}
                      </span>
                      <span className="kt-list-label">
                        <span className="kt-list-title">{entry.node.label}</span>
                        <span className="kt-list-kind">
                          {kindLabel(entry.node)}
                          {entry.more
                            ? ` · ${entry.more.remaining} remaining of ${entry.more.total}`
                            : entry.node.children
                              ? ` · ${entry.node.children} direct`
                              : ""}
                        </span>
                      </span>
                    </button>
                    {entry.node.href && !entry.more ? (
                      isExternal(entry.node.href) ? (
                        <a
                          className="kt-list-open"
                          href={entry.node.href}
                          target="_blank"
                          rel="noreferrer noopener"
                          aria-label={`Open ${entry.node.label} in a new tab`}
                        >
                          <ExternalLink size={13} aria-hidden="true" />
                        </a>
                      ) : (
                        <Link className="kt-list-open" href={entry.node.href} aria-label={`Open ${entry.node.label}`}>
                          <ExternalLink size={13} aria-hidden="true" />
                        </Link>
                      )
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {visible.capReached ? (
              <p className="kt-list-cap" role="status">
                The 150-node view limit is reached. Collapse a branch to reveal another.
              </p>
            ) : null}
          </div>
        )}

        {selected ? (
          <aside
            className="kt-card"
            aria-labelledby={cardTitleId}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                event.stopPropagation();
                closeCard(true);
              }
            }}
          >
            <div className="kt-card-rule" style={{ background: selectedColor }} aria-hidden="true" />
            <div className="kt-card-head">
              <span className="kt-kicker">{kindLabel(selected)}</span>
              <button
                type="button"
                className="kt-icon-button"
                aria-label="Close details"
                onClick={() => closeCard(true)}
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>
            <h2 className="kt-card-title" id={cardTitleId} ref={cardTitleRef} tabIndex={-1}>
              {selected.label}
            </h2>
            <p className="kt-breadcrumb">{[...selectedPath, selected.label].join(" / ")}</p>

            {selected.description ? <p className="kt-card-copy">{selected.description}</p> : null}

            <dl className="kt-facts">
              <div>
                <dt>Branches</dt>
                <dd>{selected.children}</dd>
              </div>
              <div>
                <dt>Items below</dt>
                <dd>{selected.contentDescendants}</dd>
              </div>
              {selected.groupCount ? (
                <div>
                  <dt>Sources</dt>
                  <dd>{selected.groupCount}</dd>
                </div>
              ) : null}
            </dl>

            {selected.href ? (
              isExternal(selected.href) ? (
                <a className="kt-primary" href={selected.href} target="_blank" rel="noreferrer noopener">
                  Open source
                  <ExternalLink size={14} aria-hidden="true" />
                  {selectedHost ? <span className="kt-sr"> on {selectedHost}</span> : null}
                </a>
              ) : (
                <Link className="kt-primary" href={selected.href}>
                  Open page
                  <ExternalLink size={14} aria-hidden="true" />
                </Link>
              )
            ) : (
              <p className="kt-card-note">
                {selected.kind === "more"
                  ? "Paging control only; it has no page."
                  : "This node has no page of its own. Its card is the source of truth."}
              </p>
            )}

            {selected.children > 0 && !state.overview ? (
              <button
                type="button"
                className="kt-secondary"
                onClick={() => {
                  const entry = visible.nodes.find((node) => node.id === selected.id);
                  if (entry) activate(entry);
                }}
              >
                {state.open.has(selected.id) ? "Collapse branch" : "Expand branch"}
              </button>
            ) : null}

            {referenceRows.length ? (
              <div className="kt-refs">
                <h3>Declared cross-references</h3>
                <ul>
                  {referenceRows.map((edge) => (
                    <li key={edge.id}>
                      <span>{edge.direction === "out" ? RELATION_LABEL[edge.kind] ?? edge.kind : `cited by`}</span>
                      <button type="button" onClick={() => chooseSearchResult(edge.target.id)}>
                        {edge.target.label}
                      </button>
                    </li>
                  ))}
                </ul>
                {moreReferences ? <p>{moreReferences} more declared references are not listed.</p> : null}
              </div>
            ) : null}
          </aside>
        ) : null}
      </div>

      <div className="kt-foot">
        <p>
          <strong>How to read it.</strong> A ring is one level of containment; angle is the share of the parent branch the
          node belongs to; area grows with the number of items below. Clicking a branch opens it, clicking a leaf opens its
          card. The <em>Open</em> action is always explicit — nothing navigates on selection.
        </p>
        <p className="kt-muted">
          Keyboard on the map: <kbd>→</kbd> expands, <kbd>←</kbd> collapses or moves to the parent, <kbd>↑</kbd>/<kbd>↓</kbd>{" "}
          move between siblings, <kbd>Enter</kbd> activates, <kbd>Esc</kbd> closes the card. One tab stop; the List view is
          the linear alternative.
        </p>
      </div>
    </div>
  );
}

function NodeGlyph({
  entry,
  position,
  color,
  open,
}: {
  entry: VisibleNode;
  position: PlacedNode;
  color: string;
  open: boolean;
}) {
  const radius = position.radius;
  if (entry.more) {
    return (
      <g className="kt-more">
        <circle r={radius} />
        <path d={`M ${-radius * 0.42} 0 H ${radius * 0.42} M 0 ${-radius * 0.42} V ${radius * 0.42}`} />
      </g>
    );
  }
  if (position.depth === 0) {
    return (
      <g className="kt-root">
        <circle r={radius} fill="var(--background)" stroke={color} strokeWidth={2.4} />
        <circle r={radius * 0.42} fill={color} />
      </g>
    );
  }
  if (entry.node.kind === "unit") {
    return <circle className={`kt-unit${open ? " is-open" : ""}`} r={radius} fill={color} />;
  }
  if (entry.node.kind === "source" || entry.node.kind === "page") {
    return (
      <rect
        className="kt-source"
        x={-radius}
        y={-radius}
        width={radius * 2}
        height={radius * 2}
        rx={1.4}
        fill={color}
      />
    );
  }
  return (
    <g className={`kt-branch${open ? " is-open" : ""}`}>
      <circle r={radius} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={1.7} />
      <circle r={Math.max(2.2, radius * 0.26)} fill={color} />
    </g>
  );
}
