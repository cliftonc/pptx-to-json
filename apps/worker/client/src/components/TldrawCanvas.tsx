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

interface TldrawCanvasProps {
  components: PowerPointComponent[]
  slides?: PowerPointSlide[]
}

export default function TldrawCanvas({ components, slides }: TldrawCanvasProps) {
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

  // Inject custom CSS for toolbar styling
  useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = customToolbarStyles
    document.head.appendChild(styleElement)
    
    return () => {
      document.head.removeChild(styleElement)
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
      drawSlides(slides, editor)
    } else if (components && components.length > 0) {
      // Legacy fallback
      drawComponents(components, editor)
    }
  }

  // Redraw when slides change
  useEffect(() => {
    if (editorRef.current) {
      if (slides && slides.length > 0) {
        drawSlides(slides, editorRef.current)
      } else if (components && components.length > 0) {
        // Legacy fallback for components-only data
        drawComponents(components, editorRef.current)
      }
    }
  }, [slides, components])

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
      style={{ width: '100%', height: '100%' }}
      className={isSlideshowMode ? 'slideshow-mode' : ''}
    >
      <Tldraw 
        onMount={handleMount} 
        textOptions={textOptions}
        components={uiComponents}
      />
    </div>
  )
}