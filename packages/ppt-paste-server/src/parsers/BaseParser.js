/**
 * Base parser utilities for PowerPoint component parsing
 */

// Worker-compatible utility functions
export function isBufferLike(obj) {
  return obj && (obj instanceof Uint8Array || obj instanceof ArrayBuffer || 
    (typeof Buffer !== 'undefined' && Buffer.isBuffer && Buffer.isBuffer(obj)));
}

export function bufferFrom(data) {
  if (typeof Buffer !== 'undefined' && Buffer.from) {
    return Buffer.from(data);
  }
  return new Uint8Array(data);
}

export class BaseParser {
  /**
   * Convert EMU (English Metric Units) to pixels
   * 1 EMU = 1/914400 inch, assuming 96 DPI
   * @param {number} emu - EMU value
   * @returns {number} pixels
   */
  static emuToPixels(emu) {
    if (!emu || typeof emu !== 'number') return 0;
    return Math.round((emu / 914400) * 96);
  }

  /**
   * Convert EMU to points (for font sizes)
   * 1 point = 1/72 inch
   * @param {number} emu - EMU value
   * @returns {number} points
   */
  static emuToPoints(emu) {
    if (!emu || typeof emu !== 'number') return 0;
    return Math.round((emu / 914400) * 72);
  }

  /**
   * Convert PowerPoint font size units to points
   * PowerPoint uses hundreds of a point (1 point = 100 units)
   * @param {number} sz - PowerPoint font size
   * @returns {number} points
   */
  static fontSizeToPoints(sz) {
    if (!sz || typeof sz !== 'number') return 12; // Default font size
    return sz / 100;
  }

  /**
   * Parse color from PowerPoint color definition
   * @param {Object} colorDef - Color definition from PowerPoint XML
   * @returns {string} hex color (#rrggbb)
   */
  static parseColor(colorDef) {
    if (!colorDef) return '#000000';

    // Direct RGB color
    if (colorDef['a:srgbClr']) {
      const val = colorDef['a:srgbClr'].$val;
      if (val) return `#${val}`;
    }

    // System color
    if (colorDef['a:sysClr']) {
      const lastClr = colorDef['a:sysClr'].$lastClr;
      if (lastClr) return `#${lastClr}`;
    }

    // Scheme color (theme colors) - map to reasonable defaults
    if (colorDef['a:schemeClr']) {
      const val = colorDef['a:schemeClr'].$val;
      const schemeColors = {
        'dk1': '#000000',    // Dark 1
        'lt1': '#FFFFFF',    // Light 1
        'dk2': '#44546A',    // Dark 2
        'lt2': '#E7E6E6',    // Light 2
        'tx1': '#000000',    // Text 1 (same as dk1)
        'tx2': '#44546A',    // Text 2 (same as dk2)
        'bg1': '#FFFFFF',    // Background 1 (same as lt1)
        'bg2': '#E7E6E6',    // Background 2 (same as lt2)
        'accent1': '#4472C4', // Accent 1
        'accent2': '#E7686B', // Accent 2
        'accent3': '#A5A5A5', // Accent 3
        'accent4': '#FFC000', // Accent 4
        'accent5': '#5B9BD5', // Accent 5
        'accent6': '#70AD47', // Accent 6
        'hlink': '#0563C1',   // Hyperlink
        'folHlink': '#954F72' // Followed hyperlink
      };
      return schemeColors[val] || '#000000';
    }

    return '#000000';
  }

  /**
   * Extract transform information (position, size, rotation)
   * @param {Object} xfrm - Transform object from PowerPoint
   * @returns {Object} transform data
   */
  static parseTransform(xfrm) {
    const result = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rotation: 0
    };

    if (!xfrm) return result;

    // Position offset
    if (xfrm['a:off']) {
      const off = xfrm['a:off'];
      if (off) {
        result.x = this.emuToPixels(parseInt(off.$x || 0));
        result.y = this.emuToPixels(parseInt(off.$y || 0));
      }
    }

    // Size extents
    if (xfrm['a:ext']) {
      const ext = xfrm['a:ext'];
      if (ext) {
        result.width = this.emuToPixels(parseInt(ext.$cx || 0));
        result.height = this.emuToPixels(parseInt(ext.$cy || 0));
      }
    }

    // Rotation (in 60000ths of a degree)
    if (xfrm.$rot) {
      result.rotation = parseInt(xfrm.$rot) / 60000;
    }

