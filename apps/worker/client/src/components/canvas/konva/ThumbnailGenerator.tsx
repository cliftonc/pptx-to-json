import { useRef, useCallback, forwardRef, useImperativeHandle, useState } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import type { CanvasSlide } from '../../../types/canvas'
import { renderTextComponent } from './renderers/TextRenderer'
import { renderShapeComponent } from './renderers/ShapeRenderer'
import { renderImageComponent } from './renderers/ImageRenderer'
import { renderTableComponent } from './renderers/TableRenderer'
import { isValidThumbnailUrl } from '../../../utils/thumbnailValidation'

interface ThumbnailGeneratorProps {
  onThumbnailGenerated?: (slideIndex: number, thumbnailUrl: string) => void
  onProgress?: (current: number, total: number) => void
  onError?: (slideIndex: number, error: string) => void
}

export interface ThumbnailGeneratorRef {
  generateThumbnails: (
    slides: CanvasSlide[], 
    slideId: string,
    onSlideUpdate: (slideIndex: number, updates: Partial<CanvasSlide>) => void
  ) => Promise<void>
  isGenerating: () => boolean
}

/**
 * Component for generating slide thumbnails using off-screen Konva rendering
 * Renders at 840x600px (3x quality) and uploads to R2
 */
export const ThumbnailGenerator = forwardRef<ThumbnailGeneratorRef, ThumbnailGeneratorProps>(({
  onThumbnailGenerated,
  onProgress,
  onError
}, ref) => {
  const stageRef = useRef<any>(null)
  const generatingRef = useRef(false)
  const currentSlideRef = useRef<CanvasSlide | null>(null)
  const [renderKey, setRenderKey] = useState(0)

  // Thumbnail scaling factor (3x quality)
  const THUMBNAIL_SCALE = 3

  /**
   * Render a component based on its type
   */
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

  /**
   * Generate thumbnail for a single slide
   */
  const generateSlideThumbnail = useCallback(async (
    slide: CanvasSlide, 
    slideIndex: number,
    slideId: string
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!stageRef.current) {
        resolve(null)
        return
      }

      // Update current slide for rendering
      currentSlideRef.current = slide

      // Trigger a targeted re-render for just the stage content
      setRenderKey(prev => prev + 1)

      // Wait for re-render, then capture
      setTimeout(async () => {
        try {
          const stage = stageRef.current
          if (!stage) {
            resolve(null)
            return
          }

          // Generate PNG data URL at high quality
          const dataUrl = stage.toDataURL({
            mimeType: 'image/png',
            quality: 0.95,
            pixelRatio: 1 // Already at 3x size, no additional scaling needed
          })

          // Validate we have a proper data URL (and not storing it!)
          if (!dataUrl || !dataUrl.startsWith('data:image/png;base64,')) {
            throw new Error('Failed to generate valid image data')
          }

          // Upload to R2 via worker endpoint
          const uploadResponse = await fetch('/api/upload-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageData: dataUrl,
              slideId: slideId,
              slideNumber: slide.slideNumber
            })
          })

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json()
            throw new Error(errorData.message || 'Upload failed')
          }

          const result = await uploadResponse.json()
          
          // Validate we got back a proper URL (not a data URL!)
          if (!result.imageUrl || !isValidThumbnailUrl(result.imageUrl)) {
            throw new Error(`Invalid thumbnail URL returned from server: ${result.imageUrl}`)
          }

          resolve(result.imageUrl)
          
        } catch (error) {
          onError?.(slideIndex, error instanceof Error ? error.message : 'Unknown error')
          resolve(null)
        } finally {
          // Clear current slide after generation to avoid interfering with main canvas
          currentSlideRef.current = null
        }
      }, 100) // Small delay to ensure rendering is complete
    })
  }, [onError])

  /**
   * Generate thumbnails for multiple slides
   */
  const generateThumbnails = useCallback(async (
    slides: CanvasSlide[], 
    slideId: string,
    onSlideUpdate: (slideIndex: number, updates: Partial<CanvasSlide>) => void
  ) => {
    if (generatingRef.current) {
      return
    }

    generatingRef.current = true
    
    try {
      for (let i = 0; i < slides.length; i++) {
        onProgress?.(i + 1, slides.length)
        
        const slide = slides[i]
        
        // Skip if slide already has a thumbnail
        if (slide.thumbnailUrl) {
          continue
        }

        const thumbnailUrl = await generateSlideThumbnail(slide, i, slideId)
        
        if (thumbnailUrl) {
          // Update slide with thumbnail URL
          onSlideUpdate(i, { thumbnailUrl })
          onThumbnailGenerated?.(i, thumbnailUrl)
        }

        // Small delay between slides to avoid overwhelming the browser
        if (i < slides.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }
    } finally {
      generatingRef.current = false
      onProgress?.(slides.length, slides.length) // Complete
      
      // Clear the current slide to avoid interfering with main canvas
      currentSlideRef.current = null
      setRenderKey(prev => prev + 1)
    }
  }, [generateSlideThumbnail, onThumbnailGenerated, onProgress])

  // Expose API through ref
  useImperativeHandle(ref, () => ({
    generateThumbnails,
    isGenerating: () => generatingRef.current
  }), [generateThumbnails])

  const currentSlide = currentSlideRef.current

  // Calculate thumbnail dimensions based on actual slide size
  const getThumbnailDimensions = () => {
    if (!currentSlide) return { width: 720 * THUMBNAIL_SCALE, height: 540 * THUMBNAIL_SCALE }
    
    return {
      width: currentSlide.dimensions.width * THUMBNAIL_SCALE,
      height: currentSlide.dimensions.height * THUMBNAIL_SCALE
    }
  }

  const thumbnailDims = getThumbnailDimensions()

  return (
    <div style={{ 
      position: 'absolute', 
      left: '-9999px', 
      top: '-9999px',
      visibility: 'hidden',
      pointerEvents: 'none'
    }}>
      <Stage
        key={renderKey}
        ref={stageRef}
        width={thumbnailDims.width}
        height={thumbnailDims.height}
      >
        <Layer>
          {/* Background */}
          {currentSlide && (
            <Rect
              width={currentSlide.dimensions.width * THUMBNAIL_SCALE}
              height={currentSlide.dimensions.height * THUMBNAIL_SCALE}
              fill={currentSlide.background?.type === 'color' ? 
                currentSlide.background.value as string : '#ffffff'}
            />
          )}
          
          {/* Render slide components at 3x scale */}
          {currentSlide?.components
            .slice()
            .sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
            .map((component, index) => {
              // Scale up component dimensions and position
              const scaledComponent = {
                ...component,
                x: component.x * THUMBNAIL_SCALE,
                y: component.y * THUMBNAIL_SCALE,
                width: component.width * THUMBNAIL_SCALE,
                height: component.height * THUMBNAIL_SCALE,
                style: component.style ? {
                  ...component.style,
                  fontSize: component.style.fontSize ? component.style.fontSize * THUMBNAIL_SCALE : undefined
                } : undefined
              }
              return renderComponent(scaledComponent, index)
            })}
        </Layer>
      </Stage>
    </div>
  )
})

ThumbnailGenerator.displayName = 'ThumbnailGenerator'

export default ThumbnailGenerator