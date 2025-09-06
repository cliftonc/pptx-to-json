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
) {
  const shapeId = createShapeId(
    createComponentShapeId("shape", slideIndex, component.id || index),
  );

  const scale = 1;

  const { x, y } = calculateFrameRelativePosition(
    component.x || 0,
    component.y || 0,
    frameX,
    frameY,
    scale,
    !!frameId,
  );

  const width = (component.width || 100) * scale;
  const height = (component.height || 100) * scale;

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

  console.log("shape", geoShapeProps);

  if (frameId) {
    geoShapeProps.parentId = frameId;
  }

  editor.createShape(geoShapeProps);
}
