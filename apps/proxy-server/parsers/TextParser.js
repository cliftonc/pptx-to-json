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
      // Check if shape has text content
      const textBody = this.safeGet(shape, 'p:txBody.0');
      if (!textBody) return null;

      const textContent = this.extractTextContent(textBody);
      if (!textContent.trim()) return null;

      // Extract rich text structure for tldraw
      const richTextContent = this.extractRichTextContent(textBody);

      // Get transform information
      const spPr = this.safeGet(shape, 'p:spPr.0');
      const xfrm = this.safeGet(spPr, 'a:xfrm.0');
      const transform = this.parseTransform(xfrm);

      // Parse text styling from first text run
      const firstRun = this.safeGet(textBody, 'a:p.0.a:r.0');
      const rPr = this.safeGet(firstRun, 'a:rPr.0');
      const font = this.parseFont(rPr);

      // Get paragraph-level properties
      const pPr = this.safeGet(textBody, 'a:p.0.a:pPr.0');
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
          fontSize: font.size,
          fontFamily: font.family,
          fontWeight: font.weight,
          fontStyle: font.style,
          textDecoration: font.decoration,
          color: font.color,
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
    if (!pPr?.$.algn) return 'left';

    const alignment = pPr.$.algn;
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
    const phType = this.safeGet(shape, 'p:nvSpPr.0.p:nvPr.0.p:ph.0.$.type');
    if (phType === 'title' || phType === 'ctrTitle') {
      return true;
    }

    // Heuristic: short text with larger font size
    if (content.length < 100) {
      const firstRun = this.safeGet(shape, 'p:txBody.0.a:p.0.a:r.0');
      const fontSize = this.safeGet(firstRun, 'a:rPr.0.$.sz');
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
    return paragraphs.some(p => this.safeGet(p, 'a:r', []).length > 1);
  }

  /**
   * Get shape type from shape properties
   * @param {Object} spPr - Shape properties
   * @returns {string} shape type
   */
  static getShapeType(spPr) {
    const preset = this.safeGet(spPr, 'a:prstGeom.0.$.prst');
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
    const solidFill = this.safeGet(spPr, 'a:solidFill.0');
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
          const rPr = this.safeGet(run, 'a:rPr.0');
          const font = this.parseFont(rPr);
          const text = this.safeGet(run, 'a:t.0', '');

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
    const textBody = this.safeGet(shape, 'p:txBody.0');
    if (!textBody) return false;

    const textContent = this.extractTextContent(textBody);
    return textContent.trim().length > 0;
  }
}