# PowerPoint Paste Parser

A library and proxy server that extracts structured component data from PowerPoint clipboard operations. When you copy content from PowerPoint and paste it elsewhere, this system intercepts the paste operation, calls Microsoft's internal APIs, and parses the Office Open XML format to provide detailed component analysis.

Working version:  https://ppt-paste.clifton-cunningham.workers.dev/

## Powerpoint to TLDraw

<p float="left">
  <img width="45%" alt="Screenshot 2025-09-01 at 11 31 25" src="https://github.com/user-attachments/assets/49673138-1e54-4839-9791-40f468769aed" />
   <span>&nbsp;</span>
  <img width="45%" alt="Screenshot 2025-09-01 at 11 31 42" src="https://github.com/user-attachments/assets/84100548-fd37-42a5-b63a-f47cb8041e2f" />  
</p>

## What It Does

- **Detects PowerPoint clipboard data** from paste operations
- **Extracts Microsoft API URLs** from clipboard metadata  
- **Downloads PowerPoint data** via Microsoft's GetClipboardBytes API
- **Parses Office Open XML** (ZIP format) to extract structured components
- **Returns component details** including types, positions, dimensions, and content

## Parsed Components

The system extracts:
- **Component Types**: text, image, shape, table
- **Positions**: x,y coordinates from PowerPoint
- **Dimensions**: Width and height in PowerPoint units
- **Content**: Text content with styling information
- **Metadata**: Component IDs and additional properties

## Architecture

- **Client Library** (`packages/ppt-paste-parser/`): React component that detects PowerPoint data and calls the worker server
- **Server Library** (`packages/ppt-paste-server/`): Code that parses the OfficeXML and returns structured data
- **Cloudflare Worker** (`apps/worker/`): Hono-based worker that serves the client app and provides API endpoints
- **Client Application** (`apps/worker/client/`): React app with TLDraw integration for visual presentation

## Quick Start

### Development
```bash
# Start both worker and client in development
pnpm dev
# Worker: http://localhost:3001 (API + serves built client)
# Client dev server: http://localhost:5173 (with hot reload)
```

### Production Deploy
```bash
# Build everything and deploy to Cloudflare Workers
pnpm deploy
```

### Usage
- Copy content from PowerPoint (shapes, text, images)
- Paste in the application (dev: http://localhost:5173)
- View parsed components with TLDraw visualization
- Use slideshow mode for presentation view

## Features

- **Real-time Parsing**: Instant PowerPoint clipboard data extraction
- **Visual Canvas**: TLDraw integration for interactive presentation
- **Slideshow Mode**: Full-screen presentation with keyboard navigation
- **Multiple Formats**: Support for clipboard data and uploaded PPTX files
- **Edge Deployment**: Runs on Cloudflare's global network for low latency

## Use Cases

- **PowerPoint to Web**: Convert PowerPoint content for web applications
- **Content Analysis**: Extract and analyze PowerPoint slide components
- **Data Migration**: Parse PowerPoint content for other formats
- **Integration**: Embed PowerPoint content parsing in existing applications

## Technical Details

The system reverse-engineers PowerPoint's cloud service integration, extracts ZIP-formatted Office Open XML data, and uses specialized parsers for different component types (TextParser, ShapeParser, ImageParser, TableParser). Built with TypeScript throughout and deployed on Cloudflare Workers for edge computing performance.

See `CLAUDE.md` for detailed implementation information.
