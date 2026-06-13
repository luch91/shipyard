'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import FloatingCode from './FloatingCode'

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
    <div className="pulse-border relative overflow-hidden rounded-2xl border border-white/[0.08]">
      {/* Aurora background */}
      <div className="aurora-bg absolute inset-0" aria-hidden />

      {/* Floating code */}
      <FloatingCode count={4} speed="slow" />

      {/* Content */}
      <motion.div
        variants={stagger}
        initial={shouldReduce ? 'visible' : 'hidden'}
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        className="relative z-10 flex flex-col items-center px-8 py-16 text-center"
      >
        <motion.h2
          variants={fadeUp}
          className="mb-4 font-[Syne] font-extrabold text-white"
          style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}
        >
          Start deploying in 60 seconds.
        </motion.h2>
        <motion.p variants={fadeUp} className="mb-8 max-w-md text-sm leading-relaxed text-neutral-400">
          No CLI. No setup. Just your Python contract and a browser.
        </motion.p>
        <motion.div variants={fadeUp}>
          <Link
            href="/deploy"
            className="shimmer-btn inline-flex items-center gap-2 rounded-full px-8 py-4 font-mono font-semibold text-neutral-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            Deploy Your First Contract
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
