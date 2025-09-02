import { useEffect, useState, useRef } from 'react'
import { useEditor, useValue, stopEventPropagation } from '@tldraw/tldraw'
import { 
  TableIcon,
  TableRowAddIcon,
  TableRowDeleteIcon,
  TableColumnAddIcon,
  TableColumnDeleteIcon,
  TableDeleteIcon
} from '../icons/TableIcons'

export function FloatingTableToolbar() {
  const editor = useEditor()
  const textEditor = useValue('textEditor', () => editor.getRichTextEditor(), [editor])
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!textEditor) return

    const updateToolbar = () => {
      // Check if we're in a table
      const inTable = textEditor.isActive('table') || 
                     textEditor.isActive('tableCell') || 
                     textEditor.isActive('tableHeader') || 
                     textEditor.isActive('tableRow')
      
      // Check if text is selected (which would show the main toolbar)
      const { state } = textEditor
      const { from, to } = state.selection
      const hasTextSelection = from !== to
      
      // Only show floating toolbar if in table but no text is selected
      setIsVisible(inTable && !hasTextSelection)

      if (inTable && !hasTextSelection && toolbarRef.current) {
        // Get the cursor position (not selection since we only show when no text is selected)
        const start = textEditor.view.coordsAtPos(from)
        const end = textEditor.view.coordsAtPos(to)
        
        // Position the toolbar above the selection
        const x = (start.left + end.left) / 2
        const y = start.top - 50 // 50px above the selection
        
        setPosition({ x, y })
      }
    }

    // Listen to editor updates
    textEditor.on('transaction', updateToolbar)
    textEditor.on('selectionUpdate', updateToolbar)
    textEditor.on('focus', updateToolbar)
    textEditor.on('blur', () => setIsVisible(false))

    // Initial check
    updateToolbar()

    return () => {
      textEditor.off('transaction', updateToolbar)
      textEditor.off('selectionUpdate', updateToolbar)
      textEditor.off('focus', updateToolbar)
      textEditor.off('blur', () => setIsVisible(false))
    }
  }, [textEditor])

  if (!isVisible || !textEditor) return null

  // Table operations
  const insertTable = () => {
    textEditor.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .goToNextCell()
      .run()
  }

  const addRowAfter = () => {
    textEditor.chain().focus().addRowAfter().run()
  }

  const addColumnAfter = () => {
    textEditor.chain().focus().addColumnAfter().run()
  }

  const deleteRow = () => {
    textEditor.chain().focus().deleteRow().run()
  }

  const deleteColumn = () => {
    textEditor.chain().focus().deleteColumn().run()
  }

  const deleteTable = () => {
    textEditor.chain().focus().deleteTable().run()
  }

  return (
    <div
      ref={toolbarRef}
      className="floating-table-toolbar"
      onPointerDown={stopEventPropagation}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateX(-50%)',
        zIndex: 9999,
        background: 'white',
        border: '1px solid #e0e0e0',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        padding: '4px',
        display: 'flex',
        gap: '2px',
        alignItems: 'center',
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      <button
        onPointerDown={stopEventPropagation}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          insertTable()
        }}
        title="Insert Table (3×3)"
        style={{
          padding: '6px',
          border: 'none',
          borderRadius: '4px',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <TableIcon size={16} />
      </button>
      
      <div style={{ width: '1px', height: '20px', background: '#e0e0e0', margin: '0 4px' }} />
      
      <button
        onPointerDown={stopEventPropagation}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          addRowAfter()
        }}
        title="Add Row Below"
        style={{
          padding: '6px',
          border: 'none',
          borderRadius: '4px',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <TableRowAddIcon size={16} />
      </button>
      
      <button
        onPointerDown={stopEventPropagation}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          deleteRow()
        }}
        title="Delete Row"
        style={{
          padding: '6px',
          border: 'none',
          borderRadius: '4px',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <TableRowDeleteIcon size={16} />
      </button>
      
      <div style={{ width: '1px', height: '20px', background: '#e0e0e0', margin: '0 4px' }} />
      
      <button
        onPointerDown={stopEventPropagation}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          addColumnAfter()
        }}
        title="Add Column After"
        style={{
          padding: '6px',
          border: 'none',
          borderRadius: '4px',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <TableColumnAddIcon size={16} />
      </button>
      
      <button
        onPointerDown={stopEventPropagation}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          deleteColumn()
        }}
        title="Delete Column"
        style={{
          padding: '6px',
          border: 'none',
          borderRadius: '4px',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <TableColumnDeleteIcon size={16} />
      </button>
      
      <div style={{ width: '1px', height: '20px', background: '#e0e0e0', margin: '0 4px' }} />
      
      <button
        onPointerDown={stopEventPropagation}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          deleteTable()
        }}
        title="Delete Table"
        style={{
          padding: '6px',
          border: 'none',
          borderRadius: '4px',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#ffe0e0'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <TableDeleteIcon size={16} color="#d32f2f" />
      </button>
    </div>
  )
}