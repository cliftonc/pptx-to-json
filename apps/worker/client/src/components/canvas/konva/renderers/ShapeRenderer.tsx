import { Rect, Circle, Ellipse, RegularPolygon, Line, Shape } from 'react-konva'
import type Konva from 'konva'
import type { CanvasComponent } from '../../../../types/canvas'

/**
 * Render a shape component in Konva
 */
export function renderShapeComponent(
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
    style = {},
    rotation = 0,
    opacity = 1,
    visible = true,
    content,
    onClick,
    draggable = false,
    onDragEnd,
    isSelected = false
  } = component

  if (!visible) {
    return null
  }

  // Default styling
  const fill = style.fill || style.backgroundColor || '#cccccc'
  const stroke = isSelected ? '#2196f3' : (style.stroke || '#000000')
  const strokeWidth = isSelected ? (style.strokeWidth || 1) + 0.5 : (style.strokeWidth || 1)
  const cornerRadius = style.borderRadius || 0

  // Common props for all shapes
  const commonProps = {
    id: component.id,
    name: component.id,
    x,
    y,
    fill,
    stroke,
    strokeWidth,
    rotation,
    opacity,
    shadowBlur: style.shadow ? 10 : 0,
    shadowColor: style.shadow ? 'rgba(0,0,0,0.3)' : undefined,
    onClick: onClick || (() => {
      // no-op fallback
    }),
    onMouseEnter: (e: any) => {
      const container = e.target.getStage()?.container()
      if (container) {
        container.style.cursor = draggable ? 'move' : 'pointer'
      }
    },
    onMouseLeave: (e: any) => {
      const container = e.target.getStage()?.container()
      if (container) {
        container.style.cursor = 'default'
      }
    },
    draggable: draggable,
    onDragEnd: onDragEnd
  }

  // Determine shape type
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
          x={x}
          y={y}
          width={width}
          height={height}
          radius={radius}
          offsetX={-radius}
          offsetY={-radius}
        />
      )

    case 'ellipse':
    case 'oval':
      return (
        <Ellipse
          key={key}
          {...commonProps}
          x={x}
          y={y}
          width={width}
          height={height}
          radiusX={width / 2}
          radiusY={height / 2}
          offsetX={-width / 2}
          offsetY={-height / 2}
        />
      )

    case 'triangle':
      const triangleRadius = Math.min(width, height) / 2
      return (
        <RegularPolygon
          key={key}
          {...commonProps}
          x={x}
          y={y}
          width={width}
          height={height}
          sides={3}
          radius={triangleRadius}
          offsetX={-triangleRadius}
          offsetY={-triangleRadius}
        />
      )

    case 'pentagon':
      const pentagonRadius = Math.min(width, height) / 2
      return (
        <RegularPolygon
          key={key}
          {...commonProps}
          x={x}
          y={y}
          width={width}
          height={height}
          sides={5}
          radius={pentagonRadius}
          offsetX={-pentagonRadius}
          offsetY={-pentagonRadius}
        />
      )

    case 'hexagon':
      const hexagonRadius = Math.min(width, height) / 2
      return (
        <RegularPolygon
          key={key}
          {...commonProps}
          x={x}
          y={y}
          width={width}
          height={height}
          sides={6}
          radius={hexagonRadius}
          offsetX={-hexagonRadius}
          offsetY={-hexagonRadius}
        />
      )

    case 'star':
      const starRadius = Math.min(width, height) / 2
      return (
        <RegularPolygon
          key={key}
          {...commonProps}
          x={x}
          y={y}
          width={width}
          height={height}
          sides={5}
          radius={starRadius}
          innerRadius={Math.min(width, height) / 4}
          offsetX={-starRadius}
          offsetY={-starRadius}
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
      return (
        <Line
          key={key}
          {...commonProps}
          points={[x, y + height / 2, x + width, y + height / 2]}
          strokeWidth={strokeWidth || 2}
          lineCap="round"
        />
      )

    case 'custom':
    case 'path':
      const pathData = content?.path || content?.d
      if (pathData) {
        return (
          <Shape
            key={key}
            {...commonProps}
            sceneFunc={(context, shape) => {
              context.beginPath()
              context.rect(0, 0, width, height)
              context.fillStrokeShape(shape)
            }}
            width={width}
            height={height}
          />
        )
      }
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
  const content = component.content
  if (typeof content === 'object' && content) {
    if ((content as any).shapeType) return (content as any).shapeType
    if ((content as any).type) return (content as any).type
    if ((content as any).preset) return (content as any).preset
  }
  if (component.metadata?.shapeType) {
    return component.metadata.shapeType
  }
  return 'rectangle'
}
