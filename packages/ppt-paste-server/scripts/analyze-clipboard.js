/**
 * Analyze clipboard data structure
 * 
 * This script loads a clipboard fixture and analyzes its structure
 * to compare with full PPTX files.
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PPTXParser } from '../src/processors/PPTXParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function analyzeClipboard() {
  console.log('🔍 Analyzing clipboard data structure...\n');
  
  try {
    // Load a clipboard fixture - look for text-and-image or similar
    const fixturesPath = join(__dirname, '..', 'test', 'test-harness', 'fixtures');
    const fixtures = fs.readdirSync(fixturesPath).filter(f => f.endsWith('.bin'));
    
    if (fixtures.length === 0) {
      console.log('❌ No .bin fixtures found');
      return;
    }
    
    // Prefer text-and-image or similar content-rich fixtures
    let clipboardFile = fixtures.find(f => f.includes('text-and-image')) || 
                       fixtures.find(f => f.includes('text')) ||
                       fixtures[0];
    const clipboardPath = join(fixturesPath, clipboardFile);
    const buffer = fs.readFileSync(clipboardPath);
    
    console.log('📁 Clipboard file:', clipboardFile);
    console.log('📁 File size:', buffer.length, 'bytes\n');
    
    // Parse with PPTXParser
    const parser = new PPTXParser();
    const json = await parser.buffer2json(buffer);
    
    // Analyze structure
    console.log('📂 FILES FOUND IN CLIPBOARD:');
    console.log('='.repeat(50));
    const files = Object.keys(json);
    files.forEach((file, index) => {
      const data = json[file];
      const type = typeof data;
      const isXml = file.endsWith('.xml') || file.endsWith('.rels');
      const size = isXml ? 'XML object' : `${data.length} bytes`;
      console.log(`${index + 1}. ${file} (${size})`);
    });
    
    console.log('\n📄 DRAWING/SLIDE FILES:');
    console.log('='.repeat(50));
    const drawingFiles = files.filter(f => 
      (f.includes('drawing') || f.includes('slide')) && f.endsWith('.xml')
    );
    
    drawingFiles.forEach(drawingFile => {
      console.log(`📄 ${drawingFile}`);
      const drawingData = json[drawingFile];
      
      // Check for different possible root structures
      const rootKeys = Object.keys(drawingData || {}).filter(k => k !== '?xml');
      console.log(`   - Root keys: [${rootKeys.join(', ')}]`);
      
      // Look for different structure patterns
      rootKeys.forEach(rootKey => {
        const rootData = drawingData[rootKey];
        console.log(`   - ${rootKey} type: ${Array.isArray(rootData) ? 'array' : 'object'}`);
        
        // Check for nested structures
        if (rootData && typeof rootData === 'object' && !Array.isArray(rootData)) {
          const nestedKeys = Object.keys(rootData).slice(0, 5); // First 5 keys
          console.log(`     - Nested keys: [${nestedKeys.join(', ')}${nestedKeys.length >= 5 ? '...' : ''}]`);
        }
      });
      
      console.log('');
    });
    
    // Deep dive into first drawing/slide file structure
    if (drawingFiles.length > 0) {
      console.log('🔍 DETAILED FIRST DRAWING/SLIDE STRUCTURE:');
      console.log('='.repeat(50));
      const firstFile = json[drawingFiles[0]];
      console.log(JSON.stringify(firstFile, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error analyzing clipboard:', error);
  }
}

analyzeClipboard();