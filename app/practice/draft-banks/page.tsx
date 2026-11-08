import type { Metadata } from "next";
import { getR18Bank, getPl300Index } from "@/lib/recovery/collections";

// Draft and restricted practice banks. The R18 learner bank (222 owner-authored
// DP-600 questions, image-free and ungraded) is published as a draft with no
// answers and no scoring. The PL-300 V88 bank is third-party-transcript-anchored:
// only its metadata index is published here, with the restriction stated and the
// question bytes retained in authorized local storage.

export const metadata: Metadata = {
  title: "Draft banks — recovered practice content",
  description:
    "The DP-600 R18 draft bank (222 ungraded questions) and the PL-300 V88 restricted index (1,285 records, rights review pending).",
  robots: { index: false, follow: true },
  alternates: { canonical: "/practice/draft-banks/" },
};

export default function DraftBanksPage() {
  const r18 = getR18Bank();
  const pl300 = getPl300Index();
  const byCase = new Map<string, typeof r18.questions>();
  for (const question of r18.questions) {
    const list = byCase.get(question.caseStudy) ?? [];
    list.push(question);
    byCase.set(question.caseStudy, list);
  }
  const byVideo = new Map<string, typeof pl300.records>();
  for (const record of pl300.records) {
    const list = byVideo.get(record.video_title) ?? [];
    list.push(record);
    byVideo.set(record.video_title, list);
  }

  return (
    <main id="main" className="mx-auto w-full max-w-4xl px-4 py-14">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recovered collections</p>
      <h1 className="mt-2 text-balance text-4xl font-medium tracking-tight">Draft banks</h1>
      <div className="mt-4 rounded-2xl border border-border bg-card/60 p-4 text-sm leading-6 text-muted-foreground">
        <p>
          Draft and restricted practice material, published with exact statuses. Draft questions are{" "}
          <strong className="text-foreground">unverified and ungraded</strong> — no answers, no scoring, no progress
          storage. Restricted material is indexed without exposing its bytes.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-medium tracking-tight">
          DP-600 R18 draft bank{" "}
          <span className="text-sm font-normal text-muted-foreground">({r18.questions.length} questions, draft)</span>
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {r18.meta?.title ?? "DP-600"} — image-free, ungraded learner candidates. The scientific review recorded in the
          source package has not been re-run here.
        </p>
        {[...byCase.entries()].map(([caseStudy, questions]) => (
          <details key={caseStudy} className="mt-4 rounded-2xl border border-border bg-card/40 px-5 py-4">
            <summary className="cursor-pointer select-none font-medium">
              {caseStudy.replace(/^cs_/, "Case study: ")}{" "}
              <span className="text-sm text-muted-foreground">({questions.length} questions)</span>
            </summary>
            <div className="mt-3 space-y-3">
              {questions.map((question) => (
                <details key={question.id} className="rounded-xl border border-border px-4 py-3">
                  <summary className="cursor-pointer select-none text-sm">
                    <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                      {question.type} · {question.id}
                    </span>
                    <span className="mt-1 block whitespace-pre-wrap">{question.stem}</span>
                  </summary>
                  {question.options ? (
                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap rounded-lg bg-background/70 p-3 text-[12px] leading-5 text-muted-foreground">
                      {typeof question.options === "string" ? question.options : JSON.stringify(question.options, null, 1)}
                    </pre>
                  ) : null}
                  <p className="mt-2 text-[11px] text-muted-foreground">
                    No answer key is published for this draft. Topic {question.topic}.
                  </p>
                </details>
              ))}
            </div>
          </details>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-medium tracking-tight">
          PL-300 V88 — restricted index{" "}
          <span className="text-sm font-normal text-muted-foreground">({pl300.records.length} records)</span>
        </h2>
        <div className="mt-2 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4 text-sm leading-6">
          <p>
            <strong className="text-foreground">Restricted — rights review pending.</strong> These{" "}
            {pl300.records.length} questions are anchored to and quote third-party YouTube video transcripts. Their
            redistribution rights are unresolved, so <strong className="text-foreground">only this metadata index is
            published</strong>; the question bytes remain in authorized local storage
            (`content/recovery/` is intentionally not populated with them — the bank stays at its source package).
          </p>
        </div>
        {[...byVideo.entries()].map(([video, records]) => (
          <details key={video} className="mt-3 rounded-2xl border border-border px-5 py-3">
            <summary className="cursor-pointer select-none text-sm">
              {video} <span className="text-muted-foreground">({records.length} records)</span>
            </summary>
            <ul className="mt-2 space-y-1 text-[12px] text-muted-foreground">
              {records.map((record) => (
                <li key={record.id}>
                  {record.id} (legacy {record.legacy_id}) ·{" "}
                  <a href={record.videoUrl} className="underline underline-offset-4" target="_blank" rel="noreferrer noopener">
                    attributed source video
                  </a>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-card/40 p-5">
        <h2 className="text-lg font-medium tracking-tight">DP-600 / PL-300 Study Hub</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          The standalone self-contained study application, recovered verbatim. It runs entirely in your browser:
        </p>
        <a
          href="/study-hub/dp600-pl300-study-hub.html"
          className="mt-3 inline-flex min-h-11 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background hover:bg-foreground/90"
        >
          Open the Study Hub
        </a>
      </section>
    </main>
  );
}
