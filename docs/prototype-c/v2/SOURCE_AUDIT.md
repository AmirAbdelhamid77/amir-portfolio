# Source audit — Prototype C V2 implementation

Baseline commit before this change set: `496fddf998fd3c221a213d0d9b81070847c2c122`
(`Add Hansa learning platform, DP-600 academy and visualization suite`).
Branch: `feat/dp600-academy-ingestion-20261025`. Working tree was already dirty with
unrelated work; nothing was reset, stashed or cleaned.

## 1. Authority read before editing

| Source | What it fixed |
|---|---|
| `AGENTS.md` (workspace + repo) | Preservation contract, no deployment, free/local only |
| `docs/agent-reference/START_HERE.md` and the three reference policies | Structure, visualization policy, preservation rules |
| `docs/prototype-c-direction-v2/START_HERE.md` | V1 `/prototype-c/` is rejected as a visual target |
| `docs/prototype-c-direction-v2/DESIGN_AND_MOTION_SPEC.md` | Art direction, planes P0–P4, geometry targets, scenes S0–S4, gates V1–V10 |
| `docs/prototype-c-direction-v2/AGENT_EXECUTION_BRIEF.md` | Slices 0–5, deliverables, constraints |
| `docs/prototype-c/{START_HERE,SOURCE_AUDIT,CONTENT_GOVERNANCE,VALIDATION}.md` | Technical evidence retained from V1 |
| `docs/prototype-c/v2/evidence/00-before-*.png` | Before-stills of the V1 renderer |

## 2. Code inspected before writing

| Area | Files | Result |
|---|---|---|
| Previous functional exploration | `components/knowledge/knowledge-stage.tsx` (12.6 kB), `components/knowledge/prototype-c.tsx`, `app/prototype-c/page.tsx` | Kept as the preserved, rejected reference; `prototype-c.tsx` now chooses stage vs legacy |
| Canonical insight authority | `content/knowledge/insights.json`, `lib/knowledge/insights.ts` | Three editions, all `technical_review`, `questionIds: []`, no human publication approval |
| Atlas projection | `lib/atlas/model.ts`, `lib/atlas/server.ts`, `components/atlas/peek.tsx`, `lib/atlas/circle-layout.ts` | Published-gated projection reused; public relations currently empty |
| Design tokens and motion | `app/globals.css`, `lib/ease.ts`, `lib/utils.ts` | Reused semantic tokens; stage aliases added, no global token replaced |
| Shell | `components/site-header.tsx`, `site-footer.tsx`, `lib/site.ts` | Untouched |
| Question/progress boundaries | `lib/fabric/storage.ts`, `engine.ts`, `additions.ts` | Untouched by this change set |
| Test conventions | `tests/knowledge/*.test.mjs`, `tests/atlas/*.test.mjs`, `scripts/qa-browser.mjs` | Node test runner + playwright-core against Edge, matching repo practice |

## 3. Upstream component sources

Both payloads were retrieved during the documentation session on 2026-10-26 and
re-read before adaptation; they are stored locally for audit at
`.scratch/card-dealer-components_motion_card-dealer.tsx`,
`.scratch/timeline-components_motion_timeline.tsx` and
`.scratch/card-dealer-lib_hooks_use-hover-capable.ts` (scratch, not shipped).

| Upstream | URL | Licence handling |
|---|---|---|
| beUI Card Dealer | `https://beui.dev/components/blocks/card-dealer`, registry `https://beui.dev/r/card-dealer.json` | Adaptation carries a header notice naming the source and date; no upstream asset or demo content was copied |
| beUI Timeline | `https://beui.dev/components/motion/timeline`, registry `https://beui.dev/r/timeline.json` | Same: header notice, mechanics re-implemented against Hansa data |
| `useHoverCapable` | beUI card-dealer support hook | Copied into `lib/hooks/use-hover-capable.ts` with its behaviour unchanged |

No new package was installed. The repository already declares `motion`; the rail and
dealer import only `motion/react`, React, `lucide-react` (already used) and `@/lib/*`.

Upstream API shape actually used: controlled `value` + `onValueChange`, measured stage,
neighbour scale, gap ticks, release spring, pointer threshold, flick projection;
`cards[{id, zone, label}]`, `renderFace`, `onCardSelect`, measured stage, arc travel,
keyboard overlays, reduced-motion path.

## 4. Not inspected / not verified

- Upstream repositories beyond the two registry payloads (no upstream tests, no
  upstream accessibility report). Treating their code as a reference, not a guarantee.
- Real device testing (iOS/Android hardware), screen readers (NVDA/JAWS/VoiceOver),
  200%/400% browser zoom, and RTL with real Arabic content. See `VALIDATION.md`.
- The retired conversation's mockups: unrecoverable, so no pixel fidelity is claimed.
- Atlas review tooling: the peek renders only the public projection; review-mode data
  was not exercised and must not be enabled from this stage.

## 5. Content facts used

`content/knowledge/insights.json` (schemaVersion 1, edition `2026-10-26`):

| id | date | topic | reviewStatus |
|---|---|---|---|
| `hansa-insight-shortcut-reference-v1` | 2026-10-26 | OneLake | `technical_review` |
| `hansa-insight-shortcut-delete-v1` | 2026-10-25 | OneLake | `technical_review` |
| `hansa-insight-shortcut-discovery-v1` | 2026-10-24 | Lakehouse | `technical_review` |

All three carry `reviewer: "agent-source-check; human pending"`, a `sourceLocator`, a
`checkedAt` of 2026-10-26, and an empty `questionIds` list. The stage labels them
"PREVIEW EDITION" / "technical review · human review pending" wherever it shows them.
