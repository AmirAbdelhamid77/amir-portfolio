"use client";
// R4 — the cinematic dealer.
//
// The prototype's dealer is a reading room, not a reveal: an edition rail, the
// whole hand, and a reader beside it. The shipped M6 stage turned that into one
// card at a time behind `Deal 2 more`, so the reader could no longer compare
// what an edition claims. This component restores the hand while keeping the
// accepted stage language (paper, ink, mono kickers, one primary accent).
//
// It is mounted only when `HANSA_DEALER_REVIEW=1` and only while open, through
// `next/dynamic`, so the public Home neither renders nor requests it.
//
// Deliberate limits:
//   - every card, capability and reader field comes from `dealer-hand.ts`,
//     which restates the edition's own reviewed fields;
//   - "technical review" is a state, never a publication claim;
//   - save is a local bookmark with a saved list inside the dealer, not a
//     site-wide pocket (that stays a later slice);
//   - motion is CSS-only: a staggered deal entrance, off under reduced motion.

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check, ChevronRight, X } from "lucide-react";
import type { Insight } from "@/lib/knowledge/insights";
import type { StageModel } from "@/lib/knowledge/stage-model";
import {
  SAVED_CARDS_EVENT,
  SAVED_CARDS_KEY,
  capabilityRow,
  dealPlan,
  dealerHand,
  dealerRail,
  nextCardId,
  parseSavedCards,
  savedGroups,
  toggleSavedCard,
  type DealerCard,
} from "@/lib/knowledge/dealer-hand";
import { dayLabel } from "@/lib/knowledge/stage-model";
import "./dealer-cinematic.css";

export type DealerCinematicProps = {
  insight: Insight;
  model: StageModel;
  /** Every edition the stage may show; used to resolve saved bookmarks. */
  items: Insight[];
  /** A saved card to open on arrival, if the reader came from the saved list. */
  startCardId?: string | null;
  onClose: () => void;
  /** Switch the edition in place; the stage keeps the modal open. */
  onSelectEdition: (id: string) => void;
  /** Close and move to the edition's knowledge scene. */
  onLocate: () => void;
  /** Open another edition at a saved card. */
  onOpenSaved: (editionId: string, cardId: string) => void;
};

