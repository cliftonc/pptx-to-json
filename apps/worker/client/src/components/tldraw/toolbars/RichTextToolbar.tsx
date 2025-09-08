import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { EditorState as TextEditorState } from '@tiptap/pm/state'
import { 
  useEditor,
  useValue,
  DefaultRichTextToolbar,
  DefaultRichTextToolbarContent,
  stopEventPropagation
} from '@tldraw/tldraw'
import { 
  TableIcon,
  TableRowAddIcon,
  TableRowDeleteIcon,
  TableColumnAddIcon,
  TableColumnDeleteIcon,
  TableDeleteIcon
} from '../icons/TableIcons'
import { FONT_OPTIONS, FONT_SIZE_OPTIONS, COLOR_OPTIONS } from '../constants'

export function RichTextToolbar() {
  const editor = useEditor()
  const textEditor = useValue('textEditor', () => editor.getRichTextEditor(), [editor])
  const [_, setTextEditorState] = useState<TextEditorState | null>(textEditor?.state ?? null)
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const colorDropdownRef = useRef<HTMLDivElement>(null)
  const colorButtonRef = useRef<HTMLButtonElement>(null)

  // Set up text editor transaction listener
  useEffect(() => {
    if (!textEditor) {
      setTextEditorState(null)
      return
    }

    const handleTransaction = ({ editor: textEditor }: { editor: any }) => {
      setTextEditorState(textEditor.state)
    }

    textEditor.on('transaction', handleTransaction)
    return () => {
      textEditor.off('transaction', handleTransaction)
      setTextEditorState(null)
    }
  }, [textEditor])

  // Handle clicking outside color dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
        setColorDropdownOpen(false)
      }
    }

    if (colorDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [colorDropdownOpen])

  if (!textEditor) return null

  const currentFontFamily = textEditor?.getAttributes('textStyle').fontFamily ?? 'DEFAULT'
  const currentFontSize = textEditor?.getAttributes('textStyle').fontSize ?? 'DEFAULT'
  const currentColor = textEditor?.getAttributes('textStyle').color ?? 'DEFAULT'

  // Find the matching color option or default to the actual color value
  const currentColorValue = COLOR_OPTIONS.find(option => option.value === currentColor)?.value ?? 
                           (currentColor === 'DEFAULT' ? 'DEFAULT' : currentColor)

  // Table helper functions
  const insertTable = () => {
    // Insert table and then move cursor into first cell to trigger toolbar
    textEditor?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })      
      .run()
  }

  const addRowAfter = () => {
    textEditor?.chain().focus().addRowAfter().run()
  }

  const addColumnAfter = () => {
    textEditor?.chain().focus().addColumnAfter().run()
  }

  const deleteRow = () => {
    textEditor?.chain().focus().deleteRow().run()
  }

  const deleteColumn = () => {
    textEditor?.chain().focus().deleteColumn().run()
  }

  const deleteTable = () => {
    textEditor?.chain().focus().deleteTable().run()
  }

  // Check if cursor is inside a table
  const isInTable = textEditor?.isActive('table') || 
                    textEditor?.isActive('tableCell') || 
                    textEditor?.isActive('tableHeader') || 
                    textEditor?.isActive('tableRow')

  return (
    <DefaultRichTextToolbar>
      <select
        value={currentFontFamily}
        onPointerDown={stopEventPropagation}
        onChange={(e) => {
          if (e.target.value === 'DEFAULT') {
            textEditor?.chain().focus().unsetFontFamily().run()
          } else {
            textEditor?.chain().focus().setFontFamily(e.target.value).run()
          }
        }}
      >
        {FONT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        value={currentFontSize}
        onPointerDown={stopEventPropagation}
        onChange={(e) => {
          if (e.target.value === 'DEFAULT') {
            textEditor?.chain().focus().unsetFontSize().run()
          } else {
            textEditor?.chain().focus().setFontSize(e.target.value).run()
          }
        }}
      >
        {FONT_SIZE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Text Color Selector */}
      <div ref={colorDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
        <button
          ref={colorButtonRef}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
            
            if (!colorDropdownOpen && colorButtonRef.current) {
              const rect = colorButtonRef.current.getBoundingClientRect()
              const newPosition = {
                top: rect.bottom + 4,
                left: rect.left
              }
              console.log('Button rect:', rect)
              console.log('Setting dropdown position:', newPosition)
              setDropdownPosition(newPosition)
            }
            
            setColorDropdownOpen(!colorDropdownOpen)
          }}
          style={{
            padding: '4px 8px',
            margin: '8px 0',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none'
          }}
        >
          <span 
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: currentColorValue === 'DEFAULT' ? 'transparent' : currentColorValue,
              border: currentColorValue === 'DEFAULT' ? '1px solid #666' : 'none',
              display: 'inline-block'
            }}
          />
          {COLOR_OPTIONS.find(option => option.value === currentColorValue)?.label || 'Color'}
          <svg width="8" height="5" viewBox="0 0 8 5" style={{ marginLeft: '4px', opacity: 0.5 }}>
            <path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {colorDropdownOpen && createPortal(
          <div
            style={{
              position: 'fixed',
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '3px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              zIndex: 99999,
              minWidth: '120px',
              maxHeight: '200px',
              overflow: 'auto'
            }}
            ref={(el) => {
              if (el) {
                console.log('Portal dropdown rendered at:', dropdownPosition, 'Element:', el.getBoundingClientRect())
              }
            }}
          >
            {COLOR_OPTIONS.map((option) => (
              <div
                key={option.value}
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  
                  console.log('Setting color to:', option.value, option.color)
                  
                  // Ensure the text editor has focus and apply the color
                  if (textEditor) {
                    if (option.value === 'DEFAULT') {
                      textEditor.chain().focus().unsetColor().run()
                    } else {
                      // Use the actual color value, not the option.value
                      textEditor.chain().focus().setColor(option.color).run()
                    }
                  }
                  
                  setColorDropdownOpen(false)
                }}
                style={{
                  padding: '6px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  backgroundColor: currentColorValue === option.value ? '#f0f0f0' : 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = currentColorValue === option.value ? '#f0f0f0' : 'transparent'
                }}
              >
                <span 
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: option.value === 'DEFAULT' ? 'transparent' : option.color,
                    border: option.value === 'DEFAULT' ? '1px solid #666' : 'none',
                    display: 'inline-block'
                  }}
                />
                {option.label}
              </div>
            ))}
          </div>,
          document.body
        )}
      </div>
      
      {/* Table Controls - Show insert button always, other controls only when in table */}
      <div style={{ display: 'flex', gap: '4px', borderLeft: '1px solid #e0e0e0', paddingLeft: '8px', marginLeft: '8px' }}>
        <button
          onPointerDown={stopEventPropagation}
          onClick={insertTable}
          title="Insert Table (3×3)"
          style={{ padding: '6px', border: 'none', borderRadius: '3px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <TableIcon size={16} />
        </button>
        {isInTable && (
          <>
        <button
          onPointerDown={stopEventPropagation}
          onClick={addRowAfter}
          title="Add Row"
          style={{ padding: '6px', border: 'none', borderRadius: '3px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <TableRowAddIcon size={16} />
        </button>
        <button
          onPointerDown={stopEventPropagation}
          onClick={addColumnAfter}
          title="Add Column"
          style={{ padding: '6px', border: 'none', borderRadius: '3px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <TableColumnAddIcon size={16} />
        </button>
        <button
          onPointerDown={stopEventPropagation}
          onClick={deleteRow}
          title="Delete Row"
          style={{ padding: '6px', border: 'none', borderRadius: '3px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <TableRowDeleteIcon size={16} />
        </button>
        <button
          onPointerDown={stopEventPropagation}
          onClick={deleteColumn}
          title="Delete Column"
          style={{ padding: '6px', border: 'none', borderRadius: '3px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <TableColumnDeleteIcon size={16} />
        </button>
        <button
          onPointerDown={stopEventPropagation}
          onClick={deleteTable}
          title="Delete Table"
          style={{ padding: '6px', border: 'none', borderRadius: '3px', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <TableDeleteIcon size={16} color="#d32f2f" />
        </button>
          </>
        )}
      </div>
      
      <DefaultRichTextToolbarContent textEditor={textEditor} />
    </DefaultRichTextToolbar>
  )
}