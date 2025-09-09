# Canvas Abstraction Layer - Phase 1 Documentation

## Overview

This document describes the Canvas Abstraction Layer implemented in Phase 1 of the refactoring plan. The architecture follows the Strategy Pattern with React Context to enable seamless switching between different canvas rendering engines (TLDraw, Konva, etc.).

## Core Architecture

### Strategy Pattern Implementation

The canvas abstraction layer uses the Strategy Pattern to decouple canvas rendering logic from the application:

```typescript
interface CanvasRenderer {
  // Core identification
  readonly type: CanvasRendererType
  readonly displayName: string
  
  // Lifecycle management
  initialize(container: HTMLElement, config: CanvasConfig): Promise<void>
  destroy(): void
  
  // Data management
  loadSlides(slides: CanvasSlide[], dimensions?: CanvasDimensions): Promise<void>
  loadComponents(components: CanvasComponent[], dimensions?: CanvasDimensions): Promise<void>
  
  // State management
  getSnapshot(): Promise<any>
  loadSnapshot(snapshot: any): Promise<void>
  
  // User interaction
  setMode(mode: CanvasMode): void
  navigateToSlide(slideIndex: number): Promise<void>
  setEventHandlers(handlers: CanvasEventHandlers): void
  
  // Configuration
  updateConfig(config: Partial<CanvasConfig>): void
  
  // Export functionality
  export(format: 'png' | 'svg' | 'json'): Promise<Blob | string>
}
```

### React Context Management

The `CanvasProvider` manages renderer lifecycle and state:

```typescript
interface CanvasContextValue {
  // Current renderer state
  currentRenderer: CanvasRenderer | null
  currentRendererType: CanvasRendererType | null
  isInitialized: boolean
  isLoading: boolean
  error: string | null

  // Available renderers
  availableRenderers: CanvasRendererInfo[]
  
  // Canvas state
  config: CanvasConfig
  slides: CanvasSlide[]
  selectedComponentId: string | null
  currentSlideIndex: number

  // Actions
  switchRenderer: (type: CanvasRendererType) => Promise<void>
  registerRenderer: (rendererInfo: CanvasRendererInfo) => void
  // ... other methods
}
```

## Type Definitions

### Core Types

#### CanvasComponent
Normalized representation of visual elements:

```typescript
interface CanvasComponent {
  id: string                    // Unique identifier
  type: ComponentType           // text | image | shape | table | video | connection | unknown
  x: number                     // X position
  y: number                     // Y position
  width: number                 // Width in canvas units
  height: number                // Height in canvas units
  rotation?: number             // Rotation angle in degrees
  opacity?: number              // Opacity (0-1)
  visible?: boolean             // Visibility flag
  locked?: boolean              // Lock flag for editing
  content?: any                 // Renderer-specific content
  style?: CanvasComponentStyle  // Styling information
  metadata?: Record<string, any> // Additional metadata
}
```

#### CanvasSlide
Container for components representing a slide:

```typescript
interface CanvasSlide {
  id: string                    // Unique slide identifier
  name?: string                 // Display name
  slideNumber: number           // Slide number (1-based)
  components: CanvasComponent[] // Components on this slide
  background?: SlideBackground  // Background configuration
  dimensions: {                 // Slide dimensions
    width: number
    height: number
  }
  metadata?: Record<string, any> // Additional metadata
}
```

#### CanvasConfig
Configuration options for canvas behavior:

```typescript
interface CanvasConfig {
  mode: CanvasMode              // Current interaction mode
  showGrid?: boolean            // Grid visibility
  snapToGrid?: boolean          // Snap to grid behavior
  gridSize?: number             // Grid cell size
  enableZoom?: boolean          // Zoom controls
  enablePan?: boolean           // Pan controls
  maxZoom?: number              // Maximum zoom level
  minZoom?: number              // Minimum zoom level
  backgroundColor?: string      // Canvas background color
  darkMode?: boolean            // Dark mode flag
}
```

### Renderer Registration

Renderers are registered using the factory pattern:

```typescript
interface CanvasRendererInfo {
  type: CanvasRendererType      // Unique type identifier
  displayName: string           // Human-readable name
  description: string           // Renderer description
  factory: CanvasRendererFactory // Factory function
  capabilities: {               // Renderer capabilities
    supportsSlideshow: boolean
    supportsRichText: boolean
    supportsAnimations: boolean
    supportsCollaboration: boolean
    supportsExport: string[]    // Supported export formats
  }
}
```

