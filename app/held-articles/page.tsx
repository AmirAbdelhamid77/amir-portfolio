import type { Metadata } from "next";
import Link from "next/link";
import { getHeldArticles } from "@/lib/recovery/collections";

// The held Fabric articles, published as an honest restricted-content index.
// The article BYTES stay out of the export (they cannot compile without the
// upstream include repositories); the metadata, hold reasons and source paths
// are published so nothing is silently missing.

export const metadata: Metadata = {
  title: "Held Fabric articles — source dependency missing",
  description:
    "The 81 Fabric documentation articles held out of publication: 79 blocked by cross-repository include dependencies, 2 by rights notices, 1 by an external dependency.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/held-articles/" },
};

export default function HeldArticlesPage() {
  const articles = getHeldArticles();
  const byFamily = new Map<string, typeof articles>();
  for (const article of articles) {
    const list = byFamily.get(article.family) ?? [];
    list.push(article);
    byFamily.set(article.family, list);
  }

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-14">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Restricted-content index</p>
      <h1 className="mt-2 text-balance text-4xl font-medium tracking-tight">Held Fabric articles</h1>
      <div className="mt-4 rounded-2xl border border-border bg-card/60 p-4 text-sm leading-6 text-muted-foreground">
        <p>
          <strong className="text-foreground">{articles.length} articles</strong> are held out of the published corpus —
          79 because they embed cross-repository includes from upstream Microsoft repositories that are not available in
          this workspace ({[...new Set(articles.flatMap((a) => a.dependencyHolds.map((h) => h.inRepoPath.split("/")[0])))].join(", ")}),
          plus 2 rights-notice articles and 1 external-dependency article recorded in the wave reports (81 total).
          <strong className="text-foreground"> Their source bytes are preserved</strong> in the pinned corpus; publishing
          them requires acquiring and pinning the upstream repositories. Each entry below states its exact hold.
        </p>
      </div>

      {[...byFamily.entries()].map(([family, list]) => (
        <section key={family} className="mt-10">
          <h2 className="text-lg font-medium tracking-tight">
            {family} <span className="text-sm font-normal text-muted-foreground">({list.length})</span>
          </h2>
          <div className="mt-3 divide-y divide-border rounded-2xl border border-border">
            {list.map((article) => (
              <details key={article.articleId} className="px-4 py-3">
                <summary className="cursor-pointer list-none select-none">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                      source dependency missing
                    </span>
                    <span className="font-medium">{article.logicalPath}</span>
                  </span>
                </summary>
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p>
                    Held includes: {article.dependencyHolds.length} · first missing target:{" "}
                    <code className="text-[11px]">{article.dependencyHolds[0]?.target ?? "n/a"}</code>
                  </p>
                  <p>
                    Source: <code className="text-[11px]">{article.sourcePath}</code> · rights state:{" "}
                    {article.rightsState} · disposition: {article.disposition}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
