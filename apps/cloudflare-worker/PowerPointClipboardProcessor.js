/**
 * PowerPoint Clipboard Processor
 * 
 * Handles fetching and parsing PowerPoint clipboard data from Microsoft APIs.
 * Extracted from server.js to make it testable.
 */

// fetch is available globally in Cloudflare Workers
import { PowerPointParser } from './parsers/PowerPointParser.js';
import { PPTXParser } from './PPTXParser.js';

export class PowerPointClipboardProcessor {
  constructor() {
    this.powerPointParser = new PowerPointParser();
    this.pptxParser = new PPTXParser();
  }

  /**
   * Validate that the URL is from a trusted Microsoft domain
   * @param {string} url - URL to validate
   * @returns {boolean} - Whether the URL is valid
   */
  validateUrl(url) {
    if (!url || typeof url !== 'string') {
      return false;
    }

    try {
      const urlObj = new URL(url);
      
      // Check for valid Microsoft domains
      const validDomains = [
        'officeapps.live.com',
        'microsoft.com',
        'office.com'
      ];
      
      // Check if hostname exactly matches or is a subdomain of valid domains
      const isValidDomain = validDomains.some(domain => {
        return urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain);
      });
      
      // Additional security checks
      if (!isValidDomain) {
        return false;
      }
      
      // Must be HTTPS
      if (urlObj.protocol !== 'https:') {
        return false;
      }
      
      return true;
      
    } catch (error) {
      // Invalid URL format
      return false;
    }
  }

  /**
   * Fetch clipboard data from Microsoft API
   * @param {string} url - Microsoft API URL
   * @returns {Promise<Object>} - Response object with buffer and metadata
   */
  async fetchClipboardData(url) {
    if (!this.validateUrl(url)) {
      throw new Error('Only Microsoft Office URLs are allowed');
    }

    console.log('🔗 Fetching clipboard data from:', url);
    
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
      credentials: 'omit'
    });

    console.log('📦 Response status:', response.status);
    console.log('📦 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      throw new Error(`Microsoft API error: ${response.status} - ${errorText}`);
    }

    // Get the response as a buffer
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
    
    console.log('🔧 Hex preview:', hexPreview.substring(0, 100));
    console.log('🔧 Text preview:', textPreview.substring(0, 100));

    return {
      buffer: new Uint8Array(buffer),
      contentType,
      size: buffer.byteLength,
      metadata: {
        hexPreview: hexPreview.substring(0, 100),
        textPreview: textPreview.substring(0, 100)
      }
    };
  }

  /**
   * Parse PowerPoint clipboard buffer into components
   * @param {Uint8Array|ArrayBuffer} buffer - PowerPoint clipboard buffer
   * @returns {Promise<Array>} - Array of parsed components
   */
  async parseClipboardBuffer(buffer, { debug = false } = {}) {
    if (!(buffer instanceof Uint8Array) && !(buffer instanceof ArrayBuffer)) {
      throw new Error('Input must be a Uint8Array or ArrayBuffer');
    }

    const uint8Array = new Uint8Array(buffer);
    
    // Check if it's a ZIP file (Office Open XML)
    const isZip = uint8Array[0] === 0x50 && uint8Array[1] === 0x4B && 
                  uint8Array[2] === 0x03 && uint8Array[3] === 0x04;
    
    if (!isZip) {
      console.warn('⚠️ Buffer does not appear to be a ZIP file');
      return [];
    }

    console.log('📦 Detected ZIP file (Office Open XML)! Parsing...');
    
    try {
      // First, parse the PPTX file to JSON using our new parser
      const json = await this.pptxParser.buffer2json(buffer);
      console.log('📦 PowerPoint parsed to JSON, files:', Object.keys(json).length);
      console.log('📦 Files found:', Object.keys(json));
      
      // Debug: Log the actual structure for debugging text/image issues
      const drawingFile = json['clipboard/drawings/drawing1.xml'];
      if (drawingFile) {
        console.log('🐛 DEBUG: Drawing file structure:');
        console.log(JSON.stringify(drawingFile, null, 2));
      }
      
      // Then use the existing PowerPoint parser to extract components
      const components = await this.powerPointParser.parseJson(json);
      console.log('✅ PowerPoint parsing complete:', components.length, 'components found');
      return components;
    } catch (error) {
      console.error('❌ PowerPoint parsing failed:', error);
      throw new Error(`Failed to parse PowerPoint data: ${error.message}`);
    }
  }

  /**
   * Process a PowerPoint clipboard URL - fetch and parse in one step
   * @param {string} url - Microsoft API URL
   * @returns {Promise<Object>} - Processing result with components and metadata
   */
  async processClipboardUrl(url) {
    try {
      // Fetch the data
      const fetchResult = await this.fetchClipboardData(url);
      
      // Parse the buffer
      const components = await this.parseClipboardBuffer(fetchResult.buffer);
      
      // Calculate component type statistics
      const componentTypes = components.reduce((acc, comp) => {
        acc[comp.type] = (acc[comp.type] || 0) + 1;
        return acc;
      }, {});

      return {
        type: 'powerpoint',
        contentType: fetchResult.contentType,
        size: fetchResult.size,
        components,
        isPowerPoint: components.length > 0,
        debug: {
          ...fetchResult.metadata,
          componentCount: components.length,
          componentTypes
        }
      };

    } catch (error) {
      console.error('❌ Processing failed:', error);
      throw error;
    }
  }

  /**
   * Handle different content types from Microsoft API
   * @param {Object} response - Fetch response
   * @returns {Promise<Object>} - Processed response data
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    if (contentType.includes('application/json')) {
      const jsonData = await response.json();
      console.log('📄 JSON response received');
      return {
        type: 'json',
        contentType,
        data: jsonData
      };
    } 
    
    if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
      const xmlData = await response.text();
      console.log('📄 XML response received, length:', xmlData.length);
      return {
        type: 'xml',
        contentType,
        data: xmlData,
        preview: xmlData.substring(0, 1000)
      };
    } 
    
    if (contentType.includes('text/')) {
      const textData = await response.text();
      console.log('📄 Text response received, length:', textData.length);
      return {
        type: 'text',
        contentType,
        data: textData,
        preview: textData.substring(0, 1000)
      };
    }
    
    // Handle binary data (PowerPoint clipboard data)
    return await this.processClipboardUrl(response.url);
  }
}

// Export a default instance for convenience
export const clipboardProcessor = new PowerPointClipboardProcessor();