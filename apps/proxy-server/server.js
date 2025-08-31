import { Hono } from 'hono';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';
import { PowerPointClipboardProcessor } from './PowerPointClipboardProcessor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = new Hono();
const PORT = process.env.PORT || 3001;

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


// Catch-all handler: send back React app for any non-API routes
app.get('*', (c) => {
  try {
    const indexPath = path.join(__dirname, 'public', 'index.html');
    const html = readFileSync(indexPath, 'utf8');
    return c.html(html);
  } catch (error) {
    return c.text('Demo app not built. Run "npm run build" first.', 404);
  }
});

// Import Node.js serve for Hono
import { serve } from '@hono/node-server';

// Start the server
serve({
  fetch: app.fetch,
  port: PORT,
}, (info) => {
  console.log(`🚀 Combined server running on http://localhost:${info.port}`);
  console.log(`📡 API endpoint: http://localhost:${info.port}/api/proxy-powerpoint-clipboard?url=<MICROSOFT_URL>`);
  console.log(`🌐 Web app available at: http://localhost:${info.port}`);
});