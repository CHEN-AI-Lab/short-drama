import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      shared: path.resolve(__dirname, 'shared'),
    },
  },
})
