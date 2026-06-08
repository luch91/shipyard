export interface AIModel {
  id: string
  label: string
  tier: 'paid' | 'free'
  badge?: string
  contextWindow: number
  bestFor: string
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'qwen/qwen3-coder',
    label: 'Qwen3 Coder',
    tier: 'paid',
    badge: 'Recommended',
    contextWindow: 1_000_000,
    bestFor: 'Best overall code generation quality',
  },
  {
    id: 'qwen/qwen3-coder:free',
    label: 'Qwen3 Coder',
    tier: 'free',
    badge: 'Free',
    contextWindow: 1_000_000,
    bestFor: 'Same quality as paid — rate limited',
  },
  {
    id: 'deepseek/deepseek-v4-0520:free',
    label: 'DeepSeek V4',
    tier: 'free',
    badge: 'Free · Best for complex logic',
    contextWindow: 1_000_000,
    bestFor: 'Complex contracts with AI reasoning and multi-step logic',
  },
  {
    id: 'openai/gpt-oss-20b',
    label: 'GPT-OSS 20B',
    tier: 'free',
    badge: 'Free',
    contextWindow: 128_000,
    bestFor: 'Strong general code generation',
  },
]

export const DEFAULT_MODEL_ID =
  process.env.NEXT_PUBLIC_DEFAULT_AI_MODEL ?? 'qwen/qwen3-coder'

export function getModel(id: string): AIModel | undefined {
  return AI_MODELS.find((m) => m.id === id)
}
