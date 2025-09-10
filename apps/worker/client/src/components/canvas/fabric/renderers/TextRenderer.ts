import type { CanvasComponent } from '../../../../types/canvas'

/**
 * Render a text component using Fabric.js
 */
export async function renderTextComponent(
  component: CanvasComponent,
  scale: number
): Promise<any | null> {
  try {
    const { Textbox } = await import('fabric')
    
    // Extract and scale position and dimensions
    const x = (component.x || 0) * scale
    const y = (component.y || 0) * scale
    const width = (component.width || 100) * scale
    const height = (component.height || 50) * scale
    const rotation = component.rotation || 0
    const opacity = component.opacity !== undefined ? component.opacity : 1
    
    // Extract text content
    const textContent = typeof component.content === 'string' ? component.content :
                        component.content?.text ||
                        component.content?.content ||
                        'Text Component'
    
    // Extract styling with scaling
    const fontSize = (component.style?.fontSize || 16) * scale
    const fontFamily = component.style?.fontFamily || 'Arial, sans-serif'
    const textFill = component.style?.color || component.style?.fill || '#000000'
    const fontWeight = component.style?.fontWeight || 'normal'
    const fontStyle = component.style?.fontStyle || 'normal'
    const textAlign = component.style?.textAlign || 'left'
    
    const fabricObject = new Textbox(textContent, {
      left: x,
      top: y,
      width: width,
      height: height,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: textFill,
      fontWeight: fontWeight,
      fontStyle: fontStyle,
      textAlign: textAlign,
      selectable: true,
      editable: true,
      splitByGrapheme: false,
      // Enable text wrapping
      lineHeight: 1.16,
      charSpacing: 0,
      // Prevent text from growing beyond the set width
      lockUniScaling: true
    })
    
    // Apply common properties
    fabricObject.set({
      angle: rotation,
      opacity: opacity,
      componentId: component.id,
      componentType: component.type,
      zIndex: component.zIndex ?? 0
    })
    
    console.log('Created text object:', fabricObject.type, fabricObject)
    return fabricObject
  } catch (error) {
    console.warn('Error rendering text component:', error)
    return null
  }
}