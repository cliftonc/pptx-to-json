/**
 * Shape component parser for PowerPoint shapes without text content
 */

import { BaseParser } from './BaseParser.js';

export class ShapeParser extends BaseParser {
  /**
   * Parse a shape component from PowerPoint shape data
   * @param {Object} shape - Shape data from PowerPoint JSON
   * @param {number} index - Component index for ID generation
   * @returns {Object|null} parsed shape component
   */
  static parse(shape, index = 0) {    
    try {
      // Get shape properties
      const spPr = this.safeGet(shape, 'p:spPr');
      if (!spPr) return null;

      // Get style properties (may contain additional styling)
      const style = this.safeGet(shape, 'p:style');

      // Get transform information
      const xfrm = this.safeGet(spPr, 'a:xfrm');
      const transform = this.parseTransform(xfrm);

      // Skip if shape has no dimensions
      if (transform.width === 0 && transform.height === 0) return null;

      // Parse shape geometry
      const geometry = this.parseGeometry(spPr);
      
      // Parse fill properties (try style first, then spPr)
      const fill = this.parseFill(spPr, style);
      
      // Parse line/border properties (try style first, then spPr)
      const border = this.parseBorder(spPr, style);

      // Parse effects (shadows, glows, etc.)
      const effects = this.parseEffects(spPr);

      return {
        id: this.generateId('shape', index),
        type: 'shape',
        x: transform.x,
        y: transform.y,
        width: transform.width,
        height: transform.height,
        rotation: transform.rotation,
        content: `${geometry.type} shape`,
        style: {
          backgroundColor: fill.color,
          borderColor: border.color,
          borderWidth: border.width,
          borderStyle: border.style,
          opacity: fill.opacity,
          ...effects
        },
        metadata: {
          shapeType: geometry.type,
          preset: geometry.preset,
          hasCustomGeometry: geometry.isCustom,
          fillType: fill.type,
          borderType: border.type,
          effects: effects.effects
        }
      };

    } catch (error) {
      console.warn('Error parsing shape component:', error);
      return null;
    }
  }

  /**
   * Parse shape geometry information
   * @param {Object} spPr - Shape properties
   * @returns {Object} geometry info
   */
  static parseGeometry(spPr) {
    // Check for preset geometry
    const prstGeom = this.safeGet(spPr, 'a:prstGeom');
    if (prstGeom) {
      const preset = prstGeom.$prst;
      return {
        type: this.getShapeTypeName(preset),
        preset: preset,
        isCustom: false
      };
    }

    // Check for custom geometry
    const custGeom = this.safeGet(spPr, 'a:custGeom');
    if (custGeom) {
      return {
        type: 'custom',
        preset: null,
        isCustom: true,
        paths: this.parseCustomGeometry(custGeom)
      };
    }

    return {
      type: 'rectangle',
      preset: 'rect',
      isCustom: false
    };
  }

