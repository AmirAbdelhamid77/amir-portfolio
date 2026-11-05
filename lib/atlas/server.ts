import editorial from "@/content/atlas/editorial.json";
import extension from "@/content/atlas/dp600-extension.json";
import continuation from "@/content/atlas/dp600-continuation.json";
import { projectAtlas, type Dataset } from "./model";

const DATA = {
  ...editorial,
  buildVersion: "atlas-dp600-2026-10-26.2",
  concepts: [...editorial.concepts, ...extension.concepts, ...continuation.concepts],
  semanticEdges: [...editorial.semanticEdges, ...extension.semanticEdges, ...continuation.semanticEdges],
  sources: [...editorial.sources, ...extension.sources, ...continuation.sources],
  catalog: [...editorial.catalog, ...extension.catalog, ...continuation.catalog],
} as Dataset;

/** The public projection: never contains a candidate concept or edge. */
export function getAtlasPublic() {
  return projectAtlas(DATA, false);
}

/** The explicit review projection. Only a local review build may call this. */
export function getAtlasReview() {
  return projectAtlas(DATA, true);
}

/**
 * Legacy environment-driven projection. Routes that are themselves review
 * surfaces may use it; the Home must call `getAtlasPublic()` instead so an
 * accidentally enabled preview variable cannot widen what the Home receives.
 */
export function getAtlas() {
  return projectAtlas(DATA, process.env.HANSA_ATLAS_REVIEW_PREVIEW === "1");
}

// Public bibliographic metadata only, separate from the graph projection.
// Never serialize candidate concepts, claims, mappings or edges into this desk.
export function getAtlasReadingSources() {
  return [...editorial.sources, ...extension.sources, ...continuation.sources]
    .filter((source) => source.visibility === "public-link" && new URL(source.url).hostname === "learn.microsoft.com")
    .map(({ id, title, url, locator, checkedAt }) => ({ id, title, url, locator, checkedAt }));
}
