/**
 * PowerPoint Structure Normalizer
 * 
 * Converts both PPTX files and clipboard data to a unified internal structure,
 * eliminating the need for if-statements throughout the parsing logic.
 */

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
      
      const normalizedSlide = {
        slideFile,
        slideNumber, // Add extracted slide number
        format: 'pptx',
        shapes: this.extractPPTXShapes(spTree),
        images: this.extractPPTXImages(spTree),
        text: this.extractPPTXText(spTree),
        elements: this.extractOrderedElements(spTree), // Add ordered elements
        rawSpTree: spTree // Keep for relationship lookups
      };
      
      slides.push(normalizedSlide);
    }
    
    return {
      format: 'pptx',
      slides,
      mediaFiles: this.extractMediaFiles(json),
      relationships: this.extractRelationships(json)
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
    
    return {
      format: 'clipboard',
      slides,
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
}