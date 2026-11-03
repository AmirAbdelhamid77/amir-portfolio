"use client";
// The stage behind the canonical Hansa landing (`components/knowledge/hansa-landing.tsx`),
// rendered by both `/` and its compatibility alias. One client boundary owns the
// selected edition, its scene state and the dealer's zones; every visual
// component below receives plain data and callbacks. Identity is always an
// insight ID, never a visual position.
//
// Gate flow (v3, 2026-10-30): the landing is a stack of full-viewport gates.
//
//   Gate 0  TODAY      — the date is the hero; the CTA swaps it for a
//                        full-viewport card dealer, and dealing reveals the
//                        day's insight cards.
//   Gate 1  INSIGHT    — the full edition: scene, concept instrument, and the
//                        dated editions rail (#today anchor).
//   Gate 2  LEARN      — a hand-off into the learning catalogue.
//   Gate 3  CERTIFY    — the question banks and the per-objective coverage.
//   Footer  context    — about strip, Atlas peek, archive hand-off.
//
// The choreography is native scrolling: compact gates are sticky 100svh
// siblings and the next gate rises over the pinned previous one with a soft
// top edge, behind which the covered gate dissolves. Two passive "enter"
// readings drive the rise through custom properties written on the gate
// canvases (never on the stage root — an inherited property there invalidated
// ~800 nodes per frame in an earlier stage). Content opacity never drops, so
// text stays AA-contrast at every scroll position. Reduced motion and small
// screens drop the pinning entirely; every word stays readable.
//
// Every observable is already reviewed content:
//   - the insights feed is read through `eligibleInsights` upstream, so an
//     unreviewed record can never reach the stage;
//   - the Atlas context is the default public projection — the review-preview
//     flag is never switched on here, so a draft relation cannot leak in.
//
// The whole page shares one selection state. Choosing an edition in the
// dealer, in the rail, in the archive or in the URL moves every gate.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { selectedInsight, type Insight } from "@/lib/knowledge/insights";
import type { Atlas } from "@/lib/atlas/model";
import {
  cardBody,
  experimentFor,
  INITIAL_EXPERIMENT,
  insightCards,
  type ExperimentState,
} from "@/lib/knowledge/models";
import { buildField, clamp01 } from "@/lib/atlas/field";
import { CINEMATIC } from "@/lib/motion/cinematic";
import { InsightRail, type RailEvent } from "@/components/knowledge/insight-rail";
import { InsightScene, type SceneState } from "@/components/knowledge/insight-scene";
import { KnowledgeDealer, type DealerZone } from "@/components/knowledge/knowledge-dealer";
import { StageAtlasPeek } from "@/components/knowledge/atlas-peek-stage";
import { InsightArchive } from "@/components/knowledge/insight-archive";
import { KnowledgeInstrument } from "@/components/knowledge/knowledge-instrument";
import { Reveal } from "@/components/cinematic/reveal";
import { useCalmMotion } from "@/components/cinematic/use-calm-motion";
import { useScrollProgress } from "@/components/cinematic/use-scroll-progress";
import { StageToday } from "./stage-today";
import { StageLearnGate } from "./stage-learn-gate";
import { StageCertGate } from "./stage-cert-gate";
import { StageAbout } from "./stage-about";
import "./observatory.css";
import "./stage-editorial.css";

const CLOSED: SceneState = { revealed: false, evidenceOpen: false };

/** The principle card starts on the table; caveat and evidence stay in the deck. */
const defaultZone = (kind: string): DealerZone => (kind === "principle" ? "hand" : "deck");

/**
 * An "enter" reading crosses 0→1 over viewport + height; a 100svh gate is
 * pinned when its top reaches 0, i.e. at p = viewport/(viewport+height). The
 * rise normalises the reading so a gate fully in place always reads 1 —
 * including gates whose content grew them past one viewport.
 */
function riseOf(element: HTMLElement, progress: number) {
  const rect = element.getBoundingClientRect();
  const viewport = window.innerHeight || 1;
  const atPin = viewport / (viewport + Math.max(rect.height, 1));
  return clamp01(progress / atPin);
}

