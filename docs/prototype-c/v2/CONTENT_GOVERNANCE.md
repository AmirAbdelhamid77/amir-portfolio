# Content governance — what the stage may and may not claim

This page is a **local editorial preview**. It renders three technically reviewed but not
human-approved editions, and it renders them with that status visible. The earlier
`docs/prototype-c/CONTENT_GOVERNANCE.md` still governs the content pipeline; this file
records the extra rules the V2 stage introduces.

## 1. Status vocabulary (use these words, in this order of strength)

| Term | Means here |
|---|---|
| **Preview edition** | Present in `content/knowledge/insights.json`, shown only at `/prototype-c/` |
| **Technical review** | A source check by the authoring agent on 2026-10-26 against the cited Microsoft Learn subsection |
| **Human publication review** | Not done for any of the three editions |
| **Published** | Only applies to content that passes the site's existing publication gate; not claimed by this stage |
| **Owner-approved design** | Not claimed. The owner has not reviewed the V2 render |

Copy in the UI must never move a stronger word backwards: a "technical review" chip may
not read "reviewed", "verified", "approved" or "published".

## 2. Canonical sources

- Editions: `content/knowledge/insights.json` via `lib/knowledge/insights.ts`.
- Cards and experiment verdicts: derived at render time from the edition's own fields
  (`lib/knowledge/models.ts`). No second content file, no hidden copy, no fabricated
  facts, no invented dates.
- Atlas: `lib/atlas/model.ts` published projection. The current public projection has no
  relations for `concept:fabric:shortcut`, so the stage shows the bridge state.

## 3. Rules the stage enforces

1. **No invented chronology.** Rail dates come from `insight.date`. A date is never
   presented as "today" unless it equals the current editorial day; otherwise the hero
   shows "Latest edition · <date>". No future or placeholder editions exist.
2. **No invented edges.** The peek draws only published concept/edge records, at most
   four, with their labels. Draft or review-only relations are not promoted by a visual.
3. **No invented progress.** The stage never writes to `localStorage`, never reads a
   question id, never scores an answer and never claims a learner position in the graph.
4. **No unlabelled review state.** Wherever a source is shown, the panel carries the
   source id, the locator, the check date and "technical review · human review pending".
5. **Derivation is allowed, invention is not.** A card preview is the first 15 words of
   the reviewed takeaway or caveat; an experiment verdict restates the takeaway and caveat
   for the chosen option. Neither adds a claim the edition does not already make.
6. **Archive disclosure is native.** Reasoning and source open with `<details>` so the
   same claim, caveat, locator and destination are reachable without JavaScript.

## 4. Empty and exhausted states

- No editions at all: the page renders "The next insight is being checked." with a
  learning catalogue link. It does not fall back to lorem or a placeholder edition.
- Deck exhausted and hand empty: "All available ideas are dealt. Collect the hand to
  start again." No infinite variety.
- Atlas with no published relation: "Reviewed connections are not published yet" plus
  lesson and practice destinations. No anonymous nodes, no greyed fake graph.
- Unknown `?insight=` id: the latest edition is shown with the message "That edition is
  unavailable. Showing the latest preview edition."

## 5. Before anything leaves the preview

Publishing this stage requires, at minimum:

1. Human publication review recorded for every edition it renders (the `reviewStatus`
   field is the only place that may change, together with a real reviewer).
2. The Atlas gate re-checked after that review; a published edge must exist in the
   projection before the peek may draw one.
3. The owner's visual review of `evidence/` and the three recordings (gate V10).
4. A separate explicit instruction to deploy. A passing build, a green QA run, this
   document or the design brief are none of them authorisation to publish.

## 6. Things this change set did not touch

Question banks, answer keys, saved attempts, Atlas review state, professional pages,
historical snapshots under `docs/prototype-c/preservation/`, and the rejected V1
`knowledge-stage.tsx` (still reachable through `?mode=legacy`).
