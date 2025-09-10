import type { CanvasComponent } from '../../../../types/canvas'

/**
 * Render a shape component using Fabric.js
 */
export async function renderShapeComponent(
  component: CanvasComponent,
  scale: number
): Promise<any | null> {
  try {
    const { Rect, Circle } = await import('fabric')
    
    // Extract and scale position and dimensions
    const x = (component.x || 0) * scale
    const y = (component.y || 0) * scale
    const width = (component.width || 100) * scale
    const height = (component.height || 50) * scale
    const rotation = component.rotation || 0
    const opacity = component.opacity !== undefined ? component.opacity : 1
    
    // Determine shape type from metadata or default to rectangle
    const shapeType = component.metadata?.shapeType || 'rectangle'
    const shapeFill = component.style?.fill || component.style?.backgroundColor || '#3498db'
    const shapeStroke = component.style?.stroke || '#2980b9'
    const shapeStrokeWidth = component.style?.strokeWidth || 1
    
    let fabricObject: any = null
    
    if (shapeType === 'circle' || shapeType === 'ellipse') {
      fabricObject = new Circle({
        left: x,
        top: y,
        radius: Math.min(width, height) / 2,
        fill: shapeFill,
        stroke: shapeStroke,
        strokeWidth: shapeStrokeWidth,
        selectable: true
      })
    } else {
      fabricObject = new Rect({
        left: x,
        top: y,
        width: width,
        height: height,
        fill: shapeFill,
        stroke: shapeStroke,
        strokeWidth: shapeStrokeWidth,
        selectable: true
      })
    }
    
    // Apply common properties
    fabricObject.set({
      angle: rotation,
      opacity: opacity,
      componentId: component.id,
      componentType: component.type,
      zIndex: component.zIndex ?? 0
    })
    
    return fabricObject
  } catch (error) {
    console.warn('Error rendering shape component:', error)
    return null
  }
}

/**
 * Get shape type from PowerPoint content
 */
export function getShapeType(component: CanvasComponent): string {
  const content = component.content
  if (typeof content === 'object' && content) {
    if ((content as any).shapeType) return (content as any).shapeType
    if ((content as any).type) return (content as any).type
    if ((content as any).preset) return (content as any).preset
  }
  if (component.metadata?.shapeType) {
    return component.metadata.shapeType
  }
  return 'rectangle'
}