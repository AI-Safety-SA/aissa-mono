import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

/**
 * Integration test configuration
 * - Uses Neon test branch (created in globalSetup)
 * - Real database connection
 * - Global setup/teardown for branch lifecycle
 */
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    globalSetup: ['./tests/globalSetup.ts'],
    // Note: teardown is returned from globalSetup (Vitest recommended pattern)
    include: ['tests/int/**/*.int.spec.ts'],
    globals: true,
  },
})
