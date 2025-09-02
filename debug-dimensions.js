#!/usr/bin/env node

import fs from 'fs/promises';
import { PPTXParser } from './packages/ppt-paste-server/src/processors/PPTXParser.js';

async function debugDimensions() {
  try {
    const buffer = await fs.readFile('/Users/cliftonc/work/ppt-paste/apps/worker/public/presentation4.pptx');
    console.log('📁 File loaded:', buffer.length, 'bytes');
    
    const pptxParser = new PPTXParser();
    
    // Parse the buffer to JSON
    const json = await pptxParser.buffer2json(buffer);
    console.log('📦 Parsed to JSON, files:', Object.keys(json).length);
    
    // Check if presentation.xml exists
    const presentationXML = 'ppt/presentation.xml';
    console.log('🔍 presentation.xml exists:', presentationXML in json);
    
    if (presentationXML in json) {
      const presentation = json[presentationXML];
      console.log('🔍 presentation object exists:', !!presentation);
      
      if (presentation && presentation['p:presentation']) {
        const ppresentation = presentation['p:presentation'];
        console.log('🔍 p:presentation exists:', !!ppresentation);
        
        if (ppresentation['p:sldSz']) {
          const sldSz = ppresentation['p:sldSz'];
          console.log('🔍 p:sldSz found:', JSON.stringify(sldSz, null, 2));
          
          // Check for attributes
          if (sldSz.$) {
            console.log('🔍 Attributes found:', JSON.stringify(sldSz.$, null, 2));
          } else {
            console.log('❌ No $ attributes found');
          }
          
          if (sldSz.cx && sldSz.cy) {
            console.log('🔍 Direct cx/cy:', sldSz.cx, sldSz.cy);
          }
        } else {
          console.log('❌ p:sldSz not found');
          console.log('Available keys:', Object.keys(ppresentation));
        }
      } else {
        console.log('❌ p:presentation not found');
        console.log('Available keys:', Object.keys(presentation));
      }
    }
    
    // Try getting slide dimensions through the parser
    const slideDimensions = pptxParser.getSlideDimensions(json);
    console.log('📐 Parsed slide dimensions:', slideDimensions);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugDimensions();