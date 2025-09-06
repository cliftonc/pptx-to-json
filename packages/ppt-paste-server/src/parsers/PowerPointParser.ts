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

import { isTextElement, isShapeElement, isImageElement, isTableElement, isVideoElement, type NormalizedTextElement, type NormalizedShapeElement, type NormalizedImageElement, type NormalizedTableElement, type NormalizedVideoElement, type MediaFiles, type RelationshipGraph, type NormalizedSlide } from '../types/normalized.js';

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

interface ParsedMaster {
  id: string;
  name: string;
  background?: PowerPointComponent;
  components: PowerPointComponent[];
  sourceFile: string;
}

interface ParsedLayout {
  id: string;
  name: string;
  masterId?: string;
  background?: PowerPointComponent;
  components: PowerPointComponent[];
  sourceFile: string;
}

interface ParsedSlide {
  slideIndex: number; // zero-based index used internally
  slideNumber: number; // 1-based slide number surfaced to callers
  layoutId?: string; // Reference to layout
  background?: PowerPointComponent; // Slide-specific background
  components: PowerPointComponent[];
  metadata: SlideMetadata;
}

interface ParsedResult {
  slides: ParsedSlide[];
  masters: Record<string, ParsedMaster>;
  layouts: Record<string, ParsedLayout>;
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
      
      // Step 2: Extract masters and layouts first
      const masters: Record<string, ParsedMaster> = {};
      const layouts: Record<string, ParsedLayout> = {};
      let globalComponentIndex = 0;
      
      // Process masters
      const masterFiles = new Set<string>();
      const layoutFiles = new Set<string>();
      normalized.slides.forEach(slide => {
        if (slide.masterFile) masterFiles.add(slide.masterFile);
        if (slide.layoutFile) layoutFiles.add(slide.layoutFile);
      });
      
