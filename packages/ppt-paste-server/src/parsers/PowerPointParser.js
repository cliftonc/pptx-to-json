/**
 * Main PowerPoint parser that coordinates all specialized parsers
 */

import { PowerPointNormalizer } from './PowerPointNormalizer.js';
import { TextParser } from './TextParser.js';
import { ShapeParser } from './ShapeParser.js';
import { ImageParser } from './ImageParser.js';
import { BaseParser, isBufferLike, bufferFrom } from './BaseParser.js';

export class PowerPointParser extends BaseParser {
  constructor() {
    super();
    this.normalizer = new PowerPointNormalizer();
  }

  /**
   * Parse PowerPoint JSON data into structured components using the normalizer
   * @param {Object} json - Parsed PowerPoint JSON data
   * @returns {Promise<Array>} array of parsed components
   */
  async parseJson(json, { debug = false } = {}) {
    try {
      if (debug) console.log('🎨 Processing PowerPoint JSON data...');
      
      // Step 1: Normalize the structure (eliminates all format differences!)
      const normalized = this.normalizer.normalize(json);
      if (debug) {
        console.log(`🔄 Normalized ${normalized.format} format with ${normalized.slides.length} slides`);
      }
      
      // Step 2: Process all slides using unified structure
      const components = [];
      let componentIndex = 0;
      
      for (let slideIndex = 0; slideIndex < normalized.slides.length; slideIndex++) {
        const slide = normalized.slides[slideIndex];
        
        if (debug) {
          console.log(`📄 Processing slide ${slideIndex + 1}: ${slide.shapes.length} shapes, ${slide.text.length} text, ${slide.images.length} images`);
        }
        
        // Process text components
        for (const textComponent of slide.text) {
          const component = await this.parseUnifiedTextComponent(
            textComponent, 
            normalized.relationships,
            normalized.mediaFiles,
            componentIndex++,
            slideIndex,
            { debug }
          );
          if (component) components.push(component);
        }
        
        // Process shape components (non-text)
        for (const shapeComponent of slide.shapes) {
          const component = await this.parseUnifiedShapeComponent(
            shapeComponent,
            normalized.relationships,
            normalized.mediaFiles, 
            componentIndex++,
            slideIndex,
            { debug }
          );
          if (component) components.push(component);
        }
        
        // Process image components
        for (const imageComponent of slide.images) {
          const component = await this.parseUnifiedImageComponent(
            imageComponent,
            normalized.relationships,
            normalized.mediaFiles,
            componentIndex++,
            slideIndex,
            { debug }
          );
          if (component) components.push(component);
        }
      }
      
      if (debug) console.log('✅ Unified parsing complete:', components.length, 'components');
      return components;

    } catch (error) {
      console.error('❌ Error processing PowerPoint JSON:', error);
      throw error;
    }
  }

  /**
   * Parse unified text component from normalized data
   * @param {Object} textComponent - Normalized text component
   * @param {Object} relationships - Relationship data
   * @param {Object} mediaFiles - Media files
   * @param {number} componentIndex - Component index
   * @param {number} slideIndex - Slide index
   * @returns {Promise<Object|null>} - Parsed component or null
   */
  async parseUnifiedTextComponent(textComponent, relationships, mediaFiles, componentIndex, slideIndex, { debug = false } = {}) {
    try {
      return await TextParser.parseFromNormalized(textComponent, componentIndex, slideIndex);
    } catch (error) {
      if (debug) console.warn(`⚠️ Failed to parse text component:`, error);
      return null;
    }
  }
  
  /**
   * Parse unified shape component from normalized data
   * @param {Object} shapeComponent - Normalized shape component
   * @param {Object} relationships - Relationship data
   * @param {Object} mediaFiles - Media files
   * @param {number} componentIndex - Component index
   * @param {number} slideIndex - Slide index
   * @returns {Promise<Object|null>} - Parsed component or null
   */
  async parseUnifiedShapeComponent(shapeComponent, relationships, mediaFiles, componentIndex, slideIndex, { debug = false } = {}) {
    try {
      return await ShapeParser.parseFromNormalized(shapeComponent, componentIndex, slideIndex);
    } catch (error) {
      if (debug) console.warn(`⚠️ Failed to parse shape component:`, error);
      return null;
    }
  }
  
  /**
   * Parse unified image component from normalized data
   * @param {Object} imageComponent - Normalized image component
   * @param {Object} relationships - Relationship data
   * @param {Object} mediaFiles - Media files
   * @param {number} componentIndex - Component index
   * @param {number} slideIndex - Slide index
   * @returns {Promise<Object|null>} - Parsed component or null
   */
  async parseUnifiedImageComponent(imageComponent, relationships, mediaFiles, componentIndex, slideIndex, { debug = false } = {}) {
    try {
      return await ImageParser.parseFromNormalized(imageComponent, relationships, mediaFiles, componentIndex, slideIndex);
    } catch (error) {
      if (debug) console.warn(`⚠️ Failed to parse image component:`, error);
      return null;
    }
  }

}