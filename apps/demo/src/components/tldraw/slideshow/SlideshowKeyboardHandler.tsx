import { useEffect } from 'react'

interface SlideshowKeyboardHandlerProps {
  isSlideshowMode: boolean
  slideFrameIds: string[]
  previousSlide: () => void
  nextSlide: () => void
  exitSlideshowMode: () => void
  navigateToSlide: (slideIndex: number) => void
}

/**
 * Hook to handle keyboard events during slideshow mode
 */
export function useSlideshowKeyboardHandler({
  isSlideshowMode,
  slideFrameIds,
  previousSlide,
  nextSlide,
  exitSlideshowMode,
  navigateToSlide
}: SlideshowKeyboardHandlerProps) {
  useEffect(() => {
    if (!isSlideshowMode) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle keys when in slideshow mode
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault()
          previousSlide()
          break
        case 'ArrowRight':
        case ' ': // Spacebar
          event.preventDefault()
          nextSlide()
          break
        case 'Escape':
          event.preventDefault()
          exitSlideshowMode()
          break
        case 'Home':
          event.preventDefault()
          navigateToSlide(0)
          break
        case 'End':
          event.preventDefault()
          navigateToSlide(slideFrameIds.length - 1)
          break
        default:
          // Prevent other keys during slideshow to avoid accidental edits
          event.preventDefault()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSlideshowMode, previousSlide, nextSlide, exitSlideshowMode, navigateToSlide, slideFrameIds.length])
}