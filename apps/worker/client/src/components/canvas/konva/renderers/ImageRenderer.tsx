import React, { useState, useEffect } from 'react'
import { Image, Rect, Text, Group } from 'react-konva'
import Konva from 'konva'
import type { CanvasComponent } from '../../../../types/canvas'

/**
 * Render an image component in Konva
 */
export function renderImageComponent(
  component: CanvasComponent & {
    onClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void
    draggable?: boolean
    onDragEnd?: (e: Konva.KonvaEventObject<DragEvent | MouseEvent>) => void
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
    visible = true
  } = component

  if (!visible) {
    return null
  }

  return (
    <ImageComponentRenderer
      key={key}
      component={component}
      x={x}
      y={y}
      width={width}
      height={height}
      content={content}
      style={style}
      rotation={rotation}
      opacity={opacity}
      onClick={component.onClick}
      draggable={component.draggable}
      onDragEnd={component.onDragEnd}
      isSelected={component.isSelected}
    />
  )
}

interface ImageComponentRendererProps {
  component: CanvasComponent
  x: number
  y: number
  width: number
  height: number
  content: any
  style: any
  rotation: number
  opacity: number
  onClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void
  draggable?: boolean
  onDragEnd?: (e: Konva.KonvaEventObject<DragEvent | MouseEvent>) => void
  isSelected?: boolean
}

const ImageComponentRenderer: React.FC<ImageComponentRendererProps> = ({
  component,
  x,
  y,
  width,
  height,
  content,
  style,
  rotation,
  opacity,
  onClick,
  draggable = false,
  onDragEnd,
  isSelected = false
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Extract image source from content
  const getImageSource = (): string | null => {
    if (component.metadata?.imageUrl) {
      return component.metadata.imageUrl
    }
    if (typeof content === 'string') {
      return content
    }
    if (content && typeof content === 'object') {
      return content.src || content.url || content.dataUrl || content.data || content.content || null
    }
    return null
  }

  const imageSrc = getImageSource()

  useEffect(() => {
    if (!imageSrc) {
      setError('No image source found')
      setIsLoading(false)
      return
    }

    const img = new window.Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      setImage(img)
      setIsLoading(false)
      setError(null)
    }

    img.onerror = () => {
      setError('Failed to load image')
      setIsLoading(false)
      setImage(null)
    }

    img.src = imageSrc

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [imageSrc])

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (onClick) {
      onClick(e)
    }
  }

  const handleMouseEnter = (e: any) => {
    const container = e.target.getStage()?.container()
    if (container) {
      container.style.cursor = draggable ? 'move' : 'pointer'
    }
  }

  const handleMouseLeave = (e: any) => {
    const container = e.target.getStage()?.container()
    if (container) {
      container.style.cursor = 'default'
    }
  }

  const borderWidth = style.strokeWidth || 0
  const borderColor = style.stroke || '#000000'
  const cornerRadius = style.borderRadius || 0

  const elements: React.ReactElement[] = []

  if (borderWidth > 0 || style.backgroundColor) {
    elements.push(
      <Rect
        key={`${component.id}-border`}
        x={x}
        y={y}
        width={width}
        height={height}
        fill={style.backgroundColor || 'transparent'}
        stroke={borderColor}
        strokeWidth={borderWidth}
        cornerRadius={cornerRadius}
        rotation={rotation}
        opacity={opacity}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    )
  }

  if (isLoading) {
    elements.push(
      <Rect
        key={`${component.id}-loading`}
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#f0f0f0"
        stroke="#ddd"
        strokeWidth={1}
        cornerRadius={cornerRadius}
        rotation={rotation}
        opacity={opacity}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    )
    elements.push(
      <Text
        key={`${component.id}-loading-text`}
        x={x}
        y={y + height / 2 - 10}
        width={width}
        height={20}
        text="Loading..."
        fontSize={12}
        fill="#666"
        align="center"
        verticalAlign="middle"
        rotation={rotation}
        opacity={opacity}
      />
    )
  } else if (error || !image) {
    elements.push(
      <Rect
        key={`${component.id}-error`}
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#ffebee"
        stroke="#f44336"
        strokeWidth={1}
        strokeDashArray={[5, 5]}
        cornerRadius={cornerRadius}
        rotation={rotation}
        opacity={opacity}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    )
    elements.push(
      <Text
        key={`${component.id}-error-text`}
        x={x}
        y={y + height / 2 - 20}
        width={width}
        height={40}
        text={error || 'Image\nUnavailable'}
        fontSize={12}
        fill="#f44336"
        align="center"
        verticalAlign="middle"
        rotation={rotation}
        opacity={opacity}
      />
    )
  } else {
    elements.push(
      <Image
        key={`${component.id}-image`}
        id={component.id}
        name={component.id}
        x={x}
        y={y}
        width={width}
        height={height}
        image={image}
        rotation={rotation}
        opacity={opacity}
        cornerRadius={cornerRadius}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        draggable={false}
        crop={style.crop ? {
          x: style.crop.x || 0,
          y: style.crop.y || 0,
          width: style.crop.width || image.width,
          height: style.crop.height || image.height
        } : undefined}
      />
    )
  }

  if (elements.length === 1) {
    const el = elements[0]
    const common = {
      id: component.id,
      name: component.id,
      draggable: draggable,
      onDragEnd: onDragEnd as any,
      onClick: handleClick as any,
      onMouseEnter: handleMouseEnter as any,
      onMouseLeave: handleMouseLeave as any,
    }
    if (el.type === Rect || el.type === Image) {
      const props: any = el.props as any
      const specific: any = {
        x: props.x,
        y: props.y,
        width: props.width,
        height: props.height,
        fill: props.fill,
        stroke: props.stroke,
        strokeWidth: props.strokeWidth,
        cornerRadius: props.cornerRadius,
        rotation: props.rotation,
        opacity: props.opacity,
        image: props.image,
        crop: props.crop,
      }
      return React.createElement(el.type as any, { ...specific, ...common })
    }
    return el
  }

  return (
    <Group
      id={component.id}
      name={component.id}
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      opacity={opacity}
      draggable={draggable}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isSelected && (
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          stroke="#2196f3"
          strokeWidth={1}
          dash={[4,2]}
          listening={false}
        />
      )}
      {elements}
    </Group>
  )
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
