'use client'

import { createContext, useContext } from 'react'
import { useSiweAuth } from '@/hooks/useSiweAuth'

// Single shared SIWE auth state for the whole app. Without this, every component
// that called useSiweAuth() got its own independent copy of the state, so signing
// in via one (e.g. the SignInButton) never updated another (e.g. ContractPanel),
// leaving the "Verify & publish source" CTA stuck behind a stale unauthenticated
// flag. The provider instantiates the hook once and shares it via context.

type SiweAuth = ReturnType<typeof useSiweAuth>

const SiweAuthContext = createContext<SiweAuth | null>(null)

export function SiweAuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useSiweAuth()
  return <SiweAuthContext.Provider value={auth}>{children}</SiweAuthContext.Provider>
}

export function useAuth(): SiweAuth {
  const ctx = useContext(SiweAuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within <SiweAuthProvider>.')
  }
  return ctx
}
