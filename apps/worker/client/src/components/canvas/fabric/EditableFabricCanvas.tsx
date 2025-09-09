import { useEffect, useRef, useState, useMemo } from 'react'
import { usePresentation } from '../../../context/PresentationContext'
import type { 
  CanvasSlide,
  CanvasConfig,
  CanvasMode
} from '../../../types/canvas'
import VerticalSlideCarousel from './slideshow/VerticalSlideCarousel'
import { MainToolbar } from './toolbars/MainToolbar'

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
    onSlideSelect,
    onReady
  } = props
  
  // Component state
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 })
  const [fabricCanvas, setFabricCanvas] = useState<any>(null)
  const [selectedCount, setSelectedCount] = useState(0)
  
  // Toolbar state
  const [currentMode, setCurrentMode] = useState<CanvasMode>('edit')
  const [undoStack, setUndoStack] = useState<any[]>([])
  const [redoStack, setRedoStack] = useState<any[]>([])
  const maxUndoStack = 20

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
          setSelectedCount(e.selected?.length || 0)
        })
        
        canvas.on('selection:updated', (e: any) => {
          setSelectedCount(e.selected?.length || 0)
        })
        
        canvas.on('selection:cleared', () => {
          setSelectedCount(0)
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

      // Maintain aspect ratio based on slide dimensions
      let canvasWidth = containerWidth - 40 // padding
      let canvasHeight = containerHeight - 40

      if (currentSlide?.dimensions) {
        const slideAspectRatio = currentSlide.dimensions.width / currentSlide.dimensions.height
        const containerAspectRatio = canvasWidth / canvasHeight

        if (slideAspectRatio > containerAspectRatio) {
          canvasHeight = canvasWidth / slideAspectRatio
        } else {
          canvasWidth = canvasHeight * slideAspectRatio
        }
      }

      setCanvasDimensions({
        width: Math.max(400, Math.min(canvasWidth, 1200)),
        height: Math.max(300, Math.min(canvasHeight, 900))
      })
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

    sortedComponents.forEach((component, index) => {
      renderComponent(fabricCanvas, component, index)
    })

    // After all components are rendered, re-sort the canvas objects by zIndex
    // This handles async loaded images properly
    const resortObjects = () => {
      const allObjects = fabricCanvas.getObjects()
      if (allObjects.length === 0) return
      
      // Sort by zIndex
      const sortedObjects = allObjects.slice().sort((a: any, b: any) => {
        const aZ = a.zIndex ?? 0
        const bZ = b.zIndex ?? 0
        return aZ - bZ
      })
      
      // Remove all objects
      fabricCanvas.clear()
      
      // Re-add in correct z-index order
      sortedObjects.forEach(obj => {
        fabricCanvas.add(obj)
      })
      
      fabricCanvas.renderAll()
    }
    
    // Initial sort after rendering
    setTimeout(resortObjects, 50)
    // Resort again after async images might have loaded
    setTimeout(resortObjects, 500)

    fabricCanvas.renderAll()
  }, [fabricCanvas, currentSlide])

  // Render a PowerPoint component using Fabric.js
  const renderComponent = async (canvas: any, component: any, sortedIndex?: number) => {
    try {
      const { Rect, Circle, IText, Textbox } = await import('fabric')
      
      // Calculate scaling factors based on canvas vs slide dimensions
      const slideWidth = currentSlide?.dimensions?.width || 720
      const slideHeight = currentSlide?.dimensions?.height || 540
      const canvasWidth = canvasDimensions.width
      const canvasHeight = canvasDimensions.height
      
      const scaleX = canvasWidth / slideWidth
      const scaleY = canvasHeight / slideHeight
      
      // Extract and scale position and dimensions from component
      const x = (component.x || 0) * scaleX
      const y = (component.y || 0) * scaleY
      const width = (component.width || 100) * scaleX
      const height = (component.height || 50) * scaleY
      const rotation = component.rotation || 0
      const opacity = component.opacity !== undefined ? component.opacity : 1
      
      let fabricObject: any = null
      
      switch (component.type) {
        case 'text':
          // Extract text content
          const textContent = typeof component.content === 'string' ? component.content :
                              component.content?.text ||
                              component.content?.content ||
                              'Text Component'
          
          // Extract styling with scaling
          const fontSize = (component.style?.fontSize || 16) * Math.min(scaleX, scaleY)
          const fontFamily = component.style?.fontFamily || 'Arial, sans-serif'
          const textFill = component.style?.color || component.style?.fill || '#000000'
          const fontWeight = component.style?.fontWeight || 'normal'
          const fontStyle = component.style?.fontStyle || 'normal'
          const textAlign = component.style?.textAlign || 'left'
          
          fabricObject = new Textbox(textContent, {
            left: x,
            top: y,
            width: width,
            height: height,
            fontSize: fontSize,
            fontFamily: fontFamily,
            fill: textFill,
            fontWeight: fontWeight,
            fontStyle: fontStyle,
            textAlign: textAlign,
            selectable: true,
            editable: true,
            splitByGrapheme: false,
            // Enable text wrapping
            lineHeight: 1.16,
            charSpacing: 0,
            // Prevent text from growing beyond the set width
            lockUniScaling: true
          })
          break
          
        case 'shape':
          // Determine shape type from metadata or default to rectangle
          const shapeType = component.metadata?.shapeType || 'rectangle'
          const shapeFill = component.style?.fill || component.style?.backgroundColor || '#3498db'
          const shapeStroke = component.style?.stroke || '#2980b9'
          const shapeStrokeWidth = component.style?.strokeWidth || 1
          
          if (shapeType === 'circle' || shapeType === 'ellipse') {
            fabricObject = new Circle({
              left: x,
              top: y,
              radius: Math.min(width, height) / 2,
              fill: shapeFill,
              stroke: shapeStroke,
              strokeWidth: shapeStrokeWidth,
              selectable: true
            })
          } else {
            fabricObject = new Rect({
              left: x,
              top: y,
              width: width,
              height: height,
              fill: shapeFill,
              stroke: shapeStroke,
              strokeWidth: shapeStrokeWidth,
              selectable: true
            })
          }
          break
          
        case 'image':
          // Extract image source using the same logic as Konva
          const getImageSource = (): string | null => {
            if (component.metadata?.imageUrl) {
              return component.metadata.imageUrl
            }
            if (typeof component.content === 'string') {
              return component.content
            }
            if (component.content && typeof component.content === 'object') {
              return component.content.src || component.content.url || component.content.dataUrl || component.content.data || component.content.content || null
            }
            if (component.src) {
              return component.src
            }
            return null
          }

          const imageSrc = getImageSource()
          
          if (imageSrc) {
            try {
              // Create HTML image element first
              const img = new window.Image()
              img.crossOrigin = 'anonymous'
              
              img.onload = () => {
                // Use dynamic import to get FabricImage class
                import('fabric').then(({ FabricImage }) => {
                  const fabricImg = new FabricImage(img, {
                    left: x,
                    top: y,
                    scaleX: width / (img.width || 1),
                    scaleY: height / (img.height || 1),
                    selectable: true,
                    opacity: opacity
                  })
                  
                  fabricImg.set('componentId', component.id)
                  fabricImg.set('componentType', 'image')
                  fabricImg.set('zIndex', component.zIndex ?? 0)
                  canvas.add(fabricImg)
                  
                  // Resort all objects to maintain z-index order after async image load
                  setTimeout(() => {
                    const allObjects = canvas.getObjects()
                    if (allObjects.length === 0) return
                    
                    const sortedObjects = allObjects.slice().sort((a: any, b: any) => {
                      const aZ = a.zIndex ?? 0
                      const bZ = b.zIndex ?? 0
                      return aZ - bZ
                    })
                    
                    canvas.clear()
                    sortedObjects.forEach(obj => canvas.add(obj))
                    canvas.renderAll()
                  }, 10)
                  
                  canvas.renderAll()
                }).catch((error) => {
                  console.warn('Failed to create Fabric image:', error)
                  // Create error placeholder
                  const errorRect = new Rect({
                    left: x,
                    top: y,
                    width: width,
                    height: height,
                    fill: '#ffebee',
                    stroke: '#f44336',
                    strokeWidth: 1,
                    strokeDashArray: [5, 5],
                    selectable: true
                  })
                  canvas.add(errorRect)
                  canvas.renderAll()
                })
              }
              
              img.onerror = () => {
                console.warn('Failed to load image:', imageSrc)
                // Create error placeholder
                const errorRect = new Rect({
                  left: x,
                  top: y,
                  width: width,
                  height: height,
                  fill: '#ffebee',
                  stroke: '#f44336',
                  strokeWidth: 1,
                  strokeDashArray: [5, 5],
                  selectable: true
                })
                canvas.add(errorRect)
                canvas.renderAll()
              }
              
              img.src = imageSrc
              return // Exit early since image loading is async
            } catch (error) {
              console.warn('Error setting up image loading:', error)
              // Fallback to error placeholder
              fabricObject = new Rect({
                left: x,
                top: y,
                width: width,
                height: height,
                fill: '#ffebee',
                stroke: '#f44336',
                strokeWidth: 1,
                strokeDashArray: [5, 5],
                selectable: true
              })
            }
          } else {
            // No image source found - create placeholder
            fabricObject = new Rect({
              left: x,
              top: y,
              width: width,
              height: height,
              fill: '#f0f0f0',
              stroke: '#ddd',
              strokeWidth: 1,
              selectable: true
            })
          }
          break
          
        case 'table':
          // For tables, create a placeholder rectangle for now
          // In a full implementation, you'd render individual cells
          fabricObject = new Rect({
            left: x,
            top: y,
            width: width,
            height: height,
            fill: 'rgba(255, 255, 255, 0.8)',
            stroke: '#333333',
            strokeWidth: 2,
            selectable: true
          })
          break
          
        default:
          // Unknown component type - create a placeholder
          fabricObject = new Rect({
            left: x,
            top: y,
            width: width,
            height: height,
            fill: 'rgba(155, 89, 182, 0.3)',
            stroke: '#9b59b6',
            strokeWidth: 1,
            selectable: true
          })
      }

      if (fabricObject) {
        // Apply common properties including z-index
        fabricObject.set({
          angle: rotation,
          opacity: opacity,
          componentId: component.id,
          componentType: component.type,
          zIndex: component.zIndex ?? 0
        })
        
        canvas.add(fabricObject)
      }
    } catch (error) {
      console.warn('Error rendering component:', component.type, error)
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
    
    fabricCanvas.getObjects().forEach(obj => obj.set('active', false))
    
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
    
    fabricCanvas.getObjects().forEach(obj => obj.set('active', false))
    
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
      
      newText.set('zIndex', Date.now())
      fabricCanvas.add(newText)
      fabricCanvas.setActiveObject(newText)
      fabricCanvas.renderAll()
      
      // Save to undo stack
      saveToUndoStack()
    })
  }

  const handleAddImage = () => {
    // This will be handled by the file upload in the toolbar
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
    if (!fabricCanvas) return
    
    fabricCanvas.clear()
    fabricCanvas.renderAll()
    
    // Save to undo stack
    saveToUndoStack()
  }

  return (
    <div 
      ref={containerRef}
      style={{ 
        display: 'flex', 
        height: '100%',
        position: 'relative',
        backgroundColor: '#f8f9fa'
      }}
    >
      {/* Main canvas area */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'hidden'
      }}>
        {/* Main Toolbar */}
        <div style={{
          width: '100%',
          borderRadius: '6px 6px 0 0',
          marginBottom: '0'
        }}>
          <MainToolbar
            mode={currentMode}
            onModeChange={setCurrentMode}
            onAddShape={handleAddShape}
            onAddText={handleAddText}
            onAddImage={handleAddImage}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={undoStack.length > 0}
            canRedo={redoStack.length > 0}
            onClear={handleClear}
            fabricCanvas={fabricCanvas}
          />
        </div>

        {/* Canvas container */}
        <div style={{
          border: '1px solid #dee2e6',
          borderTop: 'none',
          borderRadius: '0 0 6px 6px',
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
  )
}

EditableFabricCanvas.displayName = 'EditableFabricCanvas'

export default EditableFabricCanvas