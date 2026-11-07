// Links between an edition and the two knowledge surfaces.
//
// The edition lives on the Home (`/?insight=<id>#edition`), the local
// neighbourhood lives in the knowledge scene, and the Atlas desk is a separate
// route. These pure helpers keep the hand-off typed and validated in one place:
// an unknown or hostile value degrades to the plain surface, never to an
// arbitrary destination.

import { defaultView, viewHref } from "../atlas/model.ts";

/** Query key that carries the edition to the Atlas desk and back. */
export const EDITION_PARAM = "return";

/** `hansa-insight-shortcut-reference-v1` and its siblings. */
const EDITION_ID = /^hansa-insight-[a-z0-9-]{1,100}$/;
/** `concept:fabric:shortcut` and its siblings; no paths, no schemes. */
const CONCEPT_ID = /^concept:[a-z0-9:_-]{1,160}$/;

export function isEditionId(value: unknown): value is string {
  return typeof value === "string" && EDITION_ID.test(value);
}

export function isConceptId(value: unknown): value is string {
  return typeof value === "string" && CONCEPT_ID.test(value);
}

/** The Home's existing edition deep link, anchored on the knowledge scene. */
export function homeEditionHref(editionId: string): string {
  return isEditionId(editionId)
    ? `/?insight=${encodeURIComponent(editionId)}#edition`
    : "/";
}

/**
 * The Atlas desk for one concept, optionally carrying the edition that sent the
 * reader there. The desk validates the value again before rendering a return
 * link, so a copied URL cannot point somewhere else.
 */
export function atlasDeskHref(conceptId: string, editionId?: string): string {
  if (!isConceptId(conceptId)) return "/learn/dp-600/atlas/";
  const href = viewHref({ ...defaultView(), concept: conceptId });
  return isEditionId(editionId)
    ? `${href}&${EDITION_PARAM}=${encodeURIComponent(editionId)}`
    : href;
}

/** Read the edition id from a desk URL. Anything unexpected becomes "". */
export function readEditionReturn(search: string): string {
  if (search.length > 2048) return "";
  const value = new URLSearchParams(search).get(EDITION_PARAM);
  return isEditionId(value) ? value : "";
}
