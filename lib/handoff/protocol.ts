import type { NetworkId } from '@/types'

// ─── Handoff protocol ──────────────────────────────────────────────────────────
// Shared by the /handoff page (browser) and /api/handoff/result (server). Pure TS —
// no client-only imports — so both sides agree on the wire format. See SPEC.md §12.
//
// The handoff lets a CLI agent trigger a real wallet popup (deploy/write/verify) and
// resume with the outcome. Only PUBLIC outcomes (tx hash, contract address, booleans)
// ever cross this boundary — never a key, seed, or signature.

export const HANDOFF_VERSION = 1

export type HandoffAction = 'deploy' | 'write' | 'verify'

export type HandoffErrorCode =
  | 'user_rejected'
  | 'wrong_network'
  | 'insufficient_funds'
  | 'validation'
  | 'tx_failed'
  | 'not_authenticated'
  | 'internal'

export interface DeployResultPayload {
  contractAddress: string
  txHash: string
  network: NetworkId
  contractName?: string
  // true when the tx was submitted but finalization couldn't be confirmed in time
  // (mirrors lib/genlayer/deploy.ts) — the CLI still has the hash.
  pending?: boolean
}

export interface WriteResultPayload {
  txHash: string
  network: NetworkId
}

export interface VerifyResultPayload {
  verified: boolean
  attributed: boolean
}

export type HandoffResult = DeployResultPayload | WriteResultPayload | VerifyResultPayload

export interface HandoffEnvelope {
  v: number
  state: string
  action: HandoffAction
  ok: boolean
  result?: HandoffResult
  error?: { code: HandoffErrorCode; message: string }
}

// ─── State token bounds (defense against junk keys) ─────────────────────────────
// CLI generates ≥128-bit base64url (~22 chars). Accept a generous range.
const STATE_MIN = 16
const STATE_MAX = 512

export function isValidState(state: unknown): state is string {
  return typeof state === 'string' && state.length >= STATE_MIN && state.length <= STATE_MAX
}

// ─── base64url envelope encoding (UTF-8 safe, works server + browser) ───────────

export function encodeEnvelope(env: HandoffEnvelope): string {
  const json = JSON.stringify(env)
  const b64 =
    typeof Buffer !== 'undefined'
      ? Buffer.from(json, 'utf-8').toString('base64')
      : btoa(String.fromCharCode(...new TextEncoder().encode(json)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeEnvelope(payload: string): HandoffEnvelope | null {
  try {
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    let json: string
    if (typeof Buffer !== 'undefined') {
      json = Buffer.from(b64, 'base64').toString('utf-8')
    } else {
      const bin = atob(b64)
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
      json = new TextDecoder().decode(bytes)
    }
    const parsed = JSON.parse(json) as HandoffEnvelope
    if (typeof parsed !== 'object' || parsed === null) return null
    return parsed
  } catch {
    return null
  }
}

// ─── Callback validation (SECURITY — SPEC.md §12.4 #2) ──────────────────────────
// Only loopback callbacks are allowed. This blocks `?callback=https://evil.com` from
// turning a signed-in user's browser into an open-redirect / exfil vector.

export function isLoopbackCallback(raw: string): boolean {
  let u: URL
  try {
    u = new URL(raw)
  } catch {
    return false
  }
  if (u.protocol !== 'http:') return false
  const host = u.hostname
  return host === '127.0.0.1' || host === '::1' || host === '[::1]' || host === 'localhost'
}
