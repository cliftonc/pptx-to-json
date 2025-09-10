import { forwardRef, useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { usePresentation } from '../../../context/PresentationContext'
import { Stage, Layer, Rect, Transformer } from 'react-konva'
import Konva from 'konva' // Used for typing
import type { 
  CanvasSlide,
  CanvasConfig,
  CanvasComponent
} from '../../../types/canvas'
import { renderTextComponent } from './renderers/TextRenderer'
import { renderShapeComponent } from './renderers/ShapeRenderer'
import { renderImageComponent } from './renderers/ImageRenderer'
import { renderTableComponent } from './renderers/TableRenderer'
import SlideCarousel from './slideshow/SlideCarousel'
import { MainToolbar } from './toolbars/MainToolbar'
import { TextFormattingToolbar } from './toolbars/TextFormattingToolbar'
import { EditableText } from './editors/EditableText'
import ThumbnailGenerator, { type ThumbnailGeneratorRef } from './ThumbnailGenerator'

interface EditableKonvaCanvasProps {
  slides: CanvasSlide[]
  currentSlideIndex: number
  config: CanvasConfig
  onSlideSelect: (slideIndex: number) => void
  onSlideUpdate?: (slideIndex: number, slide: CanvasSlide) => void
  onReady?: () => void
}

const EditableKonvaCanvas = forwardRef<any, EditableKonvaCanvasProps>(({
  slides,
  currentSlideIndex,
  config,
  onSlideSelect,
  onSlideUpdate,
  onReady
}, _ref) => {
  const stageRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const thumbnailGeneratorRef = useRef<ThumbnailGeneratorRef>(null)
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentMode, setCurrentMode] = useState(config.mode)
  const [editingTextId, setEditingTextId] = useState<string | null>(null)
  const [textFormattingVisible, setTextFormattingVisible] = useState(false)
  const [textFormattingPosition, setTextFormattingPosition] = useState({ x: 0, y: 0 })
  const [undoStack, setUndoStack] = useState<CanvasSlide[]>([])
  const [redoStack, setRedoStack] = useState<CanvasSlide[]>([])
  const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [stageOffset, setStageOffset] = useState({ x: 0, y: 0 })
  // Manual panning state (we avoid Konva's internal stage dragging to prevent accidental shifts)
  const [isPanning, setIsPanning] = useState(false)
  const panStartRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(null)
  
  // Thumbnail generation is handled automatically via useEffect
  
  // Get current slide with memoization to prevent re-renders from thumbnail-only updates
  const currentSlide = useMemo(() => {
    const slide = slides[currentSlideIndex] || null
    return slide
  }, [slides, currentSlideIndex])
  
  // Cache the slide content (without thumbnailUrl) to detect meaningful changes
  const currentSlideContent = useMemo(() => {
    if (!currentSlide) return null
    const { thumbnailUrl, ...contentWithoutThumbnail } = currentSlide
    return contentWithoutThumbnail
  }, [currentSlide])

  const { setRendererState } = usePresentation()
  const konvaSyncTimeoutRef = useRef<number | null>(null)
  // Debounced Konva state sync for unified saves
  useEffect(() => {
    if (konvaSyncTimeoutRef.current) {
      clearTimeout(konvaSyncTimeoutRef.current)
    }
    konvaSyncTimeoutRef.current = window.setTimeout(() => {
      try {
        setRendererState('konva', {
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
      } catch {}
    }, 300)
    return () => {
      if (konvaSyncTimeoutRef.current) {
        clearTimeout(konvaSyncTimeoutRef.current)
      }
    }
  }, [slides, currentSlideIndex, setRendererState])

  // Update stage dimensions based on container (reserve space for toolbar)
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const container = containerRef.current
        const width = container.clientWidth
        // Reserve space for toolbar (60px) and carousel (120px) plus padding
        const height = container.clientHeight - 200
        setStageDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Calculate scale to fit slide in stage
  const getStageScale = () => {
    if (!currentSlideContent) return 1

    const slideWidth = currentSlideContent.dimensions.width
    const slideHeight = currentSlideContent.dimensions.height
    const stageWidth = stageDimensions.width - 40 // padding
    const stageHeight = stageDimensions.height - 40 // padding

    const scaleX = stageWidth / slideWidth
    const scaleY = stageHeight / slideHeight
    
    return Math.min(scaleX, scaleY, 1) // Don't scale up beyond 100%
  }

  // Calculate stage position to center the slide
  const getStagePosition = () => {
    if (!currentSlideContent) return { x: 0, y: 0 }

    const scale = getStageScale()
    const slideWidth = currentSlideContent.dimensions.width * scale
    const slideHeight = currentSlideContent.dimensions.height * scale
    const x = (stageDimensions.width - slideWidth) / 2
    const y = (stageDimensions.height - slideHeight) / 2
    return { x, y }
  }

  // Save current state for undo
  const saveToUndoStack = useCallback(() => {
    if (currentSlide) {
      setUndoStack(prev => [...prev.slice(-19), { ...currentSlide }]) // Keep max 20 states
      setRedoStack([]) // Clear redo stack on new action
    }
  }, [currentSlide])

  // Update component
  const updateComponent = useCallback((componentId: string, updates: Partial<CanvasComponent>) => {
    if (!currentSlide || !onSlideUpdate) return

    saveToUndoStack()
    
    const updatedSlide = {
      ...currentSlide,
      components: currentSlide.components.map(comp => 
        comp.id === componentId 
          ? { ...comp, ...updates }
          : comp
      )
    }
    
    onSlideUpdate(currentSlideIndex, updatedSlide)
  }, [currentSlide, currentSlideIndex, onSlideUpdate, saveToUndoStack])

  // Add new component
  const addComponent = useCallback((component: Omit<CanvasComponent, 'id'>) => {
    if (!currentSlide || !onSlideUpdate) return

    saveToUndoStack()
    
    const newComponent: CanvasComponent = {
      ...component,
      id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
    }
    
    const updatedSlide = {
      ...currentSlide,
      components: [...currentSlide.components, newComponent]
    }
    
    onSlideUpdate(currentSlideIndex, updatedSlide)
    setSelectedIds([newComponent.id])
  }, [currentSlide, currentSlideIndex, onSlideUpdate, saveToUndoStack])

  // Remove components
  const removeComponents = useCallback((ids: string[]) => {
    if (!currentSlide || !onSlideUpdate || ids.length === 0) return

    saveToUndoStack()

    const updatedSlide = {
      ...currentSlide,
      components: currentSlide.components.filter(c => !ids.includes(c.id))
    }

    onSlideUpdate(currentSlideIndex, updatedSlide)
    setSelectedIds([])
    if (editingTextId && ids.includes(editingTextId)) {
      setEditingTextId(null)
    }
    setTextFormattingVisible(false)
    if (transformerRef.current) {
      transformerRef.current.nodes([])
    }
  }, [currentSlide, currentSlideIndex, onSlideUpdate, saveToUndoStack, editingTextId])

  // Handle shape addition
  const handleAddShape = (shapeType: string) => {
    const centerX = currentSlideContent ? currentSlideContent.dimensions.width / 2 - 50 : 100
    const centerY = currentSlideContent ? currentSlideContent.dimensions.height / 2 - 50 : 100
    
    addComponent({
      type: 'shape',
      x: centerX,
      y: centerY,
      width: 100,
      height: 100,
      content: { shapeType },
      style: {
        fill: '#cccccc',
        stroke: '#000000',
        strokeWidth: 1,
      },
      zIndex: Date.now(),
    })
  }

  // Handle text addition
  const handleAddText = () => {
    const centerX = currentSlideContent ? currentSlideContent.dimensions.width / 2 - 75 : 100
    const centerY = currentSlideContent ? currentSlideContent.dimensions.height / 2 - 25 : 100
    
    const newTextComponent: Omit<CanvasComponent, 'id'> = {
      type: 'text',
      x: centerX,
      y: centerY,
      width: 150,
      height: 50,
      content: { text: 'New Text', content: 'New Text' },
      style: {
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        color: '#000000',
        textAlign: 'left',
      },
      zIndex: Date.now(),
    }
    
    addComponent(newTextComponent)
  }


  // Undo/Redo handlers
  const handleUndo = () => {
    if (undoStack.length === 0 || !onSlideUpdate) return
    
    const previousState = undoStack[undoStack.length - 1]
    setRedoStack(prev => currentSlide ? [currentSlide, ...prev] : prev)
    setUndoStack(prev => prev.slice(0, -1))
    onSlideUpdate(currentSlideIndex, previousState)
  }

  const handleRedo = () => {
    if (redoStack.length === 0 || !onSlideUpdate) return
    
    const nextState = redoStack[0]
    setUndoStack(prev => currentSlide ? [...prev, currentSlide] : prev)
    setRedoStack(prev => prev.slice(1))
    onSlideUpdate(currentSlideIndex, nextState)
  }

  // Clear all presentation state - perform complete page reload
  const handleClear = useCallback(() => {
    // Perform a complete page reload to guarantee a full reset
    // This is exactly what happens when you press F5 or hard refresh
    window.location.reload()
  }, [])

  // Thumbnail generation is now handled automatically via useEffect

  // Handle component clicks
  const handleComponentClick = (componentId: string, event?: any) => {
    if (currentMode === 'readonly') return

    if (event) {
      event.cancelBubble = true
    }
    
    // Select the component on click
    setSelectedIds([componentId])
    setEditingTextId(null)
    
    // Show formatting toolbar for text components
    const component = currentSlide?.components.find(c => c.id === componentId)
    if (component?.type === 'text') {
      const currentScale = getStageScale()
      const stagePos = getStagePosition()
      const containerRect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 }
      
      setTextFormattingPosition({
        x: containerRect.left + stagePos.x + (component.x + component.width / 2) * currentScale,
        y: containerRect.top + stagePos.y + (component.y - 60) * currentScale + 60, // +60 for toolbar height
      })
      setTextFormattingVisible(true)
    } else {
      setTextFormattingVisible(false)
    }
  }

  // Handle stage click (deselect)
  const handleStageClick = (e: any) => {
    if (e.target === e.target.getStage() || e.target.getClassName() === 'Rect') {
      setSelectedIds([])
      setEditingTextId(null)
      setTextFormattingVisible(false)
    }
  }

  // Handle component double-click (start text editing)
  const handleComponentDoubleClick = (componentId: string) => {
    if (currentMode === 'readonly') return
    
    const component = currentSlide?.components.find(c => c.id === componentId)
    if (component?.type === 'text') {
      setEditingTextId(componentId)
      setSelectedIds([])
    }
  }

  // Enhanced render component function with editing support
  const renderComponent = (component: CanvasComponent, index: number) => {
    const key = `${component.id || component.type}-${index}`
    const isSelected = selectedIds.includes(component.id)
    
    let renderedComponent

    switch (component.type) {
      case 'text':
        renderedComponent = renderTextComponent({
          ...component,
          isSelected,
          onClick: (e: any) => {
            e?.cancelBubble && (e.cancelBubble = true)
            handleComponentClick(component.id, e)
          },
          onDoubleClick: () => handleComponentDoubleClick(component.id),
          draggable: currentMode === 'edit',
          onDragEnd: (e: any) => {
            const node = e.target
            updateComponent(component.id, {
              x: node.x(),
              y: node.y(),
            })
          },
          isEditing: editingTextId === component.id,
        }, key)
        break
      case 'shape':
        renderedComponent = renderShapeComponent({
          ...component,
          isSelected,
          onClick: (e: any) => {
            e?.cancelBubble && (e.cancelBubble = true)
            handleComponentClick(component.id, e)
          },
          draggable: currentMode === 'edit',
          onDragEnd: (e: any) => {
            const node = e.target
            updateComponent(component.id, {
              x: node.x(),
              y: node.y(),
            })
          },
        }, key)
        break
      case 'image':
        renderedComponent = renderImageComponent({
          ...component,
          isSelected,
          onClick: (e: any) => {
            e?.cancelBubble && (e.cancelBubble = true)
            handleComponentClick(component.id, e)
          },
          draggable: currentMode === 'edit',
          onDragEnd: (e: any) => {
            const node = e.target
            updateComponent(component.id, {
              x: node.x(),
              y: node.y(),
            })
          },
        }, key)
        break
      case 'table':
        renderedComponent = renderTableComponent({
          ...component,
          isSelected,
          onClick: (e: any) => {
            e?.cancelBubble && (e.cancelBubble = true)
            handleComponentClick(component.id, e)
          },
          draggable: currentMode === 'edit',
          onDragEnd: (e: any) => {
            const node = e.target
            updateComponent(component.id, {
              x: node.x(),
              y: node.y(),
            })
          },
        }, key)
        break
      default:
        return null
    }

    return renderedComponent
  }

  // Update transformer when selection changes (no debug logging)
  useEffect(() => {
    const transformer = transformerRef.current
    const stage = stageRef.current
    if (!transformer || !stage) return

    requestAnimationFrame(() => {
      const selectedNodes = selectedIds
        .map(componentId => (
          stage.findOne(`[id="${componentId}"]`) as Konva.Node ||
          stage.findOne(`[name="${componentId}"]`) as Konva.Node ||
          stage.findOne((node: Konva.Node) => node.id() === componentId) as Konva.Node ||
            stage.findOne((node: Konva.Node) => node.name() === componentId) as Konva.Node
        ))
        .filter((n): n is Konva.Node => !!n)

      transformer.nodes(selectedNodes)
      transformer.getLayer()?.batchDraw()
    })
  }, [selectedIds])

  // Keyboard shortcuts and shift detection
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(true)
      }
      if (editingTextId || 
          event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLElement && event.target.contentEditable === 'true') {
        return
      }

      switch (event.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedIds.length > 0) {
            event.preventDefault()
            removeComponents(selectedIds)
          }
          break
        case 'Escape':
          setSelectedIds([])
          setEditingTextId(null)
          setTextFormattingVisible(false)
          break
        case 'Enter':
          if (selectedIds.length === 1) {
            const component = currentSlide?.components.find(c => c.id === selectedIds[0])
            if (component?.type === 'text') {
              setEditingTextId(component.id)
              setSelectedIds([])
            }
          }
          break
        case 'z':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            if (event.shiftKey) {
              handleRedo()
            } else {
              handleUndo()
            }
          }
          break
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

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setIsShiftPressed(false)
        // Cancel an in-progress pan if shift released mid-drag
        if (isPanning) {
          setIsPanning(false)
          panStartRef.current = null
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [selectedIds, editingTextId, currentSlide, undoStack, redoStack, isPanning, removeComponents])

  // Update current mode when config changes
  useEffect(() => {
    setCurrentMode(config.mode)
  }, [config.mode])

  // Clear selection & editing state when slide changes
  useEffect(() => {
    setSelectedIds([])
    setEditingTextId(null)
    setTextFormattingVisible(false)
    if (transformerRef.current) {
      transformerRef.current.nodes([])
    }
  }, [currentSlideIndex])

  // Notify when ready
  useEffect(() => {
    if (onReady) {
      onReady()
    }
  }, [onReady])

  // Automatic thumbnail generation (with loop prevention)
  const processedSlidesRef = useRef<Set<string>>(new Set())
  const lastSlideCountRef = useRef(0)
  const generationTimeoutRef = useRef<number | null>(null)
  
  useEffect(() => {
    // Only trigger when slides change count or new slides are added
    const slideCount = slides.length
    
    // Skip if no slides or same slide count already processed
    if (slideCount === 0 || slideCount === lastSlideCountRef.current) {
      return
    }
    
    // Clear any pending generation
    if (generationTimeoutRef.current) {
      clearTimeout(generationTimeoutRef.current)
    }
    
    // Delay to ensure Konva canvas is fully rendered
    generationTimeoutRef.current = window.setTimeout(() => {
      const slidesNeedingThumbnails = slides.filter(slide => 
        !slide.thumbnailUrl && !processedSlidesRef.current.has(slide.id)
      )
      
      if (slidesNeedingThumbnails.length > 0 && thumbnailGeneratorRef.current && onSlideUpdate) {
        // Mark slides as being processed to prevent reprocessing
        slidesNeedingThumbnails.forEach(slide => 
          processedSlidesRef.current.add(slide.id)
        )
        
        // Get slideId from window or URL
        const slideId = (window as any).currentSlideId || 
          new URL(window.location.href).pathname.split('/').pop() || 
          'unknown'
        
        // Create a thumbnail update callback that only updates thumbnails
        const silentThumbnailUpdate = (slideIndex: number, updates: Partial<CanvasSlide>) => {
          // Update the slide with thumbnail URL - the memoized currentSlideContent will prevent main canvas re-renders
          if (onSlideUpdate && updates.thumbnailUrl) {
            const currentSlideForUpdate = slides[slideIndex]
            if (currentSlideForUpdate) {
              const updatedSlide = { ...currentSlideForUpdate, ...updates }
              onSlideUpdate(slideIndex, updatedSlide)
            }
          }
        }
        
        thumbnailGeneratorRef.current.generateThumbnails(
          slides, 
          slideId,
          silentThumbnailUpdate
        )
      }
      
      // Update processed count
      lastSlideCountRef.current = slideCount
    }, 1500) // 1.5 second delay to ensure rendering is complete
    
    return () => {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current)
      }
    }
  }, [slides.length]) // Only depend on slides.length, not the slides array itself

  const scale = getStageScale()
  const position = getStagePosition()

  // Stage mouse handlers for manual panning
  const handleStageMouseDown = (e: any) => {
    if (!config.enablePan || currentMode === 'readonly') return
    const target = e.target
    const isBackground = target === e.target.getStage()
    if (isBackground && isShiftPressed && selectedIds.length === 0) {
      setIsPanning(true)
      panStartRef.current = { x: e.evt.clientX, y: e.evt.clientY, startX: stageOffset.x, startY: stageOffset.y }
    }
  }

  const handleStageMouseMove = (e: any) => {
    if (!isPanning || !panStartRef.current) return
    const { x, y, startX, startY } = panStartRef.current
    const dx = e.evt.clientX - x
    const dy = e.evt.clientY - y
    setStageOffset({ x: startX + dx, y: startY + dy })
  }

  const endPan = () => {
    if (isPanning) {
      setIsPanning(false)
      panStartRef.current = null
    }
  }

  const handleStageTouchStart = (e: any) => {
    if (!config.enablePan || currentMode === 'readonly') return
    if (!isShiftPressed) return // Require Shift for consistency (desktop behavior)
    const target = e.target
    const isBackground = target === e.target.getStage()
    if (isBackground && selectedIds.length === 0) {
      const touch = e.evt.touches[0]
      setIsPanning(true)
      panStartRef.current = { x: touch.clientX, y: touch.clientY, startX: stageOffset.x, startY: stageOffset.y }
    }
  }

  const handleStageTouchMove = (e: any) => {
    if (!isPanning || !panStartRef.current) return
    const touch = e.evt.touches[0]
    if (!touch) return
    const { x, y, startX, startY } = panStartRef.current
    const dx = touch.clientX - x
    const dy = touch.clientY - y
    setStageOffset({ x: startX + dx, y: startY + dy })
  }

  const handleStageTouchEnd = () => endPan()

  return (
    <div 
      ref={containerRef}
      className="editable-konva-canvas-container"
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

      {/* Main canvas area */}
      <div 
        className="konva-stage-container"
        style={{ 
          flex: 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Stage
          ref={stageRef}
          width={stageDimensions.width}
          height={stageDimensions.height}
          x={stageOffset.x}
          y={stageOffset.y}
          draggable={false} // Disabled; manual pan implemented
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={(e) => { endPan(); handleStageClick(e) }}
          onMouseLeave={endPan}
          onClick={handleStageClick}
          onTouchStart={handleStageTouchStart}
          onTouchMove={handleStageTouchMove}
          onTouchEnd={(e) => { handleStageTouchEnd(); handleStageClick(e) }}
          onTouchCancel={handleStageTouchEnd}
          style={{ cursor: isPanning ? 'grabbing' : (isShiftPressed ? 'grab' : 'default') }}
        >
          <Layer
            scaleX={scale}
            scaleY={scale}
            x={position.x}
            y={position.y}
          >
            {/* Slide background - use memoized content to prevent re-renders from thumbnail updates */}
            {currentSlideContent && (
              <Rect
                width={currentSlideContent.dimensions.width}
                height={currentSlideContent.dimensions.height}
                fill={currentSlideContent.background?.type === 'color' ? 
                  currentSlideContent.background.value as string : '#ffffff'}
                stroke="#ddd"
                strokeWidth={1 / scale} // Adjust stroke width for scaling
                listening={false} // Don't intercept clicks - let them pass through to components
              />
            )}
            
            {/* Render slide components sorted by zIndex - use memoized content to prevent re-renders from thumbnail updates */}
            {currentSlideContent?.components
              .slice()
              .sort((a, b) => {
                const aZ = a.zIndex ?? 0
                const bZ = b.zIndex ?? 0
                return aZ - bZ
              })
              .map((component, index) => renderComponent(component, index))}

            {/* Transformer for selected elements */}
            {currentMode === 'edit' && selectedIds.length > 0 && (
              <Transformer
                borderStroke="#4a90e2"
                borderStrokeWidth={1 / scale}
                borderDash={[]}
                anchorStroke="#4a90e2"
                anchorFill="#ffffff"
                anchorSize={6 / scale}
                rotateAnchorOffset={20 / scale}
                ref={transformerRef}
                boundBoxFunc={(oldBox, newBox) => {
                  const minSize = 10 / scale
                  if (newBox.width < minSize || newBox.height < minSize) {
                    return oldBox
                  }
                  return newBox
                }}
                onTransformEnd={(e) => {
                  const node = e.target
                  const scaleX = node.scaleX()
                  const scaleY = node.scaleY()

                  node.scaleX(1)
                  node.scaleY(1)

                  const component = currentSlide?.components.find(c => c.id === node.id())
                  const updates: Partial<CanvasComponent> = {
                    x: node.x(),
                    y: node.y(),
                    width: Math.max(10, node.width() * scaleX),
                    height: Math.max(10, node.height() * scaleY),
                    rotation: node.rotation(),
                  }

                  if (component?.type === 'text') {
                    const originalFontSize = component.style?.fontSize || 16
                    const newFontSize = Math.max(8, originalFontSize * scaleY)
                    updates.style = {
                      ...component.style,
                      fontSize: newFontSize
                    }
                  }

                  updateComponent(node.id(), updates)
                }}
                onDragEnd={(e) => {
                  const node = e.target
                  updateComponent(node.id(), {
                    x: node.x(),
                    y: node.y(),
                  })
                }}
              />
            )}
          </Layer>
        </Stage>
        

      </div>

      {/* Text Formatting Toolbar */}
      {selectedIds.length === 1 && currentSlide?.components.find(c => c.id === selectedIds[0])?.type === 'text' && (
        <TextFormattingToolbar
          isVisible={textFormattingVisible}
          position={textFormattingPosition}
          currentStyle={currentSlide?.components.find(c => c.id === selectedIds[0])?.style || {}}
          onStyleChange={(styleUpdates) => {
            if (selectedIds[0]) {
              updateComponent(selectedIds[0], { style: { ...currentSlide?.components.find(c => c.id === selectedIds[0])?.style, ...styleUpdates } })
            }
          }}
          onClose={() => setTextFormattingVisible(false)}
        />
      )}

      {/* Editable Text Overlay */}
      {editingTextId && currentSlide && (() => {
        const stage = stageRef.current
        const container = containerRef.current
        
        if (!stage || !container) return null
        
        const stageContainerRect = stage.container().getBoundingClientRect()
        const layer = stage.findOne('Layer')
        if (!layer) return null
        const stageTransform = layer.getAbsoluteTransform().copy()
        
        return (
          <EditableText
            component={currentSlide.components.find(c => c.id === editingTextId)!}
            scale={scale}
            containerRect={stageContainerRect}
            stageTransform={stageTransform}
            onUpdate={(updates) => updateComponent(editingTextId, updates)}
            onFinishEditing={() => setEditingTextId(null)}
            isEditing={true}
          />
        )
      })()}

      {/* Slide carousel at bottom */}
      <SlideCarousel
        slides={slides}
        currentSlideIndex={currentSlideIndex}
        onSlideSelect={onSlideSelect}
      />

      {/* Off-screen thumbnail generator */}
      <ThumbnailGenerator
        ref={thumbnailGeneratorRef}
        onError={(slideIndex, error) => {
          console.error(`Thumbnail generation failed for slide ${slideIndex + 1}:`, error)
        }}
      />
    </div>
  )
})

EditableKonvaCanvas.displayName = 'EditableKonvaCanvas'

export default EditableKonvaCanvas
