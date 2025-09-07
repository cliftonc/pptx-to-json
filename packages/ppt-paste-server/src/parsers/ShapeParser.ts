/**
 * Shape component parser for PowerPoint shapes without text content
 */

import { BaseParser } from "./BaseParser.js";
import { emuToPixels } from "../utils/constants.js";
import {
  XMLNode,
  ShapeComponent,
  NormalizedShapeComponent,
  FillInfo,
  BorderInfo,
  GeometryInfo,
  EffectsInfo,
} from "../types/index.js";

export class ShapeParser extends BaseParser {
  /**
   * Parse shape component from normalized data (works for both PPTX and clipboard)
   * @param shapeComponent - Normalized shape component
   * @param componentIndex - Component index
   * @param slideIndex - Slide index
   * @returns Parsed shape component
   */
  static async parseFromNormalized(
    shapeComponent: NormalizedShapeComponent,
    componentIndex: number,
    slideIndex: number,
    zIndex: number,
  ): Promise<ShapeComponent | null> {
    const { spPr, nvSpPr, namespace, style } = shapeComponent;

    if (!spPr) {
      throw new Error("No spPr found in normalized shape component");
    }

    // Extract positioning from spPr (namespaces already stripped)
    const xfrm = BaseParser.getNode(spPr, "xfrm");
    const transform = ShapeParser.parseTransform(xfrm);

    // Skip if shape has no dimensions
    if (transform.width === 0 && transform.height === 0) return null;

    // Parse shape geometry
    const geometry = ShapeParser.parseGeometry(spPr);
    const shapeType = geometry.type;

    // Extract component info from nvSpPr
    const componentName = BaseParser.getString(
      nvSpPr,
      "cNvPr.$name",
      `shape-${componentIndex}`,
    );

    // Parse styling from spPr and style data
    const fill = ShapeParser.parseFill(spPr, style || null);
    const border = ShapeParser.parseBorder(spPr, style || null);
    const effects = ShapeParser.parseEffects(spPr);

    return {
      id: componentName,
      type: "shape",
      content: `${shapeType} shape`,
      x: transform.x,
      y: transform.y,
      width: transform.width,
      height: transform.height,
      rotation: transform.rotation || 0,
      slideIndex,
      zIndex,
      style: {
        fillColor: fill.color,
        borderColor: border.color,
        borderWidth: border.width,
        borderStyle: border.style,
        fillOpacity: fill.opacity,
        rotation: transform.rotation || 0,
        ...effects,
      },
      shapeType: geometry.type,
      geometry: geometry,
      metadata: {
        namespace,
        geometry,
        originalFormat: "normalized",
        shapeType: geometry.type,
        hasEffects: effects.effects.length > 0,
        hasFill: !!fill.color,
        hasBorder: border.type !== "none",
      },
    };
  }

  /**
   * Parse shape geometry information
   * @param spPr - Shape properties
   * @returns geometry info
   */
  static parseGeometry(spPr: XMLNode): GeometryInfo {
    const prstGeom = BaseParser.getNode(spPr, "prstGeom");
    if (prstGeom) {
      const preset = BaseParser.getString(prstGeom, "$prst", "rect");
      return {
        type: this.getShapeTypeName(preset),
        preset: preset,
        isCustom: false,
      };
    }

    const custGeom = BaseParser.getNode(spPr, "custGeom");
    if (custGeom) {
      return {
        type: "custom",
        preset: null,
        isCustom: true,
        paths: this.parseCustomGeometry(custGeom),
      };
    }

    return {
      type: "rectangle",
      preset: "rect",
      isCustom: false,
    };
  }

