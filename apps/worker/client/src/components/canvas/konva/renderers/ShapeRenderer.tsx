import { Rect, Circle, Ellipse, RegularPolygon, Line, Shape } from 'react-konva'
import type { CanvasComponent } from '../../../../types/canvas'

/**
 * Render a shape component in Konva
 */
export function renderShapeComponent(component: CanvasComponent, key: string) {
  const {
    x,
    y,
    width,
    height,
    style = {},
    rotation = 0,
    opacity = 1,
    visible = true,
    content
  } = component

  if (!visible) {
    return null
  }

  // Default styling
  const fill = style.fill || style.backgroundColor || '#cccccc'
  const stroke = style.stroke || '#000000'
  const strokeWidth = style.strokeWidth || 1
  const cornerRadius = style.borderRadius || 0

  // Common props for all shapes (excluding key which must be passed directly)
  const commonProps = {
    x,
    y,
    fill,
    stroke,
    strokeWidth,
    rotation,
    opacity,
    shadowBlur: style.shadow ? 10 : 0,
    shadowColor: style.shadow ? 'rgba(0,0,0,0.3)' : undefined,
    onClick: () => {
      console.log('Shape component clicked:', component.id)
    },
    onMouseEnter: (e: any) => {
      e.target.getStage()!.container().style.cursor = 'pointer'
    },
    onMouseLeave: (e: any) => {
      e.target.getStage()!.container().style.cursor = 'default'
    }
  }

  // Determine shape type from content or metadata
  const shapeType = content?.shapeType || 
                   content?.type || 
                   component.metadata?.shapeType || 
                   'rectangle'

  switch (shapeType.toLowerCase()) {
    case 'rectangle':
    case 'rect':
    case 'square':
      return (
        <Rect
          key={key}
          {...commonProps}
          width={width}
          height={height}
          cornerRadius={cornerRadius}
        />
      )

    case 'circle':
      const radius = Math.min(width, height) / 2
      return (
        <Circle
          key={key}
          {...commonProps}
          x={x + radius}
          y={y + radius}
          radius={radius}
        />
      )

    case 'ellipse':
    case 'oval':
      return (
        <Ellipse
          key={key}
          {...commonProps}
          x={x + width / 2}
          y={y + height / 2}
          radiusX={width / 2}
          radiusY={height / 2}
        />
      )

    case 'triangle':
      return (
        <RegularPolygon
          key={key}
          {...commonProps}
          x={x + width / 2}
          y={y + height / 2}
          sides={3}
          radius={Math.min(width, height) / 2}
        />
      )

    case 'pentagon':
      return (
        <RegularPolygon
          key={key}
          {...commonProps}
          x={x + width / 2}
          y={y + height / 2}
          sides={5}
          radius={Math.min(width, height) / 2}
        />
      )

    case 'hexagon':
      return (
        <RegularPolygon
          key={key}
          {...commonProps}
          x={x + width / 2}
          y={y + height / 2}
          sides={6}
          radius={Math.min(width, height) / 2}
        />
      )

    case 'star':
      return (
        <RegularPolygon
          key={key}
          {...commonProps}
          x={x + width / 2}
          y={y + height / 2}
          sides={5}
          radius={Math.min(width, height) / 2}
          innerRadius={Math.min(width, height) / 4}
        />
      )

    case 'line':
      return (
        <Line
          key={key}
          {...commonProps}
          points={[x, y, x + width, y + height]}
          strokeWidth={strokeWidth || 2}
        />
      )

    case 'arrow':
      // Simple arrow using Line with arrow properties
      return (
        <Line
          key={key}
          {...commonProps}
          points={[x, y + height / 2, x + width, y + height / 2]}
          strokeWidth={strokeWidth || 2}
          lineCap="round"
          // Note: Konva doesn't have built-in arrow heads, 
          // would need custom implementation
        />
      )

    case 'custom':
    case 'path':
      // For custom shapes, we could use the Shape component
      // This would require path data from the content
      const pathData = content?.path || content?.d
      if (pathData) {
        return (
          <Shape
            key={key}
            {...commonProps}
            sceneFunc={(context, shape) => {
              context.beginPath()
              // Would need to parse SVG path data here
              // For now, just draw a simple shape
              context.rect(0, 0, width, height)
              context.fillStrokeShape(shape)
            }}
            width={width}
            height={height}
          />
        )
      }
      // Fallback to rectangle for unknown custom shapes
      return (
        <Rect
          key={key}
          {...commonProps}
          width={width}
          height={height}
          cornerRadius={cornerRadius}
        />
      )

    default:
      // Default to rectangle for unknown shapes
      return (
        <Rect
          key={key}
          {...commonProps}
          width={width}
          height={height}
          cornerRadius={cornerRadius}
        />
      )
  }
}

/**
 * Get shape type from PowerPoint content
 */
export function getShapeType(component: CanvasComponent): string {
  // Try to extract shape type from various possible locations
  const content = component.content
  
  if (typeof content === 'object' && content) {
    if (content.shapeType) return content.shapeType
    if (content.type) return content.type
    if (content.preset) return content.preset
  }
  
  if (component.metadata?.shapeType) {
    return component.metadata.shapeType
  }
  
  // Default fallback
  return 'rectangle'
}