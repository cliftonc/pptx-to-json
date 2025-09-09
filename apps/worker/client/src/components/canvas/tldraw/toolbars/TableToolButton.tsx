import { useEditor, useTools, useIsToolSelected } from '@tldraw/tldraw'
import { TableIcon } from '../icons/TableIcons'

export function TableToolButton() {
  const editor = useEditor()
  const tools = useTools()
  const isTableSelected = useIsToolSelected(tools['table'])

  const handleClick = () => {
    // Simply activate the table tool
    editor.setCurrentTool('table')
  }

  return (
    <button
      className="tlui-button tlui-button__tool"
      data-testid="tools.table"
      title="Insert Table (T)"
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '40px',
        height: '40px',
        border: 'none',
        background: isTableSelected ? 'var(--color-selected)' : 'transparent',
        borderRadius: '4px',
        cursor: 'pointer',
        padding: '0',
      }}
    >
      <TableIcon size={20} />
    </button>
  )
}