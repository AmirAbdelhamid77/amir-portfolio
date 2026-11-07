"use client";
// Island navigation: a compact floating capsule that morphs open into a menu
// panel and folds back down. One surface, one layout animation. Own code.
// Needs: motion, react. Uses shadcn-style tokens: card, border, foreground,
// muted-foreground. Map them to Hansa's variables if the names differ.

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

export type IslandItem = {
  id: string;
  label: string;
  href: string;
  hint: string;
};

export const HANSA_ITEMS: IslandItem[] = [
  { id: "work", label: "Work", href: "/work/", hint: "Case studies and services" },
  { id: "learn", label: "Learn", href: "/learn/", hint: "Knowledge graph and lessons" },
  { id: "practice", label: "Practice", href: "/practice/", hint: "Question banks and scenarios" },
  { id: "about", label: "About", href: "/about/", hint: "Experience and background" },
];

// One spring for the morph. Slightly under-damped so it settles with a
// small give, like a physical object, without wobbling.
const MORPH = { type: "spring", stiffness: 420, damping: 36, mass: 0.9 } as const;

const CLOSED_RADIUS = 999;
const OPEN_RADIUS = 28;

export function IslandNav({
  items = HANSA_ITEMS,
  current = "Today",
  currentId,
  brand = "Hansa",
  onNavigate,
}: {
  items?: IslandItem[];
  /** Label shown on the closed capsule: where the person is now. */
  current?: string;
  /** Item id to mark with aria-current="page". */
  currentId?: string;
  brand?: string;
  onNavigate?: (item: IslandItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  // Fold back on Esc, or on a press anywhere outside the island.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    const onPress = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPress);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPress);
    };
  }, [open, close]);

  const morph = reduce ? { duration: 0 } : MORPH;

  return (
    // The wrapper centres; the island itself only animates size, so the
    // layout animation never fights a centring transform.
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-3">
      <motion.nav
        ref={rootRef}
        aria-label="Primary"
        layout
        transition={morph}
        style={{ borderRadius: open ? OPEN_RADIUS : CLOSED_RADIUS }}
        className={
          "pointer-events-auto overflow-hidden border border-border bg-card/80 " +
          "text-foreground shadow-lg backdrop-blur-xl " +
          (open ? "w-[min(22rem,calc(100vw-1.5rem))]" : "w-auto")
        }
      >
        {/* The header row never leaves: it is the capsule when closed and the
            top of the panel when open. */}
        <motion.button
          ref={triggerRef}
          layout="position"
          transition={morph}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-full cursor-pointer items-center gap-2.5 px-4 text-sm outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        >
          <span className="font-medium tracking-tight">{brand}</span>
          <span aria-hidden="true" className="h-3.5 w-px bg-border" />
          <span className="truncate text-muted-foreground">{current}</span>
          <span className="flex-1" />
          <motion.svg
            aria-hidden="true"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            animate={{ rotate: open ? 45 : 0 }}
            transition={morph}
          >
            <path d="M7 2v10M2 7h10" />
          </motion.svg>
        </motion.button>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.ul
              id={panelId}
              key="panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: reduce ? 0 : 0.18, delay: reduce ? 0 : 0.06 }}
              className="m-0 list-none px-2 pb-2"
            >
              {items.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: reduce ? 0 : 0.06 + i * 0.035 }}
                >
                  <a
                    href={item.href}
                    aria-current={currentId === item.id ? "page" : undefined}
                    onClick={() => {
                      onNavigate?.(item);
                      close(false);
                    }}
                    className="flex flex-col rounded-2xl px-3 py-2.5 outline-none transition-colors hover:bg-foreground/[0.06] focus-visible:ring-2 focus-visible:ring-foreground aria-[current=page]:bg-foreground/[0.08]"
                  >
                    <span className="text-base font-medium tracking-tight">{item.label}</span>
                    <span className="text-sm text-muted-foreground">{item.hint}</span>
                  </a>
                </motion.li>
              ))}
            </motion.ul>
          ) : null}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
