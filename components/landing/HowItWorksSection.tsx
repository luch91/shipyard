'use client'

import { Upload, Settings, Rocket } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
}

const STEPS = [
  {
    badge: '01',
    icon: Upload,
    title: 'Upload your contract',
    description:
      'Paste or drop a Python Intelligent Contract file. Shipyard parses constructor params automatically.',
  },
  {
    badge: '02',
    icon: Settings,
    title: 'Configure parameters',
    description:
      'Fill in constructor arguments with a typed form. No JSON wrangling, no CLI flags.',
  },
  {
    badge: '03',
    icon: Rocket,
    title: 'Deploy to any network',
    description:
      'Choose Bradbury, Asimov, Studionet, or Localnet. One click deploys and streams live logs.',
  },
]

const glassCard =
  'relative rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-emerald-400/[0.04] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:border-emerald-500/20'

export default function HowItWorksSection() {
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
          The Flow
        </motion.span>
        <motion.h2
          variants={fadeUp}
          className="mt-3 font-[Syne] font-bold text-white"
          style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}
        >
          Deploy in three steps.
        </motion.h2>
      </motion.div>

      {/* Cards + SVG connector */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-0 right-0 top-12 hidden md:block"
          height="2"
          style={{ width: '100%' }}
          aria-hidden
        >
          <motion.line
            x1="17%"
            y1="1"
            x2="83%"
            y2="1"
            stroke="#34d399"
            strokeWidth="1"
            strokeDasharray="6 4"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: shouldReduce ? 0 : 0.4 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
          />
        </svg>

        <motion.div
          variants={stagger}
          initial={initial}
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <motion.div key={step.badge} variants={fadeUp} className={glassCard}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-400/10 font-mono text-sm font-semibold text-emerald-400">
                    {step.badge}
                  </span>
                  <Icon size={18} className="text-neutral-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed text-neutral-400">{step.description}</p>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
