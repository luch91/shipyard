# Cloudflare migration runbook

## Current state

- Branch: `migration/cloudflare`
- Adapter: vinext on Cloudflare Workers
- Staging Worker: `shipyard-staging`
- Staging URL: <https://shipyard-staging.judithorluchee.workers.dev>
- Production DNS and traffic: unchanged; approval is required before cutover
- Production Worker: `shipyard-production`, prepared at <https://shipyard-production.judithorluchee.workers.dev> with no custom domains or Cron Trigger
- Production Worker runtime status: active; its `workers.dev` hostname deliberately redirects to the canonical production domain

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

The generated Wrangler configuration in `dist/server/wrangler.json` is the deployable artifact. Staging and the pre-cutover production Worker are configured without Cron Triggers. At approved cutover, disable the Vercel schedule first, set the production environment trigger to `10 0 * * *`, rebuild with `CLOUDFLARE_ENV=production`, and deploy. This ordering prevents overlapping schedulers.

## Cutover checklist

1. Resolve the Supabase project access issue and install verified production bindings.
2. Rebuild with verified public variables and deploy a production Worker without custom routes.
3. Validate all database-backed, wallet, GenLayer, admin, AI, analytics, and handoff workflows on staging.
4. Record current DNS records, including apex, `www`, `skills`, MX, TXT, CAA, and any verification records.
5. Obtain explicit owner approval for the DNS/nameserver/traffic change.
6. Attach only `genshipyard.com/*` and `skills.genshipyard.com/*` to the production Worker. Preserve every unrelated DNS record.
7. Disable the Vercel analytics schedule before adding and deploying the production Worker trigger `10 0 * * *`, so the rollup runs once per interval.
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

- The restored Shipyard Supabase service is reachable and database-backed staging APIs pass. A complete pre-backfill export of both analytics tables is stored outside the repository and has been verified by row count, unique primary keys, JSON parsing, and SHA-256.
- Vercel CLI access is restored and confirms the production aliases. Runtime logs show the last Vercel Cron requests on 2026-10-08 through 2026-10-10; each stopped at middleware with HTTP 308, and no later invocation was found. Cloudflare production has no Cron Trigger.
- Real SIWE authentication (including nonce replay rejection) and real Studionet deploy/read/write/finalisation workflows passed on staging.
- A transitive wallet dependency (`valtio` via `use-sync-external-store`) declares React support only through React 18. Tests/build pass on React 19, but wallet acceptance testing remains required.
- The dependency audit currently reports moderate/high advisories but no critical advisories; the existing CI policy continues to gate critical findings.
- The current Vercel-served `genshipyard.com` and `skills.genshipyard.com` return `402 DEPLOYMENT_DISABLED`, despite the underlying deployment being recorded as READY. The isolated Cloudflare production Worker itself is active and returns the configured canonical-host redirect. Full application behavior is verified on the equivalent staging Worker until custom domains are attached.
- The Cloudflare account has no `genshipyard.com` zone. The current Wrangler OAuth grant has Zone Read but not Zone Edit/DNS Edit, so a pending full zone, assigned nameservers, DNS records, Custom Domains, and certificates cannot yet be prepared. Production cutover remains blocked until zone-management access is restored.

## Cutover readiness audit — 2026-10-17

### Frozen runtime candidate

- Git commit: `1219384519df94f670de3ad388cac2c4924c4180`
- Recorded deployable artifact SHA-256: `FFE07C816CD36B1E2442441BEFF5C20BD6F9BAE9AC14C949C7C6CF25C1EB8209`
- Active production Worker version: `c8a82433-ef57-4c3a-b495-d769296f960b`
- Code rollback version: `95b7fd37-a54b-4e34-9fe2-47c0f2c05102`
- Both production versions identify the frozen Git commit in their annotations and have the same Cloudflare script ETag, `39f608b167ec52849f553c6d3c8b1061569099e684ae1e402137d6f3792f5d4a`.
- The active version has `fetch` and `scheduled` handlers, production-compatible bindings, no attached Shipyard Custom Domain, and no active Cron Trigger.

### Analytics recovery evidence

