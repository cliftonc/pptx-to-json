/**
 * Text component parser for PowerPoint shapes containing text
 */

import { BaseParser } from './BaseParser.js';
import { TextComponent, XMLNode, TextRun, ComponentStyle, FillInfo, BorderInfo, GeometryInfo, PlaceholderMap } from '../types/index.js';
import { TextBodyNode, ParagraphNode, RunNode } from '../types/xml-nodes.js';
import { ShapeParser } from './ShapeParser.js';

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
  textBody?: XMLNode;
  spPr?: XMLNode;
  nvSpPr?: XMLNode;
  namespace?: string;
}

export class TextParser extends BaseParser {

  /**
   * Parse text component from normalized data (works for both PPTX and clipboard)
   * @param textComponent - Normalized text component
   * @param componentIndex - Component index
   * @param slideIndex - Slide index
   * @param placeholders - Optional placeholder positions from layout/master
   * @param masterStyles - Optional master styles for font size inheritance
   * @returns Parsed text component
   */
  static async parseFromNormalized(
    textComponent: NormalizedTextComponent,
    componentIndex: number,
    slideIndex: number,
    zIndex: number,
    placeholders?: PlaceholderMap,
    masterStyles?: { titleStyle?: XMLNode, bodyStyle?: XMLNode }
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

    // Build flattened TextRun[] while preserving spacing heuristics & style mapping
    const flattenedRuns: TextRun[] = [];
    const addRun = (text: string, marks?: Mark[]) => {
      if (text === '') return;
      const style: Partial<ComponentStyle> = {};
      if (marks) {
        for (const m of marks) {
          if (m.type === 'bold') style.fontWeight = 'bold';
          if (m.type === 'italic') style.fontStyle = 'italic';
          if (m.type === 'textStyle' && m.attrs?.fontSize) {
            const num = parseFloat(String(m.attrs.fontSize).replace(/pt$/,'').trim());
            if (!Number.isNaN(num)) style.fontSize = num;
          }
        }
      }
      flattenedRuns.push({ text, style: Object.keys(style).length ? style : undefined });
    };

    if (richTextDoc && Array.isArray(richTextDoc.content)) {
      for (const node of richTextDoc.content) {
        if (node.type === 'paragraph') {
          const paraRuns = (node as Paragraph).content;
          for (let i = 0; i < paraRuns.length; i++) {
            const tn = paraRuns[i] as any;
            const runText = this.asString(tn.text, '');
            addRun(runText, tn.marks);
            const next = paraRuns[i+1] as any;
            if (next && next.type === 'text' && this.shouldAddSpaceBetweenRuns({ text: runText }, { text: this.asString(next.text, '') })) {
              // Only add explicit space run if not already a single space node inserted
              if (runText !== ' ' && this.asString(next.text,'') !== ' ') {
                flattenedRuns.push({ text: ' ' });
              }
            }
          }
        } else if (node.type === 'bulletList') {
          for (const li of node.content) {
            for (const para of li.content) {
              const paraRuns = para.content;
              for (let i = 0; i < paraRuns.length; i++) {
                const tn = paraRuns[i] as any;
                const runText = this.asString(tn.text, '');
                addRun(runText, tn.marks);
                const next = paraRuns[i+1] as any;
                if (next && next.type === 'text' && this.shouldAddSpaceBetweenRuns({ text: runText }, { text: this.asString(next.text, '') })) {
                  if (runText !== ' ' && this.asString(next.text,'') !== ' ') {
                    flattenedRuns.push({ text: ' ' });
                  }
                }
              }
            }
          }
        }
      }
    }

    // Final spacing pass to ensure no missing spaces between word runs
    const richTextContent = this.fixSpacingInTextRuns(flattenedRuns);

    // Extract positioning from spPr (namespace-agnostic since we stripped them)
    const xfrm = this.getNode(spPr, 'xfrm');
    let transform = this.parseTransform(xfrm as any);

    // Check if this element references a layout placeholder and use its position if element has no position
    if (placeholders && (transform.x === 0 && transform.y === 0 && transform.width === 0 && transform.height === 0)) {
      // Look for placeholder reference in nvSpPr
      const nvPr = this.getNode(nvSpPr, 'nvPr');
      const ph = this.getNode(nvPr, 'ph');
      
      if (ph) {
        let placeholderPos: any = null;
        
        // First try to lookup by idx attribute
        const idx = this.getString(ph, '$idx') || this.getString(ph, 'idx');
        if (idx && placeholders[idx]) {
          placeholderPos = placeholders[idx];
        }
        
        // If no match by idx, try lookup by type
        if (!placeholderPos) {
          const type = this.getString(ph, '$type') || this.getString(ph, 'type');
          if (type && placeholders[`type:${type}`]) {
            placeholderPos = placeholders[`type:${type}`];
          }
        }
        
        // Apply the found placeholder position
        if (placeholderPos) {
          transform = {
            x: placeholderPos.x,
            y: placeholderPos.y,
            width: placeholderPos.width,
            height: placeholderPos.height,
            rotation: transform.rotation || 0
          };
        }
      }
    }

    // Extract component info from nvSpPr
    const cNvPr = this.getNode(nvSpPr, 'cNvPr');
    const componentName = this.getString(cNvPr, '$name', `text-${componentIndex}`);
    const isTextBox = this.getBoolean(nvSpPr, 'cNvSpPr.$txBox', false);

    // Extract dominant font styling and text alignment
    const paragraphs = this.getNode(textBody, 'p') ?? this.safeGet(textBody, 'p', []);
    const paragraphsArray = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    let dominantFont = { family: 'Arial', size: 18, weight: 'normal', style: 'normal', color: '#000000', decoration: 'none' };
    
    // Check for placeholder type to inherit master styles
    let placeholderType: string | null = null;
    if (nvSpPr && masterStyles) {
      const nvPr = this.getNode(nvSpPr, 'nvPr');
      const ph = this.getNode(nvPr, 'ph');
      if (ph) {
        placeholderType = this.getString(ph, '$type') || this.getString(ph, 'type');
      }
    }
    
    // Extract text alignment from paragraph properties
    const textAlignment = this.extractTextAlignment(paragraphsArray);
    
    // Find first non-empty run with formatting
    let foundExplicitFont = false;
    for (const paragraph of paragraphsArray) {
      if (paragraph?.['r']) {
        const runs = Array.isArray(paragraph['r']) ? paragraph['r'] : [paragraph['r']];
        for (const run of runs) {
          const text = this.getString(run, 't', '');
          if (text.trim()) {
            const rPr = this.getNode(run, 'rPr');
            if (rPr) {
              dominantFont = this.parseFont(rPr);
              // Check if we found explicit formatting (not just defaults)
              if (rPr.$sz || dominantFont.size !== 12) {
                foundExplicitFont = true;
              }
              break;
            }
          }
        }
        if (foundExplicitFont || dominantFont.family !== 'Arial') break;
      }
    }
    
    // If no explicit font size found, inherit from master styles based on placeholder type
    if (!foundExplicitFont && masterStyles && placeholderType) {
      if (placeholderType === 'title' && masterStyles.titleStyle) {
        const titleFontSize = this.extractMasterStyleFontSize(masterStyles.titleStyle);
        if (titleFontSize > 0) {
          dominantFont.size = titleFontSize;
        }
      } else if ((placeholderType === 'body' || !placeholderType) && masterStyles.bodyStyle) {
        const bodyFontSize = this.extractMasterStyleFontSize(masterStyles.bodyStyle);
        if (bodyFontSize > 0) {
          dominantFont.size = bodyFontSize;
        }
      }
    }
    
    // For content placeholders without explicit type, also try body style
    if (!foundExplicitFont && masterStyles && !placeholderType && nvSpPr) {
      const nvPr = this.getNode(nvSpPr, 'nvPr');
      const ph = this.getNode(nvPr, 'ph');
      if (ph) {
        const idx = this.getString(ph, '$idx') || this.getString(ph, 'idx');
        // idx="1" typically means content placeholder (body style)
        if (idx === '1' && masterStyles.bodyStyle) {
          const bodyFontSize = this.extractMasterStyleFontSize(masterStyles.bodyStyle);
          if (bodyFontSize > 0) {
            dominantFont.size = bodyFontSize;
          }
        }
      }
    }

    // Detect background shape properties if present
    let backgroundShape: { type: 'rectangle' | 'ellipse' | 'roundRect' | 'custom'; fill?: FillInfo; border?: BorderInfo; geometry?: GeometryInfo } | undefined;

    if (spPr) {
      // Check for shape geometry (indicates this text has a background shape)
      const geometry = ShapeParser.parseGeometry(spPr);
      
      // Check for fill properties (solid color, gradient, etc.)
      const fill = ShapeParser.parseFill(spPr, null);
      
      // Check for border properties
      const border = ShapeParser.parseBorder(spPr, null);
      
      // Only treat as text-with-background if it has visible styling beyond basic rectangle
      const hasVisibleFill = fill.type !== 'none' && fill.color !== 'transparent';
      const hasVisibleBorder = border.type !== 'none' && border.color !== 'transparent';
      const hasCustomGeometry = geometry.preset !== 'rect' || geometry.type !== 'rectangle';
      
      if (hasVisibleFill || hasVisibleBorder || hasCustomGeometry) {
        
        // Map PowerPoint geometry types to our simpler types
        let backgroundType: 'rectangle' | 'ellipse' | 'roundRect' | 'custom' = 'rectangle';
        if (geometry.preset === 'ellipse') {
          backgroundType = 'ellipse';
        } else if (geometry.preset === 'roundRect') {
          backgroundType = 'roundRect';
        } else if (geometry.preset !== 'rect') {
          backgroundType = 'custom';
        }
        
        backgroundShape = {
          type: backgroundType,
          fill: hasVisibleFill ? fill : undefined,
          border: hasVisibleBorder ? border : undefined,
          geometry
        };
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
        textAlign: textAlignment,
        opacity: 1,
        rotation: transform.rotation || 0
      },
      // Restore original property name: richText (regression fix)
      richText: richTextDoc as any,
      // Background shape properties for text-with-background components
      backgroundShape,
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
   * Return paragraphs array (typed) from a textBody-like node.
   */
  private static getParagraphs(textBody: XMLNode | TextBodyNode): (ParagraphNode | XMLNode)[] {
    const raw = (textBody as any)?.p;
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  }

  /**
   * Collect runs (including fields) from a paragraph.
   */
  static extractRuns(paragraph: ParagraphNode | XMLNode): RunNode[] {
    if (!paragraph || typeof paragraph !== 'object') return [];
    const runs: any[] = [];
    const r = (paragraph as any).r;
    const fld = (paragraph as any).fld;
    if (Array.isArray(r)) runs.push(...r);
    else if (r) runs.push(r);
    if (Array.isArray(fld)) runs.push(...fld);
    else if (fld) runs.push(fld);
    return runs.filter(Boolean) as RunNode[];
  }

  /**
   * Extract plain text content from textBody
   * @param textBody - PowerPoint textBody element
   * @returns Extracted text content
   */
  static extractTextContent(textBody: XMLNode | TextBodyNode): string {
    // Namespaces are already stripped
    const paragraphsArray = this.getParagraphs(textBody);
    const allText: string[] = [];
    for (const paragraph of paragraphsArray) {
      const runsArray = this.extractRuns(paragraph).map(r => ({ text: this.getString(r, 't', '') } as TextRun)).filter(r => r.text !== '');
      if (!runsArray.length) continue;
      let paragraphText = runsArray[0].text;
      for (let i = 1; i < runsArray.length; i++) {
        const prev = runsArray[i-1].text;
        const curr = runsArray[i].text;
        const prevLast = prev.slice(-1);
        const currFirst = curr[0];
        const isLetterPair = /[A-Za-z]/.test(prevLast) && /[A-Za-z]/.test(currFirst);
        const isNumberBoundary = /[0-9]/.test(prevLast) || /[0-9]/.test(currFirst);
        if (isLetterPair && !isNumberBoundary) {
          paragraphText += ' ';
        }
        paragraphText += curr;
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
  static extractRichTextContent(textBody: XMLNode | TextBodyNode): RichTextDoc {
    // Namespaces are already stripped
    const paragraphsArray = this.getParagraphs(textBody);
    const lstStyle = this.getNode(textBody as any, 'lstStyle') ?? this.safeGet(textBody as any, 'lstStyle');
    // Create simple paragraph structure - TLDraw handles bullets at paragraph level
    return this.createParagraphStructure(paragraphsArray, lstStyle);
  }

  /**
   * Create paragraph structure with nested bulletList elements
   * @param paragraphsArray - Array of paragraphs
   * @param lstStyle - PowerPoint list style
   * @returns Rich text structure with paragraphs containing bulletLists
   */
  static createParagraphStructure(paragraphsArray: (XMLNode | ParagraphNode)[], lstStyle: XMLNode): RichTextDoc {
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
      
      // Extract text content from runs + fields (namespaces already stripped)
      const runsArray = this.extractRuns(paragraph);
      const validRuns = runsArray.filter(run => this.getString(run, 't', '') !== '');
      for (let i = 0; i < validRuns.length; i++) {
        const run = validRuns[i];
        const text = this.getString(run, 't', '');
        const rPr = this.getNode(run, 'rPr');
        const textNode = this.createTextNode(text, rPr);
        paragraphContent.push(textNode);
        if (i < validRuns.length - 1) {
          paragraphContent.push({ type: 'text', text: ' ' });
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
          // Check for char attribute first (PPTX format), then fallback to other patterns
          const buCharValue = this.getString(buChar, '$char', '') || this.getString(buChar, 'char', '') || 
                             this.getString(buChar, '$val', '') || this.getString(buChar, '_', '') || this.getString(buChar, '');
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
            // Check for char attribute first (PPTX format), then fallback to other patterns
            const buCharValue = this.getString(buChar, '$char', '') || this.getString(buChar, 'char', '') || 
                               this.getString(buChar, '$val', '') || this.getString(buChar, '_', '') || this.getString(buChar, '');
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
      
      // Font size and color using TipTap textStyle format
      const fontSizeNum = this.getNumber(rPr, '$sz', 0);
      const solidFill = this.getNode(rPr, 'solidFill');
      
      // Only create textStyle mark if we have fontSize or color
      if (fontSizeNum > 0 || solidFill) {
        const attrs: any = {};
        
        if (fontSizeNum > 0) {
          const fontSizeInPt = this.fontSizeToPoints(fontSizeNum);
          attrs.fontSize = `${fontSizeInPt}pt`;
        }
        
        if (solidFill) {
          attrs.color = BaseParser.parseColor(solidFill);
        }
        
        marks.push({
          type: 'textStyle',
          attrs
        });
      }
      
      // Add marks if any
      if (marks.length > 0) {
        textNode.marks = marks;
      }
    }
    
    return textNode;
  }
  
  /**
   * Extract font size from master style (titleStyle or bodyStyle)
   * @param style - Master style XML node
   * @returns font size in points, or 0 if not found
   */
  static extractMasterStyleFontSize(style: XMLNode): number {
    // Look for lvl1pPr > defRPr > sz attribute
    const lvl1pPr = this.getNode(style, 'lvl1pPr') || this.getNode(style, 'a:lvl1pPr');
    if (lvl1pPr) {
      const defRPr = this.getNode(lvl1pPr, 'defRPr') || this.getNode(lvl1pPr, 'a:defRPr');
      if (defRPr) {
        const sz = this.getNumber(defRPr, '$sz', 0) || this.getNumber(defRPr, 'sz', 0);
        if (sz > 0) {
          return this.fontSizeToPoints(sz);
        }
      }
    }
    return 0;
  }

  /**
   * Extract text alignment from paragraph properties
   * @param paragraphsArray - Array of paragraphs
   * @returns text alignment (left, center, right)
   */
  static extractTextAlignment(paragraphsArray: XMLNode[]): string {
    // Check the first paragraph for alignment
    for (const paragraph of paragraphsArray) {
      if (!paragraph || typeof paragraph !== 'object') continue;
      
      const pPr = this.safeGet(paragraph, 'pPr');
      if (pPr && typeof pPr === 'object') {
        // Try different attribute paths for alignment
        let algn = this.getString(pPr, '$algn', null);
        
        // If not found as direct attribute, try as nested property
        if (!algn) {
          algn = this.getString(pPr, 'algn', null);
        }
        
        // If still not found, try attributes object
        if (!algn && pPr.$ && pPr.$.algn) {
          algn = pPr.$.algn;
        }
        
        if (algn) {
          switch (algn) {
            case 'ctr':
              return 'center';
            case 'r':
              return 'right';
            case 'j':
              return 'justify';
            case 'l':
            default:
              return 'left';
          }
        }
      }
    }
    
    // Default to left if no alignment found
    return 'left';
  }
}
