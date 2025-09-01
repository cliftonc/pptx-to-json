import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',
    
    // Test file patterns
    include: [
      '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      '.git',
      'test-harness/fixtures/**',
      'test-harness/expected/**'
    ],
    
    // Global test settings
    globals: true,
    
    // Reporter settings
    reporter: ['verbose'],
    
    // Coverage settings
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        '__tests__/**',
        'test-harness/**',
        'scripts/**',
        'vitest.config.js',
        'server.js' // Exclude the express server from coverage
      ],
      include: [
        'PowerPointClipboardProcessor.js',
        'parsers/**/*.js'
      ]
    },
    
    // Test timeout (30 seconds for integration tests that might download data)
    testTimeout: 30000,
    
    // Setup files
    setupFiles: [],
    
    // Allow tests to run in isolation
    isolate: true,
    
    // Pool options for parallel execution
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false
      }
    }
  },
  
  // Resolve settings
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
      '@test-harness': path.resolve(__dirname, 'test-harness'),
      '@fixtures': path.resolve(__dirname, 'test-harness/fixtures'),
      '@expected': path.resolve(__dirname, 'test-harness/expected')
    }
  }
})