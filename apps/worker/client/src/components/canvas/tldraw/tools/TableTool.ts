import { StateNode, createShapeId } from '@tldraw/tldraw'

export class TableTool extends StateNode {
  static override id = 'table'
  
  override onEnter = () => {
    this.editor.setCursor({ type: 'cross', rotation: 0 })
  }

  override onExit = () => {
    this.editor.setCursor({ type: 'default', rotation: 0 })
  }

  override onPointerDown = (_info: any) => {
    const { editor } = this
    const { currentPagePoint } = editor.inputs
    
    // Create a text shape at the click position
    const shapeId = createShapeId()
    
    editor.createShape({
      id: shapeId,
      type: 'text',
      x: currentPagePoint.x - 150, // Center horizontally
      y: currentPagePoint.y - 25,  // Slightly offset vertically
      props: {
        w: 300,
        autoSize: false,
      }
    })
    
    // Select and start editing the shape
    editor.select(shapeId)
    editor.setEditingShape(shapeId)

    
    
    // Insert the table after the editor is ready
    requestAnimationFrame(() => {
      let attempts = 0
      const tryInsertTable = () => {
        const richTextEditor = editor.getRichTextEditor()
        if (richTextEditor) {
          // Insert table and wait for DOM to update
          richTextEditor.chain()
            .clearContent()
            .insertTable({ rows: 3, cols: 2, withHeaderRow: true })
            .run()
          
          // Wait for table to be fully rendered, then position cursor
          setTimeout(() => {
            // Try to position cursor directly without multiple moves
            try {
              // Find the first cell position without focusing first
              const { state } = richTextEditor
              let firstCellPos = null
              let cellCount = 0
              
              state.doc.descendants((node, pos) => {
                if (node.type.name === 'tableHeader' || node.type.name === 'tableCell') {
                  if (cellCount === 0) { // Get the very first cell (header or data)
                    firstCellPos = pos + 1
                  }
                  cellCount++
                  if (cellCount === 1) return false // Stop after finding the first
                }
              })
              
              if (firstCellPos !== null) {
                // Do a single cursor positioning operation
                richTextEditor.commands.setTextSelection(firstCellPos)
                richTextEditor.commands.focus()
              } else {
                // Fallback: single focus operation
                richTextEditor.commands.focus('start')
              }
              
            } catch (error) {
              console.log('Table cursor positioning error:', error)
              // Ultimate fallback
              richTextEditor.commands.focus()
            }
            
            // Switch back to select tool after positioning cursor
            editor.setCurrentTool('select')
          }, 150) // Even longer delay to ensure table is fully rendered
          
        } else if (attempts < 10) {
          attempts++
          setTimeout(tryInsertTable, 50)
        }
      }
      tryInsertTable()
    })
    
    // No need to call complete - the tool will handle the transition
  }

  override onCancel = () => {
    // Go back to select tool if cancelled
    this.editor.setCurrentTool('select')
  }
}