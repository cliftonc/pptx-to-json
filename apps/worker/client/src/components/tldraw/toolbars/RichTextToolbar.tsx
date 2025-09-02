import { useEffect, useState } from 'react'
import { EditorState as TextEditorState } from '@tiptap/pm/state'
import { 
  useEditor,
  useValue,
  DefaultRichTextToolbar,
  DefaultRichTextToolbarContent,
  stopEventPropagation
} from '@tldraw/tldraw'
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
    textEditor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
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
      
      {/* Table Controls */}
      <div style={{ display: 'flex', gap: '4px', borderLeft: '1px solid #e0e0e0', paddingLeft: '8px', marginLeft: '8px' }}>
        <button
          onPointerDown={stopEventPropagation}
          onClick={insertTable}
          title="Insert Table (3×3)"
          style={{ padding: '4px 8px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', background: 'white' }}
        >
          📋 Table
        </button>
        <button
          onPointerDown={stopEventPropagation}
          onClick={addRowAfter}
          title="Add Row"
          style={{ padding: '4px 6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', background: 'white' }}
        >
          ➕ Row
        </button>
        <button
          onPointerDown={stopEventPropagation}
          onClick={addColumnAfter}
          title="Add Column"
          style={{ padding: '4px 6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', background: 'white' }}
        >
          ➕ Col
        </button>
        <button
          onPointerDown={stopEventPropagation}
          onClick={deleteRow}
          title="Delete Row"
          style={{ padding: '4px 6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', background: 'white' }}
        >
          ❌ Row
        </button>
        <button
          onPointerDown={stopEventPropagation}
          onClick={deleteColumn}
          title="Delete Column"
          style={{ padding: '4px 6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', background: 'white' }}
        >
          ❌ Col
        </button>
        <button
          onPointerDown={stopEventPropagation}
          onClick={deleteTable}
          title="Delete Table"
          style={{ padding: '4px 6px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px', background: '#ffebee' }}
        >
          🗑️ Table
        </button>
      </div>
      
      <DefaultRichTextToolbarContent textEditor={textEditor} />
    </DefaultRichTextToolbar>
  )
}