  /**
   * Get human-readable shape type name from preset
   * @param {string} preset - PowerPoint preset name
   * @returns {string} readable shape type
   */
  static getShapeTypeName(preset) {
    const shapeTypes = {
      'rect': 'rectangle',
      'roundRect': 'rounded rectangle',
      'ellipse': 'ellipse',
      'triangle': 'triangle',
      'rtTriangle': 'right triangle',
      'parallelogram': 'parallelogram',
      'trapezoid': 'trapezoid',
      'diamond': 'diamond',
      'pentagon': 'pentagon',
      'hexagon': 'hexagon',
      'octagon': 'octagon',
      'star4': '4-point star',
      'star5': '5-point star',
      'star6': '6-point star',
      'star8': '8-point star',
      'star10': '10-point star',
      'star12': '12-point star',
      'star16': '16-point star',
      'star24': '24-point star',
      'star32': '32-point star',
      'plus': 'plus',
      'minus': 'minus',
      'mult': 'multiply',
      'div': 'divide',
      'equal': 'equal',
      'notEqual': 'not equal',
      'line': 'line',
      'lineInv': 'inverted line',
      'round1Rect': 'single rounded corner rectangle',
      'round2SameRect': 'same-side rounded corners rectangle',
      'round2DiagRect': 'diagonal rounded corners rectangle',
      'snipRoundRect': 'snip and round rectangle',
      'snip1Rect': 'single snipped corner rectangle',
      'snip2SameRect': 'same-side snipped corners rectangle',
      'snip2DiagRect': 'diagonal snipped corners rectangle',
      'plaque': 'plaque',
      'teardrop': 'teardrop',
      'homePlate': 'home plate',
      'chevron': 'chevron',
      'pieWedge': 'pie wedge',
      'pie': 'pie',
      'blockArc': 'block arc',
      'donut': 'donut',
      'noSmoking': 'no smoking',
      'rightArrow': 'right arrow',
      'leftArrow': 'left arrow',
      'upArrow': 'up arrow',
      'downArrow': 'down arrow',
      'stripedRightArrow': 'striped right arrow',
      'notchedRightArrow': 'notched right arrow',
      'bentUpArrow': 'bent up arrow',
      'leftRightArrow': 'left right arrow',
      'upDownArrow': 'up down arrow',
      'leftUpArrow': 'left up arrow',
      'leftRightUpArrow': 'left right up arrow',
      'quadArrow': 'quad arrow',
      'callout1': 'callout',
      'callout2': 'callout 2',
      'callout3': 'callout 3',
      'accentCallout1': 'accent callout',
      'accentCallout2': 'accent callout 2',
      'accentCallout3': 'accent callout 3',
      'borderCallout1': 'border callout',
      'borderCallout2': 'border callout 2',
      'borderCallout3': 'border callout 3',
      'accentBorderCallout1': 'accent border callout',
      'accentBorderCallout2': 'accent border callout 2',
      'accentBorderCallout3': 'accent border callout 3',
      'ribbon': 'ribbon',
      'ribbon2': 'ribbon 2',
      'verticalScroll': 'vertical scroll',
      'horizontalScroll': 'horizontal scroll',
      'wave': 'wave',
      'doubleWave': 'double wave'
    };

    return shapeTypes[preset] || preset || 'shape';
  }

  /**
   * Parse fill properties
   * @param {Object} spPr - Shape properties
   * @param {Object} style - Style properties (optional)
   * @returns {Object} fill information
   */
  static parseFill(spPr, style = null) {
    // First check for direct SRGB colors in spPr (highest priority)
    const solidFill = this.safeGet(spPr, 'a:solidFill');
    if (solidFill) {
      return {
        type: 'solid',
        color: this.parseColor(solidFill),
        opacity: this.parseOpacity(solidFill)
      };
    }

    // Gradient fill
    const gradFill = this.safeGet(spPr, 'a:gradFill');
    if (gradFill) {
      return this.parseGradientFill(gradFill);
    }

    // Pattern fill
    const pattFill = this.safeGet(spPr, 'a:pattFill');
    if (pattFill) {
      return {
        type: 'pattern',
        color: this.parseColor(pattFill),
        opacity: 1
      };
    }

    // No fill
    if (this.safeGet(spPr, 'a:noFill')) {
      return {
        type: 'none',
        color: 'transparent',
        opacity: 0
      };
    }

    // Try to get fill from style element as fallback
    if (style) {
      const styleFill = this.parseFillFromStyle(style);
      if (styleFill) return styleFill;
    }

    // Default fill
    return {
      type: 'solid',
      color: '#FFFFFF',
      opacity: 1
    };
  }

  /**
   * Parse border/line properties
   * @param {Object} spPr - Shape properties
   * @param {Object} style - Style properties (optional)
   * @returns {Object} border information
   */
  static parseBorder(spPr, style = null) {
    // First check for direct border/line definitions in spPr
    const ln = this.safeGet(spPr, 'a:ln');
    if (!ln) {
      // Try to get border from style element as fallback
      if (style) {
        const styleBorder = this.parseBorderFromStyle(style);
        if (styleBorder) return styleBorder;
      }
      
      return {
        type: 'none',
        color: 'transparent',
        width: 0,
        style: 'none'
      };
    }

    // Line width (in EMUs)
    const width = ln.$ && ln.$w ? this.emuToPixels(parseInt(ln.$w)) : 1;
    
    // Line style
    const compound = ln.$ && ln.$cmpd || 'sng';
    const cap = ln.$ && ln.$cap || 'flat';
    
    // Line color
    let color = '#000000';
    const solidFill = this.safeGet(ln, 'a:solidFill');
    if (solidFill) {
      color = this.parseColor(solidFill);
    }

    // Dash pattern
    const dashStyle = this.parseDashStyle(ln);

    return {
      type: 'solid',
      color: color,
      width: width,
      style: dashStyle,
      cap: cap,
      compound: compound
    };
  }