export function DealerCinematic({
  insight,
  model,
  items,
  startCardId = null,
  onClose,
  onSelectEdition,
  onLocate,
  onOpenSaved,
}: DealerCinematicProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLElement>(null);
  const cardRefs = useRef(new Map<string, HTMLButtonElement>());
  const openerRef = useRef<HTMLElement | null>(null);
  const editionRef = useRef(insight.id);
  const titleId = useId();
  const summaryId = useId();

  const hand = useMemo(() => dealerHand(insight), [insight]);
  const rail = useMemo(
    () => dealerRail(model.timeline.days, insight.id),
    [insight.id, model.timeline.days],
  );
  const currentDay =
    rail.find((day) => day.isCurrent)?.label ?? dayLabel(insight.date);
  const plan = useMemo(() => dealPlan(hand.length), [hand.length]);

  const [activeId, setActiveId] = useState(
    () => hand.find((card) => card.id === startCardId)?.id ?? hand[0]?.id ?? "",
  );
  const [saved, setSaved] = useState<string[]>([]);
  const [announcement, setAnnouncement] = useState(
    `Deck opened. ${hand.length} card${hand.length === 1 ? "" : "s"} from ${currentDay}.`,
  );

  const activeCard =
    hand.find((card) => card.id === activeId) ?? hand[0] ?? null;
  const activeIndex = Math.max(
    0,
    hand.findIndex((card) => card.id === activeCard?.id),
  );
  const groups = useMemo(() => savedGroups(saved, items), [saved, items]);
  const savedHere = saved.filter((id) => id.startsWith(`${insight.id}::`));

  // Local bookmarks are read once on mount and written on every toggle. A
  // failure (private mode, disabled storage) leaves the dealer readable.
  useEffect(() => {
    try {
      setSaved(parseSavedCards(window.localStorage.getItem(SAVED_CARDS_KEY)));
    } catch {
      setSaved([]);
    }
  }, []);

  // Capture what opened the dialog and move focus into it. The focus is given
  // back by the scroll-lock effect below, after the background is no longer
  // inert (focusing an inert element is a silent no-op).
  useEffect(() => {
    openerRef.current = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => {
      const card = activeId ? cardRefs.current.get(activeId) : null;
      (card ?? dialogRef.current)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
    // Mount only: the opener is the control that existed before the dialog.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The page behind a modal does not scroll, and it is inert to pointer and
  // assistive navigation while the dialog owns the screen. Both are restored on
  // close so the stage is unchanged afterwards, and only then may focus return
  // to the control that opened the dialog.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    const overlay = overlayRef.current;
    const siblings = Array.from(document.body.children).filter(
      (element) => element !== overlay,
    );
    const previousInert = siblings.map((element) => element.hasAttribute("inert"));
    for (const element of siblings) element.setAttribute("inert", "");
    return () => {
      root.style.overflow = previous;
      siblings.forEach((element, index) => {
        if (!previousInert[index]) element.removeAttribute("inert");
      });
      openerRef.current?.focus?.({ preventScroll: true });
    };
  }, []);

  // A new edition re-deals from the first card; the same edition keeps the
  // reader's position.
  useEffect(() => {
    if (editionRef.current === insight.id) return;
    editionRef.current = insight.id;
    setActiveId(hand[0]?.id ?? "");
    setAnnouncement(
      `${currentDay}. ${hand.length} card${hand.length === 1 ? "" : "s"} dealt.`,
    );
  }, [currentDay, hand, insight.id]);

  // A saved card selected in the footer list wins over the edition's first card,
  // and the live region must name that card, not the deal.
  useEffect(() => {
    if (!startCardId) return;
    const card = hand.find((entry) => entry.id === startCardId);
    if (!card) return;
    setActiveId(card.id);
    const index = hand.findIndex((entry) => entry.id === card.id);
    setAnnouncement(
      `Card ${index + 1} of ${hand.length}: ${card.title}. ${card.kindLabel} card.`,
    );
  }, [hand, startCardId]);

  // Keep the current day visible in the rail without moving the page.
  useEffect(() => {
    const element = railRef.current?.querySelector<HTMLElement>(
      '[aria-current="date"]',
    );
    const strip = railRef.current;
    if (!element || !strip) return;
    strip.scrollTo({
      left: Math.max(
        0,
        element.offsetLeft - strip.clientWidth / 2 + element.clientWidth / 2,
      ),
      behavior: "auto",
    });
  }, [insight.id]);

  function persist(next: string[]) {
    setSaved(next);
    try {
      window.localStorage.setItem(SAVED_CARDS_KEY, JSON.stringify(next));
    } catch {
      // A bookmark that cannot be stored is still honoured for this session.
    }
    // The closing scene is a sibling of this dialog; it cannot see this state.
    // A same-tab event keeps its kept-cards list in step without a store.
    window.dispatchEvent(new Event(SAVED_CARDS_EVENT));
  }

  function choose(card: DealerCard) {
    setActiveId(card.id);
    const index = hand.findIndex((entry) => entry.id === card.id);
    setAnnouncement(
      `Card ${index + 1} of ${hand.length}: ${card.title}. ${card.kindLabel} card.`,
    );
    revealReader();
  }

  // Below 900 px the hand and the reader stack inside one scroller, so a tap
  // on a card can otherwise change a border somewhere off-screen. Bring the
  // reader into view only when it is not already visible; desktop never moves.
  function revealReader() {
    if (!window.matchMedia("(max-width: 900px)").matches) return;
    const reader = readerRef.current;
    const scroller = reader?.closest(".dc-body");
    if (!reader || !(scroller instanceof HTMLElement)) return;
    const bodyBox = scroller.getBoundingClientRect();
    const readerBox = reader.getBoundingClientRect();
    if (readerBox.top >= bodyBox.top + 8 && readerBox.top <= bodyBox.bottom - 96) {
      return;
    }
    reader.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }

  function chooseId(id: string | null) {
    if (!id) return;
    const card = hand.find((entry) => entry.id === id);
    if (card) choose(card);
  }

  function save(card: DealerCard) {
    const wasSaved = saved.includes(card.id);
    const next = toggleSavedCard(saved, card.id);
    persist(next);
    setAnnouncement(
      wasSaved
        ? `${card.title} removed from saved cards.`
        : `${card.title} saved in this browser.`,
    );
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((node) => node.offsetParent !== null || node === document.activeElement);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement as HTMLElement | null;
    if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    } else if (current && !dialog.contains(current)) {
      event.preventDefault();
      first.focus();
    }
  }

  return createPortal(
    <div ref={overlayRef} className="dc-overlay" data-dealer="cinematic">
      <div
        ref={dialogRef}
        id="dealer-cinematic"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={summaryId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
        className="dc-dialog"
      >
        <header className="dc-head">
          <div className="dc-head-copy">
            <p className="dc-kicker">
              daily edition <span aria-hidden="true">/</span> {currentDay}
              <span className="dc-topic"> · {insight.topic}</span>
            </p>
            <h2 id={titleId} className="dc-title">
              {insight.title}
            </h2>
            <p id={summaryId} className="dc-summary">
              {insight.scenario}
            </p>
          </div>
          <div className="dc-head-actions">
            <span className="dc-badge">
              {insight.reviewStatus === "published"
                ? "Published"
                : "Technical review · human pending"}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close the edition"
              className="dc-icon-button"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div
          ref={railRef}
          className="dc-rail"
          role="group"
          aria-label="Switch edition"
        >
          {rail.map((day) =>
            day.selectable ? (
              <button
                key={day.date}
                type="button"
                aria-current={day.isCurrent ? "date" : undefined}
                aria-label={`${day.label}${day.isToday ? ", today" : ""}`}
                title={`${day.label}${day.isToday ? ", today" : ""}`}
                onClick={() => day.editionId && onSelectEdition(day.editionId)}
                className="dc-day"
              >
                <span>{day.dayNumber}</span>
                <span className="dc-day-dot" aria-hidden="true" />
              </button>
            ) : (
              <span
                key={day.date}
                aria-disabled="true"
                title={`${day.label}, no edition`}
                className="dc-day is-quiet"
              >
                <span>{day.dayNumber}</span>
                <span className="dc-day-dot" aria-hidden="true" />
              </span>
            ),
          )}
        </div>

        <div className="dc-body">
          <section className="dc-hand-wrap" aria-label="The hand">
            <div className="dc-hand-head">
              <p className="dc-hand-label">
                {insight.reviewStatus === "published"
                  ? "The hand"
                  : "The hand, under review"}{" "}
                <span className="dc-mono">
                  {hand.length} card{hand.length === 1 ? "" : "s"}
                </span>
              </p>
              <ul className="dc-caps" aria-label="What this hand can do">
                {capabilityRow(hand).map((capability) => (
                  <li
                    key={capability.id}
                    data-on={capability.on ? "true" : "false"}
                  >
                    {capability.label}
                  </li>
                ))}
              </ul>
            </div>

            <div className="dc-deck" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>

            <ul className="dc-hand">
              {hand.map((card, index) => {
                const step = plan[index] ?? { delayMs: 0, rotate: 0, lift: 18 };
                const current = card.id === activeCard?.id;
                return (
                  <li key={`${insight.id}-${card.id}`}>
                    <button
                      ref={(node) => {
                        if (node) cardRefs.current.set(card.id, node);
                        else cardRefs.current.delete(card.id);
                      }}
                      type="button"
                      aria-current={current ? "true" : undefined}
                      aria-controls="dealer-reader"
                      aria-label={card.label}
                      onClick={() => choose(card)}
                      className="dc-card"
                      data-kind={card.kind}
                      data-active={current ? "true" : "false"}
                      style={
                        {
                          "--dc-delay": `${step.delayMs}ms`,
                          "--dc-rotate": `${step.rotate}deg`,
                          "--dc-lift": `${step.lift}px`,
                        } as CSSProperties
                      }
                    >
                      <span className="dc-card-top">
                        <span className="dc-kind" data-kind={card.kind}>
                          {card.kindLabel}
                        </span>
                        <span className="dc-mono">{card.reviewLabel}</span>
                      </span>
                      <span className="dc-card-title">{card.title}</span>
                      <span className="dc-card-summary">{card.summary}</span>
                      <span className="dc-caps dc-card-caps" aria-hidden="true">
                        {capabilityRow(hand).map((capability) => (
                          <span
                            key={capability.id}
                            data-on={
                              card.capabilities[capability.id] ? "true" : "false"
                            }
                          >
                            {capability.label}
                          </span>
                        ))}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="dc-hand-note">
              Select a card to read it. Every card states what it can do:
              discover, read, assess or relate.
            </p>
          </section>

          <article
            ref={readerRef}
            id="dealer-reader"
            className="dc-reader"
            aria-label="Selected card reader"
            tabIndex={-1}
          >
            {activeCard ? (
              <>
                <div className="dc-reader-kicker">
                  <span>{activeCard.kindLabel}</span>
                  <span>{activeCard.reviewLabel}</span>
                  <span>
                    card {activeIndex + 1} / {hand.length}
                  </span>
                </div>
                <h3 className="dc-reader-title">{activeCard.title}</h3>
                <p className="dc-reader-lede">{activeCard.summary}</p>

                <dl className="dc-fields">
                  {activeCard.fields.map((field) => (
                    <div key={field.label} data-tone={field.tone}>
                      <dt>{field.label}</dt>
                      <dd dir="auto">{field.value}</dd>
                    </div>
                  ))}
                </dl>

                {activeCard.evidence ? (
                  <section className="dc-evidence" aria-label="Evidence">
                    <p className="dc-mono">Evidence</p>
                    <blockquote dir="auto">
                      “{activeCard.evidence.quote}”
                    </blockquote>
                    <p className="dc-mono">
                      {activeCard.evidence.attribution}
                    </p>
                  </section>
                ) : null}

                <section className="dc-why" aria-label="Why this card">
                  <p className="dc-mono">Why this card</p>
                  <p>
                    {activeCard.provenance.source} ·{" "}
                    {activeCard.provenance.locator}
                  </p>
                  <p className="dc-mono">
                    Reviewed by {activeCard.provenance.reviewer} · source
                    checked {activeCard.provenance.checked}
                  </p>
                </section>

                <div className="dc-reader-actions">
                  <button
                    type="button"
                    onClick={() => save(activeCard)}
                    className="dc-button is-primary"
                  >
                    <Check className="size-4" aria-hidden="true" />
                    {saved.includes(activeCard.id)
                      ? "Saved · remove"
                      : "Save for later"}
                  </button>
                  <button
                    type="button"
                    onClick={() => chooseId(nextCardId(hand, activeCard.id))}
                    className="dc-button"
                  >
                    Next card
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                  <a
                    href={activeCard.href}
                    {...(activeCard.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer noopener" }
                      : {})}
                    className="dc-link"
                  >
                    {activeCard.hrefLabel}
                    <ChevronRight className="size-3.5" aria-hidden="true" />
                  </a>
                </div>

                <p className="dc-saved-note">
                  {savedHere.length
                    ? `${savedHere.length} card${savedHere.length === 1 ? "" : "s"} from this edition saved in this browser.`
                    : "Saved cards stay in this browser. A bookmark is not mastery and not a published claim."}
                </p>
              </>
            ) : (
              <p className="dc-empty">
                This edition has no cards. The dealer does not invent one to fill
                the space.
              </p>
            )}
          </article>
        </div>

        <footer className="dc-foot">
          <p className="dc-foot-note">
            Technical review is not publication. Every card restates this
            edition&rsquo;s own reviewed fields; 0 published.
          </p>
          <div className="dc-foot-actions">
            <details className="dc-saved">
              <summary>
                Saved <span className="dc-mono">{groups.length}</span>
              </summary>
              <div className="dc-saved-panel">
                {groups.length ? (
                  <ul>
                    {groups.map((group) => (
                      <li key={group.cardId}>
                        <button
                          type="button"
                          onClick={() =>
                            onOpenSaved(group.editionId, group.cardId)
                          }
                        >
                          <span>{group.title}</span>
                          <span className="dc-mono">
                            {group.kindLabel} · {group.day}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No saved cards in this browser.</p>
                )}
              </div>
            </details>
            <button type="button" onClick={onClose} className="dc-text-button">
              Back to the timeline
            </button>
            <button
              type="button"
              onClick={onLocate}
              className="dc-button is-primary"
            >
              Locate in the edition
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </footer>

        <p className="sr-only" role="status" aria-live="polite">
          {announcement}
        </p>
      </div>
    </div>,
    document.body,
  );
}
