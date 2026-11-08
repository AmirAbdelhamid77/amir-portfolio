import type { Metadata } from "next";
import Link from "next/link";
import { getAtlasResourceRecords } from "@/lib/recovery/collections";

// The 1,057 awaiting-review Atlas resource records, published as a clearly
// distinguished catalogue. Their target articles ARE published; only the
// concept mapping is unreviewed, so each record links to its live article
// while the catalogue states the mapping status. No semantic relationships
// are drawn.

export const metadata: Metadata = {
  title: "Atlas resource records — awaiting review",
  description:
    "The 1,057 Fabric documentation resource records whose concept mapping awaits review. Articles are published; mappings are unverified.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/atlas-records/" },
};

export default function AtlasRecordsPage() {
  const records = getAtlasResourceRecords();
  const byKind = new Map<string, typeof records>();
  for (const record of records) {
    const list = byKind.get(record.kind) ?? [];
    list.push(record);
    byKind.set(record.kind, list);
  }

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-14">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Atlas catalogue — unverified mapping</p>
      <h1 className="mt-2 text-balance text-4xl font-medium tracking-tight">Resource records awaiting review</h1>
      <div className="mt-4 rounded-2xl border border-border bg-card/60 p-4 text-sm leading-6 text-muted-foreground">
        <p>
          <strong className="text-foreground">{records.length} resource records</strong> from the Fabric corpus concept
          ledger, listed while their concept mapping awaits review. Every target article is already published and linked
          below; what is <em>not</em> shown anywhere is a reviewed semantic connection — this catalogue draws no graph
          edges and asserts no relationships. The{" "}
          <Link href="/learn/dp-600/atlas/" className="underline underline-offset-4">Atlas reading room</Link> remains the
          reviewed surface.
        </p>
      </div>

      {[...byKind.entries()].map(([kind, list]) => (
        <section key={kind} className="mt-10">
          <h2 className="text-lg font-medium tracking-tight">
            {kind} <span className="text-sm font-normal text-muted-foreground">({list.length})</span>
          </h2>
          <ul className="mt-3 divide-y divide-border rounded-2xl border border-border">
            {list.map((record) => (
              <li key={record.id} className="flex flex-wrap items-center gap-2 px-4 py-2.5 text-sm">
                <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  mapping {record.mappingDisposition ?? "awaiting review"}
                </span>
                <span className="font-medium">{record.title}</span>
                <Link
                  href={record.logicalPath}
                  className="ml-auto text-[12px] underline decoration-border underline-offset-4 hover:decoration-foreground"
                >
                  Open the published article
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
