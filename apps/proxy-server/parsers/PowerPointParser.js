/**
 * Main PowerPoint parser that coordinates all specialized parsers
 */

import PPTX2Json from 'pptx2json';
import { TextParser } from './TextParser.js';
import { ShapeParser } from './ShapeParser.js';
import { ImageParser } from './ImageParser.js';
import { TableParser } from './TableParser.js';
import { BaseParser } from './BaseParser.js';

export class PowerPointParser extends BaseParser {
  constructor() {
    super();
    this.pptx2json = new PPTX2Json();
  }

  /**
   * Parse PowerPoint buffer into structured components
   * @param {Buffer} buffer - PowerPoint file buffer
   * @returns {Promise<Array>} array of parsed components
   */
  async parseBuffer(buffer) {
    try {
      console.log('🎨 Parsing PowerPoint buffer with pptx2json...');
      
      // Parse PowerPoint to JSON using pptx2json
      const json = await this.pptx2json.buffer2json(buffer);
      console.log('📦 PowerPoint parsed to JSON, files:', Object.keys(json).length);
      console.log('📦 Files found:', Object.keys(json));

      // Extract components from all slides
      const components = await this.extractComponents(json);
      console.log('🎨 Extracted', components.length, 'components');

      return components;

    } catch (error) {
      console.error('❌ Error parsing PowerPoint:', error);
      throw error;
    }
  }

  /**
   * Extract components from PowerPoint JSON data
   * @param {Object} json - Parsed PowerPoint JSON
   * @returns {Promise<Array>} array of components
   */
  async extractComponents(json) {
    const components = [];

    // Find slide files - check both normal slides and clipboard structure
    let slideFiles = Object.keys(json).filter(key => 
      key.startsWith('ppt/slides/slide') && key.endsWith('.xml')
    );

    // If no normal slides, check for clipboard structure
    if (slideFiles.length === 0) {
      slideFiles = Object.keys(json).filter(key => 
        key.includes('clipboard') && (key.includes('slide') || key.includes('drawing')) && key.endsWith('.xml')
      );
      console.log('📄 No normal slides found, checking clipboard files:', slideFiles);
    } else {
      console.log('📄 Found normal slides:', slideFiles);
    }

    // Parse each slide/drawing file
    for (let i = 0; i < slideFiles.length; i++) {
      const slideFile = slideFiles[i];
      const slideData = json[slideFile];
      
      console.log(`🔍 Parsing file ${i + 1}: ${slideFile}`);
      console.log(`📄 File structure:`, Object.keys(slideData || {}));
      
      // Handle normal slide structure
      if (slideData && slideData['p:sld']) {
        console.log('📄 Processing normal PowerPoint slide');
        // Find corresponding relationship file for images
        const relFile = slideFile.replace('.xml', '.xml.rels').replace('ppt/slides/', 'ppt/slides/_rels/');
        const relationships = json[relFile];
        const mediaFiles = this.extractMediaFiles(json);

        const slideComponents = await this.parseSlide(
          slideData['p:sld'][0], 
          relationships, 
          mediaFiles, 
          i
        );
        
        components.push(...slideComponents);
      }
      // Handle any clipboard structure with flexible parsing
      else if (slideData) {
        console.log('📄 Processing clipboard structure with flexible parser');
        const clipboardComponents = await this.parseFlexibleClipboard(slideData, json, slideFile, i);
        components.push(...clipboardComponents);
      }
    }

    return components;
  }

