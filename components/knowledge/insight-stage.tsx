"use client";
// Prototype C — Hybrid Knowledge Stage. One client boundary owns the selected
// edition, its scene state and the dealer's zones; every visual component below
// receives plain data and callbacks. Identity is always an insight ID, never a
// visual position.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  selectedInsight,
  type Insight,
} from "@/lib/knowledge/insights";
import type { Atlas } from "@/lib/atlas/model";
import {
  cardBody,
  experimentFor,
  INITIAL_EXPERIMENT,
  insightCards,
  type ExperimentState,
} from "@/lib/knowledge/models";
import { InsightRail, type RailEvent } from "@/components/knowledge/insight-rail";
import { InsightScene, type SceneState } from "@/components/knowledge/insight-scene";
import {
  KnowledgeDealer,
  type DealerZone,
} from "@/components/knowledge/knowledge-dealer";
import { StageAtlasPeek } from "@/components/knowledge/atlas-peek-stage";
import { InsightArchive } from "@/components/knowledge/insight-archive";
import { KnowledgeAtmosphere } from "@/components/knowledge/knowledge-atmosphere";

const CLOSED: SceneState = { revealed: false, evidenceOpen: false };

export function InsightStage({
  items,
  atlas,
  notice,
}: {
  items: Insight[];
  atlas: Atlas;
  notice: string;
}) {
  const reduce = useReducedMotion() ?? false;
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
    zone: zones[card.id] ?? ("deck" as DealerZone),
  }));
  const deck = cards.filter((card) => card.zone === "deck");
  const activeCard = cards.find((card) => card.id === activeCardId) ?? null;
  const body = activeCard ? cardBody(insight, activeCard.kind) : null;

  const railEvents: RailEvent[] = items.map((item, index) => ({
    id: item.id,
    date: editionDate(item.date),
    iso: item.date,
    title: item.cardTitle,
    badge: index === 0 ? "Latest edition" : undefined,
  }));

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
        if ((previous[card.id] ?? "deck") === "deck") next[card.id] = "hand";
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
        if ((previous[card.id] ?? "deck") === "hand") next[card.id] = "deck";
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
      closing
        ? "Card returned to the hand."
        : `${card?.eyebrow ?? "Knowledge"} card opened.`,
    );
  }

  return (
    <>
      <div className="hansa-stage relative isolate overflow-clip">
        <KnowledgeAtmosphere />

        <div className="mx-auto w-full max-w-[1200px] px-5 pt-24 md:px-8 md:pt-28">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-strong pb-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <span>Hansa / Knowledge stage</span>
            <span>Prototype C · local editorial preview</span>
          </div>

          <header className="mt-9 grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
                The daily insight
              </p>
              <h1 className="mt-3 max-w-[22ch] text-[clamp(2.15rem,4.4vw,3.4rem)] font-medium leading-[1.04] tracking-[-0.035em]">
                One idea.{" "}
                <span className="text-primary">A different way to see it.</span>
              </h1>
              <p className="mt-4 max-w-[46ch] text-[15px] leading-7 text-muted-foreground">
                Think through a situation. Reveal the reasoning. Follow the
                connection into the cards and the Atlas.
              </p>
            </div>
            <div className="hidden shrink-0 text-right md:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Latest edition
              </p>
              <p className="mt-1 text-sm tabular-nums" id="latest-edition">
                {editionDate(items[0].date)}
              </p>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border-strong px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-warning" />
                Technical review
              </p>
            </div>
          </header>

          <div className="mt-9">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <span>Editions · newest first</span>
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
              onValueChange={(id) => choose(id)}
              height={92}
              itemWidth={216}
            />
          </div>

          <div
            ref={stageRef}
            id="today"
            className="mt-7 grid scroll-mt-24 items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(340px,1fr)] lg:gap-8"
          >
            <InsightScene
              insight={insight}
              scene={scene}
              experimentId={experimentId}
              experiment={experiment}
              onExperimentChange={(patch) =>
                setExperiments((previous) => ({
                  ...previous,
                  [insight.id]: { ...(previous[insight.id] ?? INITIAL_EXPERIMENT), ...patch },
                }))
              }
              onToggleReveal={() => toggleScene("revealed")}
              onToggleEvidence={() => toggleScene("evidenceOpen")}
              direction={direction}
            />

            <motion.div
              key={insight.id}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? { duration: 0.1 } : { duration: 0.22 }}
              className="relative rounded-[26px] border border-border-strong bg-card/70 p-5 shadow-[0_1px_0_0_rgb(255_255_255/0.05)_inset,0_24px_50px_-40px_rgb(0_0_0/0.6)]"
            >
              <KnowledgeDealer
                cards={cards}
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
            </motion.div>
          </div>

          <div className="mt-12">
            <StageAtlasPeek
              atlas={atlas}
              conceptId={insight.conceptId}
              lessonHref={insight.lessonHref}
              practiceHref={insight.practiceHref}
            />
          </div>

          <nav
            aria-label="Continue learning"
            className="mt-11 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border-strong pt-6 pb-2 text-sm"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Continue
            </span>
            <Link href="/learn/catalogue" className="min-h-11 inline-flex items-center underline decoration-border-strong underline-offset-4 hover:decoration-primary">
              Learn the craft
            </Link>
            <Link href={insight.practiceHref} className="min-h-11 inline-flex items-center underline decoration-border-strong underline-offset-4 hover:decoration-primary">
              Practise this area
            </Link>
            <Link href="/learn/dp-600/atlas/" className="min-h-11 inline-flex items-center underline decoration-border-strong underline-offset-4 hover:decoration-primary">
              Explore the Atlas
            </Link>
            <Link href="/search/" className="min-h-11 inline-flex items-center underline decoration-border-strong underline-offset-4 hover:decoration-primary">
              Search all of Hansa
            </Link>
          </nav>

          <p className="pb-10 text-[11px] leading-5 text-muted-foreground">
            {message || notice}
          </p>
          <p role="status" aria-live="polite" className="sr-only">
            {announcement}
          </p>
        </div>
      </div>

      <InsightArchive items={items} onOpen={(id) => choose(id, { scroll: true })} />

      <noscript>
        <p className="mx-auto max-w-[1200px] px-5 pb-16 text-sm text-muted-foreground md:px-8">
          JavaScript is off. Every preview edition, its reasoning, caveat and
          source is readable in the archive above; the rail, the card tray and
          the reasoning disclosure need JavaScript.
        </p>
      </noscript>
    </>
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
