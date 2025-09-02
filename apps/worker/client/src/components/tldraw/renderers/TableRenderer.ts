import { createShapeId, type Editor } from '@tldraw/tldraw'
import type { PowerPointComponent } from 'ppt-paste-parser'
import { createComponentShapeId } from '../utils/tldrawHelpers'
import { calculateFrameRelativePosition } from '../utils/coordinateHelpers'

/**
 * Convert table data to TipTap richText table structure
 */
function createTableRichText(tableData: string[][], hasHeader: boolean = true): any {
  if (!tableData || tableData.length === 0) {
    return {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Empty table' }]
        }
      ]
    }
  }

  const tableRows = tableData.map((rowData, rowIndex) => {
    const isHeaderRow = hasHeader && rowIndex === 0
    const cellType = isHeaderRow ? 'tableHeader' : 'tableCell'
    
    const cells = rowData.map((cellContent) => {
      const textContent = cellContent && cellContent.trim() ? cellContent : ' '
      return {
        type: cellType,
        attrs: {
          colspan: 1,
          rowspan: 1,
          colwidth: null
        },
        content: [
          {
            type: 'paragraph',
            attrs: {
              dir: 'auto'
            },
            content: [
              {
                type: 'text',
                text: textContent
              }
            ]
          }
        ]
      }
    })

    return {
      type: 'tableRow',
      content: cells
    }
  })

  return {
    type: 'doc',
    content: [
      {
        type: 'table',
        content: tableRows
      }
    ]
  }
}

export async function renderTableComponent(
  component: PowerPointComponent,
  index: number,
  frameX: number,
  frameY: number,
  editor: Editor,
  slideIndex: number,
  frameId: string | null
) {
  // Get table data from metadata
  const tableData = component.metadata?.tableData || []
  const hasHeader = component.metadata?.hasHeader ?? true
  
  if (tableData.length === 0) {
    console.warn('No table data found for table component')
    return
  }
  
  const scale = 1
  const { x: tableX, y: tableY } = calculateFrameRelativePosition(
    component.x || 0,
    component.y || 0,
    frameX,
    frameY,
    scale,
    !!frameId
  )
  
  // Create table rich text structure
  const richText = createTableRichText(tableData, hasHeader)
  
  // Create a single text shape with the table richText
  const tableId = createShapeId(createComponentShapeId('table', slideIndex, component.id || index, 'richtext'))
  
  const tableProps: any = {
    id: tableId,
    type: 'text',
    x: tableX,
    y: tableY,
    props: {
      richText: richText,
      color: 'black',
      size: 's',
      font: 'sans',
      w: component.width || 400,
      autoSize: false
    }
  }
  
  if (frameId) {
    tableProps.parentId = frameId
  }
  
  editor.createShape(tableProps)
  
  console.log('📊 Created richText table component:', {
    rows: tableData.length,
    cols: tableData[0]?.length || 0,
    hasHeader,
    position: { x: tableX, y: tableY },
    dimensions: { w: component.width, h: component.height }
  })
}

