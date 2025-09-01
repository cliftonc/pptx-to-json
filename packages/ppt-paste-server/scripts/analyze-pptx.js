/**
 * Analyze presentation.pptx structure
 * 
 * This script loads the presentation.pptx file and analyzes its structure
 * to understand how full PPTX files differ from clipboard data.
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PPTXParser } from '../src/processors/PPTXParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function analyzePPTX() {
  console.log('🔍 Analyzing presentation.pptx structure...\n');
  
  try {
    // Load the PPTX file
    const pptxPath = join(__dirname, '..', 'test', 'test-harness', 'presentation.pptx');
    const buffer = fs.readFileSync(pptxPath);
    
    console.log('📁 File size:', buffer.length, 'bytes\n');
    
    // Parse with PPTXParser
    const parser = new PPTXParser();
    const json = await parser.buffer2json(buffer);
    
    // Analyze structure
    console.log('📂 FILES FOUND IN PPTX:');
    console.log('='.repeat(50));
    const files = Object.keys(json);
    files.forEach((file, index) => {
      const data = json[file];
      const type = typeof data;
      const isXml = file.endsWith('.xml') || file.endsWith('.rels');
      const size = isXml ? 'XML object' : `${data.length} bytes`;
      console.log(`${index + 1}. ${file} (${size})`);
    });
    
    console.log('\n📄 SLIDE FILES:');
    console.log('='.repeat(50));
    const slideFiles = files.filter(f => f.includes('slides/slide') && f.endsWith('.xml'));
    slideFiles.forEach(slideFile => {
      console.log(`📄 ${slideFile}`);
      const slideData = json[slideFile];
      
      if (slideData && slideData['p:sld']) {
        const slide = slideData['p:sld'];
        console.log(`   - p:sld type: ${Array.isArray(slide) ? 'array' : 'object'}`);
        
        if (Array.isArray(slide)) {
          console.log(`   - p:sld array length: ${slide.length}`);
          if (slide[0] && slide[0]['p:cSld']) {
            const cSld = slide[0]['p:cSld'];
            console.log(`   - p:cSld type: ${Array.isArray(cSld) ? 'array' : 'object'}`);
            if (Array.isArray(cSld) && cSld[0] && cSld[0]['p:spTree']) {
              const spTree = cSld[0]['p:spTree'];
              console.log(`   - p:spTree type: ${Array.isArray(spTree) ? 'array' : 'object'}`);
            } else if (!Array.isArray(cSld) && cSld['p:spTree']) {
              const spTree = cSld['p:spTree'];
              console.log(`   - p:spTree type: ${Array.isArray(spTree) ? 'array' : 'object'}`);
            }
          }
        } else {
          if (slide['p:cSld']) {
            const cSld = slide['p:cSld'];
            console.log(`   - p:cSld type: ${Array.isArray(cSld) ? 'array' : 'object'}`);
            if (Array.isArray(cSld) && cSld[0] && cSld[0]['p:spTree']) {
              const spTree = cSld[0]['p:spTree'];
              console.log(`   - p:spTree type: ${Array.isArray(spTree) ? 'array' : 'object'}`);
            } else if (!Array.isArray(cSld) && cSld['p:spTree']) {
              const spTree = cSld['p:spTree'];
              console.log(`   - p:spTree type: ${Array.isArray(spTree) ? 'array' : 'object'}`);
            }
          }
        }
      }
      
      console.log('');
    });
    
    // Deep dive into first slide structure
    if (slideFiles.length > 0) {
      console.log('🔍 DETAILED FIRST SLIDE STRUCTURE:');
      console.log('='.repeat(50));
      const firstSlide = json[slideFiles[0]];
      console.log(JSON.stringify(firstSlide, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error analyzing PPTX:', error);
  }
}

analyzePPTX();