# Acceptance, test evidence, release gates and rollback

## Acceptance contract
| ID | Acceptance | Required evidence |
|---|---|---|
| AC01 | Actual repo/branch/dirty status/instructions inspected before implementation | baseline + source audit |
| AC02 | No unrelated existing file changes, question IDs/answers/review statuses/progress-contract changes | all 1,401 before-hashes, explicitly bound owned exceptions only |
| AC03 | Timeline selects all editions, reveal resets, stable permalink, reload/Back recover | browser checks at 1440/390/320px |
| AC04 | Scenario has explanation, caveat, source, clear next step; no exam scoring | source mapping + native reveal tests |
| AC05 | Deck has real next/reset and ordered complete cycle; no hover/drag requirement | browser checks + no storage writes |
| AC06 | Atlas Peek respects published-only graph and honest empty state | public projection test + actual Peek browser check |
| AC07 | Prototype IA has Today/Learn/Practice/Atlas/About and Search; no Work/Experience content or links on its homepage | desktop/mobile shell assertions; original professional routes return 200 |
| AC08 | Archive offers search, topic, count, empty, clear, explanation and permalink; public search preserved | test empty/intersection/recovery and existing `/search/` |
| AC09 | Native no-JS explanations and archive work; keyboard Enter/Space reveals and Escape closes menu | browser no-JS/keyboard checks |
| AC10 | Layout reflows at 320/390/1440px and in dark/reduced-motion; automated a11y has no known applicable violations | screenshots, overflow checks, axe JSON; manual limitations stated |
| AC11 | Static export and existing configured suites pass; no installs/server/paid dependency | actual build/lint/tests, unchanged package/host hashes |
| AC12 | New editorial claims remain technical_review, public feed empty, old banks untouched | gate unit tests + content hashes |
| AC13 | Historical preservation checks accept exact successor, reject corruption | immutable manifests + successor receipt + negative tests |
| AC14 | Deliverable can be picked up by another agent with source paths, ownership and rollback bytes | implementation pack + manifest and originals |

## Reproducible local checks
Run from repository root with existing dependencies:
```powershell
rtk proxy node --experimental-strip-types --test tests/knowledge/insights.test.mjs
rtk proxy npm run test:all
rtk proxy npm run lint
rtk proxy npm run build
rtk proxy node scripts/prototype-c-preservation.mjs
rtk proxy node scripts/verify-prototype-c.mjs
rtk proxy node scripts/verify-agent-reference.mjs
rtk proxy node scripts/verify-knowledge-atlas.mjs
rtk proxy node scripts/verify-easyui-integration.mjs
rtk proxy node scripts/verify-preservation-history.mjs
rtk proxy node scripts/serve-out.mjs 4197
# In a separate local terminal while the server runs:
rtk proxy node scripts/qa-prototype-c.mjs
```

The browser script launches installed Microsoft Edge through the existing playwright-core package. It checks actual static assets, not design screenshots or mocked DOM. Tests use a fresh isolated browser context and sentinel progress strings to detect writes from the new stage; this is not proof of full historical attempt import/resume on all engines. HTTP availability of the old routes is tested separately from an exam simulation. No browser profile or real learner progress is cleared.

## Additional human/accessibility/performance gates
Before public release test: human screen-reader output (NVDA or equivalent), actual touch, 200%/400% zoom and focus visibility, forced colors, all existing accent presets, physical narrow landscape devices, cognitive wording review and appropriate Arabic/RTL localized copy if added. Verify the existing shell's small search/theme targets as part of global adoption; inherited behavior is not certified simply because the stage uses 44px controls. A 320px viewport test approximates reflow but is not the entire zoom matrix.

Keyboard: logical Tab/Shift+Tab order; Enter/Space summary activation; no focus loss on deck change; menu Escape focus return; no trap. Sources must remain readable without color/animation/hover. Test native disclosure semantics with screen readers. Automated axe checks are supporting evidence, never WCAG certification.

