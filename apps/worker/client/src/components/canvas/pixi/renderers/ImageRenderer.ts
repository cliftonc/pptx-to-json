import * as PIXI from 'pixi.js'
import type { CanvasComponent } from '../../../../types/canvas'

/**
 * Render an image component in PixiJS
 */
export async function renderImageComponent(
  component: CanvasComponent,
  key: string,
  scaleX: number = 1,
  scaleY: number = 1
): Promise<PIXI.Container | PIXI.Sprite | PIXI.Graphics | null> {
  const {
    x,
    y,
    width,
    height,
    rotation = 0,
    opacity = 1,
    visible = true
  } = component

  if (!visible) {
    return null
  }

  // Extract image source using the same logic as Fabric/Konva
  let imageSrc = getImageSource(component)
  
  // If it's a relative API URL, make it absolute using current origin
  if (imageSrc && imageSrc.startsWith('/api/')) {
    imageSrc = window.location.origin + imageSrc
    console.log('PixiJS ImageRenderer: Converted relative URL to absolute:', imageSrc)
  }

  // Check if the extracted content looks like a URL or data URL
  const isValidImageSrc = imageSrc && (
    imageSrc.startsWith('http') ||
    imageSrc.startsWith('data:image/') ||
    imageSrc.startsWith('/') ||
    imageSrc.includes('.') ||
    imageSrc.startsWith('./') ||
    imageSrc.startsWith('../')
  )

  console.log('PixiJS ImageRenderer debug:', {
    componentId: component.id,
    content: component.content,
    metadata: component.metadata,
    extractedSrc: imageSrc,
    metadataImageUrl: component.metadata?.imageUrl,
    isValidImageSrc: isValidImageSrc
  })

  if (!imageSrc || !isValidImageSrc) {
    console.log('PixiJS ImageRenderer: Invalid or missing image source:', { 
      imageSrc, 
      isValidImageSrc,
      component: { content: component.content, metadata: component.metadata }
    })
    // Create placeholder for missing image with scaling
    const scaledWidth = (width || 100) * scaleX
    const scaledHeight = (height || 100) * scaleY
    const placeholder = new PIXI.Graphics()
    placeholder.rect(0, 0, scaledWidth, scaledHeight)
    placeholder.fill('#f0f0f0')
    placeholder.stroke({ color: '#ccc', width: 2 })
    
    // Add "X" pattern for missing image
    placeholder.moveTo(0, 0).lineTo(scaledWidth, scaledHeight)
    placeholder.moveTo(0, scaledHeight).lineTo(scaledWidth, 0)
    placeholder.stroke({ color: '#ccc', width: 1 })
    
    placeholder.x = (x || 0) * scaleX
    placeholder.y = (y || 0) * scaleY
    
    // Add metadata
    ;(placeholder as any).__componentId = key
    ;(placeholder as any).__componentType = 'image'
    
    return placeholder
  }

  // Load image using Promise-based approach like Fabric renderer
  console.log('PixiJS ImageRenderer: Attempting to load image from:', imageSrc)
  
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      console.log('PixiJS ImageRenderer: Image loaded successfully, creating sprite:', {
        src: imageSrc,
        width: img.width,
        height: img.height
      })
      
      try {
        // Create texture from the loaded image
        const texture = PIXI.Texture.from(img)
        const sprite = new PIXI.Sprite(texture)
        
        // Set position with scaling
        sprite.x = (x || 0) * scaleX
        sprite.y = (y || 0) * scaleY
        
        // Set dimensions with scaling if specified
        if (width && height) {
          sprite.width = width * scaleX
          sprite.height = height * scaleY
        } else if (width) {
          const scaledWidth = width * scaleX
          sprite.width = scaledWidth
          sprite.height = (scaledWidth / img.width) * img.height
        } else if (height) {
          const scaledHeight = height * scaleY
          sprite.height = scaledHeight
          sprite.width = (scaledHeight / img.height) * img.width
        }
        
        // Set rotation (convert from degrees to radians)
        if (rotation) {
          sprite.rotation = (rotation * Math.PI) / 180
        }
        
        // Set opacity
        sprite.alpha = opacity
        
        // Make sprite interactive for selection/editing
        sprite.eventMode = 'static'
        sprite.cursor = 'pointer'
        
        // Add metadata for identification
        ;(sprite as any).__componentId = key
        ;(sprite as any).__componentType = 'image'
        
        console.log('PixiJS ImageRenderer: Sprite created successfully')
        resolve(sprite)
      } catch (error) {
        console.error('PixiJS ImageRenderer: Error creating sprite:', error)
        resolve(createErrorPlaceholder(x, y, width, height, rotation, opacity, key, scaleX, scaleY))
      }
    }
    
    img.onerror = (error) => {
      console.error('PixiJS ImageRenderer: Failed to load image:', imageSrc, error)
      resolve(createErrorPlaceholder(x, y, width, height, rotation, opacity, key))
    }
    
    img.src = imageSrc
  })
}

/**
 * Create error placeholder for failed image loads
 */
function createErrorPlaceholder(
  x: number,
  y: number, 
  width: number,
  height: number,
  rotation: number,
  opacity: number,
  key: string,
  scaleX: number = 1,
  scaleY: number = 1
): PIXI.Graphics {
  const scaledWidth = (width || 100) * scaleX
  const scaledHeight = (height || 100) * scaleY
  const placeholder = new PIXI.Graphics()
  placeholder.rect(0, 0, scaledWidth, scaledHeight)
  placeholder.fill('#ffebee')
  placeholder.stroke({ color: '#f44336', width: 2 })
  
  // Add "X" pattern for error
  placeholder.moveTo(0, 0).lineTo(scaledWidth, scaledHeight)
  placeholder.moveTo(0, scaledHeight).lineTo(scaledWidth, 0)
  placeholder.stroke({ color: '#f44336', width: 1 })
  
  placeholder.x = (x || 0) * scaleX
  placeholder.y = (y || 0) * scaleY
  
  if (rotation) {
    placeholder.rotation = (rotation * Math.PI) / 180
  }
  
  placeholder.alpha = opacity
  
  // Add metadata
  ;(placeholder as any).__componentId = key
  ;(placeholder as any).__componentType = 'image'
  
  return placeholder
}

/**
 * Extract image source from content using the same logic as Fabric/Konva
 */
function getImageSource(component: CanvasComponent): string | null {
  // First check metadata.imageUrl (this is where the actual URLs are stored)
  if (component.metadata?.imageUrl) {
    return component.metadata.imageUrl
  }
  
  // Fallback to other possible locations
  if (typeof component.content === 'string') {
    return component.content
  }
  if (component.content && typeof component.content === 'object') {
    return component.content.src || 
           component.content.url || 
           component.content.dataUrl || 
           component.content.data || 
           component.content.content || 
           null
  }
  if ((component as any).src) {
    return (component as any).src
  }
  return null
}