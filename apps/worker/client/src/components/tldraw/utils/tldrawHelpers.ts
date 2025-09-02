import type { TLDrawFont, TLDrawGeoType, TLDrawSize } from '../constants'
import { POWERPOINT_SHAPE_MAPPINGS, STAR_SHAPES, ARROW_SHAPES } from '../constants'

/**
 * Maps PowerPoint font families to TLDraw fonts
 */
export function mapFontFamily(fontFamily: string | undefined): TLDrawFont {
  if (!fontFamily) return 'sans'
  
  const normalizedFont = fontFamily.toLowerCase()
  
  // Map common PowerPoint fonts to tldraw fonts
  if (normalizedFont.includes('times') || normalizedFont.includes('georgia') || normalizedFont.includes('serif')) {
    return 'serif'
  }
  if (normalizedFont.includes('courier') || normalizedFont.includes('consolas') || normalizedFont.includes('monaco') || normalizedFont.includes('mono')) {
    return 'mono'
  }
  if (normalizedFont.includes('comic') || normalizedFont.includes('marker') || normalizedFont.includes('sketch')) {
    return 'draw'
  }
  
  // Default to sans for Arial, Helvetica, Calibri, and other sans-serif fonts
  return 'sans'
}

/**
 * Maps PowerPoint font size (pt) to TLDraw size categories
 */
export function mapFontSize(fontSize: number | undefined): TLDrawSize | undefined {
  if (!fontSize) return undefined
  
  // More nuanced mapping for better visual accuracy
  if (fontSize <= 10) return 's'        // Very small text
  if (fontSize <= 13) return 's'        // Small text (≤13pt)
  if (fontSize <= 18) return 'm'        // Medium text (14-18pt)
  if (fontSize <= 23) return 'l'        // Large text (19-23pt)
  return 'xl'                           // Extra large text (≥24pt)
}

/**
 * Maps PowerPoint shape types to TLDraw geo types
 */
export function mapShapeType(shapeType: string | undefined): TLDrawGeoType {
  if (!shapeType) return 'rectangle'
  
  const normalizedShape = shapeType.toLowerCase()
  
  // Check for exact matches
  const exactMatch = POWERPOINT_SHAPE_MAPPINGS[normalizedShape as keyof typeof POWERPOINT_SHAPE_MAPPINGS]
  if (exactMatch) return exactMatch as TLDrawGeoType
  
  // Check for star variations
  if (STAR_SHAPES.some(star => star.toLowerCase() === normalizedShape)) {
    return 'star'
  }
  
  // Check for arrow variations
  const arrowMatch = ARROW_SHAPES[normalizedShape as keyof typeof ARROW_SHAPES]
  if (arrowMatch) return arrowMatch as TLDrawGeoType
  
  return 'rectangle' // Default fallback
}

/**
 * Checks if richText contains fontSize in textStyle marks
 */
export function hasRichTextFontSize(richTextData: any): boolean {
  if (!richTextData || !richTextData.content) return false
  
  // Recursive function to check for fontSize in nested structures
  const checkContent = (content: any[]): boolean => {
    if (!content) return false
    
    return content.some((item: any) => {
      if (item.type === 'text' && item.marks) {
        // Check if this text node has textStyle with fontSize
        return item.marks.some((mark: any) => 
          mark.type === 'textStyle' && mark.attrs?.fontSize
        )
      } else if (item.content) {
        // Recursively check nested content (for listItems, paragraphs, etc.)
        return checkContent(item.content)
      }
      return false
    })
  }
  
  return checkContent(richTextData.content)
}

/**
 * Determines the appropriate fill type for a shape
 */
export function determineFillType(backgroundColor: string | undefined): 'solid' | 'none' {
  return backgroundColor && backgroundColor !== 'transparent' ? 'solid' : 'none'
}

/**
 * Creates a unique shape ID
 */
export function createComponentShapeId(
  componentType: string,
  slideIndex: number,
  componentId: string | number,
  suffix?: string
): string {
  const baseName = suffix ? `${componentType}-${suffix}` : componentType
  return `${baseName}-${slideIndex}-${componentId}`
}