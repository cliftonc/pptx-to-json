import React from 'react'
import { Text, Rect } from 'react-konva'
import Konva from 'konva'
import type { CanvasComponent } from '../../../../types/canvas'

/**
 * Render a text component in Konva
 */
export function renderTextComponent(
  component: CanvasComponent & {
    onClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void
    onDoubleClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void
    draggable?: boolean
    onDragEnd?: (e: Konva.KonvaEventObject<DragEvent | MouseEvent>) => void
    isEditing?: boolean
    isSelected?: boolean
  },
  key: string
) {
  const {
    x,
    y,
    width,
    height,
    content,
    style = {},
    rotation = 0,
    opacity = 1,
    visible = true,
    onClick,
    onDoubleClick,
    draggable = false,
    onDragEnd,
    isEditing = false
  } = component

  if (!visible || isEditing) {
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
    <React.Fragment key={key}>
      <Text
        id={component.id}
        name={component.id}
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
        // Event handlers
        onClick={(e) => {
          if (onClick) {
            onClick(e)
          }
        }}
        onDblClick={onDoubleClick || (() => { /* no-op */ })}
        onMouseEnter={(e) => {
          const container = e.target.getStage()?.container()
          if (container) {
            container.style.cursor = draggable ? 'move' : 'text'
          }
        }}
        onMouseLeave={(e) => {
          const container = e.target.getStage()?.container()
            if (container) {
              container.style.cursor = 'default'
            }
        }}
        draggable={draggable}
        onDragEnd={onDragEnd}
      />
    </React.Fragment>
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

  const elements = [] as React.ReactNode[]

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
  elements.push(renderTextComponent(component as any, key))

  return (
    <React.Fragment key={key}>
      {elements}
    </React.Fragment>
  )
}
