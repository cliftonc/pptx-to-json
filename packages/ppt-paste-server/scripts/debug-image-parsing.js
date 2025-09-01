/**
 * Debug image parsing to understand what's broken
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PPTXParser } from '../src/processors/PPTXParser.js';
import { PowerPointNormalizer } from '../src/parsers/PowerPointNormalizer.js';
import { ImageParser } from '../src/parsers/ImageParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function debugImageParsing() {
  console.log('🔍 Debugging Image Parsing Issues...\n');
  
  const pptxParser = new PPTXParser();
  const normalizer = new PowerPointNormalizer();
  
  // Test clipboard data with images
  console.log('📋 CLIPBOARD IMAGE DEBUGGING:');
  console.log('='.repeat(50));
  try {
    const clipboardPath = join(__dirname, '..', 'test', 'test-harness', 'fixtures', 'text-and-image.bin');
    const clipboardBuffer = fs.readFileSync(clipboardPath);
    const clipboardJson = await pptxParser.buffer2json(clipboardBuffer);
    
    const normalized = normalizer.normalize(clipboardJson);
    
    if (normalized.slides.length > 0) {
      const slide = normalized.slides[0];
      console.log(`📄 Slide has ${slide.images.length} image(s)`);
      
      if (slide.images.length > 0) {
        const imageComponent = slide.images[0];
        console.log('\n🖼️ First image component structure:');
        console.log('   - Namespace:', imageComponent.namespace);
        console.log('   - Has spPr:', !!imageComponent.spPr);
        console.log('   - Has blipFill:', !!imageComponent.blipFill);
        console.log('   - Has nvPicPr:', !!imageComponent.nvPicPr);
        
        console.log('\n🔍 BlipFill structure:');
        if (imageComponent.blipFill) {
          console.log('   - Keys:', Object.keys(imageComponent.blipFill));
          const blip = imageComponent.blipFill['a:blip'];
          if (blip) {
            console.log('   - Blip keys:', Object.keys(blip));
            console.log('   - Relationship ID:', blip['$r:embed']);
          }
        }
        
        console.log('\n💾 Available relationships:');
        const relFiles = Object.keys(normalized.relationships);
        console.log('   - Relationship files:', relFiles);
        
        console.log('\n💾 Available media files:');
        const mediaFiles = Object.keys(normalized.mediaFiles);
        console.log('   - Media files:', mediaFiles);
        
        // Try parsing the image
        console.log('\n🔄 Attempting to parse image...');
        try {
          const parsedImage = await ImageParser.parseFromNormalized(
            imageComponent, 
            normalized.relationships, 
            normalized.mediaFiles, 
            0, 
            0
          );
          
          console.log('✅ Image parsed successfully:');
          console.log('   - ID:', parsedImage.id);
          console.log('   - Type:', parsedImage.type);
          console.log('   - Content:', parsedImage.content);
          console.log('   - Position:', `${parsedImage.x}, ${parsedImage.y}`);
          console.log('   - Size:', `${parsedImage.width}x${parsedImage.height}`);
          console.log('   - Has dataUrl:', !!parsedImage.image?.dataUrl);
          console.log('   - Image format:', parsedImage.image?.format);
          
        } catch (error) {
          console.error('❌ Image parsing failed:', error.message);
          console.error('Stack:', error.stack);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Clipboard image debugging failed:', error);
  }
  
  // Test PPTX file images
  console.log('\n📁 PPTX IMAGE DEBUGGING:');
  console.log('='.repeat(50));
  try {
    const pptxPath = join(__dirname, '..', 'test', 'test-harness', 'presentation.pptx');
    const pptxBuffer = fs.readFileSync(pptxPath);
    const pptxJson = await pptxParser.buffer2json(pptxBuffer);
    
    const normalized = normalizer.normalize(pptxJson);
    
    if (normalized.slides.length > 0) {
      const slide = normalized.slides[0];
      console.log(`📄 Slide has ${slide.images.length} image(s)`);
      
      if (slide.images.length > 0) {
        const imageComponent = slide.images[0];
        console.log('\n🖼️ First image component structure:');
        console.log('   - Namespace:', imageComponent.namespace);
        console.log('   - Has spPr:', !!imageComponent.spPr);
        console.log('   - Has blipFill:', !!imageComponent.blipFill);
        console.log('   - Has nvPicPr:', !!imageComponent.nvPicPr);
        
        // Try parsing the image
        console.log('\n🔄 Attempting to parse PPTX image...');
        try {
          const parsedImage = await ImageParser.parseFromNormalized(
            imageComponent, 
            normalized.relationships, 
            normalized.mediaFiles, 
            0, 
            0
          );
          
          console.log('✅ PPTX Image parsed successfully:');
          console.log('   - ID:', parsedImage.id);
          console.log('   - Type:', parsedImage.type);
          console.log('   - Content:', parsedImage.content);
          console.log('   - Has dataUrl:', !!parsedImage.image?.dataUrl);
          
        } catch (error) {
          console.error('❌ PPTX Image parsing failed:', error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ PPTX image debugging failed:', error);
  }
}

debugImageParsing();