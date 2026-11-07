// Scene 3 — the closing.
//
// The public close is a signpost: the four destinations that already work, the
// review status of what the reader just saw, and the identity strip. R5 adds a
// review-only close behind `HANSA_CLOSING_REVIEW=1` that restores the
// prototype's argument: one idea from the selected edition, one action that
// reopens it, the cards kept in this browser, and a coverage ledger that says
// what was read and what was not. With the flag off the public DOM is unchanged.
//
// The live region lives here because this is the last thing a screen-reader user
// reaches; every selection and deal announcement from the scenes above is
// mirrored into it.

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Insight } from "@/lib/knowledge/insights";
import type { StageModel } from "@/lib/knowledge/stage-model";
import {
  COVERAGE_LIMITS,
  closingAction,
  closingClaims,
  closingIdea,
  closingNotice,
  coverageDecisions,
  coverageDenominators,
  coverageLedger,
  coverageNote,
} from "@/lib/knowledge/closing";
import {
  SAVED_CARDS_EVENT,
  SAVED_CARDS_KEY,
  parseSavedCards,
  savedGroups,
  type SavedGroupEntry,
} from "@/lib/knowledge/dealer-hand";
import { StageAbout } from "./stage-about";

type StageClosingProps = {
  model: StageModel;
  insight: Insight | null;
  /** The feed's own notice, printed verbatim when there is one. */
  notice: string;
  /** A resolution message from the URL (an unavailable edition, for instance). */
  message: string;
  /** The polite live region fed by the timeline and the dealer. */
  announcement: string;
  /** R5: the review-only close. With the flag off, none of its markup renders. */
  closingReview?: boolean;
  /** Every visible edition; used to resolve browser bookmarks. */
  items?: readonly Insight[];
  /** Reopen the selected edition (dealer when available, timeline otherwise). */
  onReopen?: (editionId: string | null) => void;
  /** Open a card kept in this browser. */
  onOpenSaved?: (editionId: string, cardId: string) => void;
};

function useSavedCards(enabled: boolean, items: readonly Insight[]): SavedGroupEntry[] {
  const [saved, setSaved] = useState<string[]>([]);

  // Browser storage is read after mount only: the static export must render the
  // empty state on the server, and a disabled storage API must not break the
  // close. A bookmark for an edition this audience may not see disappears. The
  // dealer signals same-tab saves, because the closing scene is a sibling and
  // cannot see the dialog's state.
  useEffect(() => {
    if (!enabled) return;
    const read = () => {
      try {
        setSaved(parseSavedCards(window.localStorage.getItem(SAVED_CARDS_KEY)));
      } catch {
        setSaved([]);
      }
    };
    read();
    window.addEventListener(SAVED_CARDS_EVENT, read);
    return () => window.removeEventListener(SAVED_CARDS_EVENT, read);
  }, [enabled]);

  return enabled ? savedGroups(saved, items) : [];
}

