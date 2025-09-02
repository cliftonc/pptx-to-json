/**
 * PowerPoint Structure Normalizer
 * 
 * Converts both PPTX files and clipboard data to a unified internal structure,
 * eliminating the need for if-statements throughout the parsing logic.
 */

import { PPTXParser } from '../processors/PPTXParser.js';
import { DEFAULT_SLIDE_WIDTH_PX, DEFAULT_SLIDE_HEIGHT_PX } from '../utils/constants.js';
import { BaseParser } from './BaseParser.js';

export class PowerPointNormalizer {
  
  /**
   * Normalize PowerPoint JSON data to a unified structure
   * @param {Object} json - Parsed PowerPoint JSON from PPTXParser
   * @returns {Object} - Normalized structure
   */
  normalize(json) {
    const formatType = this.detectFormat(json);
    
    // Strip all namespaces from the entire JSON structure at the very start
    const strippedJson = this.stripNamespaces(json);
    
    switch (formatType) {
      case 'pptx':
        return this.normalizePPTX(strippedJson, formatType);
      case 'clipboard':
        return this.normalizeClipboard(strippedJson, formatType);
      default:
        throw new Error(`Unknown PowerPoint format: ${formatType}`);
    }
  }
  
  /**
   * Detect the format type based on file structure
   * @param {Object} json - Parsed JSON data
   * @returns {string} - 'pptx' or 'clipboard'
   */
  detectFormat(json) {
    const files = Object.keys(json);
    
    // Check for PPTX structure
    if (files.some(f => f.startsWith('ppt/slides/'))) {
      return 'pptx';
    }
    
    // Check for clipboard structure  
    if (files.some(f => f.startsWith('clipboard/drawings/'))) {
      return 'clipboard';
    }
    
    throw new Error('Unable to detect PowerPoint format - no recognized file structure found');
  }
  
  /**
   * Normalize PPTX file structure
   * @param {Object} json - PPTX JSON data (already namespace-stripped)
   * @param {string} formatType - Format type for reference
   * @returns {Object} - Normalized structure
   */
  normalizePPTX(json, formatType) {
    const slides = [];
    const files = Object.keys(json);
    
    // Create PPTXParser instance for layout extraction
    const pptxParser = new PPTXParser();
    
    // Get slide-to-layout relationships
    const slideLayoutRelationships = pptxParser.getSlideLayoutRelationships(json);
    
    // Extract slide dimensions from presentation.xml
    const slideDimensions = pptxParser.getSlideDimensions(json);
    
    // Find slide files (no sorting needed - we'll extract slide numbers)
    const slideFiles = files.filter(f => 
      f.startsWith('ppt/slides/slide') && f.endsWith('.xml')
    );
    
    for (const slideFile of slideFiles) {
      const slideData = json[slideFile];
      if (!slideData || !slideData['sld']) continue;
      
      // Extract slide number from filename (e.g., 'ppt/slides/slide5.xml' -> 5)
      const slideNumberMatch = slideFile.match(/slide(\d+)\.xml/);
      const slideNumber = slideNumberMatch ? parseInt(slideNumberMatch[1], 10) : 1;
      
      // Extract slide content
      const slide = slideData['sld'];
      const cSld = this.ensureObject(slide['cSld']) || slide;
      const spTree = this.ensureObject(cSld['spTree']);
      
      if (!spTree) continue;
      
      // Extract slide elements
      const slideElements = this.extractOrderedElements(spTree);
      
      // Get layout elements for this slide
      const layoutFile = slideLayoutRelationships[slideFile];
      let layoutElements = [];
      let masterElements = [];
      let masterFile = null;
      
      if (layoutFile) {
        // Get layout elements
        layoutElements = pptxParser.getSlideLayoutElements(json, layoutFile);
        
        // Convert layout elements to the same structure as slide elements
        layoutElements = layoutElements.map(layoutEl => {
          const convertedElement = this.convertLayoutElementToSlideFormat(layoutEl, spTree);
          return convertedElement;
        }).filter(el => el !== null);
        
        // Get master elements for this layout
        const layoutMasterRelationships = pptxParser.getLayoutMasterRelationships(json);
        masterFile = layoutMasterRelationships[layoutFile];
        
        if (masterFile) {
          masterElements = pptxParser.getSlideMasterElements(json, masterFile);
          
          // Convert master elements to the same structure as slide elements
          masterElements = masterElements.map(masterEl => {
            const convertedElement = this.convertMasterElementToSlideFormat(masterEl, spTree);
            return convertedElement;
          }).filter(el => el !== null);
        }
      }
      
      // Merge elements in proper z-order hierarchy:
      // 1. Master elements (deepest background, z-index -2000 to -1999)
      // 2. Layout elements (middle background, z-index -1000 to -999) 
      // 3. Slide elements (foreground, z-index 0+)
      const allElements = [...masterElements, ...layoutElements, ...slideElements];
      
      const normalizedSlide = {
        slideFile,
        slideNumber, // Add extracted slide number
        format: 'pptx',
        shapes: this.extractPPTXShapes(spTree),
        images: this.extractPPTXImages(spTree),
        text: this.extractPPTXText(spTree),
        elements: allElements, // Combined master, layout and slide elements
        layoutFile, // Keep track of which layout this slide uses
        masterFile: masterFile || null, // Keep track of which master this slide uses
        layoutElementCount: layoutElements.length,
        masterElementCount: masterElements.length,
        rawSpTree: spTree // Keep for relationship lookups
      };
      
      slides.push(normalizedSlide);
    }
    
    return {
      format: 'pptx',
      slides,
      slideDimensions,
      mediaFiles: this.extractMediaFiles(json),
      relationships: this.extractRelationships(json),
      slideLayoutRelationships // Include relationships for reference
    };
  }
  
