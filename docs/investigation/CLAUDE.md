# PowerPoint Parser Visual Validation with Claude Code

This folder contains an interactive validation system that works with Claude to improve the PowerPoint parser based on visual descriptions.

## How It Works

1. **samples.json** contains PowerPoint samples with visual descriptions
2. **validate-samples.js** parses each sample and presents results for Claude validation
3. Claude analyzes if the parsed output matches the visual description
4. Claude suggests parser improvements for mismatches
5. Apply fixes and re-run to verify improvements

## Claude Code Command

Use this slash command in Claude Code to start the validation process:

```
/validate-ppt-samples
```

This will:
- Run the validation script
- Present each sample's description and parsed output
- Wait for Claude's validation feedback
- Generate improvement suggestions
- Track validation results

## Manual Usage

You can also run the script manually:

```bash
cd apps/proxy-server
node scripts/validate-samples.js
```

## Sample Structure

Each sample in `samples.json`:
```json
{
  "sample-name": {
    "bin": "fixtures/sample-name.bin",
    "description": "Visual description of what should be parsed"
  }
}
```

## Validation Workflow

1. **Parse Sample**: Script loads binary file and parses with current parser
2. **Present to Claude**: Shows description vs actual parsed output
3. **Claude Validates**: Determines if output matches description
4. **Identify Issues**: Claude specifies what's wrong (colors, shapes, types, etc.)
5. **Suggest Fixes**: Claude recommends specific parser improvements
6. **Apply & Re-test**: Apply suggested changes and validate again

## Files Generated

- `validation-results.json` - Complete validation session results
- Debug output showing parsing process and component details

## Example Validation

```
Description: "Simple orange rectangle"
Parsed: Text component, no rectangle, no orange color
Issues: Wrong type classification, missing color parsing
Suggestion: Fix shape detection in clipboard format parsing
```

This creates a tight feedback loop for iteratively improving the parser accuracy!