      // Extract master definitions
      if (normalized.format === 'pptx' && json) {
        const pptxParser = new (await import('../processors/PPTXParser.js')).PPTXParser();
        
        // Use normalized relationships and media files for consistency
        const relationships = normalized.relationships;
        const mediaFiles = normalized.mediaFiles;
        
        // Process masters and layouts from the normalized data
        // This way we reuse all the existing slide parsing logic
        const masterSlides = new Map<string, NormalizedSlide>();
        const layoutSlides = new Map<string, NormalizedSlide>();
        
        // Identify master and layout slides from the normalized data
        normalized.slides.forEach(slide => {
          if (slide.masterFile && slide.elements.some(el => el.isMasterElement)) {
            masterSlides.set(slide.masterFile, slide);
          }
          if (slide.layoutFile && slide.elements.some(el => el.isLayoutElement)) {
            layoutSlides.set(slide.layoutFile, slide);
          }
        });
        
        // Process master definitions using normalized data
        for (const [masterFile, masterSlide] of masterSlides) {
          const masterId = masterFile.replace('ppt/slideMasters/', '').replace('.xml', '');
          const masterComponents: PowerPointComponent[] = [];
          let masterBackground: PowerPointComponent | undefined;
          
          // Process master elements using existing slide logic
          for (let j = 0; j < masterSlide.elements.length; j++) {
            const element = masterSlide.elements[j];
            
            if (!element.isMasterElement) continue; // Only process master elements
            
            if (element.isBackgroundElement) {
              if (debug) console.log(`🎨 Processing master background element`);
              if (isShapeElement(element)) {
                masterBackground = await this.parseUnifiedShapeComponent(element, relationships, mediaFiles, globalComponentIndex++, 0, -2000, { debug });
              }
              continue;
            }
            
            let component: PowerPointComponent | null = null;
            
            if (isTextElement(element)) {
              component = await this.parseUnifiedTextComponent(element, globalComponentIndex++, 0, element.zIndex, { debug });
            } else if (isShapeElement(element)) {
              component = await this.parseUnifiedShapeComponent(element, relationships, mediaFiles, globalComponentIndex++, 0, element.zIndex, { debug });
            } else if (isImageElement(element)) {
              component = await this.parseUnifiedImageComponent(element, relationships, mediaFiles, globalComponentIndex++, 0, element.zIndex, { debug, r2Storage });
            } else if (isTableElement(element)) {
              component = await this.parseUnifiedTableComponent(element, relationships, mediaFiles, globalComponentIndex++, 0, element.zIndex, { debug });
            } else if (isVideoElement(element)) {
              component = await this.parseUnifiedVideoComponent(element, relationships, mediaFiles, globalComponentIndex++, 0, element.zIndex, { debug, r2Storage });
            }
            
            if (component) {
              masterComponents.push(component);
            }
          }
          
          masters[masterFile] = {
            id: masterId,
            name: `Master ${masterId}`,
            background: masterBackground,
            components: masterComponents,
            sourceFile: masterFile
          };
          
          if (debug) {
            console.log(`📋 Extracted master ${masterId}: ${masterBackground ? '1 background' : '0 backgrounds'}, ${masterComponents.length} components`);
          }
        }
        
        // Process layout definitions using normalized data
        for (const [layoutFile, layoutSlide] of layoutSlides) {
          const layoutId = layoutFile.replace('ppt/slideLayouts/', '').replace('.xml', '');
          const layoutComponents: PowerPointComponent[] = [];
          let layoutBackground: PowerPointComponent | undefined;
          let masterId: string | undefined;
          
          // Find which master this layout uses
          const layoutMasterRels = pptxParser.getLayoutMasterRelationships(json);
          const masterFile = layoutMasterRels[layoutFile];
          if (masterFile) {
            masterId = masterFile.replace('ppt/slideMasters/', '').replace('.xml', '');
          }
          
          // Process layout elements using existing slide logic
          for (let j = 0; j < layoutSlide.elements.length; j++) {
            const element = layoutSlide.elements[j];
            
            if (!element.isLayoutElement) continue; // Only process layout elements
            
            if (element.isBackgroundElement) {
              if (debug) console.log(`🎨 Processing layout background element`);
              if (isShapeElement(element)) {
                layoutBackground = await this.parseUnifiedShapeComponent(element, relationships, mediaFiles, globalComponentIndex++, 0, -1000, { debug });
              }
              continue;
            }
            
            let component: PowerPointComponent | null = null;
            
            if (isTextElement(element)) {
              component = await this.parseUnifiedTextComponent(element, globalComponentIndex++, 0, element.zIndex, { debug });
            } else if (isShapeElement(element)) {
              component = await this.parseUnifiedShapeComponent(element, relationships, mediaFiles, globalComponentIndex++, 0, element.zIndex, { debug });
            } else if (isImageElement(element)) {
              component = await this.parseUnifiedImageComponent(element, relationships, mediaFiles, globalComponentIndex++, 0, element.zIndex, { debug, r2Storage });
            } else if (isTableElement(element)) {
              component = await this.parseUnifiedTableComponent(element, relationships, mediaFiles, globalComponentIndex++, 0, element.zIndex, { debug });
            } else if (isVideoElement(element)) {
              component = await this.parseUnifiedVideoComponent(element, relationships, mediaFiles, globalComponentIndex++, 0, element.zIndex, { debug, r2Storage });
            }
            
            if (component) {
              layoutComponents.push(component);
            }
          }
          
          layouts[layoutFile] = {
            id: layoutId,
            name: `Layout ${layoutId}`,
            masterId,
            background: layoutBackground,
            components: layoutComponents,
            sourceFile: layoutFile
          };
          
          if (debug) {
            console.log(`🎨 Extracted layout ${layoutId}: ${layoutBackground ? '1 background' : '0 backgrounds'}, ${layoutComponents.length} components`);
          }
        }
      }
      
      // Step 3: Process all slides using unified structure
      const slides: ParsedSlide[] = [];
      const components: PowerPointComponent[] = []; // Keep flat array for backward compatibility
      
