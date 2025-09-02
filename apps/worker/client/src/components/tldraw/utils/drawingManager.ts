import { createShapeId, type Editor } from '@tldraw/tldraw'
import type { PowerPointComponent, PowerPointSlide } from 'ppt-paste-parser'
import { calculateComponentBounds, calculateSlidePosition } from './coordinateHelpers'
import { SLIDE_LAYOUT } from '../constants'
import { renderTextComponent } from '../renderers/TextRenderer'
import { renderShapeComponent } from '../renderers/ShapeRenderer'
import { renderImageComponent } from '../renderers/ImageRenderer'
import { renderTableComponent } from '../renderers/TableRenderer'

export async function drawSlides(slides: PowerPointSlide[], editor: Editor, slideDimensions?: { width: number; height: number }) {
  if (!editor || !slides.length) return

  // Clear existing shapes
  const allShapes = editor.getCurrentPageShapes()
  editor.deleteShapes(allShapes.map(shape => shape.id))

  // Use actual PowerPoint slide dimensions if available, otherwise calculate from components
  let maxSlideWidth: number
  let maxSlideHeight: number
  
  if (slideDimensions && slideDimensions.width && slideDimensions.height) {
    // Use extracted PowerPoint slide dimensions - these represent the intended canvas size
    maxSlideWidth = slideDimensions.width
    maxSlideHeight = slideDimensions.height
  } else {
    // Fallback: Calculate maximum bounds across all slides
    maxSlideWidth = SLIDE_LAYOUT.STANDARD_WIDTH
    maxSlideHeight = SLIDE_LAYOUT.STANDARD_HEIGHT
    
    slides.forEach(slide => {
      const componentBounds = calculateComponentBounds(slide.components)
      maxSlideWidth = Math.max(maxSlideWidth, componentBounds.maxX + SLIDE_LAYOUT.COMPONENT_BOUNDS_PADDING)
      maxSlideHeight = Math.max(maxSlideHeight, componentBounds.maxY + SLIDE_LAYOUT.COMPONENT_BOUNDS_PADDING)
    })
  }

  for (let slideIndex = 0; slideIndex < slides.length; slideIndex++) {
    const slide = slides[slideIndex]
    
    // Use uniform slide dimensions for all frames
    const slideWidth = maxSlideWidth
    const slideHeight = maxSlideHeight
    
    // Calculate slide position in grid layout
    const { x: slideX, y: slideY } = calculateSlidePosition(
      slideIndex,
      slideWidth,
      slideHeight,
      SLIDE_LAYOUT.SLIDE_SPACING,
      SLIDE_LAYOUT.SLIDES_PER_ROW
    )

    // Create frame for the slide - use consistent ID format
    const frameId = createShapeId(`slide-frame-${slideIndex}`)
    editor.createShape({
      id: frameId,
      type: 'frame',
      x: slideX,
      y: slideY,
      props: {
        w: slideWidth,
        h: slideHeight,
        name: slide.metadata?.name || `Slide ${slide.slideNumber}`
      }
    })

    // Draw all components within this slide frame - await to prevent race conditions
    await drawComponentsInFrame(slide.components, slideX, slideY, editor, slideIndex, frameId, { width: slideWidth, height: slideHeight })
  }

  // Fit the viewport to show all slides
  if (slides.length > 0) {
    editor.zoomToFit({ animation: { duration: 500 } })
  }
}

export async function drawComponents(components: PowerPointComponent[], editor: Editor) {
  if (!editor || !components.length) return

  // Clear existing shapes
  const allShapes = editor.getCurrentPageShapes()
  editor.deleteShapes(allShapes.map(shape => shape.id))

  // Draw components without slide frames (legacy mode) - no frame parent
  await drawComponentsInFrame(components, 0, 0, editor, 0, null)

  // Fit the viewport to show all components
  editor.zoomToFit({ animation: { duration: 500 } })
}

async function drawComponentsInFrame(
  components: PowerPointComponent[],
  frameX: number,
  frameY: number,
  editor: Editor,
  slideIndex: number,
  frameId: string | null,
  frameDimensions?: { width: number; height: number }
) {
  // Sort components by zIndex to ensure correct layering order
  const sortedComponents = [...components].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
  
  // Render each component in correct z-order
  for (let index = 0; index < sortedComponents.length; index++) {
    const component = sortedComponents[index]
    
    switch (component.type) {
      case 'text':
        await renderTextComponent(component, index, frameX, frameY, editor, slideIndex, frameId)
        break
      case 'shape':
        await renderShapeComponent(component, index, frameX, frameY, editor, slideIndex, frameId)
        break
      case 'image':
        await renderImageComponent(component, index, frameX, frameY, editor, slideIndex, frameId, frameDimensions)
        break
      case 'table':
        await renderTableComponent(component, index, frameX, frameY, editor, slideIndex, frameId)
        break
      default:
        break
    }
  }
}