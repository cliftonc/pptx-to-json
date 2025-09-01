/**
 * PowerPoint PPTX Parser using JSZip and fast-xml-parser
 * 
 * This replaces pptx2json with a custom implementation that's compatible with
 * Cloudflare Workers and other non-Node.js environments.
 * 
 * Based on pptx2json but modified to use fast-xml-parser and remove Node.js dependencies.
 */

import JSZip from 'jszip';
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
}

// Export a default instance for convenience
export const pptxParser = new PPTXParser();

// For CommonJS compatibility
export default PPTXParser;