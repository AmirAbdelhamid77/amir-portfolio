"use client";
// The stage behind the canonical Hansa landing (`components/knowledge/hansa-landing.tsx`),
// rendered by both `/` and its compatibility alias. One client boundary owns the
// selected edition, its scene state and the dealer's zones; every visual
// component below receives plain data and callbacks. Identity is always an
// insight ID, never a visual position.
//
// Phase 2 turns the page into one continuous spatial narrative:
//
//   Act I   — the Day's Insight card dealer is the hero. A principle card is
//             already on the table; the deck holds its caveat and evidence.
//   Handoff — scrolling turns that card into a field seed. The card does not
//             fade out and get replaced: it grows, squares up and dissolves into
//             the same centre the Atlas camera is already orbiting.
//   Act II  — the Spacetime Atlas: a real perspective camera travels through
//             vertices that are all public records, with the semantic relation
//             layer labelled as unpublished rather than invented.
//   Act III — the constellation hands over to the existing scenario, instrument,
//             date rail and archive, each entering with its own choreography.
//
// The whole page shares one selection state. Choosing an edition in the dealer,
// in the field, in the rail, in the archive or in the URL moves every act.

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
import { buildField, clamp01, smoothstep } from "@/lib/atlas/field";
import { CINEMATIC } from "@/lib/motion/cinematic";
import { InsightRail, type RailEvent } from "@/components/knowledge/insight-rail";
import { InsightScene, type SceneState } from "@/components/knowledge/insight-scene";
import { KnowledgeDealer, type DealerZone } from "@/components/knowledge/knowledge-dealer";
import { StageAtlasPeek } from "@/components/knowledge/atlas-peek-stage";
import { InsightArchive } from "@/components/knowledge/insight-archive";
import { KnowledgeAtmosphere } from "@/components/knowledge/knowledge-atmosphere";
import { KnowledgeInstrument } from "@/components/knowledge/knowledge-instrument";
import { Reveal } from "@/components/cinematic/reveal";
import { SpacetimeAtlas } from "@/components/cinematic/spacetime-atlas";
import { useCalmMotion } from "@/components/cinematic/use-calm-motion";
import { useScrollProgress, staticReading, type ScrollReading } from "@/components/cinematic/use-scroll-progress";
import "./observatory.css";
import "@/components/cinematic/cinematic.css";

const CLOSED: SceneState = { revealed: false, evidenceOpen: false };

