# Working Knowledge Atlas — local review, 26 October 2026

Owner-authorized scope: implement Peek, Explorer and Guided Journey; source-backed relationships; preserve dirty work and saved progress; remove prior-experience material from the landing page; test and open a local preview. **No deployment.** Earlier documentation-only statements describe earlier tasks, not this implementation authorization.

## What is working

- `/learn/dp-600/` and the existing ingestion lesson embed a contextual Peek. Relationship links open the exact Inspector view; returning from a lesson restores safe Atlas URL state.
- `/learn/dp-600/atlas/` provides concept/alias search (including Arabic aliases), source and relationship filters, one/two-hop focus, explicit incoming-edge mode, a semantic SVG map with pan/zoom/Fit controls, an equivalent complete connection list, and concept/relationship inspectors with conditions, rationale and exact official source locators.
- `/learn/dp-600/atlas/journey/` provides Learn → Explore → Practice → Reflect, an original conceptual self-check and a browser-local reflection. Only the new `hansa-atlas-journey-v1` key is written. Unreadable stored data is preserved until the user explicitly resets this journey. Visiting steps is not mastery or an exam-readiness score.
- The landing page removes the HSE hero, selected projects, biography/education, experience links and recruiting copy. Its navigation/footer hide professional destinations on the home route only. Existing `/work/`, `/experience/`, `/about/` and `/services/` pages remain intact. The first landing action now opens the actual Atlas.

## Scientific and publication boundary

The implemented slice contains **8 canonical concepts, 9 semantic assertions, 4 official documentation sources and 2 existing learning/practice resources**. Guide-page/catalog order remains separate from semantic edges; no TOC line is promoted to an assertion. Question mappings remain pending review and no bank IDs, grading, answers or session records were changed. This is an ingestion cluster, not a completed conversion of the entire 67-page guide.

Sources were documentation-reviewed on 25 October 2026: [OneLake shortcuts](https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcuts), [shortcut security](https://learn.microsoft.com/en-us/fabric/onelake/onelake-shortcut-security), [Mirroring overview](https://learn.microsoft.com/en-us/fabric/mirroring/overview), [data movement decision guide](https://learn.microsoft.com/en-us/fabric/data-factory/decision-guide-data-movement). Every record includes source identity, section locator, review date, scope/conditions and rationale. Reference-versus-replica comparison is explicitly labeled synthesis; the other assertions have direct source support. Reviewer identity says Codex documentation review, not human approval. No runtime Fabric execution or official exam prerequisite is claimed.

The specification requires human review before public semantic publication. Accordingly these records retain `technical_review` status. `HANSA_ATLAS_REVIEW_PREVIEW=1` is an explicit **build-time, local-only editorial preview**. `scripts/build-atlas-preview.mjs` creates `build/atlas-preview/out`, then always rebuilds normal `out/` with the public projection. The normal public projection includes **zero unpublished concepts/edges**. No URL parameter, browser preference or client request can enable editorial data. The separate preview server binds to **127.0.0.1** only and displays the pending-review notice. No fake reviewer or automatic publication was introduced to make a populated graph appear approved.

## Representation and implementation decision

Meaning: compare access/movement mechanisms and inspect the conditions that make a relationship true. The current slice requires a bounded read-only map, not node authoring or arbitrary graph editing. The existing Statistics atlas is not reused as a source of semantic facts. The inspected EasyUI Dependency Trace lacks rendered edge labels/evidence and keyboard node selection. A small original SVG + native HTML controls/list provides those capabilities without another dependency.

Adaptive rubric (0–5 design judgments, **not measured speed/learning benchmarks**; weights 30/25/15/15/10/5): native SVG + equivalent list = 5/4/5/5/5/4 (94/100); linear-only = 5/4/3/5/5/5 (89/100); React Flow candidate = 5/4/5/3/4/4 (86/100). React Flow remains viable if future measured layout/editing requirements justify its package/CSS/interaction cost. No React Flow, layout engine or third-party service was installed. Existing Tailwind semantic tokens and controls are retained; no ambient animation was added.

Mobile defaults to list/drill-down with an optional map. All node and relationship actions have keyboard equivalents. Directed traversal does not infer an inverse; symmetric types traverse both ways. Rendering caps are 40 concepts/80 relationships and two hops with honest hidden counts. The 2,000-concept selector fixture is synthetic and is not a browser/CWV benchmark. There is no claim that eight reviewed concepts prove full-scale graph layout usability.

## Preservation and evolving historical checks

`START_BASELINE.json` records this task's exact dirty starting files and HEAD. `INTEGRATION_MANIFEST.json` binds every authorized before/after hash and owned new file. Historical baselines and source snapshots are preserved, not regenerated.

The old Academy preservation test now obtains the expected current hash from this exact successor receipt while retaining its existence/hash assertions and original three integration allowances. This is a deliberate test-contract extension for the newly authorized UI changes, not the prior historical repair: unexpected modifications still fail. The old test's before-bytes are retained in the rollback artifact. Existing history/EasyUI/Atlas guards verify both predecessor hashes and this bounded successor, rather than reporting an authorized landing/page addition as unexplained drift. Candidate publication, evidence, source, storage and domain rejection gates are retained.

Protected: package/lock, Next/Workers configuration, Fabric engines/storage/banks and the entire original ingestion lesson data/state engine. No learner data is read from or sent to a server. View Reset only changes camera/filters; Journey Reset only changes the new Atlas key. Resource return targets are allowlisted and parsed; URLs never contain answers/reflections/progress.

## Evidence and limits

Unit, contract, static-export and browser results, screenshots, public-projection scan and current-file preservation appear in `qa/` and `VALIDATION.md`. A build is not scientific/publication approval. Human screen-reader, physical mobile/touch and field CWV remain NOT RUN. No deployment/account changes. Do not deploy the editorial preview artifact.

Rollback: restore only owned existing files after checking their current after-hashes; remove only listed additions. If later work has changed a file, inverse-merge the feature instead. Never reset/stash/clean this dirty checkout.

Final observed status: all requested local gates PASS, 147 unit tests and 14 grouped browser checks. Normal/public and local-review static exports verified separately; 1,243 unrelated starting hashes retained. The current in-app tab was navigated to the actual populated Atlas on localhost:4191, its optional map made visible, and a screenshot saved as the user-facing preview. No deployment.
