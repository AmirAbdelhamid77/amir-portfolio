"use client";

// Concept search for the neighbourhood review surface.
//
// A combobox with a real listbox: arrow keys move the active option, Enter opens
// it, Escape clears and then asks the parent to leave the field. The query is
// matched by the shared model over title, aliases and definition.

import { useMemo, useState, type RefObject } from "react";
import type { Atlas } from "@/lib/atlas/model";
import { degreeMap, searchNeighbourhood } from "@/lib/knowledge/neighbourhood";

const LIST_ID = "nb-search-results";

export function ConceptSearch({
  atlas,
  inputRef,
  onSelect,
  onEscape,
}: {
  atlas: Atlas;
  inputRef: RefObject<HTMLInputElement | null>;
  onSelect: (conceptId: string) => void;
  onEscape?: () => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const results = useMemo(() => searchNeighbourhood(atlas, query), [atlas, query]);
  const degree = useMemo(() => degreeMap(atlas), [atlas]);
  const open = query.trim().length > 0;

  function select(index: number) {
    const concept = results[index] ?? results[0];
    if (!concept) return;
    onSelect(concept.id);
    setQuery("");
    setActive(0);
  }

  return (
    <div className="nb-search">
      <div className="nb-search-field">
        <label className="nb-sr-only" htmlFor="nb-search-input">
          Search candidate concepts by title, alias or definition
        </label>
        <input
          ref={inputRef}
          id="nb-search-input"
          type="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={LIST_ID}
          aria-autocomplete="list"
          aria-activedescendant={open && results.length ? `nb-option-${active}` : undefined}
          placeholder={`Search ${atlas.concepts.length} candidate concepts`}
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && results.length) {
              event.preventDefault();
              setActive((current) => (current + 1) % results.length);
            } else if (event.key === "ArrowUp" && results.length) {
              event.preventDefault();
              setActive((current) => (current - 1 + results.length) % results.length);
            } else if (event.key === "Enter" && open) {
              event.preventDefault();
              select(active);
            } else if (event.key === "Escape") {
              if (query) {
                event.preventDefault();
                setQuery("");
                setActive(0);
              } else {
                onEscape?.();
              }
            }
          }}
        />
        <kbd className="nb-search-key" aria-hidden="true">
          /
        </kbd>
      </div>

      <p className="nb-sr-only" aria-live="polite">
        {open ? `${results.length} matching candidate concept${results.length === 1 ? "" : "s"}.` : ""}
      </p>

      {open ? (
        results.length ? (
          <ul className="nb-results" id={LIST_ID} role="listbox" aria-label="Matching concepts">
            {results.map((concept, index) => (
              <li
                key={concept.id}
                id={`nb-option-${index}`}
                role="option"
                aria-selected={index === active}
                className="nb-result"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(index)}
                onMouseEnter={() => setActive(index)}
              >
                <span className="nb-result-title">{concept.title}</span>
                <span className="nb-result-meta">
                  {degree.get(concept.id) ?? 0} relations · {concept.kind.replaceAll("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="nb-results nb-results-empty" role="status">
            No candidate concept matches “{query.trim()}”.
          </p>
        )
      ) : null}
    </div>
  );
}
