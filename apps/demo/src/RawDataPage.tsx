import { useState } from 'react'

function RawDataPage() {
  const [rawData, setRawData] = useState<string>('')
  const [url, setUrl] = useState<string>('')

  const handlePaste = async (e: React.ClipboardEvent) => {
    const clipboardData = e.clipboardData
    const types = Array.from(clipboardData.types)
    
    let formatData: Record<string, string> = {}
    
    // Get all available formats using the same method as ClipboardParser
    for (const type of types) {
      try {
        const data = clipboardData.getData(type)
        if (data) {
          formatData[type] = data
        }
      } catch (error) {
        formatData[type] = `Error reading: ${error}`
      }
    }
    
    // Use the same PowerPoint detection logic as ClipboardParser
    const hasPowerPointCloudServiceData = (html: string): boolean => {
      return html.includes('data-clipservice-type') || 
             html.includes('data-clipboardasbytes-url') ||
             html.includes('officeapps.live.com');
    };

    const extractClipboardBytesUrl = (html: string): string | null => {
      const match = html.match(/data-clipboardasbytes-url="([^"]*)"/) || 
                    html.match(/data-clipboardasbytes-url='([^']*)'/) ||
                    html.match(/(https:\/\/[^"'\s]*GetClipboardBytes[^"'\s]*)/);
      return match ? match[1] : null;
    };
    
    // Check for PowerPoint data in HTML format
    let extractedUrl = ''
    let isPowerPoint = false
    const htmlFormat = formatData['text/html']
    
    if (htmlFormat && hasPowerPointCloudServiceData(htmlFormat)) {
      isPowerPoint = true
      const clipboardBytesUrl = extractClipboardBytesUrl(htmlFormat)
      if (clipboardBytesUrl) {
        extractedUrl = clipboardBytesUrl
      }
    }
    
    const output = {
      availableFormats: types,
      formatData,
      isPowerPoint,
      extractedUrl
    }
    
    setRawData(JSON.stringify(output, null, 2))
    setUrl(extractedUrl)
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Back to Main App
        </button>
      </div>

      <h1>Raw Clipboard Data Extractor</h1>
      <p>Paste PowerPoint content below to see raw clipboard data and extract the Microsoft API URL.</p>
      
      <div 
        onPaste={handlePaste}
        style={{
          border: '2px dashed #ccc',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '20px',
          backgroundColor: '#f9f9f9',
          cursor: 'pointer'
        }}
        tabIndex={0}
      >
        Click here and paste PowerPoint content
      </div>

      {url && (
        <div style={{ marginBottom: '20px' }}>
          <h3>🎯 Extracted URL:</h3>
          <div style={{
            padding: '10px',
            backgroundColor: '#d1edff',
            border: '1px solid #b3d7ff',
            borderRadius: '4px',
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}>
            {url}
          </div>
        </div>
      )}

      {rawData && (
        <div>
          <h3>📋 Raw Clipboard Data:</h3>
          <pre style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #ddd',
            padding: '15px',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '600px',
            fontSize: '12px'
          }}>
            {rawData}
          </pre>
        </div>
      )}
    </div>
  )
}

export default RawDataPage