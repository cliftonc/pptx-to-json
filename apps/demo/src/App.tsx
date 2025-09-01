import { useState } from 'react'
import { ClipboardParser, type ParsedContent } from 'ppt-paste-parser'
import TldrawCanvas from './components/TldrawCanvas'
import RawDataPage from './RawDataPage'

import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'raw'>('main')
  const [structuredData, setStructuredData] = useState<any>(null)

  const handleStructuredParsed = (data: ParsedContent) => {
    console.log('📋 Clipboard data received:', data);
    console.log('📋 Component types:', data.components?.map(c => ({ type: c.type, id: c.id })));
    
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
        error: 'PowerPoint detected but no components could be parsed. Make sure you are copying from the web-based Office 365 version of PowerPoint (not the desktop app). The proxy server may also not be running.',
        isPowerPoint: data.isPowerPoint,
        availableFormats: data.formats.map(f => f.type)
      });
    } else {
      // Not PowerPoint data
      setStructuredData({
        error: 'No PowerPoint content detected. Please copy content directly from the web-based Office 365 version of PowerPoint (powerpoint.office.com) - the desktop app is not supported.',
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

  const renderRichText = (richText: any): React.ReactNode => {
    if (!richText || !richText.content) return null;
    
    return richText.content.map((item: any, index: number) => {
      if (item.type === 'paragraph') {
        return (
          <div key={index} style={{ marginBottom: '8px' }}>
            {item.content?.map((textNode: any, textIndex: number) => {
              if (textNode.type === 'text') {
                let style: React.CSSProperties = {};
                
                // Apply marks (formatting)
                if (textNode.marks) {
                  textNode.marks.forEach((mark: any) => {
                    if (mark.type === 'bold') style.fontWeight = 'bold';
                    if (mark.type === 'italic') style.fontStyle = 'italic';
                  });
                }
                
                // Apply custom attributes (size, color, font family)
                if (textNode.attrs) {
                  if (textNode.attrs.fontSize) style.fontSize = `${textNode.attrs.fontSize}pt`;
                  if (textNode.attrs.color) style.color = textNode.attrs.color;
                  if (textNode.attrs.fontFamily) style.fontFamily = textNode.attrs.fontFamily;
                }
                
                return (
                  <span key={textIndex} style={style}>
                    {textNode.text}
                  </span>
                );
              }
              return null;
            })}
          </div>
        );
      } else if (item.type === 'bulletList') {
        return (
          <ul key={index} style={{ marginBottom: '8px', paddingLeft: '20px' }}>
            {item.content?.map((listItem: any, listIndex: number) => (
              <li key={listIndex}>
                {listItem.content?.[0]?.content?.map((textNode: any, textIndex: number) => {
                  if (textNode.type === 'text') {
                    let style: React.CSSProperties = {};
                    
                    // Apply marks (formatting)
                    if (textNode.marks) {
                      textNode.marks.forEach((mark: any) => {
                        if (mark.type === 'bold') style.fontWeight = 'bold';
                        if (mark.type === 'italic') style.fontStyle = 'italic';
                      });
                    }
                    
                    // Apply custom attributes (size, color, font family)
                    if (textNode.attrs) {
                      if (textNode.attrs.fontSize) style.fontSize = `${textNode.attrs.fontSize}pt`;
                      if (textNode.attrs.color) style.color = textNode.attrs.color;
                      if (textNode.attrs.fontFamily) style.fontFamily = textNode.attrs.fontFamily;
                    }
                    
                    return (
                      <span key={textIndex} style={style}>
                        {textNode.text}
                      </span>
                    );
                  }
                  return null;
                })}
              </li>
            ))}
          </ul>
        );
      }
      return null;
    });
  };

  if (currentPage === 'raw') {
    return <RawDataPage />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left Column - Existing UI */}
      <div style={{ 
        width: '40%', 
        padding: '20px', 
        overflowY: 'auto',
        borderRight: '1px solid #ddd'
      }}>
        <header style={{ 
          textAlign: 'center', 
          marginBottom: '50px', 
          position: 'relative',
          paddingTop: '60px',
          paddingBottom: '20px'
        }}>
          {/* Top navigation bar */}
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px'
          }}>
            <a 
              href="https://github.com/cliftonc/ppt-paste" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#24292f',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#32383f';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#24292f';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              <svg
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </a>
            
            <button 
              onClick={() => setCurrentPage('raw')}
              style={{
                padding: '10px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#5a6268';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#6c757d';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              Extractor
            </button>
          </div>

          {/* Main header content */}
          <div style={{ marginTop: '20px' }}>
            <h1 style={{ 
              fontSize: '32px', 
              margin: '0 0 16px 0',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              PowerPoint Parser
            </h1>
            <p style={{ 
              color: '#4a5568', 
              fontSize: '18px', 
              margin: '0 0 8px 0',
              lineHeight: '1.5',
              maxWidth: '400px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Upload PPTX files or paste PowerPoint content from web based PowerPoint and load them directly into <a href="https://www.tldraw.com/">TLDraw</a>
            </p>
            <p style={{ 
              color: '#718096', 
              fontSize: '14px', 
              margin: '0',
              fontStyle: 'italic'
            }}>
              Components will appear on canvas →
            </p>
          </div>
        </header>

        <div style={{ marginBottom: '40px' }}>
        <div style={{
          border: '1px solid #ddd',
          padding: '20px',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          marginBottom: '20px'
        }}>
          <h3>📋 Upload or Paste PowerPoint Content:</h3>
          <ClipboardParser 
            onParse={handleStructuredParsed}
            placeholder="Paste PowerPoint shapes, text, or images here..."
          />
          
          {/* Component Support Information */}
          <div style={{ marginTop: '20px', fontSize: '14px', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {/* Supported Components */}
              <div style={{
                padding: '16px',
                backgroundColor: '#d1edff',
                borderRadius: '6px',
                border: '1px solid #bee5eb'
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#0c5460', fontSize: '16px' }}>
                  ✅ Supported Components
                </h4>
                <ul style={{ 
                  margin: '0', 
                  paddingLeft: '20px', 
                  lineHeight: '1.8', 
                  color: '#0c5460' 
                }}>
                  <li><strong>📝 Text:</strong> Rich text with fonts, colors, sizes, bold/italic</li>
                  <li><strong>🖼️ Images:</strong> PNG, JPG with positioning & scaling</li>
                  <li><strong>🔸 Shapes:</strong> Rectangles, circles, lines with fills & borders</li>
                  <li><strong>🎨 Styling:</strong> Colors, gradients, transparency, shadows</li>
                  <li><strong>📐 Layout:</strong> Precise positioning, rotation, grouping</li>
                </ul>
              </div>

              {/* Unsupported Components */}
              <div style={{
                padding: '16px',
                backgroundColor: '#f8d7da',
                borderRadius: '6px',
                border: '1px solid #f5c6cb'
              }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#721c24', fontSize: '16px' }}>
                  ❌ Not Yet Supported
                </h4>
                <ul style={{ 
                  margin: '0', 
                  paddingLeft: '20px', 
                  lineHeight: '1.8', 
                  color: '#721c24' 
                }}>
                  <li><strong>📊 Tables:</strong> Coming soon - handled client-side</li>
                  <li><strong>📈 Charts:</strong> Graphs, pie charts, data visualizations</li>
                  <li><strong>🎬 Media:</strong> Videos, audio files, embedded content</li>
                  <li><strong>🔗 SmartArt:</strong> Diagrams, org charts, process flows</li>
                  <li><strong>📎 Embedded:</strong> Excel sheets, Word docs, other files</li>
                </ul>
              </div>
            </div>

            {/* Additional Info */}
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fff3cd',
              borderRadius: '6px',
              border: '1px solid #ffeaa7',
              color: '#856404'
            }}>
              <strong>💡 Pro Tip:</strong> Works best with <strong>web-based PowerPoint</strong> (powerpoint.office.com). 
              Desktop PowerPoint may have limited clipboard format support.
            </div>
          </div>
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
                      <strong>{getTypeIcon(type) as string} {type}:</strong> {count as number}
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
                            {getTypeIcon(component.type) as string} Component #{index + 1}
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
                          <strong>Position:</strong> ({Math.round(component.x || 0)}, {Math.round(component.y || 0)})
                        </div>
                        <div>
                          <strong>Size:</strong> {Math.round(component.width || 0)} × {Math.round(component.height || 0)}
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

                      {/* Rich Text with Formatting */}
                      {component.richText && (
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Rich Text (with formatting):</strong>
                          <div style={{
                            marginTop: '5px',
                            padding: '8px',
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '3px',
                            fontSize: '14px',
                            maxHeight: '150px',
                            overflow: 'auto',
                            wordBreak: 'break-word'
                          }}>
                            {renderRichText(component.richText)}
                          </div>
                        </div>
                      )}

                      {/* Table Data */}
                      {component.type === 'table' && component.metadata?.tableData && (
                        <div style={{ marginBottom: '10px' }}>
                          <strong>Table Data ({component.metadata.rows} rows × {component.metadata.cols} columns):</strong>
                          <div style={{
                            marginTop: '5px',
                            border: '1px solid #ddd',
                            borderRadius: '3px',
                            overflow: 'auto',
                            maxHeight: '300px'
                          }}>
                            <table style={{
                              width: '100%',
                              borderCollapse: 'collapse',
                              fontSize: '13px'
                            }}>
                              <tbody>
                                {component.metadata.tableData.map((row: string[], rowIndex: number) => (
                                  <tr key={rowIndex}>
                                    {row.map((cell: string, cellIndex: number) => (
                                      <td key={cellIndex} style={{
                                        border: '1px solid #ddd',
                                        padding: '6px',
                                        backgroundColor: rowIndex === 0 && component.metadata.hasHeader 
                                          ? '#f8f9fa' 
                                          : 'white',
                                        fontWeight: rowIndex === 0 && component.metadata.hasHeader 
                                          ? 'bold' 
                                          : 'normal'
                                      }}>
                                        {cell || <em style={{color: '#999'}}>empty</em>}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div style={{
                            marginTop: '5px',
                            fontSize: '11px',
                            color: '#666'
                          }}>
                            Source: {component.metadata.source || 'unknown'}
                          </div>
                        </div>
                      )}

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
                            {Object.entries(component.metadata)
                              .filter(([key]) => key !== 'imageUrl') // Don't show imageUrl as it's very long
                              .map(([key, value]) => (
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