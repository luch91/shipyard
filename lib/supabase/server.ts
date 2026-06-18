import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client using the service-role key.
 *
 * ⚠️ SERVER ONLY. The service-role key bypasses Row Level Security. Never import
 * this module into a Client Component or anything that ends up in the browser
 * bundle. It reads SUPABASE_SERVICE_ROLE_KEY (no NEXT_PUBLIC_ prefix), which Next
 * strips from client bundles — so even an accidental client import has no key and
 * will throw rather than leak it. Use only in Route Handlers / server code.
 */

let cached: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached

  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      '[Shipyard] Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.'
    )
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}

/** True when Supabase env vars are present, so callers can degrade gracefully. */
export function isSupabaseConfigured(): boolean {
  return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY
}
