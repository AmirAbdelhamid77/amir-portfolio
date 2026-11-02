# Development topic adapter proof

Status: development-only. Not integrated into `app/`, not deployed, no new
dependency.

> **V3.1 note (2026-11-01).** The live prototype now carries the multi-card V2
> deck contract, proved by `deck-resolver.test.mjs` (24 checks, including the
> legacy V1 adapter). This proof is retained as a **compatibility proof against
> the frozen pre-V3.1 payload** in
> `intelligent-atlas/baselines/2026-11-01-pre-v31/files/`. It no longer reads
> `prototype/data.js`, so a stale single-card payload cannot pass as the current
> one. The checks, fingerprints and event sequence below describe that archived
> baseline and are still reproducible.

Files:

- `adapter-proof.mjs` — loader, adapter, schema-subset validator, state machine.
- `adapter-proof.test.mjs` — 7 Node tests.
- `contracts.schema.json` — source of truth for the request/state shapes.

Run:

```powershell
node intelligent-atlas/contracts/adapter-proof.mjs
node --test intelligent-atlas/contracts/adapter-proof.test.mjs
```

## What it proves

The proof loads the archived pre-V3.1 prototype payloads in a Node `vm`
sandbox, so the browser globals are exercised without a bundler or a browser. It
then:

1. recomputes the SHA-256 fingerprint of the archived `data.js` and
   `public-data.js` and compares them with the archived metadata and
   `data-provenance.json`;
2. resolves the three real OneLake editions to
   `concept:fabric:shortcut`;
3. builds a `DeckRequest` with one card per edition, real evidence locators and
   `publicEligible: false`;
4. validates the request against the contract schema subset plus semantic rules
   (single card, declared dates, return context, gates, development-only
   adapter);
5. simulates the Dealer through open → evidence → edition switch → destination →
   Escape → close → return → Escape → close, validating every serialisable state;
6. rejects six invalid requests: two-card edition, public candidate, unknown
   gate, missing initial edition, return context outside the editions and an
   unknown top-level field;
7. asserts that the public projection publishes zero concepts, mappings and
   assertions, and that no candidate payload record is marked `published`.

## Result (2026-10-31)

```json
{
  "ok": true,
  "graphBuildId": "ia-graph-bed4e12d0986",
  "requestId": "deck:onelake:2026-10-26",
  "editionDates": ["2026-10-24", "2026-10-25", "2026-10-26"],
  "editions": 3,
  "cardsPerEdition": [1, 1, 1],
  "publicEligible": false,
  "states": 10,
  "checks": 26
}
```

Fingerprints:

- `data.js`: `8bf409f49a1851bd39a89a544b8826538aaff95cbf30db1eae42708182ad5561`
- `public-data.js`: `bc21cdf070d7f41b1f471913540cf82704f1685c0f79563f383f57e2d324e71b`

Tests: `7/7` pass.

## Event sequence

```
dealer.opened
evidence.opened
edition.changed        (26 -> 24)
edition.changed        (24 -> 26; evidence view restored)
view.changed           (destination -> card)
view.changed           (evidence -> card after return)
dealer.closed
return.requested
dealer.opened
dealer.closed
```

The sequence demonstrates that per-edition reader state survives switching, that
Escape backs out one level, and that the return context reopens the originating
edition.

## Why the validator is a subset

`ajv` is not a declared project dependency, and the installed transitive version
targets draft-07 while the contract uses JSON Schema 2020-12. The proof therefore
implements only the keywords the contract uses (`$ref`, `oneOf`, `type`,
`required`, `properties`, `additionalProperties`, `items`, `minItems`,
`maxItems`, `uniqueItems`, `enum`, `const`, `pattern`, `minLength`, `minimum`,
`format: uri`). It is a contract check, not a general-purpose JSON Schema
implementation. If the schema grows a new keyword, the validator and its tests
must grow with it.

## Limits

- The adapter resolves a hard-coded real topic (`OneLake`) rather than a
  reviewed topic index.
- It does not disambiguate homonyms automatically; a production adapter must
  consult `analysis/ambiguities.json` and reject unresolved terms.
- It does not persist, authenticate, cache or deliver assessment items.
- It does not prove publication readiness. It proves that the request/state
  contract can carry candidate data without accidentally publishing it.
- The public projection is a local simulation of a future server-side
  projection; it is not wired to the live Atlas store.
