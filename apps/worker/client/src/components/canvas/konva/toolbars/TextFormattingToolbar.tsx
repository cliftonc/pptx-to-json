import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { CanvasComponentStyle } from '../../../../types/canvas'
import { ToolbarButton } from './ToolbarButton'
import './toolbar.css'
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Palette } from 'lucide-react'

interface TextFormattingToolbarProps {
  isVisible: boolean
  position: { x: number; y: number }
  currentStyle: CanvasComponentStyle
  onStyleChange: (style: Partial<CanvasComponentStyle>) => void
  onClose: () => void
}

const FONT_FAMILIES = [
  { value: 'DEFAULT', label: 'Default' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' },
]

const FONT_SIZES = ['8','10','12','14','16','18','20','24','28','32','36','48']

const COLORS = [
  '#000000','#ffffff','#ff0000','#00ff00','#0000ff','#ffff00',
  '#ff00ff','#00ffff','#808080','#800000','#008000','#000080'
]

export function TextFormattingToolbar({
  isVisible,
  position,
  currentStyle,
  onStyleChange,
  onClose
}: TextFormattingToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const colorPickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        if (!showColorPicker || (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node))) {
          onClose()
        }
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, showColorPicker, onClose])

  if (!isVisible) return null

  const isBold = currentStyle.fontWeight === 'bold'
  const isItalic = currentStyle.fontStyle === 'italic'
  const currentColor = currentStyle.color || '#000000'
  const currentFontFamily = currentStyle.fontFamily || 'DEFAULT'
  // Find the closest font size in the dropdown or use the actual value
  const actualFontSize = currentStyle.fontSize || 16
  const closestFontSize = FONT_SIZES.reduce((prev, curr) => {
    return Math.abs(parseInt(curr) - actualFontSize) < Math.abs(parseInt(prev) - actualFontSize) ? curr : prev
  })
  const currentFontSize = closestFontSize
  const currentTextAlign = currentStyle.textAlign || 'left'

  return createPortal(
    <div
      ref={toolbarRef}
      className="toolbar-root"
      style={{
        position: 'fixed',
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'translate(-50%, -100%)',
        padding: '8px 10px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10000,
        background: 'var(--toolbar-bg)',
        border: '1px solid var(--toolbar-border)'
      }}
      role="dialog"
      aria-label="Text formatting"
    >
      <div className="toolbar-group" style={{ marginRight: 8 }}>
        <select
          value={currentFontFamily}
          onChange={(e) => onStyleChange({ fontFamily: e.target.value === 'DEFAULT' ? undefined : e.target.value })}
          title="Font family"
          style={{
            padding: '4px 6px', border: '1px solid var(--toolbar-border)', borderRadius: 6,
            fontSize: 13, background: '#fff'
          }}
        >
          {FONT_FAMILIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select
          value={currentFontSize}
          onChange={(e) => onStyleChange({ fontSize: parseInt(e.target.value) })}
          title="Font size"
          style={{
            padding: '4px 6px', border: '1px solid var(--toolbar-border)', borderRadius: 6,
            fontSize: 13, background: '#fff', width: 70
          }}
        >
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}pt</option>)}
        </select>
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group">
        <ToolbarButton
          icon={<Bold />}
          tooltip="Bold (Ctrl+B)"
          active={isBold}
          onClick={() => onStyleChange({ fontWeight: isBold ? 'normal' : 'bold' })}
          ariaLabel="Bold"
        />
        <ToolbarButton
          icon={<Italic />}
          tooltip="Italic (Ctrl+I)"
          active={isItalic}
          onClick={() => onStyleChange({ fontStyle: isItalic ? 'normal' : 'italic' })}
          ariaLabel="Italic"
        />
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group" role="group" aria-label="Alignment">
        <ToolbarButton
          icon={<AlignLeft />}
          tooltip="Align Left"
          active={currentTextAlign === 'left'}
          onClick={() => onStyleChange({ textAlign: 'left' })}
          ariaLabel="Align left"
        />
        <ToolbarButton
          icon={<AlignCenter />}
          tooltip="Align Center"
          active={currentTextAlign === 'center'}
          onClick={() => onStyleChange({ textAlign: 'center' })}
          ariaLabel="Align center"
        />
        <ToolbarButton
          icon={<AlignRight />}
          tooltip="Align Right"
          active={currentTextAlign === 'right'}
          onClick={() => onStyleChange({ textAlign: 'right' })}
          ariaLabel="Align right"
        />
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group" style={{ position: 'relative' }}>
        <ToolbarButton
          icon={<Palette />}
          tooltip="Text Color"
          onClick={() => setShowColorPicker(v => !v)}
          ariaLabel="Text color"
        />
        {showColorPicker && (
          <div
            ref={colorPickerRef}
            className="color-grid-popover"
            role="listbox"
            aria-label="Text colors"
          >
            {COLORS.map(color => (
              <button
                key={color}
                className={`color-swatch-btn${currentColor === color ? ' active' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => { onStyleChange({ color }); setShowColorPicker(false) }}
                title={color}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
        )}
        <div className="tb-color-preview" style={{ backgroundColor: currentColor, marginLeft: 4 }} aria-label={`Current color ${currentColor}`} />
      </div>
    </div>,
    document.body
  )
}
