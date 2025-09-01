# Test Fixtures

This directory contains binary PowerPoint clipboard data files used for testing.

## How to populate fixtures

1. **Manual method**: 
   - Copy content from PowerPoint
   - Use the demo app to capture a real clipboard URL
   - Run `npm run download-fixtures` to download the binary data

2. **Direct method**:
   - Use the browser developer tools to capture the binary response from Microsoft APIs
   - Save the binary data directly to files in this directory

## Fixture files

- `simple-shapes.bin` - Basic geometric shapes
- `text-only.bin` - Text boxes with various formatting  
- `complex-slide.bin` - Mixed content with multiple component types

## File format

All fixture files should be binary PowerPoint clipboard data in Office Open XML (ZIP) format.
The files should start with the ZIP signature: `50 4B 03 04` (hex)

## Debug

If you just want to see the json generated for a shape:

`npm run log-paste <url>`

   