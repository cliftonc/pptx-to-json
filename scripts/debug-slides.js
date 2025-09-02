#!/usr/bin/env node

import { PPTXParser } from './packages/ppt-paste-server/src/processors/PPTXParser.js';

async function debugSlides() {
  const pptxParser = new PPTXParser();
  
  try {
    // Parse the PPTX file
    const json = await pptxParser.parseFile('/Users/cliftonc/work/ppt-paste/apps/worker/public/presentation4.pptx');
    
    // Get slide dimensions
    const slideDimensions = pptxParser.getSlideDimensions(json);
    console.log('🔍 Parsed slide dimensions:', slideDimensions);
    
    // Check raw presentation.xml parsing
    const presentationXML = json['ppt/presentation.xml'];
    console.log('🔍 Presentation XML exists:', !!presentationXML);
    
    if (presentationXML) {
      const presentation = presentationXML['p:presentation'];
      console.log('🔍 p:presentation exists:', !!presentation);
      
      if (presentation) {
        const sldSz = presentation['p:sldSz'];
        console.log('🔍 p:sldSz exists:', !!sldSz);
        console.log('🔍 p:sldSz raw:', JSON.stringify(sldSz, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugSlides();