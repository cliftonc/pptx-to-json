// Remove unused ReactNode import
import type { PowerPointComponent, PowerPointSlide } from 'ppt-paste-parser'

/**
 * Supported canvas renderer types
 */
export type CanvasRendererType = 'tldraw' | 'konva' | 'fabric' | 'pixi'

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
  content?: any
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
  // Additional properties for extended functionality
  bold?: boolean
  italic?: boolean
  align?: 'left' | 'center' | 'right'
  lineHeight?: number
  textShadow?: boolean
  shadowOffset?: { x: number; y: number }
  shadowOpacity?: number
  shadowBlur?: number
  shadowColor?: string
  cornerRadius?: number
  borderColor?: string
  borderWidth?: number
  blur?: number
  brightness?: number
  contrast?: number
  dropShadow?: boolean
  headerBackground?: string
  cellBackground?: string
  alternateRowBackground?: string
  hasHeader?: boolean
  headerFontSize?: number
  headerColor?: string
  shapeType?: string
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
  thumbnailUrl?: string // R2 URL for slide thumbnail (never data: URLs)
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
export type CanvasMode = 'select' | 'edit' | 'draw' | 'text' | 'shape' | 'slideshow' | 'readonly'

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
  readonly type: CanvasRendererType
  readonly displayName: string
  initialize(
    container: HTMLElement,
    config: CanvasConfig
  ): Promise<void>
  loadSlides(
    slides: CanvasSlide[],
    dimensions?: CanvasDimensions
  ): Promise<void>
  loadComponents(
    components: CanvasComponent[],
    dimensions?: CanvasDimensions
  ): Promise<void>
  setMode(mode: CanvasMode): void
  updateConfig(config: Partial<CanvasConfig>): void
  navigateToSlide(slideIndex: number): Promise<void>
  getSnapshot(): Promise<any>
  loadSnapshot(snapshot: any): Promise<void>
  export(format: 'png' | 'svg' | 'json'): Promise<Blob | string>
  setEventHandlers(handlers: CanvasEventHandlers): void
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
    supportsExport: string[]
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
    zIndex: ppComponent.zIndex,
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
      type: 'color',
      value: typeof ppSlide.background === 'string' ? ppSlide.background : (ppSlide.background as any).content || ''
    } : undefined,
    dimensions: {
      width: (ppSlide.metadata as any)?.width || 720,
      height: (ppSlide.metadata as any)?.height || 540
    },
    metadata: ppSlide.metadata
  }
}

/**
 * Unified snapshot structure for saving presentation state across renderers.
 */
export interface RendererStates {
  tldraw?: {
    document: any
    session: any
  }
  konva?: any
  fabric?: any
  pixi?: any
}

export interface UnifiedSnapshotMeta {
  createdAt: string
  updatedAt: string
  title?: string
  source?: 'clipboard' | 'uploaded_file' | string
}

export interface UnifiedSnapshotV1 {
  version: 1
  slides: PowerPointSlide[]
  originalParsed?: any
  rendererStates: RendererStates
  metadata: UnifiedSnapshotMeta
  slideDimensions?: { width: number; height: number }
}

export type AnyUnifiedSnapshot = UnifiedSnapshotV1 | { snapshot: any }
