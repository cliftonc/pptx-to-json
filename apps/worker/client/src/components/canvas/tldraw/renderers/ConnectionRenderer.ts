import { createShapeId, type Editor } from "@tldraw/tldraw";
import type { PowerPointComponent, ConnectionComponent } from "ppt-paste-parser";
import {
  getTldrawColorForHex,
  mapBorderStyleToDash,
  mapBorderWidthToSize,
} from "../utils/colorPaletteOverride";
import {
  createComponentShapeId,
} from "../utils/tldrawHelpers";
import {
  calculateFrameRelativePosition,
} from "../utils/coordinateHelpers";
import type { TLDrawColor } from "../constants";

export async function renderConnectionComponent(
  component: PowerPointComponent,
  index: number,
  frameX: number,
  frameY: number,
  editor: Editor,
  slideIndex: number,
  frameId: string | null,
  colorMapping?: Map<string, TLDrawColor>
) {
  // Check if this is actually a connection component
  if (component.type !== 'connection') {
    console.warn('renderConnectionComponent called with non-connection component:', component.type);
    return;
  }

  // Cast to ConnectionComponent to access connection-specific properties
  const connection = component as ConnectionComponent;

  const connectionId = createShapeId(
    createComponentShapeId("connection", slideIndex, component.id || index)
  );

  // Extract connection properties  
  const lineStyle = connection.lineStyle || {};
  // Note: startShapeId and endShapeId are available as connection.startShapeId/endShapeId if needed

  // Use the precise startPoint and endPoint coordinates from PowerPoint
  let startPoint = { x: 0, y: 0 };
  let endPoint = { x: 100, y: 100 };

  if (connection.startPoint && connection.endPoint) {
    // Use the exact coordinates from PowerPoint XML data
    startPoint = connection.startPoint;
    endPoint = connection.endPoint;
  } else if (component.x !== undefined && component.y !== undefined) {
    // Fallback to component position if startPoint/endPoint aren't available
    startPoint = { x: component.x, y: component.y };
    endPoint = { 
      x: component.x + (component.width || 100), 
      y: component.y + (component.height || 0) 
    };
  }

  // Convert to frame-relative coordinates
  const startPos = calculateFrameRelativePosition(
    startPoint.x,
    startPoint.y,
    frameX,
    frameY,
    1,
    !!frameId
  );
  
  const endPos = calculateFrameRelativePosition(
    endPoint.x,
    endPoint.y,
    frameX,
    frameY,
    1,
    !!frameId
  );

  // Validate coordinates
  if (startPos.x === undefined || startPos.y === undefined || 
      endPos.x === undefined || endPos.y === undefined ||
      isNaN(startPos.x) || isNaN(startPos.y) || 
      isNaN(endPos.x) || isNaN(endPos.y)) {
    console.warn('Invalid connection coordinates - skipping connection:', component.id);
    return;
  }

  // Map line color
  const lineColor = getTldrawColorForHex(
    lineStyle.color || component.style?.borderColor || '#000000',
    colorMapping || new Map()
  );

  // Map line properties
  const lineWidth = lineStyle.width || component.style?.borderWidth || 1.5;
  const lineStyleType = lineStyle.dashStyle || component.style?.borderStyle || 'solid';
  const dash = mapBorderStyleToDash(lineStyleType);
  const size = mapBorderWidthToSize(lineWidth);

  // Determine arrow direction based on start/end arrows and rotation
  let arrowheadStart = 'none';
  let arrowheadEnd = 'none';
  
  if (lineStyle.startArrow === 'triangle' || lineStyle.startArrow === 'arrow') {
    arrowheadStart = 'arrow';
  }
  if (lineStyle.endArrow === 'triangle' || lineStyle.endArrow === 'arrow') {
    arrowheadEnd = 'arrow';
  }

  // Handle rotation - if rotated 180 degrees, the arrow direction is flipped
  const isRotated180 = component.rotation === 180 || component.style?.rotation === 180;
  if (isRotated180) {
    // Swap the arrowheads when rotated 180 degrees
    [arrowheadStart, arrowheadEnd] = [arrowheadEnd, arrowheadStart];
  }

  // Calculate relative end position
  const relativeEndX = endPos.x - startPos.x;
  const relativeEndY = endPos.y - startPos.y;

  // Create arrow shape for the connection
  const arrowShapeProps: any = {
    id: connectionId,
    type: "arrow",
    x: startPos.x,
    y: startPos.y,
    props: {
      start: {
        x: 0,
        y: 0,
      },
      end: {
        x: relativeEndX,
        y: relativeEndY,
      },
      color: lineColor,
      dash: dash,
      size: size,
      arrowheadStart: arrowheadStart,
      arrowheadEnd: arrowheadEnd,
      fill: 'none', // Connections are typically not filled
    },
  };

  // Note: Shape binding is disabled for now to ensure reliable coordinate-based positioning
  // Connections use the precise startPoint and endPoint coordinates from PowerPoint
  // TODO: Implement proper shape binding that doesn't interfere with coordinate positioning

  if (frameId) {
    arrowShapeProps.parentId = frameId;
  }

  // Final validation of arrow shape properties
  const requiredNumbers = [
    { name: 'x', value: arrowShapeProps.x },
    { name: 'y', value: arrowShapeProps.y },
    { name: 'props.start.x', value: arrowShapeProps.props.start.x },
    { name: 'props.start.y', value: arrowShapeProps.props.start.y },
    { name: 'props.end.x', value: arrowShapeProps.props.end.x },
    { name: 'props.end.y', value: arrowShapeProps.props.end.y },
  ];

  for (const prop of requiredNumbers) {
    if (typeof prop.value !== 'number' || isNaN(prop.value)) {
      console.warn(`Invalid connection property ${prop.name} for ${component.id} - skipping`);
      return;
    }
  }

  try {
    editor.createShape(arrowShapeProps);
  } catch (error) {
    console.error('Failed to create connection shape:', error);
    // Fallback: create a simple line as a geo shape
    const lineShapeProps: any = {
      id: connectionId,
      type: "geo",
      x: startPos.x,
      y: startPos.y,
      props: {
        geo: "rectangle",
        w: Math.max(1, Math.abs(endPos.x - startPos.x)),
        h: Math.max(1, lineWidth),
        color: lineColor,
        fill: 'fill',
        dash: dash,
        size: size,
      },
    };
    
    if (frameId) {
      lineShapeProps.parentId = frameId;
    }
    
    editor.createShape(lineShapeProps);
  }
}