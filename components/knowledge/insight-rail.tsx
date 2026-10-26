"use client";
// Adapted from BeUI's Timeline — https://beui.dev/components/motion/timeline,
// registry source https://beui.dev/r/timeline.json (retrieved 2026-10-26).
//
// Kept: measured geometry, controlled identity, track motion value, neighbour
// scale and veil, gap ticks, the release spring, drag threshold, rubber band,
// flick projection, capture on drag, horizontal wheel, and the arrow-key tab
// stop. Removed for the condensed rail: media cards, year numerals, cables and
// the full-height stage. See docs/prototype-c/v2/COMPONENT_MAPPING.md.

import {
  animate,
  type AnimationPlaybackControls,
  motion,
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { capturePointer, releasePointer, TOUCH_GESTURE_CLASS } from "@/lib/touch";
import { STAGE_RAIL_GLIDE } from "@/lib/knowledge/motion";
import { cn } from "@/lib/utils";

const FLICK_MOMENTUM = 0.3;
const MAX_FLICK_EVENTS = 2;
const DRAG_THRESHOLD = 4;
const RUBBER_BAND = 0.3;
// Neighbours stay legible at this size; upstream's 0.72 makes a date unreadable
// in a 12px label, which the design spec forbids.
const SIDE_SCALE = 0.92;
const SIDE_DIM = 0.5;
const GAP_TICKS = 3;
const TICK_SHORT = 0.06;
const TICK_TALL = 0.1;

export type RailEvent = {
  id: string;
  /** Display date, formatted by the caller. */
  date: string;
  /** ISO date for the <time> element. */
  iso: string;
  title: string;
  badge?: string;
};

export type InsightRailProps = {
  events: RailEvent[];
  value: string;
  onValueChange: (id: string) => void;
  itemWidth?: number;
  height?: number;
  /** Rendered above the rail; a quiet label for screen readers and sighted users. */
  label?: string;
  className?: string;
};

type Geometry = {
  step: number;
  cardWidth: number;
  near: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cardX(offset: number, geometry: Geometry) {
  const distance = Math.abs(offset);
  return (
    Math.sign(offset) *
    (distance <= 1
      ? distance * geometry.near
      : geometry.near + (distance - 1) * geometry.step)
  );
}

function cardScale(offset: number) {
  return 1 - (1 - SIDE_SCALE) * Math.min(Math.abs(offset), 1);
}

export function InsightRail({
  events,
  value,
  onValueChange,
  itemWidth = 208,
  height = 104,
  label = "Insight editions",
  className,
}: InsightRailProps) {
  const reduce = useReducedMotion() ?? false;
  const hintId = useId();
  const count = events.length;
  const last = Math.max(0, count - 1);
  const found = events.findIndex((event) => event.id === value);
  const activeIndex = found === -1 ? 0 : found;

  const stageRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    setWidth(element.clientWidth);
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const stageWidth = width || 760;
  // A phone shows one readable edition, not three truncated chips. The arrows
  // overlay the rail from 640px down, so the chip can use most of the width.
  const cardWidth = Math.min(
    itemWidth,
    stageWidth * (stageWidth < 480 ? 0.74 : stageWidth < 640 ? 0.58 : 0.32),
  );
  const gap = clamp(cardWidth * 0.26, 22, 54);
  const geometry: Geometry = {
    step: cardWidth * SIDE_SCALE + gap,
    cardWidth,
    near: (cardWidth * (1 + SIDE_SCALE)) / 2 + gap,
  };

  const scroll = useMotionValue(activeIndex);
  const glideRef = useRef<AnimationPlaybackControls | null>(null);
  const glidingRef = useRef(false);
  const draggingRef = useRef(false);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const latest = useRef({ events, activeIndex, onValueChange, last });
  useLayoutEffect(() => {
    latest.current = { events, activeIndex, onValueChange, last };
  });

  const commit = useCallback((index: number) => {
    const current = latest.current;
    const event = current.events[index];
    if (!event || index === current.activeIndex) return;
    current.activeIndex = index;
    current.onValueChange(event.id);
  }, []);

  const stopGlide = useCallback(() => {
    glidingRef.current = false;
    glideRef.current?.stop();
    glideRef.current = null;
  }, []);

  const glideTo = useCallback(
    (to: number, velocity = scroll.getVelocity()) => {
      stopGlide();
      const target = clamp(to, 0, latest.current.last);
      commit(target);
      if (reduce) {
        scroll.set(target);
        return;
      }
      glidingRef.current = true;
      glideRef.current = animate(scroll, target, {
        type: "spring",
        ...STAGE_RAIL_GLIDE,
        velocity,
        restDelta: 0.001,
        onComplete: () => {
          glidingRef.current = false;
          glideRef.current = null;
        },
      });
    },
    [commit, reduce, scroll, stopGlide],
  );

  // Follow a value chosen elsewhere (archive permalink, Back/Forward).
  useEffect(() => {
    if (draggingRef.current || glidingRef.current) return;
    if (clamp(Math.round(scroll.get()), 0, last) === activeIndex) return;
    glideTo(activeIndex, 0);
  }, [activeIndex, last, glideTo, scroll]);

  const step = useCallback(
    (delta: number, focus = false) => {
      const target = clamp(activeIndex + delta, 0, last);
      glideTo(target);
      if (focus) buttonsRef.current[target]?.focus({ preventScroll: true });
    },
    [activeIndex, glideTo, last],
  );

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
      const next =
        event.key === "ArrowRight"
          ? index + 1
          : event.key === "ArrowLeft"
            ? index - 1
            : event.key === "Home"
              ? 0
              : event.key === "End"
                ? last
                : null;
      if (next === null) return;
      event.preventDefault();
      const target = clamp(next, 0, last);
      glideTo(target);
      buttonsRef.current[target]?.focus({ preventScroll: true });
    },
    [glideTo, last],
  );

  const drag = useRef({
    id: -1,
    startX: 0,
    startScroll: 0,
    moved: false,
    lastX: 0,
    lastT: 0,
    prevX: 0,
    prevT: 0,
  });

  const onPointerDown = (event: ReactPointerEvent) => {
    if (event.button !== 0) return;
    stopGlide();
    const now = performance.now();
    drag.current = {
      id: event.pointerId,
      startX: event.clientX,
      startScroll: scroll.get(),
      moved: false,
      lastX: event.clientX,
      lastT: now,
      prevX: event.clientX,
      prevT: now,
    };
    draggingRef.current = true;
  };

  const onPointerMove = (event: ReactPointerEvent) => {
    const current = drag.current;
    if (!draggingRef.current || event.pointerId !== current.id) return;
    const dx = event.clientX - current.startX;
    if (!current.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      current.moved = true;
      // Capture only once it is a drag, so a plain press still clicks the chip.
      capturePointer(event.currentTarget, event.pointerId);
    }
    const raw = current.startScroll - dx / geometry.step;
    scroll.set(
      raw < 0
        ? raw * RUBBER_BAND
        : raw > last
          ? last + (raw - last) * RUBBER_BAND
          : raw,
    );
    current.prevX = current.lastX;
    current.prevT = current.lastT;
    current.lastX = event.clientX;
    current.lastT = performance.now();
  };

  const onPointerUp = (event: ReactPointerEvent) => {
    const current = drag.current;
    if (!draggingRef.current || event.pointerId !== current.id) return;
    draggingRef.current = false;
    if (!current.moved) return;
    releasePointer(event.currentTarget, event.pointerId);
    const dt = current.lastT - current.prevT;
    const pxPerMs = dt > 0 ? (current.lastX - current.prevX) / dt : 0;
    const velocity = (-pxPerMs * 1000) / geometry.step;
    const projected =
      scroll.get() + clamp(velocity * FLICK_MOMENTUM, -MAX_FLICK_EVENTS, MAX_FLICK_EVENTS);
    glideTo(Math.round(projected), velocity);
  };

  // Horizontal wheel/trackpad moves the rail; vertical wheel stays with the page.
  useEffect(() => {
    const element = stageRef.current;
    if (!element) return;
    let settleTimer: number | undefined;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      stopGlide();
      scroll.set(clamp(scroll.get() + event.deltaX / geometry.step, -0.3, last + 0.3));
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(
        () => glideTo(Math.round(scroll.get()), 0),
        140,
      );
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      element.removeEventListener("wheel", onWheel);
      window.clearTimeout(settleTimer);
    };
  }, [geometry.step, glideTo, last, scroll, stopGlide]);

  useEffect(() => stopGlide, [stopGlide]);

  return (
    <div className={cn("relative flex items-center", className)}>
      <RailArrow
        direction="prev"
        disabled={activeIndex <= 0}
        onClick={() => step(-1)}
      />
      <div
        className="relative min-w-0 flex-1 px-0 sm:px-0"
        role="group"
        aria-label={label}
        aria-describedby={hintId}
      >
        <p id={hintId} className="sr-only">
          Use the left and right arrow keys to move between editions. Dragging
          the rail also works, and every edition has a permalink in the archive.
        </p>
        <div
          ref={stageRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn(
            "relative w-full cursor-grab touch-pan-y overscroll-x-contain active:cursor-grabbing",
            "[clip-path:inset(0)] [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]",
            TOUCH_GESTURE_CLASS,
          )}
          style={{ height }}
        >
          {/* The socket the active chip lands in. It stays put; the chips and
              ticks travel through it, so the focused edition always reads from
              the same place. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-primary/25 bg-[linear-gradient(180deg,color-mix(in_oklch,var(--primary)_12%,transparent),transparent_70%)]"
            style={{ width: cardWidth + 20, height: height - 12 }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent"
          />
          {events.slice(0, -1).map((event, index) => (
            <GapTicks
              key={event.id}
              scroll={scroll}
              index={index}
              geometry={geometry}
              gap={gap}
            />
          ))}
          <ul className="absolute inset-0">
            {events.map((event, index) => (
              <RailChip
                key={event.id}
                event={event}
                index={index}
                scroll={scroll}
                geometry={geometry}
                active={index === activeIndex}
                onSelect={glideTo}
                onKeyDown={onKeyDown}
                buttonRef={(node) => {
                  buttonsRef.current[index] = node;
                }}
              />
            ))}
          </ul>
        </div>
      </div>
      <RailArrow
        direction="next"
        disabled={activeIndex >= last}
        onClick={() => step(1)}
      />
    </div>
  );
}

function RailChip({
  event,
  index,
  scroll,
  geometry,
  active,
  onSelect,
  onKeyDown,
  buttonRef,
}: {
  event: RailEvent;
  index: number;
  scroll: MotionValue<number>;
  geometry: Geometry;
  active: boolean;
  onSelect: (index: number) => void;
  onKeyDown: (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
}) {
  const id = useId();
  const { cardWidth } = geometry;
  const offset = useTransform(scroll, (value) => index - value);
  const x = useTransform(offset, (value) => cardX(value, geometry));
  const scale = useTransform(offset, cardScale);
  const zIndex = useTransform(offset, (value) => 100 - Math.round(Math.abs(value) * 10));
  const veilOpacity = useTransform(offset, (value) => SIDE_DIM * Math.min(Math.abs(value), 1));

  return (
    <motion.li
      className="absolute left-1/2 top-1/2"
      style={{
        x,
        scale,
        zIndex,
        width: cardWidth,
        marginLeft: -cardWidth / 2,
        y: "-50%",
      }}
    >
      <div className="relative">
        <div className="relative overflow-hidden rounded-[18px] border border-border-strong bg-card px-3.5 py-2.5 shadow-[0_1px_0_0_rgb(255_255_255/0.06)_inset,0_14px_30px_-22px_rgb(0_0_0/0.7)]">
          <time
            id={`${id}-date`}
            dateTime={event.iso}
            className="block font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground tabular-nums"
          >
            {event.date}
          </time>
          <h3
            id={`${id}-title`}
            className="mt-1 line-clamp-2 text-[13px] font-medium leading-tight tracking-tight text-foreground"
          >
            {event.title}
          </h3>
          {event.badge ? (
            <p className="mt-1 truncate text-[10px] uppercase tracking-[0.12em] text-primary">
              {event.badge}
            </p>
          ) : null}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-background"
            style={{ opacity: veilOpacity }}
          />
        </div>
        <button
          ref={buttonRef}
          type="button"
          tabIndex={active ? 0 : -1}
          aria-current={active ? "date" : undefined}
          aria-labelledby={`${id}-date ${id}-title`}
          onClick={() => onSelect(index)}
          onKeyDown={(event) => onKeyDown(event, index)}
          className="absolute inset-0 cursor-pointer rounded-[18px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        />
      </div>
    </motion.li>
  );
}

function GapTicks({
  scroll,
  index,
  geometry,
  gap,
}: {
  scroll: MotionValue<number>;
  index: number;
  geometry: Geometry;
  gap: number;
}) {
  const { cardWidth } = geometry;
  const x = useTransform(scroll, (value) => {
    const offset = index - value;
    const right = cardX(offset, geometry) + (cardWidth * cardScale(offset)) / 2;
    const left =
      cardX(offset + 1, geometry) - (cardWidth * cardScale(offset + 1)) / 2;
    return (right + left) / 2;
  });
  const spacing = (gap * 0.6) / (GAP_TICKS - 1);
  return (
    <motion.div
      aria-hidden="true"
      className="absolute left-1/2 top-1/2 flex -translate-x-1/2 items-center"
      style={{ x, gap: spacing - 1, y: "-50%" }}
    >
      {Array.from({ length: GAP_TICKS }, (_, tick) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative ticks
          key={tick}
          className={cn(
            "block w-px rounded-full",
            tick === (GAP_TICKS - 1) / 2 ? "bg-foreground/35" : "bg-foreground/20",
          )}
          style={{
            height:
              cardWidth *
              (tick === (GAP_TICKS - 1) / 2 ? TICK_TALL : TICK_SHORT),
          }}
        />
      ))}
    </motion.div>
  );
}

function RailArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  const isPrev = direction === "prev";
  return (
    <button
      type="button"
      aria-label={isPrev ? "Newer edition" : "Older edition"}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-border-strong bg-background/90 text-muted-foreground backdrop-blur transition-colors",
        "hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        "sm:static sm:translate-y-0 sm:backdrop-blur-none",
        "disabled:pointer-events-none disabled:opacity-35",
        isPrev ? "left-0" : "right-0",
      )}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
        <path d={isPrev ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
