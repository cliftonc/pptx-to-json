#!/usr/bin/env node

import fs from 'fs/promises';
import { PowerPointClipboardProcessor } from './packages/ppt-paste-server/src/processors/PowerPointClipboardProcessor.js';
import { PowerPointNormalizer } from './packages/ppt-paste-server/src/parsers/PowerPointNormalizer.js';
import { PPTXParser } from './packages/ppt-paste-server/src/processors/PPTXParser.js';

async function debugFormat() {
  try {
    const buffer = await fs.readFile('/Users/cliftonc/work/ppt-paste/apps/worker/public/presentation4.pptx');
    console.log('📁 File loaded:', buffer.length, 'bytes');
    
    // Parse using PPTXParser 
    const pptxParser = new PPTXParser();
    const json = await pptxParser.buffer2json(buffer);
    console.log('📦 Files found:', Object.keys(json).length);
    console.log('📦 Some file examples:', Object.keys(json).slice(0, 5));
    
    // Check what format the normalizer detects
    const normalizer = new PowerPointNormalizer();
    const format = normalizer.detectFormat(Object.keys(json));
    console.log('🔍 Detected format:', format);
    
    // Get slide dimensions directly from PPTXParser
    const slideDimensions = pptxParser.getSlideDimensions(json);
    console.log('📐 Direct PPTXParser slide dimensions:', slideDimensions);
    
    // Get normalized result
    const normalized = normalizer.normalize(json);
    console.log('📐 Normalized slide dimensions:', normalized.slideDimensions);
    console.log('🔍 Normalized format:', normalized.format);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugFormat();