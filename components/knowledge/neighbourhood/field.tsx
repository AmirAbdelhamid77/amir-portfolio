"use client";

// The field: one centre card, four labelled groups, curved connectors in the
// group colour, and a preview strip that answers "why is this branch here?".
//
// Positions are percentages produced by the pure layout in
// `lib/knowledge/neighbourhood.ts`, so the field is server-rendered and does not
// jump after hydration. Keyboard: Tab enters the branches, arrow keys move
// within a group, Enter/click explores, and the preview actions are the next
// stops in reading order.

import { type KeyboardEvent, type RefObject } from "react";
import { defaultView, viewHref } from "@/lib/atlas/model";
import {
  edgePath,
  kindLabel,
  type GroupKey,
  type Neighbour,
  type Neighbourhood,
  type Placement,
} from "@/lib/knowledge/neighbourhood";

const TONES: Record<GroupKey, string> = {
  requires: "primary",
  unlocks: "teal",
  contrasts: "magenta",
  related: "amber",
};

/**
 * The tag on a branch card. Only the `related` group carries a relation name,
 * and `related_in_decision` already begins with the group label — printing both
 * would read "Related · Related in a decision".
 */
function branchTag(entry: Neighbour, groupLabel: string): string {
  if (entry.group !== "related") return groupLabel;
  return entry.relationLabel.toLowerCase().startsWith(groupLabel.toLowerCase())
    ? entry.relationLabel
    : `${groupLabel} · ${entry.relationLabel}`;
}

function moveFocus(event: KeyboardEvent<HTMLButtonElement>, step: number | "first" | "last") {  const group = event.currentTarget.closest(".nb-group");
  const buttons = Array.from(group?.querySelectorAll<HTMLButtonElement>("button.nb-branch") ?? []);
  const index = buttons.indexOf(event.currentTarget);
  if (!buttons.length || index < 0) return;
  const next =
    step === "first"
      ? buttons[0]
      : step === "last"
        ? buttons[buttons.length - 1]
        : buttons[(index + step + buttons.length) % buttons.length];
  next?.focus();
}

