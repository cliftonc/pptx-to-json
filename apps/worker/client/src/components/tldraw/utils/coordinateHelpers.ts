import type { PowerPointComponent } from 'ppt-paste-parser'

/**
 * Adjusts position for rotation around center
 * PowerPoint gives us top-left of unrotated shape, but TLDraw needs adjusted position
 */
export function adjustPositionForRotation(
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number
): { x: number; y: number } {
  if (!rotation || rotation === 0) {
    return { x, y }
  }

  const angleRad = (rotation * Math.PI) / 180
  
  // Original center point
  const originalCenterX = x + width / 2
  const originalCenterY = y + height / 2
  
  // The center stays the same, we need to find new top-left after rotation
  const newX = originalCenterX - (width / 2) * Math.cos(angleRad) + (height / 2) * Math.sin(angleRad)
  const newY = originalCenterY - (width / 2) * Math.sin(angleRad) - (height / 2) * Math.cos(angleRad)
  
  return { x: newX, y: newY }
}

/**
 * Converts degrees to radians for TLDraw
 */
export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Calculates component bounds for slide sizing
 */
export function calculateComponentBounds(components: PowerPointComponent[]) {
  if (components.length === 0) {
    return { maxX: 0, maxY: 0 }
  }
  
  let maxX = 0
  let maxY = 0
  
  components.forEach(comp => {
    const compMaxX = (comp.x || 0) + (comp.width || 0)
    const compMaxY = (comp.y || 0) + (comp.height || 0)
    
    if (compMaxX > maxX) maxX = compMaxX
    if (compMaxY > maxY) maxY = compMaxY
  })
  
  return { maxX, maxY }
}

/**
 * Calculates slide position in grid layout
 */
export function calculateSlidePosition(
  slideIndex: number,
  slideWidth: number,
  slideHeight: number,
  slideSpacing: number,
  slidesPerRow: number,
  startOffset: number = 50
): { x: number; y: number } {
  const col = slideIndex % slidesPerRow
  const row = Math.floor(slideIndex / slidesPerRow)
  
  return {
    x: col * (slideWidth + slideSpacing) + startOffset,
    y: row * (slideHeight + slideSpacing) + startOffset
  }
}

/**
 * Calculates position relative to frame
 */
export function calculateFrameRelativePosition(
  componentX: number,
  componentY: number,
  frameX: number,
  frameY: number,
  scale: number = 1,
  isInFrame: boolean = false
): { x: number; y: number } {
  if (isInFrame) {
    // When inside a frame, use component's original coordinates relative to frame
    return {
      x: componentX * scale,
      y: componentY * scale
    }
  } else {
    // When not in frame, add frame offset
    return {
      x: frameX + componentX * scale,
      y: frameY + componentY * scale
    }
  }
}

