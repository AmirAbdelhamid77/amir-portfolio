import type { Metadata } from "next";
import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { SITE_METRICS } from "@/lib/site-metrics";

export const metadata: Metadata = {
  title: "Sources & limits",
  description:
    "Where the lessons, questions and figures on Hansa come from, and what the site does not claim.",
  alternates: { canonical: "/about/sources" },
};

const COLLECTIONS = [
  {
    title: "Data visualization",
    body: `Ten chapters built from ${SITE_METRICS.dataViz.sourcePages} source pages in the original course export. The ${SITE_METRICS.dataViz.englishLessons} English lessons follow that source; the ${SITE_METRICS.dataViz.arabicLessons} Arabic lessons are written separately, not machine-translated.`,
    href: "/learn",
    label: "Open the course",
  },
  {
    title: "Statistics",
    body: `All ${SITE_METRICS.statistics.sections} sections keep the original wording, headings and formulas. One Poisson tail in the source is wrong at λ=20; the corrected value is shown beside it.`,
    href: "/learn/statistics",
    label: "Open the reference",
  },
  {
    title: "Microsoft Fabric",
    body: `${SITE_METRICS.practice.fabricQuestions.toLocaleString("en-US")} questions across ${SITE_METRICS.practice.fabricPacks} packs, with ${SITE_METRICS.practice.fabricSources} source references. Every question keeps its pack, its validation note and its Microsoft Learn links.`,
    href: "/lab/dp-600",
    label: "Open the bank",
  },
  {
    title: "Practice sets",
    body: `${SITE_METRICS.practice.generalQuestions} analyst questions across ${SITE_METRICS.practice.generalBanks} sets, plus ${SITE_METRICS.dataViz.scenarios} visualization scenarios. Answers and rationales are written for this site.`,
    href: "/lab",
    label: "Open practice",
  },
];

export default function SourcesPage() {
  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-12 pt-20 md:pb-16 md:pt-24">
          <Eyebrow>Sources &amp; limits</Eyebrow>
          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-medium tracking-tight md:text-5xl">
            What is sourced, what is written, what is not claimed.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            Every lesson and question points back to a source. This page says where the material
            comes from, so you can judge it yourself.
          </p>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <div className="grid gap-3 md:grid-cols-2">
            {COLLECTIONS.map((collection) => (
              <article key={collection.title} className="rounded-3xl border border-border bg-card/40 p-6">
                <h2 className="text-lg font-medium tracking-tight">{collection.title}</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{collection.body}</p>
                <Link
                  href={collection.href}
                  className="mt-4 inline-flex text-sm text-foreground underline underline-offset-4"
                >
                  {collection.label}
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-card/20 py-14 md:py-20">
        <Container>
          <h2 className="text-2xl font-medium tracking-tight">What the site does not claim</h2>
          <ul className="mt-6 grid gap-4 text-sm leading-7 text-muted-foreground md:grid-cols-2">
            <li>
              <strong className="text-foreground">No live product runs.</strong> SQL, DAX and Fabric
              examples are explained and checked against documentation; they are not executed here.
            </li>
            <li>
              <strong className="text-foreground">No invented data.</strong> Labs use labelled sample
              data stored in the repository, and every number comes from that file.
            </li>
            <li>
              <strong className="text-foreground">No account or tracking.</strong> Progress stays in
              your browser. Nothing is sent to a third party.
            </li>
            <li>
              <strong className="text-foreground">No exam guarantee.</strong> The banks follow the
              published objectives, but a practice score is not a promise about the real exam.
            </li>
          </ul>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <h2 className="text-lg font-medium tracking-tight">Maintainer index</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
            The working records behind the published pages. They are not part of the learning path.
          </p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/learn/method" className="text-muted-foreground underline underline-offset-4 hover:text-foreground">
              Import method
            </Link>
            <Link
              href="/learn/statistics/source"
              className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Statistics audit
            </Link>
            <Link
              href="/study/review"
              className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Review inventory
            </Link>
            <Link
              href="/learn/drafts"
              className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Lesson intake
            </Link>
            <Link
              href="/practice/drafts"
              className="text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
              Question intake
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
