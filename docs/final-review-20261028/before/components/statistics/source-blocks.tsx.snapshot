import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, BookMarked, TriangleAlert } from "lucide-react";
import type { Block, Inline, SourceSection } from "@/lib/statistics/source";
import { inlineText, sectionMetaFor } from "@/lib/statistics/source";
import { MathBlock } from "@/components/statistics/math";
import { LessonVisual } from "@/components/statistics/visual-registry";
import { cn } from "@/lib/utils";

function hasArabic(text: string): boolean {
  return /[\u0600-\u06ff]/.test(text);
}

function InlineNodes({ nodes }: { nodes: readonly Inline[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        if (node.math) {
          return <MathBlock key={`math-${index}`} tex={node.math} alt={node.raw} />;
        }
        let content: ReactNode = node.text ?? "";
        if (node.code) {
          content = (
            <code className="rounded bg-card px-1 py-0.5 font-mono text-[0.85em] text-foreground">
              {content}
            </code>
          );
        }
        if (node.em) content = <em>{content}</em>;
        if (node.strong) content = <strong className="font-medium text-foreground">{content}</strong>;
        return <span key={`text-${index}`}>{content}</span>;
      })}
    </>
  );
}

function correctionFor(sourceNumber: number, text: string): string | null {
  if (sourceNumber === 10 && text.includes("11%")) {
    return "Verified correction: for λ=20, P(X ≥ 25) = 0.1567726218, i.e. 15.68% — not “a little over 11%”. The exact value is computed in tests/statistics/math.test.mjs; see math-errata.md.";
  }
  if (sourceNumber === 19 && text.includes("0.037")) {
    return "Source qualification: this p-value is illustrative. The export gives no sample size, standard error or test statistic, so it cannot be independently reproduced; it is not used as a verified quiz answer.";
  }
  return null;
}

export function SourceBlocks({ blocks, sourceNumber }: { blocks: readonly Block[]; sourceNumber: number }) {
  return <Blocks blocks={blocks} sourceNumber={sourceNumber} />;
}

function Blocks({ blocks, sourceNumber }: { blocks: readonly Block[]; sourceNumber: number }) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 1) return null;
          const Tag = block.level === 2 ? "h3" : block.level === 3 ? "h4" : "h5";
          return (
            <Tag
              key={`h-${block.anchor}`}
              id={block.anchor}
              dir="auto"
              lang={hasArabic(block.text) ? "ar" : undefined}
              className={cn(
                "scroll-mt-28 font-medium tracking-tight text-foreground",
                block.level === 2
                  ? "mt-7 text-lg"
                  : block.level === 3
                    ? "mt-5 text-base"
                    : "mt-4 text-sm",
              )}
            >
              {block.text}
            </Tag>
          );
        }

        if (block.type === "paragraph") {
          const arabic = hasArabic(inlineText(block.inline));
          const correction = correctionFor(sourceNumber, inlineText(block.inline));
          return (
            <div key={`p-${index}`}>
              <p dir="auto" lang={arabic ? "ar" : undefined} className="mt-3 text-sm leading-7 text-muted-foreground">
                <InlineNodes nodes={block.inline} />
              </p>
              {correction ? (
                <p role="note" className="mt-2 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-3 py-2 text-[11px] leading-5 text-muted-foreground">
                  <strong className="font-medium text-foreground">Verification · </strong>
                  {correction}
                </p>
              ) : null}
            </div>
          );
        }

        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List
              key={`l-${index}`}
              dir="auto"
              className={cn(
                "mt-3 space-y-1.5 ps-5 text-sm leading-7 text-muted-foreground",
                block.ordered ? "list-decimal" : "list-disc",
              )}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`li-${itemIndex}`} lang={hasArabic(inlineText(item)) ? "ar" : undefined} className="ps-1 marker:text-border-strong">
                  <InlineNodes nodes={item} />
                </li>
              ))}
            </List>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={`q-${index}`}
              dir="auto"
              className="mt-4 border-s-2 border-border-strong ps-4 text-sm italic leading-7 text-muted-foreground"
            >
              <InlineNodes nodes={block.inline} />
            </blockquote>
          );
        }

        if (block.type === "formula") {
          const correction = correctionFor(sourceNumber, block.raw);
          return (
            <div key={`f-${index}`}>
              <div className="my-3 overflow-x-auto rounded-xl border border-border bg-background px-4 py-3">
                <MathBlock tex={block.tex} display alt={block.alt} />
                <span className="sr-only">Source formula: {block.raw}</span>
              </div>
              {correction ? (
                <p role="note" className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] px-3 py-2 text-[11px] leading-5 text-muted-foreground">
                  <strong className="font-medium text-foreground">Verification · </strong>
                  {correction}
                </p>
              ) : null}
            </div>
          );
        }

        if (block.type === "callout") {
          return (
            <aside
              key={`c-${index}`}
              dir="auto"
              className="mt-4 rounded-2xl border border-sky-500/25 bg-sky-500/[0.07] p-4 text-sm leading-7 text-muted-foreground"
            >
              <p className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-sky-800 dark:text-sky-300">
                <BookMarked className="h-3.5 w-3.5" aria-hidden="true" />
                Source note {block.icon}
              </p>
              <Blocks blocks={block.blocks} sourceNumber={sourceNumber} />
            </aside>
          );
        }

        if (block.type === "toggle") {
          return (
            <details
              key={`t-${index}`}
              className="group mt-3 rounded-xl border border-border bg-card/30"
            >
              <summary
                dir="auto"
                className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-2.5 text-xs font-medium text-foreground"
              >
                {block.summary}
                <span aria-hidden="true" className="text-muted-foreground transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="border-t border-border px-3 pb-3">
                <Blocks blocks={block.blocks} sourceNumber={sourceNumber} />
              </div>
            </details>
          );
        }

        if (block.type === "table") {
          return (
            <div key={`tb-${index}`} className="mt-4 overflow-x-auto rounded-xl border border-border" tabIndex={0}>
              <table className="w-full border-collapse text-xs">
                <caption className="sr-only">Table from source section §{sourceNumber}</caption>
                <thead>
                  <tr className="border-b border-border bg-card/60">
                    {block.headers.map((cell, cellIndex) => (
                      <th
                        key={`th-${cellIndex}`}
                        scope="col"
                        dir="auto"
                        className="px-3 py-2 text-start font-medium text-foreground"
                      >
                        <InlineNodes nodes={cell} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={`tr-${rowIndex}`} className="border-b border-border last:border-0">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`td-${cellIndex}`}
                          dir="auto"
                          className="px-3 py-2 align-top leading-6 text-muted-foreground"
                        >
                          <InlineNodes nodes={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === "code") {
          const isMermaid = block.language === "mermaid";
          return (
            <details
              key={`code-${index}`}
              className="group mt-3 rounded-xl border border-border bg-background"
            >
              <summary className="cursor-pointer list-none px-3 py-2 text-[11px] text-muted-foreground">
                {isMermaid
                  ? "Original Mermaid diagram source (preserved for provenance)"
                  : `Source code · ${block.language || "text"}`}
              </summary>
              <pre
                tabIndex={0}
                className="overflow-x-auto border-t border-border p-3 font-mono text-[10px] leading-5 text-muted-foreground"
              >
                {block.text}
              </pre>
            </details>
          );
        }

        if (block.type === "divider") {
          return <hr key={`hr-${index}`} className="my-5 border-border" />;
        }

        return null;
      })}
    </>
  );
}

