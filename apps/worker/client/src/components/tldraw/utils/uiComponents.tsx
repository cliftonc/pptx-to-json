import type { TLComponents, TLUiOverrides } from '@tldraw/tldraw'
import { DefaultToolbar, DefaultToolbarContent, TldrawUiMenuItem, useTools, useIsToolSelected } from '@tldraw/tldraw'
import type { PowerPointSlide } from 'ppt-paste-parser'
import { SlideshowToolbar } from '../toolbars/SlideshowToolbar'
import { RichTextToolbar } from '../toolbars/RichTextToolbar'
import { TableToolButton } from '../toolbars/TableToolButton'

// Custom toolbar UI components for TLDraw
export function createUIComponents(
  slides: PowerPointSlide[] | undefined,
  isSlideshowMode: boolean,
  currentSlideIndex: number,
  enterSlideshowMode: () => void,
  exitSlideshowMode: () => void,
  previousSlide: () => void,
  nextSlide: () => void
): TLComponents {
  return {
    Toolbar: () => {
      const tools = useTools()
      
      return (
        <DefaultToolbar>
          <SlideshowToolbar
            isSlideshowMode={isSlideshowMode}
            currentSlideIndex={currentSlideIndex}
            totalSlides={slides?.length || 0}
            onEnterSlideshow={enterSlideshowMode}
            onExitSlideshow={exitSlideshowMode}
            onPreviousSlide={previousSlide}
            onNextSlide={nextSlide}
          />
          <DefaultToolbarContent />
          <TableToolButton />
        </DefaultToolbar>
      )
    },
    RichTextToolbar: RichTextToolbar,
  }
}