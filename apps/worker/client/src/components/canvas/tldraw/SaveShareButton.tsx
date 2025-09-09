import { useState } from 'react'
import { useEditor, getSnapshot } from '@tldraw/tldraw'
import { usePresentation } from '../../../context/PresentationContext'

interface SaveShareButtonProps {
  slideId: string
}

export function SaveShareButton({ slideId }: SaveShareButtonProps) {
  const editor = useEditor()
  const { saveUnified, setRendererState } = usePresentation()
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [shareUrl, setShareUrl] = useState<string>('')

  const handleSaveShare = async () => {
    if (!editor || !slideId) return

    try {
      setIsSaving(true)
      setSaveStatus('idle')

      // Capture latest TLDraw state into context rendererStates
      const { document, session } = getSnapshot(editor.store)
      setRendererState('tldraw', { document, session })

      const result = await saveUnified(slideId)
      if (result.success) {
        setSaveStatus('success')
        const fullShareUrl = `${window.location.origin}/slides/${slideId}`
        setShareUrl(fullShareUrl)
        window.history.pushState({}, '', `/slides/${slideId}`)
        await navigator.clipboard.writeText(fullShareUrl)
        console.log('Slide saved successfully (unified):', result)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Error saving slide:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }

  const getButtonText = () => {
    if (isSaving) return '💾 Saving...'
    if (saveStatus === 'success') return '✅ Saved & Copied!'
    if (saveStatus === 'error') return '❌ Save Failed'
    return '🔗 Save & Share'
  }

  const getButtonColor = () => {
    if (saveStatus === 'success') return '#28a745'
    if (saveStatus === 'error') return '#dc3545'
    return '#4285f4'
  }

  return (
    <div style={{ position: 'absolute', left: '20px', top: '80px', zIndex: 1000 }}>
      <button
        onClick={handleSaveShare}
        disabled={isSaving}
        style={{
          padding: '10px 16px',
          backgroundColor: getButtonColor(),
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          transition: 'all 0.2s',
          opacity: isSaving ? 0.7 : 1
        }}
        onMouseEnter={(e) => {
          if (!isSaving) {
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }
        }}
        onMouseLeave={(e) => {
          if (!isSaving) {
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)'
            e.currentTarget.style.transform = 'translateY(0)'
          }
        }}
        title="Save current state and get shareable link"
      >
        {getButtonText()}
      </button>

      {saveStatus === 'success' && shareUrl && (
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '0',
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '8px',
          padding: '12px',
          minWidth: '250px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '8px' }}>
            <strong>✅ Link copied to clipboard!</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#0369a1', wordBreak: 'break-all' }}>
            {shareUrl}
          </div>
        </div>
      )}

      {saveStatus === 'error' && (
        <div style={{
          position: 'absolute',
          top: '60px',
          right: '0',
          background: '#fef2f2',
          border: '1px solid #f87171',
          borderRadius: '8px',
          padding: '12px',
          minWidth: '200px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', color: '#dc2626' }}>
            <strong>❌ Failed to save slide</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>
            Please try again
          </div>
        </div>
      )}
    </div>
  )
}