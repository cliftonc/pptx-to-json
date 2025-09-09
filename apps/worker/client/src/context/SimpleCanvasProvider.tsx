import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

/**
 * Simple canvas context value interface
 */
interface SimpleCanvasContextValue {
  // Current renderer state
  currentRendererType: string | null
  isLoading: boolean
  error: string | null

  // Available renderers
  availableRenderers: Array<{
    type: string
    displayName: string
    description: string
    capabilities: {
      supportsSlideshow: boolean
      supportsRichText: boolean
      supportsAnimations: boolean
      supportsCollaboration: boolean
      supportsExport: string[]
    }
  }>
  
  // Actions
  switchRenderer: (type: string) => Promise<void>
  registerRenderer: (renderer: any) => void
  unregisterRenderer: (type: string) => void
}

/**
 * Simple canvas context
 */
const SimpleCanvasContext = createContext<SimpleCanvasContextValue | null>(null)

/**
 * Simple canvas provider props
 */
interface SimpleCanvasProviderProps {
  children: ReactNode
  defaultRenderer?: string
}

/**
 * Very simple canvas provider that just manages renderer selection
 */
export function SimpleCanvasProvider({
  children,
  defaultRenderer = 'tldraw'
}: SimpleCanvasProviderProps) {
  // State management
  const [currentRendererType, setCurrentRendererType] = useState<string | null>(defaultRenderer)
  const [availableRenderers, setAvailableRenderers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Register a new canvas renderer
   */
  const registerRenderer = useCallback((renderer: any) => {
    setAvailableRenderers(prev => {
      const filtered = prev.filter(r => r.type !== renderer.type)
      return [...filtered, renderer]
    })
  }, [])

  /**
   * Unregister a canvas renderer
   */
  const unregisterRenderer = useCallback((type: string) => {
    setAvailableRenderers(prev => prev.filter(r => r.type !== type))
    
    // If current renderer is being unregistered, switch to first available
    if (currentRendererType === type) {
      const remaining = availableRenderers.filter(r => r.type !== type)
      setCurrentRendererType(remaining.length > 0 ? remaining[0].type : null)
    }
  }, [currentRendererType, availableRenderers])

  /**
   * Switch to a different canvas renderer
   */
  const switchRenderer = useCallback(async (type: string) => {
    if (currentRendererType === type) {
      return // Already using this renderer
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simple switch with a small delay to show loading
      await new Promise(resolve => setTimeout(resolve, 100))
      
      setCurrentRendererType(type)
      
      // Store preference
      localStorage.setItem('canvas-renderer-preference', type)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(message)
      console.error('Failed to switch renderer:', err)
    } finally {
      setIsLoading(false)
    }
  }, [currentRendererType])

  // Context value
  const contextValue: SimpleCanvasContextValue = {
    // Current renderer state
    currentRendererType,
    isLoading,
    error,

    // Available renderers
    availableRenderers,

    // Actions
    switchRenderer,
    registerRenderer,
    unregisterRenderer
  }

  return (
    <SimpleCanvasContext.Provider value={contextValue}>
      {children}
    </SimpleCanvasContext.Provider>
  )
}

/**
 * Hook to use simple canvas context
 */
export function useSimpleCanvas(): SimpleCanvasContextValue {
  const context = useContext(SimpleCanvasContext)
  if (!context) {
    throw new Error('useSimpleCanvas must be used within a SimpleCanvasProvider')
  }
  return context
}

/**
 * Hook to register a canvas renderer
 */
export function useSimpleCanvasRenderer(rendererInfo: any) {
  const { registerRenderer, unregisterRenderer } = useSimpleCanvas()
  
  React.useEffect(() => {
    registerRenderer(rendererInfo)
    
    return () => {
      unregisterRenderer(rendererInfo.type)
    }
  }, [registerRenderer, unregisterRenderer]) // Remove rendererInfo from deps to prevent infinite loop
}