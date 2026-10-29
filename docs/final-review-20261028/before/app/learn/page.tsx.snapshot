import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Compass,
  Languages,
  Route,
  ShieldCheck,
} from "lucide-react";
import {
  CHAPTERS,
  SOURCE_STATS,
  ArabicLessons,
  EnglishLessons,
  chapterHref,
} from "@/lib/data-viz/content";
import { ChapterCard, LabLink } from "@/components/data-viz/chapter-card";
import { ButtonLink, Container, Eyebrow, SectionHeading, Stat } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Data Visualization — from question to decision",
  description:
    "A ten-chapter data-visualization learning path: the six core charts, colour and accessibility, statistical traps, chart selection, dashboards, Power BI, and interview practice — with interactive labs.",
  alternates: { canonical: "/learn" },
  openGraph: {
    title: "Data Visualization — from question to decision",
    description:
      "Ten chapters, interactive chart labs, an integrity lab, and a deterministic chart decision assistant.",
    url: "/learn",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Data Visualization learning path" }],
  },
};

const PATHS = [
  {
    title: "Learn the library",
    body: "Read the spine in order: foundations through practice. Best if you want the full mental model.",
    chapters: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"],
  },
  {
    title: "Build a dashboard",
    body: "Start from the decision, then compose. The Power BI chapter assumes the selection and integrity chapters.",
    chapters: ["01", "08", "09", "06"],
  },
  {
    title: "Present an analysis",
    body: "For a review or a stakeholder readout: audience, evidence, integrity, delivery.",
    chapters: ["02", "03", "07", "08"],
  },
  {
    title: "Prepare for interviews",
    body: "Trade-offs over definitions: core charts, advanced views, traps, then the question bank.",
    chapters: ["03", "04", "07", "10"],
  },
];

const START = [
  {
    icon: BookOpen,
    title: "Library map",
    body: "The exported hub: the working pipeline and the canonical chapter spine.",
    href: "/learn/overview",
    label: "Open the map",
  },
  {
    icon: Compass,
    title: "Decision assistant",
    body: "Answer two questions about the task and the data shape; get a defensible chart and the failure modes.",
    href: "/explore/choose",
    label: "Choose a chart",
  },
  {
    icon: BarChart3,
    title: "Six chart labs",
    body: "Histogram, box, scatter, line, bar, and dot — with the scale decisions that change the story.",
    href: "/explore/charts",
    label: "Open the labs",
  },
  {
    icon: ShieldCheck,
    title: "Integrity lab",
    body: "The same data, honest and misleading. Toggle the choice, not the numbers.",
    href: "/explore/integrity",
    label: "Run the lab",
  },
];

