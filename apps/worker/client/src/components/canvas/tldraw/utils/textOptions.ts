import { tipTapDefaultExtensions, defaultAddFontsFromNode, type TLTextOptions } from '@tldraw/tldraw'
import FontFamily from '@tiptap/extension-font-family'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontSize } from '../extensions/FontSizeExtension'
import { 
  TableExtension, 
  TableRowExtension, 
  TableCellExtension, 
  TableHeaderExtension,
  TableTabHandler
} from '../extensions/TableExtension'

// Text options configuration to support FontSize, TextStyle marks, and Tables
export const textOptions: Partial<TLTextOptions> = {
  tipTapConfig: {
    extensions: [
      TableTabHandler, // Put tab handler before all extensions
      ...tipTapDefaultExtensions, 
      FontFamily, 
      FontSize, 
      TextStyle,
      Color,       
      TableExtension,
      TableRowExtension,
      TableCellExtension,
      TableHeaderExtension
    ],
  },
  addFontsFromNode(node, state, addFont) {
    state = defaultAddFontsFromNode(node, state, addFont)

    // Handle textStyle marks with fontSize and fontFamily
    for (const mark of node.marks) {
      if (mark.type.name === 'textStyle' && mark.attrs) {
        // Handle fontFamily
        if (mark.attrs.fontFamily && mark.attrs.fontFamily !== 'DEFAULT' && mark.attrs.fontFamily !== state.family) {
          state = { ...state, family: mark.attrs.fontFamily }
        }
        // Handle fontSize - note: fontSize is handled by TipTap, not font loading
      }
    }

    return state
  },
}