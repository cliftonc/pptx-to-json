/**
 * Image component parser for PowerPoint shapes containing images
 */

import { BaseParser, isBufferLike, bufferFrom } from './BaseParser.js';

export class ImageParser extends BaseParser {

  /**
   * Parse image component from normalized data (works for both PPTX and clipboard)
   * @param {Object} imageComponent - Normalized image component
   * @param {Object} relationships - Relationship data
   * @param {Object} mediaFiles - Media files
   * @param {number} componentIndex - Component index
   * @param {number} slideIndex - Slide index
   * @returns {Promise<Object>} - Parsed image component
   */
  static async parseFromNormalized(imageComponent, relationships, mediaFiles, componentIndex, slideIndex) {
    const { data, spPr, nvPicPr, blipFill, namespace } = imageComponent;
    
    if (!spPr || !blipFill) {
      throw new Error('No spPr or blipFill found in normalized image component');
    }

    // Extract positioning from spPr (namespace-agnostic)
    const xfrm = ImageParser.safeGet(spPr, 'a:xfrm');
    const transform = ImageParser.parseTransform(xfrm);

    // Extract component info from nvPicPr
    const cNvPr = ImageParser.safeGet(nvPicPr, 'a:cNvPr') || ImageParser.safeGet(nvPicPr, 'p:cNvPr');
    const componentName = ImageParser.safeGet(cNvPr, '$name') || `image-${componentIndex}`;
    const description = ImageParser.safeGet(cNvPr, '$descr') || '';

    // Extract image reference from blipFill
    const blip = ImageParser.safeGet(blipFill, 'a:blip');
    const relationshipId = ImageParser.safeGet(blip, '$r:embed') || ImageParser.safeGet(blip, '$xmlns:r');

    // Find the actual image file using relationships
    let imageDataUrl = null;
    let imageFormat = 'unknown';
    let imageSize = 0;

    if (relationshipId && relationships && mediaFiles) {
      // This would require relationship resolution - simplified for now
      const mediaFile = ImageParser.findMediaFile(relationshipId, relationships, mediaFiles);
      if (mediaFile) {
        imageDataUrl = ImageParser.createDataUrl(mediaFile.data, mediaFile.type);
        imageFormat = mediaFile.type;
        imageSize = mediaFile.size;
      }
    }

    // Parse image effects using existing method
    const effects = ImageParser.parseImageEffects(blipFill);

    return {
      id: componentName,
      type: 'image',
      content: description || componentName,
      x: transform.x,
      y: transform.y,
      width: transform.width,
      height: transform.height,
      rotation: transform.rotation || 0,
      slideIndex,
      style: {
        opacity: 1,
        effects: effects.length > 0 ? effects : null
      },
      metadata: {
        namespace,
        name: componentName,
        description,
        relationshipId,
        imageUrl: imageDataUrl, // This is where the old implementation put it
        imageType: imageFormat,
        imageSize: imageSize,
        originalFormat: 'normalized',
        hasEffects: effects.length > 0
      }
    };
  }

  /**
   * Find media file from relationships and mediaFiles
   */
  static findMediaFile(relationshipId, relationships, mediaFiles) {
    // Simplified - would need proper relationship resolution
    for (const [path, data] of Object.entries(mediaFiles)) {
      if (path.includes('image')) {
        return {
          data,
          type: this.getImageTypeFromPath(path),
          size: data.length || 0
        };
      }
    }
    return null;
  }

  /**
   * Get image type from file path
   */
  static getImageTypeFromPath(path) {
    const ext = path.toLowerCase().split('.').pop();
    switch (ext) {
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'gif': return 'image/gif';
      case 'svg': return 'image/svg+xml';
      default: return 'image/unknown';
    }
  }

  /**
   * Create data URL from binary data
   */
  static createDataUrl(data, type) {
    if (!data) return null;
    
    try {
      // Convert buffer to base64
      const base64 = Buffer.from(data).toString('base64');
      return `data:${type};base64,${base64}`;
    } catch (error) {
      console.warn('Failed to create data URL:', error);
      return null;
    }
  }



