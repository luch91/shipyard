import type { Network, NetworkId } from '@/types'

// ─── Network Definitions ─────────────────────────────────────────────────────

export const NETWORKS: Record<NetworkId, Network> = {
  'testnet-bradbury': {
    id: 'testnet-bradbury',
    name: 'Testnet Bradbury',
    rpcUrl: 'https://rpc.bradbury.genlayer.com',
    chainId: 17180,
    isLive: true,
    description: 'Experimental LLM inference testnet — primary deployment target',
    explorerUrl: 'https://explorer-bradbury.genlayer.com',
  },
  'testnet-asimov': {
    id: 'testnet-asimov',
    name: 'Testnet Asimov',
    rpcUrl: 'https://rpc.asimov.genlayer.com',
    chainId: 17181,
    isLive: true,
    description: 'Validator onboarding testnet',
    explorerUrl: 'https://explorer-asimov.genlayer.com',
  },
  studionet: {
    id: 'studionet',
    name: 'Studionet',
    rpcUrl: 'https://studio.genlayer.com/api',
    chainId: 17182,
    isLive: true,
    description: 'Browser-based Studio environment',
  },
  localnet: {
    id: 'localnet',
    name: 'Localnet',
    rpcUrl: 'http://localhost:4000/api',
    chainId: 61999,
    isLive: false,
    description: 'Docker-based local development node',
  },
}

// ─── Network Colors ───────────────────────────────────────────────────────────
// emerald = Bradbury, amber = Asimov, purple = Studionet, gray = Localnet

export const NETWORK_COLORS: Record<NetworkId, string> = {
  'testnet-bradbury': 'emerald',
  'testnet-asimov': 'amber',
  studionet: 'violet',
  localnet: 'neutral',
}

export const NETWORK_COLOR_CLASSES: Record<NetworkId, { dot: string; text: string; border: string; bg: string }> = {
  'testnet-bradbury': {
    dot: 'bg-emerald-400',
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
  },
  'testnet-asimov': {
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
  },
  studionet: {
    dot: 'bg-violet-400',
    text: 'text-violet-400',
    border: 'border-violet-500/40',
    bg: 'bg-violet-500/10',
  },
  localnet: {
    dot: 'bg-neutral-400',
    text: 'text-neutral-400',
    border: 'border-neutral-500/40',
    bg: 'bg-neutral-500/10',
  },
}

// ─── Default ─────────────────────────────────────────────────────────────────

export const DEFAULT_NETWORK: NetworkId = 'testnet-bradbury'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getAllNetworks(): Network[] {
  return Object.values(NETWORKS)
}

export function getLiveNetworks(): Network[] {
  return getAllNetworks().filter((n) => n.isLive)
}

export function getNetwork(id: NetworkId): Network {
  return NETWORKS[id]
}
