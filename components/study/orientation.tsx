"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SUBJECTS, topicHref } from "@/lib/study/taxonomy";

/**
 * A small orientation strip for the learning, lab and practice families. It
 * reads the current route to decide which subject the reader is inside, and
 * keeps any learning context passed in the query string.
 *
 * The learning home itself has no subject context, so the strip stays out of the
 * way there.
 */
export function StudyOrientation() {
  const path = usePathname();
  const [context, setContext] = useState("");
  const [unit, setUnit] = useState("");
  const [review, setReview] = useState(false);

  useEffect(() => {
    const restore = () => {
      const q = new URL(location.href).searchParams;
      setContext(q.get("learningContext") ?? "");
      setUnit(q.get("learningUnit") ?? "");
      setReview(q.get("learningReview") === "1");
    };
    queueMicrotask(restore);
    addEventListener("popstate", restore);
    return () => removeEventListener("popstate", restore);
  }, [path]);

  if (!/^\/(learn|lab|practice|explore)(\/|$)/.test(path) || path.includes("/catalogue")) {
    return null;
  }

  const normalized = path.replace(/\/+$/, "");
  if (normalized === "/learn" || normalized === "/study") return null;

  const [contextSubject, contextTopic] = context.split(".");
  const selected = SUBJECTS.find((s) => s.id === contextSubject);
  const topic = selected?.topics.find((t) => t[0] === contextTopic);

  const subjectFromPath = normalized.match(/^\/(?:learn|study)\/([^/]+)(?:\/|$)/)?.[1];
  const subject = SUBJECTS.some((s) => s.id === subjectFromPath)
    ? (subjectFromPath as (typeof SUBJECTS)[number]["id"])
    : normalized.includes("dp-600")
      ? "fabric"
      : normalized.includes("statistics")
        ? "statistics"
        : normalized.includes("/lab/power-bi")
          ? "power-bi"
          : /^\/(learn|practice|lab)\/sql(?:\/|$)/.test(normalized)
            ? "sql"
            : normalized.includes("/lab/python")
              ? "python"
              : normalized.includes("/lab/excel")
                ? "excel"
                : normalized === "/lab" || normalized === "/lab/"
                  ? "analysis"
                  : "visualization";

  const label = SUBJECTS.find((s) => s.id === subject)!.title;
  const validUnit = /^[\w:.-]{1,150}$/.test(unit);
  const className = "min-h-11 py-2 underline underline-offset-4";

  // Subject homes carry their own breadcrumb; the strip is for the pages below
  // them.
  if (normalized === `/learn/${subject}`) return null;

  return (
    <nav
      aria-label="Learning context"
      className="relative z-10 mx-auto mt-20 mb-[-48px] flex w-full max-w-6xl flex-wrap gap-x-5 gap-y-2 px-5 text-xs leading-6 text-muted-foreground"
    >
      <Link className={className} href="/learn">
        Learn
      </Link>
      {!path.includes("drafts") && (
        <Link className={className} href={`/learn/${subject}/`}>
          {label}
        </Link>
      )}
      {selected && topic && (
        <Link
          className={className}
          href={path.includes("drafts") ? "/study/review/" : topicHref(selected.id, topic[0])}
        >
          Return to {topic[1]}
        </Link>
      )}
      {selected && validUnit && (
        <Link
          className={className}
          href={`${review && path.includes("drafts") ? "/study/review/path/" : `/study/${selected.id}/path/`}#${unit}`}
        >
          Back to this lesson step
        </Link>
      )}
      {path.includes("drafts") ? (
        <span className="min-h-11 py-2">Lesson notes</span>
      ) : path.startsWith("/lab") || path.startsWith("/practice") ? (
        <span className="min-h-11 py-2">Practice</span>
      ) : null}
    </nav>
  );
}
