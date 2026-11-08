import type { Metadata } from "next";
import Link from "next/link";
import { getInsightRecords, getHeldArticles, getAtlasResourceRecords, getPl300Index, getPatternLessons, getR18Bank, getRtiBlueprints } from "@/lib/recovery/collections";

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
      status: "397 drafts · 3 technical review (397 Arabic, 3 English)",
      count: `${insights.length} records`,
      route: "/insight-records/",
      note: "Undated authoring records with their verbatim statuses. Unverified.",
    },
    {
      title: "Fabric documentation corpus",
      status: "2,716 published",
      count: "2,716 articles",
      route: "/learn/fabric/docs/",
      note: "Full corpus with zero-JS reading, collections and search. 81 more are held (below).",
    },
    {
      title: "Held Fabric articles",
      status: "Source dependency missing",
      count: `${held.length} dependency-held + 3 rights/external`,
      route: "/held-articles/",
      note: "Metadata and exact hold reasons published; bytes preserved in the pinned corpus, not redistributable until upstream repos are pinned.",
    },
    {
      title: "Atlas resource records",
      status: "Awaiting review (1,057)",
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
      status: "Integrated (renderer gap tracked)",
      count: "3,131 records",
      note: "All 3,131 prepared records are committed (content/intake/hansa-integration/reference_records.jsonl); the site currently renders the reviewed subset. Full rendering is a tracked backlog item.",
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
        Every recovered collection in one place — integrated, restricted or intentionally held — each carrying its real
        status. Nothing listed here is silently missing: restricted items state why their bytes stay in authorized
        storage, and every entry links to where its content lives.
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
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{group.note}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
