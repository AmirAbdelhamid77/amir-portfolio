# Voice and copy

Hansa teaches. The page is written for the person learning, not for the person
auditing the repository. If a sentence describes how the content was reviewed
rather than what the reader can do, it belongs in `/about/sources` or in the
maintainer workspace — not in a lesson, a topic page or a search result.

## Rules

1. **Say what the reader gets.** "Read the explanation, try the idea, practise
   it" beats "the material is topic-led and evidence-mapped".
2. **One limits page.** Provenance, approval states, missing coverage and
   validation notes live in `/about/sources` or behind a `Source` disclosure.
   They do not sit in the first paragraph of a lesson.
3. **Numbers come from one place.** Use `SITE_METRICS` or the content module.
   A literal count in JSX will drift; a count in prose will drift louder.
4. **Sentence case for headings.** Title case only for proper names.
5. **A gap is said once, plainly.** "Notes and practice are still being added"
   is enough. Do not explain why the gap exists or what it does not prove.
6. **No review vocabulary in learner copy.** `unapproved`, `review state`,
   `coverage gap`, `publication state` and `prerequisite lock` are internal
   words. The learner sees a page, a question, or a link.
7. **Search copy is a promise, not a specification.** Name what can be found
   and where it opens. Matching rules belong in the "How matching works"
   disclosure.
8. **Keep the limits honest.** "No live Fabric execution" and "sample data" are
   useful. "This does not confer scientific approval" is not.

## Where things go

| Content | Lives in |
| --- | --- |
| Lesson, topic, lab, question | The learner page |
| Counts and coverage | `lib/site-metrics.ts`, `/about/sources` |
| Source file, hash, approval state | `/learn/method`, `/about/sources`, review routes |
| Search ranking rules | `/search` disclosure |
| Editorial backlog | `docs/` and review routes, never learner nav |

## Check

`npm run lint:copy` scans `app/` and `components/`, skipping the maintainer
routes, and fails on the banned phrases in the table above. Fix the copy or
move the sentence to `/about/sources`; do not add an exception.
