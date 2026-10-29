import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { CatalogueCard } from "@/components/catalogue-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PRACTICE_ENTRIES, PRACTICE_TOTALS } from "@/lib/catalogue";
import { ButtonLink, Container, Eyebrow, SectionHeading, Stat } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Practice — question banks and scenario drills",
  description:
    "The practice catalogue: 60 data-analyst questions across six topics, 834 Microsoft Fabric questions with object-level rationales, and 12 visualization scenarios. Practice or timed mock mode, with explanations.",
  alternates: { canonical: "/practice/catalogue" },
  openGraph: {
    title: "Practice — question banks and scenario drills",
    description:
      "Six analyst sets, the 834-question Fabric hub and twelve visualization scenarios. Progress stays in this browser.",
    url: "/practice/catalogue",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Hansa practice catalogue" }],
  },
};

const HOW_IT_WORKS = [
  {
    title: "Practice mode explains immediately",
    body: "Check one question at a time. The rationale appears before you move on, including why the plausible wrong option is wrong.",
  },
  {
    title: "Mock mode holds feedback",
    body: "A countdown, flags and a navigator; you review before submitting. The Fabric clock is stored, so a refresh does not restart it.",
  },
  {
    title: "Nothing leaves this browser",
    body: "Results, bookmarks and saved sessions live in localStorage on this device. There is no account, no sync and no server-side grading.",
  },
];

export default function PracticeCataloguePage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Practice — Hansa practice catalogue",
      url: `${SITE.url}/practice/catalogue/`,
      description:
        "Practice question banks for data analysis, Microsoft Fabric and data visualization.",
      hasPart: PRACTICE_ENTRIES.map((entry) => ({
        "@type": "LearningResource",
        name: entry.title,
        url: `${SITE.url}${entry.href}/`,
        learningResourceType: entry.kind,
        isAccessibleForFree: true,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: "Practice",
          item: `${SITE.url}/practice/catalogue/`,
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-border">
        <Container className="pb-10 pt-20 md:pb-14 md:pt-24">
          <Breadcrumbs items={[{ href: "/", label: "Home" }, { label: "Practice" }]} />

          <Eyebrow className="mt-6" dot>
            Practice · catalogue
          </Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-4xl font-medium tracking-tight md:text-5xl">
            Test the skill, not the vocabulary.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            Three question banks, all free, none of them a real exam. Every answer carries a
            rationale, every session can be resumed, and every coverage number says what it
            counts.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <ButtonLink href="/lab/dp-600/study" icon>
              Start a guided Fabric session
            </ButtonLink>
            <ButtonLink href="/lab" variant="secondary">
              Browse the analyst bank
            </ButtonLink>
            <ButtonLink href="/learn/catalogue" variant="ghost">
              Catching up on theory first?
            </ButtonLink>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={String(PRACTICE_TOTALS.banks)} label="Question banks" note="Analyst, Fabric, scenarios" />
            <Stat value={String(PRACTICE_TOTALS.general)} label="Analyst questions" note="6 sets of 10" />
            <Stat value={String(PRACTICE_TOTALS.fabric)} label="Fabric questions" note="18 source packs" />
            <Stat value={String(PRACTICE_TOTALS.scenarios)} label="Scenario drills" note="Model answers" />
          </div>
        </Container>
      </section>

      <section className="border-b border-border bg-card/20 py-10">
        <Container>
          <h2 className="text-sm font-medium">Before you start</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
              <li key={item.title} className="rounded-2xl border border-border bg-background/60 p-4">
                <p className="text-xs font-medium text-foreground">{item.title}</p>
                <p className="mt-1.5 text-xs leading-6 text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
            <span>
              The Fabric bank is original practice material. It is not official, leaked or
              recalled exam content, and timed runs here are custom simulations rather than
              blueprint-authentic exams.
            </span>
          </p>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <SectionHeading
            eyebrow="Banks"
            title="Pick the one that matches the interview"
            description="Counts, pass marks and what each session does are stated on the card. Nothing here needs an account."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PRACTICE_ENTRIES.map((entry) => (
              <CatalogueCard key={entry.id} entry={entry} />
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-12 md:py-16">
        <Container>
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/lab/dp-600/progress"
              className="group flex flex-col rounded-3xl border border-border bg-card/40 p-5 transition-colors hover:border-border-strong"
            >
              <h2 className="text-sm font-medium">Your progress and saved sessions</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                Mastery by objective and subject, saved sessions you can resume, your attempt
                history, and JSON export/import for the Fabric bank.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-foreground">
                Open progress and backup
                <ArrowRight
                  className="h-3 w-3 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </span>
            </Link>
            <Link
              href="/practice"
              className="group flex flex-col rounded-3xl border border-border bg-card/40 p-5 transition-colors hover:border-border-strong"
            >
              <h2 className="text-sm font-medium">Visualization scenarios, with the reasoning</h2>
              <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
                Twelve decisions where more than one chart is defensible and only one is right
                for the question. The explanation is the point, not the score.
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-foreground">
                Open the scenario bank
                <ArrowRight
                  className="h-3 w-3 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </span>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
