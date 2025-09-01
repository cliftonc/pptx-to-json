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
    
    switch (formatType) {
      case 'pptx':
        return this.normalizePPTX(json);
      case 'clipboard':
        return this.normalizeClipboard(json);
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
   * @param {Object} json - PPTX JSON data
   * @returns {Object} - Normalized structure
   */
  normalizePPTX(json) {
    const slides = [];
    const files = Object.keys(json);
    
    // Find slide files
    const slideFiles = files.filter(f => 
      f.startsWith('ppt/slides/slide') && f.endsWith('.xml')
    ).sort();
    
    for (const slideFile of slideFiles) {
      const slideData = json[slideFile];
      if (!slideData || !slideData['p:sld']) continue;
      
      // Extract slide content
      const slide = slideData['p:sld'];
      const cSld = this.ensureObject(slide['p:cSld']) || slide;
      const spTree = this.ensureObject(cSld['p:spTree']);
      
      if (!spTree) continue;
      
      const normalizedSlide = {
        slideFile,
        format: 'pptx',
        shapes: this.extractPPTXShapes(spTree),
        images: this.extractPPTXImages(spTree),
        text: this.extractPPTXText(spTree),
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
   * @param {Object} json - Clipboard JSON data 
   * @returns {Object} - Normalized structure
   */
  normalizeClipboard(json) {
    const slides = [];
    const files = Object.keys(json);
    
    // Find drawing files
    const drawingFiles = files.filter(f => 
      f.includes('clipboard') && f.includes('drawing') && f.endsWith('.xml')
    );
    
    for (const drawingFile of drawingFiles) {
      const drawingData = json[drawingFile];
      if (!drawingData || !drawingData['a:graphic']) continue;
      
      // Navigate clipboard structure
      const graphic = drawingData['a:graphic'];
      const graphicData = graphic['a:graphicData'];
      if (!graphicData) continue;
      
      const lockedCanvas = graphicData['lc:lockedCanvas'];
      if (!lockedCanvas) continue;
      
      const normalizedSlide = {
        slideFile: drawingFile,
        format: 'clipboard',
        shapes: this.extractClipboardShapes(lockedCanvas),
        images: this.extractClipboardImages(lockedCanvas), 
        text: this.extractClipboardText(lockedCanvas),
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
    const spArray = this.ensureArray(spTree['p:sp']);
    
    for (const sp of spArray) {
      // Skip text boxes (they're handled in extractText)
      if (sp['p:nvSpPr'] && sp['p:nvSpPr']['p:cNvSpPr'] && sp['p:nvSpPr']['p:cNvSpPr']['$txBox']) continue;
      
      shapes.push({
        type: 'shape',
        namespace: 'p',
        element: 'sp',
        data: sp,
        spPr: sp['p:spPr'],
        nvSpPr: sp['p:nvSpPr'],
        style: sp['p:style'], // Add style data for fill/border parsing
        textBody: sp['p:txBody'] // Direct access
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
    const spData = lockedCanvas['a:sp'];
    
    if (spData) {
      // Clipboard usually has single shape object, not array
      const spArray = this.ensureArray(spData);
      
      for (const sp of spArray) {
        // Skip text boxes (they're handled in extractText)
        if (sp['a:nvSpPr'] && sp['a:nvSpPr']['a:cNvSpPr'] && sp['a:nvSpPr']['a:cNvSpPr']['$txBox']) continue;
        
        shapes.push({
          type: 'shape',
          namespace: 'a',
          element: 'sp', 
          data: sp,
          spPr: sp['a:spPr'],
          nvSpPr: sp['a:nvSpPr'],
          style: sp['a:style'], // Add style data for fill/border parsing
          textBody: sp['a:txSp'] ? sp['a:txSp']['a:txBody'] : null // Extra layer!
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
    const picArray = this.ensureArray(spTree['p:pic']);
    
    for (const pic of picArray) {
      images.push({
        type: 'image',
        namespace: 'p',
        element: 'pic',
        data: pic,
        nvPicPr: pic['p:nvPicPr'],
        blipFill: pic['p:blipFill'],
        spPr: pic['p:spPr']
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
    const picData = lockedCanvas['a:pic'];
    
    if (picData) {
      const picArray = this.ensureArray(picData);
      
      for (const pic of picArray) {
        images.push({
          type: 'image',
          namespace: 'a',
          element: 'pic',
          data: pic,
          nvPicPr: pic['a:nvPicPr'], 
          blipFill: pic['a:blipFill'],
          spPr: pic['a:spPr']
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
    const spArray = this.ensureArray(spTree['p:sp']);
    
    for (const sp of spArray) {
      // Only process text boxes and shapes with text
      if (sp['p:txBody']) {
        textComponents.push({
          type: 'text',
          namespace: 'p',
          element: 'sp',
          data: sp,
          spPr: sp['p:spPr'],
          nvSpPr: sp['p:nvSpPr'],
          style: sp['p:style'], // Add style data for consistency
          textBody: sp['p:txBody'] // Direct access
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
    const spData = lockedCanvas['a:sp'];
    
    if (spData) {
      const spArray = this.ensureArray(spData);
      
      for (const sp of spArray) {
        // Check for text content in the extra txSp layer
        if (sp['a:txSp'] && sp['a:txSp']['a:txBody']) {
          textComponents.push({
            type: 'text',
            namespace: 'a',
            element: 'sp',
            data: sp,
            spPr: sp['a:spPr'],
            nvSpPr: sp['a:nvSpPr'],
            style: sp['a:style'], // Add style data for consistency
            textBody: sp['a:txSp']['a:txBody'] // Navigate extra layer
          });
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
}