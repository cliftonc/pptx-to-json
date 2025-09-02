#!/usr/bin/env node

import fs from 'fs/promises';
import { PowerPointClipboardProcessor } from './packages/ppt-paste-server/src/processors/PowerPointClipboardProcessor.js';

async function debugFullChain() {
  try {
    const buffer = await fs.readFile('/Users/cliftonc/work/ppt-paste/apps/worker/public/presentation4.pptx');
    console.log('📁 File loaded:', buffer.length, 'bytes');
    
    const processor = new PowerPointClipboardProcessor();
    
    // Enable debug to see internal workings
    const result = await processor.parseClipboardBuffer(buffer, { debug: true });
    
    console.log('\n📐 Final result slide dimensions:', result.slideDimensions);
    console.log('🔍 Final result format:', result.format);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugFullChain();