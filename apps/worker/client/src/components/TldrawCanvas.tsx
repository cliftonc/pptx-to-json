import { useEffect, useRef } from 'react'
import { Tldraw, Editor } from '@tldraw/tldraw'

import type { PowerPointComponent, PowerPointSlide } from 'ppt-paste-parser'
import '@tldraw/tldraw/tldraw.css'
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

  // Setup slideshow keyboard handling
  useSlideshowKeyboardHandler({
    isSlideshowMode,
    slideFrameIds,
    previousSlide,
    nextSlide,
    exitSlideshowMode,
    navigateToSlide
  })

  // Global keyboard override to prevent tab insertion in tables 
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && editorRef.current?.getEditingShapeId()) {
        const shape = editorRef.current.getShape(editorRef.current.getEditingShapeId()!)
        
        if (shape && shape.type === 'text') {
          // Check if we're in a table
          const selection = window.getSelection()
          if (selection && selection.focusNode) {
            let node: Node | null = selection.focusNode
            while (node) {
              if (node instanceof Element && (node.tagName === 'TD' || node.tagName === 'TH')) {
                // Prevent TLDraw's tab insertion
                e.preventDefault()
                e.stopPropagation()
                e.stopImmediatePropagation()
                
                // Call TipTap table navigation directly
                setTimeout(() => {
                  const proseMirrorElement = document.querySelector('.ProseMirror') as any
                  if (proseMirrorElement && proseMirrorElement.editor) {
                    if (e.shiftKey) {
                      proseMirrorElement.editor.commands.goToPreviousCell()
                    } else {
                      proseMirrorElement.editor.commands.goToNextCell()
                    }
                  }
                }, 0)
                
                return false
              }
              if (node.parentNode === document.body) break
              node = node.parentNode
            }
          }
        }
      }
    }

    document.addEventListener('keydown', handleGlobalKeyDown, { capture: true })
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, { capture: true })
    }
  }, [])

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