export interface AIModel {
  id: string
  label: string
  tier: 'paid' | 'free'
  badge?: string
  contextWindow: number
  bestFor: string
}

// Only qwen/qwen3-coder is currently reliable on our OpenRouter account; the
// previously listed free models (qwen3-coder:free, deepseek-v4:free, gpt-oss-20b)
// failed to generate and were removed so users are never offered a broken option.
export const AI_MODELS: AIModel[] = [
  {
    id: 'qwen/qwen3-coder',
    label: 'Qwen3 Coder',
    tier: 'paid',
    contextWindow: 1_000_000,
    bestFor: 'Best overall code generation quality',
  },
]

export const DEFAULT_MODEL_ID =
  process.env.NEXT_PUBLIC_DEFAULT_AI_MODEL ?? 'qwen/qwen3-coder'

export function getModel(id: string): AIModel | undefined {
  return AI_MODELS.find((m) => m.id === id)
}
