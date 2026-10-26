# Future expansion guide

The integration is designed so another pack — a new video, a new topic set — is an
import, not a refactor.

## 1. Add a question pack

1. Put the new pack into the source package's `LAB_PACKS.merged.json` under a new key,
   with the same shape as the existing packs:
   ```json
   "video22": {
     "label": "Video 22 · …",
     "description": "…",
     "video": { "id": "…", "title": "…", "creator": "…", "duration": "…" },
     "map": [{ "id": "…", "time": 0, "title": "…", "ids": ["V22-…"], "points": ["…"] }],
     "questions": [{ "id": "V22-001", "type": "single", "options": [{ "id": "A", "text": "…", "why": "…" }], "correct": ["A"], … }]
   }
   ```
   Add every reference id it cites to `SOURCES.merged.json`.
2. Run the importer:
   ```bash
   npm run import:fabric -- --source "../Amirs_Fabric_Lab_Merged_834_Deployment_Package"
   ```
   It regenerates `content/fabric/*`, the per-pack chunks and
   `lib/fabric/pack-loaders.generated.ts` (one dynamic import per pack), and fails
   loudly if a count, an answer key or a reference does not hold.
3. Update the expectations in `tests/fabric/bank.test.mjs` (834 → new total, 18 → new
   pack count, type counts). These are deliberate assertions: the test must be edited
   by a human who knows the new baseline, not silently re-derived.
4. Run `npm run test:fabric && npm run report:fabric && npm run build`, then
   `npm run test:e2e:fabric` against the fresh `out/`.

Nothing in the engine, the routes or the UI needs to change. A pack appears in the
explorer's pack filter, the hub's pack list, the setup screens and the resources page
automatically, because all of them read the generated catalog.

## 2. Update source references

The registry is the single source of truth: `SOURCES.merged.json` in the package →
`content/fabric/sources.json` in the repo. Add or edit an entry there and re-run the
importer. A question that cites an unknown id fails the import (`broken-reference`),
so a typo cannot silently produce a dead link.

Reference ids are stable strings (`lakehouse`, `vref_e3759055f59bc334`). Never renumber
them — questions store the id, not the URL.

## 3. Remap exam objectives

Two layers, deliberately separate:

- **Raw**: `question.sourceObjective` is the author's `importMetadata.exam_objective`,
  copied verbatim and never rewritten.
- **Derived**: `lib/fabric/classify.ts` maps that text to an official sub-objective and
  a scope. It is pure and deterministic, and the import, the site and the tests all call
  the same function.

To change a mapping rule, edit `objectiveFromSource` / `scopeFromSource` / the subject
keywords in `lib/fabric/taxonomy.ts`, then:

```bash
npm run import:fabric -- --source "…"   # regenerates the index with new labels
npm run test:fabric                     # fails if coverage totals or labels drift
npm run report:fabric                   # rewrites the coverage matrix
```

Because `tests/fabric/bank.test.mjs` recomputes coverage from the index and compares it
to `meta.json`, a rules change cannot leave the shipped numbers stale.

If Microsoft publishes new domain weights, update `DOMAINS[].officialWeight` and the
study-guide URL in `lib/fabric/taxonomy.ts`. The hub's "difference vs official weight"
column derives from those values, so the coverage claims follow automatically.

## 4. Preserve progress across releases

- Question identity is `fb-<source-id>` (lower-case, slugged). **Never renumber source
  ids.** A renamed id looks like a new question and orphans its history.
- `localStorage` is namespaced `amir-fabric-v1` with an explicit `version`. The reader
  normalises an unknown shape, keeps the raw value under
  `amir-fabric-v1-unreadable-<timestamp>` or `amir-fabric-v1-v<old>`, and starts clean.
  Attempts are merged by session id on import, so re-importing a file cannot
  double-count.
- Adding a field to `FabricStore` is safe (normalisation fills defaults). Changing the
  meaning of an existing field requires a version bump and a migration in
  `normalizeStore`, not a silent reinterpretation.
- Removing a pack does not delete its history: the per-question stats stay keyed by id
  and simply stop resolving. Keep the pack file if the history matters.

## 5. Scaling limits to watch

| Limit | Current | What to do when it changes |
|---|---|---|
| Index chunk (`content/fabric/index.json`) | ~527 KB raw / ~90 KB gzip | Past ~2,000 questions, split the index per pack and filter server-side at build time (static facets), or move search to a prebuilt inverted index. |
| Explorer list render | 40 per page | Add virtualisation before removing the cap. |
| `localStorage` (~5 MB) | ~60 attempts + 30 sessions kept | Raise `MAX_HISTORY` only with an export reminder; never silently drop the oldest without telling the user. |
| Session load | loads the packs the paper draws from | A mock spanning all packs fetches ~1.6 MB once. Acceptable now; pre-build a combined "exam" chunk if the bank grows past ~2,000. |
| Case studies | 76, largest 24 questions | If a scenario exceeds ~40 questions, split it into named parts rather than one long session. |

## 6. Where to add a new learning mode

1. Add the mode to `FabricMode` in `lib/fabric/engine.ts` and to `MODE_PATH`/`MODE_LABEL`
   in `lib/fabric/nav.ts`.
2. Create `app/lab/dp-600/<mode>/page.tsx` with a `HubHeader` and
   `<SessionRunner mode="…" fields={[…]} …/>`.
3. Choose the feedback timing: `withFeedback = mode !== "mock"` in
   `session-runner.tsx` — change that expression deliberately, not by copy-paste.
4. Add the route to `HUB_NAV`, `app/sitemap.ts`, and one browser check in
   `tests/fabric/e2e.mjs`.

No new scoring code: `grade()` and `gradeSession()` cover every mode.
