// Custom CSS for toolbar select elements and slideshow buttons
export const customToolbarStyles = `
.tlui-buttons__horizontal select {
    border: 0;
    background: transparent;
    margin: 0 8px;
}
.slideshow-button {
    background: transparent !important;
    color: var(--color-text-1, #1d1d1d) !important;
    border: 1px solid var(--color-low-border, #e1e1e1) !important;
    padding: 8px 10px !important;
    border-radius: 4px !important;
    font-size: 16px !important;
    cursor: pointer !important;
    margin: 0 3px !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-width: 32px !important;
    min-height: 32px !important;
}
.slideshow-button:hover {
    background: var(--color-muted-1, #f5f5f5) !important;
    border-color: var(--color-text-1, #1d1d1d) !important;
}
.slideshow-button:disabled {
    background: transparent !important;
    color: var(--color-text-3, #999) !important;
    border-color: var(--color-low-border, #e1e1e1) !important;
    cursor: not-allowed !important;
    opacity: 0.4 !important;
}
.slideshow-info {
    color: var(--color-text-1);
    font-size: 11px;
    margin: 0 4px;
    white-space: nowrap;
}
/* Hide selection and hover states during slideshow */
.slideshow-mode .tl-canvas {
    pointer-events: none !important;
}
.slideshow-mode .tl-canvas * {
    pointer-events: none !important;
    cursor: default !important;
}
.slideshow-mode .tl-selection,
.slideshow-mode .tl-selection-fg,
.slideshow-mode .tl-selection-bg,
.slideshow-mode .tl-brush,
.slideshow-mode .tl-handles,
.slideshow-mode .tl-handle,
.slideshow-mode .tl-shape-indicator {
    display: none !important;
    visibility: hidden !important;
}
.slideshow-mode .tl-overlays {
    pointer-events: none !important;
}
`