      for (let arrayIndex = 0; arrayIndex < normalized.slides.length; arrayIndex++) {
        const slide = normalized.slides[arrayIndex];
        const slideNumber = slide.slideNumber || (arrayIndex + 1); // Use extracted number or fallback
        
        if (debug) {
          console.log(`📄 Processing slide ${slideNumber}: ${slide.shapes.length} shapes, ${slide.text.length} text, ${slide.images.length} images`);
        }
        
        const slideComponents: PowerPointComponent[] = [];
        let slideBackground: PowerPointComponent | undefined;
        const layoutId = slide.layoutFile ? slide.layoutFile.replace('ppt/slideLayouts/', '').replace('.xml', '') : undefined;
        let localComponentIndex = 0;
        
        // Note: Slide backgrounds are already extracted during normalization as elements with isBackgroundElement=true
        
        // Process components in their original z-order if available
        if (slide.elements && slide.elements.length > 0) {
          // Use ordered elements to preserve z-index
          for (const element of slide.elements) {
            // Skip master and layout backgrounds - they're now in separate definitions
            if (element.isBackgroundElement && (element.isMasterElement || element.isLayoutElement)) {
              continue;
            }
            
            // Handle slide-specific background
            if (element.isBackgroundElement && !element.isMasterElement && !element.isLayoutElement) {
              const bgComponent = await this.parseElementToComponent(element, normalized.relationships, normalized.mediaFiles, globalComponentIndex++, slideNumber - 1, -500, { debug, r2Storage });
              if (bgComponent) {
                slideBackground = bgComponent;
                slideComponents.push(bgComponent);
                components.push(bgComponent);
              }
              continue;
            }
            
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
          layoutId,
          background: slideBackground,
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
        masters,
        layouts,
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
   * Parse a layout/master element to a PowerPoint component
   */
  private async parseElementToComponent(
    element: any,
    relationships: RelationshipGraph,
    mediaFiles: MediaFiles,
    componentIndex: number,
    slideIndex: number,
    zIndex: number,
    options: { debug?: boolean; r2Storage?: R2BucketLike | null } = {}
  ): Promise<PowerPointComponent | null> {
    const { debug = false, r2Storage = null } = options;
    
    if (debug) {
      console.warn(`🔧 parseElementToComponent called with element.type: ${element.type}`);
      console.warn(`🔧 Element data keys:`, Object.keys(element.data || {}));
    }
    
    // Convert LayoutElement to NormalizedElement format - strip namespace prefixes from data
    const strippedData = {};
    if (element.data && typeof element.data === 'object') {
      for (const [key, value] of Object.entries(element.data)) {
        // Strip namespace prefix (e.g., 'p:nvSpPr' -> 'nvSpPr')
        const strippedKey = key.includes(':') ? key.split(':')[1] : key;
        strippedData[strippedKey] = value;
      }
    }
    
    if (debug) {
      console.warn(`🔧 Stripped data keys:`, Object.keys(strippedData));
    }
    
    const normalizedElement = {
      type: element.type,
      namespace: 'p' as const,
      element: element.type === 'image' ? 'pic' : 'sp',
      data: element.data, // Keep original data for compatibility
      zIndex: element.zIndex || zIndex,
      isLayoutElement: element.isLayoutElement,
      isMasterElement: element.isMasterElement,
      isBackgroundElement: element.isBackgroundElement,
      // Spread the stripped data properties at the top level
      ...strippedData
    };
    
    if (element.type === 'text' && isTextElement(normalizedElement)) {
      return await this.parseUnifiedTextComponent(
        normalizedElement,
        componentIndex,
        slideIndex,
        zIndex,
        { debug }
      );
    } else if (element.type === 'shape' && isShapeElement(normalizedElement)) {
      return await this.parseUnifiedShapeComponent(
        normalizedElement,
        relationships,
        mediaFiles,
        componentIndex,
        slideIndex,
        zIndex,
        { debug }
      );
    } else if (element.type === 'image' && isImageElement(normalizedElement)) {
      return await this.parseUnifiedImageComponent(
        normalizedElement,
        relationships,
        mediaFiles,
        componentIndex,
        slideIndex,
        zIndex,
        { debug, r2Storage }
      );
    } else if (element.type === 'table' && isTableElement(normalizedElement)) {
      return await this.parseUnifiedTableComponent(
        normalizedElement,
        relationships,
        mediaFiles,
        componentIndex,
        slideIndex,
        zIndex,
        { debug }
      );
    } else if (element.type === 'video' && isVideoElement(normalizedElement)) {
      return await this.parseUnifiedVideoComponent(
        normalizedElement,
        relationships,
        mediaFiles,
        componentIndex,
        slideIndex,
        zIndex,
        { debug, r2Storage }
      );
    }
    
    if (debug) {
      console.warn(`⚠️ parseElementToComponent failed - element type: ${element.type}`);
      console.warn(`⚠️ Element data keys:`, Object.keys(element.data || {}));
      console.warn(`⚠️ normalizedElement.type:`, normalizedElement.type);
      console.warn(`⚠️ isShapeElement check:`, element.type === 'shape' ? isShapeElement(normalizedElement) : 'not shape');
      console.warn(`⚠️ isImageElement check:`, element.type === 'image' ? isImageElement(normalizedElement) : 'not image');
    }
    return null;
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