"use client";

import { Info } from "lucide-react";
import { Tooltip } from "@/components/motion/tooltip";

/**
 * Supplementary parameter help only. No definition required to answer the
 * lesson's main question lives here; the visible prose always carries it.
 */
export function InfoTip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip
      content={<span className="block max-w-60 text-[11px] leading-5">{children}</span>}
      side="top"
    >
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
      >
        <Info className="h-3 w-3" aria-hidden="true" />
      </button>
    </Tooltip>
  );
}
