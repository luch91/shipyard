'use client'

import { Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAccount, useSwitchChain } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import LZString from 'lz-string'
import { AlertTriangle, Rocket, ShieldCheck, Terminal, Wallet, Zap } from 'lucide-react'
import { parseContract, validateContract } from '@/lib/genlayer/parser'
import { coerceArgs } from '@/hooks/useDeploy'
import { deployContract } from '@/lib/genlayer/deploy'
import { writeContractMethodWithProvider } from '@/lib/genlayer/client'
import { useAuth } from '@/components/providers/SiweAuthProvider'
import { NETWORKS, getNetwork } from '@/lib/genlayer/networks'
import {
  HANDOFF_VERSION,
  encodeEnvelope,
  isLoopbackCallback,
  isValidState,
  type HandoffAction,
  type HandoffEnvelope,
  type HandoffErrorCode,
} from '@/lib/handoff/protocol'
import type { NetworkId, ParsedContract } from '@/types'

// ─── Handoff page (SPEC.md §12) ────────────────────────────────────────────────
// A CLI agent opens this prefilled URL; the user approves a real wallet popup with
// their own wallet; the result is returned to the CLI via a 127.0.0.1 loopback
// callback or the relay endpoint. The agent never holds a key and never signs.
//
// Hard rule: NEVER auto-fire the wallet action on load. We prefill + present; the
// human clicks Deploy/Execute/Verify. Only the *return* to the CLI is automatic.

type Transport = { kind: 'loopback'; callback: string } | { kind: 'relay' } | { kind: 'manual' }

type Intent =
  | { ok: false; reason: string }
  | {
      ok: true
      action: HandoffAction
      network: NetworkId
      state: string
      transport: Transport
      // deploy
      source?: string
      parsed?: ParsedContract
      initialArgs?: Record<string, string>
      // write
      address?: string
      method?: string
      writeArgs?: unknown[]
      // verify
      deployTx?: string
    }

function decodeLZ(raw: string | null): string | null {
  if (!raw) return null
  try {
    return LZString.decompressFromEncodedURIComponent(raw) || null
  } catch {
    return null
  }
}

function classifyError(e: unknown): { code: HandoffErrorCode; message: string } {
  const message = e instanceof Error ? e.message : String(e)
  const lower = message.toLowerCase()
  const code = (e as { code?: number })?.code
  if (code === 4001 || lower.includes('reject') || lower.includes('denied') || lower.includes('user refused'))
    return { code: 'user_rejected', message }
  if (lower.includes('insufficient') || lower.includes('enough funds'))
    return { code: 'insufficient_funds', message }
  return { code: 'tx_failed', message }
}

// ─── Param parsing + validation (no side effects) ───────────────────────────────

