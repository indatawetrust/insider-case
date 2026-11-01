---
name: race-simulation
description: Understand, calibrate, and verify the horse race physics engine, speed formulas, form variations, and animation pacing.
---

# Race Simulation & Physics Engine Runbook

Use this skill when modifying, inspecting, or tuning race math, horse speeds, pacing variations, lap durations, or race results logic.

## Architecture

The race engine logic lives in pure, framework-agnostic utility files:

- `src/constants/game.ts`: Distances, base speeds, timings, and playback multipliers.
- `src/utils/race.ts`: Speed formulas, progress curves, duration calculations, and ranking algorithms.
- `src/stores/race.ts`: State machine, clock management, and result recording.

## Core Mathematical Rules

### 1. Base Speed

Horse condition score is between `1` and `100`.
Condition maps linearly to a base speed between `MIN_SPEED_MPS` (15.0 m/s) and `MAX_SPEED_MPS` (18.0 m/s):
$$\text{baseSpeed} = \text{MIN\_SPEED} + \frac{\text{condition} - 1}{99} \times (\text{MAX\_SPEED} - \text{MIN\_SPEED})$$

### 2. Daily Form & Actual Speed

Every lap, each participating horse rolls an independent random **form variation** of up to $\pm 8\%$ (`FORM_SPREAD = 0.08`):
$$\text{formMultiplier} = 1 + (2 \times \text{random}() - 1) \times \text{FORM\_SPREAD}$$
$$\text{actualSpeed} = \text{baseSpeed} \times \text{formMultiplier}$$

### 3. Race Duration

Race time in seconds is:
$$\text{durationSeconds} = \frac{\text{distanceMeters}}{\text{actualSpeed}}$$
Playback is scaled by `PLAYBACK_SPEED_FACTOR` (12×), meaning a 1200m race takes ~5.5 to 6.6 seconds on screen.

### 4. Pacing Variation & Overtaking

During the race, each horse follows its own sinusoidal pace variation curve:

- Horses surge and fall behind mid-race to create exciting visual overtakes.
- Boundary condition: $f(0) = 0$ and $f(1) = 1$. Each horse crosses the finish line precisely at its calculated `raceTimeMs`.
- This ensures visual animations on track and the tabular race results stay 100% mathematically synchronized.

## Testing Invariants

When modifying race math, always verify these invariants in `src/utils/__tests__/race.spec.ts`:

1. **Monotonicity**: Progress values must start at 0 and finish at 1.
2. **Order Consistency**: A faster `raceTimeMs` must always place ahead of a slower `raceTimeMs`.
3. **Determinism**: Given the same PRNG seed, race schedules and results must be perfectly reproducible.