  /**
   * Get image information from relationship and media data
   * @param {string} rId - Relationship ID
   * @param {Object} relationships - Relationship data
   * @param {Object} mediaFiles - Media files data
   * @returns {Object} image information
   */
  static getImageInfo(rId, relationships, mediaFiles) {
    if (!rId) {
      return {
        url: null,
        type: 'unknown',
        size: 0,
        dimensions: null
      };
    }

    // Find relationship for this image (handles both slide and clipboard formats)
    const relFile = Object.keys(relationships).find(key => 
      key.includes('_rels') && (key.includes('slide') || key.includes('drawing'))
    );
    
    if (relFile && relationships[relFile]) {
      const rels = this.safeGet(relationships[relFile], 'Relationships.Relationship', []);
      const rel = rels.find(r => r.$Id === rId);
      
      if (rel) {
        const target = rel.$Target;
        // Handle clipboard format: ../media/image1.png becomes clipboard/media/image1.png
        // Handle regular format: media/image1.png becomes ppt/media/image1.png
        let mediaPath;
        if (target.startsWith('../')) {
          mediaPath = `clipboard/${target.slice(3)}`;
        } else {
          mediaPath = target.startsWith('media/') ? `ppt/${target}` : target;
        }
        
        // Look for the media file
        const mediaFile = mediaFiles[mediaPath];
        if (mediaFile) {
          return {
            url: this.createDataUrl(mediaFile, target),
            type: this.getImageType(target),
            size: mediaFile.length || 0,
            dimensions: this.getImageDimensions(mediaFile) // Would need image parsing
          };
        }
      }
    }

    return {
      url: null,
      type: 'unknown',
      size: 0,
      dimensions: null
    };
  }

  /**
   * Create data URL from media file buffer
   * @param {Buffer|Uint8Array} mediaFile - Image file buffer
   * @param {string} filename - Original filename
   * @returns {string} data URL or placeholder
   */
  static createDataUrl(mediaFile, filename) {
    if (!mediaFile || !(mediaFile instanceof Uint8Array)) {
      console.log(`⚠️ Image data not available, using placeholder SVG for ${filename}`);
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZTwvdGV4dD48L3N2Zz4=';
    }

    const type = this.getImageType(filename);
    const mimeType = this.getMimeType(type);
    const base64 = this.uint8ArrayToBase64(mediaFile);
    
    return `data:${mimeType};base64,${base64}`;
  }

  /**
   * Convert Uint8Array to base64 string (Cloudflare Workers compatible)
   * @param {Uint8Array} uint8Array - Binary data
   * @returns {string} base64 string
   */
  static uint8ArrayToBase64(uint8Array) {
    let binary = '';
    for (let i = 0; i < uint8Array.byteLength; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
  }

  /**
   * Get image type from filename
   * @param {string} filename - Image filename
   * @returns {string} image type
   */
  static getImageType(filename) {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext || 'unknown';
  }

  /**
   * Get MIME type from image type
   * @param {string} type - Image type
   * @returns {string} MIME type
   */
  static getMimeType(type) {
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'bmp': 'image/bmp',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'tiff': 'image/tiff',
      'tif': 'image/tiff'
    };
    
    return mimeTypes[type] || 'application/octet-stream';
  }

  /**
   * Parse image effects from blip fill
   * @param {Object} blipFill - Blip fill properties
   * @returns {Object} effects information
   */
  static parseImageEffects(blipFill) {
    const effects = {
      opacity: 1,
      filter: null,
      borderRadius: 0,
      shadow: null,
      effectsList: []
    };

    if (!blipFill) return effects;

    // Parse alpha/opacity
    const blip = this.safeGet(blipFill, 'a:blip');
    if (blip) {
      // Look for alpha modulation
      const alphaModFix = this.safeGet(blip, 'a:alphaModFix.$amt');
      if (alphaModFix) {
        effects.opacity = parseInt(alphaModFix) / 100000; // PowerPoint uses 100000 = 100%
      }

      // Grayscale effect
      if (this.safeGet(blip, 'a:grayscl')) {
        effects.filter = 'grayscale(100%)';
        effects.effectsList.push('grayscale');
      }

      // Bi-level (black and white)
      if (this.safeGet(blip, 'a:biLevel')) {
        effects.filter = 'contrast(1000%) brightness(50%)';
        effects.effectsList.push('bilevel');
      }
    }

    return effects;
  }

  /**
   * Parse image cropping information
   * @param {Object} blipFill - Blip fill properties
   * @returns {Object} cropping information
   */
  static parseCropping(blipFill) {
    const srcRect = this.safeGet(blipFill, 'a:srcRect.$');
    if (!srcRect) {
      return {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        isCropped: false
      };
    }

    // PowerPoint uses percentages * 1000 (e.g., 10000 = 10%)
    return {
      left: srcRect.l ? parseInt(srcRect.l) / 1000 : 0,
      top: srcRect.t ? parseInt(srcRect.t) / 1000 : 0,
      right: srcRect.r ? parseInt(srcRect.r) / 1000 : 0,
      bottom: srcRect.b ? parseInt(srcRect.b) / 1000 : 0,
      isCropped: !!(srcRect.l || srcRect.t || srcRect.r || srcRect.b)
    };
  }

  /**
   * Get basic image dimensions (simplified - would need proper image parsing)
   * @param {Buffer} imageBuffer - Image file buffer
   * @returns {Object|null} dimensions
   */
  static getImageDimensions(imageBuffer) {
    // This is a placeholder - in a real implementation, you'd use
    // an image parsing library like sharp or image-size
    return null;
  }


}