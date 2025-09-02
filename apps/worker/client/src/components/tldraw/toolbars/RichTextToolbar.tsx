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
      <DefaultRichTextToolbarContent textEditor={textEditor} />
    </DefaultRichTextToolbar>
  )
}