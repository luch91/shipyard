'use client'

import Link from 'next/link'
import { ArrowRight, Check, FileCode2, Radio, ShieldCheck } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut', delay },
  }),
}

function ProductPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.1] bg-[#101411] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-500/20 bg-emerald-500/[0.08]">
            <FileCode2 size={14} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-neutral-200">PredictionMarket.py</p>
            <p className="font-mono text-[10px] text-neutral-600">Intelligent Contract</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-2 py-1 text-[10px] font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Ready
        </span>
      </div>

      <div className="grid md:grid-cols-[1.2fr_0.8fr]">
        <div className="border-b border-white/[0.08] p-4 md:border-b-0 md:border-r">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-400">Contract source</span>
            <span className="font-mono text-[10px] text-neutral-600">Python</span>
          </div>
          <div className="rounded-md border border-white/[0.07] bg-[#080b09] p-3 font-mono text-[11px] leading-5">
            <p><span className="text-violet-400">class</span> <span className="text-emerald-300">PredictionMarket</span>(gl.Contract):</p>
            <p className="pl-4 text-neutral-500">question: <span className="text-amber-300">str</span></p>
            <p className="pl-4 text-neutral-500">resolution_url: <span className="text-amber-300">str</span></p>
            <p className="mt-2 pl-4 text-neutral-400">def resolve(self):</p>
            <p className="pl-8 text-neutral-600">return gl.exec_prompt(...)</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <div>
            <p className="mb-2 text-xs font-medium text-neutral-400">Deployment target</p>
            <div className="flex items-center justify-between rounded-md border border-emerald-500/25 bg-emerald-500/[0.06] px-3 py-2.5">
              <span className="flex items-center gap-2 text-xs font-medium text-neutral-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Testnet Bradbury
              </span>
              <Radio size={13} className="text-emerald-400" />
            </div>
          </div>
          <div className="space-y-2 rounded-md border border-white/[0.07] bg-[#0c100d] p-3">
            {['Source validated', 'Parameters configured', 'Wallet connected'].map((label) => (
              <div key={label} className="flex items-center gap-2 text-[11px] text-neutral-400">
                <Check size={12} className="text-emerald-400" />
                {label}
              </div>
            ))}
          </div>
          <div className="mt-auto flex items-center justify-center gap-2 rounded-md bg-emerald-400 px-3 py-2.5 text-xs font-semibold text-[#07100b]">
            <ShieldCheck size={14} />
            Deploy Contract
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const shouldReduce = useReducedMotion()
  const initial = shouldReduce ? 'visible' : 'hidden'

  return (
    <section className="relative overflow-hidden border-b border-white/[0.06]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 65% 70% at 76% 35%, rgba(52,211,153,0.08) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      <div className="relative grid min-h-[calc(100vh-64px)] items-center gap-14 py-16 lg:grid-cols-[0.88fr_1.12fr] lg:py-20">
        <div>
          <motion.div
            custom={0}
            variants={itemVariants}
            initial={initial}
            animate="visible"
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[11px] text-emerald-300">GenLayer Testnet Live</span>
          </motion.div>

          <motion.h1
            custom={0.1}
            variants={itemVariants}
            initial={initial}
            animate="visible"
            className="max-w-2xl text-4xl font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-5xl lg:text-[62px]"
          >
            Deploy Intelligent Contracts{' '}
            <span className="text-emerald-400">in 60 seconds.</span>
          </motion.h1>

          <motion.p
            custom={0.2}
            variants={itemVariants}
            initial={initial}
            animate="visible"
            className="mt-6 max-w-xl text-base leading-7 text-neutral-400 sm:text-lg"
          >
            The no-CLI deployment platform for GenLayer Intelligent Contracts.
            Upload Python, configure parameters, and deploy directly from your browser.
          </motion.p>

          <motion.div
            custom={0.3}
            variants={itemVariants}
            initial={initial}
            animate="visible"
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/deploy"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-emerald-400 px-5 text-sm font-semibold text-[#07100b] transition-colors hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            >
              Start Deploying
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/templates"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/[0.12] bg-white/[0.02] px-5 text-sm font-semibold text-neutral-200 transition-colors hover:border-white/[0.2] hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            >
              Browse Templates
            </Link>
          </motion.div>

          <motion.p
            custom={0.4}
            variants={itemVariants}
            initial={initial}
            animate="visible"
            className="mt-5 text-xs text-neutral-600"
          >
            Five network environments · Browser-based deployment
          </motion.p>
        </div>

        <motion.div
          custom={0.25}
          variants={itemVariants}
          initial={initial}
          animate="visible"
          className="min-w-0"
        >
          <ProductPreview />
        </motion.div>
      </div>
    </section>
  )
}
