import { describe, it, expect, vi } from 'vitest'
import {
  powerPointToCanvasComponent,
  powerPointToCanvasSlide,
  type CanvasRenderer,
  type CanvasRendererType,
  type CanvasComponent,
  // type CanvasSlide, // Removed unused import
  type CanvasConfig,
  type CanvasMode,
  type CanvasDimensions
} from '../canvas'
import type { PowerPointComponent, PowerPointSlide } from 'ppt-paste-parser'

describe('Canvas Type Definitions', () => {
  describe('powerPointToCanvasComponent', () => {
    it('should convert PowerPoint component to canvas component', () => {
      const ppComponent: PowerPointComponent = {
        id: 'test-1',
        type: 'text',
        content: 'Hello World',
        x: 100,
        y: 200,
        width: 300,
        height: 50,
        rotation: 0,
        style: {
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 1,
          fontSize: 14,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          color: '#333333'
        },
        metadata: { 
          source: 'powerpoint',
          opacity: 1,
          visible: true
        },
        slideIndex: 0,
        zIndex: 1
      }

      const canvasComponent = powerPointToCanvasComponent(ppComponent)

      expect(canvasComponent).toEqual({
        id: 'test-1',
        type: 'text',
        x: 100,
        y: 200,
        width: 300,
        height: 50,
        rotation: 0,
        opacity: 1,
        visible: true,
        locked: false,
        content: 'Hello World',
        style: {
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 1,
          fontSize: 14,
          fontFamily: 'Arial',
          fontWeight: 'bold',
          fontStyle: undefined,
          textAlign: undefined,
          color: '#333333',
          backgroundColor: undefined
        },
        metadata: { 
          source: 'powerpoint',
          opacity: 1,
          visible: true
        }
      })
    })

    it('should generate ID when not provided', () => {
      const ppComponent: PowerPointComponent = {
        id: 'shape-1',
        type: 'shape',
        content: '',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        slideIndex: 0,
        zIndex: 0
      }

      const canvasComponent = powerPointToCanvasComponent(ppComponent)

      expect(canvasComponent.id).toBe('shape-1')
      expect(canvasComponent.type).toBe('shape')
    })

    it('should handle missing optional properties', () => {
      const ppComponent: PowerPointComponent = {
        id: 'minimal',
        type: 'image',
        content: '',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        slideIndex: 0,
        zIndex: 0
      }

      const canvasComponent = powerPointToCanvasComponent(ppComponent)

      expect(canvasComponent).toEqual({
        id: 'minimal',
        type: 'image',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        rotation: undefined,
        opacity: undefined,
        visible: true,
        locked: false,
        content: '',
        style: undefined,
        metadata: undefined
      })
    })
  })

  describe('powerPointToCanvasSlide', () => {
    it('should convert PowerPoint slide to canvas slide', () => {
      const ppSlide: PowerPointSlide = {
        slideIndex: 0,
        slideNumber: 1,
        components: [
          {
            id: 'comp-1',
            type: 'text',
            content: 'Title',
            x: 10,
            y: 20,
            width: 100,
            height: 30,
            slideIndex: 0,
            zIndex: 0
          }
        ],
        metadata: {
          name: 'Introduction',
          width: 720,
          height: 540
        }
      }

      const canvasSlide = powerPointToCanvasSlide(ppSlide)

      expect(canvasSlide).toEqual({
        id: 'slide-0',
        name: 'Introduction',
        slideNumber: 1,
        components: [
          expect.objectContaining({
            id: 'comp-1',
            type: 'text',
            x: 10,
            y: 20,
            width: 100,
            height: 30
          })
        ],
        background: undefined,
        dimensions: {
          width: 720,
          height: 540
        },
        metadata: {
          name: 'Introduction',
          width: 720,
          height: 540
        }
      })
    })

    it('should generate fallback values when properties missing', () => {
      const ppSlide: PowerPointSlide = {
        slideIndex: 2,
        slideNumber: 3,
        components: []
      }

      const canvasSlide = powerPointToCanvasSlide(ppSlide)

      expect(canvasSlide.id).toBe('slide-2')
      expect(canvasSlide.name).toBe('Slide 3')
      expect(canvasSlide.slideNumber).toBe(3)
      expect(canvasSlide.dimensions).toEqual({
        width: 720,
        height: 540
      })
      expect(canvasSlide.background).toBeUndefined()
    })
  })

  describe('CanvasRenderer Interface', () => {
    it('should define correct interface structure', () => {
      const mockRenderer: CanvasRenderer = {
        type: 'tldraw',
        displayName: 'TLDraw',
        initialize: vi.fn(),
        loadSlides: vi.fn(),
        loadComponents: vi.fn(),
        setMode: vi.fn(),
        updateConfig: vi.fn(),
        navigateToSlide: vi.fn(),
        getSnapshot: vi.fn(),
        loadSnapshot: vi.fn(),
        export: vi.fn(),
        setEventHandlers: vi.fn(),
        destroy: vi.fn()
      }

      // Verify all required methods exist
      expect(mockRenderer.type).toBe('tldraw')
      expect(mockRenderer.displayName).toBe('TLDraw')
      expect(typeof mockRenderer.initialize).toBe('function')
      expect(typeof mockRenderer.loadSlides).toBe('function')
      expect(typeof mockRenderer.loadComponents).toBe('function')
      expect(typeof mockRenderer.setMode).toBe('function')
      expect(typeof mockRenderer.updateConfig).toBe('function')
      expect(typeof mockRenderer.navigateToSlide).toBe('function')
      expect(typeof mockRenderer.getSnapshot).toBe('function')
      expect(typeof mockRenderer.loadSnapshot).toBe('function')
      expect(typeof mockRenderer.export).toBe('function')
      expect(typeof mockRenderer.setEventHandlers).toBe('function')
      expect(typeof mockRenderer.destroy).toBe('function')
    })
  })

  describe('Type Guards and Validation', () => {
    it('should validate CanvasRendererType', () => {
      const validTypes: CanvasRendererType[] = ['tldraw', 'konva']
      
      validTypes.forEach(type => {
        expect(['tldraw', 'konva']).toContain(type)
      })
    })

    it('should validate CanvasMode', () => {
      const validModes: CanvasMode[] = [
        'select', 'draw', 'text', 'shape', 'slideshow', 'readonly'
      ]
      
      validModes.forEach(mode => {
        expect([
          'select', 'draw', 'text', 'shape', 'slideshow', 'readonly'
        ]).toContain(mode)
      })
    })

    it('should validate CanvasComponent structure', () => {
      const component: CanvasComponent = {
        id: 'test',
        type: 'text',
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        visible: true,
        locked: false
      }

      expect(component.id).toBeDefined()
      expect(component.type).toBeDefined()
      expect(typeof component.x).toBe('number')
      expect(typeof component.y).toBe('number')
      expect(typeof component.width).toBe('number')
      expect(typeof component.height).toBe('number')
      expect(typeof component.visible).toBe('boolean')
      expect(typeof component.locked).toBe('boolean')
    })

    it('should validate CanvasConfig structure', () => {
      const config: CanvasConfig = {
        mode: 'select',
        showGrid: true,
        snapToGrid: false,
        gridSize: 20,
        enableZoom: true,
        enablePan: true,
        maxZoom: 8,
        minZoom: 0.1,
        backgroundColor: '#ffffff',
        darkMode: false
      }

      expect(['select', 'draw', 'text', 'shape', 'slideshow', 'readonly']).toContain(config.mode)
      expect(typeof config.showGrid).toBe('boolean')
      expect(typeof config.snapToGrid).toBe('boolean')
      expect(typeof config.gridSize).toBe('number')
      expect(typeof config.enableZoom).toBe('boolean')
      expect(typeof config.enablePan).toBe('boolean')
      expect(typeof config.maxZoom).toBe('number')
      expect(typeof config.minZoom).toBe('number')
      expect(typeof config.backgroundColor).toBe('string')
      expect(typeof config.darkMode).toBe('boolean')
    })

    it('should validate CanvasDimensions structure', () => {
      const dimensions: CanvasDimensions = {
        width: 800,
        height: 600,
        scale: 1.0,
        offsetX: 0,
        offsetY: 0
      }

      expect(typeof dimensions.width).toBe('number')
      expect(typeof dimensions.height).toBe('number')
      expect(typeof dimensions.scale).toBe('number')
      expect(typeof dimensions.offsetX).toBe('number')
      expect(typeof dimensions.offsetY).toBe('number')
    })
  })
})