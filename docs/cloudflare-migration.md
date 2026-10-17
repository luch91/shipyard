# Cloudflare production runbook

## Current state

- Branch: `migration/cloudflare`
- Adapter: vinext on Cloudflare Workers
- Staging Worker: `shipyard-staging`
- Staging URL: <https://shipyard-staging.judithorluchee.workers.dev>
- Production Worker: `shipyard-production`
- Production hostnames: <https://genshipyard.com>, <https://www.genshipyard.com>, and <https://skills.genshipyard.com>
- Cloudflare zone: `feb967bcfa5f2e09b0d2713db2102028`, delegated to `garret.ns.cloudflare.com` and `mina.ns.cloudflare.com`
- Production Worker version: `c8a82433-ef57-4c3a-b495-d769296f960b`
- Frozen runtime commit: `1219384519df94f670de3ad388cac2c4924c4180`
- Frozen artifact SHA-256: `FFE07C816CD36B1E2442441BEFF5C20BD6F9BAE9AC14C949C7C6CF25C1EB8209`
- Production Cron Trigger: `10 0 * * *`; staging has no schedule
- Vercel is retained as migration evidence and a configuration recovery source, but currently returns `402 DEPLOYMENT_DISABLED` and is not a live traffic fallback

## Post-migration operations

For availability checks, test all three public hostnames over HTTPS and confirm the apex and `skills` return 200 while `www` returns the intentional 308 redirect to the apex. Verify public NS answers through at least two independent recursive resolvers during propagation.

Use Workers Observability for retained production errors and traces. Keep checks bounded to `shipyard-production`; do not enable broad log exports or change sampling during routine monitoring. Use `npx wrangler deployments status --name shipyard-production` to confirm the active version and `npx wrangler secret list --name shipyard-production` to verify secret names without retrieving values.

The daily schedule runs at 00:10 UTC and rolls up the previous UTC date. After each run, verify exactly one row for that date, recompute the authoritative raw-event count for the date, and check the scheduled invocation logs. A repeated protected rollup is idempotent because the handler upserts on the unique `date`, but routine monitoring must not invoke it manually.

Vercel still stores the former `10 0 * * *` Cron definition. It is operationally inactive while its deployment returns `DEPLOYMENT_DISABLED`. Before restoring or redeploying Vercel, disable either the Vercel or Cloudflare schedule so that only one scheduler can execute.

Do not enable DNSSEC as part of stabilization. Enabling it requires a separate review of Cloudflare DNSSEC status and an intentional DS publication at Namecheap.

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

The generated Wrangler configuration in `dist/server/wrangler.json` is the deployable artifact. Production configuration includes Cron `10 0 * * *`; staging must remain unscheduled. A vinext build can regenerate the deployable configuration, so inspect its trigger list before applying triggers. Never activate Vercel and Cloudflare scheduling simultaneously.

## Production validation checklist

1. Confirm apex and `skills` return 200 and `www` returns the canonical 308 over valid TLS.
2. Confirm Cloudflare remains authoritative and all three Custom Domains still map to `shipyard-production`.
3. Confirm Worker version `c8a82433-ef57-4c3a-b495-d769296f960b` and all 12 secret names.
4. Check bounded Worker errors, request latency, and dependency failures.
5. Exercise SIWE and replay rejection, Supabase reads, Upstash-backed controls, GenLayer RPC, OpenRouter, admin access, metadata, analytics, and skills routing without unnecessary state-changing transactions.
6. Verify one Cloudflare schedule at `10 0 * * *`, its scheduled invocation, and the previous UTC day's rollup.
7. Confirm the Vercel endpoint remains `DEPLOYMENT_DISABLED` and shows no competing Cron execution.
8. Record incidents, evidence, corrective actions, and remaining risks in the stabilization report.

## Rollback

Keep the last Vercel deployment and its domain configuration intact during stabilization. If production validation fails:

1. For an application-code failure, redeploy the frozen artifact or select a tested Worker version. Version `95b7fd37-a54b-4e34-9fe2-47c0f2c05102` has the same script ETag as the active version, so it is not an independent defective-build fallback.
2. Recheck bindings, Custom Domains and the Cron Trigger separately; Worker rollback does not restore connected resources or schedules.
3. For DNS or certificate containment, keep Cloudflare authoritative where possible and repair the affected Custom Domain. Escalate before detaching production hostnames.
4. Before any registrar rollback, disable Cloudflare Cron. Restore `ns1.vercel-dns.com` and `ns2.vercel-dns.com` only with owner approval and only after Vercel is made functional.
5. Expect nameserver rollback to follow DNS propagation rather than taking effect immediately. Run complete smoke tests after recovery.

DNS TTLs should be lowered before the approved cutover and restored afterward. No database rollback is required because this migration does not change the Supabase schema or data.

## Historical migration evidence and retained risks

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
