import { useState } from 'react'
import { useEditor } from '@tldraw/tldraw'
import { usePresentation } from '../../../context/PresentationContext'

interface TopToolbarProps {
  slideId: string | undefined
  onClearAndGoHome?: () => void
}

export function TopToolbar({ slideId, onClearAndGoHome }: TopToolbarProps) {
  const editor = useEditor()
  const { saveUnified } = usePresentation()
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [shareUrl, setShareUrl] = useState<string>('')

  const handleSaveShare = async () => {
    if (!editor || !slideId) return

    try {
      setIsSaving(true)
      setSaveStatus('idle')

      const result = await saveUnified(slideId)

      if (result.success) {
        setSaveStatus('success')
        const fullShareUrl = `${window.location.origin}/slides/${slideId}`
        setShareUrl(fullShareUrl)
        window.history.pushState({}, '', `/slides/${slideId}`)
        await navigator.clipboard.writeText(fullShareUrl)
      } else {
        throw new Error(result.error || 'Failed to save slide')
      }
    } catch (error) {
      console.error('Error saving slide:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearAll = () => {
    if (!editor) return
    
    const confirmed = window.confirm('Are you sure you want to clear all content and return to home? This action cannot be undone.')
    if (confirmed) {
      // Clear all shapes on the current page
      const shapes = editor.getCurrentPageShapes()
      editor.deleteShapes(shapes.map(shape => shape.id))
      console.log('All content cleared')
      
      // Navigate back to home page
      if (onClearAndGoHome) {
        onClearAndGoHome()
      } else {
        // Fallback navigation
        window.location.href = '/'
      }
    }
  }

  const getSaveButtonText = () => {
    if (isSaving) return '💾 Saving...'
    if (saveStatus === 'success') return '✅ Saved & Copied!'
    if (saveStatus === 'error') return '❌ Save Failed'
    return '🔗 Save & Share'
  }



  // Only show the container if there's a slideId (which means buttons will be visible)
  if (!slideId) return null

  return (
    <div style={{ 
      position: 'absolute', 
      top: '12px', 
      left: '50%', 
      transform: 'translateX(-50%)',
      zIndex: 1000,
      display: 'flex',
      gap: '8px',
      alignItems: 'center',
      backgroundColor: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '4px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Save & Share Button */}
      <button
        onClick={handleSaveShare}
        disabled={isSaving}
        style={{
          padding: '8px 12px',
          backgroundColor: saveStatus === 'success' ? '#10b981' : 
                         saveStatus === 'error' ? '#ef4444' : 
                         '#3b82f6',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          transition: 'all 0.1s ease',
          opacity: isSaving ? 0.6 : 1,
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: 'none'
        }}
        title="Save current state and get shareable link"
      >
        {getSaveButtonText()}
      </button>

      {/* Clear All Button */}
      <button
        onClick={handleClearAll}
        style={{
          padding: '8px 12px',
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '500',
          cursor: 'pointer',
          transition: 'all 0.1s ease',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: 'none'
        }}
        title="Clear all content and return to home"
      >
        🗑️ Clear All
      </button>

      {/* Success/Error Messages */}
      {saveStatus === 'success' && shareUrl && (
        <div style={{
          position: 'absolute',
          top: '44px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '8px 12px',
          minWidth: '250px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          color: '#333333',
          fontSize: '12px'
        }}>
          <div style={{ marginBottom: '4px', fontWeight: '500' }}>
            ✅ Link copied to clipboard!
          </div>
          <div style={{ opacity: 0.7, wordBreak: 'break-all' }}>
            {shareUrl}
          </div>
        </div>
      )}

      {saveStatus === 'error' && (
        <div style={{
          position: 'absolute',
          top: '44px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ffffff',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '8px 12px',
          minWidth: '200px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
          color: '#333333',
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: '500' }}>
            ❌ Failed to save slide
          </div>
          <div style={{ opacity: 0.7, marginTop: '2px' }}>
            Please try again
          </div>
        </div>
      )}
    </div>
  )
}

// Export the auto-save function for external use
export { TopToolbar as default }