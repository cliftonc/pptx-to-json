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
import { PowerPointClipboardProcessor } from '../src/processors/PowerPointClipboardProcessor.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function logPaste() {
  // Parse command line arguments
  const args = process.argv.slice(2)
  console.log(args)
  if (args.length < 1) {
    console.log('❌ Usage: node scripts/log-paste.js <url>')
    console.log('📝 Example: node scripts/log-paste.js "https://euc-powerpoint.officeapps.live.com/pods/GetClipboardBytes.ashx?..."')
    process.exit(1)
  }

  const [url] = args  
  console.log('🔗 URL:', url)
  
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
    const components = await processor.parseClipboardBuffer(fetchResult.buffer, { debug: true})
    console.log('✅ Parsed:', components.length, 'components')

    // Analyze components
    const componentTypes = components.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1
      return acc
    }, {})
    const expectedTypes = [...new Set(components.map(c => c.type))]

    console.log('📊 Component types found:', componentTypes)
    console.log('🎯 Components summary:')
    components.forEach((comp, index) => {
      console.log(`Component ${index}:`);
      console.log(JSON.stringify(comp, null, 2))
    })

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
  logPaste()
}

export { logPaste }