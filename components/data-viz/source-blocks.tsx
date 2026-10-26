import Image from "next/image";
import Link from "next/link";
import { ExternalLink, GitBranch, Quote } from "lucide-react";
import { routeForPageLink } from "@/lib/data-viz/content";
import { figureForSrc } from "@/lib/data-viz/figures";
import { LiveFigure } from "@/components/data-viz/live-figure";
import type { Block, Inline } from "@/lib/data-viz/types";
import { cn } from "@/lib/utils";

// Source content reaches the page as typed blocks. Nothing here uses
// `dangerouslySetInnerHTML`: every string is escaped by React, and only link
// URLs that the importer classified are ever emitted as `href`.

const ARABIC = /[\u0600-\u06ff]/g;
const LATIN = /[A-Za-z]/g;

function counts(text: string) {
  return {
    arabic: (text.match(ARABIC) ?? []).length,
    latin: (text.match(LATIN) ?? []).length,
  };
}

/** Per-block direction, because several exported pages mix English and Arabic. */
export function directionFor(text: string, fallback: "ltr" | "rtl" = "ltr") {
  const { arabic, latin } = counts(text);
  if (!arabic && !latin) return fallback;
  if (!arabic) return "ltr";
  if (!latin) return "rtl";
  return arabic / (arabic + latin) > 0.35 ? "rtl" : "ltr";
}

function textOf(nodes: Inline[]) {
  return nodes.map((node) => node.text).join("");
}

function InlineRun({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        let content: React.ReactNode = node.text;
        if (node.code) {
          content = (
            <code className="rounded bg-foreground/[0.06] px-1 py-0.5 font-mono text-[0.9em] text-foreground">
              {content}
            </code>
          );
        }
        if (node.em) content = <em>{content}</em>;
        if (node.strong) content = <strong className="font-medium text-foreground">{content}</strong>;

        if (node.link) {
          const href = resolveHref(node.link);
          if (href) {
            const external = href.startsWith("http") || href.startsWith("mailto:");
            if (external) {
              return (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-baseline gap-0.5 text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground"
                >
                  {content}
                  <ExternalLink className="h-3 w-3 shrink-0 self-center" aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              );
            }
            return (
              <Link
                key={index}
                href={href}
                className="text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground"
              >
                {content}
              </Link>
            );
          }
        }

        return <span key={index}>{content}</span>;
      })}
    </>
  );
}

function resolveHref(link: NonNullable<Inline["link"]>): string | null {
  if (link.kind === "page" && link.targetSlug) {
    const route = routeForPageLink(link.targetSlug);
    if (route) return link.anchor ? `${route}${link.anchor}` : route;
    return null;
  }
  if (link.kind === "anchor") return link.href;
  if (link.kind === "route") return link.href;
  if (link.kind === "external" || link.kind === "notion") return link.href;
  return null;
}

const CALLOUT_TONES: Record<string, string> = {
  blue: "border-sky-500/25 bg-sky-500/[0.07]",
  teal: "border-teal-500/25 bg-teal-500/[0.07]",
  purple: "border-violet-500/25 bg-violet-500/[0.07]",
  yellow: "border-amber-500/30 bg-amber-500/[0.08]",
  gray: "border-border bg-card/60",
};

function Blocks({ blocks, fallbackDir }: { blocks: Block[]; fallbackDir: "ltr" | "rtl" }) {
  return (
    <>
      {blocks.map((block, index) => (
        <BlockView key={index} block={block} fallbackDir={fallbackDir} />
      ))}
    </>
  );
}

