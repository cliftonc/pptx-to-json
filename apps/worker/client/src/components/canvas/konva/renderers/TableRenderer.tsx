import { Group, Rect, Text, Line } from 'react-konva'
import Konva from 'konva'
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
export function renderTableComponent(
  component: CanvasComponent & {
    onClick?: (e: Konva.KonvaEventObject<MouseEvent>) => void
    draggable?: boolean
    onDragEnd?: (e: Konva.KonvaEventObject<DragEvent | MouseEvent>) => void
    isSelected?: boolean
  },
  key: string
) {
  const {
    x,
    y,
    width,
    height,
    content,
    style = {},
    rotation = 0,
    opacity = 1,
    visible = true,
    onClick,
    draggable = false,
    onDragEnd,
    isSelected = false
  } = component

  if (!visible) {
    return null
  }

  const tableData = parseTableContent(content)
  if (!tableData || !tableData.rows || tableData.rows.length === 0) {
    return renderTablePlaceholder(component, key)
  }

  const rows = tableData.rows.length
  const cols = Math.max(...tableData.rows.map(row => row.length))
  const cellWidth = width / cols
  const cellHeight = height / rows

  const borderColor = style.stroke || '#000000'
  const borderWidth = style.strokeWidth || 1
  const headerBg = style.backgroundColor || '#f0f0f0'
  const cellBg = style.backgroundColor || '#ffffff'
  const textColor = style.color || '#000000'
  const fontSize = style.fontSize || 12
  const fontFamily = style.fontFamily || 'Arial, sans-serif'

  const elements: any[] = []

  tableData.rows.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      const cellX = colIndex * cellWidth
      const cellY = rowIndex * cellHeight
      const isHeader = tableData.headers && rowIndex === 0

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

      if (cell.content) {
        elements.push(
          <Text
            key={`${key}-cell-text-${rowIndex}-${colIndex}`}
            x={cellX + 4}
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
      id={component.id}
      name={component.id}
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      opacity={opacity}
      draggable={draggable}
      onDragEnd={onDragEnd}
      onClick={onClick || (() => { /* no-op */ })}
      onMouseEnter={(e) => { e.target.getStage()!.container().style.cursor = 'pointer' }}
      onMouseLeave={(e) => { e.target.getStage()!.container().style.cursor = 'default' }}
    >
      {isSelected && (
        <Rect
          x={0}
            y={0}
            width={width}
            height={height}
            stroke="#2196f3"
            strokeWidth={1}
            dash={[4,2]}
            listening={false}
        />
      )}
      {elements}
    </Group>
  )
}

function renderTablePlaceholder(component: CanvasComponent, key: string) {
  const { x, y, width, height, rotation = 0, opacity = 1 } = component
  return (
    <Group
      key={key}
      id={component.id}
      name={component.id}
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      opacity={opacity}
    >
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="#f9f9f9"
        stroke="#ddd"
        strokeWidth={1}
        strokeDashArray={[5, 5]}
        opacity={opacity}
      />
      <Text
        x={0}
        y={height / 2 - 10}
        width={width}
        height={20}
        text="Table Component"
        fontSize={12}
        fill="#666"
        align="center"
        verticalAlign="middle"
        opacity={opacity}
      />
      <Line points={[width/3, 0, width/3, height]} stroke="#ddd" strokeWidth={1} opacity={opacity * 0.5} />
      <Line points={[2*width/3, 0, 2*width/3, height]} stroke="#ddd" strokeWidth={1} opacity={opacity * 0.5} />
      <Line points={[0, height/2, width, height/2]} stroke="#ddd" strokeWidth={1} opacity={opacity * 0.5} />
    </Group>
  )
}

function parseTableContent(content: any): TableData | null {
  if (!content) return null
  if (content.rows && Array.isArray(content.rows)) return content as TableData
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content)
      if (parsed.rows && Array.isArray(parsed.rows)) return parsed as TableData
    } catch (e) {
      return parseCSVContent(content)
    }
  }
  if (typeof content === 'object') {
    if (content.html || content.innerHTML) return parseHTMLTable(content.html || content.innerHTML)
    if (Array.isArray(content)) {
      return { rows: content.map(row => Array.isArray(row) ? row.map(cell => ({ content: String(cell) })) : [{ content: String(row) }]) }
    }
    if (content.table || content.cells) return parsePowerPointTable(content)
  }
  return null
}

function parseCSVContent(csvString: string): TableData {
  const lines = csvString.trim().split('\n')
  const rows = lines.map(line => line.split(/[\,\t]/).map(cell => ({ content: cell.trim() })))
  return { rows }
}

function parseHTMLTable(html: string): TableData | null {
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
      if (cells.length > 0) rows.push(cells)
    })
    return { rows, headers: table.querySelector('thead') !== null }
  } catch (e) {
    return null
  }
}

function parsePowerPointTable(content: any): TableData | null {
  const tableData = content.table || content
  if (tableData.rows && Array.isArray(tableData.rows)) {
    return {
      rows: tableData.rows.map((row: any) => {
        if (Array.isArray(row)) {
          return row.map((cell: any) => ({ content: typeof cell === 'string' ? cell : cell.text || cell.content || '' }))
        }
        if (row.cells && Array.isArray(row.cells)) {
          return row.cells.map((cell: any) => ({ content: typeof cell === 'string' ? cell : cell.text || cell.content || '' }))
        }
        return [{ content: String(row) }]
      }),
      headers: tableData.hasHeaders || false
    }
  }
  return null
}
