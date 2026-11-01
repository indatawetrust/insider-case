import { test as base, expect, type Page } from '@playwright/test'

/**
 * Every test gets a page whose Math.random is seeded, so horses, programs and results are
 * the same on every run. The app itself has no test-only code paths.
 */
export const test = base.extend<{ seed: number }>({
  seed: [20251030, { option: true }],
  page: async ({ page, seed }, use) => {
    await page.addInitScript((initialSeed) => {
      let state = initialSeed >>> 0
      Math.random = () => {
        state = (state + 0x6d2b79f5) >>> 0
        let t = state
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
      }
    }, seed)
    await use(page)
  },
})

export { expect }

/** Opens the app with a controllable clock, so a whole race can be fast-forwarded. */
export async function openApp(page: Page) {
  await page.clock.install()
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
}

export function ui(page: Page) {
  return {
    generate: page.getByRole('button', { name: 'Generate Program' }),
    toggle: page.locator('header button.toggle'),
    horseRows: page.getByTestId('horse-list').locator('tbody tr'),
    programLaps: page.getByTestId('program').locator('article'),
    resultLaps: page.getByTestId('results').locator('article'),
    lanes: page.getByTestId('track').locator('.lane'),
    runners: page.getByTestId('track').locator('.runner'),
  }
}
