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
  frameId: string | null,
  frameDimensions?: { width: number; height: number }
) {
  const imageId = createShapeId(createComponentShapeId('image', slideIndex, component.id || index))
  
  // Detect if this is a background image
  const isBackgroundImage = component.x === 0 && component.y === 0 && 
                           component.content === "Background Image" &&
                           frameDimensions;
  
  const scale = 1
  let imageX = component.x || 0
  let imageY = component.y || 0
  
  let width = component.width || 200
  let height = component.height || 150
  
  if (isBackgroundImage && frameDimensions) {
    // For background images, scale to fill the entire frame
    // Calculate scale to cover the entire frame (like CSS object-fit: cover)
    const scaleX = frameDimensions.width / width
    const scaleY = frameDimensions.height / height
    const imageScale = Math.max(scaleX, scaleY) // Use larger scale to ensure full coverage
    
    width = Math.round(width * imageScale)
    height = Math.round(height * imageScale)
  }
  
  // For background images that are scaled larger than the frame, center them
  if (isBackgroundImage && frameDimensions) {
    // If scaled image is larger than frame, center it
    if (width > frameDimensions.width) {
      imageX = -(width - frameDimensions.width) / 2
    }
    if (height > frameDimensions.height) {
      imageY = -(height - frameDimensions.height) / 2
    }
  }
  
  const { x, y } = calculateFrameRelativePosition(
    imageX,
    imageY,
    frameX,
    frameY,
    scale,
    !!frameId
  )
  
  // Check if we have an image URL (either data URL or regular URL)
  if (component.metadata?.imageUrl) {
    const imageUrl = component.metadata.imageUrl
    
    try {
      // Create asset ID using the correct tldraw v3 API
      const assetId = AssetRecordType.createId()
      
      let mimeType = 'image/jpeg' // default
      
      // For data URLs, extract the MIME type
      if (imageUrl.startsWith('data:')) {
        const mimeMatch = imageUrl.match(/data:([^;]+);/)
        if (mimeMatch) {
          mimeType = mimeMatch[1]
        }
      } else {
        // For regular URLs, try to determine MIME type from extension
        const urlLower = imageUrl.toLowerCase()
        if (urlLower.includes('.png')) mimeType = 'image/png'
        else if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) mimeType = 'image/jpeg'
        else if (urlLower.includes('.gif')) mimeType = 'image/gif'
        else if (urlLower.includes('.webp')) mimeType = 'image/webp'
        else if (urlLower.includes('.svg')) mimeType = 'image/svg+xml'
      }
      
      // Create the asset using the correct API
      editor.createAssets([{
        id: assetId,
        type: 'image',
        typeName: 'asset',
        props: {
          name: component.metadata?.name || 'image',
          src: imageUrl,
          w: width,
          h: height,
          mimeType: mimeType,
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
      
    } catch (error) {
      // Fallback: create a placeholder rectangle
      createPlaceholderShape(editor, slideIndex, component, index, x, y, width, height, frameId)
    }
  } else {
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