    return result;
  }

  /**
   * Extract text content from PowerPoint text elements
   * @param {Object} textBody - Text body object from PowerPoint
   * @returns {string} combined text content
   */
  static extractTextContent(textBody) {
    if (!textBody || !textBody['a:p']) return '';

    // Handle both array and single paragraph formats
    const paragraphs = Array.isArray(textBody['a:p']) ? textBody['a:p'] : [textBody['a:p']];
    const textParts = [];

    paragraphs.forEach((paragraph, pIndex) => {
      let paragraphText = '';
      
      // Check for bullet formatting in paragraph properties
      const pPr = this.safeGet(paragraph, 'a:pPr');
      const hasBullet = this.hasBulletFormatting(pPr);
      
      if (paragraph['a:r']) {
        // Handle both array and single run formats
        const runs = Array.isArray(paragraph['a:r']) ? paragraph['a:r'] : [paragraph['a:r']];
        runs.forEach(run => {
          if (run['a:t']) {
            // In fast-xml-parser, text is directly a string, not an array
            const text = run['a:t'];
            if (typeof text === 'string') {
              paragraphText += text;
            } else if (text._) {
              paragraphText += text._;
            }
          }
        });
      }
      
      // Add bullet prefix if this paragraph has bullet formatting
      if (hasBullet && paragraphText.trim()) {
        paragraphText = '• ' + paragraphText;
      }
      
      if (paragraphText) {
        textParts.push(paragraphText);
      }
      
      // Add paragraph break except for last paragraph
      if (pIndex < paragraphs.length - 1) {
        textParts.push('\n');
      }
    });

    return textParts.join('').trim();
  }

  /**
   * Extract rich text content as tldraw-compatible structure
   * @param {Object} textBody - Text body object from PowerPoint
   * @returns {Object} tldraw rich text JSON structure
   */
  static extractRichTextContent(textBody) {
    if (!textBody || !textBody['a:p']) return null;

    // Handle both array and single paragraph formats  
    const paragraphs = Array.isArray(textBody['a:p']) ? textBody['a:p'] : [textBody['a:p']];
    const bulletParagraphs = [];
    const regularParagraphs = [];

    // Process each paragraph and preserve individual text run formatting
    paragraphs.forEach(paragraph => {
      const pPr = this.safeGet(paragraph, 'a:pPr');
      const hasBullet = this.hasBulletFormatting(pPr);
      
      // Extract text runs with their formatting
      const textRuns = [];
      if (paragraph['a:r']) {
        // Handle both array and single run formats
        const runs = Array.isArray(paragraph['a:r']) ? paragraph['a:r'] : [paragraph['a:r']];
        runs.forEach(run => {
          if (run['a:t']) {
            const rPr = this.safeGet(run, 'a:rPr');
            const font = this.parseFont(rPr);
            
            // In fast-xml-parser, text is directly a string, not an array
            const text = run['a:t'];
            if (text && typeof text === 'string') {
              // Create text node with marks based on formatting
              const textNodeObj = { type: 'text', text };
              const marks = [];
              
              // Add formatting marks
              if (font.isBold) {
                marks.push({ type: 'bold' });
              }
              if (font.isItalic) {
                marks.push({ type: 'italic' });
              }
              
              // Add custom formatting attributes for size and color
              const attrs = {};
              if (font.size && font.size !== 12) { // Only add if different from default
                attrs.fontSize = font.size;
              }
              if (font.color && font.color !== '#000000') { // Only add if different from black
                attrs.color = font.color;
              }
              if (font.family && font.family !== 'Arial') { // Only add if different from default
                attrs.fontFamily = font.family;
              }
              
              if (marks.length > 0) {
                textNodeObj.marks = marks;
              }
              if (Object.keys(attrs).length > 0) {
                textNodeObj.attrs = attrs;
              }
              
              textRuns.push(textNodeObj);
            } else if (text && text._) {
              // Handle case where text might be an object with underscore
              const textNodeObj = { type: 'text', text: text._ };
              textRuns.push(textNodeObj);
            }
          }
        });
      }
      
      if (textRuns.length > 0) {
        // Fix spacing between text runs
        const fixedTextRuns = this.fixSpacingInTextRuns(textRuns);
        
        if (hasBullet) {
          bulletParagraphs.push(fixedTextRuns);
        } else {
          regularParagraphs.push(fixedTextRuns);
        }
      }
    });

    // If we have bullets, create a bullet list structure
    if (bulletParagraphs.length > 0) {
      const content = [];
      
      // Add regular paragraphs first if any
      regularParagraphs.forEach(textRuns => {
        content.push({
          type: 'paragraph',
          content: textRuns
        });
      });
      
      // Add bullet list
      content.push({
        type: 'bulletList',
        content: bulletParagraphs.map(textRuns => ({
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: textRuns
          }]
        }))
      });

      return {
        type: 'doc',
        content
      };
    }

    // No bullets, just regular paragraphs
    if (regularParagraphs.length > 0) {
      return {
        type: 'doc',
        content: regularParagraphs.map(textRuns => ({
          type: 'paragraph',
          content: textRuns
        }))
      };
    }

    return null;
  }

  /**
   * Check if paragraph has bullet formatting
   * @param {Object} pPr - Paragraph properties
   * @returns {boolean} true if paragraph has bullets
   */
  static hasBulletFormatting(pPr) {
    if (!pPr) return false;
    
    // Check for bullet font (a:buFont)
    if (pPr['a:buFont']) return true;
    
    // Check for bullet character (a:buChar)
    if (pPr['a:buChar']) return true;
    
    // Check for auto number bullets (a:buAutoNum)
    if (pPr['a:buAutoNum']) return true;
    
    // Check for bullet size (a:buSzPct or a:buSzPts)
    if (pPr['a:buSzPct'] || pPr['a:buSzPts']) return true;
    
    // Check for bullet color (a:buClr)
    if (pPr['a:buClr']) return true;
    
    return false;
  }

  /**
   * Extract font information from text run properties
   * @param {Object} rPr - Run properties from PowerPoint
   * @returns {Object} font information
   */
  static parseFont(rPr) {
    const font = {
      family: 'Arial',
      size: 12,
      weight: 'normal',
      style: 'normal',
      decoration: 'none',
      color: '#000000',
      // Additional formatting properties
      isBold: false,
      isItalic: false,
      isUnderline: false,
      isSuperscript: false,
      isSubscript: false,
      isStrikethrough: false
    };

    if (!rPr) return font;

    // Font family
    if (rPr['a:latin']) {
      font.family = rPr['a:latin'].$typeface || font.family;
    }

    // Font size (in hundreds of a point)
    if (rPr.$sz) {
      font.size = this.fontSizeToPoints(parseInt(rPr.$sz));
    }

    // Bold
    if (rPr.$b === 1 || rPr.$b === '1') {
      font.weight = 'bold';
      font.isBold = true;
    }

    // Italic
    if (rPr.$i === 1 || rPr.$i === '1') {
      font.style = 'italic';
      font.isItalic = true;
    }

    // Underline
    if (rPr.$u && rPr.$u !== 'none') {
      font.decoration = 'underline';
      font.isUnderline = true;
    }

    // Strike-through
    if (rPr.$strike && rPr.$strike !== 'noStrike') {
      font.isStrikethrough = true;
    }

    // Superscript/Subscript (baseline attribute)
    if (rPr.$baseline) {
      const baseline = parseInt(rPr.$baseline);
      if (baseline > 0) {
        font.isSuperscript = true;
      } else if (baseline < 0) {
        font.isSubscript = true;
      }
    }

    // Color
    if (rPr['a:solidFill']) {
      font.color = this.parseColor(rPr['a:solidFill']);
    }

    return font;
  }

  /**
   * Generate unique component ID
   * @param {string} type - Component type
   * @param {number} index - Component index
   * @returns {string} unique ID
   */
  static generateId(type, index) {
    return `${type}-${Date.now()}-${index}`;
  }

  /**
   * Fix spacing between text runs that may have been lost during PowerPoint parsing
   * @param {Array} textRuns - Array of text run objects
   * @returns {Array} Fixed text runs with proper spacing
   */
  static fixSpacingInTextRuns(textRuns) {
    if (!textRuns || textRuns.length <= 1) return textRuns;
    
    const fixedRuns = [];
    
    for (let i = 0; i < textRuns.length; i++) {
      const currentRun = textRuns[i];
      const nextRun = textRuns[i + 1];
      
      fixedRuns.push(currentRun);
      
      // Check if we need to add a space between this run and the next
      if (nextRun && this.shouldAddSpaceBetweenRuns(currentRun, nextRun)) {
        // Add a space as a separate text run
        fixedRuns.push({
          type: 'text',
          text: ' '
        });
      }
    }
    
    return fixedRuns;
  }
  
  /**
   * Determine if a space should be added between two text runs
   * @param {Object} run1 - First text run
   * @param {Object} run2 - Second text run  
   * @returns {boolean} true if space should be added
   */
  static shouldAddSpaceBetweenRuns(run1, run2) {
    if (!run1?.text || !run2?.text) return false;
    
    const text1 = run1.text.trim();
    const text2 = run2.text.trim();
    
    // Don't add space if either text is empty
    if (!text1 || !text2) return false;
    
    // Don't add space if first text ends with whitespace or punctuation
    if (/[\s\.,!?;:]$/.test(run1.text)) return false;
    
    // Don't add space if second text starts with whitespace or punctuation
    if (/^[\s\.,!?;:]/.test(run2.text)) return false;
    
    // Add space between word-like runs
    return /\w$/.test(text1) && /^\w/.test(text2);
  }

  /**
   * Safe attribute access
   * @param {Object} obj - Object to access
   * @param {string} path - Dot-notation path
   * @param {*} defaultValue - Default value if path doesn't exist
   * @returns {*} value or default
   */
  static safeGet(obj, path, defaultValue = null) {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }
}