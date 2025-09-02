import { Hono } from 'hono';
import { PowerPointClipboardProcessor } from 'ppt-paste-server';
import type { Context } from 'hono';

// Cloudflare Worker environment types
interface Env {
  PPTX_STORAGE: R2Bucket;
  ASSETS: Fetcher;
}

// Type for Hono context with our environment
type HonoContext = Context<{ Bindings: Env }>;

const app = new Hono<{ Bindings: Env }>();

// Initialize clipboard processor with properly bound fetch
// Note: R2 storage will be passed per request since it comes from the worker context

// Generate a unique file ID using crypto
const generateFileId = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Types for API responses
interface UploadResponse {
  success: boolean;
  fileId: string;
  fileName: string;
  size: number;
  processUrl: string;
}

interface ProcessResponse {
  type: string;
  source: string;
  fileId: string;
  metadata: {
    originalName: string;
    uploadedAt?: string;
    size: number;
  };
  slides: any[];
  slideCount: number;
  slideDimensions?: {
    width: number;
    height: number;
  };
  isPowerPoint: boolean;
  debug: {
    componentCount: number;
    componentTypes: Record<string, number>;
    slideCount: number;
  };
}

interface ErrorResponse {
  error: string;
  message?: string;
  stack?: string;
}

// Upload PPTX file endpoint
app.post('/api/upload-pptx', async (c: HonoContext) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' } as ErrorResponse, 400);
    }
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      return c.json({ error: 'Only PPTX files are allowed' } as ErrorResponse, 400);
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
    
    const response: UploadResponse = {
      success: true,
      fileId,
      fileName: file.name,
      size: buffer.byteLength,
      processUrl: `/api/process-pptx/${fileId}`
    };
    
    return c.json(response);
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    return c.json({ 
      error: 'Upload failed', 
      message: (error as Error).message 
    } as ErrorResponse, 500);
  }
});

// Process uploaded PPTX file endpoint
app.get('/api/process-pptx/:fileId', async (c: HonoContext) => {
  try {
    const fileId = c.req.param('fileId');
    const debug = c.req.query('debug') === 'true';
    
    if (!fileId) {
      return c.json({ error: 'File ID is required' } as ErrorResponse, 400);
    }
    
    const fileName = `${fileId}.pptx`;
    
    // Retrieve file from R2
    const object = await c.env.PPTX_STORAGE.get(fileName);
    
    if (!object) {
      return c.json({ error: 'File not found' } as ErrorResponse, 404);
    }
    
    // Get file buffer
    const buffer = await object.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    if (debug) {
      console.log('📦 Processing uploaded PPTX file:', fileName);
      console.log('📦 File size:', buffer.byteLength, 'bytes');
    }
    
    // Parse using slides structure with R2 storage
    const clipboardProcessor = new PowerPointClipboardProcessor(fetch.bind(globalThis), c.env.PPTX_STORAGE);
    const result = await clipboardProcessor.parseClipboardBuffer(uint8Array, { debug });
    
    const slides = result.slides;
    const slideDimensions = result.slideDimensions;
    let totalComponents = 0;
    const componentTypes: Record<string, number> = {};
    
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
    
    const response: ProcessResponse = {
      type: 'powerpoint',
      source: 'uploaded_file',
      fileId,
      metadata,
      slides: slides,
      slideCount: slides.length,
      slideDimensions: slideDimensions,
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
      message: (error as Error).message,
      stack: (error as Error).stack
    } as ErrorResponse, 500);
  }
});

// Proxy endpoint for Microsoft PowerPoint clipboard API
app.get('/api/proxy-powerpoint-clipboard', async (c: HonoContext) => {
  try {
    const url = c.req.query('url');
    const debug = c.req.query('debug') === 'true';
    
    if (!url) {
      return c.json({ error: 'URL parameter is required' } as ErrorResponse, 400);
    }
    
    if (debug) {
      console.log('🔗 Proxying PowerPoint clipboard URL');
    }
    
    // Process clipboard URL using slides structure with R2 storage
    const clipboardProcessor = new PowerPointClipboardProcessor(fetch.bind(globalThis), c.env.PPTX_STORAGE);
    const result = await clipboardProcessor.processClipboardUrl(url, { debug });
    
    return c.json(result);
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    
    // Handle specific error types
    if ((error as Error).message.includes('Only Microsoft Office URLs are allowed')) {
      return c.json({ error: (error as Error).message } as ErrorResponse, 403);
    }
    
    if ((error as Error).message.includes('Microsoft API error')) {
      const statusMatch = (error as Error).message.match(/(\d+)/);
      const status = statusMatch ? parseInt(statusMatch[1]) : 500;
      return c.json({ 
        error: 'Microsoft API error',
        message: (error as Error).message
      } as ErrorResponse, status);
    }
    
    return c.json({ 
      error: 'Proxy server error', 
      message: (error as Error).message,
      stack: (error as Error).stack
    } as ErrorResponse, 500);
  }
});

// Image serving endpoint from R2
app.get('/api/images/:filename', async (c: HonoContext) => {
  try {
    const filename = c.req.param('filename');
    
    if (!filename) {
      return c.json({ error: 'Filename is required' } as ErrorResponse, 400);
    }
    
    // Validate filename format (hash.extension)
    if (!/^[a-f0-9]{64}\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(filename)) {
      return c.json({ error: 'Invalid filename format' } as ErrorResponse, 400);
    }
    
    const imagePath = `images/${filename}`;
    
    // Retrieve image from R2
    const object = await c.env.PPTX_STORAGE.get(imagePath);
    
    if (!object) {
      return c.text('Image not found', 404);
    }
    
    // Get the image data and metadata
    const imageData = await object.arrayBuffer();
    const metadata = object.httpMetadata;
    
    // Return the image with appropriate headers
    return new Response(imageData, {
      headers: {
        'Content-Type': metadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000', // 1 year cache
        'ETag': `"${filename}"`,
        'Content-Length': imageData.byteLength.toString()
      }
    });
    
  } catch (error) {
    console.error('❌ Image serving error:', error);
    return c.json({ 
      error: 'Failed to serve image', 
      message: (error as Error).message 
    } as ErrorResponse, 500);
  }
});

// Serve static files
app.get('/*', async (c: HonoContext) => {
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
console.log('🖼️ Images API: /api/images/:filename');
console.log('🌐 Web app available at root /');

export default app;