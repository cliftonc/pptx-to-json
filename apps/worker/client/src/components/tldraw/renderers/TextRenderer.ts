import { createShapeId, toRichText, type Editor } from '@tldraw/tldraw'
import type { PowerPointComponent } from 'ppt-paste-parser'
import { mapPowerPointColorToTLDraw } from '../utils/colorMapping'
import { mapFontFamily, mapFontSize, createComponentShapeId } from '../utils/tldrawHelpers'
import { adjustPositionForRotation, calculateFrameRelativePosition, degreesToRadians } from '../utils/coordinateHelpers'

export async function renderTextComponent(
  component: PowerPointComponent,
  index: number,
  frameX: number,
  frameY: number,
  editor: Editor,
  slideIndex: number,
  frameId: string | null
) {
  const shapeId = createShapeId(createComponentShapeId('text', slideIndex, component.id || index))
  
  // PowerPoint coordinates look good - try with less scaling or no scaling
  const scale = 1 // Try no scaling first since coordinates look reasonable (629, 413, etc.)
  
  let { x, y } = calculateFrameRelativePosition(
    component.x || 0,
    component.y || 0,
    frameX,
    frameY,
    scale,
    !!frameId
  )
  
  // Adjust position for rotation - PowerPoint gives us top-left of unrotated shape
  if (component.rotation && component.rotation !== 0) {
    const width = component.width || 0
    const height = component.height || 0
    
    const adjusted = adjustPositionForRotation(x, y, width, height, component.rotation)
    x = adjusted.x
    y = adjusted.y
  }
  
  // Check if richText contains fontSize in textStyle marks
  const richTextData = (component as any).richText
  const hasRichTextFontSize = richTextData && checkForFontSize(richTextData.content)
  
  // Convert PowerPoint font size (pt) to TLDraw size categories as fallback
  let tldrawSize = undefined
  if (!hasRichTextFontSize && component.style?.fontSize) {
    tldrawSize = mapFontSize(component.style.fontSize)
  } else if (!hasRichTextFontSize) {
    tldrawSize = 'm'
  }

  // Map colors and fonts
  const tldrawColor = mapPowerPointColorToTLDraw(component.style?.color)
  const tldrawFont = mapFontFamily(component.style?.fontFamily)
  
  // Use richText structure if available (for bullets), otherwise convert plain text
  let richTextContent
  if (richTextData) {
    richTextContent = richTextData
  } else {
    richTextContent = toRichText(component.content || 'Sample text')
  }

  // Create text shape with rotation applied directly and parent it to frame
  const textProps: any = {
    richText: richTextContent,
    color: tldrawColor,
    font: tldrawFont,
    // Only disable autoSize if PowerPoint provided a width, otherwise let TLDraw autosize
    autoSize: !component.width,
    ...(component.width ? { w: component.width } : {})
  }
  
  // Only set size if we don't have rich text fontSize (to avoid overriding)
  if (tldrawSize) {
    textProps.size = tldrawSize
  }
  
  const shapeProps: any = {
    id: shapeId,
    type: 'text',
    x,
    y,
    rotation: component.rotation ? degreesToRadians(component.rotation) : 0,
    props: textProps
  }
  
  if (frameId) {
    shapeProps.parentId = frameId
  }
  
  editor.createShape(shapeProps)
}

// Helper function to check for fontSize in nested structures
function checkForFontSize(content: any[]): boolean {
  if (!content) return false
  
  return content.some((item: any) => {
    if (item.type === 'text' && item.marks) {
      // Check if this text node has textStyle with fontSize
      return item.marks.some((mark: any) => 
        mark.type === 'textStyle' && mark.attrs?.fontSize
      )
    } else if (item.content) {
      // Recursively check nested content (for listItems, paragraphs, etc.)
      return checkForFontSize(item.content)
    }
    return false
  })
}