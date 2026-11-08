import type { Metadata } from "next";

// The recovered Data Storytelling course and case studies (24 Notion-exported
// documents + 24 teaching figures), served verbatim from /storytelling/ and
// indexed here. Owner-authored material, published unverified.

export const metadata: Metadata = {
  title: "Data storytelling — recovered course and case studies",
  description:
    "The 12-part Data Storytelling master course, 9 applied case studies, the framework selector and the story atlas — 24 recovered documents.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/work/storytelling/" },
};

const DOCS: { label: string; file: string; group: string }[] = [
  { label: "Data Storytelling — Master Reference", file: "Data Storytelling — Master Reference 3cc3906c5d6c812eb350e21cdf116fbe.html", group: "Course" },
  { label: "Part I — Foundations", file: "Part I — Foundations 3cc3906c5d6c81a6be90d8eb7091ab29.html", group: "Course" },
  { label: "Part II — Know Your Audience", file: "Part II — Know Your Audience 3cc3906c5d6c81648b09d864b2e398fc.html", group: "Course" },
  { label: "Part III — Building the Narrative", file: "Part III — Building the Narrative 3cc3906c5d6c815d8554e720c7efa2eb.html", group: "Course" },
  { label: "Part IV — Metrics & Statistics", file: "Part IV — Metrics & Statistics 3cc3906c5d6c81818eded3f5cef2fb3f.html", group: "Course" },
  { label: "Part V — Visualization", file: "Part V — Visualization 3cc3906c5d6c813bad84faae28c302f0.html", group: "Course" },
  { label: "Part VI — Choosing the Communication Format", file: "Part VI — Choosing the Communication Format 3cc3906c5d6c810a8671e7775ce085c6.html", group: "Course" },
  { label: "Part VII — Written Reports", file: "Part VII — Written Reports 3cc3906c5d6c813dacedee18b6f4deaf.html", group: "Course" },
  { label: "Part VIII — Reproducibility & Rigor", file: "Part VIII — Reproducibility & Rigor 3cc3906c5d6c816f8725c25300a54ca1.html", group: "Course" },
  { label: "Part IX — Oral Presentations in Practice", file: "Part IX — Oral Presentations in Practice 3cc3906c5d6c8122a573def0f7514611.html", group: "Course" },
  { label: "Part X — Applied Case Studies", file: "Part X — Applied Case Studies 3cc3906c5d6c81c4988ac5e5ee490f3d.html", group: "Course" },
  { label: "Part XI — Checklists & Templates", file: "Part XI — Checklists & Templates 3cc3906c5d6c81d89750ddde26edda95.html", group: "Course" },
  { label: "Part XII — Quick Reference", file: "Part XII — Quick Reference 3cc3906c5d6c81bd8d7ec82b186708a5.html", group: "Course" },
  { label: "Framework Selector — Knaflic, Dykes, Duarte, SCQA", file: "Framework Selector — Knaflic, Dykes, Duarte, SCQA 3e53906c5d6c81ee8722c4edd5cb00a7.html", group: "Course" },
  { label: "Story Atlas — Teaching Figures", file: "Story Atlas — Teaching Figures 3e53906c5d6c8173b0aefba217c805d9.html", group: "Course" },
  { label: "Case 1 — Food Company Profit Decline", file: "Case 1 — Food Company Profit Decline 3cd3906c5d6c81059aabf5d845448a87.html", group: "Case studies" },
  { label: "Case 2 — Supply Chain Forecast Accuracy & Data Quality", file: "Case 2 — Supply Chain Forecast Accuracy & Data Qua 3cd3906c5d6c81ebb299d3c847888570.html", group: "Case studies" },
  { label: "Case 3 — Supply Chain Stockouts by SKU & Supplier", file: "Case 3 — Supply Chain Stockouts by SKU Supplier 3cd3906c5d6c8165a191ff0830ac4aad.html", group: "Case studies" },
  { label: "Case 4 — E-Commerce Mobile Conversion Drop", file: "Case 4 — E-Commerce Mobile Conversion Drop 3cd3906c5d6c81eabba5d67252e87971.html", group: "Case studies" },
  { label: "Case 5 — HR People Analytics Attrition", file: "Case 5 — HR People Analytics Attrition 3cd3906c5d6c816f96e0e46dada38f65.html", group: "Case studies" },
  { label: "Case 6 — BI Dashboard → Executive Story", file: "Case 6 — BI Dashboard → Executive Story 3cd3906c5d6c81499cf9d027156bb863.html", group: "Case studies" },
  { label: "Case 7 — Credit Risk Loanme", file: "Case 7 — Credit Risk Loanme 3cd3906c5d6c81c6aa23e720b811c495.html", group: "Case studies" },
  { label: "Case 8 — Customer Support Ticket Volume", file: "Case 8 — Customer Support Ticket Volume 3cd3906c5d6c81dfbc72cf4495ac1e3b.html", group: "Case studies" },
  { label: "Case 9 — Product Reviews Sentiment & Shipping Delays", file: "Case 9 — Product Reviews Sentiment & Shipping Dela 3cd3906c5d6c81a99112c9bdd87a75d9.html", group: "Case studies" },
];

export default function StorytellingPage() {
  const groups = ["Course", "Case studies"];
  return (
    <main id="main" className="mx-auto w-full max-w-4xl px-4 py-14">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Work · recovered archive</p>
      <h1 className="mt-2 text-balance text-4xl font-medium tracking-tight">Data storytelling</h1>
      <div className="mt-4 rounded-2xl border border-border bg-card/60 p-4 text-sm leading-6 text-muted-foreground">
        <p>
          <strong className="text-foreground">{DOCS.length} documents</strong> — the 12-part master course, the framework
          selector, the story atlas and nine applied case studies — recovered verbatim from the Notion export and served
          as authored, with the teaching figures alongside. Published unverified: the factual claims inside are the
          author's own and have not been through editorial review.
        </p>
      </div>
      {groups.map((group) => (
        <section key={group} className="mt-10">
          <h2 className="text-lg font-medium tracking-tight">{group}</h2>
          <ul className="mt-3 divide-y divide-border rounded-2xl border border-border">
            {DOCS.filter((doc) => doc.group === group).map((doc) => (
              <li key={doc.file}>
                <a
                  href={`/storytelling/${encodeURIComponent(doc.file)}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-card/40"
                >
                  <span className="font-medium">{doc.label}</span>
                  <span className="text-[11px] text-muted-foreground">open document ↗</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
