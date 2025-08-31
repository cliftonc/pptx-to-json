import { Hono } from 'hono';
import { PowerPointClipboardProcessor } from './PowerPointClipboardProcessor.js';

const app = new Hono();

// Initialize clipboard processor
const clipboardProcessor = new PowerPointClipboardProcessor();

// Proxy endpoint for Microsoft PowerPoint clipboard API
app.get('/api/proxy-powerpoint-clipboard', async (c) => {
  try {
    const url = c.req.query('url');
    
    if (!url) {
      return c.json({ error: 'URL parameter is required' }, 400);
    }
    
    // Use the clipboard processor to handle the request
    const result = await clipboardProcessor.processClipboardUrl(url);
    
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

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Static files are now handled by Cloudflare's assets binding
// No need for manual serveStatic middleware

// Export the app for Cloudflare Workers
export default app;