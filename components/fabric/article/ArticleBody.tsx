/**
 * Fabric article renderer (FC05). Server component — no "use client", no
 * hooks: the compiled typed-node JSON is turned into static HTML at build
 * time so every article body reads and prints without JavaScript (handover
 * 03 §"Hosting-agnostic release contract").
 *
 * Rendering decisions (link rewrite classes, anchor validation, admonition
 * mapping, image fallback) live in ./decisions.ts and are fixture-tested;
 * this file is the React projection of those decisions.
 *
 * Visual language: the site's existing fabric hub patterns
 * (components/fabric/ui.tsx) — border-border, rounded-2xl/3xl, text-sm
 * leading-7 typography.
 */
/* eslint-disable @next/next/no-img-element -- corpus media are pre-copied
   static files with build-time dimensions (asset manifest); the Next image
   optimiser needs a server, and next.config.ts pins images.unoptimized. */

import type { ReactNode } from "react";
import Link from "next/link";

import type { ArticleData, CompiledBlock, IncludeFragment } from "@/lib/fabric/articles/article-data";
import { getFamilyAssets } from "@/lib/fabric/articles/registry";
import { assetUrl } from "@/lib/fabric/articles/registry";
import {
  decideAdmonition,
  decideImage,
  decideInlineHtml,
  decideLink,
  type ImageDecisionContext,
  type LinkContext,
} from "./decisions";

export interface ArticleBodyProps {
  data: ArticleData;
  linkContext: LinkContext;
  /** Upstream page for this article (used by image fallbacks). */
  upstreamUrl: string;
}

interface RenderState {
  data: ArticleData;
  linkContext: LinkContext;
  imageContext: ImageDecisionContext;
  upstreamUrl: string;
}

