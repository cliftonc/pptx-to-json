import { useEffect, useState } from 'react'
import { SimpleCanvasProvider, useSimpleCanvas } from '../context/SimpleCanvasProvider'
import { CanvasSelector } from './CanvasSelector'
import TldrawCanvas from './canvas/tldraw/TldrawCanvas'
import KonvaCanvas from './canvas/konva/KonvaCanvas'
import type { PowerPointSlide } from 'ppt-paste-parser'

interface SimpleUnifiedCanvasAppProps {
  slides?: PowerPointSlide[]
  slideDimensions?: { width: number; height: number }
  masters?: any[]
  layouts?: any[]
  theme?: any
  slideId?: string
  initialSnapshot?: any
}

// Define renderer info as constants to prevent recreation on every render
const TLDRAW_RENDERER_INFO = {
  type: 'tldraw',
  displayName: 'TLDraw Canvas',
  description: 'Full-featured drawing and editing canvas with collaboration support',
  capabilities: {
    supportsSlideshow: true,
    supportsRichText: true,
    supportsAnimations: false,
    supportsCollaboration: true,
    supportsExport: ['png', 'svg', 'json']
  }
}

const KONVA_RENDERER_INFO = {
  type: 'konva',
  displayName: 'Konva Canvas', 
  description: 'Slide-based presentation canvas with carousel navigation',
  capabilities: {
    supportsSlideshow: true,
    supportsRichText: false,
    supportsAnimations: false,
    supportsCollaboration: false,
    supportsExport: ['json']
  }
}

/**
 * Component that registers available canvas renderers
 */
function CanvasRendererRegistry() {
  const { registerRenderer } = useSimpleCanvas()
  
  // Register renderers once on mount
  useEffect(() => {
    registerRenderer(TLDRAW_RENDERER_INFO)
    registerRenderer(KONVA_RENDERER_INFO)
  }, [registerRenderer])

  return null
}

/**
 * Canvas controls component (inside provider)
 */
function CanvasControls({ slideId }: { slideId?: string }) {
  return (
    <div style={{
      padding: '12px 16px',
      borderBottom: '1px solid #dee2e6',
      backgroundColor: '#f8f9fa',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: '56px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#495057' }}>
          PowerPoint Canvas
        </h3>
        {slideId && (
          <span style={{
            fontSize: '12px',
            color: '#6c757d',
            padding: '4px 8px',
            backgroundColor: '#e9ecef',
            borderRadius: '4px',
            fontFamily: 'monospace'
          }}>
            ID: {slideId}
          </span>
        )}
      </div>
      
      <CanvasSelector showDetails={false} />
    </div>
  )
}

/**
 * Main canvas content component with simple conditional rendering
 */
function CanvasContent({ 
  slides = [], 
  slideDimensions,
  masters,
  layouts,
  theme,
  slideId,
  initialSnapshot 
}: SimpleUnifiedCanvasAppProps) {
  const { currentRendererType, isLoading, error } = useSimpleCanvas()
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '20px',
        color: '#dc3545',
        textAlign: 'center'
      }}>
        <h3>Canvas Error</h3>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e9ecef',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p>Switching canvas...</p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )
  }

  // Simple conditional rendering with keys to force remounting
  if (currentRendererType === 'tldraw') {
    return (
      <TldrawCanvas
        key="tldraw"
        components={[]}
        slides={slides}
        slideDimensions={slideDimensions}
        masters={masters}
        layouts={layouts}
        theme={theme}
        slideId={slideId}
        initialSnapshot={initialSnapshot}
      />
    )
  }

  if (currentRendererType === 'konva') {
    return (
      <KonvaCanvas
        key="konva"
        slides={slides.map((slide, index) => ({
          id: slide.slideIndex?.toString() || `slide-${index}`,
          name: slide.metadata?.name || `Slide ${slide.slideNumber || index + 1}`,
          slideNumber: slide.slideNumber || index + 1,
          components: slide.components || [],
          dimensions: {
            width: slide.metadata?.width || slideDimensions?.width || 720,
            height: slide.metadata?.height || slideDimensions?.height || 540
          },
          metadata: slide.metadata
        }))}
        currentSlideIndex={currentSlideIndex}
        config={{
          mode: 'select',
          showGrid: false,
          snapToGrid: false,
          gridSize: 20,
          enableZoom: true,
          enablePan: true,
          maxZoom: 8,
          minZoom: 0.1,
          backgroundColor: '#ffffff',
          darkMode: false
        }}
        onSlideSelect={setCurrentSlideIndex}
      />
    )
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: '#6c757d'
    }}>
      <p>No canvas renderer selected</p>
    </div>
  )
}

/**
 * Simple unified canvas app component
 */
function SimpleUnifiedCanvasApp(props: SimpleUnifiedCanvasAppProps) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SimpleCanvasProvider defaultRenderer="tldraw">
        <CanvasRendererRegistry />
        
        {/* Canvas controls - now inside provider */}
        <CanvasControls slideId={props.slideId} />

        {/* Canvas container */}
        <div style={{ 
          flex: 1, 
          overflow: 'hidden',
          position: 'relative'
        }}>
          <CanvasContent {...props} />
        </div>
      </SimpleCanvasProvider>
    </div>
  )
}

export default SimpleUnifiedCanvasApp