  /**
   * Parse a single slide
   * @param {Object} slide - Slide data
   * @param {Object} relationships - Slide relationships
   * @param {Object} mediaFiles - Media files data
   * @param {number} slideIndex - Slide index
   * @returns {Promise<Array>} slide components
   */
  async parseSlide(slide, relationships, mediaFiles, slideIndex) {
    const components = [];
    let componentIndex = 0;

    // Parse slide content - check common slide layout areas
    const cSld = slide['p:cSld'] ? slide['p:cSld'][0] : slide;
    const spTree = cSld['p:spTree'] ? cSld['p:spTree'][0] : null;

    if (!spTree) {
      console.warn(`⚠️ No shape tree found in slide ${slideIndex + 1}`);
      return components;
    }

    // Parse shapes (sp)
    if (spTree['p:sp']) {
      for (const shape of spTree['p:sp']) {
        const component = await this.parseShape(shape, relationships, mediaFiles, componentIndex++);
        if (component) {
          component.slideIndex = slideIndex;
          components.push(component);
        }
      }
    }

    // Parse pictures (pic) - standalone images
    if (spTree['p:pic']) {
      for (const pic of spTree['p:pic']) {
        const component = await this.parsePicture(pic, relationships, mediaFiles, componentIndex++);
        if (component) {
          component.slideIndex = slideIndex;
          components.push(component);
        }
      }
    }

    // Parse graphic frames (graphicFrame) - tables, charts, etc.
    if (spTree['p:graphicFrame']) {
      for (const frame of spTree['p:graphicFrame']) {
        const component = await this.parseGraphicFrame(frame, relationships, mediaFiles, componentIndex++);
        if (component) {
          component.slideIndex = slideIndex;
          components.push(component);
        }
      }
    }

    // Parse group shapes (grpSp)
    if (spTree['p:grpSp']) {
      for (const group of spTree['p:grpSp']) {
        const groupComponents = await this.parseGroup(group, relationships, mediaFiles, componentIndex, slideIndex);
        components.push(...groupComponents);
        componentIndex += groupComponents.length;
      }
    }

    console.log(`✅ Slide ${slideIndex + 1}: found ${components.length} components`);
    return components;
  }

  /**
   * Parse a shape element
   * @param {Object} shape - Shape data
   * @param {Object} relationships - Relationships
   * @param {Object} mediaFiles - Media files
   * @param {number} index - Component index
   * @returns {Promise<Object|null>} parsed component
   */
  async parseShape(shape, relationships, mediaFiles, index) {
    try {
      // Check if shape has text content - prioritize as text
      if (TextParser.hasTextContent(shape)) {
        return TextParser.parse(shape, index);
      }
      
      // Check if shape is actually a shape (geometric shape without text)
      if (ShapeParser.isShape(shape)) {
        return ShapeParser.parse(shape, index);
      }

      return null;

    } catch (error) {
      console.warn(`Error parsing shape ${index}:`, error);
      return null;
    }
  }

  /**
   * Parse a picture element
   * @param {Object} pic - Picture data  
   * @param {Object} relationships - Relationships
   * @param {Object} mediaFiles - Media files
   * @param {number} index - Component index
   * @returns {Promise<Object|null>} parsed component
   */
  async parsePicture(pic, relationships, mediaFiles, index) {
    try {
      // Wrap picture in shape-like structure for ImageParser
      const shapeWrapper = { 'p:pic': [pic] };
      return ImageParser.parse(shapeWrapper, relationships, mediaFiles, index);

    } catch (error) {
      console.warn(`Error parsing picture ${index}:`, error);
      return null;
    }
  }

  /**
   * Parse a graphic frame (table, chart, etc.)
   * @param {Object} frame - Graphic frame data
   * @param {Object} relationships - Relationships  
   * @param {Object} mediaFiles - Media files
   * @param {number} index - Component index
   * @returns {Promise<Object|null>} parsed component
   */
  async parseGraphicFrame(frame, relationships, mediaFiles, index) {
    try {
      // Check if it's a table
      if (TableParser.isTable(frame)) {
        return TableParser.parse(frame, index);
      }

      // For now, treat unknown graphic frames as shapes
      const transform = this.safeGet(frame, 'p:xfrm.0');
      if (transform) {
        const transformData = this.parseTransform(transform);
        return {
          id: this.generateId('graphic', index),
          type: 'unknown',
          x: transformData.x,
          y: transformData.y,
          width: transformData.width,
          height: transformData.height,
          rotation: transformData.rotation,
          content: 'Graphic element',
          style: {
            opacity: 1
          },
          metadata: {
            graphicType: 'unknown',
            uri: this.safeGet(frame, 'a:graphic.0.a:graphicData.0.$.uri')
          }
        };
      }

      return null;

    } catch (error) {
      console.warn(`Error parsing graphic frame ${index}:`, error);
      return null;
    }
  }

