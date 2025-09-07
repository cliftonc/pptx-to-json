import { describe, it, expect } from 'vitest';
import { TextParser } from '../../src/parsers/TextParser.ts';

// Minimal synthetic textBody structure approximating normalized format
// We simulate two runs that should have a space inserted and bold/italic formatting.

describe('TextParser spacing & style regression', () => {
  it('restores missing space between word runs and preserves marks', async () => {
    const textBody = {
      p: [
        {
          r: [
            { t: 'Become', rPr: { $b: 1, $sz: 2400 } }, // bold 24pt
            { t: 'an', rPr: { $i: 1, $sz: 1800 } },       // italic 18pt
            { t: 'ecosystem', rPr: { $sz: 1800 } }       // normal 18pt
          ]
        }
      ]
    };

    const comp = await TextParser.parseFromNormalized({ textBody }, 0, 0, 0);
    expect(comp).not.toBeNull();
    if (!comp) return;

    // Plain content should have spaces inserted (heuristic) -> "Become an ecosystem"
    expect(comp.content).toBe('Become an ecosystem');

    // Original rich doc stored in richText (regression name restored)
    const doc: any = (comp as any).richText;
    expect(doc?.type).toBe('doc');
    const firstPara = doc.content[0];
    // Expect inserted space nodes present inside paragraph content
    const paraTexts = firstPara.content.map((n: any) => n.text);
    expect(paraTexts.join('')).toContain('Become an ecosystem');

    // Check styles from the rich text document structure
    const allTextNodes: any[] = [];
    if (firstPara?.content) {
      firstPara.content.forEach((node: any) => {
        if (node.type === 'text') {
          allTextNodes.push(node);
        }
      });
    }
    
    // Find text nodes with specific content to verify styling
    const becomeNode = allTextNodes.find((n: any) => n.text?.includes('Become'));
    const anNode = allTextNodes.find((n: any) => n.text === 'an');
    
    // Verify that marks/styles are preserved in the rich text structure
    expect(becomeNode?.marks?.some((m: any) => m.type === 'bold' || m.type === 'strong')).toBeTruthy();
    expect(anNode?.marks?.some((m: any) => m.type === 'italic' || m.type === 'em')).toBeTruthy();
  });
});
