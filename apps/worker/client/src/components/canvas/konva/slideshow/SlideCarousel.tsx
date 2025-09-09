import React, { useEffect, useRef } from 'react'
import type { CanvasSlide } from '../../../../types/canvas'

interface SlideCarouselProps {
  slides: CanvasSlide[]
  currentSlideIndex: number
  onSlideSelect: (slideIndex: number) => void
}

const SlideCarousel: React.FC<SlideCarouselProps> = ({
  slides,
  currentSlideIndex,
  onSlideSelect
}) => {
  const carouselRef = useRef<HTMLDivElement>(null)
  const thumbnailRefs = useRef<(HTMLDivElement | null)[]>([])

  // Scroll active slide into view when currentSlideIndex changes
  useEffect(() => {
    if (carouselRef.current && thumbnailRefs.current[currentSlideIndex]) {
      const carousel = carouselRef.current
      const activeThumbnail = thumbnailRefs.current[currentSlideIndex]
      
      if (activeThumbnail) {
        const carouselRect = carousel.getBoundingClientRect()
        const thumbnailRect = activeThumbnail.getBoundingClientRect()
        
        // Calculate if thumbnail is outside visible area
        const carouselLeft = carouselRect.left
        const carouselRight = carouselRect.right
        const thumbnailLeft = thumbnailRect.left
        const thumbnailRight = thumbnailRect.right
        
        // Check if thumbnail is outside viewport
        if (thumbnailLeft < carouselLeft || thumbnailRight > carouselRight) {
          // Calculate scroll position to center the thumbnail
          const thumbnailCenter = activeThumbnail.offsetLeft + (activeThumbnail.offsetWidth / 2)
          const carouselCenter = carousel.offsetWidth / 2
          const scrollPosition = thumbnailCenter - carouselCenter
          
          carousel.scrollTo({
            left: Math.max(0, scrollPosition),
            behavior: 'smooth'
          })
        }
      }
    }
  }, [currentSlideIndex])

  if (slides.length === 0) {
    return null
  }

  return (
    <div 
      ref={carouselRef}
      className="slide-carousel"
      style={{
        height: '120px',
        backgroundColor: '#f5f5f5',
        borderTop: '1px solid #ddd',
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        overflowX: 'auto',
        gap: '10px'
      }}
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          ref={(el) => { if (el) thumbnailRefs.current[index] = el; }}
          className={`slide-thumbnail ${index === currentSlideIndex ? 'active' : ''}`}
          onClick={() => onSlideSelect(index)}
          style={{
            minWidth: '140px',
            height: '100px',
            backgroundColor: 'white',
            border: index === currentSlideIndex ? '3px solid #007acc' : '2px solid #ccc',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '8px',
            transition: 'all 0.2s ease',
            boxShadow: index === currentSlideIndex ? 
              '0 4px 8px rgba(0, 122, 204, 0.3)' : 
              '0 2px 4px rgba(0, 0, 0, 0.1)',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            if (index !== currentSlideIndex) {
              e.currentTarget.style.borderColor = '#999'
              e.currentTarget.style.transform = 'scale(1.02)'
            }
          }}
          onMouseLeave={(e) => {
            if (index !== currentSlideIndex) {
              e.currentTarget.style.borderColor = '#ccc'
              e.currentTarget.style.transform = 'scale(1)'
            }
          }}
        >
          {/* Slide number indicator */}
          <div
            style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              background: index === currentSlideIndex ? '#007acc' : '#666',
              color: 'white',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '3px',
              fontWeight: 'bold'
            }}
          >
            {slide.slideNumber || index + 1}
          </div>

          {/* Slide content preview */}
          <div
            style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#333',
              textAlign: 'center',
              marginTop: '16px',
              marginBottom: '8px',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {slide.name || `Slide ${slide.slideNumber || index + 1}`}
          </div>

          {/* Component count indicator */}
          <div
            style={{
              fontSize: '10px',
              color: '#666',
              marginTop: 'auto'
            }}
          >
            {slide.components.length} component{slide.components.length !== 1 ? 's' : ''}
          </div>

          {/* Quick preview of slide dimensions */}
          <div
            style={{
              fontSize: '9px',
              color: '#999',
              marginTop: '2px'
            }}
          >
            {Math.round(slide.dimensions.width)} × {Math.round(slide.dimensions.height)}
          </div>
        </div>
      ))}

      {/* Add slide button (placeholder for future functionality) */}
      {slides.length > 0 && (
        <div
          className="add-slide-button"
          style={{
            minWidth: '100px',
            height: '100px',
            backgroundColor: '#f9f9f9',
            border: '2px dashed #ccc',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#666',
            fontSize: '12px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#999'
            e.currentTarget.style.backgroundColor = '#f0f0f0'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#ccc'
            e.currentTarget.style.backgroundColor = '#f9f9f9'
          }}
          onClick={() => {
            // TODO: Implement add slide functionality
            console.log('Add slide functionality not yet implemented')
          }}
        >
          <div style={{ fontSize: '24px', marginBottom: '4px' }}>+</div>
          <div>Add Slide</div>
        </div>
      )}
    </div>
  )
}

export default SlideCarousel