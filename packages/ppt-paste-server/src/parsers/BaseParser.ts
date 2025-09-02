/**
 * Base parser utilities for PowerPoint component parsing
 */

import { emuToPixels, emuToPoints, validatePixelRange } from '../utils/constants.js';
import { ComponentStyle, XMLNode, TextRun } from '../types/index.js';

// Worker-compatible utility functions
export function isBufferLike(obj: any): boolean {
  return obj && (obj instanceof Uint8Array || obj instanceof ArrayBuffer || 
    (typeof Buffer !== 'undefined' && Buffer.isBuffer && Buffer.isBuffer(obj)));
}

export function bufferFrom(data: any): Uint8Array | Buffer {
  if (typeof Buffer !== 'undefined' && Buffer.from) {
    return Buffer.from(data);
  }
  return new Uint8Array(data);
}

// Font information interface
export interface FontInfo extends ComponentStyle {
  family: string;
  size: number;
  weight: string;
  style: string;
  decoration: string;
  color: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isSuperscript: boolean;
  isSubscript: boolean;
  isStrikethrough: boolean;
}

// Transform information interface
export interface TransformInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export class BaseParser {
  /**
   * Convert EMU (English Metric Units) to pixels using centralized utility
   * @param emu - EMU value
   * @returns pixels
   * @deprecated Use emuToPixels from constants.js directly
   */
  static emuToPixels(emu: number): number {
    return emuToPixels(emu);
  }

  /**
   * Convert EMU to points using centralized utility
   * @param emu - EMU value
   * @returns points
   * @deprecated Use emuToPoints from constants.js directly
   */
  static emuToPoints(emu: number): number {
    return emuToPoints(emu);
  }

  /**
   * Convert PowerPoint font size units to points
   * PowerPoint uses hundreds of a point (1 point = 100 units)
   * @param sz - PowerPoint font size
   * @returns points
   */
  static fontSizeToPoints(sz: number | null | undefined): number {
    if (!sz || typeof sz !== 'number') return 12; // Default font size
    return sz / 100;
  }

