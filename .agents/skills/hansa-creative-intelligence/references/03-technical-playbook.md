# Technical playbook — React / Next static export / charts / D3 / Motion

## Inspection sequence (repo first)

Read: package.json/lockfile; Next config and static-export settings; root `AGENTS.md`; existing charts/graphs/animation primitives; CSS tokens; client/server component boundaries; tests; feature code/route; current git diff. Check actual versions before coding. Do not trust a historic version number as current.

## React + D3: ownership and state

**Preferred architecture for modest charts:** D3 performs pure math (scale, histogram, ticks, path generators, hierarchy layout); React owns the DOM and semantic state. This keeps interactions testable and avoids React/D3 conflict.

Pseudo-pattern (adapt to installed versions):

```tsx
'use client'
import { useMemo, useState } from 'react'
import { scaleLinear } from 'd3-scale'

export function ExampleChart({ rows }: { rows: Array<{ id: string; value: number }> }) {
  const [selected, setSelected] = useState<string | null>(null)
  const max = Math.max(1, ...rows.map((row) => row.value))
  const x = useMemo(() => scaleLinear().domain([0, max]).range([0, 300]), [max])
  return (
    <section aria-label="Illustrative value comparison">
      <svg role="img" aria-label="Values are proportional to horizontal lengths" viewBox="0 0 360 220">
        {rows.map((row, i) => (
          <rect key={row.id} x={40} y={i * 40 + 10} width={x(row.value)} height={20}
            data-selected={selected === row.id} />
        ))}
      </svg>
      <div role="group" aria-label="Select an item">
        {rows.map((row) => <button key={row.id} onClick={() => setSelected(row.id)}>
          {row.id}: {row.value}
        </button>)}
      </div>
      <p aria-live="polite">{selected ? `Selected: ${selected}` : 'Select an item to inspect it.'}</p>
    </section>
  )
}
```

The above is intentionally **a technical skeleton, not a recommended art direction**. Author a richer visual only after semantics and design are understood. For real charts add data table/summary, axes and units as needed. Do not mechanically copy this minimal layout into Hansa.

**For true D3-owned DOM/physics/zoom**: a dedicated `'use client'` component with a `ref`, a scoped selection, effect cleanup (`simulation.stop()`, observer disconnect, event listener removal, cancel timers/transitions), no selector leakage into other charts, stable IDs, and protections against Strict Mode re-execution. Keep React and D3 from editing the same SVG children. Place pan/zoom controls accessible outside the canvas; avoid gestures as the only path.

**Chart animations**: update from previous to new data with stable keys; transition geometry and emphasis after state is computed. Never animate axis positions without clear labels/corresponding scale. Record filtering transformation and ensure tooltip is not the only data path.

## Motion/animation architecture

- Reuse installed Motion/Framer Motion conventions if present. Current Motion docs describe `useReducedMotion` and `MotionConfig reducedMotion="user"`; check versions before importing from `motion/react`.
- CSS transitions are often sufficient for control affordances; no new library required.
- Prefer `transform`/`opacity` over repeated layout/paint work where possible; do not hide important content before hydration.
- Animate entry once and important state changes; avoid endless animation across study pages. Interruptions, reversal and reset must behave predictably.
- Use pointer/focus/tap alternatives; do not use hover state as the only way to learn a concept.
- Honor `prefers-reduced-motion` on mount and changes; provide equivalent state changes without spatial travel.

## Next static export / Cloudflare considerations

- Browser-only APIs (`window`, `ResizeObserver`, `requestAnimationFrame`, `document`, WebGL) must run only on client, after mount/effects; protect build/server execution.
- Favor server-renderable content and lightweight client islands. When heavy charts are genuinely needed, load only for the relevant route/interactive surface, with a comprehensible fallback.
- Do not require Next dynamic server routes, on-demand image transforms, authentication/session APIs or network-backed chart data not supported by the inspected deployment.
- Verify that the chosen dynamic import approach is valid for the actual version; do not use `ssr:false` in a Server Component.
- Provide layout stability to avoid chart-induced CLS; resize observers should trigger recalculation without changing factual data.

## Performance budget: decision, not magic numbers

- Keep interaction fluid on mid-tier mobile devices; measure before optimization rather than inventing FPS claims.
- Avoid continuous force simulations when a stable layout can be computed; pause/offscreen, stop on unmount, avoid animated filters/shadows on hundreds of nodes.
- Use scoped imports/chunk splitting only where justified; report before/after production bundle impact if tools support it.
- Avoid multiple costly observers/RAF loops per visual; clean up all event handlers. No network font/asset dependency without explicit design justification.

## Useful current references (verify versions)

- D3: https://d3js.org/getting-started ; https://d3js.org/d3-selection/joining
- Motion: https://motion.dev/docs/react-use-reduced-motion ; https://motion.dev/docs/react-accessibility
- Next static exports: https://nextjs.org/docs/app/guides/static-exports
- beUI agent docs: https://beui.dev/docs/ai-agents
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