function firstParagraphIndex(blocks: readonly Block[]): number {
  return blocks.findIndex((block) => block.type === "paragraph");
}

export function SourceSectionView({ section }: { section: SourceSection }) {
  const meta = sectionMetaFor(section.number);
  const blocks = section.blocks.filter(
    (block) => !(block.type === "heading" && block.level === 1),
  );
  const placement = meta.visual?.placement ?? "end";
  const introIndex = firstParagraphIndex(blocks);
  const splitAt = placement === "after-intro" && introIndex >= 0 ? introIndex + 1 : 0;
  const before = splitAt > 0 ? blocks.slice(0, splitAt) : [];
  const after = splitAt > 0 ? blocks.slice(splitAt) : blocks;

  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-title`}
      className="scroll-mt-24 border-t border-border pt-8 first:border-t-0 first:pt-0"
    >
      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        <span className="rounded-full border border-border bg-card/60 px-2 py-0.5">
          Source §{section.number}
        </span>
        <span>
          {meta.coverage === "CORE"
            ? "Core concept"
            : meta.coverage === "SUPPORTING"
              ? "Supporting concept"
              : "Text reference"}
        </span>
      </div>

      <h2
        id={`${section.id}-title`}
        className="mt-2 text-balance text-2xl font-medium tracking-tight text-foreground sm:text-3xl"
      >
        {meta.titleEn}
      </h2>
      <p dir="auto" lang={hasArabic(section.title) ? "ar" : undefined} className="mt-1 text-sm text-muted-foreground">
        {section.title}
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card/30 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">After this section</p>
          <p className="mt-1 text-[11px] leading-5 text-foreground/80">{meta.objectives[0]}</p>
        </div>
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.05] px-3 py-2">
          <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-amber-800 dark:text-amber-300">
            <TriangleAlert className="h-3 w-3" aria-hidden="true" />
            Common trap
          </p>
          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{meta.misconception}</p>
        </div>
      </div>

      {meta.sourceNote ? (
        <div className="mt-3 rounded-xl border border-sky-500/25 bg-sky-500/[0.05] px-3 py-2 text-[11px] leading-5 text-muted-foreground">
          <strong className="font-medium text-foreground">Verification note.</strong> {meta.sourceNote}
        </div>
      ) : null}

      {placement === "before" && meta.visual ? (
        <LessonVisual id={meta.visual.id} title={meta.visual.title} />
      ) : null}

      <div className="mt-2">
        <Blocks blocks={before} sourceNumber={section.number} />
      </div>

      {placement === "after-intro" && meta.visual ? (
        <LessonVisual id={meta.visual.id} title={meta.visual.title} />
      ) : null}

      <div className="mt-2">
        <Blocks blocks={after} sourceNumber={section.number} />
      </div>

      {placement === "end" && meta.visual ? (
        <LessonVisual id={meta.visual.id} title={meta.visual.title} />
      ) : null}

      {meta.coverage === "TEXT_ONLY" && meta.coverageReason ? (
        <p className="mt-3 rounded-xl border border-border bg-card/30 p-3 text-[11px] leading-5 text-muted-foreground">
          No interactive exhibit: {meta.coverageReason}
        </p>
      ) : null}

      <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        <span>
          Transcribed from the local export, §{section.number} · {section.textLength.toLocaleString("en")} chars ·{" "}
          {section.headings.length} heading{section.headings.length === 1 ? "" : "s"}
        </span>
        <Link
          href={`/learn/statistics/journey/${meta.journey}#${section.id}`}
          className="inline-flex items-center gap-1 text-foreground/70 hover:text-foreground"
        >
          Deep link <ArrowUpRight className="h-2.5 w-2.5" aria-hidden="true" />
        </Link>
      </p>
    </section>
  );
}

