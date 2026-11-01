export const HORSE_COUNT = 20
export const HORSES_PER_LAP = 10
export const LAP_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200] as const

export const CONDITION_MIN = 1
export const CONDITION_MAX = 100

/** Base speed range in m/s. Condition decides where a horse sits inside it. */
export const SPEED_MIN = 15
export const SPEED_MAX = 18
/** Day-to-day form: each lap a horse runs up to this much faster or slower than its base speed. */
export const FORM_VARIANCE = 0.08

/** Simulated seconds that pass per real second, so a 1200m lap takes ~6s on screen. */
export const PLAYBACK_RATE = 12

/** Countdown before each lap starts. */
export const COUNTDOWN_MS = 1500
/** Pause after the last horse finishes, before the next lap begins. */
export const LAP_GAP_MS = 1500
/** Caps a single frame so a backgrounded tab does not teleport horses when it comes back. */
export const MAX_FRAME_MS = 100