export function Field({
  model,
  placements,
  previewId,
  centreRef,
  onPreview,
  onExplore,
  onToggleExpand,
  atlasHref,
  headingLevel = "h2",
}: {
  model: Neighbourhood;
  placements: Placement[];
  previewId: string | null;
  centreRef: RefObject<HTMLHeadingElement | null>;
  onPreview: (edgeId: string | null) => void;
  onExplore: (conceptId: string) => void;
  onToggleExpand: () => void;
  /** Desk link used by the preview; the embed adds its edition return id. */
  atlasHref?: (conceptId: string) => string;
  /** The Home already owns an h2 for the knowledge scene. */
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const hrefFor =
    atlasHref ?? ((conceptId: string) => viewHref({ ...defaultView(), concept: conceptId }));
  const position = new Map(placements.map((placement) => [placement.id, placement]));
  const preview = model.shown.find((entry) => entry.edge.id === previewId) ?? null;
  const expanded = model.hiddenCount === 0 && model.shown.length < model.total;

  return (
    <div className="nb-fieldcard">
      <div className="nb-field" data-expanded={model.hiddenCount === 0}>
        <svg
          className="nb-edges"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {model.shown.map((entry) => {
            const spot = position.get(entry.edge.id);
            if (!spot) return null;
            return (
              <path
                key={entry.edge.id}
                className={`nb-edge is-${TONES[entry.group]}${entry.edge.id === previewId ? " is-previewed" : ""}`}
                d={edgePath({ x: 50, y: 50 }, spot)}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        <div
          className="nb-centre"
          data-tone={TONES.requires}
          data-previewed={preview ? "true" : "false"}
        >
          <p className="nb-centre-kicker">
            Microsoft Fabric · {kindLabel(model.centre.kind)}
          </p>
          <Heading className="nb-centre-title" tabIndex={-1} ref={centreRef}>
            {model.centre.title}
          </Heading>
          <p className="nb-centre-def">{model.centre.definition}</p>
          <p className="nb-centre-meta">
            {model.total} recorded relation{model.total === 1 ? "" : "s"} · {model.membership.count} more{" "}
            {model.membership.label.toLowerCase()}
            {model.membership.count === 1 ? "" : "s"}
          </p>
        </div>

        {model.groups.map((group) =>
          group.entries.filter((entry) => entry.shown).length ? (
            <div
              key={group.key}
              className={`nb-group is-${group.tone}`}
              role="group"
              aria-label={`${group.label}: ${group.count} concept${group.count === 1 ? "" : "s"}`}
              style={{ display: "contents" }}
            >
              {group.entries
                .filter((entry) => entry.shown)
                .map((entry) => {
                  const spot = position.get(entry.edge.id);
                  if (!spot) return null;
                  return (
                    <button
                      key={entry.edge.id}
                      type="button"
                      className={`nb-branch is-${group.tone}${entry.edge.id === previewId ? " is-previewed" : ""}`}
                      style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                      onMouseEnter={() => onPreview(entry.edge.id)}
                      onFocus={() => onPreview(entry.edge.id)}
                      onClick={() => onExplore(entry.concept.id)}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                          event.preventDefault();
                          moveFocus(event, 1);
                        } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                          event.preventDefault();
                          moveFocus(event, -1);
                        } else if (event.key === "Home") {
                          event.preventDefault();
                          moveFocus(event, "first");
                        } else if (event.key === "End") {
                          event.preventDefault();
                          moveFocus(event, "last");
                        }
                      }}
                    >
                      <span className="nb-branch-tag">{branchTag(entry, group.label)}</span>
                      <span className="nb-branch-title">{entry.concept.title}</span>
                      <span className="nb-branch-state">
                        {entry.edge.editorialState === "published" ? "published" : "candidate"}
                      </span>
                      <span className="nb-sr-only">
                        {group.label}. {entry.directionSentence}
                      </span>
                    </button>
                  );
                })}
            </div>
          ) : null,
        )}
      </div>

      <div className="nb-field-foot">
        <p className="nb-field-hint">
          Hover or focus a branch to preview it. <strong>Enter</strong> explores; the Atlas link
          opens the desk.
        </p>
        <ul className="nb-legend" aria-label="Relation groups">
          {model.groups.map((group) => (
            <li key={group.key} className={`is-${group.tone}`} data-empty={group.count === 0}>
              <i aria-hidden="true" />
              {group.label}
              <span>{group.count}</span>
            </li>
          ))}
        </ul>
        {model.hiddenCount > 0 || expanded ? (
          <button type="button" className="nb-expand" onClick={onToggleExpand}>
            {expanded ? "Show fewer" : `Show all ${model.total}`}
          </button>
        ) : null}
      </div>

      <BranchPreview model={model} preview={preview} onExplore={onExplore} atlasHref={hrefFor} />
    </div>
  );
}

function BranchPreview({
  model,
  preview,
  onExplore,
  atlasHref,
}: {
  model: Neighbourhood;
  preview: Neighbour | null;
  onExplore: (conceptId: string) => void;
  atlasHref: (conceptId: string) => string;
}) {
  // One persistent live region: the idle copy and the preview copy swap inside
  // it, so a keyboard reader hears the branch's claim when focus moves.
  return (
    <div
      className={`nb-preview${preview ? "" : " is-idle"}`}
      data-tone={preview ? TONES[preview.group] : undefined}
      aria-live="polite"
      aria-atomic="true"
    >
      {preview ? (
        <>
          <p className="nb-preview-kicker">
            {preview.relationLabel} · {preview.directionLabel} ·{" "}
            {preview.edge.editorialState === "published" ? "published" : "candidate"}
          </p>
          <p className="nb-preview-title">{preview.concept.title}</p>
          <p className="nb-preview-claim">{preview.edge.claim}</p>
          <p className="nb-preview-conditions">Holds when: {preview.edge.conditions}</p>
          <div className="nb-preview-actions">
            <button type="button" className="nb-action-primary" onClick={() => onExplore(preview.concept.id)}>
              Explore connections
            </button>
            <a className="nb-action-link" href={atlasHref(preview.concept.id)}>
              Open in the Atlas desk <span aria-hidden="true">↗</span>
            </a>
          </div>
        </>
      ) : (
        <>
          <p className="nb-preview-title">Every branch carries its reason.</p>
          <p className="nb-preview-copy">
            {model.hiddenCount
              ? `${model.hiddenCount} more recorded relation${model.hiddenCount === 1 ? "" : "s"} sit outside the field. Expand to place them, or read the full table under the panel.`
              : "All recorded relations for this concept are on the field. The table under the panel lists every claim and condition."}
          </p>
        </>
      )}
    </div>
  );
}
