// Cloudflare Workers gateway for the split static export.
//
// The full export exceeds the Workers Free limit of 20,000 files per version,
// so the docs subtree (`/learn/fabric/**`, 16,368 files) is deployed as the
// separate `hansa-docs` Worker and everything else stays here. This gateway is
// the only public entrypoint, which keeps the existing workers.dev hostname and
// every URL/alias intact without requiring a custom domain or zone routes.
//
// Non-docs requests never run this script: static assets match first and are
// served directly. Only the paths declared in `assets.run_worker_first` reach
// the handler below, where the DOCS service binding forwards the request.
const DOCS_PREFIX = "/learn/fabric";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === DOCS_PREFIX) {
      // Keep the canonical trailing-slash shape used everywhere else.
      url.pathname = DOCS_PREFIX + "/";
      return Response.redirect(url.toString(), 308);
    }

    if (url.pathname.startsWith(DOCS_PREFIX + "/")) {
      return env.DOCS.fetch(request);
    }

    // Any other request reached the script because no asset matched. The
    // binding applies `not_found_handling` and returns the real 404 page.
    return env.ASSETS.fetch(request);
  },
};
