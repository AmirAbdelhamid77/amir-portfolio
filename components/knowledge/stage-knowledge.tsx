// Scene 2 — the knowledge scene. The selected edition unfolds here: its
// situation, its reasoning and its concept instrument, then the only graph the
// public audience is allowed to see. When no edge is published the scene states
// that plainly and offers the real destinations that do work today; it never
// draws a decoration and never calls a candidate a connection.

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Insight } from "@/lib/knowledge/insights";
import type { Atlas } from "@/lib/atlas/model";
import type { StageModel } from "@/lib/knowledge/stage-model";
import type { ExperimentId, ExperimentState } from "@/lib/knowledge/models";
import { Reveal } from "@/components/cinematic/reveal";
import { InsightScene, type SceneState } from "./insight-scene";
import { KnowledgeInstrument } from "./knowledge-instrument";
import { StageAtlasPeek } from "./atlas-peek-stage";
import { EditionNeighbourhoodLazy } from "./neighbourhood/edition-lazy";

type StageKnowledgeProps = {
  model: StageModel;
  insight: Insight | null;
  atlas: Atlas;
  /** Review-only candidate projection; null in the public build. */
  neighbourhood?: Atlas | null;
  scene: SceneState;
  experimentId: ExperimentId | null;
  experiment: ExperimentState;
  direction: "forward" | "back";
  onExperimentChange: (patch: Partial<ExperimentState>) => void;
  onToggleReveal: () => void;
  onToggleEvidence: () => void;
};

export function StageKnowledge({
  model,
  insight,
  atlas,
  neighbourhood,
  scene,
  experimentId,
  experiment,
  direction,
  onExperimentChange,
  onToggleReveal,
  onToggleEvidence,
}: StageKnowledgeProps) {
  return (
    <div className="stage-scene-inner">
      <Reveal pattern="mask">
        <p className="stage-kicker">The knowledge scene</p>
        <h2 id="stage-edition-title" className="stage-scene-title stage-scene-title-sm">
          The edition, unfolded.
        </h2>
        <p className="stage-section-note">
          The same situation the cards carried, opened: the reasoning, the caveat
          and the source. The instrument changes one assumption at a time; every
          word stays readable without it.
        </p>
      </Reveal>

      {insight ? (
        <>
          <Reveal pattern="rise" order={1} className="mt-10">
            <InsightScene
              insight={insight}
              scene={scene}
              experimentId={experimentId}
              experiment={experiment}
              onExperimentChange={onExperimentChange}
              onToggleReveal={onToggleReveal}
              onToggleEvidence={onToggleEvidence}
              direction={direction}
            />
          </Reveal>

          {experimentId ? (
            <Reveal pattern="rotate" order={2} className="mt-14">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Concept instrument
                </p>
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                  {insight.conceptId.replace("concept:fabric:", "")}
                </span>
              </div>
              <KnowledgeInstrument
                id={experimentId}
                state={experiment}
                onChange={onExperimentChange}
              />
              <p className="observatory-caption">
                A conceptual instrument, not a live Fabric execution. Change an
                assumption; follow what changes, then read the exact model above.
              </p>
            </Reveal>
          ) : null}
        </>
      ) : (
        <Reveal pattern="rise" order={1} className="mt-10">
          <div className="stage-peek">
            <p className="stage-peek-title">No edition is on the stage today.</p>
            <p className="stage-peek-body">
              {model.review.notice} The archive below lists every edition that
              exists; the destinations at the end of the page are open now.
            </p>
          </div>
        </Reveal>
      )}

      <Reveal pattern="depth" order={0} duration={0.7} className="mt-16">
        {neighbourhood && insight ? (
          <EditionNeighbourhoodLazy key={insight.id} atlas={neighbourhood} insight={insight} />
        ) : (
        <div className="stage-graph">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Semantic layer · review status
              </p>
              <h3 className="mt-2 text-lg font-medium tracking-tight">
                {model.graph.state === "ready"
                  ? "What this idea is connected to"
                  : "Where this idea leads"}
              </h3>
            </div>
            <p className="stage-peek-meta">
              {model.graph.publishedConcepts} published concept
              {model.graph.publishedConcepts === 1 ? "" : "s"} ·{" "}
              {model.graph.publishedEdges} published connection
              {model.graph.publishedEdges === 1 ? "" : "s"}
            </p>
          </div>

          {model.graph.state === "ready" && insight ? (
            <div className="mt-4">
              <StageAtlasPeek
                atlas={atlas}
                conceptId={insight.conceptId}
                lessonHref={insight.lessonHref}
                practiceHref={insight.practiceHref}
                contextTitle={insight.topic}
              />
            </div>
          ) : (
            <>
              <p className="stage-notice">{model.graph.notice}</p>
              {model.graph.withheldEdges > 0 || model.graph.withheldConcepts > 0 ? (
                <p className="stage-peek-meta">
                  {model.graph.withheldConcepts} concepts and{" "}
                  {model.graph.withheldEdges} connections are under technical
                  review. A count is not a claim, and nothing here draws one.
                </p>
              ) : null}
              <ul className="stage-discovery">
                {model.graph.discovery.map((destination) => (
                  <li key={destination.href}>
                    <Link href={destination.href} className="stage-discovery-link">
                      <span className="stage-discovery-label">{destination.label}</span>
                      <span className="stage-discovery-description">
                        {destination.description}
                      </span>
                      <span className="stage-quiet-link">
                        Open
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        )}
      </Reveal>
    </div>
  );
}
