import React, { createContext, useContext, useCallback, useState } from 'react'
import type { PowerPointSlide } from 'ppt-paste-parser'
import type { UnifiedSnapshotV1, RendererStates, AnyUnifiedSnapshot } from '../types/canvas'
import { getSnapshot as getTlSnapshot } from '@tldraw/tldraw'

interface PresentationContextValue {
  slides: PowerPointSlide[]
  setSlides: (slides: PowerPointSlide[]) => void
  originalParsed: any | null
  setOriginalParsed: (data: any | null) => void
  rendererStates: RendererStates
  setRendererState: (key: keyof RendererStates, value: any) => void
  loadUnified: (data: AnyUnifiedSnapshot) => void
  buildUnified: () => UnifiedSnapshotV1 | null
  saveUnified: (slideId: string) => Promise<{ success: boolean; shareUrl?: string; error?: string }>
}

const PresentationContext = createContext<PresentationContextValue | undefined>(undefined)

export const PresentationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [slides, setSlides] = useState<PowerPointSlide[]>([])
  const [originalParsed, setOriginalParsed] = useState<any | null>(null)
  const [rendererStates, setRendererStates] = useState<RendererStates>({})

  const setRendererState = useCallback((key: keyof RendererStates, value: any) => {
    setRendererStates(prev => ({ ...prev, [key]: value }))
  }, [])

  const loadUnified = useCallback((data: AnyUnifiedSnapshot) => {
    if ((data as any).version === 1) {
      const v1 = data as UnifiedSnapshotV1
      setSlides(v1.slides || [])
      setOriginalParsed(v1.originalParsed || null)
      setRendererStates(v1.rendererStates || {})
    } else if ((data as any).snapshot) {
      // legacy TLDraw only snapshot
      setRendererStates({ tldraw: (data as any).snapshot })
    }
  }, [])

  // Build a versioned unified snapshot including all renderer states
  const buildUnified = useCallback((): UnifiedSnapshotV1 | null => {
    if (!slides || slides.length === 0) return null
    return {
      version: 1,
      slides,
      originalParsed: originalParsed || undefined,
      rendererStates,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
  }, [slides, originalParsed, rendererStates])

  const saveUnified = useCallback(async (slideId: string) => {
    if (!slideId) return { success: false, error: 'Missing slideId' }

    // If TLDraw editor present, refresh its snapshot before saving
    try {
      const editorEl = document.querySelector('[data-editor-id]') as any
      if (editorEl?.__tldraw_editor) {
        const editor = editorEl.__tldraw_editor as any
        const { document, session } = getTlSnapshot(editor.store)
        setRendererStates(prev => ({ ...prev, tldraw: { document, session } }))
      }
    } catch {}

    const unified = buildUnified()

    // If no unified slides (legacy path), but have TL snapshot only
    if (!unified) {
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[PresentationContext] buildUnified returned null; slides length:', slides.length, 'rendererStates keys:', Object.keys(rendererStates || {}))
      }
      const legacyTl = rendererStates.tldraw
      if (!legacyTl) return { success: false, error: 'Nothing to save' }
      const resp = await fetch(`/api/slides/${slideId}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot: legacyTl })
      })
      if (!resp.ok) return { success: false, error: 'Save failed' }
      return { success: true, shareUrl: `/slides/${slideId}` }
    }

    const resp = await fetch(`/api/slides/${slideId}/state`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unified })
    })
    if (!resp.ok) return { success: false, error: 'Save failed' }
    return { success: true, shareUrl: `/slides/${slideId}` }
  }, [buildUnified, rendererStates])

  return (
    <PresentationContext.Provider value={{ slides, setSlides, originalParsed, setOriginalParsed, rendererStates, setRendererState, loadUnified, buildUnified, saveUnified }}>
      {children}
    </PresentationContext.Provider>
  )
}

export function usePresentation() {
  const ctx = useContext(PresentationContext)
  if (!ctx) throw new Error('usePresentation must be used within PresentationProvider')
  return ctx
}
