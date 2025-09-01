---
description: Start interactive PowerPoint parser validation with Claude
allowed-tools: [Bash, Read, Edit, Grep, Glob, TodoWrite]
---

Start interactive PowerPoint parser validation. This will run the validation script that allows testing different PowerPoint samples and comparing parsing results.

## Step 1: Initial Validation
Run: `cd packages/ppt-paste-server && node scripts/validate-samples.js`

## Step 2: Analyze Results
For each unvalidated item, compare the visual description with the generated component JSON. If they don't match, IMMEDIATELY start fixing using the process below.

CRITICAL: You must NEVER skip validation or assume known issues. You MUST fix parser code to resolve any discrepancies.

## Step 3: Debug Process
1. **Create TodoList** for tracking fixes needed
2. **Debug specific sample**: `pnpm log-bin <filename>.bin --debug` (from project root)
3. **Examine raw XML structure** to understand PowerPoint format differences
4. **Identify root cause** in parser code

## Step 4: Testing & Validation
1. **Test fix**: Re-run `pnpm log-bin <filename>.bin` (from project root)
2. **Verify component count** matches expected description
3. **Check unique data** for images (different base64 strings)
4. **Re-run validation**: `node scripts/validate-samples.js`

## Step 5: Mark as Validated
Once parsing matches description exactly:
1. **Update samples.json**: Edit `test/test-harness/samples.json`
2. **Add validation flag**: Set `"validated": true` for the fixed sample
3. **Complete TodoList**: Mark all related tasks as completed

## Key Files to Understand:
- `src/parsers/PowerPointNormalizer.js` - Handles format differences between PPTX and clipboard
- `src/parsers/ImageParser.js` - Image relationship resolution and data extraction  
- `src/parsers/TextParser.js` - Text content and formatting extraction
- `src/parsers/ShapeParser.js` - Shape geometry and styling
- `test/test-harness/samples.json` - Validation status tracking