## Component Architecture

### CanvasProvider
- **Purpose**: Central state management for canvas operations
- **Responsibilities**:
  - Renderer lifecycle management
  - State synchronization between renderers
  - Event handling coordination
  - Configuration management
- **Key Features**:
  - Automatic renderer switching with state preservation
  - Error handling and recovery
  - Persistent renderer preferences

### CanvasSelector
- **Purpose**: UI component for renderer selection
- **Responsibilities**:
  - Display available renderers
  - Handle renderer switching
  - Show renderer capabilities and status
- **Key Features**:
  - Dropdown interface with renderer details
  - Loading and error states
  - Capability badges

### useCanvas Hook
- **Purpose**: Access canvas context from components
- **Responsibilities**:
  - Provide access to canvas state and actions
  - Ensure components are used within provider
- **Key Features**:
  - Type-safe context access
  - Error handling for missing provider

## Data Flow

### Renderer Switching Flow

1. User selects new renderer via `CanvasSelector`
2. `CanvasProvider` captures current state via `getSnapshot()`
3. Current renderer is destroyed via `destroy()`
4. New renderer is created via factory function
5. New renderer is initialized with current config
6. Previous state is loaded via `loadSnapshot()`
7. Context state is updated to reflect new renderer

### Data Loading Flow

1. PowerPoint data is parsed into standard format
2. `powerPointToCanvasComponent` and `powerPointToCanvasSlide` convert data
3. Canvas provider stores normalized data
4. Current renderer receives data via `loadSlides()` or `loadComponents()`
5. Renderer-specific rendering occurs

## Error Handling

### Renderer Initialization Errors
- Container element validation
- Factory function error handling
- Graceful fallback to previous renderer

### State Migration Errors
- Snapshot compatibility checking
- Fallback to raw data loading
- User notification of migration issues

### Runtime Errors
- Renderer-specific error isolation
- Context-level error state management
- Recovery mechanisms

## Performance Considerations

### Renderer Switching
- Minimize data serialization overhead
- Lazy renderer initialization
- Efficient cleanup of previous renderer resources

### State Management
- Shallow comparison for config updates
- Memoized event handlers
- Optimistic UI updates

## Extension Points

### Custom Renderers
To add a new renderer:

1. Implement the `CanvasRenderer` interface
2. Create a `CanvasRendererInfo` with factory function
3. Register via `registerRenderer()` hook or context method
4. Handle renderer-specific data formats and capabilities

### Event System
Extended event handling can be added through:
- Custom event handler interfaces
- Middleware pattern for event processing
- Plugin system for additional functionality

## Testing Strategy

### Unit Tests
- Interface compliance validation
- Type safety verification
- Utility function testing

### Integration Tests
- Provider state management
- Renderer switching scenarios
- Error handling flows

### Component Tests
- UI component behavior
- Event handling
- Error state rendering

## Future Considerations

### Phase 2 Preparation
- TLDraw-specific renderer implementation
- State migration utilities
- Performance optimization hooks

### Phase 3 Preparation
- Konva renderer interface planning
- Multi-renderer testing framework
- Advanced capability detection

## Usage Examples

### Basic Setup
```tsx
function App() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  return (
    <CanvasProvider containerRef={containerRef} defaultRenderer="tldraw">
      <div ref={containerRef} />
      <CanvasSelector />
      <CanvasContent />
    </CanvasProvider>
  )
}
```

### Custom Renderer Registration
```tsx
function MyComponent() {
  useCanvasRenderer({
    type: 'my-renderer',
    displayName: 'My Custom Renderer',
    description: 'Custom canvas implementation',
    factory: createMyRenderer,
    capabilities: {
      supportsSlideshow: true,
      supportsRichText: false,
      supportsAnimations: true,
      supportsCollaboration: false,
      supportsExport: ['png', 'json']
    }
  })
  
  return <MyCustomUI />
}
```

### Canvas Operations
```tsx
function CanvasControls() {
  const canvas = useCanvas()
  
  const handleExport = async () => {
    const data = await canvas.exportCanvas('png')
    // Handle export data
  }
  
  const handleModeChange = (mode: CanvasMode) => {
    canvas.setMode(mode)
  }
  
  return (
    <div>
      <button onClick={() => handleModeChange('draw')}>Draw Mode</button>
      <button onClick={handleExport}>Export</button>
    </div>
  )
}
```

This architecture provides a solid foundation for Phase 2 implementation while maintaining flexibility for future renderer additions.