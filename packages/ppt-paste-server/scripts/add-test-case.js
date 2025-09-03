#!/usr/bin/env node

/**
 * Add Test Case Script
 * 
 * Downloads PowerPoint clipboard data from a Microsoft URL and creates a complete test case.
 * 
 * Usage:
 *   node scripts/add-test-case.js "simple-shape" "https://euc-powerpoint.officeapps.live.com/pods/GetClipboardBytes.ashx?..."
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

async function addTestCase() {
  // Parse command line arguments
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.log('❌ Usage: node scripts/add-test-case.js <name> <url> [description]')
    console.log('📝 Example: node scripts/add-test-case.js "simple-shape" "https://euc-powerpoint.officeapps.live.com/pods/GetClipboardBytes.ashx?..."')
    process.exit(1)
  }

  const [name, url, description] = args
  const finalDescription = description || `PowerPoint content: ${name}`

  console.log('🚀 Creating new test case...')
  console.log('📝 Name:', name)
  console.log('🔗 URL:', url)
  console.log('📄 Description:', finalDescription)

  try {
    // Initialize processor
    const processor = new PowerPointClipboardProcessor()

    // Step 1: Download the clipboard data
    console.log('\n📥 Step 1: Downloading clipboard data...')
    const fetchResult = await processor.fetchClipboardData(url)
    console.log('✅ Downloaded:', fetchResult.size, 'bytes')
    console.log('📦 Content-Type:', fetchResult.contentType)

    // Step 2: Parse the data to get components
    console.log('\n🔄 Step 2: Parsing PowerPoint data...')
    const result = await processor.parseClipboardBuffer(fetchResult.buffer)

    // Extract components from the new slide-based structure
    const components = []
    if (result.slides) {
      result.slides.forEach(slide => {
        if (slide.components) {
          components.push(...slide.components)
        }
      })
    }
    
    console.log('✅ Parsed:', components.length, 'components')

    // Analyze components
    const componentTypes = components.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1
      return acc
    }, {})
    const expectedTypes = [...new Set(components.map(c => c.type))]

    console.log('📊 Component types found:', componentTypes)
    console.log('🎯 Components summary:')
    const truncatedForDisplay = truncateForLogging(components)
    truncatedForDisplay.forEach((comp, index) => {
      console.log(`   ${index + 1}. ${comp.type}: "${comp.content}" at (${comp.x}, ${comp.y})`)
    })

    // Step 3: Save binary fixture
    console.log('\n💾 Step 3: Saving fixture file...')
    const fixtureFile = path.join(FIXTURES_DIR, `${name}.bin`)
    await fs.writeFile(fixtureFile, fetchResult.buffer)
    console.log('✅ Saved fixture:', fixtureFile)

    // Step 4: Create expected output
    console.log('\n📋 Step 4: Creating expected output...')
    
    // Apply URL truncation to components before saving (preserving content)
    const componentsWithTruncatedUrls = truncateUrlsOnly(components)
    
    const expectedOutput = {
      metadata: {
        name,
        description: finalDescription,
        downloadedAt: new Date().toISOString(),
        size: fetchResult.size,
        contentType: fetchResult.contentType,
        url: url // Store original URL for reference
      },
      components: componentsWithTruncatedUrls,
      componentCount: componentsWithTruncatedUrls.length,
      componentTypes: componentTypes
    }

    const expectedFile = path.join(EXPECTED_DIR, `${name}.json`)
    await fs.writeFile(expectedFile, JSON.stringify(expectedOutput, null, 2))
    console.log('✅ Saved expected output:', expectedFile)

    // Step 5: Update test-cases.json
    console.log('\n📝 Step 5: Updating test cases configuration...')
    
    let testCasesConfig
    try {
      const existingContent = await fs.readFile(TEST_CASES_FILE, 'utf8')
      testCasesConfig = JSON.parse(existingContent)
    } catch (error) {
      // Create new config if file doesn't exist
      testCasesConfig = {
        testCases: [],
        metadata: {
          version: "1.0.0",
          created: new Date().toISOString().split('T')[0],
          description: "Test cases for PowerPoint clipboard processing"
        }
      }
    }

    // Check if test case already exists
    const existingIndex = testCasesConfig.testCases.findIndex(tc => tc.name === name)
    
    const newTestCase = {
      name,
      description: finalDescription,
      url,
      fixtureFile: `${name}.bin`,
      expectedFile: `${name}.json`,
      expectedComponentCount: components.length,
      expectedTypes: expectedTypes
    }

    if (existingIndex >= 0) {
      console.log('⚠️ Test case already exists, updating...')
      testCasesConfig.testCases[existingIndex] = newTestCase
    } else {
      console.log('➕ Adding new test case...')
      testCasesConfig.testCases.push(newTestCase)
    }

    // Update metadata
    testCasesConfig.metadata.lastUpdated = new Date().toISOString()

    await fs.writeFile(TEST_CASES_FILE, JSON.stringify(testCasesConfig, null, 2))
    console.log('✅ Updated test cases configuration')

    // Step 6: Summary
    console.log('\n🎉 Test case created successfully!')
    console.log('📁 Files created:')
    console.log(`   • ${fixtureFile}`)
    console.log(`   • ${expectedFile}`)
    console.log(`   • Updated ${TEST_CASES_FILE}`)
    console.log('\n▶️ You can now run the test with:')
    console.log(`   npm test -- __tests__/fixture-validation.test.js`)
    console.log('\n📊 Test case details:')
    console.log(`   • Name: ${name}`)
    console.log(`   • Components: ${components.length}`)
    console.log(`   • Types: ${expectedTypes.join(', ')}`)
    console.log(`   • Size: ${fetchResult.size} bytes`)

  } catch (error) {
    console.error('❌ Error creating test case:', error.message)
    console.error('📋 Stack trace:', error.stack)
    process.exit(1)
  }
}

// Enhanced error handling for specific common errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message)
  if (error.message.includes('Only Microsoft Office URLs are allowed')) {
    console.log('💡 Make sure the URL is from a valid Microsoft domain')
  } else if (error.message.includes('Microsoft API error')) {
    console.log('💡 The PowerPoint URL may have expired or be invalid')
  } else if (error.message.includes('Failed to parse')) {
    console.log('💡 The downloaded data may not be valid PowerPoint clipboard format')
  }
  process.exit(1)
})

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  addTestCase()
}

export { addTestCase }