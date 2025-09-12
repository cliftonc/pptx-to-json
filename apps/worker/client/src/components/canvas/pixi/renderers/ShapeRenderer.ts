import * as PIXI from 'pixi.js'
import type { CanvasComponent } from '../../../../types/canvas'

/**
 * Render a shape component in PixiJS
 */
export function renderShapeComponent(
  component: CanvasComponent,
  key: string,
  scaleX: number = 1,
  scaleY: number = 1
): PIXI.Container | PIXI.Graphics | null {
  const {
    x,
    y,
    width,
    height,
    style = {},
    rotation = 0,
    opacity = 1,
    visible = true
  } = component

  if (!visible) {
    return null
  }

  const shapeType = style.shapeType || component.content?.shapeType || 'rectangle'
  const fillColor = style.fill || style.backgroundColor || '#cccccc'
  const strokeColor = style.stroke || style.borderColor || style.color
  const strokeWidth = style.strokeWidth || style.borderWidth || (strokeColor ? 2 : 0)
  const cornerRadius = style.cornerRadius || style.borderRadius || 0

  const graphics = new PIXI.Graphics()

  // Set position with scaling
  graphics.x = (x || 0) * scaleX
  graphics.y = (y || 0) * scaleY

  // Set rotation (convert from degrees to radians)
  if (rotation) {
    graphics.rotation = (rotation * Math.PI) / 180
  }

  // Set opacity
  graphics.alpha = opacity

  // Draw shape based on type with scaling
  const w = (width || 100) * scaleX
  const h = (height || 100) * scaleY

  switch (shapeType.toLowerCase()) {
    case 'rectangle':
    case 'rect':
      if (cornerRadius > 0) {
        graphics.roundRect(0, 0, w, h, cornerRadius)
      } else {
        graphics.rect(0, 0, w, h)
      }
      break

    case 'circle':
    case 'ellipse':
      graphics.ellipse(w / 2, h / 2, w / 2, h / 2)
      break

    case 'triangle':
      graphics.poly([
        { x: w / 2, y: 0 },
        { x: 0, y: h },
        { x: w, y: h }
      ])
      break

    case 'diamond':
    case 'rhombus':
      graphics.poly([
        { x: w / 2, y: 0 },
        { x: w, y: h / 2 },
        { x: w / 2, y: h },
        { x: 0, y: h / 2 }
      ])
      break

    case 'line':
      graphics.moveTo(0, h / 2).lineTo(w, h / 2)
      break

    case 'arrow':
      // Draw arrow pointing right
      const arrowHeadSize = Math.min(w, h) * 0.3
      graphics.poly([
        { x: 0, y: h * 0.3 },
        { x: w - arrowHeadSize, y: h * 0.3 },
        { x: w - arrowHeadSize, y: 0 },
        { x: w, y: h / 2 },
        { x: w - arrowHeadSize, y: h },
        { x: w - arrowHeadSize, y: h * 0.7 },
        { x: 0, y: h * 0.7 }
      ])
      break

    default:
      // Default to rectangle for unknown shapes
      graphics.rect(0, 0, w, h)
  }

  // Apply fill
  if (fillColor && fillColor !== 'transparent') {
    graphics.fill(fillColor)
  }

  // Apply stroke
  if (strokeColor && strokeWidth > 0) {
    graphics.stroke({
      color: strokeColor,
      width: strokeWidth
    })
  }

  // Handle gradients (simplified)
  if (style.gradient) {
    // For now, use the first color of the gradient stops
    const gradientColor = style.gradient.stops.length > 0 
      ? style.gradient.stops[0].color 
      : fillColor
    graphics.fill(gradientColor)
  }

  // Add shadow effect if specified
  if (style.shadow || style.dropShadow) {
    const shadowOffset = style.shadowOffset || { x: 2, y: 2 }
    const shadowColor = style.shadowColor || '#000000'
    const shadowAlpha = style.shadowOpacity || 0.3
    
    // Create shadow graphics
    const shadow = new PIXI.Graphics()
    shadow.x = shadowOffset.x
    shadow.y = shadowOffset.y
    shadow.alpha = shadowAlpha
    
    // Copy the same shape for shadow
    switch (shapeType.toLowerCase()) {
      case 'rectangle':
      case 'rect':
        if (cornerRadius > 0) {
          shadow.roundRect(0, 0, w, h, cornerRadius)
        } else {
          shadow.rect(0, 0, w, h)
        }
        break
      case 'circle':
      case 'ellipse':
        shadow.ellipse(w / 2, h / 2, w / 2, h / 2)
        break
      default:
        shadow.rect(0, 0, w, h)
    }
    
    shadow.fill(shadowColor)
    
    // Create container to hold both shadow and shape
    const container = new PIXI.Container()
    container.x = graphics.x
    container.y = graphics.y
    container.rotation = graphics.rotation
    container.alpha = graphics.alpha
    
    // Reset graphics position since container handles it
    graphics.x = 0
    graphics.y = 0
    graphics.rotation = 0
    graphics.alpha = 1
    
    container.addChild(shadow)
    container.addChild(graphics)
    
    // Make container interactive
    container.eventMode = 'static'
    container.cursor = 'pointer'
    
    // Add metadata
    ;(container as any).__componentId = key
    ;(container as any).__componentType = 'shape'
    
    return container
  }

  // Make graphics interactive for selection/editing
  graphics.eventMode = 'static'
  graphics.cursor = 'pointer'

  // Add metadata for identification
  ;(graphics as any).__componentId = key
  ;(graphics as any).__componentType = 'shape'

  return graphics
}