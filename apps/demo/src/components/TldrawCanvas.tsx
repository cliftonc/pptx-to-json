import { useEffect, useRef, useState } from 'react'
import { EditorState as TextEditorState } from '@tiptap/pm/state'
import { Extension } from '@tiptap/core'
import { 
  Tldraw, 
  Editor, 
  createShapeId, 
  toRichText, 
  AssetRecordType, 
  tipTapDefaultExtensions, 
  defaultAddFontsFromNode, 
  type TLTextOptions,
  type TLComponents,
  useEditor,
  useValue,
  DefaultRichTextToolbar,
  DefaultRichTextToolbarContent,
  stopEventPropagation
} from '@tldraw/tldraw'
import FontFamily from '@tiptap/extension-font-family'
import { TextStyle } from '@tiptap/extension-text-style'

// FontSize extension for TipTap v2.26.1
const FontSize = Extension.create({
  name: 'fontSize',
  
  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run()
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run()
      },
    }
  },
})
import type { PowerPointComponent, PowerPointSlide } from 'ppt-paste-parser'
import '@tldraw/tldraw/tldraw.css'

// Custom CSS for toolbar select elements
const customToolbarStyles = `
.tlui-buttons__horizontal select {
    border: 0;
    background: transparent;
    margin: 0 8px;
}
`

interface TldrawCanvasProps {
  components: PowerPointComponent[]
  slides?: PowerPointSlide[]
}

