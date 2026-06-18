// First-party analytics (replaces PostHog). track() keeps its original signature
// and is fire-and-forget: never awaited, never throws into the caller. The wallet
// address is sent only so the SERVER can hash it (SHA-256 + salt) — never stored
// raw. wagmi is imported dynamically so this widely-imported module does not pull
// the heavy wallet config into light page bundles (it's already loaded at runtime
// via the layout's Web3Provider).

const SESSION_KEY = 'shipyard:session_id'

function getSessionId(): string | undefined {
  if (typeof window === 'undefined') return undefined
  try {
    let id = sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(SESSION_KEY, id)
    }
    return id
  } catch {
    return undefined
  }
}

async function currentWallet(): Promise<string | undefined> {
  try {
    const [{ getAccount }, { wagmiConfig }] = await Promise.all([
      import('@wagmi/core'),
      import('./wagmi'),
    ])
    return getAccount(wagmiConfig).address
  } catch {
    return undefined
  }
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  void send(event, properties)
}

async function send(event: string, properties?: Record<string, unknown>) {
  const wallet = await currentWallet()

  // Lift the columns that have dedicated fields; everything else goes to metadata.
  const { network, template_id, contract_address, ...rest } =
    (properties ?? {}) as Record<string, unknown>

  const payload = {
    event,
    wallet,
    session_id: getSessionId(),
    network: typeof network === 'string' ? network : undefined,
    template_id: typeof template_id === 'string' ? template_id : undefined,
    contract_address: typeof contract_address === 'string' ? contract_address : undefined,
    metadata: rest,
  }

  try {
    const body = JSON.stringify(payload)
    // sendBeacon survives page navigation; fall back to keepalive fetch.
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/event', new Blob([body], { type: 'application/json' }))
    } else {
      fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {})
    }
  } catch {
    // analytics must never break the app
  }
}
