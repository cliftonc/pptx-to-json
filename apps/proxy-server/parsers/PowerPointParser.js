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
  async parseBuffer(buffer, { debug }) {
    try {
      console.log('🎨 Parsing PowerPoint buffer with pptx2json...');
      
      // Parse PowerPoint to JSON using pptx2json
      const json = await this.pptx2json.buffer2json(buffer);
      console.log('📦 PowerPoint parsed to JSON, files:', Object.keys(json).length);
      console.log('📦 Files found:', Object.keys(json));

      // Enable debug if requested or looking for image issues
      if(debug || true) {
        console.log('🐛 DEBUG: Searching for image references in shapes...');
        // Look for image references in the drawing XML
        const drawingFile = json['clipboard/drawings/drawing1.xml'];
        if (drawingFile) {
          const shapes = drawingFile?.['a:graphic']?.['a:graphicData']?.[0]?.['lc:lockedCanvas']?.[0]?.['a:sp'];
          if (shapes) {
            shapes.forEach((shape, i) => {
              console.log(`🔍 Shape ${i} keys:`, Object.keys(shape));
              const spPr = shape['a:spPr']?.[0];
              if (spPr) {
                console.log(`🔍 Shape ${i} spPr keys:`, Object.keys(spPr));
                const blipFill = spPr['a:blipFill'];
                if (blipFill) {
                  console.log(`🔍 Shape ${i} HAS blipFill:`, blipFill);
                  const blip = blipFill?.[0]?.['a:blip'];
                  if (blip) {
                    const rId = blip?.[0]?.$?.['r:embed'];
                    console.log(`🔍 Shape ${i} HAS r:embed:`, rId);
                  }
                }
              }
            });
          }
        }
      }

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

        const slide = slideData['p:sld'] && slideData['p:sld'][0];
        if (!slide) {
          console.warn(`⚠️ No slide data found in ${slideFile}`);
          continue;
        }
        
        const slideComponents = await this.parseSlide(
          slide, 
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
      // Check if shape is an image first (before text check)
      // Images in clipboard format might have text content like "image1.png" but also image references
      const imageComponent = await ImageParser.parseShapeWithImage(shape, relationships, mediaFiles, index);
      if (imageComponent) {
        return imageComponent;
      }
      
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

    // Look for media files in both normal and clipboard formats
    Object.keys(json).forEach(key => {
      if (key.startsWith('ppt/media/') || key.startsWith('clipboard/media/')) {
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

    // Strategy 2: Look for orphaned media files (images without drawing references)
    const mediaFiles = this.extractMediaFiles(fullJson);
    const relationships = this.extractClipboardRelationships(fullJson);
    
    // Orphaned image detection removed - images are now properly parsed from picture elements

    // Strategy 3: If no shapes found, try regex fallback on raw XML
    if (components.length === 0) {
      console.log('🔄 No structured components found, trying regex fallback...');
      const regexComponents = await this.parseWithRegexFallback(fullJson, slideFile);
      if (regexComponents.length > 0) {
        console.log(`✅ Found ${regexComponents.length} components via regex fallback`);
        components.push(...regexComponents);
      }
    }

    // Strategy 4: If still nothing, create debug component
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
      for (const key of Object.keys(obj)) {
        const fullPath = path ? `${path}.${key}` : key;
        
        // If key suggests shapes or pictures, process the array
        if (key === 'a:sp' || key === 'p:sp' || key === 'xdr:sp' || key === 'a:pic' || key === 'p:pic' || key === 'xdr:pic') {
          // Only process if we haven't seen this path before
          if (!processedPaths.has(fullPath)) {
            processedPaths.add(fullPath);
            console.log(`🔍 Processing shape/picture element: ${fullPath}`);
            
            if (Array.isArray(obj[key])) {
              console.log(`🔍 Found ${obj[key].length} shapes/pictures in array: ${fullPath}`);
              for (let index = 0; index < obj[key].length; index++) {
                const item = obj[key][index];
                let component;
                
                // If it's a picture element, try parsing as image first
                if (key.includes('pic')) {
                  console.log(`🖼️ Trying to parse picture element at ${fullPath}[${index}]`);
                  const relationships = this.extractClipboardRelationships(fullJson);
                  const mediaFiles = this.extractMediaFiles(fullJson);
                  component = ImageParser.parse(item, relationships, mediaFiles, componentIndex);
                }
                
                // If picture parsing failed or it's a shape element, try parsing as shape
                if (!component) {
                  component = this.tryParseAsShape(item, componentIndex, `${fullPath}[${index}]`);
                }
                
                if (component) {
                  component.slideIndex = slideIndex;
                  components.push(component);
                  componentIndex++;
                }
              }
            } else if (obj[key] && typeof obj[key] === 'object') {
              let component;
              
              // If it's a picture element, try parsing as image first
              if (key.includes('pic')) {
                console.log(`🖼️ Trying to parse picture element at ${fullPath}`);
                const relationships = this.extractClipboardRelationships(fullJson);
                const mediaFiles = this.extractMediaFiles(fullJson);
                component = ImageParser.parse(obj[key], relationships, mediaFiles, componentIndex);
              }
              
              // If picture parsing failed or it's a shape element, try parsing as shape
              if (!component) {
                component = this.tryParseAsShape(obj[key], componentIndex, fullPath);
              }
              
              if (component) {
                component.slideIndex = slideIndex;
                components.push(component);
                componentIndex++;
              }
            }
          }
        }
        
        // Continue recursive search only if we haven't processed this path as a shape array
        if (typeof obj[key] === 'object' && !processedPaths.has(fullPath)) {
          searchForShapes(obj[key], fullPath);
        }
      }
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
        'p:spPr': shapeData['a:spPr'] || shapeData['p:spPr'],
        'p:style': shapeData['a:style'] || shapeData['p:style']
      }, index);

      // Fallback to manual parsing with basic styling
      console.log(`🔧 Using manual parsing fallback`);
      const transform = this.extractBasicTransform(shapeData);
      const text = this.extractBasicText(shapeData);

      // Try to extract shape type and colors from geometry
      let shapeType = 'rectangle';
      let backgroundColor = 'transparent';
      let borderColor = 'transparent';
      
      console.log(`🔍 Analyzing shape data for colors...`);
      
      const spPr = shapeData['a:spPr'] || shapeData['p:spPr'] || shapeData['xdr:spPr'];
      if (spPr && spPr[0]) {
        const geom = spPr[0]['a:prstGeom'] || spPr[0]['p:prstGeom'];
        if (geom && geom[0] && geom[0].$ && geom[0].$.prst) {
          shapeType = geom[0].$.prst;
          console.log(`🔧 Extracted shape type: ${shapeType}`);
        }
        
        // Try to extract fill color - only if there's an explicit solid fill
        const solidFill = spPr[0]['a:solidFill'] || spPr[0]['p:solidFill'];
        console.log(`🔍 Checking for solid fill:`, !!solidFill);
        
        if (solidFill && solidFill[0]) {
          const schemeClr = solidFill[0]['a:schemeClr'] || solidFill[0]['p:schemeClr'];
          const srgbClr = solidFill[0]['a:srgbClr'] || solidFill[0]['p:srgbClr'];
          
          console.log(`🔍 Found color data: scheme=${!!schemeClr}, rgb=${!!srgbClr}`);
          
          if (srgbClr && srgbClr[0] && srgbClr[0].$.val) {
            // Prefer explicit RGB colors over scheme colors
            backgroundColor = '#' + srgbClr[0].$.val.toLowerCase();
            console.log(`🔧 Extracted RGB color: ${backgroundColor}`);
          } else if (schemeClr && schemeClr[0] && schemeClr[0].$.val) {
            const schemeVal = schemeClr[0].$.val;
            console.log(`🔍 Found scheme color: ${schemeVal}`);
            
            // Only map scheme colors that are explicitly accent colors, not defaults
            const colorMap = {
              'accent1': '#4472c4',
              'accent2': '#e7e6e6',
              'accent3': '#a5a5a5', 
              'accent4': '#ffc000',
              'accent5': '#5b9bd5',
              'accent6': '#70ad47'
            };
            
            if (colorMap[schemeVal]) {
              backgroundColor = colorMap[schemeVal];
              console.log(`🔧 Extracted scheme color: ${schemeVal} -> ${backgroundColor}`);
            } else {
              console.log(`🔧 Ignoring scheme color: ${schemeVal} (keeping transparent)`);
              backgroundColor = 'transparent';
            }
          }
        } else {
          console.log(`🔧 No solid fill found, keeping transparent`);
        }
        
        // Try to extract border color
        const line = spPr[0]['a:ln'] || spPr[0]['p:ln'];
        console.log(`🔍 Checking for border:`, !!line);
        
        if (line && line[0]) {
          const lineFill = line[0]['a:solidFill'] || line[0]['p:solidFill'];
          console.log(`🔍 Border has fill:`, !!lineFill);
          
          if (lineFill && lineFill[0]) {
            const schemeClr = lineFill[0]['a:schemeClr'] || lineFill[0]['p:schemeClr'];
            const srgbClr = lineFill[0]['a:srgbClr'] || lineFill[0]['p:srgbClr'];
            
            console.log(`🔍 Border color data: scheme=${!!schemeClr}, rgb=${!!srgbClr}`);
            
            if (srgbClr && srgbClr[0] && srgbClr[0].$.val) {
              // Prefer explicit RGB colors over scheme colors
              borderColor = '#' + srgbClr[0].$.val.toLowerCase();
              console.log(`🔧 Extracted border RGB color: ${borderColor}`);
            } else if (schemeClr && schemeClr[0] && schemeClr[0].$.val) {
              const schemeVal = schemeClr[0].$.val;
              console.log(`🔍 Found border scheme color: ${schemeVal}`);
              
              // Only map scheme colors that are explicitly accent colors, not defaults
              const colorMap = {
                'accent1': '#4472c4',
                'accent2': '#e7e6e6', 
                'accent3': '#a5a5a5',
                'accent4': '#ffc000',
                'accent5': '#5b9bd5',
                'accent6': '#70ad47'
              };
              
              if (colorMap[schemeVal]) {
                borderColor = colorMap[schemeVal];
                console.log(`🔧 Extracted border scheme color: ${schemeVal} -> ${borderColor}`);
              } else {
                console.log(`🔧 Ignoring border scheme color: ${schemeVal} (keeping transparent)`);
                borderColor = 'transparent';
              }
            }
          }
        } else {
          console.log(`🔧 No border found, keeping transparent`);
        }
      }

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
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          shapeType: shapeType
        },
        metadata: {
          source: 'flexible-parser-fallback',
          path: path,
          originalKeys: Object.keys(shapeData),
          shapeType: shapeType
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

  /**
   * Extract relationship files from clipboard format
   * @param {Object} json - Full JSON structure
   * @returns {Object} relationship data
   */
  extractClipboardRelationships(json) {
    const relationships = {};

    // Look for relationship files in clipboard format
    Object.keys(json).forEach(key => {
      if (key.includes('_rels') && key.endsWith('.xml.rels')) {
        relationships[key] = json[key];
      }
    });

    console.log('🔗 Found relationship files:', Object.keys(relationships));
    return relationships;
  }

  /**
   * Link images to their parent shapes using relationship data
   * @param {Array} components - Shape components
   * @param {Object} mediaFiles - Available media files
   * @param {Object} relationships - Relationship data
   * @returns {Promise<Array>} components with proper image links
   */
  async linkImagesToShapes(components, mediaFiles, relationships) {
    console.log('🔗 Linking images to shapes using relationships...');
    
    // Parse relationship file to get r:embed mappings
    const relationshipMappings = this.parseRelationshipMappings(relationships);
    const linkedMediaFiles = new Set();
    
    // Process each component to see if it should be an image
    const updatedComponents = [];
    
    for (const component of components) {
      if (component.type === 'shape' || component.type === 'text') {
        // Check if this shape/text has an image reference that we can link to
        const linkedImageComponent = await this.tryLinkComponentToImage(
          component, mediaFiles, relationshipMappings, linkedMediaFiles
        );
        
        if (linkedImageComponent) {
          console.log(`🔗 Linked shape ${component.id} to image, converting to image component`);
          updatedComponents.push(linkedImageComponent);
        } else {
          updatedComponents.push(component);
        }
      } else {
        updatedComponents.push(component);
      }
    }
    
    console.log(`🔗 Processed ${components.length} components, ${linkedMediaFiles.size} images linked`);
    return updatedComponents;
  }

  /**
   * Parse relationship XML to get r:embed to media file mappings
   * @param {Object} relationships - Relationship data
   * @returns {Object} mapping from relationship ID to media file path
   */
  parseRelationshipMappings(relationships) {
    const mappings = {};
    
    Object.keys(relationships).forEach(relFile => {
      const relData = relationships[relFile];
      if (relData && relData.Relationships && relData.Relationships.Relationship) {
        const rels = relData.Relationships.Relationship;
        const relArray = Array.isArray(rels) ? rels : [rels];
        
        relArray.forEach(rel => {
          if (rel.$ && rel.$.Id && rel.$.Target) {
            const rId = rel.$.Id;
            const target = rel.$.Target;
            
            // Convert relative path to absolute path for media files
            if (target.includes('media/')) {
              const mediaPath = target.startsWith('../') 
                ? target.replace('../', 'clipboard/')
                : `clipboard/${target}`;
              mappings[rId] = mediaPath;
              console.log(`🔗 Mapped relationship ${rId} -> ${mediaPath}`);
            }
          }
        });
      }
    });
    
    return mappings;
  }

  /**
   * Try to link a component to an image using relationship mappings
   * @param {Object} component - Shape or text component
   * @param {Object} mediaFiles - Available media files  
   * @param {Object} relationshipMappings - r:embed to media path mappings
   * @param {Set} linkedMediaFiles - Set to track already linked media files
   * @returns {Promise<Object|null>} image component if linkable, null otherwise
   */
  async tryLinkComponentToImage(component, mediaFiles, relationshipMappings, linkedMediaFiles) {
    // This is a simplified approach - in the full implementation, we'd need to
    // parse the original shape data to find r:embed references
    // For now, let's use a heuristic: if there's one media file and one shape/text,
    // they probably belong together
    
    const mediaFileKeys = Object.keys(mediaFiles);
    if (mediaFileKeys.length === 1 && !linkedMediaFiles.has(mediaFileKeys[0])) {
      const mediaKey = mediaFileKeys[0];
      const mediaFile = mediaFiles[mediaKey];
      
      if (Buffer.isBuffer(mediaFile)) {
        linkedMediaFiles.add(mediaKey);
        
        // Create image component using the shape's dimensions and position
        const filename = mediaKey.split('/').pop();
        const imageType = filename?.split('.').pop()?.toLowerCase() || 'unknown';
        const mimeType = this.getMimeTypeFromExtension(imageType);
        const base64 = mediaFile.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64}`;
        
        console.log(`✅ Linking ${component.type} component to image: ${filename} (${mediaFile.length} bytes)`);
        
        return {
          id: BaseParser.generateId('image', 0),
          type: 'image',
          x: component.x,
          y: component.y,
          width: component.width,
          height: component.height,
          rotation: component.rotation || 0,
          content: component.content || filename,
          style: {
            opacity: 1,
            ...component.style
          },
          metadata: {
            name: filename,
            description: `Image linked from ${component.type} component`,
            imageUrl: dataUrl,
            imageType: imageType,
            imageSize: mediaFile.length,
            originalPath: mediaKey,
            source: 'shape-image-link',
            originalComponent: component
          },
          slideIndex: component.slideIndex
        };
      }
    }
    
    return null;
  }

  /**
   * Find media files that exist but aren't referenced in drawings
   * @param {Object} mediaFiles - Available media files
   * @param {Object} relationships - Relationship data
   * @param {Array} existingComponents - Already parsed components
   * @param {number} slideIndex - Slide index
   * @param {Object} fullJson - Complete PowerPoint JSON data
   * @returns {Promise<Array>} orphaned image components
   */
  async findOrphanedMediaFiles(mediaFiles, relationships, existingComponents, slideIndex, fullJson) {
    const orphanedImages = [];
    const mediaKeys = Object.keys(mediaFiles);

    if (mediaKeys.length === 0) {
      console.log('📷 No media files to check for orphans');
      return orphanedImages;
    }

    console.log(`📷 Checking ${mediaKeys.length} media files for orphans...`);

    // Get list of relationship IDs that are already used by properly parsed components
    const usedRelationshipIds = this.getUsedRelationshipIds(existingComponents);
    console.log(`📷 Found ${usedRelationshipIds.size} relationship IDs already used by proper components`);

    // Check each media file
    for (let i = 0; i < mediaKeys.length; i++) {
      const mediaKey = mediaKeys[i];
      const mediaFile = mediaFiles[mediaKey];

      // Skip if not a buffer (should be image data)
      if (!Buffer.isBuffer(mediaFile)) {
        continue;
      }

      // Check if this media file is already referenced by a properly parsed component
      const relId = this.findRelationshipIdForMediaFile(mediaKey, relationships);
      if (relId && usedRelationshipIds.has(relId)) {
        console.log(`📷 Skipping ${mediaKey} - already used by properly parsed component (${relId})`);
        continue;
      }

      console.log(`📷 Processing orphaned media file: ${mediaKey} (${mediaFile.length} bytes)`);
      
      // IMPORTANT: Let's see if the PowerPoint dimension search is working
      console.log(`🔍 DEBUG: About to call findImageDimensionsFromShapes for ${mediaKey}`);

      // Create a basic image component for orphaned media
      const filename = mediaKey.split('/').pop();
      const imageType = filename?.split('.').pop()?.toLowerCase() || 'unknown';
      
      // Create data URL
      const mimeType = this.getMimeTypeFromExtension(imageType);
      const base64 = mediaFile.toString('base64');
      const dataUrl = `data:${mimeType};base64,${base64}`;

      // Position orphaned images to the right of existing components
      const xOffset = 400 + (i * 50); // Stagger them
      const yOffset = 50 + (i * 20);

      // Try to find PowerPoint-scaled dimensions from shape data first
      // If we have transform information from shapes, use that instead of raw file dimensions
      const powerPointDimensions = await this.findImageDimensionsFromShapes(mediaKey, fullJson);
      
      let imageDimensions;
      if (powerPointDimensions) {
        imageDimensions = powerPointDimensions;
        console.log(`📷 Using PowerPoint-scaled dimensions: ${imageDimensions.width}x${imageDimensions.height} (from shape transform)`);
      } else {
        // Fallback to raw image dimensions
        imageDimensions = this.extractImageDimensions(mediaFile, imageType);
        console.log(`📷 Using raw file dimensions: ${imageDimensions.width}x${imageDimensions.height} (no PowerPoint scaling found)`);
      }

      const orphanedImage = {
        id: BaseParser.generateId('orphaned-image', i),
        type: 'image',
        x: xOffset,
        y: yOffset,
        width: imageDimensions.width,
        height: imageDimensions.height,
        rotation: 0,
        content: `Orphaned image: ${filename}`,
        style: {
          opacity: 1,
          border: '2px dashed #ff6b6b', // Visual indicator this was orphaned
        },
        metadata: {
          name: filename,
          description: `Orphaned image found in ${mediaKey}`,
          imageUrl: dataUrl,
          imageType: imageType,
          imageSize: mediaFile.length,
          isOrphaned: true,
          originalPath: mediaKey,
          source: 'orphaned-media-detection'
        },
        slideIndex: slideIndex
      };

      orphanedImages.push(orphanedImage);
      console.log(`✅ Created orphaned image component: ${filename} (${mediaFile.length} bytes)`);
    }

    return orphanedImages;
  }

  /**
   * Get MIME type from file extension
   * @param {string} extension - File extension
   * @returns {string} MIME type
   */
  getMimeTypeFromExtension(extension) {
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'tiff': 'image/tiff',
      'tif': 'image/tiff'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

  /**
   * Extract image dimensions from binary image data
   * @param {Buffer} imageBuffer - Image file buffer
   * @param {string} imageType - Image type (png, jpg, etc.)
   * @returns {Object} {width, height} dimensions
   */
  extractImageDimensions(imageBuffer, imageType) {
    try {
      switch (imageType.toLowerCase()) {
        case 'png':
          return this.extractPngDimensions(imageBuffer);
        case 'jpg':
        case 'jpeg':
          return this.extractJpegDimensions(imageBuffer);
        default:
          console.warn(`📷 Unsupported image type for dimension extraction: ${imageType}`);
          return { width: 200, height: 150 }; // Fallback
      }
    } catch (error) {
      console.warn(`📷 Failed to extract image dimensions:`, error);
      return { width: 200, height: 150 }; // Fallback
    }
  }

  /**
   * Extract PNG dimensions from PNG file buffer
   * @param {Buffer} buffer - PNG file buffer
   * @returns {Object} {width, height}
   */
  extractPngDimensions(buffer) {
    // PNG signature: 8 bytes
    // IHDR chunk: 4 bytes length + 4 bytes "IHDR" + 4 bytes width + 4 bytes height + ...
    if (buffer.length < 24) {
      throw new Error('Invalid PNG file: too small');
    }
    
    // Check PNG signature
    const signature = buffer.subarray(0, 8);
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    if (!signature.equals(pngSignature)) {
      throw new Error('Invalid PNG file: wrong signature');
    }
    
    // Read IHDR dimensions (big endian)
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    
    return { width, height };
  }

  /**
   * Extract JPEG dimensions from JPEG file buffer
   * @param {Buffer} buffer - JPEG file buffer
   * @returns {Object} {width, height}
   */
  extractJpegDimensions(buffer) {
    // Simple JPEG dimension extraction
    // Look for SOF0 (0xFFC0) or SOF2 (0xFFC2) markers
    let offset = 2; // Skip initial 0xFFD8
    
    while (offset < buffer.length - 8) {
      if (buffer[offset] === 0xFF) {
        const marker = buffer[offset + 1];
        
        // SOF0 or SOF2 markers contain dimensions
        if (marker === 0xC0 || marker === 0xC2) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        
        // Skip to next marker
        if (marker === 0xDA) break; // Start of scan data
        const segmentLength = buffer.readUInt16BE(offset + 2);
        offset += 2 + segmentLength;
      } else {
        offset++;
      }
    }
    
    throw new Error('Could not find JPEG dimensions');
  }

  /**
   * Find image dimensions from PowerPoint shape transforms
   * This searches the drawing XML for image references and extracts the PowerPoint-scaled dimensions
   * @param {string} mediaKey - Path to the media file (e.g., "clipboard/media/image1.png")
   * @param {Object} fullJson - Complete PowerPoint JSON data
   * @returns {Promise<Object|null>} {width, height} if found, null otherwise
   */
  async findImageDimensionsFromShapes(mediaKey, fullJson) {
    try {
      console.log(`🔍 Searching for PowerPoint dimensions for ${mediaKey}...`);
      
      // First, find the relationship ID that corresponds to this media file
      const relationshipMappings = this.extractClipboardRelationships(fullJson);
      let targetRId = null;
      
      // Look through relationship mappings to find which r:embed ID points to this media file
      Object.keys(relationshipMappings).forEach(relFile => {
        const relData = relationshipMappings[relFile];
        if (relData && relData.Relationships && relData.Relationships.Relationship) {
          const rels = relData.Relationships.Relationship;
          const relArray = Array.isArray(rels) ? rels : [rels];
          
          relArray.forEach(rel => {
            if (rel.$ && rel.$.Id && rel.$.Target) {
              const target = rel.$.Target;
              const normalizedTarget = target.startsWith('../') 
                ? target.replace('../', 'clipboard/')
                : `clipboard/${target}`;
                
              if (normalizedTarget === mediaKey) {
                targetRId = rel.$.Id;
                console.log(`🔍 Found relationship ${targetRId} for ${mediaKey}`);
              }
            }
          });
        }
      });
      
      if (!targetRId) {
        console.log(`❌ No relationship ID found for ${mediaKey}`);
        return null;
      }
      
      // Now search through all drawing files to find a shape that references this r:embed ID
      const drawingFiles = Object.keys(fullJson).filter(key => 
        key.includes('drawings/drawing') && key.endsWith('.xml')
      );
      
      for (const drawingFile of drawingFiles) {
        console.log(`🔍 Searching ${drawingFile} for r:embed=${targetRId}...`);
        const dimensions = await this.searchDrawingForImageDimensions(fullJson[drawingFile], targetRId);
        
        if (dimensions) {
          console.log(`✅ Found PowerPoint dimensions in ${drawingFile}: ${dimensions.width}x${dimensions.height}`);
          return dimensions;
        }
      }
      
      console.log(`❌ No PowerPoint dimensions found for ${mediaKey} with r:embed=${targetRId}`);
      return null;
      
    } catch (error) {
      console.warn(`❌ Error finding PowerPoint dimensions for ${mediaKey}:`, error);
      return null;
    }
  }
  
  /**
   * Search a drawing file for image references and extract dimensions
   * @param {Object} drawingData - Parsed drawing XML data
   * @param {string} targetRId - The r:embed ID to search for
   * @returns {Promise<Object|null>} {width, height} if found, null otherwise
   */
  async searchDrawingForImageDimensions(drawingData, targetRId) {
    try {
      // Store reference to 'this' for use in nested function
      const self = this;
      
      // Recursively search the drawing structure for blipFill references
      const searchForBlipFill = (obj, path = '') => {
        if (!obj || typeof obj !== 'object') return null;
        
        // Look for blipFill elements
        if (obj['a:blipFill']) {
          const blipFillArray = Array.isArray(obj['a:blipFill']) ? obj['a:blipFill'] : [obj['a:blipFill']];
          
          for (const blipFill of blipFillArray) {
            const blip = BaseParser.safeGet(blipFill, 'a:blip.0');
            const rId = blip?.$?.['r:embed'];
            
            if (rId === targetRId) {
              console.log(`🎯 Found matching r:embed=${targetRId} at ${path}`);
              
              // Now find the transform information in the parent shape
              return self.findTransformInParent(obj, path);
            }
          }
        }
        
        // Recursively search child objects
        for (const [key, value] of Object.entries(obj)) {
          const newPath = path ? `${path}.${key}` : key;
          
          if (Array.isArray(value)) {
            for (let i = 0; i < value.length; i++) {
              const result = searchForBlipFill(value[i], `${newPath}[${i}]`);
              if (result) return result;
            }
          } else if (typeof value === 'object') {
            const result = searchForBlipFill(value, newPath);
            if (result) return result;
          }
        }
        
        return null;
      };
      
      return searchForBlipFill(drawingData);
      
    } catch (error) {
      console.warn(`❌ Error searching drawing for dimensions:`, error);
      return null;
    }
  }
  
  /**
   * Find transform information in a shape that contains an image
   * @param {Object} shapeObj - The shape object that contains the blipFill
   * @param {string} path - Path for debugging
   * @returns {Object|null} {width, height} if found, null otherwise
   */
  findTransformInParent(shapeObj, path) {
    try {
      // Look for transform in various possible locations
      const possibleTransformPaths = [
        'a:spPr.0.a:xfrm.0',
        'p:spPr.0.a:xfrm.0', 
        'a:xfrm.0',
        'p:xfrm.0'
      ];
      
      for (const transformPath of possibleTransformPaths) {
        const xfrm = BaseParser.safeGet(shapeObj, transformPath);
        
        if (xfrm) {
          console.log(`🔍 Found transform at ${path}.${transformPath}`);
          const transform = BaseParser.parseTransform(xfrm);
          
          if (transform.width > 0 && transform.height > 0) {
            console.log(`✅ Extracted PowerPoint dimensions: ${transform.width}x${transform.height}`);
            return { width: transform.width, height: transform.height };
          }
        }
      }
      
      console.log(`❌ No valid transform found at ${path}`);
      return null;
      
    } catch (error) {
      console.warn(`❌ Error finding transform in parent:`, error);
      return null;
    }
  }

  /**
   * Get image information from relationship and media data (clipboard format)
   * @param {string} rId - Relationship ID
   * @param {Object} relationships - Relationship data
   * @param {Object} mediaFiles - Media files data
   * @returns {Object} image information
   */
  getClipboardImageInfo(rId, relationships, mediaFiles) {
    if (!rId) {
      return {
        url: null,
        type: 'unknown',
        size: 0,
        dimensions: null
      };
    }

    // Find relationship for this image
    const relFile = Object.keys(relationships).find(key => 
      key.includes('clipboard') && key.includes('_rels')
    );
    
    if (relFile && relationships[relFile]) {
      const rels = BaseParser.safeGet(relationships[relFile], 'Relationships.Relationship', []);
      const rel = rels.find(r => r.$.Id === rId);
      
      if (rel) {
        const target = rel.$.Target;
        const mediaPath = target.startsWith('../') ? target.slice(3) : `clipboard/${target}`;
        
        // Look for the media file
        const mediaFile = mediaFiles[mediaPath];
        if (mediaFile) {
          return {
            url: this.createClipboardDataUrl(mediaFile, target),
            type: this.getClipboardImageType(target),
            size: mediaFile.length || 0,
            dimensions: null // Would need image parsing library
          };
        }
      }
    }

    return {
      url: null,
      type: 'unknown',
      size: 0,
      dimensions: null
    };
  }

  /**
   * Create data URL from media file buffer (clipboard format)
   * @param {Buffer} mediaFile - Image file buffer
   * @param {string} filename - Original filename
   * @returns {string} data URL or placeholder
   */
  createClipboardDataUrl(mediaFile, filename) {
    if (!mediaFile || !Buffer.isBuffer(mediaFile)) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZTwvdGV4dD48L3N2Zz4=';
    }

    const type = this.getClipboardImageType(filename);
    const mimeType = this.getClipboardMimeType(type);
    const base64 = mediaFile.toString('base64');
    
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Get image type from filename (clipboard format)
   * @param {string} filename - Image filename
   * @returns {string} image type
   */
  getClipboardImageType(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext || 'unknown';
  }

  /**
   * Get MIME type from image type (clipboard format)
   * @param {string} type - Image type
   * @returns {string} MIME type
   */
  getClipboardMimeType(type) {
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'tiff': 'image/tiff',
      'tif': 'image/tiff'
    };
    
    return mimeTypes[type] || 'application/octet-stream';
  }

  /**
   * Parse image effects from blip fill (clipboard format)
   * @param {Object} blipFill - Blip fill properties
   * @returns {Object} effects information
   */
  parseClipboardImageEffects(blipFill) {
    const effects = {
      opacity: 1,
      filter: null,
      borderRadius: 0,
      shadow: null,
      effectsList: []
    };

    if (!blipFill) return effects;

    // Parse alpha/opacity
    const blip = BaseParser.safeGet(blipFill, 'a:blip.0');
    if (blip) {
      // Look for alpha modulation
      const alphaModFix = BaseParser.safeGet(blip, 'a:alphaModFix.0.$.amt');
      if (alphaModFix) {
        effects.opacity = parseInt(alphaModFix) / 100000; // PowerPoint uses 100000 = 100%
      }

      // Grayscale effect
      if (BaseParser.safeGet(blip, 'a:grayscl')) {
        effects.filter = 'grayscale(100%)';
        effects.effectsList.push('grayscale');
      }

      // Bi-level (black and white)
      if (BaseParser.safeGet(blip, 'a:biLevel')) {
        effects.filter = 'contrast(1000%) brightness(50%)';
        effects.effectsList.push('bilevel');
      }
    }

    return effects;
  }

  /**
   * Parse image cropping information (clipboard format)
   * @param {Object} blipFill - Blip fill properties
   * @returns {Object} cropping information
   */
  parseClipboardImageCropping(blipFill) {
    const srcRect = BaseParser.safeGet(blipFill, 'a:srcRect.0.$');
    if (!srcRect) {
      return {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        isCropped: false
      };
    }

    // PowerPoint uses percentages * 1000 (e.g., 10000 = 10%)
    return {
      left: srcRect.l ? parseInt(srcRect.l) / 1000 : 0,
      top: srcRect.t ? parseInt(srcRect.t) / 1000 : 0,
      right: srcRect.r ? parseInt(srcRect.r) / 1000 : 0,
      bottom: srcRect.b ? parseInt(srcRect.b) / 1000 : 0,
      isCropped: !!(srcRect.l || srcRect.t || srcRect.r || srcRect.b)
    };
  }

  /**
   * Get relationship IDs that are already used by properly parsed components
   * @param {Array} existingComponents - Already parsed components
   * @returns {Set} Set of relationship IDs that are in use
   */
  getUsedRelationshipIds(existingComponents) {
    const usedIds = new Set();
    
    for (const component of existingComponents) {
      if (component.metadata && component.metadata.relationshipId) {
        usedIds.add(component.metadata.relationshipId);
      }
    }
    
    return usedIds;
  }

  /**
   * Find the relationship ID for a given media file path
   * @param {string} mediaKey - Media file path (e.g., 'clipboard/media/image1.png')
   * @param {Object} relationships - Relationship data
   * @returns {string|null} Relationship ID if found
   */
  findRelationshipIdForMediaFile(mediaKey, relationships) {
    // Find relationship file that contains references to media
    const relFile = Object.keys(relationships).find(key => 
      key.includes('clipboard') && key.includes('_rels')
    );
    
    if (!relFile || !relationships[relFile]) {
      return null;
    }

    const rels = BaseParser.safeGet(relationships[relFile], 'Relationships.Relationship', []);
    
    // Find relationship that points to this media file
    for (const rel of rels) {
      if (rel.$ && rel.$.Target) {
        let target = rel.$.Target;
        
        // Normalize paths for comparison
        if (target.startsWith('../')) {
          target = target.slice(3);
        } else if (!target.startsWith('clipboard/')) {
          target = `clipboard/${target}`;
        }
        
        if (target === mediaKey) {
          return rel.$.Id;
        }
      }
    }
    
    return null;
  }
}