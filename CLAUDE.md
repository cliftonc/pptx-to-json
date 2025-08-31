# PowerPoint Paste Parser - Implementation Summary

## Key Files

**`/packages/ppt-paste-parser/src/ClipboardParser.tsx`** - Main React component that handles clipboard paste events, detects PowerPoint cloud service metadata, extracts Microsoft API URLs, and calls the proxy server to get parsed components.

**`/apps/proxy-server/server.js`** - Express server that bypasses CORS restrictions, calls Microsoft's GetClipboardBytes API, extracts ZIP contents using yauzl, and parses PowerPoint drawing XML to return structured component data.

**`/apps/demo/src/App.tsx`** - Demo application that displays parsed PowerPoint components in a structured UI with visual styling, component types, positions, and content details.

**`/packages/ppt-paste-parser/src/index.ts`** - Library exports for the ClipboardParser component and TypeScript interfaces.

## Project Overview

PowerPoint Component Parser that extracts structured data from PowerPoint clipboard operations. The system intercepts PowerPoint paste operations, calls Microsoft's internal APIs, and parses the Office Open XML format to provide detailed component analysis.

## Current Status

The system detects PowerPoint clipboard data, extracts Microsoft API URLs from clipboard metadata, calls Microsoft's GetClipboardBytes API via proxy server, downloads and extracts Office Open XML (ZIP format), parses PowerPoint drawing XML to extract structured components, and displays component details, positions, and content.

## System Architecture

### Client-Side Library (`packages/ppt-paste-parser/`)
- Minimal implementation that detects PowerPoint data, calls proxy server, and returns structured components
- React component with TypeScript interfaces
- Delegates parsing to the server

### Proxy Server (`apps/proxy-server/`)
- Express.js server running on `http://localhost:3001`
- Bypasses CORS restrictions for Microsoft API calls
- ZIP extraction using `yauzl` library
- XML parsing with custom regex-based PowerPoint drawing parser
- Returns structured JSON with parsed components

### Demo Application (`apps/demo/`)
- UI displaying parsed components
- Shows PowerPoint component data with visual styling
- Displays component types, positions, and sizes

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
5. Calls proxy server: http://localhost:3001/api/proxy-powerpoint-clipboard
   ↓
6. Proxy server fetches from Microsoft API (11,607 bytes binary data)
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
├── packages/ppt-paste-parser/          # Client library (TypeScript/React)
│   ├── src/ClipboardParser.tsx         # Main component (clean, minimal)
│   ├── src/index.ts                    # Exports
│   └── dist/                           # Built library
├── apps/proxy-server/                  # Node.js proxy server
│   ├── server.js                       # Express server with ZIP/XML parsing
│   └── package.json                    # Dependencies: express, cors, yauzl, etc.
├── apps/demo/                          # React demo app
│   └── src/App.tsx                     # Clean UI displaying parsed components
└── CLAUDE.md                           # This summary
```

## How to Run

1. Start Proxy Server:
   ```bash
   cd apps/proxy-server
   npm run dev  # Runs on http://localhost:3001
   ```

2. Start Demo App:
   ```bash
   cd apps/demo
   pnpm dev  # Runs on http://localhost:5173
   ```

3. Use the System:
   - Copy content from PowerPoint (shapes, text, images)
   - Paste in the demo app
   - View component parsing and structured display

## Technical Implementation

### Microsoft API Integration
- Reverse-engineered PowerPoint's cloud service integration
- Calls `GetClipboardBytes.ashx` API endpoint
- Handles authentication and CORS via proxy server

### Office Open XML Processing
- ZIP extraction from binary clipboard data using pptx2json library
- PowerPoint drawing XML format parsing with specialized component parsers
- Component positions, sizes, and content extraction with modular parser architecture
- Proper handling of clipboard format (`a:txSp` structure) vs full file format

### Parser Architecture

**Core Parsers** (`/apps/proxy-server/parsers/`):
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
- **Server-side processing**: Client delegates parsing to proxy server for better performance

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
# Build the library
pnpm --filter ppt-paste-parser build

# Run tests
pnpm test

# Start all services
pnpm dev

# Type checking
pnpm --filter ppt-paste-parser tsc --noEmit
```

## Dependencies

**Client Library:**
- React 18+
- TypeScript

**Proxy Server:**
- Express.js
- yauzl (ZIP extraction)
- node-fetch
- cors

**Demo App:**
- Vite
- React
- ppt-paste-parser (local)

---

## Status

The PowerPoint Component Parser is operational and parsing real PowerPoint data into structured components. The system provides an end-to-end solution for extracting and analyzing PowerPoint clipboard content.

Date: August 31, 2025
- When we later want to create pptx use pptxgenjs