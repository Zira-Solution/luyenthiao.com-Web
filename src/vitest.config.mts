import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
    // React 19.2+ strips `React.act` from production builds, but
    // @testing-library/react falls back to `react-dom/test-utils.act`,
    // which calls `React.act` and crashes. Run tests against the dev
    // build (where `React.act` exists) like the React docs recommend.
    env: {
      NODE_ENV: 'development',
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
    },
  },
})
