import React from 'react'
import './toolbar.css'

interface ToolbarButtonProps {
  icon: React.ReactNode
  label?: string
  tooltip?: string
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  ariaLabel?: string
  className?: string
}

export function ToolbarButton({
  icon,
  label,
  tooltip,
  active,
  disabled,
  onClick,
  ariaLabel,
  className
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      className={`tb-btn${label ? ' with-label' : ''}${active ? ' is-active' : ''}${className ? ' ' + className : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel || label || tooltip}
      title={tooltip || label}
    >
      {icon}
      {label && <span className="tb-label">{label}</span>}
    </button>
  )
}