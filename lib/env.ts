// Startup environment diagnostic. Runs once at server boot via instrumentation.ts.
//
// It does NOT throw. Supabase, Redis, OpenRouter, analytics, CRON, and
// WalletConnect are all optional by design — the app degrades gracefully without
// them (see lib/redis.ts, lib/supabase/server.ts, etc.), so a hard boot failure
// would be wrong. Instead we log a one-time summary so a misconfigured deploy is
// obvious in the server logs rather than surfacing later as a runtime 500 or a
// silently disabled feature.

interface EnvVar {
  name: string
  required: boolean
  note: string
}

const ENV_VARS: EnvVar[] = [
  { name: 'SESSION_SECRET', required: true, note: 'SIWE sign-in fails at request time without it' },
  { name: 'SUPABASE_URL', required: false, note: 'registry / analytics / verify degrade to empty' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', required: false, note: 'registry / analytics / verify degrade to empty' },
  { name: 'UPSTASH_REDIS_REST_URL', required: false, note: 'rate limits fall back to per-instance memory; handoff relay disabled' },
  { name: 'UPSTASH_REDIS_REST_TOKEN', required: false, note: 'rate limits fall back to per-instance memory; handoff relay disabled' },
  { name: 'OPENROUTER_API_KEY', required: false, note: 'AI contract generation returns 500' },
  { name: 'ANALYTICS_SALT', required: false, note: 'wallet hashing fails closed — events store no wallet attribution' },
  { name: 'CRON_SECRET', required: false, note: 'analytics rollup cron is unavailable (401)' },
  { name: 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID', required: false, note: 'WalletConnect (mobile / QR) disabled; injected wallets still work' },
]

export function checkEnv(): void {
  const missingRequired: string[] = []
  const missingOptional: string[] = []

  for (const v of ENV_VARS) {
    if (!process.env[v.name]?.trim()) {
      ;(v.required ? missingRequired : missingOptional).push(`${v.name} — ${v.note}`)
    }
  }

  if (missingRequired.length) {
    console.error(
      '[Shipyard] MISSING REQUIRED environment variables:\n  - ' + missingRequired.join('\n  - ')
    )
  }
  if (missingOptional.length) {
    console.warn(
      '[Shipyard] Optional environment variables not set (features degraded):\n  - ' +
        missingOptional.join('\n  - ')
    )
  }
  if (!missingRequired.length && !missingOptional.length) {
    console.log('[Shipyard] Environment: all known variables present.')
  }
}
