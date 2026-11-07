"use client";

// The Home's edition -> neighbourhood block (R2).
//
// It reuses the accepted R1 field, preview, panel and table fallback, but sits
// inside the knowledge scene of the selected edition instead of a separate page.
// The centre is the edition's concept; exploring a branch moves the centre and
// the breadcrumb without changing the selected edition or the URL. Every Atlas
// link carries the edition id so the desk can return here.
//
// The whole block is only mounted by the review build; the public Home never
// receives its props or its chunk.

import { useCallback, useMemo, useRef, useState } from "react";
import type { Atlas } from "@/lib/atlas/model";
import type { Insight } from "@/lib/knowledge/insights";
import { atlasDeskHref } from "@/lib/knowledge/edition-links";
import { buildNeighbourhood, layoutNeighbourhood } from "@/lib/knowledge/neighbourhood";
import { ConceptSearch } from "./search";
import { Field } from "./field";
import { ConceptPanel, FallbackTable } from "./panel";
import "./neighbourhood.css";

export function EditionNeighbourhood({
  atlas,
  insight,
}: {
  atlas: Atlas;
  insight: Insight;
}) {
  const initial =
    (atlas.concepts.some((concept) => concept.id === insight.conceptId)
      ? insight.conceptId
      : atlas.concepts[0]?.id) ?? "";
  const [centreId, setCentreId] = useState(initial);
  const [expanded, setExpanded] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const centreRef = useRef<HTMLHeadingElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const model = useMemo(
    () => buildNeighbourhood(atlas, centreId, { expand: expanded }),
    [atlas, centreId, expanded],
  );
  const placements = useMemo(
    () => (model ? layoutNeighbourhood(model.groups) : []),
    [model],
  );
  const deskHref = model ? atlasDeskHref(model.centre.id, insight.id) : "/learn/dp-600/atlas/";

  const choose = useCallback(
    (conceptId: string) => {
      const concept = atlas.concepts.find((item) => item.id === conceptId);
      if (!concept) return;
      setCentreId(conceptId);
      setExpanded(false);
      setPreviewId(null);
      setAnnouncement(`${concept.title} neighbourhood opened.`);
      requestAnimationFrame(() => centreRef.current?.focus());
    },
    [atlas],
  );

  if (!model) {
    return (
      <p className="nb-missing">
        This edition&rsquo;s concept is not part of the local review projection.
      </p>
    );
  }

  return (
    <section
      className="nb-review nb-embed"
      aria-label="The candidate neighbourhood behind this edition"
    >
      <nav className="nb-breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            Edition <span>{insight.date}</span>
          </li>
          <li>
            Concept <span>{model.centre.title}</span>
          </li>
          <li aria-current="page">Neighbourhood</li>
          <li>
            <a href={deskHref}>
              Atlas desk <span aria-hidden="true">↗</span>
            </a>
          </li>
        </ol>
      </nav>

      <div className="nb-embed-head">
        <div>
          <p className="nb-kicker">
            Candidate neighbourhood
            <span className="nb-review-tag">Technical review</span>
          </p>
          <p className="nb-embed-lead">
            Every branch is a recorded candidate relation behind this edition&rsquo;s
            concept. Follow one to move the neighbourhood; nothing here is published.
          </p>
        </div>
        <ConceptSearch
          atlas={atlas}
          inputRef={searchRef}
          onSelect={choose}
          onEscape={() => searchRef.current?.blur()}
        />
      </div>

      <p className="nb-review-bar">
        Edition: <strong>{insight.title}</strong> · {insight.topic} · {insight.date}. Candidate
        relations are labelled at every step; the public export stays closed.
      </p>

      <Field
        model={model}
        placements={placements}
        previewId={previewId}
        centreRef={centreRef}
        onPreview={setPreviewId}
        onExplore={choose}
        onToggleExpand={() => {
          setExpanded((current) => !current);
          setAnnouncement(
            expanded
              ? "Showing the first branches."
              : `Showing all ${model.total} relations.`,
          );
        }}
        atlasHref={(conceptId) => atlasDeskHref(conceptId, insight.id)}
        headingLevel="h3"
      />

      <ConceptPanel
        model={model}
        conceptCount={atlas.concepts.length}
        edgeCount={atlas.semanticEdges.length}
        expanded={expanded}
        onToggleExpand={() => setExpanded((current) => !current)}
        onExplore={choose}
        atlasHref={deskHref}
        lessonHref={insight.lessonHref}
        practiceHref={insight.practiceHref}
      />

      <FallbackTable model={model} onExplore={choose} />

      <p className="nb-sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
