import Link from "next/link";
import { StudyIntentLink } from "./intent-link";
import { SUBJECTS, topicHref } from "@/lib/study/taxonomy";
import { studyRecords } from "@/lib/study/server";
import "./study.css";

const STEPS = [
  { number: "01", label: "Understand" },
  { number: "02", label: "Experiment" },
  { number: "03", label: "Practise" },
];

/**
 * The learning library: subjects, then topics, then the material inside a
 * topic. Counts describe what a reader will find, not what an audit recorded.
 */
export function StudyDirectory({ practice = false, subject }: { practice?: boolean; subject?: string }) {
  const records = studyRecords();
  const subjects = SUBJECTS.filter((entry) => !subject || entry.id === subject);

  return (
    <div className="study-shell">
      <header className="study-heading">
        <p className="study-eyebrow">Learning library</p>
        <h1>
          {subject
            ? subjects[0]?.title
            : practice
              ? "Practise a topic."
              : "Find the idea. Follow it through."}
        </h1>
        <p>
          {practice
            ? "Choose a subject, then a topic. The explanation and the experiments stay beside the questions."
            : "Start with a subject, then a topic. Read the explanation, try the idea and practise it in the same place."}
        </p>
        <nav aria-label="Learning library">
          <Link href="/learn/">All subjects</Link>
          {subject ? <Link href={`/learn/${subject}/path/`}>Learning path</Link> : null}
          <Link href="/search/">Search everything</Link>
        </nav>
      </header>

      {!subject ? (
        <div className="study-principle">
          {STEPS.map((step) => (
            <span key={step.number}>
              {step.number} / {step.label}
            </span>
          ))}
          <p>Read the idea, try it, then answer questions on it.</p>
        </div>
      ) : null}

      <div className="study-subjects">
        {subjects.map((entry, index) => {
          const subset = records.filter((record) => record.subject === entry.id);
          const questions = subset.filter((record) => record.kind === "question").length;
          const pages = subset.length - questions;
          return (
            <section key={entry.id} className="study-subject" aria-labelledby={`subject-${entry.id}`}>
              <div className="study-subject-intro">
                {!subject ? (
                  <span className="study-number" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                ) : null}
                {!subject ? (
                  <h2 id={`subject-${entry.id}`}>
                    <StudyIntentLink practice={practice} href={`/learn/${entry.id}/`}>
                      {entry.title}
                    </StudyIntentLink>
                  </h2>
                ) : null}
                {!subject ? <p>{entry.goal}</p> : null}
                <small>
                  {pages} {pages === 1 ? "page" : "pages"} · {questions}{" "}
                  {questions === 1 ? "question" : "questions"}
                </small>
              </div>
              {subject ? (
                <ol className="study-topic-list">
                  {entry.topics.map(([id, title]) => {
                    const items = subset.filter((record) => record.topic === id);
                    const practiceCount = items.filter((record) => record.kind === "question").length;
                    const reading = items.length - practiceCount;
                    return (
                      <li key={id}>
                        <StudyIntentLink practice={practice} href={topicHref(entry.id, id)}>
                          <span>{title}</span>
                          <small>
                            {items.length
                              ? `${reading} ${reading === 1 ? "page" : "pages"} · ${practiceCount} ${practiceCount === 1 ? "question" : "questions"}`
                              : "Notes and practice are still being added"}
                          </small>
                          <span aria-hidden="true">↗</span>
                        </StudyIntentLink>
                      </li>
                    );
                  })}
                </ol>
              ) : (
                <StudyIntentLink
                  practice={practice}
                  className="study-open"
                  href={`/learn/${entry.id}/`}
                >
                  Explore {entry.topics.length} topics ↗
                </StudyIntentLink>
              )}
            </section>
          );
        })}
      </div>

      <details className="study-source-shelf">
        <summary>Original collections and practice sets</summary>
        <p>The same material in its original course order.</p>
        <div>
          <Link href="/learn/">Data visualization course</Link>
          <Link href="/learn/statistics/">Statistics reference</Link>
          <Link href="/learn/sql/">SQL reference</Link>
          <Link href="/learn/dp-600/">Microsoft Fabric lessons</Link>
          <Link href="/lab/dp-600/">Fabric question bank</Link>
          <Link href="/lab/">Analyst question sets</Link>
          <Link href="/learn/dp-600/atlas/">Fabric knowledge map</Link>
        </div>
      </details>
    </div>
  );
}
