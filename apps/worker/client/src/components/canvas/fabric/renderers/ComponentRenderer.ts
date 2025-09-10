import type { CanvasComponent } from '../../../../types/canvas'
import { renderTextComponent } from './TextRenderer'
import { renderShapeComponent } from './ShapeRenderer'
import { renderImageComponent } from './ImageRenderer'
import { renderTableComponent } from './TableRenderer'

/**
 * Main component renderer that dispatches to specific renderers based on component type
 */
export async function renderComponent(
  canvas: any,
  component: CanvasComponent,
  scale: number
): Promise<any | null> {
  try {
    let fabricObject: any = null
    
    switch (component.type) {
      case 'text':
        fabricObject = await renderTextComponent(component, scale)
        break
        
      case 'shape':
        fabricObject = await renderShapeComponent(component, scale)
        break
        
      case 'image':
        // Image rendering is async and handles adding to canvas internally
        return await renderImageComponent(canvas, component, scale)
        
      case 'table':
        fabricObject = await renderTableComponent(component, scale)
        break
        
      default:
        // Unknown component type - create a placeholder
        const { Rect } = await import('fabric')
        const x = (component.x || 0) * scale
        const y = (component.y || 0) * scale
        const width = (component.width || 100) * scale
        const height = (component.height || 50) * scale
        const rotation = component.rotation || 0
        const opacity = component.opacity !== undefined ? component.opacity : 1
        
        fabricObject = new Rect({
          left: x,
          top: y,
          width: width,
          height: height,
          fill: 'rgba(155, 89, 182, 0.3)',
          stroke: '#9b59b6',
          strokeWidth: 1,
          selectable: true,
          angle: rotation,
          opacity: opacity,
          componentId: component.id,
          componentType: component.type,
          zIndex: component.zIndex ?? 0
        })
    }

    if (fabricObject) {
      canvas.add(fabricObject)
    }
    
    return fabricObject
  } catch (error) {
    console.warn('Error rendering component:', component.type, error)
    return null
  }
}

/**
 * Calculate scaling factors based on canvas vs slide dimensions
 */
export function calculateScale(
  canvasDimensions: { width: number; height: number },
  slideDimensions?: { width: number; height: number }
): number {
  const slideWidth = slideDimensions?.width || 720
  const slideHeight = slideDimensions?.height || 540
  const canvasWidth = canvasDimensions.width
  const canvasHeight = canvasDimensions.height
  
  const scaleX = canvasWidth / slideWidth
  const scaleY = canvasHeight / slideHeight
  return Math.min(scaleX, scaleY, 1) // Don't scale up beyond 100%
}

/**
 * Sort objects by zIndex for proper rendering order
 */
export function resortCanvasObjects(canvas: any) {
  const allObjects = canvas.getObjects()
  if (allObjects.length === 0) return
  
  // Sort by zIndex
  const sortedObjects = allObjects.slice().sort((a: any, b: any) => {
    const aZ = a.zIndex ?? 0
    const bZ = b.zIndex ?? 0
    return aZ - bZ
  })
  
  // Remove all objects
  canvas.clear()
  
  // Re-add in correct z-index order
  sortedObjects.forEach((obj: any) => {
    canvas.add(obj)
  })
  
  canvas.renderAll()
}