export function StageClosing({
  model,
  insight,
  notice,
  message,
  announcement,
  closingReview = false,
  items = [],
  onReopen,
  onOpenSaved,
}: StageClosingProps) {
  const saved = useSavedCards(closingReview, items);

  if (closingReview) {
    const idea = closingIdea(insight);
    const action = closingAction(insight, model);
    const rows = coverageLedger(model);
    const denominators = coverageDenominators();
    const decisions = coverageDecisions();

    return (
      <div className="stage-scene-inner">
        <div className="stage-close-layout">
          <div className="stage-close-main">
            <p className="stage-kicker">
              Close <span aria-hidden="true">/</span> one idea, one action
            </p>
            <h2 id="stage-closing-title" className="stage-scene-title stage-scene-title-sm">
              Leave with one idea{" "}
              <span className="stage-scene-title-rest">and one honest action.</span>
            </h2>

            {idea ? (
              <figure className="stage-close-idea">
                <blockquote className="stage-close-quote">
                  <p>“{idea.quote}”</p>
                </blockquote>
                <figcaption className="stage-close-credit">
                  <span>{idea.cardTitle}</span>
                  <span className="stage-close-credit-part">
                    <span aria-hidden="true">·</span>
                    {idea.topic}
                  </span>
                  <span className="stage-close-credit-part">
                    <span aria-hidden="true">·</span>
                    {idea.day}
                  </span>
                  <span className="stage-close-credit-part stage-close-source">
                    <span aria-hidden="true">·</span>
                    {idea.sourceId}
                  </span>
                </figcaption>
                <p className="stage-close-condition">
                  <span className="stage-close-condition-label">The condition</span>
                  {idea.caveat}
                </p>
              </figure>
            ) : (
              <p className="stage-section-note">
                No edition is selected yet. The ledger below is still the honest
                count, and the timeline is one step away.
              </p>
            )}

            <div className="stage-close-actions">
              <button
                type="button"
                className="stage-primary-action"
                onClick={() => onReopen?.(action.editionId)}
              >
                {action.label}
                <ArrowRight className="size-4" aria-hidden="true" />
              </button>
              <a href="#archive" className="stage-secondary-action">
                Every edition in the archive
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>

            <p className="stage-close-posture">{closingNotice(model)}</p>

            <section aria-labelledby="stage-kept-title" className="stage-close-kept">
              <div className="stage-close-section-head">
                <h3 id="stage-kept-title">Kept in this browser</h3>
                <span className="stage-close-count">
                  {saved.length} {saved.length === 1 ? "card" : "cards"}
                </span>
              </div>
              {saved.length ? (
                <ul className="stage-close-saved">
                  {saved.map((entry) => (
                    <li key={entry.cardId}>
                      <button
                        type="button"
                        className="stage-close-saved-button"
                        onClick={() => onOpenSaved?.(entry.editionId, entry.cardId)}
                        aria-label={`Open saved card: ${entry.title}, ${entry.kindLabel}, ${entry.day}`}
                      >
                        <span className="stage-close-saved-title">{entry.title}</span>
                        <span className="stage-close-saved-meta">
                          {entry.kindLabel} · {entry.day}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="stage-close-empty">
                  Nothing saved yet. Cards kept in the dealer stay in this browser
                  only; they are bookmarks, not mastery records.
                </p>
              )}
            </section>

          </div>

          <aside className="stage-close-ledger" aria-labelledby="stage-ledger-title">
            <p className="stage-close-ledger-kicker">Coverage ledger · 1 Nov 2026</p>
            <h3 id="stage-ledger-title">What was read, and what was not</h3>
            <dl className="stage-close-ledger-list">
              {rows.map((row) => (
                <div key={row.id}>
                  <dt>{row.label}</dt>
                  <dd>
                    {row.value}
                    {row.note ? <span> {row.note}</span> : null}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="stage-close-ledger-note">{coverageNote()}</p>

            <section aria-labelledby="stage-claims-title" className="stage-close-claims">
              <h3 id="stage-claims-title">What this does not claim</h3>
              <ul>
                {closingClaims().map((claim) => (
                  <li key={claim}>{claim}</li>
                ))}
              </ul>
            </section>

            <details className="stage-close-details">
              <summary>Read the full coverage note</summary>
              <div className="stage-close-details-body">
                <h4>Denominators</h4>
                <dl>
                  {denominators.map((row) => (
                    <div key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <h4>Review decisions</h4>
                <dl>
                  {decisions.map((row) => (
                    <div key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
                <h4>Limits</h4>
                <ul>
                  {COVERAGE_LIMITS.map((limit) => (
                    <li key={limit}>{limit}</li>
                  ))}
                </ul>
                <p className="stage-close-source-line">
                  Source: <code>{`intelligent-atlas/analysis/semantic-ledger-summary.json`}</code>,
                  generated 1 Nov 2026. Agent technical review only; human review
                  pending.
                </p>
              </div>
            </details>

            <Link href="/learn/dp-600/atlas/" className="stage-quiet-link stage-close-atlas">
              Check the Atlas desk
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </Link>
          </aside>
        </div>

        <div className="stage-close-destinations">
          <h3>Still open today</h3>
          <ul className="stage-destinations">
            {model.closing.destinations.map((destination) => (
              <li key={destination.href}>
                <Link href={destination.href} className="stage-destination">
                  <span className="stage-destination-label">{destination.label}</span>
                  <span className="stage-destination-description">
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
        </div>

        <div className="stage-closing-foot">
          <StageAbout variant="compact" />
          <p className="stage-closing-notice">{message || notice}</p>
          <p role="status" aria-live="polite" className="sr-only">
            {announcement}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="stage-scene-inner">
      <p className="stage-kicker">The way onward</p>
      <h2 id="stage-closing-title" className="stage-scene-title stage-scene-title-sm">
        Nothing here is a dead end.
      </h2>
      <p className="stage-section-note">
        The editions on this page are a review surface, so the rest of Hansa
        stays one step away: the subjects, the question banks, the search index
        and the Atlas desk all work today.
      </p>

      <p className="stage-notice">{model.review.notice}</p>

      {insight ? (
        <div className="stage-continue">
          <p className="stage-peek-meta">
            Selected · {insight.topic} · {insight.cardTitle}
          </p>
          <nav aria-label="Continue this edition" className="stage-continue-links">
            <Link href={insight.lessonHref} className="stage-secondary-action">
              Read the lesson behind it
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            <Link href={insight.practiceHref} className="stage-secondary-action">
              Practise this area
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
            <a href="#archive" className="stage-quiet-link">
              Every edition in the archive
              <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
          </nav>
        </div>
      ) : null}

      <ul className="stage-destinations">
        {model.closing.destinations.map((destination) => (
          <li key={destination.href}>
            <Link href={destination.href} className="stage-destination">
              <span className="stage-destination-label">{destination.label}</span>
              <span className="stage-destination-description">
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

      <div className="stage-closing-foot">
        <StageAbout variant="compact" />
        <p className="stage-closing-notice">{message || notice}</p>
        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>
      </div>
    </div>
  );
}
