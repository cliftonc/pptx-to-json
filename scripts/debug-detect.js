#!/usr/bin/env node

import fs from 'fs/promises';
import { PPTXParser } from './packages/ppt-paste-server/src/processors/PPTXParser.js';

async function debugDetect() {
  try {
    const buffer = await fs.readFile('/Users/cliftonc/work/ppt-paste/apps/worker/public/presentation4.pptx');
    console.log('📁 File loaded:', buffer.length, 'bytes');
    
    // Parse using PPTXParser 
    const pptxParser = new PPTXParser();
    const json = await pptxParser.buffer2json(buffer);
    
    const files = Object.keys(json);
    console.log('📦 Total files:', files.length);
    
    // Replicate the detectFormat logic exactly
    console.log('\n🔍 Running detectFormat logic:');
    
    // Check for PPTX structure
    const hasPPTX = files.some(f => f.startsWith('ppt/slides/'));
    console.log('Has ppt/slides/:', hasPPTX);
    
    if (hasPPTX) {
      console.log('✅ Should return "pptx"');
    } else {
      // Check for clipboard structure  
      const hasClipboard = files.some(f => f.startsWith('clipboard/drawings/'));
      console.log('Has clipboard/drawings/:', hasClipboard);
      
      if (hasClipboard) {
        console.log('✅ Should return "clipboard"');
      } else {
        console.log('❌ Should throw error');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugDetect();