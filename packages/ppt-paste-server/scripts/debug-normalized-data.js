/**
 * Debug normalized data to understand parsing failures
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PPTXParser } from '../src/processors/PPTXParser.js';
import { PowerPointNormalizer } from '../src/parsers/PowerPointNormalizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function debugNormalizedData() {
  console.log('🔍 Debugging Normalized Data...\n');
  
  const pptxParser = new PPTXParser();
  const normalizer = new PowerPointNormalizer();
  
  // Debug clipboard data
  console.log('📋 CLIPBOARD DATA NORMALIZATION:');
  console.log('='.repeat(50));
  try {
    const clipboardPath = join(__dirname, '..', 'test', 'test-harness', 'fixtures', 'text-and-image.bin');
    const clipboardBuffer = fs.readFileSync(clipboardPath);
    const clipboardJson = await pptxParser.buffer2json(clipboardBuffer);
    
    const normalized = normalizer.normalize(clipboardJson);
    
    console.log('Normalized clipboard structure:');
    console.log(`- Format: ${normalized.format}`);
    console.log(`- Slides: ${normalized.slides.length}`);
    
    if (normalized.slides.length > 0) {
      const slide = normalized.slides[0];
      console.log(`\n📄 First slide details:`);
      console.log(`- Shapes: ${slide.shapes.length}`);
      console.log(`- Text: ${slide.text.length}`);
      console.log(`- Images: ${slide.images.length}`);
      
      if (slide.text.length > 0) {
        console.log('\n📝 First text component:');
        console.log('   - Namespace:', slide.text[0].namespace);
        console.log('   - Element:', slide.text[0].element);
        console.log('   - Has textBody:', !!slide.text[0].textBody);
        console.log('   - Data keys:', Object.keys(slide.text[0].data || {}));
        
        // Show detailed structure
        console.log('\n🔍 Text component structure:');
        console.log(JSON.stringify(slide.text[0], null, 2));
      }
      
      if (slide.images.length > 0) {
        console.log('\n🖼️ First image component:');
        console.log('   - Namespace:', slide.images[0].namespace);
        console.log('   - Element:', slide.images[0].element);
        console.log('   - Data keys:', Object.keys(slide.images[0].data || {}));
      }
    }
    
  } catch (error) {
    console.error('❌ Clipboard normalization failed:', error);
  }
}

debugNormalizedData();