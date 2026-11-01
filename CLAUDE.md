# Horse Racing — Project Guidelines & Runbook

Interactive horse racing simulator built with Vue 3.5, TypeScript, Pinia, Vite, Vitest, and Playwright.

## Prerequisites & Environment

- **Node.js**: Requires Node 24 (see `.nvmrc`).
- **NVM / PATH**: Use Node 24 runtime (`export PATH="$HOME/.nvm/versions/node/v24.19.0/bin:$PATH"` if running commands in subshells).

## Common Commands

### Development & Build

- `npm run dev`: Launch Vite dev server with hot reload (`http://localhost:5173`).
- `npm run build`: Type-check (`vue-tsc --build`) and build for production into `dist/`.
- `npm run preview`: Serve production build locally on `http://localhost:4173`.

### Testing

- `npm test`: Run Vitest unit & component test suite once.
- `npm run test:unit`: Vitest in interactive watch mode.
- `npm run test:coverage`: Run unit tests with V8 coverage report.
- `npm run test:e2e`: Run Playwright E2E tests against production preview across Chromium, Firefox, and WebKit.
- `npm run test:visual`: Run multi-viewport visual regression tests (Desktop 1600x900, Tablet 768x1024, Mobile 390x844).
- `npm run test:visual:update`: Re-create baseline visual snapshots.
- `npx playwright install`: Install browser binaries (run once if missing).

### Linting & Formatting

- `npm run lint`: Run oxlint and ESLint with auto-fix.
- `npm run lint:check`: Run oxlint and ESLint in read-only verification mode.
- `npm run format`: Format code using Prettier.
- `npm run format:check`: Check code formatting with Prettier.

## Architecture & Code Organization

The application enforces a strictly downward dependency flow:
**Components → Stores → Utils → Types / Constants**

- `src/types/`: Centralized domain models and interfaces (`Horse`, `Lap`, `Runner`, `LapResult`, `RaceStatus` enum, `HorseIconProps`). Barrel-exported via `src/types/index.ts`.
- `src/constants/`: Game rules and tuning values (`LAP_DISTANCES`, speed limits, timings).
- `src/utils/`: Pure functions with zero Vue/DOM dependencies (`horses.ts`, `schedule.ts`, `race.ts`, `random.ts`, `format.ts`). Functions accept random/clock providers as parameters for deterministic testing.
- `src/stores/`: Pinia setup-style stores (`useHorsesStore`, `useRaceStore`). Pure state management; stores contain no DOM elements, window references, or timers.
- `src/composables/`: Bridge layer (`useRaceLoop` binds `requestAnimationFrame` to `race.tick(delta)`).
- `src/components/`: Vue components rendering store state and forwarding user events.
  - `RaceTrack.vue` uses CSS Container Queries (`container-type: inline-size` & `cqw` units) for fluid horse movement across lane widths.
  - `BasePanel.vue` provides panel shells with header/body slots.
  - `HorseIcon.vue` renders an animated SVG horse respecting `prefers-reduced-motion`.

## Coding & Styling Conventions

- **Vue 3**: Composition API with `<script setup lang="ts">`.
- **CSS**: Scoped `<style scoped>`, CSS Custom Properties (`--coat`, `--p`, `--i`), CSS Grid, and Flexbox.
- **Accessibility**: All animations must respect `@media (prefers-reduced-motion: reduce)`.
- **Enums**: Always use `RaceStatus` enum (`RaceStatus.Idle`, `RaceStatus.Ready`, `RaceStatus.Running`, `RaceStatus.Paused`, `RaceStatus.Finished`) instead of magic string literals.
- **Git Commits**: Conventional Commits style (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`). Author commits as `indatawetrust <iamaroott@gmail.com>`.

## Pre-Flight Verification Checklist

Before committing or pushing changes:

1. `npm run format:check` — Verify clean Prettier formatting.
2. `npm run lint:check` — Ensure oxlint & ESLint pass with 0 errors/warnings.
3. `npm run build` — Verify TypeScript type checks and clean production build.
4. `npm run test:coverage` — Verify all unit and store tests pass with complete coverage.
