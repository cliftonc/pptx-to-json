# PowerPoint Paste Parser

A library and proxy server that extracts structured component data from PowerPoint clipboard operations. When you copy content from PowerPoint and paste it elsewhere, this system intercepts the paste operation, calls Microsoft's internal APIs, and parses the Office Open XML format to provide detailed component analysis.

Working version:  https://ppt-paste.clifton-cunningham.workers.dev/

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

- **Client Library** (`packages/ppt-paste-parser/`): React component that detects PowerPoint data and calls the proxy server
- **Server Library** (`packages/ppt-paste-server/`): Code that parses the OfficeXML and returns structured data.
- **Proxy Server** (`apps/worker/`): Hono cloudflare worker that provides backend.
- **Demo Application** (`apps/demo/`): UI for testing and displaying parsed components

## Quick Start

1. **Start the dev server:**
   ```bash   
   npm run dev  # Runs FE on http://localhost:5173
   ```
2. **Test the system:**
   - Copy content from PowerPoint (shapes, text, images)
   - Paste in the demo app
   - View the parsed component data

## Use Cases

- **PowerPoint to Web**: Convert PowerPoint content for web applications
- **Content Analysis**: Extract and analyze PowerPoint slide components
- **Data Migration**: Parse PowerPoint content for other formats
- **Integration**: Embed PowerPoint content parsing in existing applications

## Technical Details

The system reverse-engineers PowerPoint's cloud service integration, extracts ZIP-formatted Office Open XML data, and uses specialized parsers for different component types (TextParser, ShapeParser, ImageParser, TableParser).

See `CLAUDE.md` for detailed implementation information.
