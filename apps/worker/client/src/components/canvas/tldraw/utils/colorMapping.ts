import type { TLDrawColor } from '../constants'
import { POWERPOINT_COLORS } from '../constants'

/**
 * Maps PowerPoint hex colors to TLDraw color names
 */
export function mapPowerPointColorToTLDraw(hexColor: string | undefined): TLDrawColor {
  if (!hexColor) return 'black'
  
  const normalizedColor = hexColor.toLowerCase()
  
  // Check for exact matches first
  const exactMatch = POWERPOINT_COLORS[normalizedColor as keyof typeof POWERPOINT_COLORS]
  if (exactMatch) return exactMatch as TLDrawColor
  
  // Fallback to pattern matching
  if (normalizedColor.startsWith('#ff') || normalizedColor.startsWith('#e') || normalizedColor.startsWith('#d')) {
    // Reddish/orange colors
    if (normalizedColor.includes('7') || normalizedColor.includes('8') || normalizedColor.includes('9')) {
      return 'orange'
    } else {
      return 'red'
    }
  }
  
  if (normalizedColor.startsWith('#4') || (normalizedColor.startsWith('#0') && normalizedColor.includes('a'))) {
    return 'green'
  }
  
  if (normalizedColor.startsWith('#0')) {
    return 'blue'
  }
  
  return 'black' // Default fallback
}

/**
 * Maps PowerPoint background colors for shapes with better color matching
 */
export function mapBackgroundColor(backgroundColor: string | undefined): TLDrawColor {
  if (!backgroundColor || backgroundColor === 'transparent') {
    return 'grey'
  }
  
  const hexColor = backgroundColor.toLowerCase()
  
  // Specific color mappings
  if (hexColor === '#000000') return 'black'
  if (hexColor === '#ffffff') return 'grey' // tldraw doesn't have white, use light grey
  
  // PowerPoint standard colors
  if (hexColor === '#ed7d31') return 'orange' // PowerPoint orange
  if (hexColor === '#4472c4') return 'blue' // PowerPoint blue
  if (hexColor === '#5b9bd5') return 'light-blue' // PowerPoint light blue
  if (hexColor === '#70ad47') return 'green' // PowerPoint green
  if (hexColor === '#ffc000') return 'yellow' // PowerPoint yellow
  if (hexColor === '#c55a5a') return 'red' // PowerPoint red
  
  // Color range matching
  if (hexColor.startsWith('#ed') || hexColor.startsWith('#e9') || (hexColor.startsWith('#f') && !hexColor.includes('ff'))) {
    return 'orange'
  }
  if (hexColor.startsWith('#44') || hexColor.startsWith('#45')) return 'blue'
  if (hexColor.startsWith('#5b') || hexColor.startsWith('#5a')) return 'light-blue'
  if (hexColor.startsWith('#70') || hexColor.startsWith('#6') || hexColor.startsWith('#4e')) return 'green'
  if (hexColor.startsWith('#ff') && hexColor.includes('c')) return 'yellow'
  if (hexColor.startsWith('#ff') && !hexColor.includes('c')) return 'red'
  if (hexColor.startsWith('#c5') || hexColor.includes('red')) return 'red'
  if (hexColor.startsWith('#e7') || hexColor.startsWith('#a5')) return 'grey'
  
  // Fallback by first character
  if (hexColor.startsWith('#4')) return 'blue'
  if (hexColor.startsWith('#5')) return 'light-blue'
  if (hexColor.startsWith('#7') || hexColor.startsWith('#6')) return 'green'
  if (hexColor.startsWith('#e') || hexColor.startsWith('#f')) return 'orange'
  
  return 'grey'
}

/**
 * Maps PowerPoint border colors for shapes
 */
export function mapBorderColor(borderColor: string | undefined): TLDrawColor {
  if (!borderColor || borderColor === 'transparent') {
    return 'black'
  }
  
  const hexColor = borderColor.toLowerCase()
  
  // Specific color mappings for borders
  if (hexColor === '#000000') return 'black'
  if (hexColor === '#ffffff') return 'grey'
  
  // PowerPoint standard colors
  if (hexColor === '#ed7d31') return 'orange' // PowerPoint orange
  if (hexColor === '#4472c4') return 'blue' // PowerPoint blue
  if (hexColor === '#5b9bd5') return 'light-blue' // PowerPoint light blue
  if (hexColor === '#70ad47') return 'green' // PowerPoint green
  if (hexColor === '#ffc000') return 'yellow' // PowerPoint yellow
  if (hexColor === '#c55a5a') return 'red' // PowerPoint red
  
  // Color range matching
  if (hexColor.startsWith('#ed') || hexColor.startsWith('#e9') || (hexColor.startsWith('#f') && !hexColor.includes('ff'))) {
    return 'orange'
  }
  if (hexColor.startsWith('#44') || hexColor.startsWith('#45')) return 'blue'
  if (hexColor.startsWith('#5b') || hexColor.startsWith('#5a')) return 'light-blue'
  if (hexColor.startsWith('#70') || hexColor.startsWith('#6') || hexColor.startsWith('#4e')) return 'green'
  if (hexColor.startsWith('#ff') && hexColor.includes('c')) return 'yellow'
  if (hexColor.startsWith('#ff') && !hexColor.includes('c')) return 'red'
  if (hexColor.startsWith('#c5') || hexColor.includes('red')) return 'red'
  if (hexColor.startsWith('#e7') || hexColor.startsWith('#a5')) return 'grey'
  
  // Fallback by first character
  if (hexColor.startsWith('#4')) return 'blue'
  if (hexColor.startsWith('#5')) return 'light-blue'
  if (hexColor.startsWith('#7') || hexColor.startsWith('#6')) return 'green'
  if (hexColor.startsWith('#e') || hexColor.startsWith('#f')) return 'orange'
  
  return 'black'
}