  /**
   * Get human-readable shape type name from preset
   * @param preset - PowerPoint preset name
   * @returns readable shape type
   */
  static getShapeTypeName(preset: string): string {
    const shapeTypes: Record<string, string> = {
      rect: "rectangle",
      roundRect: "rounded rectangle",
      ellipse: "ellipse",
      triangle: "triangle",
      rtTriangle: "right triangle",
      parallelogram: "parallelogram",
      trapezoid: "trapezoid",
      diamond: "diamond",
      pentagon: "pentagon",
      hexagon: "hexagon",
      octagon: "octagon",
      star4: "4-point star",
      star5: "5-point star",
      star6: "6-point star",
      star8: "8-point star",
      star10: "10-point star",
      star12: "12-point star",
      star16: "16-point star",
      star24: "24-point star",
      star32: "32-point star",
      plus: "plus",
      minus: "minus",
      mult: "multiply",
      div: "divide",
      equal: "equal",
      notEqual: "not equal",
      line: "line",
      lineInv: "inverted line",
      round1Rect: "single rounded corner rectangle",
      round2SameRect: "same-side rounded corners rectangle",
      round2DiagRect: "diagonal rounded corners rectangle",
      snipRoundRect: "snip and round rectangle",
      snip1Rect: "single snipped corner rectangle",
      snip2SameRect: "same-side snipped corners rectangle",
      snip2DiagRect: "diagonal snipped corners rectangle",
      plaque: "plaque",
      teardrop: "teardrop",
      homePlate: "home plate",
      chevron: "chevron",
      pieWedge: "pie wedge",
      pie: "pie",
      blockArc: "block arc",
      donut: "donut",
      noSmoking: "no smoking",
      rightArrow: "right arrow",
      leftArrow: "left arrow",
      upArrow: "up arrow",
      downArrow: "down arrow",
      stripedRightArrow: "striped right arrow",
      notchedRightArrow: "notched right arrow",
      bentUpArrow: "bent up arrow",
      leftRightArrow: "left right arrow",
      upDownArrow: "up down arrow",
      leftUpArrow: "left up arrow",
      leftRightUpArrow: "left right up arrow",
      quadArrow: "quad arrow",
      callout1: "callout",
      callout2: "callout 2",
      callout3: "callout 3",
      accentCallout1: "accent callout",
      accentCallout2: "accent callout 2",
      accentCallout3: "accent callout 3",
      borderCallout1: "border callout",
      borderCallout2: "border callout 2",
      borderCallout3: "border callout 3",
      accentBorderCallout1: "accent border callout",
      accentBorderCallout2: "accent border callout 2",
      accentBorderCallout3: "accent border callout 3",
      ribbon: "ribbon",
      ribbon2: "ribbon 2",
      verticalScroll: "vertical scroll",
      horizontalScroll: "horizontal scroll",
      wave: "wave",
      doubleWave: "double wave",
    };

    return shapeTypes[preset] || preset || "shape";
  }

  /**
   * Parse fill properties
   * @param spPr - Shape properties
   * @param style - Style properties (optional)
   * @returns fill information
   */
  static parseFill(spPr: XMLNode, style: XMLNode | null = null): FillInfo {
    const solidFill = BaseParser.getNode(spPr, "solidFill");
    if (solidFill) {
      return {
        type: "solid",
        color: this.parseColor(solidFill),
        opacity: this.parseOpacity(solidFill),
      };
    }

    const gradFill = BaseParser.getNode(spPr, "gradFill");
    if (gradFill) {
      return this.parseGradientFill(gradFill);
    }

    const pattFill = BaseParser.getNode(spPr, "pattFill");
    if (pattFill) {
      return {
        type: "pattern",
        color: this.parseColor(pattFill),
        opacity: 1,
      };
    }

    if (BaseParser.getNode(spPr, "noFill")) {
      return {
        type: "none",
        color: "transparent",
        opacity: 0,
      };
    }

    if (style) {
      const styleFill = this.parseFillFromStyle(style);
      if (styleFill) return styleFill;
    }

    return {
      type: "none",
      color: "transparent",
      opacity: 0,
    };
  }

  /**
   * Parse border/line properties
   * @param spPr - Shape properties
   * @param style - Style properties (optional)
   * @returns border information
   */
  static parseBorder(spPr: XMLNode, style: XMLNode | null = null): BorderInfo {
    const ln = BaseParser.getNode(spPr, "ln");
    if (!ln) {
      if (style) {
        const styleBorder = this.parseBorderFromStyle(style);
        if (styleBorder) return styleBorder;
      }
      return {
        type: "none",
        color: "transparent",
        width: 0,
        style: "none",
      };
    }

    const width = ln.$ && ln.$w ? emuToPixels(parseInt(ln.$w)) : 0;
    const compound = (ln.$ && ln.$cmpd) || "sng";
    const cap = (ln.$ && ln.$cap) || "flat";

    let color = "transparent";
    const solidFill = BaseParser.getNode(ln, "solidFill");
    if (solidFill) {
      color = this.parseColor(solidFill);
    }

    const dashStyle = this.parseDashStyle(ln);

    // If no explicit width is set and no fill is defined, treat as no border
    if (width === 0 && color === "transparent") {
      return {
        type: "none",
        color: "transparent",
        width: 0,
        style: "none",
      };
    }

    return {
      type: "solid",
      color: color,
      width: width,
      style: dashStyle,
      cap: cap,
      compound: compound,
    };
  }

  /**
   * Parse dash style from line properties
   * @param ln - Line properties
   * @returns CSS border-style value
   */
  static parseDashStyle(ln: XMLNode): string {
    const prstDash = BaseParser.getString(ln, "prstDash.$val", "");
    if (!prstDash) return "solid";

    switch (prstDash) {
      case "dash":
        return "dashed";
      case "dashDot":
        return "dashed";
      case "dot":
        return "dotted";
      case "lgDash":
        return "dashed";
      case "lgDashDot":
        return "dashed";
      case "lgDashDotDot":
        return "dashed";
      case "solid":
      default:
        return "solid";
    }
  }

