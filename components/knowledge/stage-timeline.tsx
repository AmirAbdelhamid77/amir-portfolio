"use client";
// Scene 1 — the timeline. The first viewport of the canonical Home is a clock,
// not a gate: fifteen consecutive days, newest first, and an edition sits on its
// own date or nowhere. Selecting a date only inspects it; opening the edition is
// a separate control, which is the difference between reading the clock and
// dealing the cards.
//
// The clock is the public stage model, so a date can never borrow a neighbour's
// card and an audience that may not see an edition sees an honest empty day. The
// dealer is the audited renderer from `knowledge-dealer.tsx`, mounted here and
// keyed to the selected edition; this file owns no card state.

import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import type { Insight } from "@/lib/knowledge/insights";
import type { StageModel, TimelineDay } from "@/lib/knowledge/stage-model";

type StageTimelineProps = {
  model: StageModel;
  /** The full reviewed edition behind `selectedId`, or null for an empty clock. */
  insight: Insight | null;
  selectedId: string | null;
  dealerOpen: boolean;
  dealer: ReactNode;
  message: string;
  onSelect: (id: string) => void;
  onOpenDealer: () => void;
  onCloseDealer: () => void;
};

export function StageTimeline({
  model,
  insight,
  selectedId,
  dealerOpen,
  dealer,
  message,
  onSelect,
  onOpenDealer,
  onCloseDealer,
}: StageTimelineProps) {
  const hintId = useId();
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const track = useRef<HTMLOListElement>(null);
  const { days, editions, todayHasEdition, withheldEditions, emptyNotice } = model.timeline;
  const editionDays = days.filter((day) => day.editionId);
  const selectedDay = days.find((day) => day.editionId === selectedId) ?? null;
  const selectedEdition = editions.find((edition) => edition.id === selectedId) ?? null;
  // One stop for the whole strip. When the selected edition sits outside the
  // fifteen-day window (a quiet clock with older editions), the newest tick
  // takes the stop so the strip is never unreachable from the keyboard.
  const rovingId = editionDays.some((day) => day.editionId === selectedId)
    ? selectedId
    : (editionDays[0]?.editionId ?? null);

  // On a narrow screen the fifteen days scroll horizontally; bring the selected
  // edition into the middle of the strip on load and on selection, without
  // touching the page's own scroll position. On desktop the strip fits, so the
  // effect returns without doing anything.
  useEffect(() => {
    const list = track.current;
    const node = selectedId ? buttons.current.get(selectedId) : null;
    if (!list || !node || list.scrollWidth <= list.clientWidth + 1) return;
    const left = node.offsetLeft - list.clientWidth / 2 + node.clientWidth / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: "auto" });
  }, [selectedId]);

  // Arrow keys walk the edition days, not the quiet ones: a reader navigating by
  // keyboard is moving between editions, and an empty date has no card to show.
  // Plain closures, not useCallback: the compiler memoises them, and the old
  // dependency list held a per-render array the compiler could not preserve.
  function focusEdition(id: string) {
    requestAnimationFrame(() => buttons.current.get(id)?.focus());
  }

  function move(delta: number) {
    const index = editionDays.findIndex((day) => day.editionId === selectedId);
    const next = editionDays[Math.min(Math.max(index + delta, 0), editionDays.length - 1)];
    if (!next?.editionId) return;
    onSelect(next.editionId);
    focusEdition(next.editionId);
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, day: TimelineDay) {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      move(event.key === "ArrowRight" ? 1 : -1);
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const next = event.key === "Home" ? editionDays[0] : editionDays[editionDays.length - 1];
      if (!next?.editionId) return;
      onSelect(next.editionId);
      focusEdition(next.editionId);
      return;
    }
    if (event.key === "Enter" && day.editionId && day.editionId === selectedId) {
      // Enter on the selected date opens the edition; Space still selects.
      event.preventDefault();
      onOpenDealer();
    }
  }

  return (
    <div className="stage-scene-inner">
      <p className="stage-kicker">Today · the daily clock</p>
      <h1 id="stage-timeline-title" className="stage-scene-title">
        Choose a moment.
        <span className="stage-scene-title-rest">Follow the thread.</span>
      </h1>
      <p className="stage-section-note">
        Fifteen days, newest first. An edition sits on the date it was published
        and nowhere else; a quiet day stays quiet. Select a date to read it, then
        open the edition to deal its cards.
      </p>

      <p className="stage-notice" role="status" aria-live="polite">
        {[
          todayHasEdition ? "" : emptyNotice,
          withheldEditions > 0
            ? `${withheldEditions} further edition${withheldEditions === 1 ? "" : "s"} under editorial review ${withheldEditions === 1 ? "is" : "are"} not shown here.`
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      </p>

      <div
        className="stage-timeline"
        role="group"
        aria-label="Editions timeline"
        aria-describedby={hintId}
      >
        <p id={hintId} className="sr-only">
          Fifteen days, newest first. Use the left and right arrow keys to move
          between editions, Home to return to the newest, and Enter to open the
          selected edition. Every edition also has a permalink in the archive.
        </p>
        <ol ref={track} className="stage-timeline-track">
          {days.map((day) => {
            const active = Boolean(day.editionId) && day.editionId === selectedId;
            const content = (
              <>
                <time dateTime={day.date} className="stage-day-date">
                  {day.dayLabel}
                </time>
                <span
                  aria-hidden="true"
                  className="stage-day-mark"
                  data-state={day.editionId ? "edition" : "quiet"}
                />
                <span className="stage-day-title sr-only">
                  {day.editionTitle ?? "No edition"}
                </span>
                {day.reviewStatus ? (
                  <span className="stage-day-status">
                    {day.reviewStatus === "published" ? "Published" : "In review"}
                  </span>
                ) : (
                  // A quiet day reserves the same status line, so every tick's
                  // bar sits on one baseline instead of drifting with content.
                  <span className="stage-day-status" aria-hidden="true">
                    {"\u00A0"}
                  </span>
                )}
                {day.isToday ? <span className="sr-only">Today</span> : null}
              </>
            );

            if (!day.editionId) {
              return (
                <li
                  key={day.date}
                  className="stage-day"
                  data-has-edition="false"
                  data-today={day.isToday ? "true" : "false"}
                >
                  <span className="stage-day-static">{content}</span>
                </li>
              );
            }

            return (
              <li
                key={day.date}
                className="stage-day"
                data-has-edition="true"
                data-selected={active ? "true" : "false"}
                data-today={day.isToday ? "true" : "false"}
              >
                <button
                  ref={(node) => {
                    if (node) buttons.current.set(day.editionId as string, node);
                  }}
                  type="button"
                  aria-current={active ? "date" : undefined}
                  aria-pressed={active}
                  tabIndex={day.editionId === rovingId ? 0 : -1}
                  onClick={() => onSelect(day.editionId as string)}
                  onKeyDown={(event) => onKeyDown(event, day)}
                  className="stage-day-button"
                >
                  {content}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {editions.length === 0 ? (
        <div className="stage-peek">
          <p className="stage-peek-title">Nothing is published on this clock yet.</p>
          <p className="stage-peek-body">
            {model.timeline.emptyNotice} The archive below is honest about being
            empty too; the learning, practice and search destinations stay open
            while review continues.
          </p>
        </div>
      ) : null}

      {selectedEdition && insight ? (
        <div className="stage-peek">
          <div className="stage-peek-head">
            <p className="stage-kicker">
              Selected · {selectedDay?.dayLabel ?? selectedEdition.dayLabel}
            </p>
            <p className="stage-peek-meta">
              {selectedEdition.topic} · {selectedEdition.reviewStatus.replace("_", " ")}
            </p>
          </div>
          <h2 className="stage-peek-title">{insight.title}</h2>
          <p className="stage-peek-body">{insight.scenario}</p>
          <div className="stage-peek-actions">
            <button
              type="button"
              onClick={dealerOpen ? onCloseDealer : onOpenDealer}
              aria-expanded={dealerOpen}
              aria-controls={dealerOpen ? "today-deal" : undefined}
              className="stage-primary-action"
            >
              {dealerOpen ? "Close the card table" : "Open the edition"}
              <ArrowDown
                className={dealerOpen ? "size-4 rotate-180" : "size-4"}
                aria-hidden="true"
              />
            </button>
            <a href="#edition" className="stage-secondary-action">
              Read the full edition
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
            <a
              href={`/?insight=${encodeURIComponent(selectedEdition.id)}`}
              className="stage-quiet-link"
            >
              Permalink
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </div>
          {message ? <p className="stage-notice">{message}</p> : null}
        </div>
      ) : null}

      {dealerOpen && dealer ? (
        <div
          id="today-deal"
          role="region"
          aria-label="Today's edition card table"
          className="stage-deal"
        >
          <div className="stage-deal-head">
            <span>
              {selectedDay?.dayLabel ?? "Selected edition"} · the hand behind the
              claim
            </span>
            <button type="button" onClick={onCloseDealer} className="stage-quiet-link">
              Close the table
            </button>
          </div>
          {dealer}
        </div>
      ) : null}
    </div>
  );
}