Performance: compare compressed document and route JS/CSS transfer against the prior home on the same local setup. Keep stage text static, no graph engine, no network on reveal/deal, no autoplay. Record actual resource bytes and test environment. Future targets: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1, validated with field data or an explicitly limited lab run. This task does not claim those metrics from a build or payload measurement.

## Release gates — all must hold
1. **Preservation:** baseline verification, exact successor chain, unchanged banks/progress/hosting/package contracts, no unowned additions. Never regenerate historical manifests to hide drift.
2. **Build/integration:** unit suites, lint/type/static export and browser flows PASS; old bookmarked question URLs, query/hash state and a real saved-session refresh/restore/import/export verified on a safe fixture.
3. **Editorial:** named human approval + explicit new-record publication decision; resolve scenario ambiguities and stale sources. No historical status changes. Public feed uses `eligibleInsights(items)` **without preview**.
4. **Atlas:** existing publication constraints preserved. Honest empty Peek is acceptable if there are no published edges. No requirement to publish draft edges just to make the homepage prettier.
5. **Accessibility/responsive:** resolve applicable automated issues and human critical issues; both themes, keyboard/touch and zoom/reflow. No known critical blocker.
6. **Packaging/SEO:** remove/gate isolated preview route from the public export; replace local-preview labelling only after editorial decision. Today points at `/`; canonical/OG/Twitter and public sitemap verified against the chosen release. `noindex` alone is not content privacy.
7. **Navigation:** for sitewide adoption use one shared task IA with longest-prefix activation; preserve every old route, query and anchor. The current prototype does not migrate routes.
8. **Rollback:** approved release has known immutable deployment ID/asset backup, code revision and verified rollback operation. Public HTTP snapshot here does not supply an account deployment ID.
9. **Authorization:** only after a concrete reviewed release candidate is ready, obtain the owner's **explicit deployment approval**. Do not interpret this local implementation request as that approval.

Current release status is therefore **NOT APPROVED FOR DEPLOYMENT** even when local tests pass. Human editorial/accessibility gates and production packaging remain required follow-up, not hidden implementation claims.

## Rollback — dirty checkout safe
`preservation/baseline.json` is the immutable starting snapshot. `INTEGRATION_MANIFEST.json` binds each owned path to its before/after SHA-256; `preservation/originals/<path>` holds exact prior bytes for modified existing files. Historical manifests and their original checks remain intact; only explicit successor code handles this new layer.

The manifest separately binds one generated artifact, `tsconfig.tsbuildinfo`, to its predecessor circular-node receipt. That cache is regenerated, not restored as source. After a later authorized edit/build, inspect diffs and explicitly regenerate this task's receipt only for owned paths; do not run the finalizer to bless unrelated changed bytes or overwrite a later successor. `CONCURRENT_WORK.md` is part of the current release boundary.

For a rollback, first stop this task's local preview. For **each** owned file compare current bytes with the manifest's after hash. If equal, restore exactly its recorded original when beforeSha256 is non-null, or remove only that single task-owned added file when beforeSha256 is null. If any current hash differs, stop that file's rollback and perform a targeted inverse merge retaining later work. Do not use `git reset --hard`, `git clean`, bulk deletion or a stale old checkout over this branch. Keep evidence docs/rollback bytes until the owner no longer needs them. Remove the successor manifest only after its dependent changes have been reversed in the same controlled operation.

To disable the optional root preview without changing source, restore the previous value of `NEXT_PUBLIC_HANSA_PROTOTYPE_C` and rebuild. The default homepage remains the baseline version. This does not remove the isolated local `/prototype-c/` route; public packaging is a separate release gate.

Production rollback: none needed for this task because no deployment occurred. In a future authorized release, use the then-verified immutable prior deployment artifact, recheck homepage/old links/progress behavior, and record actual outcomes. Do not invent a Cloudflare deployment ID or assume account rollback access.
