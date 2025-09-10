import React from 'react'
import type { CanvasMode } from '../../../../types/canvas'
import { ToolbarButton } from './ToolbarButton'
import './toolbar.css'
import { Pointer, Pencil, Square, Circle, Minus, ArrowRight, Triangle, Type, Undo2, Redo2, Trash2 } from 'lucide-react'
import { usePresentation } from '../../../../context/PresentationContext'

interface MainToolbarProps {
  mode: CanvasMode
  onModeChange: (mode: CanvasMode) => void
  onAddShape: (shapeType: string) => void
  onAddText: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  onClear?: () => void
}

const SHAPES = [
  { type: 'rectangle', icon: <Square /> , label: 'Rectangle' },
  { type: 'circle', icon: <Circle />, label: 'Circle' },
  { type: 'line', icon: <Minus />, label: 'Line' },
  { type: 'arrow', icon: <ArrowRight />, label: 'Arrow' },
  { type: 'triangle', icon: <Triangle />, label: 'Triangle' },
]

export function MainToolbar({
  mode,
  onModeChange,
  onAddShape,
  onAddText,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onClear
}: MainToolbarProps) {
  const { saveUnified } = usePresentation()
  const [saving, setSaving] = React.useState(false)
  const [status, setStatus] = React.useState<'idle' | 'success' | 'error'>('idle')
  const slideId = (window as any).currentSlideId || (new URL(window.location.href).pathname.split('/').pop() || '')

  const handleSave = async () => {
    if (!slideId) return
    try {
      setSaving(true)
      setStatus('idle')
      const result = await saveUnified(slideId)
      if (result.success) {
        setStatus('success')
        const fullUrl = `${window.location.origin}/slides/${slideId}`
        await navigator.clipboard.writeText(fullUrl)
        window.history.pushState({}, '', `/slides/${slideId}`)
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    } finally {
      setSaving(false)
      setTimeout(() => setStatus('idle'), 3000)
    }
  }


  const handleClear = () => {
    if (!onClear) return
    
    const confirmed = window.confirm('Are you sure you want to clear the entire presentation? This will reset everything to a blank state and cannot be undone.')
    if (confirmed) {
      onClear()
    }
  }

  return (
    <div className="toolbar-root" role="toolbar" aria-label="Canvas toolbar">
      <div className="toolbar-group" role="group" aria-label="Modes">
        <ToolbarButton
          icon={<Pointer />}
          tooltip="Select Mode (V)"
          active={mode === 'select'}
          onClick={() => onModeChange('select')}
          ariaLabel="Select mode"
        />
        <ToolbarButton
          icon={<Pencil />}
          tooltip="Edit Mode (E)"
          active={mode === 'edit'}
          onClick={() => onModeChange('edit')}
          ariaLabel="Edit mode"
        />
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group" role="group" aria-label="Shapes">
        {SHAPES.map(s => (
          <ToolbarButton
            key={s.type}
            icon={s.icon}
            tooltip={s.label}
            onClick={() => onAddShape(s.type)}
            disabled={mode === 'readonly'}
            ariaLabel={s.label}
          />
        ))}
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group" role="group" aria-label="Insert">
        <ToolbarButton
          icon={<Type />}
          tooltip="Add Text (T)"
          onClick={onAddText}
          disabled={mode === 'readonly'}
          ariaLabel="Add text"
        />
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group" role="group" aria-label="History">
        <ToolbarButton
          icon={<Undo2 />}
          tooltip="Undo (Ctrl+Z)"
          onClick={onUndo}
          disabled={!canUndo}
          ariaLabel="Undo"
        />
        <ToolbarButton
          icon={<Redo2 />}
          tooltip="Redo (Ctrl+Shift+Z)"
          onClick={onRedo}
          disabled={!canRedo}
          ariaLabel="Redo"
        />
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group" role="group" aria-label="Clear">
        <ToolbarButton
          icon={<Trash2 />}
          tooltip="Clear Entire Presentation"
          onClick={handleClear}
          disabled={mode === 'readonly' || !onClear}
          ariaLabel="Clear entire presentation"
        />
      </div>

      <div className="toolbar-divider" />

      <div className="toolbar-group" role="group" aria-label="Save">
        <ToolbarButton
          icon={<span style={{ fontSize: 12 }}>💾</span>}
          tooltip={status === 'success' ? 'Saved!' : status === 'error' ? 'Save failed' : 'Save & Share'}
          onClick={handleSave}
          disabled={saving || !slideId}
          ariaLabel="Save presentation"
        />
      </div>

    </div>
  )
}
