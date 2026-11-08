import type { Metadata } from "next";
import Link from "next/link";
import { getInsightRecords, getHeldArticles, getAtlasResourceRecords, getPl300Index, getPatternLessons, getR18Bank, getRtiBlueprints } from "@/lib/recovery/collections";
import referenceCatalogue from "@/content/study/references.json";
import experimentCatalogue from "@/content/study/experiments.json";
import { createFabricBindingsReader } from "@/lib/fabric/bindings";

// The unified content index (content-recovery mission, Phase 4): every
// recovered, integrated, restricted or unavailable collection in one place,
// each with its exact status and route. This is the single answer to
// "where is X?" for everything the earlier releases held back.

export const metadata: Metadata = {
  title: "Content index — everything recovered, integrated or held",
  description:
    "The unified index of all recovered project content: integrated collections, review-queue records, restricted material and intentional holds, each with its status and route.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/content-index/" },
};

export default function ContentIndexPage() {
  const insights = getInsightRecords();
  const held = getHeldArticles();
  const atlas = getAtlasResourceRecords();
  const pl300 = getPl300Index();
  const patterns = getPatternLessons();
  const r18 = getR18Bank();
  const rti = getRtiBlueprints();
  const references = referenceCatalogue.meta;
  const experiments = experimentCatalogue.meta;
  const publishedArticles = createFabricBindingsReader().getFabricTopicReadingOverview()
    .reduce((sum, row) => sum + row.primary, 0);

  const groups: {
    title: string;
    status: string;
    count: string;
    route?: string;
    note: string;
  }[] = [
    {
      title: "Published editions (the Timeline)",
      status: "Technical review",
      count: "3 dated editions",
      route: "/",
      note: "The dated editorial entries. Undated authoring records are below and never fill the Timeline.",
    },
    {
      title: "Insight records (recovered authoring bank)",
      status: `${insights.filter(record => record.reviewStatus === "draft").length} drafts · ${insights.filter(record => record.reviewStatus === "technical_review").length} technical review`,
      count: `${insights.length} records`,
      route: "/insight-records/",
      note: "Undated authoring records with their verbatim statuses. Unverified.",
    },
    {
      title: "Fabric documentation corpus",
      status: "Published documentation",
      count: `${publishedArticles.toLocaleString("en-US")} articles`,
      route: "/learn/fabric/docs/",
      note: "Published articles with zero-JS reading, collections and search. Source holds are recorded separately below.",
    },
    {
      title: "Held Fabric articles",
      status: "Source dependency missing",
      count: `${held.length} dependency-held records`,
      route: "/held-articles/",
      note: "Metadata and dependency hold reasons only; article bodies stay in the pinned corpus. Resolving dependencies does not automatically clear separate rights holds.",
    },
    {
      title: "Atlas resource records",
      status: "Concept mappings awaiting review",
      count: `${atlas.length} records`,
      route: "/atlas-records/",
      note: "Concept mapping unreviewed; target articles published. No semantic edges drawn.",
    },
    {
      title: "Creative patterns package",
      status: "Draft — unverified",
      count: `${patterns.length} lessons`,
      route: "/patterns/",
      note: "Independent review package; owner-derived explanations published, cited sources attributed, public-rights review pending.",
    },
    {
      title: "DP-600 R18 draft bank",
      status: "Draft — ungraded",
      count: `${r18.questions.length} questions`,
      route: "/practice/draft-banks/",
      note: "Image-free learner candidates without answers or scoring.",
    },
    {
      title: "PL-300 V88 bank",
      status: "Restricted — rights review pending",
      count: `${pl300.records.length} records indexed`,
      route: "/practice/draft-banks/",
      note: "Third-party-transcript-anchored; metadata indexed only, bytes in authorized local storage.",
    },
    {
      title: "Fabric RTI lab blueprints",
      status: "Draft — not built or validated",
      count: `${rti.length} blueprints`,
      route: "/learn/fabric-rti/",
      note: "Eight Knowledge Graph labs now land on their recovered blueprints; the environments themselves are not built.",
    },
    {
      title: "Data storytelling course & case studies",
      status: "Published unverified",
      count: "24 documents",
      route: "/work/storytelling/",
      note: "12-part course, framework selector, story atlas, nine case studies + 24 teaching figures, served verbatim.",
    },
    {
      title: "DP-600 / PL-300 Study Hub",
      status: "Published verbatim",
      count: "1 standalone app",
      route: "/study-hub/dp600-pl300-study-hub.html",
      note: "The self-contained study application, recovered byte-for-byte.",
    },
    {
      title: "Reference library records",
      status: "Curated reference layer",
      count: `${references.curated.toLocaleString("en-US")} curated / ${references.input.toLocaleString("en-US")} prepared`,
      route: "/learn/#topics",
      note: `${references.duplicates} duplicate URLs and ${references.input - references.curated - references.duplicates} other curation exclusions remain preserved in intake. Unmatched placement rules need review; not every excluded record should be published. Open a subject topic to find its reference material.`,
    },
    {
      title: "Hands-on source labs",
      status: "Source-based outlines · execution not certified",
      count: `${experiments.curated} curated / ${experiments.input} prepared`,
      route: "/learn/#topics",
      note: "Topic desks link the curated lab pages. The remaining records have explicit non-lab or subject-scope exclusions; an outline is not proof of a working environment.",
    },
    {
      title: "Hansa Spatial Experience v2",
      status: "Preserved — not web content",
      count: "27 references · 80-pattern registry · 30 briefs",
      note: "An agent-skill package (Arabic, with installer), not site material. Preserved at D:/BeUI/Hansa_Spatial_Experience_v2_2026-10-27 and indexed here for completeness.",
    },
    {
      title: "Verification backlog",
      status: "Owner review pending",
      count: "docs/content-recovery-20261109/RECOVERY_REPORT.md",
      route: "/content-index/#backlog",
      note: "The full post-publication verification backlog for every collection above.",
    },
  ];

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-14">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recovery &amp; integration</p>
      <h1 className="mt-2 text-balance text-4xl font-medium tracking-tight">Content index</h1>
      <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
        Collections identified during recovery — integrated, restricted or intentionally held — with their recorded
        status and available destinations. Imported data, discoverable pages and independently verified content are
        different stages; this index is not a claim that every source has completed all three.
      </p>
      <div className="mt-8 space-y-3">
        {groups.map((group) => (
          <div key={group.title} className="rounded-2xl border border-border bg-card/40 px-5 py-4">
            <div className="flex flex-wrap items-center gap-2">
              {group.route ? (
                <Link href={group.route} className="text-lg font-medium tracking-tight underline decoration-border underline-offset-4 hover:decoration-foreground">
                  {group.title}
                </Link>
              ) : (
                <span className="text-lg font-medium tracking-tight">{group.title}</span>
              )}
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                {group.status}
              </span>
              <span className="ml-auto text-[11px] text-muted-foreground">{group.count}</span>
            </div>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere]">{group.note}</p>
          </div>
        ))}
      </div>
      <section id="backlog" aria-labelledby="backlog-title" className="mt-12 scroll-mt-24 border-t border-border pt-8">
        <h2 id="backlog-title" className="text-2xl font-medium tracking-tight">Review and integration still to do</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Existing draft and restricted labels remain in force. These tasks describe unfinished work, not automatic publication approvals.
        </p>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-muted-foreground">
          <li>Factual and Arabic-language review of insight drafts; independent review of patterns, storytelling and R18 learner candidates.</li>
          <li>PL-300 transcript and question rights review; restricted question bytes and private QA remain private.</li>
          <li>Human review of Atlas concept mappings; resource records do not automatically become semantic edges.</li>
          <li>Pin missing documentation dependencies and resolve each separate rights hold before recompilation.</li>
          <li>Build and validate RTI environments; a blueprint or source outline is not an executed lab.</li>
          <li>Review unmatched references and eligible experiments against the subject taxonomy, preserving duplicate and scope exclusions.</li>
          <li>Author and independently validate deferred assessment packs and Code Lab work from their preserved source specifications.</li>
        </ul>
      </section>
    </main>
  );
}
