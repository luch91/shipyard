'use client'

import { Sparkles, Zap, LayoutTemplate, GitCompare, Database, Terminal } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const glassCard =
  'relative rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-emerald-400/[0.04] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-emerald-500/20'

function IconBox({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10">
      <Icon size={20} className="text-emerald-400" />
    </div>
  )
}

export default function FeaturesSection() {
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
        className="mb-12 text-center"
      >
        <motion.span
          variants={fadeUp}
          className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400"
        >
          What&apos;s Inside
        </motion.span>
        <motion.h2
          variants={fadeUp}
          className="mt-3 font-[Syne] font-bold text-white"
          style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}
        >
          Everything you need. Nothing you don&apos;t.
        </motion.h2>
        <motion.p variants={fadeUp} className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-neutral-400">
          20 templates, AI generation, living contracts, and full interaction tooling. All in the browser.
        </motion.p>
      </motion.div>

      {/* Bento grid */}
      <motion.div
        variants={stagger}
        initial={initial}
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
      >
        {/* Feature 1: AI Contract Generation (spans 2 rows on desktop) */}
        <motion.div variants={fadeUp} className={`${glassCard} lg:row-span-2`}>
          <IconBox icon={Sparkles} />
          <h3 className="mb-2 text-lg font-semibold text-white">AI Contract Generation</h3>
          <p className="mb-6 text-sm leading-relaxed text-neutral-400">
            Describe your contract in plain English. Get a deployable Python Intelligent Contract in seconds.
          </p>
          {/* Prompt → code mockup */}
          <div className="rounded-lg border border-white/[0.06] bg-neutral-950/60 p-3 font-mono text-xs">
            <div className="mb-2 text-neutral-500">Prompt:</div>
            <div className="mb-4 text-neutral-300">&ldquo;A prediction market for Bitcoin price&rdquo;</div>
            <div className="mb-2 text-emerald-400">↓ Generated contract</div>
            <div className="space-y-0.5 text-neutral-400">
              <div>
                <span className="text-violet-400">class</span>{' '}
                <span className="text-emerald-400">BitcoinPrediction</span>
                (gl.Contract):
              </div>
              <div className="pl-4 text-neutral-500">
                question: <span className="text-amber-400">str</span>
              </div>
              <div className="pl-4 text-neutral-500">
                resolution_url: <span className="text-amber-400">str</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature 3: 20 Templates */}
        <motion.div variants={fadeUp} className={glassCard}>
          <IconBox icon={LayoutTemplate} />
          <h3 className="mb-2 text-lg font-semibold text-white">20 Ready Templates</h3>
          <p className="text-sm leading-relaxed text-neutral-400">
            From Hello World to prediction markets. Every template arrives pre-filled and ready to deploy.
          </p>
        </motion.div>

        {/* Feature 4: Network Comparison */}
        <motion.div variants={fadeUp} className={glassCard}>
          <IconBox icon={GitCompare} />
          <h3 className="mb-2 text-lg font-semibold text-white">Network Comparison</h3>
          <p className="text-sm leading-relaxed text-neutral-400">
            Deploy the same contract to two networks simultaneously. See how Bradbury and Asimov differ.
          </p>
        </motion.div>

        {/* Feature 5: Contract Registry */}
        <motion.div variants={fadeUp} className={glassCard}>
          <IconBox icon={Database} />
          <h3 className="mb-2 text-lg font-semibold text-white">Contract Registry</h3>
          <p className="text-sm leading-relaxed text-neutral-400">
            Browse every Intelligent Contract on live GenLayer networks. Fork any of them in one click.
          </p>
        </motion.div>

        {/* Feature 6: Interact Page */}
        <motion.div variants={fadeUp} className={glassCard}>
          <IconBox icon={Terminal} />
          <h3 className="mb-2 text-lg font-semibold text-white">Interact Page</h3>
          <p className="text-sm leading-relaxed text-neutral-400">
            Call read and write methods on any deployed contract directly from the browser.
          </p>
        </motion.div>

        {/* Feature 2: Living Contracts (full width on desktop) */}
        <motion.div variants={fadeUp} className={`${glassCard} lg:col-span-3`}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-12">
            <div className="flex-1">
              <IconBox icon={Zap} />
              <h3 className="mb-2 text-lg font-semibold text-white">Living Contracts</h3>
              <p className="text-sm leading-relaxed text-neutral-400">
                Deploy contracts that evolve. Digital pets, self-amending constitutions, adapting
                personas. All on-chain.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              {['Digital Pet', 'Adaptive Persona', 'Living Constitution'].map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-2"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span className="font-mono text-xs text-neutral-300">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
