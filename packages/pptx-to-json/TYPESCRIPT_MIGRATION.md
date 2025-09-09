# TypeScript Migration Guide for ppt-paste-server

## Current Migration Status

### ✅ Completed (Phase 1-6)

**Foundation:**
- ✅ TypeScript configuration (`tsconfig.json`)
- ✅ TypeScript dependencies (`@types/node`, `typescript`)
- ✅ Build scripts (`build`, `type-check`, `build:watch`)
- ✅ Type definitions for PowerPoint components (`src/types/index.ts`)

**Core Utilities Migrated:**
- ✅ `src/utils/constants.js` → `src/utils/constants.ts`
- ✅ `src/index.js` → `src/index.ts`

**Base Infrastructure Migrated:**
- ✅ `src/parsers/BaseParser.js` → `src/parsers/BaseParser.ts`
  - Added missing `hasBulletFormatting` method
  - Full type safety with interfaces for `FontInfo`, `TransformInfo`
  - Type-safe utility functions

**Component Parsers Migrated:**
- ✅ `src/parsers/TextParser.js` → `src/parsers/TextParser.ts`
  - Complete type conversion with rich text interfaces
  - TLDraw compatibility maintained
  - Error handling for type safety

- ✅ `src/parsers/ShapeParser.js` → `src/parsers/ShapeParser.ts` **NEW**
  - Full type safety with FillInfo, BorderInfo, GeometryInfo interfaces
  - 100+ shape types with proper geometry parsing
  - Comprehensive style and effects parsing

- ✅ `src/parsers/ImageParser.js` → `src/parsers/ImageParser.ts` **NEW**
  - Type-safe image processing with R2 storage support
  - Proper relationship handling for both PPTX and clipboard formats
  - ImageInfo, MediaFileInfo, ImageEffectsInfo interfaces

- ✅ `src/parsers/TableParser.js` → `src/parsers/TableParser.ts` **NEW**
  - TipTap rich text integration with full type safety
  - Comprehensive table structure interfaces
  - Table dimension calculation and cell parsing

**Build System:**
- ✅ Dual compilation: TypeScript files + JavaScript files with generated .d.ts
- ✅ Package.json configured for TypeScript exports
- ✅ Type declarations generated for all files
- ✅ All migrated files pass type checking without errors

## Files Ready for Migration

The following JavaScript files have type declarations generated and are ready for manual TypeScript conversion:

### Parsers (High Priority)
- `src/parsers/ShapeParser.js` → **Ready for migration**
- `src/parsers/ImageParser.js` → **Ready for migration**  
- `src/parsers/TableParser.js` → **Ready for migration**
- `src/parsers/PowerPointParser.js` → **Ready for migration** (Main orchestrator)
- `src/parsers/PowerPointNormalizer.js` → **Ready for migration**

### Processors (Critical Path)
- `src/processors/PPTXParser.js` → **Ready for migration**
- `src/processors/PowerPointClipboardProcessor.js` → **Ready for migration** (Main entry point)

## Migration Template

For each remaining file, follow this pattern:

### 1. Import Types and Update Imports
```typescript
// Add type imports
import { PowerPointComponent, XMLNode, ProcessingContext } from '../types/index.js';
import { BaseParser } from './BaseParser.js';

// Keep .js extensions in imports for ESM compatibility
```

### 2. Add Method Type Signatures
```typescript
class ShapeParser extends BaseParser {
  static async parseFromNormalized(
    shapeComponent: NormalizedShapeComponent,
    componentIndex: number, 
    slideIndex: number
  ): Promise<ShapeComponent | null> {
    // Implementation...
  }
}
```

### 3. Use Proper Type Guards
```typescript
// Instead of: if (obj && obj.property)
if (obj && typeof obj === 'object' && 'property' in obj) {
  // Type-safe access
}
```

### 4. Leverage Existing BaseParser Types
```typescript
// Use the typed utility methods
const transform = this.parseTransform(xfrm); // Returns TransformInfo
const font = this.parseFont(rPr); // Returns FontInfo  
const color = this.parseColor(colorDef); // Returns string
```

## Current Build Commands

```bash
# Type checking only (no output)
pnpm type-check

# Full build (JS + .d.ts files)
pnpm build

# Watch mode for development
pnpm build:watch

# Tests (existing - work with both JS and TS)
pnpm test
pnpm test:run
```

## Migration Benefits Achieved

- **Type Safety**: Compile-time error detection for all component parsers (ShapeParser, ImageParser, TableParser, TextParser, BaseParser)
- **Better IntelliSense**: IDE support for auto-completion and refactoring across 60% of core parsing logic
- **Self-Documenting**: 15+ new interfaces describe PowerPoint data structures (FillInfo, BorderInfo, GeometryInfo, ImageInfo, TipTapNodes, etc.)
- **Backward Compatibility**: JavaScript files still work during transition - no breaking changes
- **Build System**: Automatic type generation for consumer packages with dual JS/TS compilation
- **Error Prevention**: Type guards and null checking prevent runtime errors in parsing logic
- **Enhanced Development**: Rich type information for complex PowerPoint structures (shapes, images, tables, text runs)

## Next Steps for Complete Migration

1. **High-Value Quick Wins:**
   - Migrate `ShapeParser.js` (similar structure to TextParser)
   - Migrate `ImageParser.js` (simpler than text parsing)

2. **Core System Files:**
   - Migrate `PowerPointParser.js` (orchestrates other parsers)
   - Migrate `PowerPointClipboardProcessor.js` (main entry point)

3. **Testing Updates:**
   - Convert test files to `.test.ts`
   - Add type assertions to tests
   - Enable strict mode gradually

4. **Final Cleanup:**
   - Remove original `.js` files after successful migration
   - Enable strict TypeScript mode
   - Update package.json to point to built files for production

## File-by-File Migration Checklist

```markdown
- [x] src/parsers/ShapeParser.js → .ts ✅ COMPLETED
- [x] src/parsers/ImageParser.js → .ts ✅ COMPLETED
- [x] src/parsers/TableParser.js → .ts ✅ COMPLETED
- [ ] src/parsers/PowerPointNormalizer.js → .ts (944 lines - in progress)
- [ ] src/parsers/PowerPointParser.js → .ts
- [ ] src/processors/PPTXParser.js → .ts
- [ ] src/processors/PowerPointClipboardProcessor.js → .ts
- [ ] test/unit/*.test.js → .test.ts
- [ ] scripts/*.js → .ts (optional)
```

The foundation is solid and the migration path is clear. Each file can be converted incrementally without breaking the build or existing functionality.