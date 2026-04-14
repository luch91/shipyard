'use client'

import { useMemo, useState } from 'react'
import { GitCompare, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'
import { diffLines } from '@/lib/diff'

interface ContractDiffProps {
  oldSource: string
  newSource: string
  contractName: string
}

export default function ContractDiff({ oldSource, newSource, contractName }: ContractDiffProps) {
  const [expanded, setExpanded] = useState(false)
  const lines = useMemo(() => diffLines(oldSource, newSource), [oldSource, newSource])

  const added = lines.filter((l) => l.type === 'added').length
  const removed = lines.filter((l) => l.type === 'removed').length

  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/5">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2.5 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <GitCompare size={13} className="text-amber-400" />
          <span className="text-xs font-medium text-amber-400">
            {contractName} already deployed — source changed
          </span>
          <span className="font-mono text-[11px] text-emerald-400">+{added}</span>
          <span className="font-mono text-[11px] text-red-400">-{removed}</span>
        </div>
        {expanded ? (
          <ChevronUp size={13} className="text-neutral-500" />
        ) : (
          <ChevronDown size={13} className="text-neutral-500" />
        )}
      </button>

      {expanded && (
        <div className="overflow-x-auto border-t border-amber-500/10">
          <table className="w-full font-mono text-xs">
            <tbody>
              {lines.map((line, idx) => (
                <tr
                  key={idx}
                  className={clsx(
                    line.type === 'added' && 'bg-emerald-500/10',
                    line.type === 'removed' && 'bg-red-500/10'
                  )}
                >
                  <td className="w-8 select-none px-2 py-0.5 text-right text-neutral-700">
                    {line.type !== 'added' && 'lineA' in line ? line.lineA : ''}
                  </td>
                  <td className="w-8 select-none px-2 py-0.5 text-right text-neutral-700">
                    {line.type !== 'removed' && 'lineB' in line ? line.lineB : ''}
                  </td>
                  <td
                    className={clsx(
                      'w-4 select-none px-1 py-0.5 text-center',
                      line.type === 'added' && 'text-emerald-400',
                      line.type === 'removed' && 'text-red-400',
                      line.type === 'same' && 'text-neutral-700'
                    )}
                  >
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                  </td>
                  <td
                    className={clsx(
                      'whitespace-pre py-0.5 pr-4',
                      line.type === 'added' && 'text-emerald-300',
                      line.type === 'removed' && 'text-red-300',
                      line.type === 'same' && 'text-neutral-500'
                    )}
                  >
                    {line.text}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
