import React, { useState, useEffect } from 'react'
import { Image, Rect, Text } from 'react-konva'
import type { CanvasComponent } from '../../../../types/canvas'

/**
 * Render an image component in Konva
 */
export function renderImageComponent(component: CanvasComponent, key: string) {
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
  opacity
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Extract image source from content
  const getImageSource = (): string | null => {
    // First check metadata.imageUrl (consistent with TLDraw renderer)
    if (component.metadata?.imageUrl) {
      return component.metadata.imageUrl
    }
    
    if (typeof content === 'string') {
      // Direct URL or data URL
      return content
    }
    
    if (content && typeof content === 'object') {
      // Try various properties that might contain the image data
      return content.src || 
             content.url || 
             content.dataUrl || 
             content.data || 
             content.content ||
             null
    }
    
    return null
  }

  const imageSrc = getImageSource()

  // Debug logging to understand the image data structure
  console.log('ImageRenderer - component:', component)
  console.log('ImageRenderer - content:', content)
  console.log('ImageRenderer - imageSrc:', imageSrc)

  useEffect(() => {
    if (!imageSrc) {
      setError('No image source found')
      setIsLoading(false)
      return
    }

    const img = new window.Image()
    img.crossOrigin = 'anonymous' // Handle CORS for external images
    
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

  // Common event handlers
  const handleClick = () => {
    console.log('Image component clicked:', component.id)
  }

  const handleMouseEnter = (e: any) => {
    e.target.getStage()!.container().style.cursor = 'pointer'
  }

  const handleMouseLeave = (e: any) => {
    e.target.getStage()!.container().style.cursor = 'default'
  }

  // Border styling
  const borderWidth = style.strokeWidth || 0
  const borderColor = style.stroke || '#000000'
  const cornerRadius = style.borderRadius || 0

  const elements = []

  // Add border/background if specified
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
    // Show loading placeholder
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
    // Show error placeholder
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
    // Show the actual image
    elements.push(
      <Image
        key={`${component.id}-image`}
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
        // Image scaling/cropping options
        crop={style.crop ? {
          x: style.crop.x || 0,
          y: style.crop.y || 0,
          width: style.crop.width || image.width,
          height: style.crop.height || image.height
        } : undefined}
      />
    )
  }

  return <>{elements}</>
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