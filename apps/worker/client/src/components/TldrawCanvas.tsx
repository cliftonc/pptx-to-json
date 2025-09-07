import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { Tldraw, Editor } from '@tldraw/tldraw'

import type { PowerPointComponent, PowerPointSlide } from 'ppt-paste-parser'
import '@tldraw/tldraw/tldraw.css'
import { useSlideshowManager } from './tldraw/slideshow/SlideshowManager'
import { useSlideshowKeyboardHandler } from './tldraw/slideshow/SlideshowKeyboardHandler'
import { createUIComponents } from './tldraw/utils/uiComponents'
import { textOptions } from './tldraw/utils/textOptions'
import { drawSlides, drawComponents } from './tldraw/utils/drawingManager'
import TopToolbar from './tldraw/TopToolbar'
import { FloatingTableToolbar } from './tldraw/toolbars/FloatingTableToolbar'
import { TableTool } from './tldraw/tools/TableTool'
import { uiOverrides } from './tldraw/utils/uiOverrides'

interface TldrawCanvasProps {
  components: PowerPointComponent[]
  slides?: PowerPointSlide[]
  slideDimensions?: { width: number; height: number }
  masters?: Record<string, any>
  layouts?: Record<string, any>
  theme?: any
  slideId?: string
  initialSnapshot?: any
}

export interface TldrawCanvasRef {
  autoSave: () => Promise<void>
}

const TldrawCanvas = forwardRef<TldrawCanvasRef, TldrawCanvasProps>(({ components, slides, slideDimensions, masters, layouts, theme, slideId, initialSnapshot }, ref) => {
  const editorRef = useRef<Editor | null>(null)

  // Auto-save function exposed via ref
  const autoSave = async () => {
    console.log('🔧 autoSave called in TldrawCanvas:', {
      hasEditor: !!editorRef.current,
      slideId: slideId,
      timestamp: new Date().toISOString()
    })
    
    if (!editorRef.current || !slideId) {
      console.log('Auto-save skipped: no editor or slideId', {
        hasEditor: !!editorRef.current,
        slideId: slideId
      })
      return
    }

    try {
      console.log('🔄 Auto-saving slide...')
      
      // Get the current TLDraw snapshot using the proper API
      const { document, session } = await import('@tldraw/tldraw').then(m => m.getSnapshot(editorRef.current!.store))
      const snapshot = { document, session }

      // Save to the API
      const response = await fetch(`/api/slides/${slideId}/state`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ snapshot })
      })

      if (response.ok) {
        console.log('✅ Auto-save successful')
      } else {
        console.error('❌ Auto-save failed:', response.status)
      }
    } catch (error) {
      console.error('❌ Auto-save error:', error)
    }
  }

  // Expose auto-save function through ref
  useImperativeHandle(ref, () => ({
    autoSave
  }))

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
    
    
    // Only draw slides/components if no initial snapshot is provided
    // If snapshot is provided, TLDraw will handle loading it via the snapshot prop
    if (!initialSnapshot) {
      if (slides && slides.length > 0) {
        drawSlides(slides, editor, slideDimensions, masters, layouts, theme)
      } else if (components && components.length > 0) {
        // Legacy fallback
        drawComponents(components, editor, theme)
      } else {
      }
    }
  }

  // Redraw when slides change (but not if we loaded from snapshot)
  useEffect(() => {
    
    if (editorRef.current && !initialSnapshot) {
      if (slides && slides.length > 0) {
        drawSlides(slides, editorRef.current, slideDimensions, masters, layouts, theme)
      } else if (components && components.length > 0) {
        // Legacy fallback for components-only data
        drawComponents(components, editorRef.current, theme)
      }
    } else if (initialSnapshot) {
    }
  }, [slides, components, slideDimensions, initialSnapshot])

  // Handle camera initialization after editor mounts (especially for snapshots)
  useEffect(() => {
    if (editorRef.current && initialSnapshot) {
      const editor = editorRef.current
      
      // Small delay to ensure TLDraw has finished initializing with snapshot
      setTimeout(() => {
        try {
          // Set proper camera options
          editor.setCameraOptions({ 
            isLocked: false,
            wheelBehavior: 'zoom',
            panSpeed: 1,
            zoomSpeed: 1,
            zoomSteps: [0.1, 0.25, 0.5, 1, 2, 4, 8]
          })
          
          // Ensure instance state is correct
          editor.updateInstanceState({ 
            isReadonly: false,
            isFocusMode: false
          })
          
          // Set current tool
          editor.setCurrentTool('select')
          
          // Zoom to fit content
          editor.zoomToFit({ animation: { duration: 300 } })
          
        } catch (e) {
        }
      }, 200) // Slightly longer delay for snapshot initialization
    }
  }, [initialSnapshot, editorRef.current])

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
        snapshot={initialSnapshot}
        onMount={handleMount} 
        textOptions={textOptions}
        components={uiComponents}
        tools={[TableTool]}
        overrides={uiOverrides}
      >
        <TopToolbar 
          slideId={slideId} 
          onAutoSave={autoSave}
          onClearAndGoHome={() => window.location.href = '/'} 
        />
        <FloatingTableToolbar />
      </Tldraw>
    </div>
  )
})

TldrawCanvas.displayName = 'TldrawCanvas'

export default TldrawCanvas