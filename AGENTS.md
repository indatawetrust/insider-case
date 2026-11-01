# Agent Instructions & Context

This file serves as the unified entry point for AI programming assistants (Antigravity, Claude Code, Cursor, Copilot, and other agentic systems) working within this repository.

## Repository Overview

- **Name**: `insider-case` (Horse Racing Simulator)
- **Tech Stack**: Vue 3.5 (Composition API, `<script setup>`), TypeScript, Pinia, Vite, Vitest, Playwright.
- **Node Version**: Node 24 (`.nvmrc`).
- **Git Author**: `indatawetrust <iamaroott@gmail.com>`

## Quick Reference

For commands, architectural contracts, and coding rules, refer to:

- [CLAUDE.md](file:///Users/ahmet/projects/insider-case/CLAUDE.md): Master runbook and project guidelines.
- [README.md](file:///Users/ahmet/projects/insider-case/README.md): Project overview, game rules, architecture, and browser support.

## Available Agent Skills

Specialized procedural skills are located in `.agents/skills/`:

- [visual-testing](file:///Users/ahmet/projects/insider-case/.agents/skills/visual-testing/SKILL.md): Running and updating multi-viewport visual regression tests, time manipulation, and snapshot handling.
- [race-simulation](file:///Users/ahmet/projects/insider-case/.agents/skills/race-simulation/SKILL.md): Mathematics, pacing curves, condition-to-speed formulas, and animation synchronization.
- [project-verification](file:///Users/ahmet/projects/insider-case/.agents/skills/project-verification/SKILL.md): Step-by-step quality gate runbook (formatting, linting, type-checking, unit coverage, and E2E validation).
