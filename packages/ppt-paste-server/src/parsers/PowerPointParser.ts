/**
 * Main PowerPoint parser that coordinates all specialized parsers
 */

import { PowerPointNormalizer } from './PowerPointNormalizer.js';
import { TextParser } from './TextParser.js';
import { ShapeParser } from './ShapeParser.js';
import { ImageParser } from './ImageParser.js';
import { TableParser } from './TableParser.js';
import { VideoParser } from './VideoParser.js';
import { BaseParser } from './BaseParser.js';
import type { PowerPointComponent } from '../types/index.js';

interface ParseOptions {
  debug?: boolean;
  r2Storage?: any;
}

interface SlideMetadata {
  name: string;
  componentCount: number;
  format: string;
  slideFile: string | null;
  layoutFile: string | null;
  masterFile: string | null;
  layoutElementCount: number;
  masterElementCount: number;
}

interface ParsedSlide {
  slideIndex: number;
  slideNumber: number;
  components: PowerPointComponent[];
  metadata: SlideMetadata;
}

interface ParsedResult {
  slides: ParsedSlide[];
  totalComponents: number;
  format: string;
  slideDimensions?: {
    width: number;
    height: number;
  };
}

export class PowerPointParser extends BaseParser {
  private normalizer: PowerPointNormalizer;

  constructor() {
    super();
    this.normalizer = new PowerPointNormalizer();
  }

