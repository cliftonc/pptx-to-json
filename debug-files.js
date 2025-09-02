#!/usr/bin/env node

import fs from 'fs/promises';
import { PPTXParser } from './packages/ppt-paste-server/src/processors/PPTXParser.js';

async function debugFiles() {
  try {
    const buffer = await fs.readFile('/Users/cliftonc/work/ppt-paste/apps/worker/public/presentation4.pptx');
    console.log('📁 File loaded:', buffer.length, 'bytes');
    
    // Parse using PPTXParser 
    const pptxParser = new PPTXParser();
    const json = await pptxParser.buffer2json(buffer);
    
    const files = Object.keys(json);
    console.log('📦 Total files:', files.length);
    
    // Check files that start with ppt/slides/
    const slideFiles = files.filter(f => f.startsWith('ppt/slides/'));
    console.log('📄 Slide files found:', slideFiles.length);
    slideFiles.slice(0, 10).forEach(f => console.log(`  - ${f}`));
    
    // Check some specific patterns
    const pptSlidesPattern = files.some(f => f.startsWith('ppt/slides/'));
    console.log('🔍 Has ppt/slides/ pattern:', pptSlidesPattern);
    
    const clipboardPattern = files.some(f => f.startsWith('clipboard/drawings/'));
    console.log('🔍 Has clipboard/drawings/ pattern:', clipboardPattern);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugFiles();