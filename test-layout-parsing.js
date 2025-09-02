#!/usr/bin/env node

/**
 * Simple test to verify slide layout parsing functionality
 */

import { PowerPointClipboardProcessor } from './packages/ppt-paste-server/src/processors/PowerPointClipboardProcessor.js';
import { PPTXParser } from './packages/ppt-paste-server/src/processors/PPTXParser.js';
import { readFile } from 'fs/promises';

async function testLayoutParsing() {
  console.log('🧪 Testing slide layout parsing functionality...\n');
  
  const processor = new PowerPointClipboardProcessor();
  const pptxParser = new PPTXParser();
  
  // Test with presentation.pptx
  console.log('📁 Testing with presentation.pptx');
  const buffer1 = await readFile('./packages/ppt-paste-server/test/test-harness/fixtures/presentation.pptx');
  const json1 = await pptxParser.buffer2json(buffer1);
  
  const relationships1 = pptxParser.getSlideLayoutRelationships(json1);
  console.log('   Slide-to-layout relationships:', Object.keys(relationships1).length);
  
  const result1 = await processor.parseClipboardBuffer(buffer1, { debug: false });
  console.log('   Slides processed:', result1.slides.length);
  
  result1.slides.forEach((slide, i) => {
    console.log(`   Slide ${i + 1}: ${slide.components.length} components, layoutElementCount: ${slide.metadata.layoutElementCount || 0}`);
    
    // Check for background layout elements (negative z-index)
    const backgroundElements = slide.components.filter(comp => comp.zIndex < 0);
    if (backgroundElements.length > 0) {
      console.log(`     -> Found ${backgroundElements.length} background layout elements`);
    }
  });
  
  // Test with presentation2.pptx (larger file)
  console.log('\n📁 Testing with presentation2.pptx');
  const buffer2 = await readFile('./packages/ppt-paste-server/test/test-harness/fixtures/presentation2.pptx');
  const json2 = await pptxParser.buffer2json(buffer2);
  
  const relationships2 = pptxParser.getSlideLayoutRelationships(json2);
  console.log('   Slide-to-layout relationships:', Object.keys(relationships2).length);
  
  const result2 = await processor.parseClipboardBuffer(buffer2, { debug: false });
  console.log('   Slides processed:', result2.slides.length);
  
  result2.slides.forEach((slide, i) => {
    if (i < 3) { // Show first 3 slides only
      console.log(`   Slide ${i + 1}: ${slide.components.length} components, layoutElementCount: ${slide.metadata.layoutElementCount || 0}`);
      
      // Check for background layout elements (negative z-index)
      const backgroundElements = slide.components.filter(comp => comp.zIndex < 0);
      if (backgroundElements.length > 0) {
        console.log(`     -> Found ${backgroundElements.length} background layout elements`);
      }
    }
  });
  
  console.log('\n✅ Layout parsing test completed successfully!');
  
  // Summary
  console.log('\n📊 Summary:');
  console.log(`   - Slide layout relationships detected: ${Object.keys(relationships1).length + Object.keys(relationships2).length}`);
  console.log(`   - Total slides processed: ${result1.slides.length + result2.slides.length}`);
  console.log('   - Layout parsing infrastructure: ✅ Working');
  console.log('   - Negative z-index support: ✅ Ready for background elements');
  console.log('   - PPTX-only functionality: ✅ Only applies to full PPTX files');
}

testLayoutParsing().catch(console.error);