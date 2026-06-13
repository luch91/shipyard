'use client'

import { ExternalLink } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import type { Network, NetworkId } from '@/types'
import type { NETWORK_COLOR_CLASSES } from '@/lib/genlayer/networks'

interface Props {
  networks: Network[]
  colorClasses: typeof NETWORK_COLOR_CLASSES
}

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export default function NetworkStatus({ networks, colorClasses }: Props) {
  const shouldReduce = useReducedMotion()
  const initial = shouldReduce ? 'visible' : 'hidden'

  return (
    <div>
      {/* Header */}
      <motion.div
        variants={stagger}
        initial={initial}
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="mb-8 text-center"
      >
        <motion.span
          variants={fadeUp}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400"
        >
          Networks
        </motion.span>
        <motion.h2
          variants={fadeUp}
          className="mt-3 font-[Syne] font-bold text-white"
          style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}
        >
          Five networks. One platform.
        </motion.h2>
      </motion.div>

      {/* Network cards */}
      <motion.div
        variants={stagger}
        initial={initial}
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {networks.map((network) => {
          const colors = colorClasses[network.id as NetworkId]
          return (
            <motion.div
              key={network.id}
              variants={fadeUp}
              className="relative rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-emerald-400/[0.04] px-4 py-4 shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${colors.dot} ${network.isLive ? 'animate-pulse' : 'opacity-40'}`}
                />
                <span className={`font-mono text-xs font-bold ${colors.text}`}>
                  {network.name}
                </span>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-neutral-400">{network.description}</p>
            </motion.div>
          )
        })}

        {/* Testnet Clarke — coming soon */}
        <motion.div
          variants={fadeUp}
          className="relative rounded-xl border border-white/[0.05] bg-gradient-to-br from-white/[0.02] to-sky-400/[0.02] px-4 py-4 shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl opacity-70"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-sky-400 opacity-40" />
            <span className="font-mono text-xs font-bold text-sky-400">Testnet Clarke</span>
          </div>
          <p className="mb-2.5 text-xs font-semibold leading-relaxed text-neutral-400">Next-generation GenLayer testnet</p>
          <span className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold bg-sky-500/10 text-sky-400">
            Coming Soon
          </span>
        </motion.div>
      </motion.div>

      {/* Faucet links */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-400">
        <span>Need testnet tokens?</span>
        <a
          href="https://testnet-faucet.genlayer.foundation"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-emerald-500 hover:text-emerald-400 hover:underline"
        >
          Bradbury / Asimov Faucet
          <ExternalLink size={11} />
        </a>
        <a
          href="https://docs.genlayer.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-neutral-400 hover:text-neutral-300 hover:underline"
        >
          GenLayer Docs
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  )
}
