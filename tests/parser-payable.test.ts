import { describe, expect, it } from 'vitest'
import { parseContract } from '@/lib/genlayer/parser'

describe('payable contract methods', () => {
  it('recognizes @gl.public.write.payable and preserves ordinary writes', () => {
    const parsed = parseContract(`
from genlayer import *

class TipJar(gl.Contract):
    def __init__(self):
        self.total = u256(0)

    @gl.public.write.payable
    def tip(self, note: str):
        self.total = self.total + gl.message.value

    @gl.public.write
    def reset(self):
        self.total = u256(0)

    @gl.public.view
    def total_tips(self) -> int:
        return self.total
`)

    expect(parsed.methods).toEqual([
      expect.objectContaining({ name: 'tip', type: 'write', payable: true }),
      expect.objectContaining({ name: 'reset', type: 'write', payable: false }),
      expect.objectContaining({ name: 'total_tips', type: 'read', payable: false }),
    ])
    expect(parsed.methods[0].params).toEqual([
      expect.objectContaining({ name: 'note', type: 'str', required: true }),
    ])
  })
})
