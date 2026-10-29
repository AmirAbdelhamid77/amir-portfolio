import editorial from "@/content/atlas/editorial.json";
import extension from "@/content/atlas/dp600-extension.json";
import continuation from "@/content/atlas/dp600-continuation.json";
import { projectAtlas, type Dataset } from "./model";
export function getAtlas() {
  const data = { ...editorial, buildVersion: "atlas-dp600-2026-10-26.2", concepts: [...editorial.concepts,...extension.concepts,...continuation.concepts], semanticEdges: [...editorial.semanticEdges,...extension.semanticEdges,...continuation.semanticEdges], sources: [...editorial.sources,...extension.sources,...continuation.sources], catalog: [...editorial.catalog,...extension.catalog,...continuation.catalog] } as Dataset;
  return projectAtlas(data, process.env.HANSA_ATLAS_REVIEW_PREVIEW === "1");
}

// Public bibliographic metadata only, separate from the graph projection.
// Never serialize candidate concepts, claims, mappings or edges into this desk.
export function getAtlasReadingSources() {
  return [...editorial.sources,...extension.sources,...continuation.sources]
    .filter(source => source.visibility === "public-link" && new URL(source.url).hostname === "learn.microsoft.com")
    .map(({id,title,url,locator,checkedAt}) => ({id,title,url,locator,checkedAt}));
}
