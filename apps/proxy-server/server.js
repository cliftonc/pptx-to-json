import express from 'express';
import cors from 'cors';
import { PowerPointClipboardProcessor } from './PowerPointClipboardProcessor.js';

const app = express();
const PORT = 3001;

// Initialize clipboard processor
const clipboardProcessor = new PowerPointClipboardProcessor();

// Enable CORS for all origins (in production, restrict this)
app.use(cors());
app.use(express.json());

// Proxy endpoint for Microsoft PowerPoint clipboard API
app.get('/api/proxy-powerpoint-clipboard', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    // Use the clipboard processor to handle the request
    const result = await clipboardProcessor.processClipboardUrl(url);
    
    res.json(result);
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    
    // Handle specific error types
    if (error.message.includes('Only Microsoft Office URLs are allowed')) {
      return res.status(403).json({ error: error.message });
    }
    
    if (error.message.includes('Microsoft API error')) {
      const statusMatch = error.message.match(/(\d+)/);
      const status = statusMatch ? parseInt(statusMatch[1]) : 500;
      return res.status(status).json({ 
        error: 'Microsoft API error',
        message: error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Proxy server error', 
      message: error.message,
      stack: error.stack
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxy endpoint: http://localhost:${PORT}/api/proxy-powerpoint-clipboard?url=<MICROSOFT_URL>`);
});