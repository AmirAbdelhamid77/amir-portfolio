"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="press inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs text-foreground hover:border-border-strong"
    >
      <Printer className="h-3.5 w-3.5" aria-hidden="true" />
      Print this guide
    </button>
  );
}
