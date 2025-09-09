/**
 * Test to validate fixture parsing is working
 */

import { describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { PowerPointClipboardProcessor } from '../../src/processors/PowerPointClipboardProcessor.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FIXTURES_DIR = path.join(__dirname, '..', 'test-harness', 'fixtures')
const EXPECTED_DIR = path.join(__dirname, '..', 'test-harness', 'expected')
const TEST_CASES_FILE = path.join(__dirname, '..', 'test-harness', 'test-cases.json')

describe('Real Fixture Validation', () => {
  let processor

  beforeAll(async () => {
    processor = new PowerPointClipboardProcessor()
  })

  it('should parse all available fixtures and match expected output', async () => {
    // Load test cases
    const testCasesContent = await fs.readFile(TEST_CASES_FILE, 'utf8')
    const { testCases } = JSON.parse(testCasesContent)
    
    // Test cases loaded
    
    expect(testCases).toBeDefined()
    expect(Array.isArray(testCases)).toBe(true)
    expect(testCases.length).toBeGreaterThan(0)
    
    // Process each test case
    for (const testCase of testCases) {
      // Testing fixture: ${testCase.name}
      
      const fixtureFile = path.join(FIXTURES_DIR, testCase.fixtureFile)
      const expectedFile = path.join(EXPECTED_DIR, testCase.expectedFile)
      
      // Check if files exist
      await validateFilesExist(fixtureFile, expectedFile, testCase.name)
      
      // Load fixture and expected data
      const { fixtureBuffer, expectedData } = await loadTestData(fixtureFile, expectedFile)
      
      // Skip placeholder test cases that don't have real data
      if (expectedData.metadata?.placeholder && !expectedData.metadata?.downloadedAt) {
        console.log('⏭️ Skipping placeholder test case (no real data)')
        continue
      }
      
      // Parse the fixture using the actual processor
      const parseResult = await processor.parseClipboardBuffer(fixtureBuffer)
      
      // Extract components from slides for backward compatibility with existing expected data
      const actualComponents = []
      if (parseResult.slides) {
        parseResult.slides.forEach(slide => {
          if (slide.components) {
            actualComponents.push(...slide.components)
          }
        })
      }
      
      // Perform comprehensive validation
      await validateParsingResults(actualComponents, expectedData, testCase)
      
      // ${testCase.name} validation complete
    }
    
    // All fixture validations complete
  })

  // Helper test to validate test case configuration
  it('should have valid test case configuration', async () => {
    const testCasesContent = await fs.readFile(TEST_CASES_FILE, 'utf8')
    const { testCases } = JSON.parse(testCasesContent)
    
    expect(testCases).toBeDefined()
    expect(Array.isArray(testCases)).toBe(true)
    expect(testCases.length).toBeGreaterThan(0)
    
    testCases.forEach(testCase => {
      expect(testCase).toHaveProperty('name')
      expect(testCase).toHaveProperty('description') 
      expect(testCase).toHaveProperty('fixtureFile')
      expect(testCase).toHaveProperty('expectedFile')
      expect(testCase).toHaveProperty('expectedComponentCount')
      expect(testCase).toHaveProperty('expectedTypes')
      expect(Array.isArray(testCase.expectedTypes)).toBe(true)
    })
    
    // Test case configuration is valid
  })
})

// Helper functions
async function validateFilesExist(fixtureFile, expectedFile, testName) {
  try {
    await fs.access(fixtureFile)
    // Fixture file exists
  } catch {
    throw new Error(`Fixture file missing for ${testName}: ${fixtureFile}`)
  }
  
  try {
    await fs.access(expectedFile)
    // Expected file exists
  } catch {
    throw new Error(`Expected file missing for ${testName}: ${expectedFile}`)
  }
}

async function loadTestData(fixtureFile, expectedFile) {
  const fixtureBuffer = await fs.readFile(fixtureFile)
  const expectedContent = await fs.readFile(expectedFile, 'utf8')
  const expectedData = JSON.parse(expectedContent)
  
  // Fixture buffer loaded
  
  return { fixtureBuffer, expectedData }
}

async function validateParsingResults(actualComponents, expectedData, testCase) {
  // Comparing actual vs expected results
  
  // Create the actual result object in the same format as expected
  const actualResult = {
    componentCount: actualComponents.length,
    componentTypes: actualComponents.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1
      return acc
    }, {}),
    components: actualComponents
  }
  
  // Comparing counts and types
  
  // 1. Compare component count
  expect(actualResult.componentCount).toBe(expectedData.componentCount)
  expect(actualResult.componentCount).toBe(testCase.expectedComponentCount)
  
  // 2. Compare component type distribution
  expect(actualResult.componentTypes).toEqual(expectedData.componentTypes)
  
  // 3. Compare the actual components array with expected components
  if (expectedData.components && expectedData.components.length > 0) {
    // Comparing component arrays
    
    // Compare each component
    actualResult.components.forEach((actualComp, index) => {
      const expectedComp = expectedData.components[index]
      
      if (expectedComp) {
        // Compare the entire component object structure
        // Note: We may need to be flexible about dynamic fields like IDs and timestamps
        expect(actualComp.type).toBe(expectedComp.type)
        expect(actualComp.content).toBe(expectedComp.content)
        expect(actualComp.x).toBe(expectedComp.x)
        expect(actualComp.y).toBe(expectedComp.y)
        expect(actualComp.width).toBe(expectedComp.width)
        expect(actualComp.height).toBe(expectedComp.height)
        
        // Compare style objects
        if (expectedComp.style) {
          expect(actualComp.style).toMatchObject(expectedComp.style)
        }
      }
    })
    
    // Ensure we have the same number of components
    expect(actualResult.components).toHaveLength(expectedData.components.length)
    
    // All components match expected output
  } else {
    // No expected components to compare against
  }
  
  // Validation complete - actual output matches expected
}