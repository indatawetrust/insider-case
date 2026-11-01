import { expect, openApp, test, ui } from './fixtures'

const DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200]

test.beforeEach(async ({ page }) => {
  await openApp(page)
})

test('lists 20 horses with condition and color', async ({ page }) => {
  const { horseRows } = ui(page)
  await expect(horseRows).toHaveCount(20)
  await expect(horseRows.first().locator('td')).toHaveCount(4)
})

test('generates a 6-lap program with 10 horses per lap', async ({ page }) => {
  const { generate, programLaps, toggle, lanes } = ui(page)
  await expect(toggle).toBeDisabled()

  await generate.click()

  await expect(programLaps).toHaveCount(6)
  for (const [index, distance] of DISTANCES.entries()) {
    const lap = programLaps.nth(index)
    await expect(lap.locator('header')).toContainText(`${distance}m`)
    await expect(lap.locator('tbody tr')).toHaveCount(10)
  }
  await expect(lanes).toHaveCount(10)
  await expect(toggle).toBeEnabled()
})

test('runs the laps one at a time and posts each result when it ends', async ({ page }) => {
  // Fast-forwarding a whole race renders thousands of frames; some browsers need longer.
  test.slow()
  const { generate, toggle, resultLaps } = ui(page)
  await generate.click()
  await toggle.click()

  await expect(page.getByRole('banner')).toContainText('Lap 1 of 6 · 1200m')
  await expect(resultLaps).toHaveCount(0)

  // Lap 1 lasts well under 15s on screen; the countdown adds 1.5s.
  await page.clock.runFor(15_000)
  await expect(resultLaps).toHaveCount(1)
  await expect(resultLaps.first().locator('tbody tr')).toHaveCount(10)
  await expect(page.getByRole('banner')).toContainText('Lap 2 of 6 · 1400m')

  await page.clock.runFor(120_000)
  await expect(resultLaps).toHaveCount(6)
  await expect(page.getByRole('banner')).toContainText('All laps complete')
  await expect(toggle).toBeDisabled()
  await expect(generate).toBeEnabled()
})

test('pause freezes the horses and resume carries on', async ({ page }) => {
  const { generate, toggle, runners } = ui(page)
  await generate.click()
  await toggle.click()
  await page.clock.runFor(3_000)

  await toggle.click()
  await expect(toggle).toHaveText('Resume')
  await expect(generate).toBeEnabled()

  const frozen = await runners.evaluateAll((els) => els.map((el) => el.dataset.progress))
  await page.clock.runFor(3_000)
  expect(await runners.evaluateAll((els) => els.map((el) => el.dataset.progress))).toEqual(frozen)

  await toggle.click()
  await expect(toggle).toHaveText('Pause')
  await expect(generate).toBeDisabled()
  await page.clock.runFor(1_000)
  expect(await runners.evaluateAll((els) => els.map((el) => el.dataset.progress))).not.toEqual(
    frozen,
  )
})

test('generating again while paused starts a fresh program', async ({ page }) => {
  const { generate, toggle, resultLaps } = ui(page)
  await generate.click()
  await toggle.click()
  await page.clock.runFor(15_000)
  await expect(resultLaps).toHaveCount(1)

  await toggle.click()
  await generate.click()

  await expect(resultLaps).toHaveCount(0)
  await expect(toggle).toHaveText('Start')
  await expect(page.getByRole('banner')).toContainText('Program ready')
})

test('persists stable, program and lap results across page reload', async ({ page }) => {
  const { generate, toggle, programLaps, resultLaps, horseRows } = ui(page)
  await expect(horseRows).toHaveCount(20)
  const initialHorseNames = await horseRows.locator('td:first-child').allTextContents()

  await generate.click()
  await toggle.click()
  await page.clock.runFor(15_000)
  await expect(resultLaps).toHaveCount(1)

  // Reload the page
  await page.reload()
  await page.evaluate(() => document.fonts.ready)

  // Verify stable is identical
  await expect(horseRows.locator('td:first-child')).toHaveText(initialHorseNames)

  // Verify program and results are kept, and race is paused
  await expect(programLaps).toHaveCount(6)
  await expect(resultLaps).toHaveCount(1)
  await expect(toggle).toHaveText('Resume')
})

test('toggles dark mode theme and persists preference', async ({ page }) => {
  const themeToggle = page.getByTestId('theme-toggle')
  await expect(page.locator('html')).not.toHaveClass(/dark/)

  await themeToggle.click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')

  await page.reload()
  await expect(page.locator('html')).toHaveClass(/dark/)

  await themeToggle.click()
  await expect(page.locator('html')).not.toHaveClass(/dark/)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
})

test('toggles sound mute and persists preference', async ({ page }) => {
  const audioToggle = page.getByTestId('audio-toggle')
  await expect(audioToggle).toHaveAttribute('aria-label', 'Mute sounds')

  await audioToggle.click()
  await expect(audioToggle).toHaveAttribute('aria-label', 'Unmute sounds')

  await page.reload()
  await expect(audioToggle).toHaveAttribute('aria-label', 'Unmute sounds')
})
