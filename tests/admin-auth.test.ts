import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import { POST as adminLogin } from '@/app/api/admin/login/route'
import { POST as adminLogout } from '@/app/api/admin/logout/route'
import { POST as walletLogout } from '@/app/api/auth/logout/route'
import { isAdminWallet } from '@/lib/auth/admin'
import {
  ADMIN_SESSION_COOKIE,
  SESSION_COOKIE,
  verifySessionToken,
} from '@/lib/auth/session'

const originalAdminPassword = process.env.ADMIN_PASSWORD
const originalAdminWallets = process.env.ADMIN_WALLETS
const originalSessionSecret = process.env.SESSION_SECRET

beforeAll(() => {
  process.env.ADMIN_PASSWORD = 'phase-two-test-password'
  process.env.ADMIN_WALLETS = '0x1111111111111111111111111111111111111111'
  process.env.SESSION_SECRET = 'phase-two-test-session-secret-that-is-long-enough'
})

afterAll(() => {
  if (originalAdminPassword === undefined) delete process.env.ADMIN_PASSWORD
  else process.env.ADMIN_PASSWORD = originalAdminPassword

  if (originalAdminWallets === undefined) delete process.env.ADMIN_WALLETS
  else process.env.ADMIN_WALLETS = originalAdminWallets

  if (originalSessionSecret === undefined) delete process.env.SESSION_SECRET
  else process.env.SESSION_SECRET = originalSessionSecret
})

describe('admin and wallet session isolation', () => {
  it('writes a dedicated admin cookie without replacing the wallet cookie', async () => {
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-real-ip': '203.0.113.201',
      },
      body: JSON.stringify({ password: process.env.ADMIN_PASSWORD }),
    })

    const res = await adminLogin(req)
    const adminCookie = res.cookies.get(ADMIN_SESSION_COOKIE)

    expect(res.status).toBe(200)
    expect(ADMIN_SESSION_COOKIE).not.toBe(SESSION_COOKIE)
    expect(adminCookie?.value).toBeTruthy()
    expect(res.cookies.get(SESSION_COOKIE)).toBeUndefined()
    await expect(verifySessionToken(adminCookie!.value)).resolves.toMatchObject({
      admin: true,
      address: '',
    })
  })

  it('admin logout clears only the admin cookie', async () => {
    const res = await adminLogout()
    const setCookie = res.headers.get('set-cookie') ?? ''

    expect(setCookie).toContain(`${ADMIN_SESSION_COOKIE}=`)
    expect(setCookie).not.toContain(`${SESSION_COOKIE}=`)
  })

  it('wallet logout clears only the wallet cookie', async () => {
    const res = await walletLogout()
    const setCookie = res.headers.get('set-cookie') ?? ''

    expect(setCookie).toContain(`${SESSION_COOKIE}=`)
    expect(setCookie).not.toContain(`${ADMIN_SESSION_COOKIE}=`)
  })

  it('preserves the existing allowlisted-wallet fallback', () => {
    expect(isAdminWallet('0x1111111111111111111111111111111111111111')).toBe(true)
    expect(isAdminWallet('0x2222222222222222222222222222222222222222')).toBe(false)
  })
})
