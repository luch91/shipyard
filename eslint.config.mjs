import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'

export default defineConfig([
  ...nextVitals,
  {
    // React 19's new rule flags established hydration/data-loading effects.
    // Retain the pre-migration lint baseline; refactoring those flows is outside
    // this infrastructure-only migration.
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  globalIgnores(['.next/**', '.vinext/**', '.cloudflare/**', 'dist/**']),
])
