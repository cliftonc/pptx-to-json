import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PowerPointParser } from './parsers/PowerPointParser.js';

const app = express();
const PORT = 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize PowerPoint parser
const powerPointParser = new PowerPointParser();

// Parse PowerPoint components using the new parser system
const parsePowerPointComponents = async (buffer) => {
  try {
    console.log('🎨 Parsing PowerPoint with new parser system...');
    const components = await powerPointParser.parseBuffer(buffer);
    console.log('✅ PowerPoint parsing complete:', components.length, 'components found');
    return components;
  } catch (error) {
    console.error('❌ PowerPoint parsing failed:', error);
    return [];
  }
};

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
    
    // Validate that it's a Microsoft PowerPoint URL
    if (!url.includes('officeapps.live.com') && !url.includes('microsoft.com')) {
      return res.status(403).json({ error: 'Only Microsoft Office URLs are allowed' });
    }
    
    console.log('🔗 Proxying request to:', url);
    
    // Make the request to Microsoft's API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      // Don't include credentials since we don't have them
      credentials: 'omit'
    });
    
    console.log('📦 Response status:', response.status);
    console.log('📦 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return res.status(response.status).json({ 
        error: 'Microsoft API error',
        status: response.status,
        message: errorText,
        headers: Object.fromEntries(response.headers.entries())
      });
    }
    
    // Handle different content types
    if (contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log('📄 JSON response received');
      res.json({
        type: 'json',
        contentType,
        data: jsonData
      });
    } else if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
      const xmlData = await response.text();
      console.log('📄 XML response received, length:', xmlData.length);
      res.json({
        type: 'xml',
        contentType,
        data: xmlData,
        preview: xmlData.substring(0, 1000)
      });
    } else if (contentType.includes('text/')) {
      const textData = await response.text();
      console.log('📄 Text response received, length:', textData.length);
      res.json({
        type: 'text',
        contentType,
        data: textData,
        preview: textData.substring(0, 1000)
      });
    } else {
      // Handle binary data
      const buffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      
      console.log('🔧 Binary response received, size:', buffer.byteLength);
      
      // Convert first 200 bytes to hex for inspection
      const hexPreview = Array.from(uint8Array.slice(0, 200))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join(' ');
      
      // Try to detect if it's text-like
      const textPreview = String.fromCharCode(...uint8Array.slice(0, 200))
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '�'); // Replace control chars
      
      // Convert to base64 for transmission
      const base64Data = Buffer.from(buffer).toString('base64');
      
      console.log('🔧 Hex preview:', hexPreview.substring(0, 100));
      console.log('🔧 Text preview:', textPreview.substring(0, 100));
      
      // Check if it's a ZIP file (Office Open XML) and parse with new system
      let powerPointComponents = [];
      
      if (uint8Array[0] === 0x50 && uint8Array[1] === 0x4B && uint8Array[2] === 0x03 && uint8Array[3] === 0x04) {
        console.log('📦 Detected ZIP file (Office Open XML)! Using new parser...');
        try {
          powerPointComponents = await parsePowerPointComponents(Buffer.from(buffer));
        } catch (parseError) {
          console.warn('❌ PowerPoint parsing failed:', parseError.message);
        }
      }
      
      res.json({
        type: 'powerpoint',
        contentType,
        size: buffer.byteLength,
        components: powerPointComponents,
        isPowerPoint: powerPointComponents.length > 0,
        // Keep some binary info for debugging
        debug: {
          hexPreview: hexPreview.substring(0, 100),
          textPreview: textPreview.substring(0, 100),
          componentCount: powerPointComponents.length,
          componentTypes: powerPointComponents.reduce((acc, comp) => {
            acc[comp.type] = (acc[comp.type] || 0) + 1;
            return acc;
          }, {})
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
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