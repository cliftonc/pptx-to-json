# PowerPoint Table Parsing Investigation

## Issue Summary

The PowerPoint parser is not correctly extracting table data from clipboard operations. Multiple shapes are being lost during parsing, specifically **shapeId 2** is missing from table data that should contain shapes with IDs 2 and 4.

## Evidence

### Clipboard HTML Data
- Location: `/test-harness/fixtures/clipboard.txt`
- Shows `data-shapeids="2,4"` indicating 2 shapes should be present
- Contains complete table structure:
  - Header row: "HEADER-1", "d", "f" (blue background, white text, bold)
  - Data row: "b", "c", "e" (gray background, black text, normal weight)
  - 2 rows × 3 columns table
  - 18pt Aptos font throughout

### Parser Output
- Only finds **1 component with shapeId 4**
- Missing **shapeId 2** entirely
- Extracts single text element with content "TEXT" instead of table structure
- Binary data size: 3,987 bytes (same for both test cases)

### Test Cases
1. `basic-tables-4.bin` - Shows same issue (shapeId 4 only)
2. `table-with-shapeids-2-4.bin` - Created from clipboard data, same result

## HTML Table Structure Analysis

### Positioning Data Available
- Row heights: Header (38px), Data (102px)
- Cell widths: All cells 285px
- Cell padding: 4.8px × 9.6px
- Border widths: Variable (1.07576px to 3.22727px)
- Colors: Header rgb(21,96,130), Data rgb(204,210,216)

### Missing Data
- **No absolute X/Y coordinates** - Uses relative table layout
- **No shapeId mapping** - Container shows "2,4" but cells not mapped to specific IDs
- **No PowerPoint EMU units** - HTML uses px instead of PowerPoint coordinates

## Parser Analysis

### Current Behavior
```
XML Structure: a:graphic.a:graphicData.lc:lockedCanvas.a:sp
Found elements: 1 (should be 2+)
Shape found: Only shapeId 4 with "TEXT" content
Missing: shapeId 2 and table structure
```

### Issues Identified
1. **Multi-shape detection failure** - Parser only finds 1 of 2 shapes
2. **Table structure ignored** - No recognition of table vs individual text elements  
3. **Shape enumeration incomplete** - Missing shapes in XML traversal
4. **Content mismatch** - "TEXT" vs actual table content ("HEADER-1", "d", "f", "b", "c", "e")

## Technical Details

### XML Debug Output
```xml
<a:cNvPr $id="4" $name="TextBox 3">
```
- Only shows shapeId 4
- Named "TextBox 3" (suggests there might be TextBox 1, 2?)
- Missing other shape definitions

### Expected vs Actual
| Expected | Actual |
|----------|--------|
| 2 shapes (IDs 2,4) | 1 shape (ID 4) |
| Table with 6 cells | Single text element |
| Multiple text content | Just "TEXT" |
| Table positioning | Single text box position |

## Investigation Steps Needed

1. **XML Structure Analysis**
   - Examine full XML to find where shapeId 2 is defined
   - Check for multiple `a:sp` elements or nested structures
   - Look for table-specific XML elements (`a:tbl`, `a:tr`, `a:tc`)

2. **Parser Logic Review**
   - Verify shape enumeration logic in clipboard parsing
   - Check if parser stops after first shape found
   - Review table detection vs text box classification

3. **Shape ID Extraction**
   - Trace how shapeIds are extracted from XML
   - Verify all `a:cNvPr` elements are being processed
   - Check for shapes in different XML sections

4. **Content Extraction**
   - Understand why content shows "TEXT" instead of table data
   - Check if table cells are being processed separately
   - Verify text content extraction from table structures

## Testing Commands

### Debug Binary Data
```bash
# Test the clipboard binary with debug output
node scripts/log-paste-bin.js test-harness/fixtures/table-with-shapeids-2-4.bin --debug

# Compare with basic-tables-4 (should be identical)
node scripts/log-paste-bin.js test-harness/fixtures/basic-tables-4.bin --debug

# Run test validation
npm test -- __tests__/fixture-validation.test.js
```

### Create New Test Cases
```bash
# Add test case from clipboard URL
npm run add-test-case "test-name" "https://euc-powerpoint.officeapps.live.com/pods/GetClipboardBytes.ashx?Id=..."

# Test specific fixture
npm test -- __tests__/fixture-validation.test.js --testNamePattern="table-with-shapeids-2-4"
```

### Debug XML Structure
```bash
# Extract and examine ZIP contents (manual debugging)
cd test-harness/fixtures
file table-with-shapeids-2-4.bin  # Verify it's a ZIP
unzip -l table-with-shapeids-2-4.bin  # List ZIP contents
unzip table-with-shapeids-2-4.bin -d temp/  # Extract to temp directory
cat temp/clipboard/drawings/drawing1.xml | jq  # Pretty print XML (if JSON)
```

## Files for Further Investigation

- `clipboard/drawings/drawing1.xml` - Contains the actual shape definitions
- `PowerPointParser.js:parseClipboard()` - Main parsing logic
- `TextParser.js` - May need table-aware text extraction
- Need potential `TableParser.js` for proper table handling

## Next Steps

1. Run debug script on the binary XML to see full structure
2. Check if shapeId 2 exists in different XML section
3. Enhance parser to handle multi-shape clipboard operations  
4. Implement proper table structure recognition
5. Create comprehensive table parsing logic

---
*Investigation started: 2025-08-31*
*Last updated: 2025-08-31*