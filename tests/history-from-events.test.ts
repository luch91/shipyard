import { describe, it, expect } from 'vitest'
import { deploymentsFromEvents, type DeploymentEventRow } from '@/lib/history/fromEvents'

// Server-synced history is merged with the client's localStorage history, so these
// records have to match the shape the UI already renders — and the dedupe has to
// keep the NEWEST row when a contract address shows up more than once.

describe('deploymentsFromEvents', () => {
  it('maps an event onto a DeploymentRecord', () => {
    const rows: DeploymentEventRow[] = [
      {
        network: 'testnet-asimov',
        contract_address: '0xABC',
        metadata: { contract_name: 'Oracle', transaction_hash: '0xtx' },
        created_at: '2026-07-12T00:00:00.000Z',
      },
    ]
    expect(deploymentsFromEvents(rows)).toEqual([
      {
        address: '0xABC',
        contractName: 'Oracle',
        network: 'testnet-asimov',
        deployedAt: Date.parse('2026-07-12T00:00:00.000Z'),
        txHash: '0xtx',
      },
    ])
  })

  it('keeps the first row per address, which is the newest', () => {
    // Callers pass rows ordered created_at DESC; a re-deploy to the same address
    // must surface the latest one.
    const rows: DeploymentEventRow[] = [
      { contract_address: '0xABC', metadata: { contract_name: 'New' }, created_at: '2026-07-12T00:00:00.000Z' },
      { contract_address: '0xABC', metadata: { contract_name: 'Old' }, created_at: '2026-01-01T00:00:00.000Z' },
    ]
    const result = deploymentsFromEvents(rows)
    expect(result).toHaveLength(1)
    expect(result[0].contractName).toBe('New')
  })

  it('dedupes across address casing', () => {
    const rows: DeploymentEventRow[] = [
      { contract_address: '0xAbC', created_at: '2026-07-12T00:00:00.000Z' },
      { contract_address: '0xabc', created_at: '2026-07-11T00:00:00.000Z' },
    ]
    expect(deploymentsFromEvents(rows)).toHaveLength(1)
  })

  it('preserves the original address casing in the output', () => {
    // Lowercasing is a dedupe key only — the rendered address must stay checksummed
    // so explorer links and Interact lookups keep working.
    const rows: DeploymentEventRow[] = [{ contract_address: '0xAbCdEf', created_at: null }]
    expect(deploymentsFromEvents(rows)[0].address).toBe('0xAbCdEf')
  })

  it('drops rows with no contract address', () => {
    const rows: DeploymentEventRow[] = [
      { contract_address: null },
      { contract_address: '' },
      {},
      { contract_address: '0xABC' },
    ]
    expect(deploymentsFromEvents(rows)).toHaveLength(1)
  })

  it('falls back to sane defaults for missing metadata', () => {
    const result = deploymentsFromEvents([{ contract_address: '0xABC', created_at: null }], () => 1234)
    expect(result[0]).toMatchObject({
      contractName: 'Contract',
      network: 'testnet-bradbury',
      deployedAt: 1234,
    })
    expect(result[0].txHash).toBeUndefined()
  })

  it('ignores non-string metadata fields rather than rendering them', () => {
    const rows: DeploymentEventRow[] = [
      { contract_address: '0xABC', metadata: { contract_name: 42, transaction_hash: {} }, created_at: null },
    ]
    const result = deploymentsFromEvents(rows)
    expect(result[0].contractName).toBe('Contract')
    expect(result[0].txHash).toBeUndefined()
  })
})
