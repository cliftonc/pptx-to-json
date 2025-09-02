import { useCallback, useState } from 'react'
import type { Editor } from '@tldraw/tldraw'
import type { PowerPointSlide } from 'ppt-paste-parser'

export interface SlideshowState {
  isSlideshowMode: boolean
  currentSlideIndex: number
  slideFrameIds: string[]
  previousCameraState: any
}

export function useSlideshowManager(slides: PowerPointSlide[] | undefined, editorRef: React.RefObject<Editor | null>) {
  const [isSlideshowMode, setIsSlideshowMode] = useState(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [slideFrameIds, setSlideFrameIds] = useState<string[]>([])
  const [previousCameraState, setPreviousCameraState] = useState<any>(null)

  const enterSlideshowMode = useCallback(() => {
    const editor = editorRef.current
    if (!editor || !slides?.length) return

    console.log('🎬 Entering slideshow mode with', slides.length, 'slides')

    // Store current camera state
    setPreviousCameraState(editor.getCamera())
    
    // Get all slide frame IDs - need to match the actual createShapeId format
    const frameIds: string[] = []
    for (let i = 0; i < slides.length; i++) {
      frameIds.push(`slide-frame-${i}`)
    }
    console.log('🎬 Frame IDs:', frameIds)
    setSlideFrameIds(frameIds)
    
    // Enter slideshow mode and focus on first slide
    setIsSlideshowMode(true)
    setCurrentSlideIndex(0)
    
    // Hide other frames before setting readonly mode
    hideOtherFrames(0, editor)
    
    // Set editor to read-only mode after hiding frames
    editor.updateInstanceState({ isReadonly: true })
    
    // Add a small delay to ensure shapes are rendered
    setTimeout(() => {
      focusOnSlide(0, frameIds, editor)
    }, 100)
  }, [slides])

  const exitSlideshowMode = useCallback(() => {
    const editor = editorRef.current
    if (!editor) return

    // Restore editing capabilities first
    editor.updateInstanceState({ isReadonly: false })
    
    // Show all frames again
    showAllFrames(editor)
    
    // Restore previous camera state or zoom to fit all
    if (previousCameraState) {
      editor.setCamera(previousCameraState, { animation: { duration: 500 } })
    } else {
      editor.zoomToFit({ animation: { duration: 500 } })
    }
    
    setIsSlideshowMode(false)
    setCurrentSlideIndex(0)
    setSlideFrameIds([])
    setPreviousCameraState(null)
  }, [previousCameraState])

  const navigateToSlide = useCallback((slideIndex: number) => {
    const editor = editorRef.current
    if (!editor || slideIndex < 0 || slideIndex >= slideFrameIds.length) {
      console.warn('⚠️ Cannot navigate: editor=', !!editor, 'slideIndex=', slideIndex, 'frameIds.length=', slideFrameIds.length)
      return
    }
    
    console.log('🎯 Navigating to slide', slideIndex)
    setCurrentSlideIndex(slideIndex)
    
    // Temporarily disable readonly to change visibility
    const wasReadonly = editor.getInstanceState().isReadonly
    if (wasReadonly) {
      editor.updateInstanceState({ isReadonly: false })
    }
    
    hideOtherFrames(slideIndex, editor)
    focusOnSlide(slideIndex, slideFrameIds, editor)
    
    // Restore readonly state
    if (wasReadonly) {
      editor.updateInstanceState({ isReadonly: true })
    }
  }, [slideFrameIds])

  const nextSlide = useCallback(() => {
    if (currentSlideIndex < slideFrameIds.length - 1) {
      navigateToSlide(currentSlideIndex + 1)
    }
  }, [currentSlideIndex, slideFrameIds.length, navigateToSlide])

  const previousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      navigateToSlide(currentSlideIndex - 1)
    }
  }, [currentSlideIndex, navigateToSlide])

  return {
    isSlideshowMode,
    currentSlideIndex,
    slideFrameIds,
    enterSlideshowMode,
    exitSlideshowMode,
    navigateToSlide,
    nextSlide,
    previousSlide
  }
}

function hideOtherFrames(currentSlideIndex: number, editor: Editor) {
  const allShapes = editor.getCurrentPageShapes()
  const frameShapes = allShapes.filter(s => s.type === 'frame')
  
  frameShapes.forEach((frame, index) => {
    if (index !== currentSlideIndex) {
      // Hide frame and all its children
      const shapesToHide = [frame.id]
      
      // Find all children of this frame
      const children = allShapes.filter(s => s.parentId === frame.id)
      children.forEach(child => shapesToHide.push(child.id))
      
      // Update shapes to be invisible
      editor.updateShapes(shapesToHide.map(shapeId => ({
        id: shapeId,
        type: editor.getShape(shapeId)?.type || 'geo',
        isLocked: false,
        opacity: 0
      })))
    }
  })
}

function showAllFrames(editor: Editor) {
  const allShapes = editor.getCurrentPageShapes()
  
  // Restore opacity for all shapes
  const shapesToShow = allShapes.map(shape => ({
    id: shape.id,
    type: shape.type,
    isLocked: false,
    opacity: 1
  }))
  
  editor.updateShapes(shapesToShow)
}

function focusOnSlide(slideIndex: number, frameIds: string[], editor: Editor) {
  const frameIdString = frameIds[slideIndex]
  console.log('🎯 Focusing on slide', slideIndex, 'with frame ID:', frameIdString)
  
  // First, let's see all available shapes
  const allShapes = editor.getCurrentPageShapes()
  const frameShapes = allShapes.filter(s => s.type === 'frame')
  console.log('🔍 Available frame shapes:', frameShapes.map(f => ({ id: f.id, type: f.type })))
  
  // Try to find the frame by ID pattern instead of exact match
  let frame = allShapes.find(s => s.type === 'frame' && s.id.includes(`slide-frame-${slideIndex}`))
  
  if (!frame) {
    console.warn('❌ Frame not found for slide', slideIndex, 'ID:', frameIdString)
    // Try alternative: get frame by index
    frame = frameShapes[slideIndex]
    if (frame) {
      console.log('✅ Found frame by index:', frame.id)
    }
  } else {
    console.log('✅ Found frame:', frame.id)
  }
  
  if (frame && frame.type === 'frame') {
    console.log('📐 Frame position:', frame.x, frame.y)
    console.log('📐 Frame props:', frame.props)
    
    // Show the current slide and its children
    const shapesToShow = [frame.id]
    const children = allShapes.filter(s => s.parentId === frame.id)
    children.forEach(child => shapesToShow.push(child.id))
    
    // Make current slide visible
    editor.updateShapes(shapesToShow.map(shapeId => ({
      id: shapeId,
      type: editor.getShape(shapeId)?.type || 'geo',
      isLocked: false,
      opacity: 1
    })))
    
    // Calculate frame bounds with minimal padding for closer zoom
    const frameProps = frame.props as any
    const bounds = {
      x: frame.x - 20,
      y: frame.y - 20,
      w: frameProps.w + 40,
      h: frameProps.h + 40
    }
    
    console.log('🎯 Zooming to bounds:', bounds)
    // Zoom to the frame bounds with closer fit
    editor.zoomToBounds(bounds, { animation: { duration: 800 } })
  } else {
    console.error('❌ No valid frame found for slide', slideIndex)
  }
}