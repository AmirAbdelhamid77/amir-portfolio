// Cloudflare Worker entrypoint for the documentation asset tree.
//
// The Worker has a script only so the `hansa` gateway can reach it through a
// service binding. `run_worker_first` is enabled in wrangler.docs.jsonc, so
// every request runs this handler and then reads the Worker's own static-asset
// binding; `html_handling` and `not_found_handling` still apply.
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
