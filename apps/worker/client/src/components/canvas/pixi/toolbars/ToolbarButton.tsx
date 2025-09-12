import React from 'react'

interface ToolbarButtonProps {
  icon: string
  label: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
  tooltip?: string
  size?: 'small' | 'medium' | 'large'
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  icon,
  label,
  onClick,
  active = false,
  disabled = false,
  tooltip,
  size = 'medium'
}) => {
  const sizeStyles = {
    small: {
      padding: '6px 8px',
      fontSize: '12px',
      iconSize: '12px'
    },
    medium: {
      padding: '8px 12px',
      fontSize: '13px',
      iconSize: '14px'
    },
    large: {
      padding: '10px 16px',
      fontSize: '14px',
      iconSize: '16px'
    }
  }

  const currentSize = sizeStyles[size]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: currentSize.padding,
        border: active ? '2px solid #3b82f6' : '1px solid #d1d5db',
        borderRadius: '6px',
        backgroundColor: active ? '#dbeafe' : (disabled ? '#f9fafb' : '#ffffff'),
        color: disabled ? '#9ca3af' : (active ? '#1e40af' : '#374151'),
        fontSize: currentSize.fontSize,
        fontWeight: active ? '600' : '500',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        outline: 'none',
        position: 'relative',
        opacity: disabled ? 0.6 : 1,
        boxShadow: active ? '0 2px 4px rgba(59, 130, 246, 0.1)' : '0 1px 2px rgba(0, 0, 0, 0.05)'
      }}
      onMouseEnter={(e) => {
        if (!disabled && !active) {
          e.currentTarget.style.backgroundColor = '#f3f4f6'
          e.currentTarget.style.borderColor = '#9ca3af'
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !active) {
          e.currentTarget.style.backgroundColor = '#ffffff'
          e.currentTarget.style.borderColor = '#d1d5db'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.1)'
        }
      }}
      onMouseUp={(e) => {
        if (!disabled && !active) {
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      {/* Icon */}
      <span
        style={{
          fontSize: currentSize.iconSize,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {icon}
      </span>
      
      {/* Label */}
      <span style={{ lineHeight: 1 }}>
        {label}
      </span>

      {/* Active indicator */}
      {active && (
        <div
          style={{
            position: 'absolute',
            bottom: '-1px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60%',
            height: '2px',
            background: 'linear-gradient(45deg, #3b82f6, #1e40af)',
            borderRadius: '1px'
          }}
        />
      )}
    </button>
  )
}