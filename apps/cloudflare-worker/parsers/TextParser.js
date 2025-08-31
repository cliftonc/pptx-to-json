/**
 * Text component parser for PowerPoint shapes containing text
 */

import { BaseParser } from './BaseParser.js';

export class TextParser extends BaseParser {
  /**
   * Parse a text component from PowerPoint shape data
   * @param {Object} shape - Shape data from PowerPoint JSON
   * @param {number} index - Component index for ID generation
   * @returns {Object|null} parsed text component
   */
  static parse(shape, index = 0) {    
    try {
      // Check if shape has text content (clipboard format uses a:txSp.a:txBody)
      const textBody = this.safeGet(shape, 'a:txSp.a:txBody') || this.safeGet(shape, 'p:txBody');
      if (!textBody) return null;

      const textContent = this.extractTextContent(textBody);
      if (!textContent.trim()) return null;

      // Extract rich text structure for tldraw
      const richTextContent = this.extractRichTextContent(textBody);

      // Get transform information (clipboard format uses a:spPr)
      const spPr = this.safeGet(shape, 'a:spPr') || this.safeGet(shape, 'p:spPr');
      const xfrm = this.safeGet(spPr, 'a:xfrm');
      const transform = this.parseTransform(xfrm);

      // Determine dominant formatting from actual text runs for component-level styling
      const paragraphs = this.safeGet(textBody, 'a:p', []);
      const paragraphsArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
      const firstParagraph = paragraphsArray[0];
      const pPr = this.safeGet(firstParagraph, 'a:pPr');
      
      // Find the dominant styling by looking at the first non-empty run
      let dominantFont = { family: 'Arial', size: 18, weight: 'normal', style: 'normal', color: '#000000' };
      
      // Look through all runs to find first one with actual formatting
      for (const paragraph of paragraphsArray) {
        if (paragraph?.['a:r']) {
          const runs = Array.isArray(paragraph['a:r']) ? paragraph['a:r'] : [paragraph['a:r']];
          for (const run of runs) {
            const text = this.safeGet(run, 'a:t');
            if (text && text.trim()) { // Only consider non-empty runs
              const rPr = this.safeGet(run, 'a:rPr');
              if (rPr) {
                dominantFont = this.parseFont(rPr);
                break;
              }
            }
          }
          if (dominantFont.family !== 'Arial' || dominantFont.size !== 18) break; // Found styling
        }
      }
      
      // Fall back to list style defaults if no run formatting found
      if (dominantFont.family === 'Arial' && dominantFont.size === 18) {
        const lstStyle = this.safeGet(textBody, 'a:lstStyle.a:lvl1pPr.a:defRPr') || 
                        this.safeGet(textBody, 'a:lstStyle.a:defPPr.a:defRPr');
        if (lstStyle) {
          const listFont = this.parseFont(lstStyle);
          // Merge with any found formatting
          dominantFont.family = listFont.family || dominantFont.family;
          dominantFont.size = listFont.size || dominantFont.size;
          dominantFont.color = listFont.color || dominantFont.color;
        }
      }
      const alignment = this.parseAlignment(pPr);

      // Determine if it's a title or regular text
      const isTitle = this.isTitle(shape, textContent);

      // Background color from shape properties
      const backgroundColor = this.parseBackgroundColor(spPr);

      return {
        id: this.generateId('text', index),
        type: 'text',
        x: transform.x,
        y: transform.y,
        width: transform.width,
        height: transform.height,
        rotation: transform.rotation,
        content: textContent,
        richText: richTextContent,
        style: {
          fontSize: dominantFont.size,
          fontFamily: dominantFont.family,
          fontWeight: dominantFont.weight,
          fontStyle: dominantFont.style,
          textDecoration: dominantFont.decoration,
          color: dominantFont.color,
          backgroundColor: backgroundColor,
          textAlign: alignment,
          opacity: 1
        },
        metadata: {
          isTitle: isTitle,
          paragraphCount: this.safeGet(textBody, 'a:p', []).length,
          hasMultipleRuns: this.hasMultipleTextRuns(textBody),
          shapeType: this.getShapeType(spPr),
          hasBullets: richTextContent && richTextContent.content && 
                     richTextContent.content.some(item => item.type === 'bulletList')
        }
      };

    } catch (error) {
      console.warn('Error parsing text component:', error);
      return null;
    }
  }

