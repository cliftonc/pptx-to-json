import type { CanvasComponent } from '../../../../types/canvas'

/**
 * Render a table component using Fabric.js
 */
export async function renderTableComponent(
  component: CanvasComponent,
  scale: number
): Promise<any | null> {
  try {
    const { Rect } = await import('fabric')
    
    // Extract and scale position and dimensions
    const x = (component.x || 0) * scale
    const y = (component.y || 0) * scale
    const width = (component.width || 100) * scale
    const height = (component.height || 50) * scale
    const rotation = component.rotation || 0
    const opacity = component.opacity !== undefined ? component.opacity : 1
    
    // For tables, create a placeholder rectangle for now
    // In a full implementation, you'd render individual cells
    const fabricObject = new Rect({
      left: x,
      top: y,
      width: width,
      height: height,
      fill: 'rgba(255, 255, 255, 0.8)',
      stroke: '#333333',
      strokeWidth: 2,
      selectable: true
    })
    
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
    console.warn('Error rendering table component:', error)
    return null
  }
}

/**
 * Extract table metadata for debugging/display
 */
export function getTableMetadata(component: CanvasComponent) {
  const content = component.content
  return {
    hasTable: !!content,
    type: typeof content,
    keys: content && typeof content === 'object' ? Object.keys(content) : [],
    rows: content?.rows || 0,
    cols: content?.cols || 0,
    size: component.width && component.height ? `${component.width}x${component.height}` : 'unknown'
  }
}