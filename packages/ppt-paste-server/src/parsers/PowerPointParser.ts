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

import { isTextElement, isShapeElement, isImageElement, isTableElement, isVideoElement, type NormalizedTextElement, type NormalizedShapeElement, type NormalizedImageElement, type NormalizedTableElement, type NormalizedVideoElement, type MediaFiles, type RelationshipGraph } from '../types/normalized.js';

interface R2BucketLike {
  put?(key: string, value: any, options?: any): Promise<any> | any;
  get?(key: string): Promise<any> | any;
  head?(key: string): Promise<any> | any;
}

interface ParseOptions {
  debug?: boolean;
  r2Storage?: R2BucketLike | null;
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
  slideIndex: number; // zero-based index used internally
  slideNumber: number; // 1-based slide number surfaced to callers
  components: PowerPointComponent[];
  metadata: SlideMetadata;
}

interface ParsedResult {
  slides: ParsedSlide[];
  totalComponents: number;
  format: string; // 'pptx' | 'clipboard'
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
        if (normalized.theme?.colors) {
          console.log(`🎨 Theme colors available:`, Object.keys(normalized.theme.colors));
        }
      }
      
      // Set theme colors for this parsing session
      BaseParser.setThemeColors(normalized.theme?.colors);
      
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
            
            if (isTextElement(element)) {
              component = await this.parseUnifiedTextComponent(
                element,
                globalComponentIndex++,
                slideNumber - 1,
                element.zIndex,
                { debug }
              );
            } else if (isShapeElement(element)) {
              component = await this.parseUnifiedShapeComponent(
                element,
                normalized.relationships,
                normalized.mediaFiles,
                globalComponentIndex++,
                slideNumber - 1, // relationships index
                element.zIndex,
                { debug }
              );
            } else if (isImageElement(element)) {
              component = await this.parseUnifiedImageComponent(
                element,
                normalized.relationships,
                normalized.mediaFiles,
                globalComponentIndex++,
                slideNumber - 1, // relationships index
                element.zIndex,
                { debug, r2Storage }
              );
            } else if (isTableElement(element)) {
              component = await this.parseUnifiedTableComponent(
                element,
                normalized.relationships,
                normalized.mediaFiles,
                globalComponentIndex++,
                slideNumber - 1,
                element.zIndex,
                { debug }
              );
            } else if (isVideoElement(element)) {
              component = await this.parseUnifiedVideoComponent(
                element,
                normalized.relationships,
                normalized.mediaFiles,
                globalComponentIndex++,
                slideNumber - 1,
                element.zIndex,
                { debug, r2Storage }
              );
            }
            
              if (component) {
                const coords = component as any;
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
              globalComponentIndex++,
              slideNumber,
              localComponentIndex, // fallback zIndex based on order
              { debug }
            );
            if (component) {
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
              slideNumber - 1, // relationships index for media lookup
              localComponentIndex,
              { debug }
            );
            if (component) {
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
              slideNumber - 1,
              localComponentIndex,
              { debug, r2Storage }
            );
            if (component) {
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
              slideNumber - 1,
              localComponentIndex,
              { debug, r2Storage }
            );
            if (component) {
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

      // Clear theme colors after parsing
      BaseParser.clearThemeColors();

      return {
        slides,
        totalComponents: components.length,
        format: normalized.format,
        slideDimensions: normalized.slideDimensions
      };

    } catch (error) {
      // Clear theme colors on error too
      BaseParser.clearThemeColors();
      console.error('❌ Error processing PowerPoint JSON:', error);
      throw error;
    }
  }

  /**
   * Parse unified text component from normalized data
   */
  private async parseUnifiedTextComponent(
    textComponent: NormalizedTextElement,
    componentIndex: number,
    slideIndex: number,
    zIndex: number,
    options: { debug?: boolean } = {}
  ): Promise<PowerPointComponent | null> {
    const { debug = false } = options;
    try {
      return await TextParser.parseFromNormalized(textComponent, componentIndex, slideIndex, zIndex);
    } catch (error) {
      if (debug) console.warn(`⚠️ Failed to parse text component:`, error);
      return null;
    }
  }
  
  /**
   * Parse unified shape component from normalized data
   */
  private async parseUnifiedShapeComponent(
    shapeComponent: NormalizedShapeElement,
    _relationships: RelationshipGraph,
    _mediaFiles: MediaFiles,
    componentIndex: number,
    relSlideIndex: number,
    zIndex: number,
    options: { debug?: boolean } = {}
  ): Promise<PowerPointComponent | null> {
    const { debug = false } = options;
    try {
      return await ShapeParser.parseFromNormalized(shapeComponent, componentIndex, relSlideIndex, zIndex);
    } catch (error) {
      if (debug) console.warn(`⚠️ Failed to parse shape component:`, error);
      return null;
    }
  }
  
  /**
   * Parse unified image component from normalized data
   */
  private async parseUnifiedImageComponent(
    imageComponent: NormalizedImageElement,
    relationships: RelationshipGraph,
    mediaFiles: MediaFiles,
    componentIndex: number,
    relSlideIndex: number,
    zIndex: number,
    options: { debug?: boolean; r2Storage?: R2BucketLike | null } = {}
  ): Promise<PowerPointComponent | null> {
    const { debug = false, r2Storage = null } = options;
    try {
      return await ImageParser.parseFromNormalized(imageComponent, relationships, mediaFiles, componentIndex, relSlideIndex, zIndex, r2Storage);
    } catch (error) {
      if (debug) console.warn(`⚠️ Failed to parse image component:`, error);
      return null;
    }
  }
  
  /**
   * Parse unified table component from normalized data
   */
  private async parseUnifiedTableComponent(
    tableComponent: NormalizedTableElement,
    _relationships: RelationshipGraph,
    _mediaFiles: MediaFiles,
    componentIndex: number,
    relSlideIndex: number,
    zIndex: number,
    options: { debug?: boolean } = {}
  ): Promise<PowerPointComponent | null> {
    const { debug = false } = options;
    try {
      return await TableParser.parseFromNormalized(tableComponent, componentIndex, relSlideIndex, zIndex);
    } catch (error) {
      if (debug) console.warn(`⚠️ Failed to parse table component:`, error);
      return null;
    }
  }
  
  /**
   * Parse unified video component from normalized data
   */
  private async parseUnifiedVideoComponent(
    videoComponent: NormalizedVideoElement, 
    _relationships: RelationshipGraph,
    _mediaFiles: MediaFiles,
    componentIndex: number, 
    relSlideIndex: number, 
    zIndex: number,
    options: { debug?: boolean; r2Storage?: R2BucketLike | null } = {}
  ): Promise<PowerPointComponent | null> {
    const { debug = false, r2Storage = null } = options;
    try {
      return await VideoParser.parseFromNormalized(videoComponent, _relationships, _mediaFiles, componentIndex, relSlideIndex, zIndex, r2Storage);
    } catch (error) {
      if (debug) console.warn(`⚠️ Failed to parse video component:`, error);
      return null;
    }
  }
}