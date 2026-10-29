import katex from "katex";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Build-time KaTeX. `trust:false` blocks \html/\href and `strict:"ignore"`
 * accepts the notation this source uses without warnings; a failure falls back
 * to the literal TeX and a visible note rather than crashing a chapter.
 */
function render(tex: string, display: boolean): { html: string; ok: boolean } {
  try {
    const html = katex.renderToString(tex, {
      displayMode: display,
      throwOnError: true,
      strict: "ignore",
      trust: false,
      output: "htmlAndMathml",
    });
    return { html, ok: true };
  } catch {
    return { html: "", ok: false };
  }
}

export function MathBlock({
  tex,
  display = false,
  alt,
  className,
}: {
  tex: string;
  display?: boolean;
  alt?: string;
  className?: string;
}) {
  const { html, ok } = render(tex, display);
  if (!ok) {
    return (
      <span className={cn("font-mono text-xs text-muted-foreground", className)} title={alt}>
        {tex}
        <span className="sr-only"> (formula could not be rendered)</span>
      </span>
    );
  }
  return (
    <span
      dir="ltr"
      lang="en"
      tabIndex={display ? 0 : undefined}
      className={cn(
        display ? "my-2 block overflow-x-auto py-1 text-center" : "inline-block max-w-full align-middle",
        className,
      )}
      // KaTeX output is generated locally from a trusted TeX string with
      // trust:false; the source HTML is never involved.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function InlineMath({ tex, raw }: { tex: string; raw?: string }) {
  return (
    <span className="mx-0.5 inline-block align-middle">
      <MathBlock tex={tex} alt={raw} />
    </span>
  );
}

export function FormulaCard({
  id,
  title,
  tex,
  alt,
  plain,
  note,
  group,
  origin,
  sourceHref,
  children,
}: {
  id?: string;
  title: string;
  tex: string;
  alt: string;
  plain: string;
  note?: string;
  group?: string;
  origin?: "source" | "extension";
  sourceHref?: string;
  children?: ReactNode;
}) {
  return (
    <article
      id={id}
      className="scroll-mt-28 rounded-2xl border border-border bg-card/40 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          {group ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              {group}
            </p>
          ) : null}
          <h3 className="mt-1 text-sm font-medium text-foreground">{title}</h3>
        </div>
        {origin ? (
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider",
              origin === "source"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
            )}
          >
            {origin === "source" ? "Source" : "Extension"}
          </span>
        ) : null}
      </div>

      <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-background px-3 py-2">
        <MathBlock tex={tex} display />
      </div>

      <p className="mt-3 break-words font-mono text-[11px] leading-5 text-muted-foreground" dir="ltr">
        {plain}
      </p>
      {note ? <p className="mt-2 text-xs leading-6 text-muted-foreground">{note}</p> : null}

      <details className="mt-3 rounded-lg border border-border bg-background/70 px-3 py-2">
        <summary className="cursor-pointer text-[11px] text-muted-foreground">
          Text description &amp; section
        </summary>
        <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{alt}</p>
        {sourceHref ? (
          <a
            href={sourceHref}
            className="mt-2 inline-flex text-[11px] text-foreground underline decoration-border-strong underline-offset-4"
          >
            Read the source section
          </a>
        ) : null}
      </details>
      {children}
    </article>
  );
}
