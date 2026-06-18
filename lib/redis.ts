import { Redis } from '@upstash/redis'

// Server-side Upstash Redis client (REST-based). Returns null when not configured
// so callers can degrade gracefully — the app must keep working without Redis
// (e.g. local dev). Never import into client code: it reads non-public env vars.

let cached: Redis | null = null

export function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  if (!cached) cached = new Redis({ url, token })
  return cached
}

export function isRedisConfigured(): boolean {
  return !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN
}