export function ArticleBody({ data, linkContext, upstreamUrl }: ArticleBodyProps) {
  const manifestFamily = getFamilyAssets(data.row.family);
  const state: RenderState = {
    data,
    linkContext,
    imageContext: {
      family: data.row.family,
      articleDir: data.row.articleSegments.slice(0, -1),
      manifestFamily,
    },
    upstreamUrl,
  };
  return (
    <div className="space-y-5">
      {data.blocks.map((block, index) => (
        <Block key={index} block={block} state={state} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Blocks
// ---------------------------------------------------------------------------

function Block({ block, state }: { block: CompiledBlock; state: RenderState }) {
  switch (block.type) {
    case "heading":
      return <Heading block={block} />;
    case "paragraph":
      return (
        <p className="text-sm leading-7 text-foreground">
          <Inline blocks={asArray(block.inline)} state={state} />
        </p>
      );
    case "list":
      return <List block={block} state={state} />;
    case "table":
      return <Table block={block} state={state} />;
    case "code":
      return <CodeBlock block={block} />;
    case "blockquote":
      return (
        <blockquote className="border-l-2 border-border-strong pl-4 text-sm leading-7 text-muted-foreground">
          <Blocks blocks={asArray(block.children)} state={state} />
        </blockquote>
      );
    case "admonition":
      return <Admonition block={block} state={state} />;
    case "thematicBreak":
      return <hr className="border-border" />;
    case "include":
      return <Include block={block} state={state} />;
    case "learnConstruct":
      return <LearnConstruct block={block} state={state} />;
    case "content":
    case "complex":
      return <Figure source={block.source} alt={block["alt-text"]} state={state} />;
    case "commentedDirective":
      return null; // accounted by the compiler; not article content
    default:
      // Unknown-but-benign block: render nothing rather than guessing; the
      // compiler receipt logs anything material it removed.
      return null;
  }
}

function Blocks({ blocks, state }: { blocks: CompiledBlock[]; state: RenderState }) {
  return (
    <>
      {blocks.map((block, index) => (
        <div key={index} className="space-y-3 [&>div]:space-y-0">
          <Block block={block} state={state} />
        </div>
      ))}
    </>
  );
}

function Heading({ block }: { block: CompiledBlock }) {
  const level = typeof block.level === "number" ? block.level : 2;
  const slug = typeof block.slug === "string" ? block.slug : undefined;
  const text = typeof block.text === "string" ? block.text : "";
  // The page renders the article title as h1; body h1/h2 both map to h2,
  // deeper levels keep the h2–h4 hierarchy (task FC05).
  const Tag = level <= 2 ? "h2" : level === 3 ? "h3" : "h4";
  const className =
    level <= 2
      ? "pt-6 text-xl font-medium tracking-tight text-foreground"
      : level === 3
        ? "pt-4 text-base font-medium tracking-tight text-foreground"
        : "pt-3 text-sm font-semibold tracking-tight text-foreground";
  return (
    <Tag id={slug} className={className}>
      {text}
    </Tag>
  );
}

function List({ block, state }: { block: CompiledBlock; state: RenderState }) {
  const ordered = block.ordered === true;
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag
      className={
        ordered
          ? "list-decimal space-y-1.5 pl-6 text-sm leading-7 text-foreground"
          : "list-disc space-y-1.5 pl-6 text-sm leading-7 text-foreground"
      }
    >
      {(asArray(block.items) as CompiledBlock[]).map((item, index) => (
        <li key={index} className="pl-1">
          <Inline blocks={asArray(item.inline)} state={state} />
          {Array.isArray(item.children) && item.children.length > 0 ? (
            <div className="mt-1.5 mb-1 space-y-1.5">
              {item.children.map((child: CompiledBlock, childIndex: number) => (
                <Block key={childIndex} block={child} state={state} />
              ))}
            </div>
          ) : null}
        </li>
      ))}
    </Tag>
  );
}

const ALIGN_CLASS: Record<string, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
  none: "text-left",
};

function Table({ block, state }: { block: CompiledBlock; state: RenderState }) {
  const alignments = Array.isArray(block.alignments) ? (block.alignments as string[]) : [];
  const header = asArray(block.header) as CompiledBlock[];
  const rows = (Array.isArray(block.rows) ? block.rows : []) as CompiledBlock[][];
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card/30">
      <table className="w-full border-collapse text-left text-xs leading-6">
        <thead>
          <tr className="border-b border-border">
            {header.map((cell, index) => (
              <th
                key={index}
                scope="col"
                className={`py-2.5 pr-4 pl-4 font-medium text-foreground ${ALIGN_CLASS[alignments[index] ?? "none"] ?? "text-left"}`}
              >
                <Inline blocks={asArray(cell.inline)} state={state} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border/60 last:border-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={`py-2.5 pr-4 pl-4 align-top text-muted-foreground first:text-foreground ${ALIGN_CLASS[alignments[cellIndex] ?? "none"] ?? "text-left"}`}
                >
                  <Inline blocks={asArray(cell.inline)} state={state} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock({ block }: { block: CompiledBlock }) {
  const language = typeof block.language === "string" && block.language !== "" ? block.language : null;
  const value = typeof block.value === "string" ? block.value : "";
  return (
    <figure className="overflow-hidden rounded-2xl border border-border bg-card/60">
      {language ? (
        <figcaption className="border-b border-border/70 bg-background/60 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
          {language}
        </figcaption>
      ) : null}
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-foreground">
        <code>{value}</code>
      </pre>
    </figure>
  );
}

function Admonition({ block, state }: { block: CompiledBlock; state: RenderState }) {
  const decision = decideAdmonition(block.kind);
  const label = decision?.label ?? "Note";
  const tone = decision?.tone ?? "info";
  const border =
    tone === "warning"
      ? "border-warning/40 bg-warning/5"
      : tone === "success"
        ? "border-success/30 bg-success/5"
        : "border-border bg-background/60";
  return (
    <aside className={`rounded-2xl border ${border} p-4 text-sm leading-7`} role="note" aria-label={label}>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.08em] text-foreground">{label}</p>
      <div className="space-y-2 text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
        <Blocks blocks={asArray(block.children)} state={state} />
      </div>
    </aside>
  );
}

function Include({ block, state }: { block: CompiledBlock; state: RenderState }) {
  const fragment = findFragment(block, state);
  if (!fragment) return <BlockedInclude block={block} />;
  if (fragment.blocked) return <BlockedInclude block={block} reason={fragment.blockedReason} />;
  return (
    <div className="space-y-3">
      <Blocks blocks={fragment.blocks} state={state} />
    </div>
  );
}

function findFragment(block: CompiledBlock, state: RenderState): IncludeFragment | undefined {
  const resolved = typeof block.resolved === "string" ? block.resolved : null;
  return resolved ? state.data.includes.get(`docs/${resolved}`) : undefined;
}

function BlockedInclude({ block, reason }: { block: CompiledBlock; reason?: string | null }) {
  const target = typeof block.target === "string" ? block.target : "include";
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background/40 p-3 text-xs leading-6 text-muted-foreground" role="note">
      Included section not available in the local copy ({target}
      {reason ? `; ${reason}` : ""}). See the upstream source page for the original content.
    </div>
  );
}

function LearnConstruct({ block, state }: { block: CompiledBlock; state: RenderState }) {
  const kind = typeof block.kind === "string" ? block.kind : "";
  const attributes = (block.attributes ?? {}) as Record<string, unknown>;
  const children = asArray(block.children);
  switch (kind) {
    case "image":
      return <Figure source={attributes.source} alt={attributes["alt-text"]} state={state} />;
    case "zone": {
      const pivot = typeof attributes.pivot === "string" ? attributes.pivot : null;
      return (
        <section
          className="space-y-4 rounded-3xl border border-border/70 bg-card/20 p-4 sm:p-5"
          aria-label={pivot ? `Section filtered by pivot: ${pivot}` : "Section"}
        >
          {pivot ? <PivotNote pivot={pivot} /> : null}
          <Blocks blocks={children} state={state} />
        </section>
      );
    }
    case "tab": {
      const label =
        (typeof attributes.title === "string" && attributes.title !== "" && attributes.title) ||
        (typeof block.rawAttributes === "string" && block.rawAttributes !== "" && block.rawAttributes) ||
        "Tab";
      return (
        <section className="rounded-2xl border border-dashed border-border p-4" aria-label={`Tab: ${label}`}>
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Tab · {label}
          </p>
          <Blocks blocks={children} state={state} />
        </section>
      );
    }
    case "row":
    case "column":
    case "div":
    case "section":
      return children.length > 0 ? (
        <div className="space-y-3">
          <Blocks blocks={children} state={state} />
        </div>
      ) : null;
    case "video":
      return (
        <div className="rounded-2xl border border-dashed border-border bg-background/40 p-3 text-xs leading-6 text-muted-foreground" role="note">
          A video is embedded in the upstream article; it is not reproduced locally.{" "}
          <a className="underline underline-offset-4" href={state.upstreamUrl} target="_blank" rel="noopener noreferrer">
            Watch on Microsoft Learn
          </a>
          .
        </div>
      );
    default:
      // moniker and other constructs: flow children through unchanged.
      return children.length > 0 ? (
        <div className="space-y-3">
          <Blocks blocks={children} state={state} />
        </div>
      ) : null;
  }
}

function PivotNote({ pivot }: { pivot: string }) {
  const terms = pivot.split(/[\s,]+/).filter(Boolean);
  return (
    <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      <span>Applies to:</span>
      {terms.map((term) => (
        <span key={term} className="rounded-full border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-foreground">
          {term}
        </span>
      ))}
    </p>
  );
}

function Figure({
  source,
  alt,
  state,
}: {
  source: unknown;
  alt: unknown;
  state: RenderState;
}) {
  const decision = decideImage(source, state.imageContext);
  const altText = typeof alt === "string" && alt.trim() !== "" ? alt : null;
  if (decision.kind === "img") {
    return (
      <figure className="overflow-hidden rounded-2xl border border-border bg-card/40 p-2">
        <img
          src={assetUrl(decision.assetKey)}
          alt={altText ?? ""}
          loading="lazy"
          width={decision.width ?? undefined}
          height={decision.height ?? undefined}
          className="mx-auto h-auto max-w-full"
        />
        {altText ? (
          <figcaption className="px-2 pb-1 pt-2 text-xs leading-6 text-muted-foreground">{altText}</figcaption>
        ) : null}
      </figure>
    );
  }
  // Accessible fallback (ASSET POLICY): alt text plus an upstream pointer,
  // never a broken image request.
  return (
    <figure className="rounded-2xl border border-dashed border-border bg-background/40 p-4" role="note">
      <p className="text-xs leading-6 text-muted-foreground">
        {altText ? (
          <>
            <span className="sr-only">Figure. </span>
            {altText}
          </>
        ) : (
          "Figure (no description available in the source)."
        )}
      </p>
      <p className="mt-1.5 text-xs leading-6 text-muted-foreground">
        This figure is available in the upstream source:{" "}
        <a className="underline underline-offset-4" href={state.upstreamUrl} target="_blank" rel="noopener noreferrer">
          open on Microsoft Learn
        </a>
        .
      </p>
    </figure>
  );
}

// ---------------------------------------------------------------------------
// Inline content
// ---------------------------------------------------------------------------

function Inline({ blocks, state }: { blocks: CompiledBlock[]; state: RenderState }) {
  return <>{renderInlineSeq(blocks, state).nodes}</>;
}

/**
 * Render a flat inline sequence. The parser keeps benign paired raw HTML
 * (<sup>…</sup>, <code>…</code>, <a id="…">…</a>) as sibling marker nodes, so
 * this walk pairs them: open markers buffer content until the matching close
 * marker (or the end of the sequence) and wrap it in a real element.
 */
function renderInlineSeq(
  blocks: CompiledBlock[],
  state: RenderState,
): { nodes: ReactNode[] } {
  const nodes: ReactNode[] = [];
  let index = 0;
  while (index < blocks.length) {
    const node = blocks[index];
    if (node.type === "inlineHtml") {
      const decision = decideInlineHtml(node.raw);
      if (decision.kind === "br") {
        nodes.push(<br key={index} />);
        index += 1;
        continue;
      }
      if (decision.kind === "open-sup" || decision.kind === "open-code") {
        const closer = decision.kind === "open-sup" ? "close-sup" : "close-code";
        const inner: CompiledBlock[] = [];
        let cursor = index + 1;
        while (cursor < blocks.length) {
          const candidate = blocks[cursor];
          if (
            candidate.type === "inlineHtml" &&
            decideInlineHtml(candidate.raw).kind === closer
          ) {
            break;
          }
          inner.push(candidate);
          cursor += 1;
        }
        const rendered = renderInlineSeq(inner, state).nodes;
        nodes.push(
          decision.kind === "open-sup" ? (
            <sup key={index}>{rendered}</sup>
          ) : (
            <code
              key={index}
              className="rounded bg-foreground/[0.06] px-1 py-0.5 font-mono text-[0.85em] text-foreground"
            >
              {rendered}
            </code>
          ),
        );
        index = cursor < blocks.length ? cursor + 1 : cursor;
        continue;
      }
      if (decision.kind === "anchor-target") {
        nodes.push(<span key={index} id={decision.id} />);
        index += 1;
        continue;
      }
      index += 1; // skip / unmatched closers
      continue;
    }
    nodes.push(<InlineNode key={index} node={node} state={state} />);
    index += 1;
  }
  return { nodes };
}

function InlineNode({ node, state }: { node: CompiledBlock; state: RenderState }): ReactNode {
  switch (node.type) {
    case "text":
      return typeof node.value === "string" ? node.value : null;
    case "softbreak":
      return " ";
    case "emphasis": {
      const flavor = typeof node.flavor === "string" ? node.flavor : "strong";
      const Tag = flavor === "em" || flavor === "italic" ? "em" : "strong";
      return (
        <Tag className={flavor === "em" || flavor === "italic" ? "italic" : "font-medium"}>
          <Inline blocks={asArray(node.children)} state={state} />
        </Tag>
      );
    }
    case "inlineCode":
      return (
        <code className="rounded bg-foreground/[0.06] px-1 py-0.5 font-mono text-[0.85em] text-foreground">
          {typeof node.value === "string" ? node.value : null}
        </code>
      );
    case "link":
      return <ArticleLink node={node} state={state} />;
    case "include":
      return <InlineInclude node={node} state={state} />;
    case "image": {
      // Inline raster images are rare; render through the same figure rules.
      const attrs = (node.attributes ?? {}) as Record<string, unknown>;
      return <Figure source={node.source ?? attrs.source} alt={node["alt-text"] ?? attrs["alt-text"]} state={state} />;
    }
    case "hardbreak":
      return <br />;
    default:
      if (Array.isArray(node.children)) return <Inline blocks={asArray(node.children)} state={state} />;
      return null;
  }
}

function ArticleLink({ node, state }: { node: CompiledBlock; state: RenderState }): ReactNode {
  const decision = decideLink(node, state.linkContext);
  const label = <Inline blocks={asArray(node.children)} state={state} />;
  switch (decision.kind) {
    case "local-article": {
      const href = decision.anchor ? `${decision.logicalPath}#${decision.anchor}` : decision.logicalPath;
      return (
        <Link className="underline underline-offset-4 hover:opacity-80" href={href}>
          {label}
        </Link>
      );
    }
    case "local-anchor":
      return (
        <a className="underline underline-offset-4 hover:opacity-80" href={`#${decision.slug}`}>
          {label}
        </a>
      );
    case "upstream":
      return (
        <a
          className="underline underline-offset-4 hover:opacity-80"
          href={decision.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          {label}
          <span aria-hidden="true"> ↗</span>
          <span className="sr-only"> (opens Microsoft Learn in a new tab)</span>
        </a>
      );
    case "mail":
      return (
        <a className="underline underline-offset-4 hover:opacity-80" href={decision.href}>
          {label}
        </a>
      );
    case "plain-text":
      return (
        <span
          title="This reference is not available in the local copy; see the upstream source page."
          className="text-muted-foreground"
        >
          {label}
          <span className="sr-only"> (reference unavailable in the local copy)</span>
        </span>
      );
  }
}

function InlineInclude({ node, state }: { node: CompiledBlock; state: RenderState }) {
  const fragment = findFragment(node, state);
  if (!fragment || fragment.blocked) return null;
  // Inline includes (product names, short notes) render as their text.
  return <Inline blocks={flattenInline(fragment.blocks)} state={state} />;
}

function flattenInline(blocks: CompiledBlock[]): CompiledBlock[] {
  const out: CompiledBlock[] = [];
  for (const block of blocks) {
    if (block.type === "paragraph") out.push(...asArray(block.inline));
    else if (Array.isArray(block.children)) out.push(...flattenInline(block.children));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function asArray(value: unknown): CompiledBlock[] {
  return Array.isArray(value) ? (value as CompiledBlock[]) : [];
}
