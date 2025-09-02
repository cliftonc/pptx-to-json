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
  DEFAULT_SLIDE_WIDTH_PX, 
  DEFAULT_SLIDE_HEIGHT_PX, 
  DEFAULT_SLIDE_WIDTH_EMU,
  DEFAULT_SLIDE_HEIGHT_EMU,
  validatePixelRange 
} from '../utils/constants.js';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

export class PPTXParser {
  constructor(options = {}) {
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
   * @param {JSZip} jszip - JSZip instance
   * @returns {Promise<Object>} - JSON representation of PPTX
   */
  async jszip2json(jszip) {
    const json = {};
    
    const promises = Object.keys(jszip.files).map(async relativePath => {
      const file = jszip.file(relativePath);
      
      if (!file || file.dir) {
        return;
      }
      
      const ext = this.getFileExtension(relativePath);
      
      let content;
      if (ext === '.xml' || ext === '.rels') {
        // Parse XML files
        const xml = await file.async("string");
        try {
          content = this.parser.parse(xml);
        } catch (error) {
          console.warn(`Failed to parse XML file ${relativePath}:`, error);
          content = xml; // fallback to raw XML
        }
      } else {
        // Binary files (images, audio, etc.)
        const uint8Array = await file.async(this.options.jszipBinary || 'uint8array');
        // Convert Uint8Array to Buffer for compatibility with ImageParser
        content = new Uint8Array(uint8Array);
      }
      
      json[relativePath] = content;
    });
    
    await Promise.all(promises);
    return json;
  }

  /**
   * Parse PowerPoint buffer to JSON
   * @param {Buffer|Uint8Array|ArrayBuffer} buffer - PowerPoint file buffer
   * @returns {Promise<Object>} - JSON representation of PPTX
   */
  async buffer2json(buffer) {
    try {
      const zip = await JSZip.loadAsync(buffer);
      return await this.jszip2json(zip);
    } catch (error) {
      throw new Error(`Failed to parse PowerPoint buffer: ${error.message}`);
    }
  }

  /**
   * Convert JSON back to JSZip instance
   * @param {Object} json - JSON representation of PPTX
   * @returns {JSZip} - JSZip instance
   */
  json2jszip(json) {
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
          zip.file(relativePath, json[relativePath]);
        }
      } else {
        // Binary files
        zip.file(relativePath, json[relativePath]);
      }
    });
    
    return zip;
  }

  /**
   * Convert JSON to PowerPoint buffer
   * @param {Object} json - JSON representation of PPTX
   * @returns {Promise<Uint8Array>} - PowerPoint file buffer
   */
  async toPPTX(json) {
    const zip = this.json2jszip(json);
    
    const buffer = await zip.generateAsync({
      type: this.options.jszipGenerateType || 'uint8array'
    });
    
    return buffer;
  }

  /**
   * Get file extension from path
   * @param {string} path - File path
   * @returns {string} - File extension
   */
  getFileExtension(path) {
    const lastDot = path.lastIndexOf('.');
    return lastDot !== -1 ? path.substring(lastDot) : '';
  }

  /**
   * Get slide dimensions from presentation.xml
   * @param {Object} json - JSON representation of PPTX
   * @returns {Object} - {width: number, height: number} in pixels
   */
  getSlideDimensions(json) {
    const presentationXML = 'ppt/presentation.xml';
    
    // Default PowerPoint slide dimensions using centralized constants (in pixels)
    const defaultDimensions = { width: DEFAULT_SLIDE_WIDTH_PX, height: DEFAULT_SLIDE_HEIGHT_PX };
    
    if (!(presentationXML in json)) {
      return defaultDimensions;
    }
    
    const presentation = json[presentationXML];
    
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
   * @param {Object} json - JSON representation of PPTX
   * @returns {Object} - {id: number, rid: number}
   */
  getMaxSlideIds(json) {
    const presentationXML = 'ppt/presentation.xml';
    let max = { id: -1, rid: -1 };
    
    if (!(presentationXML in json)) {
      return max;
    }
    
    const presentation = json[presentationXML];
    
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
            const id = parseInt(slide.$.id || 0);
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
   * @param {Object} json - JSON representation of PPTX
   * @returns {Object} - Hash of layout types to file paths
   */
  getSlideLayoutTypeHash(json) {
    const table = {};
    
    const layoutKeys = Object.keys(json).filter(key => 
      /^ppt\/slideLayouts\/[^_]+\.xml$/.test(key) && json[key]['p:sldLayout']
    );
    
    layoutKeys.forEach(layoutKey => {
      try {
        const layout = json[layoutKey]['p:sldLayout'];
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
   * @param {Object} json - JSON representation of PPTX
   * @returns {Object} - Hash mapping slide files to layout files
   */
  getSlideLayoutRelationships(json) {
    const relationships = {};
    
    // Find all slide relationship files
    const slideRelFiles = Object.keys(json).filter(key => 
      /^ppt\/slides\/_rels\/slide\d+\.xml\.rels$/.test(key)
    );
    
    slideRelFiles.forEach(relFile => {
      try {
        const slideNumber = relFile.match(/slide(\d+)\.xml\.rels$/)?.[1];
        if (!slideNumber) return;
        
        const slideFile = `ppt/slides/slide${slideNumber}.xml`;
        const relData = json[relFile];
        
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
   * @param {Object} json - JSON representation of PPTX
   * @param {string} layoutFile - Layout file path (e.g., 'ppt/slideLayouts/slideLayout1.xml')
   * @returns {Array} - Array of layout elements
   */
  getSlideLayoutElements(json, layoutFile) {
    if (!json[layoutFile]) {
      return [];
    }
    
    try {
      const layoutData = json[layoutFile];
      // Handle both namespaced and non-namespaced versions
      const layout = layoutData['p:sldLayout'] || layoutData['sldLayout'] || layoutData;
      if (!layout) return [];
      
      const cSld = layout['p:cSld'] || layout['cSld'];
      if (!cSld) return [];
      
      const elements = [];
      let zIndex = -1000; // Start with very negative z-index for background
      
      // First, check for background elements (both namespaced and non-namespaced)
      const bg = cSld['p:bg'] || cSld['bg'];
      if (bg) {
        const bgElement = this.extractBackgroundElement(bg, zIndex--);
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
      const processElements = (elementArray, type) => {
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
            
            // Element data is already namespace-stripped
            elements.push({
              type,
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
   * @param {Object} json - JSON representation of PPTX
   * @returns {Object} - Hash mapping layout files to master files
   */
  getLayoutMasterRelationships(json) {
    const relationships = {};
    
    // Find all layout relationship files
    const layoutRelFiles = Object.keys(json).filter(key => 
      /^ppt\/slideLayouts\/_rels\/slideLayout\d+\.xml\.rels$/.test(key)
    );
    
    layoutRelFiles.forEach(relFile => {
      try {
        const layoutNumber = relFile.match(/slideLayout(\d+)\.xml\.rels$/)?.[1];
        if (!layoutNumber) return;
        
        const layoutFile = `ppt/slideLayouts/slideLayout${layoutNumber}.xml`;
        const relData = json[relFile];
        
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
   * @param {Object} json - JSON representation of PPTX
   * @param {string} masterFile - Master file path (e.g., 'ppt/slideMasters/slideMaster1.xml')
   * @returns {Array} - Array of master elements
   */
  getSlideMasterElements(json, masterFile) {
    if (!json[masterFile]) {
      return [];
    }
    
    try {
      const masterData = json[masterFile];
      // Handle both namespaced and non-namespaced versions
      const master = masterData['p:sldMaster'] || masterData['sldMaster'] || masterData;
      if (!master) return [];
      
      const cSld = master['p:cSld'] || master['cSld'];
      if (!cSld) {
        console.log('❌ No cSld in master');
        return [];
      }
      
      
      const elements = [];
      let zIndex = -2000; // Start with very negative z-index for deepest background
      
      // First, check for background elements (both namespaced and non-namespaced)
      const bg = cSld['p:bg'] || cSld['bg'];
      if (bg) {
        const bgElement = this.extractBackgroundElement(bg, zIndex--);
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
      const processElements = (elementArray, type) => {
        if (!elementArray) return;
        const arr = Array.isArray(elementArray) ? elementArray : [elementArray];
        
        arr.forEach(element => {
          if (element && typeof element === 'object') {
            // Skip placeholders - they're structural, not visual background elements
            const nvSpPr = element['nvSpPr'];
            const ph = nvSpPr?.['nvPr']?.['ph'];
            
            if (!ph) { // Only include non-placeholder elements
              // Element data is already namespace-stripped
              elements.push({
                type,
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
      
      return elements;
      
    } catch (error) {
      console.warn(`Error extracting master elements from ${masterFile}:`, error);
      return [];
    }
  }

  /**
   * Extract background element from p:bg structure
   * @param {Object} bg - Background element from XML
   * @param {number} zIndex - Z-index for the background
   * @returns {Object|null} - Background element or null
   */
  extractBackgroundElement(bg, zIndex) {
    try {
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
      if (blipFill) {
        const blip = blipFill['blip'];
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
                    // Full slide dimensions (standard PowerPoint size in EMUs)
                    off: { $x: 0, $y: 0 },
                    ext: { $cx: DEFAULT_SLIDE_WIDTH_EMU, $cy: DEFAULT_SLIDE_HEIGHT_EMU }
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
      
      if (solidFill || gradFill || pattFill) {
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
                // Full slide dimensions
                off: { $x: 0, $y: 0 },
                ext: { $cx: DEFAULT_SLIDE_WIDTH_EMU, $cy: DEFAULT_SLIDE_HEIGHT_EMU }
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
   * @param {Object} obj - Object to strip namespaces from
   * @returns {Object} - Object with namespaces stripped
   */
  stripNamespacesFromElement(obj) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.stripNamespacesFromElement(item));
    }

    const stripped = {};
    
    for (const [key, value] of Object.entries(obj)) {
      // Strip namespace prefix (everything before and including the colon)
      const strippedKey = key.includes(':') ? key.split(':')[1] : key;
      stripped[strippedKey] = this.stripNamespacesFromElement(value);
    }
    
    return stripped;
  }

  /**
   * Check if a shape element contains only empty text content
   * @param {Object} element - Shape element to check
   * @returns {boolean} - True if element is empty text, false otherwise
   */
  isEmptyTextElement(element) {
    if (!element) return true;
    
    // Check for text body content (both namespaced and non-namespaced)
    const txBody = element['p:txBody'] || element['txBody'];
    if (!txBody) return false; // Not a text element
    
    // Check if text body has actual content
    return !this.hasTextContent(txBody);
  }

  /**
   * Check if a shape element is empty (no meaningful visual content)
   * @param {Object} element - Shape element to check
   * @returns {boolean} - True if element is empty, false otherwise
   */
  isEmptyShapeElement(element) {
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
   * @param {Object} textBody - Text body to check
   * @returns {boolean} - True if has text content, false otherwise
   */
  hasTextContent(textBody) {
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
}

// Export a default instance for convenience
export const pptxParser = new PPTXParser();

// For CommonJS compatibility
export default PPTXParser;