'use client'

import { motion, useReducedMotion } from 'framer-motion'

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

function TerminalLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-neutral-500">{label}</span>
      <span className="text-emerald-400">{value}</span>
    </div>
  )
}

export default function TerminalSpotlight() {
  const shouldReduce = useReducedMotion()

  return (
    <div>
      {/* Pre-label */}
      <div className="mb-10 text-center">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
          Live Deploy Logs
        </span>
      </div>

      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Left: text */}
        <motion.div
          variants={fadeUp}
          initial={shouldReduce ? 'visible' : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          <h2
            className="mb-4 font-[Syne] font-extrabold leading-[1.1] tracking-[-0.02em] text-white"
            style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}
          >
            Watch your contract land in real time.
          </h2>
          <p className="text-sm leading-relaxed text-neutral-400">
            No black box. No waiting and wondering. Shipyard streams every step of the
            deployment, from transaction submission to contract address confirmation.
          </p>
        </motion.div>

        {/* Right: static terminal */}
        <motion.div
          initial={shouldReduce ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div
            className="overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-emerald-400/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
            style={{ borderLeft: '2px solid rgba(52, 211, 153, 0.5)' }}
          >
            {/* Top bar */}
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              <span className="ml-2 font-mono text-xs text-neutral-500">Shipyard Deploy Terminal</span>
            </div>

            {/* Terminal body */}
            <div className="space-y-1.5 p-4 font-mono text-xs">
              <TerminalLine label="Uploading contract..."         value="✓" />
              <TerminalLine label="Parsing constructor params..." value="✓  (2 found)" />
              <TerminalLine label="Connecting wallet..."          value="✓  0x4a2f...3b1e" />
              <TerminalLine label="Submitting transaction..."     value="✓  0xf3c8...7d91" />
              <div className="pt-1">
                <div className="text-neutral-500">Waiting for consensus...</div>
                <div className="ml-4 mt-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-600">↳ LLM validators processing</span>
                    <div className="flex gap-0.5">
                      <span className="dot-1 text-emerald-400">●</span>
                      <span className="dot-2 text-emerald-400">●</span>
                      <span className="dot-3 text-emerald-400">●</span>
                      <span className="dot-4 text-emerald-400">●</span>
                      <span className="text-neutral-700">○</span>
                    </div>
                  </div>
                  <div className="text-emerald-400">↳ Consensus reached  ✓</div>
                </div>
              </div>
              <div className="border-t border-white/[0.04] pt-2">
                <div className="font-semibold text-emerald-400">Contract deployed!</div>
                <div className="mt-1 space-y-0.5 text-neutral-500">
                  <div>
                    {'  '}Address: <span className="text-emerald-400">0x7c3d...9f2a</span>{'  '}✓
                  </div>
                  <div>
                    {'  '}Network: <span className="text-neutral-300">Testnet Bradbury</span>
                  </div>
                  <div>
                    {'  '}Block:{'   '}<span className="text-neutral-300">#1,847,291</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