  /**
   * Parse a group shape
   * @param {Object} group - Group shape data
   * @param {Object} relationships - Relationships
   * @param {Object} mediaFiles - Media files  
   * @param {number} startIndex - Starting component index
   * @param {number} slideIndex - Slide index
   * @returns {Promise<Array>} group components
   */
  async parseGroup(group, relationships, mediaFiles, startIndex, slideIndex) {
    const components = [];
    let componentIndex = startIndex;

    // Parse shapes within the group
    if (group['p:sp']) {
      for (const shape of group['p:sp']) {
        const component = await this.parseShape(shape, relationships, mediaFiles, componentIndex++);
        if (component) {
          component.slideIndex = slideIndex;
          component.isGrouped = true;
          components.push(component);
        }
      }
    }

    // Parse pictures within the group
    if (group['p:pic']) {
      for (const pic of group['p:pic']) {
        const component = await this.parsePicture(pic, relationships, mediaFiles, componentIndex++);
        if (component) {
          component.slideIndex = slideIndex;
          component.isGrouped = true;
          components.push(component);
        }
      }
    }

    // Parse nested groups
    if (group['p:grpSp']) {
      for (const nestedGroup of group['p:grpSp']) {
        const nestedComponents = await this.parseGroup(nestedGroup, relationships, mediaFiles, componentIndex, slideIndex);
        components.push(...nestedComponents);
        componentIndex += nestedComponents.length;
      }
    }

    return components;
  }

  /**
   * Extract media files from PowerPoint JSON
   * @param {Object} json - PowerPoint JSON data
   * @returns {Object} media files
   */
  extractMediaFiles(json) {
    const mediaFiles = {};

    // Look for media files
    Object.keys(json).forEach(key => {
      if (key.startsWith('ppt/media/')) {
        mediaFiles[key] = json[key];
      }
    });

    console.log('🖼️ Found media files:', Object.keys(mediaFiles));
    return mediaFiles;
  }

  /**
   * Debug: Save JSON to file for inspection
   * @param {Object} json - PowerPoint JSON
   * @param {string} filename - Output filename
   */
  async saveDebugJSON(json, filename = 'powerpoint-debug.json') {
    try {
      const fs = await import('fs');
      const debugData = {
        files: Object.keys(json),
        structure: this.analyzeStructure(json),
        sampleSlide: this.getSampleSlide(json)
      };
      
      await fs.promises.writeFile(filename, JSON.stringify(debugData, null, 2));
      console.log(`🐛 Debug JSON saved to ${filename}`);
    } catch (error) {
      console.warn('Failed to save debug JSON:', error);
    }
  }

  /**
   * Analyze PowerPoint structure for debugging
   * @param {Object} json - PowerPoint JSON
   * @returns {Object} structure analysis
   */
  analyzeStructure(json) {
    const structure = {
      totalFiles: Object.keys(json).length,
      slideFiles: [],
      mediaFiles: [],
      relationshipFiles: [],
      otherFiles: []
    };

    Object.keys(json).forEach(key => {
      if (key.startsWith('ppt/slides/slide') && key.endsWith('.xml')) {
        structure.slideFiles.push(key);
      } else if (key.startsWith('ppt/media/')) {
        structure.mediaFiles.push(key);
      } else if (key.includes('_rels')) {
        structure.relationshipFiles.push(key);
      } else {
        structure.otherFiles.push(key);
      }
    });

    return structure;
  }

  /**
   * Get sample slide data for debugging
   * @param {Object} json - PowerPoint JSON
   * @returns {Object} sample slide structure
   */
  getSampleSlide(json) {
    const slideFile = Object.keys(json).find(key => 
      key.startsWith('ppt/slides/slide') && key.endsWith('.xml')
    );

    if (!slideFile) return null;

    const slideData = json[slideFile];
    const slide = slideData?.['p:sld']?.[0];
    const cSld = slide?.['p:cSld']?.[0] || slide;
    const spTree = cSld?.['p:spTree']?.[0];

    return {
      file: slideFile,
      hasShapes: !!(spTree?.['p:sp']?.length),
      shapesCount: spTree?.['p:sp']?.length || 0,
      hasPictures: !!(spTree?.['p:pic']?.length),
      picturesCount: spTree?.['p:pic']?.length || 0,
      hasGraphicFrames: !!(spTree?.['p:graphicFrame']?.length),
      graphicFramesCount: spTree?.['p:graphicFrame']?.length || 0,
      hasGroups: !!(spTree?.['p:grpSp']?.length),
      groupsCount: spTree?.['p:grpSp']?.length || 0
    };
  }

