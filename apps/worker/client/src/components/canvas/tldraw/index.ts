// Main exports for the TLDraw canvas module
export { TldrawRenderer, createTldrawRenderer } from './TldrawWrapper'
export { default as TldrawCanvas } from './TldrawCanvas'
export type { TldrawCanvasRef } from './TldrawCanvas'

// Re-export useful utilities that might be needed externally
export { drawSlides, drawComponents } from './utils/drawingManager'
export { useSlideshowManager } from './slideshow/SlideshowManager'
export type { SlideshowState } from './slideshow/SlideshowManager'

// Re-export renderer components
export { renderTextComponent } from './renderers/TextRenderer'
export { renderShapeComponent } from './renderers/ShapeRenderer'
export { renderImageComponent } from './renderers/ImageRenderer'
export { renderTableComponent } from './renderers/TableRenderer'
export { renderVideoComponent } from './renderers/VideoRenderer'
export { renderConnectionComponent } from './renderers/ConnectionRenderer'

// Re-export tools
export { TableTool } from './tools/TableTool'

// Re-export constants
export * from './constants'