  /**
   * Normalize clipboard structure
   * @param {Object} json - Clipboard JSON data (already namespace-stripped)
   * @param {string} formatType - Format type for reference
   * @returns {Object} - Normalized structure
   */
  normalizeClipboard(json, formatType) {
    const slides = [];
    const files = Object.keys(json);
    
    // Find drawing files
    const drawingFiles = files.filter(f => 
      f.includes('clipboard') && f.includes('drawing') && f.endsWith('.xml')
    );
    
    for (const drawingFile of drawingFiles) {
      const drawingData = json[drawingFile];
      if (!drawingData || !drawingData['graphic']) continue;
      
      // Navigate clipboard structure
      const graphic = drawingData['graphic'];
      const graphicData = graphic['graphicData'];
      if (!graphicData) continue;
      
      const lockedCanvas = graphicData['lockedCanvas'];
      if (!lockedCanvas) continue;
      
      const normalizedSlide = {
        slideFile: drawingFile,
        format: 'clipboard',
        shapes: this.extractClipboardShapes(lockedCanvas),
        images: this.extractClipboardImages(lockedCanvas), 
        text: this.extractClipboardText(lockedCanvas),
        elements: this.extractOrderedClipboardElements(lockedCanvas), // Add ordered elements
        rawCanvas: lockedCanvas // Keep for relationship lookups
      };
      
      slides.push(normalizedSlide);
    }
    
    // Calculate content-based dimensions for clipboard format
    const contentBounds = this.calculateContentBounds(slides);
    
    return {
      format: 'clipboard',
      slides,
      slideDimensions: contentBounds,
      mediaFiles: this.extractMediaFiles(json),
      relationships: this.extractRelationships(json)
    };
  }
  
  /**
   * Extract shapes from PPTX spTree
   * @param {Object} spTree - PPTX shape tree
   * @returns {Array} - Normalized shape objects
   */
  extractPPTXShapes(spTree) {
    const shapes = [];
    const spArray = this.ensureArray(spTree['sp']);
    
    for (const sp of spArray) {
      // Skip text boxes (they're handled in extractText)
      if (sp['nvSpPr'] && sp['nvSpPr']['cNvSpPr'] && sp['nvSpPr']['cNvSpPr']['$txBox']) continue;
      
      // Skip shapes with actual text content (they're handled in extractPPTXText)
      if (sp['txBody'] && this.hasTextContent(sp['txBody'])) continue;
      
      shapes.push({
        type: 'shape',
        namespace: 'p',
        element: 'sp',
        data: sp,
        spPr: sp['spPr'],
        nvSpPr: sp['nvSpPr'],
        style: sp['style'], // Add style data for fill/border parsing
        textBody: sp['txBody'] // Direct access for empty text containers
      });
    }
    
    return shapes;
  }
  
