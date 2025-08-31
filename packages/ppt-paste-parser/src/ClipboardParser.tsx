import React, { useState } from 'react';

export interface ClipboardData {
  type: string;
  data: string;
}

export interface PowerPointComponent {
  id: string;
  type: 'text' | 'image' | 'shape' | 'table' | 'unknown';
  content: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  metadata?: any;
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

// Call the proxy server to get parsed PowerPoint components
const fetchParsedPowerPointData = async (clipboardBytesUrl: string): Promise<PowerPointComponent[]> => {
  try {
    console.log('🔗 Fetching PowerPoint data via proxy:', clipboardBytesUrl.substring(0, 100) + '...');
    
    const proxyUrl = `http://localhost:3001/api/proxy-powerpoint-clipboard?url=${encodeURIComponent(clipboardBytesUrl)}`;
    
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
        
        // Extract the Microsoft API URL
        const clipboardBytesUrl = extractClipboardBytesUrl(htmlFormat.data);
        
        if (clipboardBytesUrl) {
          console.log('🔗 Found clipboard bytes URL:', clipboardBytesUrl.substring(0, 100) + '...');
          
          // Fetch parsed components from proxy server
          components = await fetchParsedPowerPointData(clipboardBytesUrl);
          
          if (components.length > 0) {
            console.log(`✅ Successfully parsed ${components.length} PowerPoint components!`);
          } else {
            console.warn('❌ No components returned from proxy server');
          }
        } else {
          console.warn('❌ No clipboard bytes URL found in PowerPoint data');
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