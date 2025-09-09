/**
 * PowerPoint PPTX Parser using JSZip and fast-xml-parser
 * 
 * This replaces pptx2json with a custom implementation that's compatible with
 * Cloudflare Workers and other non-Node.js environments.
 * 
 * Based on pptx2json but modified to use fast-xml-parser and remove Node.js dependencies.
 */

import JSZip from 'jszip';
import { 
  emuToPixels, 
  pixelsToEmu,
  DEFAULT_SLIDE_WIDTH_PX, 
  DEFAULT_SLIDE_HEIGHT_PX, 
  DEFAULT_SLIDE_WIDTH_EMU,
  DEFAULT_SLIDE_HEIGHT_EMU,
  validatePixelRange 
} from '../utils/constants.js';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { BaseParser } from '../parsers/BaseParser.js';
import type { XMLNode, PlaceholderMap, PlaceholderPosition } from '../types/index.js';

// Parser and builder option types
interface XMLParserOptions {
  ignoreAttributes?: boolean;
  attributeNamePrefix?: string;
  textNodeName?: string;
  parseAttributeValue?: boolean;
  parseTagValue?: boolean;
  trimValues?: boolean;
  [key: string]: any;
}

interface XMLBuilderOptions {
  ignoreAttributes?: boolean;
  attributeNamePrefix?: string;
  textNodeName?: string;
  format?: boolean;
  suppressEmptyNode?: boolean;
  [key: string]: any;
}

// Constructor options type
interface PPTXParserOptions {
  parserOptions?: XMLParserOptions;
  builderOptions?: XMLBuilderOptions;
  jszipBinary?: 'uint8array' | 'arraybuffer' | 'string' | 'base64';
  jszipGenerateType?: 'uint8array' | 'arraybuffer' | 'string' | 'base64' | 'blob' | 'nodebuffer';
}

// JSON representation type
interface PPTXJson {
  [filePath: string]: XMLNode | Uint8Array | string;
}

// Slide dimensions type
interface SlideDimensions {
  width: number;
  height: number;
}

// Max slide IDs type
interface MaxSlideIds {
  id: number;
  rid: number;
}

// Layout element type
interface LayoutElement {
  type: 'shape' | 'image';
  data: XMLNode;
  zIndex: number;
  isLayoutElement?: boolean;
  isMasterElement?: boolean;
  isBackgroundElement?: boolean;
}

export class PPTXParser {
  private options: PPTXParserOptions;
  private parserOptions: XMLParserOptions;
  private builderOptions: XMLBuilderOptions;
  private parser: XMLParser;
  private builder: XMLBuilder;

  constructor(options: PPTXParserOptions = {}) {
    this.options = options;
    
    // Configure fast-xml-parser with clean, simple options
    this.parserOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: "$",
      textNodeName: "_text",
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: true,
      ...options.parserOptions
    };
    
