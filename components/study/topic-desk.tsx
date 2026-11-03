import Link from "next/link";
import { TOPIC_GOALS } from "@/lib/study/briefs";
import { studyRecords } from "@/lib/study/server";
import { subjectById } from "@/lib/study/taxonomy";
import { TopicBrowser } from "./topic-browser";
import { TopicPreparation } from "./topic-preparation";
import "./path.css";
import "./study.css";

/**
 * One topic desk: what to know before you start, then every page, experiment
 * and question filed under the topic. Canonical at `/learn/<subject>/<topic>`;
 * the `/study/...` address renders the same component.
 */
export function TopicDesk({ subject, topic }: { subject: string; topic: string }) {
  const entry = subjectById(subject)!;
  const title = entry.topics.find(([id]) => id === topic)![1];
  const items = studyRecords().filter(
    (record) => record.subject === subject && record.topic === topic,
  );

  return (
    <div className="study-shell">
      <header className="study-heading">
        <nav aria-label="Breadcrumb">
          <Link href="/learn/">Learn</Link>
          <Link href={`/learn/${subject}/`}>{entry.title}</Link>
          <span aria-current="page">{title}</span>
        </nav>
        <p className="study-eyebrow">{entry.title} / Topic</p>
        <h1>{title}</h1>
        <p>{TOPIC_GOALS[`${subject}.${topic}`] ?? entry.goal}</p>
      </header>
      <TopicPreparation subject={subject} topic={topic} />
      <TopicBrowser items={items} />
      <nav className="study-source-shelf" aria-label="Continue through subject">
        <Link href={`/learn/${subject}/`}>All topics in {entry.title}</Link>
        <Link href={`/learn/${subject}/path/`}>Learning path ↗</Link>
      </nav>
    </div>
  );
}
