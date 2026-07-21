import { describe, it, expect } from 'vitest'
import { computeBuilderActivity, type ActivityEvent } from '@/lib/builders/activity'

// These three numbers are shown publicly on /builders/[wallet] as a reputation
// signal, so an over-count is not a cosmetic bug — a builder could inflate their
// own profile by forking themselves, or by forking one contract repeatedly.

const ME = 'hash-me'
const OTHER = 'hash-other'
const THIRD = 'hash-third'

function fork(address: string, walletHash: string | null): ActivityEvent {
  return { contract_address: address, wallet_hash: walletHash }
}

function base(overrides: Partial<Parameters<typeof computeBuilderActivity>[0]> = {}) {
  return computeBuilderActivity({
    attributedAddresses: [],
    deployEvents: [],
    forksMadeEvents: [],
    forkEvents: [],
    walletHash: ME,
    ...overrides,
  })
}

describe('contractsDeployed', () => {
  it('unions attributed contracts with deploy events', () => {
    const result = base({
      attributedAddresses: ['0xAAA'],
      deployEvents: [{ contract_address: '0xBBB' }],
    })
    expect(result.contractsDeployed).toBe(2)
  })

  it('counts one contract once regardless of address casing', () => {
    // The contracts table and the event log capture addresses differently; the
    // same contract appearing in both must not count twice.
    const result = base({
      attributedAddresses: ['0xAbCdEf'],
      deployEvents: [{ contract_address: '0xabcdef' }, { contract_address: '0xABCDEF' }],
    })
    expect(result.contractsDeployed).toBe(1)
  })

  it('ignores events with a missing or non-string address', () => {
    const result = base({
      deployEvents: [
        { contract_address: '0xAAA' },
        { contract_address: null },
        { contract_address: '' },
        {},
      ],
    })
    expect(result.contractsDeployed).toBe(1)
  })
})

describe('forksMade', () => {
  it('counts distinct source contracts, not fork actions', () => {
    const result = base({
      forksMadeEvents: [fork('0xAAA', ME), fork('0xAAA', ME), fork('0xBBB', ME)],
    })
    expect(result.forksMade).toBe(2)
  })
})

describe('forksReceived', () => {
  const mine = { attributedAddresses: ['0xMINE'] }

  it('counts another wallet forking my contract', () => {
    expect(base({ ...mine, forkEvents: [fork('0xMINE', OTHER)] }).forksReceived).toBe(1)
  })

  it('excludes self-forks', () => {
    // Forking your own contract must not inflate your reputation.
    expect(base({ ...mine, forkEvents: [fork('0xMINE', ME)] }).forksReceived).toBe(0)
  })

  it('counts one forker forking the same contract repeatedly only once', () => {
    const result = base({
      ...mine,
      forkEvents: [fork('0xMINE', OTHER), fork('0xMINE', OTHER), fork('0xMINE', OTHER)],
    })
    expect(result.forksReceived).toBe(1)
  })

  it('counts distinct forkers of the same contract separately', () => {
    const result = base({
      ...mine,
      forkEvents: [fork('0xMINE', OTHER), fork('0xMINE', THIRD)],
    })
    expect(result.forksReceived).toBe(2)
  })

  it('counts one forker taking two of my contracts separately', () => {
    const result = base({
      attributedAddresses: ['0xONE', '0xTWO'],
      forkEvents: [fork('0xONE', OTHER), fork('0xTWO', OTHER)],
    })
    expect(result.forksReceived).toBe(2)
  })

  it('ignores forks of contracts I did not deploy', () => {
    expect(base({ ...mine, forkEvents: [fork('0xSOMEONE-ELSE', OTHER)] }).forksReceived).toBe(0)
  })

  it('matches my contracts case-insensitively', () => {
    // The whole reason matching happens in JS rather than a DB `.in` filter.
    const result = base({
      attributedAddresses: ['0xAbCdEf'],
      forkEvents: [fork('0xABCDEF', OTHER)],
    })
    expect(result.forksReceived).toBe(1)
  })

  it('collapses anonymous forkers of one contract into a single count', () => {
    // Documented conservative behaviour: events without a wallet_hash share the
    // 'anon' key, so they under-count rather than letting unattributed events
    // inflate the number.
    const result = base({ ...mine, forkEvents: [fork('0xMINE', null), fork('0xMINE', null)] })
    expect(result.forksReceived).toBe(1)
  })

  it('separates an anonymous forker from an identified one', () => {
    const result = base({ ...mine, forkEvents: [fork('0xMINE', null), fork('0xMINE', OTHER)] })
    expect(result.forksReceived).toBe(2)
  })
})

describe('without a wallet hash (ANALYTICS_SALT unset)', () => {
  it('falls back to the contracts table and reports no fork activity', () => {
    // Nothing in the event log can be attributed, so events must be ignored
    // entirely rather than counted against the wrong builder.
    const result = base({
      walletHash: null,
      attributedAddresses: ['0xMINE'],
      deployEvents: [{ contract_address: '0xOTHER' }],
      forksMadeEvents: [fork('0xANY', ME)],
      forkEvents: [fork('0xMINE', OTHER)],
    })
    expect(result).toEqual({ contractsDeployed: 1, forksMade: 0, forksReceived: 0 })
  })
})
