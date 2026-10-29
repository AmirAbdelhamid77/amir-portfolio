"use client";

// Study notes are load-on-demand: the chapter text for all 18 packs is ~300 KB,
// which no reader needs while browsing the source list.

import { useEffect, useState } from "react";
import { AtlasReturnLink } from "@/components/atlas/return-link";
import { ChevronDown, ExternalLink, Loader2 } from "lucide-react";
import { PACKS, formatTimestamp, loadNotes, videoUrl } from "@/lib/fabric/data";
import type { FabricPackNotes } from "@/lib/fabric/types";

export function PackNotes() {
  const [notes, setNotes] = useState<FabricPackNotes[] | null>(null);
  const [pack, setPack] = useState(PACKS[0]?.key ?? "");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const key = new URLSearchParams(location.search).get("pack");
    if (!key || !PACKS.some(p => p.key === key)) return;
    let alive = true;
    Promise.resolve().then(() => { if (alive) { setPack(key); setLoading(true); } });
    loadNotes().then(data => { if (alive) setNotes(data); }).catch(() => { if (alive) setFailed(true); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const open = async (key: string) => {
    setPack(key);
    if (notes || loading) return;
    setLoading(true);
    try {
      setNotes(await loadNotes());
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  const current = notes?.find((entry) => entry.pack === pack);
  const meta = PACKS.find((entry) => entry.key === pack);

  return (
    <div id="study-notes">
      <AtlasReturnLink />
      <div className="flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            Source pack
          </span>
          <select
            value={pack}
            onChange={(event) => void open(event.target.value)}
            className="h-9 rounded-xl border border-border bg-background px-2.5 text-xs outline-none focus:border-primary"
          >
            {PACKS.map((entry) => (
              <option key={entry.key} value={entry.key}>
                {entry.title} ({entry.chapterCount} chapters)
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => void open(pack)}
          className="press inline-flex h-9 items-center gap-1.5 rounded-full border border-border-strong px-3.5 text-xs hover:bg-card"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-3 w-3" aria-hidden="true" />
          )}
          {notes ? "Reload notes" : "Load study notes"}
        </button>
        {meta?.video ? (
          <a
            href={videoUrl(meta.video.id, null) ?? undefined}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground underline decoration-border-strong underline-offset-4 hover:text-foreground"
          >
            Open the source video
            <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
          </a>
        ) : null}
      </div>

      {failed ? (
        <p role="alert" className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-[11px] text-destructive">
          The study notes failed to load. Reload the page; the rest of the reference is unaffected.
        </p>
      ) : null}

      {!notes && !loading ? (
        <p className="mt-3 text-[11px] leading-6 text-muted-foreground">
          The chapter maps are generated from each pack&apos;s own question reasoning and timestamps.
          They are <strong className="text-foreground">not</strong> video transcripts and not a
          substitute for watching the source.
        </p>
      ) : null}

      {current ? (
        <div className="mt-4 grid gap-2">
          {current.chapters.length === 0 ? (
            <p className="text-xs text-muted-foreground">This pack has no chapter map.</p>
          ) : null}
          {current.chapters.map((chapter) => {
            const stamp = formatTimestamp(chapter.videoSeconds);
            return (
              <details
                key={`${current.pack}-${chapter.id}`}
                className="group rounded-2xl border border-border bg-background/60 p-3.5"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-foreground">{chapter.title}</span>
                    <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">
                      {stamp ?? "no timestamp"}
                      {chapter.questionIds.length > 0
                        ? ` · ${chapter.questionIds.length} linked question${chapter.questionIds.length === 1 ? "" : "s"}`
                        : ""}
                    </span>
                  </span>
                  <ChevronDown
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <ul className="mt-2 grid gap-1.5">
                  {chapter.points.map((point, index) => (
                    <li key={index} className="text-[11px] leading-6 text-muted-foreground">
                      · {point}
                    </li>
                  ))}
                </ul>
                {chapter.caveat ? (
                  <p className="mt-2 rounded-xl border border-warning/30 bg-warning/5 p-2.5 text-[11px] leading-5 text-foreground">
                    Correction: {chapter.caveat}
                  </p>
                ) : null}
                {meta?.video && stamp ? (
                  <a
                    href={videoUrl(meta.video.id, chapter.videoSeconds) ?? undefined}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-foreground underline decoration-border-strong underline-offset-4"
                  >
                    Watch from {stamp}
                    <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                  </a>
                ) : null}
              </details>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
