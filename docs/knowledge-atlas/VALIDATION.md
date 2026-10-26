# Validation results and remaining limits — 25 October 2026

This report concerns repository preparation, not an Atlas implementation release.

| Check | Result | Evidence / scope |
|---|---|---|
| Actual repo/branch/Git status | PASS | Initial terminal evidence and PRESERVATION_BASELINE.json |
| ZIP vs integrated package | PASS | ZIP_VERIFICATION.json: all 17 entries match; original untouched |
| Existing reference baseline | PASS | verify-agent-reference.mjs before edits: 13 hashes, 6 available intake hashes |
| Integrated payload hashes | PASS | verify-knowledge-atlas.mjs checks all 16 payloads plus local manifest includes upstream manifest |
| Starter schema/fixture | PASS | Existing Ajv compatible-keyword validation plus reference/publication gate |
| Official upstream verifier | PASS | Existing Python runtime, verify_handoff.py: 14 required files, 2 concepts/1 draft edge, publication blocked |
| Full Draft 2020-12 certification | BLOCKED | python alias inaccessible; alternate existing Python runs but jsonschema absent. No environment/dependency install made. Ajv 6 compatibility check does not certify the entire Draft 2020-12 dialect |
| Negative data/publication cases | PASS | Duplicate/orphan/structural/direction/self-link/evidence/TOC/coverage/redirect/unsafe route and nonpublic leakage |
| Second-book shared concept / real route | PASS | Synthetic in-memory structural fixture; no scientific claims |
| Owned documentation links | PASS | Filesystem target validation; no blanket remote-source freshness claim |
| Unrelated file retention | PASS | All pre-existing hashes except four intentionally modified docs/manifest paths |
| Existing unit/content suites | PASS | npm run test:all exit 0: 62 data-viz + 18 Statistics + 29 Fabric + 20 content = 129 tests; separate tests/academy/*.test.mjs exit 0: 8 tests; 137 total, no tests modified |
| Script syntax / Git whitespace | PASS | node --check; git diff --check exit without errors (line-ending warnings only) |
| Atlas rendering/runtime/build | NOT RUN | No app/runtime changes; no Atlas renderer exists |
| Manual accessibility/mobile/visual/performance | NOT RUN | No new UI; framework specifies future checks, no WCAG/CWV certification |
| Scientific review of book/edges | NOT RUN | 0 newly approved concepts/edges; fixture remains quarantined |
| Live site/Cloudflare/deployment | NOT RUN | Explicitly outside current scope |

No added dependencies, paid resources, backend or student-data endpoint. Raw guide and candidates remain internal. Risks: production schema needs versioned mapping/source/journey extensions; graph library/license/bundle not yet selected; original guide redistribution rights unresolved; full diagrams/tables/code scientific review pending; historical Statistics prerequisite links must not be imported as verified claims.

The verifier's sample route check resolves concrete app page files only; dynamic routes/query/anchor contracts require the future route-inventory adapter and browser tests. It does not claim exhaustive route validation. Preserved upstream plain-text kickoff references are historical instructions, not live route promises.

Rollback and next atomic task are in EXECUTION_PLAN.md. Full owned file list and task-specific diff summary are in CHANGES.md. Runtime no-regression evidence here is source-byte preservation plus existing tests, not browser-stored values or live production behavior.

Final observed Atlas gate: 16 negative cases; second-book structural reuse; 16 upstream payload hashes; 33 integration file hashes; 20 local Markdown links; 1,163 unrelated pre-existing file hashes retained. All current runtime files also exist in the baseline (no runtime additions). Reference verifier after entry updates: 13 active hashes and 6 available intake hashes PASS. Official upstream verifier PASS without --schema. Warnings from existing tests concern module-type detection; Git warns about line endings, with no whitespace errors.
