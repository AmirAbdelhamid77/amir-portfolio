// Stage motion tokens for Prototype C. They extend — not replace — lib/ease.ts,
// so the rest of the site keeps using the shared curves. Values are the
// starting points from docs/prototype-c-direction-v2/DESIGN_AND_MOTION_SPEC.md
// §3; they were re-tuned against real text while building the stage.
import type { Transition } from "motion/react";
import { EASE_OUT } from "@/lib/ease";

/** Button press and border/ink acknowledgement. */
export const STAGE_FEEDBACK: Transition = { duration: 0.12, ease: EASE_OUT };

/** Rail label / metadata swap: out fast, in settled. */
export const STAGE_LABEL: Transition = { duration: 0.18, ease: EASE_OUT };

/** Scenario → explanation; the outer shell opens, glyphs never scale. */
export const STAGE_REVEAL: Transition = { duration: 0.32, ease: EASE_OUT };

/** A card's surface opening into its reader. */
export const STAGE_INSPECT: Transition = { duration: 0.38, ease: EASE_OUT };

/** Deck → hand arc flight. Tuned to settle in roughly 500ms. */
export const STAGE_FLIGHT: Transition = {
  type: "spring",
  visualDuration: 0.5,
  bounce: 0.16,
};

/** Slots trading places inside the hand: a hop, not a flight. */
export const STAGE_HOP: Transition = {
  type: "spring",
  visualDuration: 0.34,
  bounce: 0.18,
};

/** Rail release: initial stiffness/damping inspected from the upstream timeline. */
export const STAGE_RAIL_GLIDE = {
  stiffness: 120,
  damping: 24,
  mass: 1,
} as const;

/**
 * One reconciled duration for reduced motion. Movement is removed; a short
 * opacity change is kept so the state change is still legible.
 */
export const REDUCED_TRANSITION: Transition = { duration: 0.1, ease: EASE_OUT };
