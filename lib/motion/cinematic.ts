// One motion language for the three acts.
//
// The landing used to carry its animation values inside each component. Acts I
// to III need to feel like one camera, so the values now live here and the
// components import them. Durations are in seconds; distances in CSS pixels
// unless a name says otherwise.
//
// `prefers-reduced-motion` is an *alternative* branch, not the default: the
// standard experience below is the designed one, and the reduced branch is
// derived from the same tokens with the travel removed.

export const CINEMATIC = {
  /** Act-to-act camera travel, in vh of scroll. */
  act: {
    handoff: 120,
    atlas: 260,
  },
  duration: {
    entry: 0.72,
    entrySlow: 1.05,
    settle: 0.42,
    feedback: 0.14,
    mask: 0.86,
    morph: 0.64,
  },
  stagger: {
    tight: 0.055,
    base: 0.085,
    wide: 0.13,
    editorial: 0.16,
  },
  /** Depth understanding, not decoration: near planes lead the eye. */
  depth: {
    near: 1,
    mid: 0.82,
    far: 0.62,
    perspective: 1400,
  },
  ease: {
    // Cubic-bezier strings for CSS, arrays for Motion.
    out: "cubic-bezier(0.16, 1, 0.3, 1)",
    inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
    settle: "cubic-bezier(0.22, 1, 0.36, 1)",
    spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    outArray: [0.16, 1, 0.3, 1] as [number, number, number, number],
    settleArray: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
  spring: {
    light: { stiffness: 210, damping: 26, mass: 0.7 },
    card: { stiffness: 150, damping: 20, mass: 0.9 },
    camera: { stiffness: 60, damping: 22, mass: 1.1 },
  },
  /** Pointer response limits so a hand tremor never tips a card over. */
  pointer: {
    tilt: 7,
    magnetic: 12,
    light: 10,
  },
} as const;

/** Inline style object for a stagger delay. */
export function staggerDelay(order: number, interval = CINEMATIC.stagger.base) {
  return { transitionDelay: `${(order * interval).toFixed(3)}s` };
}
