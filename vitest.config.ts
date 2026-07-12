import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Mirror the tsconfig "@/*" -> "./*" path alias so tests import modules the same
// way the app does.
const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: { '@': rootDir },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
