import { useEffect, useRef } from 'react'
import { Tldraw, Editor } from '@tldraw/tldraw'

import type { PowerPointComponent, PowerPointSlide } from 'ppt-paste-parser'
import '@tldraw/tldraw/tldraw.css'
import { customToolbarStyles } from './tldraw/styles'
import { useSlideshowManager } from './tldraw/slideshow/SlideshowManager'
import { useSlideshowKeyboardHandler } from './tldraw/slideshow/SlideshowKeyboardHandler'
import { createUIComponents } from './tldraw/utils/uiComponents'
import { textOptions } from './tldraw/utils/textOptions'
import { drawSlides, drawComponents } from './tldraw/utils/drawingManager'
import { ExportButton } from './tldraw/ExportButton'
import { FloatingTableToolbar } from './tldraw/toolbars/FloatingTableToolbar'
import { TableTool } from './tldraw/tools/TableTool'
import { uiOverrides } from './tldraw/utils/uiOverrides'

interface TldrawCanvasProps {
  components: PowerPointComponent[]
  slides?: PowerPointSlide[]
  slideDimensions?: { width: number; height: number }
}

export default function TldrawCanvas({ components, slides, slideDimensions }: TldrawCanvasProps) {
  const editorRef = useRef<Editor | null>(null)
  
  // Slideshow management
  const {
    isSlideshowMode,
    currentSlideIndex,
    slideFrameIds,
    enterSlideshowMode,
    exitSlideshowMode,
    navigateToSlide,
    nextSlide,
    previousSlide
  } = useSlideshowManager(slides, editorRef)

  // Inject custom CSS for toolbar and table styling
  useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = customToolbarStyles
    document.head.appendChild(styleElement)
    
    // Also inject table-specific styles for ProseMirror
    const tableStyleElement = document.createElement('style')
    tableStyleElement.textContent = `
      /* Direct table styles for ProseMirror editor */
      .ProseMirror table {
        border-collapse: collapse !important;
        border: 1px solid #333 !important;
        margin: 8px 0 !important;
      }
      
      .ProseMirror td,
      .ProseMirror th {
        border: 1px solid #333 !important;
        padding: 6px 10px !important;
        min-width: 60px !important;
        vertical-align: top !important;
      }
      
      .ProseMirror th,
      .tldraw-table-header {
        background-color: #e8e8e8 !important;
        font-weight: bold !important;
      }
      
      .ProseMirror td,
      .tldraw-table-cell {
        background-color: white !important;
      }
      
      .ProseMirror .selectedCell {
        background-color: rgba(100, 150, 255, 0.15) !important;
      }
      
      .ProseMirror .column-resize-handle {
        background-color: #4285f4 !important;
        bottom: -2px !important;
        cursor: col-resize !important;
        position: absolute !important;
        right: -2px !important;
        top: 0 !important;
        width: 4px !important;
        opacity: 0 !important;
        transition: opacity 0.2s !important;
      }
      
      .ProseMirror td:hover .column-resize-handle,
      .ProseMirror th:hover .column-resize-handle {
        opacity: 1 !important;
      }
      
      .tableWrapper {
        overflow: visible !important;
        margin: 0 !important;
      }
    `
    document.head.appendChild(tableStyleElement)
    
    return () => {
      document.head.removeChild(styleElement)
      document.head.removeChild(tableStyleElement)
    }
  }, [])

  // Setup slideshow keyboard handling
  useSlideshowKeyboardHandler({
    isSlideshowMode,
    slideFrameIds,
    previousSlide,
    nextSlide,
    exitSlideshowMode,
    navigateToSlide
  })

  const handleMount = (editor: Editor) => {
    editorRef.current = editor
    if (slides && slides.length > 0) {
      drawSlides(slides, editor, slideDimensions)
    } else if (components && components.length > 0) {
      // Legacy fallback
      drawComponents(components, editor)
    }
  }

  // Redraw when slides change
  useEffect(() => {
    if (editorRef.current) {
      if (slides && slides.length > 0) {
        drawSlides(slides, editorRef.current, slideDimensions)
      } else if (components && components.length > 0) {
        // Legacy fallback for components-only data
        drawComponents(components, editorRef.current)
      }
    }
  }, [slides, components, slideDimensions])

  // Create UI components with current slideshow state
  const uiComponents = createUIComponents(
    slides,
    isSlideshowMode,
    currentSlideIndex,
    enterSlideshowMode,
    exitSlideshowMode,
    previousSlide,
    nextSlide
  )

  return (
    <div 
      style={{ width: '100%', height: '100%', position: 'relative' }}
      className={isSlideshowMode ? 'slideshow-mode' : ''}
    >
      <Tldraw 
        onMount={handleMount} 
        textOptions={textOptions}
        components={uiComponents}
        tools={[TableTool]}
        overrides={uiOverrides}
      >
        <ExportButton />
        <FloatingTableToolbar />
      </Tldraw>
    </div>
  )
}