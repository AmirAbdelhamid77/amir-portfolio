'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { SUBJECTS, type StudyRecord } from '@/lib/study/taxonomy';

const isExternal = (href: string) => /^https?:\/\//i.test(href);

function externalHost(href: string) {
  try {
    return new URL(href).hostname;
  } catch {
    return 'external source';
  }
}

/** Internal links carry the topic, so a lesson can offer the way back. */
function href(record: StudyRecord) {
  if (isExternal(record.href)) return record.href;
  const url = new URL(record.href, 'https://hansa.invalid');
  url.searchParams.set('learningContext', `${record.subject}.${record.topic}`);
  return url.pathname + url.search + url.hash;
}

function RecordLink({
  record,
  className,
  ariaLabel,
  children,
}: {
  record: StudyRecord;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const target = href(record);
  return isExternal(record.href) ? (
    <a href={target} target="_blank" rel="noopener noreferrer" className={className} aria-label={ariaLabel}>
      {children}
    </a>
  ) : (
    <Link href={target} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}

const LABELS: [string, string][] = [
  ['all', 'All material'],
  ['read', 'Understand'],
  ['experiment', 'Experiment'],
  ['question', 'Practise'],
  ['reference', 'Reference'],
];

/**
 * The material inside one topic. `review` keeps source and publication notes
 * for the maintainer workspace; learner pages show the material only.
 */
export function TopicBrowser({ items, review = false }: { items: StudyRecord[]; review?: boolean }) {
  const [mode, setMode] = useState('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(30);
  const [subject, setSubject] = useState('all');
  const [topic, setTopic] = useState('all');
  const multiSubject = new Set(items.map((record) => record.subject)).size > 1;

  useEffect(() => {
    const restore = () => {
      const url = new URL(location.href);
      const nextMode = url.searchParams.get('mode') ?? 'all';
      setMode(['all', 'read', 'experiment', 'question', 'reference'].includes(nextMode) ? nextMode : 'all');
      setQuery(url.searchParams.get('q') ?? '');
      setLimit(30);
    };
    queueMicrotask(restore);
    addEventListener('popstate', restore);
    return () => removeEventListener('popstate', restore);
  }, []);

  const filtered = useMemo(
    () =>
      items.filter(
        (record) =>
          (subject === 'all' || record.subject === subject) &&
          (topic === 'all' || record.topic === topic) &&
          (mode === 'all' || record.kind === mode) &&
          query
            .toLowerCase()
            .split(/\s+/)
            .every((word) => [record.title, record.context, record.source].join(' ').toLowerCase().includes(word)),
      ),
    [items, mode, query, subject, topic],
  );

  function update(nextMode: string, nextQuery: string) {
    setMode(nextMode);
    setQuery(nextQuery);
    setLimit(30);
    const url = new URL(location.href);
    if (nextMode === 'all') url.searchParams.delete('mode');
    else url.searchParams.set('mode', nextMode);
    if (nextQuery) url.searchParams.set('q', nextQuery);
    else url.searchParams.delete('q');
    history.replaceState(null, '', url);
  }

  const subjectFilter = multiSubject && review ? (
    <div className="study-controls">
      <label>
        Subject
        <select
          aria-label="Subject"
          value={subject}
          onChange={(event) => {
            setSubject(event.target.value);
            setTopic('all');
            setLimit(30);
          }}
        >
          <option value="all">All subjects</option>
          {SUBJECTS.filter((entry) => items.some((record) => record.subject === entry.id)).map((entry) => (
            <option value={entry.id} key={entry.id}>
              {entry.title}
            </option>
          ))}
        </select>
      </label>
      <label>
        Topic
        <select
          aria-label="Topic"
          value={topic}
          onChange={(event) => {
            setTopic(event.target.value);
            setLimit(30);
          }}
        >
          <option value="all">All topics</option>
          {SUBJECTS.filter((entry) => entry.id === subject).flatMap((entry) =>
            entry.topics.map(([id, title]) => (
              <option key={id} value={id}>
                {title}
              </option>
            )),
          )}
        </select>
      </label>
    </div>
  ) : null;

  const shown = Math.min(limit, filtered.length);

  return (
    <section aria-label="Topic material">
      {subjectFilter}
      <div className="study-controls">
        <label>
          Find within this topic
          <input
            type="search"
            value={query}
            onChange={(event) => update(mode, event.target.value.slice(0, 160))}
          />
        </label>
        <label>
          Learning activity
          <select aria-label="Learning activity" value={mode} onChange={(event) => update(event.target.value, query)}>
            {LABELS.map(([id, label]) => (
              <option key={id} value={id}>
                {label} ({id === 'all' ? items.length : items.filter((record) => record.kind === id).length})
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            setSubject('all');
            setTopic('all');
            update('all', '');
          }}
        >
          Reset filters
        </button>
      </div>

      <p role="status" className="study-result-count">
        {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
        {shown < filtered.length ? ` · showing ${shown}` : ''}
      </p>

      {!filtered.length ? (
        <p className="study-empty">
          Nothing here matches that search. Try a shorter word, or reset the filters.
        </p>
      ) : null}

      <ol className="study-records">
        {filtered.slice(0, limit).map((record) => (
          <li key={record.id}>
            <div>
              <span className="study-eyebrow">
                {LABELS.find(([id]) => id === record.kind)?.[1]} ·{' '}
                {isExternal(record.href)
                  ? `${externalHost(record.href)} ↗`
                  : record.language === 'ar'
                    ? 'العربية'
                    : 'English'}
              </span>
              <h2 dir="auto">
                <RecordLink record={record}>{record.title}</RecordLink>
              </h2>
              <p dir="auto">
                {record.context.slice(0, 360)}
                {record.context.length > 360 ? '…' : ''}
              </p>
              {review ? (
                <details>
                  <summary>Source and review status</summary>
                  <p>{record.status}</p>
                  <p>
                    Source: {record.source} · ID: {record.id}
                  </p>
                  <p>{record.basis}</p>
                </details>
              ) : null}
            </div>
            <RecordLink
              className="study-open"
              record={record}
              aria-label={`Open ${record.title}${isExternal(record.href) ? ' at its source' : ''}`}
            >
              {isExternal(record.href) ? 'Source ↗' : 'Open ↗'}
            </RecordLink>
          </li>
        ))}
      </ol>

      {filtered.length > limit ? (
        <button className="study-more" onClick={() => setLimit((value) => value + 30)}>
          Show more
        </button>
      ) : null}
    </section>
  );
}
