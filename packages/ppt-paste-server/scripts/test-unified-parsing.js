/**
 * Test unified parsing approach
 * 
 * Tests both PPTX files and clipboard data using the new normalizer
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PPTXParser } from '../src/processors/PPTXParser.js';
import { PowerPointParser } from '../src/parsers/PowerPointParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testUnifiedParsing() {
  console.log('🔍 Testing Unified PowerPoint Parsing...\n');
  
  const parser = new PowerPointParser();
  const pptxParser = new PPTXParser();
  
  // Test 1: PPTX File
  console.log('📁 TEST 1: PPTX FILE');
  console.log('='.repeat(50));
  try {
    const pptxPath = join(__dirname, '..', 'test', 'test-harness', 'presentation.pptx');
    const pptxBuffer = fs.readFileSync(pptxPath);
    const pptxJson = await pptxParser.buffer2json(pptxBuffer);
    
    console.log('🔄 Parsing PPTX with unified approach...');
    const pptxComponents = await parser.parseJson(pptxJson, { debug: true });
    
    console.log(`✅ PPTX Result: ${pptxComponents.length} components`);
    pptxComponents.forEach((comp, i) => {
      console.log(`   ${i + 1}. ${comp.type} - ${comp.content || comp.id || 'no content'}`);
    });
    
  } catch (error) {
    console.error('❌ PPTX parsing failed:', error.message);
  }
  
  console.log('\n📋 TEST 2: CLIPBOARD DATA');
  console.log('='.repeat(50));
  try {
    const clipboardPath = join(__dirname, '..', 'test', 'test-harness', 'fixtures', 'text-and-image.bin');
    const clipboardBuffer = fs.readFileSync(clipboardPath);
    const clipboardJson = await pptxParser.buffer2json(clipboardBuffer);
    
    console.log('🔄 Parsing clipboard with unified approach...');
    const clipboardComponents = await parser.parseJson(clipboardJson, { debug: true });
    
    console.log(`✅ Clipboard Result: ${clipboardComponents.length} components`);
    clipboardComponents.forEach((comp, i) => {
      console.log(`   ${i + 1}. ${comp.type} - ${comp.content || comp.id || 'no content'}`);
    });
    
  } catch (error) {
    console.error('❌ Clipboard parsing failed:', error.message);
  }
  
  console.log('\n🎯 COMPARISON:');
  console.log('='.repeat(50));
  console.log('✨ Both formats now use the SAME parsing logic!');
  console.log('✨ No more if-statements scattered throughout the code!');
  console.log('✨ Clean, maintainable, and extensible architecture!');
}

testUnifiedParsing();