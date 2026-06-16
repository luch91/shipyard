import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { defineChain } from 'viem'

export const bradbury = defineChain({
  id: 4221,
  name: 'Genlayer Bradbury Testnet',
  nativeCurrency: { name: 'GEN Token', symbol: 'GEN', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.testnet-chain.genlayer.com'] } },
  blockExplorers: { default: { name: 'Explorer', url: 'https://explorer-bradbury.genlayer.com' } },
})

export const asimov = defineChain({
  id: 4221,
  name: 'Genlayer Asimov Testnet',
  nativeCurrency: { name: 'GEN Token', symbol: 'GEN', decimals: 18 },
  rpcUrls: { default: { http: ['https://rpc.testnet-chain.genlayer.com'] } },
  blockExplorers: { default: { name: 'Explorer', url: 'https://explorer-asimov.genlayer.com' } },
})

export const studionet = defineChain({
  id: 61999,
  name: 'Genlayer Studio Network',
  nativeCurrency: { name: 'GEN Token', symbol: 'GEN', decimals: 18 },
  rpcUrls: { default: { http: ['https://studio.genlayer.com/api'] } },
})

export const localnet = defineChain({
  id: 61127,
  name: 'Genlayer Localnet',
  nativeCurrency: { name: 'GEN Token', symbol: 'GEN', decimals: 18 },
  rpcUrls: { default: { http: ['http://127.0.0.1:4000/api'] } },
})

export const wagmiConfig = getDefaultConfig({
  appName: 'Shipyard',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '',
  chains: [bradbury, asimov, studionet, localnet],
  ssr: true,
})
