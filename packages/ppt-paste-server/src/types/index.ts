/**
 * TypeScript type definitions for PowerPoint parsing
 *
 * These types are intentionally conservative to make a staged migration
 * to stricter TypeScript easier. `XMLNode` remains permissive while
 * component shapes are expressed as discriminated unions.
 */

// Component types that can be parsed from PowerPoint
export type ComponentType = 'text' | 'shape' | 'image' | 'table' | 'video' | 'any';

// Shared base component properties
export interface PowerPointComponentBase {
  id: string;
  type: ComponentType;
  content?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  style?: ComponentStyle;
  metadata?: Record<string, any>;
  slideIndex: number;
  zIndex: number;
}

// Discriminated component union exported as the primary type
export type PowerPointComponent =
  | TextComponent
  | ShapeComponent
  | ImageComponent
  | TableComponent
  | VideoComponent
  | UnknownComponent;

// Style information for components
export interface ComponentStyle {
  // Font properties (for text components)
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  color?: string;

  // Border properties
  borderWidth?: number;
  borderStyle?: string;
  borderColor?: string;

  // Fill properties
  fillColor?: string;
  fillOpacity?: number;

  // Transform properties
  rotation?: number;

  // Additional styling
  [key: string]: any;
}

// Text-specific component
export interface TextComponent extends PowerPointComponentBase {
  type: 'text';
  textRuns?: TextRun[];
}

// A fallback any component
export interface UnknownComponent extends PowerPointComponentBase {
  type: 'any';
}

// Text run with individual styling
export interface TextRun {
  text: string;
  style?: Partial<ComponentStyle>;
}

// Shape-specific component
export interface ShapeComponent extends PowerPointComponentBase {
  type: 'shape';
  shapeType?: string;
  geometry?: GeometryInfo | null;
}

// Image-specific component
export interface ImageComponent extends PowerPointComponentBase {
  type: 'image';
  src?: string;
  alt?: string;
}

// Table-specific component
export interface TableComponent extends PowerPointComponentBase {
  type: 'table';
  rows?: TableRow[];
  columns?: number;
}

// Video-specific component
export interface VideoComponent extends PowerPointComponentBase {
  type: 'video';
  url?: string;
  thumbnailSrc?: string;
  title?: string;
  embedType?: 'youtube' | 'vimeo' | 'generic';
}

// Table row structure
export interface TableRow {
  cells: TableCell[];
}

// Table cell structure
export interface TableCell {
  content: string;
  style?: ComponentStyle;
  colSpan?: number;
  rowSpan?: number;
}

// Parser configuration options
export interface ParserConfig {
  convertEmu?: boolean;
  includeMetadata?: boolean;
  debugMode?: boolean;
}

// Raw XML node type (permissive for now to avoid cascading errors)
export type XMLNode = Record<string, any>;

// Processing context passed between parsers
export interface ProcessingContext {
  slideWidth?: number;
  slideHeight?: number;
  theme?: XMLNode;
  relationships?: Record<string, string>;
  debugMode?: boolean;
}

// Normalized component structure from PowerPointNormalizer
export interface NormalizedShapeComponent {
  data?: any;
  spPr?: XMLNode;
  nvSpPr?: XMLNode;
  namespace?: string;
  style?: XMLNode;
}

// Fill information
export interface FillInfo {
  type: 'solid' | 'gradient' | 'pattern' | 'none';
  color: string;
  opacity: number;
}

// Border information
export interface BorderInfo {
  type: 'solid' | 'none';
  color: string;
  width: number;
  style: string;
  cap?: string;
  compound?: string;
}

// Geometry information
export interface GeometryInfo {
  type: string;
  preset: string | null;
  isCustom: boolean;
  paths?: any[];
}

// Effects information
export interface EffectsInfo {
  effects: string[];
  boxShadow?: string;
  [key: string]: any;
}

// Normalized image component structure from PowerPointNormalizer
export interface NormalizedImageComponent {
  data?: any;
  spPr?: XMLNode;
  nvPicPr?: XMLNode;
  blipFill?: XMLNode;
  namespace?: string;
}

// Image information returned by getImageInfo
export interface ImageInfo {
  url: string | null;
  type: string;
  size: number;
  dimensions: ImageDimensions | null;
}

// Image dimensions
export interface ImageDimensions {
  width: number;
  height: number;
}

// Image effects information
export interface ImageEffectsInfo {
  opacity: number;
  filter: string | null;
  borderRadius: number;
  shadow: string | null;
  effectsList: string[];
}

// Media file information
export interface MediaFileInfo {
  data: Uint8Array | Buffer;
  type: string;
  size: number;
}

// Image cropping information
export interface ImageCroppingInfo {
  left: number;
  top: number;
  right: number;
  bottom: number;
  isCropped: boolean;
}

// Normalized table component structure from PowerPointNormalizer
export interface NormalizedTableComponent {
  graphicData?: XMLNode;
  spPr?: XMLNode;
  nvGraphicFramePr?: XMLNode;
  namespace?: string;
}

// Normalized video component structure from PowerPointNormalizer
export interface NormalizedVideoComponent {
  data?: any;
  spPr?: XMLNode;
  nvPicPr?: XMLNode;
  blipFill?: XMLNode;
  namespace?: string;
  relationshipId?: string;
}

// Table dimensions
export interface TableDimensions {
  rows: number;
  cols: number;
}

// TipTap rich text content node types
export interface TipTapTextNode {
  type: 'text';
  text: string;
}

export interface TipTapParagraphNode {
  type: 'paragraph';
  attrs?: {
    dir?: string;
  };
  content: TipTapTextNode[];
}

export interface TipTapTableCellNode {
  type: 'tableCell' | 'tableHeader';
  attrs: {
    colspan: number;
    rowspan: number;
    colwidth: null | number;
  };
  content: TipTapParagraphNode[];
}

export interface TipTapTableRowNode {
  type: 'tableRow';
  content: TipTapTableCellNode[];
}

export interface TipTapTableNode {
  type: 'table';
  content: TipTapTableRowNode[];
}

export interface TipTapDocumentNode {
  type: 'doc';
  content: (TipTapTableNode | TipTapParagraphNode)[];
}
