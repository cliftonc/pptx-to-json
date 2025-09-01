/**
 * Text component parser for PowerPoint shapes containing text
 */

import { BaseParser } from './BaseParser.js';

export class TextParser extends BaseParser {

  /**
   * Parse text component from normalized data (works for both PPTX and clipboard)
   * @param {Object} textComponent - Normalized text component
   * @param {number} componentIndex - Component index
   * @param {number} slideIndex - Slide index
   * @returns {Promise<Object>} - Parsed text component
   */
  static async parseFromNormalized(textComponent, componentIndex, slideIndex) {
    const { textBody, spPr, nvSpPr, namespace } = textComponent;
    
    if (!textBody) {
      throw new Error('No textBody found in normalized text component');
    }

    // Extract text content using existing method
    const textContent = this.extractTextContent(textBody);
    if (!textContent.trim()) return null;

    // Extract rich text structure using existing method
    const richTextContent = this.extractRichTextContent(textBody);

    // Extract positioning from spPr (namespace-agnostic)
    const xfrm = this.safeGet(spPr, 'a:xfrm');
    const transform = this.parseTransform(xfrm);

    // Extract component info from nvSpPr
    const cNvPr = this.safeGet(nvSpPr, 'a:cNvPr') || this.safeGet(nvSpPr, 'p:cNvPr');
    const componentName = this.safeGet(cNvPr, '$name') || `text-${componentIndex}`;
    const isTextBox = !!this.safeGet(nvSpPr, 'a:cNvSpPr.$txBox') || !!this.safeGet(nvSpPr, 'p:cNvSpPr.$txBox');

    // Extract dominant font styling using existing method
    const paragraphs = this.safeGet(textBody, 'a:p', []);
    const paragraphsArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    let dominantFont = { family: 'Arial', size: 18, weight: 'normal', style: 'normal', color: '#000000' };
    
    // Find first non-empty run with formatting
    for (const paragraph of paragraphsArray) {
      if (paragraph?.['a:r']) {
        const runs = Array.isArray(paragraph['a:r']) ? paragraph['a:r'] : [paragraph['a:r']];
        for (const run of runs) {
          const text = this.safeGet(run, 'a:t');
          if (text && text.trim()) {
            const rPr = this.safeGet(run, 'a:rPr');
            if (rPr) {
              dominantFont = this.parseFont(rPr);
              break;
            }
          }
        }
        if (dominantFont.family !== 'Arial') break;
      }
    }

    return {
      id: componentName,
      type: 'text',
      content: textContent,
      x: transform.x,
      y: transform.y,
      width: transform.width,
      height: transform.height,
      rotation: transform.rotation || 0,
      slideIndex,
      style: {
        fontSize: dominantFont.size,
        fontFamily: dominantFont.family,
        fontWeight: dominantFont.weight,
        fontStyle: dominantFont.style,
        textDecoration: dominantFont.decoration,
        color: dominantFont.color,
        backgroundColor: 'transparent', // Text components don't have background by default
        textAlign: 'left',
        opacity: 1
      },
      richText: richTextContent,
      metadata: {
        namespace,
        isTextBox,
        originalFormat: 'normalized',
        paragraphCount: paragraphsArray.length,
        hasMultipleRuns: paragraphsArray.some(p => Array.isArray(p['a:r']))
      }
    };
  }








}