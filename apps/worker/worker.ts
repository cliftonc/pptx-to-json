import { Hono } from 'hono';
import { PowerPointClipboardProcessor } from 'ppt-paste-server';
import type { Context } from 'hono';

// Cloudflare Worker environment types
interface R2Bucket { put(key: string, value: ArrayBuffer | Uint8Array | string, options?: any): Promise<any>; get(key: string): Promise<any>; head?(key: string): Promise<any>; }
interface Fetcher { fetch(input: RequestInfo | URL | string, init?: RequestInit): Promise<Response>; }
interface KVNamespace { get(key: string): Promise<string | null>; put(key: string, value: string, options?: any): Promise<void>; }

interface Env {
  PPTX_STORAGE: R2Bucket;
  ASSETS: Fetcher;
  RATE_LIMIT_KV: KVNamespace;
}

// Type for Hono context with our environment
type HonoContext = Context<{ Bindings: Env }>;

const app = new Hono<{ Bindings: Env }>();

// Simple sliding window rate limiter using KV
async function checkRateLimit(kv: KVNamespace, key: string, limit: number, windowSeconds: number = 60): Promise<{ success: boolean; remaining: number }> {
  try {
    const now = Date.now();
    const windowStart = now - (windowSeconds * 1000);
    
    // Get existing timestamps for this key
    const data = await kv.get(key);
    let timestamps: number[] = [];
    
    if (data) {
      timestamps = JSON.parse(data);
      // Remove timestamps outside the current window
      timestamps = timestamps.filter(ts => ts > windowStart);
    }
    
    // Check if we've exceeded the limit
    if (timestamps.length >= limit) {
      return { success: false, remaining: 0 };
    }
    
    // Add current timestamp
    timestamps.push(now);
    
    // Store updated timestamps with TTL (expire after window + buffer)
    await kv.put(key, JSON.stringify(timestamps), { 
      expirationTtl: windowSeconds + 60 
    });
    
    return { success: true, remaining: limit - timestamps.length };
    
  } catch (error) {
    // If KV fails, allow the request (graceful degradation)
    console.warn('Rate limiter KV error:', error);
    return { success: true, remaining: limit };
  }
}

