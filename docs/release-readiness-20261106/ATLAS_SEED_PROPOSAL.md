# Atlas seed proposal — 6 records, not applied

- Date: 2026-11-06
- Status: **PROPOSAL. Not imported, not applied, not published.**
- Decision: D2 in `DECISIONS.md`.
- Machine-readable form: `atlas-seed-candidate.json`
- Dry run: `node --experimental-strip-types docs/release-readiness-20261106/atlas-seed-dryrun.mjs`
  (evidence: `evidence/atlas-seed-dryrun.txt`)

## Why a seed at all

The public Atlas currently publishes **0 concepts and 0 connections**, and the
Home says so in the stage: "0 published concepts · 0 published connections — 42
concepts and 49 connections are under technical review. A count is not a claim,
and nothing here draws one." That sentence is true and it is the correct state
for an unpublished graph.

The Atlas is also the reason the Home cannot yet show what the three scenes are
for. A minimal, genuinely reviewed seed is what turns the empty state into a
demonstration without inventing knowledge.

## What the seed claims

Three concepts, three connections, one idea: **a reference is not a replica.**
All three concepts already exist in `content/atlas/editorial.json`; the proposal
changes publication state only. No new definition, no new position, no new
source is invented.

| Record | Type | Published as |
| --- | --- | --- |
| `concept:fabric:shortcut` | concept | OneLake shortcuts |
| `concept:fabric:database-mirroring` | concept | Database Mirroring |
| `concept:fabric:sql-endpoint` | concept | SQL analytics endpoint |
| `edge:fabric:reference-replica` | `contrasts_with` | A shortcut references a target; Database Mirroring maintains a replica |
| `edge:fabric:shortcut-sql` | `enables` | Eligible table shortcuts can be queried through a lakehouse SQL endpoint |
| `edge:fabric:mirror-sql` | `enables` | A mirrored database provides a SQL analytics endpoint |

Sources: three Microsoft Learn pages, all `official-documentation`, all
`public-link`, all checked 2026-10-25 and locators recorded in the dataset.

- <https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts>
- <https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcut-security>
- <https://learn.microsoft.com/en-us/fabric/mirroring/overview>

## What was deliberately left out

- Every other concept (39 stay `technical_review`) and every other edge (46).
- `concept:fabric:delta` and `edge:fabric:replica-delta`: a published `delta`
  with no published connection would be an orphan vertex; leaving it out keeps
  the seed internally closed.
- The DP-600 extension and continuation layers: 34 concepts and 40 edges whose
  review notes are agent transcripts, not human sign-off.
- Any "practical" or "how-to" claim. The seed is mechanism-level only.

## The exact change

For each concept, one field:

```diff
- "editorialState": "technical_review"
+ "editorialState": "published"
```

For each edge, two fields:

```diff
- "editorialState": "technical_review",
- "reviewer": "Codex documentation review; not human approval"
+ "editorialState": "published",
+ "reviewer": "Human: <the person who read the claim and its source>"
```

That is the whole patch: 3 field changes in `concepts`, 6 in `semanticEdges`.
`atlas-seed-candidate.json` carries the same content as data, with the reviewer
placeholder `PENDING - owner sign-off required`.

## Why the placeholder matters

`validateDataset` publishes an edge only when both endpoints are published **and**
`reviewer.startsWith("Human:")`. The placeholder does not start with `Human:`, so:

- applying the file without a real review throws
  `Publication requires human approval and published endpoints`;
- the dry run asserts that this rejection happens (`ok placeholder reviewer is
  rejected by the publication gate = true`);
- after signing each edge with a real name, the same dry run projects exactly
  3 concepts, 3 edges and 3 sources.

The gate is the reason this can be proposed safely: it cannot be published by
accident, and it cannot be published by an agent.

## What approval would change, visibly

- `/learn/dp-600/atlas/` gains a three-vertex graph with two `enables` edges and
  one `contrasts_with` edge, and the concept inspector gains three definitions.
- The Home's semantic-layer section moves from the honest empty state to a
  three-record graph; `publishedConcepts` becomes 3 and `publishedEdges` 3.
- The closing ledger and the archive are unchanged: they describe editions, not
  the graph.
- No route, layout, motion or type-scale change. Publication is data, not design.

## What approval does not fix

- 39 concepts and 46 edges remain in review; the honest count stays visible.
- The review surface (`/review/neighbourhood/`) stays a local-only build: the
  export prunes the route, so a static host answers 404.
- R1/R2 stay review-only until a larger seed is approved (D5).

## Recommended decision

If the three claims read correctly against the two linked pages: approve D2 and
sign each edge. If any claim needs different wording, edit the claim in place
first — the seed is small enough that a re-review is minutes, not a milestone.
If you would rather ship with no graph, reject D2 and the release goes out with
the honest 0/0 state above.
