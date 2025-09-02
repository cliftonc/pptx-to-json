import { createShapeId, type Editor } from '@tldraw/tldraw'
import type { PowerPointComponent } from 'ppt-paste-parser'
import { mapBackgroundColor, mapBorderColor } from '../utils/colorMapping'
import { mapShapeType, determineFillType, createComponentShapeId } from '../utils/tldrawHelpers'
import { calculateFrameRelativePosition, degreesToRadians } from '../utils/coordinateHelpers'

export async function renderShapeComponent(
  component: PowerPointComponent,
  index: number,
  frameX: number,
  frameY: number,
  editor: Editor,
  slideIndex: number,
  frameId: string | null
) {
  const shapeId = createShapeId(createComponentShapeId('shape', slideIndex, component.id || index))
  
  const scale = 1
  
  const { x, y } = calculateFrameRelativePosition(
    component.x || 0,
    component.y || 0,
    frameX,
    frameY,
    scale,
    !!frameId
  )
  
  const width = (component.width || 100) * scale
  const height = (component.height || 100) * scale
  
  // Map colors
  const fillColor = mapBackgroundColor(component.style?.backgroundColor)
  const strokeColor = mapBorderColor(component.style?.borderColor)
  
  // Determine the best tldraw shape type based on PowerPoint shape type
  const shapeType = component.style?.shapeType || component.metadata?.shapeType || component.metadata?.preset || 'rectangle'
  const geoType = mapShapeType(shapeType)
  
  // Create geometric shape using the tldraw v3 API
  const finalColor = fillColor === 'grey' ? strokeColor : fillColor
  const finalFill = determineFillType(component.style?.backgroundColor)
  
  // Create the shape with parent frame, position, and rotation all at once
  const geoShapeProps: any = {
    id: shapeId,
    type: 'geo',
    x,
    y,
    rotation: component.rotation ? degreesToRadians(component.rotation) : 0,
    props: {
      geo: geoType,
      color: finalColor,
      fill: finalFill,
      size: 'm',
      w: width,
      h: height
    }
  }
  
  if (frameId) {
    geoShapeProps.parentId = frameId
  }
  
  editor.createShape(geoShapeProps)
}