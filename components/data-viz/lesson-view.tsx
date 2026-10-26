import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  FileWarning,
  FlaskConical,
  Languages,
  Quote,
} from "lucide-react";
import {
  adjacentLessons,
  chapterHref,
  getChapter,
  getLessonBlocks,
  getSourcePage,
  lessonHref,
} from "@/lib/data-viz/content";
import type { Block, Inline, Lesson } from "@/lib/data-viz/types";
import { SourceBlocks } from "@/components/data-viz/source-blocks";
import { Container, Eyebrow } from "@/components/ui";
import { cn } from "@/lib/utils";

const COVERAGE_LABEL: Record<string, string> = {
  COVERED: "Direct transcription",
  COMBINED: "Combined source",
  ARCHIVED: "Archived source",
  OUT_OF_SCOPE: "Out of scope",
  MISSING: "Editorial — source missing",
  REVIEW_NEEDED: "Needs review",
};

function inlineText(nodes: Inline[]) {
  return nodes.map((node) => node.text).join("");
}

function collectText(blocks: Block[]): string {
  let text = "";
  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        text += ` ${block.text}`;
        break;
      case "paragraph":
      case "quote":
        text += ` ${inlineText(block.inline)}`;
        break;
      case "list":
        text += ` ${block.items.map(inlineText).join(" ")}`;
        break;
      case "table":
        text += ` ${block.headers.map(inlineText).join(" ")} ${block.rows
          .map((row) => row.map(inlineText).join(" "))
          .join(" ")}`;
        break;
      case "callout":
      case "toggle":
        text += ` ${collectText(block.blocks)}`;
        break;
      case "code":
        text += ` ${block.text}`;
        break;
      case "equation":
        text += ` ${block.tex}`;
        break;
      default:
        break;
    }
  }
  return text;
}

function headingsOf(blocks: Block[]) {
  const out: { text: string; anchor: string }[] = [];
  const visit = (items: Block[]) => {
    for (const block of items) {
      if (block.type === "heading" && block.level === 2) {
        out.push({ text: block.text, anchor: block.anchor });
      }
      if (block.type === "callout" || block.type === "toggle") visit(block.blocks);
    }
  };
  visit(blocks);
  return out;
}

