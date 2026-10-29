import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, FileWarning, ShieldCheck } from "lucide-react";
import { FORMULAS, JOURNEY_BY_SLUG, SECTIONS } from "@/lib/statistics/content";
import { SOURCE, SOURCE_SECTIONS, SOURCE_STATS } from "@/lib/statistics/source";
import { SourceBlocks } from "@/components/statistics/source-blocks";
import { StatisticsPageHeader } from "@/components/statistics/page-header";
import { ButtonLink, Container, Eyebrow } from "@/components/ui";

export const metadata: Metadata = {
  title: "Source audit, coverage and errata",
  description:
    "The exact export snapshot, 43-section coverage matrix, repaired formula ledger, mathematical errata (including the Poisson λ=20 tail correction) and the extension register for the statistics reference.",
  alternates: { canonical: "/learn/statistics/source" },
};

const ERRATA = [
  {
    id: "poisson-tail",
    section: "§10.3",
    original: "P(X≥25) with λ=20 is “a little over 11%”.",
    concern: "The stated tail probability is materially wrong.",
    correction: "P(X≥25) = 0.156772621826…, i.e. 15.68%. P(X=13) = 0.027115648104… (2.71%) is correct.",
    evidence: "Computed from the Poisson PMF with log-gamma; verified in tests/statistics/math.test.mjs to 1e-10. The section renders the correction beside the source claim.",
    severity: "High",
  },
  {
    id: "p-underspecified",
    section: "§19.1",
    original: "“If the population mean is 79.3 … p = 0.037.”",
    concern: "No sample size, standard error or test statistic is given, so the p-value cannot be independently checked or reproduced.",
    correction: "Preserved as an illustrative source example, explicitly labelled as underspecified. It is not used as a verified worked calculation or as a quiz answer.",
    evidence: "The numeric example is not reproduced by a lab. The p-value lab computes from user inputs instead.",
    severity: "Medium",
  },
  {
    id: "latex-loss",
    section: "All formula sections",
    original: "Text such as (bar{x}=frac{sum x_i}{n}) — every backslash removed by the HTML export.",
    concern: "The exported notation is not valid TeX and cannot be rendered faithfully as written.",
    correction: "102 formula occurrences were mapped to verified TeX (78 unique raw strings). The underlying mathematics is unchanged; only notation was repaired.",
    evidence: "Every repaired formula renders through KaTeX with throwOnError; unmapped formulas are reported by the importer rather than dropped.",
    severity: "Medium",
  },
  {
    id: "quartiles",
    section: "§5.4",
    original: "IQR = Q₃ − Q₁ without a quartile convention.",
    concern: "Different quartile definitions give different Q₁/Q₃ on small samples, so an unstated convention is ambiguous.",
    correction: "The site states linear interpolation (R type 7) next to the IQR and in the lab. The source formula is unchanged.",
    evidence: "Descriptive tests assert the type-7 values for a known dataset.",
    severity: "Low",
  },
  {
    id: "water-r",
    section: "§32",
    original: "Water cost and life expectancy have r = 0.61.",
    concern: "This is an illustrative example, not a measured dataset; presenting it without a label risks being read as empirical evidence.",
    correction: "Labelled illustrative in the causation exhibit. It is used to teach the distinction, not as a data claim.",
    evidence: "No dataset accompanies the export; the visual states the illustrative status.",
    severity: "Low",
  },
  {
    id: "example-29",
    section: "§29",
    original: "“Vitamin C … Gender birth ratio/response”.",
    concern: "The phrase is ambiguous in the export and does not identify a measured response variable clearly.",
    correction: "Preserved verbatim as source text. No numeric claim or interpretation was invented around it.",
    evidence: "Source transcription; the surrounding lesson uses a different, unambiguous example for the variable roles.",
    severity: "Low",
  },
];

const EXTENSIONS = [
  { name: "Pearson r formula", where: "Formula workbench, §30", why: "The source names r and interprets it but does not write the coefficient; the standard sample formula is needed for the scatter lab." },
  { name: "Slope ↔ r relation", where: "Formula workbench, §35", why: "Explains why r is unitless while the regression slope is not." },
  { name: "t-based confidence interval", where: "CI lab, §14", why: "Estimated σ requires a t critical value under the normal model; the source gives only the generic estimate ± critical × SE." },
  { name: "Wilson interval", where: "A/B lab, §40", why: "A proportion interval that behaves at 0 and 1; the source does not specify an interval method." },
  { name: "Two-proportion z test", where: "A/B lab, §40", why: "Conversions are proportions; a means test would ignore the denominator structure." },
  { name: "Power / β for a z test", where: "Errors lab, §22", why: "The source defines Type I/II errors but does not give the power function; the lab uses a stated normal model." },
];

