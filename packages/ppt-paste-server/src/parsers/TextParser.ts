/**
 * Text component parser for PowerPoint shapes containing text
 */

import { BaseParser } from './BaseParser.js';
import { TextComponent, XMLNode, TextRun } from '../types/index.js';

// Rich text node types for TLDraw compatibility
interface TextNode {
  type: 'text';
  text: string;
  marks?: Mark[];
}

interface Mark {
  type: string;
  attrs?: Record<string, any>;
}

interface ListItem {
  type: 'listItem';
  content: Array<{ type: 'paragraph'; content: TextNode[] }>;
}

interface BulletList {
  type: 'bulletList';
  content: ListItem[];
}

interface Paragraph {
  type: 'paragraph';
  content: TextNode[];
}

interface RichTextDoc {
  type: 'doc';
  content: Array<Paragraph | BulletList>;
}

// Normalized text component structure
interface NormalizedTextComponent {
  textBody: XMLNode;
  spPr: XMLNode;
  nvSpPr: XMLNode;
  namespace?: string;
}

export class TextParser extends BaseParser {

  /**
   * Parse text component from normalized data (works for both PPTX and clipboard)
   * @param textComponent - Normalized text component
   * @param componentIndex - Component index
   * @param slideIndex - Slide index
   * @returns Parsed text component
   */
  static async parseFromNormalized(
    textComponent: NormalizedTextComponent,
    componentIndex: number,
    slideIndex: number,
    zIndex: number
  ): Promise<TextComponent | null> {
    const { textBody, spPr, nvSpPr, namespace } = textComponent;
    
    if (!textBody) {
      throw new Error('No textBody found in normalized text component');
    }

    // Extract text content using existing method
    const textContentRaw = this.extractTextContent(textBody);
    const textContent = this.asString(textContentRaw, '');
    if (!textContent.trim()) return null;

    // Extract rich text structure using existing method and flatten to TextRun[]
    const richTextDoc = this.extractRichTextContent(textBody);
    // Flatten paragraphs into simple TextRun[] for downstream consumers
    const richTextContent: TextRun[] = [];
    if (richTextDoc && Array.isArray(richTextDoc.content)) {
      for (const node of richTextDoc.content) {
        if (node.type === 'paragraph') {
          for (const tn of node.content) {
            const runText = this.asString((tn as any).text, '');
            if (runText !== '') {
              richTextContent.push({ text: runText, style: tn.marks ? {} : undefined });
            }
          }
        } else if (node.type === 'bulletList') {
          for (const li of node.content) {
            for (const para of li.content) {
              for (const tn of para.content) {
                const runText = this.asString((tn as any).text, '');
                if (runText !== '') {
                  richTextContent.push({ text: runText, style: tn.marks ? {} : undefined });
                }
              }
            }
          }
        }
      }
    }

    // Extract positioning from spPr (namespace-agnostic since we stripped them)
    const xfrm = this.getNode(spPr, 'xfrm');
    const transform = this.parseTransform(xfrm as any);

    // Extract component info from nvSpPr
    const cNvPr = this.getNode(nvSpPr, 'cNvPr');
    const componentName = this.getString(cNvPr, '$name', `text-${componentIndex}`);
    const isTextBox = this.getBoolean(nvSpPr, 'cNvSpPr.$txBox', false);

    // Extract dominant font styling using existing method
    const paragraphs = this.getNode(textBody, 'p') ?? this.safeGet(textBody, 'p', []);
    const paragraphsArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    let dominantFont = { family: 'Arial', size: 18, weight: 'normal', style: 'normal', color: '#000000', decoration: 'none' };
    
    // Find first non-empty run with formatting
    for (const paragraph of paragraphsArray) {
      if (paragraph?.['r']) {
        const runs = Array.isArray(paragraph['r']) ? paragraph['r'] : [paragraph['r']];
        for (const run of runs) {
          const text = this.getString(run, 't', '');
          if (text.trim()) {
            const rPr = this.getNode(run, 'rPr');
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
      zIndex,
      style: {
        fontSize: dominantFont.size,
        fontFamily: dominantFont.family,
        fontWeight: dominantFont.weight,
        fontStyle: dominantFont.style,
        textDecoration: dominantFont.decoration,
        color: dominantFont.color,
        backgroundColor: 'transparent', // Text components don't have background by default
        textAlign: 'left',
        opacity: 1,
        rotation: transform.rotation || 0
      },
      textRuns: richTextContent,
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
   * @param textBody - PowerPoint textBody element
   * @returns Extracted text content
   */
  static extractTextContent(textBody: XMLNode): string {
    // Namespaces are already stripped
    const paragraphs = this.getNode(textBody, 'p') ?? this.safeGet(textBody, 'p', []);
    const paragraphsArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    
    const allText: string[] = [];
    
    for (const paragraph of paragraphsArray) {
      let paragraphText = '';
      
      // Extract text from runs
      const runs = paragraph?.['r'];
      if (runs) {
        const runsArray = Array.isArray(runs) ? runs : [runs];
        for (const run of runsArray) {
          const text = this.getString(run, 't', '');
          paragraphText += text;
        }
      }
      
      // Extract text from fields
      const fields = paragraph?.['fld'];
      if (fields) {
        const fieldsArray = Array.isArray(fields) ? fields : [fields];
        for (const field of fieldsArray) {
          const text = this.getString(field, 't', '');
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
   * @param textBody - PowerPoint textBody element
   * @returns Rich text structure compatible with TLDraw
   */
  static extractRichTextContent(textBody: XMLNode): RichTextDoc {
    // Namespaces are already stripped
    const paragraphs = this.getNode(textBody, 'p') ?? this.safeGet(textBody, 'p', []);
    const paragraphsArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    const lstStyle = this.getNode(textBody, 'lstStyle') ?? this.safeGet(textBody, 'lstStyle');
    
    // Create simple paragraph structure - TLDraw handles bullets at paragraph level
    return this.createParagraphStructure(paragraphsArray, lstStyle);
  }

  /**
   * Create paragraph structure with nested bulletList elements
   * @param paragraphsArray - Array of paragraphs
   * @param lstStyle - PowerPoint list style
   * @returns Rich text structure with paragraphs containing bulletLists
   */
  static createParagraphStructure(paragraphsArray: XMLNode[], lstStyle: XMLNode): RichTextDoc {
    const content: Array<Paragraph | BulletList> = [];
    let currentBulletItems: ListItem[] = [];
    
    const flushBullets = () => {
      if (currentBulletItems.length > 0) {
        // Create bulletList directly (not wrapped in paragraph)
        content.push({
          type: 'bulletList',
          content: currentBulletItems
        });
        currentBulletItems = [];
      }
    };
    
    for (let paragraphIndex = 0; paragraphIndex < paragraphsArray.length; paragraphIndex++) {
      const paragraph = paragraphsArray[paragraphIndex];
      const paragraphContent: TextNode[] = [];
      
      // Extract text content from runs (namespaces already stripped)
      const runs = paragraph?.['r'];
      if (runs) {
        const runsArray = Array.isArray(runs) ? runs : [runs];
        const validRuns = runsArray.filter(run => {
          const text = this.getString(run, 't', '');
          return text !== '';
        });
        
        for (let i = 0; i < validRuns.length; i++) {
          const run = validRuns[i];
          const text = this.getString(run, 't', '');
          const rPr = this.getNode(run, 'rPr');
          
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
   * @param paragraph - Individual paragraph
   * @param lstStyle - PowerPoint list style
   * @param paragraphIndex - Index of this paragraph in the text element
   * @param totalParagraphs - Total number of paragraphs in the text element
   * @returns True if this paragraph has bullets
   */
  static paragraphHasBullets(
    paragraph: XMLNode, 
    lstStyle: XMLNode, 
    paragraphIndex: number = 0, 
    totalParagraphs: number = 1
  ): boolean {
    // Namespaces already stripped
      const pPr = this.getNode(paragraph, 'pPr') ?? this.safeGet(paragraph, 'pPr');
    
    // Method 1: Check if paragraph explicitly disables bullets
      if (pPr) {
        const buNone = this.getNode(pPr, 'buNone') ?? this.safeGet(pPr, 'buNone');
        if (buNone !== null && buNone !== undefined) {
          return false; // Explicitly no bullets
        }
      }
    
    // Method 2: Check paragraph properties directly for bullet characters
      if (pPr) {
        const buChar = this.getNode(pPr, 'buChar') ?? this.safeGet(pPr, 'buChar');
        const buAutoNum = this.getNode(pPr, 'buAutoNum') ?? this.safeGet(pPr, 'buAutoNum');
        
        // Handle both patterns:
        // - Clipboard format: buChar exists and has content (e.g., "•")
        // - PPTX format: buChar exists but may be empty string for non-bullets
        if (buChar) {
          const buCharValue = this.getString(buChar, '$val', '') || this.getString(buChar, '_', '') || this.getString(buChar, '');
          // If buChar has a non-empty value, it's a bullet
          if (buCharValue.trim() !== '') {
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
    if (lstStyle && typeof lstStyle === 'object') {
      // Only inherit bullets if:
      // 1. Paragraph has no pPr at all, OR
      // 2. Paragraph has pPr but no bullet-related properties
      const hasBulletProperties = pPr && (
        this.safeGet(pPr, 'buNone') !== null ||
        this.safeGet(pPr, 'buChar') ||
        this.safeGet(pPr, 'buAutoNum')
      );
      
      if (!hasBulletProperties) {
        const lvl1pPr = this.getNode(lstStyle, 'lvl1pPr') ?? this.safeGet(lstStyle, 'lvl1pPr');
        if (lvl1pPr) {
          const buChar = this.getNode(lvl1pPr, 'buChar') ?? this.safeGet(lvl1pPr, 'buChar');
          const buAutoNum = this.getNode(lvl1pPr, 'buAutoNum') ?? this.safeGet(lvl1pPr, 'buAutoNum');
          
          // Apply same logic to parent style
          if (buChar) {
            const buCharValue = this.getString(buChar, '$val', '') || this.getString(buChar, '_', '') || this.getString(buChar, '');
            if (buCharValue.trim() !== '') {
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
    if ((!lstStyle || typeof lstStyle !== 'object') && !pPr) {
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
   * @param text - Text content
   * @param rPr - Run properties
   * @returns Text node with marks and attributes
   */
  static createTextNode(text: string, rPr: XMLNode | null): TextNode {
    const textString = this.asString(text, '');
    
    // Ensure we never create empty text nodes (but allow spaces)
    if (textString === '') {
      throw new Error('Cannot create empty text node - TLDraw does not allow empty text nodes');
    }
    
    const textNode: TextNode = {
      type: 'text',
      text: textString
    };
    
    if (rPr) {
      const marks: Mark[] = [];
      
      // Bold formatting
      const b = this.getBoolean(rPr, '$b', false);
      if (b) {
        marks.push({ type: 'bold' });
      }
      
      // Italic formatting
      const i = this.getBoolean(rPr, '$i', false);
      if (i) {
        marks.push({ type: 'italic' });
      }
      
      // Font size using TipTap textStyle format
      const fontSizeNum = this.getNumber(rPr, '$sz', 0);
      if (fontSizeNum > 0) {
        const fontSizeInPt = this.fontSizeToPoints(fontSizeNum);
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
