import { useEffect, useRef } from 'react'
import { Tldraw, Editor, createShapeId, toRichText } from '@tldraw/tldraw'
import '@tldraw/tldraw/tldraw.css'

interface ParsedComponent {
  id: string
  type: string
  content: string
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  style?: {
    fontSize?: number
    fontFamily?: string
    color?: string
    backgroundColor?: string
    textAlign?: string
  }
}

interface TldrawCanvasProps {
  components: ParsedComponent[]
}

export default function TldrawCanvas({ components }: TldrawCanvasProps) {
  const editorRef = useRef<Editor>()

  const handleMount = (editor: Editor) => {
    editorRef.current = editor
    drawComponents(components)
  }

  const drawComponents = (components: ParsedComponent[]) => {
    const editor = editorRef.current
    if (!editor || !components.length) return

    // Clear existing shapes
    const allShapes = editor.getCurrentPageShapes()
    editor.deleteShapes(allShapes.map(shape => shape.id))

    // Draw text components
    const textComponents = components.filter(comp => comp.type === 'text')
    
    textComponents.forEach((component, index) => {
      const shapeId = createShapeId(`text-${component.id || index}`)
      
      // PowerPoint coordinates look good - try with less scaling or no scaling
      const scale = 1 // Try no scaling first since coordinates look reasonable (629, 413, etc.)
      const x = (component.x || 0) * scale
      const y = (component.y || 0) * scale
      
      // Convert PowerPoint font size (pt) to tldraw size categories
      // Your API shows: 12pt, 36pt, 80pt
      let tldrawSize: 's' | 'm' | 'l' | 'xl' = 'm'
      if (component.style?.fontSize) {
        console.log('PowerPoint font size:', component.style.fontSize) // Debug log
        if (component.style.fontSize <= 12) tldrawSize = 's'        // 12pt → small
        else if (component.style.fontSize <= 24) tldrawSize = 'm'    // up to 24pt → medium  
        else if (component.style.fontSize <= 48) tldrawSize = 'l'    // 36pt → large
        else tldrawSize = 'xl'                                       // 80pt → extra large
      }

      // Map specific hex colors from the API to tldraw colors
      let tldrawColor: 'black' | 'grey' | 'light-violet' | 'violet' | 'blue' | 'light-blue' | 'yellow' | 'orange' | 'green' | 'light-green' | 'light-red' | 'red' = 'black'
      if (component.style?.color) {
        const hexColor = component.style.color.toLowerCase()
        console.log('PowerPoint color:', hexColor) // Debug log
        
        // Map the specific colors from your API
        if (hexColor === '#000000') tldrawColor = 'black'
        else if (hexColor === '#e97132') tldrawColor = 'orange' // The orange from your API
        else if (hexColor === '#4ea72e') tldrawColor = 'green' // The green from your API
        // General color matching for other cases
        else if (hexColor.startsWith('#ff') || hexColor.startsWith('#e') || hexColor.startsWith('#d')) {
          // Reddish/orange colors
          if (hexColor.includes('7') || hexColor.includes('8') || hexColor.includes('9')) tldrawColor = 'orange'
          else tldrawColor = 'red'
        }
        else if (hexColor.startsWith('#4') || hexColor.startsWith('#0') && hexColor.includes('a')) tldrawColor = 'green'
        else if (hexColor.startsWith('#0')) tldrawColor = 'blue'
        else tldrawColor = 'black' // Default fallback
      }
      
      // Create text shape using the correct tldraw v3 API with minimal valid properties
      editor.createShape({
        id: shapeId,
        type: 'text',
        x,
        y,
        props: {
          richText: toRichText(component.content || 'Sample text'),
          color: tldrawColor,
          size: tldrawSize,
          font: 'draw'
        }
      })
    })

    // Fit the viewport to show all shapes
    if (textComponents.length > 0) {
      editor.zoomToFit({ animation: { duration: 500 } })
    }
  }

  // Redraw when components change
  useEffect(() => {
    if (editorRef.current) {
      drawComponents(components)
    }
  }, [components])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Tldraw onMount={handleMount} />
    </div>
  )
}