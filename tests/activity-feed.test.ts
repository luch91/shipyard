import { describe, it, expect } from 'vitest'
import {
  buildActivityFeed,
  type ActivityEventRow,
  type RegistryContract,
} from '@/lib/activity/feed'

// This feed is public and built from analytics data, so the tests that matter most
// are the negative ones: a contract that is not already in the registry must never
// appear, and a wallet must never be attributed unless the registry proved it.

const NOW = '2026-07-21T12:00:00.000Z'
const EARLIER = '2026-07-21T11:00:00.000Z'

const registry: RegistryContract[] = [
  { address: '0xAbCdEf', network: 'testnet-asimov', deployer_wallet: '0xbuilder' },
  { address: '0x111', network: 'studionet', deployer_wallet: null },
]

function ev(overrides: Partial<ActivityEventRow>): ActivityEventRow {
  return {
    event_name: 'deployment_succeeded',
    contract_address: '0xAbCdEf',
    network: 'testnet-asimov',
    metadata: { contract_name: 'Oracle' },
    created_at: NOW,
    ...overrides,
  }
}

describe('privacy gate', () => {
  it('omits contracts that are not in the registry', () => {
    // The registry is what makes a contract publicly discoverable; anything else
    // must stay invisible here.
    const items = buildActivityFeed([ev({ contract_address: '0xNOT-LISTED' })], registry)
    expect(items).toEqual([])
  })

  it('never attributes a builder the registry has not proven', () => {
    const items = buildActivityFeed([ev({ contract_address: '0x111', network: 'studionet' })], registry)
    expect(items).toHaveLength(1)
    expect(items[0].builder).toBeNull()
  })

  it('attributes the proven deployer when the registry has one', () => {
    expect(buildActivityFeed([ev({})], registry)[0].builder).toBe('0xbuilder')
  })
})

describe('event selection', () => {
  it('includes deploys, verifications and forks', () => {
    const items = buildActivityFeed(
      [
        ev({ event_name: 'deployment_succeeded' }),
        ev({ event_name: 'contract_verified' }),
        ev({ event_name: 'contract_forked' }),
      ],
      registry,
    )
    expect(items.map((i) => i.kind)).toEqual(['deployed', 'verified', 'forked'])
  })

  it('ignores unrelated analytics events', () => {
    const noise = ['page_viewed', 'registry_viewed', 'deployment_failed', 'read_method_called']
    const items = buildActivityFeed(noise.map((n) => ev({ event_name: n })), registry)
    expect(items).toEqual([])
  })

  it('drops rows with no address or no timestamp', () => {
    const items = buildActivityFeed(
      [ev({ contract_address: null }), ev({ created_at: null }), ev({})],
      registry,
    )
    expect(items).toHaveLength(1)
  })
})

describe('deduping', () => {
  it('collapses repeats of the same kind to the newest', () => {
    const items = buildActivityFeed(
      [
        ev({ metadata: { contract_name: 'Newest' }, created_at: NOW }),
        ev({ metadata: { contract_name: 'Older' }, created_at: EARLIER }),
      ],
      registry,
    )
    expect(items).toHaveLength(1)
    expect(items[0].contractName).toBe('Newest')
  })

  it('keeps different kinds for the same contract', () => {
    // Deploying then verifying one contract is two genuine pieces of activity.
    const items = buildActivityFeed(
      [ev({ event_name: 'deployment_succeeded' }), ev({ event_name: 'contract_verified' })],
      registry,
    )
    expect(items).toHaveLength(2)
  })

  it('treats differently-cased addresses as the same contract', () => {
    // Distinct names, so the collapse can only be coming from the address key.
    const items = buildActivityFeed(
      [
        ev({ contract_address: '0xABCDEF', metadata: { contract_name: 'One' } }),
        ev({ contract_address: '0xabcdef', metadata: { contract_name: 'Two' } }),
      ],
      registry,
    )
    expect(items).toHaveLength(1)
  })

  it('collapses redeploys of one project even though each mints a new address', () => {
    // The reason this feed deduped badly in production: iterating on a contract
    // produces a fresh address every time, so an address-only key let a single
    // project fill the entire feed.
    const items = buildActivityFeed(
      [
        ev({ contract_address: '0xAbCdEf', metadata: { contract_name: 'Same' } }),
        ev({ contract_address: '0x111', network: 'studionet', metadata: { contract_name: 'Same' } }),
      ],
      registry,
    )
    expect(items).toHaveLength(1)
  })

  it('keeps unnamed events separate instead of collapsing them together', () => {
    // contract_verified records no contract_name. If a missing name were treated
    // as a shared key, every unnamed event would collapse into a single row.
    const items = buildActivityFeed(
      [
        ev({ event_name: 'contract_verified', contract_address: '0xAbCdEf', metadata: null }),
        ev({ event_name: 'contract_verified', contract_address: '0x111', network: 'studionet', metadata: null }),
      ],
      registry,
    )
    expect(items).toHaveLength(2)
  })

  it('does not let a name collide with another contract address', () => {
    // Keys are namespaced (a:/n:); without that, the first event's NAME would
    // match the second event's ADDRESS and wrongly suppress it.
    const items = buildActivityFeed(
      [
        ev({ contract_address: '0xAbCdEf', metadata: { contract_name: '0x111' } }),
        ev({ contract_address: '0x111', network: 'studionet', metadata: { contract_name: 'Other' } }),
      ],
      registry,
    )
    expect(items).toHaveLength(2)
  })
})

describe('output shape', () => {
  it('uses the registry casing so links resolve', () => {
    // Events may store a lowercased address; /interact and explorer links use the
    // registry's checksummed form.
    const items = buildActivityFeed([ev({ contract_address: '0xabcdef' })], registry)
    expect(items[0].address).toBe('0xAbCdEf')
  })

  it('falls back to a null name when metadata carries none', () => {
    // contract_verified events do not record a contract_name.
    const items = buildActivityFeed([ev({ event_name: 'contract_verified', metadata: null })], registry)
    expect(items[0].contractName).toBeNull()
  })

  it('ignores a non-string contract_name rather than rendering it', () => {
    expect(buildActivityFeed([ev({ metadata: { contract_name: 42 } })], registry)[0].contractName).toBeNull()
  })

  it('matches on address alone when the event recorded no network', () => {
    const items = buildActivityFeed([ev({ network: null })], registry)
    expect(items).toHaveLength(1)
    expect(items[0].network).toBe('testnet-asimov')
  })

  it('honours the limit and preserves newest-first order', () => {
    const events = Array.from({ length: 10 }, (_, i) =>
      ev({ contract_address: '0xAbCdEf', event_name: 'deployment_succeeded', created_at: `2026-07-21T1${i}:00:00.000Z` }),
    )
    // All one contract+kind, so dedupe leaves exactly one regardless of limit.
    expect(buildActivityFeed(events, registry, 3)).toHaveLength(1)

    const many = Array.from({ length: 10 }, (_, i) => ({
      address: `0xC${i}`,
      network: 'studionet',
      deployer_wallet: null,
    }))
    // Distinct names, or the address-OR-name dedupe would collapse them into one
    // and this would stop testing the limit at all.
    const manyEvents = many.map((c, i) =>
      ev({
        contract_address: c.address,
        network: 'studionet',
        metadata: { contract_name: `Oracle${i}` },
        created_at: `2026-07-21T0${i}:00:00.000Z`,
      }),
    )
    const limited = buildActivityFeed([...manyEvents].reverse(), many, 3)
    expect(limited).toHaveLength(3)
    expect(limited[0].address).toBe('0xC9')
  })
})
