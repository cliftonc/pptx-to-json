#!/usr/bin/env node

/**
 * Log Paste Binary Script
 * 
 * Loads PowerPoint clipboard data from a binary file and parses it to show components.
 * 
 * Usage:
 *   node scripts/log-paste-bin.js <binary-file-path>
 *   node scripts/log-paste-bin.js test-harness/fixtures/orange-rectangle.bin
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { PowerPointClipboardProcessor } from '../PowerPointClipboardProcessor.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function logPasteBinary() {
  // Parse command line arguments
  const args = process.argv.slice(2)
  
  if (args.length < 1) {
    console.log('❌ Usage: node scripts/log-paste-bin.js <binary-file-path> [--debug]')
    console.log('📝 Example: node scripts/log-paste-bin.js test-harness/fixtures/orange-rectangle.bin')
    console.log('📝 Debug:   node scripts/log-paste-bin.js test-harness/fixtures/orange-rectangle.bin --debug')
    process.exit(1)
  }

  const [filePath] = args
  const debugMode = args.includes('--debug')
  
  // Resolve path relative to script location
  const resolvedPath = path.isAbsolute(filePath) 
    ? filePath 
    : path.join(__dirname, '..', filePath)
    
  console.log('📁 Binary file:', resolvedPath)
  
  try {
    // Step 1: Load the binary file
    console.log('\n📥 Step 1: Loading binary file...')
    const buffer = await fs.readFile(resolvedPath)
    console.log('✅ Loaded:', buffer.length, 'bytes')
    
    // Detect file type
    const fileSignature = buffer.subarray(0, 4)
    const isZip = fileSignature[0] === 0x50 && fileSignature[1] === 0x4B
    console.log('🔍 File signature:', Array.from(fileSignature).map(b => b.toString(16).padStart(2, '0')).join(' '))
    console.log('📦 Format detected:', isZip ? 'ZIP/Office Open XML' : 'Unknown binary format')

    // Initialize processor
    const processor = new PowerPointClipboardProcessor()

    // Step 2: Parse the data to get components
    console.log('\n🔄 Step 2: Parsing PowerPoint data...')
    const components = await processor.parseClipboardBuffer(buffer, { debug: debugMode })
    console.log('✅ Parsed:', components.length, 'components')

    if (components.length === 0) {
      console.log('⚠️  No components found - this may not be a valid PowerPoint clipboard file')
      return
    }

    // Analyze components
    const componentTypes = components.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1
      return acc
    }, {})

    console.log('\n📊 Component types found:', componentTypes)
    console.log('\n🎯 Components summary:')
    
    components.forEach((comp, index) => {
      console.log(`\n--- Component ${index + 1} (${comp.type}) ---`)
      console.log('Content:', comp.content || '(no content)')
      console.log('Position:', `(${comp.x}, ${comp.y})`)
      console.log('Size:', `${comp.width} × ${comp.height}`)
      
      if (comp.style) {
        console.log('Style:')
        Object.entries(comp.style).forEach(([key, value]) => {
          if (value && value !== 'transparent' && value !== 'none' && value !== 0) {
            console.log(`  ${key}: ${value}`)
          }
        })
      }
      
      if (comp.metadata) {
        console.log('Metadata:')
        Object.entries(comp.metadata).forEach(([key, value]) => {
          if (value && value !== false && value !== 0) {
            console.log(`  ${key}: ${value}`)
          }
        })
      }
    })

    console.log('\n🔧 Full JSON Output:')
    console.log(JSON.stringify(components, null, 2))

  } catch (error) {
    console.error('\n❌ Error processing binary file:', error.message)
    
    if (error.code === 'ENOENT') {
      console.log('💡 File not found. Check that the path is correct:')
      console.log('   Resolved path:', resolvedPath)
    } else if (error.message.includes('Failed to parse')) {
      console.log('💡 The file may not be a valid PowerPoint clipboard binary format')
    } else if (error.message.includes('ZIP')) {
      console.log('💡 The file appears to be corrupted or not a valid Office Open XML format')
    }
    
    console.error('📋 Stack trace:', error.stack)
    process.exit(1)
  }
}

// Enhanced error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message)
  process.exit(1)
})

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  logPasteBinary()
}

export { logPasteBinary }