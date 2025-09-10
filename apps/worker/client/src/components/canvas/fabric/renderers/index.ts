// Main component renderer
export { renderComponent, calculateScale, resortCanvasObjects } from './ComponentRenderer'

// Individual renderers
export { renderTextComponent } from './TextRenderer'
export { renderShapeComponent, getShapeType } from './ShapeRenderer'
export { renderImageComponent, getImageMetadata } from './ImageRenderer'
export { renderTableComponent, getTableMetadata } from './TableRenderer'