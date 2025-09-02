import { createShapeId, type Editor } from '@tldraw/tldraw'
import type { PowerPointComponent, PowerPointSlide } from 'ppt-paste-parser'
import { calculateComponentBounds, calculateSlidePosition } from './coordinateHelpers'
import { SLIDE_LAYOUT } from '../constants'
import { renderTextComponent } from '../renderers/TextRenderer'
import { renderShapeComponent } from '../renderers/ShapeRenderer'
import { renderImageComponent } from '../renderers/ImageRenderer'
import { renderTableComponent } from '../renderers/TableRenderer'

export async function drawSlides(slides: PowerPointSlide[], editor: Editor) {
  if (!editor || !slides.length) return

  console.log(`🖼️ Drawing ${slides.length} slides with frames`)

  // Clear existing shapes
  const allShapes = editor.getCurrentPageShapes()
  editor.deleteShapes(allShapes.map(shape => shape.id))

  // Calculate maximum bounds across all slides for uniform frame sizing
  let maxSlideWidth: number = SLIDE_LAYOUT.STANDARD_WIDTH
  let maxSlideHeight: number = SLIDE_LAYOUT.STANDARD_HEIGHT
  
  slides.forEach(slide => {
    const componentBounds = calculateComponentBounds(slide.components)
    maxSlideWidth = Math.max(maxSlideWidth, componentBounds.maxX + SLIDE_LAYOUT.COMPONENT_BOUNDS_PADDING)
    maxSlideHeight = Math.max(maxSlideHeight, componentBounds.maxY + SLIDE_LAYOUT.COMPONENT_BOUNDS_PADDING)
  })

  console.log(`📏 Using uniform slide size: ${maxSlideWidth}x${maxSlideHeight} for all slides`)

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

    console.log(`📄 Drawing slide ${slideIndex + 1} at (${slideX}, ${slideY}) size ${slideWidth}x${slideHeight} with ${slide.components.length} components`)

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
    await drawComponentsInFrame(slide.components, slideX, slideY, editor, slideIndex, frameId)
  }

  // Fit the viewport to show all slides
  if (slides.length > 0) {
    editor.zoomToFit({ animation: { duration: 500 } })
  }
}

export async function drawComponents(components: PowerPointComponent[], editor: Editor) {
  if (!editor || !components.length) return

  console.log(`🖼️ Drawing ${components.length} components without slides structure`)

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
  frameId: string | null
) {
  // Sort components by zIndex to ensure correct layering order
  const sortedComponents = [...components].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
  
  console.log('🎨 Rendering components in zIndex order:', sortedComponents.map(c => `${c.type}(z:${c.zIndex ?? 0})`).join(', '))
  
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
        await renderImageComponent(component, index, frameX, frameY, editor, slideIndex, frameId)
        break
      case 'table':
        await renderTableComponent(component, index, frameX, frameY, editor, slideIndex, frameId)
        break
      default:
        console.warn(`Unknown component type: ${component.type}`)
    }
  }
}