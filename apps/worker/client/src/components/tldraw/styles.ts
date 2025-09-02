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

/* Table styles for TipTap tables in TLDraw - both view and edit modes */
.tl-text-content table,
.tl-text-content .tldraw-table,
.tl-text-content-editor table,
.tl-text-content-editor .tldraw-table,
.ProseMirror table,
.ProseMirror .tldraw-table,
.tl-text-label__editor table,
.tl-text-label__editor .tldraw-table {
    border-collapse: collapse !important;
    margin: 8px 0 !important;
    overflow: visible !important;
    table-layout: auto !important;
    width: auto !important;
    display: table !important;
    border: 1px solid #333 !important;
}

.tl-text-content td,
.tl-text-content th,
.tl-text-content-editor td,
.tl-text-content-editor th,
.ProseMirror td,
.ProseMirror th,
.tl-text-label__editor td,
.tl-text-label__editor th,
.tldraw-table td,
.tldraw-table th,
.tldraw-table-cell,
.tldraw-table-header {
    border: 1px solid #333 !important;
    box-sizing: border-box !important;
    min-width: 60px !important;
    padding: 6px 10px !important;
    position: relative !important;
    vertical-align: top !important;
    background-color: white !important;
}

.tl-text-content th,
.tl-text-content-editor th,
.ProseMirror th,
.tl-text-label__editor th,
.tldraw-table th,
.tldraw-table-header {
    background-color: #e8e8e8 !important;
    font-weight: bold !important;
    text-align: left !important;
}

.tl-text-content tr,
.tl-text-content-editor tr,
.ProseMirror tr,
.tl-text-label__editor tr,
.tldraw-table tr,
.tldraw-table-row {
    border: 1px solid #333 !important;
}

/* Selected cell highlighting */
.tl-text-content .selectedCell,
.tl-text-content-editor .selectedCell,
.ProseMirror .selectedCell,
.tl-text-label__editor .selectedCell,
.tldraw-table .selectedCell {
    background-color: rgba(100, 150, 255, 0.1) !important;
}

.tl-text-content .selectedCell:after,
.tl-text-content-editor .selectedCell:after,
.ProseMirror .selectedCell:after,
.tl-text-label__editor .selectedCell:after,
.tldraw-table .selectedCell:after {
    background: rgba(100, 150, 255, 0.2) !important;
    content: "" !important;
    left: 0 !important;
    right: 0 !important;
    top: 0 !important;
    bottom: 0 !important;
    pointer-events: none !important;
    position: absolute !important;
    z-index: 2 !important;
}

/* Table wrapper */
.tableWrapper {
    padding: 4px 0 !important;
    overflow: visible !important;
    width: auto !important;
    max-width: 100% !important;
}

/* Column resize handle */
.tl-text-content .column-resize-handle,
.tl-text-content-editor .column-resize-handle,
.ProseMirror .column-resize-handle,
.tl-text-label__editor .column-resize-handle,
.tldraw-table .column-resize-handle {
    background-color: #4285f4 !important;
    bottom: -2px !important;
    cursor: col-resize !important;
    position: absolute !important;
    right: -2px !important;
    top: 0 !important;
    width: 4px !important;
    opacity: 0 !important;
    transition: opacity 0.2s !important;
}

.tl-text-content td:hover .column-resize-handle,
.tl-text-content th:hover .column-resize-handle,
.tl-text-content-editor td:hover .column-resize-handle,
.tl-text-content-editor th:hover .column-resize-handle,
.ProseMirror td:hover .column-resize-handle,
.ProseMirror th:hover .column-resize-handle,
.tl-text-label__editor td:hover .column-resize-handle,
.tl-text-label__editor th:hover .column-resize-handle,
.tldraw-table td:hover .column-resize-handle,
.tldraw-table th:hover .column-resize-handle {
    opacity: 1 !important;
}

.resize-cursor {
    cursor: col-resize !important;
}

/* Ensure tables don't overflow text shape bounds */
.tl-text-shape .tl-text-content,
.tl-text-shape .tl-text-content-editor,
.tl-text-shape .ProseMirror,
.tl-text-shape .tl-text-label__editor {
    overflow: visible !important;
}

.tl-text-shape .tl-text-content table,
.tl-text-shape .tl-text-content-editor table,
.tl-text-shape .ProseMirror table,
.tl-text-shape .tl-text-label__editor table {
    min-width: 200px !important;
    width: fit-content !important;
}

/* Additional specificity for ProseMirror editor in TLDraw */
.tl-canvas .ProseMirror table {
    border: 1px solid #333 !important;
}

.tl-canvas .ProseMirror td,
.tl-canvas .ProseMirror th {
    border: 1px solid #333 !important;
    padding: 6px 10px !important;
    min-width: 60px !important;
}

.tl-canvas .ProseMirror th {
    background-color: #e8e8e8 !important;
}

.tl-canvas .ProseMirror td {
    background-color: white !important;
}
`