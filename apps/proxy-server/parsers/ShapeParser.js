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
      const spPr = this.safeGet(shape, 'p:spPr.0');
      if (!spPr) return null;

      // Get transform information
      const xfrm = this.safeGet(spPr, 'a:xfrm.0');
      const transform = this.parseTransform(xfrm);

      // Skip if shape has no dimensions
      if (transform.width === 0 && transform.height === 0) return null;

      // Parse shape geometry
      const geometry = this.parseGeometry(spPr);
      
      // Parse fill properties
      const fill = this.parseFill(spPr);
      
      // Parse line/border properties
      const border = this.parseBorder(spPr);

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
    const prstGeom = this.safeGet(spPr, 'a:prstGeom.0');
    if (prstGeom) {
      const preset = prstGeom.$.prst;
      return {
        type: this.getShapeTypeName(preset),
        preset: preset,
        isCustom: false
      };
    }

    // Check for custom geometry
    const custGeom = this.safeGet(spPr, 'a:custGeom.0');
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
      'triangle': 'triangle',
      'rtTriangle': 'right triangle',
      'rect': 'rectangle',
      'round1Rect': 'single rounded corner rectangle',
      'round2SameRect': 'same-side rounded corners rectangle',
      'round2DiagRect': 'diagonal rounded corners rectangle',
      'snipRoundRect': 'snip and round rectangle',
      'snip1Rect': 'single snipped corner rectangle',
      'snip2SameRect': 'same-side snipped corners rectangle',
      'snip2DiagRect': 'diagonal snipped corners rectangle',
      'plaque': 'plaque',
      'ellipse': 'ellipse',
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
   * @returns {Object} fill information
   */
  static parseFill(spPr) {
    // Solid fill
    const solidFill = this.safeGet(spPr, 'a:solidFill.0');
    if (solidFill) {
      return {
        type: 'solid',
        color: this.parseColor(solidFill),
        opacity: this.parseOpacity(solidFill)
      };
    }

    // Gradient fill
    const gradFill = this.safeGet(spPr, 'a:gradFill.0');
    if (gradFill) {
      return this.parseGradientFill(gradFill);
    }

    // Pattern fill
    const pattFill = this.safeGet(spPr, 'a:pattFill.0');
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
   * @returns {Object} border information
   */
  static parseBorder(spPr) {
    const ln = this.safeGet(spPr, 'a:ln.0');
    if (!ln) {
      return {
        type: 'none',
        color: 'transparent',
        width: 0,
        style: 'none'
      };
    }

    // Line width (in EMUs)
    const width = ln.$.w ? this.emuToPixels(parseInt(ln.$.w)) : 1;
    
    // Line style
    const compound = ln.$.cmpd || 'sng';
    const cap = ln.$.cap || 'flat';
    
    // Line color
    let color = '#000000';
    const solidFill = this.safeGet(ln, 'a:solidFill.0');
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
    const prstDash = this.safeGet(ln, 'a:prstDash.0.$.val');
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
    const gsLst = this.safeGet(gradFill, 'a:gsLst.0.a:gs');
    if (gsLst && gsLst.length > 0) {
      const firstStop = gsLst[0];
      const solidFill = this.safeGet(firstStop, 'a:solidFill.0');
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
    const outerShdw = this.safeGet(spPr, 'a:effectLst.0.a:outerShdw.0');
    if (outerShdw) {
      const blur = outerShdw.$.blurRad ? this.emuToPixels(parseInt(outerShdw.$.blurRad)) : 0;
      const distance = outerShdw.$.dist ? this.emuToPixels(parseInt(outerShdw.$.dist)) : 0;
      const direction = outerShdw.$.dir ? parseInt(outerShdw.$.dir) / 60000 : 0; // Convert to degrees
      
      effects.boxShadow = `${distance * Math.cos(direction * Math.PI / 180)}px ${distance * Math.sin(direction * Math.PI / 180)}px ${blur}px rgba(0,0,0,0.3)`;
      effects.effects.push('shadow');
    }

    // Glow
    const glow = this.safeGet(spPr, 'a:effectLst.0.a:glow.0');
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
   * Check if a shape should be parsed as a shape (not text)
   * @param {Object} shape - Shape data
   * @returns {boolean} true if shape should be parsed as shape
   */
  static isShape(shape) {
    // Has shape properties but no meaningful text content
    const spPr = this.safeGet(shape, 'p:spPr.0');
    const textBody = this.safeGet(shape, 'p:txBody.0');
    
    if (!spPr) return false;
    
    // If no text body, it's definitely a shape
    if (!textBody) return true;
    
    // If has text content, it should be parsed as text, not shape
    const textContent = this.extractTextContent(textBody);
    return !textContent.trim();
  }
}