// Rate limiting middleware factory
const createRateLimitMiddleware = (limit: number, windowSeconds: number = 60) => {
  return async (c: HonoContext, next: () => Promise<void>) => {
    // Skip rate limiting if KV is not available (local development)
    if (!c.env.RATE_LIMIT_KV) {
      await next();
      return;
    }
    
    // Generate rate limit key using IP and endpoint
    const ip = c.req.header('cf-connecting-ip') || 'unknown';
    const endpoint = new URL(c.req.url).pathname;
    const key = `rate_limit:${ip}:${endpoint}`;
    
    const result = await checkRateLimit(c.env.RATE_LIMIT_KV, key, limit, windowSeconds);
    
    if (!result.success) {
      return c.json(
        { 
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Limit: ${limit} requests per ${windowSeconds} seconds.`,
          retryAfter: windowSeconds
        }, 
        429,
        { 
          'Retry-After': windowSeconds.toString(),
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString()
        }
      );
    }
    
    // Add rate limit headers to successful requests
    c.res.headers.set('X-RateLimit-Limit', limit.toString());
    c.res.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    
    await next();
  };
};

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
  slideUrl?: string; // New field for shareable URL
}


interface ErrorResponse {
  error: string;
  message?: string;
  stack?: string;
}

// Upload PPTX file endpoint
app.post('/api/upload-pptx', createRateLimitMiddleware(10, 60), async (c: HonoContext) => {
  try {
    console.log('📤 Upload PPTX started');
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('❌ No file provided');
      return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    console.log('📄 File received:', file.name, 'Size:', file.size);
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.pptx')) {
      console.log('❌ Invalid file type:', file.name);
      return new Response(JSON.stringify({ error: 'Only PPTX files are allowed' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Generate unique file ID
    const fileId = generateFileId();
    const fileName = `${fileId}.pptx`;
    console.log('🆔 Generated fileId:', fileId, 'fileName:', fileName);
    
    // Get file buffer
    const buffer = await file.arrayBuffer();
    console.log('💾 File buffer created, size:', buffer.byteLength);
    
    // Store in R2
    console.log('☁️ Storing in R2...');
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
    console.log('✅ File saved to R2:', fileName);
    
    const response: UploadResponse = {
      success: true,
      fileId,
      fileName: file.name,
      size: buffer.byteLength,
      processUrl: `/api/process-pptx/${fileId}`,
      slideUrl: `/slides/${fileId}` // Add shareable slide URL
    };
    
    console.log('📦 Upload response:', response);
    return c.json(response);
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    return new Response(JSON.stringify({ 
      error: 'Upload failed', 
      message: (error as Error).message 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});

// Process uploaded PPTX file endpoint
app.get('/api/process-pptx/:fileId', createRateLimitMiddleware(50, 60), async (c: HonoContext) => {
  try {
    const fileId = c.req.param('fileId');
    const debug = c.req.query('debug') === 'true';
    
    console.log('🔄 Processing PPTX request for fileId:', fileId);
    
    if (!fileId) {
      console.log('❌ No fileId provided');
      return new Response(JSON.stringify({ error: 'File ID is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    const fileName = `${fileId}.pptx`;
    console.log('📁 Looking for file:', fileName);
    
    // Retrieve file from R2
    const object = await c.env.PPTX_STORAGE.get(fileName);
    console.log('☁️ R2 get result:', object ? 'Found' : 'Not found');
    
    if (!object) {
      console.log('❌ File not found in R2:', fileName);
      return new Response(JSON.stringify({ error: 'File not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
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
    
    // Get file metadata
    const metadata = {
      originalName: object.customMetadata?.originalName || 'Unknown',
      uploadedAt: object.customMetadata?.uploadedAt,
      size: buffer.byteLength
    };
    
    // Just return what we got with minimal additions
    const response = {
      ...result,
      type: 'powerpoint',
      source: 'uploaded_file', 
      fileId,
      metadata,
      slideCount: result.slides.length,
      isPowerPoint: result.totalComponents > 0
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
app.get('/api/proxy-powerpoint-clipboard', createRateLimitMiddleware(50, 60), async (c: HonoContext) => {
  try {
    const url = c.req.query('url');
    const debug = c.req.query('debug') === 'true';
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL parameter is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
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
      return new Response(JSON.stringify({ error: (error as Error).message }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }
    
    if ((error as Error).message.includes('Microsoft API error')) {
      const statusMatch = (error as Error).message.match(/(\d+)/);
      const status = statusMatch ? parseInt(statusMatch[1]) : 500;
      return new Response(JSON.stringify({ 
        error: 'Microsoft API error',
        message: (error as Error).message
      }), { status, headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify({ 
      error: 'Proxy server error', 
      message: (error as Error).message,
      stack: (error as Error).stack
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});

// Save TLDraw state for a slide
app.post('/api/slides/:id/state', createRateLimitMiddleware(50, 60), async (c: HonoContext) => {
  try {
    const slideId = c.req.param('id');
    
    if (!slideId) {
      return c.json({ error: 'Slide ID is required' }, 400);
    }
    
    // Get the TLDraw snapshot from request body
    const body = await c.req.json();
    const { snapshot } = body;
    
    if (!snapshot) {
      return c.json({ error: 'Snapshot data is required' }, 400);
    }
    
    // Store the snapshot in R2
    const stateKey = `slides/${slideId}/state.json`;
    
    await c.env.PPTX_STORAGE.put(stateKey, JSON.stringify({
      snapshot,
      savedAt: new Date().toISOString(),
      slideId
    }), {
      httpMetadata: {
        contentType: 'application/json'
      },
      customMetadata: {
        slideId,
        savedAt: new Date().toISOString()
      }
    });
    
    return c.json({
      success: true,
      slideId,
      shareUrl: `/slides/${slideId}`,
      savedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Save state error:', error);
    return c.json({ 
      error: 'Failed to save slide state',
      message: (error as Error).message 
    }, 500);
  }
});

// Load TLDraw state for a slide
app.get('/api/slides/:id/state', createRateLimitMiddleware(50, 60), async (c: HonoContext) => {
  try {
    const slideId = c.req.param('id');
    
    if (!slideId) {
      return c.json({ error: 'Slide ID is required' }, 400);
    }
    
    const stateKey = `slides/${slideId}/state.json`;
    
    // Try to retrieve the state from R2
    const object = await c.env.PPTX_STORAGE.get(stateKey);
    
    if (!object) {
      return c.json({ error: 'Slide not found' }, 404);
    }
    
    const stateData = await object.json() as any;
    
    return c.json({
      success: true,
      slideId,
      snapshot: stateData.snapshot,
      savedAt: stateData.savedAt
    });
    
  } catch (error) {
    console.error('❌ Load state error:', error);
    return c.json({ 
      error: 'Failed to load slide state',
      message: (error as Error).message 
    }, 500);
  }
});

// Image serving endpoint from R2
app.get('/api/images/:filename', async (c: HonoContext) => {
  try {
    const filename = c.req.param('filename');
    
    if (!filename) {
      return new Response(JSON.stringify({ error: 'Filename is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Validate filename format (hash.extension)
    if (!/^[a-f0-9]{64}\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(filename)) {
      return new Response(JSON.stringify({ error: 'Invalid filename format' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
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
    return new Response(JSON.stringify({ 
      error: 'Failed to serve image', 
      message: (error as Error).message 
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
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
console.log('💾 Save State API: /api/slides/:id/state (POST)');
console.log('📥 Load State API: /api/slides/:id/state (GET)');
console.log('🖼️ Images API: /api/images/:filename');
console.log('🌐 Web app available at root /');
console.log('🔗 Slides available at /slides/:id');

export default app;