function useIntent(): Intent {
  const sp = useSearchParams()
  return useMemo<Intent>(() => {
    const actionParam = sp.get('action')
    if (actionParam !== 'deploy' && actionParam !== 'write' && actionParam !== 'verify')
      return { ok: false, reason: 'Missing or invalid "action" (expected deploy, write, or verify).' }
    const action = actionParam as HandoffAction

    const network = sp.get('network')
    if (!network || !(network in NETWORKS))
      return { ok: false, reason: `Missing or unknown "network". Expected one of: ${Object.keys(NETWORKS).join(', ')}.` }

    const state = sp.get('state')
    if (!isValidState(state)) return { ok: false, reason: 'Missing or invalid "state" token.' }

    // Transport: relay=1, else a validated loopback callback, else manual paste.
    let transport: Transport
    if (sp.get('relay') === '1') {
      transport = { kind: 'relay' }
    } else {
      const callback = sp.get('callback')
      if (callback) {
        // SECURITY (§12.4 #2): only loopback callbacks are allowed.
        if (!isLoopbackCallback(callback))
          return { ok: false, reason: 'Refusing a non-loopback "callback". Only http://127.0.0.1, [::1], or localhost are allowed.' }
        transport = { kind: 'loopback', callback }
      } else {
        transport = { kind: 'manual' }
      }
    }

    const base = { ok: true as const, action, network: network as NetworkId, state, transport }

    if (action === 'deploy') {
      const source = decodeLZ(sp.get('source'))
      if (!source) return { ok: false, reason: 'Deploy handoff requires a valid "source" (LZString-encoded).' }
      if (!validateContract(source).valid) return { ok: false, reason: 'The provided contract source failed validation.' }
      const parsed = parseContract(source)
      // Initial args: parsed defaults, overridden by any provided "args" object.
      const initialArgs: Record<string, string> = {}
      for (const p of parsed.constructorParams) {
        if (p.defaultValue !== undefined)
          initialArgs[p.name] = p.type === 'bool' ? p.defaultValue.toLowerCase() : p.defaultValue
      }
      const argsRaw = decodeLZ(sp.get('args'))
      if (argsRaw) {
        try {
          const obj = JSON.parse(argsRaw)
          if (obj && typeof obj === 'object')
            for (const [k, v] of Object.entries(obj)) initialArgs[k] = String(v)
        } catch {
          return { ok: false, reason: 'Deploy "args" is not valid JSON.' }
        }
      }
      return { ...base, source, parsed, initialArgs }
    }

    if (action === 'write') {
      const address = sp.get('address')
      const method = sp.get('method')
      if (!address) return { ok: false, reason: 'Write handoff requires "address".' }
      if (!method) return { ok: false, reason: 'Write handoff requires "method".' }
      let writeArgs: unknown[] = []
      const argsRaw = sp.get('args')
      if (argsRaw) {
        try {
          const arr = JSON.parse(argsRaw)
          if (!Array.isArray(arr)) return { ok: false, reason: 'Write "args" must be a JSON array.' }
          writeArgs = arr
        } catch {
          return { ok: false, reason: 'Write "args" is not valid JSON.' }
        }
      }
      return { ...base, address, method, writeArgs }
    }

    // verify
    const address = sp.get('address')
    const source = decodeLZ(sp.get('source'))
    if (!address) return { ok: false, reason: 'Verify handoff requires "address".' }
    if (!source) return { ok: false, reason: 'Verify handoff requires a valid "source" (LZString-encoded).' }
    if (!validateContract(source).valid) return { ok: false, reason: 'The provided contract source failed validation.' }
    return { ...base, address, source, deployTx: sp.get('deployTx') ?? undefined }
  }, [sp])
}

// ─── Inner component ────────────────────────────────────────────────────────────

