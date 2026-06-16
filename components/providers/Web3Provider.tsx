'use client'

import { useState } from 'react'
import { WagmiProvider, cookieToInitialState } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { wagmiConfig } from '@/lib/wagmi'

export function Web3Provider({
  children,
  cookie,
}: {
  children: React.ReactNode
  cookie?: string | null
}) {
  const [queryClient] = useState(() => new QueryClient())
  const [initialState] = useState(() => cookieToInitialState(wagmiConfig, cookie))

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState} reconnectOnMount>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#34d399',
            accentColorForeground: '#0a0a0a',
            borderRadius: 'medium',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
