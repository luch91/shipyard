import { create } from 'zustand'
import type { NetworkId, ParsedContract, DeployState, DeployLog, DeployResult, WalletState } from '@/types'
import { DEFAULT_NETWORK } from '@/lib/genlayer/networks'

// ─── Store Shape ──────────────────────────────────────────────────────────────

interface DeployStore {
  // Contract
  contractSource: string
  parsedContract: ParsedContract | null
  constructorArgs: Record<string, string>

  // Network
  selectedNetwork: NetworkId

  // Wallet (address only — never store private key here)
  wallet: WalletState

  // Deploy state
  deploy: DeployState

  // Actions — Contract
  setContractSource: (source: string) => void
  setParsedContract: (contract: ParsedContract | null) => void
  setConstructorArg: (name: string, value: string) => void
  resetConstructorArgs: () => void

  // Actions — Network
  setSelectedNetwork: (id: NetworkId) => void

  // Actions — Wallet
  setWallet: (wallet: Partial<WalletState>) => void
  clearWallet: () => void

  // Actions — Deploy
  addLog: (log: Omit<DeployLog, 'id' | 'timestamp'>) => void
  setDeployStatus: (status: DeployState['status']) => void
  setDeployResult: (result: DeployResult) => void
  setDeployError: (error: string) => void
  resetDeploy: () => void
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialWallet: WalletState = {
  address: null,
  balance: null,
  isConnected: false,
}

const initialDeploy: DeployState = {
  status: 'idle',
  logs: [],
  result: null,
  error: null,
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useDeployStore = create<DeployStore>((set) => ({
  contractSource: '',
  parsedContract: null,
  constructorArgs: {},
  selectedNetwork: DEFAULT_NETWORK,
  wallet: initialWallet,
  deploy: initialDeploy,

  // Contract actions
  setContractSource: (source) => set({ contractSource: source }),
  setParsedContract: (contract) => set({ parsedContract: contract, constructorArgs: {} }),
  setConstructorArg: (name, value) =>
    set((state) => ({
      constructorArgs: { ...state.constructorArgs, [name]: value },
    })),
  resetConstructorArgs: () => set({ constructorArgs: {} }),

  // Network actions
  setSelectedNetwork: (id) => set({ selectedNetwork: id }),

  // Wallet actions
  setWallet: (wallet) =>
    set((state) => ({
      wallet: { ...state.wallet, ...wallet },
    })),
  clearWallet: () => set({ wallet: initialWallet }),

  // Deploy actions
  addLog: (log) =>
    set((state) => ({
      deploy: {
        ...state.deploy,
        logs: [
          ...state.deploy.logs,
          { ...log, id: crypto.randomUUID(), timestamp: Date.now() },
        ],
      },
    })),
  setDeployStatus: (status) =>
    set((state) => ({ deploy: { ...state.deploy, status } })),
  setDeployResult: (result) =>
    set((state) => ({
      deploy: { ...state.deploy, status: 'success', result, error: null },
    })),
  setDeployError: (error) =>
    set((state) => ({
      deploy: { ...state.deploy, status: 'error', error },
    })),
  resetDeploy: () => set({ deploy: initialDeploy }),
}))
