'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { SUBJECTS, topicHref } from '@/lib/study/taxonomy';
import type { LearningLink, LearningUnit } from '@/lib/study/learning-path';

/**
 * One subject's learning path, in order. `review` keeps the mapping evidence
 * for the maintainer workspace; learner pages show the sequence itself.
 */
export function PathUnits({ units, review = false }: { units: LearningUnit[]; review?: boolean }) {
  const [query, setQuery] = useState('');
  const [stage, setStage] = useState('all');
  const [limit, setLimit] = useState(12);
  const [target, setTarget] = useState('');

  useEffect(() => {
    const restore = () => {
      const hash = location.hash.slice(1);
      if (units.some((unit) => unit.id === hash)) {
        setTarget(hash);
        setStage('all');
        setQuery('');
        setLimit(Math.max(12, units.findIndex((unit) => unit.id === hash) + 1));
      }
    };
    queueMicrotask(restore);
    addEventListener('hashchange', restore);
    return () => removeEventListener('hashchange', restore);
  }, [units]);

  useEffect(() => {
    if (target) {
      requestAnimationFrame(() =>
        document.getElementById(target)?.scrollIntoView({ block: 'start', behavior: 'instant' }),
      );
    }
  }, [target, limit]);

  const list = useMemo(
    () =>
      units.filter(
        (unit) =>
          (!target || unit.id === target) &&
          (stage === 'all' || unit.stage === stage) &&
          query
            .toLowerCase()
            .split(/\s+/)
            .every((word) => [unit.title, unit.objective, ...unit.topics].join(' ').toLowerCase().includes(word)),
      ),
    [units, query, stage, target],
  );

  const context = (unit: LearningUnit, link: string) => {
    if (!link.startsWith('/')) return link;
    const url = new URL(link, 'https://local.invalid');
    url.searchParams.set('learningContext', unit.subject + '.' + unit.topics[0]);
    url.searchParams.set('learningUnit', unit.id);
    if (review) url.searchParams.set('learningReview', '1');
    return url.pathname + url.search + url.hash;
  };

  const linkLabel = (link: LearningLink) => {
    if (link.basis === 'source-explicit') return 'Source link';
    if (link.basis === 'topic-context') return 'Related practice';
    if (link.basis === 'external-reading') return 'External reading';
    return 'Related concept';
  };

  const links = (unit: LearningUnit, items: LearningLink[]) => (
    <ul className="path-links">
      {items.map((link) => (
        <li key={link.id}>
          <Link href={context(unit, link.href)}>{link.title} ↗</Link>
          <small>{linkLabel(link)}</small>
        </li>
      ))}
    </ul>
  );

  return (
    <section aria-label="Lesson sequence">
      <div className="study-controls">
        <label>
          Find a lesson
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setTarget('');
              setQuery(event.target.value.slice(0, 160));
              setLimit(12);
            }}
          />
        </label>
        <label>
          Learning stage
          <select
            aria-label="Learning stage"
            value={stage}
            onChange={(event) => {
              setTarget('');
              setStage(event.target.value);
              setLimit(12);
            }}
          >
            <option value="all">All stages</option>
            {['Foundation', 'Applied', 'Advanced', 'Reference'].map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <button
          onClick={() => {
            setQuery('');
            setStage('all');
            setLimit(12);
            setTarget('');
            history.replaceState(null, '', location.pathname + location.search);
          }}
        >
          Reset path filters
        </button>
      </div>

      <p className="study-result-count" role="status">
        {list.length} {list.length === 1 ? 'step' : 'steps'}
        {Math.min(limit, list.length) < list.length ? ` · showing ${Math.min(limit, list.length)}` : ''}
      </p>

      <ol className="path-units">
        {list.slice(0, limit).map((unit) => {
          const position = units.findIndex((item) => item.id === unit.id);
          return (
            <li className="path-unit" id={unit.id} key={unit.id}>
              <nav className="path-step-nav" aria-label={'Move from ' + unit.title}>
                {position > 0 ? <a href={'#' + units[position - 1].id}>← Previous step</a> : null}
                {position < units.length - 1 ? <a href={'#' + units[position + 1].id}>Next step →</a> : null}
              </nav>

              <div className="path-step-meta">
                <span>{String(position + 1).padStart(2, '0')}</span>
                <span>
                  {unit.stage} ·{' '}
                  {unit.kind === 'study-note'
                    ? 'Study note'
                    : unit.kind === 'external-foundation'
                      ? 'Primary reading'
                      : 'Lesson'}
                </span>
              </div>

              <h2>{unit.title}</h2>
              <p>{unit.objective}</p>

              {unit.lessonPrerequisites?.length ? (
                <p className="path-before">
                  Read first:{' '}
                  {unit.lessonPrerequisites.map((id, index) => (
                    <span key={id}>
                      {index > 0 ? ' · ' : ''}
                      <a href={'#' + id}>{units.find((item) => item.id === id)?.title ?? id}</a>
                    </span>
                  ))}
                  .
                  {review
                    ? ' These prerequisites are declared in the source; they do not confer approval.'
                    : null}
                </p>
              ) : null}

              {unit.prepare.length ? (
                <p>
                  Prepare these concepts:{' '}
                  {unit.prepare.map((key, index) => {
                    const [subject, topic] = key.split('.');
                    const entry = SUBJECTS.find((item) => item.id === subject);
                    return (
                      <span key={key}>
                        {index ? ' · ' : ''}
                        <Link href={topicHref(subject, topic)}>
                          {entry?.topics.find((item) => item[0] === topic)?.[1]}
                        </Link>
                      </span>
                    );
                  })}
                </p>
              ) : null}

              <Link className="path-read" href={context(unit, unit.href)}>
                1 · Read the lesson ↗
              </Link>

              <div className="path-activities">
                <section aria-label={'Practice for ' + unit.title}>
                  <h3>2 · Practise the decision</h3>
                  {unit.questions.length ? (
                    links(unit, unit.questions)
                  ) : (
                    <p>No question in the bank matches this step yet. Use the self-check below.</p>
                  )}
                </section>

                <section aria-label={'Apply ' + unit.title}>
                  <h3>3 · Apply and explain</h3>
                  {unit.applications.length ? (
                    links(unit, unit.applications)
                  ) : (
                    <p>Apply the idea with the explanation task below.</p>
                  )}
                  <details>
                    <summary>Self-check · not scored</summary>
                    <p>{unit.reflection}</p>
                    <p>Compare your explanation with these source points:</p>
                    <ul>
                      {unit.reviewPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                    <p>{unit.caveat}</p>
                  </details>
                </section>
              </div>

              {review ? (
                <details className="path-review">
                  <summary>Mapping evidence and source coverage</summary>
                  <p>Source coverage: {unit.coverage}.</p>
                  {[...unit.questions, ...unit.applications].map((link) => (
                    <p key={link.id}>{link.reason}</p>
                  ))}
                </details>
              ) : null}
            </li>
          );
        })}
      </ol>

      {limit < list.length ? (
        <button className="study-more" onClick={() => setLimit((value) => value + 12)}>
          Show more
        </button>
      ) : null}
    </section>
  );
}
