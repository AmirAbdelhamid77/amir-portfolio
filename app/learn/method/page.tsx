import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, FileWarning, ShieldCheck } from "lucide-react";
import {
  CURRICULUM_SOURCE,
  LESSONS,
  SOURCE_PAGES,
  SOURCE_STATS,
  lessonHref,
  routeForPageLink,
} from "@/lib/data-viz/content";
import { Container, Eyebrow, Stat } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "How this library was built",
  description:
    "The offline import, hashing, coverage, and editorial-labelling method behind the Data Visualization learning path — including what was missing from the source export.",
  alternates: { canonical: "/learn/method" },
};

const STEPS = [
  {
    title: "Inventory, then hash",
    body: "Every exported HTML file and SVG in the local folder was listed, hashed with SHA-256, and recorded with its byte size. Duplicate files and duplicate titles were checked explicitly. The export is flat: 25 pages and 12 figures, with no subdirectories.",
  },
  {
    title: "Parse into typed blocks",
    body: "A local importer reads headings, paragraphs, lists, callouts, toggles, tables, code, equations, and figures into typed JSON. Inline bold, emphasis, code, and links are recorded as marks — never as HTML. Notion wrappers are unwrapped so content is not silently lost.",
  },
  {
    title: "Resolve links and assets",
    body: "Relative page links are mapped to their destination lesson; assets are matched by filename, hashed, and copied to a local public path. Any unresolved reference is reported by the importer instead of becoming a broken link. This export had zero unresolved references.",
  },
  {
    title: "Reconcile against the canonical map",
    body: "The exported hub lists ten chapters. Every exported page was mapped to exactly one lesson in that spine. Three canonical destinations — the hub itself as a page, Audience & Story, and Applied Use Cases — were absent from the export and are handled explicitly rather than invented silently.",
  },
  {
    title: "Publish as React, not HTML",
    body: "Pages render the typed blocks as React elements. React escapes all text; the site never injects source HTML. Figures keep their original captions. Arabic blocks set their own direction, because several exported pages mix English and Arabic.",
  },
];

