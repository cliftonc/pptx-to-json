import React, { useState } from 'react'
import { useSimpleCanvas } from '../context/SimpleCanvasProvider'

/**
 * Canvas selector component props
 */
interface CanvasSelectorProps {
  className?: string
  style?: React.CSSProperties
  showDetails?: boolean
  disabled?: boolean
}

/**
 * Icons for different renderer types
 */
const RendererIcons: Record<string, string> = {
  tldraw: '🎨',
  konva: '⚡',
  fabric: '🖼️'
}

/**
 * Canvas selector component for switching between renderers
 */
export function CanvasSelector({
  className = '',
  style = {},
  showDetails = true,
  disabled = false
}: CanvasSelectorProps) {
  const {
    currentRendererType,
    availableRenderers,
    isLoading,
    error,
    switchRenderer
  } = useSimpleCanvas()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleRendererSelect = async (type: string) => {
    if (disabled || isLoading || type === currentRendererType) {
      return
    }

    try {
      await switchRenderer(type)
      setIsDropdownOpen(false)
    } catch (err) {
      console.error('Failed to switch renderer:', err)
    }
  }

  const currentRenderer = availableRenderers.find(r => r.type === currentRendererType)

  if (availableRenderers.length <= 1) {
    // Don't show selector if only one renderer is available
    return null
  }

  return (
    <div 
      className={`canvas-selector ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        ...style
      }}
    >
      {/* Current Renderer Button */}
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={disabled || isLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '6px',
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          color: disabled ? '#6c757d' : '#495057',
          transition: 'all 0.2s ease',
          minWidth: '140px',
          justifyContent: 'space-between',
          opacity: disabled ? 0.6 : 1,
          ...(isDropdownOpen && !disabled && {
            backgroundColor: '#e9ecef',
            borderColor: '#adb5bd'
          })
        }}
        onMouseOver={(e) => {
          if (!disabled && !isLoading) {
            e.currentTarget.style.backgroundColor = '#e9ecef'
            e.currentTarget.style.borderColor = '#adb5bd'
          }
        }}
        onMouseOut={(e) => {
          if (!isDropdownOpen && !disabled && !isLoading) {
            e.currentTarget.style.backgroundColor = '#f8f9fa'
            e.currentTarget.style.borderColor = '#dee2e6'
          }
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {currentRenderer ? (
            <>
              <span>{RendererIcons[currentRenderer.type]}</span>
              <span>{currentRenderer.displayName}</span>
            </>
          ) : (
            <span>Select Renderer</span>
          )}
          {isLoading && (
            <span style={{ 
              display: 'inline-block', 
              width: '12px', 
              height: '12px', 
              border: '2px solid #6c757d', 
              borderTop: '2px solid transparent', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite' 
            }} />
          )}
        </span>
        <span style={{ 
          fontSize: '12px', 
          transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>
          ▼
        </span>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: '0',
            right: '0',
            zIndex: 1000,
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            marginTop: '4px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden'
          }}
        >
          {availableRenderers.map((renderer) => {
            const isCurrent = renderer.type === currentRendererType
            
            return (
              <button
                key={renderer.type}
                type="button"
                onClick={() => handleRendererSelect(renderer.type)}
                disabled={disabled || isLoading || isCurrent}
                style={{
                  width: '100%',
                  padding: showDetails ? '12px 16px' : '8px 12px',
                  backgroundColor: isCurrent ? '#e3f2fd' : 'white',
                  border: 'none',
                  borderBottom: '1px solid #f1f3f4',
                  textAlign: 'left',
                  cursor: (disabled || isLoading || isCurrent) ? 'default' : 'pointer',
                  fontSize: '14px',
                  color: isCurrent ? '#1976d2' : '#495057',
                  transition: 'background-color 0.15s ease',
                  display: 'block'
                }}
                onMouseOver={(e) => {
                  if (!disabled && !isLoading && !isCurrent) {
                    e.currentTarget.style.backgroundColor = '#f8f9fa'
                  }
                }}
                onMouseOut={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.backgroundColor = 'white'
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{RendererIcons[renderer.type]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: isCurrent ? '600' : '500',
                      marginBottom: showDetails ? '2px' : '0'
                    }}>
                      {renderer.displayName}
                      {isCurrent && (
                        <span style={{ 
                          marginLeft: '8px', 
                          fontSize: '12px', 
                          color: '#1976d2',
                          fontWeight: '400'
                        }}>
                          (Current)
                        </span>
                      )}
                    </div>
                    {showDetails && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#6c757d',
                        lineHeight: '1.3'
                      }}>
                        {renderer.description}
                      </div>
                    )}
                  </div>
                </div>
                
                {showDetails && (
                  <div style={{ 
                    marginTop: '6px',
                    display: 'flex',
                    gap: '4px',
                    fontSize: '11px',
                    color: '#6c757d'
                  }}>
                    {renderer.capabilities.supportsSlideshow && (
                      <span style={{ 
                        padding: '2px 6px', 
                        backgroundColor: '#e3f2fd', 
                        borderRadius: '10px',
                        color: '#1565c0'
                      }}>
                        Slideshow
                      </span>
                    )}
                    {renderer.capabilities.supportsRichText && (
                      <span style={{ 
                        padding: '2px 6px', 
                        backgroundColor: '#f3e5f5', 
                        borderRadius: '10px',
                        color: '#7b1fa2'
                      }}>
                        Rich Text
                      </span>
                    )}
                    {renderer.capabilities.supportsCollaboration && (
                      <span style={{ 
                        padding: '2px 6px', 
                        backgroundColor: '#e8f5e8', 
                        borderRadius: '10px',
                        color: '#2e7d32'
                      }}>
                        Collab
                      </span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: '0',
          right: '0',
          marginTop: '4px',
          padding: '8px 12px',
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#721c24',
          zIndex: 999
        }}>
          {error}
        </div>
      )}

      {/* CSS Animation for Loading Spinner */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Click outside handler */}
      {isDropdownOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  )
}

/**
 * Simple canvas renderer status indicator
 */
export function CanvasRendererStatus() {
  const { currentRendererType, isLoading, error } = useSimpleCanvas()

  if (!currentRendererType && !isLoading) {
    return null
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '12px',
      color: '#6c757d',
      padding: '4px 8px',
      backgroundColor: '#f8f9fa',
      borderRadius: '4px',
      border: '1px solid #dee2e6'
    }}>
      {isLoading ? (
        <>
          <span style={{ 
            display: 'inline-block', 
            width: '10px', 
            height: '10px', 
            border: '1px solid #6c757d', 
            borderTop: '1px solid transparent', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite' 
          }} />
          <span>Switching...</span>
        </>
      ) : error ? (
        <>
          <span style={{ color: '#dc3545' }}>⚠️</span>
          <span style={{ color: '#dc3545' }}>Error</span>
        </>
      ) : currentRendererType ? (
        <>
          <span>{RendererIcons[currentRendererType]}</span>
          <span>{currentRendererType}</span>
        </>
      ) : null}
    </div>
  )
}

export default CanvasSelector