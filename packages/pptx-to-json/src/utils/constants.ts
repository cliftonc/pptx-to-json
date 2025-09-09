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

// Slide dimensions interface
export interface SlideDimensions {
  width: number;
  height: number;
}

// PowerPoint standard dimensions for reference
export const STANDARD_DIMENSIONS: Record<string, SlideDimensions> = {
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
 * @param emu - EMU value from PowerPoint
 * @returns pixel value rounded to integer
 */
export function emuToPixels(emu: number): number {
  if (typeof emu !== 'number' || isNaN(emu)) {
    console.warn('Invalid EMU value provided to emuToPixels:', emu);
    return 0;
  }
  return Math.round(emu * EMU_TO_PIXELS);
}

/**
 * Convert EMU to points (for font sizes)
 * 1 inch = 914400 EMUs, 1 inch = 72 points
 * @param emu - EMU value
 * @returns point value rounded to integer
 */
export function emuToPoints(emu: number): number {
  if (typeof emu !== 'number' || isNaN(emu)) {
    console.warn('Invalid EMU value provided to emuToPoints:', emu);
    return 12; // Default font size
  }
  return Math.round((emu / 914400) * 72);
}

/**
 * Convert pixels to EMU (English Metric Units)
 * Used when creating synthetic XML elements with proper dimensions
 * @param pixels - pixel value
 * @returns EMU value rounded to integer
 */
export function pixelsToEmu(pixels: number): number {
  if (typeof pixels !== 'number' || isNaN(pixels)) {
    console.warn('Invalid pixel value provided to pixelsToEmu:', pixels);
    return 0;
  }
  return Math.round(pixels / EMU_TO_PIXELS);
}

/**
 * Validate that a coordinate value is in pixel range (not EMU)
 * EMU values are typically very large (> 100000), pixels are smaller
 * @param value - coordinate value to check
 * @param context - description for logging
 * @returns true if value appears to be in pixels
 */
export function validatePixelRange(value: number, context: string = 'coordinate'): boolean {
  if (typeof value !== 'number' || isNaN(value)) return false;
  
  // EMU values are typically > 100000, pixels are usually < 10000 for slides
  const SUSPICIOUS_EMU_THRESHOLD = 50000;
  
  if (value > SUSPICIOUS_EMU_THRESHOLD) {
    console.warn(`🚨 Suspiciously large ${context} value: ${value} - may be unconverted EMU`);
    return false;
  }
  
  return true;
}