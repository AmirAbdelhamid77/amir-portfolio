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
import dynamic from "next/dynamic";
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
import {
  closedDealerQuery,
  dealerQuery,
  parseDealerEdition,
} from "@/lib/knowledge/dealer-hand";
import { CINEMATIC } from "@/lib/motion/cinematic";
import type { SceneState } from "@/components/knowledge/insight-scene";
import { KnowledgeDealer, type DealerZone } from "@/components/knowledge/knowledge-dealer";
import { InsightArchive } from "@/components/knowledge/insight-archive";
import { useCalmMotion } from "@/components/cinematic/use-calm-motion";
import { StageTimeline } from "./stage-timeline";
import { StageKnowledge } from "./stage-knowledge";
import { StageClosing } from "./stage-closing";

// R4's modal dealer is a review-only chunk. The public Home never renders it,
// so the dynamic stub is the only cost there and the chunk is never requested.
const DealerCinematic = dynamic(
  () => import("./dealer-cinematic").then((module) => module.DealerCinematic),
  { ssr: false },
);

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
  neighbourhood,
  timelineFan = false,
  dealerReview = false,
  closingReview = false,
  polishReview = false,
}: {
  items: Insight[];
  atlas: Atlas;
  model: StageModel;
  notice: string;
  /** Review-only candidate projection; omitted in the public build. */
  neighbourhood?: Atlas | null;
  /** Review-only desktop timeline fan; the strip stays the default. */
  timelineFan?: boolean;
  /** Review-only cinematic modal dealer; the inline table stays the default. */
  dealerReview?: boolean;
  /** Review-only closing scene; the accepted M6 close stays the default. */
  closingReview?: boolean;
  /** Review-only polish layer; the accepted M6 typography stays the default. */
  polishReview?: boolean;
}) {
  const reduce = useCalmMotion();
  const [selectedId, setSelectedId] = useState<string | null>(
    model.timeline.latestEditionId,
  );
  const [dealerOpen, setDealerOpen] = useState(false);
  const [dealerModal, setDealerModal] = useState(false);
  const [dealerStartCard, setDealerStartCard] = useState<string | null>(null);
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
  // written only when the reader chooses an edition or opens a deck.
  useEffect(() => {
    const editions = model.timeline.editions;
    function restore() {
      const params = new URLSearchParams(window.location.search);
      // `?dealer=` is a shared deck. It is resolved against the editions this
      // audience may see, so a withheld id opens nothing.
      const deckEdition = dealerReview
        ? parseDealerEdition(params.get("dealer"), editions)
        : null;
      // A shared deck is the more specific address: it wins over a stale
      // `insight` parameter so the modal and the selected edition cannot drift.
      const requested = deckEdition ?? params.get("insight");
      const resolved = selectedInsight(items, requested);
      if (!resolved) return;
      setSelectedId(resolved.id);
      if (dealerReview) {
        setDealerModal(Boolean(deckEdition));
        if (deckEdition) setDealerStartCard(null);
      }
      setMessage(
        requested && !items.some((item) => item.id === requested)
          ? "That edition is unavailable. Showing the latest visible edition."
          : "",
      );
    }
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [dealerReview, items, model.timeline.editions]);

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

  // R4 — the modal dealer. With the flag off these handlers are never used: the
  // inline table keeps its own two booleans and the accepted DOM.
  const openDealer = useCallback(() => {
    if (!insight) return;
    if (!dealerReview) {
      setDealerOpen(true);
      return;
    }
    setDealerStartCard(null);
    setDealerModal(true);
    const url = new URL(window.location.href);
    url.search = dealerQuery(url.search, insight.id);
    window.history.pushState({}, "", url);
  }, [dealerReview, insight]);

  const closeDealer = useCallback(() => {
    setDealerOpen(false);
    setDealerModal(false);
    setDealerStartCard(null);
    const url = new URL(window.location.href);
    url.search = closedDealerQuery(url.search);
    window.history.replaceState({}, "", url);
  }, []);

  const switchDealerEdition = useCallback(
    (id: string) => {
      setDealerStartCard(null);
      choose(id);
      // `choose` pushes the insight parameter; the deck parameter follows in
      // the same entry, so Back does not reopen the previous edition's deck.
      const url = new URL(window.location.href);
      url.searchParams.set("dealer", id);
      window.history.replaceState({}, "", url);
    },
    [choose],
  );

  const openSavedCard = useCallback(
    (editionId: string, cardId: string) => {
      setDealerStartCard(cardId);
      setDealerModal(true);
      choose(editionId);
      const url = new URL(window.location.href);
      url.searchParams.set("dealer", editionId);
      window.history.replaceState({}, "", url);
    },
    [choose],
  );

  // R5 — the review close. Reopening uses the modal dealer when this build has
  // it, and the timeline otherwise; the control never promises a surface that
  // the build did not mount.
  const reopenEdition = useCallback(
    (editionId: string | null) => {
      if (!editionId) {
        document.getElementById("today")?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
        return;
      }
      if (dealerReview) {
        setDealerStartCard(null);
        setDealerModal(true);
        choose(editionId);
        const url = new URL(window.location.href);
        url.search = dealerQuery(url.search, editionId);
        window.history.pushState({}, "", url);
        return;
      }
      choose(editionId, { scroll: true });
      // The scroll alone would leave focus on a button that is now off-screen.
      // Move it to the timeline heading the reader was sent back to.
      requestAnimationFrame(() => {
        const heading = document.getElementById("stage-timeline-title");
        if (!heading) return;
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      });
    },
    [choose, dealerReview, reduce],
  );

  const openSavedFromClose = useCallback(
    (editionId: string, cardId: string) => {
      if (dealerReview) {
        openSavedCard(editionId, cardId);
        return;
      }
      choose(editionId, { scroll: true });
    },
    [choose, dealerReview, openSavedCard],
  );

  const locateInEdition = useCallback(() => {
    closeDealer();
    requestAnimationFrame(() => {
      const heading = document.getElementById("stage-edition-title");
      heading?.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
      // A visual scroll alone would leave focus on the trigger behind the
      // closed dialog. Move it to the scene heading the reader was sent to.
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
      }
    });
  }, [closeDealer, reduce]);

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
      {/* pt clears the fixed site header. `data-stage-polish` is written only
          under HANSA_POLISH_REVIEW=1; the R6 rules are scoped to it. */}
      <div
        className="hansa-stage observatory relative isolate overflow-clip pt-[104px]"
        data-stage-polish={polishReview ? "true" : undefined}
      >
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
            dealerOpen={dealerReview ? dealerModal : dealerOpen}
            dealer={dealerReview ? null : dealer}
            dealerMode={dealerReview ? "modal" : undefined}
            message={message}
            onSelect={choose}
            onOpenDealer={dealerReview ? openDealer : () => setDealerOpen(true)}
            onCloseDealer={dealerReview ? closeDealer : () => setDealerOpen(false)}
            fan={timelineFan}
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
            neighbourhood={neighbourhood}
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
            closingReview={closingReview}
            items={items}
            onReopen={reopenEdition}
            onOpenSaved={openSavedFromClose}
          />
        </section>
      </div>

      {dealerReview && dealerModal && insight ? (
        <DealerCinematic
          insight={insight}
          model={model}
          items={items}
          startCardId={dealerStartCard}
          onClose={closeDealer}
          onSelectEdition={switchDealerEdition}
          onLocate={locateInEdition}
          onOpenSaved={openSavedCard}
        />
      ) : null}

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
