#!/usr/bin/env node

/**
 * Interactive Visual Sample Validator
 * 
 * This CLI tool works with an LLM (Claude) to validate that our PowerPoint parser
 * output matches the visual descriptions in samples.json. The LLM can then suggest
 * improvements to the parser.
 * 
 * Usage:
 *   node scripts/validate-samples.js
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { PowerPointClipboardProcessor } from '../PowerPointClipboardProcessor.js'

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SAMPLES_FILE = path.join(__dirname, '..', 'test-harness', 'samples.json')
const VALIDATION_RESULTS_FILE = path.join(__dirname, '..', 'test-harness', 'validation-results.json')

class SampleValidator {
  constructor() {
    this.processor = new PowerPointClipboardProcessor()
    this.results = []
  }

  async validate() {
    console.log(colors.cyan + colors.bright + '🔍 PowerPoint Parser Sample Status' + colors.reset)
    console.log(colors.white + '=' .repeat(50) + colors.reset)
    
    // Load samples
    const samplesContent = await fs.readFile(SAMPLES_FILE, 'utf8')
    const samples = JSON.parse(samplesContent)
    
    console.log(colors.green + `📋 Found ${Object.keys(samples).length} samples` + colors.reset)
    console.log()

    // List all samples with their status
    for (const [sampleName, sampleData] of Object.entries(samples)) {
      await this.listSample(sampleName, sampleData)
    }

    // Summary
    const validatedCount = Object.values(samples).filter(data => data.validated).length
    const unvalidatedCount = Object.keys(samples).length - validatedCount
    
    console.log()
    console.log(colors.cyan + colors.bright + '📊 Summary' + colors.reset)
    console.log(colors.white + '=' .repeat(30) + colors.reset)
    console.log(colors.green + `✅ Validated: ${validatedCount}` + colors.reset)
    console.log(colors.yellow + `⏳ Needs validation: ${unvalidatedCount}` + colors.reset)
    console.log(colors.white + `📄 Total samples: ${Object.keys(samples).length}` + colors.reset)
  }

  async listSample(sampleName, sampleData) {
    const isValidated = sampleData.validated
    const statusIcon = isValidated ? '✅' : '⏳'
    const statusColor = isValidated ? colors.green : colors.yellow
    const statusText = isValidated ? 'VALIDATED' : 'NEEDS VALIDATION'
    
    console.log(statusColor + colors.bright + `${statusIcon} ${sampleName}` + colors.reset)
    console.log(colors.white + `   Description: "${sampleData.description}"` + colors.reset)
    console.log(colors.white + `   Binary file: ${sampleData.bin}` + colors.reset)
    console.log(statusColor + `   Status: ${statusText}` + colors.reset)
    
    if(!isValidated) {
      let originalLog = console.log
      try {
        const binaryPath = path.join(__dirname, '..', 'test-harness', sampleData.bin)
        const buffer = await fs.readFile(binaryPath)
        
        // Temporarily suppress console output during parsing
        console.log = () => {}
        
        const components = await this.processor.parseClipboardBuffer(buffer, { debug: false })
        
        // Restore console output
        console.log = originalLog
        
        if (components.length > 0) {
          const componentTypes = components.reduce((acc, comp) => {
            acc[comp.type] = (acc[comp.type] || 0) + 1
            return acc
          }, {})
          
          const componentSummary = Object.entries(componentTypes)
            .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
            .join(', ')
          
          console.log(colors.blue + `   Components: ${componentSummary}` + colors.reset)
          
          // Show parsed JSON for verification
          console.log(colors.cyan + '   Parsed JSON:' + colors.reset)
          console.log(colors.white + '   ' + JSON.stringify(components, null, 2).replace(/\n/g, '\n   ') + colors.reset)
        } else {
          console.log(colors.red + '   Components: None found (parsing issue)' + colors.reset)
        }
      } catch (error) {
        // Restore console output if error occurred
        console.log = originalLog
        console.log(colors.red + `   Components: Error parsing (${error.message})` + colors.reset)
      }
    }
    
    console.log()
  }

  async validateSample(sampleName, sampleData, samples) {
    console.log(colors.yellow + colors.bright + `🧪 Validating: ${sampleName}` + colors.reset)
    console.log(colors.white + '-'.repeat(40) + colors.reset)
    
    try {
      // Step 1: Display the visual description
      console.log(colors.blue + '📝 Visual Description:' + colors.reset)
      console.log(colors.white + `   "${sampleData.description}"` + colors.reset)
      console.log()

      // Step 2: Load and parse the PowerPoint data from binary file
      console.log(colors.cyan + '🔄 Loading binary file and parsing PowerPoint data...' + colors.reset)
      const binaryPath = path.join(__dirname, '..', 'test-harness', sampleData.bin)
      const buffer = await fs.readFile(binaryPath)
      const components = await this.processor.parseClipboardBuffer(buffer, { debug: false })
      
      console.log(colors.green + `✅ Parsed ${components.length} components` + colors.reset)
      console.log()

      // Step 3: Display the parsed output
      console.log(colors.blue + '📊 Parsed JSON Output:' + colors.reset)
      this.displayParsedComponents(components)
      console.log()

      // Step 4: Present for LLM validation
      console.log(colors.magenta + colors.bright + '🤖 LLM VALIDATION NEEDED' + colors.reset)
      console.log(colors.white + '=' .repeat(50) + colors.reset)
      console.log()
      
      console.log(colors.yellow + 'PROMPT FOR CLAUDE:' + colors.reset)
      console.log(colors.white + `Please validate if the parsed output matches the visual description:` + colors.reset)
      console.log()
      console.log(colors.cyan + `Description: "${sampleData.description}"` + colors.reset)
      console.log()
      console.log(colors.cyan + 'Parsed Components:' + colors.reset)
      console.log(JSON.stringify(components, null, 2))
      console.log()
      console.log(colors.yellow + 'Questions:' + colors.reset)
      console.log(colors.white + '1. Does the parsed output match the visual description? (Yes/No)' + colors.reset)
      console.log(colors.white + '2. If No, what specifically is wrong?' + colors.reset)
      console.log(colors.white + '3. What parser improvements would you suggest?' + colors.reset)
      console.log()
      console.log(colors.magenta + '⏸️  WAITING FOR LLM RESPONSE...' + colors.reset)
      console.log(colors.white + '=' .repeat(50) + colors.reset)
      console.log()

      // Record the validation request
      const validationRequest = {
        sampleName,
        description: sampleData.description,
        binaryFile: sampleData.bin,
        components,
        timestamp: new Date().toISOString(),
        status: 'pending_validation'
      }

      this.results.push(validationRequest)

      // Wait for user input to continue
      await this.waitForValidationResponse(sampleName, samples)

    } catch (error) {
      console.log(colors.red + `❌ Error validating ${sampleName}: ${error.message}` + colors.reset)
      console.log()
      
      this.results.push({
        sampleName,
        description: sampleData.description,
        binaryFile: sampleData.bin,
        error: error.message,
        timestamp: new Date().toISOString(),
        status: 'error'
      })
    }
  }

  displayParsedComponents(components) {
    components.forEach((component, index) => {
      console.log(colors.white + `   Component ${index + 1}:` + colors.reset)
      console.log(colors.white + `     Type: ${component.type}` + colors.reset)
      console.log(colors.white + `     Content: "${component.content}"` + colors.reset)
      console.log(colors.white + `     Position: (${component.x}, ${component.y})` + colors.reset)
      console.log(colors.white + `     Size: ${component.width} × ${component.height}` + colors.reset)
      
      if (component.style) {
        console.log(colors.white + `     Style:` + colors.reset)
        if (component.style.backgroundColor && component.style.backgroundColor !== 'transparent') {
          console.log(colors.white + `       Background: ${component.style.backgroundColor}` + colors.reset)
        }
        if (component.style.borderColor && component.style.borderColor !== 'transparent') {
          console.log(colors.white + `       Border: ${component.style.borderColor} (${component.style.borderWidth}px)` + colors.reset)
        }
        if (component.style.fontColor) {
          console.log(colors.white + `       Text Color: ${component.style.fontColor}` + colors.reset)
        }
        if (component.style.fontSize) {
          console.log(colors.white + `       Font Size: ${component.style.fontSize}pt` + colors.reset)
        }
      }
      
      if (component.metadata && component.metadata.shapeType) {
        console.log(colors.white + `     Shape Type: ${component.metadata.shapeType}` + colors.reset)
      }
      
      console.log()
    })
  }

  async waitForValidationResponse(sampleName, samples) {
    console.log(colors.green + `Type "VALID" if sample passes validation, or press Enter to continue without marking...` + colors.reset)
    
    const response = await new Promise(resolve => {
      process.stdin.once('data', (data) => {
        resolve(data.toString().trim().toUpperCase())
      })
    })
    
    if (response === 'VALID') {
      console.log(colors.green + '✅ Marking sample as validated and updating samples.json...' + colors.reset)
      
      // Mark as validated
      samples[sampleName].validated = true
      
      // Save updated samples.json
      await fs.writeFile(SAMPLES_FILE, JSON.stringify(samples, null, '\t'))
      
      console.log(colors.green + `📝 ${sampleName} marked as validated in samples.json` + colors.reset)
    } else {
      console.log(colors.yellow + '⏭️  Continuing without marking as validated...' + colors.reset)
    }
    
    console.log()
  }

  async generateReport() {
    console.log(colors.cyan + colors.bright + '📋 Validation Summary' + colors.reset)
    console.log(colors.white + '=' .repeat(50) + colors.reset)
    
    const totalSamples = this.results.length
    const errorSamples = this.results.filter(r => r.status === 'error').length
    const pendingSamples = this.results.filter(r => r.status === 'pending_validation').length
    
    console.log(colors.white + `Total Samples: ${totalSamples}` + colors.reset)
    console.log(colors.red + `Errors: ${errorSamples}` + colors.reset)
    console.log(colors.yellow + `Pending Validation: ${pendingSamples}` + colors.reset)
    console.log()

    // Save results for future reference
    await fs.writeFile(VALIDATION_RESULTS_FILE, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalSamples,
        errorSamples,
        pendingSamples
      },
      results: this.results
    }, null, 2))

    console.log(colors.green + `📁 Results saved to: ${VALIDATION_RESULTS_FILE}` + colors.reset)
    console.log()
    console.log(colors.magenta + '🤖 Next Steps:' + colors.reset)
    console.log(colors.white + '1. Review LLM feedback for each sample' + colors.reset)
    console.log(colors.white + '2. Apply suggested parser improvements' + colors.reset)
    console.log(colors.white + '3. Re-run validation to verify fixes' + colors.reset)
    console.log()
  }
}

// Enhanced error handling
process.on('unhandledRejection', (error) => {
  console.error(colors.red + '❌ Unhandled error:' + colors.reset, error.message)
  process.exit(1)
})

// Run the validator
if (import.meta.url === `file://${process.argv[1]}`) {
  const validator = new SampleValidator()
  validator.validate().catch(error => {
    console.error(colors.red + '❌ Validation failed:' + colors.reset, error.message)
    process.exit(1)
  })
}

export { SampleValidator }