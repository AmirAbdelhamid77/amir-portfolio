import type { Metadata } from "next";
import Link from "next/link";
import { getInsightRecords } from "@/lib/recovery/collections";

// Recovered insight records (content-recovery mission): the 400-record
// authoring bank, published verbatim with its own review statuses. These are
// authoring records, not dated editions — only the three published editions
// carry dates on the Timeline, and none are invented here.

export const metadata: Metadata = {
  title: "Insight records — the recovered authoring bank",
  description:
    "All 400 recovered daily-insight authoring records, published with their actual review statuses: drafts and technical-review records, Arabic and English.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/insight-records/" },
};

const SUBJECT_ORDER = ["fabric", "sql", "visualization", "statistics", "power-bi", "python", "excel", "analysis"];

export default function InsightRecordsPage() {
  const records = getInsightRecords();
  const bySubject = new Map<string, typeof records>();
  for (const record of records) {
    const list = bySubject.get(record.subject) ?? [];
    list.push(record);
    bySubject.set(record.subject, list);
  }
  const subjects = [...bySubject.keys()].sort(
    (a, b) => (SUBJECT_ORDER.indexOf(a) + 99) * (SUBJECT_ORDER.includes(a) ? 1 : 0) - (SUBJECT_ORDER.indexOf(b) + 99) * (SUBJECT_ORDER.includes(b) ? 1 : 0) || a.localeCompare(b),
  );
  const drafts = records.filter((r) => r.reviewStatus === "draft").length;

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-14">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recovered collection</p>
      <h1 className="mt-2 text-balance text-4xl font-medium tracking-tight">Insight records</h1>
      <div className="mt-4 rounded-2xl border border-border bg-card/60 p-4 text-sm leading-6 text-muted-foreground">
        <p>
          <strong className="text-foreground">{records.length} authoring records</strong> recovered from the daily-insight
          bank — {drafts} drafts and {records.length - drafts} technical-review records
          ({records.filter((r) => r.language === "ar").length} Arabic,{" "}
          {records.filter((r) => r.language === "en").length} English). These are{" "}
          <strong className="text-foreground">undated authoring records, not editions</strong>: only the three published
          editions appear on the <Link href="/" className="underline underline-offset-4">timeline</Link>. Statuses are
          shown exactly as recorded — <em>draft records are unverified and may contain factual or language errors</em>.
        </p>
      </div>

      {subjects.map((subject) => (
        <section key={subject} className="mt-10">
          <h2 className="text-lg font-medium capitalize tracking-tight">{subject}</h2>
          <p className="text-sm text-muted-foreground">{bySubject.get(subject)!.length} records</p>
          <div className="mt-3 divide-y divide-border rounded-2xl border border-border">
            {bySubject.get(subject)!.map((record) => (
              <details key={record.id} className="group px-4 py-3">
                <summary className="cursor-pointer list-none select-none">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      {record.reviewStatus.replace("_", " ")}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{record.language}</span>
                    <span className="font-medium">{record.title}</span>
                    <span className="ml-auto text-[11px] text-muted-foreground">{record.topic}</span>
                  </span>
                </summary>
                <div
                  className="mt-3 space-y-3 text-sm leading-6"
                  dir={record.language === "ar" ? "rtl" : undefined}
                  lang={record.language}
                >
                  <p><strong>Situation.</strong> {record.scenario}</p>
                  <p><strong>Consider.</strong> {record.prediction}</p>
                  <p><strong>Takeaway (unverified).</strong> {record.takeaway}</p>
                  <p className="text-muted-foreground"><strong>Caveat.</strong> {record.caveat}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Scientifically verified: {String(record.scientificallyVerified ?? false)} · source reviewed:{" "}
                    {String(record.sourceReviewed ?? false)} · publication approved: {String(record.publicationApproved ?? false)}
                    {record.reviewBlockers?.length ? ` · blockers: ${record.reviewBlockers.join("; ")}` : ""}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
