# Cloudflare production stabilization

## Window

- Start: 2026-10-17 14:46 UTC
- First scheduled execution: 2026-10-18 00:10 UTC
- 24-hour checkpoint: 2026-10-18 14:46 UTC
- 72-hour completion: 2026-10-20 14:46 UTC
- Runtime under observation: commit `1219384519df94f670de3ad388cac2c4924c4180`, artifact SHA-256 `FFE07C816CD36B1E2442441BEFF5C20BD6F9BAE9AC14C949C7C6CF25C1EB8209`, Worker version `c8a82433-ef57-4c3a-b495-d769296f960b`

## Opening baseline — 2026-10-17

- Public authority: Cloudflare and Google resolvers both returned `garret.ns.cloudflare.com` and `mina.ns.cloudflare.com`.
- HTTPS: apex 200, `www` 308 to apex, and `skills` 200; TLS verification passed for all three.
- Certificates: Google Trust Services WE1, valid from 2026-10-17 through 2027-01-15. The active certificates cover the requested exact hostnames.
- Availability sample: 10/10 apex requests succeeded; min 799.1 ms, median 1,630.6 ms, p95 3,465.5 ms, max 4,991.2 ms from the Lagos monitoring host; zero TLS failures.
- Application checks inherited from cutover: 88/88 tests; real SIWE success and replay rejection; authenticated Supabase admin analytics; real OpenRouter generation; Redis-backed nonce claiming; main APIs, metadata and skills routing passed.
- Analytics: 3,770 raw events across 96 active dates. The 95 historical active dates remain rolled up with no duplicates; 2026-10-17 is the new unrolled current date and must be processed by the first production schedule.
- Scheduling: one Cloudflare Cron at `10 0 * * *`. Vercel retains its definition but its endpoint returns `402 DEPLOYMENT_DISABLED`; no matching Vercel execution appeared in the preceding seven-day log window.
- Opening incident: one local DNS lookup for `studio.genlayer.com` failed after a successful StudioNet RPC check during cutover. An independent Cloudflare DNS query returned both current addresses and a pinned RPC retry returned HTTP 200 with a block number in 1.83 seconds. Classified as a transient local-resolver failure; no application change was made.
- DNSSEC intentionally remains disabled pending separate review.
- Continuous read-only sampler: started 2026-10-17 14:49:50 UTC as process 43568, writing five-minute JSONL samples to `C:\Users\user\ShipyardMigrationBackups\shipyard-stabilization-health.jsonl` through the 72-hour endpoint. Its first sample recorded all three expected HTTP statuses, zero TLS failures, Cloudflare authority, and a healthy StudioNet block-number response. The PID is operational evidence only and may change if the host restarts; the JSONL record is authoritative.

## First-Cron report

Pending the 2026-10-18 00:10 UTC execution. Required evidence: scheduled invocation timestamp and outcome, 2026-10-17 raw-event count, exactly one matching rollup, recomputed aggregate parity, idempotency evidence, unchanged historical rows, and no competing Vercel execution.

## 24-hour report

Pending 2026-10-18 14:46 UTC.

## 72-hour report

Pending 2026-10-20 14:46 UTC.

## Incident log

| Time (UTC) | Severity | Observation | Root cause | Action | Status |
| --- | --- | --- | --- | --- | --- |
| 2026-10-17 14:48 | Informational | One monitoring-host lookup for `studio.genlayer.com` failed | Transient local-resolver failure; independent DNS and pinned RPC succeeded | No production mutation | Resolved |
