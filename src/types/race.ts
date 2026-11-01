import type { Horse } from './horse'

export enum RaceStatus {
  Idle = 'idle',
  Ready = 'ready',
  Running = 'running',
  Paused = 'paused',
  Finished = 'finished',
}

export type LapDistance = 1200 | 1400 | 1600 | 1800 | 2000 | 2200

export type PodiumPlace = 1 | 2 | 3

/** How a single horse runs one lap. Decided up front, so a lap replays the same way every frame. */
export interface Runner {
  horseId: number
  /** Simulated race time, shown in the results. */
  raceTimeMs: number
  /** Real time the horse needs on screen to reach the finish line. */
  durationMs: number
  /** Shapes the mid-race pace so horses overtake each other instead of moving in lockstep. */
  surge: { amplitude: number; phase: number }
}

export interface Lap {
  /** 1-based lap number. */
  number: number
  distance: number
  /** In gate order: runners[0] starts in lane 1. */
  runners: Runner[]
}

export interface Placement {
  position: number
  horseId: number
  raceTimeMs: number
}

export interface LapResult {
  lapNumber: number
  distance: number
  placements: Placement[]
}

export interface LaneState {
  lane: number
  horse: Horse
  /** 0–1 share of the distance covered. */
  progress: number
  /** Finishing position once the horse has crossed the line, otherwise null. */
  position: number | null
}

export interface PersistedRaceState {
  laps: Lap[]
  results: LapResult[]
  status: RaceStatus
  lapIndex: number
  programId: number
  elapsedMs: number
}