function HandoffInner() {
  const intent = useIntent()
  const { address, chainId, isConnected, connector } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { authenticated, signIn } = useAuth()

  const [status, setStatus] = useState<'config' | 'working' | 'done'>('config')
  const [logs, setLogs] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [manualPayload, setManualPayload] = useState<string | null>(null)

  // Editable inputs (prefilled from the intent; the human reviews before signing).
  const [deployArgs, setDeployArgs] = useState<Record<string, string>>(
    () => (intent.ok && intent.action === 'deploy' ? intent.initialArgs ?? {} : {}),
  )
  const [deployTx, setDeployTx] = useState(() => (intent.ok && intent.action === 'verify' ? intent.deployTx ?? '' : ''))

  if (!intent.ok) {
    return (
      <Shell>
        <div className="rounded-lg border border-red-500/30 bg-red-500/[0.06] p-4">
          <div className="mb-1 flex items-center gap-2 text-red-400">
            <AlertTriangle size={15} />
            <span className="font-mono text-sm font-semibold">Invalid handoff request</span>
          </div>
          <p className="font-mono text-xs text-neutral-400">{intent.reason}</p>
        </div>
      </Shell>
    )
  }

  const { action, network, state, transport } = intent
  const net = getNetwork(network)
  const sharedChainId = network === 'testnet-bradbury' || network === 'testnet-asimov'

  // Return the result to the CLI per the chosen transport (§12.3).
  async function returnResult(env: HandoffEnvelope) {
    const payload = encodeEnvelope(env)
    if (transport.kind === 'loopback') {
      const sep = transport.callback.includes('?') ? '&' : '?'
      window.location.assign(`${transport.callback}${sep}payload=${encodeURIComponent(payload)}`)
      return
    }
    if (transport.kind === 'relay') {
      try {
        const res = await fetch('/api/handoff/result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state, payload }),
        })
        if (!res.ok) {
          const d = await res.json().catch(() => ({}))
          throw new Error(d.error ?? `Relay failed (${res.status}).`)
        }
        setStatus('done')
        return
      } catch (e) {
        // Relay unavailable — degrade to manual paste so the result is never lost.
        setErrorMsg(e instanceof Error ? e.message : 'Relay failed.')
        setManualPayload(payload)
        setStatus('done')
        return
      }
    }
    // manual
    setManualPayload(payload)
    setStatus('done')
  }

  function fail(e: unknown) {
    const { code, message } = classifyError(e)
    setErrorMsg(message)
    void returnResult({ v: HANDOFF_VERSION, state, action, ok: false, error: { code, message } })
  }

  async function ensureChain(): Promise<boolean> {
    const target = NETWORKS[network].chainId
    if (chainId === target) return true
    try {
      await switchChainAsync({ chainId: target })
      return true
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Network switch rejected.'
      setErrorMsg(message)
      void returnResult({ v: HANDOFF_VERSION, state, action, ok: false, error: { code: 'wrong_network', message } })
      return false
    }
  }

  // ── Deploy ──
  async function runDeploy() {
    if (!intent.ok || intent.action !== 'deploy' || !address || !connector) return
    setStatus('working')
    setErrorMsg(null)
    setLogs([])
    if (!(await ensureChain())) {
      setStatus('done')
      return
    }
    try {
      const provider = await connector.getProvider()
      const argsForDeploy = coerceArgs(deployArgs, intent.parsed!.constructorParams)
      const result = await deployContract({
        contractSource: intent.source!,
        constructorArgs: argsForDeploy,
        networkId: network,
        address,
        provider,
        onLog: (l) => setLogs((prev) => [...prev, `${l.level}: ${l.message}`]),
      })
      // Mirror the app: fire-and-forget registry record so the contract is discoverable.
      // keepalive: the loopback transport navigates away immediately in returnResult(),
      // which would otherwise cancel this in-flight request before it reaches the server.
      if (result.contractAddress) {
        fetch('/api/registry/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: result.contractAddress, network, deployTx: result.transactionHash }),
          keepalive: true,
        }).catch(() => {})
      }
      await returnResult({
        v: HANDOFF_VERSION,
        state,
        action,
        ok: true,
        result: {
          contractAddress: result.contractAddress,
          txHash: result.transactionHash,
          network,
          contractName: intent.parsed!.className,
          pending: !result.contractAddress,
        },
      })
    } catch (e) {
      fail(e)
      setStatus('done')
    }
  }

  // ── Write ──
  async function runWrite() {
    if (!intent.ok || intent.action !== 'write' || !address || !connector) return
    setStatus('working')
    setErrorMsg(null)
    if (!(await ensureChain())) {
      setStatus('done')
      return
    }
    try {
      const provider = await connector.getProvider()
      const hash = await writeContractMethodWithProvider(
        network,
        address,
        provider,
        intent.address!,
        intent.method!,
        intent.writeArgs ?? [],
      )
      await returnResult({
        v: HANDOFF_VERSION,
        state,
        action,
        ok: true,
        result: { txHash: hash, network },
      })
    } catch (e) {
      fail(e)
      setStatus('done')
    }
  }

  // ── Verify (SIWE sign-in if needed, then POST /api/verify) ──
  async function runVerify() {
    if (!intent.ok || intent.action !== 'verify') return
    setStatus('working')
    setErrorMsg(null)
    try {
      // Ensure a SIWE session. signIn() swallows errors, so confirm via the session.
      if (!authenticated) {
        await signIn()
        const s = await fetch('/api/auth/session').then((r) => r.json()).catch(() => ({}))
        if (!s?.address) {
          const message = 'Sign-in was not completed.'
          setErrorMsg(message)
          await returnResult({ v: HANDOFF_VERSION, state, action, ok: false, error: { code: 'not_authenticated', message } })
          setStatus('done')
          return
        }
      }
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: intent.address, network, source: intent.source, deployTx: deployTx.trim() || undefined }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error ?? 'Verification failed.')
      await returnResult({
        v: HANDOFF_VERSION,
        state,
        action,
        ok: true,
        result: { verified: !!d.verified, attributed: !!d.attributed },
      })
    } catch (e) {
      // A failed POST here is a verification failure, not a tx failure.
      const message = e instanceof Error ? e.message : 'Verification failed.'
      setErrorMsg(message)
      await returnResult({ v: HANDOFF_VERSION, state, action, ok: false, error: { code: 'validation', message } })
      setStatus('done')
    }
  }

  const actionMeta = {
    deploy: { label: 'Deploy contract', icon: Rocket, gas: true },
    write: { label: 'Execute write', icon: Zap, gas: true },
    verify: { label: 'Sign in & verify', icon: ShieldCheck, gas: false },
  }[action]
  const ActionIcon = actionMeta.icon

  // Done screens
  if (status === 'done') {
    return (
      <Shell>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-5">
          <div className="mb-2 flex items-center gap-2 text-emerald-400">
            <Terminal size={16} />
            <span className="font-mono text-sm font-semibold">
              {errorMsg ? 'Returned (with error)' : 'Done — return to your terminal'}
            </span>
          </div>
          {errorMsg && <p className="mb-3 font-mono text-xs text-red-400">{errorMsg}</p>}
          {transport.kind === 'relay' && !manualPayload && (
            <p className="font-mono text-xs text-neutral-400">The result was sent back to the CLI. You can close this tab.</p>
          )}
          {manualPayload && (
            <div>
              <p className="mb-2 font-mono text-xs text-neutral-400">
                Auto-return was unavailable. Copy this and paste it back into your terminal:
              </p>
              <textarea
                readOnly
                value={manualPayload}
                rows={4}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full resize-none rounded-md border border-neutral-700 bg-neutral-950 p-2 font-mono text-[11px] text-emerald-300"
              />
            </div>
          )}
        </div>
      </Shell>
    )
  }

  return (
    <Shell>
      {/* What will happen */}
      <div className="mb-5 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
        <div className="mb-2 flex items-center gap-2">
          <ActionIcon size={15} className="text-emerald-400" />
          <span className="font-mono text-sm font-semibold text-white">{actionMeta.label}</span>
        </div>
        <dl className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 font-mono text-xs">
          <dt className="text-neutral-500">Network</dt>
          <dd className="text-neutral-200">{net.name} <span className="text-neutral-600">({network})</span></dd>
          <dt className="text-neutral-500">Cost</dt>
          <dd className="text-neutral-200">{actionMeta.gas ? 'on-chain transaction (gas)' : 'off-chain signature (gasless)'}</dd>
          {action === 'write' && (
            <>
              <dt className="text-neutral-500">Contract</dt>
              <dd className="truncate text-neutral-200">{intent.address}</dd>
              <dt className="text-neutral-500">Method</dt>
              <dd className="text-neutral-200">{intent.method}</dd>
            </>
          )}
          {action === 'verify' && (
            <>
              <dt className="text-neutral-500">Contract</dt>
              <dd className="truncate text-neutral-200">{intent.address}</dd>
            </>
          )}
          {action === 'deploy' && (
            <>
              <dt className="text-neutral-500">Contract</dt>
              <dd className="text-neutral-200">{intent.parsed!.className}</dd>
            </>
          )}
        </dl>
        {sharedChainId && actionMeta.gas && (
          <p className="mt-3 flex items-start gap-1.5 rounded-md border border-amber-500/25 bg-amber-500/[0.06] px-2.5 py-1.5 font-mono text-[11px] text-amber-300/90">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
            Bradbury and Asimov share chain id {net.chainId}; your wallet can&apos;t tell them apart.
            Confirm you intend <span className="font-semibold">{net.name}</span> before approving.
          </p>
        )}
      </div>

      {/* Deploy: editable constructor args */}
      {action === 'deploy' && intent.parsed!.constructorParams.length > 0 && (
        <div className="mb-5 flex flex-col gap-2">
          <p className="font-mono text-xs text-neutral-500">Constructor parameters</p>
          {intent.parsed!.constructorParams.map((p) => (
            <div key={p.name} className="flex items-center gap-2">
              <label className="w-28 shrink-0 font-mono text-xs text-neutral-400">
                {p.name}
                <span className="ml-1 text-neutral-600">:{p.type}</span>
              </label>
              <input
                type="text"
                value={deployArgs[p.name] ?? ''}
                onChange={(e) => setDeployArgs((a) => ({ ...a, [p.name]: e.target.value }))}
                placeholder={p.defaultValue ?? p.type}
                className="flex-1 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1.5 font-mono text-xs text-white placeholder-neutral-600 focus:border-emerald-500/60 focus:outline-none"
                aria-label={p.name}
              />
            </div>
          ))}
        </div>
      )}

      {/* Write: args preview (read-only — typed JSON array from the CLI) */}
      {action === 'write' && (intent.writeArgs?.length ?? 0) > 0 && (
        <div className="mb-5">
          <p className="mb-1 font-mono text-xs text-neutral-500">Arguments</p>
          <pre className="overflow-x-auto rounded-md border border-neutral-800 bg-neutral-950 p-2 font-mono text-[11px] text-neutral-300">
            {JSON.stringify(intent.writeArgs, null, 2)}
          </pre>
        </div>
      )}

      {/* Verify: optional deploy tx for attribution */}
      {action === 'verify' && (
        <div className="mb-5">
          <label className="mb-1 block font-mono text-xs text-neutral-500">Deploy tx hash (optional — lets the deployer claim attribution)</label>
          <input
            type="text"
            value={deployTx}
            onChange={(e) => setDeployTx(e.target.value)}
            placeholder="0x…"
            className="w-full rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 font-mono text-[11px] text-neutral-300 placeholder-neutral-600 focus:border-emerald-500/50 focus:outline-none"
            aria-label="Deploy transaction hash"
          />
        </div>
      )}

      {/* Action / connect */}
      {!isConnected ? (
        <div className="flex flex-col gap-2 rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="flex items-center gap-2 text-neutral-400">
            <Wallet size={14} />
            <span className="font-mono text-xs">Connect your wallet to continue</span>
          </div>
          <div className="flex">
            <ConnectButton chainStatus="none" />
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={status === 'working'}
          onClick={action === 'deploy' ? runDeploy : action === 'write' ? runWrite : runVerify}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500 px-4 py-3 font-mono text-sm font-semibold text-neutral-950 transition-all hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          {status === 'working' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-600 border-t-emerald-400" />
              Waiting for your wallet…
            </>
          ) : (
            <>
              <ActionIcon size={15} />
              {actionMeta.label}
            </>
          )}
        </button>
      )}

      {errorMsg && (
        <p className="mt-3 rounded-md bg-red-500/5 px-3 py-2 font-mono text-xs text-red-400">{errorMsg}</p>
      )}

      {logs.length > 0 && (
        <pre className="mt-4 max-h-48 overflow-y-auto rounded-md border border-neutral-800 bg-neutral-950 p-3 font-mono text-[11px] text-neutral-400">
          {logs.join('\n')}
        </pre>
      )}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="mb-6">
        <h1 className="font-mono text-xl font-bold text-white">Shipyard wallet handoff</h1>
        <p className="mt-1 font-mono text-xs text-neutral-500">
          Approve in your own wallet. Your key never leaves your wallet; the CLI never signs.
        </p>
      </div>
      {children}
    </div>
  )
}

export default function HandoffPage() {
  return (
    <Suspense fallback={<Shell><p className="font-mono text-xs text-neutral-500">Loading…</p></Shell>}>
      <HandoffInner />
    </Suspense>
  )
}
