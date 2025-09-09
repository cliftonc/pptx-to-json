import { useEditor } from '@tldraw/tldraw'

export function ExportButton() {
  const editor = useEditor()

  const handleExport = () => {
    if (!editor) return

    // Get all shapes from the editor
    const shapes = editor.getCurrentPageShapes()
    
    // Get the full editor state
    const editorState = {
      // Get shape data directly without toJson
      shapes: shapes.map(shape => ({
        id: shape.id,
        type: shape.type,
        props: shape.props,
        x: shape.x,
        y: shape.y,
        rotation: shape.rotation,
        isLocked: shape.isLocked,
        opacity: shape.opacity,
        parentId: shape.parentId,
        index: shape.index,
      })),
      currentPageId: editor.getCurrentPageId(),
      selectedShapeIds: Array.from(editor.getSelectedShapeIds()),
      camera: {
        x: editor.getCamera().x,
        y: editor.getCamera().y,
        z: editor.getCamera().z,
      },
      // Include full shape records for debugging rich text
      fullShapes: shapes.map(shape => {
        // Get complete shape data including rich text
        return {
          ...shape,
          // Explicitly include all properties
          props: JSON.parse(JSON.stringify(shape.props))
        }
      }),
      // Get the current editing shape if any
      editingShapeId: editor.getEditingShapeId(),
      // Include timestamp for reference
      exportedAt: new Date().toISOString(),
    }

    // Convert to JSON with nice formatting
    const jsonString = JSON.stringify(editorState, null, 2)
    
    // Create a blob and download it
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tldraw-export-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    console.log('Exported TLDraw state:', editorState)
  }

  return (
    <button
      onClick={handleExport}
      style={{
        position: 'absolute',
        left: '20px',
        top: '80px',
        zIndex: 1000,
        padding: '8px 16px',
        backgroundColor: '#4285f4',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#357ae8'
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#4285f4'
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'
      }}
      title="Export TLDraw state as JSON (includes rich text table structure)"
    >
      📥 Export JSON
    </button>
  )
}