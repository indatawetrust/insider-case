import {
  CONDITION_MAX,
  CONDITION_MIN,
  FORM_VARIANCE,
  PLAYBACK_RATE,
  SPEED_MAX,
  SPEED_MIN,
} from '@/constants/game'
import type { Horse } from '@/types/horse'
import type { Placement, Runner } from '@/types/race'
import type { RandomFn } from './random'

/** Speed in m/s. `form` is a multiplier around 1 for how the horse feels on the day. */
export function horseSpeed(condition: number, form = 1): number {
  const ratio = (condition - CONDITION_MIN) / (CONDITION_MAX - CONDITION_MIN)
  return (SPEED_MIN + ratio * (SPEED_MAX - SPEED_MIN)) * form
}

export function planRunners(
  horses: readonly Horse[],
  distance: number,
  random: RandomFn = Math.random,
): Runner[] {
  return horses.map((horse) => {
    const form = 1 + (random() * 2 - 1) * FORM_VARIANCE
    const raceTimeMs = (distance / horseSpeed(horse.condition, form)) * 1000
    return {
      horseId: horse.id,
      raceTimeMs,
      durationMs: raceTimeMs / PLAYBACK_RATE,
      surge: { amplitude: 0.1 + random() * 0.2, phase: random() * Math.PI * 2 },
    }
  })
}

/**
 * Share of the distance covered (0–1) after `elapsedMs`.
 *
 * A sine wave is added on top of linear progress so each horse speeds up and slows down
 * at different moments. The wave is shifted to be 0 at both ends, so the horse still
 * starts at 0 and finishes exactly at `durationMs`. Its slope is 1 + amplitude·cos(…),
 * which stays positive while amplitude < 1, so horses never run backwards.
 */
export function progressAt(runner: Runner, elapsedMs: number): number {
  const t = Math.min(Math.max(elapsedMs / runner.durationMs, 0), 1)
  const { amplitude, phase } = runner.surge
  const wave = (Math.sin(2 * Math.PI * t + phase) - Math.sin(phase)) / (2 * Math.PI)
  return t + amplitude * wave
}

/** Real time until the last horse crosses the line. */
export function lapDuration(runners: readonly Runner[]): number {
  return runners.reduce((longest, runner) => Math.max(longest, runner.durationMs), 0)
}

/** Fastest first. */
export function rankRunners(runners: readonly Runner[]): Placement[] {
  return [...runners]
    .sort((a, b) => a.raceTimeMs - b.raceTimeMs)
    .map((runner, index) => ({
      position: index + 1,
      horseId: runner.horseId,
      raceTimeMs: runner.raceTimeMs,
    }))
}
