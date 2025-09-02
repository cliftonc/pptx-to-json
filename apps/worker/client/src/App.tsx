import { useState } from 'react'
import { ClipboardParser, type ParsedContent } from 'ppt-paste-parser'
import TldrawCanvas from './components/TldrawCanvas'
import RawDataPage from './RawDataPage'
import LoadingScreen from './components/LoadingScreen'

import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState<'main' | 'raw'>('main')
  const [structuredData, setStructuredData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [loadingProgress, setLoadingProgress] = useState('')


  const handleStructuredParsed = (data: ParsedContent) => {
    setIsLoading(false);
    setLoadingMessage('');
    setLoadingProgress('');
    
    // Calculate total components and types from all slides
    let totalComponents = 0;
    const componentsByType: Record<string, number> = {};
    
    data.slides?.forEach(slide => {
      totalComponents += slide.components.length;
      slide.components.forEach(comp => {
        componentsByType[comp.type] = (componentsByType[comp.type] || 0) + 1;
      });
    });
    
    if (data.slides && data.slides.length > 0 && totalComponents > 0) {
      // We have parsed PowerPoint slides from the server!
      setStructuredData({
        totalComponents,
        componentsByType,
        slides: data.slides,
        slideDimensions: data.slideDimensions,
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

  const handleLoadingStart = (message: string, progress?: string) => {
    setIsLoading(true);
    setLoadingMessage(message);
    setLoadingProgress(progress || '');
  };

  const handleLoadingProgress = (progress: string) => {
    setLoadingProgress(progress);
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

  if (currentPage === 'raw') {
    return <RawDataPage />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left Column - Existing UI */}
      <div style={{ 
        width: '25%', 
        padding: '15px', 
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
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <a
                href="/presentation4.pptx"
                download
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#218838';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#28a745';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                📄 Sample PPTX
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
          
          
          {/* Clipboard Parser */}
          <ClipboardParser 
            onParse={handleStructuredParsed}
            placeholder="Paste PowerPoint shapes, text, or images here..."
            onLoadingStart={handleLoadingStart}
            onLoadingProgress={handleLoadingProgress}
            onUploadStart={() => handleLoadingStart('Uploading PowerPoint File', 'Preparing file upload...')}
            onPasteStart={() => handleLoadingStart('Processing PowerPoint Content', 'Analyzing clipboard data...')}
          />
          
          {/* Component Support Information */}
          <div style={{ marginTop: '20px', fontSize: '14px', textAlign: 'left' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
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
                  <li><strong>📊 Tables:</strong> Rich text tables with headers and data cells</li>
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
                  {structuredData.slides && structuredData.slides.length > 0 && (
                    <div><strong>📄 Slides:</strong> {structuredData.slides.length}</div>
                  )}
                  {Object.entries(structuredData.componentsByType).map(([type, count]) => (
                    <div key={type}>
                      <strong>{getTypeIcon(type) as string} {type}:</strong> {count as number}
                    </div>
                  ))}
                </div>
                
                {/* Slides Information */}
                {structuredData.slides && structuredData.slides.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4>📄 Slides Structure:</h4>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {structuredData.slides.map((slide: any, index: number) => (
                        <div key={`slide-${slide.slideNumber || slide.slideIndex || index}`} style={{
                          padding: '10px',
                          backgroundColor: '#e3f2fd',
                          border: '1px solid #2196f3',
                          borderRadius: '6px',
                          minWidth: '120px',
                          textAlign: 'center'
                        }}>
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                            {slide.metadata?.name || `Slide ${slide.slideNumber}`}
                          </div>
                          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                            {slide.components.length} components
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
      <div style={{ width: '75%', height: '100%' }}>
        <TldrawCanvas 
          components={[]} // No longer used, components are in slides
          slides={structuredData?.slides || []}
          slideDimensions={structuredData?.slideDimensions} 
        />
      </div>

      {/* Full-screen loading overlay */}
      <LoadingScreen 
        show={isLoading}
        message={loadingMessage}
        progress={loadingProgress}
      />
    </div>
  )
}

export default App