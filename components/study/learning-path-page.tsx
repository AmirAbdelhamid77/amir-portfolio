import Link from "next/link";
import { learningUnits } from "@/lib/study/learning-path";
import { SUBJECTS } from "@/lib/study/taxonomy";
import { PathUnits } from "./path-units";
import "./path.css";
import "./study.css";

/**
 * One subject's teaching sequence. Canonical at `/learn/<subject>/path/`; the
 * `/study/...` address renders the same component.
 */
export function LearningPathPage({ subject }: { subject: string }) {
  const entry = SUBJECTS.find((candidate) => candidate.id === subject)!;
  const units = learningUnits().filter((unit) => unit.subject === subject);

  return (
    <div className="study-shell path-page">
      <header className="study-heading">
        <nav aria-label="Breadcrumb">
          <Link href="/learn/">Learn</Link>
          <Link href={`/learn/${subject}/`}>{entry.title} topics</Link>
        </nav>
        <p className="study-eyebrow">UNDERSTAND → PRACTISE → APPLY → EXPLAIN</p>
        <h1>{entry.title}: learning path</h1>
        <p>
          Start with foundations, then practise, apply and explain. Each step keeps its source
          and matching practice.
        </p>
      </header>
      <PathUnits units={units} />
    </div>
  );
}
