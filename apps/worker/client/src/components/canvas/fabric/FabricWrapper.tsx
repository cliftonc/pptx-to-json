import React from 'react'
import EditableFabricCanvas from './EditableFabricCanvas'
import type { PowerPointSlide } from 'ppt-paste-parser'

interface FabricWrapperProps {
  slides?: PowerPointSlide[]
  slideDimensions?: { width: number; height: number }
  masters?: any[]
  layouts?: any[]
  theme?: any
  slideId?: string
}

const FabricWrapper: React.FC<FabricWrapperProps> = ({
  slides = [],
  slideDimensions
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = React.useState(0)

  // Convert slides to canvas format
  const canvasSlides = React.useMemo(() => {
    return slides.map((slide, index) => ({
      id: slide.slideIndex?.toString() || `slide-${index}`,
      name: slide.metadata?.name || `Slide ${slide.slideNumber || index + 1}`,
      slideNumber: slide.slideNumber || index + 1,
      components: slide.components || [],
      dimensions: {
        width: slide.metadata?.width || slideDimensions?.width || 720,
        height: slide.metadata?.height || slideDimensions?.height || 540
      },
      thumbnailUrl: (slide as any).thumbnailUrl,
      metadata: slide.metadata,
      background: slide.background ? {
        type: 'color' as const,
        value: typeof slide.background === 'string' ? slide.background : slide.background.content || '#ffffff'
      } : { type: 'color' as const, value: '#ffffff' }
    }))
  }, [slides, slideDimensions])

  const config = {
    mode: 'edit' as const,
    showGrid: false,
    snapToGrid: false,
    gridSize: 20,
    enableZoom: true,
    enablePan: true,
    maxZoom: 8,
    minZoom: 0.1,
    backgroundColor: '#ffffff',
    darkMode: false
  }

  const handleSlideUpdate = React.useCallback((slideIndex: number, updatedSlide: any) => {
    console.log('Slide updated:', slideIndex, updatedSlide)
    // In a real implementation, you would sync this back to the parent component
  }, [])

  if (canvasSlides.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        fontSize: '18px',
        color: '#6c757d'
      }}>
        No slides to display
      </div>
    )
  }

  return (
    <EditableFabricCanvas
      slides={canvasSlides}
      currentSlideIndex={currentSlideIndex}
      config={config}
      onSlideSelect={setCurrentSlideIndex}
      onSlideUpdate={handleSlideUpdate}
    />
  )
}

export default FabricWrapper