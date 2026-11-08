// Collection discovery only. These links never grant publication or grading.
export const COLLECTION_CONTEXTS = {
  learn: { title: "Explore beyond the main path.", description: "Storytelling, design patterns and authoring notes keep their source and review status beside the material." },
  practice: { title: "Draft material, without a score.", description: "These collections sit outside the scored banks. Read their limitations before using them for study." },
  fabric: { title: "Keep the evidence in reach.", description: "Continue into RTI lessons, or inspect the documentation and mapping records still under review." },
  atlas: { title: "Records are not relationships.", description: "Browse resource mappings and source holds without treating them as published semantic connections." },
} as const;

export type CollectionContext = keyof typeof COLLECTION_CONTEXTS;
type Destination = { id: string; title: string; href: string; status: string; description: string; contexts: readonly CollectionContext[] };

export const COLLECTION_DESTINATIONS: readonly Destination[] = [
  { id: "storytelling", title: "Data storytelling", href: "/work/storytelling/", status: "Published unverified", description: "Follow the course, frameworks and applied case studies in their original order.", contexts: ["learn"] },
  { id: "patterns", title: "Creative patterns", href: "/patterns/", status: "Draft — unverified", description: "Read the recovered explanations and walkthroughs. Factual and public-rights review remains pending.", contexts: ["learn"] },
  { id: "insight-records", title: "Insight authoring notes", href: "/insight-records/", status: "Drafts and technical-review records", description: "Browse Arabic and English authoring records. These undated, unverified notes are not published timeline editions.", contexts: ["learn"] },
  { id: "rti-course", title: "Fabric Real-Time Intelligence", href: "/learn/fabric-rti/", status: "Source-based lessons · runtime NOT_RUN", description: "Read the lessons and their blueprint evidence; hands-on environments have not been built or validated end to end.", contexts: ["learn", "fabric"] },
  { id: "draft-banks", title: "Draft and restricted practice banks", href: "/practice/draft-banks/", status: "R18 ungraded · PL-300 metadata only", description: "Read the R18 learner candidates without answers or scoring. PL-300 question bytes remain private pending rights review.", contexts: ["practice"] },
  { id: "study-hub", title: "DP-600 / PL-300 standalone Study Hub", href: "/study-hub/dp600-pl300-study-hub.html", status: "Legacy source snapshot · published verbatim", description: "Open the original standalone study application; it does not replace the current validated practice banks.", contexts: ["practice"] },
  { id: "atlas-records", title: "Atlas resource records", href: "/atlas-records/", status: "Concept mappings awaiting review", description: "Open published reference articles from their resource records. Mapping metadata does not establish a reviewed semantic edge.", contexts: ["fabric", "atlas"] },
  { id: "held-articles", title: "Documentation source holds", href: "/held-articles/", status: "Hold reasons and metadata only", description: "Inspect missing source dependencies and explicit holds. Held article bodies are not published here.", contexts: ["fabric", "atlas"] },
];

export function collectionDestinations(context: CollectionContext) {
  return COLLECTION_DESTINATIONS.filter(entry => entry.contexts.includes(context));
}
