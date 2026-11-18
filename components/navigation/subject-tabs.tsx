import Link from "next/link";
import {
  subjectTabs,
  subjectTitle,
  type SubjectTabId,
} from "@/lib/navigation/route-context";
import type { SubjectId } from "@/lib/study/taxonomy";
import { cn } from "@/lib/utils";

/**
 * The one visible tab bar per subject. Destinations are declared in
 * `lib/navigation/route-context.ts`; a tab without a real page is omitted.
 *
 * The bar is server-rendered: `current` comes from the same route context that
 * resolves the page, so it never has to guess from URL text.
 */
export function SubjectTabs({
  subject,
  current,
  className,
}: {
  subject: SubjectId;
  current?: SubjectTabId;
  className?: string;
}) {
  return (
    <nav
      aria-label={`${subjectTitle(subject)} sections`}
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      {subjectTabs(subject).map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          aria-current={tab.id === current ? "page" : undefined}
          className={cn(
            "inline-flex min-h-11 items-center rounded-full border px-3 text-xs transition-colors sm:min-h-9",
            tab.id === current
              ? "border-border-strong bg-card font-medium text-foreground"
              : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
