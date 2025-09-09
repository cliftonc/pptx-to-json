import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { Editor, getSnapshot } from '@tldraw/tldraw'
import type { 
  CanvasRenderer,
  CanvasConfig,
  CanvasEventHandlers,
  CanvasSlide,
  CanvasComponent,
  CanvasDimensions,
  CanvasMode
} from '../../../types/canvas'
import type { PowerPointSlide, PowerPointComponent } from 'ppt-paste-parser'
import TldrawCanvas from './TldrawCanvas'

// Global map to track React roots by container
const containerRootsMap = new WeakMap<HTMLElement, Root>()

/**
 * TLDraw implementation of the CanvasRenderer interface
 * Wraps the existing TldrawCanvas component to provide a standardized interface
 */
export class TldrawRenderer implements CanvasRenderer {
  readonly type = 'tldraw' as const
  readonly displayName = 'TLDraw Canvas'

  private reactRoot: Root | null = null
  private editor: Editor | null = null
  private container: HTMLElement | null = null
  private isRootCreated: boolean = false
  private config: CanvasConfig = {
    mode: 'select',
    showGrid: false,
    snapToGrid: false,
    gridSize: 20,
    enableZoom: true,
    enablePan: true,
    maxZoom: 8,
    minZoom: 0.1,
    backgroundColor: '#ffffff',
    darkMode: false
  }
  private eventHandlers: CanvasEventHandlers = {}
  private canvasRef = React.createRef<any>()
  private currentProps: any = {}

  /**
   * Initialize the TLDraw canvas in the container
   */
  async initialize(container: HTMLElement, config: CanvasConfig): Promise<void> {
    this.config = { ...this.config, ...config }
    this.container = container
    
    // Check if this container already has a React root
    let existingRoot = containerRootsMap.get(container)
    
    if (existingRoot) {
      console.log('Reusing existing React root for container')
      this.reactRoot = existingRoot
      this.isRootCreated = true
    } else {
      // Clear container first to avoid conflicts
      container.innerHTML = ''
      
      // Create new React root and store it
      this.reactRoot = createRoot(container)
      containerRootsMap.set(container, this.reactRoot)
      this.isRootCreated = true
      console.log('Created new React root for container')
    }
    
    // Set initial props
    this.currentProps = {
      ref: this.canvasRef,
      components: [],
      slides: [],
      slideDimensions: { width: 720, height: 540 },
      onEditorMount: (editor: Editor) => {
        this.editor = editor
      }
    }
    
    return new Promise((resolve) => {
      this.renderCanvas({
        ...this.currentProps,
        onEditorMount: (editor: Editor) => {
          this.editor = editor
          resolve()
        }
      })
    })
  }

  /**
   * Internal method to render the canvas with current props
   */
  private renderCanvas(props: any) {
    if (this.reactRoot) {
      this.reactRoot.render(<TldrawCanvas {...props} />)
    }
  }

  /**
   * Load slides into the canvas
   */
  async loadSlides(slides: CanvasSlide[], dimensions?: CanvasDimensions): Promise<void> {
    // Convert CanvasSlides back to PowerPointSlides for TldrawCanvas
    const ppSlides: PowerPointSlide[] = slides.map((slide, index) => ({
      slideIndex: index,
      slideNumber: slide.slideNumber,
      components: slide.components.map(this.canvasComponentToPowerPointComponent),
      metadata: {
        ...slide.metadata,
        width: slide.dimensions.width,
        height: slide.dimensions.height
      }
    }))

    // Update props and re-render
    this.currentProps = {
      ...this.currentProps,
      components: [],
      slides: ppSlides,
      slideDimensions: dimensions || { width: 720, height: 540 }
    }
    
    this.renderCanvas(this.currentProps)
  }

  /**
   * Load individual components (legacy support)
   */
  async loadComponents(components: CanvasComponent[], dimensions?: CanvasDimensions): Promise<void> {
    // Convert to PowerPoint components
    const ppComponents: PowerPointComponent[] = components.map(this.canvasComponentToPowerPointComponent)
    
    // Update props and re-render
    this.currentProps = {
      ...this.currentProps,
      components: ppComponents,
      slides: [],
      slideDimensions: dimensions || { width: 720, height: 540 }
    }
    
    this.renderCanvas(this.currentProps)
  }

