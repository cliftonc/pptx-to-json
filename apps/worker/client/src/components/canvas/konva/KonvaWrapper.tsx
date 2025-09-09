import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { 
  CanvasRenderer,
  CanvasConfig,
  CanvasEventHandlers,
  CanvasSlide,
  CanvasComponent,
  CanvasDimensions,
  CanvasMode
} from '../../../types/canvas'
import KonvaCanvas from './KonvaCanvas'

/**
 * Konva implementation of the CanvasRenderer interface
 * Features slide-based navigation with carousel thumbnails
 */
export class KonvaRenderer implements CanvasRenderer {
  readonly type = 'konva' as const
  readonly displayName = 'Konva Canvas'

  private reactRoot: Root | null = null
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
  private slides: CanvasSlide[] = []
  private currentSlideIndex = 0
  private canvasRef = React.createRef<any>()

  /**
   * Initialize the Konva canvas in the container
   */
  async initialize(container: HTMLElement, config: CanvasConfig): Promise<void> {
    this.config = { ...this.config, ...config }
    
    // Create React root for rendering Konva
    this.reactRoot = createRoot(container)
    
    return new Promise((resolve) => {
      this.reactRoot!.render(
        <KonvaCanvas
          ref={this.canvasRef}
          slides={this.slides}
          currentSlideIndex={this.currentSlideIndex}
          config={this.config}
          eventHandlers={this.eventHandlers}
          onSlideSelect={(slideIndex: number) => {
            this.navigateToSlide(slideIndex)
          }}
          onReady={() => resolve()}
        />
      )
    })
  }

  /**
   * Load slides into the canvas
   */
  async loadSlides(slides: CanvasSlide[], dimensions?: CanvasDimensions): Promise<void> {
    this.slides = slides
    this.currentSlideIndex = 0 // Always start with first slide
    
    // Re-render with new slides
    if (this.reactRoot) {
      this.reactRoot.render(
        <KonvaCanvas
          ref={this.canvasRef}
          slides={this.slides}
          currentSlideIndex={this.currentSlideIndex}
          config={this.config}
          eventHandlers={this.eventHandlers}
          onSlideSelect={(slideIndex: number) => {
            this.navigateToSlide(slideIndex)
          }}
        />
      )
    }
  }

  /**
   * Load individual components (legacy support)
   * Converts components to a single slide
   */
  async loadComponents(components: CanvasComponent[], dimensions?: CanvasDimensions): Promise<void> {
    const slide: CanvasSlide = {
      id: 'legacy-slide',
      name: 'Components',
      slideNumber: 1,
      components,
      dimensions: dimensions || { width: 720, height: 540 }
    }
    
    await this.loadSlides([slide], dimensions)
  }

  /**
   * Set the current canvas mode
   */
  setMode(mode: CanvasMode): void {
    this.config.mode = mode
    this.updateCanvas()
  }

  /**
   * Update canvas configuration
   */
  updateConfig(config: Partial<CanvasConfig>): void {
    this.config = { ...this.config, ...config }
    this.updateCanvas()
  }

  /**
   * Navigate to a specific slide
   */
  async navigateToSlide(slideIndex: number): Promise<void> {
    if (slideIndex >= 0 && slideIndex < this.slides.length) {
      this.currentSlideIndex = slideIndex
      this.updateCanvas()
      
      if (this.eventHandlers.onSlideChange) {
        this.eventHandlers.onSlideChange(slideIndex)
      }
    }
  }

  /**
   * Update the canvas with current state
   */
  private updateCanvas(): void {
    if (this.reactRoot) {
      this.reactRoot.render(
        <KonvaCanvas
          ref={this.canvasRef}
          slides={this.slides}
          currentSlideIndex={this.currentSlideIndex}
          config={this.config}
          eventHandlers={this.eventHandlers}
          onSlideSelect={(slideIndex: number) => {
            this.navigateToSlide(slideIndex)
          }}
        />
      )
    }
  }

  /**
   * Get current canvas state as JSON
   */
  async getSnapshot(): Promise<any> {
    return {
      slides: this.slides,
      currentSlideIndex: this.currentSlideIndex,
      config: this.config
    }
  }

  /**
   * Load canvas state from JSON
   */
  async loadSnapshot(snapshot: any): Promise<void> {
    if (snapshot.slides) {
      this.slides = snapshot.slides
    }
    if (typeof snapshot.currentSlideIndex === 'number') {
      this.currentSlideIndex = snapshot.currentSlideIndex
    }
    if (snapshot.config) {
      this.config = { ...this.config, ...snapshot.config }
    }
    
    this.updateCanvas()
  }

  /**
   * Export canvas content
   */
  async export(format: 'png' | 'svg' | 'json'): Promise<Blob | string> {
    switch (format) {
      case 'json':
        return JSON.stringify(await this.getSnapshot())
      case 'svg':
        // TODO: Implement SVG export from Konva
        throw new Error('SVG export not yet implemented for Konva renderer')
      case 'png':
        // TODO: Implement PNG export from Konva
        throw new Error('PNG export not yet implemented for Konva renderer')
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }

  /**
   * Register event handlers
   */
  setEventHandlers(handlers: CanvasEventHandlers): void {
    this.eventHandlers = handlers
    this.updateCanvas()
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.reactRoot) {
      this.reactRoot.unmount()
      this.reactRoot = null
    }
  }
}

/**
 * Factory function to create a Konva renderer instance
 */
export async function createKonvaRenderer(
  container: HTMLElement,
  config: CanvasConfig,
  handlers?: CanvasEventHandlers
): Promise<CanvasRenderer> {
  const renderer = new KonvaRenderer()
  await renderer.initialize(container, config)
  
  if (handlers) {
    renderer.setEventHandlers(handlers)
  }
  
  return renderer
}