import { createShapeId, toRichText, type Editor } from '@tldraw/tldraw'
import type { PowerPointComponent } from 'ppt-paste-parser'
import { createComponentShapeId } from '../utils/tldrawHelpers'
import { calculateFrameRelativePosition } from '../utils/coordinateHelpers'

export async function renderTableComponent(
  component: PowerPointComponent,
  index: number,
  frameX: number,
  frameY: number,
  editor: Editor,
  slideIndex: number,
  frameId: string | null
) {
  console.log(`\n--- Table ${index} ---`)
  console.log('Component:', {
    content: component.content,
    position: `(${component.x}, ${component.y})`,
    size: `${component.width}x${component.height}`,
    tableData: component.metadata?.tableData,
    rows: component.metadata?.rows,
    cols: component.metadata?.cols
  })
  
  // Get table data from metadata
  const tableData = component.metadata?.tableData || []
  const rows = component.metadata?.rows || tableData.length
  const cols = component.metadata?.cols || (tableData[0]?.length || 0)
  
  if (tableData.length === 0) {
    console.log(`❌ No table data found for table ${index}`)
    return
  }
  
  console.log(`✓ Processing table with ${rows} rows × ${cols} columns`)
  
  // Calculate cell dimensions
  const tableWidth = component.width || 300
  const tableHeight = component.height || 150
  const cellWidth = tableWidth / cols
  const cellHeight = tableHeight / rows
  
  const scale = 1
  const { x: tableX, y: tableY } = calculateFrameRelativePosition(
    component.x || 0,
    component.y || 0,
    frameX,
    frameY,
    scale,
    !!frameId
  )
  
  // Create shapes for each table cell
  tableData.forEach((row: any[], rowIndex: number) => {
    if (!Array.isArray(row)) return
    
    row.forEach((cellContent: any, colIndex: number) => {
      const cellX = tableX + (colIndex * cellWidth)
      const cellY = tableY + (rowIndex * cellHeight)
      
      // Create cell background rectangle
      createCellBackground(
        editor,
        slideIndex,
        component,
        index,
        rowIndex,
        colIndex,
        cellX,
        cellY,
        cellWidth,
        cellHeight,
        frameId
      )
      
      // Create cell text if there's content
      if (cellContent && cellContent.trim()) {
        createCellText(
          editor,
          slideIndex,
          component,
          index,
          rowIndex,
          colIndex,
          cellX,
          cellY,
          cellHeight,
          cellContent,
          frameId
        )
      }
    })
  })
  
  console.log(`✓ Created table with ${rows * cols} cells at (${tableX}, ${tableY})`)
}

function createCellBackground(
  editor: Editor,
  slideIndex: number,
  component: PowerPointComponent,
  index: number,
  rowIndex: number,
  colIndex: number,
  cellX: number,
  cellY: number,
  cellWidth: number,
  cellHeight: number,
  frameId: string | null
) {
  const cellRectId = createShapeId(createComponentShapeId('table', slideIndex, component.id || index, `cell-bg-${rowIndex}-${colIndex}`))
  
  // Determine cell colors (header vs data)
  const isHeader = rowIndex === 0 && component.metadata?.hasHeader
  const fillColor = isHeader ? 'blue' : 'light-blue'
  
  const cellRectProps: any = {
    id: cellRectId,
    type: 'geo',
    x: cellX,
    y: cellY,
    props: {
      geo: 'rectangle',
      color: fillColor,
      fill: 'solid',
      size: 's',
      w: cellWidth,
      h: cellHeight
    }
  }
  
  if (frameId) {
    cellRectProps.parentId = frameId
  }
  
  editor.createShape(cellRectProps)
}

function createCellText(
  editor: Editor,
  slideIndex: number,
  component: PowerPointComponent,
  index: number,
  rowIndex: number,
  colIndex: number,
  cellX: number,
  cellY: number,
  cellHeight: number,
  cellContent: any,
  frameId: string | null
) {
  const cellTextId = createShapeId(createComponentShapeId('table', slideIndex, component.id || index, `cell-text-${rowIndex}-${colIndex}`))
  
  // Position text in the center of the cell with some padding
  const textX = cellX + 8 // Small left padding
  const textY = cellY + cellHeight / 2 - 6 // Center vertically
  
  // Text styling
  const textColor = 'black'
  const textSize = 's' // Small text for table cells
  
  const cellTextProps: any = {
    id: cellTextId,
    type: 'text',
    x: textX,
    y: textY,
    props: {
      richText: toRichText(cellContent.toString()),
      color: textColor,
      size: textSize,
      font: 'sans'
    }
  }
  
  if (frameId) {
    cellTextProps.parentId = frameId
  }
  
  editor.createShape(cellTextProps)
}