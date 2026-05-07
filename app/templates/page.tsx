'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import { TEMPLATES } from '@/lib/genlayer/templates'
import { useDeployStore } from '@/hooks/useDeployStore'
import { parseContract } from '@/lib/genlayer/parser'
import { track } from '@/lib/analytics'
import type { ContractTemplate, TemplateDifficulty } from '@/types'

const DIFFICULTY_COLORS: Record<TemplateDifficulty, string> = {
  beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  intermediate: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  advanced: 'text-red-400 bg-red-500/10 border-red-500/30',
}

function TemplateCard({ template }: { template: ContractTemplate }) {
  const [expanded, setExpanded] = useState(false)
  const { setContractSource, setParsedContract } = useDeployStore()
  const router = useRouter()

  const handleUse = () => {
    setContractSource(template.source)
    setParsedContract(parseContract(template.source))
    track('template_selected', { template_name: template.name, difficulty: template.difficulty, tags: template.tags })
    router.push('/deploy')
  }

  return (
    <div className="flex flex-col rounded-lg border border-neutral-800 bg-neutral-900">
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono font-semibold text-white">{template.name}</h3>
            <span
              className={clsx(
                'rounded border px-1.5 py-0.5 font-mono text-[11px]',
                DIFFICULTY_COLORS[template.difficulty]
              )}
            >
              {template.difficulty}
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">{template.description}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[11px] text-neutral-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            className="rounded-md border border-neutral-700 p-2 text-neutral-400 hover:border-neutral-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            aria-label={expanded ? 'Collapse source' : 'Expand source'}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            type="button"
            onClick={handleUse}
            className="flex items-center gap-1.5 rounded-md bg-emerald-500 px-3 py-2 font-mono text-xs font-semibold text-neutral-950 transition-colors hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            Use
            <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-neutral-800">
          <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-neutral-300">
            <code>{template.source}</code>
          </pre>
        </div>
      )}
    </div>
  )
}

export default function TemplatesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-mono text-xl font-bold text-white">Contract Templates</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Start from a working example. Click "Use" to load a template into the deploy flow.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {TEMPLATES.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  )
}