  /**
   * Parse text alignment from paragraph properties
   * @param {Object} pPr - Paragraph properties
   * @returns {string} CSS text-align value
   */
  static parseAlignment(pPr) {
    if (!pPr?.$algn) return 'left';

    const alignment = pPr.$algn;
    switch (alignment) {
      case 'ctr': return 'center';
      case 'r': return 'right';
      case 'just': return 'justify';
      case 'l':
      default: return 'left';
    }
  }

  /**
   * Determine if text is likely a title based on properties
   * @param {Object} shape - Shape data
   * @param {string} content - Text content
   * @returns {boolean} true if likely a title
   */
  static isTitle(shape, content) {
    // Check if placeholder type indicates title
    const phType = this.safeGet(shape, 'p:nvSpPr.p:nvPr.p:ph.$type');
    if (phType === 'title' || phType === 'ctrTitle') {
      return true;
    }

    // Heuristic: short text with larger font size
    if (content.length < 100) {
      const firstRun = this.safeGet(shape, 'p:txBody.a:p.a:r');
      const fontSize = this.safeGet(firstRun, 'a:rPr.$sz');
      if (fontSize && this.fontSizeToPoints(parseInt(fontSize)) > 18) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if text body has multiple runs with different formatting
   * @param {Object} textBody - Text body
   * @returns {boolean} true if multiple formatting runs exist
   */
  static hasMultipleTextRuns(textBody) {
    const paragraphs = this.safeGet(textBody, 'a:p', []);
    const paragraphsArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    return paragraphsArray.some(p => {
      const runs = this.safeGet(p, 'a:r', []);
      const runsArray = Array.isArray(runs) ? runs : [runs];
      return runsArray.length > 1;
    });
  }

  /**
   * Get shape type from shape properties
   * @param {Object} spPr - Shape properties
   * @returns {string} shape type
   */
  static getShapeType(spPr) {
    const preset = this.safeGet(spPr, 'a:prstGeom.$prst');
    return preset || 'rect';
  }

  /**
   * Parse background color from shape properties
   * @param {Object} spPr - Shape properties
   * @returns {string} background color or 'transparent'
   */
  static parseBackgroundColor(spPr) {
    if (!spPr) return 'transparent';

    // Solid fill
    const solidFill = this.safeGet(spPr, 'a:solidFill');
    if (solidFill) {
      return this.parseColor(solidFill);
    }

    // No fill
    if (this.safeGet(spPr, 'a:noFill')) {
      return 'transparent';
    }

    return 'transparent';
  }

  /**
   * Parse all text runs with individual formatting
   * @param {Object} textBody - Text body
   * @returns {Array} array of text runs with formatting
   */
  static parseTextRuns(textBody) {
    if (!textBody?.['a:p']) return [];

    const runs = [];
    textBody['a:p'].forEach((paragraph, pIndex) => {
      if (paragraph['a:r']) {
        paragraph['a:r'].forEach((run, rIndex) => {
          const rPr = this.safeGet(run, 'a:rPr');
          const font = this.parseFont(rPr);
          const text = this.safeGet(run, 'a:t', '');

          if (text) {
            runs.push({
              paragraphIndex: pIndex,
              runIndex: rIndex,
              text: typeof text === 'string' ? text : (text._ || ''),
              font: font
            });
          }
        });
      }
    });

    return runs;
  }

  /**
   * Check if a shape contains text content
   * @param {Object} shape - Shape data
   * @returns {boolean} true if shape has text
   */
  static hasTextContent(shape) {
    const textBody = this.safeGet(shape, 'p:txBody');
    if (!textBody) return false;

    const textContent = this.extractTextContent(textBody);
    return textContent.trim().length > 0;
  }
}