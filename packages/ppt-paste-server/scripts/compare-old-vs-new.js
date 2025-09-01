/**
 * Compare old parsing vs new unified parsing to ensure identical results
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PPTXParser } from '../src/processors/PPTXParser.js';
import { PowerPointParser } from '../src/parsers/PowerPointParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function compareOldVsNew() {
  console.log('🔍 Comparing Old vs New Parsing Results...\n');
  
  const parser = new PowerPointParser();
  const pptxParser = new PPTXParser();
  
  // Test clipboard data
  console.log('📋 CLIPBOARD DATA COMPARISON:');
  console.log('='.repeat(50));
  try {
    const clipboardPath = join(__dirname, '..', 'test', 'test-harness', 'fixtures', 'text-and-image.bin');
    const clipboardBuffer = fs.readFileSync(clipboardPath);
    const clipboardJson = await pptxParser.buffer2json(clipboardBuffer);
    
    // OLD METHOD: Use the old extractComponents method
    console.log('🔄 Parsing with OLD method...');
    const oldComponents = await parser.extractComponents(clipboardJson, { debug: false });
    
    // NEW METHOD: Use the new unified parseJson method
    console.log('🔄 Parsing with NEW unified method...');
    const newComponents = await parser.parseJson(clipboardJson, { debug: false });
    
    console.log(`📊 OLD method: ${oldComponents.length} components`);
    oldComponents.forEach((comp, i) => {
      console.log(`   ${i + 1}. ${comp.type} - ${comp.content || comp.id}`);
      if (comp.type === 'text') {
        console.log(`      Style: fontSize=${comp.style?.fontSize}, color=${comp.style?.color}`);
      }
      if (comp.type === 'shape') {
        console.log(`      Style: bg=${comp.style?.backgroundColor}, border=${comp.style?.borderColor}`);
      }
    });
    
    console.log(`\n📊 NEW method: ${newComponents.length} components`);
    newComponents.forEach((comp, i) => {
      console.log(`   ${i + 1}. ${comp.type} - ${comp.content || comp.id}`);
      if (comp.type === 'text') {
        console.log(`      Style: fontSize=${comp.style?.fontSize}, color=${comp.style?.color}`);
      }
      if (comp.type === 'shape') {
        console.log(`      Style: bg=${comp.style?.backgroundColor}, border=${comp.style?.borderColor}`);
      }
    });
    
    // Compare results
    if (oldComponents.length === newComponents.length) {
      console.log('✅ Component count matches!');
    } else {
      console.log('❌ Component count differs!');
    }
    
  } catch (error) {
    console.error('❌ Clipboard comparison failed:', error);
  }
}

compareOldVsNew();