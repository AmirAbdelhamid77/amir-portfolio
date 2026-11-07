"use client";

// Level 1 of the redesigned Home (redesign plan §2, §8): the island
// navigation and the timeline stage. The stage is filled by the forked beUI
// Timeline in Stage C; this shell owns the flag boundary, the island wiring
// and the stage geometry (island above, cables hanging from it).

import { IslandNav } from "@/components/hansa/island-nav";

export function TimelineHome({ stage }: { stage: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <IslandNav current="Today" />
      {/* sr-only product heading: the visual surface is the timeline itself. */}
      <h1 className="sr-only">Hansa: a daily data insight</h1>
      {/* The stage starts below the island so the cables appear to hang from
          it; `pt-[72px]` matches the plan's offset (island top 16 + 44 high +
          12 air). */}
      <main id="main" className="pt-[72px]">
        {stage}
      </main>
    </div>
  );
}
