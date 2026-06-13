'use client'

import { motion, useReducedMotion } from 'framer-motion'

const ALL_FRAGMENTS = [
  "@gl.public.view\ndef get_value(self) -> str:\n    return self.state_var",
  "class MyContract(gl.Contract):\n    state_var: str",
  "@gl.public.write\ndef set_value(self, v: str):\n    self.state_var = v",
  '# { "Depends": "py-genlayer:1jb4..." }',
  "from genlayer import *",
  "self.state_var = initial_value",
]

const SEEDS = [
  { x: 8,  delay: 0,   duration: 12 },
  { x: 25, delay: 2.5, duration: 15 },
  { x: 55, delay: 5,   duration: 10 },
  { x: 70, delay: 1,   duration: 16 },
  { x: 40, delay: 3.5, duration: 13 },
  { x: 85, delay: 6,   duration: 11 },
]

interface Props {
  count?: number
  speed?: 'normal' | 'slow'
}

export default function FloatingCode({ count = 6, speed = 'normal' }: Props) {
  const shouldReduce = useReducedMotion()
  if (shouldReduce) return null

  const fragments = ALL_FRAGMENTS.slice(0, count)
  const speedMult = speed === 'slow' ? 1.5 : 1

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {fragments.map((frag, i) => {
        const seed = SEEDS[i]
        return (
          <motion.pre
            key={i}
            className="absolute font-mono text-[11px] leading-relaxed text-neutral-500 whitespace-pre"
            style={{ left: `${seed.x}%`, top: '100%', opacity: 0.06 }}
            animate={{ y: [0, -2000] }}
            transition={{
              duration: seed.duration * speedMult,
              delay: seed.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {frag}
          </motion.pre>
        )
      })}
    </div>
  )
}
