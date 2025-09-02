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

    // Extract positioning from spPr (namespace-agnostic since we stripped them)
    const xfrm = this.safeGet(spPr, 'xfrm');
    const transform = this.parseTransform(xfrm);

    // Extract component info from nvSpPr
    const cNvPr = this.safeGet(nvSpPr, 'cNvPr');
    const componentName = this.safeGet(cNvPr, '$name') || `text-${componentIndex}`;
    const isTextBox = !!this.safeGet(nvSpPr, 'cNvSpPr.$txBox');

    // Extract dominant font styling using existing method
    const paragraphs = this.safeGet(textBody, 'p', []);
    const paragraphsArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    let dominantFont = { family: 'Arial', size: 18, weight: 'normal', style: 'normal', color: '#000000' };
    
    // Find first non-empty run with formatting
    for (const paragraph of paragraphsArray) {
      if (paragraph?.['r']) {
        const runs = Array.isArray(paragraph['r']) ? paragraph['r'] : [paragraph['r']];
        for (const run of runs) {
          const text = this.safeGet(run, 't');
          if (text && text.trim()) {
            const rPr = this.safeGet(run, 'rPr');
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
        hasMultipleRuns: paragraphsArray.some(p => Array.isArray(p['r']))
      }
    };
  }

  /**
   * Extract plain text content from textBody
   * @param {Object} textBody - PowerPoint textBody element
   * @returns {string} - Extracted text content
   */
  static extractTextContent(textBody) {
    // Namespaces are already stripped
    const paragraphs = this.safeGet(textBody, 'p', []);
    const paragraphsArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    
    let allText = [];
    
    for (const paragraph of paragraphsArray) {
      let paragraphText = '';
      
      // Extract text from runs
      const runs = paragraph?.['r'];
      if (runs) {
        const runsArray = Array.isArray(runs) ? runs : [runs];
        for (const run of runsArray) {
          const text = this.safeGet(run, 't', '');
          paragraphText += text;
        }
      }
      
      // Extract text from fields
      const fields = paragraph?.['fld'];
      if (fields) {
        const fieldsArray = Array.isArray(fields) ? fields : [fields];
        for (const field of fieldsArray) {
          const text = this.safeGet(field, 't', '');
          paragraphText += text;
        }
      }
      
      if (paragraphText.trim()) {
        allText.push(paragraphText.trim());
      }
    }
    
    return allText.join('\n\n');
  }

  /**
   * Extract rich text content with bullet formatting
   * @param {Object} textBody - PowerPoint textBody element
   * @returns {Object} - Rich text structure compatible with TLDraw
   */
  static extractRichTextContent(textBody) {
    // Namespaces are already stripped
    const paragraphs = this.safeGet(textBody, 'p', []);
    const paragraphsArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    const lstStyle = this.safeGet(textBody, 'lstStyle');
    
    // Create simple paragraph structure - TLDraw handles bullets at paragraph level
    return this.createParagraphStructure(paragraphsArray, lstStyle);
  }

  /**
   * Create paragraph structure with nested bulletList elements
   * @param {Array} paragraphsArray - Array of paragraphs
   * @param {Object} lstStyle - PowerPoint list style
   * @returns {Object} - Rich text structure with paragraphs containing bulletLists
   */
  static createParagraphStructure(paragraphsArray, lstStyle) {
    const content = [];
    let currentBulletItems = [];
    let hasPendingBullets = false;
    
    const flushBullets = () => {
      if (currentBulletItems.length > 0) {
        // Create bulletList directly (not wrapped in paragraph)
        content.push({
          type: 'bulletList',
          content: currentBulletItems
        });
        currentBulletItems = [];
        hasPendingBullets = false;
      }
    };
    
    for (let paragraphIndex = 0; paragraphIndex < paragraphsArray.length; paragraphIndex++) {
      const paragraph = paragraphsArray[paragraphIndex];
      const paragraphContent = [];
      
      // Extract text content from runs (namespaces already stripped)
      const runs = paragraph?.['r'];
      if (runs) {
        const runsArray = Array.isArray(runs) ? runs : [runs];
        const validRuns = runsArray.filter(run => {
          const text = this.safeGet(run, 't', '');
          return text !== null && text !== undefined && text !== '';
        });
        
        for (let i = 0; i < validRuns.length; i++) {
          const run = validRuns[i];
          const text = this.safeGet(run, 't', '');
          const rPr = this.safeGet(run, 'rPr');
          
          const textNode = this.createTextNode(text, rPr);
          paragraphContent.push(textNode);
          
          // Add space between valid runs (except for the last run)
          if (i < validRuns.length - 1) {
            paragraphContent.push({
              type: 'text',
              text: ' '
            });
          }
        }
      }
      
      if (paragraphContent.length === 0) continue;
      
      const hasBulletInParagraph = this.paragraphHasBullets(paragraph, lstStyle, paragraphIndex, paragraphsArray.length);
      
      if (hasBulletInParagraph) {
        // This is a bullet item - add to current bullet list
        currentBulletItems.push({
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: paragraphContent
          }]
        });
        hasPendingBullets = true;
      } else {
        // This is regular text - flush any pending bullets first
        flushBullets();
        
        // Add as regular paragraph
        content.push({
          type: 'paragraph',
          content: paragraphContent
        });
      }
    }
    
    // Flush any remaining bullets
    flushBullets();
    
    return {
      type: 'doc',
      content
    };
  }

  /**
   * Check if a specific paragraph has bullet formatting
   * @param {Object} paragraph - Individual paragraph
   * @param {Object} lstStyle - PowerPoint list style
   * @param {number} paragraphIndex - Index of this paragraph in the text element
   * @param {number} totalParagraphs - Total number of paragraphs in the text element
   * @returns {boolean} - True if this paragraph has bullets
   */
  static paragraphHasBullets(paragraph, lstStyle, paragraphIndex = 0, totalParagraphs = 1) {
    // Namespaces already stripped
    const pPr = this.safeGet(paragraph, 'pPr');
    
    
    // Method 1: Check if paragraph explicitly disables bullets
    if (pPr) {
      const buNone = this.safeGet(pPr, 'buNone');
      if (buNone !== null && buNone !== undefined) {
        return false; // Explicitly no bullets
      }
    }
    
    // Method 2: Check paragraph properties directly for bullet characters
    if (pPr) {
      const buChar = this.safeGet(pPr, 'buChar');
      const buAutoNum = this.safeGet(pPr, 'buAutoNum');
      
      // Handle both patterns:
      // - Clipboard format: buChar exists and has content (e.g., "•")
      // - PPTX format: buChar exists but may be empty string for non-bullets
      if (buChar) {
        const buCharValue = this.safeGet(buChar, '$val') || this.safeGet(buChar, '_') || buChar;
        // If buChar has a non-empty value, it's a bullet
        if (buCharValue && buCharValue.toString().trim() !== '') {
          return true;
        }
        // If buChar exists but is empty, it explicitly disables bullets (PPTX pattern)
        return false;
      }
      
      if (buAutoNum) {
        return true;
      }
    }
    
    // Method 3: Inherit from lstStyle if paragraph has no explicit bullet configuration
    if (lstStyle && lstStyle !== '') {
      // Only inherit bullets if:
      // 1. Paragraph has no pPr at all, OR
      // 2. Paragraph has pPr but no bullet-related properties
      const hasBulletProperties = pPr && (
        this.safeGet(pPr, 'buNone') !== null ||
        this.safeGet(pPr, 'buChar') ||
        this.safeGet(pPr, 'buAutoNum')
      );
      
      if (!hasBulletProperties) {
        const lvl1pPr = this.safeGet(lstStyle, 'lvl1pPr');
        if (lvl1pPr) {
          const buChar = this.safeGet(lvl1pPr, 'buChar');
          const buAutoNum = this.safeGet(lvl1pPr, 'buAutoNum');
          
          // Apply same logic to parent style
          if (buChar) {
            const buCharValue = this.safeGet(buChar, '$val') || this.safeGet(buChar, '_') || buChar;
            if (buCharValue && buCharValue.toString().trim() !== '') {
              return true; // Inherit bullets from style
            }
            return false; // Parent style explicitly disables bullets
          }
          
          if (buAutoNum) {
            return true; // Inherit numbered bullets from style
          }
        }
      }
    }
    
    // Method 4: PPTX format contextual bullet detection
    // In PPTX files, when lstStyle is empty/missing and pPr is null,
    // we need to infer bullets from position and content patterns
    if ((!lstStyle || lstStyle === '') && !pPr) {
      // In single-paragraph text elements, that paragraph is likely a title
      if (totalParagraphs === 1) {
        return false;
      }
      
      // The first paragraph in multi-paragraph text is often a title/header
      if (paragraphIndex === 0) {
        return false;
      }
      
      // Subsequent paragraphs in multi-paragraph text are likely bullets
      // unless they explicitly disable bullets
      return true;
    }
    
    return false;
  }


  /**
   * Create a text node with formatting
   * @param {string} text - Text content
   * @param {Object} rPr - Run properties
   * @returns {Object} - Text node with marks and attributes
   */
  static createTextNode(text, rPr) {
    const textString = String(text);
    
    // Ensure we never create empty text nodes (but allow spaces)
    if (!textString || textString === '') {
      throw new Error('Cannot create empty text node - TLDraw does not allow empty text nodes');
    }
    
    const textNode = {
      type: 'text',
      text: textString
    };
    
    if (rPr) {
      const marks = [];
      
      // Bold formatting
      if (this.safeGet(rPr, '$b') === 1 || this.safeGet(rPr, '$b') === '1') {
        marks.push({ type: 'bold' });
      }
      
      // Italic formatting
      if (this.safeGet(rPr, '$i') === 1 || this.safeGet(rPr, '$i') === '1') {
        marks.push({ type: 'italic' });
      }
      
      // Font size using TipTap textStyle format
      const fontSize = this.safeGet(rPr, '$sz');
      if (fontSize) {
        const fontSizeInPt = this.fontSizeToPoints(fontSize);
        marks.push({
          type: 'textStyle',
          attrs: {
            fontSize: `${fontSizeInPt}pt`
          }
        });
      }
      
      // Add marks if any
      if (marks.length > 0) {
        textNode.marks = marks;
      }
    }
    
    return textNode;
  }
}