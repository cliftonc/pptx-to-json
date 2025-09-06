import type { PowerPointComponent, PowerPointSlide } from 'ppt-paste-parser'
import type { TLDrawColor } from '../constants'

// Default TLDraw color hex values for mapping
const TLDRAW_COLOR_VALUES: Record<TLDrawColor, string> = {
  'black': '#1d1d1d',
  'grey': '#9fa8b2', 
  'light-violet': '#e085f4',
  'violet': '#ae3ec9',
  'blue': '#4465e9',
  'light-blue': '#4ba1f1',
  'yellow': '#f1ac4b',
  'orange': '#e16919',
  'green': '#099268',
  'light-green': '#4cb05e',
  'light-red': '#f87777',
  'red': '#e03131'
}

/**
 * Calculate color distance using simple RGB difference
 */
function calculateColorDistance(hex1: string, hex2: string): number {
  const r1 = parseInt(hex1.slice(1, 3), 16)
  const g1 = parseInt(hex1.slice(3, 5), 16) 
  const b1 = parseInt(hex1.slice(5, 7), 16)
  
  const r2 = parseInt(hex2.slice(1, 3), 16)
  const g2 = parseInt(hex2.slice(3, 5), 16)
  const b2 = parseInt(hex2.slice(5, 7), 16)
  
  return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2))
}

/**
 * Find the closest TLDraw color to a given hex color
 */
function findClosestTldrawColor(targetHex: string): TLDrawColor {
  let closestColor: TLDrawColor = 'black'
  let closestDistance = Infinity
  
  for (const [colorName, colorHex] of Object.entries(TLDRAW_COLOR_VALUES)) {
    const distance = calculateColorDistance(targetHex.toUpperCase(), colorHex.toUpperCase())
    if (distance < closestDistance) {
      closestDistance = distance
      closestColor = colorName as TLDrawColor
    }
  }
  
  return closestColor
}

/**
 * Maps PowerPoint colors to closest TLDraw colors based on visual similarity
 */
export function createColorMapping(components: PowerPointComponent[], slides?: PowerPointSlide[], theme?: any): Map<string, TLDrawColor> {
  const uniqueColors = new Set<string>()
  
  // Collect colors from components
  components.forEach(component => {
    if (component.style?.fillColor && component.style.fillColor !== 'transparent') {
      uniqueColors.add(component.style.fillColor)
    }
    if (component.style?.borderColor && component.style.borderColor !== 'transparent') {
      uniqueColors.add(component.style.borderColor)
    }
  })
  
  // Collect colors from slides
  slides?.forEach(slide => {
    slide.components?.forEach(component => {
      if (component.style?.fillColor && component.style.fillColor !== 'transparent') {
        uniqueColors.add(component.style.fillColor)
      }
      if (component.style?.borderColor && component.style.borderColor !== 'transparent') {
        uniqueColors.add(component.style.borderColor)
      }
    })
  })
  
  const colorMapping = new Map<string, TLDrawColor>()
  
  // Map each PowerPoint color to the closest TLDraw color
  Array.from(uniqueColors).forEach((hexColor) => {
    const closestTldrawColor = findClosestTldrawColor(hexColor)
    colorMapping.set(hexColor, closestTldrawColor)
    console.log(`🎨 Mapped ${hexColor} → ${closestTldrawColor} (${TLDRAW_COLOR_VALUES[closestTldrawColor]})`)
  })
  
  // Log theme colors if available for debugging
  if (theme?.colors) {
    console.log('🎨 PowerPoint theme colors detected:', theme.colors)
  }
  
  return colorMapping
}

/**
 * No-op function - TLDraw doesn't support runtime palette overrides
 * Colors are mapped to closest defaults instead
 */
export function applyColorPaletteOverride(colorMapping: Map<string, TLDrawColor>): void {
  console.log('🎨 Color mapping created:', Object.fromEntries(colorMapping))
  // TLDraw uses its default palette - we just map to closest colors
}

/**
 * Gets the TLDraw color name for a hex color
 */
export function getTldrawColorForHex(hexColor: string | undefined, colorMapping: Map<string, TLDrawColor>): TLDrawColor {
  if (!hexColor || hexColor === 'transparent') {
    return 'black'
  }
  
  return colorMapping.get(hexColor) || 'black'
}

/**
 * No-op function - no palette override to restore
 */
export function restoreOriginalColorPalette(): void {
  // Nothing to restore since we don't override TLDraw's palette
}

/**
 * Maps PowerPoint border style to TLDraw dash style
 */
export function mapBorderStyleToDash(borderStyle?: string): 'draw' | 'solid' | 'dashed' | 'dotted' {
  if (!borderStyle || borderStyle === 'none' || borderStyle === 'solid') {
    return 'solid'
  }
  
  switch (borderStyle) {
    case 'dashed':
    case 'dash':
    case 'dashDot':
      return 'dashed'
    case 'dotted':
    case 'dot':
      return 'dotted'
    default:
      return 'solid'
  }
}

/**
 * Maps PowerPoint border width to TLDraw size
 */
export function mapBorderWidthToSize(borderWidth?: number): 's' | 'm' | 'l' | 'xl' {
  if (!borderWidth || borderWidth <= 1) {
    return 's'
  } else if (borderWidth <= 3) {
    return 'm'
  } else if (borderWidth <= 6) {
    return 'l'
  } else {
    return 'xl'
  }
}