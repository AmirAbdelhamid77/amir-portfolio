import Link from "next/link";

export type Crumb = { href?: string; label: string };

/**
 * One breadcrumb implementation for every page that needs a trail.
 *
 * `aria-label="Breadcrumb"` on the nav, an ordered list, and `aria-current="page"`
 * on the last item: the three things that make a trail usable with a screen
 * reader instead of just looking like one. Separators are decorative and hidden
 * from assistive tech.
 */
export function Breadcrumbs({
  items,
  className,
}: {
  items: Crumb[];
  className?: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={className ?? "flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link href={item.href} className="hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className="text-foreground/70">
                  {item.label}
                </span>
              )}
              {last ? null : (
                <span aria-hidden="true" className="text-border-strong">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
