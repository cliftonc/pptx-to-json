import { useEffect, useRef, useState, useMemo } from 'react'
import { usePresentation } from '../../../context/PresentationContext'
import type { 
  CanvasSlide,
  CanvasConfig,
  CanvasMode
} from '../../../types/canvas'
import VerticalSlideCarousel from './slideshow/VerticalSlideCarousel'
import { MainToolbar } from './toolbars/MainToolbar'
import { TextFormattingToolbar } from './toolbars/TextFormattingToolbar'
import { renderComponent, calculateScale, resortCanvasObjects } from './renderers'

interface EditableFabricCanvasProps {
  slides: CanvasSlide[]
  currentSlideIndex: number
  config: CanvasConfig
  onSlideSelect: (slideIndex: number) => void
  onSlideUpdate?: (slideIndex: number, slide: CanvasSlide) => void
  onReady?: () => void
}

// Basic Fabric.js canvas implementation 
const EditableFabricCanvas: React.FC<EditableFabricCanvasProps> = (props) => {
  const {
    slides,
    currentSlideIndex, 
    config,
    onSlideSelect,
    onReady
  } = props
  
  // Component state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 })
  const [fabricCanvas, setFabricCanvas] = useState<any>(null)
  const [, setSelectedCount] = useState(0)
  
  // Toolbar state
  const [currentMode, setCurrentMode] = useState<CanvasMode>('edit')
  const [undoStack, setUndoStack] = useState<any[]>([])
  const [redoStack, setRedoStack] = useState<any[]>([])
  const maxUndoStack = 20
  const [textFormattingVisible, setTextFormattingVisible] = useState(false)
  const [textFormattingPosition, setTextFormattingPosition] = useState({ x: 0, y: 0 })
  const [selectedTextObject, setSelectedTextObject] = useState<any>(null)

  // Get current slide
  const currentSlide = useMemo(() => {
    return slides[currentSlideIndex] || null
  }, [slides, currentSlideIndex])

  const { setRendererState } = usePresentation()

  // Initialize Fabric.js canvas (dynamic import to avoid build issues)
  useEffect(() => {
    let mounted = true
    
    async function initFabric() {
      if (!canvasRef.current || fabricCanvas) return
      
      try {
        // Dynamic import to avoid build-time issues
        const { Canvas } = await import('fabric')
        
        if (!mounted) return
        
        const canvas = new Canvas(canvasRef.current, {
          width: canvasDimensions.width,
          height: canvasDimensions.height,
          backgroundColor: '#ffffff',
          selection: true,
          preserveObjectStacking: true
        })

        // Event handlers
        canvas.on('selection:created', (e: any) => {
          console.log('selection:created event', e)
          setSelectedCount(e.selected?.length || 0)
          handleObjectSelection(e.selected?.[0], canvas)
        })
        
        canvas.on('selection:updated', (e: any) => {
          console.log('selection:updated event', e)
          setSelectedCount(e.selected?.length || 0)
          handleObjectSelection(e.selected?.[0], canvas)
        })
        
        canvas.on('selection:cleared', () => {
          console.log('selection:cleared event')
          setSelectedCount(0)
          setTextFormattingVisible(false)
          setSelectedTextObject(null)
        })

        // Also try mouse events as fallback
        canvas.on('mouse:up', () => {
          const activeObject = canvas.getActiveObject()
          if (activeObject) {
            console.log('mouse:up - active object:', activeObject.type, activeObject)
            handleObjectSelection(activeObject, canvas)
          }
        })

        // Wait a bit for the canvas to be fully initialized before setting state
        setTimeout(() => {
          if (mounted) {
            setFabricCanvas(canvas)
            onReady?.()
          }
        }, 100)
      } catch (error) {
        console.warn('Failed to initialize Fabric.js:', error)
      }
    }

    initFabric()
    
    return () => {
      mounted = false
      if (fabricCanvas) {
        try {
          fabricCanvas.dispose()
        } catch (error) {
          console.warn('Error disposing fabric canvas:', error)
        }
        setFabricCanvas(null)
      }
    }
  }, []) // Only run once, not dependent on dimensions

  // Update canvas dimensions based on container
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      const container = containerRef.current
      if (!container) return

      const containerWidth = container.offsetWidth - 200 // Reserve space for carousel
      const containerHeight = container.offsetHeight - 60 // Reserve space for toolbar

      // Maintain aspect ratio based on slide dimensions - match Konva approach
      if (currentSlide?.dimensions) {
        const slideWidth = currentSlide.dimensions.width
        const slideHeight = currentSlide.dimensions.height
        const availableWidth = containerWidth - 40 // padding
        const availableHeight = containerHeight - 40

        const scaleX = availableWidth / slideWidth
        const scaleY = availableHeight / slideHeight
        const scale = Math.min(scaleX, scaleY, 1) // Don't scale up beyond 100%

        const canvasWidth = slideWidth * scale
        const canvasHeight = slideHeight * scale

        setCanvasDimensions({
          width: Math.max(400, Math.min(canvasWidth, 1200)),
          height: Math.max(300, Math.min(canvasHeight, 900))
        })
      } else {
        // Fallback when no slide dimensions
        setCanvasDimensions({
          width: Math.max(400, Math.min(containerWidth - 40, 1200)),
          height: Math.max(300, Math.min(containerHeight - 40, 900))
        })
      }
    }

    updateDimensions()
    
    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [currentSlide?.dimensions])

  // Update canvas size when dimensions change
  useEffect(() => {
    if (!fabricCanvas || !fabricCanvas.getElement) return

    try {
      fabricCanvas.setDimensions({
        width: canvasDimensions.width,
        height: canvasDimensions.height
      })
      fabricCanvas.renderAll()
    } catch (error) {
      console.warn('Error setting canvas dimensions:', error)
    }
  }, [fabricCanvas, canvasDimensions])

  // Load slide content into canvas (render actual PowerPoint content)
  useEffect(() => {
    if (!fabricCanvas || !currentSlide) return

    fabricCanvas.clear()

    // Set background color if specified
    if (currentSlide.background?.type === 'color') {
      fabricCanvas.backgroundColor = currentSlide.background.value || '#ffffff'
    }

    // Render actual PowerPoint components sorted by zIndex (same as Konva)
    const sortedComponents = currentSlide.components
      .slice()
      .sort((a, b) => {
        const aZ = a.zIndex ?? 0
        const bZ = b.zIndex ?? 0
        return aZ - bZ
      })

    const scale = calculateScale(canvasDimensions, currentSlide?.dimensions)
    
    sortedComponents.forEach((component) => {
      renderComponent(fabricCanvas, component, scale)
    })

    // After all components are rendered, re-sort the canvas objects by zIndex
    // This handles async loaded images properly
    setTimeout(() => resortCanvasObjects(fabricCanvas), 50)
    // Resort again after async images might have loaded
    setTimeout(() => resortCanvasObjects(fabricCanvas), 500)

    fabricCanvas.renderAll()
  }, [fabricCanvas, currentSlide])

  // Keyboard shortcuts for slide navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts if typing in inputs or text areas
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLElement && event.target.contentEditable === 'true') {
        return
      }

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          if (currentSlideIndex > 0) {
            onSlideSelect(currentSlideIndex - 1)
          }
          break
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          if (currentSlideIndex < slides.length - 1) {
            onSlideSelect(currentSlideIndex + 1)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentSlideIndex, slides.length, onSlideSelect])

  // Handle object selection for text formatting
  const handleObjectSelection = (selectedObject: any, canvas?: any) => {
    console.log('Object selected:', selectedObject?.type, selectedObject)
    
    if (!selectedObject || !containerRef.current) {
      setTextFormattingVisible(false)
      setSelectedTextObject(null)
      return
    }

    // Use the passed canvas or the fabricCanvas from state
    const currentCanvas = canvas || fabricCanvas
    if (!currentCanvas) {
      console.log('No canvas available for positioning', { canvas, fabricCanvas })
      return
    }

    // Check if selected object is a text object (Textbox or IText)
    if (selectedObject.type === 'textbox' || selectedObject.type === 'i-text') {
      console.log('Text object detected, showing toolbar')
      console.log('Text object properties:', {
        fontSize: selectedObject.fontSize,
        fontFamily: selectedObject.fontFamily,
        fill: selectedObject.fill,
        fontWeight: selectedObject.fontWeight,
        fontStyle: selectedObject.fontStyle,
        textAlign: selectedObject.textAlign,
        allProps: Object.keys(selectedObject)
      })
      setSelectedTextObject(selectedObject)
      
      // Calculate position for text formatting toolbar
      const containerRect = containerRef.current.getBoundingClientRect()
      const objectBounds = selectedObject.getBoundingRect()
      
      // Get the canvas element position within the container
      const canvasElement = currentCanvas.getElement()
      const canvasRect = canvasElement.getBoundingClientRect()
      
      console.log('Positioning debug:', {
        containerRect,
        objectBounds,
        canvasRect,
        selectedObjectLeft: selectedObject.left,
        selectedObjectTop: selectedObject.top
      })
      
      // Try using the object's actual left/top properties instead of getBoundingRect
      const x = canvasRect.left + selectedObject.left + (selectedObject.width || 0) / 2
      const y = canvasRect.top + selectedObject.top - 20
      
      console.log('Calculated position:', { x, y })
      
      setTextFormattingPosition({ x, y })
      
      setTextFormattingVisible(true)
    } else {
      console.log('Non-text object selected:', selectedObject.type)
      setTextFormattingVisible(false)
      setSelectedTextObject(null)
    }
  }


  // Sync with PresentationContext for unified saves
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        setRendererState('fabric' as any, {
          slides: slides.map(s => ({
            id: s.id,
            slideNumber: s.slideNumber,
            components: s.components,
            dimensions: s.dimensions,
            background: s.background,
            metadata: s.metadata
          })),
          currentSlideIndex
        })
      } catch (error) {
        console.error('Error syncing Fabric state:', error)
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [slides, currentSlideIndex, setRendererState])

  // Toolbar handlers
  const handleAddShape = (shapeType: string) => {
    if (!fabricCanvas) return
    
    const centerX = canvasDimensions.width / 2 - 50
    const centerY = canvasDimensions.height / 2 - 50
    
    fabricCanvas.getObjects().forEach((obj: any) => obj.set('active', false))
    
    import('fabric').then(({ Rect, Circle }) => {
      let newShape: any
      
      if (shapeType === 'rectangle') {
        newShape = new Rect({
          left: centerX,
          top: centerY,
          width: 100,
          height: 100,
          fill: '#cccccc',
          stroke: '#000000',
          strokeWidth: 1,
          selectable: true
        })
      } else if (shapeType === 'circle') {
        newShape = new Circle({
          left: centerX,
          top: centerY,
          radius: 50,
          fill: '#cccccc',
          stroke: '#000000',
          strokeWidth: 1,
          selectable: true
        })
      } else {
        // Default rectangle for other shapes
        newShape = new Rect({
          left: centerX,
          top: centerY,
          width: 100,
          height: 100,
          fill: '#cccccc',
          stroke: '#000000',
          strokeWidth: 1,
          selectable: true
        })
      }
      
      newShape.set('zIndex', Date.now())
      fabricCanvas.add(newShape)
      fabricCanvas.setActiveObject(newShape)
      fabricCanvas.renderAll()
      
      // Save to undo stack
      saveToUndoStack()
    })
  }

  const handleAddText = () => {
    if (!fabricCanvas) return
    
    const centerX = canvasDimensions.width / 2 - 75
    const centerY = canvasDimensions.height / 2 - 25
    
    fabricCanvas.getObjects().forEach((obj: any) => obj.set('active', false))
    
    import('fabric').then(({ Textbox }) => {
      const newText = new Textbox('New Text', {
        left: centerX,
        top: centerY,
        width: 150,
        height: 50,
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fill: '#000000',
        selectable: true,
        editable: true
      })
      
      console.log('Adding new text object:', newText.type, newText)
      newText.set('zIndex', Date.now())
      fabricCanvas.add(newText)
      fabricCanvas.setActiveObject(newText)
      fabricCanvas.renderAll()
      
      // Manually trigger selection handler
      setTimeout(() => {
        const activeObj = fabricCanvas.getActiveObject()
        console.log('Active object after adding text:', activeObj?.type, activeObj)
        if (activeObj) {
          handleObjectSelection(activeObj, fabricCanvas)
        }
      }, 100)
      
      // Save to undo stack
      saveToUndoStack()
    })
  }


  const saveToUndoStack = () => {
    if (!fabricCanvas) return
    
    const state = JSON.stringify(fabricCanvas.toJSON(['zIndex', 'componentId', 'componentType']))
    setUndoStack(prev => {
      const newStack = [...prev, state]
      return newStack.slice(-maxUndoStack) // Keep only last 20 states
    })
    setRedoStack([]) // Clear redo stack when new action is performed
  }

  const handleUndo = () => {
    if (undoStack.length === 0 || !fabricCanvas) return
    
    // Save current state to redo stack
    const currentState = JSON.stringify(fabricCanvas.toJSON(['zIndex', 'componentId', 'componentType']))
    setRedoStack(prev => [currentState, ...prev])
    
    // Get previous state
    const previousState = undoStack[undoStack.length - 1]
    setUndoStack(prev => prev.slice(0, -1))
    
    // Restore previous state
    fabricCanvas.loadFromJSON(previousState, () => {
      fabricCanvas.renderAll()
    })
  }

  const handleRedo = () => {
    if (redoStack.length === 0 || !fabricCanvas) return
    
    // Save current state to undo stack
    const currentState = JSON.stringify(fabricCanvas.toJSON(['zIndex', 'componentId', 'componentType']))
    setUndoStack(prev => [...prev, currentState])
    
    // Get next state
    const nextState = redoStack[0]
    setRedoStack(prev => prev.slice(1))
    
    // Restore next state
    fabricCanvas.loadFromJSON(nextState, () => {
      fabricCanvas.renderAll()
    })
  }

  const handleClear = () => {
    // Perform a complete page reload to guarantee a full reset
    // This is exactly what happens when you press F5 or hard refresh
    window.location.reload()
  }

  return (
    <div 
      ref={containerRef}
      className="editable-fabric-canvas-container"
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: config.backgroundColor || '#ffffff'
      }}
    >
      {/* Main Toolbar */}
      <MainToolbar
        mode={currentMode}
        onModeChange={setCurrentMode}
        onAddShape={handleAddShape}
        onAddText={handleAddText}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onClear={handleClear}
      />

      {/* Main content area with canvas and carousel */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Canvas area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: '#f8f9fa'
        }}>
          {/* Canvas container */}
          <div style={{
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <canvas 
              ref={canvasRef}
              style={{ display: 'block' }}
            />
          </div>

          {currentSlide && (
            <div style={{
              marginTop: '12px',
              fontSize: '12px',
              color: '#6c757d',
              textAlign: 'center'
            }}>
              Canvas: {canvasDimensions.width} × {canvasDimensions.height} • 
              Slide: {Math.round(currentSlide.dimensions?.width || 720)} × {Math.round(currentSlide.dimensions?.height || 540)}
            </div>
          )}
        </div>

        {/* Right-side vertical slide carousel */}
        <VerticalSlideCarousel
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          onSlideSelect={onSlideSelect}
        />
      </div>

      {/* Text Formatting Toolbar (positioned absolutely when visible) */}
      {textFormattingVisible && selectedTextObject && (
        <TextFormattingToolbar
          isVisible={textFormattingVisible}
          position={textFormattingPosition}
          currentStyle={{
            fontSize: selectedTextObject.fontSize || 16,
            fontFamily: selectedTextObject.fontFamily || 'Arial',
            color: selectedTextObject.fill || '#000000',
            fill: selectedTextObject.fill || '#000000',
            fontWeight: selectedTextObject.fontWeight || 'normal',
            fontStyle: selectedTextObject.fontStyle || 'normal',
            textAlign: selectedTextObject.textAlign || 'left'
          }}
          onStyleChange={(styleUpdates) => {
            if (selectedTextObject && fabricCanvas) {
              // Map style updates to Fabric.js properties
              if (styleUpdates.fontSize) selectedTextObject.set('fontSize', styleUpdates.fontSize)
              if (styleUpdates.fontFamily) selectedTextObject.set('fontFamily', styleUpdates.fontFamily)
              if (styleUpdates.color) selectedTextObject.set('fill', styleUpdates.color)
              if (styleUpdates.fill) selectedTextObject.set('fill', styleUpdates.fill)
              if (styleUpdates.fontWeight) selectedTextObject.set('fontWeight', styleUpdates.fontWeight)
              if (styleUpdates.fontStyle) selectedTextObject.set('fontStyle', styleUpdates.fontStyle)
              if (styleUpdates.textAlign) selectedTextObject.set('textAlign', styleUpdates.textAlign)
              
              fabricCanvas.renderAll()
              saveToUndoStack()
            }
          }}
          onClose={() => {
            setTextFormattingVisible(false)
            setSelectedTextObject(null)
          }}
        />
      )}
    </div>
  )
}

EditableFabricCanvas.displayName = 'EditableFabricCanvas'

export default EditableFabricCanvas