export function InsightStage({
  items,
  atlas,
  notice,
}: {
  items: Insight[];
  atlas: Atlas;
  notice: string;
}) {
  const reducePref = useCalmMotion();
  const reduce = reducePref;
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [scenes, setScenes] = useState<Record<string, SceneState>>({});
  const [experiments, setExperiments] = useState<Record<string, ExperimentState>>({});
  const [zones, setZones] = useState<Record<string, DealerZone>>({});
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [message, setMessage] = useState("");
  const stageRef = useRef<HTMLDivElement>(null);

  // Gate rises. Two "enter" readings for the two gates that arrive from
  // below; each writes --gate-rise on its own canvas (transform + soft-edge
  // mask only — content opacity never drops, so text stays AA-contrast at
  // every scroll position).
  const learnSectionRef = useRef<HTMLElement>(null);
  const learnCanvasRef = useRef<HTMLDivElement>(null);
  const certSectionRef = useRef<HTMLElement>(null);
  const certCanvasRef = useRef<HTMLDivElement>(null);
  const learnReading = useScrollProgress(learnSectionRef, "enter");
  const certReading = useScrollProgress(certSectionRef, "enter");

  useEffect(() => {
    const learnCanvas = learnCanvasRef.current;
    const certCanvas = certCanvasRef.current;
    if (!learnCanvas || !certCanvas) return;
    const targets = [learnCanvas, certCanvas];
    if (reduce) {
      for (const target of targets) {
        target.style.removeProperty("--gate-rise");
      }
      return;
    }
    const paint = () => {
      learnCanvas.style.setProperty("--gate-rise", riseOf(learnCanvas, learnReading.current).toFixed(4));
      certCanvas.style.setProperty("--gate-rise", riseOf(certCanvas, certReading.current).toFixed(4));
    };
    paint();
    const unsubscribes = [learnReading, certReading].map((reading) =>
      reading.subscribe(paint),
    );
    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe();
    };
  }, [learnReading, certReading, reduce]);

  // Pointer tilt for the dealer. Motion values keep a pointer sweep off
  // React's render path; they are switchable off through reduced motion or a
  // coarse pointer.
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
          ? "That edition is unavailable. Showing the latest preview edition."
          : "",
      );
    }
    restore();
    window.addEventListener("popstate", restore);
    return () => window.removeEventListener("popstate", restore);
  }, [items]);

  const insight = selectedInsight(items, selectedId);
  const railEvents = useMemo<RailEvent[]>(
    () =>
      items.map((item, index) => ({
        id: item.id,
        date: editionDate(item.date),
        iso: item.date,
        title: item.cardTitle,
        badge: index === 0 ? "Latest edition" : undefined,
      })),
    [items],
  );
  const changeExperiment = useCallback(
    (patch: Partial<ExperimentState>) =>
      setExperiments((previous) => ({
        ...previous,
        [selectedId]: { ...(previous[selectedId] ?? INITIAL_EXPERIMENT), ...patch },
      })),
    [selectedId],
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
      if (options?.scroll) {
        stageRef.current?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "start",
        });
      }
    },
    [items, reduce, selectedId],
  );

  // The status line reads the public Atlas projection and the approved
  // editions — never the review-preview flag and never a hand-written vertex.
  const field = useMemo(() => buildField(atlas, items), [atlas, items]);

  if (!insight) {
    return (
      <section className="mx-auto max-w-3xl px-5 py-32">
        <h1 className="text-3xl font-medium tracking-tight">
          The next insight is being checked.
        </h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          No eligible content is available yet. Existing lessons and practice
          remain open while editorial review continues.
        </p>
        <Link
          href="/learn"
          className="mt-6 inline-flex min-h-11 items-center rounded-full border border-border-strong px-5 text-sm"
        >
          Browse learning
        </Link>
      </section>
    );
  }

  const scene = scenes[insight.id] ?? CLOSED;
  const experiment = experiments[insight.id] ?? INITIAL_EXPERIMENT;
  const experimentId = experimentFor(insight);
  const cards = insightCards(insight).map((card) => ({
    ...card,
    zone: zones[card.id] ?? defaultZone(card.kind),
  }));
  const deck = cards.filter((card) => card.zone === "deck");
  const activeCard = cards.find((card) => card.id === activeCardId) ?? null;
  const body = activeCard ? cardBody(insight, activeCard.kind) : null;

  function toggleScene(key: keyof SceneState) {
    setScenes((previous) => {
      const current = previous[insight.id] ?? CLOSED;
      return {
        ...previous,
        [insight.id]:
          key === "revealed"
            ? { revealed: !current.revealed, evidenceOpen: current.revealed ? false : current.evidenceOpen }
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

  const dealer = (
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
        The principle card is on the table. Deal its caveat and its source
        check; nothing here is generated copy.
      </p>
    </motion.div>
  );

  return (
    <div>
      {/* pt clears the fixed site header; the first gate's canvas padding keeps
          its pinned content clear too. */}
      <div className="hansa-stage observatory relative isolate overflow-clip pt-[104px]">
        {/* ------------------------------------------------------- masthead */}
        <div className="mx-auto w-full max-w-[1320px] px-5 pt-5 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-strong pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <span>Hansa / Knowledge stage</span>
            <span>Editions under editorial review · Technical review</span>
          </div>
        </div>

        {/* ------------------------------------------------ GATE 0 — today */}
        <section aria-label="Today" className="stage-gate">
          <div className="stage-gate-canvas stage-gate-canvas-first">
            <StageToday
              editionDateLabel={editionDate(insight.date)}
              topic={insight.topic}
              editions={items.length}
              connections={{ pending: field.pending, links: field.links.length }}
              dealer={dealer}
              dealerStatus={status}
            />
          </div>
        </section>

        {/* --------------------------------------- GATE 1 — today's insight */}
        {/* bg-background is structural, not decorative: this tall section is
            what covers the pinned Gate 0 (and its open takeover) as the reader
            scrolls on. */}
        <section
          ref={stageRef}
          id="today"
          aria-labelledby="stage-insight-title"
          className="relative scroll-mt-24 border-t border-border-strong bg-background"
        >
          <div className="mx-auto w-full max-w-[1320px] px-5 py-14 md:px-8">
            <Reveal pattern="mask">
              <p className="stage-kicker">The day&rsquo;s insight</p>
              <h2 id="stage-insight-title" className="stage-gate-title">
                Today&rsquo;s idea, <em>dealt</em>.
              </h2>
              <p className="stage-section-note">
                The cards you dealt above, unfolded: work the situation, change
                one assumption, then walk the dated editions. Motion shows
                sequence and cause; every word stays readable without it.
              </p>
            </Reveal>

            <Reveal pattern="rise" order={1} className="mt-10">
              <InsightScene
                insight={insight}
                scene={scene}
                experimentId={experimentId}
                experiment={experiment}
                onExperimentChange={changeExperiment}
                onToggleReveal={() => toggleScene("revealed")}
                onToggleEvidence={() => toggleScene("evidenceOpen")}
                direction={direction}
              />
            </Reveal>

            <Reveal pattern="rotate" order={2} interval={CINEMATIC.stagger.wide} className="mt-14">
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
                onChange={changeExperiment}
              />
              <p className="observatory-caption">
                A conceptual instrument, not a live Fabric execution. Change an
                assumption; follow what changes, then read the exact model below.
              </p>
            </Reveal>

            <Reveal pattern="depth" order={0} duration={CINEMATIC.duration.entrySlow} className="mt-16">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                <span>Editions · newest first · drag to explore</span>
                <a
                  href="#archive"
                  className="underline decoration-border-strong underline-offset-4 hover:text-foreground hover:decoration-primary"
                >
                  Browse the archive
                </a>
              </div>
              <InsightRail
                events={railEvents}
                value={insight.id}
                onValueChange={choose}
                height={148}
                itemWidth={240}
              />
            </Reveal>
          </div>
        </section>

        {/* ------------------------------------------------ GATE 2 — learn */}
        <section
          ref={learnSectionRef}
          aria-labelledby="stage-learn-title"
          className="stage-gate border-t border-border-strong"
        >
          <div ref={learnCanvasRef} className="stage-gate-canvas">
            <StageLearnGate />
          </div>
        </section>

        {/* ------------------------------------------- GATE 3 — certificate */}
        <section
          ref={certSectionRef}
          aria-labelledby="stage-cert-title"
          className="stage-gate border-t border-border-strong"
        >
          <div ref={certCanvasRef} className="stage-gate-canvas">
            <StageCertGate />
          </div>
        </section>

        {/* ----------------------------------------- footer-context strips */}
        <div className="border-t border-border-strong bg-background">
          <StageAbout variant="compact" />
        </div>

        <section aria-label="Atlas context" className="border-t border-border-strong bg-background">
          <div className="mx-auto w-full max-w-[1320px] px-5 py-12 md:px-8">
            <Reveal pattern="depth" order={0} duration={CINEMATIC.duration.settle}>
              <StageAtlasPeek
                atlas={atlas}
                conceptId={insight.conceptId}
                lessonHref={insight.lessonHref}
                practiceHref={insight.practiceHref}
                contextTitle={insight.topic}
              />
            </Reveal>
          </div>
        </section>

        <section aria-label="Continue" className="border-t border-border-strong bg-background">
          <div className="mx-auto w-full max-w-[1320px] px-5 py-12 md:px-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Selected · {insight.topic} · {insight.cardTitle}
            </p>
            <nav aria-label="Continue learning" className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <Link
                href="/learn"
                className="inline-flex min-h-11 items-center underline decoration-border-strong underline-offset-4 hover:decoration-primary"
              >
                Learn the craft
              </Link>
              <Link
                href={insight.practiceHref}
                className="inline-flex min-h-11 items-center underline decoration-border-strong underline-offset-4 hover:decoration-primary"
              >
                Practise this area
              </Link>
              <Link
                href="/learn/dp-600/atlas/"
                className="inline-flex min-h-11 items-center underline decoration-border-strong underline-offset-4 hover:decoration-primary"
              >
                Check the Atlas state
              </Link>
              <Link
                href="/search/"
                className="inline-flex min-h-11 items-center underline decoration-border-strong underline-offset-4 hover:decoration-primary"
              >
                Search all of Hansa
              </Link>
            </nav>

            <p className="mt-10 text-[11px] leading-5 text-muted-foreground">
              {message || notice}
            </p>
            <p role="status" aria-live="polite" className="sr-only">
              {announcement}
            </p>
          </div>
        </section>
      </div>

      <InsightArchive items={items} onOpen={(id) => choose(id, { scroll: true })} />

      <noscript>
        <p className="mx-auto max-w-[1200px] px-5 pb-16 text-sm text-muted-foreground md:px-8">
          JavaScript is off. Every preview edition, its reasoning, caveat and
          source is readable in the archive above; the card table, the rail and
          the reasoning disclosure need JavaScript.
        </p>
      </noscript>
    </div>
  );
}

function labelFor(insight: Insight) {
  return `Edition ${editionDate(insight.date)}`;
}

export function editionDate(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
    .format(date)
    .toUpperCase();
}
