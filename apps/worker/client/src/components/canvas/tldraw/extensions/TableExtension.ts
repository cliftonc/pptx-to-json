import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Extension } from '@tiptap/core'

// Custom extension to handle Tab key in tables
export const TableTabHandler = Extension.create({
  name: 'tableTabHandler',  
  priority: 1000,
  
  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        if (editor.isActive('table')) {
          editor.commands.goToNextCell()
          return true
        }
        return false
      },
      'Shift-Tab': ({ editor }) => {
        if (editor.isActive('table')) {
          editor.commands.goToPreviousCell()
          return true
        }
        return false
      },
    }
  }
})

// TableExtension for TipTap v2.26.1 with TLDraw integration
// Export the configured Table extension
export const TableExtension = Table.configure({
  resizable: true, // Enable resizing for edit mode
  handleWidth: 5,
  HTMLAttributes: {
    class: 'tldraw-table',
    style: 'width: auto; max-width: 500px;', // Limit initial width
  },
  cellMinWidth: 60,
  lastColumnResizable: true,
  allowTableNodeSelection: false,
})

// Export the required table components with configuration
export const TableRowExtension = TableRow.configure({
  HTMLAttributes: {
    class: 'tldraw-table-row',
  },
})

export const TableCellExtension = TableCell.configure({
  HTMLAttributes: {
    class: 'tldraw-table-cell',
  },
})

export const TableHeaderExtension = TableHeader.configure({
  HTMLAttributes: {
    class: 'tldraw-table-header',
  },
})