"use client";
// The main narrative plane: situation → reasoning → evidence. The title stays
// anchored while the shell opens beneath it; glyphs are never scaled.

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import type { Insight } from "@/lib/knowledge/insights";
import type { ExperimentId, ExperimentState } from "@/lib/knowledge/models";
import { STAGE_REVEAL } from "@/lib/knowledge/motion";
import { InsightExperiment } from "@/components/knowledge/insight-experiment";
import { cn } from "@/lib/utils";

export type SceneState = { revealed: boolean; evidenceOpen: boolean };

type Props = {
  insight: Insight;
  scene: SceneState;
  experimentId: ExperimentId | null;
  experiment: ExperimentState;
  onExperimentChange: (patch: Partial<ExperimentState>) => void;
  onToggleReveal: () => void;
  onToggleEvidence: () => void;
  direction: "forward" | "back";
};

export function InsightScene({
  insight,
  scene,
  experimentId,
  experiment,
  onExperimentChange,
  onToggleReveal,
  onToggleEvidence,
  direction,
}: Props) {
  const reduce = useReducedMotion() ?? false;
  const answerId = `${insight.id}-reasoning`;
  const sourceId = `${insight.id}-source`;

  return (
    <div className="relative">
      {/* P2 — the supporting plane. It sits under the reading surface and
          separates when the reasoning opens, so the explanation has a second
          layer rather than appearing flat on the page. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-[28px] border border-border-strong bg-card/50"
        style={{ transform: "translate3d(10px, 10px, 0)" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 rounded-[28px] border border-border/60 bg-background/40"
        style={{ transform: "translate3d(20px, 22px, 0)" }}
      />

      <article
        aria-labelledby={`${insight.id}-title`}
        className={cn(
          "relative overflow-hidden rounded-[28px] border border-border-strong bg-card/95 p-5 sm:p-7",
          "shadow-[0_1px_0_0_rgb(255_255_255/0.05)_inset,0_30px_60px_-40px_rgb(0_0_0/0.65)]",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>01 / Today&apos;s situation</span>
          <span className="flex items-center gap-2">
            <span>{insight.topic}</span>
            <span aria-hidden="true">·</span>
            <span className="rounded-full border border-border-strong px-2 py-0.5">
              Preview edition
            </span>
          </span>
        </div>

        <motion.div
          animate={reduce ? undefined : { y: scene.revealed ? -14 : 0 }}
          transition={STAGE_REVEAL}
        >
          <motion.div
            key={insight.id}
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: direction === "forward" ? 10 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={reduce ? { duration: 0.1 } : STAGE_REVEAL}
          >
            <h2
              id={`${insight.id}-title`}
              className="mt-4 text-balance text-[clamp(1.6rem,2.6vw,2.15rem)] font-medium leading-[1.1] tracking-[-0.02em]"
            >
              {insight.title}
            </h2>
            <p className="mt-3 max-w-[52ch] text-pretty text-[15px] leading-7 text-foreground/85">
              {insight.scenario}
            </p>
            <p className="mt-3 flex gap-2.5 text-[13px] leading-6 text-muted-foreground">
              <span
                aria-hidden="true"
                className="mt-1.5 block h-[calc(100%-0.75rem)] w-0.5 shrink-0 rounded-full bg-primary/50"
              />
              <span>{insight.prediction}</span>
            </p>
          </motion.div>

          {experimentId ? (
            <InsightExperiment
              id={experimentId}
              state={experiment}
              onChange={onExperimentChange}
            />
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              aria-expanded={scene.revealed}
              aria-controls={answerId}
              onClick={onToggleReveal}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors",
                "bg-foreground text-background hover:bg-foreground/90 active:scale-[0.98]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              )}
            >
              {scene.revealed ? (
                <>
                  <RotateCcw className="size-4" aria-hidden="true" />
                  Back to the situation
                </>
              ) : (
                <>
                  Reveal the reasoning
                  <span aria-hidden="true">↓</span>
                </>
              )}
            </button>
            {!scene.revealed ? (
              <span className="text-xs text-muted-foreground">
                No score, no saved answer.
              </span>
            ) : null}
          </div>

          <AnimatePresence initial={false}>
            {scene.revealed ? (
              <motion.div
                key="reasoning"
                id={answerId}
                initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                transition={reduce ? { duration: 0.1 } : STAGE_REVEAL}
                className="overflow-hidden"
              >
                <div className="mt-5 rounded-[22px] border border-border-strong bg-background/80 p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">
                    The reasoning
                  </p>
                  <motion.p
                    initial={reduce ? { opacity: 1 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduce ? { duration: 0.1 } : STAGE_REVEAL}
                    className="mt-2 max-w-[54ch] text-pretty text-[16px] leading-7 font-medium"
                  >
                    {insight.takeaway}
                  </motion.p>
                  <motion.p
                    initial={reduce ? { opacity: 1 } : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      reduce ? { duration: 0.1 } : { ...STAGE_REVEAL, delay: 0.06 }
                    }
                    className="mt-3 max-w-[56ch] text-[13px] leading-6 text-muted-foreground"
                  >
                    {insight.caveat}
                  </motion.p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                    <button
                      type="button"
                      aria-expanded={scene.evidenceOpen}
                      aria-controls={sourceId}
                      onClick={onToggleEvidence}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-strong px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <span
                        aria-hidden="true"
                        className="size-1.5 rounded-full bg-primary"
                      />
                      {scene.evidenceOpen ? "Hide evidence" : "Evidence"}
                    </button>
                    <span className="text-[11px] text-muted-foreground">
                      {insight.reviewStatus.replace("_", " ")} · human review
                      pending
                    </span>
                  </div>

                  <AnimatePresence initial={false}>
                    {scene.evidenceOpen ? (
                      <motion.div
                        key="evidence"
                        id={sourceId}
                        initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        animate={
                          reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }
                        }
                        exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                        transition={reduce ? { duration: 0.1 } : STAGE_REVEAL}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 rounded-2xl border border-border bg-card/70 p-4">
                          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                            {insight.sourceId}
                          </p>
                          <p className="mt-1.5 text-[13px] leading-6">
                            {insight.sourceLocator}
                          </p>
                          <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
                            Checked {insight.checkedAt} · {insight.reviewer}. The
                            historical question banks and their answer keys were
                            not modified.
                          </p>
                          <a
                            href={insight.sourceUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-[13px] underline underline-offset-4"
                          >
                            Read the Microsoft Learn source
                            <ArrowUpRight className="size-3.5" aria-hidden="true" />
                          </a>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
            <a
              href={insight.lessonHref}
              className="inline-flex min-h-11 items-center gap-1.5 font-medium text-foreground underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            >
              Read the lesson
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
            <a
              href={insight.practiceHref}
              className="inline-flex min-h-11 items-center gap-1.5 text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Practise this area
            </a>
          </div>
        </motion.div>
      </article>
    </div>
  );
}
