import editorial from "@/content/atlas/editorial.json";
import extension from "@/content/atlas/dp600-extension.json";
import continuation from "@/content/atlas/dp600-continuation.json";
import { projectAtlas, type Dataset } from "./model";
export function getAtlas() {
  const data = { ...editorial, buildVersion: "atlas-dp600-2026-10-26.2", concepts: [...editorial.concepts,...extension.concepts,...continuation.concepts], semanticEdges: [...editorial.semanticEdges,...extension.semanticEdges,...continuation.semanticEdges], sources: [...editorial.sources,...extension.sources,...continuation.sources], catalog: [...editorial.catalog,...extension.catalog,...continuation.catalog] } as Dataset;
  return projectAtlas(data, process.env.HANSA_ATLAS_REVIEW_PREVIEW === "1");
}
