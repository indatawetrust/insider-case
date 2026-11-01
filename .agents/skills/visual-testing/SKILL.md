---
name: visual-testing
description: Run, debug, and update multi-viewport visual regression tests with Playwright across desktop, tablet, and mobile viewports.
---

# Visual Regression Testing Runbook

Use this skill when running visual comparison tests, diagnosing visual differences, hiding unstable UI artifacts, or updating baseline snapshots.

## Overview

Visual tests ensure UI consistency across three primary form factors:

- **Desktop**: 1600 × 900
- **Tablet**: 768 × 1024
- **Mobile**: 390 × 844

Tests are implemented in `e2e/visual/app.spec.ts` using Playwright's `toHaveScreenshot` matcher.

## Key Design Principles

1. **Deterministic Execution**:
   - `Math.random` is overridden before page load via `e2e/fixtures.ts` with an Mulberry32 seeded pseudo-random number generator (seed: `12345`).
   - Time is frozen or fast-forwarded deterministically using Playwright's Clock API (`page.clock.install()`, `page.clock.fastForward()`).

2. **Overlay & Flakiness Suppression**:
   - `e2e/visual/screenshot.css` is injected before capturing snapshots to eliminate transient elements:
     - Confetti elements (`.confetti`)
     - Vue DevTools overlays (`#__vue-devtools-container__`, `[id*='vue-devtools']`)
   - Animation easing is disabled or time is stepped to a motionless frame before taking snapshots.

3. **Platform-Specific Baselines**:
   - Baselines are committed under `e2e/visual/snapshots/*-<platform>.png` (e.g. `darwin`, `linux`) because font rasterization varies by operating system.

## Procedures

### 1. Running Visual Tests

```sh
npm run test:visual
```

### 2. Updating Snapshot Baselines

Only run this command when UI changes are intentional and visually verified:

```sh
npm run test:visual:update
```

### 3. Adding New Visual Scenarios

When adding a new viewport or visual test case:

1. Use the custom `test` fixture from `../fixtures` (not raw `@playwright/test`).
2. Set viewport dimensions:
   ```ts
   await page.setViewportSize({ width: 768, height: 1024 })
   ```
3. Load the page and freeze the clock:
   ```ts
   await page.clock.install({ time: 0 })
   await page.goto('/')
   ```
4. Perform interactions, advance time, and assert screenshots:
   ```ts
   await expect(page).toHaveScreenshot('my-screen-state.png', {
     animations: 'disabled',
     stylePath: 'e2e/visual/screenshot.css',
   })
   ```
