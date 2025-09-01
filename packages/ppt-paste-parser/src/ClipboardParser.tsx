import React, { useState } from 'react';

export interface ClipboardData {
  type: string;
  data: string;
}

export interface PowerPointComponent {
  id: string;
  type: 'text' | 'image' | 'shape' | 'table' | 'unknown';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  style?: any;
  metadata?: any;
  slideIndex?: number;
}

export interface ParsedContent {
  formats: ClipboardData[];
  isPowerPoint: boolean;
  components: PowerPointComponent[];
}

export interface EnhancedPowerPointComponent extends PowerPointComponent {
  zIndex?: number;
  renderingInfo: {
    componentType: string;
    suggestedElement: string;
    description: string;
    priority: number;
    isDecorative: boolean;
  };
  metadata: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    alignment?: string;
    isTitle?: boolean;
    isBulletPoint?: boolean;
    hasAnimation?: boolean;
    imageFormat?: string;
    tableRows?: number;
    tableCols?: number;
    borderColor?: string;
    shapeType?: string;
    borderWidth?: number;
    opacity?: number;
  };
}

export interface ClipboardParserProps {
  onParse?: (data: ParsedContent) => void;
  className?: string;
  placeholder?: string;
  debugMode?: boolean;
}

// Simple function to check if clipboard data has PowerPoint cloud service metadata
const hasPowerPointCloudServiceData = (html: string): boolean => {
  return html.includes('data-clipservice-type') || 
         html.includes('data-clipboardasbytes-url') ||
         html.includes('officeapps.live.com');
};

// Extract the Microsoft API URL from clipboard HTML
const extractClipboardBytesUrl = (html: string): string | null => {
  const match = html.match(/data-clipboardasbytes-url="([^"]*)"/) || 
                html.match(/data-clipboardasbytes-url='([^']*)'/) ||
                html.match(/(https:\/\/[^"'\s]*GetClipboardBytes[^"'\s]*)/);
  return match ? match[1] : null;
};

// Parse HTML table data from clipboard
const parseHtmlTableData = (html: string): PowerPointComponent[] => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tables = doc.querySelectorAll('table.ExportedPPTTable');
    
    const components: PowerPointComponent[] = [];
    
    // Also extract shape IDs from the main element for correlation
    const mainElement = doc.querySelector('[data-shapeids]');
    const shapeIds = mainElement?.getAttribute('data-shapeids')?.split(',').map(id => parseInt(id.trim())) || [];
    
    tables.forEach((table, tableIndex) => {
      const rows = Array.from(table.querySelectorAll('tr'));
      const tableData: string[][] = [];
      
      // Extract table metadata
      const shapeCreationId = table.getAttribute('data-shape-creation-id');
      const tableElement = table as HTMLElement;
      const tableWidth = tableElement.style.width ? parseFloat(tableElement.style.width) : 0;
      
      // Extract table structure and content
      rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        const rowData = cells.map(cell => {
          // Extract text content, removing extra whitespace
          const textContent = cell.textContent?.trim().replace(/\u200B/g, '') || '';
          return textContent;
        });
        if (rowData.length > 0) {
          tableData.push(rowData);
        }
      });
      
      if (tableData.length > 0) {
        // Create a table component
        const tableComponent: PowerPointComponent = {
          id: `table-clipboard-${Date.now()}-${tableIndex}`,
          type: 'table',
          content: `Table (${tableData.length} rows × ${tableData[0]?.length || 0} columns)`,
          x: 0, // Will be updated if we can correlate with binary data
          y: 0,
          width: tableWidth || 0,
          height: 0,
          style: {
            borderColor: '#ffffff',
            backgroundColor: 'transparent'
          },
          metadata: {
            tableData,
            rows: tableData.length,
            cols: tableData[0]?.length || 0,
            hasHeader: true, // Assume first row is header for now
            source: 'clipboard-html',
            shapeCreationId,
            possibleShapeIds: shapeIds,
            htmlWidth: tableWidth
          }
        };
        
        components.push(tableComponent);
        console.log('📊 Parsed HTML table:', {
          rows: tableData.length,
          cols: tableData[0]?.length || 0,
          firstRow: tableData[0],
          shapeCreationId,
          shapeIds
        });
      }
    });
    
    return components;
  } catch (error) {
    console.error('❌ Error parsing HTML table data:', error);
    return [];
  }
};

// Call the proxy server to get parsed PowerPoint components
const fetchParsedPowerPointData = async (clipboardBytesUrl: string): Promise<PowerPointComponent[]> => {
  try {
    console.log('🔗 Fetching PowerPoint data via proxy:', clipboardBytesUrl.substring(0, 100) + '...');
    
    const proxyUrl = `/api/proxy-powerpoint-clipboard?url=${encodeURIComponent(clipboardBytesUrl)}`;
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!response.ok) {
      console.error('❌ Proxy request failed:', response.status);
      return [];
    }
    
    const data = await response.json();
    console.log('📦 Received from proxy:', {
      type: data.type,
      componentCount: data.components?.length || 0,
      isPowerPoint: data.isPowerPoint
    });
    
    if (data.type === 'powerpoint' && data.components) {
      console.log('🎨 PowerPoint components:', data.components.length);
      data.components.forEach((comp: any, i: number) => {
        if (comp && typeof comp === 'object') {
          console.log(`🎨 Component ${i + 1}:`, {
            id: comp.id || 'unknown',
            type: comp.type || 'unknown',
            content: (comp.content || '').substring(0, 50) + '...',
            position: `(${Math.round(comp.x || comp.bounds?.x || 0)}, ${Math.round(comp.y || comp.bounds?.y || 0)})`,
            size: `${Math.round(comp.width || comp.bounds?.width || 0)}x${Math.round(comp.height || comp.bounds?.height || 0)}`
          });
        } else {
          console.log(`🎨 Component ${i + 1}: Invalid component`, comp);
        }
      });
      return data.components;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Error fetching PowerPoint data:', error);
    return [];
  }
};

