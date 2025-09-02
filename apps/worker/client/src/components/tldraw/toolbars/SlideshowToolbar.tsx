
interface SlideshowToolbarProps {
  isSlideshowMode: boolean
  currentSlideIndex: number
  totalSlides: number
  onEnterSlideshow: () => void
  onExitSlideshow: () => void
  onPreviousSlide: () => void
  onNextSlide: () => void
}

export function SlideshowToolbar({ 
  isSlideshowMode, 
  currentSlideIndex, 
  totalSlides, 
  onEnterSlideshow, 
  onExitSlideshow, 
  onPreviousSlide, 
  onNextSlide 
}: SlideshowToolbarProps) {
  if (isSlideshowMode) {
    return (
      <>
        <button 
          className="slideshow-button" 
          onClick={onPreviousSlide}
          disabled={currentSlideIndex === 0}
          title="Previous slide (←)"
        >
          ◀
        </button>
        <div className="slideshow-info">
          {currentSlideIndex + 1}/{totalSlides}
        </div>
        <button 
          className="slideshow-button" 
          onClick={onNextSlide}
          disabled={currentSlideIndex === totalSlides - 1}
          title="Next slide (→)"
        >
          ▶
        </button>
        <button 
          className="slideshow-button" 
          onClick={onExitSlideshow}
          title="Exit slideshow (Esc)"
        >
          ✕
        </button>
      </>
    )
  }

  if (totalSlides > 0) {
    return (
      <button 
        className="slideshow-button" 
        onClick={onEnterSlideshow}
        title="Start slideshow"
      >
        ▶
      </button>
    )
  }

  // No slides available - return null to hide toolbar
  return null
}