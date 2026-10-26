import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored BeUI registry source, installed verbatim by
    // scripts/install-beui.mjs and recorded in
    // docs/data-visualization/beui-install-log.json. These files are not ours to
    // restyle: the React Compiler lint rules flag patterns inside the upstream
    // implementations, and rewriting them would silently fork the registry item.
    // Type checking still covers them (they are imported by real pages).
    "components/charts/**",
    "components/motion/**",
    // The agent-interface primitives are vendored the same way. The React
    // Compiler lint rules flag upstream ref handling and a synchronous
    // setState in an effect inside message-scroller; those are registry code,
    // not local decisions, so they are excluded from lint rather than forked.
    // They are still type-checked and exercised by the build and the browser QA.
    "components/agents/**",
  ]),
]);

export default eslintConfig;
