"use client";
// Choreographed entrance primitives for Act III.
//
// Why this is not one fade-up: the pattern is chosen by what the block *is* —
// a section heading is a directional mask, a rail is a depth reveal, a reading
// plane rises, a supporting panel scales from behind. The stagger lives here so
// a group of blocks reads as one sequence rather than independent animations.
//
// No-JS and reduced-motion safety: the wrapper renders plain children on the
// server and on the first client frame. Only elements that are *below* the fold
// at mount are ever armed to animate, so nothing on screen can flash out, and a
// reader with JavaScript off or reduced motion on keeps every word.

import {
  type CSSProperties,
  type ElementType,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { CINEMATIC } from "@/lib/motion/cinematic";

export type RevealPattern =
  | "rise"
  | "mask"
  | "depth"
  | "scale"
  | "rotate"
  | "slide-start"
  | "slide-end";

type Phase = "idle" | "hidden" | "shown";

const PATTERNS: Record<RevealPattern, { hidden: CSSProperties; shown: CSSProperties }> = {
  rise: {
    hidden: { opacity: 0, transform: "translate3d(0, 30px, 0)" },
    shown: { opacity: 1, transform: "translate3d(0, 0, 0)" },
  },
  mask: {
    // A clip-path of exactly 100% makes the element report zero intersection,
    // so IntersectionObserver would never reveal it. A sliver stays unclipped
    // (and invisible, because opacity is 0) and keeps the trigger honest.
    hidden: {
      clipPath: "inset(0 0 96% 0)",
      opacity: 0,
      transform: "translate3d(0, 12px, 0)",
    },
    shown: { clipPath: "inset(0 0 0 0)", opacity: 1, transform: "translate3d(0, 0, 0)" },
  },
  depth: {
    hidden: {
      opacity: 0,
      transform: "perspective(1400px) translate3d(0, 42px, -120px) rotateX(7deg)",
    },
    shown: {
      opacity: 1,
      transform: "perspective(1400px) translate3d(0, 0, 0) rotateX(0deg)",
    },
  },
  scale: {
    hidden: { opacity: 0, transform: "scale(0.955)" },
    shown: { opacity: 1, transform: "scale(1)" },
  },
  rotate: {
    hidden: {
      opacity: 0,
      transform: "perspective(1200px) rotateY(-9deg) translate3d(0, 22px, -60px)",
    },
    shown: { opacity: 1, transform: "perspective(1200px) rotateY(0deg) translate3d(0, 0, 0)" },
  },
  "slide-start": {
    hidden: { opacity: 0, transform: "translate3d(-34px, 0, 0)" },
    shown: { opacity: 1, transform: "translate3d(0, 0, 0)" },
  },
  "slide-end": {
    hidden: { opacity: 0, transform: "translate3d(34px, 0, 0)" },
    shown: { opacity: 1, transform: "translate3d(0, 0, 0)" },
  },
};

export function Reveal({
  children,
  pattern = "rise",
  order = 0,
  interval = CINEMATIC.stagger.base,
  duration = CINEMATIC.duration.entry,
  as: Tag = "div",
  className,
  id,
  style,
  ...rest
}: {
  children: ReactNode;
  pattern?: RevealPattern;
  /** Position in the group: the entrance order is meaningful, not decorative. */
  order?: number;
  interval?: number;
  duration?: number;
  as?: ElementType;
  className?: string;
  id?: string;
  style?: CSSProperties;
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Without an observer there is nothing to wait for, so the block stays in
    // its resting state instead of being armed and hidden.
    if (reduce || typeof IntersectionObserver !== "function") return;
    // Only content the reader has not reached yet is armed.
    if (element.getBoundingClientRect().top > window.innerHeight * 0.82) {
      setPhase("hidden");
    }
  }, []);

  useEffect(() => {
    if (phase !== "hidden") return;
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setPhase("shown");
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [phase]);

  const patternStyles = PATTERNS[pattern];
  const animated: CSSProperties =
    phase === "idle"
      ? {}
      : {
          ...(phase === "hidden" ? patternStyles.hidden : patternStyles.shown),
          transitionProperty: "opacity, transform, clip-path",
          transitionDuration: `${duration}s`,
          transitionTimingFunction:
            pattern === "scale" || pattern === "rise"
              ? CINEMATIC.ease.out
              : CINEMATIC.ease.settle,
          transitionDelay: `${(order * interval).toFixed(3)}s`,
        };

  return (
    <Tag
      ref={ref as never}
      id={id}
      className={className}
      style={{ ...style, ...animated }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