/** The principle card starts on the table; caveat and evidence stay in the deck. */
const defaultZone = (kind: string): DealerZone => (kind === "principle" ? "hand" : "deck");

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
  const environmentRef = useRef<HTMLDivElement | null>(null);
  const editionLinkRef = useRef<HTMLAnchorElement | null>(null);
  const seedWrapRef = useRef<HTMLDivElement | null>(null);

  // Act progress. Three passive readings: the hero's first viewport of travel,
  // the handoff band, and the pinned Atlas. No scroll controller is installed,
  // so native scrolling, scroll restoration and anchors are untouched.
  const heroRef = useRef<HTMLElement | null>(null);
  const handoffRef = useRef<HTMLDivElement | null>(null);
  const fieldSectionRef = useRef<HTMLElement | null>(null);
  const heroReading = useScrollProgress(heroRef, "leave");
  const handoffReading = useScrollProgress(handoffRef, "pinned");
  const fieldReading = useScrollProgress(fieldSectionRef, "pinned");
  const fieldProgress = reduce ? staticReading(1) : fieldReading;

  // The three acts are choreographed through custom properties, not React
  // state: a scroll frame writes six numbers and the compositor does the rest.
  // Each property is written on the element that consumes it, never on the
  // stage root — an inherited custom property on 800 nodes invalidates the whole
  // subtree, which measured as ~100ms per frame on a throttled phone. Eased
  // values are pre-computed here because CSS has no smoothstep.
  useEffect(() => {
    const link = editionLinkRef.current;
    const seed = seedWrapRef.current;
    const environment = environmentRef.current;
    if (!link || !seed || !environment) return;
    const targets = [link, seed, environment];
    if (reduce) {
      for (const target of targets) {
        target.style.removeProperty("--hero-p");
        target.style.removeProperty("--handoff-p");
        target.style.removeProperty("--handoff-ease");
        target.style.removeProperty("--handoff-fade");
        target.style.removeProperty("--field-p");
      }
      return;
    }
    const paint = () => {
      const handoff = handoffReading.current;
      link.style.setProperty("--hero-p", heroReading.current.toFixed(4));
      seed.style.setProperty("--handoff-p", handoff.toFixed(4));
      seed.style.setProperty("--handoff-ease", smoothstep(handoff).toFixed(4));
      seed.style.setProperty(
        "--handoff-fade",
        smoothstep(clamp01((handoff - 0.68) / 0.32)).toFixed(4),
      );
      environment.style.setProperty("--field-p", fieldReading.current.toFixed(4));
    };
    paint();
    const unsubscribes = [heroReading, handoffReading, fieldReading].map((reading) =>
      reading.subscribe(paint),
    );
    return () => {
      for (const unsubscribe of unsubscribes) unsubscribe();
    };
  }, [heroReading, handoffReading, fieldReading, reduce]);

  // Pointer tilt for the hero dealer. Motion values keep a pointer sweep off
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

  // The field consumes the public Atlas projection and the approved editions,
  // never the review-preview flag and never a hand-written vertex.
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
          href="/learn/catalogue"
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

  return (
    <>
      <div
        ref={stageRef}
        className="hansa-stage observatory cine-root relative isolate overflow-clip"
      >
        <KnowledgeAtmosphere />
        <div ref={environmentRef} className="cine-environment" aria-hidden="true">
          <div className="cine-aurora" />
          <div className="cine-thread" />
        </div>

        {/* ------------------------------------------------------------ ACT I */}
        <section
          ref={heroRef}
          aria-labelledby="cine-hero-title"
          className="cine-hero"
        >
          <div className="mx-auto w-full max-w-[1320px] px-5 md:px-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-strong pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <span>Hansa / Knowledge stage</span>
              <span>Editions under editorial review · Technical review</span>
            </div>

            <div className="cine-hero-grid">
              <div>
                <p className="cine-kicker">The daily insight</p>
                <h1 id="cine-hero-title" className="cine-headline">
                  <span>One idea.</span>
                  <em>A different way to see it.</em>
                </h1>
                <p className="cine-lede">
                  Deal the card. Read the claim, its caveat and its source. Then
                  follow the same idea out of your hand and into a field you can
                  travel through.
                </p>

                <a ref={editionLinkRef} className="cine-edition-link" href="#today">
                  <span className="cine-edition-index" aria-hidden="true">
                    01
                  </span>
                  <span>
                    <time dateTime={insight.date}>{editionDate(insight.date)}</time>
                    <strong>{insight.title}</strong>
                  </span>
                  <ArrowUpRight aria-hidden="true" className="size-5 shrink-0" />
                </a>

                <p className="cine-hero-status">
                  <span>
                    <span className="dot" aria-hidden="true" />
                    {insight.topic} · {items.length} preview editions
                  </span>
                  <span>
                    {field.pending
                      ? "Atlas semantic layer awaiting publication"
                      : `${field.links.length} published connections`}
                  </span>
                </p>
              </div>

              <motion.div
                className="cine-dealer-stage"
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
                <div className="cine-dealer-halo" aria-hidden="true" />
                <div className="cine-dealer-ring" aria-hidden="true" />
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
                <p className="cine-dealer-caption">
                  The principle card is on the table. Deal its caveat and its
                  source check; nothing here is generated copy.
                </p>
              </motion.div>
            </div>

            <p className="cine-cue" aria-hidden="true">
              <span className="rail" />
              <span>Scroll · the card becomes an idea</span>
            </p>
          </div>
        </section>

        {/* -------------------------------------------------------- HANDOFF */}
        <section
          ref={handoffRef}
          aria-label="Transition from the card into the knowledge field"
          className="cine-handoff"
        >
          <div className="cine-handoff-pin">
            <div ref={seedWrapRef} className="cine-seed-wrap">
              <span aria-hidden="true" className="cine-seed-orbit" />
              <span aria-hidden="true" className="cine-seed-orbit" />
              <article className="cine-seed" aria-hidden="true">
                <div>
                  <p className="seed-index">Principle · {insight.topic}</p>
                  <h2>{insight.cardTitle}</h2>
                  <p>{insight.takeaway}</p>
                </div>
                <p className="seed-foot">
                  <span>{editionDate(insight.date)}</span>
                  <span>→ field</span>
                </p>
              </article>
            </div>
            <p className="cine-seed-caption" aria-hidden="true">
              A card becomes an idea · the field opens at the same centre
            </p>
          </div>
        </section>

        {/* ----------------------------------------------------------- ACT II */}
        <section
          ref={fieldSectionRef}
          id="field"
          aria-labelledby="cine-atlas-title"
          className="cine-atlas"
        >
          <div className="cine-atlas-pin">
            <div className="mx-auto w-full max-w-[1320px] px-5 md:px-8">
              <div className="cine-atlas-head">
                <div>
                  <p className="cine-kicker" style={{ color: "var(--primary)" }}>
                    02 / Knowledge Atlas
                  </p>
                  <h2 id="cine-atlas-title" className="cine-act-title">
                    An idea becomes <em>a constellation</em>.
                  </h2>
                </div>
                <p className="cine-atlas-note">
                  Every vertex is a reviewed edition, the concept that edition
                  states, or a real lesson, practice and source destination.
                  Scrolling moves the camera; you can also orbit, zoom and select.
                </p>
              </div>

              <SpacetimeAtlas
                field={field}
                progress={fieldProgress}
                selectedEditionId={insight.id}
                onSelectEdition={choose}
                conceptLabel={insight.topic}
              />

              <AtlasDolly reading={fieldProgress} />
            </div>
          </div>
        </section>

        {/* The coda is a sibling of the pinned section, not a child: while the
            camera is pinned the section owns the viewport, and the semantic
            layer only arrives after the travel has finished. */}
        <div className="cine-atlas-coda">
          <div className="mx-auto w-full max-w-[1320px] px-5 md:px-8">
            <Reveal pattern="depth" duration={CINEMATIC.duration.settle}>
              <StageAtlasPeek
                atlas={atlas}
                conceptId={insight.conceptId}
                lessonHref={insight.lessonHref}
                practiceHref={insight.practiceHref}
                contextTitle={insight.topic}
              />
            </Reveal>
          </div>
        </div>

        {/* ---------------------------------------------------------- ACT III */}
        <div className="cine-content">
          <div className="mx-auto w-full max-w-[1320px] px-5 md:px-8">
            <div className="cine-seam" aria-hidden="true">
              <span className="line" />
              <span className="node" />
              <span className="line" />
            </div>

            <Reveal pattern="mask" className="cine-act-head">
              <div>
                <p className="cine-kicker">
                  03 / Knowledge unfolds
                </p>
                <h2 className="cine-act-title">
                  The constellation becomes <em>something to do</em>.
                </h2>
              </div>
              <p>
                The field has handed over the edition you chose. Work the
                situation, change one assumption, then walk the dated editions.
                Motion is here to show sequence and cause; every word stays
                readable without it.
              </p>
            </Reveal>

            <div ref={stageRef} id="today" className="cine-study scroll-mt-24">
              <Reveal pattern="rise" order={0}>
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

              <Reveal
                pattern="rotate"
                order={1}
                interval={CINEMATIC.stagger.wide}
                className="cine-instrument"
              >
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
            </div>

            <Reveal
              pattern="depth"
              order={0}
              className="cine-time cine-block"
              duration={CINEMATIC.duration.entrySlow}
            >
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

            <Reveal pattern="slide-start" order={0} className="cine-block">
              <p className="cine-scroll-hint">
                Selected in the field · {insight.topic} · {insight.cardTitle}
              </p>
              <nav aria-label="Continue learning" className="cine-continue text-sm">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Continue
                </span>
                <Link
                  href="/learn/catalogue"
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
            </Reveal>

            <p className="pb-10 text-[11px] leading-5 text-muted-foreground">
              {message || notice}
            </p>
            <p role="status" aria-live="polite" className="sr-only">
              {announcement}
            </p>
          </div>
        </div>
      </div>

      <InsightArchive items={items} onOpen={(id) => choose(id, { scroll: true })} />

      <noscript>
        <p className="mx-auto max-w-[1200px] px-5 pb-16 text-sm text-muted-foreground md:px-8">
          JavaScript is off. Every preview edition, its reasoning, caveat and
          source is readable in the archive above; the rail, the card tray, the
          spatial field and the reasoning disclosure need JavaScript.
        </p>
      </noscript>
    </>
  );
}

function labelFor(insight: Insight) {
  return `Edition ${editionDate(insight.date)}`;
}

/**
 * The dolly readout is the one part of Act II that is real text, so it cannot be
 * a CSS variable. It subscribes to the reading in its own leaf component: a 1%
 * step re-renders this row and nothing else, while the camera itself moves every
 * frame without a React render.
 */
function AtlasDolly({ reading }: { reading: ScrollReading }) {
  const [percent, setPercent] = useState(() => Math.round(reading.current * 100));
  useEffect(
    () =>
      reading.subscribe((value) => {
        const next = Math.round(value * 100);
        setPercent((previous) => (previous === next ? previous : next));
      }),
    [reading],
  );
  return (
    <div className="cine-atlas-progress" aria-hidden="true">
      <span>dolly {percent}%</span>
      <span className="track">
        <span style={{ width: `${percent}%` }} />
      </span>
      <span>continue</span>
    </div>
  );
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

