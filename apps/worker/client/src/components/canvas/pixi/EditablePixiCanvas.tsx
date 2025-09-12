import { forwardRef, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { usePresentation } from '../../../context/PresentationContext'
import * as PIXI from 'pixi.js'
import type { 
  CanvasSlide,
  CanvasConfig
} from '../../../types/canvas'
import { renderTextComponent } from './renderers/TextRenderer'
import { renderShapeComponent } from './renderers/ShapeRenderer'
import { renderImageComponent } from './renderers/ImageRenderer'
import { renderTableComponent } from './renderers/TableRenderer'
import SlideCarousel from './slideshow/SlideCarousel'
import { MainToolbar } from './toolbars/MainToolbar'
import { TextFormattingToolbar } from './toolbars/TextFormattingToolbar'

interface EditablePixiCanvasProps {
  slides: CanvasSlide[]
  currentSlideIndex: number
  config: CanvasConfig
  onSlideSelect: (slideIndex: number) => void
  onSlideUpdate?: (slideIndex: number, slide: CanvasSlide) => void
  onReady?: () => void
}

const EditablePixiCanvas = forwardRef<any, EditablePixiCanvasProps>(({
  slides,
  currentSlideIndex,
  config,
  onSlideSelect,
  onSlideUpdate,
  onReady
}, _ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<PIXI.Application | null>(null)
  const stageRef = useRef<PIXI.Container | null>(null)
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentMode, setCurrentMode] = useState<'edit' | 'view'>(config.mode === 'edit' ? 'edit' : 'view')
  const [textFormattingVisible, setTextFormattingVisible] = useState(false)
  const [textFormattingPosition] = useState({ x: 0, y: 0 })
  const [undoStack, setUndoStack] = useState<CanvasSlide[]>([])
  const [redoStack, setRedoStack] = useState<CanvasSlide[]>([])
  const [zoom, setZoom] = useState(1)
  const [pixiReady, setPixiReady] = useState(false)

  // Component lifecycle logging (can be removed in production)
  useEffect(() => {
    console.log('PixiJS renderer mounted')
    return () => console.log('PixiJS renderer unmounted')
  }, [])

  // Get current slide with memoization
  const currentSlide = useMemo(() => {
    const slide = slides[currentSlideIndex] || null
    return slide
  }, [slides, currentSlideIndex])
  
  // Note: currentSlideContent removed as it's not currently used

  const { setRendererState } = usePresentation()
  const pixiSyncTimeoutRef = useRef<number | null>(null)
  const selectionGraphicsRef = useRef<PIXI.Graphics[]>([])
  
  // Selection handling is now inlined in the render components effect
  
  const handleStageClick = useCallback((event: PIXI.FederatedPointerEvent) => {
    // Deselect all when clicking on empty area
    if (event.target === stageRef.current) {
      setSelectedIds([])
      console.log('PixiJS stage clicked - deselect all')
    }
  }, [])
  
  // Clear selection when changing slides
  useEffect(() => {
    setSelectedIds([])
  }, [currentSlideIndex])
  
  // Clear previous selection graphics
  const clearSelectionGraphics = useCallback(() => {
    selectionGraphicsRef.current.forEach(graphic => {
      if (graphic.parent) {
        graphic.parent.removeChild(graphic)
      }
    })
    selectionGraphicsRef.current = []
  }, [])
  
  // Draw selection indicators
  const drawSelectionIndicators = useCallback(() => {
    if (!stageRef.current || !currentSlide) return
    
    // Clear existing selection graphics
    clearSelectionGraphics()
    
    // Find selected components and draw selection boxes
    selectedIds.forEach(selectedId => {
      // Find the component in current slide
      const component = currentSlide.components.find(c => c.id === selectedId)
      if (!component) return
      
      // Create selection box
      const selectionBox = new PIXI.Graphics()
      
      // Calculate scaled dimensions
      const slideWidth = currentSlide.dimensions?.width || 720
      const slideHeight = currentSlide.dimensions?.height || 540
      const scaleX = stageDimensions.width / slideWidth
      const scaleY = stageDimensions.height / slideHeight
      
      const x = (component.x || 0) * scaleX
      const y = (component.y || 0) * scaleY
      const width = (component.width || 100) * scaleX
      const height = (component.height || 100) * scaleY
      
      // Draw selection rectangle
      selectionBox.rect(x - 2, y - 2, width + 4, height + 4)
      selectionBox.stroke({ color: '#007bff', width: 2 })
      
      // Add selection handles (corner dots)
      const handleSize = 6
      const handles = [
        { x: x - handleSize/2, y: y - handleSize/2 }, // top-left
        { x: x + width - handleSize/2, y: y - handleSize/2 }, // top-right
        { x: x - handleSize/2, y: y + height - handleSize/2 }, // bottom-left
        { x: x + width - handleSize/2, y: y + height - handleSize/2 }, // bottom-right
        { x: x + width/2 - handleSize/2, y: y - handleSize/2 }, // top-center
        { x: x + width/2 - handleSize/2, y: y + height - handleSize/2 }, // bottom-center
        { x: x - handleSize/2, y: y + height/2 - handleSize/2 }, // left-center
        { x: x + width - handleSize/2, y: y + height/2 - handleSize/2 }, // right-center
      ]
      
      handles.forEach(handle => {
        selectionBox.rect(handle.x, handle.y, handleSize, handleSize)
        selectionBox.fill('#007bff')
      })
      
      // Add to stage and track for cleanup
      stageRef.current!.addChild(selectionBox)
      selectionGraphicsRef.current.push(selectionBox)
    })
  }, [selectedIds, currentSlide?.dimensions, stageDimensions, clearSelectionGraphics])
  
  // Update selection indicators when selectedIds changes
  useEffect(() => {
    if (pixiReady && stageRef.current) {
      drawSelectionIndicators()
    }
  }, [selectedIds, pixiReady, drawSelectionIndicators])
  
  // Debounced Pixi state sync for unified saves
  useEffect(() => {
    if (pixiSyncTimeoutRef.current) {
      clearTimeout(pixiSyncTimeoutRef.current)
    }
    pixiSyncTimeoutRef.current = window.setTimeout(() => {
      try {
        setRendererState('pixi', {
          slides: slides.map(s => ({
            id: s.id,
            slideNumber: s.slideNumber,
            components: s.components,
            dimensions: s.dimensions,
            background: s.background,
            metadata: s.metadata
          })),
          currentSlideIndex,
          zoom
        })
      } catch {}
    }, 300)
    return () => {
      if (pixiSyncTimeoutRef.current) {
        clearTimeout(pixiSyncTimeoutRef.current)
      }
    }
  }, [slides, currentSlideIndex, zoom, setRendererState])

  // Initialize PixiJS when container becomes available
  const initializePixiJS = useCallback(async () => {
    if (!containerRef.current || appRef.current) {
      return
    }

    try {
      console.log('Initializing PixiJS with dimensions:', stageDimensions)
      
      // Create PIXI application
      const app = new PIXI.Application()
      await app.init({
        width: stageDimensions.width,
        height: stageDimensions.height,
        backgroundColor: config.backgroundColor || '#ffffff',
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio
      })

      console.log('PixiJS app created successfully:', app)
      console.log('Canvas element:', app.canvas)
      console.log('Canvas size:', app.canvas.width, 'x', app.canvas.height)

      appRef.current = app
      stageRef.current = app.stage
      
      console.log('PixiJS refs set:', {
        app: !!appRef.current,
        stage: !!stageRef.current,
        stageChildren: stageRef.current?.children?.length
      })
      
      // Make sure canvas is visible and fits container
      app.canvas.style.display = 'block'
      app.canvas.style.width = '100%'
      app.canvas.style.height = '100%'
      
      containerRef.current.appendChild(app.canvas)
      
      console.log('Canvas appended to container')

      // Enable stage interaction
      app.stage.eventMode = 'static'
      app.stage.hitArea = app.screen
      
      // Add stage click handler for deselection
      app.stage.on('pointerdown', handleStageClick)

      console.log('PixiJS stage setup complete')
      
      // Set ready state to trigger re-render
      setPixiReady(true)
      
      onReady?.()
    } catch (error) {
      console.error('Failed to initialize PIXI:', error)
    }
  }, [stageDimensions, config.backgroundColor, onReady, handleStageClick])

  // Check for container availability and initialize
  useEffect(() => {
    console.log('Container check effect:', {
      hasContainer: !!containerRef.current,
      hasApp: !!appRef.current,
      stageDimensions
    })
    
    if (containerRef.current && !appRef.current) {
      console.log('Container available, initializing PixiJS')
      initializePixiJS()
    } else {
      console.log('Skipping PixiJS init:', {
        hasContainer: !!containerRef.current,
        hasApp: !!appRef.current
      })
    }
  }, [initializePixiJS])

  // Additional effect that runs on every render to check container
  useEffect(() => {
    console.log('Container ref status:', {
      containerRef: containerRef.current,
      hasApp: !!appRef.current
    })
  })

  // Cleanup effect
  useEffect(() => {
    return () => {
      console.log('Cleaning up PixiJS app')
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true })
        appRef.current = null
        stageRef.current = null
        setPixiReady(false)
      }
    }
  }, [])

  // Update stage dimensions based on container (reserve space for toolbar and carousel)
  useEffect(() => {
    if (!containerRef.current) return

    const updateDimensions = () => {
      const container = containerRef.current!
      const rect = container.getBoundingClientRect()
      
      // Use slide dimensions if available, otherwise fall back to container-based sizing
      let targetWidth = 720 // Standard PowerPoint width
      let targetHeight = 540 // Standard PowerPoint height
      
      if (currentSlide?.dimensions) {
        targetWidth = currentSlide.dimensions.width
        targetHeight = currentSlide.dimensions.height
      }
      
      // Scale to fit container while maintaining aspect ratio
      const containerWidth = Math.max(400, rect.width - 40)
      const containerHeight = Math.max(300, rect.height - 200)
      
      const scaleX = containerWidth / targetWidth
      const scaleY = containerHeight / targetHeight
      const scale = Math.min(scaleX, scaleY, 1) // Don't scale up
      
      const newWidth = targetWidth * scale
      const newHeight = targetHeight * scale
      
      console.log('PixiJS dimensions calculation:', {
        slideTarget: { width: targetWidth, height: targetHeight },
        containerAvailable: { width: containerWidth, height: containerHeight },
        scale,
        final: { width: newWidth, height: newHeight }
      })
      
      setStageDimensions({ width: newWidth, height: newHeight })
      
      if (appRef.current) {
        appRef.current.renderer.resize(newWidth, newHeight)
      }
    }

    updateDimensions()
    
    const resizeObserver = new ResizeObserver(updateDimensions)
    resizeObserver.observe(containerRef.current)

    return () => resizeObserver.disconnect()
  }, [currentSlide])

  // Render current slide components
  useEffect(() => {
    const renderComponents = async () => {
      console.log('PixiJS render effect triggered:', { 
        hasCurrentSlide: !!currentSlide, 
        hasStage: !!stageRef.current, 
        componentCount: currentSlide?.components?.length || 0,
        timestamp: Date.now()
      })
      
      if (!currentSlide || !stageRef.current) {
        console.log('PixiJS render early return:', { currentSlide: !!currentSlide, stage: !!stageRef.current })
        return
      }

      // Clear existing children and selection graphics
      stageRef.current.removeChildren()
      clearSelectionGraphics()
      console.log('PixiJS cleared existing children')

      // Render background
      if (currentSlide.background?.value) {
        console.log('PixiJS rendering background:', currentSlide.background.value)
        const bg = new PIXI.Graphics()
        bg.rect(0, 0, stageDimensions.width, stageDimensions.height)
        if (typeof currentSlide.background.value === 'string') {
          bg.fill(currentSlide.background.value)
        } else {
          bg.fill('#ffffff') // Fallback for complex gradients
        }
        stageRef.current.addChild(bg)
      }

      // PixiJS is now working properly

      // Calculate scale factor from slide dimensions to stage dimensions
      const slideWidth = currentSlide.dimensions?.width || 720
      const slideHeight = currentSlide.dimensions?.height || 540
      const scaleX = stageDimensions.width / slideWidth
      const scaleY = stageDimensions.height / slideHeight
      
      console.log('PixiJS scaling calculation:', {
        slideDimensions: { width: slideWidth, height: slideHeight },
        stageDimensions,
        scale: { x: scaleX, y: scaleY }
      })

      // Render components
      console.log('PixiJS rendering components:', currentSlide.components.length)
      
      // First, render all components and collect them with their z-index
      const renderedComponents: Array<{ displayObject: PIXI.Container | PIXI.Graphics | PIXI.Text | PIXI.Sprite, zIndex: number }> = []
      
      // Process components sequentially to handle async image loading
      for (let index = 0; index < currentSlide.components.length; index++) {
        const component = currentSlide.components[index]
        console.log(`PixiJS rendering component ${index}:`, component.type, {
          id: component.id,
          type: component.type,
          content: component.content,
          metadata: component.metadata,
          dimensions: { x: component.x, y: component.y, width: component.width, height: component.height },
          zIndex: component.zIndex
        })
        let displayObject: PIXI.Container | PIXI.Graphics | PIXI.Text | PIXI.Sprite | null = null

        try {
          switch (component.type) {
            case 'text':
              displayObject = renderTextComponent(component, `text-${index}`, scaleX, scaleY)
              break
            case 'shape':
              displayObject = renderShapeComponent(component, `shape-${index}`, scaleX, scaleY)
              break
            case 'image':
              displayObject = await renderImageComponent(component, `image-${index}`, scaleX, scaleY)
              break
            case 'table':
              displayObject = renderTableComponent(component, `table-${index}`, scaleX, scaleY)
              break
            default:
              // Unknown component type
              console.warn('Unknown component type:', component.type)
          }

          if (displayObject) {
            console.log(`PixiJS rendered component ${index}:`, {
              type: component.type,
              position: { x: displayObject.x, y: displayObject.y },
              size: { width: displayObject.width, height: displayObject.height },
              visible: displayObject.visible,
              zIndex: component.zIndex
            })
            
            // Store component ID for later interactivity setup
            ;(displayObject as any).__componentId = component.id
            ;(displayObject as any).__componentType = component.type
            
            // Add to collection for sorting
            renderedComponents.push({
              displayObject,
              zIndex: component.zIndex || 0
            })
          } else {
            console.warn(`PixiJS component ${index} (${component.type}) returned null display object`)
          }
        } catch (error) {
          console.error(`Error rendering component ${component.type} (index ${index}):`, error)
          console.error('Component data:', component)
          
          // Create error placeholder
          try {
            const errorPlaceholder = new PIXI.Graphics()
            errorPlaceholder.rect((component.x || 0) * scaleX, (component.y || 0) * scaleY, (component.width || 100) * scaleX, (component.height || 50) * scaleY)
            errorPlaceholder.fill('#ffcccc')
            errorPlaceholder.stroke({ color: '#ff0000', width: 2 })
            
            const errorText = new PIXI.Text({
              text: `Error: ${component.type}`,
              style: new PIXI.TextStyle({
                fontSize: 12 * Math.min(scaleX, scaleY),
                fill: '#cc0000'
              })
            })
            errorText.x = ((component.x || 0) + 5) * scaleX
            errorText.y = ((component.y || 0) + 5) * scaleY
            
            const errorContainer = new PIXI.Container()
            errorContainer.addChild(errorPlaceholder)
            errorContainer.addChild(errorText)
            
            renderedComponents.push({
              displayObject: errorContainer,
              zIndex: component.zIndex || 0
            })
          } catch (placeholderError) {
            console.error('Failed to create error placeholder:', placeholderError)
          }
        }
      }
      
      // Sort components by z-index (lower values render first/behind, higher values on top)
      renderedComponents.sort((a, b) => a.zIndex - b.zIndex)
      
      console.log('PixiJS z-index sorted order:', renderedComponents.map((item, idx) => ({ 
        index: idx, 
        zIndex: item.zIndex, 
        type: (item.displayObject as any).__componentType 
      })))
      
      // Add components to stage in z-index order
      renderedComponents.forEach(({ displayObject }) => {
        stageRef.current!.addChild(displayObject)
      })
      
      // Setup interactivity after all components are added
      if (currentMode === 'edit') {
        renderedComponents.forEach(({ displayObject }) => {
          const componentId = (displayObject as any).__componentId
          if (componentId) {
            displayObject.eventMode = 'static'
            displayObject.cursor = 'pointer'
            
            // Remove existing listeners to avoid duplicates
            displayObject.removeAllListeners('pointerdown')
            
            // Add click handler
            displayObject.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
              event.stopPropagation()
              
              // Toggle selection
              if (event.shiftKey) {
                setSelectedIds(prev => 
                  prev.includes(componentId) 
                    ? prev.filter(id => id !== componentId)
                    : [...prev, componentId]
                )
              } else {
                setSelectedIds([componentId])
              }
              
              console.log('PixiJS component selected:', componentId)
            })
          }
        })
      }
    }
    
    renderComponents()
  }, [currentSlide, stageDimensions, pixiReady])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault()
          handleUndo()
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault()
          handleRedo()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return
    
    const previousState = undoStack[undoStack.length - 1]
    setRedoStack(prev => [...prev, currentSlide!])
    setUndoStack(prev => prev.slice(0, -1))
    
    if (onSlideUpdate && currentSlide) {
      onSlideUpdate(currentSlideIndex, previousState)
    }
  }, [undoStack, currentSlide, currentSlideIndex, onSlideUpdate])

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return
    
    const nextState = redoStack[redoStack.length - 1]
    setUndoStack(prev => [...prev, currentSlide!])
    setRedoStack(prev => prev.slice(0, -1))
    
    if (onSlideUpdate && currentSlide) {
      onSlideUpdate(currentSlideIndex, nextState)
    }
  }, [redoStack, currentSlide, currentSlideIndex, onSlideUpdate])

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(config.maxZoom || 8, prev * 1.2))
  }, [config.maxZoom])

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(config.minZoom || 0.1, prev / 1.2))
  }, [config.minZoom])

  const handleZoomReset = useCallback(() => {
    setZoom(1)
  }, [])

  // Apply zoom transform
  useEffect(() => {
    if (stageRef.current) {
      stageRef.current.scale.set(zoom)
    }
  }, [zoom])

  if (slides.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#666',
        fontSize: '18px'
      }}>
        No slides to display
      </div>
    )
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Main Toolbar */}
      <MainToolbar
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        zoom={zoom}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        selectedCount={selectedIds.length}
      />

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        style={{ 
          flex: 1, 
          position: 'relative',
          overflow: 'hidden',
          margin: '20px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          minHeight: '400px' // Ensure container has minimum height
        }}
      >
        {/* Fallback content to show container is working */}
        {!pixiReady && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#666',
            fontSize: '16px'
          }}>
            PixiJS Initializing...
          </div>
        )}
      </div>

      {/* Text Formatting Toolbar */}
      {textFormattingVisible && (
        <TextFormattingToolbar
          position={textFormattingPosition}
          onClose={() => setTextFormattingVisible(false)}
          onFormatChange={(format) => {
            console.log('Text format change:', format)
          }}
        />
      )}

      {/* Slide Carousel */}
      <SlideCarousel
        slides={slides}
        currentSlideIndex={currentSlideIndex}
        onSlideSelect={onSlideSelect}
      />
    </div>
  )
})

EditablePixiCanvas.displayName = 'EditablePixiCanvas'

export default EditablePixiCanvas