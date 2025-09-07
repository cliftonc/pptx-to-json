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
import { PowerPointClipboardProcessor } from '../dist/processors/PowerPointClipboardProcessor.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Helper function to truncate individual values for display
function truncateValue(value) {
  // Handle null/undefined
  if (value == null) {
    return value
  }
  
  // Handle arrays
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return '[]'
    } else if (value.length <= 3) {
      return `[${value.map(v => truncateValue(v)).join(', ')}]`
    } else {
      return `[${value.slice(0, 3).map(v => truncateValue(v)).join(', ')}, ... +${value.length - 3} more]`
    }
  }
  
  // Handle objects
  if (typeof value === 'object') {
    const keys = Object.keys(value)
    if (keys.length === 0) {
      return '{}'
    } else if (keys.length <= 2) {
      const entries = keys.map(key => `${key}: ${truncateValue(value[key])}`).join(', ')
      return `{${entries}}`
    } else {
      const entries = keys.slice(0, 2).map(key => `${key}: ${truncateValue(value[key])}`).join(', ')
      return `{${entries}, ... +${keys.length - 2} more keys}`
    }
  }
  
  // Handle strings
  if (typeof value === 'string') {
    if (value.length <= 100) {
      return value
    }
    
    // Check if it's a data URL or base64 string
    if (value.startsWith('data:') || value.match(/^[A-Za-z0-9+/]+=*$/)) {
      return value.substring(0, 100) + '...'
    } else if (value.startsWith('http')) {
      // Truncate regular URLs too
      return value.substring(0, 100) + '...'
    } else if (value.length > 200) {
      // Truncate any other very long strings
      return value.substring(0, 100) + '...'
    }
  }
  
  // Handle other primitives (numbers, booleans, etc.)
  return value
}

function truncateForLogging(components) {
  return components.map(component => {
    const truncated = { ...component }
    
    // Truncate content field if it's longer than 100 characters
    if (truncated.content && truncated.content.length > 100) {
      truncated.content = truncated.content.substring(0, 100) + '...'
    }
    
    // Enhanced base64 and URL truncation in metadata
    if (truncated.metadata) {
      truncated.metadata = { ...truncated.metadata }
      
      // Truncate any field that looks like a base64 data URL or long URL
      Object.keys(truncated.metadata).forEach(key => {
        const value = truncated.metadata[key]
        if (typeof value === 'string' && value.length > 100) {
          // Check if it's a data URL or base64 string
          if (value.startsWith('data:') || value.match(/^[A-Za-z0-9+/]+=*$/)) {
            truncated.metadata[key] = value.substring(0, 100) + '...'
          } else if (value.startsWith('http')) {
            // Truncate regular URLs too
            truncated.metadata[key] = value.substring(0, 100) + '...'
          } else if (value.length > 200) {
            // Truncate any other very long strings
            truncated.metadata[key] = value.substring(0, 100) + '...'
          }
        }
      })
    }
    
    // Also check style object for long values
    if (truncated.style) {
      truncated.style = { ...truncated.style }
      Object.keys(truncated.style).forEach(key => {
        const value = truncated.style[key]
        if (typeof value === 'string' && value.length > 100) {
          truncated.style[key] = value.substring(0, 100) + '...'
        }
      })
    }
    
    // Truncate src property (common for images with data URLs)
    if (truncated.src && typeof truncated.src === 'string' && truncated.src.length > 100) {
      truncated.src = truncated.src.substring(0, 100) + '...'
    }
    
    // Truncate alt property if it's unusually long
    if (truncated.alt && typeof truncated.alt === 'string' && truncated.alt.length > 100) {
      truncated.alt = truncated.alt.substring(0, 100) + '...'
    }
    
    return truncated
  })
}

