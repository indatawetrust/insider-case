import { expect, openApp, test, ui } from '../fixtures'

// Baselines are per platform (see snapshotPathTemplate). Update them with `npm run test:visual:update`.
test.describe('visual - desktop', () => {
  test.beforeEach(async ({ page }) => {
    await openApp(page)
    // Let the entrance animations settle before taking the first picture.
    await page.clock.runFor(2_000)
  })

  test('initial screen', async ({ page }) => {
    await expect(page).toHaveScreenshot('initial.png')
  })

  test('program generated', async ({ page }) => {
    await ui(page).generate.click()
    await page.clock.runFor(2_000)
    await expect(page).toHaveScreenshot('program.png')
  })

  test('mid-race, paused', async ({ page }) => {
    const { generate, toggle } = ui(page)
    await generate.click()
    await toggle.click()
    await page.clock.runFor(5_000)
    await toggle.click()
    await expect(page).toHaveScreenshot('mid-race.png')
  })

  test('all laps finished', async ({ page }) => {
    test.slow()
    const { generate, toggle, resultLaps } = ui(page)
    await generate.click()
    await toggle.click()
    await page.clock.runFor(120_000)
    await expect(resultLaps).toHaveCount(6)
    await expect(page).toHaveScreenshot('finished.png')
  })
})

test.describe('visual - mobile', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await page.clock.runFor(2_000)
  })

  test('mobile initial screen', async ({ page }) => {
    await expect(page).toHaveScreenshot('mobile-initial.png')
  })

  test('mobile program generated', async ({ page }) => {
    await ui(page).generate.click()
    await page.clock.runFor(2_000)
    await expect(page).toHaveScreenshot('mobile-program.png')
  })

  test('mobile mid-race, paused', async ({ page }) => {
    const { generate, toggle } = ui(page)
    await generate.click()
    await toggle.click()
    await page.clock.runFor(5_000)
    await toggle.click()
    await expect(page).toHaveScreenshot('mobile-mid-race.png')
  })
})

test.describe('visual - tablet', () => {
  test.use({ viewport: { width: 768, height: 1024 } })

  test.beforeEach(async ({ page }) => {
    await openApp(page)
    await page.clock.runFor(2_000)
  })

  test('tablet initial screen', async ({ page }) => {
    await expect(page).toHaveScreenshot('tablet-initial.png')
  })

  test('tablet program generated', async ({ page }) => {
    await ui(page).generate.click()
    await page.clock.runFor(2_000)
    await expect(page).toHaveScreenshot('tablet-program.png')
  })
})
