import { Hono } from 'hono';
import { PowerPointClipboardProcessor } from 'ppt-paste-server';

const app = new Hono();

// Initialize clipboard processor with properly bound fetch
const clipboardProcessor = new PowerPointClipboardProcessor(fetch.bind(globalThis));

// Generate a unique file ID using crypto
const generateFileId = () => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Upload PPTX file endpoint
app.post('/api/upload-pptx', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      return c.json({ error: 'Only PPTX files are allowed' }, 400);
    }
    
    // Generate unique file ID
    const fileId = generateFileId();
    const fileName = `${fileId}.pptx`;
    
    // Get file buffer
    const buffer = await file.arrayBuffer();
    
    // Store in R2
    await c.env.PPTX_STORAGE.put(fileName, buffer, {
      httpMetadata: {
        contentType: file.type || 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      },
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
        size: buffer.byteLength.toString()
      }
    });
    
    return c.json({
      success: true,
      fileId,
      fileName: file.name,
      size: buffer.byteLength,
      processUrl: `/api/process-pptx/${fileId}`
    });
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    return c.json({ 
      error: 'Upload failed', 
      message: error.message 
    }, 500);
  }
});

// Process uploaded PPTX file endpoint
app.get('/api/process-pptx/:fileId', async (c) => {
  try {
    const fileId = c.req.param('fileId');
    const debug = c.req.query('debug') === 'true';
    const returnSlides = c.req.query('returnSlides') === 'true';
    
    if (!fileId) {
      return c.json({ error: 'File ID is required' }, 400);
    }
    
    const fileName = `${fileId}.pptx`;
    
    // Retrieve file from R2
    const object = await c.env.PPTX_STORAGE.get(fileName);
    
    if (!object) {
      return c.json({ error: 'File not found' }, 404);
    }
    
    // Get file buffer
    const buffer = await object.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    if (debug) {
      console.log('📦 Processing uploaded PPTX file:', fileName);
      console.log('📦 File size:', buffer.byteLength, 'bytes');
      console.log('📦 Return slides:', returnSlides);
    }
    
    // Always use slides structure now
    const result = await clipboardProcessor.parseClipboardBuffer(uint8Array, { debug, returnSlides: true });
    
    const slides = result.slides;
    let totalComponents = 0;
    let componentTypes = {};
    
    // Calculate component type statistics from all slides
    slides.forEach(slide => {
      totalComponents += slide.components.length;
      slide.components.forEach(comp => {
        componentTypes[comp.type] = (componentTypes[comp.type] || 0) + 1;
      });
    });
    
    // Get file metadata
    const metadata = {
      originalName: object.customMetadata?.originalName || 'Unknown',
      uploadedAt: object.customMetadata?.uploadedAt,
      size: buffer.byteLength
    };
    
    const response = {
      type: 'powerpoint',
      source: 'uploaded_file',
      fileId,
      metadata,
      slides: slides,
      slideCount: slides.length,
      isPowerPoint: totalComponents > 0,
      debug: {
        componentCount: totalComponents,
        componentTypes,
        slideCount: slides.length
      }
    };
    
    return c.json(response);
    
  } catch (error) {
    console.error('❌ Processing error:', error);
    return c.json({ 
      error: 'Processing failed', 
      message: error.message,
      stack: error.stack
    }, 500);
  }
});

// Proxy endpoint for Microsoft PowerPoint clipboard API
app.get('/api/proxy-powerpoint-clipboard', async (c) => {
  try {
    const url = c.req.query('url');
    const debug = c.req.query('debug') === 'true';
    const returnSlides = c.req.query('returnSlides') === 'true';
    
    if (!url) {
      return c.json({ error: 'URL parameter is required' }, 400);
    }
    
    if (debug) {
      console.log('🔗 Proxying PowerPoint clipboard URL with returnSlides:', returnSlides);
    }
    
    // Always use slides structure now
    const result = await clipboardProcessor.processClipboardUrl(url, { debug, returnSlides: true });
    
    return c.json(result);
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    
    // Handle specific error types
    if (error.message.includes('Only Microsoft Office URLs are allowed')) {
      return c.json({ error: error.message }, 403);
    }
    
    if (error.message.includes('Microsoft API error')) {
      const statusMatch = error.message.match(/(\d+)/);
      const status = statusMatch ? parseInt(statusMatch[1]) : 500;
      return c.json({ 
        error: 'Microsoft API error',
        message: error.message
      }, status);
    }
    
    return c.json({ 
      error: 'Proxy server error', 
      message: error.message,
      stack: error.stack
    }, 500);
  }
});

// Serve static files
app.get('/*', async (c) => {
  try {
    // Try to serve static files from the assets binding
    return c.env.ASSETS.fetch(c.req.url);
  } catch (error) {
    // Fallback to index.html for SPA routing
    try {
      const response = await c.env.ASSETS.fetch(new URL('/index.html', c.req.url).href);
      return new Response(response.body, {
        ...response,
        headers: {
          ...response.headers,
          'content-type': 'text/html'
        }
      });
    } catch (fallbackError) {
      return c.text('Not Found', 404);
    }
  }
});

console.log('🚀 PPT Paste Worker initialized');
console.log('📡 Clipboard API: /api/proxy-powerpoint-clipboard?url=<MICROSOFT_URL>');
console.log('📤 Upload API: /api/upload-pptx (POST with file)');
console.log('🔄 Process API: /api/process-pptx/:fileId');
console.log('🌐 Web app available at root /');

export default app;