import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const CI = !!process.env.CI
const port = CI ? 4173 : 5173

// See https://playwright.dev/docs/test-configuration
export default defineConfig({
  testDir: './e2e',
  timeout: 60 * 1000,
  expect: {
    timeout: 5000,
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
      // Hides the never-ending confetti and the dev-only devtools button.
      stylePath: './e2e/visual/screenshot.css',
    },
  },
  snapshotPathTemplate: '{testDir}/visual/snapshots/{arg}-{platform}{ext}',
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'], testIgnore: /visual\// },
    { name: 'firefox', use: devices['Desktop Firefox'], testIgnore: /visual\// },
    { name: 'webkit', use: devices['Desktop Safari'], testIgnore: /visual\// },
    {
      name: 'visual',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1600, height: 900 } },
      testMatch: /visual\/.*\.spec\.ts/,
    },
  ],

  // Dev server locally for a fast loop; the production build on CI.
  webServer: {
    command: CI ? 'npm run preview' : 'npm run dev',
    port,
    reuseExistingServer: !CI,
  },
})
