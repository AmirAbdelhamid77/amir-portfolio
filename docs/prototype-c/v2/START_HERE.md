# Hansa Prototype C V2 — implemented review

**Status: implemented locally, tested locally, not visually accepted, not deployed.**
This directory holds the implementation record for the Hybrid Knowledge Stage that
`docs/prototype-c-direction-v2/` specified. That directory is still the design
authority; this one is the receipt for what was actually built and measured.

The owner has not reviewed the result. Nothing here claims the direction is approved,
and the earlier V1 prototype's flat renderer remains a rejected visual reference.

## What exists now

`/prototype-c/` is a composed stage, not a stack of boxes:

1. **Condensed kinetic rail** — real edition dates, measured geometry, a moving focus
   plate, gap ticks, drag with threshold and rubber band, flick projection, arrow-key
   selection, controlled identity (`?insight=<id>`) with Back/Forward.
2. **Scenario plane** — the canonical scenario, a derived reasoning experiment built
   only from that edition's own fields, then a controlled reveal with an attached
   evidence panel. Title stays anchored; the explanation opens beneath it.
3. **Card dealer** — three knowledge cards per edition derived from the same fields,
   real `deck → hand → reader → hand → deck` movement with stable card ids, arc flight,
   stagger, flip, hover/focus lift, Escape to close, reduced-motion placement.
4. **Contextual Atlas peek** — canonical published-gated projection only. With the
   current public data it is the honest "not published yet" bridge, with no invented
   graph.
5. **Archive** — local search, topic filter, native disclosure for reasoning and source,
   permalinks, and a "local preview" boundary note.

## Review locally

The production build is served as static output:

```bash
npm run build
npm run preview            # scripts/serve-out.mjs, port 4210
```

Then open `http://127.0.0.1:4210/prototype-c/`. Add `?insight=hansa-insight-shortcut-delete-v1`
to review an edition directly; `?mode=legacy` is preserved for the earlier layout.

## Documents in this folder

| Document | Use it for |
|---|---|
| `START_HERE.md` | This overview and status |
| `SOURCE_AUDIT.md` | What was inspected, retrieved, hashed and what was not |
| `IMPLEMENTATION_SPEC.md` | Component tree, state model, geometry, responsive and access contracts |
| `COMPONENT_DECISIONS.json` | Per-component upstream adaptation record (kept / changed / rejected) |
| `CONTENT_BRIEF.json` | Canonical content contract and the surfaces each field reaches |
| `CONTENT_GOVERNANCE.md` | Publication gates, derivation rules, what the stage may not imply |
| `VALIDATION.md` | Commands, results, 36 browser checks, screenshots, recordings, gate status |
| `QA_RELEASE_ROLLBACK.md` | How to re-run QA, how to reverse this change set, deployment boundary |
| `DOCUMENT_MANIFEST.json` | Hashes of these documents and the evidence files |
| `FINAL_REPORT.md` | Implemented / tested / unverified / blocked, and the next atomic task |

## Evidence

- Screenshots: `evidence/10-*` … `evidence/21-*` (desktop dark/light, hand, reader,
  reveal + evidence, second edition, reduced motion, 390, 320, 768, no-JS).
- Recordings: `evidence/rec-01-rail-selection.webm`, `rec-02-reveal-evidence.webm`,
  `rec-03-deal-inspect-collect.webm`.
- Machine report: `qa-browser.json` (36 checks, generated from the built output).

## What this is not

Not a deployment, not a content publication, not an accessibility certification, and
not an owner-approved artwork. See `FINAL_REPORT.md` for the precise untested list.
