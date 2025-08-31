/**
 * Image component parser for PowerPoint shapes containing images
 */

import { BaseParser } from './BaseParser.js';

export class ImageParser extends BaseParser {
  /**
   * Parse an image component from PowerPoint shape data
   * @param {Object} shape - Shape data from PowerPoint JSON
   * @param {Object} relationships - Relationship data from PowerPoint JSON
   * @param {Object} mediaFiles - Media files from PowerPoint JSON
   * @param {number} index - Component index for ID generation
   * @returns {Object|null} parsed image component
   */
  static parse(shape, relationships = {}, mediaFiles = {}, index = 0) {
    try {
      // Check if shape contains an image
      const pic = this.safeGet(shape, 'p:pic.0');
      if (!pic) return null;

      // Get transform information
      const spPr = this.safeGet(pic, 'p:spPr.0');
      const xfrm = this.safeGet(spPr, 'a:xfrm.0');
      const transform = this.parseTransform(xfrm);

      // Skip if image has no dimensions
      if (transform.width === 0 && transform.height === 0) return null;

      // Get image relationship ID
      const blipFill = this.safeGet(pic, 'p:blipFill.0');
      const blip = this.safeGet(blipFill, 'a:blip.0');
      const rId = blip?.$?.['r:embed'];

      // Get image information
      const imageInfo = this.getImageInfo(rId, relationships, mediaFiles);

      // Parse image effects and cropping
      const effects = this.parseImageEffects(blipFill);
      const cropping = this.parseCropping(blipFill);

      // Get image name/description
      const cNvPr = this.safeGet(pic, 'p:nvPicPr.0.p:cNvPr.0');
      const name = cNvPr?.$.name || 'Image';
      const description = cNvPr?.$.descr || '';

      return {
        id: this.generateId('image', index),
        type: 'image',
        x: transform.x,
        y: transform.y,
        width: transform.width,
        height: transform.height,
        rotation: transform.rotation,
        content: description || name,
        style: {
          opacity: effects.opacity,
          filter: effects.filter,
          borderRadius: effects.borderRadius,
          ...effects.shadow && { boxShadow: effects.shadow }
        },
        metadata: {
          name: name,
          description: description,
          relationshipId: rId,
          imageUrl: imageInfo.url,
          imageType: imageInfo.type,
          imageSize: imageInfo.size,
          originalDimensions: imageInfo.dimensions,
          cropping: cropping,
          effects: effects.effectsList
        }
      };

    } catch (error) {
      console.warn('Error parsing image component:', error);
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

    // Find relationship for this image
    const relFile = Object.keys(relationships).find(key => 
      key.includes('slide') && key.includes('_rels')
    );
    
    if (relFile && relationships[relFile]) {
      const rels = this.safeGet(relationships[relFile], 'Relationships.Relationship', []);
      const rel = rels.find(r => r.$.Id === rId);
      
      if (rel) {
        const target = rel.$.Target;
        const mediaPath = target.startsWith('../') ? target.slice(3) : `ppt/${target}`;
        
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
   * @param {Buffer} mediaFile - Image file buffer
   * @param {string} filename - Original filename
   * @returns {string} data URL or placeholder
   */
  static createDataUrl(mediaFile, filename) {
    if (!mediaFile || !Buffer.isBuffer(mediaFile)) {
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RkZCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5JbWFnZTwvdGV4dD48L3N2Zz4=';
    }

    const type = this.getImageType(filename);
    const mimeType = this.getMimeType(type);
    const base64 = mediaFile.toString('base64');
    
    return `data:${mimeType};base64,${base64}`;
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
    const blip = this.safeGet(blipFill, 'a:blip.0');
    if (blip) {
      // Look for alpha modulation
      const alphaModFix = this.safeGet(blip, 'a:alphaModFix.0.$.amt');
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
    const srcRect = this.safeGet(blipFill, 'a:srcRect.0.$');
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

  /**
   * Check if a shape contains an image
   * @param {Object} shape - Shape data
   * @returns {boolean} true if shape contains image
   */
  static hasImage(shape) {
    return !!this.safeGet(shape, 'p:pic.0');
  }

  /**
   * Parse image from a shape that may contain both image and text
   * (like a text box with background image)
   * @param {Object} shape - Shape data
   * @param {Object} relationships - Relationship data
   * @param {Object} mediaFiles - Media files data
   * @param {number} index - Component index
   * @returns {Object|null} parsed image component
   */
  static parseBackgroundImage(shape, relationships, mediaFiles, index) {
    try {
      // Check for background image in shape properties
      const spPr = this.safeGet(shape, 'p:spPr.0');
      const blipFill = this.safeGet(spPr, 'a:blipFill.0');
      
      if (!blipFill) return null;

      const blip = this.safeGet(blipFill, 'a:blip.0');
      const rId = blip?.$?.['r:embed'];
      
      if (!rId) return null;

      // Get transform information
      const xfrm = this.safeGet(spPr, 'a:xfrm.0');
      const transform = this.parseTransform(xfrm);

      // Get image information
      const imageInfo = this.getImageInfo(rId, relationships, mediaFiles);

      return {
        id: this.generateId('background-image', index),
        type: 'image',
        x: transform.x,
        y: transform.y,
        width: transform.width,
        height: transform.height,
        rotation: transform.rotation,
        content: 'Background image',
        style: {
          opacity: 1,
          zIndex: -1 // Background images should be behind text
        },
        metadata: {
          isBackground: true,
          relationshipId: rId,
          imageUrl: imageInfo.url,
          imageType: imageInfo.type,
          imageSize: imageInfo.size
        }
      };

    } catch (error) {
      console.warn('Error parsing background image:', error);
      return null;
    }
  }
}