- Before backfill: 3,758 raw rows, 95 distinct active UTC dates, first event `2026-06-18T08:59:58.504893Z`, last event `2026-10-08T22:37:03.866317Z`, and one zero-event rollup dated 2026-10-16. The earlier estimate of 98 active dates was incorrect.
- Backup: `C:\Users\user\ShipyardMigrationBackups\shipyard-analytics-before-rollup-2026-10-17.json`, 1,847,485 bytes, SHA-256 `CAABEFF2536688DED2622C8D68CF2C9156BB925EF92744C84C1897BC8DDCE510`.
- The export retains every column and primary key from `analytics_events` and `analytics_daily_rollups`; it can be restored with service-role upserts keyed by `id` and `date` respectively.
- Canary: 2026-06-18 processed 32 events; an immediate replay kept exactly one rollup row and returned the same aggregate.
- Backfill: all 95 active dates were invoked sequentially and independently compared with aggregates recomputed from the export. API errors: 0. Data discrepancies: 0. Service retries: 0.
- After backfill: 3,758 raw rows; the canonical raw-table SHA-256 remained `51A9E17E2B118D025F7E87E821F90C96531E74E18ED030FCF70DA04D64C57E4B`. There are 95 active-date rollups plus the existing 2026-10-16 zero-event rollup, and no duplicate rollup dates.
- There are no raw events from 2026-10-09 through 2026-10-17. No activity was fabricated for those dates.

### DNS preparation

- Current authority: `ns1.vercel-dns.com` and `ns2.vercel-dns.com`; registrar: Namecheap.
- Registry RDAP reports `delegationSigned: false`, and a DNS-over-HTTPS DS query returns no DS answer. DNSSEC is currently disabled at the registrar.
- Current records: apex ALIAS to `b5769d2283d37c07.vercel-dns-017.com`, wildcard ALIAS to `cname.vercel-dns-016.com`, and apex CAA entries for `pki.goog`, `sectigo.com`, and `letsencrypt.org`. No MX or TXT records were found.
- Only `genshipyard.com`, `www.genshipyard.com`, and `skills.genshipyard.com` are assigned to the Vercel project; no continuing wildcard requirement was found.
- Proposed pending Cloudflare zone: full setup with automatic import disabled. Recreate the three CAA records and allow Cloudflare to add any CAA authorization needed by its selected CA. Do not copy the Vercel ALIAS records as production destinations. Do not create wildcard routing.
- Intended mappings: all three exact hostnames become Custom Domains of `shipyard-production`. Custom Domains require an active Cloudflare zone and create their own DNS records and certificates, so attachment and certificate validation must wait for an approved nameserver cutover.

### Proposed cutover sequence (not yet authorised for execution)

1. Grant Zone Edit and DNS Edit access, create the full `genshipyard.com` zone with automatic import disabled, record its zone ID and assigned nameservers, and add the preserved CAA records.
2. Re-query authoritative Vercel DNS immediately before cutover and reconcile any new MX, TXT, CAA, verification, or unrelated records into the pending Cloudflare zone.
3. Freeze commit `1219384519df94f670de3ad388cac2c4924c4180`; record Worker versions, bindings, analytics counts/checksums, Vercel records, registrar delegation, and rollback commands.
4. Obtain explicit owner approval for the traffic change.
5. At Namecheap, confirm DNSSEC remains disabled, then replace only the two Vercel nameservers with the exact Cloudflare-assigned pair. Expect resolver caches to continue using Vercel for up to the existing 86,400-second NS TTL; a nameserver rollback has the same propagation limitation.
6. Wait for Cloudflare zone activation. If it does not activate, verify exact delegation and absence of DS records; revert nameservers if the cutover window expires.
7. Attach exact Custom Domains for apex, `www`, and `skills` to `shipyard-production`. Verify Cloudflare-created DNS records, certificate issuance, and HTTPS for every hostname. Do not continue if any hostname has SERVFAIL, certificate errors, or routes outside the intended Worker.
8. Run production smoke tests for pages/metadata, Supabase APIs, SIWE/replay rejection, GenLayer read/write/deploy, OpenRouter, Upstash rate limiting, admin access, analytics, and skills routing. Inspect Worker logs and error rates.
9. Confirm Vercel Cron is disabled or otherwise not invoking. Only then configure exactly one Cloudflare trigger, `10 0 * * *`, and verify its first protected in-process rollup. Never run both schedulers concurrently.
10. After an agreed observation window, re-enable DNSSEC in Cloudflare and publish Cloudflare's new DS record at Namecheap. Retain Vercel until production acceptance.

### Recovery separation

- Worker code rollback: `npx wrangler rollback 95b7fd37-a54b-4e34-9fe2-47c0f2c05102 --env production --yes`. This changes code only; bindings, domains, DNS, and schedules must be checked separately.
- DNS/traffic rollback: remove or disable the Shipyard Custom Domains, restore the captured Vercel DNS records if Cloudflare remains authoritative, or restore Vercel nameservers at Namecheap. Propagation is not instantaneous.
- Registrar rollback: restore `ns1.vercel-dns.com` and `ns2.vercel-dns.com`; verify the parent delegation and authoritative answers from multiple resolvers.
- Scheduler rollback: disable Cloudflare Cron before restoring Vercel scheduling. A Worker code rollback does not change Cron Triggers.
- Vercel currently returns `DEPLOYMENT_DISABLED` and is therefore not an immediately functional application rollback target; the tested Cloudflare Worker version is the primary code fallback.
