import type { CanvasComponent } from '../../../../types/canvas'

/**
 * Render an image component using Fabric.js
 */
export async function renderImageComponent(
  canvas: any,
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
    
    // Extract image source using the same logic as Konva
    const imageSrc = getImageSource(component)
    
    if (imageSrc) {
      try {
        // Create HTML image element first
        const img = new window.Image()
        img.crossOrigin = 'anonymous'
        
        return new Promise<any>((resolve) => {
          img.onload = async () => {
            try {
              // Use dynamic import to get FabricImage class
              const { FabricImage } = await import('fabric')
              const fabricImg = new FabricImage(img, {
                left: x,
                top: y,
                scaleX: width / (img.width || 1),
                scaleY: height / (img.height || 1),
                selectable: true,
                opacity: opacity
              })
              
              fabricImg.set('componentId', component.id)
              fabricImg.set('componentType', 'image')
              fabricImg.set('zIndex', component.zIndex ?? 0)
              fabricImg.set('angle', rotation)
              
              canvas.add(fabricImg)
              
              // Resort all objects to maintain z-index order after async image load
              setTimeout(() => {
                const allObjects = canvas.getObjects()
                if (allObjects.length === 0) return
                
                const sortedObjects = allObjects.slice().sort((a: any, b: any) => {
                  const aZ = a.zIndex ?? 0
                  const bZ = b.zIndex ?? 0
                  return aZ - bZ
                })
                
                canvas.clear()
                sortedObjects.forEach((obj: any) => canvas.add(obj))
                canvas.renderAll()
              }, 10)
              
              canvas.renderAll()
              resolve(fabricImg)
            } catch (error) {
              console.warn('Failed to create Fabric image:', error)
              // Create error placeholder
              resolve(createErrorPlaceholder(x, y, width, height, rotation, opacity, component.id))
            }
          }
          
          img.onerror = () => {
            console.warn('Failed to load image:', imageSrc)
            // Create error placeholder
            resolve(createErrorPlaceholder(x, y, width, height, rotation, opacity, component.id))
          }
          
          img.src = imageSrc
        })
      } catch (error) {
        console.warn('Error setting up image loading:', error)
        // Fallback to error placeholder
        return createErrorPlaceholder(x, y, width, height, rotation, opacity, component.id)
      }
    } else {
      // No image source found - create placeholder
      return new Rect({
        left: x,
        top: y,
        width: width,
        height: height,
        fill: '#f0f0f0',
        stroke: '#ddd',
        strokeWidth: 1,
        selectable: true,
        angle: rotation,
        opacity: opacity,
        componentId: component.id,
        componentType: component.type,
        zIndex: component.zIndex ?? 0
      })
    }
  } catch (error) {
    console.warn('Error rendering image component:', error)
    return null
  }
}

/**
 * Extract image source from content
 */
function getImageSource(component: CanvasComponent): string | null {
  if (component.metadata?.imageUrl) {
    return component.metadata.imageUrl
  }
  if (typeof component.content === 'string') {
    return component.content
  }
  if (component.content && typeof component.content === 'object') {
    return component.content.src || component.content.url || component.content.dataUrl || component.content.data || component.content.content || null
  }
  if ((component as any).src) {
    return (component as any).src
  }
  return null
}

/**
 * Create error placeholder for failed image loads
 */
async function createErrorPlaceholder(
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number,
  opacity: number,
  componentId: string
): Promise<any> {
  const { Rect } = await import('fabric')
  return new Rect({
    left: x,
    top: y,
    width: width,
    height: height,
    fill: '#ffebee',
    stroke: '#f44336',
    strokeWidth: 1,
    strokeDashArray: [5, 5],
    selectable: true,
    angle: rotation,
    opacity: opacity,
    componentId: componentId,
    componentType: 'image',
    zIndex: 0
  })
}

/**
 * Extract image metadata for debugging/display
 */
export function getImageMetadata(component: CanvasComponent) {
  const content = component.content
  return {
    hasImage: !!content,
    type: typeof content,
    keys: content && typeof content === 'object' ? Object.keys(content) : [],
    isDataUrl: typeof content === 'string' && content.startsWith('data:'),
    isUrl: typeof content === 'string' && (content.startsWith('http') || content.startsWith('/')),
    size: component.width && component.height ? `${component.width}x${component.height}` : 'unknown'
  }
}