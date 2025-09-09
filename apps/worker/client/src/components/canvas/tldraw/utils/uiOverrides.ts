import type { TLUiOverrides } from '@tldraw/tldraw'

export const uiOverrides: TLUiOverrides = {
  tools(editor, tools) {
    // Add the table tool to the UI tools registry
    tools.table = {
      id: 'table',
      label: 'Table',
      icon: 'table',
      kbd: 'b', // Keyboard shortcut
      onSelect: () => {
        editor.setCurrentTool('table')
      },
    }
    return tools
  }
}