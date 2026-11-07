"use client";

// The entrance composition: the real Fabric corpus, its densest starters, and an
// explicit line about the four subjects that have reading rooms but no candidate
// relations yet. The prototype showed five equal subject columns; the candidate
// Atlas only contains one subject, so inventing four would be a lie.

import Link from "next/link";
import type { Atlas, Concept } from "@/lib/atlas/model";
import { degreeMap, type Entrance, type Neighbourhood } from "@/lib/knowledge/neighbourhood";

const OTHER_SUBJECTS = [
  { href: "/learn/sql", label: "SQL and relational querying" },
  { href: "/learn/statistics", label: "Statistics and inference" },
  { href: "/learn/visualization", label: "Data visualization" },
  { href: "/learn/analysis", label: "Analytical reasoning" },
];

export function Entrances({
  atlas,
  entrances,
  onChoose,
}: {
  atlas: Atlas;
  entrances: Entrance;
  onChoose: (conceptId: string) => void;
}) {
  const degree = degreeMap(atlas);
  return (
    <section className="nb-entrances" aria-labelledby="nb-entrances-title">
      <div className="nb-entrance-head">
        <div>
          <p className="nb-kicker">Subject entrances</p>
          <h2 id="nb-entrances-title" className="nb-entrance-title">
            Start from a subject,
            <br />
            <em>not a node.</em>
          </h2>
        </div>
        <p className="nb-entrance-copy">
          Subject membership is not a semantic relation. {entrances.total.length} candidate
          concepts and {entrances.edges} recorded relations are available for Microsoft Fabric;
          choose an entrance to open a local neighbourhood, or search the whole corpus.
        </p>
      </div>

      <div className="nb-entrance-grid">
        <article className="nb-domain" aria-labelledby="nb-domain-fabric">
          <div className="nb-domain-head">
            <h3 id="nb-domain-fabric">Microsoft Fabric</h3>
            <span className="nb-domain-count">{entrances.total.length}</span>
          </div>
          <p className="nb-domain-meta">DP-600 · candidate relations · technical review</p>
          <ul className="nb-starters">
            {entrances.starters.map((concept: Concept) => (
              <li key={concept.id}>
                <button type="button" className="nb-starter" onClick={() => onChoose(concept.id)}>
                  <span className="nb-starter-top">
                    <span className="nb-starter-title">{concept.title}</span>
                    <span className="nb-starter-degree">{degree.get(concept.id) ?? 0} relations</span>
                  </span>
                  <span className="nb-starter-def">{concept.definition}</span>
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="nb-domain nb-domain-quiet" aria-labelledby="nb-domain-other">
          <div className="nb-domain-head">
            <h3 id="nb-domain-other">Also taught here</h3>
            <span className="nb-domain-count">0</span>
          </div>
          <p className="nb-domain-meta">Reading rooms open · connections not yet recorded</p>
          <ul className="nb-other-subjects">
            {OTHER_SUBJECTS.map((subject) => (
              <li key={subject.href}>
                <Link href={subject.href}>{subject.label}</Link>
                <span>reading room</span>
              </li>
            ))}
          </ul>
          <p className="nb-entrance-note">
            No candidate concept relations are recorded for these subjects yet, so they are not
            drawn as empty graphs. The reading rooms stay open.
          </p>
        </article>
      </div>

      <p className="nb-corpus-shape">
        Corpus shape: {entrances.kinds.map((kind) => `${kind.count} ${kind.label.toLowerCase()}${kind.count === 1 ? "" : "s"}`).join(" · ")}.
        0 published.
      </p>
    </section>
  );
}

/** The compact toolbar shown above the field when a concept is open. */
export function FieldToolbar({
  model,
  onEntrances,
}: {
  model: Neighbourhood;
  onEntrances: () => void;
}) {
  return (
    <div className="nb-toolbar">
      <button type="button" className="nb-back" onClick={onEntrances}>
        ← All entrances
      </button>
      <p className="nb-mode">
        Neighbourhood of <strong>{model.centre.title}</strong>
      </p>
      <span className="nb-published">{model.published.concepts} published</span>
    </div>
  );
}
