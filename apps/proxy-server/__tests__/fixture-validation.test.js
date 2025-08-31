/**
 * Test to validate fixture parsing is working
 */

import { describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { PowerPointClipboardProcessor } from '../PowerPointClipboardProcessor.js'

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
    
    console.log('📋 Test cases loaded:', testCases.length)
    
    expect(testCases).toBeDefined()
    expect(Array.isArray(testCases)).toBe(true)
    expect(testCases.length).toBeGreaterThan(0)
    
    // Process each test case
    for (const testCase of testCases) {
      console.log(`\n🧪 Testing fixture: ${testCase.name}`)
      console.log(`📝 Description: ${testCase.description}`)
      
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
      console.log('🔄 Parsing fixture with PowerPointClipboardProcessor...')
      const actualComponents = await processor.parseClipboardBuffer(fixtureBuffer)
      
      // Perform comprehensive validation
      await validateParsingResults(actualComponents, expectedData, testCase)
      
      console.log(`✅ ${testCase.name} validation complete!`)
    }
    
    console.log('\n🎉 All fixture validations complete!')
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
    
    console.log('✅ Test case configuration is valid')
  })
})

// Helper functions
async function validateFilesExist(fixtureFile, expectedFile, testName) {
  try {
    await fs.access(fixtureFile)
    console.log('✅ Fixture file exists')
  } catch {
    throw new Error(`Fixture file missing for ${testName}: ${fixtureFile}`)
  }
  
  try {
    await fs.access(expectedFile)
    console.log('✅ Expected file exists')
  } catch {
    throw new Error(`Expected file missing for ${testName}: ${expectedFile}`)
  }
}

async function loadTestData(fixtureFile, expectedFile) {
  const fixtureBuffer = await fs.readFile(fixtureFile)
  const expectedContent = await fs.readFile(expectedFile, 'utf8')
  const expectedData = JSON.parse(expectedContent)
  
  console.log('📦 Fixture buffer size:', fixtureBuffer.length, 'bytes')
  console.log('📄 Expected components:', expectedData.componentCount)
  
  return { fixtureBuffer, expectedData }
}

async function validateParsingResults(actualComponents, expectedData, testCase) {
  console.log('🎯 Actual components parsed:', actualComponents.length)
  console.log('🔍 Actual component types:', actualComponents.map(c => c.type))
  console.log('📋 Expected component types:', testCase.expectedTypes)
  
  // Create the actual result object in the same format as expected
  const actualResult = {
    componentCount: actualComponents.length,
    componentTypes: actualComponents.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1
      return acc
    }, {}),
    components: actualComponents
  }
  
  console.log('\n🔄 Comparing actual vs expected results...')
  console.log('📊 Expected componentCount:', expectedData.componentCount)
  console.log('📊 Actual componentCount:', actualResult.componentCount)
  console.log('📊 Expected componentTypes:', expectedData.componentTypes)
  console.log('📊 Actual componentTypes:', actualResult.componentTypes)
  
  // 1. Compare component count
  expect(actualResult.componentCount).toBe(expectedData.componentCount)
  expect(actualResult.componentCount).toBe(testCase.expectedComponentCount)
  
  // 2. Compare component type distribution
  expect(actualResult.componentTypes).toEqual(expectedData.componentTypes)
  
  // 3. Compare the actual components array with expected components
  if (expectedData.components && expectedData.components.length > 0) {
    console.log('\n🔍 Comparing component arrays...')
    
    // Compare each component
    actualResult.components.forEach((actualComp, index) => {
      const expectedComp = expectedData.components[index]
      
      if (expectedComp) {
        console.log(`\n📝 Component ${index + 1}:`)
        console.log(`   Expected: ${expectedComp.type} - "${expectedComp.content}"`)
        console.log(`   Actual:   ${actualComp.type} - "${actualComp.content}"`)
        
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
        
        console.log(`   ✅ Component ${index + 1} matches expected structure`)
      }
    })
    
    // Ensure we have the same number of components
    expect(actualResult.components).toHaveLength(expectedData.components.length)
    
    console.log('✅ All components match expected output!')
  } else {
    console.log('⚠️ No expected components to compare against')
  }
  
  console.log('\n✅ Validation complete - actual output matches expected!')
}