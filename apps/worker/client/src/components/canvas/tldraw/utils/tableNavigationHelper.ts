// Store references to TipTap editors for table navigation
export const tipTapEditors = new Map<string, any>()

export function registerTipTapEditor(shapeId: string, editor: any) {
  tipTapEditors.set(shapeId, editor)
}

export function unregisterTipTapEditor(shapeId: string) {
  tipTapEditors.delete(shapeId)
}

export function getTipTapEditor(shapeId: string) {
  return tipTapEditors.get(shapeId)
}