// Next.js instrumentation hook — register() runs once when the server starts.
// Used only for a boot-time env-configuration summary (see lib/env.ts). Guarded to
// the Node.js runtime so it doesn't run in the Edge runtime.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { checkEnv } = await import('@/lib/env')
    checkEnv()
  }
}
