"use client";

// Depth transition for the Day and Insight layers (redesign plan §7): the
// incoming layer fades in and settles 4px down-up over --dur-layer, starting
// 25ms after mount; reduced motion gets opacity only at 120ms. The outgoing
// layer's recede happens on real navigation (static export), where the
// browser's own back/forward handles it. Mount first, add the active class
// one frame later — otherwise the browser skips the transition.

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

export function LayerShell({ children, labelledBy }: { children: ReactNode; labelledBy?: string }) {
  const reduce = useReducedMotion() ?? false;
  const [active, setActive] = useState(false);
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setActive(true));
    document.body.dataset.homeV2 = "true";
    return () => {
      window.cancelAnimationFrame(id);
      delete document.body.dataset.homeV2;
    };
  }, []);
  return (
    <AnimatePresence initial={true}>
      <motion.div
        aria-live="polite"
        aria-labelledby={labelledBy}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
        animate={active ? (reduce ? { opacity: 1 } : { opacity: 1, y: 0 }) : undefined}
        // The plan's --ease-layer is CSS `ease-in-out`; motion spells it
        // "easeInOut".
        transition={
          reduce
            ? { duration: 0.12 }
            : { duration: 0.325, ease: "easeInOut" as const, delay: 0.025 }
        }
        className="min-h-dvh bg-background"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
