/**
 * Base parser utilities for PowerPoint component parsing
 */

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
      const val = colorDef['a:srgbClr'][0]?.$.val;
      if (val) return `#${val}`;
    }

    // System color
    if (colorDef['a:sysClr']) {
      const lastClr = colorDef['a:sysClr'][0]?.$.lastClr;
      if (lastClr) return `#${lastClr}`;
    }

    // Scheme color (theme colors) - map to reasonable defaults
    if (colorDef['a:schemeClr']) {
      const val = colorDef['a:schemeClr'][0]?.$.val;
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
      const off = xfrm['a:off'][0]?.$;
      if (off) {
        result.x = this.emuToPixels(parseInt(off.x || 0));
        result.y = this.emuToPixels(parseInt(off.y || 0));
      }
    }

    // Size extents
    if (xfrm['a:ext']) {
      const ext = xfrm['a:ext'][0]?.$;
      if (ext) {
        result.width = this.emuToPixels(parseInt(ext.cx || 0));
        result.height = this.emuToPixels(parseInt(ext.cy || 0));
      }
    }

    // Rotation (in 60000ths of a degree)
    if (xfrm.$ && xfrm.$.rot) {
      result.rotation = parseInt(xfrm.$.rot) / 60000;
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

    const paragraphs = textBody['a:p'];
    const textParts = [];

    paragraphs.forEach(paragraph => {
      if (paragraph['a:r']) {
        // Text runs
        paragraph['a:r'].forEach(run => {
          if (run['a:t']) {
            run['a:t'].forEach(textNode => {
              if (typeof textNode === 'string') {
                textParts.push(textNode);
              } else if (textNode._) {
                textParts.push(textNode._);
              }
            });
          }
        });
      }
      // Add paragraph break except for last paragraph
      if (paragraph !== paragraphs[paragraphs.length - 1]) {
        textParts.push('\n');
      }
    });

    return textParts.join('').trim();
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
      color: '#000000'
    };

    if (!rPr) return font;

    // Font family
    if (rPr['a:latin']) {
      font.family = rPr['a:latin'][0]?.$.typeface || font.family;
    }

    // Font size (in hundreds of a point)
    if (rPr.$.sz) {
      font.size = this.fontSizeToPoints(parseInt(rPr.$.sz));
    }

    // Bold
    if (rPr.$.b === '1') {
      font.weight = 'bold';
    }

    // Italic
    if (rPr.$.i === '1') {
      font.style = 'italic';
    }

    // Underline
    if (rPr.$.u && rPr.$.u !== 'none') {
      font.decoration = 'underline';
    }

    // Color
    if (rPr['a:solidFill']) {
      font.color = this.parseColor(rPr['a:solidFill'][0]);
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