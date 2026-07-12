import { describe, it, expect } from 'vitest'
import {
  isLoopbackCallback,
  isValidState,
  encodeEnvelope,
  decodeEnvelope,
  type HandoffEnvelope,
} from '@/lib/handoff/protocol'

// These functions are the security boundary of the CLI wallet handoff (SPEC §12).
// A regression here could turn a signed-in user's browser into an exfil vector or
// break replay protection, so they are the highest-value things to lock down.

describe('isLoopbackCallback', () => {
  it('accepts http loopback hosts', () => {
    expect(isLoopbackCallback('http://127.0.0.1')).toBe(true)
    expect(isLoopbackCallback('http://127.0.0.1:8787/cb')).toBe(true)
    expect(isLoopbackCallback('http://localhost')).toBe(true)
    expect(isLoopbackCallback('http://localhost:3000/callback')).toBe(true)
    expect(isLoopbackCallback('http://[::1]')).toBe(true)
    expect(isLoopbackCallback('http://[::1]:9000/x')).toBe(true)
  })

  it('rejects non-loopback and non-http callbacks (open-redirect / exfil guard)', () => {
    expect(isLoopbackCallback('https://evil.com')).toBe(false)
    expect(isLoopbackCallback('http://evil.com')).toBe(false)
    // A hostile host that merely embeds a loopback-looking label must not pass.
    expect(isLoopbackCallback('http://127.0.0.1.evil.com')).toBe(false)
    expect(isLoopbackCallback('http://localhost.evil.com')).toBe(false)
    expect(isLoopbackCallback('http://localhostx')).toBe(false)
    // https to a loopback host is still rejected — the transport is http-only.
    expect(isLoopbackCallback('https://127.0.0.1')).toBe(false)
    expect(isLoopbackCallback('javascript:alert(1)')).toBe(false)
    expect(isLoopbackCallback('not a url')).toBe(false)
    expect(isLoopbackCallback('')).toBe(false)
  })
})

describe('isValidState', () => {
  it('enforces the length bounds [16, 512]', () => {
    expect(isValidState('a'.repeat(15))).toBe(false) // just under min
    expect(isValidState('a'.repeat(16))).toBe(true) // min
    expect(isValidState('a'.repeat(512))).toBe(true) // max
    expect(isValidState('a'.repeat(513))).toBe(false) // just over max
  })

  it('rejects non-strings', () => {
    expect(isValidState(undefined)).toBe(false)
    expect(isValidState(null)).toBe(false)
    expect(isValidState(12345678901234567890)).toBe(false)
    expect(isValidState({ length: 40 })).toBe(false)
  })
})

describe('encodeEnvelope / decodeEnvelope', () => {
  const envelope: HandoffEnvelope = {
    v: 1,
    state: 'a'.repeat(22),
    action: 'deploy',
    ok: true,
    result: {
      contractAddress: '0x1111111111111111111111111111111111111111',
      txHash: '0x2222222222222222222222222222222222222222222222222222222222222222',
      network: 'testnet-bradbury',
    },
  }

  it('round-trips an envelope losslessly', () => {
    const decoded = decodeEnvelope(encodeEnvelope(envelope))
    expect(decoded).toEqual(envelope)
  })

  it('produces URL-safe output (no +, /, or = padding)', () => {
    const encoded = encodeEnvelope(envelope)
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('returns null for tampered or malformed payloads', () => {
    expect(decodeEnvelope('!!!not-base64!!!')).toBeNull()
    expect(decodeEnvelope('')).toBeNull()
    // valid base64url of a non-JSON string
    expect(decodeEnvelope(encodeEnvelopeRaw('this is not json'))).toBeNull()
    // valid JSON that is not an object (a bare number) must be rejected
    expect(decodeEnvelope(encodeEnvelopeRaw('123'))).toBeNull()
  })
})

// Helper: base64url-encode an arbitrary string the same way encodeEnvelope does,
// so we can craft non-envelope payloads for the tamper cases.
function encodeEnvelopeRaw(raw: string): string {
  return Buffer.from(raw, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
