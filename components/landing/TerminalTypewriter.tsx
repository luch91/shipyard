'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

const LINES = [
  { text: '$ shipyard deploy ./my_contract.py --network bradbury', color: 'text-neutral-300' },
  { text: '  ✓ Contract parsed: 2 constructor params found',        color: 'text-emerald-400' },
  { text: '  ✓ Wallet connected: 0x4a2f...3b1e',                   color: 'text-emerald-400' },
  { text: '  ✓ Deploying to Testnet Bradbury...',                        color: 'text-emerald-400' },
  { text: '  ↳ Contract address: 0x7c3d...9f2a ✓',                 color: 'text-emerald-400' },
]

function sleep(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms))
}

export default function TerminalTypewriter() {
  const shouldReduce = useReducedMotion()
  const [lines, setLines] = useState<{ text: string; color: string }[]>(
    shouldReduce ? LINES : []
  )
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    if (shouldReduce) return

    let cancelled = false

    async function run() {
      while (!cancelled) {
        const built: { text: string; color: string }[] = []

        for (let li = 0; li < LINES.length; li++) {
          if (cancelled) return
          const line = LINES[li]
          let partial = ''
          for (const ch of line.text) {
            if (cancelled) return
            partial += ch
            setLines([...built, { color: line.color, text: partial }])
            await sleep(40)
          }
          built.push(line)
        }

        await sleep(2000)
        if (cancelled) return

        setOpacity(0)
        await sleep(300)
        if (cancelled) return

        setLines([])
        setOpacity(1)
        await sleep(100)
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [shouldReduce])

  return (
    <div style={{ opacity, transition: 'opacity 300ms ease' }} className="min-h-[120px] space-y-1">
      {lines.map((line, i) => (
        <p key={i} className={`font-mono text-xs ${line.color} whitespace-pre`}>
          {line.text}
          {i === lines.length - 1 && (
            <span className="ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-emerald-400 align-middle" />
          )}
        </p>
      ))}
    </div>
  )
}
