/**
 * Article provenance footer (FC05). Records source, revision, blob hash,
 * upstream origin, license and the local-transformation note required by the
 * rights policy (CC BY 4.0 attribution; handover 03 §"Identity and rights":
 * preserve outward source links for provenance).
 */

import Link from "next/link";

import type { RegistryArticle } from "@/lib/fabric/articles/registry";

const CORPUS_REVISION = "774592ea3f2d4558f763d6e5b74abf4785948fb5";

export function ProvenanceFooter({ article }: { article: RegistryArticle }) {
  const upstream = `https://learn.microsoft.com/en-us/fabric/${article.sourcePath
    .replace(/^docs\//, "")
    .replace(/\.(md|markdown)$/i, "")}`;
  return (
    <footer className="mt-10 rounded-2xl border border-border bg-background/60 p-4 text-xs leading-6 text-muted-foreground">
      <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-foreground">Provenance</h2>
      <dl className="mt-2 space-y-1">
        <div className="flex flex-wrap gap-x-2">
          <dt className="shrink-0">Source</dt>
          <dd className="font-mono">{article.sourcePath}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="shrink-0">Pinned revision</dt>
          <dd className="font-mono">{CORPUS_REVISION.slice(0, 12)}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="shrink-0">Blob SHA-256</dt>
          <dd className="break-all font-mono">{article.sha256}</dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="shrink-0">Rights</dt>
          <dd>
            Content available under{" "}
            <a
              className="underline underline-offset-4"
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC BY 4.0
            </a>{" "}
            ({article.rightsState}); transformed for local rendering (structure, link targets and media
            delivery adapted — wording preserved).
          </dd>
        </div>
        <div className="flex flex-wrap gap-x-2">
          <dt className="shrink-0">Upstream</dt>
          <dd>
            <a className="underline underline-offset-4" href={upstream} target="_blank" rel="noopener noreferrer">
              Read on Microsoft Learn
              <span aria-hidden="true"> ↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </dd>
        </div>
      </dl>
      <p className="mt-3">
        <Link className="inline-flex min-h-9 items-center rounded-full border border-border-strong px-3 text-xs hover:bg-card" href="/learn/fabric/">
          Back to the Microsoft Fabric hub
        </Link>
      </p>
    </footer>
  );
}