  /**
   * Flexible clipboard parser that tries multiple approaches
   * @param {Object} slideData - Raw slide/clipboard data
   * @param {Object} fullJson - Full JSON structure  
   * @param {string} slideFile - Source file path
   * @param {number} slideIndex - Slide index
   * @returns {Promise<Array>} parsed components
   */
  async parseFlexibleClipboard(slideData, fullJson, slideFile, slideIndex) {
    const components = [];
    console.log('🔍 Attempting flexible clipboard parsing...');

    // Strategy 1: Look for shapes in common locations
    const shapeComponents = await this.findShapesRecursively(slideData, fullJson, slideIndex);
    if (shapeComponents.length > 0) {
      console.log(`✅ Found ${shapeComponents.length} shapes via recursive search`);
      components.push(...shapeComponents);
    }

    // Strategy 2: If no shapes found, try regex fallback on raw XML
    if (components.length === 0) {
      console.log('🔄 No structured components found, trying regex fallback...');
      const regexComponents = await this.parseWithRegexFallback(fullJson, slideFile);
      if (regexComponents.length > 0) {
        console.log(`✅ Found ${regexComponents.length} components via regex fallback`);
        components.push(...regexComponents);
      }
    }

    // Strategy 3: If still nothing, create debug component
    if (components.length === 0) {
      console.log('⚠️ No components found, creating debug info component');
      components.push({
        id: BaseParser.generateId('debug', 0),
        type: 'unknown',
        x: 50,
        y: 50,
        width: 200,
        height: 100,
        rotation: 0,
        content: `Clipboard data detected but not parsed. File: ${slideFile}`,
        style: { opacity: 1 },
        metadata: {
          source: 'debug',
          file: slideFile,
          rootKeys: Object.keys(slideData),
          parsingAttempted: true
        }
      });
    }

    return components;
  }

  /**
   * Recursively search for shape-like elements
   * @param {Object} data - Data to search
   * @param {Object} fullJson - Full JSON structure
   * @param {number} slideIndex - Slide index
   * @returns {Promise<Array>} found components
   */
  async findShapesRecursively(data, fullJson, slideIndex) {
    const components = [];
    let componentIndex = 0;
    const processedPaths = new Set(); // Track processed paths to avoid duplicates

    const searchForShapes = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return;

      // Recursively search object properties
      Object.keys(obj).forEach(key => {
        const fullPath = path ? `${path}.${key}` : key;
        
        // If key suggests shapes, process the array
        if (key === 'a:sp' || key === 'p:sp' || key === 'xdr:sp') {
          // Only process if we haven't seen this path before
          if (!processedPaths.has(fullPath)) {
            processedPaths.add(fullPath);
            console.log(`🔍 Processing shape element: ${fullPath}`);
            
            if (Array.isArray(obj[key])) {
              console.log(`🔍 Found ${obj[key].length} shapes in array: ${fullPath}`);
              obj[key].forEach((item, index) => {
                const component = this.tryParseAsShape(item, componentIndex++, `${fullPath}[${index}]`);
                if (component) {
                  component.slideIndex = slideIndex;
                  components.push(component);
                }
              });
            } else if (obj[key] && typeof obj[key] === 'object') {
              const component = this.tryParseAsShape(obj[key], componentIndex++, fullPath);
              if (component) {
                component.slideIndex = slideIndex;
                components.push(component);
              }
            }
          }
        }
        
        // Continue recursive search only if we haven't processed this path as a shape array
        if (typeof obj[key] === 'object' && !processedPaths.has(fullPath)) {
          searchForShapes(obj[key], fullPath);
        }
      });
    };

