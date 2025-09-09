/**
 * Utility functions for thumbnail URL validation and data URL prevention
 */

/**
 * Check if a URL is a valid thumbnail URL (not a data URL)
 */
export function isValidThumbnailUrl(url: string | undefined | null): boolean {
  if (!url) return true // undefined/null is valid (no thumbnail)
  
  // Must start with http:// or https:// or be a relative path starting with /
  return (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) && 
         !url.startsWith('data:')
}

/**
 * Sanitize a slide object to remove any data URLs from thumbnailUrl fields
 */
export function sanitizeSlideForSave(slide: any): any {
  const sanitized = { ...slide }
  
  // Check and sanitize thumbnailUrl
  if (slide.thumbnailUrl && slide.thumbnailUrl.startsWith('data:')) {
    console.warn('⚠️ Data URL detected in slide.thumbnailUrl, removing:', slide.id)
    sanitized.thumbnailUrl = undefined
  }
  
  return sanitized
}

/**
 * Sanitize an array of slides to remove any data URLs
 */
export function sanitizeSlidesForSave(slides: any[]): any[] {
  return slides.map(sanitizeSlideForSave)
}

/**
 * Validate that no data URLs exist in a slide object
 * Throws an error if data URLs are found (for development)
 */
export function validateNoDataUrls(slide: any, slideIndex?: number): void {
  if (slide.thumbnailUrl && slide.thumbnailUrl.startsWith('data:')) {
    const error = `Data URL detected in slide ${slideIndex !== undefined ? slideIndex + 1 : 'unknown'} thumbnailUrl. This should never happen in production.`
    console.error('🚨 ' + error, slide)
    
    // In development, throw an error to catch this early
    if (process.env.NODE_ENV === 'development') {
      throw new Error(error)
    }
  }
}

/**
 * Validate that no data URLs exist in an array of slides
 */
export function validateSlidesNoDataUrls(slides: any[]): void {
  slides.forEach((slide, index) => {
    validateNoDataUrls(slide, index)
  })
}

/**
 * Get thumbnail URL size estimate for logging/debugging
 */
export function getThumbnailUrlSizeInfo(url: string | undefined | null): { type: string; sizeKB?: number } {
  if (!url) return { type: 'none' }
  
  if (url.startsWith('data:')) {
    // Estimate base64 data URL size
    const base64Part = url.split(',')[1] || ''
    const sizeBytes = (base64Part.length * 3) / 4 // Rough base64 size calculation
    return { type: 'data-url', sizeKB: Math.round(sizeBytes / 1024) }
  }
  
  if (url.startsWith('/api/images/') || url.startsWith('http')) {
    return { type: 'valid-url' }
  }
  
  return { type: 'unknown' }
}

/**
 * Log thumbnail URL statistics for debugging
 */
export function logThumbnailStats(slides: any[]): void {
  const stats = {
    total: slides.length,
    withThumbnails: 0,
    withDataUrls: 0,
    withValidUrls: 0,
    totalDataUrlSizeKB: 0
  }
  
  slides.forEach((slide, index) => {
    if (slide.thumbnailUrl) {
      stats.withThumbnails++
      const sizeInfo = getThumbnailUrlSizeInfo(slide.thumbnailUrl)
      
      if (sizeInfo.type === 'data-url') {
        stats.withDataUrls++
        stats.totalDataUrlSizeKB += sizeInfo.sizeKB || 0
        console.warn(`⚠️ Slide ${index + 1} has data URL thumbnail (${sizeInfo.sizeKB}KB)`)
      } else if (sizeInfo.type === 'valid-url') {
        stats.withValidUrls++
      }
    }
  })
  
  console.log('📊 Thumbnail statistics:', stats)
  
  if (stats.withDataUrls > 0) {
    console.error(`🚨 Found ${stats.withDataUrls} slides with data URL thumbnails (${stats.totalDataUrlSizeKB}KB total). This should not happen in production!`)
  }
}