# TypeScript Improvements — Current Status & Remaining Plan

Date: 2025-09-04

This document captures the current state of a conservative TypeScript strict-migration for the `packages/ppt-paste-server` package, the edits made so far, common error roots observed when running the strict check, and a focused, low-risk plan to complete the migration.

---

## Goal

Make `packages/ppt-paste-server` compile under a conservative strict TypeScript configuration (targeted flags enabled) and then iteratively tighten rules until `strict: true` can be turned on safely. The migration should be incremental and low-risk: add small helper utilities and per-file fixes rather than wide sweeping type changes.

---

## What I added/changed so far

- Added a conservative strict config (dev-only):
  - `packages/ppt-paste-server/tsconfig.strict.json` — a config that enables `noImplicitAny`, `strictNullChecks`, `noImplicitThis`, `strictBindCallApply`, and limits `include` to `src/**` so we can iterate safely.

- Central types: edited `packages/ppt-paste-server/src/types/index.ts` to introduce more specific component discriminated unions (Text/Shape/Image/Table/Video/Unknown) while keeping `XMLNode` permissive for now.

- Parser experiments and recent progress:
  - `packages/ppt-paste-server/src/parsers/BaseParser.ts` — added typed helper getters and coercion helpers (examples: `getNode`, `getString`, `getNumber`, `getBoolean`) and more recently `getArray(obj, path, fallback)` to normalize single-object vs array node shapes.
  - `packages/ppt-paste-server/src/parsers/TextParser.ts` — partial changes to coerce/guard extracted text values, to flatten the rich-text structure into a `TextRun[]` shape, and to import the `TextRun` type from central types.
  - `packages/ppt-paste-server/src/parsers/VideoParser.ts` — refactored to use the typed helpers (`getNode` / `getString` etc.) instead of many nested `safeGet`/`asString` chains. This reduces type-uncertainty and prepares the file for stricter checks.

- Ran the strict type-check and tests to validate the change surface:
  - Strict-check command used: `pnpm exec tsc -p packages/ppt-paste-server/tsconfig.strict.json --noEmit` — current edits pass the conservative strict configuration for the package.
  - Tests: `pnpm --filter ppt-paste-server test` — server package tests pass locally (existing test suite: 3 files, 27 tests; all passing in the dev run).

---

## Observed error patterns (root causes)

When running the strict-check the following patterns produced the majority of TypeScript errors:

- Calling string methods (e.g., `.trim()`) on values TypeScript cannot prove are strings.
- Treating XML parsed nodes (which are loose `any`/`Record<string, any>`) as concrete objects and accessing properties like `$val`, `$x`, `$y`, `$cx`, `$cy` without narrowing.
- Using `safeGet`-style helpers that return `any` and then proceeding without explicit narrowing.
- Assigning objects or arrays to fields typed as `string` or vice versa (shape mismatches between central types and parser assumptions).

These issues are fixable with small localized changes: either add a narrow type-guard before the operation or coerce to the desired primitive with a fallback. The recently added typed getters (`getNode` / `getString` / `getNumber` / `getBoolean` / `getArray`) address these patterns directly by providing a clear, small-scope narrowing/coercion surface for parser code.

---

## Migration approach (conservative, per-file)

1. Add a small set of typed helper utilities in `BaseParser` (already started):
   - `isString(v): v is string`
   - `isXMLNode(v): v is XMLNode`
   - `asNumber(v, fallback?)` — safe numeric coercion
   - `asString(v, fallback?)` — safe string coercion
   - `getNode` / `getString` / `getNumber` / `getBoolean` / `getArray` — typed accessors that use `safeGet` internally but return narrowed/coerced types.

2. Stabilize `TextParser` completely using those helpers:
   - Narrow calls that use `.trim()`, ensure text runs are a typed `TextRun[]` in the return type.
   - This remains a high-value first target because it affects many downstream flows and tests.

3. Fix other parsers in priority order and iteratively re-run the strict-check:
   - `ImageParser` (cropping, relationships, data URLs) — recommended next work item.
   - `ShapeParser` (geometry, `prstGeom`/`custGeom` fields)
   - `TableParser` (rows/cells and `a:txBody` differences)
   - `VideoParser` (completed initial refactor; follow-ups possible)
   - `PowerPointParser` / `PowerPointNormalizer` (update return types to Normalized shapes)

4. After each parser fix, re-run `tsc -p tsconfig.strict.json --noEmit` and fix the next group of errors. Prefer many small commits.

5. When the package compiles under the conservative strict config, enable additional flags or flip `strict: true` and repeat the iterative fix cycle until green.

6. Add a CI job that runs the strict-check so regressions are caught early.

---

## Quick actionable next steps (recommendation)

1. Proceed with `ImageParser` edits using the same pattern (small typed getters and `getArray` for relationship lists). I will start this next unless you tell me otherwise.
2. After the `ImageParser` changes run `pnpm exec tsc -p packages/ppt-paste-server/tsconfig.strict.json --noEmit` and `pnpm --filter ppt-paste-server test` and address any failures.
3. Continue parser-by-parser until the strict config is clean for the whole package.

I can start `ImageParser` now and report back with the `tsc` output and test results after that change.

---

## Files touched and focus areas

- Added:
  - `packages/ppt-paste-server/tsconfig.strict.json`

- Edited:
  - `packages/ppt-paste-server/src/types/index.ts` (discriminated union shapes)
  - `packages/ppt-paste-server/src/parsers/BaseParser.ts` (added typed getters: `getNode`, `getString`, `getNumber`, `getBoolean`, `getArray`, plus `asString`/`asNumber` helpers)
  - `packages/ppt-paste-server/src/parsers/TextParser.ts` (partial safe coercions)
  - `packages/ppt-paste-server/src/parsers/VideoParser.ts` (refactored to use typed getters)

- Primary next-target files (priority order):
  - `packages/ppt-paste-server/src/parsers/ImageParser.ts` (next)
  - `packages/ppt-paste-server/src/parsers/ShapeParser.ts`
  - `packages/ppt-paste-server/src/parsers/TableParser.ts`
  - `packages/ppt-paste-server/src/parsers/PowerPointParser.ts`

---

## Estimates & recommendations

- BaseParser helpers + finishing TextParser: a few focused hours (already started).
- Fixing the remaining parsers to a stable state: multiple focused sessions (rough estimate 1–2 days of work to make major progress).
- Use small targeted PRs per parser so reviewers can validate behavior against existing fixtures.
- Keep `XMLNode` permissive initially (e.g. `Record<string, any>`) and refine shapes for nodes that are stable.

---

## Commands to run locally

- Strict type-check:

```
pnpm exec tsc -p packages/ppt-paste-server/tsconfig.strict.json --noEmit
```

- To run unit/integration tests for server package (if present):

```
pnpm --filter ppt-paste-server test
```

(Replace the above with your repository's test script if different.)

---

## Next action (if you want me to proceed)

I will start on `ImageParser` now (unless you prefer a different parser). For each file I change I will:

- Apply small, focused edits to prefer typed getters (`getNode`/`getString`/`getNumber`/`getBoolean`/`getArray`) over raw `safeGet`.
- Run: `pnpm exec tsc -p packages/ppt-paste-server/tsconfig.strict.json --noEmit`
- Run: `pnpm --filter ppt-paste-server test`
- Report back with the `tsc` output and any test failures and recommended fixes.

Confirm and I will start on `ImageParser` immediately.

---

End of file.