export const ClipboardParser: React.FC<ClipboardParserProps> = ({
  onParse,
  className = '',
  placeholder = 'Paste content here...',
  debugMode = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePaste = async (event: React.ClipboardEvent) => {
    event.preventDefault();
    setIsProcessing(true);

    try {
      const clipboardData = event.clipboardData;
      const formats: ClipboardData[] = [];
      let components: PowerPointComponent[] = [];
      
      // Get all available formats
      const types = Array.from(clipboardData.types);
      console.log('📋 Available clipboard formats:', types);
      
      // Extract all clipboard data
      for (const type of types) {
        try {
          const data = clipboardData.getData(type);
          if (data) {
            formats.push({ type, data });
            console.log(`📋 Format ${type}: ${data.length} characters`);
          }
        } catch (error) {
          console.warn(`❌ Could not read format ${type}:`, error);
        }
      }

      // Check for PowerPoint cloud service data in HTML
      const htmlFormat = formats.find(f => f.type === 'text/html');
      let isPowerPoint = false;
      
      if (htmlFormat && hasPowerPointCloudServiceData(htmlFormat.data)) {
        console.log('🎨 PowerPoint cloud service data detected!');
        isPowerPoint = true;
        
        // Parse HTML table data directly from clipboard (if any)
        const htmlTableComponents = parseHtmlTableData(htmlFormat.data);
        if (htmlTableComponents.length > 0) {
          console.log(`📊 Found ${htmlTableComponents.length} HTML table(s) in clipboard!`);
        }
        
        // Always try to get other components from binary XML
        const clipboardBytesUrl = extractClipboardBytesUrl(htmlFormat.data);
        let binaryComponents: PowerPointComponent[] = [];
        
        if (clipboardBytesUrl) {
          console.log('🔗 Found clipboard bytes URL, fetching binary data:', clipboardBytesUrl.substring(0, 100) + '...');
          
          // Fetch parsed components from proxy server
          binaryComponents = await fetchParsedPowerPointData(clipboardBytesUrl);
          
          if (binaryComponents.length > 0) {
            console.log(`✅ Successfully parsed ${binaryComponents.length} PowerPoint components from binary data!`);
          } else {
            console.warn('❌ No components returned from proxy server');
          }
        } else {
          console.warn('❌ No clipboard bytes URL found in PowerPoint data');
        }
        
        // Add default positioning to HTML tables and merge with binary components
        const positionedTableComponents = htmlTableComponents.map((tableComponent, tableIndex) => {
          // Use smart default positioning for all HTML tables
          const defaultX = 100;
          let defaultY = 100;
          
          if (binaryComponents.length > 0) {
            // Position below the lowest binary component with some spacing
            const maxBottom = Math.max(...binaryComponents.map(c => (c.y || 0) + (c.height || 100)));
            defaultY = maxBottom + 50; // 50px spacing
          }
          
          // Stack multiple tables vertically
          defaultY += tableIndex * 200; // 200px spacing between multiple tables
          
          console.log(`📍 Positioning HTML table ${tableIndex + 1} at: (${defaultX}, ${defaultY})`);
          
          return {
            ...tableComponent,
            x: defaultX,
            y: defaultY,
            // Use reasonable default size if not specified
            width: tableComponent.width || 300,
            height: tableComponent.height || 150,
            metadata: {
              ...tableComponent.metadata,
              positionEstimated: true,
              source: 'html-fallback'
            }
          };
        });
        
        // Simply merge HTML tables with all binary components
        components = [...positionedTableComponents, ...binaryComponents];
        
        if (components.length > 0) {
          console.log(`🎨 Combined result: ${positionedTableComponents.length} table(s) + ${binaryComponents.length} binary component(s) = ${components.length} total components`);
        }
      }

      // Call the onParse callback with the results
      if (onParse) {
        onParse({
          formats,
          isPowerPoint,
          components
        });
      }

    } catch (error) {
      console.error('❌ Error processing clipboard data:', error);
      if (onParse) {
        onParse({
          formats: [],
          isPowerPoint: false,
          components: []
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`clipboard-parser ${className}`}
      onPaste={handlePaste}
      contentEditable
      suppressContentEditableWarning
      style={{
        minHeight: '100px',
        padding: '10px',
        border: '2px dashed #ccc',
        borderRadius: '4px',
        outline: 'none',
        backgroundColor: isProcessing ? '#f0f8ff' : 'white',
        cursor: isProcessing ? 'wait' : 'text',
        opacity: isProcessing ? 0.7 : 1,
      }}
    >
      {isProcessing ? (
        <span style={{ color: '#666', fontStyle: 'italic' }}>
          Processing PowerPoint data...
        </span>
      ) : (
        <span style={{ color: '#999' }}>
          {placeholder}
        </span>
      )}
    </div>
  );
};