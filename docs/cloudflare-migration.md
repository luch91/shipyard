# Cloudflare migration runbook

## Current state

- Branch: `migration/cloudflare`
- Adapter: vinext on Cloudflare Workers
- Staging Worker: `shipyard-staging`
- Staging URL: <https://shipyard-staging.judithorluchee.workers.dev>
- Production DNS and traffic: unchanged; approval is required before cutover
- Production Worker: not deployed while the Supabase dependency is unresolved

## Architecture and dependency inventory

| Capability | Existing dependency | Cloudflare migration treatment |
| --- | --- | --- |
| Web application and API routes | Next.js | Next.js 16 + React 19 compiled by vinext for Workers |
| Database, registry, analytics | Supabase | External service retained; URL, anon key, and service-role key are Worker secrets |
| Rate limiting | Upstash Redis | External service retained; REST URL and token are Worker secrets |
| AI generation | OpenRouter | External service retained; API key is a Worker secret |
| Contract operations | GenLayer SDK/RPC | Existing browser and server integration retained |
| Wallet auth | WalletConnect, SIWE | Public project ID is baked at build time; session secret remains runtime-only |
| Admin auth | Wallet allowlist/password | Existing values retained as Worker secrets |
| Daily analytics | Vercel Cron | Cloudflare Cron Trigger at `10 0 * * *`; staging has no trigger |
| Host routing | Vercel domains/middleware | Worker middleware supports apex and `skills` host routing |

## Configuration boundaries

Build-time public configuration must be present before `npm run build:vinext`:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `NEXT_PUBLIC_DEFAULT_AI_MODEL` (optional; the application default is used when absent)

Runtime secrets are installed with `wrangler secret put` and must never be committed. The required names are:

- `SESSION_SECRET`, `ANALYTICS_SALT`, `CRON_SECRET`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `OPENROUTER_API_KEY`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `ADMIN_PASSWORD`, `ADMIN_WALLETS`

`SUPABASE_DB_URL` and `VERCEL_OIDC_TOKEN` are not required by the Worker. Preserve the existing `SESSION_SECRET` and `ANALYTICS_SALT` during production provisioning to avoid invalidating sessions or changing analytics pseudonyms.

## Deployment

```sh
npm ci
npm run lint
npm test
npm run build
npm run build:vinext
npx wrangler deploy --dry-run --config dist/server/wrangler.json
npx wrangler deploy --config dist/server/wrangler.json
```

The generated Wrangler configuration in `dist/server/wrangler.json` is the deployable artifact. Staging is configured without Cron Triggers. Production contains one daily trigger and must not coexist with the Vercel schedule after cutover.

## Cutover checklist

1. Resolve the Supabase project access issue and install verified production bindings.
2. Rebuild with verified public variables and deploy a production Worker without custom routes.
3. Validate all database-backed, wallet, GenLayer, admin, AI, analytics, and handoff workflows on staging.
4. Record current DNS records, including apex, `www`, `skills`, MX, TXT, CAA, and any verification records.
5. Obtain explicit owner approval for the DNS/nameserver/traffic change.
6. Attach only `genshipyard.com/*` and `skills.genshipyard.com/*` to the production Worker. Preserve every unrelated DNS record.
7. Disable the Vercel analytics schedule before enabling the production Worker trigger, so the rollup runs once per interval.
8. Run post-cutover smoke tests and inspect Worker error logs.

## Rollback

Keep the last Vercel deployment and its domain configuration intact until production acceptance. If cutover validation fails:

1. Remove or disable the two Cloudflare Worker routes/custom domains.
2. Restore the recorded apex and `skills` records (or restore Vercel nameserver delegation if nameservers were changed).
3. Confirm `genshipyard.com` and `skills.genshipyard.com` resolve to the known-good Vercel target.
4. Disable the Cloudflare production Cron Trigger before re-enabling the Vercel schedule.
5. Purge only affected Cloudflare cache entries and rerun smoke tests.

DNS TTLs should be lowered before the approved cutover and restored afterward. No database rollback is required because this migration does not change the Supabase schema or data.

## Known blockers and risks

- The configured Shipyard Supabase hostname currently returns NXDOMAIN, and the authenticated Supabase account does not list that project. Database-backed APIs cannot pass until access to the correct project and its current credentials is restored.
- Vercel CLI authentication is not authorized in the current session. Project metadata is available from the repository link, but the authoritative Vercel environment and deployment history could not be exported or compared.
- Actual wallet signatures and state-changing GenLayer deployments require an interactive funded wallet and must be completed during acceptance testing.
- A transitive wallet dependency (`valtio` via `use-sync-external-store`) declares React support only through React 18. Tests/build pass on React 19, but wallet acceptance testing remains required.
- The dependency audit currently reports moderate/high advisories but no critical advisories; the existing CI policy continues to gate critical findings.
