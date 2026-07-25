import { describe, expect, it } from 'vitest'
import {
  getAllNetworks,
  getLiveNetworks,
  TOTAL_NETWORK_COUNT,
  UPCOMING_NETWORKS,
} from '../lib/genlayer/networks'

describe('network presentation model', () => {
  it('keeps four selectable targets including Localnet', () => {
    expect(getAllNetworks().map((network) => network.id)).toEqual([
      'testnet-bradbury',
      'testnet-asimov',
      'studionet',
      'localnet',
    ])
  })

  it('counts Clarke as the fifth product network without making it selectable', () => {
    expect(getLiveNetworks()).toHaveLength(3)
    expect(UPCOMING_NETWORKS.map((network) => network.id)).toEqual(['testnet-clarke'])
    expect(TOTAL_NETWORK_COUNT).toBe(5)
  })
})