function BlockView({ block, fallbackDir }: { block: Block; fallbackDir: "ltr" | "rtl" }) {
  switch (block.type) {
    case "heading": {
      const dir = directionFor(block.text, fallbackDir);
      const className = cn(
        "scroll-mt-28 text-balance font-medium tracking-tight text-foreground",
        block.level === 2 && "mt-12 text-xl md:text-2xl",
        block.level === 3 && "mt-8 text-lg",
        block.level === 4 && "mt-6 text-base",
      );
      const props = { id: block.anchor, dir, lang: dir === "rtl" ? "ar" : undefined, className };
      if (block.level === 2) return <h2 {...props}>{block.text}</h2>;
      if (block.level === 3) return <h3 {...props}>{block.text}</h3>;
      return <h4 {...props}>{block.text}</h4>;
    }

    case "paragraph": {
      const text = textOf(block.inline);
      if (!text.trim()) return null;
      return (
        <p
          dir={directionFor(text, fallbackDir)}
          lang={directionFor(text, fallbackDir) === "rtl" ? "ar" : undefined}
          className="text-sm leading-8 text-muted-foreground sm:text-[15px]"
        >
          <InlineRun nodes={block.inline} />
        </p>
      );
    }

    case "list": {
      const text = block.items.map(textOf).join(" ");
      const dir = directionFor(text, fallbackDir);
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag
          dir={dir}
          lang={dir === "rtl" ? "ar" : undefined}
          className={cn(
            "space-y-2 ps-5 text-sm leading-8 text-muted-foreground sm:text-[15px]",
            block.ordered ? "list-decimal" : "list-disc",
            "marker:text-muted-foreground/60",
          )}
        >
          {block.items.map((item, index) => (
            <li key={index} className="ps-1">
              <InlineRun nodes={item} />
            </li>
          ))}
        </ListTag>
      );
    }

    case "quote": {
      const text = textOf(block.inline);
      return (
        <blockquote
          dir={directionFor(text, fallbackDir)}
          className="my-6 flex gap-3 border-s-2 border-border-strong ps-4 text-sm leading-8 text-foreground/80 sm:text-[15px]"
        >
          <Quote className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span>
            <InlineRun nodes={block.inline} />
          </span>
        </blockquote>
      );
    }

    case "callout": {
      const text = textOf(
        block.blocks.flatMap((inner) =>
          inner.type === "paragraph" || inner.type === "quote"
            ? inner.inline
            : inner.type === "heading"
              ? [{ text: inner.text }]
              : [],
        ),
      );
      const dir = directionFor(text, fallbackDir);
      return (
        <aside
          dir={dir}
          lang={dir === "rtl" ? "ar" : undefined}
          className={cn(
            "my-6 space-y-3 rounded-2xl border p-4 text-sm leading-7 sm:p-5",
            CALLOUT_TONES[block.tone] ?? CALLOUT_TONES.gray,
          )}
        >
          <Blocks blocks={block.blocks} fallbackDir={dir} />
        </aside>
      );
    }

    case "code":
      return (
        <div className="my-6 overflow-hidden rounded-2xl border border-border bg-card/60">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <GitBranch className="h-3 w-3" aria-hidden="true" />
              {block.language || "code"}
            </span>
            {block.language === "mermaid" ? (
              <span className="text-[10px] text-muted-foreground">Diagram source</span>
            ) : null}
          </div>
          <pre
            dir="ltr"
            className="overflow-x-auto p-4 text-xs leading-6 text-foreground/90"
            tabIndex={0}
          >
            <code>{block.text}</code>
          </pre>
        </div>
      );

    case "table": {
      const headerText = block.headers.map(textOf).join(" ");
      const dir = directionFor(headerText, fallbackDir);
      return (
        <div className="my-6 overflow-x-auto rounded-2xl border border-border" tabIndex={0}>
          <table dir={dir} className="w-full border-collapse text-start text-sm">
            {block.headers.length ? (
              <thead>
                <tr className="border-b border-border bg-card/60">
                  {block.headers.map((cell, index) => (
                    <th
                      key={index}
                      scope="col"
                      className="px-4 py-2.5 text-start text-xs font-medium uppercase tracking-[0.08em] text-foreground"
                    >
                      <InlineRun nodes={cell} />
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-border last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-4 py-2.5 align-top text-muted-foreground"
                    >
                      <InlineRun nodes={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "figure": {
      const alt = block.alt || block.caption || "Teaching figure";
      const meta = figureForSrc(block.src);
      if (meta) {
        return (
          <LiveFigure
            meta={meta}
            caption={block.caption}
            original={
              <div className="overflow-hidden rounded-xl border border-border bg-white p-2">
                <Image
                  src={block.src}
                  alt={alt}
                  width={block.width ?? 900}
                  height={block.height ?? 360}
                  className="h-auto w-full"
                  sizes="(min-width: 768px) 720px, 100vw"
                  unoptimized
                />
              </div>
            }
          />
        );
      }
      return (
        <figure className="my-7">
          <div className="overflow-hidden rounded-2xl border border-border bg-white p-2 shadow-sm sm:p-3">
            <Image
              src={block.src}
              alt={alt}
              width={block.width ?? 900}
              height={block.height ?? 360}
              className="h-auto w-full"
              sizes="(min-width: 768px) 720px, 100vw"
              unoptimized
            />
          </div>
          {block.caption ? (
            <figcaption className="mt-2 text-xs leading-6 text-muted-foreground">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    }

    case "equation":
      return (
        <div
          role="math"
          aria-label={block.tex}
          dir="ltr"
          className="my-6 overflow-x-auto rounded-2xl border border-border bg-card/40 px-4 py-3 text-center font-mono text-sm text-foreground"
        >
          {block.tex}
        </div>
      );

    case "toggle": {
      const dir = directionFor(`${block.summary} ${textOf(block.blocks.flatMap((inner) => (inner.type === "paragraph" ? inner.inline : [])))}`, fallbackDir);
      return (
        <details
          dir={dir}
          className="group my-4 rounded-2xl border border-border bg-background/40 open:bg-card/40"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-foreground">
            <span>{block.summary}</span>
            <span
              aria-hidden="true"
              className="text-muted-foreground transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="space-y-3 border-t border-border px-4 py-4">
            <Blocks blocks={block.blocks} fallbackDir={dir} />
          </div>
        </details>
      );
    }

    case "divider":
      return <hr className="my-10 border-border" />;

    default:
      return null;
  }
}

export function SourceBlocks({
  blocks,
  direction = "ltr",
}: {
  blocks: Block[];
  direction?: "ltr" | "rtl";
}) {
  return (
    <div className="space-y-4" dir={direction}>
      <Blocks blocks={blocks} fallbackDir={direction} />
    </div>
  );
}