  /**
   * Extract shapes from clipboard lockedCanvas
   * @param {Object} lockedCanvas - Clipboard locked canvas
   * @returns {Array} - Normalized shape objects  
   */
  extractClipboardShapes(lockedCanvas) {
    const shapes = [];
    const spData = lockedCanvas['sp'];
    
    if (spData) {
      // Clipboard usually has single shape object, not array
      const spArray = this.ensureArray(spData);
      
      for (const sp of spArray) {
        // Skip text boxes (they're handled in extractText)
        if (sp['nvSpPr'] && sp['nvSpPr']['cNvSpPr'] && sp['nvSpPr']['cNvSpPr']['$txBox']) continue;
        
        // Skip shapes with actual text content (they're handled in extractClipboardText)
        if (sp['txSp'] && sp['txSp']['txBody'] && this.hasTextContent(sp['txSp']['txBody'])) continue;
        
        shapes.push({
          type: 'shape',
          namespace: 'a',
          element: 'sp', 
          data: sp,
          spPr: sp['spPr'],
          nvSpPr: sp['nvSpPr'],
          style: sp['style'], // Add style data for fill/border parsing
          textBody: sp['txSp'] ? sp['txSp']['txBody'] : null // Extra layer!
        });
      }
    }
    
    return shapes;
  }
  
  /**
   * Extract images from PPTX spTree
   * @param {Object} spTree - PPTX shape tree
   * @returns {Array} - Normalized image objects
   */
  extractPPTXImages(spTree) {
    const images = [];
    const picArray = this.ensureArray(spTree['pic']);
    
    for (const pic of picArray) {
      images.push({
        type: 'image',
        namespace: 'p',
        element: 'pic',
        data: pic,
        nvPicPr: pic['nvPicPr'],
        blipFill: pic['blipFill'],
        spPr: pic['spPr']
      });
    }
    
    return images;
  }
  
  /**
   * Extract images from clipboard lockedCanvas
   * @param {Object} lockedCanvas - Clipboard locked canvas
   * @returns {Array} - Normalized image objects
   */
  extractClipboardImages(lockedCanvas) {
    const images = [];
    const picData = lockedCanvas['pic'];
    
    if (picData) {
      const picArray = this.ensureArray(picData);
      
      for (const pic of picArray) {
        images.push({
          type: 'image',
          namespace: 'a',
          element: 'pic',
          data: pic,
          nvPicPr: pic['nvPicPr'], 
          blipFill: pic['blipFill'],
          spPr: pic['spPr']
        });
      }
    }
    
    return images;
  }
  
  /**
   * Extract text from PPTX spTree
   * @param {Object} spTree - PPTX shape tree
   * @returns {Array} - Normalized text objects
   */
  extractPPTXText(spTree) {
    const textComponents = [];
    const spArray = this.ensureArray(spTree['sp']);
    
    for (const sp of spArray) {
      // Only process shapes with actual text content
      if (sp['txBody'] && this.hasTextContent(sp['txBody'])) {
        textComponents.push({
          type: 'text',
          namespace: 'p',
          element: 'sp',
          data: sp,
          spPr: sp['spPr'],
          nvSpPr: sp['nvSpPr'],
          style: sp['style'], // Add style data for consistency
          textBody: sp['txBody'] // Direct access
        });
      }
    }
    
    return textComponents;
  }
  
