"use client";

// Prototype only: an Obsidian-style 2D local graph over a source-backed corpus.
//
// Interaction model:
//   - sequences are the only nodes rendered at rest; expanding one reveals its
//     notes around a fixed anchor, so no other node moves;
//   - notes open in the inspector with a real link to the note that already
//     exists in the curriculum;
//   - pan, zoom, drag, search, focus, back and reset are all local state;
//   - the list view is the equivalent, fully keyboard- and screen-reader-
//     navigable representation of the same graph.
//
// Provenance and the boundary against the Atlas are rendered by the page, not
// hidden in this component.
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GraphData, GraphNote, GraphSequence } from "@/lib/prototype/graph-data";
import { clamp, fitView, noteAnchors, sequenceAnchor, type Point } from "@/lib/prototype/graph-layout";
import "./knowledge-graph.css";

const NOTE_PAGE = 20;
const MIN_K = 0.34;
const MAX_K = 2.6;

type View = { x: number; y: number; k: number };
type Snapshot = { expanded: string[]; selected: string | null; focused: string | null };
type RenderNode =
  | { id: string; kind: "sequence"; sequence: GraphSequence }
  | { id: string; kind: "note"; note: GraphNote; sequence: GraphSequence; index: number };

function shorten(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/**
 * Splits a title into at most two lines at word boundaries. The canvas label
 * must show the whole title: a truncated visible label would no longer match
 * the node's accessible name (WCAG 2.5.3).
 */
function wrapTitle(text: string, max: number): string[] {
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
  return lines.slice(0, 2);
}

export function KnowledgeGraph({ data }: { data: GraphData }) {
  const sequences = useMemo(() => new Map(data.sequences.map((item) => [item.id, item] as const)), [data]);
  const notes = useMemo(() => new Map(data.notes.map((item) => [item.id, item] as const)), [data]);

  const [expanded, setExpanded] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [limits, setLimits] = useState<Record<string, number>>({});
  const [moved, setMoved] = useState<Record<string, Point>>({});
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 0.8 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [query, setQuery] = useState("");
  const [resultIndex, setResultIndex] = useState(0);
  const [list, setList] = useState(false);
  const [status, setStatus] = useState("No selection. Expand a sequence to reveal its notes.");
  const [canBack, setCanBack] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Record<string, SVGGElement | null>>({});
  const history = useRef<Snapshot[]>([]);
  const fitted = useRef(false);

  // Pointer and wheel handlers run outside React's render pass and need the
  // latest camera without re-subscribing on every pan frame.
  const viewRef = useRef(view);
  const sizeRef = useRef(size);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);
  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  // Below ~560px the labels do not fit around the ring, so the map shows nodes
  // only and names appear on selection, hover or expansion. The chips and the
  // list view carry the names at that width.
  const compact = size.w > 0 && size.w < 560;
  const fitPadding = compact ? 34 : 170;

  const base = useMemo(() => {
    const map: Record<string, Point> = {};
    const center = { x: 0, y: 0 };
    data.sequences.forEach((sequence, index) => {
      const anchor = sequenceAnchor(index, data.sequences.length);
      map[sequence.id] = anchor;
      const notes = noteAnchors(anchor, sequence.noteIds.length, center);
      sequence.noteIds.forEach((id, noteIndex) => {
        map[id] = notes[noteIndex];
      });
    });
    return map;
  }, [data]);

  const pos = useCallback(
    (id: string): Point => moved[id] ?? base[id] ?? { x: 0, y: 0 },
    [moved, base],
  );

  const visibleNotes = useMemo(
    () =>
      expanded.flatMap((sequenceId) => {
        const sequence = sequences.get(sequenceId);
        if (!sequence) return [];
        return sequence.noteIds.slice(0, limits[sequenceId] ?? NOTE_PAGE).map((id, index) => ({
          note: notes.get(id)!,
          sequence,
          index,
        }));
      }),
    [expanded, limits, sequences, notes],
  );

  const visibleIds = useMemo(
    () => new Set([...data.sequences.map((item) => item.id), ...visibleNotes.map((entry) => entry.note.id)]),
    [data, visibleNotes],
  );

  const edges = useMemo(() => {
    const list: { id: string; from: string; to: string; type: "member" | "dependency" }[] = [];
    for (const entry of visibleNotes) {
      list.push({ id: `m:${entry.sequence.id}:${entry.note.id}`, from: entry.sequence.id, to: entry.note.id, type: "member" });
      for (const prerequisite of entry.note.prerequisites) {
        if (visibleIds.has(prerequisite)) {
          list.push({ id: `d:${prerequisite}:${entry.note.id}`, from: prerequisite, to: entry.note.id, type: "dependency" });
        }
      }
    }
    return list;
  }, [visibleNotes, visibleIds]);

  const index = useMemo(
    () => [
      ...data.sequences.map((sequence) => ({
        id: sequence.id,
        kind: "sequence" as const,
        title: sequence.title,
        text: `${sequence.number} ${sequence.title} ${sequence.question} ${sequence.summary}`,
      })),
      ...data.notes.map((note) => ({
        id: note.id,
        kind: "note" as const,
        title: note.title,
        text: `${note.title} ${note.objectives.join(" ")} ${note.sourceNote}`,
      })),
    ],
    [data],
  );
  const needle = query.trim().toLowerCase();
  const matches = useMemo(
    () => (needle.length < 2 ? [] : index.filter((entry) => entry.text.toLowerCase().includes(needle)).slice(0, 8)),
    [needle, index],
  );
  const matchedIds = useMemo(() => new Set(matches.map((entry) => entry.id)), [matches]);

  const focusSet = useMemo(() => {
    if (!focusedId) return null;
    const set = new Set([focusedId]);
    for (const edge of edges) {
      if (edge.from === focusedId) set.add(edge.to);
      if (edge.to === focusedId) set.add(edge.from);
    }
    return set;
  }, [focusedId, edges]);

  const selectedSequence = selectedId ? sequences.get(selectedId) ?? null : null;
  const selectedNote = selectedId && !selectedSequence ? notes.get(selectedId) ?? null : null;

  // ------------------------------------------------------------- history
  const pushSnapshot = useCallback(() => {
    history.current.push({ expanded, selected: selectedId, focused: focusedId });
    if (history.current.length > 40) history.current.shift();
    setCanBack(true);
  }, [expanded, selectedId, focusedId]);

  const back = useCallback(() => {
    const previous = history.current.pop();
    setCanBack(history.current.length > 0);
    if (!previous) return;
    setExpanded(previous.expanded);
    setSelectedId(previous.selected);
    setFocusedId(previous.focused);
    setStatus("Previous graph state restored.");
  }, []);

  // ------------------------------------------------------------- actions
  const activate = useCallback(
    (id: string) => {
      if (id.startsWith("seq:")) return;
      const note = notes.get(id);
      if (!note) return;
      const sequence = sequences.get(note.sequenceId);
      pushSnapshot();
      setSelectedId(id);
      setFocusedId(null);
      setStatus(
        `Note selected: ${note.title}. Position ${note.index} of ${sequence?.noteIds.length ?? 0}. ${note.prerequisites.length} recorded dependencies.`,
      );
    },
    [notes, sequences, pushSnapshot],
  );

  const toggleSequence = useCallback(
    (id: string) => {
      const sequence = sequences.get(id);
      if (!sequence) return;
      pushSnapshot();
      const isOpen = expanded.includes(id);
      if (isOpen) {
        setExpanded(expanded.filter((item) => item !== id));
        if (selectedId && notes.get(selectedId)?.sequenceId === id) setSelectedId(null);
        if (focusedId && notes.get(focusedId)?.sequenceId === id) setFocusedId(null);
        setStatus(`Sequence collapsed: ${sequence.title}.`);
      } else {
        setExpanded([...expanded, id]);
        setStatus(`Sequence expanded: ${sequence.title}. ${sequence.noteIds.length} notes shown.`);
      }
      setSelectedId(id);
    },
    [expanded, selectedId, focusedId, notes, sequences, pushSnapshot],
  );

  const focusNode = useCallback(
    (id: string) => {
      pushSnapshot();
      setFocusedId(focusedId === id ? null : id);
      setSelectedId(id);
      setStatus(focusedId === id ? "Focus cleared." : "Focus: this note and its direct links only.");
    },
    [focusedId, pushSnapshot],
  );

  const centerOn = useCallback(
    (id: string) => {
      const point = pos(id);
      const k = Math.max(viewRef.current.k, 0.9);
      setView({ k, x: -point.x * k, y: -point.y * k });
    },
    [pos],
  );

  const chooseResult = useCallback(
    (id: string) => {
      setQuery("");
      setResultIndex(0);
      if (id.startsWith("seq:")) {
        if (!expanded.includes(id)) toggleSequence(id);
        else {
          pushSnapshot();
          setSelectedId(id);
        }
        centerOn(id);
      } else {
        const note = notes.get(id);
        if (!note) return;
        pushSnapshot();
        if (!expanded.includes(note.sequenceId)) setExpanded((previous) => [...previous, note.sequenceId]);
        setSelectedId(id);
        setFocusedId(null);
        centerOn(id);
      }
      requestAnimationFrame(() => nodeRefs.current[id]?.focus({ preventScroll: true }));
    },
    [expanded, centerOn, notes, pushSnapshot, toggleSequence],
  );

  function reset() {
    setExpanded([]);
    setSelectedId(null);
    setFocusedId(null);
    setLimits({});
    setMoved({});
    setQuery("");
    setHovered(null);
    history.current = [];
    setCanBack(false);
    fitted.current = false;
    setView(fitView(data.sequences.map((sequence) => base[sequence.id]), size.w, size.h, fitPadding));
    setStatus("Graph reset. All sequences are collapsed.");
  }

  const fit = useCallback(() => {
    const points = [...visibleIds].map((id) => pos(id));
    setView(fitView(points, sizeRef.current.w, sizeRef.current.h, sizeRef.current.w < 560 ? 34 : 170));
    setStatus("View fitted to the visible nodes.");
  }, [visibleIds, pos]);

  const zoomAt = useCallback((factor: number, cx: number, cy: number) => {
    const current = viewRef.current;
    const container = sizeRef.current;
    const k = clamp(current.k * factor, MIN_K, MAX_K);
    const worldX = (cx - container.w / 2 - current.x) / current.k;
    const worldY = (cy - container.h / 2 - current.y) / current.k;
    setView({
      k,
      x: cx - container.w / 2 - worldX * k,
      y: cy - container.h / 2 - worldY * k,
    });
  }, []);

  // ------------------------------------------------------------- sizing
  useEffect(() => {
    const element = boxRef.current;
    if (!element) return;
    const update = () => setSize({ w: element.clientWidth, h: element.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!size.w || fitted.current) return;
    fitted.current = true;
    setView(fitView(data.sequences.map((sequence) => base[sequence.id]), size.w, size.h, fitPadding));
  }, [size, base, data, fitPadding]);

  useEffect(() => {
    const element = svgRef.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = element.getBoundingClientRect();
      zoomAt(Math.exp(-event.deltaY * 0.0016), event.clientX - rect.left, event.clientY - rect.top);
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  // ------------------------------------------------------------- pointers
  const drag = useRef<{ id: string; start: Point; offset: Point; moved: boolean } | null>(null);
  const pan = useRef<{ x0: number; y0: number; vx: number; vy: number; moved: boolean } | null>(null);
  const pointers = useRef(new Map<number, Point>());
  const pinch = useRef<{ distance: number; k: number; center: Point; world: Point } | null>(null);

  function onCanvasPointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2 && !drag.current) {
      const [a, b] = [...pointers.current.values()];
      const rect = svgRef.current!.getBoundingClientRect();
      const center = { x: (a.x + b.x) / 2 - rect.left, y: (a.y + b.y) / 2 - rect.top };
      pinch.current = {
        distance: Math.hypot(a.x - b.x, a.y - b.y) || 1,
        k: viewRef.current.k,
        center,
        world: {
          x: (center.x - sizeRef.current.w / 2 - viewRef.current.x) / viewRef.current.k,
          y: (center.y - sizeRef.current.h / 2 - viewRef.current.y) / viewRef.current.k,
        },
      };
      pan.current = null;
      return;
    }
    svgRef.current?.setPointerCapture(event.pointerId);
    pan.current = {
      x0: event.clientX,
      y0: event.clientY,
      vx: viewRef.current.x,
      vy: viewRef.current.y,
      moved: false,
    };
  }

  function onCanvasPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (pinch.current) {
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (pointers.current.size >= 2) {
        const [a, b] = [...pointers.current.values()];
        const distance = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        const start = pinch.current;
        const k = clamp(start.k * (distance / start.distance), MIN_K, MAX_K);
        setView({
          k,
          x: start.center.x - sizeRef.current.w / 2 - start.world.x * k,
          y: start.center.y - sizeRef.current.h / 2 - start.world.y * k,
        });
      }
      return;
    }
    if (drag.current) {
      const current = drag.current;
      const rect = svgRef.current!.getBoundingClientRect();
      const v = viewRef.current;
      const worldX = (event.clientX - rect.left - sizeRef.current.w / 2 - v.x) / v.k;
      const worldY = (event.clientY - rect.top - sizeRef.current.h / 2 - v.y) / v.k;
      if (Math.hypot(event.clientX - current.start.x, event.clientY - current.start.y) > 3) current.moved = true;
      const next = { x: worldX - current.offset.x, y: worldY - current.offset.y };
      setMoved((previous) => ({ ...previous, [current.id]: next }));
      return;
    }
    if (pan.current) {
      const current = pan.current;
      const dx = event.clientX - current.x0;
      const dy = event.clientY - current.y0;
      if (Math.hypot(dx, dy) > 3) current.moved = true;
      setView((previous) => ({ ...previous, x: current.vx + dx, y: current.vy + dy }));
    }
  }

  function onCanvasPointerUp(event: React.PointerEvent<SVGSVGElement>) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (drag.current) {
      const current = drag.current;
      drag.current = null;
      if (!current.moved) {
        if (current.id.startsWith("seq:")) toggleSequence(current.id);
        else activate(current.id);
      }
      return;
    }
    if (pan.current && !pan.current.moved) {
      setSelectedId(null);
      setFocusedId(null);
      setStatus("Selection cleared.");
    }
    pan.current = null;
  }

  function onNodePointerDown(event: React.PointerEvent<SVGGElement>, id: string) {
    event.stopPropagation();
    if (event.pointerType === "mouse" && event.button !== 0) return;
    svgRef.current?.setPointerCapture(event.pointerId);
    const rect = svgRef.current!.getBoundingClientRect();
    const v = viewRef.current;
    const worldX = (event.clientX - rect.left - sizeRef.current.w / 2 - v.x) / v.k;
    const worldY = (event.clientY - rect.top - sizeRef.current.h / 2 - v.y) / v.k;
    const point = pos(id);
    drag.current = {
      id,
      start: { x: event.clientX, y: event.clientY },
      offset: { x: worldX - point.x, y: worldY - point.y },
      moved: false,
    };
  }

  function onNodeKeyDown(event: React.KeyboardEvent<SVGGElement>, id: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (id.startsWith("seq:")) toggleSequence(id);
      else activate(id);
      return;
    }
    const directions: Record<string, Point> = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    const from = pos(id);
    let best: { id: string; score: number } | null = null;
    for (const candidate of visibleIds) {
      if (candidate === id) continue;
      const point = pos(candidate);
      const dx = point.x - from.x;
      const dy = point.y - from.y;
      const projection = dx * direction.x + dy * direction.y;
      if (projection <= 0) continue;
      const perpendicular = Math.abs(dx * direction.y - dy * direction.x);
      const score = projection + perpendicular * 1.6;
      if (!best || score < best.score) best = { id: candidate, score };
    }
    if (best) nodeRefs.current[best.id]?.focus({ preventScroll: true });
  }

  // ------------------------------------------------------------- render data
  const renderNodes: RenderNode[] = useMemo(
    () => [
      ...data.sequences.map((sequence) => ({ id: sequence.id, kind: "sequence" as const, sequence })),
      ...visibleNotes.map((entry) => ({ id: entry.note.id, kind: "note" as const, note: entry.note, sequence: entry.sequence, index: entry.index })),
    ],
    [data, visibleNotes],
  );

  const ariaLabel = (node: RenderNode) =>
    node.kind === "sequence"
      ? `${node.sequence.title}. ${expanded.includes(node.id) ? "Expanded" : "Collapsed"}, ${node.sequence.noteIds.length} notes.`
      : `${node.note.title}. Note ${node.index + 1} of ${node.sequence.noteIds.length}${
          node.note.prerequisites.length ? `, ${node.note.prerequisites.length} recorded dependencies` : ""
        }.`;

  return (
    <div className={"kg-wrap"}>
      <div className={"kg-toolbar"}>
        <div className={"kg-searchWrap"}>
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value.slice(0, 80));
              setResultIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setQuery("");
                return;
              }
              if (!matches.length) return;
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setResultIndex((current) => (current + 1) % matches.length);
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setResultIndex((current) => (current - 1 + matches.length) % matches.length);
              } else if (event.key === "Enter") {
                event.preventDefault();
                chooseResult(matches[Math.min(resultIndex, matches.length - 1)].id);
              }
            }}
            placeholder="Search notes and sequences"
            aria-label="Search notes and sequences"
            className={"kg-search"}
            data-testid="graph-search"
          />
          {needle.length >= 2 ? (
            <ul className={"kg-results"} role="listbox" aria-label="Search results">
              {matches.length === 0 ? <li className={"kg-emptyResult"}>No matches</li> : null}
              {matches.map((match, position) => (
                <li key={match.id} role="option" aria-selected={position === resultIndex}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => chooseResult(match.id)}
                    className={position === resultIndex ? "kg-resultActive" : undefined}
                  >
                    <span>{match.title}</span>
                    <span className={"kg-resultKind"}>{match.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className={"kg-buttons"}>
          <button type="button" onClick={back} disabled={!canBack}>
            Back
          </button>
          <button type="button" onClick={fit}>
            Fit
          </button>
          <button type="button" onClick={() => setList((current) => !current)} aria-pressed={list}>
            {list ? "Graph view" : "List view"}
          </button>
          <button type="button" onClick={reset}>
            Reset
          </button>
        </div>
      </div>

      <nav className={"kg-chips"} aria-label="Sequences">
        {data.sequences.map((sequence) => (
          <button
            key={sequence.id}
            type="button"
            aria-pressed={expanded.includes(sequence.id)}
            onClick={() => {
              if (!expanded.includes(sequence.id)) toggleSequence(sequence.id);
              else centerOn(sequence.id);
            }}
          >
            <span className={"kg-chipNumber"}>{sequence.number}</span>
            {shorten(sequence.title, 26)}
          </button>
        ))}
      </nav>

      {list ? (
        <GraphList data={data} />
      ) : (
        <div className={"kg-body"}>
          <div className={"kg-canvas"} ref={boxRef} data-testid="graph-canvas">
            <svg
              ref={svgRef}
              className={"kg-svg"}
              role="group"
              aria-label="Knowledge graph. Expand a sequence, then open a note. A list view is also available."
              onPointerDown={onCanvasPointerDown}
              onPointerMove={onCanvasPointerMove}
              onPointerUp={onCanvasPointerUp}
              onPointerCancel={onCanvasPointerUp}
            >
              <g transform={`translate(${size.w / 2 + view.x} ${size.h / 2 + view.y}) scale(${view.k})`}>
                <g aria-hidden="true">
                  {edges.map((edge) => {
                    const from = pos(edge.from);
                    const to = pos(edge.to);
                    const dim = focusSet && !focusSet.has(edge.from) && !focusSet.has(edge.to);
                    return (
                      <line
                        key={edge.id}
                        x1={from.x}
                        y1={from.y}
                        x2={to.x}
                        y2={to.y}
                        className={["kg-link", edge.type === "dependency" ? "kg-dependency" : "", dim ? "kg-dim" : ""].join(" ")}
                      />
                    );
                  })}
                </g>
                {renderNodes.map((node) => {
                  const point = pos(node.id);
                  const isSelected = selectedId === node.id;
                  const dim = focusSet ? !focusSet.has(node.id) : false;
                  const labelVisible =
                    (node.kind === "sequence"
                      ? !compact || isSelected || hovered === node.id || expanded.includes(node.id)
                      : view.k >= 1.15) ||
                    isSelected ||
                    hovered === node.id ||
                    matchedIds.has(node.id);
                  const labelLines =
                    node.kind === "note" ? wrapTitle(node.note.title, 34) : [];
                  return (
                    <g
                      key={node.id}
                      ref={(element) => {
                        nodeRefs.current[node.id] = element;
                      }}
                      transform={`translate(${point.x} ${point.y})`}
                      role="button"
                      tabIndex={0}
                      aria-pressed={node.kind === "sequence" ? expanded.includes(node.id) : isSelected}
                      aria-label={ariaLabel(node)}
                      className={[
                        "kg-node",
                        node.kind === "sequence" ? "kg-sequence" : "kg-note",
                        isSelected ? "kg-selected" : "",
                        dim ? "kg-dim" : "",
                        matchedIds.has(node.id) ? "kg-match" : "",
                      ].join(" ")}
                      data-node-id={node.id}
                      data-node-kind={node.kind}
                      onPointerDown={(event) => onNodePointerDown(event, node.id)}
                      onKeyDown={(event) => onNodeKeyDown(event, node.id)}
                      onDoubleClick={() => {
                        if (node.kind === "note") focusNode(node.id);
                      }}
                      onMouseEnter={() => setHovered(node.id)}
                      onMouseLeave={() => setHovered((current) => (current === node.id ? null : current))}
                      onFocus={() => setHovered(node.id)}
                      onBlur={() => setHovered((current) => (current === node.id ? null : current))}
                    >
                      {node.kind === "sequence" ? (
                        <>
                          <circle r={15} className={"kg-sequenceHalo"} style={{ stroke: node.sequence.accent }} />
                          <circle r={8.5} className={"kg-dot"} />
                          {labelVisible ? (
                            <text
                              className={
                                selectedNote && selectedNote.sequenceId !== node.sequence.id
                                  ? "kg-labelSeq kg-labelMuted"
                                  : "kg-labelSeq"
                              }
                              y={26}
                              textAnchor="middle"
                            >
                              {wrapTitle(node.sequence.title, 28).map((line, lineIndex) => (
                                <tspan key={line} x={0} dy={lineIndex === 0 ? 0 : 14}>
                                  {lineIndex === 0 && wrapTitle(node.sequence.title, 28).length > 1 ? `${line} ` : line}
                                </tspan>
                              ))}
                            </text>
                          ) : null}
                        </>
                      ) : (
                        <>
                          <circle r={13} className={"kg-hit"} />
                          <circle r={4.5} className={"kg-dot"} />
                          {isSelected ? <circle r={8.5} className={"kg-selectRing"} /> : null}
                          {labelVisible && (isSelected || hovered === node.id) ? (
                            <rect
                              className={"kg-labelBg"}
                              x={-(Math.max(...labelLines.map((line) => line.length)) * 6.1 + 12) / 2}
                              y={4}
                              width={Math.max(...labelLines.map((line) => line.length)) * 6.1 + 12}
                              height={14 * labelLines.length + 8}
                              rx={5}
                            />
                          ) : null}
                          {labelVisible ? (
                            <text
                              className={"kg-label"}
                              y={16}
                              textAnchor="middle"
                            >
                              {labelLines.map((line, lineIndex) => (
                                <tspan key={line} x={0} dy={lineIndex === 0 ? 0 : 14}>
                                  {lineIndex === 0 && labelLines.length > 1 ? `${line} ` : line}
                                </tspan>
                              ))}
                            </text>
                          ) : null}
                        </>
                      )}
                    </g>
                  );
                })}
              </g>
            </svg>
            <div className={"kg-hud"}>
              <button type="button" aria-label="Zoom out" onClick={() => zoomAt(1 / 1.35, size.w / 2, size.h / 2)}>
                −
              </button>
              <button type="button" aria-label="Zoom in" onClick={() => zoomAt(1.35, size.w / 2, size.h / 2)}>
                +
              </button>
            </div>
            <p className={"kg-canvasHint"}>Drag to pan · scroll or pinch to zoom · Enter opens · double-click focuses</p>
          </div>

          <aside className={"kg-panel"} aria-label="Inspector">
            {selectedNote ? (
              <>
                <p className={"kg-eyebrow"}>
                  Sequence {sequences.get(selectedNote.sequenceId)?.number}
                </p>
                <h2 className={"kg-panelTitle"}>{selectedNote.title}</h2>
                <p className={"kg-meta"}>
                  Note {selectedNote.index} of {sequences.get(selectedNote.sequenceId)?.noteIds.length} ·{" "}
                  {selectedNote.coverage} content
                </p>
                <Link className={"kg-primaryLink"} href={selectedNote.href}>
                  Open the note
                </Link>
                <h3 className={"kg-sectionTitle"}>Objectives</h3>
                <ul className={"kg-bullets"}>
                  {selectedNote.objectives.map((objective) => (
                    <li key={objective}>{objective}</li>
                  ))}
                </ul>
                <h3 className={"kg-sectionTitle"}>Common misconception</h3>
                <p className={"kg-bodyText"}>{selectedNote.misconception}</p>
                <h3 className={"kg-sectionTitle"}>Recorded dependencies</h3>
                {selectedNote.prerequisites.length === 0 ? (
                  <p className={"kg-bodyText"}>None recorded for this note.</p>
                ) : (
                  <ul className={"kg-depList"}>
                    {selectedNote.prerequisites.map((prerequisite) => {
                      const target = notes.get(prerequisite);
                      return (
                        <li key={prerequisite}>
                          <button
                            type="button"
                            onClick={() => {
                              pushSnapshot();
                              setSelectedId(prerequisite);
                              centerOn(prerequisite);
                            }}
                          >
                            {target?.title ?? prerequisite}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <p className={"kg-hint"}>
                  Reviewed curriculum dependencies used to order teaching. They are not source-declared
                  links and not Atlas assertions.
                </p>
                <div className={"kg-panelActions"}>
                  <button type="button" onClick={() => focusNode(selectedNote.id)} aria-pressed={focusedId === selectedNote.id}>
                    {focusedId === selectedNote.id ? "Exit focus" : "Focus this note"}
                  </button>
                  <Link href={sequences.get(selectedNote.sequenceId)?.href ?? "/learn/statistics/"}>Open sequence</Link>
                </div>
              </>
            ) : selectedSequence ? (
              <>
                <p className={"kg-eyebrow"}>Sequence {selectedSequence.number}</p>
                <h2 className={"kg-panelTitle"}>{selectedSequence.title}</h2>
                <p className={"kg-question"}>{selectedSequence.question}</p>
                <p className={"kg-bodyText"}>{selectedSequence.summary}</p>
                <div className={"kg-panelActions"}>
                  <button type="button" onClick={() => toggleSequence(selectedSequence.id)}>
                    {expanded.includes(selectedSequence.id) ? "Collapse sequence" : "Expand sequence"}
                  </button>
                  <Link href={selectedSequence.href}>Open journey</Link>
                </div>
                <h3 className={"kg-sectionTitle"}>Declared order</h3>
                <p className={"kg-hint"}>This list is the sequence&apos;s own order. Graph distance carries no order.</p>
                <ol className={"kg-order"}>
                  {selectedSequence.noteIds.map((id) => {
                    const note = notes.get(id);
                    if (!note) return null;
                    return (
                      <li key={id}>
                        <button
                          type="button"
                          className={selectedId === id ? "kg-current" : undefined}
                          onClick={() => {
                            pushSnapshot();
                            setSelectedId(id);
                            centerOn(id);
                          }}
                        >
                          <span className={"kg-orderNumber"}>{note.index}</span>
                          {note.title}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </>
            ) : (
              <>
                <p className={"kg-eyebrow"}>Local graph</p>
                <h2 className={"kg-panelTitle"}>Start with a sequence</h2>
                <p className={"kg-bodyText"}>
                  Each sequence is an ordered curriculum journey. Expanding one reveals its notes and the
                  dependencies recorded between them; nothing else on the canvas moves.
                </p>
                <dl className={"kg-stats"}>
                  <div>
                    <dt>Sequences</dt>
                    <dd>{data.stats.sequences}</dd>
                  </div>
                  <div>
                    <dt>Notes</dt>
                    <dd>{data.stats.notes}</dd>
                  </div>
                  <div>
                    <dt>Dependencies</dt>
                    <dd>{data.stats.dependencies}</dd>
                  </div>
                </dl>
                <ul className={"kg-legend"}>
                  <li>
                    <span className={`${"kg-swatch"} ${"kg-swatchSequence"}`} aria-hidden="true" /> Sequence
                  </li>
                  <li>
                    <span className={`${"kg-swatch"} ${"kg-swatchNote"}`} aria-hidden="true" /> Note
                  </li>
                  <li>
                    <span className={`${"kg-swatchLine"}`} aria-hidden="true" /> Sequence membership
                  </li>
                  <li>
                    <span className={`${"kg-swatchLine"} ${"kg-swatchDashed"}`} aria-hidden="true" /> Recorded dependency
                  </li>
                </ul>
                <p className={"kg-hint"}>
                  The Atlas is not drawn here. Its public projection currently publishes zero concepts and zero
                  connections, and this prototype adds none.
                </p>
              </>
            )}
          </aside>
        </div>
      )}

      <p role="status" aria-live="polite" className="sr-only">
        {status}
      </p>
    </div>
  );
}

function GraphList({ data }: { data: GraphData }) {
  const notes = new Map(data.notes.map((note) => [note.id, note] as const));
  return (
    <section className={"kg-list"} aria-label="Knowledge graph as a list" data-testid="graph-list">
      <p className={"kg-listIntro"}>
        The same corpus without the canvas: each sequence in declared order, every note a link, every
        recorded dependency named. This is the equivalent accessible path.
      </p>
      {data.sequences.map((sequence) => (
        <details key={sequence.id} className={"kg-listGroup"} open>
          <summary>
            <span className={"kg-listSequence"}>
              {sequence.number}. {sequence.title}
            </span>
            <span className={"kg-listCount"}>{sequence.noteIds.length} notes</span>
          </summary>
          <p className={"kg-listQuestion"}>{sequence.question}</p>
          <ol className={"kg-listNotes"}>
            {sequence.noteIds.map((id) => {
              const note = notes.get(id)!;
              return (
                <li key={id}>
                  <div className={"kg-listNoteHead"}>
                    <Link href={note.href}>{note.title}</Link>
                    <span className={"kg-listMeta"}>
                      note {note.index} of {sequence.noteIds.length} · {note.coverage}
                    </span>
                  </div>
                  <p className={"kg-listObjective"}>{note.objectives[0]}</p>
                  {note.prerequisites.length > 0 ? (
                    <p className={"kg-listMeta"}>
                      Depends on:{" "}
                      {note.prerequisites
                        .map((prerequisite) => notes.get(prerequisite)?.title ?? prerequisite)
                        .join("; ")}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </details>
      ))}
      <p className={"kg-hint"}>
        Dependencies above are the reviewed curriculum order, not Atlas relations. The public Atlas graph
        remains 0 published concepts and 0 published connections.
      </p>
    </section>
  );
}
