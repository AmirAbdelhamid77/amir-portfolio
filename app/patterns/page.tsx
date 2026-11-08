import type { Metadata } from "next";
import { getPatternLessons, getPatternModules } from "@/lib/recovery/collections";

// The Creative Patterns learning package (20 lessons / 6 modules), recovered
// verbatim from the independent review package. Owner-derived educational
// explanations are published with the package's own honest status: it is an
// independent review package, NOT publication-approved, and its cited source
// excerpts remain attributed to their authors.

export const metadata: Metadata = {
  title: "Creative patterns — recovered learning package",
  description:
    "20 creative-pattern lessons in 6 modules, recovered from the independent review package and published unverified with attributed sources.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/patterns/" },
};

type Lesson = {
  slug: string;
  title: string;
  explanation?: string;
  objectives?: string[];
  walkthrough?: string;
  misconceptions_and_tradeoffs?: string;
  practice?: string;
  model_feedback?: string;
};

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

export default function PatternsPage() {
  const modules = getPatternModules();
  const lessons = getPatternLessons() as Lesson[];

  return (
    <main id="main" className="mx-auto w-full max-w-4xl px-4 py-14">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recovered collection</p>
      <h1 className="mt-2 text-balance text-4xl font-medium tracking-tight">Creative patterns</h1>
      <div className="mt-4 rounded-2xl border border-border bg-card/60 p-4 text-sm leading-6 text-muted-foreground">
        <p>
          <strong className="text-foreground">{lessons.length} lessons in {modules.length} modules</strong>, recovered from
          the independent review package and published <strong className="text-foreground">unverified</strong>: the
          explanations and walkthroughs are the author's derived educational material; cited sources, tools and datasets
          remain attributed to their authors and the package grants no public rights over them. Factual and editorial
          review is pending (see the{" "}
          <Link href="/content-index/" className="underline underline-offset-4">content index</Link> backlog).
        </p>
      </div>

      {lessons.map((lesson, index) => (
        <details key={lesson.slug} className="mt-6 rounded-2xl border border-border bg-card/40 px-5 py-4">
          <summary className="cursor-pointer select-none">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Lesson {String(index + 1).padStart(2, "0")} · draft — unverified
            </span>
            <span className="mt-1 block text-lg font-medium tracking-tight">{lesson.title}</span>
          </summary>
          <div className="mt-4 space-y-4 text-sm leading-6">
            {lesson.objectives ? (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Objectives</p>
                <p className="mt-1 whitespace-pre-wrap">{asText(lesson.objectives)}</p>
              </div>
            ) : null}
            {lesson.explanation ? (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Explanation</p>
                <p className="mt-1 whitespace-pre-wrap">{asText(lesson.explanation)}</p>
              </div>
            ) : null}
            {lesson.walkthrough ? (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Walkthrough</p>
                <p className="mt-1 whitespace-pre-wrap">{asText(lesson.walkthrough)}</p>
              </div>
            ) : null}
            {lesson.misconceptions_and_tradeoffs ? (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Misconceptions &amp; tradeoffs
                </p>
                <p className="mt-1 whitespace-pre-wrap">{asText(lesson.misconceptions_and_tradeoffs)}</p>
              </div>
            ) : null}
            {lesson.practice ? (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Practice</p>
                <p className="mt-1 whitespace-pre-wrap">{asText(lesson.practice)}</p>
              </div>
            ) : null}
            {lesson.model_feedback ? (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Model feedback</p>
                <p className="mt-1 whitespace-pre-wrap">{asText(lesson.model_feedback)}</p>
              </div>
            ) : null}
          </div>
        </details>
      ))}
    </main>
  );
}
