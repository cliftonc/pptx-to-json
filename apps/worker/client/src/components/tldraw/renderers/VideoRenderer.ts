import { createShapeId, type Editor } from '@tldraw/tldraw'
import type { PowerPointComponent } from 'ppt-paste-parser'
import { createComponentShapeId } from '../utils/tldrawHelpers'
import { calculateFrameRelativePosition, degreesToRadians } from '../utils/coordinateHelpers'

export async function renderVideoComponent(
  component: PowerPointComponent,
  index: number,
  frameX: number,
  frameY: number,
  editor: Editor,
  slideIndex: number,
  frameId: string | null
) {
  const videoId = createShapeId(createComponentShapeId('video', slideIndex, component.id || index))
  
  const scale = 1
  const videoX = component.x || 0
  const videoY = component.y || 0
  const width = component.width || 400
  const height = component.height || 300
  
  const { x, y } = calculateFrameRelativePosition(
    videoX,
    videoY,
    frameX,
    frameY,
    scale,
    !!frameId
  )
  
  // Check if we have a video URL
  const videoUrl = component.metadata?.videoUrl || component.url
  const thumbnailSrc = component.metadata?.thumbnailSrc || component.thumbnailSrc
  const embedType = component.metadata?.embedType || component.embedType
  
  if (videoUrl) {
    try {
      // For now, render videos as embed shapes with the video URL
      // TLDraw has built-in support for YouTube and other video embeds
      
      let embedUrl = videoUrl
      
      // Convert YouTube URLs to embed format if needed
      if (embedType === 'youtube' && !videoUrl.includes('/embed/')) {
        const videoId = extractYouTubeVideoId(videoUrl)
        if (videoId) {
          embedUrl = `https://www.youtube.com/embed/${videoId}`
        }
      }
      
      // Create embed shape for the video
      const embedShapeProps: any = {
        id: videoId,
        type: 'embed',
        x,
        y,
        rotation: component.rotation ? degreesToRadians(component.rotation) : 0,
        props: {
          url: embedUrl,
          w: width,
          h: height
        }
      }
      
      if (frameId) {
        embedShapeProps.parentId = frameId
      }
      
      editor.createShape(embedShapeProps)
      
    } catch (error) {
      console.warn('Failed to create video embed, falling back to placeholder:', error)
      // Fallback: create a placeholder shape with video info
      createVideoPlaceholder(editor, slideIndex, component, index, x, y, width, height, frameId, videoUrl, thumbnailSrc)
    }
  } else {
    // Create a placeholder for videos without URL
    createVideoPlaceholder(editor, slideIndex, component, index, x, y, width, height, frameId, null, thumbnailSrc)
  }
}

function createVideoPlaceholder(
  editor: Editor,
  slideIndex: number,
  component: PowerPointComponent,
  index: number,
  x: number,
  y: number,
  width: number,
  height: number,
  frameId: string | null,
  videoUrl: string | null,
  _thumbnailSrc: string | null
) {
  const placeholderId = createShapeId(createComponentShapeId('video-placeholder', slideIndex, component.id || index))
  
  // Create a rectangle placeholder with video styling
  const placeholderShapeProps: any = {
    id: placeholderId,
    type: 'geo',
    x,
    y,
    rotation: component.rotation ? degreesToRadians(component.rotation) : 0,
    props: {
      geo: 'rectangle',
      w: width,
      h: height,
      color: 'red',
      fill: 'semi',
      dash: 'dotted',
      size: 'm',
      text: `🎬 VIDEO\n${component.title || component.content || 'Video Component'}\n${videoUrl ? `URL: ${videoUrl.substring(0, 50)}...` : 'No URL found'}`
    }
  }
  
  if (frameId) {
    placeholderShapeProps.parentId = frameId
  }
  
  editor.createShape(placeholderShapeProps)
}

function extractYouTubeVideoId(url: string): string | null {
  // YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    /youtube\.com\/embed\/([^"&?\/\s]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}