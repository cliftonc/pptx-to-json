// Minimal structural XML node interfaces for frequently accessed PowerPoint shapes
// These are intentionally partial – only fields currently read by parsers are present.
// They provide lightweight narrowing without over‑constraining fast-xml-parser output.

import { XMLNode } from './index.js';

// Basic transform sub-nodes
export interface OffsetNode { $x?: string; $y?: string }
export interface ExtentNode { $cx?: string; $cy?: string }
export interface TransformNode {
  off?: OffsetNode; // position
  ext?: ExtentNode; // size
  $rot?: string;    // rotation in 60000ths deg
  [key: string]: any; // allow additional members
}

// Text run node – PowerPoint sometimes wraps text as { t: 'Text' } or { t: { _: 'Text' } }
export interface RunNode {
  t?: string | { _?: string };
  rPr?: XMLNode; // formatting retained as generic until further narrowing
  [key: string]: any;
}

// Paragraph node – may contain runs (r) or fields (fld) plus paragraph props (pPr)
export interface ParagraphNode {
  r?: RunNode | RunNode[];
  fld?: RunNode | RunNode[]; // treat fields similarly (carry text in t)
  pPr?: XMLNode;             // paragraph properties (bullets etc.) kept generic
  t?: string | { _?: string }; // occasional direct text
  [key: string]: any;
}

// Text body node – collection of paragraphs plus optional list style
export interface TextBodyNode {
  p: ParagraphNode | ParagraphNode[];
  lstStyle?: XMLNode;
  [key: string]: any;
}

// Table cell text body reuses TextBodyNode shape (txBody)
export interface TableCellNode {
  txBody?: TextBodyNode;
  [key: string]: any;
}

// Type guards (narrow conservative shapes)
export function isTransformNode(v: any): v is TransformNode {
  return v && typeof v === 'object' && (!('p' in v));
}

export function isTextBodyNode(v: any): v is TextBodyNode {
  return v && typeof v === 'object' && 'p' in v;
}

export function isParagraphArray(p: any): p is ParagraphNode[] {
  return Array.isArray(p) && p.every(item => item && typeof item === 'object');
}

export function isRunArray(r: any): r is RunNode[] {
  return Array.isArray(r) && r.every(item => item && typeof item === 'object');
}
