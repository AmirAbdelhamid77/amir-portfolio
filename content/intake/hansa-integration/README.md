# Hansa Deep Research Corpus — site-ready distillation (intake copy)

Copied 29 October 2026 from the `hansa-integration` preparation package
(workspace root `../hansa-integration/`, plan and handoff in that folder).
These files are **authoring scaffolding**: nothing here publishes itself, and
every downstream record keeps the corpus provenance chain
(`corpus_id` + `source_url` + `sha256`) and the per-record `rights_class`.

| File | Rows | Used by |
|---|---:|---|
| `reference_records.jsonl` | 3,131 | `scripts/build-study-catalogue.mjs` → Phase A reference layer |
| `experiment_records.jsonl` | 46 | `scripts/build-study-catalogue.mjs` → Phase B hands-on lab pages |
| `lab_title_recovery.json` | 51 titles | Lab-number → instruction-title map recovered from the corpus git clones |
| `package_manifest.upstream.json` | — | SHA-256 of the *upstream preparation package* files (hashes describe the originals in `../hansa-integration/`, not these copies) |

Rules carried over unchanged from the corpus handoff:

- `REDISTRIBUTABLE` → mirror only with attribution and license; `LINK_ONLY` →
  link/paraphrase only, never republish; `INTERNAL_ONLY` → stays in the corpus.
- Answer keys are never presented as validated; no exam dumps.
- Nothing was executed against Fabric or any tenant; lab pages are outlines
  from the source repositories, not verified walkthroughs.

The deep-research corpus itself lives outside the repository
(`HansaDatabase/Hansa_Deep_Research_Corpus`, 4.2 GB). Rerun
`scripts/build-study-catalogue.mjs` after any re-harvest refreshes these
JSONL files.
