// Remove unused ReactNode import
import type { PowerPointComponent, PowerPointSlide } from 'ppt-paste-parser'

/**
 * Supported canvas renderer types
 */
export type CanvasRendererType = 'tldraw' | 'konva'

/**
 * Common canvas component data structure
 */
export interface CanvasComponent {
  id: string
  type: 'text' | 'image' | 'shape' | 'table' | 'video' | 'connection' | 'unknown'
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  opacity?: number
  visible?: boolean
  locked?: boolean
  zIndex?: number
  content?: any // Renderer-specific content
  style?: CanvasComponentStyle
  metadata?: Record<string, any>
}

/**
 * Canvas component styling options
 */
export interface CanvasComponentStyle {
  fill?: string
  stroke?: string
  strokeWidth?: number
  fontSize?: number
  fontFamily?: string
  fontWeight?: 'normal' | 'bold'
  fontStyle?: 'normal' | 'italic'
  textAlign?: 'left' | 'center' | 'right'
  color?: string
  backgroundColor?: string
  borderRadius?: number
  shadow?: boolean
  gradient?: {
    type: 'linear' | 'radial'
    stops: Array<{ offset: number; color: string }>
  }
}

/**
 * Canvas slide representation
 */
export interface CanvasSlide {
  id: string
  name?: string
  slideNumber: number
  components: CanvasComponent[]
  background?: {
    type: 'color' | 'image' | 'gradient'
    value: string | CanvasComponentStyle['gradient']
  }
  dimensions: {
    width: number
    height: number
  }
  metadata?: Record<string, any>
}

/**
 * Canvas dimensions and viewport settings
 */
export interface CanvasDimensions {
  width: number
  height: number
  scale?: number
  offsetX?: number
  offsetY?: number
}

/**
 * Canvas interaction modes
 */
export type CanvasMode = 'select' | 'draw' | 'text' | 'shape' | 'slideshow' | 'readonly'

/**
 * Canvas event handlers
 */
export interface CanvasEventHandlers {
  onComponentSelect?: (componentId: string | null) => void
  onComponentUpdate?: (componentId: string, updates: Partial<CanvasComponent>) => void
  onComponentDelete?: (componentId: string) => void
  onSlideChange?: (slideIndex: number) => void
  onModeChange?: (mode: CanvasMode) => void
  onSave?: () => Promise<void>
  onExport?: (format: 'png' | 'svg' | 'json') => Promise<void>
}

/**
 * Canvas configuration options
 */
export interface CanvasConfig {
  mode: CanvasMode
  showGrid?: boolean
  snapToGrid?: boolean
  gridSize?: number
  enableZoom?: boolean
  enablePan?: boolean
  maxZoom?: number
  minZoom?: number
  backgroundColor?: string
  darkMode?: boolean
}

/**
 * Base canvas renderer interface that all implementations must satisfy
 */
export interface CanvasRenderer {
  /**
   * Unique identifier for this renderer
   */
  readonly type: CanvasRendererType
  
  /**
   * Human-readable display name
   */
  readonly displayName: string
  
  /**
   * Initialize the canvas with data
   */
  initialize(
    container: HTMLElement,
    config: CanvasConfig
  ): Promise<void>
  
  /**
   * Load slides into the canvas
   */
  loadSlides(
    slides: CanvasSlide[],
    dimensions?: CanvasDimensions
  ): Promise<void>
  
  /**
   * Load individual components (legacy support)
   */
  loadComponents(
    components: CanvasComponent[],
    dimensions?: CanvasDimensions
  ): Promise<void>
  
  /**
   * Set the current canvas mode
   */
  setMode(mode: CanvasMode): void
  
  /**
   * Update canvas configuration
   */
  updateConfig(config: Partial<CanvasConfig>): void
  
  /**
   * Navigate to a specific slide (for slideshow mode)
   */
  navigateToSlide(slideIndex: number): Promise<void>
  
  /**
   * Get current canvas state as JSON
   */
  getSnapshot(): Promise<any>
  
  /**
   * Load canvas state from JSON
   */
  loadSnapshot(snapshot: any): Promise<void>
  
  /**
   * Export canvas content
   */
  export(format: 'png' | 'svg' | 'json'): Promise<Blob | string>
  
  /**
   * Register event handlers
   */
  setEventHandlers(handlers: CanvasEventHandlers): void
  
  /**
   * Clean up resources
   */
  destroy(): void
}

/**
 * Factory function type for creating canvas renderers
 */
export type CanvasRendererFactory = (
  container: HTMLElement,
  config: CanvasConfig,
  handlers?: CanvasEventHandlers
) => Promise<CanvasRenderer>

/**
 * Canvas renderer registry entry
 */
export interface CanvasRendererInfo {
  type: CanvasRendererType
  displayName: string
  description: string
  factory: CanvasRendererFactory
  capabilities: {
    supportsSlideshow: boolean
    supportsRichText: boolean
    supportsAnimations: boolean
    supportsCollaboration: boolean
    supportsExport: string[] // supported export formats
  }
}

/**
 * Convert PowerPoint components to canvas components
 */
export function powerPointToCanvasComponent(ppComponent: PowerPointComponent): CanvasComponent {
  return {
    id: ppComponent.id || `comp-${Math.random().toString(36).substr(2, 9)}`,
    type: ppComponent.type,
    x: ppComponent.x,
    y: ppComponent.y,
    width: ppComponent.width,
    height: ppComponent.height,
    rotation: ppComponent.rotation,
    opacity: ppComponent.metadata?.opacity,
    visible: ppComponent.metadata?.visible !== false,
    locked: false,
    zIndex: ppComponent.zIndex, // Preserve zIndex as top-level property
    content: ppComponent.content,
    style: ppComponent.style ? {
      fill: ppComponent.style.fill,
      stroke: ppComponent.style.stroke,
      strokeWidth: ppComponent.style.strokeWidth,
      fontSize: ppComponent.style.fontSize,
      fontFamily: ppComponent.style.fontFamily,
      fontWeight: ppComponent.style.fontWeight,
      fontStyle: ppComponent.style.fontStyle,
      textAlign: ppComponent.style.textAlign,
      color: ppComponent.style.color,
      backgroundColor: ppComponent.style.backgroundColor
    } : undefined,
    metadata: ppComponent.metadata
  }
}

/**
 * Convert PowerPoint slides to canvas slides
 */
export function powerPointToCanvasSlide(ppSlide: PowerPointSlide): CanvasSlide {
  return {
    id: `slide-${ppSlide.slideIndex}`,
    name: ppSlide.metadata?.name || `Slide ${ppSlide.slideNumber}`,
    slideNumber: ppSlide.slideNumber,
    components: ppSlide.components.map(powerPointToCanvasComponent),
    background: ppSlide.background ? {
      type: 'color', // PowerPoint backgrounds are typically colors for now
      value: typeof ppSlide.background === 'string' ? ppSlide.background : ppSlide.background.content || ''
    } : undefined,
    dimensions: {
      width: ppSlide.metadata?.width || 720,
      height: ppSlide.metadata?.height || 540
    },
    metadata: ppSlide.metadata
  }
}