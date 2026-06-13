'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import FloatingCode from './FloatingCode'
import TerminalTypewriter from './TerminalTypewriter'

function ShipyardHeroLogo() {
  return (
    <div className="relative mx-auto mb-6 h-16 w-16">
      <div className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl" />
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-emerald-400/[0.04] backdrop-blur-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon.svg" alt="Shipyard" width={32} height={32} className="logo-pulse" />
      </div>
    </div>
  )
}

const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay },
  }),
}

export default function HeroSection() {
  const shouldReduce = useReducedMotion()
  const initial = shouldReduce ? 'visible' : 'hidden'

  return (
    <section
      className="relative flex flex-col items-center justify-center overflow-hidden text-center"
      style={{ minHeight: 'calc(100vh - 56px)' }}
    >
      {/* Aurora background */}
      <div className="aurora-bg absolute inset-0" aria-hidden />

      {/* Floating code fragments */}
      <FloatingCode />

      {/* Emerald ambient glow */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0"
        style={{
          height: '600px',
          background:
            'radial-gradient(ellipse 800px 600px at 50% 0%, rgba(52,211,153,0.08) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4">
        {/* Pre-badge */}
        <motion.div
          custom={0}
          variants={itemVariants}
          initial={initial}
          animate="visible"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="font-mono text-xs text-emerald-400">GenLayer Testnet Live</span>
        </motion.div>

        {/* Logo */}
        <motion.div custom={0.1} variants={itemVariants} initial={initial} animate="visible">
          <ShipyardHeroLogo />
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={0.2}
          variants={itemVariants}
          initial={initial}
          animate="visible"
          className="mb-4 font-[Syne] font-extrabold leading-[1.1] tracking-[-0.02em] text-white"
          style={{ fontSize: 'clamp(32px, 5vw, 56px)' }}
        >
          Deploy Intelligent Contracts
          <br />
          <span className="text-emerald-400">in 60 seconds.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          custom={0.3}
          variants={itemVariants}
          initial={initial}
          animate="visible"
          className="mx-auto mb-8 max-w-lg text-base leading-relaxed text-neutral-400"
        >
          The no-CLI deployment platform for GenLayer Intelligent Contracts.
          Upload Python, configure params, and deploy straight from the browser.
        </motion.p>

        {/* CTA */}
        <motion.div
          custom={0.4}
          variants={itemVariants}
          initial={initial}
          animate="visible"
          className="mb-12 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/templates"
            className="rounded-full border border-white/10 px-6 py-3 font-mono font-semibold text-neutral-300 backdrop-blur-sm transition-colors hover:border-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
          >
            Browse Templates
          </Link>
        </motion.div>

        {/* Terminal mockup */}
        <motion.div
          custom={0.6}
          variants={itemVariants}
          initial={initial}
          animate="visible"
          className="w-full max-w-[460px]"
        >
          <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-emerald-400/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
              <span className="ml-2 font-mono text-xs text-neutral-500">shipyard</span>
            </div>
            <div className="p-4">
              <TerminalTypewriter />
            </div>
          </div>
        </motion.div>

        {/* Scroll chevron */}
        <motion.a
          href="#how-it-works"
          custom={0.8}
          variants={itemVariants}
          initial={initial}
          animate="visible"
          className="mt-10 flex flex-col items-center text-neutral-600 transition-colors hover:text-neutral-400"
          aria-label="Scroll to How It Works"
        >
          <ChevronDown size={20} className="chevron-bounce" />
        </motion.a>
      </div>
    </section>
  )
}
