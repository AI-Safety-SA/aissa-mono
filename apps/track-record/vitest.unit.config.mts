import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

/**
 * Unit test configuration
 * - No database connection required
 * - Fast execution
 * - Mocked dependencies
 */
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/unit/**/*.unit.spec.{ts,tsx}'],
    exclude: ['tests/unit/scripts/**/*.unit.spec.ts'],
    globals: true,
  },
})