  /**
   * Parse dash style from line properties
   * @param {Object} ln - Line properties
   * @returns {string} CSS border-style value
   */
  static parseDashStyle(ln) {
    const prstDash = this.safeGet(ln, 'a:prstDash.$val');
    if (!prstDash) return 'solid';

    switch (prstDash) {
      case 'dash': return 'dashed';
      case 'dashDot': return 'dashed';
      case 'dot': return 'dotted';
      case 'lgDash': return 'dashed';
      case 'lgDashDot': return 'dashed';
      case 'lgDashDotDot': return 'dashed';
      case 'solid':
      default: return 'solid';
    }
  }

  /**
   * Parse gradient fill
   * @param {Object} gradFill - Gradient fill properties
   * @returns {Object} gradient information
   */
  static parseGradientFill(gradFill) {
    // For now, return the first gradient stop color
    // In the future, this could return full gradient information
    const gsLst = this.safeGet(gradFill, 'a:gsLst.a:gs');
    if (gsLst && gsLst.length > 0) {
      const firstStop = gsLst;
      const solidFill = this.safeGet(firstStop, 'a:solidFill');
      if (solidFill) {
        return {
          type: 'gradient',
          color: this.parseColor(solidFill),
          opacity: this.parseOpacity(solidFill)
        };
      }
    }

    return {
      type: 'gradient',
      color: '#FFFFFF',
      opacity: 1
    };
  }

  /**
   * Parse opacity from fill properties
   * @param {Object} fill - Fill properties
   * @returns {number} opacity (0-1)
   */
  static parseOpacity(fill) {
    // Alpha values in PowerPoint are often in the color definition
    // This is a simplified implementation
    return 1;
  }

  /**
   * Parse shape effects (shadows, glows, etc.)
   * @param {Object} spPr - Shape properties
   * @returns {Object} effects information
   */
  static parseEffects(spPr) {
    const effects = {
      effects: []
    };

    // Outer shadow
    const outerShdw = this.safeGet(spPr, 'a:effectLst.a:outerShdw');
    if (outerShdw) {
      const blur = outerShdw.$blurRad ? this.emuToPixels(parseInt(outerShdw.$blurRad)) : 0;
      const distance = outerShdw.$dist ? this.emuToPixels(parseInt(outerShdw.$dist)) : 0;
      const direction = outerShdw.$dir ? parseInt(outerShdw.$dir) / 60000 : 0; // Convert to degrees
      
      effects.boxShadow = `${distance * Math.cos(direction * Math.PI / 180)}px ${distance * Math.sin(direction * Math.PI / 180)}px ${blur}px rgba(0,0,0,0.3)`;
      effects.effects.push('shadow');
    }

    // Glow
    const glow = this.safeGet(spPr, 'a:effectLst.a:glow');
    if (glow) {
      effects.effects.push('glow');
    }

    return effects;
  }

  /**
   * Parse custom geometry paths
   * @param {Object} custGeom - Custom geometry
   * @returns {Array} simplified path information
   */
  static parseCustomGeometry(custGeom) {
    // This is a complex topic - for now return empty array
    // In the future, this could parse path commands
    return [];
  }

