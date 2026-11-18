"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  normalizeRoutePath,
  orientationTrail,
  resolveRouteContext,
} from "@/lib/navigation/route-context";
import { SUBJECTS, topicHref } from "@/lib/study/taxonomy";

/**
 * The learning-context strip for the learn, lab, practice and explore families.
 * It reads the declared route context (subject, activity, parent) and never
 * guesses a subject from URL text: a route without a declaration gets no strip
 * rather than a wrong subject.
 *
 * Pages that own their structural breadcrumb (the SQL shell) are skipped here
 * so "Learn / SQL" is not printed twice. Subject homes render their tab bar in
 * the page itself, where it can sit beside the subject heading.
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

  const resolved = resolveRouteContext(path);
  if (!resolved || resolved.breadcrumb === "page") return null;

  const normalized = normalizeRoutePath(path);
  const { links, marker } = orientationTrail(resolved, path);
  const [contextSubject, contextTopic] = context.split(".");
  const selected = SUBJECTS.find((subject) => subject.id === contextSubject);
  const topic = selected?.topics.find((entry) => entry[0] === contextTopic);
  // A context link must belong to the subject this page declares; otherwise it
  // would offer a return to a different subject's topic.
  const contextOwner = selected && selected.id === resolved.subject ? selected : null;
  const validUnit = /^[\w:.-]{1,150}$/.test(unit);
  const linkClass = "min-h-11 py-2 underline underline-offset-4";
  if (links.length <= 1 && !marker) return null;

  return (
    <nav
      aria-label="Learning context"
      className="relative z-10 mx-auto mt-20 mb-[-48px] flex w-full max-w-6xl flex-wrap gap-x-5 gap-y-2 px-5 text-xs leading-6 text-muted-foreground"
    >
      {links.map((link) => (
        <Link key={link.href} className={linkClass} href={link.href}>
          {link.label}
        </Link>
      ))}
      {contextOwner && topic ? (
        <Link
          className={linkClass}
          href={normalized.includes("drafts") ? "/study/review/" : topicHref(contextOwner.id, topic[0])}
        >
          Return to {topic[1]}
        </Link>
      ) : null}
      {contextOwner && validUnit ? (
        <Link
          className={linkClass}
          href={`${review && normalized.includes("drafts") ? "/study/review/path/" : `/learn/${contextOwner.id}/path/`}#${unit}`}
        >
          Back to this lesson step
        </Link>
      ) : null}
      {marker ? <span className="min-h-11 py-2">{marker}</span> : null}
    </nav>
  );
}
