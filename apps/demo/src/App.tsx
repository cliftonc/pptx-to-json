import { useState } from 'react'
import { ClipboardParser } from 'ppt-paste-parser'
import TldrawCanvas from './components/TldrawCanvas'

interface ParsedContent {
  formats: Array<{type: string, data: string}>;
  isPowerPoint: boolean;
  components: Array<{
    id: string;
    type: string;
    content: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
    style?: any;
    metadata?: any;
    // Legacy support for old format
    bounds?: {x: number, y: number, width: number, height: number};
  }>;
}

import './App.css'

function App() {
  const [structuredData, setStructuredData] = useState<any>(null)

  const handleStructuredParsed = (data: ParsedContent) => {
    console.log('📋 Clipboard data received:', data);
    
    if (data.components && data.components.length > 0) {
      // We have parsed PowerPoint components from the server!
      console.log('🎨 Using server-parsed PowerPoint components:', data.components.length);
      
      const componentsByType = data.components.reduce((acc, comp) => {
        acc[comp.type] = (acc[comp.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      setStructuredData({
        totalComponents: data.components.length,
        componentsByType,
        components: data.components,
        isPowerPoint: data.isPowerPoint,
        availableFormats: data.formats.map(f => f.type)
      });
    } else if (data.isPowerPoint) {
      // PowerPoint was detected but no components returned
      setStructuredData({
        error: 'PowerPoint detected but no components could be parsed. The proxy server may not be running or the PowerPoint data format is not supported.',
        isPowerPoint: data.isPowerPoint,
        availableFormats: data.formats.map(f => f.type)
      });
    } else {
      // Not PowerPoint data
      setStructuredData({
        error: 'No PowerPoint content detected. Please copy content directly from PowerPoint (not from other applications).',
        isPowerPoint: false,
        availableFormats: data.formats.map(f => f.type)
      });
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return '#d1edff';
      case 'image': return '#f8d7da';
      case 'shape': return '#d4edda';
      case 'table': return '#fff3cd';
      default: return '#e2e3e5';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝';
      case 'image': return '🖼️';
      case 'shape': return '🔸';
      case 'table': return '📊';
      default: return '❓';
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left Column - Existing UI */}
      <div style={{ 
        width: '40%', 
        padding: '20px', 
        overflowY: 'auto',
        borderRight: '1px solid #ddd'
      }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>PowerPoint Parser</h1>
          <p style={{ color: '#666', fontSize: '16px', margin: '0 0 5px 0' }}>
            Paste PowerPoint content
          </p>
          <p style={{ color: '#999', fontSize: '12px', margin: '0' }}>
            Components will appear on canvas →
          </p>
        </header>

        <div style={{ marginBottom: '40px' }}>
        <div style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          marginBottom: '20px'
        }}>
          <h3>📋 Paste PowerPoint Content:</h3>
          <ClipboardParser 
            onParse={handleStructuredParsed}
            placeholder="Paste PowerPoint shapes, text, or images here..."
          />
        </div>

        {structuredData && (
          <div style={{
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            {structuredData.error ? (
              <div style={{ color: '#dc3545' }}>
                <h4>❌ Analysis Result:</h4>
                <p>{structuredData.error}</p>
                <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
                  <h5>Debug Info:</h5>
                  <p>PowerPoint detected: {structuredData.isPowerPoint ? 'Yes' : 'No'}</p>
                  <p>Available formats: {structuredData.availableFormats?.join(', ') || 'None'}</p>
                </div>
              </div>
            ) : (
              <div>
                <h4>🎨 PowerPoint Components Parsed Successfully!</h4>
                
                {/* Summary Stats */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                  gap: '10px',
                  marginBottom: '20px',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px'
                }}>
                  <div><strong>Total:</strong> {structuredData.totalComponents}</div>
                  {Object.entries(structuredData.componentsByType).map(([type, count]) => (
                    <div key={type}>
                      <strong>{getTypeIcon(type)} {type}:</strong> {count}
                    </div>
                  ))}
                </div>

                {/* Individual Components */}
                <h4>📝 Component Details:</h4>
                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {structuredData.components.map((component: any, index: number) => (
                    <div key={component.id} style={{
                      border: '1px solid #ddd',
                      padding: '15px',
                      marginBottom: '10px',
                      borderRadius: '6px',
                      backgroundColor: getTypeColor(component.type)
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div>
                          <strong style={{ fontSize: '16px' }}>
                            {getTypeIcon(component.type)} Component #{index + 1}
                          </strong>
                          <span style={{ 
                            marginLeft: '10px', 
                            padding: '3px 8px', 
                            backgroundColor: '#666', 
                            color: 'white', 
                            fontSize: '12px', 
                            borderRadius: '4px',
                            textTransform: 'uppercase'
                          }}>
                            {component.type}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          ID: {component.id}
                        </div>
                      </div>

                      {/* Position and Size */}
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: '10px', 
                        marginBottom: '10px',
                        fontSize: '13px',
                        color: '#555'
                      }}>
                        <div>
                          <strong>Position:</strong> ({Math.round(component.x || component.bounds?.x || 0)}, {Math.round(component.y || component.bounds?.y || 0)})
                        </div>
                        <div>
                          <strong>Size:</strong> {Math.round(component.width || component.bounds?.width || 0)} × {Math.round(component.height || component.bounds?.height || 0)}
                        </div>
                        {component.rotation && (
                          <div>
                            <strong>Rotation:</strong> {Math.round(component.rotation)}°
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ marginBottom: '10px' }}>
                        <strong>Content:</strong>
                        <div style={{
                          marginTop: '5px',
                          padding: '8px',
                          backgroundColor: 'white',
                          border: '1px solid #ddd',
                          borderRadius: '3px',
                          fontSize: '14px',
                          maxHeight: '100px',
                          overflow: 'auto',
                          wordBreak: 'break-word'
                        }}>
                          {component.content || <em style={{color: '#999'}}>No text content</em>}
                        </div>
                      </div>

                      {/* Enhanced Style Information */}
                      {component.style && (
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Style:</strong>
                          <div style={{
                            marginTop: '5px',
                            padding: '8px',
                            backgroundColor: '#f8f9fa',
                            border: '1px solid #ddd',
                            borderRadius: '3px',
                            fontSize: '12px'
                          }}>
                            {component.style.fontSize && (
                              <div><strong>Font Size:</strong> {component.style.fontSize}pt</div>
                            )}
                            {component.style.fontFamily && (
                              <div><strong>Font Family:</strong> {component.style.fontFamily}</div>
                            )}
                            {component.style.fontWeight && component.style.fontWeight !== 'normal' && (
                              <div><strong>Font Weight:</strong> {component.style.fontWeight}</div>
                            )}
                            {component.style.color && (
                              <div><strong>Text Color:</strong> <span style={{color: component.style.color}}>{component.style.color}</span></div>
                            )}
                            {component.style.backgroundColor && component.style.backgroundColor !== 'transparent' && (
                              <div><strong>Background:</strong> <span style={{backgroundColor: component.style.backgroundColor, padding: '2px 4px', borderRadius: '2px'}}>{component.style.backgroundColor}</span></div>
                            )}
                            {component.style.borderColor && component.style.borderColor !== 'transparent' && (
                              <div><strong>Border:</strong> {component.style.borderWidth || 1}px {component.style.borderStyle || 'solid'} <span style={{color: component.style.borderColor}}>{component.style.borderColor}</span></div>
                            )}
                            {component.style.textAlign && component.style.textAlign !== 'left' && (
                              <div><strong>Text Align:</strong> {component.style.textAlign}</div>
                            )}
                            {component.style.opacity !== undefined && component.style.opacity !== 1 && (
                              <div><strong>Opacity:</strong> {Math.round(component.style.opacity * 100)}%</div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      {component.metadata && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          <strong>Metadata:</strong>
                          <div style={{ marginTop: '5px', padding: '5px', backgroundColor: '#f8f9fa', borderRadius: '3px' }}>
                            {Object.entries(component.metadata).map(([key, value]) => (
                              <div key={key} style={{ margin: '2px 0' }}>
                                <strong>{key}:</strong> {JSON.stringify(value)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Debug Info */}
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '12px', color: '#666' }}>
                  <strong>Debug:</strong> PowerPoint: {structuredData.isPowerPoint ? 'Yes' : 'No'} | 
                  Formats: {structuredData.availableFormats?.join(', ')}
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      {/* Right Column - Tldraw Canvas */}
      <div style={{ width: '60%', height: '100%' }}>
        <TldrawCanvas 
          components={structuredData?.components || []} 
        />
      </div>
    </div>
  )
}

export default App