  /**
   * Parse gradient fill
   * @param gradFill - Gradient fill properties
   * @returns gradient information
   */
  static parseGradientFill(gradFill: XMLNode): FillInfo {
    const gradientStops = BaseParser.getArray(gradFill, "gsLst.gs", []);
    if (gradientStops.length > 0) {
      const firstStop = gradientStops[0];
      const solidFill = BaseParser.getNode(firstStop, "solidFill");
      if (solidFill) {
        return {
          type: "gradient",
          color: this.parseColor(solidFill),
          opacity: this.parseOpacity(solidFill),
        };
      }
    }

    return {
      type: "gradient",
      color: "#FFFFFF",
      opacity: 1,
    };
  }

  /**
   * Parse opacity from fill properties
   * @param fill - Fill properties
   * @returns opacity (0-1)
   */
  static parseOpacity(fill: XMLNode): number {
    return 1;
  }

  /**
   * Parse shape effects (shadows, glows, etc.)
   * @param spPr - Shape properties
   * @returns effects information
   */
  static parseEffects(spPr: XMLNode): EffectsInfo {
    const effects: EffectsInfo = {
      effects: [],
    };

    const outerShdw = BaseParser.getNode(spPr, "effectLst.outerShdw");
    if (outerShdw) {
      const blur = BaseParser.getNumber(outerShdw, "$blurRad", 0);
      const distance = BaseParser.getNumber(outerShdw, "$dist", 0);
      const directionUnits = BaseParser.getNumber(outerShdw, "$dir", 0);
      const direction = directionUnits / 60000;

      effects.boxShadow = `${distance * Math.cos((direction * Math.PI) / 180)}px ${distance * Math.sin((direction * Math.PI) / 180)}px ${emuToPixels(blur)}px rgba(0,0,0,0.3)`;
      effects.effects.push("shadow");
    }

    const glow = BaseParser.getNode(spPr, "effectLst.glow");
    if (glow) {
      effects.effects.push("glow");
    }

    return effects;
  }

  /**
   * Parse custom geometry paths
   * @param custGeom - Custom geometry
   * @returns simplified path information
   */
  static parseCustomGeometry(custGeom: XMLNode): any[] {
    return [];
  }

  /**
   * Parse fill properties from style element
   * @param style - Style properties
   * @param themeColors - Optional theme colors
   * @returns fill information or null
   */
  static parseFillFromStyle(style: XMLNode): FillInfo | null {
    const fillRef = BaseParser.getNode(style, "fillRef");
    if (fillRef) {
      const schemeClr = BaseParser.getNode(fillRef, "schemeClr");
      const srgbClr = BaseParser.getNode(fillRef, "srgbClr");

      if (srgbClr && (srgbClr as any).$val) {
        return {
          type: "solid",
          color: "#" + (srgbClr as any).$val,
          opacity: 1,
        };
      }

      if (schemeClr && (schemeClr as any).$val) {
        const color = BaseParser.parseColor({ schemeClr });
        if (color && color !== "#000000") { // Don't use default fallback color
          return {
            type: "solid",
            color: color,
            opacity: 1,
          };
        }
      }
    }

    return null;
  }

  /**
   * Parse border properties from style element
   * @param style - Style properties
   * @returns border information or null
   */
  static parseBorderFromStyle(style: XMLNode): BorderInfo | null {
    const lnRef = BaseParser.getNode(style, "lnRef");
    if (lnRef) {
      const schemeClr = BaseParser.getNode(lnRef, "schemeClr");
      const srgbClr = BaseParser.getNode(lnRef, "srgbClr");

      if (srgbClr && (srgbClr as any).$val) {
        return {
          type: "solid",
            color: "#" + (srgbClr as any).$val,
            width: 1,
            style: "solid",
        };
      }

      if (schemeClr && (schemeClr as any).$val) {
        const val = (schemeClr as any).$val;
        if (val === "dk1" || val === "tx1") {
          return {
            type: "solid",
            color: "#000000",
            width: 1,
            style: "solid",
          };
        }
        return {
          type: "none",
          color: "transparent",
          width: 0,
          style: "none",
        };
      }
    }

    return null;
  }

  /**
   * Apply shade to a color (makes it darker)
   * @param color - Hex color (e.g., '#4472C4')
   * @param shadeVal - Shade value (percentage, e.g., 50000 = 50%)
   * @returns modified hex color
   */
  static applyShade(color: string, shadeVal: number): string {
    if (!color || !color.startsWith("#")) return color;
    const shadePercent = Math.min(100, Math.max(0, shadeVal / 1000)) / 100;
    const hex = color.slice(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const shadedR = Math.round(r * (1 - shadePercent));
    const shadedG = Math.round(g * (1 - shadePercent));
    const shadedB = Math.round(b * (1 - shadePercent));
    const toHex = (n: number) =>
      Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0");
    return `#${toHex(shadedR)}${toHex(shadedG)}${toHex(shadedB)}`.toUpperCase();
  }

}
