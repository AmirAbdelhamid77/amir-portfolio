"use client";

import { Check, Moon, Palette, Sun } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ACCENTS = [
  { id: "default", label: "beUI blue", swatch: "#0285f7" },
  { id: "violet", label: "Violet", swatch: "oklch(55% 0.2 290)" },
  { id: "blue", label: "Blue", swatch: "oklch(55% 0.18 255)" },
  { id: "teal", label: "Teal", swatch: "oklch(55% 0.12 185)" },
  { id: "green", label: "Green", swatch: "oklch(56% 0.14 150)" },
  { id: "rose", label: "Rose", swatch: "oklch(58% 0.2 12)" },
  { id: "amber", label: "Amber", swatch: "oklch(74% 0.15 70)" },
] as const;

type AccentId = (typeof ACCENTS)[number]["id"];

const THEME_KEY = "amir-theme";
const ACCENT_KEY = "amir-accent";

export function ThemeControls() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function toggleDark() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem(THEME_KEY, next ? "dark" : "light");
  }

  function chooseAccent(id: AccentId) {
    if (id === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", id);
    }
    localStorage.setItem(ACCENT_KEY, id);
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={toggleDark}
        aria-label="Toggle light and dark theme"
        className="press flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-muted-foreground hover:border-border hover:bg-card hover:text-foreground"
      >
        <Moon className="h-4 w-4 dark:hidden" aria-hidden="true" />
        <Sun className="hidden h-4 w-4 dark:block" aria-hidden="true" />
      </button>

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Choose accent colour"
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cn(
            "press flex h-9 w-9 items-center justify-center rounded-full border text-muted-foreground hover:bg-card hover:text-foreground",
            open ? "border-border bg-card text-foreground" : "border-transparent",
          )}
        >
          <Palette className="h-4 w-4" aria-hidden="true" />
        </button>

        {open ? (
          <div
            ref={panelRef}
            role="dialog"
            aria-label="Accent colour"
            className="glass absolute right-0 top-11 z-50 w-56 rounded-2xl p-3 shadow-2xl"
          >
            <p className="px-1 pb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Accent
            </p>
            <div className="grid grid-cols-2 gap-1">
              {ACCENTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => chooseAccent(item.id)}
                  data-accent-id={item.id}
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                >
                  <span
                    className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
                    style={{ backgroundColor: item.swatch }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{item.label}</span>
                  <span
                    className="accent-check ml-auto shrink-0 items-center"
                    data-accent-check={item.id}
                  >
                    <Check className="h-3 w-3" aria-hidden="true" />
                    <span className="sr-only">selected</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-2 border-t border-border px-1 pt-2 text-[11px] leading-relaxed text-muted-foreground">
              Themes come from BeUI&apos;s colour presets.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
