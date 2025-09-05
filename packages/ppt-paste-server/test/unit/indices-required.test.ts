import { describe, it, expect, beforeAll } from 'vitest'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { PowerPointClipboardProcessor } from '../../src/processors/PowerPointClipboardProcessor.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const FIXTURES_DIR = path.join(__dirname, '..', 'test-harness', 'fixtures')
const TEST_CASES_FILE = path.join(__dirname, '..', 'test-harness', 'test-cases.json')

describe('Component invariants: slideIndex & zIndex', () => {
  let processor: PowerPointClipboardProcessor
  let testCases: any[] = []

  beforeAll(async () => {
    processor = new PowerPointClipboardProcessor()
    try {
      const testCasesContent = await fs.readFile(TEST_CASES_FILE, 'utf8')
      testCases = JSON.parse(testCasesContent).testCases
    } catch (e) {
      // ignore if not present
    }
  })

  it('ensures every parsed component has numeric slideIndex and zIndex', async () => {
    if (!testCases || testCases.length === 0) return
    // Limit runtime by sampling up to first 5 cases
    const sample = testCases.slice(0, 5)

    for (const testCase of sample) {
      const fixturePath = path.join(FIXTURES_DIR, testCase.fixtureFile)
      const buffer = await fs.readFile(fixturePath)
      const result = await processor.parseClipboardBuffer(buffer)
      expect(result.slides).toBeDefined()
      for (const slide of result.slides) {
        expect(typeof slide.slideIndex).toBe('number')
        for (const comp of slide.components) {
          expect(typeof comp.slideIndex).toBe('number')
          expect(Number.isFinite(comp.slideIndex)).toBe(true)
          expect(typeof comp.zIndex).toBe('number')
          expect(Number.isFinite(comp.zIndex)).toBe(true)
        }
      }
    }
  })
})
