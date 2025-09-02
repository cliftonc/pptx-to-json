#!/usr/bin/env node

import fs from 'fs/promises';
import { PowerPointClipboardProcessor } from './packages/ppt-paste-server/src/processors/PowerPointClipboardProcessor.js';

async function debugSlideDimensions() {
  try {
    const buffer = await fs.readFile('/Users/cliftonc/work/ppt-paste/apps/worker/public/presentation4.pptx');
    console.log('📁 File loaded:', buffer.length, 'bytes');
    
    const processor = new PowerPointClipboardProcessor();
    
    // Parse to get slide dimensions
    const result = await processor.parseClipboardBuffer(buffer, { debug: false });
    
    console.log('🔍 Parsed result structure:');
    console.log('- Slides:', result.slides?.length || 'N/A');
    console.log('- SlideDimensions:', result.slideDimensions);
    console.log('- Format:', result.format);
    console.log('- Total Components:', result.totalComponents);
    
    if (result.slideDimensions) {
      console.log('\n✅ Slide dimensions found!');
      console.log('Width:', result.slideDimensions.width, 'pixels');
      console.log('Height:', result.slideDimensions.height, 'pixels');
      
      // Check specific slide 3 components
      if (result.slides && result.slides.length >= 3) {
        const slide3 = result.slides[2]; // 0-based index
        console.log('\n🔍 Slide 3 analysis:');
        console.log('Components:', slide3.components.length);
        slide3.components.forEach(comp => {
          const rightEdge = comp.x + comp.width;
          const bottomEdge = comp.y + comp.height;
          console.log(`- ${comp.id}: (${comp.x}, ${comp.y}) ${comp.width}×${comp.height}`);
          console.log(`  Right edge: ${rightEdge}, Bottom edge: ${bottomEdge}`);
          if (rightEdge > result.slideDimensions.width || bottomEdge > result.slideDimensions.height) {
            console.log('  ❌ EXCEEDS SLIDE BOUNDS!');
          } else {
            console.log('  ✅ Within slide bounds');
          }
        });
      }
    } else {
      console.log('\n❌ No slide dimensions found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugSlideDimensions();