import * as PIXI from 'pixi.js'
import type { CanvasComponent } from '../../../../types/canvas'

/**
 * Render a table component in PixiJS
 */
export function renderTableComponent(
  component: CanvasComponent,
  key: string,
  scaleX: number = 1,
  scaleY: number = 1
): PIXI.Container | null {
  const {
    x,
    y,
    width,
    height,
    content,
    style = {},
    rotation = 0,
    opacity = 1,
    visible = true
  } = component

  if (!visible) {
    return null
  }

  // Extract table data
  const tableData = content?.rows || content?.data || []
  if (!Array.isArray(tableData) || tableData.length === 0) {
    // Create placeholder for empty table
    const placeholder = new PIXI.Graphics()
    placeholder.rect(0, 0, (width || 200) * scaleX, (height || 100) * scaleY)
    placeholder.fill('#f8f9fa')
    placeholder.stroke({ color: '#dee2e6', width: 1 })
    
    const text = new PIXI.Text({
      text: 'Empty Table',
      style: new PIXI.TextStyle({
        fontSize: 14,
        fill: '#6c757d',
        align: 'center'
      })
    })
    text.x = (width || 200) / 2 - text.width / 2
    text.y = (height || 100) / 2 - text.height / 2
    
    const container = new PIXI.Container()
    container.addChild(placeholder)
    container.addChild(text)
    container.x = x || 0
    container.y = y || 0
    
    return container
  }

  const container = new PIXI.Container()
  container.x = (x || 0) * scaleX
  container.y = (y || 0) * scaleY
  
  // Set rotation and opacity
  if (rotation) {
    container.rotation = (rotation * Math.PI) / 180
  }
  container.alpha = opacity

  // Calculate dimensions
  const rows = tableData.length
  const cols = Math.max(...tableData.map((row: any) => Array.isArray(row) ? row.length : (row.cells?.length || 0)))
  
  const tableWidth = (width || 400) * scaleX
  const tableHeight = (height || (rows * 40)) * scaleY
  const cellWidth = tableWidth / cols
  const cellHeight = tableHeight / rows

  // Table styling
  const borderColor = style.borderColor || '#dee2e6'
  const borderWidth = style.borderWidth || 1
  const headerBg = style.headerBackground || '#e9ecef'
  const cellBg = style.cellBackground || '#ffffff'
  const alternateRowBg = style.alternateRowBackground || '#f8f9fa'

  // Draw table background
  const tableBg = new PIXI.Graphics()
  tableBg.rect(0, 0, tableWidth, tableHeight)
  tableBg.fill(cellBg)
  tableBg.stroke({ color: borderColor, width: borderWidth })
  container.addChild(tableBg)

  // Render each cell
  tableData.forEach((row: any, rowIndex: number) => {
    const rowData = Array.isArray(row) ? row : (row.cells || [])
    const isHeader = rowIndex === 0 && (style.hasHeader !== false)
    
    rowData.forEach((cell: any, colIndex: number) => {
      const cellX = colIndex * cellWidth
      const cellY = rowIndex * cellHeight
      
      // Cell background (different for headers and alternating rows)
      const cellBackground = new PIXI.Graphics()
      cellBackground.rect(cellX, cellY, cellWidth, cellHeight)
      
      let bgColor = cellBg
      if (isHeader) {
        bgColor = headerBg
      } else if (rowIndex % 2 === 1 && alternateRowBg) {
        bgColor = alternateRowBg
      }
      
      cellBackground.fill(bgColor)
      cellBackground.stroke({ color: borderColor, width: borderWidth })
      container.addChild(cellBackground)
      
      // Cell content
      const cellContent = typeof cell === 'string' ? cell : 
                         cell?.text || 
                         cell?.content || 
                         cell?.value || 
                         String(cell)
      
      if (cellContent) {
        // Cell text styling
        const textStyle = new PIXI.TextStyle({
          fontSize: ((isHeader ? style.headerFontSize : style.fontSize) || 12) * Math.min(scaleX, scaleY),
          fontFamily: style.fontFamily || 'Arial, sans-serif',
          fill: (isHeader ? style.headerColor : style.color) || '#212529',
          fontWeight: isHeader ? 'bold' : 'normal',
          align: style.textAlign || 'left',
          wordWrap: true,
          wordWrapWidth: cellWidth - 16, // Padding
          breakWords: true
        })
        
        const cellText = new PIXI.Text({
          text: cellContent,
          style: textStyle
        })
        
        // Position text within cell with padding
        cellText.x = cellX + 8
        cellText.y = cellY + 6
        
        // Ensure text fits within cell height
        if (cellText.height > cellHeight - 12) {
          const scale = (cellHeight - 12) / cellText.height
          cellText.scale.set(Math.min(scale, 1))
        }
        
        container.addChild(cellText)
      }
    })
  })

  // Add table shadow if specified
  if (style.shadow || style.dropShadow) {
    const shadowOffset = style.shadowOffset || { x: 2, y: 2 }
    const shadowColor = style.shadowColor || '#000000'
    const shadowAlpha = style.shadowOpacity || 0.1
    
    const shadow = new PIXI.Graphics()
    shadow.rect(shadowOffset.x, shadowOffset.y, tableWidth, tableHeight)
    shadow.fill(shadowColor)
    shadow.alpha = shadowAlpha
    
    // Create new container to hold shadow and table
    const shadowContainer = new PIXI.Container()
    shadowContainer.x = container.x
    shadowContainer.y = container.y
    shadowContainer.rotation = container.rotation
    shadowContainer.alpha = container.alpha
    
    // Reset container positioning
    container.x = 0
    container.y = 0
    container.rotation = 0
    container.alpha = 1
    
    shadowContainer.addChild(shadow)
    shadowContainer.addChild(container)
    
    // Make shadow container interactive
    shadowContainer.eventMode = 'static'
    shadowContainer.cursor = 'pointer'
    
    // Add metadata
    ;(shadowContainer as any).__componentId = key
    ;(shadowContainer as any).__componentType = 'table'
    
    return shadowContainer
  }

  // Make container interactive for selection/editing
  container.eventMode = 'static'
  container.cursor = 'pointer'

  // Add metadata for identification
  ;(container as any).__componentId = key
  ;(container as any).__componentType = 'table'

  return container
}