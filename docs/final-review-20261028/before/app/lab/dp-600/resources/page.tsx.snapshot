import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { HubHeader, Callout, Panel, DISCLAIMER } from "@/components/fabric/ui";
import { PackNotes } from "@/components/fabric/pack-notes";
import { COUNTS, META, PACKS, SOURCES, videoIndex } from "@/lib/fabric/data";
import { STUDY_GUIDE_URL } from "@/lib/fabric/taxonomy";

export const metadata: Metadata = {
  title: "Learning resources & sources — Microsoft Fabric DP-600",
  description:
    "Every reference behind the 834 Fabric practice questions: source videos with timestamps, Microsoft Learn documentation, study-note chapters and the validation note each question carries.",
  alternates: { canonical: "/lab/dp-600/resources" },
};

export default function ResourcesPage() {
  const videos = videoIndex();

  return (
    <>
      <HubHeader
        eyebrow="DP-600 · Sources & evidence"
        title="Where every claim comes from."
        description="Nothing in this bank is anonymous. Each question keeps its source pack, its video timestamp and its Microsoft Learn references, and each one carries the author's own note about how far the claim was checked."
      />

      <section className="py-8 md:py-12">
        <div className="mx-auto w-full max-w-5xl space-y-8 px-4 md:px-6">
          <Panel
            title="Five different kinds of evidence, kept apart"
            description="A question can be well-written without being execution-verified. These labels are the author's, preserved verbatim; they are not a claim that Microsoft endorses anything here."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  title: "1 · Video-derived educational content",
                  body: "The scenario, constraints and answer framing were authored from the talks listed below. A timestamp is a discussion anchor, not a transcript frame.",
                },
                {
                  title: "2 · The question author's explanations",
                  body: "Every explanation and every option-level rationale is original prose. A rationale can be correct about Fabric and still be a judgement about a scenario.",
                },
                {
                  title: "3 · Microsoft documentation",
                  body: `${COUNTS.sources} registry entries link to Microsoft Learn or docs.delta.io. Each question lists the ones it leans on.`,
                },
                {
                  title: "4 · Independently verified behaviour",
                  body: "Not claimed here. No question in this import was executed against a live Fabric tenant as part of the integration.",
                },
                {
                  title: "5 · Not yet revalidated",
                  body: "Some preview features move fast. Where a question depends on one, the author's note says so, and the source video date is shown.",
                },
                {
                  title: "What is deliberately absent",
                  body: "No official exam items, no recalled questions, no claim of blueprint fidelity. See the disclaimer at the foot of this page.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-border bg-background/60 p-3.5">
                  <p className="text-xs font-medium text-foreground">{item.title}</p>
                  <p className="mt-1 text-[11px] leading-6 text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Validation wording used in the source package, with counts
              </p>
              <div className="mt-2 grid gap-1.5">
                {META.validationNotes.map((note) => (
                  <div
                    key={note.label}
                    className="flex items-baseline justify-between gap-3 rounded-xl border border-border bg-background/50 px-3 py-2"
                  >
                    <span className="text-[11px] leading-5 text-muted-foreground">{note.label}</span>
                    <span className="shrink-0 font-mono text-[11px] text-foreground">{note.count}</span>
                  </div>
                ))}
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
                  {COUNTS.questions - META.validationNotes.reduce((sum, note) => sum + note.count, 0)}{" "}
                  questions carry no validation note at all (the five original topic packs and the
                  foundation set predate that metadata).
                </p>
              </div>
            </div>
          </Panel>

          <Panel
            title="Source videos"
            description={`${videos.length} videos behind 13 of the 18 packs. Timestamps open the exact point a question refers to, where one exists.`}
          >
            <ul className="grid gap-2">
              {videos.map((video) => (
                <li key={video.id} className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-border bg-background/50 p-3">
                  <span className="min-w-0">
                    <a
                      href={`https://www.youtube.com/watch?v=${video.id}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-xs text-foreground underline decoration-border-strong underline-offset-4"
                    >
                      {video.title}
                      <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
                    </a>
                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                      {video.creator} · {video.duration} ·{" "}
                      {video.packs.map((pack) => PACKS.find((entry) => entry.key === pack)?.title ?? pack).join(", ")}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Study-note chapters"
            description="Per-pack chapter maps: what each section covers, the linked questions, the timestamp and any correction the author recorded. Loaded on demand."
          >
            <PackNotes />
            <p className="mt-3 text-[11px] leading-6 text-muted-foreground">
              These notes are generated from question reasoning and timestamps. They are not full
              transcripts, not a video summary and not a substitute for the recording. The package
              says the same, and this page keeps that limitation in view rather than smoothing it
              over.
            </p>
          </Panel>

          <Panel
            title={`Reference registry (${SOURCES.length} entries)`}
            description="Every link a question can cite, with the registry id it uses internally. A question that cites nothing still has its explanation and rationale; it simply has no external anchor."
          >
            <ul className="grid gap-1 sm:grid-cols-2">
              {SOURCES.map((source) => (
                <li key={source.id} className="min-w-0 text-[11px]">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex min-h-6 items-center gap-1.5 text-muted-foreground underline decoration-border-strong underline-offset-4 hover:text-foreground"
                    title={`${source.id} — ${source.url}`}
                  >
                    <span className="shrink-0 font-mono text-[10px] text-muted-foreground">{source.id}</span>
                    <span className="truncate">{source.title}</span>
                  </a>
                </li>
              ))}
            </ul>
          </Panel>

          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href={STUDY_GUIDE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="group rounded-2xl border border-border bg-card/40 p-4 transition-colors hover:border-border-strong"
            >
              <p className="text-xs font-medium text-foreground">DP-600 study guide</p>
              <p className="mt-1 text-[11px] leading-6 text-muted-foreground">
                The authority for objectives and weights used on every coverage figure in this hub
                (skills measured as of 19 October 2026).
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-foreground">
                Microsoft Learn
                <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
              </span>
            </a>
            <a
              href="https://learn.microsoft.com/en-us/fabric/"
              target="_blank"
              rel="noreferrer noopener"
              className="group rounded-2xl border border-border bg-card/40 p-4 transition-colors hover:border-border-strong"
            >
              <p className="text-xs font-medium text-foreground">Microsoft Fabric documentation</p>
              <p className="mt-1 text-[11px] leading-6 text-muted-foreground">
                Product behaviour changes; some features cited here are preview. Check the current
                page before relying on a specific configuration in production.
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-foreground">
                Microsoft Learn
                <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
              </span>
            </a>
          </div>

          <Callout tone="warning" title="Content disclaimer">
            {DISCLAIMER}
          </Callout>
        </div>
      </section>
    </>
  );
}
