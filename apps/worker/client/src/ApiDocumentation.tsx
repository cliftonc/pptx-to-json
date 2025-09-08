import { useNavigate } from 'react-router-dom'

export default function ApiDocumentation() {
  const navigate = useNavigate()

  const codeStyle = {
    backgroundColor: '#1e1e1e',
    border: '1px solid #444',
    borderRadius: '6px',
    padding: '16px',
    fontSize: '13px',
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace',
    overflow: 'auto',
    whiteSpace: 'pre' as const,
    color: '#d4d4d4',
    lineHeight: '1.4',
    textAlign: 'left' as const
  }

  const sectionStyle = {
    marginBottom: '40px',
    padding: '24px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white',
    textAlign: 'left' as const
  }

  const headingStyle = {
    color: '#2c3e50',
    marginTop: '0',
    marginBottom: '16px',
    textAlign: 'left' as const
  }

  const paragraphStyle = {
    color: '#495057',
    lineHeight: '1.6',
    marginBottom: '16px',
    textAlign: 'left' as const
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa'
    }}>
      {/* Left Navigation */}
      <nav style={{
        width: '250px',
        backgroundColor: 'white',
        borderRight: '1px solid #dee2e6',
        padding: '20px',
        position: 'sticky',
        top: '0',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <h3 style={{ marginTop: '0', marginBottom: '20px', color: '#495057' }}>Table of Contents</h3>
        <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
          <li style={{ marginBottom: '10px' }}>
            <a href="#overview" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>Overview</a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="#endpoints" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>API Endpoints</a>
            <ul style={{ listStyle: 'none', padding: '0 0 0 15px', margin: '5px 0 0 0' }}>
              <li style={{ marginBottom: '5px' }}>
                <a href="#upload-pptx" style={{ color: '#6c757d', textDecoration: 'none', fontSize: '13px' }}>1. Upload PPTX</a>
              </li>
              <li style={{ marginBottom: '5px' }}>
                <a href="#process-pptx" style={{ color: '#6c757d', textDecoration: 'none', fontSize: '13px' }}>2. Process PPTX</a>
              </li>
              <li style={{ marginBottom: '5px' }}>
                <a href="#process-clipboard" style={{ color: '#6c757d', textDecoration: 'none', fontSize: '13px' }}>3. Process Copy-Paste</a>
              </li>
            </ul>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="#authentication" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>Authentication & Usage</a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="#errors" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>Error Responses</a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="#self-hosting" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>Self-Hosting</a>
          </li>
          <li style={{ marginBottom: '10px' }}>
            <a href="#contact" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>Contact & Support</a>
          </li>
        </ul>
      </nav>

      {/* Main Content */}
      <div style={{
        flex: '1',
        padding: '20px 40px',
        overflowY: 'auto',
        height: '100vh'
      }}>
      {/* Header with navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px 0',
        borderBottom: '2px solid #dee2e6',
        textAlign: 'left' as const
      }}>
        <h1 style={{
          fontSize: '32px',
          margin: '0',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          PowerPoint Parser API Documentation
        </h1>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#5a6268'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#6c757d'
          }}
        >
          ← Back to App
        </button>
      </div>

      {/* Introduction */}
      <div id="overview" style={sectionStyle}>
        <h2 style={headingStyle}>Overview</h2>
        <p style={paragraphStyle}>
          The PowerPoint Parser API provides programmatic access to parse PowerPoint files and clipboard content.
          This API extracts structured data including text, images, shapes, tables, and positioning information
          from PowerPoint presentations.
        </p>

        <div style={{
          padding: '16px',
          backgroundColor: '#d1edff',
          borderRadius: '6px',
          border: '1px solid #bee5eb',
          marginTop: '16px'
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#0c5460' }}>✅ Supported Components</h4>
          <p style={{ margin: '0', color: '#0c5460', fontSize: '14px' }}>
            Text (with formatting), Images, Shapes, Tables, Videos, Connections, and complete layout positioning
          </p>
        </div>
      </div>

      {/* API Endpoints */}
      <div id="endpoints" style={sectionStyle}>
        <h2 style={headingStyle}>API Endpoints</h2>

        {/* Upload PPTX */}
        <h3 id="upload-pptx" style={{ color: '#28a745', marginTop: '30px' }}>1. Upload PPTX File</h3>
        <p><strong>Endpoint:</strong> <code>POST /api/upload-pptx</code></p>
        <p><strong>Purpose:</strong> Upload a PowerPoint file (.pptx) for processing</p>

        <h4>Request</h4>
        <p><strong>Content-Type:</strong> <code>multipart/form-data</code></p>
        <p><strong>Parameters:</strong></p>
        <ul>
          <li><code>file</code> (required): PPTX file to upload</li>
        </ul>

        <h4>Example - JavaScript</h4>
        <div style={codeStyle}>
{`const formData = new FormData();
formData.append('file', pptxFile);

const response = await fetch('/api/upload-pptx', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('File ID:', result.fileId);
console.log('Process URL:', result.processUrl);`}
        </div>

        <h4>Example - cURL</h4>
        <div style={codeStyle}>
{`curl -X POST "https://your-domain.com/api/upload-pptx" \\
  -F "file=@presentation.pptx"`}
        </div>

        <h4>Response</h4>
        <div style={codeStyle}>
{`{
  "success": true,
  "fileId": "a1b2c3d4e5f6...",
  "fileName": "presentation.pptx",
  "size": 1024000,
  "processUrl": "/api/process-pptx/a1b2c3d4e5f6...",
  "slideUrl": "/slides/a1b2c3d4e5f6..."
}`}
        </div>

        {/* Process PPTX */}
        <h3 id="process-pptx" style={{ color: '#007bff', marginTop: '40px' }}>2. Process PPTX File</h3>
        <p><strong>Endpoint:</strong> <code>GET /api/process-pptx/:fileId</code></p>
        <p><strong>Purpose:</strong> Process an uploaded PPTX file and extract components</p>

        <h4>Parameters</h4>
        <ul>
          <li><code>fileId</code> (path): File ID returned from upload endpoint</li>
          <li><code>debug</code> (query, optional): Set to "true" for debug output</li>
        </ul>

        <h4>Example - JavaScript</h4>
        <div style={codeStyle}>
{`const response = await fetch('/api/process-pptx/a1b2c3d4e5f6');
const data = await response.json();

console.log('Total slides:', data.slides.length);
console.log('Total components:', data.totalComponents);
data.slides.forEach((slide, index) => {
  console.log(\`Slide \${index + 1}: \${slide.components.length} components\`);
});`}
        </div>

        <h4>Example - Python</h4>
        <div style={codeStyle}>
{`import requests

response = requests.get('https://your-domain.com/api/process-pptx/a1b2c3d4e5f6')
data = response.json()

print(f"Total slides: {len(data['slides'])}")
print(f"Total components: {data['totalComponents']}")

for i, slide in enumerate(data['slides']):
    print(f"Slide {i+1}: {len(slide['components'])} components")`}
        </div>

        <h4>Response Structure</h4>
        <div style={codeStyle}>
{`{
  "slides": [
    {
      "slideNumber": 1,
      "components": [
        {
          "id": "component-id",
          "type": "text|image|shape|table|video|connection",
          "position": { "x": 100, "y": 200 },
          "size": { "width": 300, "height": 150 },
          "content": "...", // For text components
          "src": "...",     // For image/video components
          "style": { /* formatting */ }
        }
      ]
    }
  ],
  "totalComponents": 42,
  "slideDimensions": { "width": 9144000, "height": 6858000 },
  "componentsByType": {
    "text": 15,
    "image": 8,
    "shape": 12,
    "table": 5,
    "video": 2
  }
}`}
        </div>

        {/* Process Copy-Paste */}
        <h3 id="process-clipboard" style={{ color: '#dc3545', marginTop: '40px' }}>3. Process Copy-Paste Content</h3>
        <p><strong>Endpoint:</strong> <code>GET /api/proxy-powerpoint-clipboard</code></p>
        <p><strong>Purpose:</strong> Process PowerPoint clipboard content via Microsoft API proxy</p>

        <h4>Parameters</h4>
        <ul>
          <li><code>url</code> (query): Microsoft PowerPoint clipboard URL</li>
          <li><code>debug</code> (query, optional): Set to "true" for debug output</li>
        </ul>

        <h4>Example - JavaScript</h4>
        <div style={codeStyle}>
{`// This endpoint is typically used internally by the client application
// when users paste content from web-based PowerPoint

const clipboardUrl = 'https://...microsoft.com/...'; // From clipboard
const response = await fetch(\`/api/proxy-powerpoint-clipboard?url=\${encodeURIComponent(clipboardUrl)}\`);
const data = await response.json();`}
        </div>

        <p style={{
          padding: '12px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          color: '#856404',
          marginTop: '16px'
        }}>
          <strong>Note:</strong> This endpoint requires Microsoft PowerPoint URLs from web-based PowerPoint clipboard operations.
          It's primarily used internally by the client application.
        </p>
      </div>

      {/* Authentication & Usage */}
      <div id="authentication" style={sectionStyle}>
        <h2>Authentication & Usage</h2>
        <ul style={{ fontSize: '16px', lineHeight: '1.6' }}>
          <li><strong>Authentication:</strong> None required currently</li>
          <li><strong>Rate Limits:</strong> Reasonable use policy - avoid excessive requests</li>
          <li><strong>CORS:</strong> Configured for cross-origin requests</li>
          <li><strong>File Size:</strong> PPTX uploads are limited by your deployment configuration</li>
        </ul>
      </div>

      {/* Error Responses */}
      <div id="errors" style={sectionStyle}>
        <h2>Error Responses</h2>
        <p>All endpoints return JSON error responses with appropriate HTTP status codes:</p>

        <div style={codeStyle}>
{`{
  "error": "Error type",
  "message": "Detailed error message",
  "stack": "..." // Only in debug mode
}`}
        </div>

        <h4>Common HTTP Status Codes</h4>
        <ul>
          <li><code>400</code> - Bad Request (missing parameters, invalid file type)</li>
          <li><code>404</code> - Not Found (file not found, invalid file ID)</li>
          <li><code>500</code> - Internal Server Error (processing failed)</li>
        </ul>
      </div>

      {/* Self-Hosting */}
      <div id="self-hosting" style={sectionStyle}>
        <h2>Self-Hosting</h2>
        <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '16px' }}>
          To use these APIs for your own applications, you can deploy your own instance:
        </p>

        <h4>1. Clone the Repository</h4>
        <div style={codeStyle}>
{`git clone https://github.com/cliftonc/ppt-paste.git
cd ppt-paste`}
        </div>

        <h4>2. Deploy the Worker</h4>
        <div style={codeStyle}>
{`cd apps/worker
pnpm install
pnpm deploy`}
        </div>

        <h4>3. Configure Environment</h4>
        <ul style={{ marginTop: '16px' }}>
          <li>Set up Cloudflare Workers account</li>
          <li>Configure R2 storage bucket for file uploads</li>
          <li>Update <code>wrangler.toml</code> with your settings</li>
        </ul>

        <p style={{
          padding: '16px',
          backgroundColor: '#e2f3ff',
          border: '1px solid #b8daff',
          borderRadius: '6px',
          marginTop: '20px'
        }}>
          <strong>📦 Complete Setup Instructions:</strong> See the
          <a href="https://github.com/cliftonc/ppt-paste" style={{ color: '#0066cc' }}> GitHub repository README</a> for
          detailed deployment and configuration instructions.
        </p>
      </div>

      {/* Contact & Support */}
      <div id="contact" style={sectionStyle}>
        <h2>Contact & Commercial Options</h2>
        <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
          For commercial licensing, custom features, enterprise support, or hosted solutions,
          please contact:
        </p>

        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          border: '2px solid #dee2e6',
          borderRadius: '8px',
          textAlign: 'left' as const,
          marginTop: '16px'
        }}>
          <h4 style={{ margin: '0 0 8px 0' }}>Clifton Cunningham</h4>
          <p style={{ margin: '0', fontSize: '18px' }}>
            <a href="mailto:clifton.cunningham@gmail.com" style={{ color: '#007bff', textDecoration: 'none' }}>
              clifton.cunningham@gmail.com
            </a>
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
