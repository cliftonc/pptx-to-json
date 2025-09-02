import { createShapeId, AssetRecordType, type Editor } from '@tldraw/tldraw'
import type { PowerPointComponent } from 'ppt-paste-parser'
import { createComponentShapeId } from '../utils/tldrawHelpers'
import { calculateFrameRelativePosition, degreesToRadians } from '../utils/coordinateHelpers'

export async function renderImageComponent(
  component: PowerPointComponent,
  index: number,
  frameX: number,
  frameY: number,
  editor: Editor,
  slideIndex: number,
  frameId: string | null
) {
  console.log(`\n--- Image ${index} ---`)
  console.log('Component:', {
    content: component.content,
    hasImageUrl: !!(component.metadata?.imageUrl),
    imageType: component.metadata?.imageType,
    size: component.metadata?.imageSize
  })
  
  const imageId = createShapeId(createComponentShapeId('image', slideIndex, component.id || index))
  
  console.log(`Image dimensions from parser: ${component.width} x ${component.height}`)
  
  const scale = 1
  const { x, y } = calculateFrameRelativePosition(
    component.x || 0,
    component.y || 0,
    frameX,
    frameY,
    scale,
    !!frameId
  )
  
  // Use exact PowerPoint dimensions
  const width = component.width || 200
  const height = component.height || 150
  console.log(`Using exact PowerPoint dimensions: ${width}x${height}`)
  
  // Check if we have a data URL for the image
  if (component.metadata?.imageUrl && component.metadata.imageUrl.startsWith('data:')) {
    console.log(`✓ Creating image shape with data URL (${component.metadata.imageSize} bytes)`)
    
    const dataUrl = component.metadata.imageUrl
    
    try {
      console.log(`Attempting to create image with dimensions: ${width}x${height}`)
      
      // Convert data URL to blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      
      // Create asset ID using the correct tldraw v3 API
      const assetId = AssetRecordType.createId()
      
      // Create the asset using the correct API
      editor.createAssets([{
        id: assetId,
        type: 'image',
        typeName: 'asset',
        props: {
          name: component.metadata?.name || 'image',
          src: dataUrl,
          w: width,
          h: height,
          mimeType: blob.type,
          isAnimated: false
        },
        meta: {}
      }])
      
      // Create image shape using the asset and parent it to frame
      const imageShapeProps: any = {
        id: imageId,
        type: 'image',
        x,
        y,
        rotation: component.rotation ? degreesToRadians(component.rotation) : 0,
        props: {
          assetId,
          w: width,
          h: height
        }
      }
      
      if (frameId) {
        imageShapeProps.parentId = frameId
      }
      
      editor.createShape(imageShapeProps)
      console.log(`✓ Image created successfully using asset`)
      
    } catch (error) {
      console.warn(`❌ Failed to create image asset:`, error)
      // Fallback: create a placeholder rectangle
      createPlaceholderShape(editor, slideIndex, component, index, x, y, width, height, frameId)
    }
  } else {
    console.log(`❌ No valid image data URL found, creating placeholder`)
    // Create a placeholder rectangle for images without data
    createPlaceholderShape(editor, slideIndex, component, index, x, y, width, height, frameId)
  }
}

function createPlaceholderShape(
  editor: Editor,
  slideIndex: number,
  component: PowerPointComponent,
  index: number,
  x: number,
  y: number,
  width: number,
  height: number,
  frameId: string | null
) {
  const placeholderProps: any = {
    id: createShapeId(createComponentShapeId('placeholder', slideIndex, component.id || index)),
    type: 'geo',
    x,
    y,
    props: {
      geo: 'rectangle',
      color: 'grey',
      fill: 'pattern',
      size: 'm',
      w: width,
      h: height
    }
  }
  
  if (frameId) {
    placeholderProps.parentId = frameId
  }
  
  editor.createShape(placeholderProps)
}