  /**
   * Extract text from clipboard lockedCanvas
   * @param {Object} lockedCanvas - Clipboard locked canvas
   * @returns {Array} - Normalized text objects
   */
  extractClipboardText(lockedCanvas) {
    const textComponents = [];
    const spData = lockedCanvas['sp'];
    
    if (spData) {
      const spArray = this.ensureArray(spData);
      
      for (const sp of spArray) {
        // Check for text content in the extra txSp layer
        if (sp['txSp'] && sp['txSp']['txBody']) {
          // Only treat as text component if there's actual text content
          if (this.hasTextContent(sp['txSp']['txBody'])) {
            textComponents.push({
              type: 'text',
              namespace: 'a',
              element: 'sp',
              data: sp,
              spPr: sp['spPr'],
              nvSpPr: sp['nvSpPr'],
              style: sp['style'], // Add style data for consistency
              textBody: sp['txSp']['txBody'] // Navigate extra layer
            });
          }
        }
      }
    }
    
    return textComponents;
  }
  
  /**
   * Extract media files from JSON
   * @param {Object} json - PowerPoint JSON
   * @returns {Object} - Media files by path
   */
  extractMediaFiles(json) {
    const mediaFiles = {};
    const files = Object.keys(json);
    
    for (const file of files) {
      if (file.includes('/media/') && !file.endsWith('.xml')) {
        mediaFiles[file] = json[file];
      }
    }
    
    return mediaFiles;
  }
  
  /**
   * Extract relationship files from JSON
   * @param {Object} json - PowerPoint JSON
   * @returns {Object} - Relationships by file
   */
  extractRelationships(json) {
    const relationships = {};
    const files = Object.keys(json);
    
    for (const file of files) {
      if (file.includes('_rels/') && file.endsWith('.rels')) {
        relationships[file] = json[file];
      }
    }
    
    return relationships;
  }
  
  /**
   * Ensure value is an object (handle both array and object cases)
   * @param {*} value - Value to check
   * @returns {Object|null} - Object or null
   */
  ensureObject(value) {
    if (Array.isArray(value)) {
      return value[0] || null;
    }
    return value || null;
  }
  
