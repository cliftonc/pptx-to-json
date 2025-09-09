// Font options for toolbar
export const FONT_OPTIONS = [
  { label: 'Default', value: 'DEFAULT' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Courier New', value: 'Courier New' },
] as const

export const FONT_SIZE_OPTIONS = [
  { label: 'Default', value: 'DEFAULT' },
  { label: '8pt', value: '8pt' },
  { label: '9pt', value: '9pt' },
  { label: '10pt', value: '10pt' },
  { label: '11pt', value: '11pt' },
  { label: '12pt', value: '12pt' },
  { label: '14pt', value: '14pt' },
  { label: '16pt', value: '16pt' },
  { label: '18pt', value: '18pt' },
  { label: '20pt', value: '20pt' },
  { label: '24pt', value: '24pt' },
  { label: '28pt', value: '28pt' },
  { label: '32pt', value: '32pt' },
  { label: '36pt', value: '36pt' },
  { label: '48pt', value: '48pt' },
  { label: '72pt', value: '72pt' },
] as const

// Color options for text toolbar
export const COLOR_OPTIONS = [
  { label: 'Default', value: 'DEFAULT', color: '#000000' },
  { label: 'Black', value: '#000000', color: '#000000' },
  { label: 'Grey', value: '#6b7280', color: '#6b7280' },
  { label: 'Light Violet', value: '#c084fc', color: '#c084fc' },
  { label: 'Violet', value: '#8b5cf6', color: '#8b5cf6' },
  { label: 'Blue', value: '#3b82f6', color: '#3b82f6' },
  { label: 'Light Blue', value: '#06b6d4', color: '#06b6d4' },
  { label: 'Yellow', value: '#eab308', color: '#eab308' },
  { label: 'Orange', value: '#f97316', color: '#f97316' },
  { label: 'Green', value: '#22c55e', color: '#22c55e' },
  { label: 'Light Green', value: '#84cc16', color: '#84cc16' },
  { label: 'Light Red', value: '#fb7185', color: '#fb7185' },
  { label: 'Red', value: '#ef4444', color: '#ef4444' },
] as const

// Slide layout constants
export const SLIDE_LAYOUT = {
  SLIDE_SPACING: 200,
  SLIDES_PER_ROW: 4,
  STANDARD_WIDTH: 1280,
  STANDARD_HEIGHT: 720,
  PADDING: 50,
  COMPONENT_BOUNDS_PADDING: 50,
} as const

// PowerPoint shape type mappings
export const POWERPOINT_SHAPE_MAPPINGS = {
  rect: 'rectangle',
  rectangle: 'rectangle',
  ellipse: 'ellipse',
  oval: 'ellipse',
  triangle: 'triangle',
  rtTriangle: 'triangle',
  diamond: 'diamond',
  pentagon: 'pentagon',
  hexagon: 'hexagon',
  octagon: 'octagon',
  rightArrow: 'arrow-right',
  leftArrow: 'arrow-left',
  upArrow: 'arrow-up',
  downArrow: 'arrow-down',
  trapezoid: 'trapezoid',
  cloud: 'cloud',
  heart: 'heart',
} as const

// Star shape variations
export const STAR_SHAPES = [
  'star4', 'star5', 'star6', 'star8', 'star10', 'star12', 
  'star16', 'star24', 'star32',
  '4-point star', '5-point star', '6-point star', '8-point star',
  '10-point star', '12-point star', '16-point star', '24-point star', '32-point star'
] as const

// Arrow shape variations
export const ARROW_SHAPES = {
  'right arrow': 'arrow-right',
  'left arrow': 'arrow-left',
  'up arrow': 'arrow-up',
  'down arrow': 'arrow-down',
} as const

// TLDraw color options
export type TLDrawColor = 
  | 'black' | 'grey' | 'light-violet' | 'violet' 
  | 'blue' | 'light-blue' | 'yellow' | 'orange' 
  | 'green' | 'light-green' | 'light-red' | 'red'

// TLDraw geometry types
export type TLDrawGeoType = 
  | 'rectangle' | 'ellipse' | 'triangle' | 'diamond' 
  | 'pentagon' | 'hexagon' | 'octagon' | 'star' | 'rhombus' 
  | 'oval' | 'trapezoid' | 'arrow-right' | 'arrow-left' 
  | 'arrow-up' | 'arrow-down' | 'x-box' | 'check-box' 
  | 'cloud' | 'heart'

// TLDraw font types
export type TLDrawFont = 'draw' | 'sans' | 'serif' | 'mono'

// TLDraw size types
export type TLDrawSize = 's' | 'm' | 'l' | 'xl'

// PowerPoint standard colors
export const POWERPOINT_COLORS = {
  '#000000': 'black',
  '#ffffff': 'grey', // tldraw doesn't have white, use light grey
  '#ed7d31': 'orange', // PowerPoint orange
  '#4472c4': 'blue', // PowerPoint blue
  '#5b9bd5': 'light-blue', // PowerPoint light blue
  '#70ad47': 'green', // PowerPoint green
  '#ffc000': 'yellow', // PowerPoint yellow
  '#c55a5a': 'red', // PowerPoint red
  '#e97132': 'orange', // API orange
  '#4ea72e': 'green', // API green
} as const