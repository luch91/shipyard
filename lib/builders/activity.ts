// Builder activity stats derived from analytics_events.
//
// contracts_deployed / forks_made / forks_received are not maintained as running
// counters anywhere, so a profile read derives them from the event log. The math is
// fiddly enough to be worth isolating from the data fetch: addresses arrive in mixed
// case across capture paths, the same contract can be forked repeatedly by the same
// wallet, and a builder forking their own contract must not inflate their score.

export type ActivityEvent = {
  contract_address?: string | null
  wallet_hash?: string | null
}

export type BuilderActivityInput = {
  /** Addresses from the contracts table already attributed to this wallet. */
  attributedAddresses: string[]
  /** deployment_succeeded events for this wallet. */
  deployEvents: ActivityEvent[]
  /** contract_forked events authored by this wallet. */
  forksMadeEvents: ActivityEvent[]
  /** Recent contract_forked events by anyone — filtered here to this wallet's contracts. */
  forkEvents: ActivityEvent[]
  /** Salted hash of the wallet. Null when ANALYTICS_SALT is unset, which means no
   *  event can be attributed and only the contracts table can contribute. */
  walletHash: string | null
}

export type BuilderActivity = {
  contractsDeployed: number
  forksMade: number
  forksReceived: number
}

function normalizeAddress(event: ActivityEvent): string {
  return typeof event.contract_address === 'string' ? event.contract_address.toLowerCase() : ''
}

export function computeBuilderActivity(input: BuilderActivityInput): BuilderActivity {
  const { attributedAddresses, deployEvents, forksMadeEvents, forkEvents, walletHash } = input

  // Verified/attributed contracts seed the deploy set; events widen it. Both are
  // lowercased so the same contract can never be counted twice on casing alone.
  const deployed = new Set<string>()
  for (const address of attributedAddresses) {
    if (address) deployed.add(address.toLowerCase())
  }

  if (!walletHash) {
    // Nothing in the event log can be tied to this wallet.
    return { contractsDeployed: deployed.size, forksMade: 0, forksReceived: 0 }
  }

  for (const event of deployEvents) {
    const address = normalizeAddress(event)
    if (address) deployed.add(address)
  }

  // Forks made: distinct source contracts, so forking the same contract twice counts once.
  const made = new Set<string>()
  for (const event of forksMadeEvents) {
    const address = normalizeAddress(event)
    if (address) made.add(address)
  }

  // Forks received: others forking contracts this wallet deployed. Matched in JS on
  // lowercased addresses rather than a case-sensitive DB filter. Deduped per
  // (forker, contract) so one wallet repeatedly forking one contract counts once.
  const received = new Set<string>()
  if (deployed.size) {
    for (const event of forkEvents) {
      const address = normalizeAddress(event)
      if (!address || !deployed.has(address)) continue
      if (event.wallet_hash && event.wallet_hash === walletHash) continue // self-fork
      received.add(`${event.wallet_hash ?? 'anon'}:${address}`)
    }
  }

  return { contractsDeployed: deployed.size, forksMade: made.size, forksReceived: received.size }
}
