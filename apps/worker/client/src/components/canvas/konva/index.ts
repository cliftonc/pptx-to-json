// Main exports for the Konva canvas module
export { KonvaRenderer, createKonvaRenderer } from './KonvaWrapper'
export { default as KonvaCanvas } from './KonvaCanvas'

// Re-export slideshow components
export { default as SlideCarousel } from './slideshow/SlideCarousel'

// Re-export renderer components
export { renderTextComponent } from './renderers/TextRenderer'
export { renderShapeComponent } from './renderers/ShapeRenderer'
export { renderImageComponent } from './renderers/ImageRenderer'
export { renderTableComponent } from './renderers/TableRenderer'