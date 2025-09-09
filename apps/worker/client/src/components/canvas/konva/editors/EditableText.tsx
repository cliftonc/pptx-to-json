import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { CanvasComponent } from '../../../../types/canvas'

interface EditableTextProps {
  component: CanvasComponent
  scale: number
  containerRect: DOMRect
  stageTransform: any // Konva Transform
  onUpdate: (updates: Partial<CanvasComponent>) => void
  onFinishEditing: () => void
  isEditing: boolean
}

export function EditableText({
  component,
  scale,
  containerRect,
  stageTransform,
  onUpdate,
  onFinishEditing,
  isEditing
}: EditableTextProps) {
  const [text, setText] = useState(() => {
    // Extract text from various possible sources
    if (typeof component.content === 'string') return component.content
    if (component.content?.text) return component.content.text
    if (component.content?.content) return component.content.content
    return 'Text Component'
  })
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Calculate position and size based on component and canvas transform
  const componentPoint = stageTransform.point({ x: component.x, y: component.y })
  
  // Fine-tune vertical alignment: Konva Text y refers to top; textarea border/padding shift
  const paddingY = 4 // matches padding set below
  const adjustedTop = containerRect.top + componentPoint.y - paddingY
  const adjustedLeft = containerRect.left + componentPoint.x - 2 // account for border width
  
  // Account for current scale directly (stageTransform already includes layer scale & translation)
  const editorStyle = {
    position: 'fixed' as const,
    left: `${adjustedLeft}px`,
    top: `${adjustedTop}px`,
    width: `${component.width * scale}px`,
    height: `${component.height * scale}px`,
    fontSize: `${(component.style?.fontSize || 16) * scale}px`,
    fontFamily: component.style?.fontFamily || 'Arial, sans-serif',
    fontWeight: component.style?.fontWeight || 'normal',
    fontStyle: component.style?.fontStyle || 'normal',
    color: component.style?.color || '#000000',
    backgroundColor: component.style?.backgroundColor || 'transparent',
    textAlign: component.style?.textAlign || 'left',
    border: '2px solid #007bff',
    borderRadius: '2px',
    padding: '4px',
    resize: 'none' as const,
    outline: 'none',
    overflow: 'hidden',
    zIndex: 10000,
    transform: component.rotation ? `rotate(${component.rotation}deg)` : undefined,
    transformOrigin: 'top left',
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
  }

  const handleFinishEditing = useCallback(() => {
    // Update the component with the new text
    onUpdate({
      content: {
        ...component.content,
        text: text,
        content: text, // Support both formats
      }
    })
    onFinishEditing()
  }, [text, component.content, onUpdate, onFinishEditing])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      handleFinishEditing()
    }
    // Prevent stage keyboard shortcuts
    e.stopPropagation()
  }

  const handleBlur = () => {
    handleFinishEditing()
  }

  // Auto-focus and select text when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.select()
    }
  }, [isEditing])

  // Auto-resize textarea to fit content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [text])

  if (!isEditing) return null

  return createPortal(
    <textarea
      ref={textareaRef}
      value={text}
      onChange={handleTextChange}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      style={editorStyle}
      placeholder="Enter text..."
    />,
    document.body
  )
}

// Rich text parsing utilities (for future TipTap integration)
export function parseRichText(richText: any): string {
  if (!richText) return ''
  
  // Handle TipTap format
  if (richText.type === 'doc' && richText.content) {
    return richText.content
      .map((node: any) => {
        if (node.type === 'paragraph' && node.content) {
          return node.content
            .map((textNode: any) => textNode.text || '')
            .join('')
        }
        return ''
      })
      .join('\n')
  }
  
  // Handle simple string format
  if (typeof richText === 'string') return richText
  
  // Handle object with text property
  if (richText.text) return richText.text
  
  return ''
}

export function createRichText(text: string): any {
  // Create TipTap-compatible format
  return {
    type: 'doc',
    content: text.split('\n').map(line => ({
      type: 'paragraph',
      content: line ? [{
        type: 'text',
        text: line
      }] : []
    }))
  }
}