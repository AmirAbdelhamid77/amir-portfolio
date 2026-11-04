// Scene 3 — the closing. The stage ends by handing the reader somewhere real:
// the four destinations that already work (learning, practice, search, the Atlas
// desk), the review status of what they just read, and the identity strip. It is
// a signpost, not a sales page: no gate, no full-screen takeover, no promise that
// anything unpublished is coming.
//
// The live region lives here because this is the last thing a screen-reader user
// reaches; every selection and deal announcement from the scenes above is
// mirrored into it.

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Insight } from "@/lib/knowledge/insights";
import type { StageModel } from "@/lib/knowledge/stage-model";
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
};

export function StageClosing({
  model,
  insight,
  notice,
  message,
  announcement,
}: StageClosingProps) {
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