export default function MethodPage() {
  const covered = LESSONS.filter((lesson) => lesson.coverage === "COVERED");
  const editorial = LESSONS.filter((lesson) => lesson.kind === "editorial");
  const missing = LESSONS.filter((lesson) => lesson.coverage === "MISSING");

  return (
    <>
      <section className="border-b border-border">
        <Container className="pb-10 pt-20 md:pb-12 md:pt-24">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/learn" className="hover:text-foreground">
              Data Visualization
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-foreground/70">Method</span>
          </nav>
          <Eyebrow className="mt-6">Provenance &amp; method</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl">
            How this library was built
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            The owner supplied a local Notion HTML export. This site does not fetch
            Notion at runtime, does not regenerate the curriculum from a language
            model, and does not pretend the export was complete. Here is exactly what
            was read and what was added.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={String(SOURCE_STATS.pages)} label="HTML pages" note="All mapped" />
            <Stat
              value={SOURCE_STATS.textCharacters.toLocaleString("en-US")}
              label="Source characters"
              note="Plain text, before editorial"
            />
            <Stat value={String(SOURCE_STATS.uniqueFigures)} label="SVG figures" note="Hashed and local" />
            <Stat value={String(covered.length)} label="Transcribed lessons" note="One per page" />
          </dl>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <h2 className="text-2xl font-medium tracking-tight">Five steps, no shortcuts</h2>
          <ol className="mt-6 grid gap-3 md:grid-cols-2">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-2xl border border-border bg-card/40 p-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Step {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-sm font-medium">{step.title}</h3>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="border-y border-border bg-card/20 py-12 md:py-16">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-medium tracking-tight">Coverage accounting</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Every one of the {SOURCE_STATS.pages} exported pages has a destination.
                The only lessons without a source page are the two explicitly labelled
                editorial ones.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                {covered.length} covered
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-800 dark:text-amber-300">
                <FileWarning className="h-3.5 w-3.5" aria-hidden="true" />
                {missing.length} missing / editorial
              </span>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto rounded-2xl border border-border bg-background" tabIndex={0}>
            <table className="w-full border-collapse text-xs">
              <caption className="sr-only">
                Every exported HTML page and the lesson that publishes it.
              </caption>
              <thead>
                <tr className="border-b border-border bg-card/60 text-start">
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">Source file</th>
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">Title</th>
                  <th scope="col" className="px-4 py-2.5 text-start font-medium">Destination</th>
                  <th scope="col" className="px-4 py-2.5 text-end font-medium">Chars</th>
                </tr>
              </thead>
              <tbody>
                {[...SOURCE_PAGES]
                  .sort((a, b) => a.slug.localeCompare(b.slug))
                  .map((page) => {
                    const route = routeForPageLink(page.slug);
                    const lesson = LESSONS.find((item) => item.source === page.slug);
                    return (
                      <tr key={page.slug} className="border-b border-border last:border-0">
                        <td className="max-w-[18rem] break-all px-4 py-2.5 font-mono text-[10px] text-muted-foreground">
                          {page.source.file}
                        </td>
                        <td className="px-4 py-2.5 text-foreground">{page.title}</td>
                        <td className="px-4 py-2.5">
                          {route && lesson ? (
                            <Link
                              href={lessonHref(lesson)}
                              className="text-foreground underline decoration-border-strong underline-offset-4"
                            >
                              {lesson.title}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">Unmapped</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-end font-mono text-[10px] text-muted-foreground">
                          {page.textLength.toLocaleString("en-US")}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-16">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-medium tracking-tight">What is editorial</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {CURRICULUM_SOURCE.note}
              </p>
              <ul className="mt-4 space-y-2">
                {editorial.map((lesson) => (
                  <li key={lesson.slug}>
                    <Link
                      href={lessonHref(lesson)}
                      className="group flex items-start justify-between gap-4 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-4"
                    >
                      <span>
                        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                          <FileWarning className="h-3.5 w-3.5 text-amber-700 dark:text-amber-300" aria-hidden="true" />
                          {lesson.title}
                        </span>
                        <span className="mt-1 block text-xs leading-6 text-muted-foreground">
                          {lesson.intro}
                        </span>
                      </span>
                      <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-medium tracking-tight">What was preserved, what changed</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground">
                <p>
                  <strong className="font-medium text-foreground">Preserved:</strong> the
                  original wording, headings, examples, caveats, equations, tables,
                  figure captions, Arabic text, and links. The figure files are the
                  originals, copied byte-for-byte and hashed.
                </p>
                <p>
                  <strong className="font-medium text-foreground">Rebuilt:</strong> the
                  HTML structure, typography, spacing, and navigation. Notion&apos;s
                  export wrappers and inline KaTeX markup are replaced with semantic
                  HTML elements. Equations are shown as their plain TeX source rather
                  than pretending to be typeset mathematics.
                </p>
                <p>
                  <strong className="font-medium text-foreground">Not added silently:</strong>{" "}
                  no source paragraph was rewritten to be more engaging, and no chart
                  was invented for a lesson that did not have one. Interactive labs are
                  clearly separated from the transcription.
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-border bg-card/40 p-4">
                <p className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Safety and accessibility
                </p>
                <ul className="mt-2 space-y-1 text-xs leading-6 text-muted-foreground">
                  <li>No scripts, event handlers, or external references in any SVG.</li>
                  <li>No raw HTML injection; all source strings are escaped by React.</li>
                  <li>Charts ship with data tables; motion respects reduced-motion.</li>
                  <li>Arabic blocks carry their own direction and language attributes.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-border bg-card/30 p-5 text-xs leading-6 text-muted-foreground">
            <p>
              Spotted a transcription error? The source hash is shown on every lesson
              page so a correction can be traced to a specific file.{" "}
              <a
                href={`mailto:${SITE.email}?subject=${encodeURIComponent("Data Visualization library correction")}`}
                className="text-foreground underline decoration-border-strong underline-offset-4"
              >
                Send the correction
              </a>{" "}
              with the lesson name and the sentence.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
