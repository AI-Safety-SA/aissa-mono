import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

/**
 * Script unit test configuration
 * - Node.js environment for importer scripts that use fs/os/path APIs
 * - No database connection required
 */
export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/unit/scripts/**/*.unit.spec.ts'],
    globals: true,
  },
})
