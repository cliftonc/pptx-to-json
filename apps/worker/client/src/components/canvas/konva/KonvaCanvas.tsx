import { forwardRef, useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import type { 
  CanvasSlide,
  CanvasConfig
} from '../../../types/canvas'
import { renderTextComponent } from './renderers/TextRenderer'
import { renderShapeComponent } from './renderers/ShapeRenderer'
import { renderImageComponent } from './renderers/ImageRenderer'
import { renderTableComponent } from './renderers/TableRenderer'
import SlideCarousel from './slideshow/SlideCarousel'

interface KonvaCanvasProps {
  slides: CanvasSlide[]
  currentSlideIndex: number
  config: CanvasConfig
  onSlideSelect: (slideIndex: number) => void
  onReady?: () => void
}

const KonvaCanvas = forwardRef<any, KonvaCanvasProps>(({
  slides,
  currentSlideIndex,
  config,
  onSlideSelect,
  onReady
}, _ref) => {
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [stageDimensions, setStageDimensions] = useState({ width: 800, height: 600 })
  
  // Get current slide
  const currentSlide = slides[currentSlideIndex] || null

  // Update stage dimensions based on container
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const container = containerRef.current
        const width = container.clientWidth
        // Reserve space for carousel (120px) plus some padding
        const height = container.clientHeight - 140
        setStageDimensions({ width, height })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Calculate scale to fit slide in stage
  const getStageScale = () => {
    if (!currentSlide) return 1

    const slideWidth = currentSlide.dimensions.width
    const slideHeight = currentSlide.dimensions.height
    const stageWidth = stageDimensions.width - 40 // padding
    const stageHeight = stageDimensions.height - 40 // padding

    const scaleX = stageWidth / slideWidth
    const scaleY = stageHeight / slideHeight
    
    return Math.min(scaleX, scaleY, 1) // Don't scale up beyond 100%
  }

  // Calculate stage position to center the slide
  const getStagePosition = () => {
    if (!currentSlide) return { x: 0, y: 0 }

    const scale = getStageScale()
    const slideWidth = currentSlide.dimensions.width * scale
    const slideHeight = currentSlide.dimensions.height * scale
    
    const x = (stageDimensions.width - slideWidth) / 2
    const y = (stageDimensions.height - slideHeight) / 2
    
    return { x, y }
  }

  // Render component based on type
  const renderComponent = (component: any, index: number) => {
    const key = `${component.id || component.type}-${index}`
    
    switch (component.type) {
      case 'text':
        return renderTextComponent(component, key)
      case 'shape':
        return renderShapeComponent(component, key)
      case 'image':
        return renderImageComponent(component, key)
      case 'table':
        return renderTableComponent(component, key)
      default:
        return null
    }
  }


  // Keyboard shortcuts for slide navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts if not typing in an input/textarea
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
        case 'Home':
          event.preventDefault()
          onSlideSelect(0)
          break
        case 'End':
          event.preventDefault()
          onSlideSelect(slides.length - 1)
          break
      }
    }

    // Add event listener to window
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentSlideIndex, slides.length, onSlideSelect])

  // Notify when ready
  useEffect(() => {
    if (onReady) {
      onReady()
    }
  }, [onReady])

  const scale = getStageScale()
  const position = getStagePosition()

  return (
    <div 
      ref={containerRef}
      className="konva-canvas-container"
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: config.backgroundColor || '#ffffff'
      }}
    >
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
          scaleX={scale}
          scaleY={scale}
          x={position.x}
          y={position.y}
          draggable={config.enablePan && config.mode !== 'readonly'}
        >
          <Layer>
            {/* Slide background */}
            {currentSlide && (
              <Rect
                width={currentSlide.dimensions.width}
                height={currentSlide.dimensions.height}
                fill={currentSlide.background?.type === 'color' ? 
                  currentSlide.background.value as string : '#ffffff'}
                stroke="#ddd"
                strokeWidth={1}
              />
            )}
            
            {/* Render slide components sorted by zIndex */}
            {currentSlide?.components
              .slice() // Create a copy to avoid mutating the original array
              .sort((a, b) => {
                // Use top-level zIndex property (same as TLDraw implementation)
                const aZ = a.zIndex ?? 0
                const bZ = b.zIndex ?? 0
                return aZ - bZ
              })
              .map(renderComponent)}
          </Layer>
        </Stage>
        
        {/* Slide info overlay */}
        {currentSlide && (
          <div 
            className="slide-info"
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontFamily: 'system-ui, sans-serif'
            }}
          >
            {currentSlide.name || `Slide ${currentSlide.slideNumber}`}
            {slides.length > 1 && ` (${currentSlideIndex + 1} of ${slides.length})`}
          </div>
        )}
      </div>

      {/* Slide carousel at bottom */}
      <SlideCarousel
        slides={slides}
        currentSlideIndex={currentSlideIndex}
        onSlideSelect={onSlideSelect}
      />
    </div>
  )
})

KonvaCanvas.displayName = 'KonvaCanvas'

export default KonvaCanvas