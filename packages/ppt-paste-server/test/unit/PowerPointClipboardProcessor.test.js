/**
 * Unit tests for PowerPointClipboardProcessor
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock node-fetch first
vi.mock('node-fetch', () => ({
  default: vi.fn()
}))

import fetch from 'node-fetch'
import { PowerPointClipboardProcessor } from '../../src/processors/PowerPointClipboardProcessor.ts'

const mockFetch = vi.mocked(fetch)

describe('PowerPointClipboardProcessor', () => {
  let processor

  beforeEach(() => {
    processor = new PowerPointClipboardProcessor(mockFetch)
    // Mock console to avoid noise in test output
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('validateUrl', () => {
    it('should accept valid Microsoft URLs', () => {
      const validUrls = [
        'https://euc-powerpoint.officeapps.live.com/pods/GetClipboardBytes.ashx?Id=test',
        'https://powerpoint.microsoft.com/api/clipboard',
        'https://office.microsoft.com/some-endpoint'
      ]

      validUrls.forEach(url => {
        expect(processor.validateUrl(url)).toBe(true)
      })
    })

    it('should reject non-Microsoft URLs', () => {
      const invalidUrls = [
        'https://evil.com/malicious',
        'https://google.com',
        'https://example.com/officeapps.live.com', // domain spoofing attempt
        'ftp://officeapps.live.com/test',
        null,
        undefined,
        '',
        123
      ]

      invalidUrls.forEach(url => {
        expect(processor.validateUrl(url)).toBe(false)
      })
    })
  })

  describe('parseClipboardBuffer', () => {
    it('should throw error for non-Buffer input', async () => {
      await expect(processor.parseClipboardBuffer('not a buffer')).rejects.toThrow('Input must be a Uint8Array or ArrayBuffer')
      await expect(processor.parseClipboardBuffer(null)).rejects.toThrow('Input must be a Uint8Array or ArrayBuffer')
      await expect(processor.parseClipboardBuffer(123)).rejects.toThrow('Input must be a Uint8Array or ArrayBuffer')
    })

    it('should return empty slides for non-ZIP buffer', async () => {
      // Create a buffer that doesn't have ZIP signature
      const nonZipBuffer = Buffer.from('This is not a ZIP file')
      const result = await processor.parseClipboardBuffer(nonZipBuffer)
      expect(result).toEqual({ slides: [], totalComponents: 0, format: 'unknown' })
    })

    it('should detect ZIP signature correctly', async () => {
      // Create a buffer with ZIP signature (PK\\003\\004)
      const zipBuffer = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00])
      
      // Mock both parsers to avoid actual ZIP processing
      const mockBuffer2Json = vi.spyOn(processor.pptxParser, 'buffer2json')
      mockBuffer2Json.mockResolvedValue({ 'test-file.xml': {} })
      
      const mockParseJson = vi.spyOn(processor.powerPointParser, 'parseJson')
      mockParseJson.mockResolvedValue({
        slides: [{
          components: [
            { id: 'test-1', type: 'shape', content: 'Test Shape' }
          ]
        }],
        totalComponents: 1,
        format: 'powerpoint'
      })
      
      const result = await processor.parseClipboardBuffer(zipBuffer)
      expect(result.slides).toHaveLength(1)
      expect(result.slides[0].components).toHaveLength(1)
      expect(result.slides[0].components[0]).toHaveProperty('type', 'shape')
      expect(result.totalComponents).toBe(1)
      expect(mockBuffer2Json).toHaveBeenCalledWith(zipBuffer)
      expect(mockParseJson).toHaveBeenCalled()
    })

    it('should handle parsing errors gracefully', async () => {
      const zipBuffer = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x00, 0x00])
      
      // Mock buffer2json to succeed but parseJson to fail
      const mockBuffer2Json = vi.spyOn(processor.pptxParser, 'buffer2json')
      mockBuffer2Json.mockResolvedValue({ 'test-file.xml': {} })
      
      const mockParseJson = vi.spyOn(processor.powerPointParser, 'parseJson')
      mockParseJson.mockRejectedValue(new Error('Parsing failed'))
      
      await expect(processor.parseClipboardBuffer(zipBuffer))
        .rejects.toThrow(/Failed to parse PowerPoint data.*Parsing failed/)
    })
  })

  describe('fetchClipboardData', () => {
    beforeEach(() => {
      // Clear all mocks
      mockFetch.mockClear()
    })

    it('should reject invalid URLs', async () => {
      await expect(processor.fetchClipboardData('https://evil.com')).rejects.toThrow('Only Microsoft Office URLs are allowed')
    })

    it('should make correct fetch request for valid URL', async () => {
      const mockUrl = 'https://officeapps.live.com/test'
      const mockBuffer = Buffer.from([0x50, 0x4B, 0x03, 0x04])
      
      const mockResponse = {
        ok: true,
        status: 200,
        headers: {
          get: vi.fn((key) => {
            if (key === 'content-type') return 'application/octet-stream'
            return null
          }),
          entries: vi.fn(() => [['content-type', 'application/octet-stream']].entries())
        },
        arrayBuffer: () => Promise.resolve(mockBuffer.buffer.slice(0, 4)) // Only return the 4 bytes we created
      }
      
      mockFetch.mockResolvedValue(mockResponse)
      
      const result = await processor.fetchClipboardData(mockUrl)
      
      expect(mockFetch).toHaveBeenCalledWith(mockUrl, expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('Mozilla'),
          'Accept': '*/*'
        }),
        credentials: 'omit'
      }))
      
      expect(result).toHaveProperty('buffer')
      expect(result).toHaveProperty('contentType', 'application/octet-stream')
      expect(result).toHaveProperty('size', 4)
      expect(result).toHaveProperty('metadata')
    })

    it('should handle HTTP errors', async () => {
      const mockUrl = 'https://officeapps.live.com/test'
      const mockResponse = {
        ok: false,
        status: 404,
        text: () => Promise.resolve('Not Found'),
        headers: {
          get: vi.fn((key) => {
            if (key === 'content-type') return 'text/html'
            return null
          }),
          entries: vi.fn(() => [['content-type', 'text/html']].entries())
        }
      }
      
      mockFetch.mockResolvedValue(mockResponse)
      
      await expect(processor.fetchClipboardData(mockUrl))
        .rejects.toThrow(/Microsoft API error: 404/)
    })

    it('should handle network errors', async () => {
      const mockUrl = 'https://officeapps.live.com/test'
      mockFetch.mockRejectedValue(new Error('Network error'))
      
      await expect(processor.fetchClipboardData(mockUrl))
        .rejects.toThrow('Network error')
    })
  })

  describe('processClipboardUrl', () => {
    beforeEach(() => {
      // Clear all mocks
      mockFetch.mockClear()
    })
    
    it('should process URL end-to-end successfully', async () => {
      const mockUrl = 'https://officeapps.live.com/test'
      const mockBuffer = Buffer.from([0x50, 0x4B, 0x03, 0x04, 0x14, 0x00]) // ZIP signature
      
      // Mock the parsing method specifically
      const mockComponents = [
        { id: 'test-1', type: 'shape', content: 'Test Shape' },
        { id: 'test-2', type: 'text', content: 'Test Text' }
      ]
      const mockParseResult = {
        slides: [{ components: mockComponents }],
        totalComponents: 2,
        format: 'powerpoint'
      }
      const mockParseClipboardBuffer = vi.spyOn(processor, 'parseClipboardBuffer').mockResolvedValue(mockParseResult)
      
      // Mock fetch to return our buffer
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: {
          get: vi.fn((key) => {
            if (key === 'content-type') return 'application/octet-stream'
            return null
          }),
          entries: vi.fn(() => [['content-type', 'application/octet-stream']].entries())
        },
        arrayBuffer: () => Promise.resolve(mockBuffer.buffer.slice(0, 6)) // Only return the 6 bytes we created
      })
      
      const result = await processor.processClipboardUrl(mockUrl)
      
      expect(mockParseClipboardBuffer).toHaveBeenCalled()
      expect(result).toEqual({
        type: 'powerpoint',
        contentType: 'application/octet-stream',
        size: 6,
        slides: [{
          components: mockComponents
        }],
        slideCount: 1,
        slideDimensions: undefined,
        isPowerPoint: true,
        debug: expect.objectContaining({
          componentCount: 2,
          componentTypes: { shape: 1, text: 1 }
        })
      })
      
      mockParseClipboardBuffer.mockRestore()
    })

    it('should handle processing errors', async () => {
      const mockUrl = 'https://evil.com/test'
      
      await expect(processor.processClipboardUrl(mockUrl))
        .rejects.toThrow('Only Microsoft Office URLs are allowed')
    })
  })

  describe('constructor', () => {
    it('should initialize with PowerPointParser instance', () => {
      const newProcessor = new PowerPointClipboardProcessor()
      expect(newProcessor.powerPointParser).toBeDefined()
      expect(newProcessor.powerPointParser.constructor.name).toBe('PowerPointParser')
    })
  })
})

