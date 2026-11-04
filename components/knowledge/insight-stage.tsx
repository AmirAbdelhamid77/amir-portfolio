"use client";
// The stage behind the canonical Hansa landing (`components/knowledge/hansa-landing.tsx`),
// rendered by both `/` and its compatibility alias. One client boundary owns the
// selected edition, its scene state and the dealer's zones; every visual
// component below receives plain data and callbacks. Identity is always an
// insight ID, never a visual position.
//
// Three scenes (M6, 2026-11-04), in reading order:
//
//   #today    the timeline — fifteen days, newest first, with the selected
//             edition's peek. Selecting a date inspects it; "Open the edition"
//             deals the audited card table underneath, in the same scene.
//   #edition  the knowledge scene — the selected edition unfolded, its concept
//             instrument, and the only graph the audience may see.
//   #closing  the way onward — real destinations, the review status, the
//             identity strip.
//
// The stack is plain document flow: no sticky gates, no full-viewport
// takeovers, nothing that competes with the timeline for the first viewport.
// Native scrolling is never hijacked; the archive stays a plain document after
// the scenes.
//
// Every observable is already reviewed content:
//   - the audience decision is made once, in `buildStageModel`, upstream;
//   - the Atlas context is the default public projection — the review-preview
//     flag is never switched on here, so a draft relation cannot leak in.
//
// The whole page shares one selection state. Choosing an edition on the
// timeline, in the archive or in the URL moves every scene.

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { selectedInsight, type Insight } from "@/lib/knowledge/insights";
import type { Atlas } from "@/lib/atlas/model";
import type { StageModel } from "@/lib/knowledge/stage-model";
import {
  cardBody,
  experimentFor,
  INITIAL_EXPERIMENT,
  insightCards,
  type ExperimentState,
} from "@/lib/knowledge/models";
import { CINEMATIC } from "@/lib/motion/cinematic";
import type { SceneState } from "@/components/knowledge/insight-scene";
import { KnowledgeDealer, type DealerZone } from "@/components/knowledge/knowledge-dealer";
import { InsightArchive } from "@/components/knowledge/insight-archive";
import { useCalmMotion } from "@/components/cinematic/use-calm-motion";
import { StageTimeline } from "./stage-timeline";
import { StageKnowledge } from "./stage-knowledge";
import { StageClosing } from "./stage-closing";
import "./observatory.css";
import "./stage-editorial.css";

const CLOSED: SceneState = { revealed: false, evidenceOpen: false };

/** The principle card starts on the table; caveat and evidence stay in the deck. */
const defaultZone = (kind: string): DealerZone => (kind === "principle" ? "hand" : "deck");

