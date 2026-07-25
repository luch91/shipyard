'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
}

export default function CTABanner() {
  const shouldReduce = useReducedMotion()

  return (
    <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-[#101814]">

      {/* Content */}
      <motion.div
        variants={stagger}
        initial={shouldReduce ? 'visible' : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="relative z-10 flex flex-col items-center px-8 py-14 text-center sm:py-16"
      >
        <motion.h2
          variants={fadeUp}
          className="mb-4 font-semibold tracking-[-0.035em] text-white"
          style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
        >
          Start deploying in 60 seconds.
        </motion.h2>
        <motion.p variants={fadeUp} className="mb-8 max-w-md text-sm leading-relaxed text-neutral-400">
          No CLI. No configuration sprawl. Just your Python contract and a browser.
        </motion.p>
        <motion.div variants={fadeUp}>
          <Link
            href="/deploy"
            className="inline-flex min-h-12 items-center gap-2 rounded-md bg-emerald-400 px-6 text-sm font-semibold text-[#07100b] transition-colors hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            Deploy Your First Contract
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
