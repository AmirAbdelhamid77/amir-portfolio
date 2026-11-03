import Link from 'next/link';
import { TOPIC_REVIEW } from '@/lib/study/topic-review';
import { resolveEvidence } from '@/lib/study/learning-path';
import { SUBJECTS, topicHref } from '@/lib/study/taxonomy';

/** What to know before this topic, and where the recommendation comes from. */
export function TopicPreparation({ subject, topic }: { subject: string; topic: string }) {
  const review = TOPIC_REVIEW[subject + '.' + topic];

  return (
    <aside className="topic-preparation" aria-label="Before you start">
      <div>
        <span className="study-eyebrow">Before you start · {review.stage}</span>
        <p>
          <strong>You are ready when you can:</strong> {review.entrySkill}
        </p>
        {review.prepare.length > 0 ? (
          <p>
            Read first:{' '}
            {review.prepare.map((id, index) => {
              const [prepareSubject, prepareTopic] = id.split('.');
              const title = SUBJECTS.find((entry) => entry.id === prepareSubject)?.topics.find(
                (item) => item[0] === prepareTopic,
              )?.[1];
              return (
                <span key={id}>
                  {index ? ' · ' : ''}
                  <Link href={topicHref(prepareSubject, prepareTopic)}>{title}</Link>
                </span>
              );
            })}
          </p>
        ) : null}
        <p>{review.reason}</p>
        <details>
          <summary>Sources for this preparation</summary>
          <ul>
            {review.evidence.map((key) => {
              const evidence = resolveEvidence(key);
              return (
                <li key={key}>
                  <a href={evidence.href}>{evidence.title}</a>
                </li>
              );
            })}
          </ul>
        </details>
      </div>
      <Link className="path-read" href={`/learn/${subject}/path/`}>
        See the learning path ↗
      </Link>
    </aside>
  );
}
