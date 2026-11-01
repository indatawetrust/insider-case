import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { COUNTDOWN_MS, LAP_GAP_MS } from '@/constants/game'
import { RaceStatus } from '@/types'
import { lapDuration } from '@/utils/race'
import { createRandom } from '@/utils/random'
import { useRaceStore } from '../race'

/** Advances the clock in frame-sized steps, like the real loop does. */
function advance(store: ReturnType<typeof useRaceStore>, ms: number, frame = 16) {
  for (let left = ms; left > 0; left -= frame) store.tick(Math.min(frame, left))
}

function currentLapLength(store: ReturnType<typeof useRaceStore>) {
  return lapDuration(store.currentLap!.runners)
}

describe('race store', () => {
  let store: ReturnType<typeof useRaceStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useRaceStore()
  })

  it('starts idle with nothing to start', () => {
    expect(store.status).toBe(RaceStatus.Idle)
    expect(store.canToggle).toBe(false)
    store.start()
    expect(store.status).toBe(RaceStatus.Idle)
  })

  it('generates a 6-lap program and becomes ready', () => {
    store.generateProgram(createRandom(1))
    expect(store.status).toBe(RaceStatus.Ready)
    expect(store.laps).toHaveLength(6)
    expect(store.currentLap?.number).toBe(1)
    expect(store.lanes).toHaveLength(10)
  })

  it('counts down before the gates open', () => {
    store.generateProgram(createRandom(1))
    store.start()
    expect(store.countdown).toBe(3)
    advance(store, COUNTDOWN_MS / 2)
    expect(store.countdown).toBe(2)
    expect(store.lanes.every((lane) => lane.progress === 0)).toBe(true)
    advance(store, COUNTDOWN_MS / 2)
    expect(store.countdown).toBe(0)
  })

  it('records the result when the last horse finishes, then moves to the next lap', () => {
    store.generateProgram(createRandom(1))
    store.start()
    advance(store, COUNTDOWN_MS + currentLapLength(store) + 1)

    expect(store.results).toHaveLength(1)
    expect(store.results[0]!.placements).toHaveLength(10)
    expect(store.lanes.every((lane) => lane.position !== null)).toBe(true)
    expect(store.currentLap?.number).toBe(1)

    advance(store, LAP_GAP_MS)
    expect(store.currentLap?.number).toBe(2)
    expect(store.countdown).toBe(3)
  })

  it('does not move while paused', () => {
    store.generateProgram(createRandom(1))
    store.start()
    advance(store, COUNTDOWN_MS + 1000)
    store.pause()

    const before = store.lanes.map((lane) => lane.progress)
    advance(store, 5000)
    expect(store.status).toBe(RaceStatus.Paused)
    expect(store.lanes.map((lane) => lane.progress)).toEqual(before)

    store.toggle()
    expect(store.status).toBe(RaceStatus.Running)
  })

  it('finishes after all 6 laps with one result per lap', () => {
    store.generateProgram(createRandom(1))
    store.start()
    while (store.status === RaceStatus.Running) advance(store, 1000, 50)

    expect(store.status).toBe(RaceStatus.Finished)
    expect(store.results.map((r) => r.distance)).toEqual([1200, 1400, 1600, 1800, 2000, 2200])
    expect(store.canToggle).toBe(false)
  })

  it('cannot regenerate the program mid-race, but can while paused', () => {
    store.generateProgram(createRandom(1))
    const firstProgram = store.laps
    store.start()

    store.generateProgram(createRandom(2))
    expect(store.laps).toBe(firstProgram)

    store.pause()
    store.generateProgram(createRandom(2))
    expect(store.laps).not.toBe(firstProgram)
    expect(store.status).toBe(RaceStatus.Ready)
    expect(store.results).toEqual([])
  })
})
