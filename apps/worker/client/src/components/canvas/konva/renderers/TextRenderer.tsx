import React from 'react'
import { Text, Rect } from 'react-konva'
import type { CanvasComponent } from '../../../../types/canvas'

/**
 * Render a text component in Konva
 */
export function renderTextComponent(component: CanvasComponent, key: string) {
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
  const fontSize = style.fontSize || 16
  const fontFamily = style.fontFamily || 'Arial, sans-serif'
  const fill = style.color || style.fill || '#000000'
  const fontStyle = style.fontWeight === 'bold' ? 'bold' : 'normal'
  const textDecoration = style.fontStyle === 'italic' ? 'italic' : ''
  const align = style.textAlign || 'left'

  return (
    <Text
      key={key}
      x={x}
      y={y}
      width={width}
      height={height}
      text={textContent}
      fontSize={fontSize}
      fontFamily={fontFamily}
      fill={fill}
      fontStyle={fontStyle}
      textDecoration={textDecoration}
      align={align}
      verticalAlign="top"
      rotation={rotation}
      opacity={opacity}
      wrap="word"
      ellipsis={true}
      // Add background if specified
      {...(style.backgroundColor && {
        // For background, we'll need a separate Rect component
        // This is a limitation of Konva Text - it doesn't support background directly
      })}
      // Event handlers
      onClick={() => {
        console.log('Text component clicked:', component.id)
      }}
      onMouseEnter={(e) => {
        e.target.getStage()!.container().style.cursor = 'text'
      }}
      onMouseLeave={(e) => {
        e.target.getStage()!.container().style.cursor = 'default'
      }}
    />
  )
}

/**
 * Enhanced text renderer with background support
 */
export function renderTextComponentWithBackground(component: CanvasComponent, key: string) {
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

  const elements = []

  // Add background rectangle if needed
  if (style.backgroundColor) {
    elements.push(
      <Rect
        key={`${key}-bg`}
        x={x}
        y={y}
        width={width}
        height={height}
        fill={style.backgroundColor}
        rotation={rotation}
        opacity={opacity}
        cornerRadius={style.borderRadius || 0}
      />
    )
  }

  // Add the text
  elements.push(renderTextComponent(component, key))

  return (
    <React.Fragment key={key}>
      {elements}
    </React.Fragment>
  )
}