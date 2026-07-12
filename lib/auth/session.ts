import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// SIWE session: a signed JWT stored in an httpOnly cookie. The service that
// issues/reads it lives entirely server-side; the client never sees the secret.

export const SESSION_COOKIE = 'shipyard_session'
export const ADMIN_SESSION_COOKIE = 'shipyard_admin_session'
export const NONCE_COOKIE = 'shipyard_siwe_nonce'

const ISSUER = 'shipyard'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('[Shipyard] SESSION_SECRET is not set — SIWE auth is unavailable.')
  }
  return new TextEncoder().encode(secret)
}

export interface SessionPayload {
  address: string
  chainId?: number
  // True for the shared-password admin session (no wallet). Wallet sessions omit it.
  admin?: boolean
}

export async function createSessionToken(address: string, chainId?: number): Promise<string> {
  return new SignJWT({ address: address.toLowerCase(), chainId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setSubject(address.toLowerCase())
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getKey())
}

// Shared-password admin session — no wallet address, carries an `admin` claim.
// Same signing key, issuer, and lifetime as a wallet session.
export async function createAdminSessionToken(): Promise<string> {
  return new SignJWT({ admin: true, address: '' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuer(ISSUER)
    .setSubject('admin')
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getKey())
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getKey(), { issuer: ISSUER })
    const address = typeof payload.address === 'string' ? payload.address : ''
    const admin = payload.admin === true
    if (!address && !admin) return null
    return {
      address,
      admin,
      chainId: typeof payload.chainId === 'number' ? payload.chainId : undefined,
    }
  } catch {
    return null
  }
}

// Read the current session (server-side). Returns the authenticated wallet or null.
// Use this in Route Handlers to authorize writes against the signed-in wallet.
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifySessionToken(token)
}

// Password-admin authentication is intentionally kept in a separate cookie so
// entering or leaving /admin never replaces the user's wallet SIWE session.
export async function getPasswordAdminSession(): Promise<SessionPayload | null> {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value
  if (!token) return null
  const session = await verifySessionToken(token)
  return session?.admin === true ? session : null
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: MAX_AGE_SECONDS,
}

export const nonceCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 10, // 10 minutes
}
