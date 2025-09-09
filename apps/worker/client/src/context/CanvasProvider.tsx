import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

/**
 * Simplified canvas context value interface
 */
interface CanvasContextValue {
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
 * Canvas context
 */
const CanvasContext = createContext<CanvasContextValue | null>(null)

/**
 * Canvas provider props
 */
interface CanvasProviderProps {
  children: ReactNode
  containerRef: React.RefObject<HTMLElement | null>
  initialConfig?: Partial<CanvasConfig>
  eventHandlers?: CanvasEventHandlers
  defaultRenderer?: CanvasRendererType
}

/**
 * Default canvas configuration
 */
const defaultConfig: CanvasConfig = {
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
}

/**
 * Canvas provider component using strategy pattern
 */
export function CanvasProvider({
  children,
  containerRef,
  initialConfig = {},
  eventHandlers = {},
  defaultRenderer = 'tldraw'
}: CanvasProviderProps) {
  // State management
  const [currentRenderer, setCurrentRenderer] = useState<CanvasRenderer | null>(null)
  const [currentRendererType, setCurrentRendererType] = useState<CanvasRendererType | null>(null)
  const [availableRenderers, setAvailableRenderers] = useState<CanvasRendererInfo[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Canvas state
  const [config, setConfig] = useState<CanvasConfig>({ ...defaultConfig, ...initialConfig })
  const [slides, setSlides] = useState<CanvasSlide[]>([])
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  
  // Refs
  const eventHandlersRef = useRef(eventHandlers)
  
  // Update event handlers ref when props change
  useEffect(() => {
    eventHandlersRef.current = eventHandlers
  }, [eventHandlers])

  /**
   * Enhanced event handlers that update context state
   */
  const enhancedEventHandlers: CanvasEventHandlers = {
    onComponentSelect: useCallback((componentId: string | null) => {
      setSelectedComponentId(componentId)
      eventHandlersRef.current.onComponentSelect?.(componentId)
    }, []),
    
    onComponentUpdate: useCallback((componentId: string, updates: Partial<CanvasComponent>) => {
      // Update slides state if needed
      setSlides(prevSlides => 
        prevSlides.map(slide => ({
          ...slide,
          components: slide.components.map(comp => 
            comp.id === componentId ? { ...comp, ...updates } : comp
          )
        }))
      )
      eventHandlersRef.current.onComponentUpdate?.(componentId, updates)
    }, []),
    
    onComponentDelete: useCallback((componentId: string) => {
      setSlides(prevSlides => 
        prevSlides.map(slide => ({
          ...slide,
          components: slide.components.filter(comp => comp.id !== componentId)
        }))
      )
      setSelectedComponentId(null)
      eventHandlersRef.current.onComponentDelete?.(componentId)
    }, []),
    
    onSlideChange: useCallback((slideIndex: number) => {
      setCurrentSlideIndex(slideIndex)
      eventHandlersRef.current.onSlideChange?.(slideIndex)
    }, []),
    
    onModeChange: useCallback((mode: CanvasMode) => {
      setConfig(prev => ({ ...prev, mode }))
      eventHandlersRef.current.onModeChange?.(mode)
    }, []),
    
    onSave: eventHandlersRef.current.onSave,
    onExport: eventHandlersRef.current.onExport
  }

  /**
   * Register a new canvas renderer
   */
  const registerRenderer = useCallback((rendererInfo: CanvasRendererInfo) => {
    setAvailableRenderers(prev => {
      const filtered = prev.filter(r => r.type !== rendererInfo.type)
      return [...filtered, rendererInfo]
    })
  }, [])

  /**
   * Unregister a canvas renderer
   */
  const unregisterRenderer = useCallback((type: CanvasRendererType) => {
    setAvailableRenderers(prev => prev.filter(r => r.type !== type))
    
    // If current renderer is being unregistered, clean up
    if (currentRendererType === type) {
      currentRenderer?.destroy()
      setCurrentRenderer(null)
      setCurrentRendererType(null)
      setIsInitialized(false)
    }
  }, [currentRenderer, currentRendererType])

  /**
   * Switch to a different canvas renderer
   */
  const switchRenderer = useCallback(async (type: CanvasRendererType) => {
    if (currentRendererType === type) {
      return // Already using this renderer
    }

    setIsLoading(true)
    setError(null)

    try {
      // Find the renderer info
      const rendererInfo = availableRenderers.find(r => r.type === type)
      if (!rendererInfo) {
        throw new Error(`Renderer type '${type}' not found`)
      }

      if (!containerRef.current) {
        throw new Error('Container element is not available')
      }

      // Get current state if switching from another renderer
      let currentSnapshot = null
      if (currentRenderer) {
        try {
          currentSnapshot = await currentRenderer.getSnapshot()
        } catch (e) {
          console.warn('Could not get snapshot from current renderer:', e)
        }
        
        // Clean up current renderer
        currentRenderer.destroy()
      }

      // Create new renderer
      const newRenderer = await rendererInfo.factory(
        containerRef.current,
        config,
        enhancedEventHandlers
      )

      // Initialize with current data
      if (slides.length > 0) {
        await newRenderer.loadSlides(slides)
      }

      // Load snapshot if available and compatible
      if (currentSnapshot) {
        try {
          await newRenderer.loadSnapshot(currentSnapshot)
        } catch (e) {
          console.warn('Could not load snapshot in new renderer:', e)
          // Fallback to loading slides normally
          if (slides.length > 0) {
            await newRenderer.loadSlides(slides)
          }
        }
      }

      // Update state
      setCurrentRenderer(newRenderer)
      setCurrentRendererType(type)
      setIsInitialized(true)

      // Store renderer preference
      localStorage.setItem('canvas-renderer-preference', type)

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(message)
      console.error('Failed to switch renderer:', err)
    } finally {
      setIsLoading(false)
    }
  }, [currentRenderer, currentRendererType, availableRenderers, containerRef, config, slides, enhancedEventHandlers])

  /**
   * Load slides into current renderer
   */
  const loadSlides = useCallback(async (newSlides: CanvasSlide[], dimensions?: CanvasDimensions) => {
    setSlides(newSlides)
    
    if (currentRenderer) {
      try {
        await currentRenderer.loadSlides(newSlides, dimensions)
      } catch (err) {
        console.error('Failed to load slides:', err)
        setError(err instanceof Error ? err.message : 'Failed to load slides')
      }
    }
  }, [currentRenderer])

  /**
   * Load individual components (legacy support)
   */
  const loadComponents = useCallback(async (components: CanvasComponent[], dimensions?: CanvasDimensions) => {
    // Convert components to a single slide
    const slide: CanvasSlide = {
      id: 'legacy-slide',
      name: 'Components',
      slideNumber: 1,
      components,
      dimensions: dimensions || { width: 720, height: 540 }
    }
    
    await loadSlides([slide], dimensions)
  }, [loadSlides])

  /**
   * Update canvas configuration
   */
  const updateConfig = useCallback((newConfig: Partial<CanvasConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig }
      currentRenderer?.updateConfig(updated)
      return updated
    })
  }, [currentRenderer])

  /**
   * Set canvas mode
   */
  const setMode = useCallback((mode: CanvasMode) => {
    updateConfig({ mode })
  }, [updateConfig])

  /**
   * Navigate to specific slide
   */
  const navigateToSlide = useCallback(async (slideIndex: number) => {
    if (slideIndex >= 0 && slideIndex < slides.length) {
      setCurrentSlideIndex(slideIndex)
      
      if (currentRenderer) {
        try {
          await currentRenderer.navigateToSlide(slideIndex)
        } catch (err) {
          console.error('Failed to navigate to slide:', err)
        }
      }
    }
  }, [currentRenderer, slides.length])

  /**
   * Select a component
   */
  const selectComponent = useCallback((componentId: string | null) => {
    setSelectedComponentId(componentId)
  }, [])

  /**
   * Export canvas content
   */
  const exportCanvas = useCallback(async (format: 'png' | 'svg' | 'json'): Promise<Blob | string | null> => {
    if (!currentRenderer) {
      setError('No renderer available for export')
      return null
    }

    try {
      return await currentRenderer.export(format)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed'
      setError(message)
      console.error('Export failed:', err)
      return null
    }
  }, [currentRenderer])

  /**
   * Get current canvas snapshot
   */
  const getSnapshot = useCallback(async (): Promise<any> => {
    if (!currentRenderer) {
      throw new Error('No renderer available')
    }
    return await currentRenderer.getSnapshot()
  }, [currentRenderer])

  /**
   * Load canvas snapshot
   */
  const loadSnapshot = useCallback(async (snapshot: any): Promise<void> => {
    if (!currentRenderer) {
      throw new Error('No renderer available')
    }
    await currentRenderer.loadSnapshot(snapshot)
  }, [currentRenderer])

  // Initialize default renderer when container becomes available
  useEffect(() => {
    if (!containerRef.current || availableRenderers.length === 0 || currentRenderer) {
      return
    }

    // Try to use saved preference or default
    const savedPreference = localStorage.getItem('canvas-renderer-preference') as CanvasRendererType
    const preferredType = (savedPreference && availableRenderers.some(r => r.type === savedPreference))
      ? savedPreference
      : defaultRenderer

    // Only switch if the preferred renderer is available
    if (availableRenderers.some(r => r.type === preferredType)) {
      switchRenderer(preferredType)
    }
  }, [containerRef.current, availableRenderers, currentRenderer, defaultRenderer, switchRenderer])

  // Context value
  const contextValue: CanvasContextValue = {
    // Current renderer state
    currentRenderer,
    currentRendererType,
    isInitialized,
    isLoading,
    error,

    // Available renderers
    availableRenderers,
    
    // Canvas state
    config,
    slides,
    selectedComponentId,
    currentSlideIndex,

    // Actions
    switchRenderer,
    registerRenderer,
    unregisterRenderer,
    
    // Canvas operations
    loadSlides,
    loadComponents,
    updateConfig,
    setMode,
    navigateToSlide,
    selectComponent,
    
    // Export/Import
    exportCanvas,
    getSnapshot,
    loadSnapshot
  }

  return (
    <CanvasContext.Provider value={contextValue}>
      {children}
    </CanvasContext.Provider>
  )
}

/**
 * Hook to use canvas context
 */
export function useCanvas(): CanvasContextValue {
  const context = useContext(CanvasContext)
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider')
  }
  return context
}

/**
 * Hook to use canvas renderer registration
 */
export function useCanvasRenderer(rendererInfo: CanvasRendererInfo) {
  const { registerRenderer, unregisterRenderer } = useCanvas()
  
  useEffect(() => {
    registerRenderer(rendererInfo)
    
    return () => {
      unregisterRenderer(rendererInfo.type)
    }
  }, [registerRenderer, unregisterRenderer, rendererInfo])
}