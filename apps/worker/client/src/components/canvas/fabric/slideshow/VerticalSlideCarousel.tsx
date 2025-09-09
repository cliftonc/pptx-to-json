import React, { useEffect, useRef } from 'react'
import type { CanvasSlide } from '../../../../types/canvas'

interface VerticalSlideCarouselProps {
  slides: CanvasSlide[]
  currentSlideIndex: number
  onSlideSelect: (slideIndex: number) => void
}

const VerticalSlideCarousel: React.FC<VerticalSlideCarouselProps> = ({
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
        const carouselTop = carouselRect.top
        const carouselBottom = carouselRect.bottom
        const thumbnailTop = thumbnailRect.top
        const thumbnailBottom = thumbnailRect.bottom
        
        // Check if thumbnail is outside viewport
        if (thumbnailTop < carouselTop || thumbnailBottom > carouselBottom) {
          // Calculate scroll position to center the thumbnail
          const thumbnailCenter = activeThumbnail.offsetTop + (activeThumbnail.offsetHeight / 2)
          const carouselCenter = carousel.offsetHeight / 2
          const scrollPosition = thumbnailCenter - carouselCenter
          
          carousel.scrollTo({
            top: Math.max(0, scrollPosition),
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
      className="vertical-slide-carousel"
      style={{
        width: '200px',
        backgroundColor: '#f5f5f5',
        borderLeft: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '15px 10px',
        overflowY: 'auto',
        gap: '12px',
        height: '100%'
      }}
    >
      <div
        style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#495057',
          marginBottom: '5px',
          textAlign: 'center',
          borderBottom: '2px solid #dee2e6',
          paddingBottom: '10px',
          width: '100%'
        }}
      >
        Slides ({slides.length})
      </div>

      {slides.map((slide, index) => (
        <div
          key={`${slide.id}-${slide.thumbnailUrl || 'no-thumb'}`}
          ref={(el) => { if (el) thumbnailRefs.current[index] = el; }}
          className={`slide-thumbnail ${index === currentSlideIndex ? 'active' : ''}`}
          onClick={() => onSlideSelect(index)}
          style={{
            width: '160px',
            height: '120px',
            backgroundColor: 'white',
            border: index === currentSlideIndex ? '3px solid #007acc' : '2px solid #ccc',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: index === currentSlideIndex ? 
              '0 4px 12px rgba(0, 122, 204, 0.3)' : 
              '0 2px 6px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            if (index !== currentSlideIndex) {
              e.currentTarget.style.borderColor = '#999'
              e.currentTarget.style.transform = 'scale(1.02)'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)'
            }
          }}
          onMouseLeave={(e) => {
            if (index !== currentSlideIndex) {
              e.currentTarget.style.borderColor = '#ccc'
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)'
            }
          }}
        >
          {/* Slide number indicator */}
          <div
            style={{
              position: 'absolute',
              top: '6px',
              left: '6px',
              background: index === currentSlideIndex ? '#007acc' : '#9f7aea',
              color: 'white',
              fontSize: '11px',
              padding: '3px 7px',
              borderRadius: '4px',
              fontWeight: 'bold',
              zIndex: 10
            }}
          >
            {slide.slideNumber || index + 1}
          </div>

          {/* Thumbnail image fills entire container */}
          {slide.thumbnailUrl && slide.thumbnailUrl.startsWith('/api/images/') ? (
            <img
              src={slide.thumbnailUrl}
              alt={slide.name || `Slide ${slide.slideNumber || index + 1}`}
              style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#ffffff'
              }}
              onError={(e) => {
                // Hide image on error and show fallback
                e.currentTarget.style.display = 'none'
              }}
              loading="lazy"
            />
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              padding: '16px 8px 8px 8px',
              textAlign: 'center'
            }}>
              {/* Slide content preview (fallback when no thumbnail) */}
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '8px',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: '1.3'
                }}
              >
                {slide.name || `Slide ${slide.slideNumber || index + 1}`}
              </div>

              {/* Component count indicator */}
              <div
                style={{
                  fontSize: '11px',
                  color: '#666',
                  marginTop: 'auto'
                }}
              >
                {slide.components.length} component{slide.components.length !== 1 ? 's' : ''}
              </div>

              {/* Quick preview of slide dimensions */}
              <div
                style={{
                  fontSize: '10px',
                  color: '#999',
                  marginTop: '2px'
                }}
              >
                {Math.round(slide.dimensions.width)} × {Math.round(slide.dimensions.height)}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add slide button (placeholder for future functionality) */}
      {slides.length > 0 && (
        <div
          className="add-slide-button"
          style={{
            width: '160px',
            height: '100px',
            backgroundColor: '#f9f9f9',
            border: '2px dashed #ccc',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#666',
            fontSize: '13px',
            transition: 'all 0.2s ease',
            flexShrink: 0,
            marginTop: '8px'
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
          <div style={{ fontSize: '28px', marginBottom: '6px' }}>+</div>
          <div>Add Slide</div>
        </div>
      )}
    </div>
  )
}

export default VerticalSlideCarousel