"use client";

// The concept panel and the table fallback.
//
// The panel is the reading surface for the centre concept: definition, corpus
// context, connections, membership, evidence and reading. The fallback is a real
// table with every recorded relation, its direction and its conditions; it is
// server-rendered and stays readable with JavaScript off.

import Link from "next/link";
import {
  kindLabel,
  type Neighbourhood,
} from "@/lib/knowledge/neighbourhood";

export function ConceptPanel({
  model,
  conceptCount,
  edgeCount,
  expanded,
  onToggleExpand,
  onExplore,
  atlasHref,
  lessonHref,
  practiceHref,
}: {
  model: Neighbourhood;
  conceptCount: number;
  edgeCount: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onExplore: (conceptId: string) => void;
  /** Review/embed surfaces can hand the concept to the Atlas desk. */
  atlasHref?: string;
  /** The edition's own next steps, when this panel is embedded in the Home. */
  lessonHref?: string;
  practiceHref?: string;
}) {
  return (
    <section className="nb-panel" aria-labelledby="nb-panel-title">
      <div className="nb-panel-head">
        <p className="nb-kicker">
          {kindLabel(model.centre.kind)} · {model.centre.editorialState.replaceAll("_", " ")} ·{" "}
          {model.published.concepts} published
        </p>
        {/* Not an <h2>: the concept is already the field's heading, and two
            identical headings on one page are noise in a screen-reader outline.
            The section is still named by this text via aria-labelledby. */}
        <p id="nb-panel-title" className="nb-panel-title">
          {model.centre.title}
        </p>
        <p className="nb-panel-def">{model.centre.definition}</p>
        {model.centre.aliases.length ? (
          <p className="nb-panel-aliases">
            Also called: {model.centre.aliases.join(" · ")}
          </p>
        ) : null}
      </div>

      <div className="nb-panel-grid">
        <section className="nb-panel-section" aria-labelledby="nb-panel-connections">
          <h3 id="nb-panel-connections">Connections</h3>
          <ul className="nb-counts">
            {model.groups.map((group) => (
              <li key={group.key} className={`is-${group.tone}`} data-empty={group.count === 0}>
                <i aria-hidden="true" />
                <span>{group.label}</span>
                <span className="nb-count">{group.count}</span>
              </li>
            ))}
          </ul>
          <p className="nb-panel-note">
            {model.total} recorded candidate relation{model.total === 1 ? "" : "s"}.{" "}
            {model.hiddenCount
              ? `${model.hiddenCount} sit outside the field.`
              : "All are placed on the field."}
          </p>
          {model.hiddenCount > 0 || expanded ? (
            <button type="button" className="nb-text-action" onClick={onToggleExpand}>
              {expanded ? "Show fewer in the field" : `Place all ${model.total} in the field`}
            </button>
          ) : null}
        </section>

        <section className="nb-panel-section" aria-labelledby="nb-panel-membership">
          <h3 id="nb-panel-membership">Same kind</h3>
          <p className="nb-panel-note">
            {model.membership.count} other {model.membership.label.toLowerCase()} concept
            {model.membership.count === 1 ? "" : "s"} share this kind without a recorded relation.
            Membership is context, not a semantic edge.
          </p>
          {model.membership.starters.length ? (
            <ul className="nb-chip-list">
              {model.membership.starters.map((concept) => (
                <li key={concept.id}>
                  <button type="button" className="nb-chip" onClick={() => onExplore(concept.id)}>
                    {concept.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="nb-panel-section" aria-labelledby="nb-panel-evidence">
          <h3 id="nb-panel-evidence">Evidence</h3>
          {model.evidence.length ? (
            <ul className="nb-source-list">
              {model.evidence.map((source) => (
                <li key={source.id}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.title}
                  </a>
                  <span>{source.locator}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="nb-panel-note">No source record is attached to this concept.</p>
          )}
        </section>

        <section className="nb-panel-section" aria-labelledby="nb-panel-reading">
          <h3 id="nb-panel-reading">Reading</h3>
          {model.reading.length ? (
            <ul className="nb-reading-list">
              {model.reading.map((resource) => (
                <li key={resource.id}>
                  <Link href={resource.href}>{resource.title}</Link>
                  <span>{resource.kind.replaceAll("-", " ")}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="nb-panel-note">
              No reading record is attached to this concept yet. The Atlas desk lists its evidence.
            </p>
          )}
          {lessonHref || practiceHref ? (
            <ul className="nb-reading-list nb-edition-reading">
              {lessonHref ? (
                <li>
                  <Link href={lessonHref}>Read the edition&rsquo;s lesson</Link>
                  <span>lesson</span>
                </li>
              ) : null}
              {practiceHref ? (
                <li>
                  <Link href={practiceHref}>Practise this area</Link>
                  <span>practice</span>
                </li>
              ) : null}
            </ul>
          ) : null}
        </section>
      </div>

      <p className="nb-coverage">
        Coverage: {conceptCount} candidate concepts and {edgeCount} recorded relations, all at
        technical review. {model.published.concepts} published concepts,{" "}
        {model.published.edges} published connections. Nothing on this surface is approved for
        publication.
      </p>
      {atlasHref ? (
        <p className="nb-panel-desk">
          <a href={atlasHref}>
            Open this concept in the Atlas desk <span aria-hidden="true">↗</span>
          </a>
        </p>
      ) : null}
    </section>
  );
}

export function FallbackTable({
  model,
  onExplore,
}: {
  model: Neighbourhood;
  onExplore: (conceptId: string) => void;
}) {
  const rows = model.groups.flatMap((group) => group.entries);
  return (
    <details className="nb-fallback">
      <summary>Text and table alternative to the graph</summary>
      <p className="nb-fallback-note">
        Every recorded relation around {model.centre.title}, including the ones outside the field.
        The group and the direction column state what the stored edge actually claims.
      </p>
      <div
        className="nb-table-scroll"
        tabIndex={0}
        role="region"
        aria-label={`Connections of ${model.centre.title}`}
      >
        <table className="nb-table">
          <caption>
            {model.total} recorded candidate relation{model.total === 1 ? "" : "s"} around{" "}
            {model.centre.title}.
          </caption>
          <thead>
            <tr>
              <th scope="col">Group</th>
              <th scope="col">Concept</th>
              <th scope="col">Direction</th>
              <th scope="col">Claim</th>
              <th scope="col">Conditions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((entry) => (
                <tr key={entry.edge.id}>
                  <th scope="row">{entry.groupLabel}</th>
                  <td>
                    <button type="button" className="nb-table-open" onClick={() => onExplore(entry.concept.id)}>
                      {entry.concept.title}
                    </button>
                  </td>
                  <td>{entry.directionSentence}</td>
                  <td>{entry.edge.claim}</td>
                  <td>{entry.edge.conditions}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>No recorded relations for this concept.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </details>
  );
}
