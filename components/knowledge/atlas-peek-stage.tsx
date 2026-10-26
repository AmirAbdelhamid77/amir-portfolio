"use client";
// Contextual Atlas Peek. It reads only the already-projected Atlas (the same
// object the Atlas pages receive) and never enables the review-preview flag,
// so a draft relation cannot appear here. When the public projection has no
// eligible relation — today's state — the stage shows a quiet, truthful bridge
// instead of drawing a decoration.

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  defaultView,
  neighborhood,
  RELATIONS,
  viewHref,
  type Atlas,
  type Concept,
  type Edge,
} from "@/lib/atlas/model";
import {
  PEEK_CENTER as CENTER,
  PEEK_VIEWBOX,
  edgeControl,
  placeAround,
} from "@/lib/atlas/peek-layout";
import { cn } from "@/lib/utils";

const WIDTH = PEEK_VIEWBOX.width;
const HEIGHT = PEEK_VIEWBOX.height;

export function StageAtlasPeek({
  atlas,
  conceptId,
  lessonHref,
  practiceHref,
}: {
  atlas: Atlas;
  conceptId: string;
  lessonHref: string;
  practiceHref: string;
}) {
  const view = useMemo(
    () => ({ ...defaultView(), concept: conceptId, incoming: true }),
    [conceptId],
  );
  const slice = useMemo(
    () => neighborhood(atlas, { ...view, hops: 1 }),
    [atlas, view],
  );
  const center = atlas.concepts.find((concept) => concept.id === conceptId);
  const edges = slice.edges.slice(0, 4);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(
    edges[0]?.id ?? null,
  );
  const active = edges.find((edge) => edge.id === selectedEdge) ?? edges[0] ?? null;
  const related = relatedConcepts(edges, center?.id ?? conceptId, atlas.concepts);
  const slots = placeAround(related.length);

  return (
    <section aria-labelledby="atlas-peek-title" className="relative">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            03 / Knowledge Atlas
          </p>
          <h2
            id="atlas-peek-title"
            className="mt-2 text-lg font-medium tracking-tight"
          >
            {edges.length ? "What this idea is connected to" : "Where this idea leads"}
          </h2>
        </div>
        <Link
          href={viewHref({ ...view, hops: 1 })}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Open the full Atlas
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>

      {center && edges.length ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="relative overflow-hidden rounded-[24px] border border-border-strong bg-card/60">
            <div className="relative mx-auto w-full" style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}>
              <svg
                aria-hidden="true"
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                className="absolute inset-0 size-full text-primary"
                fill="none"
              >
                <defs>
                  <radialGradient id="atlas-core" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx={CENTER.x} cy={CENTER.y} r={118} fill="url(#atlas-core)" />
                {related.map((concept, index) => {
                  const point = slots[index];
                  const isActive =
                    active?.from === concept.id || active?.to === concept.id;
                  return (
                    <g key={concept.id} opacity={isActive ? 1 : 0.4}>
                      <path
                        d={`M ${CENTER.x} ${CENTER.y} Q ${edgeControl(CENTER, point).x} ${edgeControl(CENTER, point).y} ${point.x} ${point.y}`}
                        stroke="currentColor"
                        strokeOpacity={isActive ? 0.75 : 0.3}
                        strokeWidth={isActive ? 1.5 : 1}
                        strokeDasharray={isActive ? undefined : "3 4"}
                      />
                    </g>
                  );
                })}
                <circle cx={CENTER.x} cy={CENTER.y} r={7} fill="currentColor" />
                <circle cx={CENTER.x} cy={CENTER.y} r={15} stroke="currentColor" strokeOpacity="0.35" />
              </svg>

              <div
                className="absolute -translate-x-1/2 -translate-y-1/2 text-center"
                style={{ left: `${(CENTER.x / WIDTH) * 100}%`, top: `${(CENTER.y / HEIGHT) * 100}%` }}
              >
                <span className="block rounded-full border border-primary/40 bg-background px-3 py-1.5 text-xs font-medium">
                  {center.title}
                </span>
                <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  published concept
                </span>
              </div>

              {related.map((concept, index) => {
                const point = slots[index];
                const edge = edgeFor(edges, center.id, concept.id);
                if (!edge) return null;
                return (
                  <button
                    key={concept.id}
                    type="button"
                    aria-pressed={active?.id === edge.id}
                    onClick={() => setSelectedEdge(edge.id)}
                    className={cn(
                      "absolute max-w-[9.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full border px-2.5 py-1.5 text-[11px] leading-tight transition-colors",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                      active?.id === edge.id
                        ? "border-primary/60 bg-primary/12 text-foreground"
                        : "border-border-strong bg-background/90 text-muted-foreground hover:text-foreground",
                    )}
                    style={{
                      left: `${(point.x / WIDTH) * 100}%`,
                      top: `${(point.y / HEIGHT) * 100}%`,
                    }}
                  >
                    {concept.title}
                  </button>
                );
              })}
            </div>
            <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
              Relation labels are drawn only from the published projection. Select
              a node to read the claim and its conditions.
            </p>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 translate-x-1.5 translate-y-1.5 rounded-[20px] border border-border-strong bg-card/40"
            />
            <div aria-live="polite" className="rounded-[20px] border border-border-strong bg-background/90 p-4">
              {active ? (
                <>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                    {RELATIONS[active.relationType]}
                  </p>
                  <p className="mt-2 text-[13px] font-medium leading-6">
                    {active.claim}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">
                    {active.conditions}
                  </p>
                  <dl className="mt-3 space-y-1 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                    <div className="flex gap-2">
                      <dt>Revision</dt>
                      <dd className="tabular-nums">{active.revision}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt>Checked</dt>
                      <dd className="tabular-nums">{active.checkedAt}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt>Reviewer</dt>
                      <dd>{active.reviewer}</dd>
                    </div>
                  </dl>
                  <div className="mt-3 flex flex-wrap gap-3 border-t border-border pt-3">
                    <Link
                      href={viewHref({ ...view, edge: active.id, hops: 1 })}
                      className="inline-flex min-h-11 items-center text-[13px] underline underline-offset-4"
                    >
                      Why connected?
                    </Link>
                    {evidenceLinks(atlas, active).map((source) => (
                      <a
                        key={source.id}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex min-h-11 items-center gap-1 text-[13px] text-muted-foreground underline underline-offset-4 hover:text-foreground"
                      >
                        {source.id}
                        <ArrowUpRight className="size-3" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a connected concept to read the claim behind the line.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative mt-4 max-w-3xl">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 rounded-[24px] border border-border-strong bg-card/50"
            style={{ transform: "translate3d(10px, 10px, 0)" }}
          />
          <div className="rounded-[24px] border border-border-strong bg-background/90 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-border-strong px-3 py-1.5 text-xs text-muted-foreground">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-warning" />
                Reviewed connections are not published yet
              </span>
              {atlas.preview ? (
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  local review mode
                </span>
              ) : null}
            </div>
            <p className="mt-3 max-w-[64ch] text-[13px] leading-6 text-muted-foreground">
              {atlas.notice} The Atlas draws a connection only after its evidence
              and human review are complete, so this stage deliberately shows no
              graph rather than an invented one.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 border-t border-border pt-4">
              <Link
                href={lessonHref}
                className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-4 text-sm transition-colors hover:bg-muted"
              >
                Read the lesson instead
              </Link>
              <Link
                href={practiceHref}
                className="inline-flex min-h-11 items-center rounded-full border border-border-strong px-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Practise this area
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function relatedConcepts(
  edges: Edge[],
  centerId: string,
  concepts: Concept[],
): Concept[] {
  const ids = edges.map((edge) => (edge.from === centerId ? edge.to : edge.from));
  return [...new Set(ids)]
    .map((id) => concepts.find((concept) => concept.id === id))
    .filter((concept): concept is Concept => Boolean(concept))
    .slice(0, 4);
}

function edgeFor(edges: Edge[], centerId: string, conceptId: string) {
  return (
    edges.find(
      (edge) =>
        (edge.from === centerId && edge.to === conceptId) ||
        (edge.from === conceptId && edge.to === centerId),
    ) ?? null
  );
}

function evidenceLinks(atlas: Atlas, edge: Edge) {
  return edge.sourceIds
    .map((id) => atlas.sources.find((source) => source.id === id))
    .filter((source): source is NonNullable<typeof source> => Boolean(source));
}
