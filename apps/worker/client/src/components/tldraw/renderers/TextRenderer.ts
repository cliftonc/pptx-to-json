import { createShapeId, toRichText, type Editor } from '@tldraw/tldraw'
import type { PowerPointComponent } from 'ppt-paste-parser'
import { mapPowerPointColorToTLDraw } from '../utils/colorMapping'
import { mapFontFamily, mapFontSize, createComponentShapeId } from '../utils/tldrawHelpers'
import { adjustPositionForRotation, calculateFrameRelativePosition, degreesToRadians } from '../utils/coordinateHelpers'
import { renderShapeComponent } from './ShapeRenderer'
import type { TLDrawColor } from '../constants'

export async function renderTextComponent(
  component: PowerPointComponent,
  index: number,
  frameX: number,
  frameY: number,
  editor: Editor,
  slideIndex: number,
  frameId: string | null,
  colorMapping?: Map<string, TLDrawColor>
) {
  // If text has a background shape, render it first
  if ('backgroundShape' in component && component.backgroundShape) {
    const bg = component.backgroundShape;
    
    // Check if background shape is actually visible
    const hasFill = bg.fill && bg.fill.color && bg.fill.color !== 'transparent' && (bg.fill.opacity || 0) > 0;
    const hasBorder = bg.border && bg.border.color && bg.border.color !== 'transparent' && (bg.border.width || 0) > 0;
    
    // Only render if the background shape has visible fill or border
    if (!hasFill && !hasBorder) {
      // Skip rendering transparent background shapes
    } else {
      // Create a synthetic shape component using text component's position/size
    const backgroundComponent: PowerPointComponent = {
      id: `${component.id || index}-bg`,
      type: 'shape',
      content: '', // Background shapes don't have text content
      x: component.x,
      y: component.y,
      width: component.width || 100,
      height: component.height || 50,
      rotation: component.rotation,
      slideIndex: component.slideIndex,
      zIndex: (component.zIndex || 0) - 0.1, // Slightly lower z-index
      style: {
        shapeType: bg.geometry?.preset || bg.type || 'rectangle',
        fillColor: bg.fill?.color || 'transparent',
        fillOpacity: bg.fill?.opacity || 1,
        borderColor: bg.border?.color || 'transparent',
        borderWidth: bg.border?.width || 0,
        borderStyle: bg.border?.style || 'solid',
        opacity: component.style?.opacity
      },
      metadata: {
        shapeType: bg.geometry?.type || bg.type,
        preset: bg.geometry?.preset,
        isBackgroundShape: true
      }
    };
    
      // Render the background shape using existing ShapeRenderer
      await renderShapeComponent(
        backgroundComponent,
        index,
        frameX,
        frameY,
        editor,
        slideIndex,
        frameId,
        colorMapping || new Map()
      );
    }
  }

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
  
  // We'll adjust Y position after creating the text shape to get actual dimensions
  
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

  // Map PowerPoint text alignment to TLDraw alignment
  const getTldrawAlignment = (textAlign?: string) => {
    switch (textAlign) {
      case 'center':
        return 'middle';
      case 'right':
        return 'end';
      case 'justify':
        return 'start'; // TLDraw doesn't support justify, default to start
      default:
        return 'start'; // left alignment
    }
  }

  // Create text shape with rotation applied directly and parent it to frame
  const textProps: any = {
    richText: richTextContent,
    color: tldrawColor,
    font: tldrawFont,
    // Only disable autoSize if PowerPoint provided a width, otherwise let TLDraw autosize
    autoSize: !component.width,
    ...(component.width ? { w: component.width } : {}),
    // Try TLDraw text alignment property
    textAlign: getTldrawAlignment(component.style?.textAlign),
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
  
  // Adjust Y position for vertical centering if text has a background shape
  if ('backgroundShape' in component && component.backgroundShape) {
    // Wait a tick for the shape to be created and measured
    requestAnimationFrame(() => {
      const textShape = editor.getShape(shapeId)
      if (textShape) {
        // Get the actual text bounds
        const bounds = editor.getShapeGeometry(textShape).bounds
        const actualTextHeight = bounds.height
        const backgroundHeight = component.height || 50
        
        // Calculate the vertical offset to center the text
        const verticalOffset = Math.max(0, (backgroundHeight - actualTextHeight) / 2)
        const centeredY = y + verticalOffset
        
        
        // Update the shape position if there's a significant offset
        if (Math.abs(verticalOffset) > 1) {
          editor.updateShape({
            id: shapeId,
            type: 'text',
            y: centeredY
          })
        }
      }
    })
  }
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