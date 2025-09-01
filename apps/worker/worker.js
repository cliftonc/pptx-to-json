import { Hono } from 'hono';
import { PowerPointClipboardProcessor } from 'ppt-paste-server';

const app = new Hono();

// Initialize clipboard processor with properly bound fetch
const clipboardProcessor = new PowerPointClipboardProcessor(fetch.bind(globalThis));

// Proxy endpoint for Microsoft PowerPoint clipboard API
app.get('/api/proxy-powerpoint-clipboard', async (c) => {
  try {
    const url = c.req.query('url');
    const debug = c.req.query('debug') === 'true';
    
    if (!url) {
      return c.json({ error: 'URL parameter is required' }, 400);
    }
    
    // Use the clipboard processor to handle the request
    const result = await clipboardProcessor.processClipboardUrl(url, { debug });
    
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
console.log('📡 API endpoint: /api/proxy-powerpoint-clipboard?url=<MICROSOFT_URL>');
console.log('🌐 Web app available at root /');

export default app;