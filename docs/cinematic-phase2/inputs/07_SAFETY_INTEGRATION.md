# 07 — Repository, concurrent-agent and release safety

## Non-negotiable existing project preservation

Repository: `D:\BeUI\amir-portfolio` (verify exists). Existing Hansa app is known historically as Next.js App Router with static export and Cloudflare Workers static assets, but actual versions/config must be inspected afresh. Do not assume availability of a runtime server/database.

- Never `git reset --hard`, `git clean -fd`, `checkout --` or overwrite uncommitted user/agent files.
- Never replace existing creative skill or silently rewrite installed spatial skill; compare bytes and diff first.
- Never alter source question content, IDs, answer QA status, Atlas public/pending status or saved user progress to accommodate visuals.
- Never assume CSS-only shadows are true 3D; if proposing WebGL, test actual device and fallback independently.
- Don't edit the active agent's production files while their session might be working; record worktree ownership and ask for a safe isolated location for prototype writing.
- No copy-paste remote images/text/assets or unverified licensing.
- No `npm install`, new dependencies, Cloudflare API mutations, Git push, commit, deployment, route changes or production integration without authorization appropriate to that phase.

## Safe branch/worktree workflow for future approved prototype

1. Inspect current repo and owning branch. Check existing worktree paths.
2. Propose a completely isolated local directory or worktree outside the primary checkout; do not create it before authorization to modify disk.
3. Record exact base commit, route inventory and origin state.
4. Prototype against synthetic demo fixtures or read-only exports; do not write canonical data.
5. Place dependencies in prototype only if explicitly approved; avoid conflicting lockfile changes.
6. Produce a reviewable diff. Owner signs off on precise files allowed for integration.
7. Rebase/reconcile only under owner-approved rules; no force reset/push.
8. Record rollback using the merge/reviewed commit and preserve existing routes/storage.
9. Treat production deploy as separate permission.

## Deployment phases

- `DESIGN_ONLY`: docs, sketches, architecture; zero app code.
- `ISOLATED_PROTOTYPE`: local demo only, no live app changes.
- `INTEGRATION_READY`: bounded source diff and tests; not necessarily merged.
- `LOCAL_BUILD_VERIFIED`: build and browser regression passed; still no production deploy.
- `PRODUCTION_APPROVED`: explicit authorization to deploy this precise candidate.
- `DEPLOYED_VERIFIED`: live site tested after deployment; include version/time and evidence.

Do not confuse those statuses. If the actual repo differs from these plans, log an ADR and preserve source truth over assumptions.

## Production Atlas constraint

If the Atlas route still says `Publication review is pending`, do **not** bypass QA by creating illustrative public relations. The landing may show verified related readings or a graph only of the approved published subset, with a clear explanation of remaining review status. The first visual prototype may use clearly labeled synthetic graph fixture in an isolated environment.

## Change-control table for integrator

| Area | Allowed during design? | Allowed during isolated prototype? | Allowed in approved integration? |
|---|---|---|---|
| Docs / external blueprint | Yes | Yes | Yes |
| Primary homepage component | No | No | Scope-limited |
| New isolated demo | No until approved | Yes | N/A |
| Shared design tokens | No | Prototype-only | Reviewed, scoped |
| Question/Atlas canonical data | Read-only | Read-only | No unless separately cleared |
| AGENTS / Skills | Read-only | Read-only unless approved install | Only authorized bounded edit |
| package.json / lockfiles | Read-only | Only explicit approved dependency install | Reviewed ADR + approval |
| Cloudflare deployment | No | No | Separate explicit approval only |

## Final report format

For each action: precise source path, status `PROPOSED|TESTED_LOCAL|BUILD_PASSED|NOT_RUN|BLOCKED|FAIL`, evidence file, file owner, risk and rollback. No claims of complete visual QA based on type-check success.
