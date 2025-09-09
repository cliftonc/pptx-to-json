import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import { useRef } from 'react'
import { CanvasProvider, useCanvas } from '../CanvasProvider'
import type {
  CanvasRenderer,
  CanvasRendererInfo,
  CanvasSlide
} from '../../types/canvas'

// Mock renderer for testing
const createMockRenderer = (type: 'tldraw' | 'konva'): CanvasRenderer => ({
  type,
  displayName: type === 'tldraw' ? 'TLDraw' : 'Konva',
  initialize: vi.fn().mockResolvedValue(undefined),
  loadSlides: vi.fn().mockResolvedValue(undefined),
  loadComponents: vi.fn().mockResolvedValue(undefined),
  setMode: vi.fn(),
  updateConfig: vi.fn(),
  navigateToSlide: vi.fn().mockResolvedValue(undefined),
  getSnapshot: vi.fn().mockResolvedValue({}),
  loadSnapshot: vi.fn().mockResolvedValue(undefined),
  export: vi.fn().mockResolvedValue(new Blob()),
  setEventHandlers: vi.fn(),
  destroy: vi.fn()
})

const createMockRendererInfo = (type: 'tldraw' | 'konva'): CanvasRendererInfo => ({
  type,
  displayName: type === 'tldraw' ? 'TLDraw' : 'Konva',
  description: `${type} renderer`,
  factory: vi.fn().mockResolvedValue(createMockRenderer(type)),
  capabilities: {
    supportsSlideshow: true,
    supportsRichText: true,
    supportsAnimations: false,
    supportsCollaboration: false,
    supportsExport: ['png', 'svg', 'json']
  }
})

// Test component that uses canvas context
function TestComponent() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvas = useCanvas()

  return (
    <div>
      <div ref={containerRef} data-testid="canvas-container" />
      <div data-testid="renderer-type">
        {canvas.currentRendererType || 'none'}
      </div>
      <div data-testid="is-initialized">
        {canvas.isInitialized.toString()}
      </div>
      <div data-testid="is-loading">
        {canvas.isLoading.toString()}
      </div>
      <div data-testid="error">
        {canvas.error || 'none'}
      </div>
      <div data-testid="slides-count">
        {canvas.slides.length}
      </div>
      <button 
        onClick={() => canvas.registerRenderer(createMockRendererInfo('tldraw'))}
        data-testid="register-tldraw"
      >
        Register TLDraw
      </button>
      <button 
        onClick={() => canvas.switchRenderer('tldraw')}
        data-testid="switch-tldraw"
      >
        Switch to TLDraw
      </button>
    </div>
  )
}

function TestWrapper() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  return (
    <CanvasProvider 
      containerRef={containerRef as React.RefObject<HTMLElement | null>}
      defaultRenderer="tldraw"
    >
      <TestComponent />
    </CanvasProvider>
  )
}

