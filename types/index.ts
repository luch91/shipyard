// ─── Network ────────────────────────────────────────────────────────────────

export type NetworkId =
  | 'testnet-bradbury'
  | 'testnet-asimov'
  | 'studionet'
  | 'localnet'

export interface Network {
  id: NetworkId
  name: string
  rpcUrl: string
  chainId: number
  isLive: boolean
  description: string
  explorerUrl?: string
}

// ─── Contract Parsing ────────────────────────────────────────────────────────

export type ParamType = 'str' | 'int' | 'float' | 'bool' | 'list' | 'dict' | 'unknown'

export interface ContractParam {
  name: string
  type: ParamType
  required: boolean
  defaultValue?: string
}

export interface ContractMethod {
  name: string
  type: 'read' | 'write'
  params: ContractParam[]
  returnType: string
  docstring?: string
}

export interface ParsedContract {
  className: string
  constructorParams: ContractParam[]
  methods: ContractMethod[]
  stateVariables: Array<{ name: string; type: string }>
  raw: string
}

// ─── Deploy ──────────────────────────────────────────────────────────────────

export type DeployStatus = 'idle' | 'validating' | 'deploying' | 'success' | 'error'

export interface DeployLog {
  id: string
  timestamp: number
  level: 'info' | 'success' | 'error' | 'warn'
  message: string
}

export interface DeployResult {
  contractAddress: string
  transactionHash: string
  network: NetworkId
  deployedAt: number
  contractName: string
}

export interface DeployState {
  status: DeployStatus
  logs: DeployLog[]
  result: DeployResult | null
  error: string | null
}

// ─── Deploy Options ───────────────────────────────────────────────────────────

export interface DeployOptions {
  contractSource: string
  constructorArgs: Record<string, unknown>
  networkId: NetworkId
  privateKey: string
  onLog: (log: Omit<DeployLog, 'id' | 'timestamp'>) => void
}

// ─── Wallet ──────────────────────────────────────────────────────────────────

export interface WalletState {
  address: string | null
  balance: string | null
  isConnected: boolean
}

// ─── Templates ───────────────────────────────────────────────────────────────

export type TemplateCategory = 'oracle' | 'defi' | 'governance' | 'utility' | 'example'
export type TemplateDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface ContractTemplate {
  id: string
  name: string
  description: string
  source: string
  category: TemplateCategory
  difficulty: TemplateDifficulty
  tags: string[]
}

// ─── Deployment History ──────────────────────────────────────────────────────

export interface DeploymentRecord {
  address: string
  contractName: string
  network: NetworkId
  deployedAt: number
}
