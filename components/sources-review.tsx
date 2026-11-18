// One disclosure, used wherever source provenance or review detail would
// otherwise sit in the main reading path. Summary text is the same everywhere so
// the affordance can be learned once.

import type { ReactNode } from "react";

export function SourcesReview({
  children,
  summary = "Sources & review",
}: {
  children: ReactNode;
  summary?: string;
}) {
  return (
    <details className="group mt-8 rounded-2xl border border-border bg-card/30">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
        {summary}
        <span
          aria-hidden="true"
          className="font-mono text-base leading-none text-muted-foreground transition-transform group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="space-y-2 border-t border-border px-4 py-3 text-xs leading-6 text-muted-foreground">
        {children}
      </div>
    </details>
  );
}
