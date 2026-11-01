---
name: project-verification
description: Execute the full project pre-flight verification gate including linting, type-checking, unit test coverage, and cross-browser E2E suites.
---

# Project Pre-Flight Verification Runbook

Use this skill before committing code, opening pull requests, or verifying changes to ensure no regressions exist across styling, types, logic, or end-to-end user flows.

## Environment Check

Ensure Node 24 is active:

```sh
node --version # Must be >= 24.0.0
```

If using nvm:

```sh
export PATH="$HOME/.nvm/versions/node/v24.19.0/bin:$PATH"
```

## Step-by-Step Verification Gate

Execute these commands in order:

### 1. Code Formatting

Check code formatting across the repository with Prettier:

```sh
npm run format:check
```

If formatting errors are found, fix them automatically:

```sh
npm run format
```

### 2. Linting (oxlint + ESLint)

Run the fast oxlint pass followed by ESLint:

```sh
npm run lint:check
```

To auto-fix minor lint issues:

```sh
npm run lint
```

### 3. Type Checking & Production Build

Run `vue-tsc` across Vue SFCs and TypeScript modules, followed by Vite production bundle generation:

```sh
npm run build
```

Verify `dist/` is produced with zero TypeScript compilation warnings or errors.

### 4. Unit & Store Tests with Coverage

Run Vitest with the V8 coverage provider:

```sh
npm run test:coverage
```

Verify:

- 100% test files pass.
- Domain math and state machines maintain high statement/branch coverage.

### 5. Cross-Browser E2E Tests

Run Playwright end-to-end tests against the production build preview:

```sh
npm run test:e2e
```

This executes the full user journey across **Chromium**, **Firefox**, and **WebKit**.

## Commit Standards

When all gates pass, stage files and commit with conventional commits:

```sh
git add <files>
git commit -m "<type>(<scope>): <concise description>" --author="indatawetrust <iamaroott@gmail.com>"
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`.
