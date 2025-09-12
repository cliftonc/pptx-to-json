import * as PIXI from 'pixi.js'
import type { CanvasComponent } from '../../../../types/canvas'

/**
 * Render a text component in PixiJS
 */
export function renderTextComponent(
  component: CanvasComponent,
  key: string,
  scaleX: number = 1,
  scaleY: number = 1
): PIXI.Container | PIXI.Text | null {
  const {
    x,
    y,
    width,
    height,
    content,
    style = {},
    rotation = 0,
    opacity = 1,
    visible = true
  } = component

  if (!visible) {
    return null
  }

  // Extract text content
  const textContent = typeof content === 'string' ? content :
                     content?.text ||
                     content?.content ||
                     'Text Component'

  // Default styling
  const fontSize = (style.fontSize || 16) * Math.min(scaleX, scaleY) // Use the smaller scale for font size
  const fontFamily = style.fontFamily || 'Arial, sans-serif'
  const fill = style.color || style.fill || '#000000'
  const fontWeight = style.fontWeight || (style.bold ? 'bold' : 'normal')
  const fontStyle = style.fontStyle || (style.italic ? 'italic' : 'normal')
  const align = style.textAlign || style.align || 'left'

  // Create PIXI Text style
  const pixiStyle = new PIXI.TextStyle({
    fontFamily,
    fontSize,
    fill,
    fontWeight,
    fontStyle,
    align: align as PIXI.TextStyleAlign,
    wordWrap: true,
    wordWrapWidth: width || 200,
    breakWords: true,
    lineHeight: style.lineHeight || fontSize * 1.2
  })

  // Handle text shadows
  if (style.textShadow || style.shadow) {
    const shadowOffset = style.shadowOffset || { x: 2, y: 2 }
    pixiStyle.dropShadow = {
      alpha: style.shadowOpacity || 0.5,
      angle: Math.atan2(shadowOffset.y, shadowOffset.x),
      blur: style.shadowBlur || 0,
      distance: Math.sqrt(shadowOffset.x ** 2 + shadowOffset.y ** 2),
      color: style.shadowColor || '#000000'
    }
  }

  // Create text object
  const text = new PIXI.Text({
    text: textContent,
    style: pixiStyle
  })

  // Set position
  text.x = (x || 0) * scaleX
  text.y = (y || 0) * scaleY

  // Set rotation (convert from degrees to radians)
  if (rotation) {
    text.rotation = (rotation * Math.PI) / 180
  }

  // Set opacity
  text.alpha = opacity

  // Set dimensions if specified
  if (width && height) {
    // Scale text to fit within specified bounds
    const scaleX = width / text.width
    const scaleY = height / text.height
    const scale = Math.min(scaleX, scaleY, 1) // Don't scale up, only down
    
    if (scale < 1) {
      text.scale.set(scale)
    }
  }

  // Add background if specified
  if (style.backgroundColor) {
    const container = new PIXI.Container()
    
    const background = new PIXI.Graphics()
    background.rect(0, 0, (width || text.width) * scaleX, (height || text.height) * scaleY)
    background.fill(style.backgroundColor)
    
    container.addChild(background)
    container.addChild(text)
    container.x = (x || 0) * scaleX
    container.y = (y || 0) * scaleY
    
    // Reset text position since container handles it
    text.x = 0
    text.y = 0
    
    return container
  }

  // Make text interactive for selection/editing
  text.eventMode = 'static'
  text.cursor = 'text'

  // Add metadata for identification
  ;(text as any).__componentId = key
  ;(text as any).__componentType = 'text'

  return text
}