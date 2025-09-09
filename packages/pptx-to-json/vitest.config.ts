/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.{js,ts}'],
    exclude: ['node_modules', 'dist'],
    typecheck: {
      enabled: false // We'll rely on TypeScript compiler for type checking
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'test/',
        'scripts/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      // Allow importing .js files as .ts when importing TypeScript modules
      '@': '/src'
    }
  }
})