export function InsightStage({
  items,
  atlas,
  model,
  notice,
}: {
  items: Insight[];
  atlas: Atlas;
  model: StageModel;
  notice: string;
}) {
  const reduce = useCalmMotion();
  const [selectedId, setSelectedId] = useState<string | null>(
    model.timeline.latestEditionId,
  );
  const [dealerOpen, setDealerOpen] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [scenes, setScenes] = useState<Record<string, SceneState>>({});
  const [experiments, setExperiments] = useState<Record<string, ExperimentState>>({});
  const [zones, setZones] = useState<Record<string, DealerZone>>({});
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [message, setMessage] = useState("");

  // Pointer tilt for the dealer. Motion values keep a pointer sweep off React's
  // render path; they are switchable off through reduced motion or a coarse
  // pointer.
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const magnetX = useMotionValue(0);
  const magnetY = useMotionValue(0);
  const tiltXSpring = useSpring(tiltX, CINEMATIC.spring.card);
  const tiltYSpring = useSpring(tiltY, CINEMATIC.spring.card);
  const magnetXSpring = useSpring(magnetX, CINEMATIC.spring.light);
  const magnetYSpring = useSpring(magnetY, CINEMATIC.spring.light);

  // The URL is canonical: it is read once on mount and on Back/Forward, and
  // written only when the reader chooses an edition.
  useEffect(() => {
    function restore() {
      const params = new URLSearchParams(window.location.search);
      const requested = params.get("insight");
      const resolved = selectedInsight(items, requested);
      if (!resolved) return;
      setSelectedId(resolved.id);
      setMessage(
        requested && !items.some((item) => item.id === requested)
          ? "That edition is unavailable. Showing the latest visible edition."
          : "",
      );
    }
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [items]);

  const insight = selectedInsight(items, selectedId) ?? null;
  const experiment = insight ? experiments[insight.id] ?? INITIAL_EXPERIMENT : INITIAL_EXPERIMENT;
  const experimentId = insight ? experimentFor(insight) : null;

  const changeExperiment = useCallback(
    (patch: Partial<ExperimentState>) =>
      setExperiments((previous) => {
        if (!insight) return previous;
        return {
          ...previous,
          [insight.id]: { ...(previous[insight.id] ?? INITIAL_EXPERIMENT), ...patch },
        };
      }),
    [insight],
  );

  const choose = useCallback(
    (id: string, options?: { scroll?: boolean }) => {
      const nextIndex = items.findIndex((item) => item.id === id);
      if (nextIndex === -1) return;
      const currentIndex = items.findIndex((item) => item.id === selectedId);
      setDirection(nextIndex > currentIndex ? "forward" : "back");
      setSelectedId(id);
      setActiveCardId(null);
      setStatus("");
      setAnnouncement(`${labelFor(items[nextIndex])} selected.`);
      // A new edition starts closed: an explanation never arrives already open
      // from the previous one.
      setScenes((previous) => {
        const next = { ...previous };
        delete next[id];
        return next;
      });
      if (id !== selectedId) {
        const url = new URL(window.location.href);
        url.searchParams.set("insight", id);
        window.history.pushState({}, "", url);
      }
      // Deep links from the archive land on the timeline scene that owns the
      // peek; the knowledge scene is a scroll away by design.
      if (options?.scroll) {
        document.getElementById("today")?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
      }
    },
    [items, reduce, selectedId],
  );

  const scene = insight ? scenes[insight.id] ?? CLOSED : CLOSED;
  const cards = useMemo(
    () =>
      insight
        ? insightCards(insight).map((card) => ({
            ...card,
            zone: zones[card.id] ?? defaultZone(card.kind),
          }))
        : [],
    [insight, zones],
  );
  const deck = cards.filter((card) => card.zone === "deck");
  const activeCard = cards.find((card) => card.id === activeCardId) ?? null;
  const body = insight && activeCard ? cardBody(insight, activeCard.kind) : null;

  function toggleScene(key: keyof SceneState) {
    if (!insight) return;
    setScenes((previous) => {
      const current = previous[insight.id] ?? CLOSED;
      return {
        ...previous,
        [insight.id]:
          key === "revealed"
            ? {
                revealed: !current.revealed,
                evidenceOpen: current.revealed ? false : current.evidenceOpen,
              }
            : { ...current, evidenceOpen: !current.evidenceOpen },
      };
    });
  }

  function deal() {
    if (deck.length === 0) return;
    setZones((previous) => {
      const next = { ...previous };
      for (const card of cards) {
        if ((previous[card.id] ?? defaultZone(card.kind)) === "deck") next[card.id] = "hand";
      }
      return next;
    });
    setStatus(
      `${deck.length} knowledge card${deck.length === 1 ? "" : "s"} dealt. Select one to read it.`,
    );
    setAnnouncement(`${deck.length} knowledge cards dealt.`);
  }

  function collect() {
    setZones((previous) => {
      const next = { ...previous };
      for (const card of cards) {
        if ((previous[card.id] ?? defaultZone(card.kind)) === "hand") next[card.id] = "deck";
      }
      return next;
    });
    setActiveCardId(null);
    setStatus("Cards returned to the deck.");
    setAnnouncement("Knowledge cards returned to the deck.");
  }

  function toggleCard(id: string) {
    const closing = activeCardId === id;
    const card = cards.find((entry) => entry.id === id);
    setActiveCardId(closing ? null : id);
    setStatus("");
    setAnnouncement(
      closing ? "Card returned to the hand." : `${card?.eyebrow ?? "Knowledge"} card opened.`,
    );
  }

  const dealer = insight ? (
    <motion.div
      className="stage-dealer-stage"
      style={{
        rotateX: reduce ? 0 : tiltXSpring,
        rotateY: reduce ? 0 : tiltYSpring,
        x: reduce ? 0 : magnetXSpring,
        y: reduce ? 0 : magnetYSpring,
        transformPerspective: CINEMATIC.depth.perspective,
      }}
      onPointerMove={(event) => {
        if (reduce || event.pointerType !== "mouse" || window.innerWidth < 768) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        tiltY.set(x * CINEMATIC.pointer.tilt * 2);
        tiltX.set(y * -CINEMATIC.pointer.tilt * 1.4);
        magnetX.set(x * CINEMATIC.pointer.magnetic);
        magnetY.set(y * CINEMATIC.pointer.magnetic * 0.6);
      }}
      onPointerLeave={() => {
        tiltX.set(0);
        tiltY.set(0);
        magnetX.set(0);
        magnetY.set(0);
      }}
    >
      <div className="stage-dealer-halo" aria-hidden="true" />
      <div className="stage-dealer-ring" aria-hidden="true" />
      <KnowledgeDealer
        key={insight.id}
        cards={cards}
        density="hero"
        activeId={activeCardId}
        onSelect={toggleCard}
        onDeal={deal}
        onCollect={collect}
        onCloseReader={() => setActiveCardId(null)}
        status={status}
        reader={
          activeCard && body ? (
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {activeCard.eyebrow}
              </p>
              <h3 className="mt-1.5 text-[17px] font-medium leading-6 tracking-tight">
                {activeCard.title}
              </h3>
              <p className="mt-2.5 text-[14px] leading-7">{body.quote}</p>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                {body.note}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3">
                {body.href ? (
                  <a
                    href={body.href}
                    {...(body.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    className="inline-flex min-h-11 items-center gap-1.5 text-[13px] font-medium underline underline-offset-4"
                  >
                    {body.hrefLabel}
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </a>
                ) : null}
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  {body.meta}
                </span>
              </div>
            </div>
          ) : null
        }
      />
      <p className="stage-dealer-caption">
        The principle card is on the table. Deal its caveat and its source check;
        nothing here is generated copy.
      </p>
    </motion.div>
  ) : null;

  return (
    <div>
      {/* pt clears the fixed site header. */}
      <div className="hansa-stage observatory relative isolate overflow-clip pt-[104px]">
        {/* ------------------------------------------------------- masthead */}
        <div className="mx-auto w-full max-w-[1320px] px-5 pt-5 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-strong pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <span>Hansa / Knowledge stage</span>
            <span>Editions under editorial review · Technical review</span>
          </div>
        </div>

        {/* ------------------------------------------ SCENE 1 — the timeline */}
        <section
          id="today"
          aria-labelledby="stage-timeline-title"
          className="stage-scene stage-scene-first scroll-mt-24"
        >
          <StageTimeline
            model={model}
            insight={insight}
            selectedId={insight?.id ?? null}
            dealerOpen={dealerOpen}
            dealer={dealer}
            message={message}
            onSelect={choose}
            onOpenDealer={() => setDealerOpen(true)}
            onCloseDealer={() => setDealerOpen(false)}
          />
        </section>

        {/* ----------------------------------------- SCENE 2 — the knowledge */}
        <section
          id="edition"
          aria-labelledby="stage-edition-title"
          className="stage-scene scroll-mt-24"
        >
          <StageKnowledge
            model={model}
            insight={insight}
            atlas={atlas}
            scene={scene}
            experimentId={experimentId}
            experiment={experiment}
            direction={direction}
            onExperimentChange={changeExperiment}
            onToggleReveal={() => toggleScene("revealed")}
            onToggleEvidence={() => toggleScene("evidenceOpen")}
          />
        </section>

        {/* ------------------------------------------- SCENE 3 — the closing */}
        <section
          id="closing"
          aria-labelledby="stage-closing-title"
          className="stage-scene scroll-mt-24"
        >
          <StageClosing
            model={model}
            insight={insight}
            notice={notice}
            message={message}
            announcement={announcement}
          />
        </section>
      </div>

      <InsightArchive items={items} onOpen={(id) => choose(id, { scroll: true })} />

      <noscript>
        <p className="mx-auto max-w-[1200px] px-5 pb-16 text-sm text-muted-foreground md:px-8">
          JavaScript is off. Every visible edition, its reasoning, caveat and
          source is readable in the archive above; the timeline, the card table
          and the reasoning disclosure need JavaScript.
        </p>
      </noscript>
    </div>
  );
}

function labelFor(insight: Insight) {
  return `Edition ${new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(new Date(`${insight.date}T00:00:00Z`))
    .toUpperCase()}`;
}
