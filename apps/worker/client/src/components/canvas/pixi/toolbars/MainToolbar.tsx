import React from 'react'
import { ToolbarButton } from './ToolbarButton'

interface MainToolbarProps {
  currentMode: 'view' | 'edit'
  onModeChange: (mode: 'view' | 'edit') => void
  onUndo: () => void
  onRedo: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomReset: () => void
  zoom: number
  canUndo: boolean
  canRedo: boolean
  selectedCount: number
}

export const MainToolbar: React.FC<MainToolbarProps> = ({
  currentMode,
  onModeChange,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  zoom,
  canUndo,
  canRedo,
  selectedCount
}) => {
  const formatZoom = (value: number) => `${Math.round(value * 100)}%`

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        zIndex: 10,
        position: 'relative'
      }}
    >
      {/* PixiJS Branding */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginRight: '16px',
          padding: '4px 8px',
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
          borderRadius: '6px',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        }}
      >
        ⚡ PixiJS Canvas
      </div>

      {/* Mode Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <ToolbarButton
          icon="👁️"
          label="View Mode"
          active={currentMode === 'view'}
          onClick={() => onModeChange('view')}
          tooltip="Switch to view mode"
        />
        <ToolbarButton
          icon="✏️"
          label="Edit Mode"
          active={currentMode === 'edit'}
          onClick={() => onModeChange('edit')}
          tooltip="Switch to edit mode"
        />
      </div>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb', margin: '0 8px' }} />

      {/* Undo/Redo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <ToolbarButton
          icon="↶"
          label="Undo"
          onClick={onUndo}
          disabled={!canUndo}
          tooltip="Undo last action (Ctrl+Z)"
        />
        <ToolbarButton
          icon="↷"
          label="Redo"
          onClick={onRedo}
          disabled={!canRedo}
          tooltip="Redo last action (Ctrl+Y)"
        />
      </div>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb', margin: '0 8px' }} />

      {/* Zoom Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <ToolbarButton
          icon="🔍-"
          label="Zoom Out"
          onClick={onZoomOut}
          tooltip="Zoom out"
        />
        <button
          onClick={onZoomReset}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: '#ffffff',
            fontSize: '12px',
            fontFamily: 'monospace',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            minWidth: '60px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff'
          }}
          title="Reset zoom to 100%"
        >
          {formatZoom(zoom)}
        </button>
        <ToolbarButton
          icon="🔍+"
          label="Zoom In"
          onClick={onZoomIn}
          tooltip="Zoom in"
        />
      </div>

      <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb', margin: '0 8px' }} />

      {/* Selection Info */}
      {selectedCount > 0 && (
        <div
          style={{
            padding: '4px 8px',
            backgroundColor: '#dbeafe',
            color: '#1e40af',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500'
          }}
        >
          {selectedCount} selected
        </div>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Performance Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: '#6b7280'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'linear-gradient(45deg, #10b981, #3b82f6)',
            }}
          />
          WebGL Accelerated
        </div>
      </div>
    </div>
  )
}