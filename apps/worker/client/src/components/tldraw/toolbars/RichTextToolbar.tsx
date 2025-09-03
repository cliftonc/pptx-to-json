import { useEffect, useState } from 'react'
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
import { FONT_OPTIONS, FONT_SIZE_OPTIONS } from '../constants'

export function RichTextToolbar() {
  const editor = useEditor()
  const textEditor = useValue('textEditor', () => editor.getRichTextEditor(), [editor])
  const [_, setTextEditorState] = useState<TextEditorState | null>(textEditor?.state ?? null)

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

  if (!textEditor) return null

  const currentFontFamily = textEditor?.getAttributes('textStyle').fontFamily ?? 'DEFAULT'
  const currentFontSize = textEditor?.getAttributes('textStyle').fontSize ?? 'DEFAULT'

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