export default function LearnPage() {
  const covered = SOURCE_STATS.coveredLessons;
  const editorial = SOURCE_STATS.editorialLessons;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "Data Visualization — from question to decision",
    description:
      "A ten-chapter data-visualization curriculum with interactive chart labs, integrity demonstrations, and a deterministic chart decision assistant.",
    provider: { "@type": "Person", name: SITE.name, url: SITE.url },
    isAccessibleForFree: true,
    inLanguage: ["en", "ar"],
    numberOfCredits: 0,
    hasPart: CHAPTERS.map((chapter) => ({
      "@type": "Chapter",
      name: `${chapter.number}. ${chapter.title}`,
      url: `${SITE.url}${chapterHref(chapter)}/`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="border-b border-border">
        <Container className="pb-12 pt-20 md:pb-16 md:pt-24">
          <Eyebrow dot>Data Visualization · learning path</Eyebrow>
          <h1 className="mt-5 max-w-3xl text-balance text-4xl font-medium tracking-tight md:text-5xl">
            Read the chart. Then defend the decision.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            A ten-chapter path from the analytical question to the encoding, the
            scale, the dashboard, and the sentence you would say out loud in a
            review. Every source page from the owner&apos;s Notion export is
            published here, with the gaps labelled rather than hidden.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-2.5">
            <ButtonLink href="/learn/foundations" icon>
              Start with foundations
            </ButtonLink>
            <ButtonLink href="/learn/ar" variant="secondary">
              <Languages className="h-4 w-4" aria-hidden="true" />
              المسار العربي
            </ButtonLink>
            <ButtonLink href="/explore/choose" variant="ghost">
              I just need a chart
            </ButtonLink>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={String(CHAPTERS.length)} label="Chapters" note="One spine, ten decisions" />
            <Stat
              value={String(SOURCE_STATS.pages)}
              label="Source pages"
              note={`${SOURCE_STATS.textCharacters.toLocaleString("en-US")} characters`}
            />
            <Stat
              value={String(SOURCE_STATS.uniqueFigures)}
              label="Original figures"
              note="Hashed and served locally"
            />
            <Stat
              value={String(ArabicLessons.length)}
              label="Arabic lessons"
              note="Companion path, not a translation"
            />
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Start here"
            title="Four ways in"
            description="The path is sequential, but the labs are not locked. Use the entry point that matches the job in front of you."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {START.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col rounded-2xl border border-border bg-card/40 p-5 transition-colors hover:border-border-strong hover:bg-card/70"
              >
                <item.icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <h3 className="mt-4 text-sm font-medium">{item.title}</h3>
                <p className="mt-1.5 text-xs leading-6 text-muted-foreground">{item.body}</p>
                <span className="mt-auto flex items-center gap-1 pt-4 text-xs text-foreground">
                  {item.label}
                  <ArrowRight
                    className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-y border-border bg-card/20 py-14 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="The spine"
            title="Ten chapters, one question each"
            description="Chapters 1–10 follow the exported canonical map. Arabic companion lessons sit beside the English chapter they support."
          />
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {CHAPTERS.map((chapter) => (
              <ChapterCard key={chapter.number} chapter={chapter} />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 md:py-20">
        <Container>
          <SectionHeading
            eyebrow="Reading paths"
            title="Pick one job, then one route"
            description="The exported hub lists four jobs. These routes follow its chapter order rather than inventing a new curriculum."
          />
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {PATHS.map((path) => (
              <article key={path.title} className="rounded-2xl border border-border bg-card/40 p-5">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <h3 className="text-sm font-medium">{path.title}</h3>
                </div>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{path.body}</p>
                <ol className="mt-4 flex flex-wrap gap-1.5">
                  {path.chapters.map((number, index) => {
                    const chapter = CHAPTERS.find((item) => item.number === number);
                    if (!chapter) return null;
                    return (
                      <li key={`${path.title}-${number}-${index}`} className="flex items-center gap-1.5">
                        <Link
                          href={chapterHref(chapter)}
                          className="inline-flex h-7 items-center rounded-full border border-border bg-background px-2.5 font-mono text-[10px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                          title={chapter.title}
                        >
                          {number}
                        </Link>
                        {index < path.chapters.length - 1 ? (
                          <ArrowRight className="h-2.5 w-2.5 text-border-strong" aria-hidden="true" />
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-14 md:py-20">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            <div>
              <SectionHeading
                eyebrow="Provenance"
                title="Where this came from"
                description="The curriculum is built offline from the owner's local Notion HTML export, not scraped at runtime and not regenerated from a model."
              />
              <ul className="mt-6 space-y-2 text-sm leading-7 text-muted-foreground">
                <li className="flex gap-2">
                  <span aria-hidden="true" className="mt-3 h-1 w-1 shrink-0 rounded-full bg-border-strong" />
                  <span>
                    {SOURCE_STATS.pages} pages and {SOURCE_STATS.uniqueFigures} SVG figures
                    were inventoried, hashed, parsed into typed blocks, and checked for
                    unresolved links. {covered} lessons are direct source transcriptions.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden="true" className="mt-3 h-1 w-1 shrink-0 rounded-full bg-border-strong" />
                  <span>
                    {editorial} labelled editorial lessons fill canonical pages that were
                    not part of the export (Audience &amp; Story, Applied Cases). They are
                    new writing, not reconstructions.
                  </span>
                </li>
                <li className="flex gap-2">
                  <span aria-hidden="true" className="mt-3 h-1 w-1 shrink-0 rounded-full bg-border-strong" />
                  <span>
                    Interactive labs use disclosed synthetic datasets stored in the
                    repository; every number is reproducible from the same file.
                  </span>
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <LabLink href="/learn/method" label="How the import works" />
                <LabLink href="/practice" label="Practice the question bank" />
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-card/40 p-5">
              <h3 className="text-sm font-medium">Two languages, two lanes</h3>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                The Arabic pages are a companion path: they cover the same core plots
                in Arabic with their own examples and takeaways. They are not
                machine-translated copies of the English chapters.
              </p>
              <div className="mt-4 grid gap-2 text-xs">
                <Link
                  href="/learn/overview"
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 hover:border-border-strong"
                >
                  <span>
                    <span className="block font-medium text-foreground">English path</span>
                    <span className="text-muted-foreground">{EnglishLessons.length} lessons</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                <Link
                  href="/learn/ar"
                  dir="rtl"
                  lang="ar"
                  className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 hover:border-border-strong"
                >
                  <span>
                    <span className="block font-medium text-foreground">المسار العربي</span>
                    <span className="text-muted-foreground">{ArabicLessons.length} دروس</span>
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-border py-14 md:py-20">
        <Container>
          <div className="rounded-3xl border border-border bg-card/40 p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <Eyebrow>Practice</Eyebrow>
                <h2 className="mt-3 text-2xl font-medium tracking-tight">
                  The chart is easy. The defence is the skill.
                </h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Answer a question, then read why the alternatives fail. The practice
                  bank is built from the same ten chapters.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <ButtonLink href="/practice" icon>
                  Open practice
                </ButtonLink>
                <ButtonLink href="/explore/integrity" variant="secondary">
                  Integrity lab
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
