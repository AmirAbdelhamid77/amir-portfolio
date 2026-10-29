import type { Metadata } from "next";
import Link from "next/link";
import { IntakeReview } from "@/components/learn/intake-review";
import { Container, Eyebrow } from "@/components/ui";
import manifest from "@/content/intake/manifest.json";

// Two external packages arrived on 2026-10-27 with explicit holds: the Notion
// creative patterns set is REVIEW_REQUIRED and the Fabric RTI milestone is
// COMPLETE_WITH_DOCUMENTED_HOLDS with runtime NOT_RUN. Neither may appear in
// the approved lesson lane, so they live behind this isolated, unlisted route
// until the owner reviews them.
export const metadata: Metadata = {
  title: "Intake review — creative patterns lessons and RTI lab blueprints (not approved)",
  description:
    "Isolated review mode for two external packages: 20 creative-patterns lessons with 6 modules and 3 paths (REVIEW_REQUIRED), and 17 of 18 authentic-source lab blueprints with grading and deployment disabled (COMPLETE_WITH_DOCUMENTED_HOLDS).",
  robots: { index: false, follow: false },
};

export default function IntakeReviewPage() {
  const [notion, rti] = manifest.packages;
  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/learn" className="hover:text-foreground">
              Learn
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">Intake review</span>
          </nav>
          <Eyebrow className="mt-6">Isolated review mode · not approved lessons</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl">
            Two external packages, staged with their holds intact.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            The creative patterns package carries status{" "}
            <strong className="font-medium text-foreground">{notion.status}</strong> — 20 lessons, 6 modules, 3 paths and 9 code
            templates, with native execution never run. The Fabric RTI milestone carries status{" "}
            <strong className="font-medium text-foreground">{rti.status}</strong> — runtime{" "}
            <strong className="font-medium text-foreground">{rti.runtimeStatus}</strong>, with 17 of 18 lab blueprints shown and one
            withheld under a licence hold. Their package verifiers passed: that is artifact integrity, not scientific
            or publication approval.
          </p>
        </Container>
      </section>

      <section className="py-8 md:py-12">
        <Container>
          <IntakeReview />
        </Container>
      </section>

      <section className="border-t border-border py-10 md:py-14">
        <Container>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-border bg-card/40 p-5">
              <h2 className="text-sm font-medium">What never left the packages</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                Proposed answers and per-option reasoning, the reversible-review logs, raw Notion bodies, source
                figures, dataset binaries and upstream repository bodies. Projections are allowlist-built by{" "}
                <code className="rounded bg-muted px-1 py-0.5">scripts/build-intake-content.mjs</code>, which never reads
                the private key file at all.
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card/40 p-5">
              <h2 className="text-sm font-medium">Holds preserved, not smoothed over</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                Lab L11 is withheld because it uses the Scania archive whose licence is in conflict; two repositories
                without a licence stay reference-only; the USAID shipment dataset is absent because the original could
                not be retrieved. One Notion lesson slug also duplicates an approved data-viz slug, which is why this
                set keeps its own <code className="rounded bg-muted px-1 py-0.5">lesson:creative:*</code> ids instead of
                joining the approved lane.
              </p>
            </div>
          </div>
          <p className="mt-6 text-xs leading-6 text-muted-foreground">
            Neither package modified Hansa, enabled grading, approved publication or authorised deployment. This page
            writes nothing to your browser storage, so existing lesson and exam progress is untouched. The full report
            lives in{" "}
            <code className="rounded bg-muted px-1 py-0.5">
              docs/intake-merge/creative-rti-2026-10-28/
            </code>
            .
          </p>
        </Container>
      </section>
    </>
  );
}
