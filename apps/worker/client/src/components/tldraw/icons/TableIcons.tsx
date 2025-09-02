import React from 'react'

interface IconProps {
  size?: number
  color?: string
  className?: string
}

export const TableIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
    <path d="M15 3v18" />
    <path d="M3 9h18" />
    <path d="M3 15h18" />
    {/* Shaded header row */}
    <rect x="3" y="3" width="18" height="6" rx="2" fill={color} fillOpacity="0.15" stroke="none" />
  </svg>
)

export const TableRowAddIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Single row bar */}
    <rect x="4" y="7" width="16" height="3" rx="0.5" />
    {/* Plus sign below with gap */}
    <path d="M12 14v6" />
    <path d="M9 17h6" />
  </svg>
)

export const TableRowDeleteIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Single row bar */}
    <rect x="4" y="7" width="16" height="3" rx="0.5" />
    {/* X mark below with gap */}
    <path d="M9 14l6 6" />
    <path d="M15 14l-6 6" />
  </svg>
)

export const TableColumnAddIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Single column bar */}
    <rect x="7" y="4" width="3" height="16" rx="0.5" />
    {/* Plus sign to the right with gap */}
    <path d="M17 9v6" />
    <path d="M14 12h6" />
  </svg>
)

export const TableColumnDeleteIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Single column bar */}
    <rect x="7" y="4" width="3" height="16" rx="0.5" />
    {/* X mark to the right with gap */}
    <path d="M14 9l6 6" />
    <path d="M20 9l-6 6" />
  </svg>
)

export const TableDeleteIcon: React.FC<IconProps> = ({ size = 16, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Full table */}
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M9 5v16" />
    <path d="M15 5v16" />
    <path d="M3 11h18" />
    <path d="M3 16h18" />
    {/* White background circle for X */}
    <circle cx="18" cy="6" r="5" fill="white" stroke="none" />
    {/* X mark with border */}
    <circle cx="18" cy="6" r="5" fill="none" stroke={color} strokeWidth="1.5" />
    <path d="M16 4l4 4" stroke={color} strokeWidth="1.5" />
    <path d="M20 4l-4 4" stroke={color} strokeWidth="1.5" />
  </svg>
)