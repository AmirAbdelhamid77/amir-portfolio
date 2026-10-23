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
