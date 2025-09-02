import { tipTapDefaultExtensions, defaultAddFontsFromNode, type TLTextOptions } from '@tldraw/tldraw'
import FontFamily from '@tiptap/extension-font-family'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontSize } from '../extensions/FontSizeExtension'

// Text options configuration to support FontSize and TextStyle marks
export const textOptions: Partial<TLTextOptions> = {
  tipTapConfig: {
    extensions: [...tipTapDefaultExtensions, FontFamily, FontSize, TextStyle],
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