// Font options for toolbar
const fontOptions = [
  { label: 'Default', value: 'DEFAULT' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Courier New', value: 'Courier New' },
]

const fontSizeOptions = [
  { label: 'Default', value: 'DEFAULT' },
  { label: '8pt', value: '8pt' },
  { label: '9pt', value: '9pt' },
  { label: '10pt', value: '10pt' },
  { label: '11pt', value: '11pt' },
  { label: '12pt', value: '12pt' },
  { label: '14pt', value: '14pt' },
  { label: '16pt', value: '16pt' },
  { label: '18pt', value: '18pt' },
  { label: '20pt', value: '20pt' },
  { label: '24pt', value: '24pt' },
  { label: '28pt', value: '28pt' },
  { label: '32pt', value: '32pt' },
  { label: '36pt', value: '36pt' },
  { label: '48pt', value: '48pt' },
  { label: '72pt', value: '72pt' },
]

// Custom toolbar UI components for TLDraw
const uiComponents: TLComponents = {
  RichTextToolbar: () => {
    const editor = useEditor()
    const textEditor = useValue('textEditor', () => editor.getRichTextEditor(), [editor])
    const [_, setTextEditorState] = useState<TextEditorState | null>(textEditor?.state ?? null)

    // Set up text editor transaction listener.
    useEffect(() => {
      if (!textEditor) {
        setTextEditorState(null)
        return
      }

      const handleTransaction = ({ editor: textEditor }: { editor: any }) => {
        setTextEditorState(textEditor.state)
      }

      textEditor.on('transaction', handleTransaction)
      return () => {
        textEditor.off('transaction', handleTransaction)
        setTextEditorState(null)
      }
    }, [textEditor])

    if (!textEditor) return null

    const currentFontFamily = textEditor?.getAttributes('textStyle').fontFamily ?? 'DEFAULT'
    const currentFontSize = textEditor?.getAttributes('textStyle').fontSize ?? 'DEFAULT'

    return (
      <DefaultRichTextToolbar>
        <select
          value={currentFontFamily}
          onPointerDown={stopEventPropagation}
          onChange={(e) => {
            if (e.target.value === 'DEFAULT') {
              textEditor?.chain().focus().unsetFontFamily().run()
            } else {
              textEditor?.chain().focus().setFontFamily(e.target.value).run()
            }
          }}
        >
          {fontOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={currentFontSize}
          onPointerDown={stopEventPropagation}
          onChange={(e) => {
            if (e.target.value === 'DEFAULT') {
              textEditor?.chain().focus().unsetFontSize().run()
            } else {
              textEditor?.chain().focus().setFontSize(e.target.value).run()
            }
          }}
        >
          {fontSizeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <DefaultRichTextToolbarContent textEditor={textEditor} />
      </DefaultRichTextToolbar>
    )
  },
}

// Text options configuration to support FontSize and TextStyle marks
const textOptions: Partial<TLTextOptions> = {
  tipTapConfig: {
    extensions: [...tipTapDefaultExtensions, FontFamily, FontSize, TextStyle],
  },
  addFontsFromNode(node, state, addFont) {
    state = defaultAddFontsFromNode(node, state, addFont)

    // Handle textStyle marks with fontSize and fontFamily
    for (const mark of node.marks) {
      if (mark.type.name === 'textStyle' && mark.attrs) {
        // Handle fontFamily
        if (mark.attrs.fontFamily && mark.attrs.fontFamily !== 'DEFAULT' && mark.attrs.fontFamily !== state.family) {
          state = { ...state, family: mark.attrs.fontFamily }
        }
        // Handle fontSize - note: fontSize is handled by TipTap, not font loading
      }
    }

    return state
  },
}


export default function TldrawCanvas({ components, slides }: TldrawCanvasProps) {
  const editorRef = useRef<Editor | null>(null)

  // Inject custom CSS for toolbar styling
  useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = customToolbarStyles
    document.head.appendChild(styleElement)
    
    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  const handleMount = (editor: Editor) => {
    editorRef.current = editor
    if (slides && slides.length > 0) {
      drawSlides(slides, editor)
    } else if (components && components.length > 0) {
      // Legacy fallback
      drawComponents(components, editor)
    }
  }

  const drawSlides = async (slides: PowerPointSlide[], editor?: Editor) => {
    const editorInstance = editor || editorRef.current
    if (!editorInstance || !slides.length) return

    console.log(`🖼️ Drawing ${slides.length} slides with frames`)

    // Clear existing shapes
    const allShapes = editorInstance.getCurrentPageShapes()
    editorInstance.deleteShapes(allShapes.map(shape => shape.id))

    // Standard PowerPoint slide dimensions (16:9 widescreen)
    // PowerPoint uses 1280×720 as a common resolution, with some padding for components that extend beyond
    const SLIDE_SPACING = 200  // Increased vertical spacing
    const SLIDES_PER_ROW = 4   // 4 slides per row

    // Calculate maximum bounds across all slides for uniform frame sizing
    let maxSlideWidth = 1280  // Standard 16:9 PowerPoint width
    let maxSlideHeight = 720  // Standard 16:9 PowerPoint height
    const PADDING = 50
    
    slides.forEach(slide => {
      const componentBounds = calculateComponentBounds(slide.components)
      maxSlideWidth = Math.max(maxSlideWidth, componentBounds.maxX + PADDING)
      maxSlideHeight = Math.max(maxSlideHeight, componentBounds.maxY + PADDING)
    })

    console.log(`📏 Using uniform slide size: ${maxSlideWidth}x${maxSlideHeight} for all slides`)

    for (let slideIndex = 0; slideIndex < slides.length; slideIndex++) {
      const slide = slides[slideIndex]
      
      // Use uniform slide dimensions for all frames
      const slideWidth = maxSlideWidth
      const slideHeight = maxSlideHeight
      
      // Calculate slide position in grid layout
      const col = slideIndex % SLIDES_PER_ROW
      const row = Math.floor(slideIndex / SLIDES_PER_ROW)
      const slideX = col * (slideWidth + SLIDE_SPACING) + 50
      const slideY = row * (slideHeight + SLIDE_SPACING) + 50

      console.log(`📄 Drawing slide ${slideIndex + 1} at (${slideX}, ${slideY}) size ${slideWidth}x${slideHeight} with ${slide.components.length} components`)

      // Create frame for the slide
      const frameId = createShapeId(`slide-frame-${slideIndex}`)
      editorInstance.createShape({
        id: frameId,
        type: 'frame',
        x: slideX,
        y: slideY,
        props: {
          w: slideWidth,
          h: slideHeight,
          name: slide.metadata?.name || `Slide ${slide.slideNumber}`
        }
      })

      // Draw all components within this slide frame - await to prevent race conditions
      await drawComponentsInFrame(slide.components, slideX, slideY, editorInstance, slideIndex, frameId)
    }

    // Fit the viewport to show all slides
    if (slides.length > 0) {
      editorInstance.zoomToFit({ animation: { duration: 500 } })
    }
  }

  const drawComponents = async (components: PowerPointComponent[], editor?: Editor) => {
    const editorInstance = editor || editorRef.current
    if (!editorInstance || !components.length) return

    console.log(`🖼️ Drawing ${components.length} components without slides structure`)

    // Clear existing shapes
    const allShapes = editorInstance.getCurrentPageShapes()
    editorInstance.deleteShapes(allShapes.map(shape => shape.id))

    // Draw components without slide frames (legacy mode) - no frame parent
    await drawComponentsInFrame(components, 0, 0, editorInstance, 0, null)

    // Fit the viewport to show all components
    editorInstance.zoomToFit({ animation: { duration: 500 } })
  }

  const calculateComponentBounds = (components: PowerPointComponent[]) => {
    if (components.length === 0) {
      return { maxX: 0, maxY: 0 };
    }
    
    let maxX = 0;
    let maxY = 0;
    
    components.forEach(comp => {
      const compMaxX = (comp.x || 0) + (comp.width || 0);
      const compMaxY = (comp.y || 0) + (comp.height || 0);
      
      if (compMaxX > maxX) maxX = compMaxX;
      if (compMaxY > maxY) maxY = compMaxY;
    });
    
    return { maxX, maxY };
  };

  const drawComponentsInFrame = async (components: PowerPointComponent[], frameX: number, frameY: number, editorInstance: Editor, slideIndex: number, frameId: any) => {
    // Sort components by zIndex to ensure correct layering order
    // Components without zIndex will be rendered first (zIndex defaults to 0)
    const sortedComponents = [...components].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
    
    console.log('🎨 Rendering components in zIndex order:', sortedComponents.map(c => `${c.type}(z:${c.zIndex ?? 0})`).join(', '))
    
    // Render each component in correct z-order
    for (let index = 0; index < sortedComponents.length; index++) {
      const component = sortedComponents[index]
      
      switch (component.type) {
        case 'text':
          await renderTextComponent(component, index, frameX, frameY, editorInstance, slideIndex, frameId)
          break
        case 'shape':
          await renderShapeComponent(component, index, frameX, frameY, editorInstance, slideIndex, frameId)
          break
        case 'image':
          await renderImageComponent(component, index, frameX, frameY, editorInstance, slideIndex, frameId)
          break
        case 'table':
          await renderTableComponent(component, index, frameX, frameY, editorInstance, slideIndex, frameId)
          break
        default:
          console.warn(`Unknown component type: ${component.type}`)
      }
    }
  }

  const renderTextComponent = async (component: PowerPointComponent, index: number, frameX: number, frameY: number, editorInstance: Editor, slideIndex: number, frameId: any) => {
    const shapeId = createShapeId(`text-${slideIndex}-${component.id || index}`)
    
    // PowerPoint coordinates look good - try with less scaling or no scaling
    const scale = 1 // Try no scaling first since coordinates look reasonable (629, 413, etc.)
    // When inside a frame, use component's original coordinates relative to frame
    let x = frameId ? (component.x || 0) * scale : frameX + (component.x || 0) * scale
    let y = frameId ? (component.y || 0) * scale : frameY + (component.y || 0) * scale
    
    // Adjust position for rotation - PowerPoint gives us top-left of unrotated shape
    // We need to calculate where the top-left should be after rotation around center
    if (component.rotation && component.rotation !== 0) {
      console.log(`Text rotation: ${component.rotation}° at original position (${x}, ${y})`)
      
      const width = component.width || 0
      const height = component.height || 0
      const angleRad = (component.rotation * Math.PI) / 180
      
      // Original center point
      const originalCenterX = x + width / 2
      const originalCenterY = y + height / 2
      
      // The center stays the same, we need to find new top-left after rotation
      // When rotating around center, the new top-left position is:
      const newX = originalCenterX - (width / 2) * Math.cos(angleRad) + (height / 2) * Math.sin(angleRad)
      const newY = originalCenterY - (width / 2) * Math.sin(angleRad) - (height / 2) * Math.cos(angleRad)
      
      x = newX
      y = newY
      console.log(`Text adjusted position for TLDraw: (${x}, ${y})`)
    }
    
    // Check if richText contains fontSize in textStyle marks
    const richTextData = (component as any).richText;
    
    // Recursive function to check for fontSize in nested structures
    const hasTextStyleFontSize = (content: any[]): boolean => {
      if (!content) return false;
      
      return content.some((item: any) => {
        if (item.type === 'text' && item.marks) {
          // Check if this text node has textStyle with fontSize
          return item.marks.some((mark: any) => 
            mark.type === 'textStyle' && mark.attrs?.fontSize
          );
        } else if (item.content) {
          // Recursively check nested content (for listItems, paragraphs, etc.)
          return hasTextStyleFontSize(item.content);
        }
        return false;
      });
    };
    
    const hasRichTextFontSize = richTextData && hasTextStyleFontSize(richTextData.content);
    console.log('🎯 hasRichTextFontSize:', hasRichTextFontSize);
    
    // Convert PowerPoint font size (pt) to TLDraw size categories as fallback
    // Only use this when richText doesn't have fontSize information
    let tldrawSize: 's' | 'm' | 'l' | 'xl' | undefined = undefined;
    if (!hasRichTextFontSize && component.style?.fontSize) {
      console.log('PowerPoint font size:', component.style.fontSize, 'pt → TLDraw size mapping (fallback)')
      // More nuanced mapping for better visual accuracy
      if (component.style.fontSize <= 10) tldrawSize = 's'        // Very small text
      else if (component.style.fontSize <= 13) tldrawSize = 's'   // Small text (≤13pt)
      else if (component.style.fontSize <= 18) tldrawSize = 'm'   // Medium text (14-18pt)
      else if (component.style.fontSize <= 23) tldrawSize = 'l'   // Large text (19-23pt)
      else tldrawSize = 'xl'                                      // Extra large text (≥24pt)
      
      console.log(`Font size ${component.style.fontSize}pt mapped to TLDraw size '${tldrawSize}' (fallback)`)
    } else if (hasRichTextFontSize) {
      console.log('Using fontSize from richText textStyle marks, skipping TLDraw size mapping')
    } else {
      // Default fallback
      tldrawSize = 'm';
      console.log('No fontSize found, using default TLDraw size: m')
    }

    // Map specific hex colors from the API to tldraw colors
    let tldrawColor: 'black' | 'grey' | 'light-violet' | 'violet' | 'blue' | 'light-blue' | 'yellow' | 'orange' | 'green' | 'light-green' | 'light-red' | 'red' = 'black'
    if (component.style?.color) {
      const hexColor = component.style.color.toLowerCase()
      console.log('PowerPoint color:', hexColor) // Debug log
      
      // Map the specific colors from your API
      if (hexColor === '#000000') tldrawColor = 'black'
      else if (hexColor === '#e97132') tldrawColor = 'orange' // The orange from your API
      else if (hexColor === '#4ea72e') tldrawColor = 'green' // The green from your API
      // General color matching for other cases
      else if (hexColor.startsWith('#ff') || hexColor.startsWith('#e') || hexColor.startsWith('#d')) {
        // Reddish/orange colors
        if (hexColor.includes('7') || hexColor.includes('8') || hexColor.includes('9')) tldrawColor = 'orange'
        else tldrawColor = 'red'
      }
      else if (hexColor.startsWith('#4') || hexColor.startsWith('#0') && hexColor.includes('a')) tldrawColor = 'green'
      else if (hexColor.startsWith('#0')) tldrawColor = 'blue'
      else tldrawColor = 'black' // Default fallback
    }

    // Map PowerPoint font families to tldraw fonts
    let tldrawFont: 'draw' | 'sans' | 'serif' | 'mono' = 'sans' // Default to sans-serif for better text readability
    if (component.style?.fontFamily) {
      const fontFamily = component.style.fontFamily.toLowerCase();
      console.log('PowerPoint font family:', component.style.fontFamily) // Debug log
      
      // Map common PowerPoint fonts to tldraw fonts
      if (fontFamily.includes('times') || fontFamily.includes('georgia') || fontFamily.includes('serif')) {
        tldrawFont = 'serif'
      } else if (fontFamily.includes('courier') || fontFamily.includes('consolas') || fontFamily.includes('monaco') || fontFamily.includes('mono')) {
        tldrawFont = 'mono'
      } else if (fontFamily.includes('comic') || fontFamily.includes('marker') || fontFamily.includes('sketch')) {
        tldrawFont = 'draw' // Use draw font for more casual/creative fonts
      } else {
        // For Arial, Helvetica, Calibri, and other sans-serif fonts
        tldrawFont = 'sans'
      }
    }
    
    // Use richText structure if available (for bullets), otherwise convert plain text
    let richTextContent;
    if ((component as any).richText) {
      // Use the rich text structure directly from the PowerPoint parser
      richTextContent = (component as any).richText;
    } else {
      // Convert plain text to rich text
      richTextContent = toRichText(component.content || 'Sample text');
    }

    // Create text shape with rotation applied directly and parent it to frame
    const textProps: any = {
      richText: richTextContent,
      color: tldrawColor,
      font: tldrawFont,
      // Only disable autoSize if PowerPoint provided a width, otherwise let TLDraw autosize
      autoSize: !component.width,
      ...(component.width ? { w: component.width } : {})
    };
    
    // Only set size if we don't have rich text fontSize (to avoid overriding)
    if (tldrawSize) {
      textProps.size = tldrawSize;
    }
    
    const shapeProps: any = {
      id: shapeId,
      type: 'text',
      x,
      y,
      rotation: component.rotation ? (component.rotation * Math.PI) / 180 : 0, // Convert degrees to radians
      props: textProps
    };
    
    if (frameId) {
      shapeProps.parentId = frameId;
    }
    
    editorInstance.createShape(shapeProps)
  }

  const renderShapeComponent = async (component: PowerPointComponent, index: number, frameX: number, frameY: number, editorInstance: Editor, slideIndex: number, frameId: any) => {
    console.log(`\n--- Shape ${index} ---`)
    console.log('Component:', {
      backgroundColor: component.style?.backgroundColor,
      borderColor: component.style?.borderColor,
      shapeType: component.style?.shapeType || component.metadata?.shapeType
    })
    const shapeId = createShapeId(`shape-${slideIndex}-${component.id || index}`)
    
    const scale = 1
    // When inside a frame, use component's original coordinates relative to frame
    let x = frameId ? (component.x || 0) * scale : frameX + (component.x || 0) * scale
    let y = frameId ? (component.y || 0) * scale : frameY + (component.y || 0) * scale
    const width = (component.width || 100) * scale
    const height = (component.height || 100) * scale
    
    // Debug: log original position for shapes
    if (component.rotation && component.rotation !== 0) {
      console.log(`Shape rotation: ${component.rotation}° at PowerPoint position (${x}, ${y}) size ${width}x${height}`)
    }
    
    // Map PowerPoint colors to tldraw colors with better color matching
    let fillColor: 'black' | 'grey' | 'light-violet' | 'violet' | 'blue' | 'light-blue' | 'yellow' | 'orange' | 'green' | 'light-green' | 'light-red' | 'red' = 'grey'
    if (component.style?.backgroundColor && component.style.backgroundColor !== 'transparent') {
      const hexColor = component.style.backgroundColor.toLowerCase()
      
      // Specific color mappings
      if (hexColor === '#000000') fillColor = 'black'
      else if (hexColor === '#ffffff') fillColor = 'grey' // tldraw doesn't have white, use light grey
      // PowerPoint standard colors
      else if (hexColor === '#ed7d31') fillColor = 'orange' // PowerPoint orange
      else if (hexColor === '#4472c4') fillColor = 'blue' // PowerPoint blue
      else if (hexColor === '#5b9bd5') fillColor = 'light-blue' // PowerPoint light blue
      else if (hexColor === '#70ad47') fillColor = 'green' // PowerPoint green
      else if (hexColor === '#ffc000') fillColor = 'yellow' // PowerPoint yellow
      else if (hexColor === '#c55a5a') fillColor = 'red' // PowerPoint red
      // Color range matching
      else if (hexColor.startsWith('#ed') || hexColor.startsWith('#e9') || hexColor.startsWith('#f') && !hexColor.includes('ff')) fillColor = 'orange'
      else if (hexColor.startsWith('#44') || hexColor.startsWith('#45')) fillColor = 'blue'
      else if (hexColor.startsWith('#5b') || hexColor.startsWith('#5a')) fillColor = 'light-blue'
      else if (hexColor.startsWith('#70') || hexColor.startsWith('#6') || hexColor.startsWith('#4e')) fillColor = 'green'
      else if (hexColor.startsWith('#ff') && hexColor.includes('c')) fillColor = 'yellow'
      else if (hexColor.startsWith('#ff') && !hexColor.includes('c')) fillColor = 'red'
      else if (hexColor.startsWith('#c5') || hexColor.includes('red')) fillColor = 'red'
      else if (hexColor.startsWith('#e7') || hexColor.startsWith('#a5')) fillColor = 'grey'
      // Fallback by first character
      else if (hexColor.startsWith('#4')) fillColor = 'blue'
      else if (hexColor.startsWith('#5')) fillColor = 'light-blue' 
      else if (hexColor.startsWith('#7') || hexColor.startsWith('#6')) fillColor = 'green'
      else if (hexColor.startsWith('#e') || hexColor.startsWith('#f')) fillColor = 'orange'
      else fillColor = 'grey'
      
      console.log(`✓ Background: ${hexColor} → ${fillColor}`)
    } else {
      console.log('✗ No background color or transparent')
    }

    let strokeColor: 'black' | 'grey' | 'light-violet' | 'violet' | 'blue' | 'light-blue' | 'yellow' | 'orange' | 'green' | 'light-green' | 'light-red' | 'red' = 'black'
    if (component.style?.borderColor && component.style.borderColor !== 'transparent') {
      const hexColor = component.style.borderColor.toLowerCase()
      
      // Specific color mappings for borders
      if (hexColor === '#000000') strokeColor = 'black'
      else if (hexColor === '#ffffff') strokeColor = 'grey'
      // PowerPoint standard colors
      else if (hexColor === '#ed7d31') strokeColor = 'orange' // PowerPoint orange
      else if (hexColor === '#4472c4') strokeColor = 'blue' // PowerPoint blue
      else if (hexColor === '#5b9bd5') strokeColor = 'light-blue' // PowerPoint light blue
      else if (hexColor === '#70ad47') strokeColor = 'green' // PowerPoint green
      else if (hexColor === '#ffc000') strokeColor = 'yellow' // PowerPoint yellow
      else if (hexColor === '#c55a5a') strokeColor = 'red' // PowerPoint red
      // Color range matching
      else if (hexColor.startsWith('#ed') || hexColor.startsWith('#e9') || hexColor.startsWith('#f') && !hexColor.includes('ff')) strokeColor = 'orange'
      else if (hexColor.startsWith('#44') || hexColor.startsWith('#45')) strokeColor = 'blue'
      else if (hexColor.startsWith('#5b') || hexColor.startsWith('#5a')) strokeColor = 'light-blue'
      else if (hexColor.startsWith('#70') || hexColor.startsWith('#6') || hexColor.startsWith('#4e')) strokeColor = 'green'
      else if (hexColor.startsWith('#ff') && hexColor.includes('c')) strokeColor = 'yellow'
      else if (hexColor.startsWith('#ff') && !hexColor.includes('c')) strokeColor = 'red'
      else if (hexColor.startsWith('#c5') || hexColor.includes('red')) strokeColor = 'red'
      else if (hexColor.startsWith('#e7') || hexColor.startsWith('#a5')) strokeColor = 'grey'
      // Fallback by first character
      else if (hexColor.startsWith('#4')) strokeColor = 'blue'
      else if (hexColor.startsWith('#5')) strokeColor = 'light-blue'
      else if (hexColor.startsWith('#7') || hexColor.startsWith('#6')) strokeColor = 'green'
      else if (hexColor.startsWith('#e') || hexColor.startsWith('#f')) strokeColor = 'orange'
      else strokeColor = 'black'
      
      console.log(`✓ Border: ${hexColor} → ${strokeColor}`)
    } else {
      console.log('✗ No border color or transparent')
    }
    
    // Determine the best tldraw shape type based on PowerPoint shape type
    // let tldrawShapeType: 'geo' = 'geo'
    let geoType: 'rectangle' | 'ellipse' | 'triangle' | 'diamond' | 'pentagon' | 'hexagon' | 'octagon' | 'star' | 'rhombus' | 'oval' | 'trapezoid' | 'arrow-right' | 'arrow-left' | 'arrow-up' | 'arrow-down' | 'x-box' | 'check-box' | 'cloud' | 'heart' = 'rectangle'
    
    // Map PowerPoint shape types to tldraw geo types
    const shapeType = component.style?.shapeType || component.metadata?.shapeType || component.metadata?.preset || 'rectangle'
    
    switch (shapeType) {
      case 'rect':
      case 'rectangle':
        geoType = 'rectangle'
        break
      case 'ellipse':
      case 'oval':
        geoType = 'ellipse'
        break
      case 'triangle':
      case 'rtTriangle':
        geoType = 'triangle'
        break
      case 'diamond':
        geoType = 'diamond'
        break
      case 'pentagon':
        geoType = 'pentagon'
        break
      case 'hexagon':
        geoType = 'hexagon'
        break
      case 'octagon':
        geoType = 'octagon'
        break
      // Handle PowerPoint star preset names
      case 'star4':
      case 'star5':
      case 'star6':
      case 'star8':
      case 'star10':
      case 'star12':
      case 'star16':
      case 'star24':
      case 'star32':
      case '4-point star':
      case '5-point star':
      case '6-point star':
      case '8-point star':
      case '10-point star':
      case '12-point star':
      case '16-point star':
      case '24-point star':
      case '32-point star':
        geoType = 'star'
        break
      case 'rightArrow':
      case 'right arrow':
        geoType = 'arrow-right'
        break
      case 'leftArrow':
      case 'left arrow':
        geoType = 'arrow-left'
        break
      case 'upArrow':
      case 'up arrow':
        geoType = 'arrow-up'
        break
      case 'downArrow':
      case 'down arrow':
        geoType = 'arrow-down'
        break
      case 'trapezoid':
        geoType = 'trapezoid'
        break
      case 'cloud':
        geoType = 'cloud'
        break
      case 'heart':
        geoType = 'heart'
        break
      default:
        geoType = 'rectangle'
    }
    
    // Create geometric shape using the tldraw v3 API
    const finalColor = fillColor === 'grey' ? strokeColor : fillColor;
    const finalFill = component.style?.backgroundColor && component.style.backgroundColor !== 'transparent' ? 'solid' : 'none';
    
    console.log(`Creating tldraw shape:`, {
      geo: geoType,
      color: finalColor,
      fill: finalFill,
      fillColor: fillColor,
      strokeColor: strokeColor
    });
    
    // Create the shape with parent frame, position, and rotation all at once
    const geoShapeProps: any = {
      id: shapeId,
      type: 'geo',
      x,
      y,
      rotation: component.rotation ? (component.rotation * Math.PI) / 180 : 0,
      props: {
        geo: geoType,
        color: finalColor,
        fill: finalFill,
        size: 'm',
        w: width,
        h: height
      }
    };
    
    if (frameId) {
      geoShapeProps.parentId = frameId;
    }
    
    editorInstance.createShape(geoShapeProps)
    console.log(`Positioned rotated shape at (${x}, ${y})`)
  }

  const renderImageComponent = async (component: PowerPointComponent, index: number, frameX: number, frameY: number, editorInstance: Editor, slideIndex: number, frameId: any) => {
    console.log(`\n--- Image ${index} ---`)
    console.log('Component:', {
      content: component.content,
      hasImageUrl: !!(component.metadata?.imageUrl),
      imageType: component.metadata?.imageType,
      size: component.metadata?.imageSize
    })
    
    const imageId = createShapeId(`image-${slideIndex}-${component.id || index}`)
    
    console.log(`Image dimensions from parser: ${component.width} x ${component.height}`)
    
    const scale = 1
    const x = frameId ? (component.x || 0) * scale : frameX + (component.x || 0) * scale
    const y = frameId ? (component.y || 0) * scale : frameY + (component.y || 0) * scale
    
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
        editorInstance.createAssets([{
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
          rotation: component.rotation ? (component.rotation * Math.PI) / 180 : 0,
          props: {
            assetId,
            w: width,
            h: height
          }
        };
        
        if (frameId) {
          imageShapeProps.parentId = frameId;
        }
        
        editorInstance.createShape(imageShapeProps)
        console.log(`✓ Image created successfully using asset`)
        
      } catch (error) {
        console.warn(`❌ Failed to create image asset:`, error)
        // Fallback: create a placeholder rectangle
        const placeholderProps: any = {
          id: createShapeId(`placeholder-${slideIndex}-${component.id || index}`),
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
          placeholderProps.parentId = frameId;
        }
        
        editorInstance.createShape(placeholderProps)
      }
    } else {
      console.log(`❌ No valid image data URL found, creating placeholder`)
      // Create a placeholder rectangle for images without data
      const placeholderRectProps: any = {
        id: createShapeId(`placeholder-${slideIndex}-${component.id || index}`),
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
      };
      
      if (frameId) {
        placeholderRectProps.parentId = frameId;
      }
      
      editorInstance.createShape(placeholderRectProps);
    }
  }

  const renderTableComponent = async (component: PowerPointComponent, index: number, frameX: number, frameY: number, editorInstance: Editor, slideIndex: number, frameId: any) => {
    console.log(`\n--- Table ${index} ---`)
    console.log('Component:', {
      content: component.content,
      position: `(${component.x}, ${component.y})`,
      size: `${component.width}x${component.height}`,
      tableData: component.metadata?.tableData,
      rows: component.metadata?.rows,
      cols: component.metadata?.cols
    })
    
    // Get table data from metadata
    const tableData = component.metadata?.tableData || []
    const rows = component.metadata?.rows || tableData.length
    const cols = component.metadata?.cols || (tableData[0]?.length || 0)
    
    if (tableData.length === 0) {
      console.log(`❌ No table data found for table ${index}`)
      return
    }
    
    console.log(`✓ Processing table with ${rows} rows × ${cols} columns`)
    
    // Calculate cell dimensions
    const tableWidth = component.width || 300
    const tableHeight = component.height || 150
    const cellWidth = tableWidth / cols
    const cellHeight = tableHeight / rows
    
    const scale = 1
    const tableX = frameId ? (component.x || 0) * scale : frameX + (component.x || 0) * scale
    const tableY = frameId ? (component.y || 0) * scale : frameY + (component.y || 0) * scale
    
    // Create shapes for each table cell
    tableData.forEach((row: any[], rowIndex: number) => {
      if (!Array.isArray(row)) return
      
      row.forEach((cellContent: any, colIndex: number) => {
        const cellX = tableX + (colIndex * cellWidth)
        const cellY = tableY + (rowIndex * cellHeight)
        
        // Create cell background rectangle
        const cellRectId = createShapeId(`table-${slideIndex}-${component.id || index}-cell-bg-${rowIndex}-${colIndex}`)
        
        // Determine cell colors (header vs data)
        const isHeader = rowIndex === 0 && component.metadata?.hasHeader
        let fillColor: 'black' | 'grey' | 'light-violet' | 'violet' | 'blue' | 'light-blue' | 'yellow' | 'orange' | 'green' | 'light-green' | 'light-red' | 'red' = 'grey'
        
        if (isHeader) {
          fillColor = 'blue' // Header cells in blue
        } else {
          fillColor = 'light-blue' // Data cells in light blue
        }
        
        const cellRectProps: any = {
          id: cellRectId,
          type: 'geo',
          x: cellX,
          y: cellY,
          props: {
            geo: 'rectangle',
            color: fillColor,
            fill: 'solid',
            size: 's',
            w: cellWidth,
            h: cellHeight
          }
        };
        
        if (frameId) {
          cellRectProps.parentId = frameId;
        }
        
        editorInstance.createShape(cellRectProps)
        
        // Create cell text if there's content
        if (cellContent && cellContent.trim()) {
          const cellTextId = createShapeId(`table-${slideIndex}-${component.id || index}-cell-text-${rowIndex}-${colIndex}`)
          
          // Position text in the center of the cell with some padding
          const textX = cellX + 8 // Small left padding
          const textY = cellY + cellHeight / 2 - 6 // Center vertically
          
          // Text styling
          const textColor = isHeader ? 'black' : 'black'
          const textSize: 's' | 'm' | 'l' | 'xl' = 's' // Small text for table cells
          
          const cellTextProps: any = {
            id: cellTextId,
            type: 'text',
            x: textX,
            y: textY,
            props: {
              richText: toRichText(cellContent.toString()),
              color: textColor,
              size: textSize,
              font: 'sans'
            }
          };
          
          if (frameId) {
            cellTextProps.parentId = frameId;
          }
          
          editorInstance.createShape(cellTextProps)
        }
      })
    })
    
    console.log(`✓ Created table with ${rows * cols} cells at (${tableX}, ${tableY})`)
  }

  // Redraw when slides change
  useEffect(() => {
    if (editorRef.current) {
      if (slides && slides.length > 0) {
        drawSlides(slides, editorRef.current)
      } else if (components && components.length > 0) {
        // Legacy fallback for components-only data
        drawComponents(components, editorRef.current)
      }
    }
  }, [slides, components])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Tldraw 
        onMount={handleMount} 
        textOptions={textOptions}
        components={uiComponents}
      />
    </div>
  )
}