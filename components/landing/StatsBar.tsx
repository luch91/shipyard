'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate, useInView, useReducedMotion } from 'framer-motion'

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
    <motion.span ref={ref} className="font-[Syne] text-4xl font-extrabold text-emerald-400">
      {rounded}
    </motion.span>
  )
}

const STATS = [
  { target: 20, label: 'Templates' },
  { target: 4,  label: 'Networks' },
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
      className="flex flex-wrap justify-center gap-6 py-8"
    >
      {STATS.map((stat) => (
        <motion.div
          key={stat.label}
          variants={fadeUp}
          className="flex flex-col items-center gap-1 rounded-full border border-white/[0.06] bg-white/[0.03] px-8 py-4 backdrop-blur-sm"
        >
          <StatCounter target={stat.target} />
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-500">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  )
}
