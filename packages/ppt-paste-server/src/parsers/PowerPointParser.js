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
   * @param {Object} options - Parsing options
   * @param {boolean} options.debug - Enable debug logging
   * @param {boolean} options.returnSlides - Return slides structure instead of flat components
   * @returns {Promise<Array|Object>} array of parsed components or slides structure
   */
  async parseJson(json, { debug = false, returnSlides = false } = {}) {
    try {
      if (debug) console.log('🎨 Processing PowerPoint JSON data...');
      
      // Step 1: Normalize the structure (eliminates all format differences!)
      const normalized = this.normalizer.normalize(json);
      if (debug) {
        console.log(`🔄 Normalized ${normalized.format} format with ${normalized.slides.length} slides`);
      }
      
      // Step 2: Process all slides using unified structure
      const slides = [];
      const components = []; // Keep flat array for backward compatibility
      let globalComponentIndex = 0;
      
      for (let arrayIndex = 0; arrayIndex < normalized.slides.length; arrayIndex++) {
        const slide = normalized.slides[arrayIndex];
        const slideNumber = slide.slideNumber || (arrayIndex + 1); // Use extracted number or fallback
        
        if (debug) {
          console.log(`📄 Processing slide ${slideNumber}: ${slide.shapes.length} shapes, ${slide.text.length} text, ${slide.images.length} images`);
        }
        
        const slideComponents = [];
        let localComponentIndex = 0;
        
        // Process components in their original z-order if available
        if (slide.elements && slide.elements.length > 0) {
          // Use ordered elements to preserve z-index
          for (const element of slide.elements) {
            let component = null;
            
            if (element.type === 'text') {
              component = await this.parseUnifiedTextComponent(
                element, 
                normalized.relationships,
                normalized.mediaFiles,
                globalComponentIndex++,
                slideNumber - 1, // Use 0-based index for relationships
                { debug }
              );
            } else if (element.type === 'shape') {
              component = await this.parseUnifiedShapeComponent(
                element,
                normalized.relationships,
                normalized.mediaFiles, 
                globalComponentIndex++,
                slideNumber - 1, // Use 0-based index for relationships
                { debug }
              );
            } else if (element.type === 'image') {
              component = await this.parseUnifiedImageComponent(
                element,
                normalized.relationships,
                normalized.mediaFiles,
                globalComponentIndex++,
                slideNumber - 1, // Use 0-based index for relationships
                { debug }
              );
            }
            
            if (component) {
              // Fix the slideIndex to show the actual slide number (not the relationship index)
              component.slideIndex = slideNumber;
              component.zIndex = element.zIndex; // Add z-index information
              slideComponents.push(component);
              components.push(component);
              localComponentIndex++;
            }
          }
        } else {
          // Fallback to old method if ordered elements not available
          // Process text components
          for (const textComponent of slide.text) {
            const component = await this.parseUnifiedTextComponent(
              textComponent, 
              normalized.relationships,
              normalized.mediaFiles,
              globalComponentIndex++,
              slideNumber - 1, // Use 0-based index for relationships
              { debug }
            );
            if (component) {
              // Fix the slideIndex to show the actual slide number (not the relationship index)
              component.slideIndex = slideNumber;
              slideComponents.push(component);
              components.push(component);
              localComponentIndex++;
            }
          }
          
          // Process shape components (non-text)
          for (const shapeComponent of slide.shapes) {
            const component = await this.parseUnifiedShapeComponent(
              shapeComponent,
              normalized.relationships,
              normalized.mediaFiles, 
              globalComponentIndex++,
              slideNumber - 1, // Use 0-based index for relationships
              { debug }
            );
            if (component) {
              // Fix the slideIndex to show the actual slide number (not the relationship index)
              component.slideIndex = slideNumber;
              slideComponents.push(component);
              components.push(component);
              localComponentIndex++;
            }
          }
          
          // Process image components
          for (const imageComponent of slide.images) {
            const component = await this.parseUnifiedImageComponent(
              imageComponent,
              normalized.relationships,
              normalized.mediaFiles,
              globalComponentIndex++,
              slideNumber - 1, // Use 0-based index for relationships
              { debug }
            );
            if (component) {
              // Fix the slideIndex to show the actual slide number (not the relationship index)
              component.slideIndex = slideNumber;
              slideComponents.push(component);
              components.push(component);
              localComponentIndex++;
            }
          }
        }
        
        // Create slide object
        const slideObject = {
          slideIndex: slideNumber - 1, // For compatibility, keep 0-based index
          slideNumber: slideNumber,    // Actual slide number from filename
          components: slideComponents,
          metadata: {
            name: `Slide ${slideNumber}`,
            componentCount: slideComponents.length,
            format: normalized.format,
            slideFile: slide.slideFile || null
          }
        };
        
        slides.push(slideObject);
        
        if (debug) {
          console.log(`📄 Slide ${slideNumber} complete: ${slideComponents.length} components`);
        }
      }
      
      if (debug) {
        console.log('✅ Unified parsing complete:', components.length, 'total components in', slides.length, 'slides');
      }
      
      // Return slides structure or flat components for backward compatibility
      if (returnSlides) {
        return {
          slides,
          totalComponents: components.length,
          format: normalized.format
        };
      } else {
        return components;
      }

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