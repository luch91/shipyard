'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useSiweAuth } from '@/hooks/useSiweAuth'

// Wallet sign-in affordance. Not yet placed in any page — drop it in wherever the
// first write/ownership feature needs an authenticated session.
export default function SignInButton() {
  const { isConnected } = useAccount()
  const { authenticated, sessionAddress, signIn, signOut, status, error } = useSiweAuth()

  if (!isConnected) return <ConnectButton chainStatus="none" />

  if (status === 'loading') {
    return <span className="font-mono text-xs text-neutral-500">…</span>
  }

  if (authenticated) {
    const short = sessionAddress
      ? `${sessionAddress.slice(0, 6)}…${sessionAddress.slice(-4)}`
      : ''
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs text-emerald-400">Signed in {short}</span>
        <button
          type="button"
          onClick={signOut}
          className="rounded-md border border-white/[0.08] px-3 py-1.5 font-mono text-xs text-neutral-400 transition-colors hover:bg-white/[0.04] hover:text-neutral-200 focus:outline-none"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={signIn}
        className="rounded-md bg-emerald-500 px-4 py-2 font-mono text-xs font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
      >
        Sign in with wallet
      </button>
      {error && <span className="font-mono text-[10px] text-red-400">{error}</span>}
    </div>
  )
}
