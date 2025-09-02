/**
 * PowerPoint Units and Conversion Constants
 * 
 * All EMU (English Metric Unit) values should be converted to pixels
 * early in the processing pipeline to ensure consistency.
 */

// EMU to Pixel Conversion
// 1 inch = 914400 EMUs
// At 96 DPI: 1 pixel = 1/96 inches
// Therefore: 1 EMU = 96/914400 pixels
export const EMU_TO_PIXELS = 96 / 914400;

// Standard PowerPoint slide dimensions in EMU (for creating synthetic XML)
export const DEFAULT_SLIDE_WIDTH_EMU = 9144000;  // 10 inches in EMU
export const DEFAULT_SLIDE_HEIGHT_EMU = 6858000; // 7.5 inches in EMU

// Standard PowerPoint slide dimensions in pixels
// Converted from EMU defaults
export const DEFAULT_SLIDE_WIDTH_PX = Math.round(DEFAULT_SLIDE_WIDTH_EMU * EMU_TO_PIXELS);  // 960px
export const DEFAULT_SLIDE_HEIGHT_PX = Math.round(DEFAULT_SLIDE_HEIGHT_EMU * EMU_TO_PIXELS); // 720px

// PowerPoint standard dimensions for reference
export const STANDARD_DIMENSIONS = {
  // 4:3 aspect ratio (default)
  STANDARD_4_3: {
    width: DEFAULT_SLIDE_WIDTH_PX,
    height: DEFAULT_SLIDE_HEIGHT_PX
  },
  // 16:9 widescreen (converted from EMU)
  WIDESCREEN_16_9: {
    width: Math.round(12192000 * EMU_TO_PIXELS), // 1280px
    height: Math.round(6858000 * EMU_TO_PIXELS)  // 720px
  }
};

/**
 * Convert EMU (English Metric Units) to pixels
 * This is the single source of truth for EMU conversion
 * @param {number} emu - EMU value from PowerPoint
 * @returns {number} pixel value rounded to integer
 */
export function emuToPixels(emu) {
  if (typeof emu !== 'number' || isNaN(emu)) {
    console.warn('Invalid EMU value provided to emuToPixels:', emu);
    return 0;
  }
  return Math.round(emu * EMU_TO_PIXELS);
}

/**
 * Convert EMU to points (for font sizes)
 * 1 inch = 914400 EMUs, 1 inch = 72 points
 * @param {number} emu - EMU value
 * @returns {number} point value rounded to integer
 */
export function emuToPoints(emu) {
  if (typeof emu !== 'number' || isNaN(emu)) {
    console.warn('Invalid EMU value provided to emuToPoints:', emu);
    return 12; // Default font size
  }
  return Math.round((emu / 914400) * 72);
}

/**
 * Validate that a coordinate value is in pixel range (not EMU)
 * EMU values are typically very large (> 100000), pixels are smaller
 * @param {number} value - coordinate value to check
 * @param {string} context - description for logging
 * @returns {boolean} true if value appears to be in pixels
 */
export function validatePixelRange(value, context = 'coordinate') {
  if (typeof value !== 'number' || isNaN(value)) return false;
  
  // EMU values are typically > 100000, pixels are usually < 10000 for slides
  const SUSPICIOUS_EMU_THRESHOLD = 50000;
  
  if (value > SUSPICIOUS_EMU_THRESHOLD) {
    console.warn(`🚨 Suspiciously large ${context} value: ${value} - may be unconverted EMU`);
    return false;
  }
  
  return true;
}