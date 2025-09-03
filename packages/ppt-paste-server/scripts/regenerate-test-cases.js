#!/usr/bin/env node

/**
 * Regenerate Test Cases Script
 * 
 * Re-processes all existing .bin fixture files through the current PowerPoint parser
 * and updates the expected output files. This is useful after making changes to the
 * parsing logic to ensure all test cases reflect the new correct output.
 * 
 * Usage:
 *   node scripts/regenerate-test-cases.js
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { PowerPointClipboardProcessor } from '../dist/processors/PowerPointClipboardProcessor.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const FIXTURES_DIR = path.join(__dirname, '..', 'test', 'test-harness', 'fixtures')
const EXPECTED_DIR = path.join(__dirname, '..', 'test', 'test-harness', 'expected')
const TEST_CASES_FILE = path.join(__dirname, '..', 'test', 'test-harness', 'test-cases.json')

function truncateForLogging(components) {
  return components.map(component => {
    const truncated = { ...component }
    
    // Truncate content field if it's longer than 100 characters
    if (truncated.content && truncated.content.length > 100) {
      truncated.content = truncated.content.substring(0, 100) + '...'
    }
    
    // Truncate imageUrl in metadata if present
    if (truncated.metadata && truncated.metadata.imageUrl && truncated.metadata.imageUrl.length > 100) {
      truncated.metadata = { ...truncated.metadata }
      truncated.metadata.imageUrl = truncated.metadata.imageUrl.substring(0, 100) + '...'
    }
    
    return truncated
  })
}

function truncateUrlsOnly(components) {
  return components.map(component => {
    const truncated = { ...component }
    
    // Only truncate URLs in metadata, not content
    if (truncated.metadata) {
      truncated.metadata = { ...truncated.metadata }
      
      // Truncate imageUrl in metadata if present
      if (truncated.metadata.imageUrl && truncated.metadata.imageUrl.length > 100) {
        truncated.metadata.imageUrl = truncated.metadata.imageUrl.substring(0, 100) + '...'
      }
      
      // Truncate dataUrl in metadata if present (common for images)
      if (truncated.metadata.dataUrl && truncated.metadata.dataUrl.length > 100) {
        truncated.metadata.dataUrl = truncated.metadata.dataUrl.substring(0, 100) + '...'
      }
    }
    
    return truncated
  })
}

async function regenerateTestCase(testCase) {
  console.log(`\n🔄 Processing: ${testCase.name}`)
  console.log(`📄 Description: ${testCase.description}`)
  
  const fixtureFile = path.join(FIXTURES_DIR, testCase.fixtureFile)
  const expectedFile = path.join(EXPECTED_DIR, testCase.expectedFile)
  
  try {
    // Check if fixture file exists
    try {
      await fs.access(fixtureFile)
    } catch (error) {
      console.log(`⚠️  Fixture file not found: ${fixtureFile}`)
      return { success: false, error: 'Fixture file not found' }
    }
    
    // Read the binary fixture file
    console.log(`📥 Loading fixture: ${testCase.fixtureFile}`)
    const buffer = await fs.readFile(fixtureFile)
    console.log(`✅ Loaded: ${buffer.length} bytes`)
    
    // Initialize processor and parse the data
    const processor = new PowerPointClipboardProcessor()
    console.log(`🔄 Parsing PowerPoint data...`)
    const result = await processor.parseClipboardBuffer(buffer)
    
    // Extract components from the slide-based structure
    const components = []
    if (result.slides) {
      result.slides.forEach(slide => {
        if (slide.components) {
          components.push(...slide.components)
        }
      })
    }
    
    console.log(`✅ Parsed: ${components.length} components`)
    
    // Analyze components
    const componentTypes = components.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1
      return acc
    }, {})
    const expectedTypes = [...new Set(components.map(c => c.type))]
    
    console.log(`📊 Component types found:`, componentTypes)
    const truncatedForDisplay = truncateForLogging(components)
    truncatedForDisplay.forEach((comp, index) => {
      console.log(`   ${index + 1}. ${comp.type}: "${comp.content || 'N/A'}" at (${comp.x}, ${comp.y})`)
    })
    
    // Create expected output (preserving original metadata but updating parsed data)
    const originalMetadata = testCase
    
    // Apply URL truncation to components before saving (preserving content)
    const componentsWithTruncatedUrls = truncateUrlsOnly(components)
    
    const expectedOutput = {
      metadata: {
        name: testCase.name,
        description: testCase.description,
        downloadedAt: new Date().toISOString(), // Update timestamp
        size: buffer.length,
        contentType: "application/octet-stream",
        url: testCase.url // Preserve original URL
      },
      components: componentsWithTruncatedUrls,
      componentCount: componentsWithTruncatedUrls.length,
      componentTypes: componentTypes
    }
    
    // Save expected output
    console.log(`💾 Saving expected output: ${testCase.expectedFile}`)
    await fs.writeFile(expectedFile, JSON.stringify(expectedOutput, null, 2))
    console.log(`✅ Saved expected output`)
    
    // Return updated test case data
    return {
      success: true,
      updatedTestCase: {
        ...testCase,
        expectedComponentCount: components.length,
        expectedTypes: expectedTypes
      },
      componentCount: components.length,
      componentTypes: expectedTypes
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${testCase.name}:`, error.message)
    return { 
      success: false, 
      error: error.message,
      updatedTestCase: testCase // Return original on error
    }
  }
}

async function regenerateAllTestCases() {
  console.log('🚀 Regenerating all test cases...')
  console.log('📋 This will update all expected output files to match current parser behavior\n')
  
  try {
    // Read existing test cases configuration
    console.log('📥 Loading test cases configuration...')
    const testCasesContent = await fs.readFile(TEST_CASES_FILE, 'utf8')
    const testCasesConfig = JSON.parse(testCasesContent)
    console.log(`✅ Found ${testCasesConfig.testCases.length} test cases`)
    
    // Process each test case
    const results = []
    const updatedTestCases = []
    
    for (const testCase of testCasesConfig.testCases) {
      const result = await regenerateTestCase(testCase)
      results.push(result)
      updatedTestCases.push(result.updatedTestCase || testCase)
    }
    
    // Update the test cases configuration with new expected counts/types
    console.log('\n📝 Updating test cases configuration...')
    const updatedConfig = {
      ...testCasesConfig,
      testCases: updatedTestCases,
      metadata: {
        ...testCasesConfig.metadata,
        lastUpdated: new Date().toISOString(),
        lastRegenerated: new Date().toISOString()
      }
    }
    
    await fs.writeFile(TEST_CASES_FILE, JSON.stringify(updatedConfig, null, 2))
    console.log('✅ Updated test cases configuration')
    
    // Summary
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    
    console.log('\n🎉 Regeneration complete!')
    console.log(`✅ Successfully processed: ${successful.length} test cases`)
    if (failed.length > 0) {
      console.log(`❌ Failed to process: ${failed.length} test cases`)
      failed.forEach(failure => {
        console.log(`   • ${failure.updatedTestCase?.name || 'Unknown'}: ${failure.error}`)
      })
    }
    
    console.log('\n📊 Summary of changes:')
    successful.forEach(result => {
      const testCase = result.updatedTestCase
      console.log(`   • ${testCase.name}: ${result.componentCount} components (${result.componentTypes.join(', ')})`)
    })
    
    console.log('\n▶️ You can now run the tests with:')
    console.log('   npm test -- __tests__/fixture-validation.test.js')
    
  } catch (error) {
    console.error('❌ Error regenerating test cases:', error.message)
    console.error('📋 Stack trace:', error.stack)
    process.exit(1)
  }
}

// Enhanced error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message)
  if (error.message.includes('Failed to parse')) {
    console.log('💡 One of the fixture files may be corrupted or in an unexpected format')
  } else if (error.message.includes('ENOENT')) {
    console.log('💡 Check that all fixture files exist in the test-harness/fixtures directory')
  }
  process.exit(1)
})

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  regenerateAllTestCases()
}

export { regenerateAllTestCases, regenerateTestCase }