export function LessonView({ lesson }: { lesson: Lesson }) {
  const chapter = lesson.chapter ? getChapter(lesson.chapter) : undefined;
  const page = getSourcePage(lesson);
  const body = getLessonBlocks(lesson);
  const { previous, next } = adjacentLessons(lesson);
  const isArabic = lesson.section === "ar";

  if (!body) {
    return (
      <Container className="py-24">
        <h1 className="text-2xl font-medium">Lesson content unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The importer did not produce a source page for this lesson and no editorial
          body exists. Run <code>node scripts/import-notion-data-viz.mjs</code>.
        </p>
      </Container>
    );
  }

  const text = collectText(body.blocks);
  const minutes = Math.max(1, Math.round(text.length / 900));
  const toc = page
    ? page.headings.filter((heading) => heading.level === 2).map((heading) => ({
        text: heading.text,
        anchor: heading.anchor,
      }))
    : headingsOf(body.blocks);
  const editorial = lesson.kind === "editorial";
  const otherHref = isArabic ? "/learn" : "/learn/ar";

  return (
    <article lang={isArabic ? "ar" : "en"} dir={isArabic ? "rtl" : "ltr"}>
      <header className="border-b border-border">
        <Container className="pb-8 pt-20 md:pb-10 md:pt-24">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/learn" className="hover:text-foreground">
              Data Visualization
            </Link>
            <span aria-hidden="true">/</span>
            {chapter ? (
              <>
                <Link href={chapterHref(chapter)} className="hover:text-foreground">
                  Chapter {chapter.number}
                </Link>
                <span aria-hidden="true">/</span>
              </>
            ) : (
              <>
                <span>Library map</span>
                <span aria-hidden="true">/</span>
              </>
            )}
            <span className="text-foreground/70">{lesson.title}</span>
          </nav>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
                editorial
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                  : "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
              )}
            >
              {editorial ? (
                <FileWarning className="h-3 w-3" aria-hidden="true" />
              ) : (
                <BadgeCheck className="h-3 w-3" aria-hidden="true" />
              )}
              {COVERAGE_LABEL[lesson.coverage] ?? lesson.coverage}
            </span>
            <Eyebrow>
              {chapter ? `Chapter ${chapter.number} · ${chapter.title}` : "Start here"}
            </Eyebrow>
            <span className="rounded-full border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              ~{minutes} min
            </span>
          </div>

          <h1
            dir={isArabic ? "rtl" : undefined}
            className="mt-4 max-w-3xl text-balance text-3xl font-medium tracking-tight md:text-4xl"
          >
            {lesson.title}
          </h1>

          {lesson.intro ? (
            <p
              dir={isArabic ? "rtl" : undefined}
              className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8"
            >
              {lesson.intro}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <Link
              href={otherHref}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 transition-colors hover:border-border-strong hover:text-foreground"
            >
              <Languages className="h-3.5 w-3.5" aria-hidden="true" />
              {isArabic ? "English path" : "المسار العربي"}
            </Link>
            {chapter?.lab ? (
              <Link
                href={chapter.lab.href}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 transition-colors hover:border-border-strong hover:text-foreground"
              >
                <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
                {chapter.lab.label}
              </Link>
            ) : null}
          </div>
        </Container>
      </header>

      <Container className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_270px] lg:gap-14 lg:py-14">
        <aside className="lg:col-start-2 lg:row-start-1">
          <div className="space-y-4 lg:sticky lg:top-24">
            {toc.length >= 3 ? (
              <nav
                aria-label="On this page"
                className="rounded-2xl border border-border bg-card/40 p-4"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  On this page
                </p>
                <ol className="mt-3 space-y-1.5 border-s border-border ps-3 text-xs leading-5">
                  {toc.map((heading) => (
                    <li key={heading.anchor}>
                      <a
                        href={`#${heading.anchor}`}
                        dir={isArabic ? "rtl" : undefined}
                        className="block py-0.5 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            ) : null}

            <div className="rounded-2xl border border-border bg-card/30 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Provenance
              </p>
              {page ? (
                <dl className="mt-3 space-y-2 text-[11px] leading-5 text-muted-foreground">
                  <div>
                    <dt className="text-foreground/70">Source file</dt>
                    <dd className="break-all font-mono text-[10px]">{page.source.file}</dd>
                  </div>
                  <div>
                    <dt className="text-foreground/70">SHA-256</dt>
                    <dd className="break-all font-mono text-[10px]">{page.source.sha256.slice(0, 24)}…</dd>
                  </div>
                  <div>
                    <dt className="text-foreground/70">Extracted</dt>
                    <dd>
                      {page.textLength.toLocaleString("en-US")} characters ·{" "}
                      {page.counts.blocks} blocks
                    </dd>
                  </div>
                  {page.canonicalUrl ? (
                    <div>
                      <dt className="text-foreground/70">Original</dt>
                      <dd>
                        <a
                          href={page.canonicalUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 text-foreground underline decoration-border-strong underline-offset-4"
                        >
                          Notion page
                          <ArrowRight className="h-3 w-3" aria-hidden="true" />
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              ) : (
                <p className="mt-3 text-[11px] leading-6 text-muted-foreground">
                  No source page was supplied for this lesson. It is new editorial
                  writing, labelled <strong className="font-medium text-foreground">MISSING</strong>{" "}
                  in the coverage ledger, and it is not counted as a transcription.
                </p>
              )}
              <p className="mt-3 border-t border-border pt-3 text-[10px] leading-5 text-muted-foreground">
                Source content is rendered as typed React blocks. No raw HTML is
                injected.
              </p>
            </div>
          </div>
        </aside>

        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          {lesson.takeaways.length ? (
            <div className="mb-8 rounded-2xl border border-border bg-card/40 p-5">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                What you should be able to do
              </p>
              <ul
                dir={isArabic ? "rtl" : undefined}
                className="mt-3 space-y-1.5 text-sm leading-7 text-foreground/80"
              >
                {lesson.takeaways.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-success"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <SourceBlocks blocks={body.blocks} direction={body.direction} />

          {chapter ? (
            <div className="mt-12 rounded-2xl border border-border bg-card/40 p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Chapter {chapter.number} · {chapter.title}
              </p>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{chapter.question}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={chapterHref(chapter)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border-strong bg-background px-4 py-2 text-xs font-medium hover:bg-card"
                >
                  Chapter overview
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
                {chapter.lab ? (
                  <Link
                    href={chapter.lab.href}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:border-border-strong hover:text-foreground"
                  >
                    <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
                    {chapter.lab.label}
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}

          <nav aria-label="Lesson navigation" className="mt-10 grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
            {previous ? (
              <Link
                href={lessonHref(previous)}
                className="group flex flex-col rounded-2xl border border-border p-4 transition-colors hover:border-border-strong hover:bg-card/40"
              >
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <ArrowLeft className="h-3 w-3" aria-hidden="true" />
                  Previous
                </span>
                <span
                  dir={previous.section === "ar" ? "rtl" : undefined}
                  className="mt-1.5 text-sm text-foreground group-hover:underline group-hover:decoration-border-strong group-hover:underline-offset-4"
                >
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={lessonHref(next)}
                className="group flex flex-col rounded-2xl border border-border p-4 text-end transition-colors hover:border-border-strong hover:bg-card/40"
              >
                <span className="flex items-center justify-end gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Next
                  <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
                <span
                  dir={next.section === "ar" ? "rtl" : undefined}
                  className="mt-1.5 text-sm text-foreground group-hover:underline group-hover:decoration-border-strong group-hover:underline-offset-4"
                >
                  {next.title}
                </span>
              </Link>
            ) : null}
          </nav>

          <p className="mt-8 flex items-center gap-2 text-[11px] leading-5 text-muted-foreground">
            <Quote className="h-3 w-3 shrink-0" aria-hidden="true" />
            {editorial
              ? "Editorial lesson — new writing, clearly separated from the imported corpus."
              : "Transcribed from the owner's local Notion export. Formatting is rebuilt; wording is preserved."}
          </p>
        </div>
      </Container>
    </article>
  );
}
