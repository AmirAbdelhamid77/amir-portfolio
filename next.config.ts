import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  // The site is fully static: `next build` writes the deployable site to `out/`,
  // which Cloudflare Workers Static Assets serves directly.
  output: "export",
  trailingSlash: true,
  images: {
    // The Next.js image optimiser needs a server; assets are pre-optimised in
    // scripts/prepare-images.mjs instead.
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath,
  reactStrictMode: true,
  // Reproducible builds (Wave 4): Next embeds a per-build random buildId into
  // every page's asset and prefetch URLs, so two clean builds of the same tree
  // were byte-different and the release manifest gate flagged it. For a static
  // export this carries no stale-cache risk (chunk filenames are content-hashed
  // and there is no server-side incremental cache); CI pins FABRIC_BUILD_ID per
  // release and the fallback constant keeps local builds byte-reproducible.
  generateBuildId: async () => process.env.FABRIC_BUILD_ID ?? "hansa-static-export",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
