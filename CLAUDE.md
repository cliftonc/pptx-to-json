# PowerPoint Paste Parser - Implementation Summary

## Key Files

**`/packages/ppt-paste-parser/src/ClipboardParser.tsx`** - Main React component that handles clipboard paste events, detects PowerPoint cloud service metadata, extracts Microsoft API URLs, and calls the worker server to get parsed components.

**`/apps/worker/worker.js`** - Cloudflare Worker with Hono framework that serves the client app and provides API endpoints. Bypasses CORS restrictions, calls Microsoft's GetClipboardBytes API, and uses the ppt-paste-server package for parsing.

**`/apps/worker/client/src/App.tsx`** - Client application that displays parsed PowerPoint components with TLDraw integration, slideshow mode, and structured UI with visual styling.

**`/packages/ppt-paste-parser/src/index.ts`** - Library exports for the ClipboardParser component and TypeScript interfaces.

## Project Overview

PowerPoint Component Parser that extracts structured data from PowerPoint clipboard operations. The system intercepts PowerPoint paste operations, calls Microsoft's internal APIs, and parses the Office Open XML format to provide detailed component analysis.

## Current Status

The system detects PowerPoint clipboard data, extracts Microsoft API URLs from clipboard metadata, calls Microsoft's GetClipboardBytes API via proxy server, downloads and extracts Office Open XML (ZIP format), parses PowerPoint drawing XML to extract structured components, and displays component details, positions, and content.

## System Architecture

### Client-Side Library (`packages/ppt-paste-parser/`)
- Minimal implementation that detects PowerPoint data, calls worker server, and returns structured components
- React component with TypeScript interfaces
- Delegates parsing to the server

### Cloudflare Worker (`apps/worker/`)
- Hono-based worker running on Cloudflare Workers platform
- Serves static client application via assets binding
- Provides API endpoints for PowerPoint parsing
- Uses ppt-paste-server package for ZIP/XML processing
- Supports R2 storage for uploaded PPTX files
- Returns structured JSON with parsed components

### Client Application (`apps/worker/client/`)
- React application with Vite build system
- TLDraw integration for visual presentation canvas
- Slideshow mode with keyboard navigation
- Displays PowerPoint component data with visual styling
- Built to `/apps/worker/dist` for worker deployment

## What Gets Parsed

The system extracts:

1. Component Types: text, image, shape, table, unknown
2. Positions: x,y coordinates from PowerPoint
3. Dimensions: Width and height in PowerPoint units
4. Content: Text content from text components
5. Metadata: Additional component information
6. IDs: Unique component identifiers

Example: Currently parsing 13 components from test PowerPoint data.

## Workflow

```
1. User copies content in PowerPoint
   ↓
2. User pastes in browser → Clipboard API captures data
   ↓
3. Client detects PowerPoint cloud service metadata
   ↓
4. Extracts Microsoft GetClipboardBytes API URL
   ↓
5. Calls worker server: http://localhost:3001/api/proxy-powerpoint-clipboard
   ↓
6. Worker server fetches from Microsoft API (11,607 bytes binary data)
   ↓
7. Detects Office Open XML format (ZIP signature: 50 4B 03 04)
   ↓
8. Extracts ZIP contents:
   - [Content_Types].xml (542 bytes)
   - clipboard/drawings/drawing1.xml (84,766 bytes) ← Main data
   - clipboard/theme/theme1.xml (6,690 bytes)
   - + relationship files
   ↓
9. Parses drawing1.xml → Extracts 13 PowerPoint components
   ↓
10. Returns structured JSON to client
    ↓
11. UI displays all components with details
```

## File Structure

```
ppt-paste/
├── packages/
│   ├── ppt-paste-parser/               # Client library (TypeScript/React)
│   │   ├── src/ClipboardParser.tsx     # Main component (clean, minimal)
│   │   ├── src/index.ts                # Exports
│   │   └── dist/                       # Built library
│   └── ppt-paste-server/               # Server parsing logic
│       └── src/                        # ZIP/XML parsing, PowerPoint parsers
├── apps/worker/                        # Cloudflare Worker app
│   ├── client/                         # Client application
│   │   ├── src/                        # React components, TLDraw integration
│   │   ├── package.json                # Client dependencies
│   │   └── vite.config.ts              # Builds to ../dist
│   ├── dist/                           # Built client (deployment target)
│   ├── worker.js                       # Cloudflare Worker with Hono
│   ├── package.json                    # Worker dependencies and scripts
│   └── wrangler.toml                   # Cloudflare configuration
└── CLAUDE.md                           # This summary
```

## How to Run

### Development
```bash
# Start both worker and client in development
pnpm dev

# This runs:
# - Worker: http://localhost:3001 (API + serves built client)
# - Client dev server: http://localhost:5173 (with hot reload)
```

### Production Build & Deploy
```bash
# Build everything and deploy to Cloudflare
pnpm deploy

# Or step by step:
pnpm build     # Build library + client
pnpm --filter worker deploy  # Deploy to Cloudflare Workers
```

