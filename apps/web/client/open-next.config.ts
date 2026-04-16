import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// OpenNext config for deploying this Next.js app to Cloudflare Workers.
// See: https://opennext.js.org/cloudflare
export default defineCloudflareConfig({
    // Once you create a KV namespace for the Next.js cache and bind it
    // as NEXT_CACHE_WORKERS_KV in wrangler.jsonc, uncomment this:
    //
    // incrementalCache: async () => {
    //     const { default: kvIncrementalCache } = await import(
    //         '@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache'
    //     );
    //     return kvIncrementalCache;
    // },
});