  /**
   * Parse color from PowerPoint color definition
   * @param colorDef - Color definition from PowerPoint XML
   * @returns hex color (#rrggbb)
   */
  static parseColor(colorDef: XMLNode | null | undefined): string {
    if (!colorDef) return '#000000';

    // Direct RGB color
    if (colorDef['srgbClr']) {
      const val = colorDef['srgbClr'].$val;
      if (val) return `#${val}`;
    }

    // System color
    if (colorDef['sysClr']) {
      const lastClr = colorDef['sysClr'].$lastClr;
      if (lastClr) return `#${lastClr}`;
    }

    // Scheme color (theme colors) - map to reasonable defaults
    if (colorDef['schemeClr']) {
      const val = colorDef['schemeClr'].$val;
      const schemeColors: Record<string, string> = {
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
   * @param xfrm - Transform object from PowerPoint
   * @returns transform data
   */
  static parseTransform(xfrm: XMLNode | null | undefined): TransformInfo {
    const result: TransformInfo = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      rotation: 0
    };

    if (!xfrm) return result;

    // Position offset
    if (xfrm['off']) {
      const off = xfrm['off'];
      if (off) {
        result.x = this.emuToPixels(parseInt(off.$x || 0));
        result.y = this.emuToPixels(parseInt(off.$y || 0));
      }
    }

    // Size extents
    if (xfrm['ext']) {
      const ext = xfrm['ext'];
      if (ext) {
        result.width = this.emuToPixels(parseInt(ext.$cx || 0));
        result.height = this.emuToPixels(parseInt(ext.$cy || 0));
      }
    }

    // Rotation (in 60000ths of a degree)
    if (xfrm.$rot) {
      result.rotation = parseInt(xfrm.$rot) / 60000;
    }

    // Validate that we're returning pixel values, not EMU
    validatePixelRange(result.x, 'transform x');
    validatePixelRange(result.y, 'transform y');
    validatePixelRange(result.width, 'transform width');
    validatePixelRange(result.height, 'transform height');

    return result;
  }

  /**
   * Check if paragraph properties indicate bullet formatting
   * @param pPr - Paragraph properties from PowerPoint XML
   * @returns true if paragraph has bullet formatting
   */
  static hasBulletFormatting(pPr: XMLNode | null | undefined): boolean {
    if (!pPr) return false;
    
    // Check for bullet number properties
    if (pPr['buNum'] || pPr['buChar']) {
      return true;
    }
    
    // Check for list properties
    if (pPr['lvl'] && pPr['lvl'] !== '0') {
      return true;
    }
    
    // Check for bullet fonts or autonum
    if (pPr['buAutoNum'] || pPr['buFont']) {
      return true;
    }
    
    return false;
  }

  /**
   * Extract text content from PowerPoint text elements
   * @param textBody - Text body object from PowerPoint
   * @returns combined text content
   */
  static extractTextContent(textBody: XMLNode | null | undefined): string {
    if (!textBody || !textBody['p']) return '';

    // Handle both array and single paragraph formats
    const paragraphs = Array.isArray(textBody['p']) ? textBody['p'] : [textBody['p']];
    const textParts: string[] = [];

    paragraphs.forEach((paragraph, pIndex) => {
      let paragraphText = '';
      
      // Check for bullet formatting in paragraph properties
      const pPr = this.safeGet(paragraph, 'pPr');
      const hasBullet = this.hasBulletFormatting(pPr);
      
      if (paragraph['r']) {
        // Handle both array and single run formats
        const runs = Array.isArray(paragraph['r']) ? paragraph['r'] : [paragraph['r']];
        runs.forEach(run => {
          if (run['t']) {
            // In fast-xml-parser, text is directly a string, not an array
            const text = run['t'];
            if (typeof text === 'string') {
              paragraphText += text;
            } else if (text._ && typeof text._ === 'string') {
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
   * Extract font information from text run properties
   * @param rPr - Run properties from PowerPoint
   * @returns font information
   */
  static parseFont(rPr: XMLNode | null | undefined): FontInfo {
    const font: FontInfo = {
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
    if (rPr['latin']) {
      font.family = rPr['latin'].$typeface || font.family;
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
    if (rPr['solidFill']) {
      font.color = this.parseColor(rPr['solidFill']);
    }

    return font;
  }

  /**
   * Generate unique component ID
   * @param type - Component type
   * @param index - Component index
   * @returns unique ID
   */
  static generateId(type: string, index: number): string {
    return `${type}-${Date.now()}-${index}`;
  }

  /**
   * Fix spacing between text runs that may have been lost during PowerPoint parsing
   * @param textRuns - Array of text run objects
   * @returns Fixed text runs with proper spacing
   */
  static fixSpacingInTextRuns(textRuns: TextRun[]): TextRun[] {
    if (!textRuns || textRuns.length <= 1) return textRuns;
    
    const fixedRuns: TextRun[] = [];
    
    for (let i = 0; i < textRuns.length; i++) {
      const currentRun = textRuns[i];
      const nextRun = textRuns[i + 1];
      
      fixedRuns.push(currentRun);
      
      // Check if we need to add a space between this run and the next
      if (nextRun && this.shouldAddSpaceBetweenRuns(currentRun, nextRun)) {
        // Add a space as a separate text run
        fixedRuns.push({
          text: ' '
        });
      }
    }
    
    return fixedRuns;
  }
  
  /**
   * Determine if a space should be added between two text runs
   * @param run1 - First text run
   * @param run2 - Second text run  
   * @returns true if space should be added
   */
  static shouldAddSpaceBetweenRuns(run1: TextRun, run2: TextRun): boolean {
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
   * @param obj - Object to access
   * @param path - Dot-notation path
   * @param defaultValue - Default value if path doesn't exist
   * @returns value or default
   */
  static safeGet<T = any>(obj: any, path: string, defaultValue: T | null = null): T | null {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj) ?? defaultValue;
    } catch (error) {
      return defaultValue;
    }
  }
}