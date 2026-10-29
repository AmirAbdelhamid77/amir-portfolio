"use client";
// One rAF-throttled scroll reading per act. Three acts use it, so there are at
// most three listeners on the page; none reads layout more than once per frame
// and all are passive. `pinned` measures a tall section that carries a sticky
// stage, `leave` measures the first viewport of travel (the hero), and `enter`
// measures ordinary content crossing the viewport.
//
// A reading is deliberately NOT React state. An earlier version returned a
// number through `useState`, which re-rendered the whole three-act stage on
// every scroll frame: measured as 130-380ms main-thread tasks at 390px on a
// 4x-throttled CPU. The reading is now a stable object whose `current` is read
// straight from the rAF loop, and subscribers receive plain callbacks, so a
// scroll frame costs one style write instead of a React render.

import { type RefObject, useEffect, useState } from "react";

export type ProgressMode = "pinned" | "enter" | "leave";

export type ScrollReading = {
  /** Latest 0..1 progress. Safe to read inside a rAF loop. */
  readonly current: number;
  /** Called on the same frame the reading changes. Returns an unsubscribe. */
  subscribe: (listener: (value: number) => void) => () => void;
};

/** A reading that never changes: used where motion is intentionally static. */
export function staticReading(value: number): ScrollReading {
  return { current: value, subscribe: () => () => {} };
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
// Fine enough to look continuous in a transform, coarse enough that a resting
// page produces no writes.
const quantize = (value: number) => Math.round(value * 2000) / 2000;

/**
 * The reading is a closure, not a ref: the mutable value lives outside React, so
 * a component can read `current` during render without touching a ref and
 * without subscribing to a render.
 */
function createReading() {
  let value = 0;
  const listeners = new Set<(value: number) => void>();
  const reading: ScrollReading = {
    get current() {
      return value;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
  return {
    reading,
    /** Publish a new value to every subscriber on the current frame. */
    publish(next: number) {
      if (Math.abs(next - value) < 0.0005) return;
      value = next;
      for (const listener of listeners) listener(next);
    },
  };
}

export function useScrollProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  mode: ProgressMode = "pinned",
): ScrollReading {
  const [store] = useState(createReading);

  useEffect(() => {
    const read = () => {
      const element = ref.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      // `pinned` is only meaningful when the section is actually taller than the
      // viewport. A short pinned section (stacked mobile layout, or a very tall
      // window) silently falls back to the "enter" reading instead of dividing
      // by a negative travel distance.
      const travelling = rect.height > viewport * 1.35;
      const next =
        mode === "pinned" && travelling
          ? clamp01(-rect.top / Math.max(rect.height - viewport, 1))
          : mode === "leave"
            ? clamp01(-rect.top / viewport)
            : clamp01((viewport - rect.top) / (viewport + rect.height));
      // Listeners run inside the same rAF, before the frame's style pass, so a
      // write here lands in this frame rather than the next one.
      store.publish(quantize(next));
    };

    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        read();
      });
    };

    read();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [mode, ref, store]);

  return store.reading;
}