    searchForShapes(data);
    return components;
  }

  /**
   * Try to parse an object as a PowerPoint shape
   * @param {Object} shapeData - Potential shape data
   * @param {number} index - Component index
   * @param {string} path - Path for debugging
   * @returns {Object|null} parsed component
   */
  tryParseAsShape(shapeData, index, path) {
    try {
      if (!shapeData || typeof shapeData !== 'object') return null;

      console.log(`🎯 Trying to parse shape at ${path}`);
      console.log(`🔍 Shape keys:`, Object.keys(shapeData));

      // For clipboard format, we need to check if a:txSp contains actual text content
      // Create a shape object that works with TextParser
      let shapeForTextCheck = null;
      
      if (shapeData['a:txSp'] && shapeData['a:txSp'][0] && shapeData['a:txSp'][0]['a:txBody']) {
        // Clipboard format: a:txSp contains a:txBody
        shapeForTextCheck = { 'p:txBody': shapeData['a:txSp'][0]['a:txBody'] };
      } else if (shapeData['a:txBody'] || shapeData['p:txBody']) {
        // Regular format
        shapeForTextCheck = { 'p:txBody': shapeData['a:txBody'] || shapeData['p:txBody'] };
      }
      
      const hasText = shapeForTextCheck ? TextParser.hasTextContent(shapeForTextCheck) : false;
      
      if (hasText) {
        console.log(`📝 Parsing as text component`);
        return TextParser.parse({ 
          'p:txBody': shapeForTextCheck['p:txBody'], 
          'p:spPr': shapeData['a:spPr'] || shapeData['p:spPr'] 
        }, index);
      }

      // For shapes without text, use improved ShapeParser for better styling
      console.log(`🔸 Parsing as shape component with improved styling`);
      return ShapeParser.parse({ 
        'p:spPr': shapeData['a:spPr'] || shapeData['p:spPr'] 
      }, index);

      // Fallback to manual parsing with basic styling
      console.log(`🔧 Using manual parsing fallback`);
      const transform = this.extractBasicTransform(shapeData);
      const text = this.extractBasicText(shapeData);

      return {
        id: BaseParser.generateId('shape', index),
        type: text ? 'text' : 'shape',
        x: transform.x,
        y: transform.y,
        width: transform.width,
        height: transform.height,
        rotation: transform.rotation,
        content: text || 'Clipboard shape',
        style: { 
          opacity: 1,
          backgroundColor: 'transparent',
          borderColor: 'transparent'
        },
        metadata: {
          source: 'flexible-parser-fallback',
          path: path,
          originalKeys: Object.keys(shapeData)
        }
      };

    } catch (error) {
      console.warn(`❌ Failed to parse shape at ${path}:`, error.message);
      return null;
    }
  }

  /**
   * Extract basic transform info from various shape formats
   */
  extractBasicTransform(shapeData) {
    // Look for transform in common locations
    const spPr = shapeData['a:spPr'] || shapeData['p:spPr'] || shapeData['xdr:spPr'];
    if (spPr && spPr[0]) {
      const xfrm = BaseParser.safeGet(spPr[0], 'a:xfrm.0');
      if (xfrm) {
        return BaseParser.parseTransform(xfrm);
      }
    }

    return { x: 0, y: 0, width: 100, height: 50, rotation: 0 };
  }

  /**
   * Extract basic text from various text formats
   */
  extractBasicText(shapeData) {
    // Look for text in common locations
    const textBody = shapeData['a:txBody'] || shapeData['p:txBody'] || 
                    shapeData['a:txSp']?.[0]?.['a:txBody'] || 
                    shapeData['p:txSp']?.[0]?.['p:txBody'];

    if (textBody) {
      return BaseParser.extractTextContent(Array.isArray(textBody) ? textBody[0] : textBody);
    }

    return '';
  }

  /**
   * Extract enhanced styling from shape data
   */
  extractEnhancedStyle(shapeData, isText = false) {
    const style = {
      opacity: 1
    };

    try {
      // Get shape properties
      const spPr = shapeData['a:spPr'] || shapeData['p:spPr'] || shapeData['xdr:spPr'];
      
      if (spPr && spPr[0]) {
        // Parse fill (background color)
        const solidFill = BaseParser.safeGet(spPr[0], 'a:solidFill.0');
        if (solidFill) {
          style.backgroundColor = BaseParser.parseColor(solidFill);
        }

        // Parse border/line
        const ln = BaseParser.safeGet(spPr[0], 'a:ln.0');
        if (ln) {
          const borderColor = BaseParser.safeGet(ln, 'a:solidFill.0');
          if (borderColor) {
            style.borderColor = BaseParser.parseColor(borderColor);
            style.borderWidth = ln.$.w ? BaseParser.emuToPixels(parseInt(ln.$.w)) : 1;
            style.borderStyle = 'solid';
          }
        }
      }

      // For text elements, extract font styling
      if (isText) {
        const textBody = shapeData['a:txBody'] || shapeData['p:txBody'] || 
                        shapeData['a:txSp']?.[0]?.['a:txBody'] || 
                        shapeData['p:txSp']?.[0]?.['p:txBody'];

        if (textBody) {
          const body = Array.isArray(textBody) ? textBody[0] : textBody;
          
          // Get first paragraph and first run for styling
          const firstParagraph = BaseParser.safeGet(body, 'a:p.0');
          if (firstParagraph) {
            // Paragraph alignment
            const pPr = BaseParser.safeGet(firstParagraph, 'a:pPr.0');
            if (pPr?.$.algn) {
              switch (pPr.$.algn) {
                case 'ctr': style.textAlign = 'center'; break;
                case 'r': style.textAlign = 'right'; break;
                case 'just': style.textAlign = 'justify'; break;
                default: style.textAlign = 'left'; break;
              }
            }

            // Text run properties
            const firstRun = BaseParser.safeGet(firstParagraph, 'a:r.0');
            if (firstRun) {
              const rPr = BaseParser.safeGet(firstRun, 'a:rPr.0');
              if (rPr) {
                const font = BaseParser.parseFont(rPr);
                style.fontSize = font.size;
                style.fontFamily = font.family;
                style.fontWeight = font.weight;
                style.fontStyle = font.style;
                style.textDecoration = font.decoration;
                style.color = font.color;
              }
            }
          }
        }
      }

      // Parse effects (shadows, etc.)
      if (spPr && spPr[0] && spPr[0]['a:effectLst']) {
        const effectLst = spPr[0]['a:effectLst'][0];
        
        // Outer shadow
        const outerShdw = BaseParser.safeGet(effectLst, 'a:outerShdw.0');
        if (outerShdw) {
          const blur = outerShdw.$.blurRad ? BaseParser.emuToPixels(parseInt(outerShdw.$.blurRad)) : 3;
          const distance = outerShdw.$.dist ? BaseParser.emuToPixels(parseInt(outerShdw.$.dist)) : 3;
          const direction = outerShdw.$.dir ? parseInt(outerShdw.$.dir) / 60000 : 45;
          
          const offsetX = distance * Math.cos(direction * Math.PI / 180);
          const offsetY = distance * Math.sin(direction * Math.PI / 180);
          
          style.boxShadow = `${offsetX}px ${offsetY}px ${blur}px rgba(0,0,0,0.3)`;
        }
      }

    } catch (error) {
      console.warn('Error extracting enhanced style:', error);
    }

    return style;
  }

  /**
   * Fallback to regex-based parsing (like the old system)
   * @param {Object} fullJson - Full JSON structure
   * @param {string} targetFile - File to parse
   * @returns {Promise<Array>} parsed components
   */
  async parseWithRegexFallback(fullJson, targetFile) {
    console.log('🔄 Using regex fallback parser...');
    
    try {
      // Get the raw XML content by reconstructing it from JSON
      // This is a simplified approach - in reality, we'd need the original XML
      const fileData = fullJson[targetFile];
      if (!fileData) return [];

      // Convert JSON back to XML-like string for regex parsing
      const xmlString = JSON.stringify(fileData, null, 2);
      
      return this.parseWithSimpleRegex(xmlString);

    } catch (error) {
      console.warn('❌ Regex fallback failed:', error);
      return [];
    }
  }

  /**
   * Simple regex-based component extraction
   */
  parseWithSimpleRegex(content) {
    const components = [];
    let componentIndex = 0;

    // Look for text patterns
    const textMatches = content.match(/"([^"]+)"/g) || [];
    const meaningfulText = textMatches
      .map(match => match.replace(/"/g, ''))
      .filter(text => text.length > 2 && !text.match(/^[a-z]+:[a-z]+$/i))
      .slice(0, 5); // Limit to first 5 meaningful texts

    meaningfulText.forEach(text => {
      components.push({
        id: BaseParser.generateId('regex', componentIndex++),
        type: 'text',
        x: 50 + (componentIndex * 20),
        y: 50 + (componentIndex * 30),
        width: Math.max(100, text.length * 8),
        height: 30,
        rotation: 0,
        content: text,
        style: { opacity: 1 },
        metadata: {
          source: 'regex-fallback',
          extractionMethod: 'text-pattern-matching'
        }
      });
    });

    return components;
  }

  /**
   * Parse clipboard drawing structure
   * @param {Object} drawing - Drawing data from clipboard
   * @param {Object} fullJson - Full JSON structure
   * @param {number} drawingIndex - Drawing index
   * @returns {Promise<Array>} drawing components
   */
  async parseClipboardDrawing(drawing, fullJson, drawingIndex) {
    const components = [];
    let componentIndex = 0;

    console.log('🎨 Parsing clipboard drawing structure');

    // Look for various drawing elements
    const drawingElements = ['xdr:twoCellAnchor', 'xdr:oneCellAnchor', 'xdr:absoluteAnchor'];
    
    for (const elementType of drawingElements) {
      if (drawing[elementType]) {
        for (const element of drawing[elementType]) {
          const component = await this.parseDrawingElement(element, fullJson, componentIndex++);
          if (component) {
            component.drawingIndex = drawingIndex;
            components.push(component);
          }
        }
      }
    }

    return components;
  }

  /**
   * Parse generic clipboard structure
   * @param {Object} data - Generic data structure
   * @param {Object} fullJson - Full JSON structure
   * @param {number} dataIndex - Data index
   * @returns {Promise<Array>} generic components
   */
  async parseGenericStructure(data, fullJson, dataIndex) {
    const components = [];
    let componentIndex = 0;

    console.log('🎨 Attempting generic structure parse');

    // Look for common PowerPoint elements recursively
    const findElements = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return;

      Object.keys(obj).forEach(key => {
        const fullKey = path ? `${path}.${key}` : key;
        
        // Look for shape-like elements
        if (key.includes('sp') || key.includes('shape')) {
          console.log(`🔍 Found potential shape at: ${fullKey}`);
          // Try to parse as shape
          this.parseGenericShape(obj[key], componentIndex++, components);
        }
        
        // Look for text elements
        if (key.includes('text') || key.includes('txBody')) {
          console.log(`🔍 Found potential text at: ${fullKey}`);
        }

        // Recurse into arrays and objects
        if (Array.isArray(obj[key])) {
          obj[key].forEach((item, index) => {
            findElements(item, `${fullKey}[${index}]`);
          });
        } else if (typeof obj[key] === 'object') {
          findElements(obj[key], fullKey);
        }
      });
    };

    findElements(data);
    return components;
  }

  /**
   * Parse drawing element from clipboard
   * @param {Object} element - Drawing element
   * @param {Object} fullJson - Full JSON structure
   * @param {number} index - Component index
   * @returns {Promise<Object|null>} parsed component
   */
  async parseDrawingElement(element, fullJson, index) {
    try {
      // Look for shape in the element
      if (element['xdr:sp']) {
        return await this.parseShape(element['xdr:sp'][0], {}, {}, index);
      }

      // Look for picture in the element
      if (element['xdr:pic']) {
        return await this.parsePicture(element['xdr:pic'][0], {}, {}, index);
      }

      // Look for graphic frame
      if (element['xdr:graphicFrame']) {
        return await this.parseGraphicFrame(element['xdr:graphicFrame'][0], {}, {}, index);
      }

      return null;
    } catch (error) {
      console.warn(`Error parsing drawing element ${index}:`, error);
      return null;
    }
  }

  /**
   * Parse generic shape-like structure
   * @param {Object} shapeData - Shape-like data
   * @param {number} index - Component index
   * @param {Array} components - Components array to add to
   */
  parseGenericShape(shapeData, index, components) {
    try {
      if (Array.isArray(shapeData)) {
        shapeData.forEach((item, i) => {
          this.parseGenericShape(item, index + i, components);
        });
      } else if (shapeData && typeof shapeData === 'object') {
        // Try to extract basic information
        const component = {
          id: BaseParser.generateId('unknown', index),
          type: 'unknown',
          x: 0,
          y: 0,
          width: 100,
          height: 50,
          rotation: 0,
          content: 'Unknown element',
          style: {
            opacity: 1
          },
          metadata: {
            source: 'generic-parse',
            keys: Object.keys(shapeData)
          }
        };

        components.push(component);
      }
    } catch (error) {
      console.warn(`Error parsing generic shape ${index}:`, error);
    }
  }
}