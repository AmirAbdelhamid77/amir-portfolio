/**
 * Fabric docs article route (FC05): /learn/fabric/docs/<family>/<article>/
 * (ROUTE_NAMESPACE.md). Static export only:
 *
 * - generateStaticParams comes from the route registry in the build
 *   workspace (FABRIC_CORPUS_BUILD_DIR) — published rows only, fail-closed
 *   when the registry is missing.
 * - dynamicParams = false: every unpublished combination 404s; the loader
 *   additionally fails closed rather than rendering an empty body.
 * - Server component: compiled corpus data is read with fs at build time and
 *   never ships in a client bundle.
 *
 * The [...article] catch-all preserves the identity ledger's planned
 * destinations, which carry intra-family subdirectories
 * (e.g. /learn/fabric/docs/data-science/ai-functions/pyspark/analyze-sentiment/).
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleBody } from "@/components/fabric/article/ArticleBody";
import { DocsHeader } from "@/components/fabric/article/DocsHeader";
import { ProvenanceFooter } from "@/components/fabric/article/ProvenanceFooter";
import { Container } from "@/components/ui";
import { MissingArticleError, getArticleData } from "@/lib/fabric/articles/article-data";
import {
  getPublishedArticles,
  makeSourcePathLookup,
  type RegistryArticle,
} from "@/lib/fabric/articles/registry";

export const dynamicParams = false;

/** Static params from the registry: one entry per published article. */
export function generateStaticParams(): { family: string; article: string[] }[] {
  return getPublishedArticles().map((article) => ({
    family: article.family,
    article: article.articleSegments,
  }));
}

function findRow(family: string, segments: string[]): RegistryArticle | undefined {
  return getPublishedArticles().find(
    (article) => article.family === family && article.articleSegments.length === segments.length && article.articleSegments.every((part, index) => part === segments[index]),
  );
}

function canonicalFor(row: RegistryArticle): string {
  return row.logicalPath;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ family: string; article: string[] }>;
}): Promise<Metadata> {
  const { family, article } = await params;
  const row = findRow(family, article);
  if (!row) notFound();
  return {
    title: row.title,
    description: row.description ?? undefined,
    alternates: { canonical: canonicalFor(row) },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ family: string; article: string[] }>;
}) {
  const { family, article } = await params;
  let data;
  try {
    data = getArticleData(family, article);
  } catch (error) {
    if (error instanceof MissingArticleError) notFound();
    throw error;
  }

  const lookup = makeSourcePathLookup();
  const upstreamUrl = `https://learn.microsoft.com/en-us/fabric/${data.row.sourcePath
    .replace(/^docs\//, "")
    .replace(/\.(md|markdown)$/i, "")}`;

  return (
    <>
      <DocsHeader
        trail={[
          { label: "Docs", href: "/learn/fabric/docs/" },
          { label: data.row.family },
        ]}
        title={data.frontMatter.title}
        description={data.frontMatter.description ?? undefined}
      />
      <Container className="py-8 md:py-10">
        <article className="mx-auto max-w-3xl space-y-5">
          <ArticleBody
            data={data}
            linkContext={{
              sourcePath: data.row.sourcePath,
              headingSlugs: data.headingSlugs,
              lookup,
            }}
            upstreamUrl={upstreamUrl}
          />
          <ProvenanceFooter article={data.row} />
        </article>
      </Container>
    </>
  );
}
