/**
 * Connector component parser for PowerPoint connection shapes (arrows, lines, etc.)
 */

import { BaseParser } from "./BaseParser.js";
import { emuToPixels } from "../utils/constants.js";
import {
  XMLNode,
  ConnectionComponent,
  NormalizedConnectionComponent,
} from "../types/index.js";
import type { NormalizedConnectionElement } from '../types/normalized.js';

export class ConnectorParser extends BaseParser {
  /**
   * Parse connection component from normalized data (works for both PPTX and clipboard)
   * @param connectionComponent - Normalized connection component
   * @param componentIndex - Component index
   * @param slideIndex - Slide index
   * @param zIndex - Z-index for layering
   * @param shapeMap - Map of shape IDs to their positions and dimensions for connection point calculation
   * @returns Parsed connection component
   */
  static async parseFromNormalized(
    connectionComponent: NormalizedConnectionElement,
    componentIndex: number,
    slideIndex: number,
    zIndex: number,
    shapeMap?: Map<string, { x: number, y: number, width: number, height: number }>
  ): Promise<ConnectionComponent | null> {
    const { spPr, nvCxnSpPr, namespace, startConnection, endConnection } = connectionComponent;

    if (!spPr) {
      throw new Error("No spPr found in normalized connection component");
    }

    // Extract positioning from spPr (namespaces already stripped)
    const xfrm = BaseParser.getNode(spPr, "xfrm");
    const transform = ConnectorParser.parseTransform(xfrm);

    // Extract component info from nvCxnSpPr
    const cNvPr = BaseParser.getNode(nvCxnSpPr, "cNvPr");
    const originalName = BaseParser.getString(cNvPr, "name", "") || "Connection";
    const componentName = BaseParser.generateComponentId('connector', componentIndex, originalName);
    const componentId = componentName; // Use the same clean ID

    // Parse line/connector properties
    const lineStyle = ConnectorParser.parseLineStyle(spPr);
    const connectorType = ConnectorParser.parseConnectorType(spPr);

    // Extract connection points
    const startShapeId = BaseParser.getString(startConnection, "$id", "") || undefined;
    const endShapeId = BaseParser.getString(endConnection, "$id", "") || undefined;
    const startConnectionIndex = BaseParser.getString(startConnection, "$idx", "");
    const endConnectionIndex = BaseParser.getString(endConnection, "$idx", "");

    // Calculate actual connection points
    let startPoint = { x: transform.x, y: transform.y };
    let endPoint = { x: transform.x + transform.width, y: transform.y + transform.height };

    if (shapeMap && startShapeId && endShapeId) {
      const startShape = shapeMap.get(startShapeId);
      const endShape = shapeMap.get(endShapeId);
      
      if (startShape && endShape) {
        startPoint = ConnectorParser.calculateConnectionPoint(
          startShape, 
          parseInt(startConnectionIndex, 10) || 0
        );
        endPoint = ConnectorParser.calculateConnectionPoint(
          endShape, 
          parseInt(endConnectionIndex, 10) || 0
        );
      }
    }

    // Create connection component
    const component: ConnectionComponent = {
      id: `${componentName};${componentId};${namespace}${slideIndex}`,
      type: "connection",
      content: `${componentName} Connection`,
      x: transform.x,
      y: transform.y,
      width: transform.width,
      height: transform.height,
      rotation: transform.rotation || 0,
      slideIndex,
      zIndex,
      startShapeId,
      endShapeId,
      connectorType,
      startPoint,
      endPoint,
      lineStyle,
      style: {
        rotation: transform.rotation || 0,
        opacity: 1,
      },
      metadata: {
        namespace,
        originalFormat: "normalized",
        connectorGeometry: connectorType,
        hasStartConnection: !!startConnection,
        hasEndConnection: !!endConnection,
        startConnectionId: startShapeId,
        endConnectionId: endShapeId,
        startConnectionIndex: parseInt(startConnectionIndex, 10) || 0,
        endConnectionIndex: parseInt(endConnectionIndex, 10) || 0,
      },
    };

    return component;
  }

  /**
   * Parse transform information from xfrm node
   */
  static parseTransform(xfrm: XMLNode | null | undefined): {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
  } {
    // Use BaseParser's parseTransform method
    return BaseParser.parseTransform(xfrm);
  }

