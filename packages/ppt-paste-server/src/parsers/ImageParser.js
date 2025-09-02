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

    // Extract positioning from spPr (namespaces already stripped)
    const xfrm = BaseParser.safeGet(spPr, 'xfrm');
    const transform = ImageParser.parseTransform(xfrm);

    // Extract component info from nvPicPr
    const cNvPr = BaseParser.safeGet(nvPicPr, 'cNvPr');
    const componentName = BaseParser.safeGet(cNvPr, '$name') || `image-${componentIndex}`;
    const description = BaseParser.safeGet(cNvPr, '$descr') || '';

    // Extract image reference from blipFill (namespaces already stripped)
    const blip = BaseParser.safeGet(blipFill, 'blip');
    const relationshipId = BaseParser.safeGet(blip, 'embed');

    // Find the actual image file using relationships
    let imageDataUrl = null;
    let imageFormat = 'unknown';
    let imageSize = 0;

    if (relationshipId && relationships && mediaFiles) {
      // Use the more complete getImageInfo method with slide context
      const imageInfo = ImageParser.getImageInfo(relationshipId, relationships, mediaFiles, slideIndex);
      if (imageInfo.url) {
        imageDataUrl = imageInfo.url;
        imageFormat = imageInfo.type;
        imageSize = imageInfo.size;
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
    if (!relationshipId || !relationships || !mediaFiles) {
      return null;
    }

    // Find the correct relationship file (drawing1.xml.rels for clipboard format)
    const relFile = Object.keys(relationships).find(key => 
      key.includes('_rels') && key.includes('drawing')
    );
    
    if (!relFile || !relationships[relFile]) {
      return null;
    }

    // Look for the specific relationship ID
    const rels = relationships[relFile];
    let relationshipData = null;

    // Handle different relationship file structures
    if (rels.Relationships && rels.Relationships.Relationship) {
      const relationshipArray = Array.isArray(rels.Relationships.Relationship) 
        ? rels.Relationships.Relationship 
        : [rels.Relationships.Relationship];
      
      relationshipData = relationshipArray.find(rel => rel.$Id === relationshipId);
    }

    if (!relationshipData) {
      return null;
    }

    // Resolve the target path
    let mediaPath = relationshipData.$Target;
    if (mediaPath.startsWith('../')) {
      mediaPath = `clipboard/${mediaPath.slice(3)}`;
    }

    // Find the actual media file
    const mediaFile = mediaFiles[mediaPath];
    if (mediaFile) {
      return {
        data: mediaFile,
        type: this.getImageTypeFromPath(mediaPath),
        size: mediaFile.length || 0
      };
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
   * Get file extension from MIME type
   */
  static getExtensionFromMimeType(mimeType) {
    const extensions = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/svg+xml': 'svg',
      'image/bmp': 'bmp',
      'image/webp': 'webp',
      'image/tiff': 'tiff'
    };
    return extensions[mimeType] || 'png';
  }



  /**
   * Get image information from relationship and media data
   * @param {string} rId - Relationship ID
   * @param {Object} relationships - Relationship data
   * @param {Object} mediaFiles - Media files data
   * @param {number} slideIndex - Slide index for slide-scoped search
   * @returns {Object} image information
   */
  static getImageInfo(rId, relationships, mediaFiles, slideIndex = null) {
    if (!rId) {
      return {
        url: null,
        type: 'unknown',
        size: 0,
        dimensions: null
      };
    }


    // Detect if this is clipboard format vs PPTX format by checking relationship paths
    const isClipboardFormat = Object.keys(relationships || {}).some(key => key.includes('clipboard/'));
    
    // For PPTX files (not clipboard), search current slide first, then slide layouts/masters
    if (slideIndex !== null && !isClipboardFormat) {
      const currentSlideRelFile = `ppt/slides/_rels/slide${slideIndex + 1}.xml.rels`;
      
      // First try the current slide's relationship file
      if (relationships[currentSlideRelFile]) {
        const relsData = BaseParser.safeGet(relationships[currentSlideRelFile], 'Relationships.Relationship', []);
        const rels = Array.isArray(relsData) ? relsData : [relsData];
        const rel = rels.find(r => r && r.$Id === rId);
        
        if (rel) {
          const target = rel.$Target;
          let mediaPath;
          
          if (target.startsWith('../')) {
            // PPTX format: ../media/image1.png -> ppt/media/image1.png
            mediaPath = `ppt/${target.slice(3)}`;
          } else {
            mediaPath = target.startsWith('media/') ? `ppt/${target}` : target;
          }
          
          // Look for the media file
          const mediaFile = mediaFiles[mediaPath];
          if (mediaFile) {
            return {
              url: ImageParser.createDataUrl(mediaFile, target),
              type: ImageParser.getImageType(target),
              size: mediaFile.length || 0,
              dimensions: ImageParser.getImageDimensions(mediaFile)
            };
          }
        }
      }
      
      
      // For PPTX with slideIndex, if not found anywhere, return null
      return {
        url: null,
        type: 'unknown',
        size: 0,
        dimensions: null
      };
    }
    
    // Only for clipboard format (when slideIndex is null) - search through all relationship files
    const relFiles = Object.keys(relationships).filter(key => 
      key.includes('_rels') && (key.includes('slide') || key.includes('drawing'))
    );
    
    for (const relFile of relFiles) {
      if (relationships[relFile]) {
        const relsData = BaseParser.safeGet(relationships[relFile], 'Relationships.Relationship', []);
        const rels = Array.isArray(relsData) ? relsData : [relsData];
        const rel = rels.find(r => r && r.$Id === rId);
        
        if (rel) {
          const target = rel.$Target;
          let mediaPath;
          
          if (target.startsWith('../')) {
            // Check if we're dealing with clipboard or PPTX format based on relationship file path
            if (relFile.includes('clipboard')) {
              mediaPath = `clipboard/${target.slice(3)}`;
            } else {
              // PPTX format - resolve relative path from slide to media folder
              mediaPath = `ppt/${target.slice(3)}`;
            }
          } else {
            mediaPath = target.startsWith('media/') ? `ppt/${target}` : target;
          }
          
          // Look for the media file
          const mediaFile = mediaFiles[mediaPath];
          if (mediaFile) {
            return {
              url: ImageParser.createDataUrl(mediaFile, target),
              type: ImageParser.getImageType(target),
              size: mediaFile.length || 0,
              dimensions: ImageParser.getImageDimensions(mediaFile)
            };
          }
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

    const type = ImageParser.getImageType(filename);
    const mimeType = ImageParser.getMimeType(type);
    const base64 = ImageParser.uint8ArrayToBase64(mediaFile);
    
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
    const blip = this.safeGet(blipFill, 'blip');
    if (blip) {
      // Look for alpha modulation
      const alphaModFix = this.safeGet(blip, 'alphaModFix.$amt');
      if (alphaModFix) {
        effects.opacity = parseInt(alphaModFix) / 100000; // PowerPoint uses 100000 = 100%
      }

      // Grayscale effect
      if (this.safeGet(blip, 'grayscl')) {
        effects.filter = 'grayscale(100%)';
        effects.effectsList.push('grayscale');
      }

      // Bi-level (black and white)
      if (this.safeGet(blip, 'biLevel')) {
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
    const srcRect = this.safeGet(blipFill, 'srcRect.$');
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