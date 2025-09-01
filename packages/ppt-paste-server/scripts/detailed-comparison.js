/**
 * Detailed comparison of old vs new parsing for specific properties
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PPTXParser } from '../src/processors/PPTXParser.js';
import { PowerPointParser } from '../src/parsers/PowerPointParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function detailedComparison() {
  console.log('🔍 Detailed Structure Comparison...\n');
  
  const parser = new PowerPointParser();
  const pptxParser = new PPTXParser();
  
  try {
    const clipboardPath = join(__dirname, '..', 'test', 'test-harness', 'fixtures', 'text-and-image.bin');
    const clipboardBuffer = fs.readFileSync(clipboardPath);
    const clipboardJson = await pptxParser.buffer2json(clipboardBuffer);
    
    // OLD METHOD
    const oldComponents = await parser.extractComponents(clipboardJson, { debug: false });
    
    // NEW METHOD
    const newComponents = await parser.parseJson(clipboardJson, { debug: false });
    
    console.log('🔍 IMAGE COMPONENT COMPARISON:');
    console.log('='.repeat(50));
    
    const oldImage = oldComponents.find(c => c.type === 'image');
    const newImage = newComponents.find(c => c.type === 'image');
    
    if (oldImage && newImage) {
      console.log('OLD Image Structure:');
      console.log('- content:', oldImage.content);
      console.log('- Has metadata.imageUrl:', !!oldImage.metadata?.imageUrl);
      console.log('- Has top-level image prop:', !!oldImage.image);
      console.log('- metadata keys:', Object.keys(oldImage.metadata || {}));
      
      console.log('\nNEW Image Structure:');
      console.log('- content:', newImage.content);
      console.log('- Has metadata.imageUrl:', !!newImage.metadata?.imageUrl);
      console.log('- Has top-level image prop:', !!newImage.image);
      console.log('- metadata keys:', Object.keys(newImage.metadata || {}));
      
      console.log('\n✅ Structures match:', 
        oldImage.content === newImage.content &&
        !!oldImage.metadata?.imageUrl === !!newImage.metadata?.imageUrl &&
        !!oldImage.image === !!newImage.image
      );
    }
    
  } catch (error) {
    console.error('❌ Detailed comparison failed:', error);
  }
}

detailedComparison();