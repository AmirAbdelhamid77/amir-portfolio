import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRtiBlueprints } from "@/lib/recovery/collections";

// Draft RTI lab pages, built from the recovered LAB_BLUEPRINTS.json (the
// authentic source milestone). Each of the eight Knowledge Graph units below
// /learn/fabric-rti/ now lands on the draft blueprint for its lab instead of a
// 404: the blueprint's task, data origin and expected evidence are published
// as-is, marked draft/unverified — the labs themselves have NOT been built or
// validated (validation_status is published verbatim).

const SLUG_TO_LAB: Record<string, string> = {
  "ingest-typed-events": "Shipment XML and typed KQL",
  "activator-rules": "Activator temperature rule",
  "digital-twin-context": "Digital twin context and relationships",
  "kql-series-anomalies": "KQL time series and anomaly chart",
  "official-lab-sequence": "Official Fabric lab sequence",
  "measured-factory-data": "Measured steel-factory energy inspection",
  "aggregates-are-not-events": "Published logistics aggregate context",
  "streaming-spark-internals": "Original Spark optimization exercises",
};

const SLUGS = Object.keys(SLUG_TO_LAB);

export function generateStaticParams() {
  return SLUGS.map((lab) => ({ lab }));
}

export const dynamicParams = false;

function blueprintFor(slug: string) {
  const wanted = SLUG_TO_LAB[slug];
  return getRtiBlueprints().find((blueprint) => blueprint.title === wanted) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ lab: string }> }): Promise<Metadata> {
  const { lab } = await params;
  const blueprint = blueprintFor(lab);
  if (!blueprint) return {};
  return {
    title: `${blueprint.title} — RTI lab (draft)`,
    description: `Recovered lab blueprint: ${blueprint.task?.slice(0, 120) ?? ""} Draft — not built or validated.`,
    robots: { index: false, follow: true },
  };
}

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => asText(item)).join("\n\n");
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, item]) => `${key}: ${asText(item)}`)
      .join("\n\n");
  }
  return "";
}

export default async function RtiLabPage({ params }: { params: Promise<{ lab: string }> }) {
  const { lab } = await params;
  const blueprint = blueprintFor(lab);
  if (!blueprint) notFound();

  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-4 py-14">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        RTI lab · draft — not built or validated
      </p>
      <h1 className="mt-2 text-balance text-4xl font-medium tracking-tight">{blueprint.title}</h1>
      <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-4 text-sm leading-6">
        <p>
          <strong className="text-foreground">Draft lab blueprint.</strong> This page publishes the recovered blueprint
          for the lab — the hands-on environment has not been built, and the blueprint's own validation status is
          published verbatim below. Nothing here has been validated end to end.
        </p>
      </div>

      {blueprint.task ? (
        <section className="mt-8">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Task</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{asText(blueprint.task)}</p>
        </section>
      ) : null}

      {blueprint.data_origin ? (
        <section className="mt-6">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Data origin</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{asText(blueprint.data_origin)}</p>
        </section>
      ) : null}

      {blueprint.prerequisites ? (
        <section className="mt-6">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Prerequisites</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{asText(blueprint.prerequisites)}</p>
        </section>
      ) : null}

      {blueprint.source_based_expected_evidence ? (
        <section className="mt-6">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Expected evidence
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
            {asText(blueprint.source_based_expected_evidence)}
          </p>
        </section>
      ) : null}

      <section className="mt-6 rounded-2xl border border-border bg-card/50 p-4 text-[12px] leading-5 text-muted-foreground">
        <p>
          Blueprint {blueprint.lab_id} · validation status (verbatim): {blueprint.validation_status ?? "not recorded"} ·
          grading enabled: {String(blueprint.grading_enabled ?? false)} · deployment allowed:{" "}
          {String(blueprint.deployment_allowed ?? false)}
        </p>
      </section>

      <p className="mt-8 text-sm">
        <Link href="/learn/fabric-rti/" className="underline decoration-border underline-offset-4 hover:decoration-foreground">
          Back to the Fabric RTI programme
        </Link>
      </p>
    </main>
  );
}
