# fabric-corpus compiler fixtures (FC03)

Small hand-written fixtures — no corpus content. All fixture text is authored
for this directory; nothing here is copied from `fabric-docs-light`.

## Layout

- `fixture-corpus/` — a mini corpus root. Compile it with family `docs`:
  `node tools/fabric-corpus/compiler/compile.mjs tools/fabric-corpus/fixtures/fixture-corpus <outDir> docs`
- `expected/` — hand-reviewed golden outputs, byte-compared by
  `tests/fabric-corpus/compiler/fixtures.test.mjs`.

## Fixture set (required coverage)

| File | Covers |
|---|---|
| `docs/headings-anchors.md` | anchor slugs (punctuation, dedup `-1`, underscores) |
| `docs/tables-code.md` | table alignments + cells, fenced code with/without language, code ranges (spans) |
| `docs/include-resolved.md` | include resolved to `includes/shared-fragment.md` (fragment sha + node count recorded) |
| `docs/include-missing.md` | quarantine: `include-missing-target` |
| `docs/include-cycle-a.md` / `-b.md` | quarantine: `include-cycle` (propagated as `include-chain` to the partner) |
| `docs/include-traversal.md` | quarantine: `include-path-traversal` (`../../` escapes the corpus root) |
| `docs/commented-directive.md` | commented-out include and zone directives DETECTED as `commentedDirective` (not resolved); ordinary comment stays `htmlComment` |
| `docs/image-alt.md` | markdown image (alt + title) and `:::image` directive with `alt-text` + `lightbox` edges |
| `docs/links.md` | external, mail, anchor-only, relative-md (+anchor existence), locale-ref, site-absolute, titled link |
| `docs/raw-html-script.md` | `<script>`/`<iframe>` removed (logged), `on*` attributes stripped, benign HTML preserved |
| `docs/sanitizer.md` | URL scheme allowlist: `javascript:` / `vbscript:` / `data:text/html` neutralized, entity-obfuscated scheme neutralized, `data:image/png` allowed |
| `docs/zone-tab.md` | `::: zone pivot` with nested `::: tab` constructs represented structurally |
| `docs/front-matter-unknown-keys.md` | unknown YAML keys preserved; `#customer intent` line preserved verbatim in `frontMatter.comments` |

## Documented policy choices (recorded by the sanitizer)

- URL allowlist: `https:`, `http:`, `mailto:`, relative paths, pure fragments,
  and `data:image/*` EXCLUDING SVG (SVG can carry script; other `data:` types
  are active content). Every other scheme is neutralized (`href` -> `#`, the
  original value is kept on the node and logged in the receipt).
- Removed HTML (`script`, `iframe`, `object`, `embed`, `style`, `form`,
  `base`, `meta`, `link`) is dropped together with its content; the original
  bytes stay auditable via `removedRaw` in the compiled node and the receipt
  entry's `sha256`/`snippet`.

## Golden review policy

Goldens are generated once and reviewed field-by-field against the fixture
source before commit (spans are checked against the physical lines). Changing
a fixture input changes its source hash and therefore requires regenerating
and re-reviewing its golden.
