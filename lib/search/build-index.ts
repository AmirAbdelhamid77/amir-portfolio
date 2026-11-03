// Builds the searchable destination index once, at build time.
//
// The page no longer serialises every document into its HTML: it renders the
// counts and a short "start here" list, then fetches this payload. The version
// and content hash let the client cache safely and let QA prove it tested the
// index that shipped.
import { buildSiteSearchIndex } from "./documents";
import { KIND_LABEL, type SearchDocument, type SearchKind } from "./query";

export const SEARCH_INDEX_VERSION = 2;

export type SearchIndexPayload = {
  version: number;
  hash: string;
  counts: {
    total: number;
    byKind: Partial<Record<SearchKind, number>>;
  };
  documents: SearchDocument[];
};

/** FNV-1a over the serialised documents: small, stable, dependency-free. */
function contentHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function buildSearchIndexPayload(): SearchIndexPayload {
  const documents = buildSiteSearchIndex();
  const byKind: Partial<Record<SearchKind, number>> = {};
  for (const document of documents) {
    byKind[document.kind] = (byKind[document.kind] ?? 0) + 1;
  }
  const serialized = JSON.stringify(documents);
  return {
    version: SEARCH_INDEX_VERSION,
    hash: contentHash(serialized),
    counts: { total: documents.length, byKind },
    documents,
  };
}

/** Labels in a stable order, for the page's one-line summary. */
export function indexSummary(counts: SearchIndexPayload["counts"]): string {
  return (Object.keys(KIND_LABEL) as SearchKind[])
    .filter((kind) => (counts.byKind[kind] ?? 0) > 0)
    .map((kind) => `${KIND_LABEL[kind]} ${counts.byKind[kind]}`)
    .join(" · ");
}
