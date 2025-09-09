import React, { useRef, useEffect, useState } from 'react'
import { CanvasProvider, useCanvas } from '../context/CanvasProvider'
import { CanvasSelector } from './CanvasSelector'
import TldrawCanvas from './canvas/tldraw/TldrawCanvas'
import KonvaCanvas from './canvas/konva/KonvaCanvas'
import type { PowerPointSlide } from 'ppt-paste-parser'

// Available renderer types
type CanvasRendererType = 'tldraw' | 'konva'

interface RendererInfo {
  type: CanvasRendererType
  displayName: string
  description: string
  capabilities: {
    supportsSlideshow: boolean
    supportsRichText: boolean
    supportsAnimations: boolean
    supportsCollaboration: boolean
    supportsExport: string[]
  }
}

const availableRenderers: RendererInfo[] = [
  {
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
  },
  {
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
]

interface UnifiedCanvasAppProps {
  slides?: PowerPointSlide[]
  slideDimensions?: { width: number; height: number }
  masters?: any[]
  layouts?: any[]
  theme?: any
  slideId?: string
  initialSnapshot?: any
}

/**
 * Component that registers available canvas renderers
 */
function CanvasRendererRegistry() {
  // Register available renderers
  React.useEffect(() => {
    // This would be handled by the useSimpleCanvasRenderer hook
  }, [])

  return null
}

/**
 * Main canvas content component
 */
function CanvasContent({ 
  slides = [], 
  slideDimensions,
  slideId,
  initialSnapshot 
}: UnifiedCanvasAppProps) {
  const {
    currentRenderer,
    isInitialized,
    isLoading,
    error,
    loadSlides,
    loadSnapshot
  } = useCanvas()

  // Load slides when they change or renderer is ready
  useEffect(() => {
    if (!currentRenderer || !isInitialized) {
      return
    }

    if (initialSnapshot) {
      // Load from snapshot first
      loadSnapshot(initialSnapshot).catch((err) => {
        console.error('Failed to load snapshot:', err)
        // Fallback to loading slides
        if (slides.length > 0) {
          const canvasSlides = slides.map(powerPointToCanvasSlide)
          loadSlides(canvasSlides, slideDimensions)
        }
      })
    } else if (slides.length > 0) {
      // Convert PowerPoint slides to canvas slides
      const canvasSlides = slides.map(powerPointToCanvasSlide)
      loadSlides(canvasSlides, slideDimensions)
    }
  }, [currentRenderer, isInitialized, slides, slideDimensions, initialSnapshot, loadSlides, loadSnapshot])

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
        <p>Loading canvas...</p>
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

  if (!isInitialized) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#6c757d'
      }}>
        <p>Initializing canvas...</p>
      </div>
    )
  }

  // The actual canvas is rendered directly into the container by the renderer
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
 * Unified canvas app component
 */
function UnifiedCanvasApp(props: UnifiedCanvasAppProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CanvasProvider
        containerRef={containerRef}
        defaultRenderer="tldraw"
        initialConfig={{
          mode: 'select',
          enableZoom: true,
          enablePan: true,
          backgroundColor: '#ffffff'
        }}
      >
        <CanvasRendererRegistry />
        
        {/* Canvas controls - now inside provider */}
        <CanvasControls slideId={props.slideId} />

        {/* Canvas container */}
        <div 
          ref={containerRef}
          style={{ 
            flex: 1, 
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <CanvasContent {...props} />
        </div>
      </CanvasProvider>
    </div>
  )
}

export default UnifiedCanvasApp