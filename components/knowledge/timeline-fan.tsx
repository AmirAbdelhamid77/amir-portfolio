"use client";
// The desktop timeline fan (R3). Loaded only when the review flag is on, so the
// public Home never downloads its JS or CSS. The pure geometry lives in
// `lib/knowledge/timeline-fan.ts`; this file owns the DOM and the gesture.

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { StageModel, TimelineDay } from "@/lib/knowledge/stage-model";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  editionOrdinals,
  fanCardScale,
  fanCardX,
  fanDayParts,
  fanGeometry,
  fanPositionAt,
  nearestEditionIndex,
} from "@/lib/knowledge/timeline-fan";
import "./stage-fan.css";

/* -------------------------------------------------------------------- the fan */
// The prototype's beUI timeline: one clipped plane, the selected card in the
// centre, neighbours stepped and scaled, cables to both stage edges, a ruler in
// the gaps and the year behind everything. Selection stays the parent's state;
// this component only owns the position of the paper while it is being dragged.

type DragState = {
  id: number;
  startX: number;
  start: number;
  position: number;
  moved: boolean;
  lastX: number;
  lastTime: number;
  previousX: number;
  previousTime: number;
};

type TimelineFanProps = {
  model: StageModel;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onOpenDealer: () => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function TimelineFan({ model, selectedId, onSelect, onOpenDealer }: TimelineFanProps) {
  const hintId = useId();
  const { days, editions, latestEditionId } = model.timeline;
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<string, HTMLButtonElement>());
  const drag = useRef<DragState | null>(null);
  const suppressClick = useRef(false);
  const settleTimer = useRef<number | null>(null);
  const frame = useRef<number | null>(null);
  const pending = useRef<number | null>(null);
  const [size, setSize] = useState({ width: 1200, height: 388 });
  const [free, setFree] = useState<number | null>(null);

  const geometry = useMemo(() => fanGeometry(size.width), [size.width]);
  const ordinals = useMemo(() => editionOrdinals(editions), [editions]);
  const editionIndexes = useMemo(
    () => days.flatMap((day, index) => (day.editionId ? [index] : [])),
    [days],
  );
  const selectedIndex = Math.max(
    0,
    days.findIndex((day) => day.editionId === selectedId),
  );
  const rovingId = days[selectedIndex]?.editionId ?? editions[0]?.id ?? null;
  const editionPosition = editionIndexes.findIndex(
    (index) => days[index]?.editionId === selectedId,
  );
  const canStepNewer = editionPosition > 0;
  const canStepOlder = editionPosition >= 0 && editionPosition < editionIndexes.length - 1;
  const position = free ?? selectedIndex;
  const placements = days.map((_, index) => fanPositionAt(index, position, geometry));
  const year = model.today.slice(0, 4);
  const first = fanDayParts(days[0]?.dayLabel ?? "", days[0]?.date ?? "");
  const last = fanDayParts(
    days[days.length - 1]?.dayLabel ?? "",
    days[days.length - 1]?.date ?? "",
  );
  const selectedIsLatest = Boolean(selectedId) && selectedId === latestEditionId;
  const ordinal = selectedId ? ordinals.get(selectedId) : null;
  const focusLabel = selectedIsLatest
    ? "Latest edition"
    : ordinal
      ? `Edition ${String(ordinal).padStart(2, "0")}`
      : "Edition";

  // The stage is measured once and on resize. Until then the server's 1200 px
  // geometry keeps the fan coherent, and the stage has a fixed height, so this
  // cannot shift the page (no CLS).
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const measure = () => {
      const rect = node.getBoundingClientRect();
      setSize((previous) =>
        Math.abs(previous.width - rect.width) < 0.5 && Math.abs(previous.height - rect.height) < 0.5
          ? previous
          : { width: rect.width, height: rect.height },
      );
    };
    measure();
    if (!("ResizeObserver" in window)) return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(
    () => () => {
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    },
    [],
  );

  // Horizontal wheel and trackpad swipes move the deck; vertical wheel is left to
  // the page. React's wheel listener is passive, so this binds natively.
  const wheelState = useRef({ free, selectedIndex, step: geometry.step, count: days.length });
  wheelState.current = { free, selectedIndex, step: geometry.step, count: days.length };
  useEffect(() => {
    const node = stage.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      const current = wheelState.current;
      const base = current.free ?? current.selectedIndex;
      const next = clamp(base + event.deltaX / current.step, -0.3, current.count - 1 + 0.3);
      setFree(next);
      if (settleTimer.current) window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => settle(next), 140);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
    // `settle` is a stable closure over the current render's props.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, selectedId]);

  function settle(target: number) {
    setFree(null);
    const index = nearestEditionIndex(editionIndexes, target);
    const day = index === null ? null : days[index];
    if (!day?.editionId) return;
    if (day.editionId !== selectedId) onSelect(day.editionId);
    // A drag or wheel that started after keyboard use must not leave the focus
    // ring on the card the reader just moved away from.
    if (stage.current?.contains(document.activeElement)) focusEdition(day.editionId);
  }

  function focusEdition(id: string) {
    requestAnimationFrame(() => cards.current.get(id)?.focus());
  }

  function move(delta: number) {
    const current = editionIndexes.findIndex((index) => days[index]?.editionId === selectedId);
    const nextIndex = editionIndexes[clamp(current + delta, 0, editionIndexes.length - 1)];
    const id = nextIndex === undefined ? null : days[nextIndex]?.editionId ?? null;
    if (!id) return;
    onSelect(id);
    focusEdition(id);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, day: TimelineDay) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const index = event.key === "Home" ? editionIndexes[0] : editionIndexes[editionIndexes.length - 1];
      const id = index === undefined ? null : days[index]?.editionId ?? null;
      if (!id) return;
      onSelect(id);
      focusEdition(id);
      return;
    }
    if (event.key === "Enter" && day.editionId && day.editionId === selectedId) {
      event.preventDefault();
      onOpenDealer();
    }
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if ((event.target as HTMLElement).closest("a, input, textarea, select")) return;
    drag.current = {
      id: event.pointerId,
      startX: event.clientX,
      start: position,
      position,
      moved: false,
      lastX: event.clientX,
      lastTime: performance.now(),
      previousX: event.clientX,
      previousTime: performance.now(),
    };
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state || event.pointerId !== state.id) return;
    const dx = event.clientX - state.startX;
    if (!state.moved) {
      if (Math.abs(dx) < 4) return;
      state.moved = true;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        /* Pointer capture is an enhancement. */
      }
    }
    const raw = state.start - dx / geometry.step;
    const max = days.length - 1;
    const value = raw < 0 ? raw * 0.3 : raw > max ? max + (raw - max) * 0.3 : raw;
    state.position = value;
    state.previousX = state.lastX;
    state.previousTime = state.lastTime;
    state.lastX = event.clientX;
    state.lastTime = performance.now();
    pending.current = value;
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (pending.current !== null) {
        setFree(pending.current);
        pending.current = null;
      }
    });
  }

  function endDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state || event.pointerId !== state.id) return;
    drag.current = null;
    if (!state.moved) return;
    suppressClick.current = true;
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 260);
    const dt = state.lastTime - state.previousTime;
    const velocity = dt > 0 ? (state.lastX - state.previousX) / dt : 0;
    const perSecond = (-velocity * 1000) / geometry.step;
    const projected = state.position + clamp(perSecond * 0.3, -4, 4);
    settle(projected);
  }

  function selectDay(day: TimelineDay) {
    if (suppressClick.current) return;
    if (!day.editionId) return;
    if (day.editionId !== selectedId) onSelect(day.editionId);
  }

  return (
    <>
      <div
        ref={stage}
        className="stage-fan"
        data-dragging={free !== null ? "true" : "false"}
        style={
          {
            "--fan-card-width": `${geometry.cardWidth}px`,
            "--fan-card-height": `${geometry.cardHeight}px`,
          } as CSSProperties
        }
        role="group"
        aria-label="Editions timeline"
        aria-describedby={hintId}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <p id={hintId} className="sr-only">
          Fifteen days, newest first, with the selected edition in the centre. Use
          the left and right arrow keys to move between editions, Home for the
          newest, and Enter to open the selected edition. Dragging and horizontal
          scrolling move the fan.
        </p>

        <div className="stage-fan-ghost" aria-hidden="true">
          {year}
        </div>
        <svg
          className="stage-fan-cables"
          viewBox={`0 0 ${size.width} ${size.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {days.map((day, index) => {
            const placement = placements[index];
            const opacity = clamp((1.6 - Math.abs(placement.offset)) / 0.6, 0, 1);
            if (opacity <= 0.001) return null;
            const x = size.width / 2 + placement.x;
            const reach = (geometry.cardWidth / 2) * placement.scale * 0.8;
            const y = size.height * 0.5;
            return (
              <g
                key={day.date}
                className={
                  index === selectedIndex ? "stage-fan-cable is-active" : "stage-fan-cable"
                }
                opacity={opacity}
              >
                <line x1={size.width / 2} y1={0} x2={x - reach} y2={y} />
                <line x1={size.width / 2} y1={0} x2={x + reach} y2={y} />
                <line x1={size.width / 2} y1={size.height} x2={x - reach} y2={y} />
                <line x1={size.width / 2} y1={size.height} x2={x + reach} y2={y} />
              </g>
            );
          })}
        </svg>
        <div className="stage-fan-playhead" aria-hidden="true">
          <span />
        </div>
        <div className="stage-fan-focus" aria-hidden="true">
          <span>{focusLabel}</span>
          <span className="stage-fan-focus-rule" />
        </div>

        <ol className="stage-fan-track" aria-label="Dates in the daily edition timeline">
          {days.map((day, index) => {
            const placement = placements[index];
            const active = Boolean(day.editionId) && day.editionId === selectedId;
            const parts = fanDayParts(day.dayLabel, day.date);
            const status = day.reviewStatus
              ? day.reviewStatus === "published"
                ? "Published"
                : "In review"
              : day.isToday
                ? "No edition today"
                : "Quiet day";
            const tag = day.editionId
              ? `ED ${String(ordinals.get(day.editionId) ?? 0).padStart(2, "0")}`
              : day.isToday
                ? "TODAY"
                : "QUIET";
            const style = {
              "--fan-x": `${placement.x.toFixed(2)}px`,
              "--fan-scale": placement.scale.toFixed(3),
              "--fan-z": String(placement.z),
              "--fan-opacity": placement.opacity.toFixed(3),
            } as CSSProperties;
            const content = (
              <>
                <span className="stage-fan-card-top">
                  <span className="stage-fan-weekday">{parts.weekday}</span>
                  <span className="stage-fan-tag">{tag}</span>
                </span>
                <span className="stage-fan-date">
                  <span className="stage-fan-day">{parts.day}</span>
                  <span className="stage-fan-month">{parts.month}</span>
                </span>
                <span className="stage-fan-title">
                  {day.editionTitle ?? (day.isToday ? "No edition today" : "No edition")}
                </span>
                <span className="stage-fan-stack" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </span>
                <span className="stage-fan-foot">
                  <span className="stage-fan-dot" aria-hidden="true" />
                  {status}
                </span>
                {day.isToday ? <span className="sr-only">Today</span> : null}
              </>
            );

            if (!day.editionId) {
              return (
                <li
                  key={day.date}
                  className="stage-fan-item"
                  data-has-edition="false"
                  data-today={day.isToday ? "true" : "false"}
                >
                  <span
                    className="stage-fan-card is-quiet"
                    style={style}
                    data-today={day.isToday ? "true" : "false"}
                  >
                    {content}
                  </span>
                </li>
              );
            }

            return (
              <li
                key={day.date}
                className="stage-fan-item"
                data-has-edition="true"
                data-selected={active ? "true" : "false"}
                data-today={day.isToday ? "true" : "false"}
              >
                <button
                  ref={(node) => {
                    if (node) cards.current.set(day.editionId as string, node);
                  }}
                  type="button"
                  aria-current={active ? "date" : undefined}
                  aria-pressed={active}
                  tabIndex={day.editionId === rovingId ? 0 : -1}
                  className="stage-fan-card"
                  style={style}
                  data-current={active ? "true" : "false"}
                  data-latest={day.editionId === latestEditionId ? "true" : "false"}
                  data-today={day.isToday ? "true" : "false"}
                  onClick={() => selectDay(day)}
                  onKeyDown={(event) => onKeyDown(event, day)}
                >
                  {content}
                </button>
              </li>
            );
          })}
        </ol>

        <div className="stage-fan-ruler" aria-hidden="true">
          {days.slice(0, -1).map((day, gapIndex) =>
            [0, 1, 2, 3, 4].map((tick) => {
              const offsetA = gapIndex - position;
              const offsetB = gapIndex + 1 - position;
              const right =
                fanCardX(offsetA, geometry) + (geometry.cardWidth * fanCardScale(offsetA)) / 2;
              const left =
                fanCardX(offsetB, geometry) - (geometry.cardWidth * fanCardScale(offsetB)) / 2;
              const gapWidth = left - right;
              if (gapWidth < 10) return null;
              const spacing = (gapWidth * 0.7) / 4;
              const x = size.width / 2 + (right + left) / 2 + (tick - 2) * spacing;
              if (x < -24 || x > size.width + 24) return null;
              return (
                <span
                  key={`${day.date}-${tick}`}
                  className={tick === 2 ? "stage-fan-tick is-tall" : "stage-fan-tick"}
                  style={{ left: `${x.toFixed(2)}px` }}
                />
              );
            }),
          )}
          <span className="stage-fan-caption start">
            {[first.day, first.month].filter(Boolean).join(" ")}
          </span>
          <span className="stage-fan-caption end">
            {[last.day, last.month].filter(Boolean).join(" ")}
          </span>
        </div>
      </div>
      <p className="stage-fan-status">
        <span>
          {editions.length} edition{editions.length === 1 ? "" : "s"}
        </span>
        <span aria-hidden="true" className="stage-fan-status-sep">
          ·
        </span>
        <span>
          {days.length - editions.length} quiet day{days.length - editions.length === 1 ? "" : "s"}
        </span>
        <span aria-hidden="true" className="stage-fan-status-sep">
          ·
        </span>
        <span>{days.length} days in the review clock</span>
        <span aria-hidden="true" className="stage-fan-status-sep">
          ·
        </span>
        <span>
          {model.graph.publishedEdges} published connection
          {model.graph.publishedEdges === 1 ? "" : "s"}
        </span>
        <span className="stage-fan-steppers" role="group" aria-label="Move between editions">
          <button
            type="button"
            aria-label="Previous edition"
            onClick={() => move(-1)}
            disabled={!canStepNewer}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next edition"
            onClick={() => move(1)}
            disabled={!canStepOlder}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </span>
      </p>
    </>
  );
}