  /**
   * Ensure value is an array
   * @param {*} value - Value to check  
   * @returns {Array} - Array (empty if value is null/undefined)
   */
  ensureArray(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  /**
   * Check if a textBody contains actual text content
   * @param {Object} textBody - Text body to check
   * @returns {boolean} - True if has text content, false otherwise
   */
  hasTextContent(textBody) {
    if (!textBody) return false;
    
    // Get paragraphs
    const paragraphs = textBody['p'];
    if (!paragraphs) return false;
    
    const paragraphArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    
    // Check each paragraph for actual text runs
    for (const p of paragraphArray) {
      const runs = p['r'];
      if (runs) {
        const runArray = Array.isArray(runs) ? runs : [runs];
        for (const run of runArray) {
          const text = run['t'];
          if (text && typeof text === 'string' && text.trim().length > 0) {
            return true;
          }
        }
      }
    }
    
    return false;
  }

  /**
   * Extract elements in their original z-order from spTree
   * This preserves the layering order that elements appear in PowerPoint
   * @param {Object} spTree - PPTX shape tree
   * @returns {Array} - Ordered elements with z-index information
   */
  extractOrderedElements(spTree) {
    const elements = [];
    let zIndex = 0;

    // Process all child elements in their original order
    // This preserves the back-to-front ordering from PowerPoint XML
    for (const [key, value] of Object.entries(spTree)) {
      if (key === 'sp') {
        // Handle shapes and text boxes
        const spArray = this.ensureArray(value);
        for (const sp of spArray) {
          if (sp['txBody'] && this.hasTextContent(sp['txBody'])) {
            // Text element
            elements.push({
              type: 'text',
              zIndex: zIndex++,
              namespace: 'p',
              element: 'sp',
              data: sp,
              spPr: sp['spPr'],
              nvSpPr: sp['nvSpPr'],
              style: sp['style'],
              textBody: sp['txBody']
            });
          } else {
            // Shape element (non-text)
            // Skip text boxes (they're handled above)
            if (sp['nvSpPr'] && sp['nvSpPr']['cNvSpPr'] && sp['nvSpPr']['cNvSpPr']['$txBox']) continue;
            
            elements.push({
              type: 'shape',
              zIndex: zIndex++,
              namespace: 'p', 
              element: 'sp',
              data: sp,
              spPr: sp['spPr'],
              nvSpPr: sp['nvSpPr'],
              style: sp['style'],
              textBody: sp['txSp'] ? sp['txSp']['txBody'] : null
            });
          }
        }
      } else if (key === 'pic') {
        // Handle images
        const picArray = this.ensureArray(value);
        for (const pic of picArray) {
          elements.push({
            type: 'image',
            zIndex: zIndex++,
            namespace: 'p',
            element: 'pic',
            data: pic,
            nvPicPr: pic['nvPicPr'],
            blipFill: pic['blipFill'],
            spPr: pic['spPr']
          });
        }
      } else if (key === 'graphicFrame') {
        // Handle tables (graphicFrame containing table data)
        const graphicFrameArray = this.ensureArray(value);
        for (const graphicFrame of graphicFrameArray) {
          // Check if this is a table by looking at the graphicData URI
          const graphic = graphicFrame['graphic'];
          const graphicData = graphic?.['graphicData'];
          const uri = graphicData?.['$uri'];
          
          if (uri === 'http://schemas.openxmlformats.org/drawingml/2006/table') {
            elements.push({
              type: 'table',
              zIndex: zIndex++,
              namespace: 'p',
              element: 'graphicFrame',
              data: graphicFrame,
              nvGraphicFramePr: graphicFrame['nvGraphicFramePr'],
              spPr: graphicFrame['xfrm'], // Use xfrm for positioning
              graphicData: graphicData
            });
          }
        }
      }
    }

    return elements;
  }

  /**
   * Extract elements in their original z-order from clipboard lockedCanvas
   * This preserves the layering order that elements appear in PowerPoint clipboard
   * @param {Object} lockedCanvas - Clipboard locked canvas
   * @returns {Array} - Ordered elements with z-index information
   */
  extractOrderedClipboardElements(lockedCanvas) {
    const elements = [];
    let zIndex = 0;

    // Process all child elements in their original order
    // This preserves the back-to-front ordering from PowerPoint clipboard XML
    for (const [key, value] of Object.entries(lockedCanvas)) {
      if (key === 'sp') {
        // Handle shapes and text boxes
        const spArray = this.ensureArray(value);
        for (const sp of spArray) {
          if (sp['txSp'] && sp['txSp']['txBody'] && this.hasTextContent(sp['txSp']['txBody'])) {
            // Text element with clipboard structure
            elements.push({
              type: 'text',
              zIndex: zIndex++,
              namespace: 'a',
              element: 'sp',
              data: sp,
              spPr: sp['spPr'],
              nvSpPr: sp['nvSpPr'],
              style: sp['style'],
              textBody: sp['txSp']['txBody'] // Navigate extra layer
            });
          } else {
            // Shape element (non-text)
            elements.push({
              type: 'shape',
              zIndex: zIndex++,
              namespace: 'a', 
              element: 'sp',
              data: sp,
              spPr: sp['spPr'],
              nvSpPr: sp['nvSpPr'],
              style: sp['style'],
              textBody: sp['txSp'] ? sp['txSp']['txBody'] : null
            });
          }
        }
      } else if (key === 'pic') {
        // Handle images
        const picArray = this.ensureArray(value);
        for (const pic of picArray) {
          elements.push({
            type: 'image',
            zIndex: zIndex++,
            namespace: 'a',
            element: 'pic',
            data: pic,
            nvPicPr: pic['nvPicPr'],
            blipFill: pic['blipFill'],
            spPr: pic['spPr']
          });
        }
      } else if (key === 'graphicFrame') {
        // Handle tables (graphicFrame containing table data) in clipboard
        const graphicFrameArray = this.ensureArray(value);
        for (const graphicFrame of graphicFrameArray) {
          // Check if this is a table by looking at the graphicData URI
          const graphic = graphicFrame['graphic'];
          const graphicData = graphic?.['graphicData'];
          const uri = graphicData?.['$uri'];
          
          if (uri === 'http://schemas.openxmlformats.org/drawingml/2006/table') {
            elements.push({
              type: 'table',
              zIndex: zIndex++,
              namespace: 'a',
              element: 'graphicFrame',
              data: graphicFrame,
              nvGraphicFramePr: graphicFrame['nvGraphicFramePr'],
              spPr: graphicFrame['xfrm'], // Use xfrm for positioning
              graphicData: graphicData
            });
          }
        }
      }
    }

    return elements;
  }

  /**
   * Recursively strip namespace prefixes from all object keys
   * Converts 'p:spPr' -> 'spPr', 'a:xfrm' -> 'xfrm', etc.
   * @param {*} obj - Object to strip namespaces from
   * @returns {*} - Object with namespace prefixes removed
   */
  stripNamespaces(obj) {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Handle binary data (Uint8Array, ArrayBuffer, Buffer) - don't process recursively
    if (obj instanceof Uint8Array || obj instanceof ArrayBuffer || 
        (typeof Buffer !== 'undefined' && Buffer.isBuffer && Buffer.isBuffer(obj))) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.stripNamespaces(item));
    }

