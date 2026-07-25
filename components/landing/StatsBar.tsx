'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate, useInView, useReducedMotion } from 'framer-motion'
import { TOTAL_NETWORK_COUNT } from '@/lib/genlayer/networks'

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
}

interface CounterProps {
  target: number
}

function StatCounter({ target }: CounterProps) {
  const shouldReduce = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const count = useMotionValue(shouldReduce ? target : 0)
  const rounded = useTransform(count, Math.round)

  useEffect(() => {
    if (inView && !shouldReduce) {
      const controls = animate(count, target, { duration: 1.2, ease: 'easeOut' })
      return controls.stop
    }
  }, [inView, target, count, shouldReduce])

  return (
    <motion.span ref={ref} className="text-3xl font-semibold tracking-[-0.03em] text-emerald-400">
      {rounded}
    </motion.span>
  )
}

const STATS = [
  { target: 20, label: 'Templates' },
  { target: TOTAL_NETWORK_COUNT, label: 'Networks' },
  { target: 0,  label: 'CLI Required' },
]

export default function StatsBar() {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      variants={stagger}
      initial={shouldReduce ? 'visible' : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      className="grid grid-cols-1 border-b border-white/[0.07] sm:grid-cols-3"
    >
      {STATS.map((stat, index) => (
        <motion.div
          key={stat.label}
          variants={fadeUp}
          className={`flex items-center justify-center gap-3 px-6 py-6 sm:py-7 ${
            index > 0 ? 'border-t border-white/[0.07] sm:border-l sm:border-t-0' : ''
          }`}
        >
          <StatCounter target={stat.target} />
          <span className="text-xs font-medium uppercase tracking-[0.1em] text-neutral-500">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  )
}
