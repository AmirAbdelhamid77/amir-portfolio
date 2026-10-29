"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { CommandPalette, type CommandItem } from "@/components/motion/command-palette";
import type { SearchItem } from "@/lib/statistics/content";

/**
 * beUI Command Palette (vendored verbatim from the free registry) as the
 * concept search. The visible trigger keeps the feature discoverable without
 * knowing the shortcut, and the palette keeps its own keyboard model.
 */
export function ConceptSearch({ items, compact = false }: { items: SearchItem[]; compact?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const commands = useMemo<CommandItem[]>(
    () =>
      items.map((item) => ({
        id: item.id,
        label: item.label,
        group: item.group,
        keywords: item.keywords,
        onSelect: () => router.push(item.href),
      })),
    [items, router],
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={
          compact
            ? "press inline-flex h-8 items-center gap-2 rounded-full border border-border bg-background px-3 text-[11px] text-muted-foreground hover:border-border-strong hover:text-foreground"
            : "press flex w-full items-center gap-2.5 rounded-2xl border border-border bg-card/50 px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground sm:max-w-md"
        }
      >
        <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate">Search 43 sections, labs, formulas…</span>
        <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-block">
          Ctrl K
        </kbd>
      </button>
      <CommandPalette
        items={commands}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            window.requestAnimationFrame(() => triggerRef.current?.focus());
          }
        }}
        placeholder="Search concepts, sections, labs, formulas…"
        emptyMessage="No match. Try an English term, an Arabic term such as اختبار الفرضيات, or a lab name."
      />
    </>
  );
}
