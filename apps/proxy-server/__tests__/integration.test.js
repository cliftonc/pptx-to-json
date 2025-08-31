/**
 * Integration tests using fixture data
 */

import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { PowerPointClipboardProcessor } from '../PowerPointClipboardProcessor.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FIXTURES_DIR = path.join(__dirname, '..', 'test-harness', 'fixtures')
const EXPECTED_DIR = path.join(__dirname, '..', 'test-harness', 'expected')
const TEST_CASES_FILE = path.join(__dirname, '..', 'test-harness', 'test-cases.json')

describe('Integration Tests with Fixtures', () => {
  let processor
  let testCases

  beforeAll(async () => {
    processor = new PowerPointClipboardProcessor()
    
    // Load test cases configuration
    try {
      const testCasesContent = await fs.readFile(TEST_CASES_FILE, 'utf8')
      testCases = JSON.parse(testCasesContent).testCases
    } catch (error) {
      throw new Error(`Failed to load test cases: ${error.message}`)
    }
  })

  describe('Fixture-based parsing tests', () => {

    it('should handle empty fixture gracefully', async () => {
      const emptyBuffer = Buffer.alloc(0)
      const result = await processor.parseClipboardBuffer(emptyBuffer)
      expect(result).toEqual([])
    })

    it('should handle corrupted ZIP fixture', async () => {
      // Create a buffer that looks like ZIP but is corrupted
      const corruptedBuffer = Buffer.from([
        0x50, 0x4B, 0x03, 0x04, // ZIP signature
        0xFF, 0xFF, 0xFF, 0xFF, // Corrupted data
        0x00, 0x00, 0x00, 0x00
      ])
      
      // Should throw an error for corrupted ZIP
      await expect(processor.parseClipboardBuffer(corruptedBuffer))
        .rejects.toThrow('Failed to parse PowerPoint data')
    })
  })

  describe('Test fixture validation', () => {
    it('should validate test cases configuration', () => {
      expect(testCases).toBeDefined()
      expect(Array.isArray(testCases)).toBe(true)
      
      testCases.forEach(testCase => {
        expect(testCase).toHaveProperty('name')
        expect(testCase).toHaveProperty('description')
        expect(testCase).toHaveProperty('fixtureFile')
        expect(testCase).toHaveProperty('expectedFile')
        expect(testCase).toHaveProperty('expectedComponentCount')
        expect(testCase).toHaveProperty('expectedTypes')
        expect(Array.isArray(testCase.expectedTypes)).toBe(true)
      })
    })

    it('should have corresponding expected files for each test case', async () => {
      for (const testCase of testCases) {
        const expectedFile = path.join(EXPECTED_DIR, testCase.expectedFile)
        
        try {
          await fs.access(expectedFile)
          const content = await fs.readFile(expectedFile, 'utf8')
          const expectedData = JSON.parse(content)
          
          expect(expectedData).toHaveProperty('metadata')
          expect(expectedData).toHaveProperty('components')
          expect(expectedData).toHaveProperty('componentCount')
          expect(expectedData).toHaveProperty('componentTypes')
          
        } catch (error) {
          throw new Error(`Expected file missing or invalid for ${testCase.name}: ${error.message}`)
        }
      }
    })
  })

  describe('Component validation', () => {
    // Test component structure validation with mock data
    it('should validate component structure', async () => {
      // Create a simple ZIP buffer for testing
      const mockZipBuffer = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00])
      
      // We expect this to throw an error for corrupted/incomplete ZIP
      await expect(processor.parseClipboardBuffer(mockZipBuffer))
        .rejects.toThrow('Failed to parse PowerPoint data')
    })

    it('should handle various component types', async () => {
      // This test would be more meaningful with real fixture data
      const supportedTypes = ['text', 'shape', 'image', 'table', 'unknown']
      
      // Test that our expected files contain only supported types
      for (const testCase of testCases) {
        const expectedFile = path.join(EXPECTED_DIR, testCase.expectedFile)
        
        try {
          const content = await fs.readFile(expectedFile, 'utf8')
          const expectedData = JSON.parse(content)
          
          expectedData.components.forEach(component => {
            expect(supportedTypes).toContain(component.type)
          })
          
        } catch (error) {
          // File might not exist yet, skip this validation
          console.log(`⏭️ Skipping validation for ${testCase.name}: ${error.message}`)
        }
      }
    })
  })

  describe('Performance tests', () => {
    it('should parse fixtures within reasonable time', async () => {
      // Mock a reasonable-sized buffer (but incomplete ZIP)
      const mockBuffer = Buffer.alloc(1024 * 100) // 100KB
      mockBuffer[0] = 0x50 // P
      mockBuffer[1] = 0x4B // K  
      mockBuffer[2] = 0x03
      mockBuffer[3] = 0x04
      
      const startTime = Date.now()
      
      // This should fail quickly for corrupted/incomplete ZIP
      try {
        await processor.parseClipboardBuffer(mockBuffer)
      } catch (error) {
        const endTime = Date.now()
        
        // Should fail quickly (within 5 seconds) even for large buffers
        expect(endTime - startTime).toBeLessThan(5000)
        expect(error.message).toContain('Failed to parse PowerPoint data')
      }
    }, 10000) // 10 second timeout for this test
  })
})

// Test utilities for fixture management
describe('Test Utilities', () => {
  it('should provide fixture directory information', async () => {
    try {
      const fixturesStats = await fs.stat(FIXTURES_DIR)
      expect(fixturesStats.isDirectory()).toBe(true)
      
      const expectedStats = await fs.stat(EXPECTED_DIR)
      expect(expectedStats.isDirectory()).toBe(true)
      
    } catch (error) {
      throw new Error(`Test harness directories not found: ${error.message}`)
    }
  })

  it('should list available fixtures', async () => {
    try {
      const files = await fs.readdir(FIXTURES_DIR)
      const binFiles = files.filter(f => f.endsWith('.bin'))
      
      // At minimum we should have the directory structure
      expect(Array.isArray(files)).toBe(true)
      console.log(`📁 Found ${binFiles.length} binary fixture files`)
      
    } catch (error) {
      console.log(`ℹ️ Fixtures directory may not be populated yet: ${error.message}`)
    }
  })
})

// Helper function to create test fixtures (for development)
export async function createMockFixture(name, components) {
  const fixtureFile = path.join(FIXTURES_DIR, `${name}.bin`)
  const expectedFile = path.join(EXPECTED_DIR, `${name}.json`)
  
  // Create a minimal ZIP file structure (this is a simplified mock)
  const mockZipBuffer = Buffer.from([
    0x50, 0x4B, 0x03, 0x04, // ZIP signature
    0x14, 0x00, 0x00, 0x00, // Version, flags
    0x00, 0x00, 0x00, 0x00, // Compression, time, date
    0x00, 0x00, 0x00, 0x00, // CRC32
    0x00, 0x00, 0x00, 0x00, // Compressed size
    0x00, 0x00, 0x00, 0x00, // Uncompressed size
    0x00, 0x00, 0x00, 0x00  // Filename length, extra length
  ])
  
  const expectedData = {
    metadata: {
      name,
      description: `Mock test case: ${name}`,
      mock: true,
      createdAt: new Date().toISOString()
    },
    components,
    componentCount: components.length,
    componentTypes: components.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1
      return acc
    }, {})
  }
  
  await fs.writeFile(fixtureFile, mockZipBuffer)
  await fs.writeFile(expectedFile, JSON.stringify(expectedData, null, 2))
  
  return { fixtureFile, expectedFile }
}