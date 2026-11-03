import { buildSearchIndexPayload } from "@/lib/search/build-index";

// Static export: this route is rendered once at build time and written to
// `out/search/index.json`. The search page fetches it relative to `/search/`,
// so the same code works at the site root and under a base path.
export const dynamic = "force-static";

export function GET() {
  const payload = buildSearchIndexPayload();
  return new Response(JSON.stringify(payload), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}