    if (typeof obj === 'object') {
      const stripped = {};
      
      for (const [key, value] of Object.entries(obj)) {
        // Strip namespace prefix (everything before and including the colon)
        const strippedKey = key.includes(':') ? key.split(':')[1] : key;
        stripped[strippedKey] = this.stripNamespaces(value);
      }
      
      return stripped;
    }

    // Primitive values (string, number, boolean) pass through unchanged
    return obj;
  }

  /**
   * Convert layout element to slide format for consistent processing
   * @param {Object} layoutElement - Layout element from PPTXParser
   * @param {Object} slideSpTree - Slide spTree for context
   * @returns {Object|null} - Converted element or null if not supported
   */
  convertLayoutElementToSlideFormat(layoutElement, slideSpTree) {
    if (!layoutElement || !layoutElement.type || !layoutElement.data) {
      return null;
    }

    try {
      const { type, data, zIndex, isLayoutElement, isBackgroundElement } = layoutElement;

      if (type === 'shape') {
        // Only convert shapes that have required properties for parsing
        if (!data['spPr']) {
          console.warn('Layout shape missing spPr, skipping');
          return null;
        }
        
        // Convert shape to normalized format
        return {
          type: 'shape',
          zIndex: zIndex,
          namespace: 'p',
          element: 'sp',
          data: data,
          spPr: data['spPr'],
          nvSpPr: data['nvSpPr'],
          style: data['style'],
          isLayoutElement: true,
          isBackgroundElement: isBackgroundElement || false
        };
      } else if (type === 'image') {
        // Only convert images that have required properties
        if (!data['spPr'] && !data['nvPicPr']) {
          console.warn('Layout image missing required properties, skipping');
          return null;
        }
        
        // Convert image to normalized format
        return {
          type: 'image',
          zIndex: zIndex,
          namespace: 'p',
          element: 'pic',
          data: data,
          nvPicPr: data['nvPicPr'],
          blipFill: data['blipFill'],
          spPr: data['spPr'],
          isLayoutElement: true,
          isBackgroundElement: isBackgroundElement || false,
          relationshipId: data.relationshipId
        };
      } else if (type === 'text') {
        // Only convert text that has required properties
        if (!data['spPr']) {
          console.warn('Layout text missing spPr, skipping');
          return null;
        }
        
        // Convert text to normalized format
        return {
          type: 'text',
          zIndex: zIndex,
          namespace: 'p',
          element: 'sp',
          data: data,
          spPr: data['spPr'],
          nvSpPr: data['nvSpPr'],
          txBody: data['txBody'],
          isLayoutElement: true
        };
      }

      return null;
    } catch (error) {
      console.warn('Error converting layout element:', error);
      return null;
    }
  }

  /**
   * Convert master element to slide format for consistent processing
   * @param {Object} masterElement - Master element from PPTXParser
   * @param {Object} slideSpTree - Slide spTree for context
   * @returns {Object|null} - Converted element or null if not supported
   */
  convertMasterElementToSlideFormat(masterElement, slideSpTree) {
    if (!masterElement || !masterElement.type || !masterElement.data) {
      return null;
    }

    try {
      const { type, data, zIndex, isMasterElement, isBackgroundElement } = masterElement;

      if (type === 'shape') {
        // Only convert shapes that have required properties for parsing
        if (!data['spPr']) {
          console.warn('Master shape missing spPr, skipping');
          return null;
        }
        
        // Convert shape to normalized format
        return {
          type: 'shape',
          zIndex: zIndex,
          namespace: 'p',
          element: 'sp',
          data: data,
          spPr: data['spPr'],
          nvSpPr: data['nvSpPr'],
          style: data['style'],
          isMasterElement: true,
          isBackgroundElement: isBackgroundElement || false
        };
      } else if (type === 'image') {
        // Only convert images that have required properties
        if (!data['spPr'] && !data['nvPicPr']) {
          console.warn('Master image missing required properties, skipping');
          return null;
        }
        
        // Convert image to normalized format
        return {
          type: 'image',
          zIndex: zIndex,
          namespace: 'p',
          element: 'pic',
          data: data,
          nvPicPr: data['nvPicPr'],
          blipFill: data['blipFill'],
          spPr: data['spPr'],
          isMasterElement: true,
          isBackgroundElement: isBackgroundElement || false,
          relationshipId: data.relationshipId
        };
      } else if (type === 'text') {
        // Only convert text that has required properties
        if (!data['spPr']) {
          console.warn('Master text missing spPr, skipping');
          return null;
        }
        
        // Convert text to normalized format
        return {
          type: 'text',
          zIndex: zIndex,
          namespace: 'p',
          element: 'sp',
          data: data,
          spPr: data['spPr'],
          nvSpPr: data['nvSpPr'],
          txBody: data['txBody'],
          isMasterElement: true
        };
      }

      return null;
    } catch (error) {
      console.warn('Error converting master element:', error);
      return null;
    }
  }

  /**
   * Calculate content bounds to determine appropriate slide dimensions
   * @param {Array} slides - Array of normalized slide objects
   * @returns {Object} - Dimensions object with width and height
   */
  calculateContentBounds(slides) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    let hasContent = false;

    // BaseParser is already imported at the top

    for (const slide of slides) {
      // Check all element types
      const allElements = [...slide.shapes, ...slide.text, ...slide.images];
      
      for (const element of allElements) {
        if (!element.data || !element.spPr) continue;
        
        try {
          // Parse transform to get position and size
          const xfrm = element.spPr['xfrm'];
          if (!xfrm) continue;
          
          const transform = BaseParser.parseTransform(xfrm);
          if (transform.width === 0 && transform.height === 0) continue;
          
          // Calculate element bounds
          const elementMinX = transform.x;
          const elementMinY = transform.y;
          const elementMaxX = transform.x + transform.width;
          const elementMaxY = transform.y + transform.height;
          
          // Update overall bounds
          minX = Math.min(minX, elementMinX);
          minY = Math.min(minY, elementMinY);
          maxX = Math.max(maxX, elementMaxX);
          maxY = Math.max(maxY, elementMaxY);
          
          hasContent = true;
        } catch (error) {
          console.warn('Error parsing element bounds:', error);
        }
      }
    }
    
    if (!hasContent) {
      // Fallback to default dimensions if no content found
      console.log('📐 No content bounds found, using default dimensions');
      return { width: DEFAULT_SLIDE_WIDTH_PX, height: DEFAULT_SLIDE_HEIGHT_PX };
    }
    
    // Add padding around content (10% on each side)
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    const paddingX = Math.max(50, contentWidth * 0.1); // Minimum 50px padding
    const paddingY = Math.max(50, contentHeight * 0.1); // Minimum 50px padding
    
    const finalWidth = Math.round(contentWidth + (paddingX * 2));
    const finalHeight = Math.round(contentHeight + (paddingY * 2));
    
    // Ensure minimum dimensions
    const minWidth = 400;
    const minHeight = 300;
    
    const result = {
      width: Math.max(finalWidth, minWidth),
      height: Math.max(finalHeight, minHeight)
    };
    
    console.log('📐 Calculated content-based slide dimensions:', result, 
                `(content bounds: ${contentWidth}x${contentHeight}, padding: ${paddingX}x${paddingY})`);
    
    return result;
  }
}