  /**
   * Parse PowerPoint JSON data into structured slides
   */
  async parseJson(json: any, options: ParseOptions = {}): Promise<ParsedResult> {
    const { debug = false, r2Storage = null } = options;
    
    try {
      if (debug) console.log('🎨 Processing PowerPoint JSON data...');
      
      // Step 1: Normalize the structure (eliminates all format differences!)
      const normalized = this.normalizer.normalize(json);
      if (debug) {
        console.log(`🔄 Normalized ${normalized.format} format with ${normalized.slides.length} slides`);
      }
      
      // Step 2: Process all slides using unified structure
      const slides: ParsedSlide[] = [];
      const components: PowerPointComponent[] = []; // Keep flat array for backward compatibility
      let globalComponentIndex = 0;
      
      for (let arrayIndex = 0; arrayIndex < normalized.slides.length; arrayIndex++) {
        const slide = normalized.slides[arrayIndex];
        const slideNumber = slide.slideNumber || (arrayIndex + 1); // Use extracted number or fallback
        
        if (debug) {
          console.log(`📄 Processing slide ${slideNumber}: ${slide.shapes.length} shapes, ${slide.text.length} text, ${slide.images.length} images`);
        }
        
        const slideComponents: PowerPointComponent[] = [];
        let localComponentIndex = 0;
        
        // Process components in their original z-order if available
        if (slide.elements && slide.elements.length > 0) {
          // Use ordered elements to preserve z-index
          for (const element of slide.elements) {
            let component: PowerPointComponent | null = null;
            
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
                { debug, r2Storage }
              );
            } else if (element.type === 'table') {
              component = await this.parseUnifiedTableComponent(
                element,
                normalized.relationships,
                normalized.mediaFiles,
                globalComponentIndex++,
                slideNumber - 1, // Use 0-based index for relationships
                { debug }
              );
            } else if (element.type === 'video') {
              component = await this.parseUnifiedVideoComponent(
                element,
                normalized.relationships,
                normalized.mediaFiles,
                globalComponentIndex++,
                slideNumber - 1, // Use 0-based index for relationships
                { debug, r2Storage }
              );
            }
            
            if (component) {
              // Fix the slideIndex to show the actual slide number (not the relationship index)
              (component as any).slideIndex = slideNumber;
              (component as any).zIndex = element.zIndex; // Add z-index information
              
              // Validate component coordinates are in pixel range
              const coords = component as any; // All components have these properties
              if (coords.x > 50000 || coords.y > 50000 || coords.width > 50000 || coords.height > 50000) {
                console.warn('🚨 Component coordinates may be in EMU, not pixels:', {
                  type: component.type,
                  x: coords.x,
                  y: coords.y,
                  width: coords.width,
                  height: coords.height
                });
              }
              
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
              (component as any).slideIndex = slideNumber;
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
              (component as any).slideIndex = slideNumber;
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
              { debug, r2Storage }
            );
            if (component) {
              // Fix the slideIndex to show the actual slide number (not the relationship index)
              (component as any).slideIndex = slideNumber;
              slideComponents.push(component);
              components.push(component);
              localComponentIndex++;
            }
          }
          
          // Process video components
          for (const videoComponent of slide.videos) {
            const component = await this.parseUnifiedVideoComponent(
              videoComponent,
              normalized.relationships,
              normalized.mediaFiles,
              globalComponentIndex++,
              slideNumber - 1, // Use 0-based index for relationships
              { debug, r2Storage }
            );
            if (component) {
              // Fix the slideIndex to show the actual slide number (not the relationship index)
              (component as any).slideIndex = slideNumber;
              slideComponents.push(component);
              components.push(component);
              localComponentIndex++;
            }
          }
        }
        
        // Create slide object
        const slideObject: ParsedSlide = {
          slideIndex: slideNumber - 1, // For compatibility, keep 0-based index
          slideNumber: slideNumber,    // Actual slide number from filename
          components: slideComponents,
          metadata: {
            name: `Slide ${slideNumber}`,
            componentCount: slideComponents.length,
            format: normalized.format,
            slideFile: slide.slideFile || null,
            layoutFile: slide.layoutFile || null,
            masterFile: slide.masterFile || null,
            layoutElementCount: slide.layoutElementCount || 0,
            masterElementCount: slide.masterElementCount || 0
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
      
      // Validate slide dimensions are in pixel range before returning to client
      if (normalized.slideDimensions) {
        const { width, height } = normalized.slideDimensions;
        if (width > 50000 || height > 50000) {
          console.warn('🚨 Slide dimensions appear to be in EMU, not pixels:', { width, height });
        } else {
          // Slide dimensions validated as pixels
        }
      }

      return {
        slides,
        totalComponents: components.length,
        format: normalized.format,
        slideDimensions: normalized.slideDimensions
      };

    } catch (error) {
      console.error('❌ Error processing PowerPoint JSON:', error);
      throw error;
    }
  }

  /**
   * Parse unified text component from normalized data
   */
  private async parseUnifiedTextComponent(
    textComponent: any, 
    relationships: any, 
    mediaFiles: any, 
    componentIndex: number, 
    slideIndex: number, 
    options: { debug?: boolean } = {}
  ): Promise<PowerPointComponent | null> {
    const { debug = false } = options;
    try {
      return await TextParser.parseFromNormalized(textComponent, componentIndex, slideIndex);
    } catch (error) {
      if (debug) console.warn(`⚠️ Failed to parse text component:`, error);
      return null;
    }
  }
  
  /**
   * Parse unified shape component from normalized data
   */
  private async parseUnifiedShapeComponent(
    shapeComponent: any, 
    relationships: any, 
    mediaFiles: any, 
    componentIndex: number, 
    slideIndex: number, 
    options: { debug?: boolean } = {}
  ): Promise<PowerPointComponent | null> {
    const { debug = false } = options;
    try {
      return await ShapeParser.parseFromNormalized(shapeComponent, componentIndex, slideIndex);
    } catch (error) {
      if (debug) console.warn(`⚠️ Failed to parse shape component:`, error);
      return null;
    }
  }
  
  /**
   * Parse unified image component from normalized data
   */
  private async parseUnifiedImageComponent(
    imageComponent: any, 
    relationships: any, 
    mediaFiles: any, 
    componentIndex: number, 
    slideIndex: number, 
    options: { debug?: boolean; r2Storage?: any } = {}
  ): Promise<PowerPointComponent | null> {
    const { debug = false, r2Storage = null } = options;
    try {
      return await ImageParser.parseFromNormalized(imageComponent, relationships, mediaFiles, componentIndex, slideIndex, r2Storage);
    } catch (error) {
      if (debug) console.warn(`⚠️ Failed to parse image component:`, error);
      return null;
    }
  }
  
  /**
   * Parse unified table component from normalized data
   */
  private async parseUnifiedTableComponent(
    tableComponent: any, 
    relationships: any, 
    mediaFiles: any, 
    componentIndex: number, 
    slideIndex: number, 
    options: { debug?: boolean } = {}
  ): Promise<PowerPointComponent | null> {
    const { debug = false } = options;
    try {
      return await TableParser.parseFromNormalized(tableComponent, componentIndex, slideIndex);
    } catch (error) {
      if (debug) console.warn(`⚠️ Failed to parse table component:`, error);
      return null;
    }
  }
  
  /**
   * Parse unified video component from normalized data
   */
  private async parseUnifiedVideoComponent(
    videoComponent: any, 
    relationships: any, 
    mediaFiles: any, 
    componentIndex: number, 
    slideIndex: number, 
    options: { debug?: boolean; r2Storage?: any } = {}
  ): Promise<PowerPointComponent | null> {
    const { debug = false, r2Storage = null } = options;
    try {
      return await VideoParser.parseFromNormalized(videoComponent, relationships, mediaFiles, componentIndex, slideIndex, r2Storage);
    } catch (error) {
      if (debug) console.warn(`⚠️ Failed to parse video component:`, error);
      return null;
    }
  }
}