// Edge case tests
describe('PowerPointClipboardProcessor Edge Cases', () => {
  let processor

  beforeEach(() => {
    processor = new PowerPointClipboardProcessor(mockFetch)
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Buffer validation', () => {
    it('should handle empty buffer', async () => {
      const emptyBuffer = Buffer.alloc(0)
      const result = await processor.parseClipboardBuffer(emptyBuffer)
      expect(result).toEqual({ slides: [], totalComponents: 0, format: 'unknown' })
    })

    it('should handle buffer with partial ZIP signature', async () => {
      const partialZipBuffer = Buffer.from([0x50, 0x4B]) // Only first 2 bytes
      const result = await processor.parseClipboardBuffer(partialZipBuffer)
      expect(result).toEqual({ slides: [], totalComponents: 0, format: 'unknown' })
    })

    it('should handle very large buffer metadata', async () => {
      // Create a large buffer for metadata testing
      const largeBuffer = Buffer.alloc(1000)
      largeBuffer[0] = 0x50 // P
      largeBuffer[1] = 0x4B // K
      largeBuffer[2] = 0x03
      largeBuffer[3] = 0x04
      
      // Fill with some test data
      for (let i = 4; i < 1000; i++) {
        largeBuffer[i] = i % 256
      }
      
      // Mock both the PPTX parser and PowerPoint parser
      vi.spyOn(processor.pptxParser, 'buffer2json').mockResolvedValue({})
      vi.spyOn(processor.powerPointParser, 'parseJson').mockResolvedValue({
        slides: [],
        totalComponents: 0,
        format: 'unknown'
      })
      
      const result = await processor.parseClipboardBuffer(largeBuffer)
      expect(result).toEqual({ slides: [], totalComponents: 0, format: 'unknown' })
    })
  })

  describe('URL validation edge cases', () => {
    it('should handle URLs with query parameters', () => {
      const url = 'https://officeapps.live.com/test?param1=value1&param2=value2'
      expect(processor.validateUrl(url)).toBe(true)
    })

    it('should handle URLs with fragments', () => {
      const url = 'https://officeapps.live.com/test#fragment'
      expect(processor.validateUrl(url)).toBe(true)
    })

    it('should reject URLs with suspicious domains', () => {
      const suspiciousUrls = [
        'https://officeapps-live-com.evil.com/test', // Should be rejected - subdomain spoofing
        'https://evil.com/microsoft.com/test',        // Should be rejected - path spoofing  
        'https://microsoftcom.evil.com/test'          // Should be rejected - domain spoofing
      ]
      
      suspiciousUrls.forEach((url, index) => {
        const result = processor.validateUrl(url)
        // Testing suspicious URL
        expect(result).toBe(false)
      })
    })
  })
})