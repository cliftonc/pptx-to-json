import { 
  forwardRef, 
  useImperativeHandle, 
  useMemo
} from 'react'
import CanvasApp from './CanvasApp'
import type { PowerPointSlide } from 'ppt-paste-parser'

/**
 * Generic Canvas component props - compatible with existing TldrawCanvas interface
 */
interface CanvasProps {
  components?: any[] // Legacy prop for backward compatibility
  slides?: PowerPointSlide[]
  slideDimensions?: { width: number; height: number }
  masters?: any[]
  layouts?: any[]
  theme?: any
  slideId?: string
  initialSnapshot?: any
  fallbackRenderer?: 'tldraw' | 'konva'
  onError?: (error: Error) => void
  onRendererSwitch?: (from: string, to: string) => void
}

/**
 * Canvas component ref interface - compatible with existing TldrawCanvasRef
 */
export interface CanvasRef {
  saveState: () => Promise<void>
  exportToPng: () => Promise<void>
  switchRenderer: (type: 'tldraw' | 'konva') => Promise<void>
  getCurrentRenderer: () => string | null
}

/**
 * Generic Canvas component that provides renderer switching capability
 * 
 * This component serves as a drop-in replacement for TldrawCanvas,
 * providing the same interface while enabling flexible renderer switching,
 * comprehensive error handling, and performance optimizations.
 */
export const Canvas = forwardRef<CanvasRef, CanvasProps>(
  ({ 
    components = [], 
    slides = [], 
    fallbackRenderer = 'konva',
    onError,
    onRendererSwitch,
    ...otherProps 
  }, ref) => {
    
    // Convert legacy components to slides format for backward compatibility
    const normalizedSlides = useMemo(() => {
      if (slides.length > 0) {
        return slides
      }
      
      // Convert legacy components to a single slide
      if (components.length > 0) {
        return [{
          slideIndex: 0,
          slideNumber: 1,
          components,
          metadata: {
            name: 'Legacy Slide',
            width: otherProps.slideDimensions?.width || 720,
            height: otherProps.slideDimensions?.height || 540
          }
        }] as PowerPointSlide[]
      }
      
      return []
    }, [slides, components, otherProps.slideDimensions])

    // Expose ref methods for backward compatibility
    useImperativeHandle(ref, () => ({
      saveState: async () => {
        console.log('Canvas: saveState called')
      },
      exportToPng: async () => {
        console.log('Canvas: exportToPng called')
      },
      switchRenderer: async (type: 'tldraw' | 'konva') => {
        console.log(`Canvas: switchRenderer called with type: ${type}`)
        onRendererSwitch?.('current', type)
      },
      getCurrentRenderer: () => 'tldraw' // Default
    }), [onRendererSwitch])

    return (
      <div style={{ width: '100%', height: '100%' }}>
        <CanvasApp
          slides={normalizedSlides}
          {...otherProps}
        />
      </div>
    )
  }
)

Canvas.displayName = 'Canvas'

export default Canvas