    this.builderOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: "$", 
      textNodeName: "_text",
      format: false,
      suppressEmptyNode: true,
      ...options.builderOptions
    };
    
    this.parser = new XMLParser(this.parserOptions);
    this.builder = new XMLBuilder(this.builderOptions);
  }

  /**
   * Convert JSZip instance to JSON object with parsed XML files
   */
  async jszip2json(jszip: JSZip): Promise<PPTXJson> {
    const json: PPTXJson = {};
    
    const promises = Object.keys(jszip.files).map(async relativePath => {
      const file = jszip.file(relativePath);
      
      if (!file || file.dir) {
        return;
      }
      
      const ext = this.getFileExtension(relativePath);
      
      let content: XMLNode | Uint8Array | string;
      if (ext === '.xml' || ext === '.rels') {
        // Parse XML files
        const xml = await file.async("string");
        try {
          content = this.parser.parse(xml) as XMLNode;
        } catch (error) {
          console.warn(`Failed to parse XML file ${relativePath}:`, error);
          content = xml; // fallback to raw XML
        }
      } else {
        // Binary files (images, audio, etc.)
        const binaryType = this.options.jszipBinary || 'uint8array';
        if (binaryType === 'uint8array') {
          const uint8Array = await file.async('uint8array');
          content = new Uint8Array(uint8Array);
        } else {
          const result = await file.async(binaryType as any);
          content = new Uint8Array(result as ArrayBuffer);
        }
      }
      
      json[relativePath] = content;
    });
    
    await Promise.all(promises);
    return json;
  }

  /**
   * Parse PowerPoint buffer to JSON
   */
  async buffer2json(buffer: Buffer | Uint8Array | ArrayBuffer): Promise<PPTXJson> {
    try {
      const zip = await JSZip.loadAsync(buffer);
      return await this.jszip2json(zip);
    } catch (error) {
      throw new Error(`Failed to parse PowerPoint buffer: ${(error as Error).message}`);
    }
  }

  /**
   * Convert JSON back to JSZip instance
   */
  json2jszip(json: PPTXJson): JSZip {
    const zip = new JSZip();
    
    Object.keys(json).forEach(relativePath => {
      const ext = this.getFileExtension(relativePath);
      
      if (ext === '.xml' || ext === '.rels') {
        // Convert parsed JSON back to XML
        try {
          const xml = this.builder.build(json[relativePath]);
          zip.file(relativePath, xml);
        } catch (error) {
          console.warn(`Failed to build XML for ${relativePath}:`, error);
          // Fallback: assume it's already a string
          zip.file(relativePath, json[relativePath] as string);
        }
      } else {
        // Binary files
        zip.file(relativePath, json[relativePath] as Uint8Array);
      }
    });
    
    return zip;
  }

  /**
   * Convert JSON to PowerPoint buffer
   */
  async toPPTX(json: PPTXJson): Promise<Uint8Array> {
    const zip = this.json2jszip(json);
    
    const buffer = await zip.generateAsync({
      type: this.options.jszipGenerateType || 'uint8array'
    });
    
    return buffer as Uint8Array;
  }

  /**
   * Get file extension from path
   */
  private getFileExtension(path: string): string {
    const lastDot = path.lastIndexOf('.');
    return lastDot !== -1 ? path.substring(lastDot) : '';
  }

  /**
   * Get slide dimensions from presentation.xml
   */
  getSlideDimensions(json: PPTXJson): SlideDimensions {
    const presentationXML = 'ppt/presentation.xml';
    
    // Default PowerPoint slide dimensions using centralized constants (in pixels)
    const defaultDimensions: SlideDimensions = { width: DEFAULT_SLIDE_WIDTH_PX, height: DEFAULT_SLIDE_HEIGHT_PX };
    
    if (!(presentationXML in json)) {
      return defaultDimensions;
    }
    
    const presentation = json[presentationXML] as XMLNode;
    
    try {
      // Navigate to slide size element (namespaces already stripped by normalizer)
      const sldSz = presentation?.['presentation']?.['sldSz'];
      if (!sldSz) {
        return defaultDimensions;
      }
      
      // Extract dimensions from EMU using centralized conversion
      // The fast-xml-parser uses attributeNamePrefix "$" so attributes are $cx, $cy
      const widthEmu = parseInt(sldSz.$cx || DEFAULT_SLIDE_WIDTH_EMU);
      const heightEmu = parseInt(sldSz.$cy || DEFAULT_SLIDE_HEIGHT_EMU);
      
      const width = emuToPixels(widthEmu);
      const height = emuToPixels(heightEmu);
      
      // Validate dimensions are in pixel range
      validatePixelRange(width, 'slide width');
      validatePixelRange(height, 'slide height');
      
      return { width, height };
      
    } catch (error) {
      console.warn('Error parsing slide dimensions:', error);
      return defaultDimensions;
    }
  }

  /**
   * Find max slide IDs in presentation.xml
   */
  getMaxSlideIds(json: PPTXJson): MaxSlideIds {
    const presentationXML = 'ppt/presentation.xml';
    let max: MaxSlideIds = { id: -1, rid: -1 };
    
    if (!(presentationXML in json)) {
      return max;
    }
    
    const presentation = json[presentationXML] as XMLNode;
    
    try {
      const slideIdList = presentation?.['p:presentation']?.['p:sldIdLst'];
      if (!slideIdList) {
        return max;
      }
      
      // Handle both array and single object cases
      const slideIds = Array.isArray(slideIdList) ? slideIdList : [slideIdList];
      
      slideIds.forEach(slideIdItem => {
        const slides = slideIdItem['p:sldId'];
        if (!slides) return;
        
        const slideArray = Array.isArray(slides) ? slides : [slides];
        
        slideArray.forEach(slide => {
          if (slide.$) {
            const id = parseInt(slide.$.id || '0');
            const ridStr = slide.$['r:id'] || 'rId0';
            const rid = parseInt(ridStr.replace('rId', ''));
            
            max.id = Math.max(max.id, id);
            max.rid = Math.max(max.rid, rid);
          }
        });
      });
    } catch (error) {
      console.warn('Error parsing slide IDs:', error);
    }
    
    return max;
  }

  /**
   * Get slide layout type hash
   */
  getSlideLayoutTypeHash(json: PPTXJson): Record<string, string> {
    const table: Record<string, string> = {};
    
    const layoutKeys = Object.keys(json).filter(key => 
      /^ppt\/slideLayouts\/[^_]+\.xml$/.test(key) && (json[key] as XMLNode)['p:sldLayout']
    );
    
    layoutKeys.forEach(layoutKey => {
      try {
        const layout = (json[layoutKey] as XMLNode)['p:sldLayout'];
        if (layout && layout.$ && layout.$.type) {
          table[layout.$.type] = layoutKey;
        }
      } catch (error) {
        console.warn(`Error parsing layout ${layoutKey}:`, error);
      }
    });
    
    return table;
  }

  /**
   * Get slide-to-layout relationship mapping
   */
  getSlideLayoutRelationships(json: PPTXJson): Record<string, string> {
    const relationships: Record<string, string> = {};
    
    // Find all slide relationship files
    const slideRelFiles = Object.keys(json).filter(key => 
      /^ppt\/slides\/_rels\/slide\d+\.xml\.rels$/.test(key)
    );
    
    slideRelFiles.forEach(relFile => {
      try {
        const slideNumber = relFile.match(/slide(\d+)\.xml\.rels$/)?.[1];
        if (!slideNumber) return;
        
        const slideFile = `ppt/slides/slide${slideNumber}.xml`;
        const relData = json[relFile] as XMLNode;
        
        // Look for slideLayout relationship
        const rels = relData?.Relationships?.Relationship;
        if (!rels) return;
        
        const relArray = Array.isArray(rels) ? rels : [rels];
        
        for (const rel of relArray) {
          if (rel.$Type && rel.$Type.includes('slideLayout')) {
            // Convert relative path to full path
            const layoutFile = rel.$Target.replace('../', 'ppt/');
            relationships[slideFile] = layoutFile;
            break;
          }
        }
      } catch (error) {
        console.warn(`Error parsing slide relationship ${relFile}:`, error);
      }
    });
    
    return relationships;
  }

  /**
   * Extract layout elements from a slide layout file
   */
  getSlideLayoutElements(json: PPTXJson, layoutFile: string, slideDimensions?: { width: number; height: number }): LayoutElement[] {
    if (!json[layoutFile]) {
      return [];
    }
    
    try {
      const layoutData = json[layoutFile] as XMLNode;
      // Handle both namespaced and non-namespaced versions
      const layout = layoutData['p:sldLayout'] || layoutData['sldLayout'] || layoutData;
      if (!layout) return [];
      
      const cSld = layout['p:cSld'] || layout['cSld'];
      if (!cSld) return [];
      
      const elements: LayoutElement[] = [];
      let zIndex = -1000; // Start with very negative z-index for background
      
      // First, check for background elements (both namespaced and non-namespaced)
      const bg = cSld['p:bg'] || cSld['bg'];
      if (bg) {
        const bgElement = this.extractBackgroundElement(bg, zIndex--, slideDimensions);
        if (bgElement) {
          bgElement.isLayoutElement = true;
          elements.push(bgElement);
        }
      }
      
      const spTree = cSld['p:spTree'] || cSld['spTree'];
      if (!spTree) {
        return elements; // Return just background if no spTree
      }
      
      // Process different element types
      const processElements = (elementArray: XMLNode | XMLNode[] | undefined, type: 'shape' | 'image') => {
        if (!elementArray) return;
        const arr = Array.isArray(elementArray) ? elementArray : [elementArray];
        
        arr.forEach(element => {
          if (element && typeof element === 'object') {
            // Skip empty text elements from layout
            if (type === 'shape' && this.isEmptyTextElement(element)) {
              return; // Skip this element
            }
            
            // Skip empty shape elements (those without meaningful geometric content)
            if (type === 'shape' && this.isEmptyShapeElement(element)) {
              return; // Skip this element
            }
            
            // Detect if a shape actually contains image data and reclassify as image
            let finalType = type;
            if (type === 'shape') {
              const spPr = element['p:spPr'] || element['spPr'];
              const blipFill = spPr && (spPr['p:blipFill'] || spPr['blipFill']);
              if (blipFill) {
                finalType = 'image';
                // console.log('Detected shape with image data, reclassifying as image:', {
                //   hasBlipFill: !!blipFill,
                //   elementKeys: Object.keys(element)
                // });
              }
            }
            
            // Element data is already namespace-stripped
            elements.push({
              type: finalType,
              data: element,
              zIndex: zIndex--, // Assign increasingly negative z-index
              isLayoutElement: true // Mark as layout element
            });
          }
        });
      };
      
      // Process shapes (handle both namespaced and non-namespaced)
      processElements(spTree['p:sp'] || spTree['sp'], 'shape');
      
      // Process pictures 
      processElements(spTree['p:pic'] || spTree['pic'], 'image');
      
      // Process group shapes
      const grpSp = spTree['p:grpSp'] || spTree['grpSp'];
      if (grpSp) {
        const grpArray = Array.isArray(grpSp) ? grpSp : [grpSp];
        grpArray.forEach(grp => {
          // Recursively process group contents
          const sp = grp['p:sp'] || grp['sp'];
          const pic = grp['p:pic'] || grp['pic'];
          if (sp) processElements(sp, 'shape');
          if (pic) processElements(pic, 'image');
        });
      }
      
      return elements;
      
    } catch (error) {
      console.warn(`Error extracting layout elements from ${layoutFile}:`, error);
      return [];
    }
  }

  /**
   * Get layout-to-master relationship mapping
   */
  getLayoutMasterRelationships(json: PPTXJson): Record<string, string> {
    const relationships: Record<string, string> = {};
    
    // Find all layout relationship files
    const layoutRelFiles = Object.keys(json).filter(key => 
      /^ppt\/slideLayouts\/_rels\/slideLayout\d+\.xml\.rels$/.test(key)
    );
    
    layoutRelFiles.forEach(relFile => {
      try {
        const layoutNumber = relFile.match(/slideLayout(\d+)\.xml\.rels$/)?.[1];
        if (!layoutNumber) return;
        
        const layoutFile = `ppt/slideLayouts/slideLayout${layoutNumber}.xml`;
        const relData = json[relFile] as XMLNode;
        
        // Look for slideMaster relationship
        const rels = relData?.Relationships?.Relationship;
        if (!rels) return;
        
        const relArray = Array.isArray(rels) ? rels : [rels];
        
        for (const rel of relArray) {
          if (rel.$Type && rel.$Type.includes('slideMaster')) {
            // Convert relative path to full path
            const masterFile = rel.$Target.replace('../', 'ppt/');
            relationships[layoutFile] = masterFile;
            break;
          }
        }
      } catch (error) {
        console.warn(`Error parsing layout-master relationship ${relFile}:`, error);
      }
    });
    
    return relationships;
  }

  /**
   * Extract master elements from a slide master file
   */
  getSlideMasterElements(json: PPTXJson, masterFile: string, slideDimensions?: { width: number; height: number }): LayoutElement[] {
    if (!json[masterFile]) {
      // console.log(`Master file not found: ${masterFile}`);
      return [];
    }
    
    try {
      // console.log(`Processing master file: ${masterFile}`);
      const masterData = json[masterFile] as XMLNode;
      // Handle both namespaced and non-namespaced versions
      const master = masterData['p:sldMaster'] || masterData['sldMaster'] || masterData;
      if (!master) {
        // console.log(`No sldMaster in ${masterFile}`);
        return [];
      }
      
      const cSld = master['p:cSld'] || master['cSld'];
      if (!cSld) {
        // console.log(`No cSld in master ${masterFile}`);
        return [];
      }
      
      
      const elements: LayoutElement[] = [];
      let zIndex = -2000; // Start with very negative z-index for deepest background
      
      // First, check for background elements (both namespaced and non-namespaced)
      const bg = cSld['p:bg'] || cSld['bg'];
      if (bg) {
        const bgElement = this.extractBackgroundElement(bg, zIndex--, slideDimensions);
        if (bgElement) {
          bgElement.isMasterElement = true;
          elements.push(bgElement);
        }
      }
      
      const spTree = cSld['p:spTree'] || cSld['spTree'];
      if (!spTree) {
        return elements; // Return just background if no spTree
      }
      
      // Process different element types
      const processElements = (elementArray: XMLNode | XMLNode[] | undefined, type: 'shape' | 'image') => {
        if (!elementArray) return;
        const arr = Array.isArray(elementArray) ? elementArray : [elementArray];
        
        arr.forEach(element => {
          if (element && typeof element === 'object') {
            // Skip placeholders - they're structural, not visual background elements
            const nvSpPr = element['nvSpPr'];
            const ph = nvSpPr?.['nvPr']?.['ph'];
            
            if (!ph) { // Only include non-placeholder elements
              // Detect if a shape actually contains image data and reclassify as image
              let finalType = type;
              if (type === 'shape') {
                const spPr = element['p:spPr'] || element['spPr'];
                const blipFill = spPr && (spPr['p:blipFill'] || spPr['blipFill']);
                if (blipFill) {
                  finalType = 'image';
                  // console.log('Detected master shape with image data, reclassifying as image:', {
                  //   hasBlipFill: !!blipFill,
                  //   elementKeys: Object.keys(element)
                  // });
                }
              }
              
              // Element data is already namespace-stripped
              elements.push({
                type: finalType,
                data: element,
                zIndex: zIndex--, // Assign increasingly negative z-index
                isMasterElement: true // Mark as master element
              });
            }
          }
        });
      };
      
      // Process shapes (handle both namespaced and non-namespaced)
      processElements(spTree['p:sp'] || spTree['sp'], 'shape');
      
      // Process pictures 
      processElements(spTree['p:pic'] || spTree['pic'], 'image');
      
      // Process group shapes
      const grpSp = spTree['p:grpSp'] || spTree['grpSp'];
      if (grpSp) {
        const grpArray = Array.isArray(grpSp) ? grpSp : [grpSp];
        grpArray.forEach(grp => {
          // Recursively process group contents
          const sp = grp['p:sp'] || grp['sp'];
          const pic = grp['p:pic'] || grp['pic'];
          if (sp) processElements(sp, 'shape');
          if (pic) processElements(pic, 'image');
        });
      }
      
      // console.log(`Master ${masterFile} extracted ${elements.length} elements`);
      return elements;
      
    } catch (error) {
      console.warn(`Error extracting master elements from ${masterFile}:`, error);
      return [];
    }
  }

  /**
   * Extract background element from p:bg structure
   */
  private extractBackgroundElement(bg: XMLNode, zIndex: number, slideDimensions?: { width: number; height: number }): LayoutElement | null {
    try {
      // console.log('Extracting background element:', JSON.stringify(bg, null, 2));
      // Check for background properties (already namespace-stripped)
      const bgPr = bg['bgPr'];
      if (!bgPr) {
        // Sometimes background is a reference
        const bgRef = bg['bgRef'];
        if (bgRef) {
          // This is a theme color reference, create a shape element
          return {
            type: 'shape',
            data: {
              nvSpPr: {
                cNvPr: {
                  $id: zIndex * -1, // Use positive ID
                  $name: 'Background'
                }
              },
              spPr: bgRef,
              isBackground: true
            },
            zIndex: zIndex,
            isBackgroundElement: true
          };
        }
        return null;
      }
      
      // Check for blip fill (image background) - already namespace-stripped
      const blipFill = bgPr['blipFill'];
      // console.log('Checking blipFill:', !!blipFill, blipFill ? Object.keys(blipFill) : 'none');
      if (blipFill) {
        const blip = blipFill['blip'];
        // console.log('Found blip:', !!blip, blip ? Object.keys(blip) : 'none');
        if (blip) {
          // Handle attribute formats - look for embed in attributes
          // After namespace stripping, attributes might be directly on the object
          const rEmbed = blip.$embed || blip['$embed'] || blip.embed || (blip.$ && blip.$['embed']);
          if (rEmbed) {
            // This is an image background
            // Structure the blipFill properly so ImageParser can find the embed
            const structuredBlipFill = {
              ...blipFill,
              blip: {
                ...blip,
                embed: rEmbed  // Ensure embed is in the expected location
              }
            };
            
            // Calculate background dimensions in EMUs
            const widthEmu = slideDimensions ? pixelsToEmu(slideDimensions.width) : DEFAULT_SLIDE_WIDTH_EMU;
            const heightEmu = slideDimensions ? pixelsToEmu(slideDimensions.height) : DEFAULT_SLIDE_HEIGHT_EMU;
            
            return {
              type: 'image',
              data: {
                nvPicPr: {
                  cNvPr: {
                    $id: zIndex * -1, // Use positive ID
                    $name: 'Background Image'
                  }
                },
                blipFill: structuredBlipFill,
                spPr: {
                  xfrm: {
                    // Use actual slide dimensions converted to EMUs
                    off: { $x: 0, $y: 0 },
                    ext: { $cx: widthEmu, $cy: heightEmu }
                  }
                },
                isBackground: true,
                relationshipId: rEmbed
              },
              zIndex: zIndex,
              isBackgroundElement: true
            };
          }
        }
      }
      
      // Check for solid fill or other fills (already namespace-stripped)
      const solidFill = bgPr['solidFill'];
      const gradFill = bgPr['gradFill'];
      const pattFill = bgPr['pattFill'];
      
      // console.log('Background fills detected:', {
      //   solidFill: !!solidFill,
      //   gradFill: !!gradFill,
      //   pattFill: !!pattFill,
      //   bgPrKeys: Object.keys(bgPr)
      // });
      
      if (solidFill || gradFill || pattFill) {
        // Check if solid fill is white/near-white and should be skipped
        if (solidFill) {
          const color = BaseParser.parseColor(solidFill);
          if (BaseParser.isWhiteOrNearWhite(color)) {
            // Skip white/near-white backgrounds - treat as no background
            return null;
          }
        }
        
        // Calculate background dimensions in EMUs
        const widthEmu = slideDimensions ? pixelsToEmu(slideDimensions.width) : DEFAULT_SLIDE_WIDTH_EMU;
        const heightEmu = slideDimensions ? pixelsToEmu(slideDimensions.height) : DEFAULT_SLIDE_HEIGHT_EMU;
        
        return {
          type: 'shape',
          data: {
            nvSpPr: {
              cNvPr: {
                $id: zIndex * -1,
                $name: 'Background Fill'
              }
            },
            spPr: {
              xfrm: {
                // Use actual slide dimensions converted to EMUs
                off: { $x: 0, $y: 0 },
                ext: { $cx: widthEmu, $cy: heightEmu }
              },
              solidFill: solidFill,
              gradFill: gradFill,
              pattFill: pattFill
            },
            isBackground: true
          },
          zIndex: zIndex,
          isBackgroundElement: true
        };
      }
      
      // If we have other background properties, return as generic shape
      return {
        type: 'shape',
        data: {
          nvSpPr: {
            cNvPr: {
              $id: zIndex * -1,
              $name: 'Background'
            }
          },
          spPr: bgPr,
          isBackground: true
        },
        zIndex: zIndex,
        isBackgroundElement: true
      };
      
    } catch (error) {
      console.warn('Error extracting background element:', error);
      return null;
    }
  }

  /**
   * Strip namespaces from element data (similar to PowerPointNormalizer.stripNamespaces)
   */
  private stripNamespacesFromElement(obj: any): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.stripNamespacesFromElement(item));
    }

    const stripped: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Strip namespace prefix (everything before and including the colon)
      const strippedKey = key.includes(':') ? key.split(':')[1] : key;
      stripped[strippedKey] = this.stripNamespacesFromElement(value);
    }
    
    return stripped;
  }

  /**
   * Check if a shape element contains only empty text content
   */
  private isEmptyTextElement(element: XMLNode): boolean {
    if (!element) return true;
    
    // Check for text body content (both namespaced and non-namespaced)
    const txBody = element['p:txBody'] || element['txBody'];
    if (!txBody) return false; // Not a text element
    
    // Check if text body has actual content
    return !this.hasTextContent(txBody);
  }

  /**
   * Check if a shape element is empty (no meaningful visual content)
   */
  private isEmptyShapeElement(element: XMLNode): boolean {
    if (!element) return true;
    
    // Get shape properties
    const spPr = element['p:spPr'] || element['spPr'];
    if (!spPr) return true; // No shape properties means empty
    
    // Check for geometry - if no geometry, it's likely empty
    const prstGeom = spPr['p:prstGeom'] || spPr['prstGeom'];
    const custGeom = spPr['p:custGeom'] || spPr['custGeom'];
    
    if (!prstGeom && !custGeom) {
      return true; // No geometry definition
    }
    
    // Check for fill - if no fill and no stroke, it might be empty
    const solidFill = spPr['p:solidFill'] || spPr['solidFill'];
    const gradFill = spPr['p:gradFill'] || spPr['gradFill'];
    const blipFill = spPr['p:blipFill'] || spPr['blipFill'];
    const pattFill = spPr['p:pattFill'] || spPr['pattFill'];
    const noFill = spPr['p:noFill'] || spPr['noFill'];
    
    const ln = spPr['p:ln'] || spPr['ln'];
    
    // If explicitly no fill and no line, it's empty
    if (noFill && !ln) {
      return true;
    }
    
    // If no fill properties and no line, consider empty
    if (!solidFill && !gradFill && !blipFill && !pattFill && !ln) {
      return true;
    }
    
    return false; // Has some visual content
  }

  /**
   * Check if a textBody contains actual text content
   */
  private hasTextContent(textBody: XMLNode): boolean {
    if (!textBody) return false;
    
    // Get paragraphs (both namespaced and non-namespaced)
    const paragraphs = textBody['p:p'] || textBody['p'];
    if (!paragraphs) return false;
    
    const paragraphArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    
    // Check each paragraph for actual text runs
    for (const p of paragraphArray) {
      const runs = p['p:r'] || p['r'];
      if (runs) {
        const runArray = Array.isArray(runs) ? runs : [runs];
        for (const run of runArray) {
          const text = run['p:t'] || run['t'];
          if (text && typeof text === 'string' && text.trim().length > 0) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Extract placeholder definitions from a layout or master file
   */
  getPlaceholderDefinitions(json: PPTXJson, layoutFile: string): PlaceholderMap {
    const placeholders: PlaceholderMap = {};
    
    
    if (!json[layoutFile]) {
      console.log(`❌ Layout file not found: ${layoutFile}`);
      return placeholders;
    }
    
    try {
      const layoutData = json[layoutFile] as XMLNode;
      const layout = layoutData['p:sldLayout'] || layoutData['sldLayout'] || 
                    layoutData['p:sldMaster'] || layoutData['sldMaster'] || layoutData;
      if (!layout) return placeholders;
      
      const cSld = layout['p:cSld'] || layout['cSld'];
      if (!cSld) return placeholders;
      
      const spTree = cSld['p:spTree'] || cSld['spTree'];
      if (!spTree) return placeholders;
      
      // Process shapes that have placeholder definitions
      const processPlaceholders = (elementArray: XMLNode | XMLNode[] | undefined) => {
        if (!elementArray) return;
        const arr = Array.isArray(elementArray) ? elementArray : [elementArray];
        
        arr.forEach(element => {
          if (element && typeof element === 'object') {
            // Look for placeholder definition
            const nvSpPr = element['p:nvSpPr'] || element['nvSpPr'];
            const nvPr = nvSpPr?.['p:nvPr'] || nvSpPr?.['nvPr'];
            const ph = nvPr?.['p:ph'] || nvPr?.['ph'];
            
            if (ph) {
              // Extract idx and type attributes
              const idx = ph.$idx || ph.idx;
              const type = ph.$type || ph.type || 'content';
              
              // Extract position from spPr
              const spPr = element['p:spPr'] || element['spPr'];
              const xfrm = spPr?.['p:xfrm'] || spPr?.['xfrm'] || spPr?.['a:xfrm'];
              
              if (xfrm) {
                const off = xfrm['p:off'] || xfrm['off'] || xfrm['a:off'];
                const ext = xfrm['p:ext'] || xfrm['ext'] || xfrm['a:ext'];
                
                if (off && ext) {
                  const x = emuToPixels(parseInt(off.$x || off.x || '0'));
                  const y = emuToPixels(parseInt(off.$y || off.y || '0'));
                  const width = emuToPixels(parseInt(ext.$cx || ext.cx || '0'));
                  const height = emuToPixels(parseInt(ext.$cy || ext.cy || '0'));
                  
                  const placeholderData = {
                    x,
                    y,
                    width,
                    height,
                    type
                  };
                  
                  
                  // Only store placeholder if it has meaningful position/size data
                  // This prevents layout placeholders without position from overriding master placeholders
                  if (x !== 0 || y !== 0 || width !== 0 || height !== 0) {
                    
                    // Store by idx if it exists
                    if (idx !== undefined && idx !== null) {
                      placeholders[String(idx)] = placeholderData;
                    }
                    
                    // Also store by type for lookup when idx is not available
                    placeholders[`type:${type}`] = placeholderData;
                    
                    // Debug logging for stored placeholders
                    if (layoutFile.includes('slideMaster3.xml') || layoutFile.includes('slideLayout12.xml')) {
                    }
                  } else {
                    // Debug logging for skipped placeholders
                    if (layoutFile.includes('slideLayout12.xml') && type === 'title') {
                    }
                  }
                }
              }
            }
          }
        });
      };
      
      // Process shapes (handle both namespaced and non-namespaced)
      processPlaceholders(spTree['p:sp'] || spTree['sp']);
      
      // Process group shapes
      const grpSp = spTree['p:grpSp'] || spTree['grpSp'];
      if (grpSp) {
        const grpArray = Array.isArray(grpSp) ? grpSp : [grpSp];
        grpArray.forEach(grp => {
          const sp = grp['p:sp'] || grp['sp'];
          if (sp) processPlaceholders(sp);
        });
      }
      
      return placeholders;
      
    } catch (error) {
      console.warn(`Error extracting placeholder definitions from ${layoutFile}:`, error);
      return placeholders;
    }
  }
}

// Export a default instance for convenience
export const pptxParser = new PPTXParser();

// For CommonJS compatibility
export default PPTXParser;