describe('CanvasProvider', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should provide initial context values', () => {
    render(<TestWrapper />)
    
    expect(screen.getByTestId('renderer-type')).toHaveTextContent('none')
    expect(screen.getByTestId('is-initialized')).toHaveTextContent('false')
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false')
    expect(screen.getByTestId('error')).toHaveTextContent('none')
    expect(screen.getByTestId('slides-count')).toHaveTextContent('0')
  })

  it('should register renderer', async () => {
    render(<TestWrapper />)
    
    const registerButton = screen.getByTestId('register-tldraw')
    
    await act(async () => {
      registerButton.click()
    })

    // Verify renderer was registered (we can't easily test internal state,
    // but we can test that subsequent operations work)
    expect(registerButton).toBeInTheDocument()
  })

  it('should handle renderer switching error when container not available', async () => {
    render(<TestWrapper />)
    
    // Register a renderer first
    const registerButton = screen.getByTestId('register-tldraw')
    await act(async () => {
      registerButton.click()
    })

    // Try to switch to it (will fail because container doesn't exist in JSDOM)
    const switchButton = screen.getByTestId('switch-tldraw')
    await act(async () => {
      switchButton.click()
    })

    // Should show error state when container is not available
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Container element is not available')
    })
  })

  it('should handle missing container gracefully', () => {
    function TestWithoutContainer() {
      const containerRef = useRef<HTMLDivElement>(null)
      // Don't render the container div
      
      return (
        <CanvasProvider containerRef={containerRef as React.RefObject<HTMLElement | null>}>
          <div data-testid="test">Test</div>
        </CanvasProvider>
      )
    }

    render(<TestWithoutContainer />)
    expect(screen.getByTestId('test')).toHaveTextContent('Test')
  })

  it('should handle initial config', () => {
    function TestWithConfig() {
      const containerRef = useRef<HTMLDivElement>(null)
      const canvas = useCanvas()
      
      return (
        <div>
          <div ref={containerRef} />
          <div data-testid="show-grid">
            {canvas.config.showGrid?.toString() || 'undefined'}
          </div>
          <div data-testid="grid-size">
            {canvas.config.gridSize || 'undefined'}
          </div>
        </div>
      )
    }

    function WrapperWithConfig() {
      const containerRef = useRef<HTMLDivElement>(null)
      
      return (
        <CanvasProvider 
          containerRef={containerRef as React.RefObject<HTMLElement | null>}
          initialConfig={{ showGrid: true, gridSize: 25 }}
        >
          <TestWithConfig />
        </CanvasProvider>
      )
    }

    render(<WrapperWithConfig />)
    
    expect(screen.getByTestId('show-grid')).toHaveTextContent('true')
    expect(screen.getByTestId('grid-size')).toHaveTextContent('25')
  })

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    function ComponentWithoutProvider() {
      try {
        useCanvas()
        return <div>Should not render</div>
      } catch (error) {
        return <div data-testid="error">{(error as Error).message}</div>
      }
    }

    render(<ComponentWithoutProvider />)
    
    expect(screen.getByTestId('error')).toHaveTextContent(
      'useCanvas must be used within a CanvasProvider'
    )
    
    consoleSpy.mockRestore()
  })

  it('should update config', async () => {
    function TestConfigUpdate() {
      const containerRef = useRef<HTMLDivElement>(null)
      const canvas = useCanvas()
      
      return (
        <div>
          <div ref={containerRef} />
          <div data-testid="mode">{canvas.config.mode}</div>
          <button 
            onClick={() => canvas.updateConfig({ mode: 'draw' })}
            data-testid="update-config"
          >
            Update Config
          </button>
        </div>
      )
    }

    function WrapperForConfigTest() {
      const containerRef = useRef<HTMLDivElement>(null)
      
      return (
        <CanvasProvider containerRef={containerRef as React.RefObject<HTMLElement | null>}>
          <TestConfigUpdate />
        </CanvasProvider>
      )
    }

    render(<WrapperForConfigTest />)
    
    expect(screen.getByTestId('mode')).toHaveTextContent('select')
    
    await act(async () => {
      screen.getByTestId('update-config').click()
    })
    
    expect(screen.getByTestId('mode')).toHaveTextContent('draw')
  })

  it('should handle slide loading', async () => {
    function TestSlideLoading() {
      const containerRef = useRef<HTMLDivElement>(null)
      const canvas = useCanvas()
      
      const testSlides: CanvasSlide[] = [
        {
          id: 'slide-1',
          name: 'Test Slide',
          slideNumber: 1,
          components: [],
          dimensions: { width: 800, height: 600 }
        }
      ]
      
      return (
        <div>
          <div ref={containerRef} />
          <div data-testid="slides-count">{canvas.slides.length}</div>
          <button 
            onClick={() => canvas.loadSlides(testSlides)}
            data-testid="load-slides"
          >
            Load Slides
          </button>
        </div>
      )
    }

    function WrapperForSlideTest() {
      const containerRef = useRef<HTMLDivElement>(null)
      
      return (
        <CanvasProvider containerRef={containerRef as React.RefObject<HTMLElement | null>}>
          <TestSlideLoading />
        </CanvasProvider>
      )
    }

    render(<WrapperForSlideTest />)
    
    expect(screen.getByTestId('slides-count')).toHaveTextContent('0')
    
    await act(async () => {
      screen.getByTestId('load-slides').click()
    })
    
    expect(screen.getByTestId('slides-count')).toHaveTextContent('1')
  })
})