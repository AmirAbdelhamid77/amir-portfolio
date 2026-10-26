# Canonical knowledge content, provenance and QA gates

## Separate domains and sources of truth
`content/knowledge/insights.json` owns **new** editorial scenarios/cards. Existing Fabric banks, imported sources, learner attempts and Atlas concepts/semantic edges retain their own authorities and IDs. A shared word or exam topic is not evidence that a question supports a claim. `questionIds: []` means no exact question association was adjudicated. Practice CTAs open the real explorer, not a fabricated “related question”.

The card deck is a view over the same canonical insight records, never a second manually edited answer bank. The archive is another view over the same records. Stage content is static build-time data; runtime interaction is deterministic local state. No LLM generates facts, dates, scores or links in a visitor session.

## Current record contract
| Field | Required meaning / validation |
|---|---|
| `id` | Unique stable `hansa-insight-…-v1`; do not recycle or renumber after linking |
| `date` | ISO edition date; samples are explicitly preview editions |
| `topic` | Search/filter taxonomy, not an inferred semantic relationship |
| `title`, `scenario`, `prediction` | Original teaching wording; scenario assumptions explicit; no official exam claim |
| `takeaway`, `caveat` | Narrow factual distinction and material limits, always displayed together in expanded content |
| `cardTitle` | Short alternate reading lens, same claim authority |
| `conceptId` | Existing canonical concept ID; this association does not publish an Atlas edge |
| `lessonHref`, `practiceHref` | Existing local destinations; route/anchor checks before publication |
| `sourceId`, `sourceUrl`, `sourceLocator` | Primary source identity, https URL and exact supporting subsection |
| `checkedAt` | Source check date, not publication approval or freshness guarantee |
| `reviewStatus`, `reviewer` | Editorial state and truthful attribution. Current records: `technical_review`, agent check, human pending |
| `questionIds` | Explicit reviewed IDs only; empty is valid; never infer from lexical matching |

`eligibleInsights(items)` permits only `published` records with essential source/claim/reviewer fields. The explicit preview call additionally permits `technical_review`. Unknown/candidate/approved statuses are excluded. `approved` does **not** mean `published`. Current normal public feed therefore returns **zero** records. Current stage intentionally calls preview mode on the isolated preview route/root opt-in. A future public composition must call normal mode.

The filter is a basic read-time eligibility guard, not a complete untrusted-input schema/security engine or human editorial workflow. JSON is a repository-controlled build input. Before accepting external imports, introduce a strict schema for all types, actual calendar dates, duplicates, approved source origin, local URL allowlist and field length limits; reject bad imports atomically. Do not call the existing filter a CMS or approval service.

## Editorial lifecycle for the next agent
1. **Candidate:** assign new stable insight ID, claim, audience/outcome, misconception, source locator and scenario assumptions; capture unresolved disagreements. Never copy a historical bank answer as independently verified truth.
2. **Technical review:** check current official primary documentation; verify claim, conditions, freshness, supported connectors/engines where relevant; distinguish fact from interpretation and hypothetical setup. Agent reviewers identify themselves as agents.
3. **Human approval:** named domain reviewer checks scenario clarity, answer rationale, caveat and source support. Record review date, revision and decision in a separate approval ledger; do not edit historical bank or Atlas review statuses to manufacture agreement.
4. **Publication decision:** owner/editor explicitly schedules a reviewed record. Only then transition this **new** insight record to `published` with approval-ledger linkage. The current task does not make this transition.
5. **Revision:** preserve the original ID for meaning-preserving corrections and record revision/provenance; issue a new ID and a non-destructive alias strategy if meaning fundamentally changes. Withdraw stale/disputed claims from future public projections without deleting original evidence.

For a real future daily calendar add an explicit mapping `date → insightId`, `publicationAt`, `expiresAt`, revision/approval reference, and a source-review freshness policy. Use the owner's chosen Africa/Cairo editorial day, fixed build time and an honest “Latest reviewed insight — <date>” fallback when no edition is scheduled. A fixed static export cannot promise an automatically refreshed daily publication schedule. Rebuild/publish through the approved workflow; no runtime clock-based approval bypass.

## Source consistency and disagreement rules
- Three prototype samples use the current Learn shortcuts article. Exact narrow supporting subsections are embedded in records. They do not cover all DP-600 subjects.
- Source facts, teaching scenario and inference stay distinguishable. No synthetic observations, counts of learners, streaks, “you are here” mastery markers or efficacy statistics are invented.
- If a historical answer conflicts with documentation, create an issue with both provenance trails. Do not rewrite the bank, silently mark an answer verified, or train the daily feed on disputed content. Exclude the disputed insight until adjudicated.
- Missing exhibits remain handled by existing question-bank rules. No image, answer or scoring eligibility is reconstructed here.
- Atlas source associations are catalogue metadata. Only the Atlas's own reviewed published semantic assertions can draw edges. Lesson membership, Timeline order and insight/card order never become graph edges.

## Publication blockers
Missing primary evidence; invalid route; ambiguous scenario with multiple plausible outcomes; omitted caveat; stale product behavior; unresolved source disagreement; false authentic-exam claim; missing human sign-off; unsafe URL; inaccessible reveal; draft leakage into public search/feed. Any blocker overrides a numerical design rubric score.

## Source renewal task
Before eventual publication reread [Microsoft Learn: OneLake shortcuts](https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts), especially permissions, supported table behavior, caching and deletion semantics. Recheck linked canonical lessons without rewriting them as part of this homepage task. Record the date and exact changed assertions. No automatic approval or historical review promotion is authorized.