  /**
   * Parse fill properties from style element
   * @param {Object} style - Style properties
   * @returns {Object|null} fill information or null
   */
  static parseFillFromStyle(style) {
    // Look for fill reference in style
    const fillRef = this.safeGet(style, 'a:fillRef');
    if (fillRef) {
      // Get the color from the scheme color or override
      const schemeClr = this.safeGet(fillRef, 'a:schemeClr');
      const srgbClr = this.safeGet(fillRef, 'a:srgbClr');
      
      if (srgbClr && srgbClr.$val) {
        return {
          type: 'solid',
          color: '#' + srgbClr.$val,
          opacity: 1
        };
      }
      
      // Handle scheme colors - basic mapping
      if (schemeClr && schemeClr.$val) {
        let color = this.parseSchemeColor(schemeClr.$val);
        
        // Note: Removed hardcoded color override to use consistent scheme colors
        
        if (color) {
          return {
            type: 'solid',
            color: color,
            opacity: 1
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Parse border properties from style element
   * @param {Object} style - Style properties
   * @returns {Object|null} border information or null
   */
  static parseBorderFromStyle(style) {
    // Look for line reference in style
    const lnRef = this.safeGet(style, 'a:lnRef');
    if (lnRef) {
      // Use safe default: only create borders for explicit color definitions
      // If there's no explicit color, treat as no border
      // Get the color from the scheme color or override
      const schemeClr = this.safeGet(lnRef, 'a:schemeClr');
      const srgbClr = this.safeGet(lnRef, 'a:srgbClr');
      
      // Only create borders for explicit RGB colors (most reliable)
      if (srgbClr && srgbClr.$val) {
        return {
          type: 'solid',
          color: '#' + srgbClr.$val,
          width: 1, // Default width
          style: 'solid'
        };
      }
      
      // For scheme colors, use safe default of no border unless it's a very clear case
      // This avoids theme interpretation issues
      if (schemeClr && schemeClr.$val) {
        // Only create borders for explicit dark colors that are clearly intended as borders
        if (schemeClr.$val === 'dk1' || schemeClr.$val === 'tx1') {
          return {
            type: 'solid',
            color: '#000000',
            width: 1,
            style: 'solid'
          };
        }
        
        // For all other scheme colors (including accent colors), use safe default of no border
        // This prevents theme interpretation issues
        return {
          type: 'none',
          color: 'transparent',
          width: 0,
          style: 'none'
        };
      }
    }
    
    return null;
  }

  /**
   * Apply shade to a color (makes it darker)
   * @param {string} color - Hex color (e.g., '#4472C4')
   * @param {number} shadeVal - Shade value (percentage, e.g., 50000 = 50%)
   * @returns {string} modified hex color
   */
  static applyShade(color, shadeVal) {
    if (!color || !color.startsWith('#')) return color;
    
    // Convert shade value from PowerPoint format (50000 = 50%) to percentage
    const shadePercent = Math.min(100, Math.max(0, shadeVal / 1000)) / 100;
    
    // Convert hex to RGB
    const hex = color.slice(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Apply shade (darken by reducing each component)
    const shadedR = Math.round(r * (1 - shadePercent));
    const shadedG = Math.round(g * (1 - shadePercent));
    const shadedB = Math.round(b * (1 - shadePercent));
    
    // Convert back to hex
    const toHex = (n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
    return `#${toHex(shadedR)}${toHex(shadedG)}${toHex(shadedB)}`.toUpperCase();
  }

  /**
   * Parse scheme color to hex value
   * @param {string} scheme - Scheme color name
   * @returns {string|null} hex color or null
   */
  static parseSchemeColor(scheme) {
    // Default Office scheme color mappings
    const schemeColors = {
      'accent1': '#4472C4', // Blue
      'accent2': '#E7E6E6', // Light Gray
      'accent3': '#A5A5A5', // Gray
      'accent4': '#FFC000', // Orange
      'accent5': '#5B9BD5', // Light Blue
      'accent6': '#70AD47', // Green
      'bg1': '#FFFFFF',     // White
      'bg2': '#F2F2F2',     // Light Gray
      'tx1': '#000000',     // Black
      'tx2': '#44546A',     // Dark Blue
      'dk1': '#000000',     // Black
      'dk2': '#44546A',     // Dark Blue
      'lt1': '#FFFFFF',     // White
      'lt2': '#F2F2F2'      // Light Gray
    };
    
    return schemeColors[scheme] || null;
  }

  /**
   * Check if a shape should be parsed as a shape (not text)
   * @param {Object} shape - Shape data
   * @returns {boolean} true if shape should be parsed as shape
   */
  static isShape(shape) {
    // Has shape properties but no meaningful text content
    const spPr = this.safeGet(shape, 'p:spPr');
    const textBody = this.safeGet(shape, 'p:txBody');
    
    if (!spPr) return false;
    
    // If no text body, it's definitely a shape
    if (!textBody) return true;
    
    // If has text content, it should be parsed as text, not shape
    const textContent = this.extractTextContent(textBody);
    return !textContent.trim();
  }
}