import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import {
  metaMaskWallet,
  rabbyWallet,
  zerionWallet,
  rainbowWallet,
  coinbaseWallet,
  trustWallet,
  okxWallet,
  phantomWallet,
  ledgerWallet,
  walletConnectWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets'
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

// WalletConnect requires a projectId. It is a PUBLIC client identifier (exposed
// in the browser bundle by design) configured via NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID.
// NEXT_PUBLIC_* values are inlined at build time, so this must be set in the build
// environment (e.g. Vercel project env vars) — not just at runtime.
//
// If it is missing at build time, RainbowKit's getDefaultConfig throws
// "No projectId found", which — because this config is created at module load and
// wraps the entire app — crashes every route. To prevent a single missing env var
// from taking the whole site down, we fall back to a placeholder so the app still
// boots and injected wallets (e.g. MetaMask) keep working. WalletConnect itself
// (QR / mobile wallets) only functions once the real projectId is configured.
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim()

if (!projectId && typeof window !== 'undefined') {
  console.warn(
    '[Shipyard] NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. ' +
      'The site will still load and injected wallets work, but WalletConnect ' +
      '(mobile wallets / QR) is disabled. Set this env var at build time and redeploy.'
  )
}

// Explicit wallet list so popular wallets (Rabby, Zerion, etc.) appear by name on
// BOTH desktop and mobile. On desktop RainbowKit also auto-detects installed
// extensions via EIP-6963; on mobile there are no extensions, so only the wallets
// registered here are surfaced (each with WalletConnect deep links). walletConnect +
// injected remain as catch-alls for anything not listed.
const wallets = [
  {
    groupName: 'Recommended',
    wallets: [metaMaskWallet, rabbyWallet, zerionWallet, rainbowWallet, coinbaseWallet],
  },
  {
    groupName: 'More',
    wallets: [trustWallet, okxWallet, phantomWallet, ledgerWallet, walletConnectWallet, injectedWallet],
  },
]

export const wagmiConfig = getDefaultConfig({
  appName: 'Shipyard',
  projectId: projectId || 'shipyard-walletconnect-unconfigured',
  chains: [bradbury, asimov, studionet, localnet],
  wallets,
  ssr: true,
})