### Usage
- Copy content from PowerPoint (shapes, text, images)
- Paste in the application (dev: http://localhost:5173, prod: your-worker.workers.dev)
- View component parsing with TLDraw visualization
- Use slideshow mode for presentation view

## Technical Implementation

### Microsoft API Integration
- Reverse-engineered PowerPoint's cloud service integration
- Calls `GetClipboardBytes.ashx` API endpoint
- Handles authentication and CORS via Cloudflare Worker

### Office Open XML Processing
- ZIP extraction from binary clipboard data using pptx2json library
- PowerPoint drawing XML format parsing with specialized component parsers
- Component positions, sizes, and content extraction with modular parser architecture
- Proper handling of clipboard format (`a:txSp` structure) vs full file format

### Parser Architecture

**Core Parsers** (`/packages/ppt-paste-server/src/parsers/`):
- **BaseParser.js**: Common utilities (EMU conversion, color parsing, transform extraction)
- **PowerPointParser.js**: Main coordinator, handles clipboard vs file format detection
- **TextParser.js**: Text components with comprehensive font/style parsing
- **ShapeParser.js**: Geometric shapes with fill, border, and effect parsing
- **ImageParser.js**: Images with data URL extraction and effects
- **TableParser.js**: Tables with cell structure and formatting

**Key Technical Breakthrough**: 
- Clipboard format uses `a:txSp[0].a:txBody` structure (not `p:txBody`)
- PowerPointParser extracts nested `a:txBody` and maps to TextParser's expected format
- Enables reliable text vs shape classification from clipboard data

### Architecture
- **Modular Parser System**: Specialized parsers for different component types (TextParser, ShapeParser, ImageParser, TableParser)
- **Clipboard Format Support**: Proper detection and handling of PowerPoint clipboard structure (`a:txSp` → `a:txBody`)
- **Enhanced Component Classification**: Reliable text vs shape detection with fallback logic
- **Type-safe interfaces**: TypeScript throughout the stack
- **Server-side processing**: Client delegates parsing to Cloudflare Worker for better performance
- **Edge deployment**: Runs on Cloudflare's global edge network for low latency

### User Experience
- Real-time processing with loading states
- Visual component type indicators (icons, colors)
- Structured display of position, size, and content data
- Error handling and debugging information

## Results

Current system capabilities:
- **Accurate Component Classification**: Properly identifies text vs shapes from clipboard data
- **Comprehensive Style Extraction**: Font families, sizes, colors, borders, fills for all component types
- **Canvas-Ready Coordinates**: Positions and dimensions in pixel units suitable for rendering
- **Rich Text Analysis**: Full text content with per-run styling and formatting
- **Enhanced Shape Parsing**: 100+ shape types with proper geometry and styling
- **Modular Architecture**: Clean separation of concerns with specialized parsers

Example parsing results:
- 3 components from clipboard: 2 text, 1 shape (correctly classified)
- Exact positions in PowerPoint coordinate system converted to pixels
- Complete styling data for both text and shape components
- Structured display with visual component indicators in demo UI

## Recent Improvements

1. **✅ Enhanced XML Parsing**: Modular parser architecture with specialized parsers for each component type
2. **✅ Style Information**: Comprehensive parsing of font, color, border, and formatting data for all component types
3. **✅ Component Classification**: Reliable text vs shape detection handling clipboard format differences

## Future Enhancements

1. **Image Extraction**: Extract embedded images from PowerPoint data with proper base64 encoding
2. **Animation Data**: Extract PowerPoint animation information and timing
3. **Multiple Slides**: Support for full slide deck parsing beyond clipboard data
4. **Export Options**: Save parsed data to JSON/CSV formats
5. **Advanced Styling**: Shadow effects, gradients, and complex formatting
6. **Table Enhancements**: Better table structure parsing and cell formatting

## Development Commands

```bash
# Development
pnpm dev                        # Start worker + client dev servers

# Building
pnpm build:lib                  # Build ppt-paste-parser library
pnpm build                      # Build library + client app
pnpm deploy                     # Build + deploy to Cloudflare Workers

# Client-specific
pnpm --filter worker dev:client    # Run only client dev server
pnpm --filter worker build:client  # Build only client app

# Worker-specific
pnpm --filter worker dev        # Run only worker dev server
pnpm --filter worker deploy     # Deploy worker to Cloudflare

# Type checking
pnpm --filter ppt-paste-parser tsc --noEmit

# Debug PowerPoint binary files
pnpm log-bin <filename>        # Parse binary file from fixtures/
pnpm log-bin bullets.bin       # Example: parse bullets.bin
pnpm log-bin bullets.bin --debug  # Example: with debug output
```

## Dependencies

**Client Library:**
- React 19+
- TypeScript

**Cloudflare Worker:**
- Hono (web framework)
- ppt-paste-server (parsing logic)
- Cloudflare Workers Runtime
- R2 storage (for uploaded files)

**Client App:**
- Vite (build tool)
- React 19+
- TLDraw (canvas rendering)
- TipTap (rich text editing)
- ppt-paste-parser (local)

---

## Status

The PowerPoint Component Parser is operational and parsing real PowerPoint data into structured components. The system provides an end-to-end solution for extracting and analyzing PowerPoint clipboard content.

Date: September 2, 2025
- **✅ App Consolidation**: Combined demo and worker into single deployment
- **✅ TLDraw Integration**: Visual canvas rendering with slideshow mode
- **✅ Cloudflare Deployment**: Edge-deployed worker with R2 storage
- When we later want to create pptx use pptxgenjs