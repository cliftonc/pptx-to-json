import { createShapeId, type Editor } from '@tldraw/tldraw'
import type { PowerPointComponent, PowerPointSlide } from 'ppt-paste-parser'
import { calculateComponentBounds, calculateSlidePosition } from './coordinateHelpers'
import { SLIDE_LAYOUT, type TLDrawColor } from '../constants'
import { renderTextComponent } from '../renderers/TextRenderer'
import { renderShapeComponent } from '../renderers/ShapeRenderer'
import { renderImageComponent } from '../renderers/ImageRenderer'
import { renderTableComponent } from '../renderers/TableRenderer'
import { renderVideoComponent } from '../renderers/VideoRenderer'
import { createColorMapping, applyColorPaletteOverride } from './colorPaletteOverride'

/**
 * Compose slide components with master/layout backgrounds
 */
function composeSlideWithBackgrounds(
  slide: PowerPointSlide, 
  masters?: Record<string, any>, 
  layouts?: Record<string, any>
): PowerPointComponent[] {
  const components: PowerPointComponent[] = [];
  
  console.log('🔍 Composing slide with backgrounds:', {
    slideNumber: slide.slideNumber,
    layoutId: slide.layoutId,
    hasLayouts: !!layouts,
    hasMasters: !!masters,
    layoutKeys: layouts ? Object.keys(layouts) : [],
    masterKeys: masters ? Object.keys(masters) : []
  });
  
  // 1. Add master background (deepest, z-index around -2000)
  if (slide.layoutId && layouts?.[`ppt/slideLayouts/${slide.layoutId}.xml`]) {
    const layout = layouts[`ppt/slideLayouts/${slide.layoutId}.xml`];
    console.log('🎨 Found layout:', layout.id, 'masterId:', layout.masterId);
    if (layout.masterId && masters?.[`ppt/slideMasters/${layout.masterId}.xml`]) {
      const master = masters[`ppt/slideMasters/${layout.masterId}.xml`];
      console.log('🎨 Found master:', master.id, 'has background:', !!master.background);
      if (master.background) {
        console.log('✅ Adding master background:', {
          type: master.background.type,
          id: master.background.id,
          fillColor: master.background.style?.fillColor,
          hasImageUrl: !!master.background.metadata?.imageUrl,
          imageUrl: master.background.metadata?.imageUrl?.substring(0, 100)
        });
        components.push(master.background);
      }
      // Add other master components too
      if (master.components) {
        console.log('✅ Adding master components:', master.components.length);
        components.push(...master.components);
      }
    } else {
      console.log('❌ Master not found:', `ppt/slideMasters/${layout.masterId}.xml`);
    }
  } else {
    console.log('❌ Layout not found:', `ppt/slideLayouts/${slide.layoutId}.xml`);
  }
  
  // 2. Add layout background (middle, z-index around -1000)
  if (slide.layoutId && layouts?.[`ppt/slideLayouts/${slide.layoutId}.xml`]) {
    const layout = layouts[`ppt/slideLayouts/${slide.layoutId}.xml`];
    console.log('🎨 Processing layout background:', layout.id, 'has background:', !!layout.background);
    if (layout.background) {
      console.log('✅ Adding layout background:', {
        type: layout.background.type,
        id: layout.background.id,
        fillColor: layout.background.style?.fillColor,
        hasImageUrl: !!layout.background.metadata?.imageUrl,
        imageUrl: layout.background.metadata?.imageUrl?.substring(0, 100)
      });
      components.push(layout.background);
    }
    // Add other layout components too
    if (layout.components) {
      console.log('✅ Adding layout components:', layout.components.length);
      components.push(...layout.components);
    }
  }
  
  // 3. Add slide background (slide-specific, z-index around -500)
  if (slide.background) {
    components.push(slide.background);
  }
  
  // 4. Add slide components (foreground, z-index 0+)
  components.push(...slide.components);
  
  return components;
}

export async function drawSlides(
  slides: PowerPointSlide[], 
  editor: Editor, 
  slideDimensions?: { width: number; height: number },
  masters?: Record<string, any>,
  layouts?: Record<string, any>,
  theme?: any
) {
  // Create and apply color mapping for all components in all slides
  const allComponents: PowerPointComponent[] = []
  slides.forEach(slide => {
    const composedComponents = composeSlideWithBackgrounds(slide, masters, layouts)
    allComponents.push(...composedComponents)
  })
  
  const colorMapping = createColorMapping(allComponents, undefined, theme)
  applyColorPaletteOverride(colorMapping)
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

    // Compose backgrounds and slide components
    const composedComponents = composeSlideWithBackgrounds(slide, masters, layouts);
    
    // Draw all components within this slide frame - await to prevent race conditions
    await drawComponentsInFrame(composedComponents, slideX, slideY, editor, slideIndex, frameId, { width: slideWidth, height: slideHeight }, colorMapping)
  }

  // Fit the viewport to show all slides
  if (slides.length > 0) {
    editor.zoomToFit({ animation: { duration: 500 } })
  }
}

export async function drawComponents(components: PowerPointComponent[], editor: Editor, theme?: any) {
  if (!editor || !components.length) return

  // Create and apply color mapping for components
  const colorMapping = createColorMapping(components, undefined, theme)
  applyColorPaletteOverride(colorMapping)

  // Clear existing shapes
  const allShapes = editor.getCurrentPageShapes()
  editor.deleteShapes(allShapes.map(shape => shape.id))

  // Draw components without slide frames (legacy mode) - no frame parent
  await drawComponentsInFrame(components, 0, 0, editor, 0, null, undefined, colorMapping)

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
  frameDimensions?: { width: number; height: number },
  colorMapping?: Map<string, TLDrawColor>
) {
  // Sort components by zIndex to ensure correct layering order
  const sortedComponents = [...components].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
  
  // Debug: Log component z-index order
  console.log('🔢 Component z-index order:', sortedComponents.map((c, i) => ({
    index: i,
    type: c.type,
    zIndex: c.zIndex,
    isBackground: c.content?.includes('Background') || c.id?.includes('Background'),
    name: c.id || c.content?.substring(0, 20)
  })))
  
  // Render each component in correct z-order
  for (let index = 0; index < sortedComponents.length; index++) {
    const component = sortedComponents[index]
    
    switch (component.type) {
      case 'text':
        await renderTextComponent(component, index, frameX, frameY, editor, slideIndex, frameId)
        break
      case 'shape':
        await renderShapeComponent(component, index, frameX, frameY, editor, slideIndex, frameId, colorMapping || new Map(), frameDimensions)
        break
      case 'image':
        await renderImageComponent(component, index, frameX, frameY, editor, slideIndex, frameId, frameDimensions)
        break
      case 'table':
        await renderTableComponent(component, index, frameX, frameY, editor, slideIndex, frameId)
        break
      case 'video':
        await renderVideoComponent(component, index, frameX, frameY, editor, slideIndex, frameId)
        break
      default:
        break
    }
  }
}