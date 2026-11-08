import Link from "next/link";
import { COLLECTION_CONTEXTS, collectionDestinations, type CollectionContext } from "@/lib/recovery/navigation";

/** Static contextual navigation; no source bodies or private QA cross this boundary. */
export function CollectionShelf({ context }: { context: CollectionContext }) {
  const heading = COLLECTION_CONTEXTS[context];
  return (
    <section aria-labelledby={`collections-${context}`} className="my-10 border-y border-border py-8" data-collection-context={context}>
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:gap-10">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Related collections</p>
          <h2 id={`collections-${context}`} className="mt-3 text-xl font-medium tracking-tight">{heading.title}</h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{heading.description}</p>
        </div>
        <ul className="min-w-0 divide-y divide-border">
          {collectionDestinations(context).map((entry, index) => (
            <li key={entry.id}>
              <Link href={entry.href} className="group grid min-h-11 grid-cols-[1.5rem_minmax(0,1fr)_1rem] gap-3 py-5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
                <span aria-hidden="true" className="pt-0.5 font-mono text-[10px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium group-hover:underline underline-offset-4">{entry.title}</span>
                  <span className="mt-1 block text-xs font-medium text-muted-foreground">{entry.status}</span>
                  <span className="mt-2 block text-xs leading-6 text-muted-foreground">{entry.description}</span>
                </span>
                <span aria-hidden="true" className="text-muted-foreground">↗</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