async function logPasteBinary() {
  // Parse command line arguments
  const args = process.argv.slice(2)
  
  if (args.length < 1) {
    console.log('❌ Usage: node scripts/log-paste-bin.js <filename> [--debug] [--slide N]')
    console.log('📝 Example: node scripts/log-paste-bin.js orange-rectangle.bin')
    console.log('📝 Debug:   node scripts/log-paste-bin.js orange-rectangle.bin --debug')
    console.log('📝 Slide:   node scripts/log-paste-bin.js mondadori.pptx --slide 22')
    console.log('📝 Note:    Files are automatically looked up in test/test-harness/fixtures/')
    process.exit(1)
  }

  const [filename] = args
  const debugMode = args.includes('--debug')
  
  // Parse --slide parameter
  let targetSlide = null
  const slideIndex = args.findIndex(arg => arg === '--slide')
  if (slideIndex !== -1 && slideIndex + 1 < args.length) {
    targetSlide = parseInt(args[slideIndex + 1], 10)
    if (isNaN(targetSlide) || targetSlide < 1) {
      console.log('❌ Invalid slide number. Must be a positive integer.')
      process.exit(1)
    }
  }
  
  // Auto-prepend fixtures path if just filename is provided
  const filePath = filename.includes('/') 
    ? filename  // Full path provided
    : `test/test-harness/fixtures/${filename}`  // Just filename, prepend fixtures path
  
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
    const result = await processor.parseClipboardBuffer(buffer, { debug: debugMode })
    
    // Extract components from the new slide-based structure
    const components = []
    let slidesToProcess = result.slides || []
    
    // Filter to specific slide if requested
    if (targetSlide !== null) {
      console.log(`🎯 Filtering to slide ${targetSlide}`)
      slidesToProcess = result.slides?.filter(slide => slide.slideNumber === targetSlide) || []
      if (slidesToProcess.length === 0) {
        console.log(`⚠️ Slide ${targetSlide} not found. Available slides:`)
        result.slides?.forEach(slide => {
          console.log(`  - Slide ${slide.slideNumber || slide.slideIndex + 1}`)
        })
        return
      }
    }
    
    if (slidesToProcess) {
      slidesToProcess.forEach(slide => {
        if (slide.components) {
          components.push(...slide.components)
        }
      })
    }
    
    console.log('✅ Parsed:', components.length, 'components')

    // Debug: Output full parsed JSON immediately if debug mode is enabled
    if (debugMode) {
      if (targetSlide !== null) {
        console.log(`\n🐛 DEBUG: Slide ${targetSlide} details:`)
        const targetSlideData = slidesToProcess[0]
        if (targetSlideData) {
          console.log('Slide metadata:', {
            slideNumber: targetSlideData.slideNumber,
            slideIndex: targetSlideData.slideIndex,
            layoutId: targetSlideData.layoutId,
            componentCount: targetSlideData.components?.length || 0
          })
          
          // Show masters/layouts data only for this specific slide if available
          if (result.masters && result.masters.length > 0) {
            console.log('\n🐛 DEBUG: Masters (relevant to slide):')
            console.log(JSON.stringify(result.masters, null, 2))
          }
          if (result.layouts && result.layouts.length > 0) {
            console.log('\n🐛 DEBUG: Layouts (relevant to slide):')
            console.log(JSON.stringify(result.layouts, null, 2))
          }
        }
      } else {
        console.log('\n🐛 DEBUG: Masters:')
        console.log(JSON.stringify(result.masters, null, 2))
        console.log('\n🐛 DEBUG: Layouts:')
        console.log(JSON.stringify(result.layouts, null, 2))
      }
      console.log(`\n🐛 DEBUG: Full parsed JSON output${targetSlide !== null ? ` (Slide ${targetSlide} only)` : ''}:`)
      console.log(JSON.stringify(truncateForLogging(components), null, 2))
    }

    if (components.length === 0) {
      console.log('⚠️  No components found - this may not be a valid PowerPoint clipboard file')
      return
    }

    // Analyze components
    const componentTypes = components.reduce((acc, comp) => {
      acc[comp.type] = (acc[comp.type] || 0) + 1
      return acc
    }, {})

    console.log(`\n📊 Component types found${targetSlide !== null ? ` (Slide ${targetSlide} only)` : ''}:`, componentTypes)

    console.log(`\n🔧 Full JSON Output${targetSlide !== null ? ` (Slide ${targetSlide} only)` : ''}:`)
    console.log(JSON.stringify(truncateForLogging(components), null, 2))

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