"use client";

// R1 review root. One client boundary owns the selected concept, the search, the
// expand state and the preview; every child receives plain data and callbacks.
//
// The route is a review surface, not the Home: it never changes publication,
// never writes learner progress and can be deleted without touching the stage.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Atlas } from "@/lib/atlas/model";
import {
  buildEntrances,
  buildNeighbourhood,
  layoutNeighbourhood,
} from "@/lib/knowledge/neighbourhood";
import { ConceptSearch } from "./search";
import { Entrances, FieldToolbar } from "./entrances";
import { Field } from "./field";
import { ConceptPanel, FallbackTable } from "./panel";
import "./neighbourhood.css";

export function NeighbourhoodReview({
  atlas,
  initialConceptId,
}: {
  atlas: Atlas;
  /** Chosen on the server so no candidate identifier ships in the client bundle. */
  initialConceptId: string;
}) {
  const [centreId, setCentreId] = useState(initialConceptId);
  const [mode, setMode] = useState<"field" | "entrances">("field");
  const [expanded, setExpanded] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const centreRef = useRef<HTMLHeadingElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const model = useMemo(
    () => buildNeighbourhood(atlas, centreId, { expand: expanded }),
    [atlas, centreId, expanded],
  );
  const placements = useMemo(() => (model ? layoutNeighbourhood(model.groups) : []), [model]);
  const entrances = useMemo(() => buildEntrances(atlas), [atlas]);

  const choose = useCallback(
    (conceptId: string) => {
      const concept = atlas.concepts.find((item) => item.id === conceptId);
      if (!concept) return;
      setCentreId(conceptId);
      setMode("field");
      setExpanded(false);
      setPreviewId(null);
      setAnnouncement(`${concept.title} neighbourhood opened.`);
      if (typeof window !== "undefined") {
        window.history.replaceState(
          null,
          "",
          `?concept=${encodeURIComponent(conceptId)}`,
        );
      }
      requestAnimationFrame(() => centreRef.current?.focus());
    },
    [atlas],
  );

  // The URL is read only on mount; it is written only when the reader chooses.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("concept");
    if (requested && atlas.concepts.some((concept) => concept.id === requested)) {
      setCentreId(requested);
    }
  }, [atlas]);

  // `/` focuses search from anywhere that is not already a text field.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable === true;
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section
      className="nb-review"
      aria-labelledby="nb-page-title"
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        const target = event.target as HTMLElement | null;
        if (target instanceof HTMLInputElement) return;
        if (mode === "field") {
          event.preventDefault();
          setMode("entrances");
          setPreviewId(null);
          setAnnouncement("Subject entrances.");
        }
      }}
    >
      <div className="nb-masthead">
        <div className="nb-masthead-main">
          <p className="nb-kicker">
            Knowledge / Neighbourhood
            <span className="nb-review-tag">Review surface</span>
          </p>
          <h1 id="nb-page-title" className="nb-title">
            One idea,
            <br />
            <em>its neighbourhood.</em>
          </h1>
        </div>
        <div className="nb-masthead-side">
          <p className="nb-masthead-status">
            {atlas.concepts.length} candidate concepts · {atlas.semanticEdges.length} recorded
            relations · {model?.published.concepts ?? 0} published
          </p>
          <ConceptSearch
            atlas={atlas}
            inputRef={searchRef}
            onSelect={choose}
            onEscape={() => setMode("entrances")}
          />
        </div>
      </div>

      <p className="nb-review-bar">
        Candidate relations · technical review · local review surface. Nothing here is approved
        for publication, and the public export stays closed.{" "}
        <a href="/learn/dp-600/atlas/">Open the Atlas desk</a> for the exploratory view.
      </p>

      {mode === "entrances" ? (
        <Entrances atlas={atlas} entrances={entrances} onChoose={choose} />
      ) : model ? (
        <>
          <FieldToolbar model={model} onEntrances={() => setMode("entrances")} />
          <Field
            model={model}
            placements={placements}
            previewId={previewId}
            centreRef={centreRef}
            onPreview={setPreviewId}
            onExplore={choose}
            onToggleExpand={() => {
              setExpanded((current) => !current);
              setAnnouncement(expanded ? "Showing the first branches." : `Showing all ${model.total} relations.`);
            }}
          />
          <ConceptPanel
            model={model}
            conceptCount={atlas.concepts.length}
            edgeCount={atlas.semanticEdges.length}
            expanded={expanded}
            onToggleExpand={() => setExpanded((current) => !current)}
            onExplore={choose}
          />
          <FallbackTable model={model} onExplore={choose} />
        </>
      ) : (
        <p className="nb-missing">That concept is not part of the review projection.</p>
      )}

      <p className="nb-sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
    </section>
  );
}
