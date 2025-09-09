import React from 'react'
import { Group, Rect, Text, Line } from 'react-konva'
import type { CanvasComponent } from '../../../../types/canvas'

interface TableCell {
  content: string
  rowSpan?: number
  colSpan?: number
  style?: any
}

interface TableData {
  rows: TableCell[][]
  columns?: number
  headers?: boolean
}

/**
 * Render a table component in Konva
 */
export function renderTableComponent(component: CanvasComponent, key: string) {
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

  // Parse table data from content
  const tableData = parseTableContent(content)
  
  if (!tableData || !tableData.rows || tableData.rows.length === 0) {
    // Render placeholder for empty table
    return renderTablePlaceholder(component, key)
  }

  const rows = tableData.rows.length
  const cols = Math.max(...tableData.rows.map(row => row.length))
  
  const cellWidth = width / cols
  const cellHeight = height / rows
  
  // Default styling
  const borderColor = style.stroke || '#000000'
  const borderWidth = style.strokeWidth || 1
  const headerBg = style.headerBackground || '#f0f0f0'
  const cellBg = style.backgroundColor || '#ffffff'
  const textColor = style.color || '#000000'
  const fontSize = style.fontSize || 12
  const fontFamily = style.fontFamily || 'Arial, sans-serif'

  const elements = []

  // Render table cells
  tableData.rows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellX = x + (colIndex * cellWidth)
      const cellY = y + (rowIndex * cellHeight)
      const isHeader = tableData.headers && rowIndex === 0
      
      // Cell background
      elements.push(
        <Rect
          key={`${key}-cell-bg-${rowIndex}-${colIndex}`}
          x={cellX}
          y={cellY}
          width={cellWidth}
          height={cellHeight}
          fill={isHeader ? headerBg : cellBg}
          stroke={borderColor}
          strokeWidth={borderWidth}
          opacity={opacity}
        />
      )
      
      // Cell text
      if (cell.content) {
        elements.push(
          <Text
            key={`${key}-cell-text-${rowIndex}-${colIndex}`}
            x={cellX + 4} // Small padding
            y={cellY + 4}
            width={cellWidth - 8}
            height={cellHeight - 8}
            text={cell.content}
            fontSize={fontSize}
            fontFamily={fontFamily}
            fill={textColor}
            fontStyle={isHeader ? 'bold' : 'normal'}
            align="left"
            verticalAlign="top"
            wrap="word"
            ellipsis={true}
            opacity={opacity}
          />
        )
      }
    })
  })

  return (
    <Group
      key={key}
      x={0}
      y={0}
      rotation={rotation}
      onClick={() => {
        console.log('Table component clicked:', component.id)
      }}
      onMouseEnter={(e) => {
        e.target.getStage()!.container().style.cursor = 'pointer'
      }}
      onMouseLeave={(e) => {
        e.target.getStage()!.container().style.cursor = 'default'
      }}
    >
      {elements}
    </Group>
  )
}

/**
 * Render a placeholder for empty/invalid tables
 */
function renderTablePlaceholder(component: CanvasComponent, key: string) {
  const { x, y, width, height, rotation = 0, opacity = 1 } = component
  
  return (
    <Group key={key} rotation={rotation}>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="#f9f9f9"
        stroke="#ddd"
        strokeWidth={1}
        strokeDashArray={[5, 5]}
        opacity={opacity}
      />
      
      <Text
        x={x}
        y={y + height / 2 - 10}
        width={width}
        height={20}
        text="Table Component"
        fontSize={12}
        fill="#666"
        align="center"
        verticalAlign="middle"
        opacity={opacity}
      />
      
      {/* Simple grid lines to suggest table structure */}
      <Line
        points={[x + width/3, y, x + width/3, y + height]}
        stroke="#ddd"
        strokeWidth={1}
        opacity={opacity * 0.5}
      />
      <Line
        points={[x + 2*width/3, y, x + 2*width/3, y + height]}
        stroke="#ddd"
        strokeWidth={1}
        opacity={opacity * 0.5}
      />
      <Line
        points={[x, y + height/2, x + width, y + height/2]}
        stroke="#ddd"
        strokeWidth={1}
        opacity={opacity * 0.5}
      />
    </Group>
  )
}

/**
 * Parse table content from various possible formats
 */
function parseTableContent(content: any): TableData | null {
  if (!content) {
    return null
  }

  // If content is already in the expected format
  if (content.rows && Array.isArray(content.rows)) {
    return content as TableData
  }

  // If content is a string, try to parse it
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content)
      if (parsed.rows && Array.isArray(parsed.rows)) {
        return parsed as TableData
      }
    } catch (e) {
      // Try to parse as CSV-like content
      return parseCSVContent(content)
    }
  }

  // Try to extract from various object formats
  if (typeof content === 'object') {
    // HTML table format
    if (content.html || content.innerHTML) {
      return parseHTMLTable(content.html || content.innerHTML)
    }
    
    // Array of arrays format
    if (Array.isArray(content)) {
      return {
        rows: content.map(row => 
          Array.isArray(row) 
            ? row.map(cell => ({ content: String(cell) }))
            : [{ content: String(row) }]
        )
      }
    }
    
    // PowerPoint table format
    if (content.table || content.cells) {
      return parsePowerPointTable(content)
    }
  }

  return null
}

/**
 * Parse CSV-like string content
 */
function parseCSVContent(csvString: string): TableData {
  const lines = csvString.trim().split('\n')
  const rows = lines.map(line => {
    const cells = line.split(/[,\t]/) // Split on comma or tab
    return cells.map(cell => ({ content: cell.trim() }))
  })
  
  return { rows }
}

/**
 * Parse HTML table content (basic implementation)
 */
function parseHTMLTable(html: string): TableData | null {
  // This is a simplified parser - in a real implementation
  // you might want to use a proper HTML parser
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    const table = doc.querySelector('table')
    
    if (!table) return null
    
    const rows: TableCell[][] = []
    const tableRows = table.querySelectorAll('tr')
    
    tableRows.forEach(tr => {
      const cells: TableCell[] = []
      const tableCells = tr.querySelectorAll('td, th')
      
      tableCells.forEach(cell => {
        cells.push({
          content: cell.textContent || '',
          rowSpan: parseInt(cell.getAttribute('rowspan') || '1'),
          colSpan: parseInt(cell.getAttribute('colspan') || '1')
        })
      })
      
      if (cells.length > 0) {
        rows.push(cells)
      }
    })
    
    return {
      rows,
      headers: table.querySelector('thead') !== null
    }
  } catch (e) {
    return null
  }
}

/**
 * Parse PowerPoint-specific table format
 */
function parsePowerPointTable(content: any): TableData | null {
  // Handle various PowerPoint table formats
  const tableData = content.table || content
  
  if (tableData.rows && Array.isArray(tableData.rows)) {
    return {
      rows: tableData.rows.map((row: any) => {
        if (Array.isArray(row)) {
          return row.map((cell: any) => ({
            content: typeof cell === 'string' ? cell : cell.text || cell.content || ''
          }))
        }
        if (row.cells && Array.isArray(row.cells)) {
          return row.cells.map((cell: any) => ({
            content: typeof cell === 'string' ? cell : cell.text || cell.content || ''
          }))
        }
        return [{ content: String(row) }]
      }),
      headers: tableData.hasHeaders || false
    }
  }
  
  return null
}