  /**
   * Convert CanvasComponent back to PowerPointComponent
   */
  private canvasComponentToPowerPointComponent(canvasComp: CanvasComponent): PowerPointComponent {
    return {
      id: canvasComp.id,
      type: canvasComp.type,
      content: canvasComp.content || '',
      x: canvasComp.x,
      y: canvasComp.y,
      width: canvasComp.width,
      height: canvasComp.height,
      rotation: canvasComp.rotation,
      style: canvasComp.style,
      metadata: {
        ...canvasComp.metadata,
        opacity: canvasComp.opacity,
        visible: canvasComp.visible
      },
      slideIndex: 0, // Will be set properly when used
      zIndex: 0
    }
  }

  /**
   * Set the current canvas mode
   */
  setMode(mode: CanvasMode): void {
    this.config.mode = mode
    
    // TLDraw modes mapping
    if (this.editor) {
      switch (mode) {
        case 'select':
          this.editor.setCurrentTool('select')
          break
        case 'draw':
          this.editor.setCurrentTool('draw')
          break
        case 'text':
          this.editor.setCurrentTool('text')
          break
        case 'shape':
          this.editor.setCurrentTool('geo')
          break
        case 'readonly':
          this.editor.updateInstanceState({ isReadonly: true })
          break
        case 'slideshow':
          // Slideshow mode is handled by the slideshow manager
          break
      }
    }
  }

  /**
   * Update canvas configuration
   */
  updateConfig(config: Partial<CanvasConfig>): void {
    this.config = { ...this.config, ...config }
    
    if (this.editor && config.mode) {
      this.setMode(config.mode)
    }
  }

  /**
   * Navigate to a specific slide
   */
  async navigateToSlide(slideIndex: number): Promise<void> {
    // TLDraw slideshow navigation is handled by the slideshow manager
    // This is a placeholder for the interface
    if (this.eventHandlers.onSlideChange) {
      this.eventHandlers.onSlideChange(slideIndex)
    }
  }

  /**
   * Get current canvas state as JSON
   */
  async getSnapshot(): Promise<any> {
    if (!this.editor) {
      throw new Error('Editor not initialized')
    }
    
    return getSnapshot(this.editor.store)
  }

  /**
   * Load canvas state from JSON
   */
  async loadSnapshot(snapshot: any): Promise<void> {
    // Update props and re-render with snapshot
    this.currentProps = {
      ...this.currentProps,
      components: [],
      slides: [],
      slideDimensions: { width: 720, height: 540 },
      initialSnapshot: snapshot
    }
    
    this.renderCanvas(this.currentProps)
  }

  /**
   * Export canvas content
   */
  async export(format: 'png' | 'svg' | 'json'): Promise<Blob | string> {
    if (!this.editor) {
      throw new Error('Editor not initialized')
    }

    switch (format) {
      case 'json':
        return JSON.stringify(await this.getSnapshot())
      case 'svg':
        // Simplified SVG export - delegate to existing TLDraw functionality
        return 'SVG export not implemented yet'
      case 'png':
        // Simplified PNG export - delegate to existing TLDraw functionality  
        return 'PNG export not implemented yet'
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * Register event handlers
   */
  setEventHandlers(handlers: CanvasEventHandlers): void {
    this.eventHandlers = handlers
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    return new Promise((resolve) => {
      if (this.reactRoot && this.isRootCreated) {
        try {
          this.reactRoot.unmount()
        } catch (error) {
          console.warn('Error unmounting React root:', error)
        } finally {
          this.reactRoot = null
          this.isRootCreated = false
        }
      }
      
      this.editor = null
      this.container = null
      this.currentProps = {}
      
      // Small delay to ensure cleanup is complete
      setTimeout(resolve, 10)
    })
  }
}

/**
 * Factory function to create a TLDraw renderer instance
 */
export async function createTldrawRenderer(
  container: HTMLElement,
  config: CanvasConfig,
  handlers?: CanvasEventHandlers
): Promise<CanvasRenderer> {
  const renderer = new TldrawRenderer()
  await renderer.initialize(container, config)
  
  if (handlers) {
    renderer.setEventHandlers(handlers)
  }
  
  return renderer
}