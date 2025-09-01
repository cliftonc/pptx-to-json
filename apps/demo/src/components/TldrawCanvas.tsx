import { useEffect, useRef } from 'react'
import { Tldraw, Editor, createShapeId, toRichText, AssetRecordType } from '@tldraw/tldraw'
import type { PowerPointComponent } from 'ppt-paste-parser'
import '@tldraw/tldraw/tldraw.css'

interface TldrawCanvasProps {
  components: PowerPointComponent[]
}


export default function TldrawCanvas({ components }: TldrawCanvasProps) {
  const editorRef = useRef<Editor | null>(null)

  const handleMount = (editor: Editor) => {
    editorRef.current = editor
    drawComponents(components, editor)
  }

  const drawComponents = async (components: PowerPointComponent[], editor?: Editor) => {
    const editorInstance = editor || editorRef.current
    if (!editorInstance || !components.length) return

    // Clear existing shapes
    const allShapes = editorInstance.getCurrentPageShapes()
    editorInstance.deleteShapes(allShapes.map(shape => shape.id))

    // Draw text components
    const textComponents = components.filter(comp => comp.type === 'text')
    
    textComponents.forEach((component, index) => {
      const shapeId = createShapeId(`text-${component.id || index}`)
      
      // PowerPoint coordinates look good - try with less scaling or no scaling
      const scale = 1 // Try no scaling first since coordinates look reasonable (629, 413, etc.)
      let x = (component.x || 0) * scale
      let y = (component.y || 0) * scale
      
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
      
      // Convert PowerPoint font size (pt) to tldraw size categories
      // Your API shows: 12pt, 36pt, 80pt
      let tldrawSize: 's' | 'm' | 'l' | 'xl' = 'm'
      if (component.style?.fontSize) {
        console.log('PowerPoint font size:', component.style.fontSize) // Debug log
        if (component.style.fontSize <= 12) tldrawSize = 's'        // 12pt → small
        else if (component.style.fontSize <= 24) tldrawSize = 'm'    // up to 24pt → medium  
        else if (component.style.fontSize <= 48) tldrawSize = 'l'    // 36pt → large
        else tldrawSize = 'xl'                                       // 80pt → extra large
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

      // Create text shape with rotation applied directly (this worked for text)
      editorInstance.createShape({
        id: shapeId,
        type: 'text',
        x,
        y,
        rotation: component.rotation ? (component.rotation * Math.PI) / 180 : 0, // Convert degrees to radians
        props: {
          richText: richTextContent,
          color: tldrawColor,
          size: tldrawSize,
          font: tldrawFont
        }
      })
    })

    // Draw shape components
    const shapeComponents = components.filter(comp => comp.type === 'shape')
    
    console.log('=== SHAPE DEBUGGING ===')
    shapeComponents.forEach((component, index) => {
      console.log(`\n--- Shape ${index} ---`)
      console.log('Component:', {
        backgroundColor: component.style?.backgroundColor,
        borderColor: component.style?.borderColor,
        shapeType: component.style?.shapeType || component.metadata?.shapeType
      })
      const shapeId = createShapeId(`shape-${component.id || index}`)
      
      const scale = 1
      let x = (component.x || 0) * scale
      let y = (component.y || 0) * scale
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
      
      // First create the shape at origin
      editorInstance.createShape({
        id: shapeId,
        type: 'geo',
        x: 0,
        y: 0,
        props: {
          geo: geoType,
          color: finalColor,
          fill: finalFill,
          size: 'm',
          w: width,
          h: height
        }
      })
      
      // Then apply rotation if needed
      if (component.rotation && component.rotation !== 0) {
        editorInstance.updateShape({
          id: shapeId,
          type: 'geo',
          rotation: (component.rotation * Math.PI) / 180 // Convert degrees to radians
        })
        console.log(`Applied rotation ${component.rotation}° to shape`)
      }
      
      // Finally position the rotated shape at PowerPoint coordinates
      editorInstance.updateShape({
        id: shapeId,
        type: 'geo',
        x,
        y
      })
      console.log(`Positioned rotated shape at (${x}, ${y})`)
    })

    // Draw image components
    const imageComponents = components.filter(comp => comp.type === 'image')
    
    console.log('=== IMAGE DEBUGGING ===')
    console.log(`Found ${imageComponents.length} image components`)
    for (const [index, component] of imageComponents.entries()) {
      console.log(`\n--- Image ${index} ---`)
      console.log('Component:', {
        content: component.content,
        hasImageUrl: !!(component.metadata?.imageUrl),
        imageType: component.metadata?.imageType,
        size: component.metadata?.imageSize
      })
      console.log('Full component:', component)
      
      const imageId = createShapeId(`image-${component.id || index}`)
      
      // Log the component dimensions for debugging
      console.log(`Image dimensions from parser: ${component.width} x ${component.height}`)
      
      const scale = 1
      const x = (component.x || 0) * scale
      const y = (component.y || 0) * scale
      
      // Use exact PowerPoint dimensions
      const width = component.width || 200
      const height = component.height || 150
      console.log(`Using exact PowerPoint dimensions: ${width}x${height}`)
      
      // Check if we have a data URL for the image
      if (component.metadata?.imageUrl && component.metadata.imageUrl.startsWith('data:')) {
        console.log(`✓ Creating image shape with data URL (${component.metadata.imageSize} bytes)`)
        console.log(`✓ Data URL prefix: ${component.metadata.imageUrl.substring(0, 50)}...`)
        
        // Convert data URL to asset first, then create image shape
        const dataUrl = component.metadata.imageUrl
        
        try {
          // Create asset from data URL (revert to working approach)
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
          
          // Create image shape using the asset
          editorInstance.createShape({
            id: imageId,
            type: 'image',
            x,
            y,
            rotation: component.rotation ? (component.rotation * Math.PI) / 180 : 0, // Convert degrees to radians
            props: {
              assetId,
              w: width,
              h: height
            }
          })
          
          console.log(`✓ Image created successfully using asset`)
          
        } catch (error) {
          console.warn(`❌ Failed to create image asset:`, error)
          // Fallback: create a placeholder rectangle
          editorInstance.createShape({
            id: createShapeId(`placeholder-${component.id || index}`),
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
          })
          
          // Add text shape for the placeholder label
          editorInstance.createShape({
            id: createShapeId(`placeholder-text-${component.id || index}`),
            type: 'text',
            x: x + 10,
            y: y + height/2 - 10,
            props: {
              richText: toRichText(`📷 ${component.metadata?.name || 'Image'}`),
              color: 'black',
              size: 's',
              font: 'draw'
            }
          })
        }
      } else {
        console.log(`❌ No valid image data URL found, creating placeholder`)
        // Create a placeholder rectangle for images without data
        editorInstance.createShape({
          id: createShapeId(`placeholder-${component.id || index}`),
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
        })
        
        // Add text shape for the placeholder label  
        editorInstance.createShape({
          id: createShapeId(`placeholder-text-${component.id || index}`),
          type: 'text',
          x: x + 10,
          y: y + height/2 - 10,
          props: {
            richText: toRichText(`📷 ${component.content || 'Image'}`),
            color: 'black',
            size: 's',
            font: 'draw'
          }
        })
      }
    }

    // Draw table components
    const tableComponents = components.filter(comp => comp.type === 'table')
    
    console.log('=== TABLE DEBUGGING ===')
    console.log(`Found ${tableComponents.length} table components`)
    
    tableComponents.forEach((component, index) => {
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
      const tableX = (component.x || 0) * scale
      const tableY = (component.y || 0) * scale
      
      // Create shapes for each table cell
      tableData.forEach((row: any[], rowIndex: number) => {
        if (!Array.isArray(row)) return
        
        row.forEach((cellContent: any, colIndex: number) => {
          const cellX = tableX + (colIndex * cellWidth)
          const cellY = tableY + (rowIndex * cellHeight)
          
          // Create cell background rectangle
          const cellRectId = createShapeId(`table-${component.id || index}-cell-bg-${rowIndex}-${colIndex}`)
          
          // Determine cell colors (header vs data)
          const isHeader = rowIndex === 0 && component.metadata?.hasHeader
          let fillColor: 'black' | 'grey' | 'light-violet' | 'violet' | 'blue' | 'light-blue' | 'yellow' | 'orange' | 'green' | 'light-green' | 'light-red' | 'red' = 'grey'
          
          if (isHeader) {
            fillColor = 'blue' // Header cells in blue
          } else {
            fillColor = 'light-blue' // Data cells in light blue
          }
          
          editorInstance.createShape({
            id: cellRectId,
            type: 'geo',
            x: cellX,
            y: cellY,
            props: {
              geo: 'rectangle',
              color: 'black',
              fill: 'solid',
              size: 's',
              w: cellWidth,
              h: cellHeight
            }
          })
          
          // Update the rectangle color after creation
          editorInstance.updateShape({
            id: cellRectId,
            type: 'geo',
            props: {
              color: fillColor
            }
          })
          
          // Create cell text if there's content
          if (cellContent && cellContent.trim()) {
            const cellTextId = createShapeId(`table-${component.id || index}-cell-text-${rowIndex}-${colIndex}`)
            
            // Position text in the center of the cell with some padding
            const textX = cellX + 8 // Small left padding
            const textY = cellY + cellHeight / 2 - 6 // Center vertically
            
            // Text styling
            const textColor = isHeader ? 'black' : 'black'
            const textSize: 's' | 'm' | 'l' | 'xl' = 's' // Small text for table cells
            
            editorInstance.createShape({
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
            })
          }
        })
      })
      
      console.log(`✓ Created table with ${rows * cols} cells at (${tableX}, ${tableY})`)
    })

    // Fit the viewport to show all shapes
    if (textComponents.length > 0 || shapeComponents.length > 0 || imageComponents.length > 0 || tableComponents.length > 0) {
      editorInstance.zoomToFit({ animation: { duration: 500 } })
    }
  }

  // Redraw when components change
  useEffect(() => {
    if (editorRef.current) {
      drawComponents(components, editorRef.current)
    }
  }, [components])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Tldraw onMount={handleMount} />
    </div>
  )
}