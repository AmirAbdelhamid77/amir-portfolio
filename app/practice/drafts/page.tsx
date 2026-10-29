import type { Metadata } from "next";
import Link from "next/link";
import { DraftReview } from "@/components/practice/draft-review";
import { Container, Eyebrow } from "@/components/ui";
import manifest from "@/content/drafts/manifest.json";
import intakeManifest from "@/content/intake/manifest.json";

// The two staged packages are NO_GO / NONFINAL, so this surface is deliberately
// isolated: excluded from the practice catalogue, excluded from the sitemap and
// excluded from search engines. It reviews draft content; it never presents an
// approved Hansa question bank.
export const metadata: Metadata = {
  title: "Draft review — corpus and intake candidates (not approved)",
  description:
    "Isolated review mode for intake packages staged as disabled drafts: 222 DP-600 R18 candidate questions (NO_GO), 1,285 PL-300 V88 questions (NONFINAL), 28 creative-pattern candidates, plus the corpus-wave additions (37 keyless candidates and the 150-question community DP-700 bank). Grading is disabled and no answer key ships to the browser.",
  robots: { index: false, follow: false },
};

export default function DraftReviewPage() {
  const [dp, pl] = manifest.banks as typeof manifest.banks;
  const corpus = manifest.banks.find((b) => b.id === "corpus-candidates");
  const kengio = manifest.banks.find((b) => b.id === "kengio-dp700");
  const notion = intakeManifest.packages[0];
  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/practice/catalogue" className="hover:text-foreground">
              Practice
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">Draft review</span>
          </nav>
          <Eyebrow className="mt-6">Isolated review mode · not an approved bank</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl">
            Four packages, staged as drafts and kept apart.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            {dp.questions} DP-600 R18 candidate questions arrive at status{" "}
            <strong className="font-medium text-foreground">{dp.status}</strong>; {pl.questions} PL-300 V88
            questions arrive at status <strong className="font-medium text-foreground">{pl.status}</strong>; and 28
            creative-patterns assessment candidates from a third package arrive at status{" "}
            <strong className="font-medium text-foreground">{notion.status}</strong>, registered outside the approved
            DP-600 and PL-300 banks.
            File and build checks passed for both — that is package integrity, not academic approval. Both banks
            are staged here for review only: grading is disabled, no expected answer is shipped to this browser,
            and none of the banks replaces anything in the approved catalogue. The two corpus-wave additions arrive with 37 keyless candidates and 150 community questions whose answer keys stay at their MIT source.
          </p>
        </Container>
      </section>

      <section className="py-8 md:py-12">
        <Container>
          <DraftReview />
        </Container>
      </section>

      <section className="border-t border-border py-10 md:py-14">
        <Container>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card/40 p-5">
              <h2 className="text-sm font-medium">What is deliberately absent</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                Expected answers, per-option rationales, explanations, historical source keys, claim traces and
                per-question review logs stay in the private intake mirror, which is gitignored and never imported
                by app code. Reviews that need those files read them locally, not here.
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card/40 p-5">
              <h2 className="text-sm font-medium">Your existing progress is untouched</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                This page writes nothing to your browser storage. Practice results, bookmarks and saved sessions
                under the existing Fabric and Data Lab keys are neither read nor modified by draft review, so
                staging these packages cannot reset an exam history.
              </p>
            </div>
          </div>
          <p className="mt-6 text-xs leading-6 text-muted-foreground">
            Rollback: these drafts live in{" "}
            <code className="rounded bg-muted px-1 py-0.5">content/drafts/</code>, this route and{" "}
            <code className="rounded bg-muted px-1 py-0.5">lib/drafts/</code> — removing them restores the site
            exactly as it was. See{" "}
            <code className="rounded bg-muted px-1 py-0.5">
              docs/intake-merge/dp600-r18-pl300-v88-draft-2026-10-27/
            </code>{" "}
            for the full report.
          </p>
        </Container>
      </section>
    </>
  );
}
