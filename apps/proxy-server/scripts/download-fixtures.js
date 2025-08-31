#!/usr/bin/env node

/**
 * Download Fixtures Script
 * 
 * Downloads binary PowerPoint clipboard data from real Microsoft URLs
 * and stores them as test fixtures for testing.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { PowerPointClipboardProcessor } from '../PowerPointClipboardProcessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FIXTURES_DIR = path.join(__dirname, '..', 'test-harness', 'fixtures');
const EXPECTED_DIR = path.join(__dirname, '..', 'test-harness', 'expected');
const TEST_CASES_FILE = path.join(__dirname, '..', 'test-harness', 'test-cases.json');

async function downloadFixtures() {
  console.log('📦 Starting fixture download...');
  
  try {
    // Read test cases
    const testCasesContent = await fs.readFile(TEST_CASES_FILE, 'utf8');
    const { testCases } = JSON.parse(testCasesContent);
    
    const processor = new PowerPointClipboardProcessor();
    
    for (const testCase of testCases) {
      console.log(`\n🔽 Processing: ${testCase.name}`);
      console.log(`📝 Description: ${testCase.description}`);
      console.log(`🔗 URL: ${testCase.url}`);
      
      try {
        // Download and save binary data
        const fetchResult = await processor.fetchClipboardData(testCase.url);
        const fixtureFile = path.join(FIXTURES_DIR, testCase.fixtureFile);
        
        await fs.writeFile(fixtureFile, fetchResult.buffer);
        console.log(`✅ Saved binary data: ${testCase.fixtureFile} (${fetchResult.size} bytes)`);
        
        // Parse and save expected output
        const components = await processor.parseClipboardBuffer(fetchResult.buffer);
        const expectedFile = path.join(EXPECTED_DIR, testCase.expectedFile);
        
        const expectedOutput = {
          metadata: {
            name: testCase.name,
            description: testCase.description,
            downloadedAt: new Date().toISOString(),
            size: fetchResult.size,
            contentType: fetchResult.contentType
          },
          components: components,
          componentCount: components.length,
          componentTypes: components.reduce((acc, comp) => {
            acc[comp.type] = (acc[comp.type] || 0) + 1;
            return acc;
          }, {})
        };
        
        await fs.writeFile(expectedFile, JSON.stringify(expectedOutput, null, 2));
        console.log(`✅ Saved expected output: ${testCase.expectedFile} (${components.length} components)`);
        
        // Log component summary
        console.log(`📊 Components found:`, expectedOutput.componentTypes);
        
      } catch (error) {
        console.error(`❌ Failed to process ${testCase.name}:`, error.message);
        
        // Create placeholder files for manual testing
        const fixtureFile = path.join(FIXTURES_DIR, testCase.fixtureFile);
        const expectedFile = path.join(EXPECTED_DIR, testCase.expectedFile);
        
        await fs.writeFile(fixtureFile + '.placeholder', `# Placeholder for ${testCase.name}\n# URL: ${testCase.url}\n# Error: ${error.message}\n`);
        await fs.writeFile(expectedFile, JSON.stringify({
          metadata: {
            name: testCase.name,
            description: testCase.description,
            error: error.message,
            placeholder: true
          },
          components: [],
          componentCount: 0,
          componentTypes: {}
        }, null, 2));
        
        console.log(`📝 Created placeholder files for manual setup`);
      }
    }
    
    console.log('\n✅ Fixture download complete!');
    console.log(`📁 Binary fixtures: ${FIXTURES_DIR}`);
    console.log(`📁 Expected outputs: ${EXPECTED_DIR}`);
    
  } catch (error) {
    console.error('❌ Download failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadFixtures();
}

export { downloadFixtures };