  /**
   * Parse line style information from spPr
   */
  static parseLineStyle(spPr: XMLNode): {
    width?: number;
    color?: string;
    dashStyle?: string;
    startArrow?: string;
    endArrow?: string;
  } {
    const ln = BaseParser.getNode(spPr, "ln");
    if (!ln) return {};

    const lineStyle: any = {};

    // Line width
    const width = BaseParser.getString(ln, "$w", "");
    if (width) {
      lineStyle.width = emuToPixels(parseInt(width, 10));
    }

    // Line color
    const solidFill = BaseParser.getNode(ln, "solidFill");
    if (solidFill) {
      const color = BaseParser.parseColor(solidFill);
      if (color) {
        lineStyle.color = color;
      }
    }

    // Dash style
    const prstDash = BaseParser.getNode(ln, "prstDash");
    if (prstDash) {
      const dashVal = BaseParser.getString(prstDash, "$val", "");
      lineStyle.dashStyle = dashVal || "solid";
    }

    // Arrow styles
    const headEnd = BaseParser.getNode(ln, "headEnd");
    if (headEnd) {
      const headType = BaseParser.getString(headEnd, "$type", "");
      lineStyle.startArrow = headType;
    }

    const tailEnd = BaseParser.getNode(ln, "tailEnd");
    if (tailEnd) {
      const tailType = BaseParser.getString(tailEnd, "$type", "");
      lineStyle.endArrow = tailType;
    }

    return lineStyle;
  }

  /**
   * Parse connector type from spPr geometry
   */
  static parseConnectorType(spPr: XMLNode): string {
    const prstGeom = BaseParser.getNode(spPr, "prstGeom");
    if (prstGeom) {
      const preset = BaseParser.getString(prstGeom, "$prst", "");
      return preset || "straightConnector1";
    }
    return "straightConnector1";
  }

  /**
   * Calculate connection point on a shape based on connection index
   * PowerPoint connection points based on visual analysis of actual connections:
   * From XML: shape 464 (idx="3") connects to shape 465 (idx="1") 
   * Visual: right center to left center connection
   * So: idx="3" = right center, idx="1" = left center
   * 
   * Working backwards from other connections, the pattern appears to be:
   * - Index 0: top center
   * - Index 1: left center  
   * - Index 2: bottom center
   * - Index 3: right center
   * @param shape - Shape bounds and position
   * @param connectionIndex - Connection point index (0-based)
   * @returns Connection point coordinates
   */
  static calculateConnectionPoint(
    shape: { x: number, y: number, width: number, height: number },
    connectionIndex: number
  ): { x: number, y: number } {
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;
    
    // Debug logging for connection index issues
    if (process.env.NODE_ENV === 'development') {
      console.log(`calculateConnectionPoint: shape=(${shape.x},${shape.y},${shape.width}x${shape.height}), idx=${connectionIndex}`);
    }
    
    switch (connectionIndex) {
      case 0: // Top center
        const topResult = { x: centerX, y: shape.y };
        if (process.env.NODE_ENV === 'development') {
          console.log(`idx=${connectionIndex} (top) -> (${topResult.x}, ${topResult.y})`);
        }
        return topResult;
      case 1: // Left center
        const leftResult = { x: shape.x, y: centerY };
        if (process.env.NODE_ENV === 'development') {
          console.log(`idx=${connectionIndex} (left) -> (${leftResult.x}, ${leftResult.y})`);
        }
        return leftResult;
      case 2: // Bottom center
        const bottomResult = { x: centerX, y: shape.y + shape.height };
        if (process.env.NODE_ENV === 'development') {
          console.log(`idx=${connectionIndex} (bottom) -> (${bottomResult.x}, ${bottomResult.y})`);
        }
        return bottomResult;
      case 3: // Right center
        const rightResult = { x: shape.x + shape.width, y: centerY };
        if (process.env.NODE_ENV === 'development') {
          console.log(`idx=${connectionIndex} (right) -> (${rightResult.x}, ${rightResult.y})`);
        }
        return rightResult;
      case 4: // For circles/ellipses: Bottom center (common connection point)
        const circleBottomResult = { x: centerX, y: shape.y + shape.height };
        if (process.env.NODE_ENV === 'development') {
          console.log(`idx=${connectionIndex} (circle/bottom) -> (${circleBottomResult.x}, ${circleBottomResult.y})`);
        }
        return circleBottomResult;
      default:
        // Default to center if unknown index
        const defaultResult = { x: centerX, y: centerY };
        if (process.env.NODE_ENV === 'development') {
          console.log(`idx=${connectionIndex} (default/center) -> (${defaultResult.x}, ${defaultResult.y})`);
        }
        return defaultResult;
    }
  }
}