import { createShapeId, type Editor } from "@tldraw/tldraw";
import type { PowerPointComponent } from "ppt-paste-parser";
import {
  getTldrawColorForHex,
  mapBorderStyleToDash,
  mapBorderWidthToSize,
} from "../utils/colorPaletteOverride";
import {
  mapShapeType,
  determineFillType,
  createComponentShapeId,
} from "../utils/tldrawHelpers";
import {
  calculateFrameRelativePosition,
  degreesToRadians,
} from "../utils/coordinateHelpers";
import type { TLDrawColor } from "../constants";

export async function renderShapeComponent(
  component: PowerPointComponent,
  index: number,
  frameX: number,
  frameY: number,
  editor: Editor,
  slideIndex: number,
  frameId: string | null,
  colorMapping: Map<string, TLDrawColor>,
  frameDimensions?: { width: number; height: number }
) {
  const shapeId = createShapeId(
    createComponentShapeId("shape", slideIndex, component.id || index),
  );

  const scale = 1;
  
  // Detect if this is a background shape
  const isBackgroundShape = (component.x === 0 && component.y === 0 && 
                            (component.content?.includes("Background") ||
                             component.id?.includes("Background") ||
                             (component.zIndex != null && component.zIndex < -100))) && 
                           frameDimensions;

  let shapeX = component.x || 0;
  let shapeY = component.y || 0;
  let width = (component.width || 100) * scale;
  let height = (component.height || 100) * scale;

  // For background shapes, scale to fill the entire frame
  if (isBackgroundShape && frameDimensions) {
    const scaleX = frameDimensions.width / width;
    const scaleY = frameDimensions.height / height;
    const shapeScale = Math.max(scaleX, scaleY); // Use larger scale to ensure full coverage
    
    width = Math.round(width * shapeScale);
    height = Math.round(height * shapeScale);
    
    // Center the scaled background shape
    if (width > frameDimensions.width) {
      shapeX = -(width - frameDimensions.width) / 2;
    }
    if (height > frameDimensions.height) {
      shapeY = -(height - frameDimensions.height) / 2;
    }
  }

  const { x, y } = calculateFrameRelativePosition(
    shapeX,
    shapeY,
    frameX,
    frameY,
    scale,
    !!frameId,
  );

  // Map colors using exact hex values
  const fillColor = getTldrawColorForHex(
    component.style?.fillColor,
    colorMapping,
  );
  const strokeColor = getTldrawColorForHex(
    component.style?.borderColor,
    colorMapping,
  );
  

  // Determine the best tldraw shape type based on PowerPoint shape type
  const shapeType =
    component.style?.shapeType ||
    component.metadata?.shapeType ||
    component.metadata?.preset ||
    "rectangle";
  const geoType = mapShapeType(shapeType);

  // Map border properties to TLDraw
  const borderWidth = component.style?.borderWidth || 0;
  const borderStyle = component.style?.borderStyle;
  const hasBorder =
    borderWidth > 0 &&
    component.style?.borderColor !== "transparent" &&
    component.style?.borderColor;

  // Handle opacity and transparency
  const fillOpacity = component.style?.fillOpacity || 1;
  const shapeOpacity = component.style?.opacity || fillOpacity;

  // Create geometric shape using the tldraw v3 API
  const finalColor = hasBorder ? strokeColor : fillColor;
  const finalFill = determineFillType(component.style?.fillColor, fillOpacity);
  const dash = hasBorder ? mapBorderStyleToDash(borderStyle) : "solid";
  const size = hasBorder ? mapBorderWidthToSize(borderWidth) : "m";

  // Create the shape with parent frame, position, and rotation all at once
  const geoShapeProps: any = {
    id: shapeId,
    type: "geo",
    x,
    y,
    rotation: component.rotation ? degreesToRadians(component.rotation) : 0,
    opacity: shapeOpacity,
    props: {
      geo: geoType,
      color: finalColor,
      fill: finalFill,
      dash: dash,
      size: size,
      w: width,
      h: height,
    },
  };


  if (frameId) {
    geoShapeProps.parentId = frameId;
  }

  editor.createShape(geoShapeProps);
}
