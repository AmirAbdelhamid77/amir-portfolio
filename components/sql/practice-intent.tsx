"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * `/practice/sql/` is reached from the practice catalogue with
 * `?mode=question`. That intent used to be ignored, so the visitor landed on a
 * generic self-check page with no clear way to the exam. When the intent is
 * present, offer an explicit choice: the first self-check or the existing
 * scored SQL exam. The return links keep `mode=question` so the practice
 * intent survives the trip back.
 */
export function SqlPracticeIntent({ firstDrillId }: { firstDrillId: string }) {
  const [fromPractice, setFromPractice] = useState(false);

  useEffect(() => {
    const read = () => {
      setFromPractice(new URL(location.href).searchParams.get("mode") === "question");
    };
    read();
    addEventListener("popstate", read);
    return () => removeEventListener("popstate", read);
  }, []);

  if (!fromPractice || !firstDrillId) return null;

  return (
    <section
      aria-label="Practice destination"
      data-practice-intent="true"
      className="sql-practice-intent"
    >
      <p className="sql-kicker">PRACTICE INTENT / CHOOSE A DESTINATION</p>
      <p>
        You arrived here to practise. Start with a written self-check, or take the
        existing scored SQL exam. Nothing on this page is timed or saved.
      </p>
      <nav aria-label="Practice destinations">
        <a href={`#${firstDrillId}`}>Start the first self-check →</a>
        <Link href="/lab/sql/">Open the existing 10-question SQL exam →</Link>
        <Link href="/learn/sql/?mode=question">Back to the SQL path</Link>
      </nav>
    </section>
  );
}
