import React, { useState } from 'react'
import { ToolbarButton } from './ToolbarButton'

interface TextFormattingToolbarProps {
  position: { x: number; y: number }
  onClose: () => void
  onFormatChange: (format: any) => void
}

export const TextFormattingToolbar: React.FC<TextFormattingToolbarProps> = ({
  position,
  onClose,
  onFormatChange
}) => {
  const [fontSize, setFontSize] = useState(16)
  const [fontFamily, setFontFamily] = useState('Arial')
  const [textColor, setTextColor] = useState('#000000')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)

  const handleFormatChange = (changes: any) => {
    onFormatChange(changes)
  }

  const fontFamilies = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Tahoma',
    'Impact'
  ]

  const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72]

  return (
    <div
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        padding: '12px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        minWidth: '280px'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}
        >
          <span style={{ fontSize: '16px' }}>🎨</span>
          Text Formatting
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '2px',
            borderRadius: '4px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          ×
        </button>
      </div>

      {/* Font Family & Size */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '4px'
            }}
          >
            Font Family
          </label>
          <select
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value)
              handleFormatChange({ fontFamily: e.target.value })
            }}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            {fontFamilies.map(font => (
              <option key={font} value={font}>{font}</option>
            ))}
          </select>
        </div>
        <div style={{ minWidth: '80px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              color: '#6b7280',
              marginBottom: '4px'
            }}
          >
            Size
          </label>
          <select
            value={fontSize}
            onChange={(e) => {
              setFontSize(Number(e.target.value))
              handleFormatChange({ fontSize: Number(e.target.value) })
            }}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            {fontSizes.map(size => (
              <option key={size} value={size}>{size}px</option>
            ))}
          </select>
        </div>
      </div>

      {/* Text Style Buttons */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <ToolbarButton
          icon="B"
          label="Bold"
          active={isBold}
          onClick={() => {
            setIsBold(!isBold)
            handleFormatChange({ fontWeight: !isBold ? 'bold' : 'normal' })
          }}
          size="small"
        />
        <ToolbarButton
          icon="I"
          label="Italic"
          active={isItalic}
          onClick={() => {
            setIsItalic(!isItalic)
            handleFormatChange({ fontStyle: !isItalic ? 'italic' : 'normal' })
          }}
          size="small"
        />
        <ToolbarButton
          icon="U"
          label="Underline"
          active={isUnderline}
          onClick={() => {
            setIsUnderline(!isUnderline)
            handleFormatChange({ textDecoration: !isUnderline ? 'underline' : 'none' })
          }}
          size="small"
        />
      </div>

      {/* Text Color */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
          }}
        >
          Text Color
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="color"
            value={textColor}
            onChange={(e) => {
              setTextColor(e.target.value)
              handleFormatChange({ color: e.target.value })
            }}
            style={{
              width: '40px',
              height: '32px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          />
          <input
            type="text"
            value={textColor}
            onChange={(e) => {
              setTextColor(e.target.value)
              handleFormatChange({ color: e.target.value })
            }}
            placeholder="#000000"
            style={{
              flex: 1,
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px',
              fontFamily: 'monospace'
            }}
          />
        </div>
      </div>

      {/* Quick Color Palette */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
          }}
        >
          Quick Colors
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '4px'
          }}
        >
          {[
            '#000000', '#333333', '#666666', '#999999',
            '#ff0000', '#00ff00', '#0000ff', '#ffff00',
            '#ff00ff', '#00ffff', '#ff6600', '#6600ff',
            '#ff0066', '#66ff00', '#0066ff', '#ffffff'
          ].map(color => (
            <button
              key={color}
              onClick={() => {
                setTextColor(color)
                handleFormatChange({ color })
              }}
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: color,
                border: textColor === color ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* PixiJS-specific Effects */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '4px'
          }}
        >
          PixiJS Effects
        </label>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <ToolbarButton
            icon="✨"
            label="Drop Shadow"
            onClick={() => {
              handleFormatChange({ 
                dropShadow: true,
                dropShadowColor: '#000000',
                dropShadowDistance: 2,
                dropShadowAngle: Math.PI / 4,
                dropShadowAlpha: 0.5
              })
            }}
            size="small"
          />
          <ToolbarButton
            icon="🌈"
            label="Gradient"
            onClick={() => {
              handleFormatChange({ 
                fill: ['#ff6b6b', '#4ecdc4'],
                fillGradientType: 0
              })
            }}
            size="small"
          />
        </div>
      </div>
    </div>
  )
}