export default function SourcePage() {
  const sourceNumbers = SOURCE_SECTIONS.map((section) => section.number);
  const missing = Array.from({ length: 43 }, (_, index) => index + 1).filter((number) => !sourceNumbers.includes(number));

  return (
    <>
      <StatisticsPageHeader
        eyebrow="Source audit"
        current="source"
        title="What was read, what changed, what remains limited"
        description="This page is the public counterpart of the repository audit. It records the exact export, the 43-section coverage, the formula repairs and every mathematical correction applied to the source."
        actions={
          <>
            <ButtonLink href="/learn/statistics" variant="contrast" icon>
              Back to the reference
            </ButtonLink>
            <ButtonLink href="/learn/statistics/formulas" variant="secondary">
              Formula ledger
            </ButtonLink>
          </>
        }
        aside={
          <div className="w-full rounded-2xl border border-border bg-card/40 p-4 md:w-72">
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Snapshot
            </p>
            <dl className="mt-2 space-y-1 text-[10px] leading-5 text-muted-foreground">
              <div className="flex justify-between gap-2">
                <dt>HTML files</dt>
                <dd className="font-mono text-foreground">{SOURCE_STATS.htmlFiles}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Numbered sections</dt>
                <dd className="font-mono text-foreground">{SOURCE_STATS.sections}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Headings</dt>
                <dd className="font-mono text-foreground">{SOURCE_STATS.headings}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Formula occurrences</dt>
                <dd className="font-mono text-foreground">{SOURCE_STATS.formulas}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Figures</dt>
                <dd className="font-mono text-foreground">0</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>Characters</dt>
                <dd className="font-mono text-foreground">{SOURCE_STATS.textCharacters.toLocaleString("en")}</dd>
              </div>
            </dl>
            <p className="mt-2 break-all border-t border-border pt-2 font-mono text-[9px] leading-4 text-muted-foreground">
              {SOURCE_STATS.sha256}
            </p>
            {SOURCE_STATS.notionUrl ? (
              <a
                href={SOURCE_STATS.notionUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 inline-flex min-h-6 items-center gap-1 text-[10px] text-foreground underline decoration-border-strong underline-offset-4"
              >
                Original Notion page
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : null}
          </div>
        }
      />

      <Container className="space-y-10 py-8 md:py-10">
        <section>
          <Eyebrow>0 · The original reference&apos;s own summary</Eyebrow>
          <div className="mt-3 rounded-2xl border border-border bg-card/30 p-4">
            <SourceBlocks blocks={SOURCE.intro} sourceNumber={0} />
            <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
              This is the source&apos;s top-level blue callout, preserved beside the section body. It is not a
              generated summary; the wording is the owner&apos;s.
            </p>
          </div>
        </section>

        <section>
          <Eyebrow>1 · Export shape</Eyebrow>
          <div className="mt-3 grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-border bg-card/30 p-4 text-xs leading-6 text-muted-foreground">
              <p>
                The local export contains <strong className="font-medium text-foreground">one HTML file</strong> and no
                sibling subpages, images, downloads or assets. The 43 numbered top-level sections and their 48 H2/H3
                subsections live inside that file. This resolves the brief&apos;s “43 sections and subpages” against the
                actual artefact: there was no second file to merge, and none was invented.
              </p>
              <p className="mt-2">
                The file is{" "}
                <span className="break-all font-mono text-[10px]">{SOURCE_STATS.sourceFile}</span>, observed{" "}
                {new Date(SOURCE_STATS.observedModified).toISOString().slice(0, 19)}Z. The Notion page id in the
                filename is preserved. Sibling hubs such as Data Visualization, Numeric EDA or Data Storytelling were
                not merged; only this export was used.
              </p>
              <p className="mt-2">
                Source text is rendered as typed React blocks from{" "}
                <code className="font-mono">content/statistics/source.json</code>. There is no raw{" "}
                <code className="font-mono">dangerouslySetInnerHTML</code> of exported HTML. Formulas are KaTeX-rendered
                at build time with <code className="font-mono">trust:false</code>.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Counts that were checked</p>
              <dl className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
                {[
                  ["Paragraphs", SOURCE_STATS.paragraphs],
                  ["Lists / items", `${SOURCE_STATS.lists} / ${SOURCE_STATS.listItems}`],
                  ["Tables / rows", `${SOURCE_STATS.tables} / ${SOURCE_STATS.tableRows}`],
                  ["Toggles", SOURCE_STATS.toggles],
                  ["Code blocks", SOURCE_STATS.codeBlocks],
                  ["Unique formula strings", SOURCE_STATS.uniqueFormulas],
                  ["Subheadings", SOURCE_STATS.subsections],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between gap-2">
                    <dt>{label}</dt>
                    <dd className="font-mono text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section>
          <Eyebrow>2 · Mathematical errata</Eyebrow>
          <h2 className="mt-2 text-2xl font-medium tracking-tight">Corrections are visible, not silent</h2>
          <p className="mt-1 max-w-3xl text-xs leading-6 text-muted-foreground">
            The source is a teaching reference, not a guarantee that every numeric claim is right. Each row below records
            the original claim, the concern, the correction and the evidence. Corrections appear next to the source
            section rather than replacing the original silently.
          </p>
          <div className="mt-4 space-y-2">
            {ERRATA.map((item) => (
              <article key={item.id} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                    {item.section}
                  </span>
                  <span className={item.severity === "High" ? "rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-red-700 dark:text-red-300" : item.severity === "Medium" ? "rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-800 dark:text-amber-300" : "rounded-full border border-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground"}>
                    {item.severity} severity
                  </span>
                </div>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  <strong className="font-medium text-foreground">Original:</strong> {item.original}
                </p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  <strong className="font-medium text-foreground">Concern:</strong> {item.concern}
                </p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  <strong className="font-medium text-foreground">Decision:</strong> {item.correction}
                </p>
                <p className="mt-1 flex items-start gap-1.5 text-[11px] leading-5 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
                  {item.evidence}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <Eyebrow>3 · Coverage matrix</Eyebrow>
          <h2 className="mt-2 text-2xl font-medium tracking-tight">Every source section has a destination</h2>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            43 of 43 numbered sections are rendered. {missing.length ? `Missing: ${missing.join(", ")}.` : "No section is missing."}{" "}
            The visual column names the engine placed beside the section; a shared engine may serve several sections.
          </p>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border" tabIndex={0}>
            <table className="w-full border-collapse text-[11px]">
              <caption className="sr-only">Coverage of all 43 source sections.</caption>
              <thead className="sticky top-0 bg-card">
                <tr className="border-b border-border">
                  <th scope="col" className="px-2 py-2 text-start font-medium">§</th>
                  <th scope="col" className="px-2 py-2 text-start font-medium">Source section</th>
                  <th scope="col" className="px-2 py-2 text-start font-medium">Journey</th>
                  <th scope="col" className="px-2 py-2 text-start font-medium">Visual / interaction</th>
                  <th scope="col" className="px-2 py-2 text-start font-medium">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {SECTIONS.map((section) => {
                  const journey = JOURNEY_BY_SLUG.get(section.journey);
                  const visual = section.visual;
                  return (
                    <tr key={section.id} className="border-b border-border last:border-0">
                      <td className="px-2 py-1.5 font-mono">
                        <Link href={`/learn/statistics/journey/${section.journey}#${section.id}`} className="text-foreground underline decoration-border-strong underline-offset-2">
                          {section.number}
                        </Link>
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">{SOURCE_SECTIONS.find((source) => source.number === section.number)?.title ?? section.titleEn}</td>
                      <td className="px-2 py-1.5 text-muted-foreground">
                        <Link href={`/learn/statistics/journey/${section.journey}`} className="hover:text-foreground">
                          {journey?.number}. {journey?.title}
                        </Link>
                      </td>
                      <td className="px-2 py-1.5 text-muted-foreground">
                        {visual ? (
                          <span>
                            {visual.title}{" "}
                            <span className="font-mono text-[9px] text-muted-foreground">({visual.kind})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-800 dark:text-amber-300">
                            <FileWarning className="h-3 w-3" aria-hidden="true" /> text only
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-1.5">
                        <span className="rounded-full border border-border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                          {section.coverage}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <Eyebrow>4 · Extension register</Eyebrow>
          <h2 className="mt-2 text-2xl font-medium tracking-tight">Supplemental mathematics, labelled</h2>
          <p className="mt-1 max-w-3xl text-xs leading-6 text-muted-foreground">
            These additions are standard definitions or methods needed to make a visual or an interval honest. They are
            not presented as the owner&apos;s original text.
          </p>
          <ul className="mt-4 grid gap-2 md:grid-cols-2">
            {EXTENSIONS.map((item) => (
              <li key={item.name} className="rounded-xl border border-border bg-background p-3">
                <p className="text-xs font-medium text-foreground">{item.name}</p>
                <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{item.where}</p>
                <p className="mt-1 text-[11px] leading-5 text-muted-foreground">{item.why}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <Eyebrow>5 · Formula ledger</Eyebrow>
          <h2 className="mt-2 text-2xl font-medium tracking-tight">{FORMULAS.length} indexed formulas, each with a source or an extension label</h2>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            The full ledger with TeX, plain-text alternatives and conditions is on the{" "}
            <Link href="/learn/statistics/formulas" className="text-foreground underline decoration-border-strong underline-offset-4">
              formula workbench <ArrowUpRight className="inline h-3 w-3" aria-hidden="true" />
            </Link>
            . The importer also writes a machine-readable manifest with every raw formula and its repaired TeX.
          </p>
        </section>

        <section className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.05] p-4">
          <p className="text-sm font-medium text-foreground">Unresolved limitations</p>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-5 text-muted-foreground">
            <li>• The export contains no figures, so there was no original visual to preserve, re-draw or audit for licensing.</li>
            <li>• §19.1&apos;s p=0.037 example cannot be reproduced from the source because its sample size and standard error are absent.</li>
            <li>• The source&apos;s Arabic teaching voice is preserved; some source sentences remain ambiguous and are not silently rewritten.</li>
            <li>• The site is static: lab presets are not stored in the URL, and no analytics or accounts are used.</li>
            <li>• Charts are SVG with exact-value tables; a screen-reader user can reach every conclusion without manipulating the graphic.</li>
          </ul>
        </section>
      </Container>
    </>
  );
}
